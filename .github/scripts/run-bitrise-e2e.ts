import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';
import axios from 'axios';

const E2E_TRIGGERED_LABEL = 'Run E2E';
const E2E_PIPELINE = 'pr_smoke_e2e_pipeline';

main().catch((error: Error): void => {
  console.error(error);
  process.exit(1);
});

async function main(): Promise<void> {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    core.setFailed('GITHUB_TOKEN not found.');
    process.exit(1);
  }

  const octokit: InstanceType<typeof GitHub> = getOctokit(githubToken);

  const { pull_request, label } = context.payload;

  if (!label || !pull_request) {
    core.setFailed(
      'label or pull_request property from context.payload not found.',
    );
    process.exit(1);
  }

  if (label.name === E2E_TRIGGERED_LABEL) {
    // PR includes Run E2E label. Kick off E2E build on Bitrise.
    const data = {
      hook_info: {
        type: 'bitrise',
        build_trigger_token: process.env.BITRISE_BUILD_TRIGGER_TOKEN,
      },
      build_params: {
        branch: process.env.GITHUB_HEAD_REF,
        pipeline_id: E2E_PIPELINE,
      },
      triggered_by: 'run-bitrise-e2e',
    };

    const bitriseProjectUrl = `https://app.bitrise.io/app/${process.env.BITRISE_APP_ID}`;

    // Start Bitrise build.
    const bitriseBuildResponse = await axios.post(
      `${bitriseProjectUrl}/build/start.json`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!bitriseBuildResponse.data.build_slug) {
      core.setFailed(`Bitrise build slug not found.`);
      process.exit(1);
    }

    const buildLink = `${bitriseProjectUrl}/pipelines/${bitriseBuildResponse.data.build_slug}`;
    const message = `E2E test started on Bitrise: ${buildLink}`;

    if (bitriseBuildResponse.status === 201) {
      console.log(message);
    }

    // Post build link in PR comments.
    const postCommentResponse = await octokit.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      body: message,
    });

    if (postCommentResponse.status === 201) {
      console.log(`Posting comment in pull request ${context.issue.number}.`);
    }

    // if (!process.env.GITHUB_REPOSITORY) {
    //   core.setFailed('GITHUB_REPOSITORY not found.');
    //   process.exit(1);
    // }

    // if (!process.env.GITHUB_SHA) {
    //   core.setFailed('GITHUB_SHA not found.');
    //   process.exit(1);
    // }

    // const owner = process.env.GITHUB_REPOSITORY.split('/')[0];
    // const repo = process.env.GITHUB_REPOSITORY.split('/')[1];

    // const statusUpdateResponse = await octokit.rest.repos.createCommitStatus({
    //   owner,
    //   repo,
    //   sha: process.env.GITHUB_SHA,
    //   state: 'pending', // can be one of "error", "failure", "pending", or "success"
    //   target_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
    //   description: 'Your description here',
    //   context: 'Your context here',
    // });

    // console.log('Updated status', statusUpdateResponse);

    // const tagName = `pr-e2e-${pull_request.number}`;

    // const response = await axios.get(
    //   'https://api.github.com/repos/MetaMask/metamask-mobile/pulls/7339',
    //   {
    //     headers: {
    //       Accept: 'application/vnd.github.v3+json',
    //     },
    //   },
    // );
    // const pullRequestInfo = response.data;
    // const sha = pullRequestInfo.head.sha;
    // console.log('PR INFO', pullRequestInfo.head.sha);

    // // const { data: ref } = await octokit.rest.git.getRef({
    // //   owner: repository.owner.login,
    // //   repo: repository.name,
    // //   ref: `heads/${pull_request.head.ref}`,
    // // });

    // await octokit.rest.git.createRef({
    //   owner: repository.owner.login,
    //   repo: repository.name,
    //   ref: `refs/tags/${tagName}`,
    //   sha,
    // });

    // console.log(`Created tag ${tagName}.`);
  } else {
    console.log(
      `Skipping E2E build on PR #${pull_request.number} since ${E2E_TRIGGERED_LABEL} label does not exist.`,
    );
  }
}

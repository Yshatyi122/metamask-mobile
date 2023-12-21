import { PhishingController } from '@metamask/phishing-controller';

/**
 * List of allowed protocols. On Flask, HTTP is also allowed for testing.
 */
const ALLOWED_PROTOCOLS: string[] = [
  'https:',
  ///: BEGIN:ONLY_INCLUDE_IN(build-flask)
  'http:',
  ///: END:ONLY_INCLUDE_IN
];

/**
 * Checks if the protocol of the origin is allowed.
 *
 * @param origin - The origin to check.
 * @returns `true` if the protocol of the origin is allowed, `false` otherwise.
 */
export function isProtocolAllowed(origin: string): boolean {
  try {
    const url = new URL(origin);
    return ALLOWED_PROTOCOLS.includes(url.protocol);
  } catch (error) {
    return false;
  }
}

/**
 * Checks whether a given URL is blocked due to not using HTTPS or being
 * recognized as a phishing URL.
 *
 * @param url - The URL to check.
 * @param maybeUpdateState - A function that updates the phishing controller state.
 * @param testOrigin - A function that tests if a URL is a phishing URL.
 * @returns Returns a promise which resolves to `true` if the URL is blocked
 * either due to using an insecure protocol (not HTTPS) or being recognized as
 * a phishing URL. Otherwise, resolves to `false`.
 */
export const isBlockedUrl = async (
  url: string,
  maybeUpdateState: () => ReturnType<PhishingController['maybeUpdateState']>,
  testOrigin: (url: string) => ReturnType<PhishingController['test']>,
): Promise<boolean> => {
  try {
    // check if the URL is HTTPS
    if (!isProtocolAllowed(url)) {
      return true;
    }

    // check if the url is in the phishing list
    await maybeUpdateState();
    return testOrigin(url).result;
  } catch (error) {
    console.error('Invalid URL passed into snap-keyring:', error);
    return false;
  }
};

import { toHex } from '@metamask/controller-utils';

/**
 * Converting chain id on decimal format to hexadecimal format
 * Replacing rpcTarget property for the rpcUrl new property on providerConfig
 * Converting keys of networkOnboardedState for hexadecimal for not repeat showing the new network modal
 * decided here https://github.com/MetaMask/core/pull/1367
 * @param {any} state - Redux state.
 * @returns Migrated Redux state.
 */
export default function migrate(state) {
  // Chaning chain id to hexadecimal chain Id on the networks already on the local state
  if (
    state?.engine?.backgroundState?.NetworkController?.providerConfig?.chainId
  ) {
    const networkControllerChainId =
      state.engine.backgroundState.NetworkController.providerConfig.chainId;

    state.engine.backgroundState.NetworkController.providerConfig.chainId =
      toHex(networkControllerChainId);
  }
  // Changing rcpTarget property for the new rpcUrl
  if (
    state?.engine?.backgroundState?.NetworkController?.providerConfig?.rpcTarget
  ) {
    const networkControllerRpcTarget =
      state.engine.backgroundState.NetworkController.providerConfig.rpcTarget;

    state.engine.backgroundState.NetworkController.providerConfig.rpcUrl =
      networkControllerRpcTarget;
  }
  // Validating if the networks were already onboarded
  if (state?.networkOnboarded?.networkOnboardedState) {
    const networkOnboardedState = state.networkOnboarded.networkOnboardedState;
    const newNetworkOnboardedState = {};

    for (const chainId in networkOnboardedState) {
      const hexChainId = toHex(chainId);
      newNetworkOnboardedState[hexChainId] = networkOnboardedState[chainId];
    }
    state.networkOnboarded.networkOnboardedState = newNetworkOnboardedState;
  }
  return state;
}

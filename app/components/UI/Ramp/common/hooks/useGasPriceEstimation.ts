import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { GAS_ESTIMATE_TYPES } from '@metamask/gas-fee-controller';
import { BN } from 'ethereumjs-util';
import Engine from '../../../../../core/Engine';
import { RootState } from '../../../../../reducers';
import { decGWEIToHexWEI } from '../../../../../util/conversions';

function useGasPriceEstimation({
  gasLimit = 21000,
  estimateRange = 'medium',
}: {
  gasLimit: number;
  estimateRange?: 'low' | 'medium' | 'high';
}) {
  const pollTokenRef = useRef(null);

  const gasFeeControllerState = useSelector(
    (state: RootState) => state.engine.backgroundState.GasFeeController,
  );

  useEffect(() => {
    if (gasLimit === 0) return;
    const { GasFeeController } = Engine.context;
    async function polling() {
      const newPollToken =
        await GasFeeController.getGasFeeEstimatesAndStartPolling(
          pollTokenRef.current,
        );
      pollTokenRef.current = newPollToken;
    }
    polling();
    return () => {
      GasFeeController.stopPolling(pollTokenRef.current);
      pollTokenRef.current = null;
    };
  }, [gasLimit]);

  if (
    gasLimit === 0 ||
    gasFeeControllerState.gasEstimateType === GAS_ESTIMATE_TYPES.NONE
  ) {
    return null;
  }

  let gasPrice;

  if (gasFeeControllerState.gasEstimateType === GAS_ESTIMATE_TYPES.FEE_MARKET) {
    gasPrice =
      gasFeeControllerState.gasFeeEstimates[estimateRange]
        .suggestedMaxFeePerGas;
  } else if (
    gasFeeControllerState.gasEstimateType === GAS_ESTIMATE_TYPES.LEGACY
  ) {
    gasPrice = gasFeeControllerState.gasFeeEstimates[estimateRange];
  } else {
    gasPrice = gasFeeControllerState.gasFeeEstimates.gasPrice;
  }

  const weiGasPrice = new BN(decGWEIToHexWEI(gasPrice) as string, 'hex');
  const estimatedGasFee = weiGasPrice.muln(gasLimit);

  return {
    estimatedGasFee,
  };
}

export default useGasPriceEstimation;

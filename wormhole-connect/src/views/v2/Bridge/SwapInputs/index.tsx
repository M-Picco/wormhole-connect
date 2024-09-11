import React, { useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { makeStyles } from 'tss-react/mui';

import config from 'config';
import { RootState } from 'store';
import { setAmount, setDestToken, swapInputs } from 'store/transferInput';
import { swapWallets } from 'store/wallet';

const useStyles = makeStyles()(() => ({
  swapButton: {
    display: 'block',
    position: 'absolute',
    bottom: -48,
    left: 'calc(50% - 20px)',
    width: 40,
    height: 40,
    zIndex: 1,
  },
}));

function SwapInputs() {
  const dispatch = useDispatch();

  const {
    isTransactionInProgress,
    fromChain,
    toChain,
    destToken,
    token: sourceToken,
  } = useSelector((state: RootState) => state.transferInput);

  const canSwap =
    fromChain &&
    !config.chains[fromChain]?.disabledAsDestination &&
    toChain &&
    !config.chains[toChain]?.disabledAsSource;

  const swap = useCallback(() => {
    if (!canSwap || isTransactionInProgress) return;

    dispatch(swapInputs());
    dispatch(swapWallets());
    dispatch(setAmount(''));

    if (destToken) {
      config.routes
        .allSupportedDestTokens(config.tokens[destToken], toChain, fromChain)
        .then((tokenConfigs) => {
          const isTokenSupportedAsDest = tokenConfigs.find(
            (tc) => tc.key === sourceToken,
          );

          if (!isTokenSupportedAsDest) {
            dispatch(setDestToken(''));
          }
        });
    }
  }, [destToken, sourceToken, fromChain, toChain]);

  const { classes } = useStyles();

  return (
    <IconButton
      className={classes.swapButton}
      onClick={swap}
      disabled={!canSwap}
    >
      <SwapVertIcon color="secondary" />
    </IconButton>
  );
}

export default SwapInputs;

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAccounts } from '../Redux/Action';
import { ethers } from 'ethers';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
const ipcRenderer = (window as any).ipcRenderer;

const TransferFundsComponent = () => {

  const dispatch = useDispatch();
  const accounts = useSelector((state: any) => state.accounts.accounts);

  useEffect(() => {

    const handleFundsTransferred = (event: any, response: any) => {
      dispatch(setAccounts(response.accounts));
    };

    ipcRenderer.on('funds-transferred', handleFundsTransferred);


    return () => {
      ipcRenderer.removeListener('funds-transferred', handleFundsTransferred);
    };
  }, [dispatch]);

  const handleTransferFunds = () => {

    ipcRenderer.send('transfer-funds');
  };

  return (
    <div>
      <h2>Transfer Funds (R:2)</h2>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="success" sx={{ width: '250px', height: '50px' }} onClick={handleTransferFunds}>
            Transfer Funds
          </Button>
        </Stack>
      </div>

    </div>

  );
};

export default TransferFundsComponent;

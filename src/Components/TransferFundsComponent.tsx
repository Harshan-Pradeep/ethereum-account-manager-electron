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

  const [sourcePrivateKey, setSourcePrivateKey] = useState('');

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
    const sourceWallet = new ethers.Wallet(sourcePrivateKey);
    const sourceAddress = sourceWallet.address;

    const destinationAddresses = accounts
      .map((acc: any) => acc.address)
      .filter((address: any) => address !== sourceAddress);

    ipcRenderer.send('transfer-funds', sourcePrivateKey, destinationAddresses);
  };

  return (
    <div>
      <h2>Transfer Funds (R:2)</h2>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 1, width: '50ch' },
          }}
          noValidate
          autoComplete="off"
        >
          <TextField id="outlined-basic" label="Source Private Key" variant="outlined" value={sourcePrivateKey}
            onChange={(e) => setSourcePrivateKey(e.target.value)} />
        </Box>

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

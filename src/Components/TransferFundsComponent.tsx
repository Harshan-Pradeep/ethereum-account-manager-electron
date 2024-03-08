import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAccounts } from '../Redux/Action';
import { ethers } from 'ethers';
const ipcRenderer = (window as any).ipcRenderer;

const TransferFundsComponent = () => {

  const [sourcePrivateKey, setSourcePrivateKey] = useState('');
  const [transferMessage, setTransferMessage] = useState('');

  const dispatch = useDispatch();
  const accounts = useSelector((state: any) => state.accounts.accounts);

  useEffect(() => {

    const handleFundsTransferred = (event: any, response: any) => {
      setTransferMessage(response.message);
      dispatch(setAccounts(response.accounts));
    };

    const handleFundsTransferError = (event: any, response: any) => {
      setTransferMessage(response.message);
      dispatch(setAccounts(response.accounts));
    };

    ipcRenderer.on('funds-transferred', handleFundsTransferred);
    ipcRenderer.on('funds-transfer-error', handleFundsTransferError);


    return () => {
      ipcRenderer.removeListener('funds-transferred', handleFundsTransferred);
      ipcRenderer.removeListener('funds-transfer-error', handleFundsTransferError);

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
      <h2>Transfer Funds</h2>
      <input
        type="text"
        placeholder="Source Private Key"
        value={sourcePrivateKey}
        onChange={(e) => setSourcePrivateKey(e.target.value)}
      />
      <button onClick={handleTransferFunds}>Transfer Funds</button>
      {transferMessage && <p>{transferMessage}</p>}
    </div>

  );
};

export default TransferFundsComponent;

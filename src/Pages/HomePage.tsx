import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAccounts } from '../Redux/Action'; // Adjust the path as needed
import { ethers } from 'ethers';
const ipcRenderer = (window as any).ipcRenderer;

const HomePage = () => {
  const [numberOfAccounts, setNumberOfAccounts] = useState(0);
  const [sourcePrivateKey, setSourcePrivateKey] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMessage, setTransferMessage] = useState('');
  const [remainingFundsMessage, setRemainingFundsMessage] = useState('');
  const dispatch = useDispatch();
  const accounts = useSelector((state: any) => state.accounts.accounts);

  useEffect(() => {
    const handleAccountsCreated = (event: any, createdAccounts: any) => {
      dispatch(setAccounts(createdAccounts));
    };

    const handleFundsTransferred = (event: any, message: string) => {
      setTransferMessage(message);
    };

    const handleRemainingFundsTransferred = (event: any, message: string) => {
      setRemainingFundsMessage(message);
    };

    ipcRenderer.on('accounts-created', handleAccountsCreated);
    ipcRenderer.on('funds-transferred', handleFundsTransferred);
    ipcRenderer.on('remaining-funds-transferred', handleRemainingFundsTransferred);

    return () => {
      ipcRenderer.removeListener('accounts-created', handleAccountsCreated);
      ipcRenderer.removeListener('funds-transferred', handleFundsTransferred);
      ipcRenderer.removeListener('remaining-funds-transferred', handleRemainingFundsTransferred);
    };
  }, [dispatch]);

  const handleCreateAccounts = () => {
    ipcRenderer.send('create-accounts', numberOfAccounts);
  };

  const handleTransferFunds = () => {
    const sourceWallet = new ethers.Wallet(sourcePrivateKey);
    const sourceAddress = sourceWallet.address;

    const destinationAddresses = accounts
      .map((acc: any) => acc.address)
      .filter((address: any) => address !== sourceAddress);

    ipcRenderer.send('transfer-funds', sourcePrivateKey, destinationAddresses, transferAmount);
  };

  const handleTransferRemainingFunds = () => {
    ipcRenderer.send('transfer-remaining-funds');
  };

  return (
    <div>
      <h2>Create Accounts</h2>
      <input
        type="number"
        value={numberOfAccounts}
        onChange={(e) => setNumberOfAccounts(Number(e.target.value))}
      />
      <button onClick={handleCreateAccounts}>Create Accounts</button>
      <div>
        {accounts.map((account: any, index: React.Key | null | undefined) => (
          <p key={index}>{account.address}</p>
        ))}
      </div>

      <h2>Transfer Funds</h2>
      <input
        type="text"
        placeholder="Source Private Key"
        value={sourcePrivateKey}
        onChange={(e) => setSourcePrivateKey(e.target.value)}
      />
      <input
        type="text"
        placeholder="Amount (ETH)"
        value={transferAmount}
        onChange={(e) => setTransferAmount(e.target.value)}
      />
      <button onClick={handleTransferFunds}>Transfer Funds</button>
      {transferMessage && <p>{transferMessage}</p>}

      <h2>Transfer Remaining Funds</h2>
      <button onClick={handleTransferRemainingFunds}>Transfer Remaining Funds</button>
      {remainingFundsMessage && <p>{remainingFundsMessage}</p>}
    </div>
  );
};

export default HomePage;

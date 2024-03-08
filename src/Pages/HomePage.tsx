import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAccounts } from '../Redux/Action';
import { ethers } from 'ethers';
import CreateAccountsComponent from '../Components/CreateAccountsComponent';
const ipcRenderer = (window as any).ipcRenderer;

const HomePage = () => {
  const [numberOfAccounts, setNumberOfAccounts] = useState(0);
  const [sourcePrivateKey, setSourcePrivateKey] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMessage, setTransferMessage] = useState('');
  const [remainingFundsMessage, setRemainingFundsMessage] = useState('');
  const [randomFundsMessage, setRandomFundsMessage] = useState(''); // New state variable for the random funds transfer message
  const dispatch = useDispatch();
  const accounts = useSelector((state: any) => state.accounts.accounts);

  useEffect(() => {
    const handleAccountsCreated = (event: any, createdAccounts: any) => {
      dispatch(setAccounts(createdAccounts));
    };

    const handleFundsTransferred = (event: any, response: any) => {
      setTransferMessage(response.message);
      dispatch(setAccounts(response.accounts));
    };

    const handleFundsTransferError = (event: any, response: any) => {
      setTransferMessage(response.message);
      dispatch(setAccounts(response.accounts));
    };



    const handleRemainingFundsTransferred = (event: any, response: any) => {
      setTransferMessage(response.message);
      dispatch(setAccounts(response.accounts));
    };

    const handleRemainingFundsTransferredError = (event: any, response: any) => {
      setTransferMessage(response.message);
      dispatch(setAccounts(response.accounts));
    };

    const handleRandomFundsTransferred = (event: any, response: any) => {
      setTransferMessage(response.message);
      dispatch(setAccounts(response.accounts));
    };

    const handleRandomFundsTransferredError = (event: any, response: any) => {
      setTransferMessage(response.message);
      dispatch(setAccounts(response.accounts));
    };

    ipcRenderer.on('accounts-created', handleAccountsCreated);
    ipcRenderer.on('funds-transferred', handleFundsTransferred);
    ipcRenderer.on('funds-transfer-error', handleFundsTransferError);
    ipcRenderer.on('remaining-funds-transferred', handleRemainingFundsTransferred);
    ipcRenderer.on('remaining-funds-transfer-error', handleRemainingFundsTransferred);
    ipcRenderer.on('random-funds-transferred', handleRandomFundsTransferred);
    ipcRenderer.on('random-funds-transfer-error', handleRandomFundsTransferred);

    return () => {
      ipcRenderer.removeListener('accounts-created', handleAccountsCreated);
      ipcRenderer.removeListener('funds-transferred', handleFundsTransferred);
      ipcRenderer.removeListener('funds-transfer-error', handleFundsTransferError);
      ipcRenderer.removeListener('remaining-funds-transferred', handleRemainingFundsTransferred);
      ipcRenderer.removeListener('random-funds-transferred', handleRandomFundsTransferred); // Remove the listener for the random funds transfer event
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

  const handleTransferRandomFunds = () => {
    ipcRenderer.send('transfer-random-funds'); // Send the IPC message to trigger the random funds transfer
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
      <button onClick={handleTransferFunds}>Transfer Funds</button>
      <div>
        {accounts.map((account: any, index: React.Key | null | undefined) => (
          <>
            <p key={index}>{account.address}</p>
            <p key={index}>{account.balance}</p>
          </>

        ))}
      </div>
      {transferMessage && <p>{transferMessage}</p>}

      <h2>Transfer Remaining Funds</h2>
      <button onClick={handleTransferRemainingFunds}>Transfer Remaining Funds</button>
      <div>
        {accounts.map((account: any, index: React.Key | null | undefined) => (
          <>
            <p key={index}>{account.address}</p>
            <p key={index}>{account.balance}</p>
          </>

        ))}
      </div>
      {transferMessage && <p>{transferMessage}</p>}

      <h2>Transfer Random Funds</h2> {/* New section for transferring random funds */}
      <button onClick={handleTransferRandomFunds}>Transfer Random Funds</button>
      {randomFundsMessage && <p>{randomFundsMessage}</p>} {/* Display the message for random funds transfer */}
    </div>
   
  );
};

export default HomePage;

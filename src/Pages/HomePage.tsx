import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAccounts } from '../Redux/Action'; // Adjust the path as needed
import { ethers } from 'ethers';
const ipcRenderer = (window as any).ipcRenderer;

const HomePage = () => {
  const [numberOfAccounts, setNumberOfAccounts] = useState(0);
  const [sourcePrivateKey, setSourcePrivateKey] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMessage, setTransferMessage] = useState(''); // New state variable for the transfer message
  const dispatch = useDispatch();
  const accounts = useSelector((state: any) => state.accounts.accounts);
console.log("accounts",accounts)
  useEffect(() => {
    const handleAccountsCreated = (event: any, createdAccounts: any) => {
      dispatch(setAccounts(createdAccounts));
    };

    const handleFundsTransferred = (event: any, message: string) => {
      setTransferMessage(message); // Update the transfer message state
    };

    ipcRenderer.on('accounts-created', handleAccountsCreated);
    ipcRenderer.on('funds-transferred', handleFundsTransferred);

    return () => {
      ipcRenderer.removeListener('accounts-created', handleAccountsCreated);
      ipcRenderer.removeListener('funds-transferred', handleFundsTransferred);
    };
  }, [dispatch]);

  const handleCreateAccounts = () => {
    ipcRenderer.send('create-accounts', numberOfAccounts);
  };

  const handleTransferFunds = () => {
    const sourceWallet = new ethers.Wallet(sourcePrivateKey);
  const sourceAddress = sourceWallet.address;

  const destinationAddresses = accounts
    .map((acc:any) => acc.address)
    .filter((address:any) => address !== sourceAddress);

  ipcRenderer.send('transfer-funds', sourcePrivateKey, destinationAddresses, transferAmount);
  };

  console.log(transferMessage)

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

      {/* Display the transfer message */}
      {transferMessage && <p>{transferMessage}</p>}
    </div>
  );
};

export default HomePage;

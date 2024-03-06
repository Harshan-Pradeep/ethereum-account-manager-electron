import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAccounts } from '../Redux/Action'; // Adjust the path as needed
const ipcRenderer = (window as any).ipcRenderer

const HomePage = () => {
  const [numberOfAccounts, setNumberOfAccounts] = useState(0);
  const dispatch = useDispatch();
  const accounts = useSelector((state:any) => state.accounts.accounts);

  console.log("accounts",accounts)

  useEffect(() => {
    // Set up the listener for the 'accounts-created' message
    const handleAccountsCreated = (event: any, createdAccounts: any) => {
      dispatch(setAccounts(createdAccounts));
    };

    ipcRenderer.on('accounts-created', handleAccountsCreated);

    // Clean up the listener when the component unmounts
    return () => {
      ipcRenderer.removeListener('accounts-created', handleAccountsCreated);
    };
  }, [dispatch]);

const handleCreateAccounts = () => {
    const result = ipcRenderer.send('create-accounts', numberOfAccounts);
    console.log("result", result)
  };

  return (
    <div>
      <input
        type="number"
        value={numberOfAccounts}
        onChange={(e) => setNumberOfAccounts(Number(e.target.value))}
      />
      <button onClick={handleCreateAccounts}>Create Accounts</button>
      <div>
        {accounts.map((account: { address: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
          <p key={index}>{account.address}</p>
        ))}
      </div>
    </div>
  );
};

export default HomePage;

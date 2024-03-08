import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAccounts } from '../Redux/Action';
import { ethers } from 'ethers';
const ipcRenderer = (window as any).ipcRenderer;

const CreateAccountsComponent = () => {
    const [numberOfAccounts, setNumberOfAccounts] = useState(0);

    const dispatch = useDispatch();
    const accounts = useSelector((state: any) => state.accounts.accounts);

    useEffect(() => {
        const handleAccountsCreated = (event: any, createdAccounts: any) => {
            dispatch(setAccounts(createdAccounts));
        };


        ipcRenderer.on('accounts-created', handleAccountsCreated);


        return () => {
            ipcRenderer.removeListener('accounts-created', handleAccountsCreated);

        };
    }, [dispatch]);

    const handleCreateAccounts = () => {
        ipcRenderer.send('create-accounts', numberOfAccounts);
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
        </div>
    );
};

export default CreateAccountsComponent;

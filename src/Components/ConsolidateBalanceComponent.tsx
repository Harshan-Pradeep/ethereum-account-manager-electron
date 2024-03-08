import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAccounts } from '../Redux/Action';
import { ethers } from 'ethers';
const ipcRenderer = (window as any).ipcRenderer;

const ConsolidateBalanceComponent = () => {

    const [remainingFundsMessage, setRemainingFundsMessage] = useState('');
    const [transferMessage, setTransferMessage] = useState('');

    const dispatch = useDispatch();
    const accounts = useSelector((state: any) => state.accounts.accounts);

    useEffect(() => {

        const handleRemainingFundsTransferred = (event: any, response: any) => {
            setTransferMessage(response.message);
            dispatch(setAccounts(response.accounts));
        };

        const handleRemainingFundsTransferredError = (event: any, response: any) => {
            setTransferMessage(response.message);
            dispatch(setAccounts(response.accounts));
        };

        ipcRenderer.on('remaining-funds-transferred', handleRemainingFundsTransferred);
        ipcRenderer.on('remaining-funds-transfer-error', handleRemainingFundsTransferredError);

        return () => {

            ipcRenderer.removeListener('remaining-funds-transferred', handleRemainingFundsTransferred);
            ipcRenderer.removeListener('remaining-funds-transfer-error', handleRemainingFundsTransferredError);
        };
    }, [dispatch]);

    const handleTransferRemainingFunds = () => {
        ipcRenderer.send('transfer-remaining-funds');
    };

    return (
        <div>
            <h2>Transfer Remaining Funds</h2>
            <button onClick={handleTransferRemainingFunds}>Transfer Remaining Funds</button>
            {transferMessage && <p>{transferMessage}</p>}
        </div>

    );
};

export default ConsolidateBalanceComponent;

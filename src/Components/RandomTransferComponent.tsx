import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAccounts } from '../Redux/Action';
import { ethers } from 'ethers';
const ipcRenderer = (window as any).ipcRenderer;

const RandomTransferComponent = () => {
    const [transferMessage, setTransferMessage] = useState('');

    const dispatch = useDispatch();
    const accounts = useSelector((state: any) => state.accounts.accounts);

    useEffect(() => {

        const handleRandomFundsTransferred = (event: any, response: any) => {
            setTransferMessage(response.message);
            dispatch(setAccounts(response.accounts));
        };

        const handleRandomFundsTransferredError = (event: any, response: any) => {
            setTransferMessage(response.message);
            dispatch(setAccounts(response.accounts));
        };

        ipcRenderer.on('random-funds-transferred', handleRandomFundsTransferred);
        ipcRenderer.on('random-funds-transfer-error', handleRandomFundsTransferredError);

        return () => {

            ipcRenderer.removeListener('random-funds-transferred', handleRandomFundsTransferred);
            ipcRenderer.removeListener('random-funds-transfer-error', handleRandomFundsTransferredError);
        };
    }, [dispatch]);

    const handleTransferRandomFunds = () => {
        ipcRenderer.send('transfer-random-funds');
    };

    return (
        <div>

            <h2>Transfer Random Funds</h2>
            <button onClick={handleTransferRandomFunds}>Transfer Random Funds</button>
            {transferMessage && <p>{transferMessage}</p>}
        </div>

    );
};

export default RandomTransferComponent;

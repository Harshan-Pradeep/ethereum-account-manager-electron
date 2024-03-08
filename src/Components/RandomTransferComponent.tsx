import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAccounts } from '../Redux/Action';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
const ipcRenderer = (window as any).ipcRenderer;

const RandomTransferComponent = () => {

    const dispatch = useDispatch();

    useEffect(() => {

        const handleRandomFundsTransferred = (event: any, response: any) => {
            dispatch(setAccounts(response.accounts));
        };

        ipcRenderer.on('random-funds-transferred', handleRandomFundsTransferred);

        return () => {

            ipcRenderer.removeListener('random-funds-transferred', handleRandomFundsTransferred);
        };
    }, [dispatch]);

    const handleTransferRandomFunds = () => {
        ipcRenderer.send('transfer-random-funds');
    };

    return (
        <div style={{ display: "flex", gap: "130px" }}>

            <h2>Transfer Random Funds (R:3)</h2>

            <Stack direction="row" spacing={2}>
                <Button variant="contained" color="success" sx={{ width: '250px', height: '50px' }} onClick={handleTransferRandomFunds}>
                    Transfer Random Funds
                </Button>
            </Stack>
        </div>

    );
};

export default RandomTransferComponent;

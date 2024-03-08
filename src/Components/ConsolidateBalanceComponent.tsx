import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAccounts } from '../Redux/Action';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
const ipcRenderer = (window as any).ipcRenderer;

const ConsolidateBalanceComponent = () => {

    const dispatch = useDispatch();

    useEffect(() => {

        const handleRemainingFundsTransferred = (event: any, response: any) => {
            dispatch(setAccounts(response.accounts));
        };

        ipcRenderer.on('remaining-funds-transferred', handleRemainingFundsTransferred);

        return () => {

            ipcRenderer.removeListener('remaining-funds-transferred', handleRemainingFundsTransferred);
        };
    }, [dispatch]);

    const handleTransferRemainingFunds = () => {
        ipcRenderer.send('transfer-remaining-funds');
    };

    return (
        <div style={{ display: "flex", gap: "105px" }}>
            <h2>Transfer Remaining Funds (R:4)</h2>

            <Stack direction="row" spacing={2}>
                <Button variant="contained" color="success" sx={{ width: '250px', height: '50px' }} onClick={handleTransferRemainingFunds}>
                    Transfer Remaining Funds
                </Button>
            </Stack>
        </div>

    );
};

export default ConsolidateBalanceComponent;

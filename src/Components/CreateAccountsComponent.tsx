import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAccounts } from '../Redux/Action';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
const ipcRenderer = (window as any).ipcRenderer;

const CreateAccountsComponent = () => {
    const [numberOfAccounts, setNumberOfAccounts] = useState(0);

    const dispatch = useDispatch();


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
            <h2>Create Accounts (R:1)</h2>

            <div style={{ display: "flex", gap: 10, alignItems: "center " }}>
                <TextField
                    type="number"
                    label="Number of Accounts"
                    value={numberOfAccounts}
                    onChange={(e) => setNumberOfAccounts(Number(e.target.value))}
                    variant="outlined"
                    sx={{ m: 1, width: '50ch' }}
                    inputProps={{ min: 1 }}
                />


                <Stack direction="row" spacing={2}>
                    <Button variant="contained" color="success" sx={{ width: '250px', height: '50px' }} onClick={handleCreateAccounts}>
                        Create Accounts
                    </Button>
                </Stack>
            </div>
        </div>
    );
};

export default CreateAccountsComponent;

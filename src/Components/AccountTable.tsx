import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useSelector } from 'react-redux';

const AccountTable = () => {
    const accounts = useSelector((state: any) => state.accounts.accounts);

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Index</TableCell>
                        <TableCell align="center">Address</TableCell>
                        <TableCell align="center">PrivateKey</TableCell>
                        <TableCell align="center">Balance&nbsp;(Wei)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {accounts.map((account: any, index: number) => (
                        <TableRow
                            key={index}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {index + 1}
                            </TableCell>
                            <TableCell align="right">{account.address}</TableCell>
                            <TableCell align="right">{account.privateKey}</TableCell>
                            <TableCell align="right">{account.balance}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default AccountTable;

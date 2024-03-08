
export const CREATE_ACCOUNTS = 'CREATE_ACCOUNTS';
export const SET_ACCOUNTS = 'SET_ACCOUNTS';
export const TRANSFER_FUNDS = 'TRANSFER_FUNDS';

export const createAccounts = (numberOfAccounts: number) => ({
  type: CREATE_ACCOUNTS,
  payload: numberOfAccounts,
});

export const setAccounts = (accounts: any) => ({
  type: SET_ACCOUNTS,
  payload: accounts,
});

export const transferFunds = (sourcePrivateKey: any, destinationAddresses: any, amount: any) => ({
  type: TRANSFER_FUNDS,
  payload: { sourcePrivateKey, destinationAddresses, amount },
});
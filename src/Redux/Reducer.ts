// reducers/accountsReducer.js
import { CREATE_ACCOUNTS, SET_ACCOUNTS, TRANSFER_FUNDS } from './Action';

const initialState = {
  accounts: [],
  transferStatus: null,
};

const accountsReducer = (state = initialState, action:any) => {
  switch (action.type) {
    case SET_ACCOUNTS:
      return {
        ...state,
        accounts: action.payload,
      };
      case TRANSFER_FUNDS:
      return {
        ...state,
        transferStatus: 'pending',
      };
    default:
      return state;
  }
  
};

export default accountsReducer;

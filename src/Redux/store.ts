
import { legacy_createStore as createStore, combineReducers } from 'redux';
import accountsReducer from './Reducer';

const rootReducer = combineReducers({
  accounts: accountsReducer,
});

const store = createStore(rootReducer);

export default store;

import {combineReducers, createStore} from 'redux';
import reducer from './reducers';
import userReducer from './reducers/userReducer';

const reducers = combineReducers({
  root: reducer,
  user: userReducer,
});

const Store = createStore(reducers);

export default Store;

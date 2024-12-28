import {useDispatch} from 'react-redux';
import Store from '../store';
const SET_USER_AUTH = 'SET_USER_AUTH';
const SET_USER_PROFILE = 'SET_USER_PROFILE';
const SET_USER_FRIENDS = 'SET_USER_FRIENDS';
const SET_USER_FOLLOWINGS = 'SET_USER_FOLLOWINGS';
const REMOVE_USER_DATA = 'REMOVE_USER_DATA';

export {
  SET_USER_AUTH,
  SET_USER_PROFILE,
  SET_USER_FRIENDS,
  SET_USER_FOLLOWINGS,
  REMOVE_USER_DATA,
};

const setUserProfile = (data) =>
  Store.dispatch({
    type: SET_USER_PROFILE,
    data,
  });

const setUserFriends = (data) =>
  Store.dispatch({
    type: SET_USER_FRIENDS,
    data,
  });

const setUserFollowings = (data) =>
  Store.dispatch({
    type: SET_USER_FOLLOWINGS,
    data,
  });

export {setUserProfile, setUserFriends, setUserFollowings};

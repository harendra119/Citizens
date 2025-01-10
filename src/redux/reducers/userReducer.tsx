import UserInfoService from '../../utils/UserInfoService';
import {
  SET_USER_AUTH,
  SET_USER_FRIENDS,
  SET_USER_PROFILE,
  SET_USER_FOLLOWINGS,
  REMOVE_USER_DATA,
} from '../actions/userActions';

const initialState = {
  userProfile: {},
  userFriends: null,
  userFollowings: null,
};

const userReducer = (state = initialState, action) => {
  const newState = {...state};
  if (action.type == SET_USER_AUTH) {
    newState.userAuth = action.data;
  }
  if (action.type == SET_USER_PROFILE) {
    console.log('action Incoming', action.data);
    UserInfoService.setUserInfo(action?.data)
    newState.userProfile = action.data;
    
  }
  if (action.type == SET_USER_FRIENDS) {
    newState.userFriends = action.data;
  }
  if (action.type == SET_USER_FOLLOWINGS) {
    newState.userFollowings = action.data;
  }
  if (action.type == REMOVE_USER_DATA) {
   
    (newState.userProfile = {}),
      (newState.userFriends = null),
      (newState.userFollowings = null);
      UserInfoService.setUserInfo(null);
  }
  return newState;
};

export default userReducer;

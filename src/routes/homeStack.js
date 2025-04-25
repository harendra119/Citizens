import auth from '@react-native-firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import {
  getUserFollowings,
  getUserFriends,
  getUserProfile,
  updateFcmToken,
} from '../backend/userProfile';

import Drawer from '../components/drawer';
import Home from '../routes/bottomtab';
import AccountSetting from '../screens/accountSetting';
import ChatStack from '../screens/chat';
import FriendTab from '../screens/firendsPage';
import uploadPost from '../screens/posts/uploadPost';
import Profile from '../screens/profile';
import appSearch from '../screens/search/appSearch';
import SeacrchPage from '../screens/searchPage';
import SinglePost from '../screens/singlePost';
import BlockedUserList from '../screens/blockedUsers/BlockedUserList';
import Onboarding from '../screens/Onboarding/Onboarding';

const Stack = createStackNavigator();

export default HomeStack = () => {
  const uid = auth().currentUser?.uid;

  console.log('userid........', uid);

  useEffect(() => {
    updateFcmToken(uid);
    const unsubProfile = getUserProfile(uid);
    const unSubFriends = getUserFriends(uid);
    const unSubFollowings = getUserFollowings(uid);
    return () => {
      unsubProfile();
      unSubFriends();
      unSubFollowings();
    };
  }, [uid]);

  const navigationRef = React.createRef();

  return (
    <NavigationContainer ref={navigationRef}>
      <Drawer navigation={navigationRef} />
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AccountSetting"
          component={AccountSetting}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile"
          component={Profile}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="seacrchPage"
          component={SeacrchPage}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="friendsPage"
          component={FriendTab}
          options={{
            headerShown: false,
          }}
        />
         <Stack.Screen
          name="BlockedUserList"
          component={BlockedUserList}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OnboardingView"
          component={Onboarding}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="UploadPost"
          component={uploadPost}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SinglePost"
          component={SinglePost}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AppSearch"
          component={appSearch}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ChatStack"
          component={ChatStack}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

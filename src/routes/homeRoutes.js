import Profile from '../screens/profile';
import Home from '../screens/home';
import React, {Component} from 'react';
import OtherUserProfile from '../screens/userProfile';
import AccountSetting from '../screens/accountSetting';
import UploadStories from '../screens/storiesUpload';
import UploadPost from '../screens/posts/uploadPost';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import ProfileRoutes from './profileRoute';
import {connect} from 'react-redux';
const Stack = createStackNavigator();

class HomeRoutes extends Component {
  render() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ProfileRoutes"
          component={ProfileRoutes}
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
          name="AccountSetting"
          component={AccountSetting}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="otherProfile"
          component={OtherUserProfile}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="uploadStories"
          component={UploadStories}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    );
  }
}

export default connect(null, null)(HomeRoutes);

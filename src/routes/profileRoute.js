import loginScreen from '../screens/loginScreen';
import OtherUserProfile from '../screens/userProfile';
import AccountSetting from '../screens/accountSetting';
import Profile from '../screens/profile';
import ForgotPassword from '../screens/forgotPassword';
import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {connect} from 'react-redux';
const Stack = createStackNavigator();

class ProfileRoutes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: '',
    };
  }

  render() {
    return (
      <Stack.Navigator>
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
      </Stack.Navigator>
    );
  }
}

export default connect(null, null)(ProfileRoutes);

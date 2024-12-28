import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import RecentNotifications from './RecentNotifications';

const Stack = createStackNavigator();

const Notifications = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="RecentNotifications"
        component={RecentNotifications}
      />
    </Stack.Navigator>
  );
};

export default Notifications;

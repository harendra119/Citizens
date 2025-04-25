/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import Route from './src/routes/landingRoutes';
import {Alert, View, Text, LogBox} from 'react-native';
import {Provider} from 'react-redux';
import rootReducer from './src/redux/reducers';
import Store from './src/redux/store';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {MenuProvider} from 'react-native-popup-menu';
import NotificationController from './src/controllers/NotificationController.android';
import messaging from '@react-native-firebase/messaging';



function App(): JSX.Element {

  useEffect(() => {
    LogBox.ignoreAllLogs(true);
    messaging()
      .requestPermission()
      .then((authStatus) => console.log('notif permission', authStatus))
      .catch((error) => console.log(error));
  }, []);

  return (
    <MenuProvider>
        <SafeAreaProvider>
          <Provider store={Store}x>
            <Route />
          </Provider>
          <NotificationController />
        </SafeAreaProvider>
      </MenuProvider>
  );
}

export default App;

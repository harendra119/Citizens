import auth from '@react-native-firebase/auth';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import forgotPassword from '../screens/forgotPassword';
import loginScreen from '../screens/loginScreen';
import PrivacyPolicy from '../screens/privacyPolicy';
import Register from '../screens/register';
import emailVerification from '../screens/emailVerification';

import Terms from '../screens/terms';
import HomeStack from './homeStack';

var PushNotification = require('react-native-push-notification');
var cloudToken = '';
// PushNotification.configure({

//     // (optional) Called when Token is generated (iOS and Android)
//     onRegister: function (token) {
//         console.log(token.token,'token')
//         cloudToken = token.token
//     },

//     // (required) Called when a remote is received or opened, or local notification is opened
//     // (required) Called when a remote is received or opened, or local notification is opened
//     onNotification: function (notification) {
//         console.log(notification,'*******')
//        Alert.alert(
//         notification.title,
//         notification.message
//        )
//         // if (notification.title == 'updateApp') {
//         //     Alert.alert(
//         //         "Update Avaliable",
//         //         "Go to store for download new Version ing app",
//         //         [
//         //             {
//         //                 text: "Cancel",
//         //                 //    onPress: () => Alert.alert("Cancel Pressed"),
//         //                 style: "cancel",
//         //             },
//         //             { text: "Go", onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.bulletinbites') }
//         //         ],

//         //         {
//         //             cancelable: true,
//         //             onDismiss: () => { }

//         //         }
//         //     );
//         // }
//         // OBJECT: The push data

//         // process the notification

//         // (required) Called when a remote is received or opened, or local notification is opened
//         // notification.finish(PushNotificationIOS.FetchResult.NoData);
//     },

//     // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
//     onAction: function (notification) {

//         console.log(notification)
//         // process the action
//     },

//     // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
//     onRegistrationError: function (err) {
//         console.error(err.message, err, '---');
//     },

//     // IOS ONLY (optional): default: all - Permissions to register.
//     permissions: {
//         alert: true,
//         badge: true,
//         sound: true,
//     },

//     // Should the initial notification be popped automatically
//     // default: true
//     popInitialNotification: true,

//     /**
//      * (optional) default: true
//      * - Specified if permissions (ios) and token (android and ios) will requested or not,
//      * - if not, you must call PushNotificationsHandler.requestPermissions() later
//      * - if you are not using remote notification or do not have Firebase installed, use this:
//      *     requestPermissions: Platform.OS === 'ios'
//      */
//     requestPermissions: true,
// });
const Stack = createStackNavigator();

const landingRoutes = () => {
  //   constructor(props) {
  //     super(props);
  //     this.state = {
  //       login: '',
  //     };
  //   }
  //   componentDidMount() {
  //     console.log(cloudToken, '-=-cloud=-=');

  //     this.props.cloudToken(cloudToken);
  //     AsyncStorage.setItem('@cloudToken', cloudToken);
  //   }

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {

    console.log('456 alert ...............', user);

    if(user && user?.emailVerified == false){
      setUser(user);

      if (initializing) setInitializing(false);
      return ;

    }else{
      setUser(user);

      if (initializing) setInitializing(false);
    }
    
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  return !user ? (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="loginScreen"
          component={loginScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="register"
          component={Register}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="emailVerification"
          component={emailVerification}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="forgotPassword"
          component={forgotPassword}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="terms"
          component={Terms}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="privacyPolicy"
          component={PrivacyPolicy}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  ) : (
    <HomeStack />
  );
};

const mapDispachToProps = (Dispatch) => {
  return {
    cloudToken: (token) => Dispatch({type: 'cloudToken', token}),
  };
};
export default connect(null, mapDispachToProps)(landingRoutes);

import React, {useEffect} from 'react';
import {Alert, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

const NotificationController = (props) => {
  useEffect(() => {
    PushNotification.createChannel(
      {
        channelId: 'com.citizens', // (required)
        channelName: 'Citizens', // (required)
        // channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
      },
      (created) => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
    );
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('remoteNotification', remoteMessage);
      let notifObj = {
        message: remoteMessage.notification.body,
        title: remoteMessage.notification.title,
      };
      if (Platform.OS == 'android') {
        notifObj = {
          ...notifObj,
          channelId: 'com.citizens',

          largeIcon: '', // (optional) default: "ic_launcher". Use "" for no large icon.
          smallIcon: 'ic_notification',
          color: '#1c2143',
        };
      }
      PushNotification.localNotification(notifObj);
    });
    return unsubscribe;
  }, []);

  return null;
};

export default NotificationController;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { Avatar, Icon } from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';

import { vScale, scale, mScale } from '../../configs/size';
import Header from '../../components/header';
import EmptyListText from '../../components/emptyListText';
import { tStyle } from '../../configs/textStyle';
import FastImage from 'react-native-fast-image';
import Utility from '../../utils/Utility';
import { TabActions } from '@react-navigation/native';
import { DeviceEventEmitter } from 'react-native';
import RoundImage from '../../components/roundImage';

const { height } = Dimensions.get('window');

const RecentNotifications = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);

  const userProfile = useSelector((state) => state.user?.userProfile);
  const userId = userProfile.userId;

  const getMonth = (month) => {
    var months = ["Jan", "Feb", "March", "April", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return months[month]
  }
  useEffect(() => {
    if (!userId) return;

    const ref = firestore().collection('Users').doc(userId).collection('Notification');

    // Get the timestamp for 3 months ago
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    // Firestore query: Get notifications in the last 3 months
    const unsubscribe = ref
      .where('date', '>=', firestore.Timestamp.fromDate(threeMonthsAgo)) // Filter for last 3 months
      .orderBy('date', 'desc')
      .onSnapshot((snapshot) => {
        const tempArr1 = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(tempArr1);
      });

    return () => unsubscribe(); // Cleanup subscription
  }, [userId]);


  const onNotificationPress = (notification) => {
    /*
      id: notificationRef.id,
      type: 'FR_REQ',
      displayName: payload.sendBy.displayName,
      profileUrl: payload.sendBy.profileUrl,
      senderId: payload.sendBy.userId,
      text: payload.sendBy.displayName + ' sent you friend request',
      postId: postId,
      date: new Date()
    */
    if (notification.type == 'FR_REQ') {
      Utility.setReqIndex(true);
      navigation.navigate('friendsPage', { selectedIndex: 1 });
    } else if (notification.type == 'FOLLOW_REQ') {
      navigation.navigate('otherProfile', {
        userId: notification.senderId,
      });

    } else if (notification.type == 'LIKE_POST' || notification.type == 'SHARE_POST' || notification.type == 'COMMENT_POST') {
      firestore()
        .collection('Posts')
        .where('__name__', '==', notification.postId).get()
        .then((res) => {
          if (res.docs.length > 0) {
            const temp = res.docs.map((user) => ({ ...user.data() }));
            const tempArr = res.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            navigation.navigate('SinglePost', {
              postData: { data: tempArr[0] },
              userId: userId,
              navigation: navigation
            })
          }
        });
    } else if (notification.type == 'MOVEMENT_INVITE') {
      const jumpToAction = TabActions.jumpTo('Activism', {});
      navigation.dispatch(jumpToAction);
      DeviceEventEmitter.emit('showInvite', {});
    } else if (notification.type == 'INVITE_EVENT') {

    }
  }

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <View style={{ paddingTop: vScale(10) }} />
      <FlatList
        data={notifications}
        style={{ flex: 1 }}
        renderItem={({ item, index }) => {
          return (
            <View style={{ marginVertical: 10, justifyContent: 'center' }}>
              <TouchableOpacity
                onPress={() => { onNotificationPress(item) }}
                style={styles.row}>
                {
                  <RoundImage
                  userId={item.senderId}
                  imageUrl={item.profileUrl}
                  displayName={item.displayName}
                  size={50}
                />
                }
                <Text style={[styles.text1, {marginLeft: 8}]}>{item.text}</Text>
              </TouchableOpacity>
              <Text style={[styles.text1, { textAlign: 'right', marginRight: 20, color: '#666', fontSize: 12 }]}>{new Date(item.date * 1000).getDate() + ' ' + getMonth(new Date(item.date * 1000).getMonth())}</Text>
              <View style={{ height: 1, backgroundColor: '#ccc', marginTop: 10 }} />
            </View>
          )

        }}
        ListEmptyComponent={
          <EmptyListText
            title="No recent notifications."
            style={{ height: height * 0.8 }}
            titleStyle={{
              ...tStyle('700', 20, 28, '#777777'),
            }}
          />
        }
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(10),
    marginRight: scale(25),
  },
  text1: {
    fontSize: mScale(16),
    color: '#000',
    marginLeft: scale(4),
  },
});

export default RecentNotifications;

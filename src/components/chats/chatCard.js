import React, {useEffect, useState} from 'react';
import {
  TouchableOpacity,
  Image,
  Text,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import firestore from '@react-native-firebase/firestore';
import RoundImage from '../roundImage';
import {vScale} from '../../configs/size';
import {Icon} from 'react-native-elements';

const {width} = Dimensions.get('window');

const ChatCard = ({friendId, lastMessage, chatId, navigation}) => {
  const uid = auth().currentUser?.uid;

  const [loading, setLoading] = useState(true);
  const [hasError, sethasError] = useState(false);
  const [userDetails, setUserDetails] = useState();

  // console.log('friendId', friendId);

  useEffect(() => {
    setLoading(true);
    firestore()
      .collection('Users')
      .doc(friendId)
      .get()
      .then((snap) => {
        if (snap.exists) {
          // console.log('snap.data', snap.data());
          setUserDetails(snap.data());
        } else {
          sethasError(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log('errrororor', err);
        setLoading(false);
        sethasError(true);
      });
  }, []);

  // const shopperDetails = userDetails.find((user) => user.id !== uid) || {};
  // const unreadNum = unreadCount[uid];

  const lastTextTS = moment(lastMessage?.createdAt);

  const timeToShow = moment().isSame(lastTextTS, 'date')
    ? lastTextTS.format('LT')
    : lastTextTS.format('ll');

  if (loading || hasError) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        navigation.navigate('SingleChat', {
          chatId,
          friendId: {
            userId: friendId,
            displayName: userDetails.displayName,
            profileUrl: userDetails.profileUrl,
          },
        });
      }}>
      <RoundImage
        displayName={userDetails.displayName}
        imageUrl={userDetails.profileUrl}
        size={40}
      />
      <View style={styles.column1}>
        <Text style={styles.name} numberOfLines={1}>
          {userDetails.displayName}
        </Text>
        {lastMessage.message ? (
          <Text style={styles.lastText} numberOfLines={2}>
            {lastMessage.message}
          </Text>
        ) : (
          <Icon
            name="image"
            type="Ionicon"
            size={vScale(18)}
            style={{alignSelf: 'flex-start'}}
            color={'#999999'}
          />
        )}
      </View>
      <View style={styles.column2}>
        <Text style={styles.time}>{timeToShow}</Text>
        {/* {unreadNum > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{unreadNum}</Text>
          </View>
        )} */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    height: 90,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 20,
    flex: 5,
  },
  name: {
    fontFamily: 'Lato-Regular',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 19.2,
    color: '#111111',
  },
  lastText: {
    fontFamily: 'Lato-Regular',
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 14,
    color: '#999999',
  },
  time: {
    fontFamily: 'Lato-Regular',
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 14,
    color: '#999999',
  },
  badgeContainer: {
    height: 20,
    width: 'auto',
    minWidth: 20,
    borderRadius: 5,
    backgroundColor: '#F53333',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: 'Lato-Regular',
    fontWeight: '600',
    fontSize: 10,
    lineHeight: 14,
    color: '#FFFFFF',
  },
  column1: {
    justifyContent: 'flex-start',
    height: 36,
    // width: '50%',
    marginLeft: 15,
    flex: 3,
  },
  column2: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 50,
    flex: 1,
  },
  avatarContainer: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#011F5B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default ChatCard;

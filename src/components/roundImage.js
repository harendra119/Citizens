import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Avatar } from 'react-native-elements';
import { scale } from '../configs/size';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { renderInitials } from '../screens/activism/ActivismDetails';
import FastImage from 'react-native-fast-image';

import firestore from '@react-native-firebase/firestore';

const RoundImage = ({ imageUrl, displayName, userId, size = wp(10), style }) => {
  const [profilepic, setProfilepic] = useState('');
  useEffect(() => {
    firestore()
      .collection('Users')
      .doc(userId)
      .get()
      .then((snap) => {
        var data = snap.data()?.profileUrl;
        if (data) {
          setProfilepic(data)

        } else {
          setProfilepic('')
        }
      }).catch((err) => {
        setProfilepic('')
      })
  }, []);

  if (userId) {
    if (profilepic) {
      return <FastImage
        style={{
          height: size,
          width: size,
          borderRadius: size / 2
        }}
        source={{ uri: profilepic }}
        resizeMode={'cover'}
      />;
    } else {
      return <View
      style={[
        styles.avatar,
        size && { height: size, width: size, borderRadius: size / 2 },
        style,
        { backgroundColor: '#000' }
      ]}>
      <Text style={{ color: 'white' }}>{renderInitials(displayName)}</Text>
    </View>
    }
  }
  else if (imageUrl) {
    return <FastImage
      style={{
        height: size,
        width: size,
        borderRadius: size / 2
      }}
      source={{ uri: imageUrl }}
      resizeMode={'cover'}
    />
  } else {
    return <View
      style={[
        styles.avatar,
        size && { height: size, width: size, borderRadius: size / 2 },
        style,
        { backgroundColor: '#000' }
      ]}>
      <Text style={{ color: 'white', textAlign: 'center' }}>{renderInitials(displayName)}</Text>
    </View>
  };
};

export default RoundImage;

const styles = StyleSheet.create({
  avatar: {
    height: scale(30),
    width: scale(30),
    borderRadius: scale(30),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d9d9d9',
    padding: 0,
    margin: 0,
  },
});

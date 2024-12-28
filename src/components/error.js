import React from 'react';
import {ActivityIndicator, View, Text} from 'react-native';

const Error = ({
  text = 'Something went wrong! Please try again later....',
  height,
  width,
}) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height,
        width,
      }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '400',
          color: '#797979',
          width: '80%',
          textAlign: 'center',
        }}>
        {text}
      </Text>
    </View>
  );
};

export default Error;

import React from 'react';
import {View, Text, Image, ActivityIndicator} from 'react-native';

const EmptyListLoader = ({size = 'small', style}) => {
  return (
    <View style={{justifyContent: 'center', alignItems: 'center', ...style}}>
      <ActivityIndicator size={size} color={'blue'} />
    </View>
  );
};

export default EmptyListLoader;

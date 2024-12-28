import React from 'react';
import {ActivityIndicator, View} from 'react-native';

const Loader = ({size = 'small'}) => {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size={size} />
    </View>
  );
};

export default Loader;

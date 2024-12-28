import React from 'react';
import {View, Text, Image} from 'react-native';

const EmptyListText = ({
  title = 'No results found.',
  style = {},
  titleStyle = {},
  img,
  imgStyle,
}) => {
  return (
    <View style={{justifyContent: 'center', alignItems: 'center', ...style}}>
      {img && <Image source={img} style={imgStyle} resizeMode="contain" />}
      <Text style={titleStyle}>{title}</Text>
    </View>
  );
};

export default EmptyListText;

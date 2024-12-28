import React from 'react';
import {Image, View, StyleSheet} from 'react-native';
import VideoPlayer from './videoPlayer/videoPlayer';
import FastImage from 'react-native-fast-image';
import {scale, vScale} from '../configs/size';
import Video from 'react-native-video';

const Media = ({type, uri, focused}) => {
  console.log('uri', uri);

  return type == 'image' ? (
    <FastImage
      style={[
        {
          height: vScale(540),
          width: scale(356),
          backgroundColor: '#000000',
        },
      ]}
      source={{uri}}
      resizeMode={'contain'}
    />
  ) : type == 'video' ? (
    <Video
      source={{uri}} // Can be a URL or a local file.
      onLoadStart={() => {
        console.log('loading started');
      }}
      muted={false}
      disableBack={true}
      // onLoadStart={(obj) => {
      //   console.log(obj);
      // }}
      onReadyForDisplay={() => {
        console.log('ready');
      }}
      //   onEnterFullscreen={this.clickEventListener}
      paused={true}
      controlTimeout={30000}
      showOnStart={true}
      resizeMode={'contain'}
      volumeWidth={scale(360) * 0.4}
      style={[
        {
          height: vScale(540),
          width: scale(356),
          backgroundColor: '#000000',
        },
      ]}
    />
  ) : null;
};

export default Media;

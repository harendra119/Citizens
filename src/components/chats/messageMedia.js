import React from 'react';
import {View} from 'react-native';
import Image from 'react-native-fast-image';
import {scale, vScale} from '../../configs/size';
import {Icon} from 'react-native-elements';
import {tStyle} from '../../configs/textStyle';

const MessageMedia = ({assets}) => {
  console.log('assets', assets);

  const renderAsset = (url, type, width, extraMedia) => {
    return type == 'image'
      ? renderImage(url, width, extraMedia)
      : renderVideo(width, extraMedia);
  };

  const renderImage = (url, width, extraMedia) => (
    <View
      style={{
        borderWidth: 1,
        borderColor: 'green',
        width,
        marginBottom: vScale(10),
      }}>
      <Image
        source={{uri: url}}
        style={{height: vScale(300), width}}
        resizeMode="cover"
      />
      {extraMedia ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
          }}>
          <Text style={tStyle('800', vScale(20), vScale(30), '#ffffff')}>
            + {extraMedia}
          </Text>
        </View>
      ) : null}
    </View>
  );

  const renderVideo = (width, extraMedia) => (
    <View
      style={{
        height: vScale(300),
        width,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'green',
        marginBottom: vScale(10),
      }}>
      <Icon
        name="play-arrow"
        type="Ionicon"
        size={scale(20)}
        color={'#ffffff'}
      />
      {extraMedia ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
          }}>
          <Text style={tStyle('800', vScale(20), vScale(30), '#ffffff')}>
            + {extraMedia}
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View>
      {assets.length >= 2 ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          {renderAsset(assets[0].uri, assets[0].type, scale(100))}
          {renderAsset(
            assets[0].uri,
            assets[0].type,
            scale(100),
            assets.length - 2,
          )}
        </View>
      ) : (
        renderAsset(assets[0].uri, assets[0].type, scale(200))
      )}
    </View>
  );
};

export default MessageMedia;

import React, {useState} from 'react';
import {Dimensions, StyleSheet, View, Text} from 'react-native';
import FastImage from 'react-native-fast-image';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import VideoPlayer from 'react-native-video-controls';
import {scale, vScale} from '../configs/size';
import Media from './media';
import PostAssets from './postAssets';

const {width, height} = Dimensions.get('window');

const AssetCarousel = ({content, focused, useMedia}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderItem = ({item, index}) => {
    return useMedia ? (
      <Media {...item} focused={index !== activeIndex} />
    ) : (
      <View>
        <PostAssets
          content={[item]}
          width={scale(356)}
          paused={index != activeIndex}
          disableTouch={true}
          focused={focused}
        />
      </View>
    );
  };

  return (
    <>
      <Carousel
        data={content}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}`}
        containerCustomStyle={{flexGrow: 0}}
        horizontal
        itemWidth={scale(356)}
        sliderWidth={scale(356)}
        slideStyle={{
          flex: 1,
          backgroundColor: '#ffffff',
          justifyContent: 'center',
        }}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onSnapToItem={(idx) => {
          setActiveIndex(idx);
        }}
      />
      <Pagination
        dotsLength={content.length}
        activeDotIndex={activeIndex}
        containerStyle={{
          position: 'absolute',
          bottom: vScale(0),
          alignSelf: 'center',
          //   backgroundColor: 'gray',
          justifyContent: 'center',
        }}
        dotStyle={{
          width: 10,
          height: 10,
          borderRadius: 5,
          marginHorizontal: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          borderWidth: 1,
        }}
        inactiveDotStyle={
          {
            // Define styles for inactive dots here
          }
        }
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    </>
  );
};

export default AssetCarousel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 0,
    marginHorizontal: 0,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  imageContent: {
    margin: 1,
    flex: 1,
    // backgroundColor:'red'
  },
  imageContent1: {
    margin: 1,
    width: '100%',
  },
  imageContent2: {
    margin: 1,
    width: '50%',
  },
  imageContent3: {
    margin: 1,
    width: '33.33%',
  },
  image: {
    width: '100%',
    height: 200,
  },
  //overlay efect
  overlayContent: {
    flex: 1,
    position: 'absolute',
    zIndex: 100,
    right: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontSize: 50,
    color: '#ffffff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 139, 1)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  buttonCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, .2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

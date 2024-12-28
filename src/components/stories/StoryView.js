import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  Animated,
  Image,
  Dimensions,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {Avatar} from 'react-native-elements';
import {SafeAreaView} from 'react-native-safe-area-context';
import Carousel from 'react-native-snap-carousel';
import Icon from 'react-native-vector-icons/FontAwesome';
import {mScale, scale, vScale} from '../../configs/size';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import Video from 'react-native-video';
import {useSelector} from 'react-redux';
import RoundImage from '../roundImage';

const {height, width} = Dimensions.get('window');

const DefaultDuration = 5000;

const StoryView = ({mediaList, user, lastUpdatedAt, closeModal, title, id}) => {
  const sliderRef = useRef();

  const numMedia = mediaList.length;
  const barWidth = (width * 0.9) / numMedia - scale(6);
  const [idx, setidx] = useState(0);
  const [duration, setDuration] = useState(DefaultDuration);
  const [progressBarWidth, setProgressBarWidth] = useState(
    new Animated.Value(0),
  );
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [isReported, setIsReported] = useState(false);

  const userInfo = useSelector((state) => state.user.userProfile);
  const myId = userInfo?.userId;
  const userId = user?.id;

  const startAnimation = () => {
    if (loaderVisible) {
      setLoaderVisible(false);
    }
    Animated.timing(progressBarWidth, {
      duration: duration,
      toValue: barWidth,
      //   useNativeDriver: false,r
    }).start((result) => {
      if (result?.finished === true) {
        if (idx + 1 == numMedia) {
          closeModal();
          return;
        }
        if (duration != DefaultDuration) {
          setDuration(DefaultDuration);
        }
        setidx(idx + 1);
        sliderRef.current.snapToNext(true);
        setProgressBarWidth(new Animated.Value(0));
      }
    });
  };

  const renderMedia = ({item, index}) => {
    console.log(index, idx);
    return (
      <View style={{flex: 1}}>
        {item.type == 'image' ? (
          <Image
            source={{uri: item.uri}}
            style={{width, height: height}}
            resizeMode="contain"
            onLoadEnd={startAnimation}
          />
        ) : (
          <>
            <Video
              onLoadStart={() => {
                setLoaderVisible(true);
              }}
              onLoad={({duration}) => {
                console.log('duration', duration);
                setDuration(duration * 1000);
              }}
              onProgress={({
                currentTime,
                playableDuration,
                seekableDuration,
              }) => {
                // console.log('currentTime', currentTime);
                // console.log(playableDuration);
                // console.log(seekableDuration);
              }}
              bufferConfig={{
                minBufferMs: 10000,
                maxBufferMs: 15000,
              }}
              onPlaybackStalled={() => {
                console.log('stalled');
              }}
              selectedVideoTrack={{
                type: 'resolution',
                value: 720,
              }}
              paused={index !== idx ? true : false}
              // onP
              source={{uri: item.uri}}
              style={{width, height}}
              resizeMode="contain"
              onReadyForDisplay={startAnimation}
              controls={false}
            />
            {loaderVisible && index == idx && (
              <View
                style={{
                  position: 'absolute',
                  top: height * 0.5 - vScale(15),
                  alignSelf: 'center',
                }}>
                <ActivityIndicator size={'large'} color={'blue'} />
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  const reportStoryHandler = () => {
    setIsReported(true);
    try {
      const postRef = firestore().collection('Stories').doc(id);
      const reportRef = postRef.collection('Reports').doc(myId);
      reportRef.get().then((snap) => {
        if (snap.exists) alert('You already reported this post.');
        else {
          const body = {
            id: userInfo?.userId,
            profileUrl: userInfo?.profileUrl,
            displayName: userInfo?.displayName,
          };
          const batch = firestore().batch();
          batch.set(reportRef, body);
          batch.update(postRef, {
            isReported: true,
            reportCount: firestore.FieldValue.increment(1),
          });
          batch.commit();
        }
      });
    } catch (err) {
      console.log('err', err);
    }
  };

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: '#000', justifyContent: 'center'}}>
      <Carousel
        ref={sliderRef}
        style={{backgroundColor: 'red', height, width}}
        data={mediaList}
        renderItem={renderMedia}
        itemWidth={width}
        sliderWidth={width}
        // autoplay={true}
      />
      <View
        style={{
          position: 'absolute',
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          top: vScale(30),
        }}>
        {mediaList.map((item, index) => {
          return index == idx ? (
            <View style={{...styles.bar, width: barWidth}}>
              <Animated.View
                style={{
                  ...styles.bar,
                  width: progressBarWidth,
                  backgroundColor: 'red',
                }}
              />
            </View>
          ) : index < idx ? (
            <View
              style={{...styles.bar, width: barWidth, backgroundColor: 'red'}}
            />
          ) : (
            <View style={{...styles.bar, width: barWidth}} />
          );
        })}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          position: 'absolute',
          top: vScale(50),
          left: scale(20),
        }}>
        <Pressable onPress={closeModal}>
          <Icon name={'arrow-left'} size={mScale(20)} color={'#fff'} />
        </Pressable>
        <RoundImage
          imageUrl={user.profileUrl}
          displayName={user.displayName}
          style={{marginHorizontal: scale(9)}}
        />
        <View>
          <Text style={styles.displayName}>{user.displayName}</Text>
          <Text style={styles.lastUpdatedAt}>
            {moment(lastUpdatedAt).format('LLL')}
          </Text>
        </View>
      </View>
      {title && (
        <View
          style={{
            position: 'absolute',
            alignSelf: 'center',
            width: width * 0.8,
            bottom: vScale(80),
          }}>
          <Text style={{...styles.displayName, textAlign: 'center'}}>
            {title}
          </Text>
        </View>
      )}
      {myId != userId && (
        <TouchableOpacity style={styles.report} onPress={reportStoryHandler}>
          <Text style={{color: '#FFF'}}>
            {isReported ? 'Reported' : 'Report'}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  displayName: {
    color: '#ffffff',
    fontSize: mScale(14),
    fontWeight: '600',
  },
  lastUpdatedAt: {
    color: '#ffffff',
    fontSize: mScale(12),
    fontWeight: '600',
  },
  bar: {
    height: vScale(5),
    marginRight: scale(6),
    backgroundColor: '#d9d9d9',
    borderRadius: mScale(10),
  },
  report: {
    position: 'absolute',
    top: vScale(100),
    right: scale(10),
    borderWidth: 1,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: vScale(4),
    borderRadius: scale(8),
  },
});

export default StoryView;

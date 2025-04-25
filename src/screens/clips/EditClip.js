import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {Icon} from 'react-native-elements';
import Video from 'react-native-video';
import {FFmpegKit, ReturnCode} from 'ffmpeg-kit-react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import DocumentPicker from 'react-native-document-picker';
import Sound, {setCategory} from 'react-native-sound';
import {CachesDirectoryPath} from 'react-native-fs';

import {vScale, mScale, scale} from '../../configs/size';
import moment from 'moment';

const EditClip = ({navigation, route}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [videoStartTime, setVideoStartTime] = useState(0);
  const [videoEndTime, setVideoEndTime] = useState(0);
  const [videoPaused, setVideoPaused] = useState(true);
  const [audioPicked, setAudioPicked] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [audioStartTime, setAudioStartTime] = useState(0);
  const [audioEndTime, setAudioEndTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [showReplayBtn, setShowReplayBtn] = useState(false);

  const videoFile = route.params?.videoFile;
  const playerRef = useRef(null);
  Sound.setCategory('Playback');
  var soundRef = useRef(null);

  useEffect(() => {
    if (!duration) return;
    if (duration > 15) setVideoEndTime(15);
    else setVideoEndTime(duration);

    return () => {
      setVideoPaused(true);
      if (soundRef) soundRef.current?.release();
    };
  }, [duration]);

  console.log(
    'vid',
    audioStartTime,
    audioEndTime,
    videoEndTime - videoStartTime,
  );

  const getTimeString = (sec) => {
    var hours = Math.floor(sec / 3600);
    var hourStr = hours < 10 ? `0${hours}` : hours.toString();
    var minutes = Math.floor((sec - hours * 3600) / 60);
    var minStr = minutes < 10 ? `0${minutes}` : minutes.toString();
    var seconds = Math.floor(sec - hours * 3600 - minutes * 60);
    var secStr = seconds < 10 ? `0${seconds}` : seconds.toString();
    return `${hourStr}:${minStr}:${secStr}`;
  };

  const trimHadler = async () => {
    setIsEditing(true);
    var timestampVideo = Date.now();
    var timestampAudio = Date.now();
    const videoStart = getTimeString(videoStartTime);
    const videoEnd = getTimeString(videoEndTime);
    const audioStart = getTimeString(audioStartTime);
    const audioEnd = getTimeString(audioEndTime);
    const videoUri =
      Platform.OS == 'ios'
        ? `${CachesDirectoryPath}/${timestampVideo}.mp4`
        : `file:///data/user/0/com.citizens/cache/${timestampVideo}.mp4`;
    var muteVideoUri = '';
    const audioUri =
      Platform.OS == 'ios'
        ? `${CachesDirectoryPath}/${timestampAudio}.mp3`
        : `file:///data/user/0/com.citizens/cache/${timestampAudio}.mp3`;
    var mergedVideoUri = '';
    var thumbnailUri = '';
    var timestampThumbnail = Date.now();
    var tempUri =
      Platform.OS == 'ios'
        ? `${CachesDirectoryPath}/${timestampThumbnail}.jpg`
        : `file:///data/user/0/com.citizens/cache/${timestampThumbnail}.jpg`;
    const videoUrlDecoded = decodeURIComponent(videoFile.path);
    const audioUrlDecoded = decodeURIComponent(audioFile?.fileCopyUri);
    removeAudioHandler();
    setVideoPaused(true);
    FFmpegKit.executeWithArguments([
      '-i',
      videoUrlDecoded,
      '-ss',
      videoStart,
      '-to',
      videoEnd,
      '-async',
      '1',
      '-c',
      'copy',
      videoUri,
    ])
      .then(async (session) => {
        var returnCode = await session.getReturnCode();
        if (ReturnCode.isSuccess(returnCode)) {
          // SUCCESS
          console.log('video success');
        } else if (ReturnCode.isCancel(returnCode)) {
          // CANCEL
          throw Error('error trimming video : task cancelled');
        } else {
          // ERROR
          Alert.alert('Error!', 'Try uploading another video file.');
          throw Error('error trimming video');
        }
      })
      .then(() => {
        return FFmpegKit.executeWithArguments([
          '-i',
          videoUri,
          '-ss',
          '00:00:01',
          '-vframes',
          '1',
          tempUri,
        ]);
      })
      .then(async (session) => {
        var returnCode = await session.getReturnCode();
        if (ReturnCode.isSuccess(returnCode)) {
          // SUCCESS
          thumbnailUri = tempUri;
        }
      })
      .then(() => {
        if (audioFile?.fileCopyUri) {
          var timestampMuted = Date.now();
          muteVideoUri =
            Platform.OS == 'ios'
              ? `${CachesDirectoryPath}/${timestampMuted}.mp4`
              : `file:///data/user/0/com.citizens/cache/${timestampMuted}.mp4`;
          return FFmpegKit.executeWithArguments([
            '-i',
            videoUri,
            '-c:v',
            'copy',
            '-an',
            muteVideoUri,
          ]);
        } else {
          setIsEditing(false);
          navigation.navigate('Play', {uri: videoUri, thumbnailUri,  cityId: route.params?.cityId});
          throw Error('No audio file');
        }
      })
      .then(async (session) => {
        var returnCode = await session.getReturnCode();
        if (ReturnCode.isSuccess(returnCode)) {
          // SUCCESS
          console.log('audio removal: success');
        } else if (ReturnCode.isCancel(returnCode)) {
          // CANCEL
          throw Error('error removing audio : task cancelled');
        } else {
          // ERROR
          throw Error('error removing audio');
        }
      })
      .then(() =>
        FFmpegKit.executeWithArguments([
          '-i',
          audioUrlDecoded,
          '-ss',
          audioStart,
          '-to',
          audioEnd,
          '-async',
          '1',
          '-c',
          'copy',
          audioUri,
        ]),
      )
      .then(async (session) => {
        var returnCode = await session.getReturnCode();
        if (ReturnCode.isSuccess(returnCode)) {
          // SUCCESS
          console.log('audio success');
        } else if (ReturnCode.isCancel(returnCode)) {
          // CANCEL
          console.log('error trimming', returnCode);
          throw Error('error trimming audio : task cancelled');
        } else {
          // ERROR
          Alert.alert('Error!', 'Try uploading another audio file.');
          throw Error('error trimming audio');
        }
      })
      .then(() => {
        var timestamp = Date.now();
        mergedVideoUri =
          Platform.OS == 'ios'
            ? `${CachesDirectoryPath}/${timestamp}.mp4`
            : `file:///data/user/0/com.citizens/cache/${timestamp}.mp4`;
        return FFmpegKit.executeWithArguments([
          '-i',
          muteVideoUri,
          '-i',
          audioUri,
          '-c:v',
          'copy',
          '-c:a',
          'aac',
          mergedVideoUri,
        ]);
      })
      .then(async (session) => {
        var returnCode = await session.getReturnCode();
        if (ReturnCode.isSuccess(returnCode)) {
          // SUCCESS
          console.log('merge succes');
          setIsEditing(false);
          navigation.navigate('Play', {
            uri: mergedVideoUri,
            songName: audioFile?.name ? audioFile.name.split('.mp3')[0] : '',
            thumbnailUri,
            cityId: route.params?.cityId
          });
        } else if (ReturnCode.isCancel(returnCode)) {
          // CANCEL
          throw Error('error merging files : task cancelled');
        } else {
          // ERROR
          throw Error('error merging files');
        }
      })
      .catch((err) => {
        console.log('error', err);
        setIsEditing(false);
      });
  };

  const videoSliderHandler = (values) => {
    var startTime = values[0];
    var endTime = values[1];
    if (endTime == videoEndTime && endTime - startTime >= 15)
      endTime = startTime + 15;
    if (startTime == videoStartTime && endTime - startTime >= 15)
      startTime = endTime - 15;
    setVideoStartTime(startTime);
    setVideoEndTime(endTime);
    playerRef.current?.seek(startTime);
    soundRef.current?.setCurrentTime(audioStartTime);
  };

  const audioSliderHandler = (values) => {
    var startTime = values[0];
    var endTime = values[1];
    var durationAllowed = videoEndTime - videoStartTime;
    if (endTime == audioEndTime) {
      endTime =
        startTime + durationAllowed > audioDuration
          ? audioDuration
          : startTime + durationAllowed;
    }
    if (startTime == audioStartTime) {
      startTime = endTime - durationAllowed < 0 ? 0 : endTime - durationAllowed;
    }
    setAudioStartTime(startTime);
    setAudioEndTime(endTime);
    soundRef.current?.setCurrentTime(startTime);
    playerRef.current?.seek(videoStartTime);
  };

  const pickAudio = async () => {
    try {
      setVideoPaused(true);
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
        allowMultiSelection: false,
        copyTo: 'cachesDirectory',
      });
      if (res[0]?.uri) {
        setAudioFile(res[0]);
        setAudioPicked(true);
        setVideoPaused(false);
      }
    } catch (err) {
      console.log('err', err);
    }
  };

  useEffect(() => {
    if (audioFile && audioFile?.fileCopyUri) {
      console.log('adding audio', audioFile);
      soundRef.current = new Sound(audioFile?.fileCopyUri, null, (err) => {
        if (err) {
          console.log('audio err', err);
          return;
        }
        soundRef.current?.play((success) => {
          if (success) console.log('played successfully');
          else console.log('playback failed');
        });
        const dur = soundRef.current?.getDuration();
        console.log('duration', dur, typeof dur);
        setAudioDuration(dur);
        setAudioStartTime(0);
        var durationAllowed = videoEndTime - videoStartTime;
        if (durationAllowed > dur) setAudioEndTime(dur);
        else setAudioEndTime(durationAllowed);
        playerRef.current?.seek(videoStartTime);
      });
    }
  }, [audioFile]);

  const playPauseHandler = () => {
    if (videoPaused) {
      setVideoPaused(false);
      if (soundRef) soundRef.current?.play();
    } else {
      setVideoPaused(true);
      if (soundRef) soundRef.current?.pause();
    }
  };

  const removeAudioHandler = () => {
    soundRef.current?.pause();
    soundRef.current = null;
    setAudioPicked(false);
    setAudioStartTime(0);
    setAudioEndTime(0);
    setAudioDuration(0);
    setAudioFile(null);
  };

  const replayHandler = () => {
    soundRef.current?.setCurrentTime(audioStartTime);
    soundRef.current?.play();
    playerRef.current?.seek(videoStartTime);
    setVideoPaused(false);
    setShowReplayBtn(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{flex: 1}}
        onPress={playPauseHandler}
        activeOpacity={1}>
        <Video
          ref={playerRef}
          source={{uri: videoFile?.path}}
          onLoad={(data) => setDuration(data.duration)}
          style={styles.video}
          onError={(e) => console.log(e)}
          resizeMode={'cover'}
          repeat={false}
          paused={videoPaused}
          onProgress={({currentTime}) => {
            if (currentTime > videoEndTime) {
              setVideoPaused(true);
              soundRef.current?.pause();
              setShowReplayBtn(true);
            }
          }}
          muted={audioPicked}
        />
      </TouchableOpacity>
      <View style={styles.btmContainer}>
        <View style={styles.shadow} />
        <View style={styles.row}>
          <View style={{marginHorizontal: scale(18)}}>
            <Icon
              type="ionicon"
              name="musical-notes"
              size={vScale(26)}
              color="#FFF"
            />
          </View>
          {audioPicked && audioEndTime > 0 ? (
            <MultiSlider
              values={[audioStartTime, audioEndTime]}
              sliderLength={scale(260)}
              onValuesChangeFinish={audioSliderHandler}
              min={0}
              max={audioDuration}
            />
          ) : (
            <TouchableOpacity onPress={pickAudio}>
              <Text style={styles.text1}>Add Audio</Text>
            </TouchableOpacity>
          )}
          {audioPicked && (
            <TouchableOpacity
              style={{marginLeft: scale(10)}}
              onPress={removeAudioHandler}>
              <Icon
                type="ionicon"
                name="close-circle"
                size={vScale(26)}
                color="#FFF"
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.row}>
          <View style={{marginHorizontal: scale(20)}}>
            <Icon
              type="ionicon"
              name="videocam"
              size={vScale(26)}
              color="#FFF"
            />
          </View>
          {duration > 0 && (
            <MultiSlider
              values={[videoStartTime, videoEndTime]}
              sliderLength={scale(260)}
              onValuesChangeFinish={videoSliderHandler}
              min={0}
              max={duration}
            />
          )}
        </View>
      </View>
      {showReplayBtn && (
        <TouchableOpacity style={styles.replay} onPress={replayHandler}>
          <Icon
            type="ionicon"
            name="refresh-circle"
            size={vScale(50)}
            color="#FFF"
          />
        </TouchableOpacity>
      )}
      {isEditing ? (
        <View style={styles.postBtn}>
          <ActivityIndicator size="small" color="#1e2348" />
        </View>
      ) : (
        <TouchableOpacity style={styles.postBtn} onPress={trimHadler}>
          <Text style={styles.postText}>Next</Text>
          <Icon
            type="ionicon"
            name="arrow-forward"
            size={mScale(18)}
            color="#1e2348"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
  },
  btmContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(5),
  },
  text1: {
    fontSize: mScale(16),
    color: '#FFF',
  },
  shadow: {
    position: 'absolute',
    top: scale(-15),
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#00000040',
    borderTopLeftRadius: mScale(15),
    borderTopRightRadius: mScale(15),
  },
  replay: {
    position: 'absolute',
    top: vScale(320),
    alignSelf: 'center',
    backgroundColor: '#00000080',
    height: vScale(60),
    width: vScale(60),
    borderRadius: vScale(60),
    justifyContent: 'center',
    alignItems: 'center',
  },
  postBtn: {
    position: 'absolute',
    top: vScale(50),
    right: vScale(10),
    backgroundColor: '#FFF',
    borderRadius: mScale(10),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingTop: mScale(4),
    paddingBottom: mScale(2),
  },
  postText: {
    color: '#1e2348',
    fontSize: mScale(20),
    fontWeight: 'bold',
    marginRight: scale(3),
    paddingBottom: mScale(2),
  },
});

export default EditClip;

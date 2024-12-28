import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {
  Camera,
  useCameraDevice,
  useCameraDevices,
} from 'react-native-vision-camera';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';

import {vScale, scale, mScale} from '../../configs/size';

const NewClip = ({navigation, route}) => {
  const [cameraPermission, setCameraPermission] = useState(false);
  const [audioPermission, setAudioPermission] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(0);
  const [cameraType, setCameraType] = useState('back'); // back or front
  const isFocused = useIsFocused();
  const device =  useCameraDevice(cameraType)
  const cameraRef = useRef(null);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  console.log('permissions', cameraPermission, audioPermission);

  const optionVideos = {
    mediaType: 'video',
    videoQuality: 'high',
  };

  useEffect(() => {
    if (isFocused) {
      setCameraType('back');
      setTimer(0);
    } else {
      
    }
  }, [isFocused, cameraPermission, audioPermission]);

  const flipCamHandler = async () => {
    if (cameraType == 'front') setCameraType('back');
    else setCameraType('front');
  };

  const getCameraPermission = useCallback(() => {
    Camera.getCameraPermissionStatus()
      .then((res) => {
        console.log('1', res);
        if (res == 'authorized' || res == 'granted') return true;
        else return Camera.requestCameraPermission();
      })
      .then((res) => {
        console.log('2', res);
        if (res === true || res == 'authorized' || res == 'granted') setCameraPermission(true);
        else alert('Please provide camera permission');
      })
      .catch((err) => console.log('err', err));
   
  }, [navigation, route]);

  useFocusEffect(getCameraPermission);

  const getAudioPermission = useCallback(() => {
    Camera.getMicrophonePermissionStatus()
      .then((res) => {
        console.log('3', res);
        if (res == 'authorized' || res == 'granted') return true;
        else return Camera.requestMicrophonePermission();
      })
      .then((res) => {
        console.log('4', res);
        if (res === true || res == 'authorized' || res == 'granted') setAudioPermission(true);
        else alert('Please provide audio permission');
      })
      .catch((err) => console.log('err', err));
  }, [navigation, route]);

  useFocusEffect(getAudioPermission);

  const startRecording = () => {
    setIsRecording(true);
    intervalRef.current = setInterval(
      () => setTimer((timer) => timer + 1),
      1000,
    );
    cameraRef.current?.startRecording({
      fileType: 'mp4',
      onRecordingFinished: (video) => {
        setIsRecording(false);
        navigation.navigate('EditClip', {videoFile: video});
      },
      onRecordingError: (error) => console.error(error),
    });
    timeoutRef.current = setTimeout(stopRecording, 15000);
  };

  const stopRecording = () => {
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
    cameraRef.current.stopRecording();
  };

  const videoPicker = async () => {
    try {
      const response = await DocumentPicker.pick({
        type: [DocumentPicker.types.video],
        allowMultiSelection: false,
        copyTo: 'cachesDirectory',
      });
      if (response[0]?.uri) {
        const videoFile = {
          path: response[0]?.fileCopyUri,
        };
        navigation.navigate('EditClip', {videoFile});
      }
    } catch (err) {
      console.log('err', err);
    }
  };

  return cameraPermission && device  ? (
    <View style={{flex: 1}}>
      {isFocused && (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={device != null}
          video={true}
          audio={true}
          photo={false}
        />
      )}
      <View style={styles.btmContainer}>
        <TouchableOpacity activeOpacity={1} onPress={videoPicker}>
          <Icon type="ionicon" name="image" size={vScale(26)} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={isRecording ? stopRecording : startRecording}>
          <View style={styles.insideCircle}>
            {timer ? <Text style={styles.timerText}>{timer}</Text> : null}
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={flipCamHandler}>
          <Icon
            type="ionicon"
            name="camera-reverse"
            size={vScale(26)}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btmContainer: {
    position: 'absolute',
    bottom: vScale(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: scale(25),
  },
  button: {
    width: vScale(70),
    height: vScale(70),
    borderRadius: vScale(70),
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  insideCircle: {
    width: vScale(60),
    height: vScale(60),
    borderRadius: vScale(60),
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: '#1e2348',
    fontSize: mScale(30),
    fontWeight: 'bold',
  },
});

export default NewClip;

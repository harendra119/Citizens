import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView
} from 'react-native';
import {Icon} from 'react-native-elements';
import Video from 'react-native-video';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {useSelector} from 'react-redux';
import {launchImageLibrary} from 'react-native-image-picker';

import {vScale, mScale, scale} from '../../configs/size';

const Play = ({navigation, route}) => {
  const [paused, setPaused] = useState(true);
  const [caption, setCaption] = useState('');
  const [songName, setSongName] = useState(route.params?.songName || '');
  const [showSongInput, setShowSongInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [thumbnailUri, setThumbnailUri] = useState(route.params?.thumbnailUri);

  const videoPath = route.params?.uri;
  const user = useSelector((state) => state.user.userProfile);

  const pickThumbnail = async () => {
    const optionImages = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
        privateDirectory: true,
      },
      mediaType: 'photo',
      quality: 1,
      allowsEditing: true,
    };
    launchImageLibrary(optionImages, async (response) => {
      if (response.didCancel) {
      } else if (response.error) {
      } else if (response.customButton) {
        //console.log('User tapped custom button: ', response.customButton);
      } else {
        const url = response.assets[0].uri;
        setThumbnailUri(url);
      }
    });
  };

  const postOnCity = async () => {
    const userDoc = await firestore().collection('Users').doc(user?.userId).get();
    const followedCity = userDoc.data()?.followed_city;
    navigation.navigate('ActivismDetails', {
     cityId: followedCity
    });
  } 


  const postClip = async () => {
    
    try {
      setShowSongInput(false);
      setIsUploading(true);
      let date = new Date();

      const reference = storage().ref(
        `Clips/${date.getTime() + 'CitizensClip'}`,
      );
      await reference.putFile(videoPath);
      const url = await reference.getDownloadURL();

      const thumbnailRef = storage().ref(
        `images/${date.getTime() + 'CitizensClipThumbnail'}`,
      );
      await thumbnailRef.putFile(thumbnailUri);
      const thumbDownloadUri = await thumbnailRef.getDownloadURL();

      let payLoad = {
        userId: user?.userId || '',
        userName: user?.displayName || '',
        userImage: user?.profileUrl || null,
        caption: caption,
        songName: songName,
        videoUri: url,
        thumbnailUri: thumbDownloadUri,
        date: new Date().getTime(),
        activityCount: 0,
        isShared: false,
        type: 'Clips',
        isHidden: false,
        cityId: route.params?.cityId || ''
      };
      await firestore().collection('Clips').add(payLoad);
      if (route.params?.cityId) {
        postOnCity();
      } else 
        navigation.navigate('ClipList');
    } catch (err) {
      console.log('err', err);
      setIsUploading(false);
    }
  };

  return (
     <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
    <TouchableWithoutFeedback
    style={styles.container}
    onPress={() => Keyboard.dismiss()}
    >
    <View style={styles.container}>
      <TouchableOpacity
        style={{flex: 1}}
        onPress={() => setPaused(!paused)}
        activeOpacity={1}>
        <Video
          source={{uri: videoPath}}
          style={styles.video}
          onError={(e) => console.log(e)}
          resizeMode={'cover'}
          repeat={true}
          paused={paused}
        />
      </TouchableOpacity>
      {isUploading ? (
        <View style={styles.postBtn}>
          <ActivityIndicator size="small" color="#1e2348" />
        </View>
      ) : (
        <TouchableOpacity style={styles.postBtn} onPress={postClip}>
          <Text style={styles.postText}>Post</Text>
          <Icon
            type="ionicon"
            name="arrow-forward"
            size={mScale(18)}
            color="#1e2348"
          />
        </TouchableOpacity>
      )}
      <View style={styles.btmContainer}>
        <TouchableOpacity
          style={styles.row}
          activeOpacity={1}
          onPress={pickThumbnail}>
          <Icon type="ionicon" name="image" size={mScale(24)} color="#FFF" />
          <View style={styles.thumbWrapper}>
            <Image
              source={{uri: thumbnailUri}}
              style={{
                height: vScale(80),
                width: vScale(80),
              }}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
        <View style={styles.row}>
          {!showSongInput && (
            <Icon
              type="ionicon"
              name="musical-notes"
              size={mScale(24)}
              color="#FFF"
            />
          )}
          {showSongInput ? (
            <View style={styles.songInput}>
              <TextInput
                value={songName}
                onChangeText={(val) => setSongName(val)}
                placeholder={songName}
                placeholderTextColor="#FFF"
                style={styles.inputText}
                editable={!isUploading}
              />
            </View>
          ) : (
            <Text style={styles.text1}>{songName || 'Add Song Name'}</Text>
          )}
          <TouchableOpacity onPress={() => setShowSongInput(!showSongInput)}>
            <Icon
              type="ionicon"
              name={showSongInput ? 'checkmark' : 'pencil'}
              size={showSongInput ? mScale(24) : mScale(18)}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <TextInput
              value={caption}
              onChangeText={(val) => setCaption(val)}
              placeholder="Add a caption..."
              placeholderTextColor="#FFF"
              multiline={true}
              numberOfLines={2}
              style={styles.inputText}
              editable={!isUploading}
            />
          </View>
        </View>
      </View>
    </View>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    backgroundColor: 'black',
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
  btmContainer: {
    position: 'absolute',
    bottom: 0,
    marginBottom: vScale(10),
    paddingHorizontal: scale(10),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vScale(15),
  },
  inputContainer: {
    borderRadius: scale(10),
    borderColor: '#FFF',
    borderWidth: 1,
    backgroundColor: '#00000095',
    width: '100%',
  },
  inputText: {
    fontSize: mScale(15),
    color: '#FFF',
  },
  text1: {
    fontSize: mScale(18),
    color: '#FFF',
    marginHorizontal: scale(10),
  },
  songInput: {
    borderRadius: scale(10),
    borderColor: '#FFF',
    borderWidth: 1,
    backgroundColor: '#00000095',
    width: '90%',
    marginRight: scale(10),
  },
  thumbWrapper: {
    height: vScale(80),
    width: vScale(80),
    borderRadius: scale(8),
    marginLeft: scale(10),
    overflow: 'hidden',
  },
});

export default Play;

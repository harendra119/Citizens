import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {mScale, scale, vScale} from '../configs/size';
import AssetCarousel from './postAssetsCarousel';
import storage from '@react-native-firebase/storage';
import errorLog, {defaultAlert} from '../Constants/errorLog';

const MessagePreview = ({
  assets,
  closeModal,
  chatId,
  sendMessageHandler,
  viewOnly,
}) => {
  const [input, setInput] = useState();
  const [kHeight, setkHeight] = useState(0);
  const [loading, setLoading] = useState(false);

  console.log('assets1', assets);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      'keyboardWillShow',
      (event) => {
        const keyboardHeight = event.endCoordinates.height;
        setkHeight(keyboardHeight);
      },
    );

    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      setkHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const uploadMediaToStorage = async () => {
    setLoading(true);
    let downloadUrl = [];
    for (let i = 0; i < assets.length; i++) {
      let date = new Date();

      try {
        const reference = storage().ref(
          `Chats/${chatId}/${assets[i].type}/${
            assets[i].fileName + date.getTime()
          }`,
        );

        await reference.putFile(`${assets[i].uri}`);
        const url = await storage()
          .ref(
            `Chats/${chatId}/${assets[i].type}/${
              assets[i].fileName + date.getTime()
            }`,
          )
          .getDownloadURL();
        downloadUrl.push({
          uri: url,
          type: assets[i].type,
        });
      } catch (err) {
        setLoading(false);
        console.log('error', err);
        return null;
      }
    }
    await sendMessageHandler(input, downloadUrl);
    setLoading(false);
    closeModal();
    // return downloadUrl;
  };

  const postMessage = () => {};

  return (
    <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.8)'}}>
      <TouchableOpacity
        style={{
          alignSelf: 'flex-start',
          paddingLeft: scale(20),
          marginVertical: vScale(8),
        }}
        onPress={closeModal}>
        <Icon
          type="Ionicon"
          name="arrow-back"
          size={scale(30)}
          color="#ffffff"
        />
      </TouchableOpacity>
      <View
        style={{
          height: vScale(540),
          paddingLeft: scale(9.5),
          width: scale(375),
          backgroundColor: '#000000',
        }}>
        <AssetCarousel content={assets} focused={false} useMedia={true} />
      </View>
      {!viewOnly ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            borderColor: '#1e2348',
            borderWidth: 1,
            borderRadius: mScale(15),
            position: 'absolute',
            bottom: Platform.OS == 'ios' ? vScale(15) + kHeight : vScale(15),
            marginTop: vScale(130),
            paddingHorizontal: scale(10),
            backgroundColor: '#ffffff',
            height: vScale(40),
          }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Your thoughts ..."
            style={{width: scale(300)}}
          />
          <TouchableOpacity
            style={{
              height: scale(30),
              width: scale(30),
              borderRadius: scale(15),
              backgroundColor: 'green',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={uploadMediaToStorage}>
            <Icon
              name="caret-forward"
              type="ionicon"
              size={vScale(22)}
              color="white"
            />
          </TouchableOpacity>
        </View>
      ) : null}
      {loading ? (
        <View style={styles.loadingCont}>
          <ActivityIndicator size={'large'} color={'#ffffff'} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingCont: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
});

export default MessagePreview;

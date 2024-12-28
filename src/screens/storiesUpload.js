import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  TextInput,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {ListItem, Icon, Button} from 'react-native-elements';
import {connect} from 'react-redux';
import Header from '../components/header';
import Drawer from '../components/drawer';
import Textarea from 'react-native-textarea';
import {addStpries} from '../backend/apis';
import {launchImageLibrary} from 'react-native-image-picker';
import ModalDropdown from 'react-native-modal-dropdown';
import Video from 'react-native-video';
import {FlatGrid} from 'react-native-super-grid';
import {utils} from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
// import {createThumbnail} from 'react-native-create-thumbnail';
import {mScale, scale, vScale} from '../configs/size';
import FastImage from 'react-native-fast-image';

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
const optionVideos = {
  mediaType: 'video',
  videoQuality: 'high',
  durationLimit: 30,
};
class UploadStories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      videoUrl: '',
      imageUrl: '',
      privacy: 'Public',
      videoDuration: 0,
      storyContent: [],
      loader: false,

      //'content://media/external/video/media/2404'
    };
    this.privacy = React.createRef();
  }

  uploadImage = () => {
    console.log('wiwiwiwi');
    launchImageLibrary(optionImages, async (response) => {
      console.log('response', response);
      if (response.didCancel) {
      } else if (response.error) {
        console.log('response', response.errorMessage);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = {uri: response.uri};

        let tempArray = this.state.storyContent;
        console.log(response.assets[0].uri);

        tempArray.push({
          url: response.assets[0].uri,
          fileName: response.assets[0].fileName,
          duration: 7,
          type: 'image',
        });
        this.setState({
          imageUrl: response.assets[0].uri,
          videoUrl: '',
          videoDuration: 0,
          storyContent: tempArray,
        });
      }
    });
  };
  uploadVideo = () => {
    launchImageLibrary(optionVideos, (response) => {
      if (response.didCancel) {
      } else if (response.error) {
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        console.log(response, '=-=-=-');
        const source = {response};

        if (
          response.assets[0].duration <= 60 &&
          response.assets[0].duration >= 15
        ) {
          let tempArray = this.state.storyContent;
          tempArray.push({
            url: response.assets[0].uri,
            fileName: response.assets[0].fileName,
            duration: response.assets[0].duration || 5,
            type: 'video',
          });
          this.setState(
            {
              videoUrl: response.assets[0].uri,
              imageUrl: '',
              videoDuration: response.assets[0].duration,
              storyContent: tempArray,
            },
            async () => {
              //       await _Video.compress(
              //         response.assets[0].uri,
              //         {
              //             compressionMethod: 'auto',
              //             maxSize:20000
              //         },
              //         (progress) => {
              //             console.log(progress)
              //             //   if (backgroundMode) {
              //             //     console.log('Compression Progress: ', progress);
              //             //   } else {
              //             //     setCompressingProgress(progress);
              //             //   }
              //         }
              //     ).catch((error) => {
              //         console.log(error)
              //     })
            },
          );
        } else {
          alert('A Stories should be 15 - 60 seconds long!');
        }
      }
    });
  };

  uploadMediaToStorage = async (mediaList) => {
    let downloadUrl = [];
    for (let i = 0; i < mediaList.length; i++) {
      let date = new Date();
      const reference = storage().ref(
        `Post_Storage/${mediaList[i].type}/${
          mediaList[i].fileName + date.getTime() + 'citizensPost'
        }`,
      );

      try {
        await reference.putFile(`${mediaList[i].url}`);
        const url = await storage()
          .ref(
            `Post_Storage/${mediaList[i].type}/${
              mediaList[i].fileName + date.getTime() + 'citizensPost'
            }`,
          )
          .getDownloadURL();
        downloadUrl.push({
          uri: url,
          type: mediaList[i].type,
          duration: mediaList[i].duration,
        });
      } catch (err) {
        console.log('error', err);
        return null;
      }
    }
    return downloadUrl;
  };

  getPreviewImage = async (mediaList) => {
    // let images = mediaList.filter((item) => item.type == 'image');
    // if (images.length == 0) {
    //   try {
    //     const res = await createThumbnail({
    //       url: mediaList[0].uri,
    //       timeStamp: 1000,
    //     });
    //     const previewList = await this.uploadMediaToStorage([
    //       {url: res.path, type: 'video', duration: mediaList[0].duration},
    //     ]);
    //     if (!previewList) {
    //       console.log('emptylist');
    //       return null;
    //     }
    //     console.log(previewList);
    //     return previewList[0].uri;
    //   } catch (error) {
    //     console.log('error while generating thumbnail', error);
    //     return null;
    //   }
    // } else {
    //   return images[0].uri;
    // }
  };

  uploadStories = async (type, content, contentType) => {
    if (this.state.storyContent.length > 0) {
      this.setState({loader: true});

      const mediaList = await this.uploadMediaToStorage(
        this.state.storyContent,
      );
      if (!mediaList) {
        this.setState({loader: false, storyContent: []});
       // alert('Something went wrong! Please try again later.');
        return;
      }

      const preview = await this.getPreviewImage(mediaList);
      if (!preview) {
        this.setState({loader: false, storyContent: []});
        alert('Something went wrong! Please try again later.');
        return;
      }

      let payLoad = {
        title: this.state.text == '' ? null : this.state.text,
        user: {
          id: this.props.userId,
          displayName: this.props.displayName,
          profileUrl: this.props.profileUrl,
        },
        preview: preview,
        access: `${this.state.privacy.toLowerCase()}_notHidden`,
        isHidden: false,
        mediaList,
        lastUpdatedAt: new Date().getTime(),
      };

      try {
        console.log('uploading post');
        console.log('payload', this.props.displayName);
        console.log('payload', payLoad);
        await firestore().collection('Stories').add(payLoad);
        console.log('success...');
        this.setState({loader: false, storyContent: []}, () => {
          this.props.navigation.navigate('Home');
        });
      } catch (err) {
        console.log('Error while uploading poll', err);
        alert('Something went wrong! Please try again later.');
      }
    }
  };
  render() {
    const {text, privacy, imageUrl, loader} = this.state;
    const {displayName, username, email} = this.props;
    console.log('displayName', displayName);
    return (
      <ScrollView>
        <View style={[style.container]}>
          <Header navigation={this.props.navigation} otherProfile={false} />
          {/* <Drawer navigation={this.props.navigation} /> */}
          <StatusBar translucent hidden />
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={[style.dropDown, {width: 120, flexDirection: 'row', alignItems: 'center'}]}>
              <ModalDropdown
                options={['Public', 'Friends']}
                dropdownStyle={{
                  width: wp(24),
                  height: Platform.OS == 'ios' ? hp(8) : hp(9.5),
                  marginLeft: 30,
                  marginTop: 8,
                  padding: 0,
                }}
                ref={this.privacy}
                defaultValue={this.state.privacy}
                textStyle={{
                  color: 'gray',
                  width: '100%',
                  fontSize: mScale(16),
                  textAlign: 'center',
                }}
                onSelect={(index, value) => {
                  this.setState({
                    privacy: value,
                  });

                  // this.make(value, index)
                  // this.props.addCompany(value)
                }}
              />
               <Text style={{marginBottom: 10, fontSize: 20, marginRight: 25}}>
             {'⌄'}
            </Text>
            </View>
            <View style={{flex: 1}} />
          {loader ? (
            <ActivityIndicator
              color="#1e2348"
              size={20}
              style={{alignSelf: 'flex-end', marginRight: 20, marginBottom: 20}}
            />
          ) : (
            <Button
              containerStyle={style.buttonCont}
              buttonStyle={style.buttonStyle}
              title="Circulate"
              onPress={() => {
                if (this.state.videoUrl != '') {
                  this.uploadStories('video', this.state.videoUrl, 'video/mp4');
                  // this.uploadStories()
                } else if (this.state.imageUrl != '') {
                  this.uploadStories('image', this.state.imageUrl, 'image/mp4');
                }
                // this.uploadStories()
                //  this.props.navigation.navigate('AccountSetting') }
              }}
            />
          )}
          </View>
          <View style={style.privacyContainer}>
            <Textarea
              containerStyle={style.textareaContainer}
              style={style.textarea}
              onChangeText={(text) => {
                this.setState({text});
              }}
              defaultValue={this.state.text}
              maxLength={300}
              placeholder={'What do you want to share?'}
              placeholderTextColor={'#c7c7c7'}
              underlineColorAndroid={'transparent'}
            />

{this.state.storyContent.length > 0 && (
            <View style={style.videoParent}>
              <FlatList
                horizontal
                scrollEnabled
                data={this.state.storyContent}
                renderItem={({item, index}) => {
                  console.log(index, '=00000');
                  if (item.type == 'video') {
                    return (
                      <View style={[style.mediaCont, {marginRight: 20,  borderRadius: 10}]}>
                        <TouchableOpacity
                          style={style.cancel}
                          onPress={() => {
                            let tempArray = this.state.storyContent;
                            tempArray.splice(index, 1);
                            this.setState({
                              storyContent: tempArray,
                            });
                          }}>
                          <Icon
                            name="close-circle"
                            type="ionicon"
                            size={scale(25)}
                            color="red"
                            style={style.cancelIcon}
                          />
                        </TouchableOpacity>
                        <Video
                          source={{uri: item.url}} // Can be a URL or a local file.
                          ref={(ref) => {
                            this.player = ref;
                          }}
                          muted
                          // controls={true}
                          //  pictureInPicture={true}
                          // playInBackground={true}
                          // Store reference
                          //onBuffer={this.onBuffer}                // Callback when remote video is buffering
                          //  onError={this.videoError}
                          resizeMode="cover" // Callback when video cannot be loaded
                          style={{height: hp(10), width: wp(40),borderRadius: 10}}
                        />
                      </View>
                    );
                  }
                  return (
                    <View style={[style.mediaCont, {marginRight: 20, borderRadius: 10}]}>
                      <TouchableOpacity
                        style={style.cancel}
                        onPress={() => {
                          let tempArray = this.state.storyContent;
                          tempArray.splice(index, 1);
                          this.setState({
                            storyContent: tempArray,
                          });
                        }}>
                        <Icon
                          name="close-circle"
                          type="ionicon"
                          size={scale(25)}
                          color="red"
                          style={style.cancelIcon}
                        />
                      </TouchableOpacity>
                      <FastImage
                        source={{uri: item.url}}
                        resizeMode="cover"
                        style={{height: hp(10), width: wp(40), borderRadius: 10}}>

                        </FastImage>
                    </View>
                  );
                }}
              />
            </View>
          )}
            
          </View>

          <View style={{flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal:20,
    marginTop: 30,
    // backgroundColor:'yellow'
    }}>
            <TouchableOpacity onPress={this.uploadImage}>
              <ListItem 
              containerStyle={{ padding: 7, backgroundColor: 'transparent'}}
              >
                <Icon name="camera" type="entypo" />
              </ListItem>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={this.uploadVideo}>
              <ListItem containerStyle={style.rowIcons}>
                <Icon name="video-camera" type="entypo" />
              </ListItem>
            </TouchableOpacity> */}
          </View>

          
        </View>
      </ScrollView>
    );
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  textareaContainer: {
    height: hp(22),
    width: wp(90),
    padding: 5,
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  textarea: {
    textAlignVertical: 'top', // hack android
    height: 170,
    fontSize: 14,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 30,
  },
  rowIcons: {width: wp(40), padding: 7, backgroundColor: 'transparent'},
  backgroundVideo: {
    position: 'absolute',
    bottom: 0,
    width: wp(100),
    height: hp(45),
  },
  videoParent: {height: hp(50), marginTop: 30},

  privacyContainer: {
    height: hp(38),
    backgroundColor: '#fff',
    alignSelf: 'center',
    elevation: 5,
    width: wp(90),
  },
  dropDown: {
    borderColor: '#000',
    borderWidth: 1,
    width: wp(25),
    marginLeft: scale(20),
    height: vScale(28),
    alignItems: 'center',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    height: vScale(28),
    backgroundColor: 'transparent',
    alignItems: 'center',
    padding: 0,
  },
  buttonCont: {
    backgroundColor: '#1e2348',
    width: wp(30),
    height: vScale(28),
    borderRadius: 30,
    alignSelf: 'flex-end',
    marginTop: hp(2),
    alignItems: 'center',
    marginVertical: 10,
    marginRight: 20,
  },
  mediaCont: {
    width: wp(40),
    height: hp(10),
    overflow: 'visible',
    paddingTop: scale(11.5),
    marginRight: scale(5),
  },
  cancelIcon: {
    marginTop: scale(-1.75),
    marginLeft: scale(-1.75),
  },
  cancel: {
    backgroundColor: '#fff',
    height: scale(21),
    width: scale(21),
    borderRadius: scale(10.5),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -scale(0),
    right: -scale(11.5),
    zIndex: 1,
  },
});
const mapStateToProps = (state) => {
  const {
    user: {userProfile},
  } = state;
  console.log('userProfileee', userProfile);
  return {
    displayName: `${userProfile.firstName} ${userProfile.lastName}`,
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email,
    adult: userProfile.adult,
    country: userProfile.country,
    bio: userProfile.bio,
    profileUrl: userProfile.profileUrl || null,
    userName: userProfile.userName,
    displayName: userProfile.displayName,
    imageUrl: userProfile.imageUrl,
    location: userProfile.location,
    cover: userProfile.cover,
    birthdate: userProfile.birthdate,
    occupation: userProfile.occupation,
    userId: auth().currentUser?.uid,
  };
};

const mapDispachToProps = (Dispatch) => {
  return {
    updateStories: (story) => Dispatch({type: 'updateStories', story}),
  };
};
export default connect(mapStateToProps, mapDispachToProps)(UploadStories);

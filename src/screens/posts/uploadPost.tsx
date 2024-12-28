import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  SafeAreaView,
  TextInput,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {ListItem, Icon, Button, Overlay, Input} from 'react-native-elements';
import {connect} from 'react-redux';
import Header from '../../components/header';
import Textarea from 'react-native-textarea';
import Drawer from '../../components/drawer';
import {launchImageLibrary} from 'react-native-image-picker';
import ModalDropdown from 'react-native-modal-dropdown';
import Video from 'react-native-video';
import {FlatGrid} from 'react-native-super-grid';
import storage from '@react-native-firebase/storage';
import {GifSearch, poweredByGiphyLogoGrey} from 'react-native-gif-search';
import Editor, {displayTextWithMentions} from 'react-native-mentions-editor';
import database from '@react-native-firebase/database';
import {getTagFirends} from '../../backend/apis';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {mScale, scale, vScale} from '../../configs/size';
import {renderInitials} from '../activism/ActivismDetails';
import FastImage from 'react-native-fast-image';
import {defaultAlert} from '../../Constants/errorLog';
import HyperLink from 'react-native-hyperlink';
import { displayTextWithMentionsAndHashtags } from '../../utils/displayWithMentionAndHashtags';

import PostAsstes from '../../components/postAssets';
import AppHeader from '../../components/AppHeader';
import { DEVICE_HEIGHT } from '../../components/appModal/AppModalView';


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
  durationLimit: 60,
};
class UploadPost extends Component {
  constructor(props: any) {
    super(props);
    this.state = {
      text: '',
      videoUrl: '',
      imageUrl: '',
      privacy: 'Public',
      videoDuration: 0,
      storyContent: [],
      loader: false,
      initialValue: '',
      showEditor: true,
      message: null,
      messages: [],
      clearInput: false,
      showMentions: false,
      showGif: false,
      pollOverlay: false,
      pollQuestions: '',
      option1: '',
      option2: '',
      pollLoader: false,
      fileUploadingNum: 0,
      fileUploadingProgress: '',
      isFileUploading: false,
      sharedText: ''
      //'content://media/external/video/media/2404'
    };
    this.privacy = React.createRef();
  }

  onChangeHandler = (message) => {
    //console.log(message.text);
    /**
     * this callback will be called whenever input value change and will have
     * formatted value for mentioned syntax
     * @message : {text: 'Hey @(mrazadar)(id:1) this is good work.', displayText: `Hey @mrazadar this is good work`}
     * */
    this.setState({
      initialValue: message.text,
    });
  };
  sendMessage = () => {
    if (!this.state.message) return;
    const messages = [this.state.message, ...this.state.messages];
    this.setState({
      messages,
      message: null,
      clearInput: true,
    });
  };
  toggleEditor = () => {
    /**
     * This callback will be called
     * once user left the input field.
     * This will handle blur event.
     */
    // this.setState({
    //   showEditor: false,
    // })
  };

  onHideMentions = () => {
    /**
     * This callback will be called
     * When MentionsList hide due to any user change
     */
    this.setState({
      showMentions: false,
    });
  };
  uploadImage = () => {
    launchImageLibrary(optionImages, async (response) => {
      if (response.didCancel) {
      } else if (response.error) {
      } else if (response.customButton) {
        //console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = {uri: response.uri};

        let tempArray = this.state.storyContent;
        //console.log(response.assets[0].uri);
       
        tempArray.push({
          url: response.assets[0].uri,
          fileName: response.assets[0].fileName,
          aspectRatio: response.assets[0].width / response.assets[0].height,

          duration: 5,
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
  uploadVideo = async () => {
    launchImageLibrary(optionVideos, (response) => {
      if (response.didCancel) {
      } else if (response.error) {
      } else if (response.customButton) {
        //console.log('User tapped custom button: ', response.customButton);
      } else {
        //console.log(response, '=-=-=-');
        const source = {response};

        if (response.assets[0].duration <= 60) {
          let tempArray = this.state.storyContent;
          console.log('aspect', response.assets[0]);
          tempArray.push({
            url: response.assets[0].uri,
            fileName: response.assets[0].fileName,
            duration: response.assets[0].duration,
            aspectRatio: response.assets[0].width / response.assets[0].height,
            type: 'video',
          });
          this.setState({
            videoUrl: response.assets[0].uri,
            imageUrl: '',
            videoDuration: response.assets[0].duration,
            storyContent: tempArray,
          });
        } else {
          alert("You can't post videos longer than 60 seconds.");
          console.log('response.error', response);
        }
      }
    });
  };

  uploadPost = async () => {
    var hashtags = [];
    const tempArr = this.state.initialValue
      .split(' ')
      .filter((str) => str[0] == '#' && str.length > 1);
    tempArr.forEach((item) => {
      item.split('#').forEach((newItem) => {
        if (newItem.length > 0) hashtags.push(newItem);
      });
    });
    if (hashtags.length > 0) {
      hashtags.forEach((item) => {
        firestore()
          .collection('Hashtags')
          .where('title', '==', item)
          .get()
          .then((snap) => {
            if (snap.empty) {
              var hashtagPayload = {
                title: item,
                count: 1,
                date: new Date().getTime(),
              };
              firestore()
                .collection('Hashtags')
                .add(hashtagPayload)
                .catch((err) => console.log('err', err));
            } else {
              firestore()
                .collection('Hashtags')
                .doc(snap.docs[0].id)
                .update({
                  count: firestore.FieldValue.increment(1),
                  date: new Date().getTime(),
                })
                .catch((err) => console.log('err', err));
            }
          });
      });
    }
    if (this.state.storyContent.length > 0) {
      this.setState({loader: true});
      let downloadUrl = [];
      for (let i = 0; i < this.state.storyContent.length; i++) {
        this.setState({fileUploadingNum: i + 1});
        if (this.state.storyContent[i].type == 'gif') {
          downloadUrl.push({
            url: this.state.storyContent[i].url,
            type: 'gif',
            duration: 5,
          });
        } else {
          let date = new Date();
          const reference = storage().ref(
            `Post_Storage/${this.state.storyContent[i].type}/${
              this.state.storyContent[i].fileName +
              date.getTime() +
              'citizensPost'
            }`,
          );

          // uploads file

          try {
            console.log('1');
            await reference.putFile(`${this.state.storyContent[i].url}`);
            console.log('2');
          } catch (err) {
            this.setState({loader: false});
            Alert.alert('Error uploading File', err);
            return;
          }

          try {
            console.log('3');
            const url = await storage()
              .ref(
                `Post_Storage/${this.state.storyContent[i].type}/${
                  this.state.storyContent[i].fileName +
                  date.getTime() +
                  'citizensPost'
                }`,
              )
              .getDownloadURL();
            downloadUrl.push({
              url: url,
              type: this.state.storyContent[i].type,
              duration: this.state.storyContent[i].duration,
              aspectRatio: this.state.storyContent[i].aspectRatio,
            });
            console.log('4');
          } catch (err) {
            this.setState({loader: false});
            Alert.alert('Error uploading File', err);

            console.log('error getting url', err);
            return;
          }
        }
      }
      this.setState({loader: false, storyContent: []});
      //console.log(downloadUrl);

      let payLoad = {
        title: this.props.displayName,
        isReadMore: this.state.initialValue.length > 0 ? true : false,
        urlReadmore: this.state.initialValue,
        user: this.props.userId,
        access: `${this.state.privacy.toLowerCase()}_notHidden`,
        isHidden: false,
        storyAssets: downloadUrl,
        date: new Date().getTime(),
        userImage: this.props.imageUrl || null,
        hashtags,
        activityCount: 0,
        isShared: false,
        type: '',
      };

      console.log(this.props.route.params?.entityObj !== undefined);

      const entityObj = this.props.route.params?.entityObj;

      if (entityObj !== undefined) {
        payLoad = {...payLoad, ...entityObj};
        if (entityObj.adminData.id == this.props.userId) {
          payLoad.user = `${entityObj.movementData.id}_${entityObj.adminData.id}`;
        }
      }

      try {
        if (this.props.route.params?.cityId) {
          const {cityId, checkedTab, subcategory} = this.props.route.params;
            await firestore().collection('Posts').add({...payLoad,
              cityId,
              tab: checkedTab,
              subcategory
            });
            this.props.route.params?.onPostPublish();
        } else {
          await firestore().collection('Posts').add(payLoad);
        }
        
        this.setState({loader: false, storyContent: []}, () => {
          this.props.navigation.goBack();
        });
      } catch (err) {
        console.log('Error while uploading poll', err);
        alert('Something went wrong! Please try again later.');
      }
    } else if (this.state.initialValue.length > 0) {
      let payLoad = {
        title: this.props.displayName,
        isReadMore: this.state.initialValue.length > 0 ? true : false,
        urlReadmore: this.state.initialValue,
        user: this.props.userId,
        access: `${this.state.privacy.toLowerCase()}_notHidden`,
        isHidden: false,
        date: new Date().getTime(),
        userImage: this.props.imageUrl || '',
        hashtags,
        activityCount: 0,
        isShared: false,
        type: '',
      };

      const entityObj = this.props.route.params?.entityObj;

      if (entityObj !== undefined) {
        payLoad = {...payLoad, ...entityObj};
        if (entityObj.adminData.id == this.props.userId) {
          payLoad.user = `${entityObj.movementData.id}_${entityObj.adminData.id}`;
        }
      }

      if (this.props.route.params?.cityId) {
        const {cityId, checkedTab, subcategory} = this.props.route.params
        firestore()
        .collection('Posts')
        .add({...payLoad,
          cityId,
          tab: checkedTab,
          subcategory
        })
        .then(() => {
          this.setState({loader: false, storyContent: []}, () => {
            this.props.route.params?.onPostPublish();
            this.props.navigation.goBack();
          });
        })
        .catch((err) => {
          console.log('Error while uploading poll', err);
          alert('Something went wrong! Please try again later.');
        });

      } else {
        firestore()
        .collection('Posts')
        .add(payLoad)
        .then(() => {
          this.setState({loader: false, storyContent: []}, () => {
            this.props.navigation.navigate('Home');
          });
        })
        .catch((err) => {
          console.log('Error while uploading poll', err);
          alert('Something went wrong! Please try again later.');
        });

      }

      
    }
  };
  toggleOverlay = () => {
    this.setState({pollOverlay: !this.state.pollOverlay});
  };
  submitPoll = () => {
    this.setState({pollLoader: true});
    let payLoad = {
      title: this.props.displayName,
      // isReadMore: this.state.initialValue.length > 0 ? true : false,
      // urlReadmore: this.state.initialValue,
      user: this.props.userId,
      //   access: this.state.privacy.toLowerCase(),
      // storyAssets: downloadUrl,
      date: new Date().getTime(),
      pollQuestion: this.state.pollQuestions,
      choices: [
        {id: 1, choice: this.state.option1, votes: 0, index: 0},
        {id: 2, choice: this.state.option2, votes: 0, index: 1},
      ],
      votedArray: [],
      totalVotes: 0,
      userImage: this.props.imageUrl || null,
      type: 'poll',
      access: `${this.state.privacy.toLowerCase()}_notHidden`,
      isHidden: false,
    };

    if (this.props.route.params?.entityObj) {
      payLoad = {...payLoad, ...this.props.route.params.entityObj};
    }

    firestore()
      .collection('Posts')
      .add(payLoad)
      .then(() => {
        this.setState(
          {
            pollLoader: false,
            pollQuestion: '',
            option1: '',
            option2: '',
            pollOverlay: false,
          },
          () => {
            this.props.navigation.goBack();
          },
        );
      })
      .catch((err) => {
        console.log('Error while uploading poll', err);
        alert('Something went wrong! Please try again later.');
      });
  };

  renderItem = ({item}, onSuggestionTap) => {
    console.log('item', item);
    return (
      <TouchableOpacity
        style={{
          width: '90%',
        }}
        onPress={() => {
          console.log('hehehehe');
          onSuggestionTap({
            id: item.userId,
            username: item.displayName,
            name: item.displayName,
          });
        }}>
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: mScale(10),
            paddingTop: mScale(10),
            paddingHorizontal: scale(10),
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: vScale(10),
            }}>
            {item?.profileUrl ? (
              <Image
                source={{uri: item?.profileUrl}}
                style={{
                  height: scale(25),
                  width: scale(25),
                  borderRadius: scale(25),
                  marginRight: scale(7),
                }}
              />
            ) : (
              <View
                style={{
                  height: scale(25),
                  width: scale(25),
                  borderRadius: scale(25),
                  marginRight: scale(7),
                  backgroundColor: '#d9d9d9',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 12}}>
                  {renderInitials(item.displayName)}
                </Text>
              </View>
            )}
            <Text style={{fontWeight: 'bold'}} numberOfLines={1}>
              {item?.displayName}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  renderMentionList = ({list, keyword, isTrackingStarted, onSuggestionTap}) => {
    console.log('keyword', keyword);
    const filteredList = list.filter((item) =>
      item.displayName
        .toLowerCase()
        .includes(keyword.split('@')[1]?.toLowerCase()),
    );
    return isTrackingStarted ? (
      <ScrollView
        style={{
          maxHeight: vScale(80),
          // position: 'absolute',
          // top: vScale(-80),
          width: wp(90),
          backgroundColor: '#ffffff',
          zIndex: 10,
        }}>
        <FlatList
          style={{flex: 1}}
          data={filteredList}
          keyExtractor={(item) => `${item.id}`}
          renderItem={(item) => this.renderItem(item, onSuggestionTap)}
        />
      </ScrollView>
    ) : null;
  };


  formatMentionNode = (txt, key) => {
    const userId = key.replace(/^[0-9]+-/, '').replace(/-[0-9]+$/, '');

    return (
      <Text
        key={key}
        onPress={() => {

          if ( this.props.route.params?.userId !== userId) {
            this.props.navigation.navigate('otherProfile', {userId});
          } else {
            this.props.navigation.navigate('profile');
          }
        }}
        style={style.link}>
        {txt}
      </Text>
    );
  };

  formatHashtagNode = (txt) => {
    return (
      <Text
        // key={key}
        onPress={() => {
          this.props.navigation.navigate('Explore', {
            screen: 'TrendingPosts',
            params: {
              title: txt.split('#')[1],
            },
          });
        }}
        style={style.link}>
        {txt}
      </Text>
    );
  };

  CustomText = (props) => {
    if (typeof props == 'string' && props != '') {
      return (
        <View
          style={{
            minHeight:
            this.props.route.params?.assets == undefined || this.props.route.params?.assets.length == 0
                ? hp(8)
                : 0,
            justifyContent: 'center',
          }}>
          <HyperLink linkDefault={true} linkStyle={style.link}>
            <Text style={{marginHorizontal: 10, marginBottom: 10}}>
              {displayTextWithMentionsAndHashtags(
                props,
                this.formatMentionNode,
                this.formatHashtagNode,
              )}
            </Text>
          </HyperLink>
        </View>
      );
    } else {
      return null;
    }
  };

  render() {
    const {text, privacy, imageUrl, loader} = this.state;
    const {displayName, username, email, userFriends} = this.props;

    console.log('display......................', this.props.route.params?.entityObj?.entityType);
    const bottomIcon = true;
    if(this.props.route.params?.entityObj?.entityType == 'movement'){
      const bottomIcon = false; 
    }

    const formattedFriends = userFriends
      ? userFriends.map((friend) => {
          const friendObj = friend.userData.find(
            (item) => item.userId !== this.props.userId,
          );
          return friendObj;
        })
      : [];

    return (
      <TouchableOpacity activeOpacity={1.0} style={style.container} onPress={() => {Keyboard.dismiss()}}>
        <>
        <Overlay
          isVisible={this.state.pollOverlay}
          onBackdropPress={this.toggleOverlay}
          overlayStyle={style.pollStyle}>
          <>
          <ScrollView>
            <Text style={style.pollHeading}>Poll</Text>
            <Input
              placeholder="Poll Question"
              leftIcon={{
                type: 'entypo',
                name: 'text',
                size: 18,
                iconStyle: {marginHorizontal: 10},
              }}
              label="Poll Question"
              inputStyle={{fontSize: 14}}
              inputContainerStyle={style.inputCont}
              containerStyle={style.contStyle}
              errorStyle={style.errorStyle}
              value={this.state.pollQuestions}
              onChangeText={(pollQuestions) => {
                this.setState({pollQuestions});
              }}
            />
            <Input
              placeholder="Option 1"
              leftIcon={{
                type: 'entypo',
                name: 'text',
                size: 18,
                iconStyle: {marginHorizontal: 10},
              }}
              label="Option 1"
              inputStyle={{fontSize: 14}}
              inputContainerStyle={style.inputCont}
              containerStyle={style.contStyle}
              errorStyle={style.errorStyle}
              value={this.state.option1}
              onChangeText={(option1) => {
                this.setState({option1});
              }}
            />
            <Input
              placeholder="Option 2"
              leftIcon={{
                type: 'entypo',
                name: 'text',
                size: 18,
                iconStyle: {marginHorizontal: 10},
              }}
              label="Option 2"
              inputStyle={{fontSize: 14}}
              inputContainerStyle={style.inputCont}
              containerStyle={style.contStyle}
              errorStyle={style.errorStyle}
              value={this.state.option2}
              onChangeText={(option2) => {
                this.setState({option2});
              }}
            />
            <Button
              icon={
                <Icon
                  name="poll-h"
                  type="font-awesome-5"
                  color="white"
                  size={25}
                  iconStyle={{marginRight: 10}}
                />
              }
              buttonStyle={{backgroundColor: '#1e2348'}}
              title="Submit Poll"
              onPress={this.submitPoll}
              loading={this.state.pollLoader}
            />
          </ScrollView>
          </>
        </Overlay>
       <AppHeader />
        {/* <Drawer navigation={this.props.navigation} /> */}
        <StatusBar translucent hidden />
        <View style={{backgroundColor: 'white', flex: 1, paddingTop: 10}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginLeft: 15,
            // marginTop: vScale(8),
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {
              this.props?.imageUrl ?
              <Image
              source={{uri: this.props.imageUrl}}
              style={{
                height: scale(30),
                width: scale(30),
                borderRadius: scale(15),
                marginRight: scale(7),
              }}
            />
              :
               <Icon name="person-circle-outline" type="ionicon" size={35} />
            }
          
            {/* <View style={style.usernameWrapper}>
              <Text>
                {this.props?.route?.params?.creatorName ||
                  this.props.displayName}
              </Text>
            </View> */}
             {
              !this.props.route.params?.cityId ?
              <View style={[style.usernameWrapper, {flexDirection: 'row', alignItems: 'center'}]}>
            <ModalDropdown
              options={['Public', 'Friends']}
              dropdownStyle={{
                width: wp(20),
                height: Platform.OS == 'ios' ? hp(8.5) : hp(10),
                marginLeft: hp(0),
              }}
              ref={this.privacy}
              defaultValue={this.state.privacy}
              style={{
                // height: 20,
                width: 100,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              textStyle={{
                // marginTop: vScale(20),
                marginLeft: scale(15),
                color: 'gray',
                width: '70%',
                // height: 30,
                fontSize: 14,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onSelect={(index, value) => {
                this.setState({
                  privacy: value,
                });
              }}
            />
            <Text style={{marginBottom: 5, fontSize: 15}}>
             {'⌄'}
            </Text>
          </View>
          : null
             }
             
          </View>
          {loader ? (
            <View style={{marginRight: 20, alignItems: 'flex-end'}}>
              <ActivityIndicator
                color="#1e2348"
                size={20}
                style={{marginBottom: 5}}
              />
              {this.state.storyContent.length > 0 && (
                <Text style={{textAlign: 'center'}}>
                  Uploading...
                </Text>
              )}
            </View>
          ) : (
            <Button
              containerStyle={style.buttonCont}
              buttonStyle={style.buttonStyle}
              title="Circulate"
              titleStyle={{fontSize: 16}}
              onPress={() => {
                if (this.props.route.params?.item) {
                  this.props.route.params.onShare(this.state.sharedText);
                  this.props.navigation.goBack()
                } else {
                  this.uploadPost();
                }
               
              }}
            />
          )}
        </View>
        {this.state.showGif && (
          <View style={{height: hp(25)}}>
            <GifSearch
              giphyApiKey={'JHuKBVEbUGVHjR5c4jIsQ9o4yGQatPLf'}
              onGifSelected={(gif_url) => {
                //console.log(gif_url, '-');
                let tempArray = this.state.storyContent;
                tempArray.push({
                  url: gif_url,
                  fileName: gif_url,
                  duration: 5,
                  type: 'gif',
                });
                this.setState({storyContent: tempArray, showGif: false});
              }}
              style={{
                backgroundColor: 'transparent',
                height: hp(100),
                padding: 0,
              }}
              textInputStyle={{fontWeight: 'bold', color: 'black'}}
              loadingSpinnerColor={'black'}
              placeholderTextColor={'grey'}
              numColumns={3}
              provider={'giphy'}
              providerLogo={poweredByGiphyLogoGrey}
              showScrollBar={true}
              noGifsFoundText={'No Gifs found :('}
            />
          </View>
        )}
        <View style={[style.privacyContainer]}>
          {
             this.props.route.params?.item ?
             <Input
             maxLength={200}
             multiline={true}
             inputStyle={{fontSize: 14}}
             inputContainerStyle={{borderWidth: 0, borderColor: '#fff'}}
             // containerStyle={style.contStyle}
             placeholder="Add a comment"
             errorStyle={style.errorStyle}
             value={this.state.sharedText}
             onChangeText={(sharedText) => {
               this.setState({sharedText});
             }}
           />
            :
            <Editor 
            list={formattedFriends}
            renderMentionList={this.renderMentionList}
            editorStyles={{

              input: { 
                flex: 1,
                textAlignVertical: 'top',
                paddingTop:4
            },

              inputMaskText:{
                color:'#000'
              },
              mainContainer: {
                minHeight: hp(5),
                height: this.state?.storyContent?.length ? DEVICE_HEIGHT - 400 :  DEVICE_HEIGHT - 280,
                width: wp(90),
                borderColor: '#ddd',
                borderRadius: 10,
                paddingTop: 0,
                color:"#000",
              },
            }}
            initialValue={this.state.initialValue}
            clearInput={this.state.clearInput}
            onChange={this.onChangeHandler}
            showEditor={this.state.showEditor}
             //  toggleEditor={this.toggleEditor}
            showMentions={this.state.showMentions}
            onHideMentions={this.onHideMentions}
            placeholderTextColor={'#c7c7c7'}
            selectionColor={'#000'}

          />
          

          // <Textarea
          //     containerStyle={style.textareaContainer}
          //     style={style.textarea}
          //     onChangeText={(text) => {
          //       // this.setState({text});
          //       this.setState({
          //         initialValue: text,
          //       });
          //     }}
          //     clearInput={this.state.clearInput}
          //     defaultValue={this.state.text}
          //     // maxLength={300}
          //     placeholder={'Type something'}
          //     placeholderTextColor={'#c7c7c7'}
          //     underlineColorAndroid={'white'}
          //     selectionColor={'#1e2348'}
          //     // underlineColorAndroid={'transparent'}
          //   />
          }
          
          {
          this.props.route.params?.item ?

          <View style={{ padding: 10}}>
          {this.props.route.params?.item?.data?.type != 'poll'
              ? this.props.route.params?.item?.data?.isShared
                ? this.CustomText(this.props.route.params?.item?.data?.sharedFrom?.urlReadmore || '')
                : this.CustomText(this.props.route.params?.item?.data?.urlReadmore || '')
              : null}
            {this.props.route.params?.assets != undefined && this.props.route.params?.assets.length > 0 ? (
              <View>
                <FlatList
                horizontal
                data={this.props.route.params?.assets}
                renderItem={(item) => {
                  return (
                    <PostAsstes
                  content={this.props.route.params?.assets.slice(0, 1)}
                  width={wp(30)}
                  height={hp(15)}
                  color={true}
                  disableTouch={true}
                />
                  )
                }}
                  />
                
                {/* {this.state.assets.length > 1 && (
                  <Text style={{color: 'blue', fontSize: mScale(16)}}>
                    + {this.state.assets.length - 1} more
                  </Text>
                )} */}
              </View>
            ) : this.props.route.params?.item?.data?.type == 'poll' ? (
              <View>
                <ListItem
                  containerStyle={{marginVertical: 0, paddingBottom: 0}}>
                  <ListItem.Title>{this.props.route.params?.item?.data?.pollQuestion}</ListItem.Title>
                </ListItem>
                <ListItem
                  containerStyle={{marginVertical: 0, paddingVertical: 0}}>
                  <RNPoll
                    totalVotes={this.props.route.params?.item?.data?.totalVotes}
                    choices={this.props.route.params?.item?.data?.choices}
                    hasBeenVoted={false}
                    pollContainerStyle={{width: wp(75)}}
                    onChoicePress={() => {}}
                  />
                </ListItem>
              </View>
            ) : null}
          </View>
          :

          this.state.storyContent.length > 0 && (
              <FlatList
              horizontal
              scrollEnabled
                data={this.state.storyContent}
                renderItem={({item, index}) => {
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
                            style={style.cancelIcon}
                            color="red"
                          />
                        </TouchableOpacity>
                        <Video
                          source={{uri: item.url}} // Can be a URL or a local file.
                          ref={(ref) => {
                            this.player = ref;
                          }}
                          muted
                          resizeMode="cover" // Callback when video cannot be loaded
                          style={{height: hp(10), width: wp(40),borderRadius: 10}}
                        />
                      </View>
                    );
                  } else if (item.type == 'gif') {
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
                          // source={{
                          //   uri: item.url,
                          // }}
                          source={{
                            uri: item.url,
                          }}
                          style={{height: hp(10), width: wp(40), borderRadius: 10}}
                          resizeMode={'cover'}
                          //  paused={true}
                        />
                      </View>
                    );
                  }

                  return (
                    <View style={[style.mediaCont, {marginRight: 20, borderRadius: 10, padding: 2}]}>
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
                      <Image
                        source={{uri: item.url.replace('file://', '')}}
                        resizeMode="cover"
                        style={{height: hp(10), width: wp(40), borderRadius: 10}}
                      />
                    </View>
                  );
                }}
              />
          )}
        </View>
        {
          !this.props.route.params?.item ?
          <View style={style.row}>
          <TouchableOpacity onPress={this.uploadImage}>
            <ListItem containerStyle={style.rowIcons}>
              <Icon name="camera" type="entypo" size={30} />
            </ListItem>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.uploadVideo}>
            <ListItem containerStyle={style.rowIcons}>
              <Icon name="video-camera" type="entypo" size={30} />
            </ListItem>
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={() => {
              this.toggleOverlay();
            }}>
            <ListItem containerStyle={style.rowIcons}>
              <Icon name="text-document" type="entypo" size={30} />
            </ListItem>
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => {
              this.setState({showGif: !this.state.showGif});
            }}>
            <ListItem containerStyle={style.rowIcons}>
              <Icon name="file-gif-box" type="material-community" size={35} />
            </ListItem>
          </TouchableOpacity>
        </View>
        :
        null

        }
        </View>
        </>
      </TouchableOpacity>
    );
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e2348'
  },
  
  link: {
    fontSize: 16,
    fontWeight: '400',
    backgroundColor: 'rgba(36, 77, 201, 0.05)',
    color: '#244dc9',
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
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 50,
  },
  rowIcons: {width: wp(20), padding: 7, backgroundColor: 'transparent'},
  backgroundVideo: {
    position: 'absolute',
    bottom: 0,
    width: wp(100),
    height: hp(45),
  },
  videoParent: {height: hp(50), marginTop: 30},
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
  privacyContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignSelf: 'center',
    elevation: 5,
    width: wp(90),
    marginTop: 10
  },
  pollHeading: {marginVertical: 10},
  inputCont: {
    borderColor: 'silver',
    borderWidth: 1,
    elevation: 0,
    borderRadius: 20,
    padding: 0,
  },
  contStyle: {margin: 0, padding: 0},
  errorStyle: {height: 0},
  pollStyle: {width: wp(90), height: hp(70), borderRadius: 10, padding: 20},
  dropDown: {
    borderColor: '#000',
    borderWidth: 1,
    width: wp(25),
    height: vScale(28),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    alignSelf: 'flex-end',
    margin: 5,
    position: 'absolute',
    bottom: hp(0.5),
    right: wp(0.5),
  },
  buttonStyle: {
    backgroundColor: 'transparent',
    height: '100%',
    paddingVertical: 0,
  },
  buttonCont: {
    backgroundColor: '#1e2348',
    width: wp(30),
    height: 30,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 5,
    marginRight: 20,
  },
  usernameWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: '#a7a9ab',
    marginLeft: 5,
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
});
const mapStateToProps = (state) => {
  const {
    user: {userProfile, userFriends},
  } = state;
  return {
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email,
    adult: userProfile.adult,
    country: userProfile.country,
    bio: userProfile.bio,
    userName: userProfile.userName,
    displayName: userProfile.displayName,
    imageUrl: userProfile.profileUrl,
    location: userProfile.location,
    cover: userProfile.cover,
    birthdate: userProfile.birthdate,
    occupation: userProfile.occupation,
    userId: auth().currentUser?.uid,
    userFriends,
  };
};

const mapDispachToProps = (Dispatch) => {
  return {
    updateStories: (story) => Dispatch({type: 'updateStories', story}),
  };
};
export default connect(mapStateToProps, mapDispachToProps)(UploadPost);

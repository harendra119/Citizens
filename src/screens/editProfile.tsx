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
  Platform,
  Alert,
} from 'react-native';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';
import {
  Icon,
  ListItem,
  Avatar,
  Input,
  Overlay,
  CheckBox,
} from 'react-native-elements';
import ModalDropdown from 'react-native-modal-dropdown';
import {updateUser} from '../backend/apis';
import {launchImageLibrary} from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {GoogleAutoComplete} from 'react-native-google-autocomplete';
import {updatePassword} from '../backend/authentication';
import {
  isUsernameTaken,
  updateUserProfile,
  uploadImage,
} from '../backend/userProfile';
import Error from '../components/error';
import {scale, vScale} from '../configs/size';
import auth, { firebase } from '@react-native-firebase/auth';
import errorLog from '../Constants/errorLog';


const option = {
  storageOptions: {
    skipBackup: true,
    path: 'images',
    privateDirectory: true,
  },
  quality: 1,
};
const GOOGLE_MAPS_APIKEY = 'AIzaSyC7CIPvijgTEI0y3lIHTywQ-m6XROiep78';
class EditProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayName: this.props.displayName,
      userName: this.props?.userName || '',
      email: this.props.email,
      country: this.props.country,
      location: this.props.location != 'null' ? this.props.location : '',
      occupation: this.props.occupation != 'null' ? this.props.occupation : '',
      userImage: this.props.imageUrl,
      about: this.props.bio,
      cover: this.props.cover,
      birthdate:
        this.props.birthdate != null && this.props.birthdate != 'undefined'
          ? this.props.birthdate
          : '',
      isEmailPublic: this.props.isEmailPublic,
      isProfilePrivate: this.props.isProfilePrivate,
      loader: false,
      showDob: false,
      dob: new Date(),
      showAutoComplelte: false,
      input: '',
      editPassowrd: false,
      newPassword: '',
      oldPassword:'',
      confirmNewPassword:'',
      checkOldPassword:false,
    };

    this.toast = React.createRef();
    this.dob = React.createRef();
    this.location = React.createRef();
    this.myScrollRef = React.createRef();
    this.myAutoCmplete = React.createRef();
    this.dropDown = React.createRef();
  }

  isSocialUser =
    this.props.socialSource == 'Facebook' ||
    this.props.socialSource == 'Google';


    checkOldPassword = async (user,cred) => {
    


      return await user.reauthenticateWithCredential(cred)
          .then(async (res) => {
             return true;
          })
          .catch(function(error) {
            var errorMessage = error.code;;
            
            alert('Incorrect Old password!');

            return false;
          })
    }

  onPressSave = async () => {
    const {
      displayName,
      userName,
      email,
      about,
      location,
      occupation,
      birthdate,
      country,
      editPassowrd,
      isEmailPublic,
      isProfilePrivate,
      userImage,
      cover,
      newPassword,
      oldPassword,
      confirmNewPassword
    } = this.state;
    let payload = {};
    let profileUrl;
    let coverUrl;
    this.setState({loader: true});

    if (!userName || userName == '@') {
      alert('Please Enter your username.');
      this.setState({loader: false});
      return;
    }

    const usernameTaken = await isUsernameTaken(userName, this.props.userId);

    if (usernameTaken) {
      alert('Username already taken');
      this.setState({loader: false});

      return;
    }

    if (editPassowrd) {
          if (newPassword != confirmNewPassword) {
            this.setState({loader: false});
            alert("New Password & Confirm password  don't match!");

            // Toast.show({
            //   text1: "New Password & Confirm password  don't match!",
            //   type: 'error',
            // });
            return ;
          }
          var user =  auth().currentUser;
          var cred =  auth.EmailAuthProvider.credential(user.email, oldPassword);

          if(await this.checkOldPassword(user,cred) == false){
            this.setState({loader: false});
            return ;
          }
          
          // await user.reauthenticateWithCredential(cred)
          // .then(async (res) => {
          //    this.setState({checkOldPassword: true});
          //    console.log('success true');
          // })
          // .catch(function(error) {
          //   var errorMessage = error.code;;
            
          //   alert('Incorrect Old password!');

          //   return ;
          // })
     
    }

    
    

    if (userImage != this.props.imageUrl) {
      console.log('userImage', userImage);
      try {
        profileUrl = await uploadImage(userImage, `images/profile/${email}`);

        payload = {...payload, profileUrl};
      } catch (error) {
        this.setState({loader: false});

        alert('Something went wrong while updating your Profile Image!');
        return;
      }
    }
    if (cover != this.props.cover) {
      console.log('cover', cover);
      try {
        coverUrl = await uploadImage(cover, `images/cover/${email}`);

        payload = {...payload, coverUrl};
      } catch (error) {
        this.setState({loader: false});

        alert('Something went wrong while updating your Cover Image!');
        return;
      }
    }
    if (displayName !== undefined) {
      payload['displayName'] = displayName;
      const total = displayName.split(' ');
      payload['firstName'] = total[0];
      if (total.length > 1) {
        payload['lastName'] =  total[1];
      }
    }
    if (userName !== undefined) payload['username'] = userName;
    if (about !== undefined) payload['bio'] = about;
    if (location !== undefined) payload['location'] = location;
    if (occupation !== undefined) payload['occupation'] = occupation;
    if (birthdate !== undefined) {
      payload['birthdate'] = birthdate;
      payload['birthday'] =
        birthdate.split('/')[0] + '/' + birthdate.split('/')[1];
    }
    if (country !== undefined) payload['country'] = country;
    if (isEmailPublic !== undefined) payload['isEmailPublic'] = isEmailPublic;
    if (isProfilePrivate !== undefined)
      payload['isProfilePrivate'] = isProfilePrivate;

    console.log('payload', payload);
    try {

      await updateUserProfile(auth().currentUser.uid, payload);
      this.setState({loader: false});

      Alert.alert('Success', 'Profile updated successfully.');

    

      if (displayName && displayName != this.props.displayName) {
       await this.updateUserNameInPosts(auth().currentUser.uid, displayName);
       await this.updateUserNameInComments(auth().currentUser.uid, displayName);
      }



    } catch (error) {
      this.setState({loader: false});
      errorLog('while updating profile', error);
      alert('Something went wrong while updating your profile!');
    }
  };

  

  updateUserNameInPosts = async (userId, newName) => {
    const db = firebase.firestore();
    const batch = db.batch();
    try {
      // Fetch all posts made by the user
      const postsSnapshot = await db.collection('Posts').where('user', '==', userId).get();
  
      postsSnapshot.forEach((doc) => {
        // Update the title field in each post
        batch.update(doc.ref, { title: newName });
      });
  
      // Commit the batch
      await batch.commit();
      console.log('User name updated in posts successfully.');
    } catch (error) {
      console.error('Error updating user name in posts:', error);
    }
  };

  updateUserNameInComments = async (userId, newName) => {
    const db = firebase.firestore();
  
    try {
      // Fetch all posts to locate their comments
      const postsSnapshot = await db.collection('Posts').get();
  
      const batch = db.batch();
  
      // Loop through each post and fetch its comments
      for (const postDoc of postsSnapshot.docs) {
        const commentsSnapshot = await db
          .collection('Posts')
          .doc(postDoc.id)
          .collection('Comments')
          .where('id', '==', userId)
          .get();
  
        commentsSnapshot.forEach((commentDoc) => {
          // Update the title field in each comment
          batch.update(commentDoc.ref, { displayName: newName });
        });
      }
  
      // Commit the batch
      await batch.commit();
      console.log('User name updated in comments successfully.');
    } catch (error) {
      console.error('Error updating user name in comments:', error);
    }
  };
  

  showImagePicker = () => {
    launchImageLibrary(option, (response) => {
      if (response.didCancel) {
      } else if (response.error) {
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = {uri: response.uri};

        console.log(response.fileName, '-------', response.assets[0].fileName);
        //  this.updateUserImage(response.uri, response.fileName)
        this.setState({
          userImage: response.assets[0].uri,
        });
      }
    });
  };
  changeCover = () => {
    launchImageLibrary(option, (response) => {
      if (response.didCancel) {
      } else if (response.error) {
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = {uri: response.uri};

        //  this.updateUserImage(response.uri, response.fileName)
        this.setState({
          cover: response.assets[0].uri,
        });
      }
    });
  };
  closeAutoCompletBox = () => {
    this.setState({
      showAutoComplelte: !this.state.showAutoComplelte,
    });
  };
  render() {
    const homePlace = {
      description: 'Home',
      geometry: {location: {lat: 33.5651, lng: 73.0169}},
    };
    const workPlace = {
      description: 'Work',
      geometry: {location: {lat: 33.6844, lng: 73.0479}},
    };
    const {
      userName,
      email,
      country,
      userImage,
      displayName,
      about,
      location,
      imageUrl,
      occupation,
      cover,
      birthdate,
      showDob,
      showAutoComplelte,
      input,
    } = this.state;
    return (
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        <View style={style.container}>
          <Overlay
            isVisible={showAutoComplelte}
            overlayStyle={{width: wp(90), height: hp(50)}}
            onBackdropPress={this.closeAutoCompletBox}>
            <GoogleAutoComplete
              apiKey={GOOGLE_MAPS_APIKEY}
              debounce={300}
              minLength={1}>
              {({
                inputValue,
                handleTextChange,
                locationResults,
                fetchDetails,
              }) => (
                <React.Fragment>
                  <TextInput
                    style={{
                      width: wp(80),
                      borderColor: '#000',
                      borderWidth: 1,
                      alignSelf: 'center',
                      marginTop: hp(5),
                      padding: 5,
                      borderRadius: 15,
                    }}
                    value={() => {
                      this.setState({input: inputValue});
                    }}
                    onChangeText={handleTextChange}
                    placeholder="Location..."
                    autoFocus={true}
                  />
                  <ScrollView
                    style={{maxHeight: 300}}
                    showsVerticalScrollIndicator={false}>
                    {locationResults.map((el, i) => {
                      console.log('--', i);
                      return (
                        <ListItem
                          onPress={() => {
                            console.log(el, '---');
                            this.setState({
                              input: el.description,
                              location: el.description,
                            });
                            this.closeAutoCompletBox();
                          }}>
                          <ListItem.Content>
                            <ListItem.Subtitle>
                              {el.description}
                            </ListItem.Subtitle>
                          </ListItem.Content>
                        </ListItem>
                      );
                    })}
                  </ScrollView>
                </React.Fragment>
              )}
            </GoogleAutoComplete>
          </Overlay>
          <Toast ref={this.toast} style={{zIndex: 9999}} />
          <StatusBar translucent backgroundColor="transparent" />
          {this.props.email ? (
            <View>
              <ListItem containerStyle={style.listCont}>
                <ListItem.Content>
                  <ListItem.Title style={{fontSize: 20, fontWeight: 'bold'}}>
                    Edit Profile
                  </ListItem.Title>
                  <ListItem.Subtitle>
                    People on Citizens will get to know you with the information
                    below
                  </ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
              <ImageBackground
                source={{
                  uri: cover ? cover : ''
                }}
                resizeMode="cover"
                style={{
                  width: wp(90),
                  padding: 10,
                  paddingTop: hp(5),
                  height: hp(25),
                  backgroundColor: '#d9d9d9',
                }}
                onError={() => {
                  this.props.updateUser(
                    'https://images.ctfassets.net/hrltx12pl8hq/7yQR5uJhwEkRfjwMFJ7bUK/dc52a0913e8ff8b5c276177890eb0129/offset_comp_772626-opt.jpg?fit=fill&w=800&h=300',
                  );
                }}>
                <Avatar.Accessory
                  size={20}
                  style={{position: 'absolute', top: 0}}
                  name="cross"
                  type="entypo"
                  color="red"
                  onPress={() => {
                    this.setState({
                      cover: null,
                    });
                  }}
                />
                <ListItem containerStyle={style.listCont}>
                  <Avatar
                    source={{
                      uri:
                        userImage ||
                        'https://seller.tools/wp-content/themes/sellertools/assets/images/placeholder.png',
                    }}
                    size={'large'}
                    rounded
                    containerStyle={{borderColor: '#1b224d', borderWidth: 2}}
                    title={displayName[0]}>
                    <Avatar.Accessory
                      size={20}
                      style={{position: 'absolute', top: 0}}
                      name="cross"
                      type="entypo"
                      color="red"
                      onPress={() => {
                        this.setState({
                          userImage: null,
                        });
                      }}
                    />
                  </Avatar>

                  <ListItem.Content>
                    <TouchableOpacity onPress={this.showImagePicker}>
                      <ListItem.Title style={style.changePhoto}>
                        Change profile picture
                      </ListItem.Title>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.changeCover}>
                      <ListItem.Subtitle style={style.changePhoto}>
                        Change cover photo
                      </ListItem.Subtitle>
                    </TouchableOpacity>
                  </ListItem.Content>
                </ListItem>
              </ImageBackground>
              <ListItem containerStyle={style.listCont}>
                <Input
                  placeholder="Display Name"
                  leftIcon={{
                    type: 'font-awesome',
                    name: 'user-o',
                    size: 18,
                    iconStyle: {marginHorizontal: 10},
                  }}
                  label="Display Name"
                  inputStyle={{fontSize: 14}}
                  inputContainerStyle={style.inputCont}
                  containerStyle={style.contStyle}
                  errorStyle={style.errorStyle}
                  value={displayName}
                  onChangeText={(displayName) => {
                    this.setState({displayName});
                  }}
                />
              </ListItem>
              <ListItem containerStyle={style.listCont}>
                <Input
                  placeholder="Username "
                  leftIcon={{
                    type: 'font-awesome',
                    name: 'user-o',
                    size: 18,
                    iconStyle: {marginHorizontal: 10},
                  }}
                  label="Username "
                  inputStyle={{fontSize: 14}}
                  inputContainerStyle={style.inputCont}
                  containerStyle={style.contStyle}
                  errorStyle={style.errorStyle}
                  value={userName}
                  onChangeText={(userName) => {
                    var text = userName.split('@').join('');
                    this.setState({userName: `@${text}`});
                  }}
                />
              </ListItem>
              <ListItem containerStyle={style.listCont}>
                <Input
                  placeholder="Email Address"
                  leftIcon={{
                    type: 'material-community',
                    name: 'email-edit-outline',
                    size: 18,
                    iconStyle: {marginHorizontal: 10},
                  }}
                  label="Email Address"
                  disabled
                  inputStyle={{fontSize: 14}}
                  inputContainerStyle={style.inputCont}
                  containerStyle={style.contStyle}
                  errorStyle={style.errorStyle}
                  value={email}
                />
              </ListItem>
              <ListItem containerStyle={style.listCont}>
                <Input
                  placeholder="Bio "
                  leftIcon={{
                    type: 'material',
                    name: 'info-outline',
                    size: 18,
                    iconStyle: {marginHorizontal: 10},
                  }}
                  label="Bio "
                  inputStyle={{fontSize: 14}}
                  inputContainerStyle={style.inputCont}
                  containerStyle={style.contStyle}
                  errorStyle={style.errorStyle}
                  value={about}
                  onChangeText={(about) => {
                    if (about.length <= 160) {
                      this.setState({about});
                    }
                  }}
                />
              </ListItem>
              <ListItem containerStyle={style.listCont}>
                <Input
                  placeholder="Location"
                  leftIcon={{
                    type: 'simple-line-icon',
                    name: 'location-pin',
                    size: 18,
                    iconStyle: {marginHorizontal: 10},
                  }}
                  label="Location"
                  ref={this.location}
                  inputStyle={{fontSize: 14}}
                  inputContainerStyle={style.inputCont}
                  containerStyle={style.contStyle}
                  errorStyle={style.errorStyle}
                  value={location}
                  onFocus={() => {
                    //    this.location.current.blur()
                    //  this.closeAutoCompletBox()
                  }}
                  maxLength={30}
                  onChangeText={(location) => {
                    this.setState({location});
                  }}
                />
              </ListItem>
              <ListItem containerStyle={style.listCont}>
                <Input
                  placeholder="Occupation"
                  leftIcon={{
                    type: 'material-community',
                    name: 'briefcase-account-outline',
                    size: 18,
                    iconStyle: {marginHorizontal: 10},
                  }}
                  label="Occupation"
                  inputStyle={{fontSize: 14}}
                  inputContainerStyle={style.inputCont}
                  containerStyle={style.contStyle}
                  errorStyle={style.errorStyle}
                  value={occupation}
                  onChangeText={(occupation) => {
                    if (occupation.length <= 30) {
                      this.setState({occupation});
                    }
                  }}
                />
              </ListItem>

              <ListItem containerStyle={style.listCont}>
                <Input
                  placeholder="mm/dd/yyyy"
                  leftIcon={{
                    type: 'material-community',
                    name: 'cake',
                    size: 18,
                    iconStyle: {marginHorizontal: 10},
                  }}
                  label="Birthdate"
                  ref={this.dob}
                  inputStyle={{fontSize: 14}}
                  inputContainerStyle={style.inputCont}
                  containerStyle={style.contStyle}
                  errorStyle={style.errorStyle}
                  onFocus={() => {
                    this.dob.current.blur();
                    this.setState({showDob: true});
                  }}
                  value={birthdate}
                  onChangeText={(birthdate) => {
                    this.setState({birthdate});
                  }}
                />
              </ListItem>
              <DateTimePickerModal
                isVisible={showDob}
                date={this.state.dob}
                maximumDate={new Date()}
                mode="date"
                onConfirm={(date) => {
                  this.dob.current.blur();
                  this.setState({
                    dob: date,
                    birthdate:
                      date.getDate() +
                      '/' +
                      (date.getMonth() + 1) +
                      '/' +
                      date.getFullYear(),
                    showDob: false,
                  });
                }}
                onCancel={() => {
                  this.setState({showDob: false});
                }}
              />
              <Text
                style={{
                  marginLeft: wp(5),
                  color: '#8b96a2',
                  fontWeight: 'bold',
                  fontSize: 17,
                  alignSelf: 'flex-start',
                }}>
                Country
              </Text>
              <ListItem
                containerStyle={[
                  // style.listCont,
                  {
                    backgroundColor: 'transparent',
                    borderColor: 'silver',
                    borderWidth: 1,
                    borderRadius: 18,
                    height: vScale(39),
                    width: wp(80),
                    alignSelf: 'center',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                  },
                ]}>
                <Icon
                  name="flag"
                  type="entypo"
                  size={12}
                  color="gray"
                  // style={{marginLeft: 10}}
                />
                <ListItem.Content>
                  <ModalDropdown
                    options={['India', 'Canada', 'USA']}
                    dropdownStyle={{
                      width: wp(70),
                      marginTop: hp(-4),
                      height: Platform.OS == 'ios' ? vScale(80) : vScale(100),
                    }}
                    ref={this.dropDown}
                    defaultValue={country}
                    textStyle={{
                      marginTop: Platform.OS == 'android' ? vScale(10) : 0,
                      marginLeft: scale(10),
                      color: 'gray',
                      width: '70%',
                      fontSize: 14,
                    }}
                    onSelect={(index, value) => {
                      this.setState({
                        country: value,
                      });
                    }}
                  />
                </ListItem.Content>
                <Icon
                  name="caretdown"
                  type="antdesign"
                  size={12}
                  color="gray"
                  style={{marginRight: 10}}
                  onPress={() => {
                    this.dropDown.current?.show();
                  }}
                />
              </ListItem>
              <ListItem containerStyle={style.listCont}>
                <CheckBox
                  title="Make Email Public"
                  containerStyle={{flex: 1}}
                  onPress={() => {
                    this.setState({isEmailPublic: !this.state.isEmailPublic});
                  }}
                  checked={this.state.isEmailPublic}
                />
              </ListItem>
              <ListItem containerStyle={style.listCont}>
                <CheckBox
                  title="Make Profile Private"
                  containerStyle={{flex: 1}}
                  onPress={() => {
                    this.setState({
                      isProfilePrivate: !this.state.isProfilePrivate,
                    });
                  }}
                  checked={this.state.isProfilePrivate}
                />
              </ListItem>
              {!this.isSocialUser && (
                <ListItem containerStyle={style.listCont}>
                  <CheckBox
                    title="Edit Password"
                    containerStyle={{flex: 1}}
                    onPress={() => {
                      this.setState({editPassowrd: !this.state.editPassowrd});
                    }}
                    checked={this.state.editPassowrd}
                  />
                </ListItem>
              )}
              {this.state.editPassowrd && (
                <>
                <ListItem containerStyle={style.listCont}>
                  <Input
                    placeholder="Old Password "
                    leftIcon={{
                      type: 'material',
                      name: 'lock',
                      size: 18,
                      iconStyle: {marginHorizontal: 10},
                    }}
                    label="Old Password  "
                    inputStyle={{fontSize: 14}}
                    inputContainerStyle={style.inputCont}
                    containerStyle={style.contStyle}
                    errorStyle={style.errorStyle}
                    value={this.state.oldPassword}
                    onChangeText={(oldPassword) => {
                      this.setState({oldPassword});
                    }}
                  />
                  
                </ListItem>
                <ListItem containerStyle={style.listCont}>
                
                <Input
                  placeholder="New Password "
                  leftIcon={{
                    type: 'material',
                    name: 'lock',
                    size: 18,
                    iconStyle: {marginHorizontal: 10},
                  }}
                  label="New Password  "
                  inputStyle={{fontSize: 14}}
                  inputContainerStyle={style.inputCont}
                  containerStyle={style.contStyle}
                  errorStyle={style.errorStyle}
                  value={this.state.newPassword}
                  onChangeText={(newPassword) => {
                    this.setState({newPassword});
                  }}
                />
              </ListItem>
              <ListItem containerStyle={style.listCont}>
                
                <Input
                  placeholder="Confirm  New Password "
                  leftIcon={{
                    type: 'material',
                    name: 'lock',
                    size: 18,
                    iconStyle: {marginHorizontal: 10},
                  }}
                  // label="Confirm Password  "
                  inputStyle={{fontSize: 14}}
                  inputContainerStyle={style.inputCont}
                  containerStyle={style.contStyle}
                  errorStyle={style.errorStyle}
                  value={this.state.confirmNewPassword}
                  onChangeText={(confirmNewPassword) => {
                    this.setState({confirmNewPassword});
                  }}
                />
              </ListItem>
              </>
              )}
              <ListItem containerStyle={style.listCont}>
                <View
                  style={{
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    width: wp(85),
                  }}>
                  {this.state.loader ? (
                    <ActivityIndicator color="#1b224d" />
                  ) : (
                    <TouchableOpacity
                      style={style.buttons}
                      onPress={this.onPressSave}>
                      <Text style={style.buttonText}>Save</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={style.buttons}
                    onPress={() => {
                      
                      this.props.newProps.goBack();
                    }}>
                    <Text style={style.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ListItem>
            </View>
          ) : (
            <Error height={hp(100) / 1.55} width={'100%'} />
          )}
        </View>
      </ScrollView>
    );
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgImage: {
    height: hp(100),
    resizeMode: 'contain',
    width: '100%',
    alignItems: 'center',
    //  opacity:.3
  },
  accountText: {fontSize: 18, fontWeight: 'bold'},
  accountsCategory: {margin: 10},
  categoryContainer: {
    borderBottomColor: 'silver',
    borderBottomWidth: 2,
    width: wp(85),
    marginTop: hp(5),
  },
  listCont: {
    backgroundColor: 'transparent',
    width: wp(89),
    padding: 4,
    margin: 0,
    paddingTop: hp(2),
  },
  inputCont: {
    borderColor: 'silver',
    borderWidth: 1,
    elevation: 0,
    borderRadius: 20,
    padding: 0,
    height: vScale(39.5),
  },
  contStyle: {margin: 0, padding: 0},
  errorStyle: {height: 0},
  buttons: {
    backgroundColor: '#1b224d',
    width: wp(30),
    height: 40,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  buttonText: {color: '#fff', fontWeight: 'bold'},
  changePhoto: {
    color: '#fff',
    backgroundColor: '#1b224d',
    padding: 5,
    margin: 3,
    borderRadius: 20,
  },
});

const mapStateToProps = (state) => {
  const {
    user: {userProfile},
    root,
  } = state;

  return {
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email,
    adult: state.adult,
    country: userProfile.country,
    bio: userProfile.bio,
    displayName: `${userProfile.firstName} ${userProfile.lastName}`,
    userName: userProfile.username,
    imageUrl: userProfile.profileUrl,
    location: userProfile.location,
    occupation: userProfile.occupation,
    userId: userProfile.userId,
    userToken: userProfile.userToken,
    cover: userProfile.coverUrl,
    birthdate: userProfile.birthdate,
    isEmailPublic: userProfile.isEmailPublic,
    isProfilePrivate: userProfile.isProfilePrivate,
    socialSource: userProfile.socialSource,
    userId: userProfile.userId,
  };
};
const mapDispachToProps = (Dispatch) => {
  return {
    updateUserAndImage: (
      firstName,
      lastName,
      email,
      adult,
      country,
      displayName,
      username,
      imageUrl,
      location,
      occupation,
      about,
      cover,
      dob,
      isEmailPublic,
      isProfilePrivate,
    ) =>
      Dispatch({
        type: 'updateUserAndImage',
        firstName: firstName,
        lastName: lastName,
        email: email,
        adult: adult,
        country: country,
        displayName: displayName,
        username: username,
        imageUrl: imageUrl,
        location: location,
        occupation: occupation,
        about: about,
        cover: cover,
        dob: dob,
        isEmailPublic,
        isProfilePrivate,
      }),
    updateUser: (cover) => Dispatch({type: 'updateCover', cover}),
  };
};
export default connect(mapStateToProps, mapDispachToProps)(EditProfile);

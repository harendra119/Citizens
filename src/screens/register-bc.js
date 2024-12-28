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
  Switch,
  ActivityIndicator,
} from 'react-native';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';
import {Icon} from 'react-native-elements';
import ModalDropdown from 'react-native-modal-dropdown';
import {LoginManager, AccessToken} from 'react-native-fbsdk';
import auth from '@react-native-firebase/auth';
import {socialRegister} from '../backend/apis';
import {createUser} from '../backend/authentication';
import {enabledSettingsAndNotifs} from '../Constants/enabledSettingsAndNotifs';
var PushNotification = require('react-native-push-notification');
var cloudToken = '';
class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      country: 'Country',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      ageCheck: false,
      loader: false,
      showPasword: true,
      showConfirmPassword: true,
      fcm: '',
      isEmailVerified: false,
      isSentEmail:false,
      newUser:null,
    };
    this.toast = React.createRef();
    this.countryDropDown = React.createRef();
  }
  async componentDidMount() {
    SplashScreen.hide();
    // setTimePassed();
    

    const value = await AsyncStorage.getItem('@login');

    if (value != null) {
      // this.props.navigation.navigate("Home")
    } else {
      //  alert(value)
      this.handleFirstConnectivityChange();
    }
    PushNotification.configure({
      onRegister: (token) => {
        cloudToken = token.token;
        this.setState({fcm: token.token});
      },
    });
  }
  onFacebookButtonPress = async () => {
    // Attempt login with permissions
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);

    if (result.isCancelled) {
      this.setState({fbLoader: false});
      throw 'User cancelled the login process';
    }

    // Once signed in, get the users AccesToken
    const data = await AccessToken.getCurrentAccessToken();

    if (data) {
      //

      //
      try {
        let payload = {
          socialId: data.userID,
          socialSource: 'Facebook',
        };
      } catch (e) {
        this.setState({fbLoader: false});
      }
    }
    if (!data) {
      this.setState({fbLoader: false});
      throw 'Something went wrong obtaining access token';
    }

    // Create a Firebase credential with the AccessToken
    const facebookCredential = auth.FacebookAuthProvider.credential(
      data.accessToken,
    );

    // Sign-in the user with the credential
    console.log(facebookCredential, '----');
    return auth().signInWithCredential(facebookCredential);
  };

  toggleAge = () => {
    this.setState({
      ageCheck: !this.state.ageCheck,
    });
  };
  validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    let mailTypes = ['gmail', 'hotmail', 'outllook'];
    let check = re.test(email);
    return check;
  }

  onRegister = async () => {
    const {
      country,
      ageCheck,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    } = this.state;

    this.setState({loader: true});
    if (this.state.ageCheck == false) {
      Toast.show({
        text1: 'Minimum 18 year required!',
        type: 'error',
      });
      this.setState({loader: false});
      return;
    }
    if (country == 'Select country' || country == 'Country') {
      this.setState({loader: false});
      Toast.show({
        text1: 'Please Select you Country.',
        type: 'error',
      });
      return null;
    }
    if (
      firstName != '' &&
      lastName != '' &&
      email != '' &&
      password != '' &&
      confirmPassword != ''
    ) {
      if (!this.validateEmail(email)) {
        this.setState({loader: false});
        Toast.show({
          text1: 'Invalid email pattern!',
          type: 'error',
        });
        return null;
      }
      if (password != confirmPassword) {
        this.setState({loader: false});
        Toast.show({
          text1: "Passwords don't match!",
          type: 'error',
        });
        return null;
      }
      const date = new Date();
      let payload = {
        createdAt: date.valueOf(),
        country,
        firstName,
        lastName,
        email,
        fcm: this.state.fcm,
        displayName: firstName + ' ' + lastName,
        profileUrl: null,
        coverUrl: null,
        followersCount: 0,
        followingCount: 0,
        ...enabledSettingsAndNotifs,
      };
      await createUser(email, password, payload);
      // auth().signOut();
      // this.props.navigation.current.navigate('emailVerification');
      this.setState({loader: false});
    } else {
      this.setState({loader: false});
      Toast.show({
        text1: 'All fields are required!',
        type: 'error',
      });
    }
  };

  verifyEmail = async () => {
    

    this.setState({loader: true});

    const {
      email,
      password
      
    } = this.state;

    if(email && password){
      const {user} = await auth().createUserWithEmailAndPassword(email, pwd);
      this.setState({newUser:user});
      await user.sendEmailVerification();
      this.setState({isSentEmail:true});
      this.setState({loader: false});
      await auth().signOut();
      setInterval(this.setTimePassed, 6000);

    }else{
      this.setState({loader: false});

      Toast.show({
        text1: 'Email and password required',
        type: 'error',
      });
    }

    console.log(email +' '+password)
  }



  setTimePassed() {
    console.log('calling');
    let newUser = null;
    const {
      email,
      password
      
    } = this.state;
    if(email && password){
      auth().onAuthStateChanged(function(newUser) {
        if (newUser) {
          if (newUser.emailVerified === false) {
            console.log('Email Not Verified!');
            // Toast.show({ text: 'Email Not Verified!', position: 'bottom', buttonText: 'Try Again' });
          } else {
    
            console.log('Email is Verified!');
    
          }
        } else {
          console.log('Something went wrong');

          //  Toast.show({ text: 'Something Wrong!', position: 'bottom', buttonText: 'No user is signed in.' }); 
        }
      })
    }
  }

ShowAlertWithDelay=()=>{

  setTimeout(function(){

    //Put All Your Code Here, Which You Want To Execute After Some Delay Time.
    Alert.alert("Alert Shows After 5 Seconds of Delay.")

  }, 5000);


}
  
  render() {
    const {
      country,
      ageCheck,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      showPasword,
      showConfirmPassword,
    } = this.state;
    return (
      <View style={style.container}>
        <ScrollView>
          <ImageBackground
            source={require('../assets/bg.png')}
            resizeMode="cover"
            style={style.bgImage}
            imageStyle={{opacity: 0.3}}>
            <Toast ref={this.toast} style={{zIndex: 9999}} />
            <StatusBar translucent backgroundColor="transparent" />

            <TouchableOpacity
              onPress={() => {
                this.props.navigation.goBack();
              }}
              style={{alignSelf: 'flex-start'}}>
              <Image
                source={require('../assets/backArrow.png')}
                style={style.backArrow}
              />
            </TouchableOpacity>
            <Text style={style.heading}>Let's Get Started!</Text>
            <Text style={{fontSize: 13}}> Join our community.</Text>
            <View style={style.inputContainer}>
              <Image
                source={require('../assets/emailLogo.png')}
                style={style.inputLogo}
              />
              <TextInput
                style={{flex: 1, width: 315, height: 42, color: '#000'}}
                placeholder="First Name"
                underlineColorAndroid="transparent"
                value={firstName}
                onChangeText={(firstName) => {
                  this.setState({firstName});
                }}
              />
            </View>
            <View style={style.inputContainer}>
              <Image
                source={require('../assets/emailLogo.png')}
                style={style.inputLogo}
              />
              <TextInput
                style={{flex: 1, width: 315, height: 42, color: '#000'}}
                placeholder="Last Name"
                underlineColorAndroid="transparent"
                value={lastName}
                onChangeText={(lastName) => {
                  this.setState({lastName});
                }}
              />
            </View>
            <View style={style.inputContainer}>
              <Image
                source={require('../assets/email-01.png')}
                style={style.inputLogo}
              />
              <TextInput
                style={{flex: 1, width: 315, height: 50, color: '#000'}}
                placeholder="Email"
                underlineColorAndroid="transparent"
                value={email}
                onChangeText={(email) => {
                  this.setState({email});
                }}
              />
              {this.state.isSentEmail?<TouchableOpacity
                style={{marginRight: 20}}
                onPress={() => {
                  this.setState({showPasword: !showPasword});
                }}>
                <Icon
                  name={showPasword ? 'verified' : 'verified'}
                  type="materialIcons"
                  size={18}
                  color={'green'}
                />
              </TouchableOpacity>:<></>}
              
            </View>
            <View style={style.inputContainer}>
              <Image
                source={require('../assets/lock.png')}
                style={style.inputLogo}
              />
              <TextInput
                style={{flex: 1, width: 315, height: 42, color: '#000'}}
                placeholder="Password"
                underlineColorAndroid="transparent"
                textContentType={'password'}
                secureTextEntry={showPasword}
                value={password}
                onChangeText={(password) => {
                  this.setState({password});
                }}
              />
              <TouchableOpacity
                style={{marginRight: 20}}
                onPress={() => {
                  this.setState({showPasword: !showPasword});
                }}>
                <Icon
                  name={showPasword ? 'eye' : 'eye-with-line'}
                  type="entypo"
                  size={18}
                />
              </TouchableOpacity>
            </View>
            <View style={style.inputContainer}>
              <Image
                source={require('../assets/lock.png')}
                style={style.inputLogo}
              />
              <TextInput
                style={{flex: 1, width: 315, height: 42, color: '#000'}}
                placeholder="Confirm Password"
                underlineColorAndroid="transparent"
                textContentType={'password'}
                secureTextEntry={showConfirmPassword}
                value={confirmPassword}
                onChangeText={(confirmPassword) => {
                  this.setState({confirmPassword});
                }}
              />
              <TouchableOpacity
                style={{marginRight: 20}}
                onPress={() => {
                  this.setState({showConfirmPassword: !showConfirmPassword});
                }}>
                <Icon
                  name={showConfirmPassword ? 'eye' : 'eye-with-line'}
                  type="entypo"
                  size={18}
                />
              </TouchableOpacity>
            </View>
            
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={[style.inputContainer, {width: wp(38)}]}>
                <ModalDropdown
                  options={['Select country', 'India', 'Canada', 'USA']}
                  dropdownStyle={{
                    width: wp(40),
                    marginTop: hp(-5),
                    height: hp(20),
                  }}
                  ref={this.countryDropDown}
                  defaultValue={country}
                  textStyle={{
                    marginTop: 20,
                    marginLeft: 10,
                    color: 'gray',
                    width: '70%',
                    height: 40,
                    fontSize: 14,
                  }}
                  onSelect={(index, value) => {
                    this.setState({
                      country: value,
                    });
                  }}
                />

                <Icon name="caretdown" type="antdesign" size={12} />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <Text style={{fontSize: 10, color: '#18224f'}}>
                  {' '}
                  Over the age of 18
                </Text>
                <Switch
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={ageCheck ? '#f5dd4b' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={this.toggleAge}
                  value={ageCheck}
                />
              </View>
            </View>

            <View
              style={{
                width: 288,
                alignItems: 'flex-start',
                marginTop: 15,
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#18224f',
                }}>
                By tapping on 'Sign up' you agree to our
                <Text
                  style={{
                    color: 'blue',
                    textDecorationLine: 'underline',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                  onPress={() => {
                    this.props.navigation.push('terms');
                  }}>
                  {' '}
                  Terms & Conditions
                </Text>{' '}
                and{' '}
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: 'bold',

                    color: 'blue',
                    textDecorationLine: 'underline',
                  }}
                  onPress={() => {
                    this.props.navigation.push('privacyPolicy');
                  }}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>

            

            {this.state.loader ? (
              <View
                style={[style.loginButton, {backgroundColor: 'transparent'}]}>
                <ActivityIndicator size={20} color="#18224f" />
              </View>
            ) : (
              !this.state.isEmailVerified ? <TouchableOpacity
              style={{backgroundColor: '#18224f',
              shadowColor: '#000',
              shadowOffset: {width: -5, height: 4},
              shadowOpacity: 0.9,
              shadowRadius: 9,
              elevation: 20,
              width: 150,
              height: 39,
              justifyContent: 'center',
              borderRadius: 25,
              marginTop: hp(5),}}
              onPress={() => {
                this.verifyEmail();
              }}>
              <Text style={style.loginText}>Verify Email</Text></TouchableOpacity>
              :<TouchableOpacity
                style={style.loginButton}
                onPress={() => {
                  this.onRegister();
                }}>
                <Text style={style.loginText}>Sign up</Text>
              </TouchableOpacity>
              
            )}
            {this.state.isSentEmail ?
              (<View style={{
                width: 288,
                alignItems: 'flex-start',
                marginTop: 15,
              }}>
                <Text style={{fontSize: 12}}>We have sent an verification email link on your email.Please verify email.
                {' '} {' '}{' '} {' '}{' '} {' '}
                <Text style={{fontSize: 12,
                      fontWeight: 'bold',
                      alignItems:'flex-end',
                      color: 'blue',
                      textDecorationLine: 'underline',}}>Resend</Text></Text>
                
              </View>):(<></>)
            }
            {/* <View style={{ marginTop: '5%' }}>
                            <Text style={{ fontSize: 15 }}>
                                or register using
                            </Text>
                        </View> */}
            {/* <View style={style.socailContainer}>
                            <TouchableOpacity style={[style.socailButton, { backgroundColor: '#45619d' }]} onPress={this.onFacebookButtonPress} >

                                <Icon name="facebook-f" type="font-awesome" color="#fff" style={style.socailIcon} />
                                <Text style={style.socialButtonText}>Facebook</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[style.socailButton, { backgroundColor: '#1cb7eb' }]} >
                                <Icon name="twitter" type="entypo" color="#fff" style={style.socailIcon} />
                                <Text style={style.socialButtonText}>Twitter</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[style.socailButton, { backgroundColor: '#ea4335' }]} >
                                <Icon name="google" type="font-awesome" color="#fff" style={style.socailIcon} />
                                <Text style={style.socialButtonText}>Google </Text>
                            </TouchableOpacity>
                        </View> */}

 

            

            <View style={{flex: 0.5, flexDirection: 'row', marginTop: 20}}>
              <Text style={{fontSize: 12}}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.goBack();
                }}>
                <Text style={{fontWeight: 'bold', fontSize: 12}}>
                  Sign in here
                </Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </ScrollView>
      </View>
    );
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1, // alignItems: 'center', justifyContent: 'center'
  },
  bgImage: {
    flex: 1,
    resizeMode: 'contain',
    height: hp(100),
    width: '100%',
    alignItems: 'center',
    //  opacity:.3
  },
  backArrow: {
    marginLeft: '7%',
    width: 30.5,
    height: 10,
    marginTop: '10%',
    alignSelf: 'flex-start',
  },
  heading: {fontSize: 19, fontWeight: 'bold', marginTop: hp(5)},
  inputLogo: {
    opacity: 1,
    padding: 10,
    margin: 5,
    height: 21,
    width: 21,
    resizeMode: 'stretch',
    alignItems: 'center',
  },
  inputContainer: {
    marginTop: 10,
    opacity: 1,
    flexDirection: 'row',
    alignContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#000',
    height: 42,
    borderRadius: 25,
    width: wp(80),
    shadowColor: '#000',
    shadowOffset: {width: -5, height: 4},
    shadowOpacity: 0.9,
    shadowRadius: 7,
    elevation: 20,
  },
  loginButton: {
    backgroundColor: '#18224f',
    shadowColor: '#000',
    shadowOffset: {width: -5, height: 4},
    shadowOpacity: 0.9,
    shadowRadius: 9,
    elevation: 20,
    width: 123,
    height: 39,
    justifyContent: 'center',
    borderRadius: 25,
    marginTop: hp(5),
  },
  loginText: {
    color: '#fff',
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 17,
  },
  socailContainer: {
    flexDirection: 'row',
    marginVertical: hp(3),
    width: wp(100),
    justifyContent: 'space-evenly',
  },
  socailIcon: {marginHorizontal: 3},
  socailButton: {
    flexDirection: 'row',
    width: wp(25),
    height: 40,
    justifyContent: 'center',
    borderRadius: 5,
    padding: 8,
    justifyContent: 'space-evenly',
  },
  socialButtonText: {color: '#fff', alignSelf: 'center', fontSize: 12},
});

const mapStateToProps = (state) => {
  return {
    token: state.token,
  };
};
const mapDispachToProps = (Dispatch) => {
  return {
    updateUser: (
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
      token,
      user_id,
      about,
      cover,
      dob,
      followers,
      following,
    ) =>
      Dispatch({
        type: 'updateUser',
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
        token: token,
        user_id: user_id,
        about: about,
        cover: cover,
        dob: dob,
        followers: followers,
        following: following,
      }),
  };
};
export default connect(mapStateToProps, mapDispachToProps)(Register);

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
  Alert,
} from 'react-native';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import EmailVerification from '../screens/emailVerification';

import Toast from 'react-native-toast-message';
import {Icon} from 'react-native-elements';
import {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';
import auth from '@react-native-firebase/auth';
import {loginApi, socailLogin} from '../backend/apis';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {signIn, socialSignin} from '../backend/authentication';
import firestore from '@react-native-firebase/firestore';
import {defaultAlert} from '../Constants/errorLog';
import {enabledSettingsAndNotifs} from '../Constants/enabledSettingsAndNotifs';
import { Platform } from 'react-native';
import { AppleButton, appleAuth } from '@invertase/react-native-apple-authentication';
import {jwtDecode} from 'jwt-decode';
import {decode} from 'base-64';
global.atob = decode;

//google auth credantials
GoogleSignin.configure({
  scopes: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ], // what API you want to access on behalf of the user, default is userName and profile
  webClientId:
    '596631999489-jhc3dgjio2trmjfa4hdc78b5nh1lsgq3.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
  offlineAccess: true,
});
var PushNotification = require('react-native-push-notification');
var cloudToken = '';

class login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      email: '', //'zeeshan@gmail.com',
      password: '', //'12345',
      showPasword: true,
      facebookLoader: false,
      googleLoader: false,
      fcm: '',
      firstName: '',
      lastName: '',
      showAppleName: false,
      emailVerified:true,
      showTerms: false,
      termsAgreed: false
    };
    this.toast = React.createRef();
    console.log(this.props.token, '==-=-=token-=');
  }
  componentWillReceiveProps(nextProps) {
    // console.log(nextProps.route.params.email, '====')
    if (nextProps.route.params != undefined) {
      if (nextProps.route.params.email != undefined) {
        this.setState({email: nextProps.route.params.email});
      }
    }
  }
  getInfoFromToken = (token, uid) => {
    console.log(this.state.fcm, '-----');
    const infoRequest = new GraphRequest(
      '/me',
      {
        parameters: {
          fields: {
            string: 'email,name,first_name,middle_name,last_name', // what you want to get
          },
          access_token: {
            string: token, // put your accessToken here
          },
        },
      },
      async (error, result) => {
        if (error) {
          defaultAlert();
          this.setState({facebookLoader: false});
          console.log(error);
        } else {
          const date = new Date();
          let payload = {
            createdAt: date.valueOf(),
            socialId: result.id,
            socialSource: 'Facebook',
            email: result.email,
            firstName: result.first_name,
            lastName: result.last_name,
            fcm: this.state.fcm,
            displayName: `${result.first_name}${
              result.last_name ? ' ' + result.last_name : ''
            }`,
            profileUrl: null,
            coverUrl: null,
            followersCount: 0,
            followingCount: 0,
            ...enabledSettingsAndNotifs,
          };
          console.log(payload);
          try {
            await socialSignin(payload, uid);
            this.setState({facebookLoader: false});
          } catch (e) {
            this.setState({facebookLoader: false});
          }
        }
      },
      // make sure you define _responseInfoCallback in same class
    );
    new GraphRequestManager().addRequest(infoRequest).start();
  };

  onAuthStateChanged = (user) => {
    console.log(user)
     // alert(JSON.stringify(user))
    // setUser(user);
    // if (initializing) setInitializing(false);
  }


  onAppleButtonPress = async () => {
    const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });
console.log('Apple RES :: ' + JSON.stringify(appleAuthRequestResponse))
  const credentialState = await appleAuth.getCredentialStateForUser(
    appleAuthRequestResponse.user,
  );

  if (credentialState === appleAuth.State.AUTHORIZED) {
    const token = appleAuthRequestResponse.identityToken;
    const nonce = appleAuthRequestResponse.nonce
    this.successAuth(token, nonce, appleAuthRequestResponse);
  }
}


 successAuth = async (token, nonce, fullData) => {
  if (fullData?.fullName?.givenName != null) {
    await AsyncStorage.setItem('APPLE_CRED', JSON.stringify(fullData));
  }
    const decoded = jwtDecode(token);

    if (decoded?.email_verified) {
    //
       
        const retrievedItem = await AsyncStorage.getItem('APPLE_CRED');
        const fullDataFromAsync = JSON.parse(retrievedItem);

        // firstName: fullDataFromAsync
        //             ? fullDataFromAsync?.fullName?.givenName
        //             : '',
        //           lastName: fullDataFromAsync
        //             ? fullDataFromAsync?.fullName?.familyName
        // 
        
        
        const date = new Date();
    let payload = {
      createdAt: date.valueOf(),
      socialSource: 'Apple',
      email: decoded?.email,
      firstName:fullDataFromAsync
                  ? fullDataFromAsync?.fullName?.givenName
                   : '',
      lastName: fullDataFromAsync
      ? fullDataFromAsync?.fullName?.familyName
       : '',
      fcm: this.state.fcm,
      displayName: `${fullDataFromAsync?.fullName?.givenName || ''} ${
        fullDataFromAsync?.fullName?.familyName || ''
      }`,
      profileUrl: null,
      coverUrl: null,
      followersCount: 0,
      followingCount: 0,
      ...enabledSettingsAndNotifs,
    };
    console.log(payload);
    try {
      const appleCredential = auth.AppleAuthProvider.credential(token, nonce);
      const res = await auth().signInWithCredential(appleCredential);
     
      await socialSignin(payload, res.user.uid);
      this.setState({facebookLoader: false});
    } catch (e) {
      this.setState({facebookLoader: false});
    }
    } else {
      alert('Error in Sign in.')
    }
  };

  onFacebookButtonPress = async () => {
    // Attempt login with permissions
    console.log(this.props.token);
    this.setState({facebookLoader: true});
    try {
      console.log('trying fb signin');
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      console.log('result', result);

      if (result.isCancelled) {
        this.setState({fbLoader: false});
        throw 'User cancelled the login process';
      }

      // Once signed in, get the users AccesToken
      const data = await AccessToken.getCurrentAccessToken();
      console.log(data, '==fb token==');
      if (data) {
      }
      if (!data) {
        this.setState({facebookLoader: false});
        throw 'Something went wrong obtaining access token';
      }

      // Create a Firebase credential with the AccessToken
      const facebookCredential = auth.FacebookAuthProvider.credential(
        data.accessToken,
      );

      console.log('facebook credential', facebookCredential);

      // Sign-in the user with the credential
      try {
        const res = await auth().signInWithCredential(facebookCredential);
        this.getInfoFromToken(data.accessToken, res.user.uid);
      } catch (err) {
        defaultAlert();
        this.setState({facebookLoader: false});

        console.log('some shit', err);
      }
    } catch (err) {
      defaultAlert();
      this.setState({facebookLoader: false});

      console.log('error fb signing in', err);
    }
  };

  async componentDidMount() {
    SplashScreen.hide();
    // auth().onAuthStateChanged(this.onAuthStateChanged);
    PushNotification.configure({
      onRegister: (token) => {
        cloudToken = token.token;
        this.setState({fcm: token.token});
      },
    });

   
  }

  googleSigin = async () => {
    this.setState({googleLoader: true});
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      // Get the users ID token
      const {idToken} = userInfo;
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      const date = new Date();
      let payload = {
        createdAt: date.valueOf(),
        socialSource: 'Google',
        email: userInfo.user.email,
        firstName: userInfo.user.givenName,
        lastName: userInfo.user.familyName,
        fcm: this.state.fcm,
        displayName: `${userInfo.user.givenName}${
          userInfo.user.familyName ? ' ' + userInfo.user.familyName : ''
        }`,
        profileUrl: null,
        coverUrl: null,
        followersCount: 0,
        followingCount: 0,
        ...enabledSettingsAndNotifs,
      };

      try {
        const res = await auth().signInWithCredential(googleCredential);
        await socialSignin(payload, res.user.uid);
      } catch (err) {
        this.setState({googleLoader: false});
        defaultAlert();
        console.log('error signing in', err);
      }
    } catch (error) {
      console.log('error-error', error);
      this.setState({googleLoader: false});
      defaultAlert();
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };
  validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }
  onLogin = async () => {
    this.setState({loader: true});
    const {email, password} = this.state;
    if (email != '' && password != '') {
      if (!this.validateEmail(email)) {
        this.setState({loader: false});
         Toast.show({ text1: 'Invalid email pattern ', type: 'error' })
        return null;
      }
      let payload = {
        email,
        password,
        fcm: this.state.fcm,
      };
      try {
        const uid = await signIn(email.trim(), password.trim());
        console.log('uid', uid);
        this.setState({emailVerified: false})
        await firestore().collection('Users').doc(uid).update({
          fcm: this.state.fcm,
        });
        this.setState({loader: false});
      } catch (error) {
        this.setState({loader: false});
      }
    } else {
      this.setState({loader: false});
      Toast.show({ text1: 'All field are required ', type: 'error' })
    }
  };
  render() {
    const {email, password, showPasword} = this.state;
    return this.state.emailVerified ? (
      <View style={style.container}>
        <ScrollView style={{height: hp(100)}}>
          <ImageBackground
            source={require('../assets/bg_screen.gif')}
            resizeMode="cover"
            style={style.bgImage}
            imageStyle={{opacity: 0.3}}>
            <Toast ref={this.toast} style={{zIndex: 999}} />
            <StatusBar translucent backgroundColor="transparent" />
            <Image source={require('../assets/logo.png')} style={style.logo} />
            {/* <View style={style.text}>
              <Text style={style.welcomeText}>Citizens</Text>
            </View> */}
            <View style={style.inputContainer}>
              <Image
                source={require('../assets/emailLogo.png')}
                style={style.inputLogo}
              />
              <TextInput
                style={style.input}
                placeholder="Email"
                underlineColorAndroid="transparent"
                value={email}
                onChangeText={(email) => {
                  this.setState({email});
                }}
              />
            </View>
            <View style={style.inputContainer}>
              <Image
                source={require('../assets/lock.png')}
                style={style.inputLogo}
              />
              <TextInput
                style={style.input}
                placeholder="Password"
                underlineColorAndroid="transparent"
                textContentType={'password'}
                secureTextEntry={showPasword}
                value={password}
                onChangeText={(password) => {
                  this.setState({password});
                }}
                returnKeyType={'send'}
                onSubmitEditing={() => {
                  this.onLogin();
                }}
              />
              <TouchableOpacity
                style={{marginRight: 20}}
                onPress={() => {
                  this.setState({showPasword: !showPasword});
                }}>
                <Text style={style.forgotContainergotText}>
                  {showPasword ? 'Show' : 'Hide'}
                </Text>
               
              </TouchableOpacity>
            </View>
            <View style={style.forgotContainer}>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('forgotPassword');
                }}>
                <Text style={style.forgotContainergotText}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            {this.state.loader ? (
              <View
                style={[style.loginButton, {backgroundColor: 'transparent'}]}>
                <ActivityIndicator size={20} color="#18224f" />
              </View>
            ) : (
              <TouchableOpacity
                style={style.loginButton}
                onPress={() => {
                  this.onLogin();
                }}>
                <Text style={style.loginText}>Sign In</Text>
              </TouchableOpacity>
            )}
            <View style={{marginTop: hp(5)}}>
              <Text style={{fontSize: 15}}>or connect using</Text>
            </View>
            <View style={style.socailContainer}>
              {this.state.facebookLoader ? (
                <ActivityIndicator size={20} color="#18224f" />
              ) : (
                <TouchableOpacity
                  style={[style.socailButton, {backgroundColor: '#45619d'}]}
                  onPress={this.onFacebookButtonPress}>
                  <Icon
                    name="facebook-f"
                    type="font-awesome"
                    color="#fff"
                    style={style.socailIcon}
                  />
                  <Text style={style.socialButtonText}>Facebook</Text>
                </TouchableOpacity>
              )}
              {
                Platform.OS == 'ios' ?
                <TouchableOpacity
                style={[style.socailButton, {backgroundColor: 'white'}]}
                onPress={() => {
                  this.onAppleButtonPress()
                }}>
                <Icon
                  name="apple"
                  type="font-awesome"
                  color="#000"
                  style={style.appleButtonText}
                />
                <Text style={style.appleButtonText}>Apple</Text>
              </TouchableOpacity>
                :
                null
              }
              {this.state.googleLoader ? (
                <ActivityIndicator size={20} color="#18224f" />
              ) : (
                <TouchableOpacity
                  style={[style.socailButton, {backgroundColor: '#ea4335'}]}
                  onPress={() => {
                    this.googleSigin();
                  }}>
                  <Icon
                    name="google"
                    type="font-awesome"
                    color="#fff"
                    style={style.socailIcon}
                  />
                  <Text style={style.socialButtonText}>Google </Text>
                </TouchableOpacity>
              )}
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
                By tapping on 'Sign In' or Connection using any Social Media, you agree to our
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
            <View style={{height: 30}}/>
            <View style={style.rowcreate}>
              <Text style={{fontSize: 12}}>{`Don’t have an account?`} </Text>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('register');
                }}>
                <Text style={{fontWeight: 'bold', fontSize: 12}}>
                  Create One
                </Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </ScrollView>
        {
          this.state.showAppleName ? 
          <View
          style={{position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          paddingLeft: 0,
        zIndex: 999,
        backgroundColor: 'white',
        justifyContent: 'center',
        paddingLeft: 40,
        paddingRight: 40

        }}
          >
           
            <TextInput
                style={{
                  borderWidth: 1,
                  height: 40,
                  borderRadius: 20,
                  marginBottom: 20,
                  paddingLeft: 10
                }}
                placeholder="Enter First name*"
                underlineColorAndroid="transparent"
                value={this.state.firstName}
                onChangeText={(fNAme) => {
                  this.setState({firstName: fNAme});
                }}
              />
              <TextInput
               style={{
                borderWidth: 1,
                height: 40,
                borderRadius: 20,
                marginBottom: 20,
                paddingLeft: 10
              }}
                placeholder="Enter Last name*"
                underlineColorAndroid="transparent"
                value={this.state.lastName}
                onChangeText={(lname) => {
                  this.setState({lastName: lname});
                }}
              />
              <TouchableOpacity
                style={[style.loginButton, {
                  alignSelf: 'center'
                }]}
                onPress={() => {
                  if (!this.state.firstName) {
                    Alert.alert('Please enter first name.')
                  } else if (!this.state.lastName) {
                    Alert.alert('Please enter last name.')
                  } else {
                    this.setState({showAppleName: false})
                    this.onAppleButtonPress()
                  }
                }}>
                <Text style={style.loginText}>OK</Text>
              </TouchableOpacity>
          </View>
          :
          null
        }
      </View>
    ):<EmailVerification parentToChild={{email:this.state.email,password:this.state.password}} /> 
    ;
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
  logo: {
    width: 80,
    height: 80,
    marginTop: '20%'
  },
  text: {
    opacity: 1,
    justifyContent: 'center',
    marginTop: hp(5),
    width: '100%',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 19,
    fontWeight: 'bold',
    opacity: 0.9,
  },
  rowcreate: {flex: 0.5, flexDirection: 'row'},
  input: {flex: 1, width: 315, height: 42, color: '#000'},
  inputLogo: {
    opacity: 1,
    padding: 10,
    margin: 5,
    height: 25,
    width: 25,
    resizeMode: 'stretch',
    alignItems: 'center',
  },
  inputContainer: {
    opacity: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#000',
    height: 42,
    borderRadius: 25,
    margin: 10,
    width: 315,
    shadowColor: '#000',
    shadowOffset: {width: -5, height: 4},
    shadowOpacity: 0.9,
    shadowRadius: 7,
    elevation: 20,
  },
  forgotContainer: {
    opacity: 1,
    alignItems: 'flex-end',
    width: wp(75),
    fontWeight: 'bold',
  },
  forgotContainergotText: {
    fontWeight: 'bold',
    fontSize: 12,
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
  appleButtonText: {color: '#000', alignSelf: 'center', fontSize: 12},
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
      showEmail,
      profilePublic,
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
        showEmail,
        profilePublic,
      }),
  };
};
export default connect(mapStateToProps, mapDispachToProps)(login);

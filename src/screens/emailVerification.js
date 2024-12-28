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
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {connect} from 'react-redux';
import Toast from 'react-native-toast-message';
import {updatePassword} from '../backend/apis';
import {sendVerificationEmail} from '../backend/authentication';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

class login extends Component {
  constructor(props) {
    console.log('ham to aise hi hai bhaiya.....................', props.parentToChild);
    super(props);
    this.state = {
      loader: false,
      email: props.parentToChild.email,
      password: props.parentToChild.password,
    };
    this.toast = React.createRef();
  }

  async componentDidMount() {
  }
  sendMail = async () => {
    auth().signOut();
    sendVerificationEmail(this.state.email,this.state.password)
  };
  render() {
    const {email, password} = this.state;
    return (
      <View style={style.container}>
        <ScrollView style={{height: hp(100), width: wp(100)}}>
          <ImageBackground
            source={require('../assets/bg.png')}
            resizeMode="cover"
            style={style.bgImage}
            imageStyle={{opacity: 0.3}}>
            <Toast ref={this.toast} style={{zIndex: 999}} />
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
            <Text style={style.forgotText}> Email Verification!</Text>
            <Text style={{fontSize: 13}}>
              {' '}
              {' '}
              {' '}
              We have Sent an email on your email ID {' '}
            </Text>
            <Text style={{fontSize: 13}}>
              {' '}
              Please Verify your email.{' '}
            </Text>
            <View style={{marginTop: '10%'}}></View>
            {/* <View style={style.inputContainer}>
              <Image
                source={require('../assets/email-01.png')}
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
            </View> */}
            <View style={{marginTop: '10%'}}>
              {this.state.loader ? (
                <View
                  style={[style.loginButton, {backgroundColor: 'transparent'}]}>
                  <ActivityIndicator size={20} color="#18224f" />
                </View>
              ) : (
                <TouchableOpacity
                  style={{backgroundColor: '#18224f',
                  shadowColor: '#000',
                  shadowOffset: {width: -5, height: 4},
                  shadowOpacity: 0.9,
                  shadowRadius: 9,
                  elevation: 20,
                  width: 300,
                  height: 39,
                  justifyContent: 'center',
                  borderRadius: 25,}}
                  onPress={() => {
                    this.sendMail();
                  }}>
                  <Text style={style.buttonText}>Resend Verification Link</Text>
                </TouchableOpacity>
              )}
            </View>
          </ImageBackground>
        </ScrollView>
      </View>
    );
  }
}
const style = StyleSheet.create({
  container: {
    backgroundColor:'yellow',
    flex: 1,
    // alignItems: 'center',
    justifyContent: 'center',
    
  },
  bgImage: {
    height: hp(100),
    resizeMode: 'contain',
    width: '100%',
    alignItems: 'center',
    //  opacity:.3
  },
  input: {flex: 1, width: 315, height: 42, color: '#000'},
  buttonText: {
    color: '#fff',
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 17,
  },
  button: {
    backgroundColor: '#18224f',
    shadowColor: '#000',
    shadowOffset: {width: -5, height: 4},
    shadowOpacity: 0.9,
    shadowRadius: 9,
    elevation: 20,
    width: 200,
    height: 39,
    justifyContent: 'center',
    borderRadius: 25,
  },
  logo: {
    width: 150,
    height: 150,
    marginTop: '12%',
    opacity: 0.9,
  },
  forgotText: {fontSize: 19, fontWeight: 'bold', marginTop: '10%'},

  backArrow: {
    marginLeft: '7%',
    width: 30.5,
    height: 10,
    marginTop: '10%',
    alignSelf: 'flex-start',
  },
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
});
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
      }),
  };
};
export default connect(null, mapDispachToProps)(login);

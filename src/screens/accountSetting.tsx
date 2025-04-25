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
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';
import EditProfile from '../screens/editProfile';
import Header from '../components/header';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
const GOOGLE_MAPS_APIKEY = 'AIzaSyC7CIPvijgTEI0y3lIHTywQ-m6XROiep78';

import General from './settings/General';
import Notifications from './settings/Notifications';

import {ListItem} from 'react-native-elements';
class login extends Component {
  constructor(props) {
    super(props);
    console.log('props -------',props);
    this.state = {
      userImage:
        this.props.imageUrl != null
          ? this.props.imageUrl
          : 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png',
      accounts: [
        {
          name: 'General',
          selected: false,
        },
        {
          name: 'Edit Profile',
          selected: true,
        },
        {
          name: 'Notifications',
          selected: false,
        },
      ],
      selectedCategory: 1,
      search: '',
    };
    this.toast = React.createRef();
  }
  componentDidMount() {
    SplashScreen.hide();
  }
  selectCategory = (index) => {
    let tempArray = this.state.accounts;
    for (let i = 0; i < tempArray.length; i++) {
      if (i == index) {
        tempArray[i].selected = true;
        //   break;
      } else {
        tempArray[i].selected = false;
      }
    }
    this.setState({accounts: tempArray, selectedCategory: index});
  };
  render() {
    const {accounts, selectedCategory, search} = this.state;
    return (
      <View style={style.container}>
        <Header navigation={this.props.navigation} otherProfile={false} />
        <Toast ref={this.toast} style={{zIndex: 9999}} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <StatusBar translucent backgroundColor="transparent" />
          <View style={{flexDirection: 'row', marginTop: hp(2)}}>
            <View
              style={{
                borderLeftColor: '#30334b',
                borderLeftWidth: 3,
                marginRight: 10,
              }}></View>
            <Text style={style.settingText}>Account Settings</Text>
          </View>
          <ScrollView
            horizontal
            style={style.categoryContainer}
            showsHorizontalScrollIndicator={false}>
            {accounts.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    style.accountsCategory,
                    {
                      borderBottomColor: '#30334b',
                      borderBottomWidth: item.selected ? 2 : 0,
                    },
                  ]}
                  onPress={() => {
                    this.selectCategory(index);
                  }}>
                  <Text style={style.accountText}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {selectedCategory == 1 && (
            <EditProfile
              newProps={this.props.navigation}
              toastRef={this.toast}
            />
          )}
          {selectedCategory == 0 && (
            <General navigation={this.props.navigation} />
          )}
          {selectedCategory == 2 && (
            <Notifications navigation={this.props.navigation} />
          )}
        </ScrollView>
      </View>
    );
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
    backgroundColor: '#fff'
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
  settingText: {fontSize: 20, fontWeight: 'bold'},
  categoryContainer: {
    borderBottomColor: 'silver',
    borderBottomWidth: 2,

    marginTop: hp(1),
  },
});

const mapStateToProps = (state) => {
  return {
    firstName: state.firstName,
    lastName: state.lastName,
    email: state.email,
    adult: state.adult,
    country: state.country,
    bio: state.bio,
    displayName: state.displayName,
    userName: state.userName,
    imageUrl: state.imageUrl,
    location: state.occupation,
    occupation: state.occupation,
    userId: state.userId,
    userToken: state.userToken,
  };
};
export default connect(mapStateToProps, null)(login);

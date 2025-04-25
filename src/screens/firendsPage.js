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
import FriendRequest from '../screens/friendsRequest';
import SHowFriends from '../screens/showFirends';
import SHowFollowers from '../screens/showFollowers';
import SHowFollowing from '../screens/showFollowing';
import Header from '../components/header';
import Utility from '../utils/Utility';
class friendsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userImage:
        this.props.imageUrl != null
          ? this.props.imageUrl
          : 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png',
      accounts: [
        {
          name: 'Friends',
          selected: false,
        },
        {
          name: 'Friend Requests',
          selected: true,
        },
        {
          name: 'Followers',
          selected: false,
        },
        {
          name: 'Following',
          selected: false,
        },
      ],
      selectedCategory: 1,
      search: '',
    };
    this.toast = React.createRef();
  }
  componentDidMount() {
    if (Utility.getReqIndex()) {
      Utility.setReqIndex(false);
      this.selectCategory(1);
    }
  }

  selectCategory = (index) => {
    console.log(index);
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
    console.log('firend page', this.props);
    return (
      <View style={style.container}>
        <Header navigation={this.props.navigation} otherProfile={false} />
        <Toast ref={this.toast} style={{zIndex: 9999}} />
        <ScrollView>
          <StatusBar translucent backgroundColor="transparent" />
          <View style={{flexDirection: 'row', marginTop: hp(2)}}>
            <View
              style={{
                borderLeftColor: '#30334b',
                borderLeftWidth: 3,
                marginRight: 10,
              }}></View>
            <Text style={style.settingText}>Friends</Text>
          </View>
          <ScrollView horizontal style={style.categoryContainer}>
            {accounts.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    style.accountsCategory,
                    {
                      borderBottomColor: '##30334b',
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
            <FriendRequest
              newProps={this.props.navigation}
              toastRef={this.toast}
            />
          )}
          {selectedCategory == 0 && (
            <SHowFriends
              newProps={this.props.navigation}
              toastRef={this.toast}
              userId={this.props.userId}
              navigate={(data) => {
                this.props.navigation.navigate('otherProfile', {
                  userId: data.userId,
                });
              }}
            />
          )}
          {selectedCategory == 2 && (
            <SHowFollowers
              newProps={this.props.navigation}
              toastRef={this.toast}
            />
          )}
          {selectedCategory == 3 && (
            <SHowFollowing
              newProps={this.props.navigation}
              toastRef={this.toast}
            />
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
    backgroundColor: 'white'
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
    width: wp(90),
    marginTop: hp(1),
  },
});

const mapStateToProps = (state) => {
  const {root, user} = state;
  const {userProfile} = user;
  return {
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email,
    adult: state.adult,
    country: userProfile.country,
    bio: userProfile.bio,
    displayName: userProfile.displayName,
    userName: userProfile.username,
    imageUrl: userProfile.profileUrl,
    location: userProfile.location,
    occupation: userProfile.occupation,
    userId: userProfile.userId,
    userToken: userProfile.userToken,
  };
};
export default connect(mapStateToProps, null)(friendsPage);

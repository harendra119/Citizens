import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  Keyboard,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

import {connect} from 'react-redux';

import {getFollowing} from '../backend/friends';
import {
  Icon,
  Avatar,
  ListItem,
  Button,
  Header,
  SearchBar,
  Overlay,
} from 'react-native-elements';
import auth from '@react-native-firebase/auth';
import Loader from '../components/loader';
import Error from '../components/error';

import UserRow from '../components/listItem';
import Toast from 'react-native-toast-message';
import {renderInitials} from './activism/ActivismDetails';
class HeaderClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: this.props.search,
      users: [],
      error: false,
      loader: false,
      userFollowers: [],
      filteredList: [],
    };
    this.toast = React.createRef();
  }

  componentDidMount() {
    console.log(this.props.userId);

    this.getFollowing();
  }

  getFollowing = async () => {
    try {
      this.setState({loader: true});
      const result = await getFollowing(this.props.userId);
      console.log(result);
      this.setState({
        userFollowers: result,
        filteredList: result,
        loader: false,
      });
      // console.log('friendRequests', result);
    } catch (error) {
      this.setState({loader: false, error: true});
      console.log('error while getting friend requests', error);
    }
  };

  filterFollowerData = (userDetails) => {
    
    return userDetails.filter((obj) => obj.userId != this.props.userId);
  };
  

  renderItem = ({item, index}) => {
    console.log('item', item);
    const data = this.filterFollowerData(item.userData)[0];
    // console.log('data', data);
    return (
      <ListItem
        containerStyle={{margin: 5, padding: 5}}
        onPress={() => {
          this.props.newProps.navigate('otherProfile', {
            userId: data.userId,
          });
        }}>
        {data.profileUrl ? (
          <Avatar
            source={{
              uri:
                data.profileUrl == null
                  ? 'https://seller.tools/wp-content/themes/sellertools/assets/images/placeholder.png'
                  : data.profileUrl,
            }}
            rounded
          />
        ) : (
          <View style={style.avatar}>
            <Text>{renderInitials(data?.displayName)}</Text>
          </View>
        )}
        <ListItem.Content>
          <ListItem.Title style={{fontSize: 10}}>
            {data.displayName}
          </ListItem.Title>
          {data?.occupation != null && data?.occupation != 'null' && (
            <ListItem.Subtitle style={{fontSize: 10}}>
              {data?.occupation}
            </ListItem.Subtitle>
          )}
          {data?.about != null && data?.about != 'null' && (
            <ListItem.Subtitle style={{fontSize: 10}}>
              {data?.about}
            </ListItem.Subtitle>
          )}
        </ListItem.Content>
      </ListItem>
    );
  };

  renderEmptyList = () => {
    return (
      <View
        style={{
          flex: 1,
          alignContent: 'center',
          justifyContent: 'center',
          height: hp(100) / 1.8,
        }}>
        <Text style={{textAlign: 'center'}}></Text>
      </View>
    );
  };
  render() {
    const {loader, error, search} = this.state;
    return (
      <View style={{flex: 1}}>
        <SearchBar
          placeholder="Search"
          containerStyle={{
            backgroundColor: 'transparent',
            borderTopColor: '#fff',
            borderWidth: 0,
            borderBottomColor: '#fff',
            marginTop: 5,
          }}
          onChangeText={(search) => {
            this.setState({search}, () => {
              if (!search) {
                this.setState({filteredList: [...this.state.userFollowers]});
              }
              let tempArray = [];
              this.state.userFollowers.find((element) => {
                const data = this.filterFollowerData(element.userData)[0];

                if (
                  data.displayName.toLowerCase().indexOf(search.toLowerCase()) >
                  -1
                ) {
                  tempArray.push(element);
                }
              });
              this.setState({
                filteredList: tempArray,
              });
            });
          }}
          value={search}
        />

        {loader ? (
          <Loader />
        ) : error ? (
          <Error />
        ) : (
          <FlatList
            data={this.state.filteredList}
            renderItem={this.renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{paddingBottom: 20}}
            ListEmptyComponent={this.renderEmptyList}
          />
        )}
      </View>
    );
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {width: wp(100), height: hp(20)},
  image: {
    alignSelf: 'center',
    borderColor: '#1b224d',
    borderWidth: 2,
  },
  listCont: {
    backgroundColor: 'transparent',
    width: wp(100),
    padding: 4,
    margin: 0,
  },
  userTitle: {alignSelf: 'center', fontSize: 18, fontWeight: 'bold'},
  nickName: {alignSelf: 'center', fontSize: 14, color: '#000'},
  row: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    marginVertical: 5,
    width: wp(80),
    alignSelf: 'center',
  },
  innerRow: {flexDirection: 'row', alignItems: 'center'},
  secondRow: {flexDirection: 'row', alignItems: 'center'},
  innerText: {margin: 5, fontSize: 10},
  buttonStyle: {height: 30, backgroundColor: 'transparent'},
  buttonCont: {
    backgroundColor: '#1e2348',
    width: wp(35),
    height: 30,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: hp(2),
    alignItems: 'center',
  },
  categoryContainer: {marginTop: hp(1), alignSelf: 'center'},
  accountsCategory: {margin: 10},
  accountText: {fontSize: 16, fontWeight: '600'},
  bannerBottom: {
    flexDirection: 'row',
    marginBottom: 5,
    marginRight: 20,
    alignSelf: 'flex-end',
    marginTop: hp(2),
  },
  avatar: {
    height: hp(5),
    width: hp(5),
    borderRadius: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d9d9d9',
    padding: 0,
    margin: 0,
  },
  bannerIcon: {
    backgroundColor: '#1e2348',
    padding: 3,
    borderRadius: 100,
    margin: 5,
  },
  headerCont: {
    width: wp(61),
    backgroundColor: 'transparent',
    elevation: 0,
    borderWidth: 0,
    padding: 0,
  },
  headerINput: {height: hp(5), borderRadius: 20},
  acceptReject: {padding: 0, width: wp(30), margin: 5},
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
    adult: userProfile.adult,
    country: userProfile.country,
    bio: userProfile.bio,
    userName: userProfile.userName,
    displayName: `${userProfile.firstName} ${userProfile.lastName}`,
    imageUrl: userProfile.profileUrl,
    location: userProfile.location,
    cover: userProfile.cover,
    birthdate: userProfile.birthdate,
    occupation: userProfile.occupation,
    userId: auth().currentUser?.uid,
  };
};
const mapDispachToProps = (Dispatch) => {
  return {
   // toggoleDrawer: () => Dispatch({type: 'toggoleDrawer'}),
    // addSearch: (search) => Dispatch({type: 'addSearch', search: search}),
    //setAlluser: (users) => Dispatch({type: 'setAlluser', users: users}),
    // closeSearchFilter: () => Dispatch({type: 'closeSearchFilter'}),
    addUserFollowers: (followers) =>
      Dispatch({type: 'addUserFollowers', followers}),
  };
};

export default connect(mapStateToProps, mapDispachToProps)(HeaderClass);

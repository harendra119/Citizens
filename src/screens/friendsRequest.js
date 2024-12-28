import React, {Component, useState} from 'react';
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
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import {connect} from 'react-redux';

import {getFriednRequest, resPondRequest} from '../backend/apis';
import {
  Icon,
  Avatar,
  ListItem,
  Button,
  Header,
  SearchBar,
  Overlay,
} from 'react-native-elements';
import UserRow from '../components/listItem';
import Toast from 'react-native-toast-message';
import {
  getFriendRequests,
  respondFriendRequest,
  follow,
} from '../backend/friends';
import Loader from '../components/loader';
import Error from '../components/error';
import RoundImage from '../components/roundImage';

class HeaderClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: this.props.search,
      users: [],
      loader: false,
      error: false,
    };
    this.toast = React.createRef();
  }
  componentDidMount() {
    this.getFriendRequests();
  }

  getFriendRequests = async () => {
    try {
      this.setState({loader: true});
      const result = await getFriendRequests(this.props.userId);
      this.setState({users: result, loader: false});
      console.log('friendRequests', result);
    } catch (error) {
      this.setState({loader: false, error: true});
      console.log('error while getting friend requests', error);
    }
  };

  respondToFriendRequest = async (docId, index) => {
    try {
      const ref = firestore().collection('Friends').doc(docId);
      const res = await ref.get();

      //follow stuff
      const data = res.data();
      const userid1 = data?.sendBy?.userId;
      const userid2 = this.props?.userId;
      const followRes = await firestore()
        .collection('Follows')
        .where('identifiers', 'array-contains-any', [
          `${userid1}_${userid2}`,
          `${userid2}_${userid1}`,
        ])
        .get();
      const followData = followRes.docs[0].data();
      const payload = {
        identifiers: [`${userid1}_${userid2}`, `${userid2}_${userid1}`],
        users: [userid1, userid2],
        userData: [
          {
            userId: userid1,
            profileUrl: data?.sendBy?.profileUrl || null,
            displayName: `${data?.sendBy?.displayName}`,
          },
          {
            userId: userid2,
            profileUrl: this.props.imageUrl || null,
            displayName: this.props.displayName,
          },
        ],
        isFollowedByOtherUser: {
          [userid1]: true,
          [userid2]: followData?.isFollowedByOtherUser?.[userid2] || false,
        },
        isFollowingOtherUser: {
          [userid1]: followData?.isFollowedByOtherUser?.[userid2] || false,
          [userid2]: true,
        },
      };
      await follow({
        payload,
        currentUserId: userid2,
        otherUserId: userid1,
      });

      const result = await respondFriendRequest({status: 'accepted', ref});
      const tempArr = [...this.state.users];
      tempArr[index] = {...tempArr[index], accepted: true};
      this.setState({users: tempArr});
    } catch (error) {
      console.log('error while accepting friend request', error);
      alert('Something went wrong!');
    }
  };

  declineReq = async (docId, index) => {
    try {
      const ref = firestore().collection('Friends').doc(docId);
      await ref.delete();
      const tempArr = this.state.users;
      tempArr.splice(index, 1);
      this.setState({users: tempArr});
    } catch (error) {
      console.log('error while declining friend request', error);
      alert('Something went wrong!');
    }
  };

  renderItem = ({item, index}) => {
    console.log(item, '-==-=-=');
    console.log(item.sendBy.displayName);
    return (
      <ListItem
        containerStyle={{margin: 0, padding: 5}}
        onPress={() => {
          this.props.newProps.navigate('otherProfile', {
            userId: item.sendBy.userId,
          });
        }}>
        <RoundImage
        userId={item.sendBy.userId}
          displayName={item.sendBy.displayName}
          imageUrl={item.sendBy.profileUrl}
        />
        <ListItem.Content>
          <ListItem.Title style={{fontSize: 10}}>
            {item.sendBy.displayName}
          </ListItem.Title>
        </ListItem.Content>
        <View style={([style.bannerBottom], {flexDirection: 'column'})}>
          {item?.accepted ? (
            <Button
              title="Accepted"
              buttonStyle={[style.acceptReject, {backgroundColor: '#18224f'}]}
              disabled={true}
            />
          ) : (
            <View style={{flexDirection: 'row'}}>
              <Button
                title="Accept"
                buttonStyle={[style.acceptReject, {backgroundColor: '#18224f'}]}
                onPress={() => {
                  this.respondToFriendRequest(item.id, index);
                }}
              />
              <Button
                title="Decline"
                buttonStyle={[style.acceptReject, {backgroundColor: 'red'}]}
                onPress={() => {
                  this.declineReq(item.id, index);
                }}
              />
            </View>
          )}
        </View>
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
          height: hp(100) / 1.5,
        }}>
        <Text style={{textAlign: 'center'}}>No Pending Requests....</Text>
      </View>
    );
  };
  render() {
    const {loader, error} = this.state;
    return (
      <View style={{flex: 1}}>
        {loader ? (
          <Loader />
        ) : error ? (
          <Error />
        ) : (
          <FlatList
            data={this.state.users}
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
  headerINput: {height: hp(5), borderRadius: 20},
  acceptReject: {padding: 0, width: wp(20), margin: 2},
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
    toggoleDrawer: () => Dispatch({type: 'toggoleDrawer'}),
    //addSearch: (search) => Dispatch({type: 'addSearch', search: search}),
   // setAlluser: (users) => Dispatch({type: 'setAlluser', users: users}),
    // closeSearchFilter: () => Dispatch({type: 'closeSearchFilter'}),
    addUserFriendRequest: (friendRequest) =>
      Dispatch({type: 'addUserFriendRequest', friendRequest}),
  };
};

export default connect(mapStateToProps, mapDispachToProps)(HeaderClass);

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
import {scale, mScale, vScale} from '../configs/size';

import {Avatar, ListItem, SearchBar, Icon} from 'react-native-elements';
import {getFriends} from '../backend/friends';
import Error from '../components/error';
import Loader from '../components/loader';
import auth from '@react-native-firebase/auth';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import RoundImage from '../components/roundImage';

class HeaderClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      userFirends: [],
      users: [],
      loader: false,
      error: false,
      filteredList: [],
      optionSelected:-1,
      friendDocRef: null,
      

      
    };

    this.toast = React.createRef();
  }

  componentDidMount() {
    if (!this.props.isProfilePrivate) {
      this.getFriends();
    }
  }

  getFriends = async () => {
    try {
      this.setState({loader: true});
      const userId = this.props.userId || this.props.uid;
      console.log('userId', userId);
      const result = await getFriends(userId);
      this.setState({userFirends: result, filteredList: result, loader: false});
    } catch (error) {
      this.setState({loader: false, error: true});
      console.log('error while getting friend requests', error);
    }
  };

  friendDocReffun = async(id)=>{
    
    const userid1 = id;
    const userid2 = this.props.userId || this.props.uid;
   
    try {
  

      this.setState({loader: true});
      firestore()
        .collection('Friends')
        .where('identifiers', 'array-contains-any', [
          `${userid1}_${userid2}`,
          `${userid2}_${userid1}`,
        ])
        .onSnapshot(
          (snap) => {
            if (snap?.empty) {
              this.setState({friendDocRef: null});
            } else if (snap.docs.length == 1) {
              firestore().runTransaction(async (transaction) => {
                const snapshot = await transaction.get(snap.docs[0].ref);
                if (snapshot.data().areFriends == true) {
                  snapshot.data().users.map((id) => {
                    transaction.update(firestore().collection('Users').doc(id), {
                      friendsCount: firestore.FieldValue.increment(-1),
                    });
                  });
                  return transaction.update(snap.docs[0].ref, {areFriends: false, status: null});
                } else {
                  throw 'User cancelled this request';
                }
              });
              

            }
          },
          (err) => {
            this.setState({loader: false});
          },
        );
    } catch (error) {
      alert(error);
    }

  };

  unFirend = async(friendId) => {
    this.setState({loader: true});
    try {
      this.setState({loader: true});
      const userId = this.props.userId || this.props.uid;
      await this.friendDocReffun(friendId);
      setTimeout(() => {
        this.getFriends()
      }, 2000);


    } catch (error) {
      
      this.setState({loader: false});
    }
  };


  filterFollowerData = (userDetails) => {
    return userDetails.filter((obj) => obj.userId != this.props.userId);
  };

  setOptionSelected(index){
    if (this.state.optionSelected > -1) {

      this.setState({
        optionSelected: -1,
      });
    }else {

    this.setState({
      optionSelected: index,
    });
    }
  }

  getFriendsRef(index){
    return 1;
  }

  renderItem = ({item, index}) => {
    const data = this.filterFollowerData(item.userData)[0];
    console.log('friends', index);
    return (
      <ListItem
        containerStyle={{margin: 5, padding: 5}}
        onPress={() => this.props.navigate(data)}>
          <RoundImage
        userId={data?.userId}
        imageUrl={data.profileUrl }
        displayName={data?.displayName}
        size={50}
      />
        <ListItem.Content>
          <ListItem.Title style={{fontSize: 10}}>
            {data.displayName}
          </ListItem.Title>
          {data?.occupation != null && data?.occupation != 'null' && (
            <ListItem.Subtitle style={{fontSize: 10}}>
              {item?.occupation || ''}
            </ListItem.Subtitle>
          )}
          {data?.about != null && data?.about != 'null' && (
            <ListItem.Subtitle style={{fontSize: 10}}>
              {data?.about || ''}
            </ListItem.Subtitle>
          )}
        </ListItem.Content>
         <TouchableOpacity onPress={() => this.setOptionSelected(index)}>
          <Icon
            name="ellipsis-vertical"
            type="ionicon"
            size={14}
            color="#333"
            style={{padding: 5}}
          />
        </TouchableOpacity>
        {this.state.optionSelected == index && (
          <TouchableOpacity
            onPress={() => this.unFirend(data?.userId)}
            style={style.btn}>
            <Text>Unfriend</Text>
          </TouchableOpacity>
        )}
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
        <Text style={{textAlign: 'center'}}>No Users Found</Text>
      </View>
    );
  };

  render() {
    const {search, userFirends, error, loader} = this.state;
    const {renderHeader} = this.props;
    const renderCombinedHeader = () => (
      <>
        {typeof renderHeader == 'function' ? renderHeader() : null}
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
                this.setState({filteredList: [...this.state.userFirends]});
              }
              let tempArray = [];
              this.state.userFirends.find((element) => {
                const data = this.filterFollowerData(element.userData)[0];

                if (
                  data.displayName.toLowerCase().indexOf(search.toLowerCase()) >
                  -1
                ) {
                  tempArray.push(element);
                }
              });
              console.log('tempArray', tempArray);
              this.setState({
                filteredList: tempArray,
              });
            });
          }}
          value={search}
        />
      </>
    );

    return (
      <View style={{flex: 1}}>
        {loader ? (
          <Loader />
        ) : error ? (
          <Error />
        ) : (
             <>
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
                     this.setState({filteredList: [...this.state.userFirends]});
                   }
                   let tempArray = [];
                   this.state.userFirends.find((element) => {
                     const data = this.filterFollowerData(element.userData)[0];

                     if (
                       data.displayName.toLowerCase().indexOf(search.toLowerCase()) >
                       -1
                     ) {
                       tempArray.push(element);
                     }
                   });
                   console.log('tempArray', tempArray);
                   this.setState({
                     filteredList: tempArray,
                   });
                 });
               }}
               value={search}
             />
          <FlatList
            data={this.state.filteredList}
            renderItem={this.renderItem}
            // ListHeaderComponent={renderCombinedHeader}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{paddingBottom: 20}}
            ListEmptyComponent={this.renderEmptyList}
          />
             </>
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
  headerCont: {
    width: wp(61),
    backgroundColor: 'transparent',
    elevation: 0,
    borderWidth: 0,
    padding: 0,
  },
  headerINput: {height: hp(5), borderRadius: 20},
  acceptReject: {padding: 0, width: wp(30), margin: 5},
  btn: {
    position: 'absolute',
    right: scale(40),
    top: vScale(10),
    borderColor: '#8c8c8c',
    borderWidth: 1,
    borderRadius: scale(5),
    padding: scale(5),
    paddingVertical: vScale(2),
  }
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
    uid: userProfile.userId,
  };
};
const mapDispachToProps = (Dispatch) => {
  return {
    // toggoleDrawer: () => Dispatch({type: 'toggoleDrawer'}),
    // addSearch: (search) => Dispatch({type: 'addSearch', search: search}),
    // setAlluser: (users) => Dispatch({type: 'setAlluser', users: users}),
    // closeSearchFilter: () => Dispatch({type: 'closeSearchFilter'}),
    addUserFirend: (firends) => Dispatch({type: 'addUserFirend', firends}),
  };
};

export default connect(mapStateToProps, mapDispachToProps)(HeaderClass);

import React, { Component } from 'react';
import {
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

import { connect } from 'react-redux';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  Header,
  Icon,
  Overlay,
  SearchBar
} from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUsers } from '../backend/apis';
import { scale, vScale } from '../configs/size';
import Utility, { DEVICE_HEIGHT } from '../utils/Utility';
import UserRow from './listItem';
import RoundImage from './roundImage';

class HeaderClass extends Component {
  _isMounted = false;
  _searchViewRef;
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      users: [],
      checked_id:1,
      isSearchOn: false
    };
  }
  componentDidMount() {
    this._isMounted = true;
    getUsers().then((data) => {
      if (data.success) {
        this.props.setAlluser(data.data);
      }
    });
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  renderItem = ({item}) => (
    <UserRow inHeader={false} item={item} searchType={this.state.checked_id} navigation={this.props.navigation} onclose={() => {
      this.setState({isSearchOn:false})
      if (this._searchViewRef)
      this._searchViewRef.focus();
    }}/>
  );
  renderEmptyList = () => {
    return (
      <View
        style={{
          flex: 1,
          alignContent: 'center',
          justifyContent: 'center',
          height: hp(100) / 3,
        }}>
        <Text style={{ textAlign: 'center' }}>No data found....</Text>
      </View>
    );
  };
  getFiveResult = (search) => {
    console.log(search, '----');
    if (search == '') {
      this.props.setOnlyFiveArray([]);
      return null;
    }
    if(this.state.checked_id==2){
      firestore()
      .collection('Users')
      // .where('displayName', '==', search)
      .orderBy('displayName')
      .startAt(search).endAt(search + '~')
      .get()
      .then((res) => {
        if (res.docs.length > 0) {
          const temp = res.docs.map((user) => ({...user.data()}));
          console.log('search ', temp);
          this.props.showFiler(true);
          this.props.setOnlyFiveArray(temp);
        } else {
          this.props.showFiler(true);
          this.props.setOnlyFiveArray([]);
        }
      }).catch(() => {
        this.props.showFiler(true);
          this.props.setOnlyFiveArray([]);
      });
    }else if(this.state.checked_id==1){
      console.log('profile',this.props.userId);
      const {uid} = this.props.userId;

      // firestore()
      // .collection('Posts')
      // .onSnapshot(
      //   (snap) => {
      //     let lastDoc = null;
      //     if (snap.docs.length == 20) {
      //       lastDoc = snap.docs[snap.docs.length - 1];
      //     }

      //     const tempArr = snap.docs.map((doc) => ({
      //       id: doc.id,
      //       ...doc.data(),
      //     }));
      //     console.log('postsFetched', tempArr);
      //     this.props.showFiler(true);
      //     this.props.setOnlyFiveArray(tempArr);
          
      //   },
      //   (err) => {
      //     this.setState({
      //       loader: true,
      //       err: true,
      //     });
      //     console.log('error while getting posts', err);
      //     alert('Something went wrong! Please try again later.');
      //   },
      // );
    

      firestore()
      .collection('Posts')
      .orderBy('urlReadmore')
      .startAt(search).endAt(search + '~')
      .get()
      .then((res) => {
        if (res.docs.length > 0) {
          const temp = res.docs.map((user) => ({...user.data()}));
          const tempArr = res.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log('posts ', temp);
          this.props.showFiler(true);
          this.props.setOnlyFiveArray(tempArr);
        } else {
          this.props.showFiler(true);
          this.props.setOnlyFiveArray([]);
        }
      }).catch(() => {
        this.props.showFiler(true);
          this.props.setOnlyFiveArray([]);
      });
    }else if(this.state.checked_id==3){
      
      firestore()
      .collection('Hashtags')
      // .where('displayName', '==', search)
      .orderBy('title')
      .startAt(search.toLowerCase()).endAt(search.toLowerCase() + '~')
      .get()
      .then((res) => {
        if (res.docs.length > 0) {
          const temp = res.docs.map((user) => ({...user.data()}));
          console.log('search ', temp);
          this.props.showFiler(true);
          this.props.setOnlyFiveArray(temp);
        } else {
          this.props.showFiler(true);
          this.props.setOnlyFiveArray([]);
        }
      }).catch(() => {
        this.props.showFiler(true);
          this.props.setOnlyFiveArray([]);
      });
    }else if(this.state.checked_id==4){
      firestore()
      .collection('Movements')
      // .where('displayName', '==', search)
      .orderBy('title')
      .startAt(search).endAt(search + '~')
      .get()
      .then((res) => {
        if (res.docs.length > 0) {
          const temp = res.docs.map((user) => ({...user.data()}));
          console.log('search ', temp);
          this.props.showFiler(true);
          this.props.setOnlyFiveArray(temp);
        } else {
          this.props.showFiler(true);
          this.props.setOnlyFiveArray([]);
        }
      }).catch(() => {
        this.props.showFiler(true);
          this.props.setOnlyFiveArray([]);
      });
    }
    
      
  };

  closeDrawerIfOpen() {
    if (this.props.drawer) {
      this.props.toggoleDrawer();
    }
  }

  render() {
    const {
      firstName,
      lastName,
      email,
      country,
      bio,
      imageUrl,
      displayName,
      username,
      search,
      showSearcHresult,
      otherProfile,
    } = this.props;

    const feedData = [
      {
        id: 1,
        title: 'Posts',
       
      },
      {
        id: 2,
        title: 'People',

      },
      {
        id: 3,
        title: 'Hashtags',
        
      }
    
      
    ];
    const renderItem1 = ({ item, index }) => (
      <Item title={item.title} id={item.id} index={index}/>
    );

    const Item = ({ title,id, index }) => (
      <View style={{flex:1,flexDirection:'row', alignItems: 'center'}}> 
      {
        index == 0 ?
        <Text style={{marginRight: 10, fontWeight: 'bold'}}></Text>
        :
        null
      }
          <TouchableOpacity
          style={[Utility.getSearchType()==id ? style.selectedTab : style.unSelectedTab]}
          onPress={()=>
          {
            this.props.addSearch('');
            this.getFiveResult('');
            if (this._isMounted);
            Utility.setSearchType(id);
            this.setState({
              checked_id: id
            }) 
          }
          }
          >
          <Text style={{color:'#fff'}}>{title}</Text>
          </TouchableOpacity>
       </View>
      
      
    );
    return (
      
      <View>
      <View style={{width: wp(100),marginTop:wp(5), justifyContent: 'center', alignItems: 'center'}}>
        <Header
          leftComponent={
            this.props.otherProfile ? (
              <Icon
                name="arrow-left"
                type="font-awesome"
                onPress={() => {
                  this.props.navigation.goBack();
                }}
              />
            ) : (
              <TouchableOpacity
                onPress={() => {
                  this.closeDrawerIfOpen();
                  this.props?.removeFocus && this.props.removeFocus();
                  if (!this.props.otherProfile) {
                    this.props.navigation.navigate('profile');
                  } else
                    this.props.navigation.navigate('ProfileRoutes');
                }}>
                <RoundImage
                  imageUrl={this.props?.imageUrl}
                  displayName={this.props.displayName}
                />
              </TouchableOpacity>
            )
          }
          centerComponent={
            !this.props.otherProfile && (
              <View style={{
                marginTop: 3,
                justifyContent: 'center',
                marginRight: scale(10)}}>
                <TouchableOpacity
                onPress={() => 
                {
                  this.props.navigation.navigate('AppSearch');
                }} 
                style={{justifyContent: 'center', borderWidth: 0}}
                >
                <SearchBar
                style={{borderWidth: 0, backgroundColor: 'tranparent'}}
                  ref={(component) => this._searchViewRef = component}
                  onFocus={() => this.setState({ isSearchOn: true })}
                  // onBlur={() => this.setState({isSearchOn: false})}
                  placeholder="Search" // MAIN SEARCH
                  disabled
                  onPressIn={() =>  this.props.navigation.navigate('AppSearch')} 
                  onChangeText={(search) => {
                    // HArry1 this is search change
                    if (this.props.addSearch)
                      this.props.addSearch(search);
                    if (this.getFiveResult)
                      this.getFiveResult(search);
                  }} //{this.props.addSearch}
                  lightTheme={true}
                  containerStyle={style.headerCont}
                  inputStyle={{ fontSize: 12, borderWidth: 0}}
                  inputContainerStyle={style.headerINput}
                  value={this.props.search}
                />
                </TouchableOpacity>
                <Overlay
                  isVisible={showSearcHresult}
                  onBackdropPress={() => {
                    this.props.closeSearchFilter();
                  }}
                  overlayStyle={{
                    backgroundColor: '#fff',
                    height: hp(55),
                    width: wp(100),
                    position: 'absolute',
                    top: hp(0),
                    padding: 0,
                    margin: 0,
                  }}
                  backdropStyle={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                  <>
                  <SafeAreaView>
                    <Header
                      leftComponent={
                        <TouchableOpacity
                          onPress={() => {
                            this.closeDrawerIfOpen();
                            this.props?.removeFocus && this.props.removeFocus();
                            this.props.navigation.navigate('ProfileRoutes');
                          }}>
                          <RoundImage
                            imageUrl={this.props?.imageUrl}
                            displayName={this.props.displayName}
                          />
                        </TouchableOpacity>
                      }
                      centerComponent={
                        <View style={{marginRight: scale(10)}}>
                          <TouchableOpacity
                            onPress={() => {
                              this.props.navigation.navigate('AppSearch');
                            }}
                          >
                            <SearchBar
                              placeholder="Search"
                              onPressIn={() => this.props.navigation.navigate('AppSearch')}
                              onChangeText={(search) => {
                                if (this.props.addSearch)
                                  this.props.addSearch(search);
                                if (this.getFiveResult)
                                  this.getFiveResult(search);
                              }}
                              lightTheme={true}
                              inputStyle={{ fontSize: 12 }}
                              containerStyle={style.headerCont}
                              inputContainerStyle={style.headerINput}
                              autoFocus
                              value={search}
                            />
                          </TouchableOpacity>
                        </View>
                      }
                      rightComponent={
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                          <TouchableOpacity
                            onPress={() => {
                              // this.props.navigation.removeListener('beforeRemove')
                              this.closeDrawerIfOpen();
                              this.props.navigation.navigate('ChatStack', {
                                screen: 'ChatList',
                              });
                            }}>
                            <Icon
                              name="chat"
                              type="entypo"
                              color="#636363"
                              size={Platform.OS == 'android' ? 20 : 22}
                              style={{margin: 5}}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={this.props.toggoleDrawer}>
                            <Icon
                              name="menu"
                              type="entypo"
                              color="#636363"
                              size={Platform.OS == 'android' ? 20 : 22}
                              style={{margin: 5}}
                            />
                          </TouchableOpacity>
                        </View>
                      }
                      containerStyle={{
                        backgroundColor: 'transparent',
                        padding: 0,
                        marginTop: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                        marginBottom: 0,
                        height: vScale(50),
                        // margin: 0,
                      }}
                    />
                    <View style={{height: DEVICE_HEIGHT - 300, backgroundColor: 'white'}}>
                    <FlatList
                      extraData={this.state.checked_id}
                      data={this.props.onlyfiveResult}
                      // harry1 this is the
                      renderItem={this.renderItem}
                      keyExtractor={(item, index) => 'forRefH' + index + '' }
                      ListEmptyComponent={this.renderEmptyList}
                    />
                    </View>
                    {this.props.onlyfiveResult?.length >= 5 && Utility.getSearchType() == 2 && (
                      <TouchableOpacity
                        onPress={() => {
                          Keyboard.dismiss();
                          this.props.closeSearchFilter();
                          this.props?.removeFocus && this.props.removeFocus();
                          this.props.navigation.navigate('seacrchPage');
                        }}>
                        <Text
                          style={{
                            textAlign: 'center',
                            marginRight: wp(10),
                            marginBottom: 5,
                            color: '#18224f',
                          }}>
                          View More
                        </Text>
                      </TouchableOpacity>
                    )}
                  </SafeAreaView>
                  </>
                </Overlay>
                {/* </View> */}
              </View>
            )
          }
          rightComponent={
            <View style={{marginLeft: 10, marginTop: 8, flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
              <TouchableOpacity
                onPress={() => {
                  // this.props.navigation.removeListener('beforeRemove')
                  this.closeDrawerIfOpen();

                  this.props.navigation.navigate('ChatStack', {
                    screen: 'ChatList',
                  });
                }
                
                }
                
                >
                <Icon
                  name="chat"
                  type="entypo"
                  color="#636363"
                  size={Platform.OS == 'android' ? 30 : 30}
                  style={{marginHorizontal: 5}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.props?.removeFocus && this.props.removeFocus();
                  this.props.toggoleDrawer();
                }}>
                <Icon
                  name="menu"
                  type="entypo"
                  color="#636363"
                  size={Platform.OS == 'android' ? 30 : 30}
                  style={{marginHorizontal: 5}}
                />
              </TouchableOpacity>
            </View>
          }
          containerStyle={{
            backgroundColor: 'transaprent',
            padding: 0,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: this.props.inHeader ? -10 : 0,
            marginRight: this.props.inHeader ? 10 : 0,
            marginBottom: Platform.OS == 'android' ? 0 : vScale(8),
          }}
        />
      </View>
      <View>
      {
            !this.props.otherProfile && this.state.isSearchOn && (
              <View style={{height: 80}}>
                    <FlatList
                    horizontal={true}
                    extraData={this.state.checked_id}
                  data={feedData}
                  renderItem={renderItem1}
                  keyExtractor={item => item.id}
                  style={{marginTop:5,marginBottom:5}}
                />
                </View>
            )}
                </View>
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
    borderRadius: 20,
    margin: 5,
  },
  headerCont: {
    width: wp(61),
    backgroundColor: 'transparent',
    elevation: 0,
    borderWidth: 0,
    padding: 0,
    borderRadius: 20,
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  headerINput: {
    borderWidth: 0,
    marginLeft: -12, height: 35, borderRadius: 20, backgroundColor: '#eef3f7'},
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
  selectedTab:{
    backgroundColor:'#1e2348',
    paddingHorizontal:20,
    height:30,
    justifyContent:'center',
    borderRadius:25
},
unSelectedTab:{
    backgroundColor:'gray',
    paddingHorizontal:20,
    height:30,
    justifyContent:'center',
    borderRadius:25
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
    showSearcHresult: root.showSearcHresult,
    search: root.search,
    allUsers: root.allUsers,
    onlyfiveResult: root.onlyfiveResult,
    userId: auth().currentUser?.uid,
    drawer: root.drawer,
  };
};
const mapDispachToProps = (Dispatch) => {
  return {
    toggoleDrawer: () => Dispatch({type: 'toggoleDrawer'}),
    addSearch: (search) => Dispatch({type: 'addSearch', search: search}),
    setAlluser: (users) => Dispatch({type: 'setAlluser', users: users}),
    closeSearchFilter: () => Dispatch({type: 'closeSearchFilter'}),
    showFiler: (status) => Dispatch({type: 'showFiler', status}),
    setOnlyFiveArray: (users) => Dispatch({type: 'setOnlyFiveArray', users}),
    toggleChatScreen: () => Dispatch({type: 'toggleChatScreen'}),
  };
};

export default connect(mapStateToProps, mapDispachToProps)(HeaderClass);

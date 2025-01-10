import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React, { Component } from 'react';
import {
  BackHandler,
  FlatList,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Button, Icon, ListItem } from 'react-native-elements';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { connect } from 'react-redux';

import { getPartOfList } from '../backend/paginatedList';
import EmptyListText from '../components/emptyListText';
import Header from '../components/header';
import PostCard from '../components/postCard';
import RoundImage from '../components/roundImage';
import { scale, vScale } from '../configs/size';
import { defaultAlert } from '../Constants/errorLog';
import SHowFriends from './showFirends';
import UserClipList from './UserClipList';
import { DEVICE_WIDTH } from '../utils/Utility';

class login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userActivity: null,
      userActivityLastDoc: null,
      userClips: [],
      userClipsLastDoc: [],
      accounts: [
        {
          icon: require('../assets/activity_icon.png'),
          name: 'Activity',
          selected: true,
        },
        {
          icon: require('../assets/friends.png'),
          name: 'Friends',
          selected: false,
        },

        {
          icon: require('../assets/scenes.png'),
          name: 'Scenes',
          selected: false,
        },
      ],
      selectedCategory: 0,
      search: '',
      showModal: false,
      initialIndex: 0,
      showClipList: false,
    };
  }

  backAction = () => {
    if (this.state.showClipList) this.setState({showClipList: false});
  };

  componentDidMount() {
//alert('hello')
    this.getUserActivity();
    this.getMyClips();
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  selectCategory = (index) => {
    console.log(index);
    let tempArray = this.state.accounts;
    for (let i = 0; i < tempArray.length; i++) {
      if (i == index) {
        console.log('if');
        tempArray[i].selected = true;
        //   break;
      } else {
        tempArray[i].selected = false;
      }
    }
    this.setState({accounts: tempArray, selectedCategory: index});
  };

  getUserActivity = async () => {
    const ref = firestore()
      .collection('Posts')
      .where('user', '==', this.props.userId)
      .where('isHidden', '==', false)
      .orderBy('date', 'desc')
      .limit(4);
    try {
      const res = await getPartOfList({ref, limitNum: 4});
      console.log('get user activity');
      const {list, lastDoc} = res;
      this.setState({userActivity: list, userActivityLastDoc: lastDoc});
    } catch (error) {
      console.log('error while fetching user activity', error);
      defaultAlert();
    }
  };

  getMoreUserActivity = async () => {
    if (!this.state.userActivityLastDoc) {
      console.log('no docs remaining');
      return;
    }
    const ref = firestore()
      .collection('Posts')
      .where('user', '==', this.props.userId)
      .where('isHidden', '==', false)
      .orderBy('date', 'desc')
      .limit(4)
      .startAfter(this.state.userActivityLastDoc);
    try {
      const res = await getPartOfList({ref, limitNum: 4});
      console.log('get more user activity');
      const {list, lastDoc} = res;
      console.log('lastDoc', typeof lastDoc);
      console.log('more posts fetched', list.length);
      this.setState({
        userActivity: [...this.state.userActivity, ...list],
        userActivityLastDoc: lastDoc,
      });
    } catch (error) {
      console.log('error while fetching more of user activity', error);
      defaultAlert();
    }
  };

  deletePost = async (docId, hashtags) => {
    const {userActivity} = this.state;
    console.log(docId, hashtags);
    try {
      if (hashtags && hashtags.length) {
        hashtags.forEach((item) => {
          firestore()
            .collection('Hashtags')
            .where('title', '==', item)
            .get()
            .then((snap) => {
              const count = snap.docs[0].data()?.count;
              const hashId = snap.docs[0].id;
              const hashRef = firestore().collection('Hashtags').doc(hashId);
              if (count > 0)
                return hashRef.update({
                  count: firestore.FieldValue.increment(-1),
                  date: new Date().getTime(),
                });
              else return hashRef.delete();
            });
        });
      }
      await firestore().collection('Posts').doc(docId).delete();
      if (userActivity?.length <= 0) {
        return;
      }
      console.log(userActivity.length);
      const tempArr = [...userActivity];
      const postIndex = tempArr.findIndex((item) => item.id == docId);
      tempArr.splice(postIndex, 1);
      console.log(tempArr.length);
      this.setState({
        userActivity: tempArr,
      });
    } catch (error) {
      errorLog('deleting post', error);
    }
  };

  getMyClips = async () => {
    const clipsRef = firestore()
      .collection('Clips')
      .where('userId', '==', this.props.userId);
      // .orderBy('date', 'desc')
      // .limit(9);
    try {
      const res = await getPartOfList({ref: clipsRef, limitNum: 9});
      const {list, lastDoc} = res;
      this.setState({userClips: list, userClipsLastDoc: lastDoc});
    } catch (error) {
      console.log('error while fetching user clip', error);
      defaultAlert();
    }
  };

  getMoreClips = async () => {
    if (!this.state.userClipsLastDoc) {
      console.log('no clips remaining');
      return;
    }
    const clipsRef = firestore()
      .collection('Clips')
      .where('userId', '==', this.props.userId);
      // .orderBy('date', 'desc')
      // .limit(9)
      // .startAfter(this.state.userClipsLastDoc);
    try {
      const res = await getPartOfList({ref: clipsRef, limitNum: 9});
      const {list, lastDoc} = res;
      this.setState({
        userClips: [...this.state.userClips, ...list],
        userClipsLastDoc: lastDoc,
      });
    } catch (error) {
      console.log('error while fetching more of user Scenes', error);
      defaultAlert();
    }
  };

  renderClipThumbnail = ({item, index}) => {
    if (index % 3 != 0) return null;
    return (
      <View style={{flexDirection: 'row', marginBottom: '0.3%'}}>
        {[0, 1, 2].map((i) => {
          if (!this.state.userClips[index + i]) return null;
          return (
            <TouchableOpacity
              style={{
                ...style.clipThumbnail,
                marginHorizontal: i == 1 ? '0.5%' : 0,
              }}
              onPress={() =>
                this.setState({showClipList: true, initialIndex: index + i})
              }>
              <Image
                source={{uri: this.state.userClips[index + i]?.thumbnailUri}}
                style={{width: '100%', height: vScale(180)}}
                resizeMode="cover"
              />
              <View  style={{
              flexDirection: 'row', 
              alignItems: 'center',
              marginRight: 2,
              paddingHorizontal: 10,
              paddingVertical: 5,
              alignSelf: 'flex-end', 
              backgroundColor: '#1e2348',
              borderRadius: 5,
              marginTop: -32
              }}>
          
                <Icon
                      name='eye-outline'
                      type="ionicon"
                      size={18}
                      color='white'
                      
                    />
                  <Text style={{fontSize: 12, color: 'white', marginLeft: 5}}>{this.state.userClips[index + i]?.viewCount?this.state.userClips[index + i]?.viewCount:0}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  removeClipFromList = (clipId) => {
    const {userClips} = this.state;
    const tempArr = [...userClips];
    const clipIdx = tempArr.findIndex((item) => item.id == clipId);
    tempArr.splice(clipIdx, 1);
    this.setState({userClips: tempArr, showClipList: false});
  };

  renderPageHeader = () => {
    const {accounts, selectedCategory, search, userActivity} = this.state;
    const {
      firstName,
      lastName,
      email,
      country,
      bio,
      imageUrl,
      displayName,
      userName,
    } = this.props;
    return (
      <>
        {this.props?.cover ? (
          <ImageBackground
            source={{
              uri: this.props.cover,
            }}
            resizeMode="cover"
            style={style.banner}
            onError={() => {
            
            }}></ImageBackground>
        ) : (
          <View style={{...style.banner, backgroundColor: '#d9d9d9'}} />
        )}
        <View style={{width: DEVICE_WIDTH, flexDirection: 'row', alignItems: 'flex-start', marginTop:  wp(-10)}}>
          <View style={{marginLeft: 50, flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <RoundImage
              imageUrl={this.props.imageUrl}
              displayName={this.props.displayName}
              size={wp(25)}
             
            />
            
            <Text
              style={{
                fontSize: 20,
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
              {displayName}
            </Text>
            <Text
              style={{
                fontSize: 14,
                textAlign: 'center',
                fontWeight: '600',
                 color: 'rgb(135, 135, 135)'
              }}>
              {this.props.userName != null &&
              this.props.userName != 'null' &&
              this.props.userName != ''
                ? this.props.userName
                : '@' + displayName}
            </Text>
          </View>
          <View style={{}}>
          <Button
          icon={
            <Icon
              name="gear"
              type="font-awesome"
              size={30}
              color="rgb(127, 127, 127)"
              style={{margin: 5}}
            />
          }
          containerStyle={{}}
          buttonStyle={{
            backgroundColor: 'transparent',
            marginTop: 50
          }}
          onPress={() => {
            this.props.navigation.navigate('AccountSetting');
          }}
        />
            
          </View>
        </View>
        <ListItem containerStyle={[style.listCont, {marginTop: hp(1)}]}>
          <ListItem.Content>
            {/* <ListItem.Subtitle style={style.nickName}>
                {userName}
              </ListItem.Subtitle> */}
            {this.props.bio != null && this.props.bio != 'null' && (
              <ListItem.Subtitle
                style={[
                  style.nickName,
                  {alignSelf: 'flex-start', marginLeft: wp(10)},
                ]}>
                {this.props.bio}{' '}
              </ListItem.Subtitle>
            )}
          </ListItem.Content>
        </ListItem>
        <View style={style.row}>
          {this.props.occupation != null &&
            this.props.occupation != 'null' &&
            this.props.occupation != '' && (
              <View style={style.secondRow}>
                <Icon
                  name="briefcase"
                  type="entypo"
                  color="gray"
                  style={{margin: 5}}
                  size={14}
                />
                <Text style={style.innerText}>{this.props.occupation}</Text>
              </View>
            )}
          {this.props.location != null &&
            this.props.location != 'null' &&
            this.props.location != '' && (
              <View style={style.secondRow}>
                <Icon
                  name="location-on"
                  type="material"
                  color="gray"
                  style={{margin: 5}}
                  size={14}
                />
                <Text style={style.innerText}>{this.props.location}</Text>
              </View>
            )}
          {this.props.birthdate != null &&
            this.props.birthdate != 'null' &&
            this.props.birthdate != '' && (
              <View style={style.secondRow}>
                <Icon
                  name="cake"
                  type="material-community"
                  color="gray"
                  style={{margin: 5}}
                  size={14}
                />
                <Text style={style.innerText}>{this.props.birthdate}</Text>
              </View>
            )}
        </View>
        <View style={{alignSelf: 'center', width: 300, height: 1,  backgroundColor: 'rgb(135, 135, 135)',marginBottom: 20}}/>
        <ListItem.Content>
                  <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                    <View>
                    <Text style={{fontWeight: 'bold', fontSize: 22, textAlign: 'center'}}>
                      {this.props.followers}
                    </Text>
                    <Text style={{fontSize: 16, color: 'rgb(135, 135, 135)'}}>Followers</Text>
                    </View>
                    <View style={{width: 60}}/>
                    <View>
                    <Text style={{fontWeight: 'bold', fontSize: 22, textAlign: 'center'}}>
                      {this.props.following}
                    </Text>
                    <Text style={{fontSize: 16,  color: 'rgb(135, 135, 135)'}}>Following</Text>
                    </View>
                    
                  </View>
                </ListItem.Content>
        
        <ScrollView horizontal style={style.categoryContainer}>
          {accounts.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={[
                  style.accountsCategory,
                  {
                    borderBottomColor: '#30334b',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginHorizontal: 20
                    // borderBottomWidth: item.selected ? 2 : 0,
                  },
                ]}
                onPress={() => {
                  this.selectCategory(index);
                }}>
                  <Image
                source={item.icon}
                style={{width: 30, height: 30}}
                resizeMode="cover"
              />
                  {
                    item.selected ?
                    <Text style={style.accountText}>{item.name}</Text>
                    :
                    null
                  }
               
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </>
    );
  };

  render() {
    const {accounts, selectedCategory, search, userActivity} = this.state;

    let data, renderItem, keyExtractor, onEndReached;

    accounts.forEach((element) => {
      if (element.selected) {
        if (element.name == 'Activity') {
          data = userActivity;
          renderItem = ({item, index}) => {
            return (
              <PostCard
              carousel={true}
                onRefresh={this.onRefresh}
                data={item}
                index={index}
                openComment={this.toggoleComments}
                navigation={this.props.navigation}
                deletePost={this.deletePost}
                manualIncrement={true}
              />
            );
          };
          keyExtractor = (item, index) => index.toString();
          onEndReached = this.getMoreUserActivity;
        } else if (element.name == 'Scenes') {//George Changed clips to stories
          data = [...Array(this.state.userClips.length).keys()];
          renderItem = this.renderClipThumbnail;
          keyExtractor = (item, index) => index.toString();
          onEndReached = this.getMoreClips;
        } else {
          data = [...Array(this.state.userClips.length).keys()];
          renderItem = this.renderClipThumbnail;
          keyExtractor = (item, index) => index.toString();
          onEndReached = this.getMoreClips;
        }
      }
    });

    return (
      <View style={style.container}>
        {!this.state.showClipList ? (
          <>
          
            <View style={{flex: 1}}>
              {accounts.map((item) => {
                if (item.selected) {
                  if (item.name == 'Activity' || item.name == 'Scenes') { //George Changed clips to stories
                    return (
                      <FlatList
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        ListHeaderComponent={this.renderPageHeader}
                        ListEmptyComponent={() => (
                          <EmptyListText style={{height: vScale(100)}} />
                        )}
                        onEndReachedThreshold={0.5}
                        onEndReached={onEndReached}
                      />
                    );
                  } else {
                    return (
                      <View style={{ flex: 1, marginTop: 100 }}>
                        <SafeAreaView>
                          <View style={{
                            backgroundColor: 'transparent',
                          }}>
                            <TouchableOpacity
                              style={[{
                                borderRadius: vScale(25),
                                width: 100,
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                marginRight: scale(10),
                                marginVertical: scale(3),
                              }]} onPress={() => {
                                this.selectCategory(0);
                              }}>
                              <Icon
                                name="chevron-back-outline"
                                type="ionicon"
                                size={vScale(30)}
                                color="black"
                              />
                            </TouchableOpacity>
                          </View>
                        </SafeAreaView>
                        <SHowFriends
                          newProps={this.props.navigation}
                          toastRef={this.toast}
                          userId={this.props.userId}
                          navigate={(id) => {
                            this.props.navigation.navigate('otherProfile', {
                              userId: id.userId,
                            });
                          }}
                        // renderHeader={this.renderPageHeader}
                        />
                      </View>
                    );
                  }
                }
              })}
            </View>

            
          </>
        ) : (
          <UserClipList
            clipList={this.state.userClips}
            initialIndex={this.state.initialIndex}
            getMoreClips={this.getMoreClips}
            newClipNavigate={() => {
              this.setState({showClipList: false});
              this.props.navigation.navigate('Clips', {screen: 'NewClip'});
            }}
            closeModal={() => this.setState({showClipList: false})}
            removeClipFromList={this.removeClipFromList}
            isMyClip={true}
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
  banner: {width: "100%", height: 200},
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
  buttonStyle: {height: 30, backgroundColor: 'transparent', paddingVertical: 0},
  buttonCont: {
    backgroundColor: '#1e2348',
    width: wp(35),
    height: 30,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: hp(2),
    alignItems: 'center',
  },
  categoryContainer: {marginTop: hp(3), alignSelf: 'center'},
  accountsCategory: {margin: 10},
  accountText: {fontSize: 12,marginTop: 4 },
  bannerBottom: {
    flexDirection: 'row',
    marginBottom: 5,
    marginRight: 20,
    alignSelf: 'flex-end',
    marginTop: hp(2),
  },
  bannerIcon: {
    backgroundColor: '#1e2348',
    padding: 5,
    borderRadius: 100,
    margin: 2,
  },
  headerCont: {
    width: wp(61),
    backgroundColor: 'transparent',
    elevation: 0,
    borderWidth: 0,
    padding: 0,
  },
  headerINput: {height: hp(5), borderRadius: 20},
  avatar: {
    height: wp(20),
    width: wp(20),
    borderRadius: wp(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d9d9d9',
    padding: 0,
    marginLeft: wp(10),
    borderWidth: 1,
    borderColor: 'blue',
  },
  clipThumbnail: {
    width: '33%',
    height: vScale(180),
    borderBottomWidth: 1,
    borderColor: '#FFF',
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
});
const mapStateToProps = (state) => {
  const {root, user} = state;
  const {userProfile} = user;
  console.log('userProfile', user);
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
    cover: userProfile.coverUrl,
    birthdate: userProfile.birthdate,
    showEmail: userProfile.showEmail,
    profilePublic: userProfile.profilePublic,
    followers: userProfile.followersCount,
    following: userProfile.followingCount,
    userId: auth().currentUser?.uid,
  };
};
const mapDispachToProps = (Dispatch) => {
  return {
    updateUser: (cover) => Dispatch({type: 'updateCover', cover}),
  };
};

export default connect(mapStateToProps, mapDispachToProps)(login);

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
  FlatList,
  Modal,
  BackHandler,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {connect} from 'react-redux';
import {Icon, Avatar, ListItem, Button, SearchBar} from 'react-native-elements';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';

import Header from '../components/header';
import Drawer from '../components/drawer';
import Error from '../components/error';
import auth from '@react-native-firebase/auth';
import PostCard from '../components/postCard';
import UserClipList from './UserClipList';

import {
  sendFirendRequest,
  sendFollowRequest,
  unFirend,
  checkFriendSTatus,
} from '../backend/apis';
import {
  sendFriendRequest,
  cancelFriendRequest,
  follow,
  unfollow,
  unFriend,
} from '../backend/friends';
import {getOtherUserProfile, getUserProfile} from '../backend/userProfile';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import Loader from '../components/loader';
import firendsPage from './firendsPage';
import {getPartOfList} from '../backend/paginatedList';
import {defaultAlert} from '../Constants/errorLog';
import EmptyListText from '../components/emptyListText';
import {vScale, scale} from '../configs/size';
import SHowFriends from '../screens/showFirends';
import {TabBarHeight} from '../routes/bottomtab';
import {tStyle} from '../configs/textStyle';
import RoundImage from '../components/roundImage';

class otherUserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      alreadyFriend: false,
      alreadyFollower: false,
      friendStatus: null,
      friendDocData: null,
      friendDocRef: null,
      followDocData: null,
      accounts: [
        {
          name: 'Activity',
          selected: true,
        },
        {
          name: 'Friends',
          selected: false,
        },
        {
          name: 'Clips',
          selected: false,
        },
      ],
      selectedCategory: 0,
      search: '',
      loader: false,
      followLoader: false,
      following: 0,
      userLoader: true,
      userError: false,
      friendError: false,
      followError: false,
      userActivity: null,
      userActivityLastDoc: null,
      userClips: [],
      userClipsLastDoc: [],
      showModal: false,
      initialIndex: 0,
      id: '',
      userId: this.props.route.params.userId,
      showClipList: false,
    };
    // this.state.userId = this.state.id || this.props.route.params.userId;
  }

  backAction = () => {
    if (this.state.showClipList) this.setState({showClipList: false});
  };

  getUserInfo = (id) => {
    this.setState({userLoader: true});
    this.userUnsub = firestore()
      .collection('Users')
      .doc(id)
      .onSnapshot(
        (snap) => {
          if (snap.exists) {
            this.setState(
              {
                userInfo: {ref: snap.ref, ...snap.data()},
                userLoader: false,
                userError: false,
              },
              () => {
                if (!snap.data().isProfilePrivate) {
                  this.fetchExtraData(id);
                }
              },
            );
          } else {
            console.log('id', id);
            console.log('no user exists');
            this.setState({userLoader: false, userError: true});
          }
        },
        (err) => {
          console.log('error while getting userInfo', err);
          this.setState({userLoader: false, userError: true});
        },
      );
  };

  checkFriendshipStatus = (id) => {
    const userid1 = id;
    const userid2 = this.props.myId;
    this.setState({loader: true});
    this.friendUnsub = firestore()
      .collection('Friends')
      .where('identifiers', 'array-contains-any', [
        `${userid1}_${userid2}`,
        `${userid2}_${userid1}`,
      ])
      .onSnapshot(
        (snap) => {
          if (snap.empty) {
            this.setState({
              alreadyFriend: false,
              friendStatus: null,
              loader: false,
            });
          } else if (snap.docs.length == 1) {
            if (snap.docs[0].data().areFriends == true) {
              this.setState({
                alreadyFriend: true,
                friendStatus: 'accepted',
                friendDocData: snap.docs[0].data(),
                friendDocRef: snap.docs[0].ref,
                loader: false,
              });
            } else if (snap.docs[0].data().status == 'pending') {
              this.setState({
                alreadyFriend: false,
                friendStatus: 'pending',
                friendDocData: snap.docs[0].data(),
                friendDocRef: snap.docs[0].ref,
                loader: false,
              });
            } else {
              this.setState({
                alreadyFriend: false,
                friendStatus: snap.docs[0].data().status,
                friendDocData: snap.docs[0].data(),
                friendDocRef: snap.docs[0].ref,
                loader: false,
              });
            }
          }
        },
        (err) => {
          //console.log('error while checking friend status', err);
          this.setState({friendError: true, loader: false});
        },
      );
  };

  checkFollowStatus = async (id) => {
    const userid1 = this.props.myId;
    const userid2 = id;
    this.setState({followLoader: true});
    //console.log(`${userid1}_${userid2}`);
    this.followUnsub = firestore()
      .collection('Follows')
      .where('identifiers', 'array-contains-any', [
        `${userid1}_${userid2}`,
        `${userid2}_${userid1}`,
      ])
      .onSnapshot(
        (snap) => {
          //console.log('response follow', snap.docs.length);
          if (snap.empty) {
            this.setState({
              alreadyFollower: false,
              followLoader: false,
            });
          } else if (snap.docs.length == 1) {
            if (
              snap.docs[0].data().isFollowingOtherUser[`${userid1}`] == true
            ) {
              this.setState({
                alreadyFollower: true,
                followDocData: snap.docs[0].data(),
                followDocRef: snap.docs[0].ref,
                followLoader: false,
              });
            } else {
              this.setState({
                alreadyFollower: false,
                followDocData: snap.docs[0].data(),
                followDocRef: snap.docs[0].ref,
                followLoader: false,
              });
            }
          }
        },
        (err) => {
          //console.log('error while checking friend status', err);
          this.setState({followError: true, followLoader: false});
        },
      );
  };

  onSendRequest = async () => {
    const {userInfo} = this.state;

    const userid1 = userInfo.userId;
    const userid2 = this.props.myId;
    const payload = {
      identifiers: [`${userid1}_${userid2}`, `${userid2}_${userid1}`],
      users: [userid1, userid2],
      userData: [
        {
          userId: userid1,
          profileUrl: userInfo.profileUrl || null,
          displayName: `${userInfo.firstName} ${userInfo.lastName}`,
        },
        {
          userId: userid2,
          profileUrl: this.props.profileUrl || null,
          displayName: this.props.displayName,
        },
      ],
      areFriends: false,
      status: 'pending',
      sendBy: {
        userId: userid2,
        profileUrl: this.props.profileUrl || null,
        displayName: this.props.displayName,
      },
      sendTo: {
        userId: userid1,
        profileUrl: userInfo.profileUrl || null,
        displayName: `${userInfo.firstName} ${userInfo.lastName}`,
      },
    };

    this.setState({loader: true});
    try {
      await sendFriendRequest(payload);
      this.setState({loader: false});
    } catch (error) {
      //console.log('error while sending friend request', error);
      this.setState({loader: false});
    }
  };

  unFirend = async () => {
    const {friendDocRef} = this.state;
    if (!friendDocRef) {
      return;
    }
    this.setState({loader: true});
    try {
      await unFriend({ref: friendDocRef});
      this.setState({alreadyFriend: false, loader: false});
    } catch (error) {
     // alert('Something went wrong! Please try again Later.');
      //console.log('error while unfriend', error);
      this.setState({loader: false});
    }
  };

  onSendFollowRequest = async () => {
    const userid1 = this.state.userId;
    const userid2 = this.props.myId;
    const payload = {
      identifiers: [`${userid1}_${userid2}`, `${userid2}_${userid1}`],
      users: [userid1, userid2],
      userData: [
        {
          userId: userid1,
          profileUrl: this.state.userInfo.profileUrl || null,
          displayName: `${this.state.userInfo.firstName} ${this.state.userInfo.lastName}`,
        },
        {
          userId: userid2,
          profileUrl: this.props.profileUrl || null,
          displayName: this.props.displayName,
        },
      ],
      isFollowedByOtherUser: {
        [userid1]: true,
        [userid2]:
          this.state.followDocData?.isFollowedByOtherUser?.[userid2] || false,
      },
      isFollowingOtherUser: {
        [userid1]:
          this.state.followDocData?.isFollowedByOtherUser?.[userid2] || false,
        [userid2]: true,
      },
    };
    this.setState({followLoader: true});
    try {
      const result = await follow({
        payload,
        currentUserId: userid2,
        otherUserId: userid1,
      });
      //console.log('follow result', result);
      this.setState({
        followLoader: false,
      });
    } catch (error) {
      //console.log('error while follow', error);
      this.setState({followLoader: false});
    }
  };

  unFollow = async () => {
    const {followDocData, userInfo} = this.state;
    const userid1 = userInfo.userId;
    const userid2 = this.props.myId;
    const payload = {
      currentUserId: userid2,
      otherUserId: userid1,
      isFollowedByOtherUser: {
        [userid1]: false,
        [userid2]: followDocData.isFollowedByOtherUser[`${userid2}`],
      },
      isFollowingOtherUser: {
        [userid1]: followDocData.isFollowingOtherUser[`${userid1}`],
        [userid2]: false,
      },
    };
    this.setState({followLoader: true});
    try {
      await unfollow({ref: this.state.followDocRef, payload});
      this.setState({
        followLoader: false,
      });
    } catch (error) {
      //console.log('error while unfollowing', error);
      this.setState({followLoader: false});
    }
  };

  cancelFriendRequest = async () => {
    const {friendDocRef} = this.state;
    this.setState({loader: true});
    try {
      await cancelFriendRequest({ref: friendDocRef});
      this.setState({alreadyFriend: false, loader: false});
    } catch (error) {
      //console.log('error while cancelling friend request', error);
      this.setState({loader: false});
    }
  };
  cancelOrUnfriend = () => {
    const {friendStatus, alreadyFriend} = this.state;
    this.setState({loader: true});

    if (alreadyFriend) {
      Alert.alert('Unfriend', 'Remove Friend', [
        {
          text: 'Cancel',
          onPress: () => this.setState({loader: false}),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            this.unFirend();
          },
        },
      ]);
    } else {
      if (friendStatus == 'pending') {
        Alert.alert(
          'Cancel Request',
          'Are you sure you want to cancel request',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: () => {
                this.cancelFriendRequest();
              },
            },
          ],
        );
      }
    }
  };

  getUserActivity = async (id) => {
    const ref = firestore()
      .collection('Posts')
      .where('user', '==', id)
      .where('isHidden', '==', false)
      .orderBy('date', 'desc')
      .limit(4);
    try {
      const res = await getPartOfList({ref, limitNum: 4});
      const {list, lastDoc} = res;
      //console.log('list', list);
      this.setState({userActivity: list, userActivityLastDoc: lastDoc});
    } catch (error) {
      //console.log('error while fetching user activity', error);
      defaultAlert();
    }
  };

  getMoreUserActivity = async () => {
    if (!this.state.userActivityLastDoc) {
      //console.log('no docs remaining');
      return;
    }
    const ref = firestore()
      .collection('Posts')
      .where('user', '==', this.state.userId)
      .where('isHidden', '==', false)
      .orderBy('date', 'desc')
      .limit(4)
      .startAfter(this.state.userActivityLastDoc);
    try {
      const res = await getPartOfList({ref, limitNum: 4});
      const {list, lastDoc} = res;
      //console.log('lastDoc', typeof lastDoc);
      //console.log('more posts fetched', list.length);
      this.setState({
        userActivity: [...this.state.userActivity, ...list],
        userActivityLastDoc: lastDoc,
      });
    } catch (error) {
      //console.log('error while fetching more of user activity', error);
      defaultAlert();
    }
  };

  getUserClips = async (id) => {
    const clipsRef = firestore()
      .collection('Clips')
      .where('userId', '==', id)
      .orderBy('date', 'desc')
      .limit(9);
    try {
      const res = await getPartOfList({ref: clipsRef, limitNum: 9});
      const {list, lastDoc} = res;
      this.setState({userClips: list, userClipsLastDoc: lastDoc});
    } catch (error) {
      //console.log('error while fetching user clip', error);
      defaultAlert();
    }
  };

  getMoreClips = async () => {
    if (!this.state.userClipsLastDoc) {
      //console.log('no clips remaining');
      return;
    }
    const clipsRef = firestore()
      .collection('Clips')
      .where('userId', '==', this.state.userId)
      .orderBy('date', 'desc')
      .limit(9)
      .startAfter(this.state.userClipsLastDoc);
    try {
      const res = await getPartOfList({ref: clipsRef, limitNum: 9});
      const {list, lastDoc} = res;
      this.setState({
        userClips: [...this.state.userClips, ...list],
        userClipsLastDoc: lastDoc,
      });
    } catch (error) {
      //console.log('error while fetching more of user clips', error);
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
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  fetchData = async (id) => {
    this.getUserInfo(id);
    this.checkFriendshipStatus(id);
  };

  fetchExtraData = (id) => {
    this.checkFollowStatus(id);
    this.getUserActivity(id);
    this.getUserClips(id);
  };

  componentDidMount() {
    this.fetchData(this.state.userId);
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );
    // this.blurUnsub = this.props.navigation.addListener('blur', () => {
    //   this.setState({userId: ''});
    // });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.route.params.userId !== this.props.route.params.userId) {
      this.fetchData(this.props.route.params.userId);
      this.setState({
        userId: this.props.route.params.userId,
      });
    }
  }

  componentWillUnmount() {
    // this.blurUnsub();
    this.backHandler.remove();
    this.userUnsub();
    this.friendUnsub();
    if (typeof this.followUnsub == 'function') {
      this.followUnsub();
    }
  }

  selectCategory = (index) => {
    //console.log(index);
    let tempArray = this.state.accounts;
    for (let i = 0; i < tempArray.length; i++) {
      if (i == index) {
        //console.log('if');
        tempArray[i].selected = true;
        //   break;
      } else {
        tempArray[i].selected = false;
      }
    }
    this.setState({accounts: tempArray, selectedCategory: index});
  };

  reportUser = () => {
    try {
      const ref = firestore().collection('Users').doc(this.state.userId);
      const reportRef = ref.collection('Reports').doc(this.props.myId);
      reportRef.get().then((snap) => {
        if (snap.exists) alert('You already reported this user.');
        else {
          const body = {
            id: this.props.myId,
            displayName: this.props?.displayName,
            profileUrl: this.props?.profileUrl,
          };
          const batch = firestore().batch();
          batch.set(reportRef, body);
          batch.update(ref, {
            reportCount: firestore.FieldValue.increment(1),
            isReported: true,
          });
          batch.commit();
        }
      });
    } catch (err) {
      console.log('err', err);
    }
  };

  renderPageHeader = () => {
    const {
      accounts,
      userInfo,
      alreadyFollower,
      friendError,
      followError,
      friendStatus,
    } = this.state;
    const followAllowed = userInfo?.generalSettings?.follow;
    return (
      <>
        {userInfo?.coverUrl ? (
          <ImageBackground
            source={{
              uri:
                userInfo.coverUrl != null && userInfo.coverUrl != 'null'
                  ? userInfo.coverUrl
                  : 'https://images.ctfassets.net/hrltx12pl8hq/7yQR5uJhwEkRfjwMFJ7bUK/dc52a0913e8ff8b5c276177890eb0129/offset_comp_772626-opt.jpg?fit=fill&w=800&h=300',
            }}
            resizeMode="stretch"
            style={style.banner}
          />
        ) : (
          <View style={{...style.banner, backgroundColor: '#d9d9d9'}} />
        )}
        <View style={{flexDirection: 'row'}}>
          <View style={{width: wp(40)}}>
            <View style={style.image}>
              <RoundImage
                imageUrl={userInfo.profileUrl}
                displayName={userInfo.displayName}
                size={80}
              />
            </View>

            <Text
              style={{
                fontSize: 12,
                textAlign: 'center',
                fontWeight: 'bold',
              }}>
              {userInfo.displayName}
            </Text>
            <Text
              style={{
                fontSize: 10,
                textAlign: 'center',
                fontWeight: '600',
              }}>
              {userInfo.username != null &&
              userInfo.username != 'null' &&
              userInfo.username != ''
                ? userInfo.username
                : '@' + userInfo.displayName}
            </Text>
          </View>

          <View style={{justifyContent: 'flex-start', width: wp(60)}}>
            <View style={[style.bannerBottom]}>
              {this.state.loader ? (
                <ActivityIndicator color="#18224f" />
              ) : (
                !friendError && (
                  <TouchableOpacity
                    onPress={() => {
                      if (
                        !this.state.alreadyFriend &&
                        friendStatus != 'pending'
                      ) {
                        this.onSendRequest();
                        this.onSendFollowRequest();
                      } else {
                        this.cancelOrUnfriend();
                      }
                    }}>
                    <Icon
                      name="add-user"
                      type="entypo"
                      color="#fff"
                      size={15}
                      style={[
                        style.bannerIcon,
                        {
                          backgroundColor:
                            this.state.alreadyFriend ||
                            friendStatus == 'pending'
                              ? 'silver'
                              : '#1e2348',
                        },
                      ]}
                    />
                  </TouchableOpacity>
                )
              )}
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('ChatStack', {
                    screen: 'SingleChat',
                    params: {
                      friendId: {
                        userId: userInfo.userId,
                        displayName: userInfo.displayName,
                        profileUrl: userInfo.profileUrl,
                      },
                    },
                  });
                }}>
                <Icon
                  name="chat"
                  type="entypo"
                  color="#fff"
                  size={15}
                  style={style.bannerIcon}
                />
              </TouchableOpacity>
              <Menu>
                <MenuTrigger
                  children={
                    <Icon
                      name="dots-three-vertical"
                      type="entypo"
                      color="#fff"
                      size={15}
                      style={style.bannerIcon}
                    />
                  }
                />
                <MenuOptions
                  customStyles={{
                    optionsContainer: {
                      width: scale(55),
                      marginTop: vScale(25),
                    },
                  }}>
                  <MenuOption text="Report" onSelect={this.reportUser} />
                </MenuOptions>
              </Menu>

              {!userInfo?.isProfilePrivate &&
              (alreadyFollower || followAllowed) ? (
                this.state.followLoader ? (
                  <ActivityIndicator
                    color="#18224f"
                    style={{
                      width: wp(20),
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderColor: '#1e2348',
                      borderWidth: 1,
                      borderRadius: 20,
                      marginHorizontal: 10,
                    }}
                  />
                ) : (
                  !followError && (
                    <TouchableOpacity
                      style={{
                        width: wp(20),
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderColor: '#1e2348',
                        borderWidth: 1,
                        borderRadius: 20,
                        marginHorizontal: 10,
                      }}
                      onPress={() => {
                        //     alert(item._id)
                        if (!alreadyFollower) {
                          this.onSendFollowRequest();
                        } else {
                          this.unFollow();
                        }
                        // this.setState({loader:true})
                      }}>
                      <Text style={{color: '#1e2348'}}>
                        {alreadyFollower ? 'Unfollow' : 'Follow'}
                      </Text>
                    </TouchableOpacity>
                  )
                )
              ) : null}
            </View>
            {!userInfo?.isProfilePrivate && (
              <View style={{justifyContent: 'flex-end', flex: 1}}>
                <ListItem
                  containerStyle={{
                    backgroundColor: 'transparent',
                    margin: 0,
                    padding: 0,
                  }}>
                  <ListItem.Content>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignSelf: 'center',
                      }}>
                      <Text style={{fontSize: 12}}>Followers &nbsp;</Text>
                      <Text style={{fontWeight: '600', fontSize: 12}}>
                        {userInfo.followersCount != undefined
                          ? userInfo.followersCount
                          : 0}{' '}
                        &nbsp;
                      </Text>
                      <Text style={{fontSize: 12}}>Following &nbsp;</Text>
                      <Text style={{fontWeight: '600', fontSize: 12}}>
                        {userInfo.followingCount != undefined
                          ? userInfo.followingCount
                          : 0}
                      </Text>
                    </View>
                  </ListItem.Content>
                </ListItem>
              </View>
            )}
          </View>
        </View>
        {!userInfo?.isProfilePrivate && (
          <>
            <ListItem containerStyle={[style.listCont, {marginTop: hp(1)}]}>
              <ListItem.Content>
                {userInfo.bio != null && userInfo.bio != 'null' && (
                  <ListItem.Subtitle
                    style={[
                      style.nickName,
                      {alignSelf: 'flex-start', marginLeft: wp(10)},
                    ]}>
                    {userInfo.bio}{' '}
                  </ListItem.Subtitle>
                )}
              </ListItem.Content>
            </ListItem>
            <View style={style.row}>
              {userInfo.occupation != null &&
                userInfo.occupation != 'null' &&
                userInfo.occupation != '' && (
                  <View style={style.secondRow}>
                    <Icon
                      name="briefcase"
                      type="entypo"
                      color="gray"
                      style={{margin: 5}}
                      size={14}
                    />
                    <Text style={style.innerText}>{userInfo.occupation}</Text>
                  </View>
                )}
              {userInfo.location != null &&
                userInfo.location != 'null' &&
                userInfo.location != '' && (
                  <View style={style.secondRow}>
                    <Icon
                      name="location-on"
                      type="material"
                      color="gray"
                      style={{margin: 5}}
                      size={14}
                    />
                    <Text style={style.innerText}>{userInfo.location}</Text>
                  </View>
                )}
              {userInfo.birthdate != null &&
                userInfo.birthdate != 'null' &&
                userInfo.birthdate != '' && (
                  <View style={style.secondRow}>
                    <Icon
                      name="cake"
                      type="material-community"
                      color="gray"
                      style={{margin: 5}}
                      size={14}
                    />
                    <Text style={style.innerText}>{userInfo.birthdate}</Text>
                  </View>
                )}
            </View>
            <View style={[style.row, {justifyContent: 'flex-start'}]}>
              {userInfo.showEmail && (
                <View style={style.innerRow}>
                  <Icon
                    name="email"
                    type="material"
                    color="gray"
                    style={{margin: 5}}
                    size={14}
                  />
                  <Text style={style.innerText}>{userInfo.email}</Text>
                </View>
              )}
            </View>
          </>
        )}
        {userInfo?.isProfilePrivate && (
          <Text style={style.accountPrivate}>Account is Private</Text>
        )}

        <ScrollView horizontal style={style.categoryContainer}>
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
      </>
    );
  };

  render() {
    const {accounts, userInfo, userLoader, userError, userActivity} =
      this.state;

    let data, renderItem, keyExtractor, onEndReached;
    let UserId = this.state.userId;
    accounts.forEach((element) => {
      if (element.selected) {
        if (element.name == 'Activity') {
          data = userActivity;
          renderItem = ({item, index}) => {
            return (
              <PostCard
                data={item}
                index={index}
                openComment={this.toggoleComments}
                navigation={this.props.navigation}
                reportPost={true}
                manualIncrement={true}
              />
            );
          };
          keyExtractor = (item, index) => index.toString();
          onEndReached = this.getMoreUserActivity;
        } else if (element.name == 'Clips') {
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
      if (userInfo?.isProfilePrivate) {
        data = [];
        UserId = '11';
      }
    });
    return (
      <View style={style.container}>
        {!this.state.showClipList ? (
          <>
            <Header navigation={this.props.navigation} otherProfile={true} />
            {/* <Drawer navigation={this.props.navigation} /> */}
            {/* <StatusBar translucent hidden /> */}
            {userLoader ? (
              <Loader />
            ) : userError ? (
              <Error />
            ) : (
              <View style={{flex: 1}}>
                {accounts.map((item) => {
                  if (item.selected) {
                    if (item.name == 'Activity' || item.name == 'Clips') {
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
                        <SHowFriends
                          isProfilePrivate={userInfo?.isProfilePrivate}
                          newProps={this.props.navigation}
                          toastRef={this.toast}
                          // userId={this.state.userId}
                          userId={UserId}
                          navigate={(data) => {
                            console.log('nav id', data, this.props.myId);
                            if (data.userId == this.props.myId)
                              this.props.navigation.navigate('profile');
                            else {
                              this.fetchData(data.userId);
                              this.setState({userId: data.userId});
                            }
                          }}
                          renderHeader={this.renderPageHeader}
                        />
                      );
                    }
                  }
                })}

                {/* {accounts.map((item) => {
                    if (item.selected && !userInfo?.isProfilePrivate) {
                      if (item.name == 'Activity') {
                        return (
                          <FlatList
                            data={userActivity}
                            renderItem={({item, index}) => {
                              return (
                                <PostCard
                                  data={item}
                                  index={index}
                                  openComment={this.toggoleComments}
                                  navigation={this.props.navigation}
                                  reportPost={true}
                                />
                              );
                            }}
                            keyExtractor={(item, index) => index.toString()}
                            ListEmptyComponent={() => (
                              <EmptyListText style={{height: vScale(100)}} />
                            )}
                            onEndReachedThreshold={0.5}
                            onEndReached={this.getMoreUserActivity}
                          />
                        );
                      } else if (item.name == 'Clips') {
                        if (!this.state.userClips.length) return null;
                        return (
                          <FlatList
                            data={[
                              ...Array(this.state.userClips.length).keys(),
                            ]}
                            style={{flexGrow: 1}}
                            renderItem={this.renderClipThumbnail}
                            keyExtractor={(item, index) => index.toString()}
                            onEndReachedThreshold={0.01}
                            onEndReached={this.getMoreClips}
                          />
                        );
                      } else if (item.name == 'Friends') {
                        return (
                          <SHowFriends
                            isProfilePrivate={userInfo?.isProfilePrivate}
                            newProps={this.props.navigation}
                            toastRef={this.toast}
                            userId={this.state.userId}
                            navigate={(id) => {
                              console.log('nav id', id, this.props.myId);
                              if (id.userId == this.props.myId)
                                this.props.navigation.navigate('profile');
                              else {
                                this.fetchData(id.userId);
                                this.setState({userId: id.userId});
                              }
                            }}
                          />
                        );
                      }
                    }
                  })} */}
              </View>
            )}
          </>
        ) : (
          <UserClipList
            clipList={this.state.userClips}
            initialIndex={this.state.initialIndex}
            getMoreClips={this.getMoreClips}
            newClipNavigate={() => {
              this.setState({showModal: false});
              this.props.navigation.navigate('Clips', {screen: 'NewClip'});
            }}
            closeModal={() => this.setState({showModal: false})}
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
  banner: {width: wp(100), height: hp(30)},
  image: {
    alignSelf: 'center',
    borderColor: '#1b224d',
    // borderWidth: 2,
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
  clipThumbnail: {
    width: '33%',
    height: vScale(180),
    borderBottomWidth: 1,
    borderColor: '#FFF',
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  accountPrivate: {
    ...tStyle('bold', 16, 20, '#000'),
    alignSelf: 'center',
    marginTop: vScale(8),
  },
});
const mapStateToProps = (state) => {
  const {root, user} = state;
  const {userProfile} = user;
  return {
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email,
    adult: userProfile.adult,
    country: userProfile.country,
    bio: userProfile.bio,
    userName: userProfile.username,
    displayName: userProfile.displayName,
    profileUrl: userProfile.profileUrl,
    location: userProfile.location,
    cover: userProfile.cover,
    birthdate: userProfile.birthdate,
    occupation: userProfile.occupation,
    myId: auth().currentUser?.uid,
    myPofile: state?.user?.userProfile,
  };
};

export default connect(mapStateToProps, null)(otherUserProfile);

import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Image,
} from 'react-native';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

import {connect} from 'react-redux';

import {
  sendFirendRequest,
  sendFollowRequest,
  unFirend,
  unFollow,
} from '../backend/apis';
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

import Toast from 'react-native-toast-message';
import {
  checkFollowStatus,
  checkFriendStatus,
  follow,
  sendFriendRequest,
  unfollow,
  unFriend,
} from '../backend/friends';
import {scale, mScale, vScale} from '../configs/size';
import Utility from '../utils/Utility';
import RoundImage from './roundImage';


class UserRow extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      users: [],
      loader: false,
      followLoader: false,
      followDisable: false,
      disabled: false,
      friendDocRef: null,
      friendDocData: null,
      followDocData: null,
      followDocRef: null,
    };
    this.toast = React.createRef();
    console.log(this.props.item);
  }
  componentDidMount() {
    this._isMounted = true;
    if(Utility.getSearchType()==2) {
      console.log(this.props.item, '---data--');
      this.checkFriendStatus();
      this.checkFollowStatus();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }


  checkFriendStatus = async () => {
    try {
      const payload = {
        userid1: this.props.item.userId,
        userid2: this.props.userId,
      };
      console.log('payload', payload);
      const result = await checkFriendStatus(payload);
      console.log('checkFriendStatusMaine', result);
      if (result) {
        if (this._isMounted) {
        if (result?.status == 'accepted' && result.areFriends == true) {
          this.setState({
            disabled: true,
            friendDocRef: result?.ref,
            friendDocData: result,
          });
        } else {
          this.setState({
            disabled: false,
            friendDocRef: result?.ref,
            friendDocData: result,
          });
        }
      } else {
        if (this._isMounted) {
          // this.setState({disabled: false});
        }
      }
    }
    } catch (error) {
      if (this._isMounted) {
      console.log('error while checking friend status', error);
      //this.setState({disabled: false});
      }
    }
  };

  checkFollowStatus = async () => {
    try {
      const payload = {
        userid1: this.props.item.userId,
        userid2: this.props.userId,
      };
      const result = await checkFollowStatus(payload);
      console.log('checkFollowStatusOK', result);
      console.log(
        'checkFollowStatusAgo',
        result?.isFollowingOtherUser?.[`${this.props.item.userId}`],
      );

      if (result) {
        if (this._isMounted) {
        if (result?.isFollowingOtherUser?.[`${this.props.userId}`]) {
          this.setState({
            followDisable: true,
            followDocRef: result?.ref,
            followDocData: result,
          });
        } else {
          this.setState({followDisable: false, followDocRef: result?.ref});
        }
      } else {
        if (this._isMounted) {
        this.setState({followDisable: false});
        }
      }
    }
    } catch (error) {
      if (this._isMounted) {
      console.log('error while checking follow status', error);
      this.setState({followDisable: false})
      };
    }
  };

  onSendRequest = async () => {
    const userid1 = this.props.item.userId;
    const userid2 = this.props.userId;
    const payload = {
      identifiers: [`${userid1}_${userid2}`, `${userid2}_${userid1}`],
      users: [userid1, userid2],
      userData: [
        {
          userId: userid1,
          profileUrl: this.props.item.profileUrl,
          displayName: `${this.props.firstName} ${this.props.lastName}`,
        },
        {
          userId: userid2,
          profileUrl: this.props.profileUrl,
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
        profileUrl: this.props.item.profileUrl || null,
        displayName: `${this.props.firstName} ${this.props.lastName}`,
      },
    };

    this.setState({loader: true});
    try {
      await sendFriendRequest(payload);
      this.setState({disabled: true, loader: false});
    } catch (error) {
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
      await unFriend(friendDocRef);
      this.setState({disabled: true, loader: false});
    } catch (error) {
      this.setState({loader: false});
    }
  };

  onSendFollowRequest = async () => {
    const {item} = this.props;
    const userid1 = this.props.item.userId;
    const userid2 = this.props.userId;
    console.log('userid1', userid1);
    console.log('userid2', userid2);
    const payload = {
      identifiers: [`${userid1}_${userid2}`, `${userid2}_${userid1}`],
      users: [userid1, userid2],
      userData: [
        {
          userId: userid1,
          profileUrl: this.props.item.profileUrl || null,
          displayName: `${this.props.firstName} ${this.props.lastName}` || '',
        },
        {
          userId: userid2,
          profileUrl: this.props.profileUrl || null,
          displayName: this.props.displayName,
        },
      ],
      isFollowedByOtherUser: {
        [userid1]: true,
        [userid2]: this.state.followDisable,
      },
      isFollowingOtherUser: {
        [userid1]: this.state.followDisable,
        [userid2]: true,
      },
    };
    console.log(payload);
    this.setState({followLoader: true});
    try {
      const result = await follow({
        payload,
        otherUserId: userid1,
        currentUserId: userid2,
      });
      console.log('follow result', result);
      this.props.updateFollowingCOunt(this.props.following + 1);
      this.checkFollowStatus();
      this.setState({
        followDisable: true,
        followLoader: false,
      });
    } catch (error) {
      console.log('error while follow', error);
      this.setState({followLoader: false});
    }
  };

  unFollow = async () => {
    const {followDocData} = this.state;
    const userid1 = this.props.item.userId;
    const userid2 = this.props.userId;
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
    console.log('payload', payload);
    this.setState({followLoader: true});
    try {
      await unfollow({ref: this.state.followDocRef, payload});
      // this.props.updateFollowingCOunt(this.props.following - 1);
      this.setState({followDisable: false, followLoader: false});
    } catch (error) {
      console.log('error while unfollowing', error);
      this.setState({followLoader: false});
    }
  };

  render() {
    const {item,searchType} = this.props;

    const {
      disabled,
      followDisable,
      friendDocData,
      friendDocRef,
      followDocData,
      followDocRef,
    } = this.state;
    const renderInitials = (name) => {
      
      if (name && name.split(' ').length > 1) return `${name[0]}${name.split(' ')[1][0]}`;
      else if (name)
        return name[0];
        else 
        return ''
    };
    // console.log('ite', item);
    // const item2 = {"adult": undefined, "bio": undefined, "birthdate": "20/8/2022", "country": "India", "cover": null, 
    // "data": {"access": "public_notHidden", "activityCount": 2, "date": 1661592387292, "id": "vIzYMtyyXKKKTZUMoHj4", 
    // "isHidden": false, "isReadMore": true, "isShared": true, "sharedFrom": {"date": 1659032991725, "id": "vStNWVlE8AhOqRpYgR0b", 
    // "title": "Skylar Rose", "urlReadmore": "My pic", "user": "Fz0hqyXssYfmdbrcYTGQnnfK69O2", 
    // "userImage": "https://firebasestorage.googleapis.com:443/v0/b/the-citizens.appspot.com/o/images%2Fprofile%2Fla_balla_fresh@hotmail.com?alt=media&token=8b2af9b2-0b68-4aba-84b6-a2c992ee9528"}, 
    // "storyAssets": [[Object]], "title": "mohit vashita", "totalComments": 2, 
    // "type": null, "urlReadmore": "Nice", "user": "MJ4qJCWUPvXM2ujfm7tvPYXYeha2", "userImage": null}, 
    // "dispatch": [], "displayName": "mohit vashita", "email": "mohitvashita1994@gmail.com", "firstName": "mohit", 
    // "focused": true, "index": 0, "lastName": "vashita", "location": "Delhi", "navigation": {"addListener": [], 
    // "canGoBack": [], "dangerouslyGetParent": [], "dangerouslyGetState": [], "dispatch": [], 
    // "getParent": [], "getState": [], "goBack": [], "isFocused": [], "jumpTo": [], "navigate": [], "pop": [], 
    // "popToTop": [], "push": [], "removeListener": [], "replace": [], "reset": [], "setOptions": [], "setParams": []}, 
    // "occupation": "Developer", "openComment": undefined, "profileUrl": null, 
    // "reportPost": true, "userId": "MJ4qJCWUPvXM2ujfm7tvPYXYeha2", "userName": undefined};
    return (
      <View>
        {Utility.getSearchType()==1 && (
          <TouchableOpacity
                style={style.hashtagWrapper}
                onPress={() => {
                  Keyboard.dismiss();
                         this.props.closeSearchFilter();
                         if (this.props.onclose) {
                          this.props.onclose();
                         }
                  this.props.navigation.navigate('SinglePost', {
                      postData: {data:item},
                      userId: this.props.userId
                    })
                    if (this.props.inHeader) {
                        this.props.toggoleDrawer();
                      }

                }}
                >
                <View>
                  <Text style={style.text2}>{item?.urlReadmore}</Text>
                  <Text style={style.text3}>
                    {/* {renderCount(item?.count || 0)} */}
                     {/* circulating */}
                     {item?.title}
                  </Text>
                </View>
                
              </TouchableOpacity>
        )}
        {Utility.getSearchType()==3 && (
          
              <TouchableOpacity
                style={style.hashtagWrapper}
                onPress={() => {
                  Keyboard.dismiss();
                         this.props.closeSearchFilter();
                  this.props.navigation.navigate('Explore', {
                    screen: 'TrendingPosts',
                    params: {
                      title: item?.title,
                    },
                  });
                  if (this.props.inHeader) {
                        this.props.toggoleDrawer();
                      }

                }}
                >
                <View>
                  <Text style={style.text2}>#{item?.title}</Text>
                  {/* <Text style={style.text3}> */}
                    {/* {renderCount(item?.count || 0)} */}
                     {/* circulating */}
                  {/* </Text> */}
                </View>
                
              </TouchableOpacity>
            
        )}
        {Utility.getSearchType()==4 && (
          <TouchableOpacity
                      style={{flexDirection: 'row',
                      alignItems: 'center',
                      width: scale(344),
                      paddingLeft: scale(15),
                      marginBottom: vScale(15),
                      marginTop:vScale(10)
                    }}
                      onPress={() => {
                        Keyboard.dismiss();
                         this.props.closeSearchFilter();
                        this.props.navigation.navigate('Activism');
                        setTimeout(() => {
                          this.props.navigation.navigate('Activism',
                            {
                              screen: 'ActivismDetails',
                              params: {
                                id: item.id,
                              },
                            }
                          );

                        }, 100);
                      if (this.props.inHeader) {
                        this.props.toggoleDrawer();
                      }
                        
                      }}>
                      <View
                        style={{
                          height: vScale(23),
                          width: vScale(23),
                          borderRadius: vScale(23),
                          marginLeft: scale(5),
                          backgroundColor: '#1e2348',
                          justifyContent: 'center',
                          alignItems: 'center',
                          overflow: 'hidden',
                          backgroundColor: '#d9d9d9',
                        }}>
                        {item.profileUrl ? (
                          <Image
                            source={{uri: item.profileUrl}}
                            style={{height: '100%', width: '100%'}}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text>{renderInitials(item?.title)}</Text>
                        )}
                      </View>
                      <View style={{marginLeft: scale(10), maxWidth: '45%'}}>
                        <Text
                          numberOfLines={1}
                          style={{fontSize: mScale(18), fontWeight: 'bold'}}>
                          {item?.title}
                        </Text>
                      </View>
                      {/* {showInviModal && (
                        <TouchableOpacity
                          style={styles.btn1}
                          onPress={() =>
                            acceptInvite(userProfile.userId, movement.id)
                          }>
                          <Text style={{color: '#fff'}}>Accept</Text>
                        </TouchableOpacity>
                      )}
                      {showInviModal && (
                        <TouchableOpacity
                          style={styles.btn2}
                          onPress={() =>
                            declineInvite(userProfile.userId, movement.id)
                          }>
                          <Text style={{color: '#fff'}}>Decline</Text>
                        </TouchableOpacity>
                      )} */}
                    </TouchableOpacity>
        )}
        { 
          Utility.getSearchType()==2 && (
        <ListItem
        key={item.userId}
          containerStyle={{margin: 0, padding: 5}}
          onPress={() => {
            console.log(disabled, '---');
            Keyboard.dismiss();
            this.props.closeSearchFilter();
            if (item.userId == this.props.userId) {
              this.props.navigation.navigate('profile');
            } else {
              this.props.navigation.navigate('otherProfile', {
                userId: item.userId,
              });
            }

            if (this.props.inHeader) {
              this.props.toggoleDrawer();
            }
          }}>
            <RoundImage
                  userId={item.userId}
                  imageUrl={item.profileUrl}
                  displayName={item?.displayName}
                  size={30}
                />
          <ListItem.Content>
            <ListItem.Title style={{fontSize: 10}}>
              {item.displayName}
            </ListItem.Title>
          </ListItem.Content>
          {this.props.userId != item.userId ? (
            <View style={style.bannerBottom}>
              {/* {this.state.loader ? <ActivityIndicator color="#18224f" /> :
                            <TouchableOpacity onPress={() => {
                                //     alert(item._id)
                                if (!this.state.disabled) {
                                    this.onSendRequest()
                                }
                                // this.setState({loader:true})
                            }}>

                                <Icon name="add-user" type="entypo" color="#fff" size={15} style={[style.bannerIcon, { backgroundColor: this.state.disabled ? 'silver' : '#1e2348' }]} />
                            </TouchableOpacity>} */}
              {this.state.followLoader ? (
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
                <>
                <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  this.props.closeSearchFilter();
                  this.props.navigation.navigate('ChatStack', {
                    screen: 'SingleChat',
                    params: {
                      friendId: {
                        userId: item.userId,
                        displayName: item.displayName,
                        profileUrl: item.profileUrl,
                      },
                    },
                  });
                   if (this.props.inHeader) {
              this.props.toggoleDrawer();
            }
                }}>
                <Icon
                  name="chat"
                  type="entypo"
                  color="#fff"
                  size={15}
                  style={style.bannerIcon}
                />
              </TouchableOpacity>
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

                    if (!this.state.followDisable) {
                      this.onSendFollowRequest();
                    } else {
                      this.unFollow();
                    }
                    // this.setState({loader:true})
                  }}>
                  <Text style={{color: '#1e2348'}}>
                    {this.state.followDisable ? 'Unfollow' : 'Follow'}
                  </Text>
                </TouchableOpacity>
                </>
              )}
              {/* {this.state.followLoader ? <ActivityIndicator color="#18224f" /> :
                            <TouchableOpacity onPress={() => {
                                //     alert(item._id)
                                if (!this.state.followDisable) {
                                    this.onSendFollowRequest()
                                }
                                // this.setState({loader:true})
                            }}>

                                <Icon name="follow-the-signs" type="material" color="#fff" size={15} style={[style.bannerIcon, { backgroundColor: this.state.followDisable ? 'silver' : '#1e2348' }]} />
                            </TouchableOpacity>} */}
            </View>
          ) : null}
        </ListItem>
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
  hashtagWrapper: {
    marginLeft: scale(30),
    marginRight: scale(15),
    marginTop: vScale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text2: {
    fontSize: mScale(16),
    fontWeight: 'bold',
    color: '#333333',
  },
  text3: {
    fontSize: mScale(13),
    color: '#333333',
  },
  btn: {
    position: 'absolute',
    right: scale(20),
    top: vScale(10),
    borderColor: '#8c8c8c',
    borderWidth: 1,
    borderRadius: scale(5),
    padding: scale(5),
    paddingVertical: vScale(2),
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
  },
  headerINput: {height: hp(5), borderRadius: 20},
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
    userName: userProfile.userName,
    displayName: `${userProfile.firstName} ${userProfile.lastName}`,
    profileUrl: userProfile.profileUrl,
    location: userProfile.location,
    cover: userProfile.cover,
    birthdate: userProfile.birthdate,
    occupation: userProfile.occupation,
    showSearcHresult: root.showSearcHresult,
    search: root.search,
    allUsers: root.allUsers,
    onlyfiveResult: root.onlyfiveResult,
    userId: auth().currentUser?.uid,
  };
};
const mapDispachToProps = (Dispatch) => {
  return {
    toggoleDrawer: () => Dispatch({type: 'toggoleDrawer'}),
    // addSearch: (search) => Dispatch({type: 'addSearch', search: search}),
    // setAlluser: (users) => Dispatch({type: 'setAlluser', users: users}),
    closeSearchFilter: () => Dispatch({type: 'closeSearchFilter'}),
    updateFollowingCOunt: (following) =>
      Dispatch({type: 'updateFollowingCOunt', following}),
  };
};

export default connect(mapStateToProps, mapDispachToProps)(UserRow);

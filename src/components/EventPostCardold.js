import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {connect} from 'react-redux';
import {
  Icon,
  ListItem,
  Avatar,
  Input,
  Card,
  Overlay,
  Button,
  Divider,
} from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import PostAsstes from './postAssets';
import RNPoll, {IChoice} from 'react-native-poll';
import {getOtherUser} from '../backend/apis';
import auth from '@react-native-firebase/auth';
import {mScale, scale, vScale} from '../configs/size';
import errorLog, {defaultAlert} from '../Constants/errorLog';
import {displayTextWithMentionsAndHashtags} from '../utils/displayWithMentionAndHashtags';
import AssetCarousel from './postAssetsCarousel';
import HyperLink from 'react-native-hyperlink';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import AppModalView from './appModal/AppModalView';
import RoundImage from './roundImage';

class EventPostCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasBeenVoted: false,
      shareModal: false,
      sharedText: '',
      selectedPost: null,
      otherUserLoader: false,
      otheruserData: null,
      assets: this.props.data?.storyAssets,
      liked: false,
      likedCount: 0,
      commented: false,
      likeError: false,
      sharedPollData: {},
      blockLike: false,
      votedChecked: false,
      playVideo: true,
      commentCount: 0,
      showModal: false,
      alreadyMuted: false
    };
  }

  
  formatMentionNode = (txt, key) => {
    const userId = key.replace(/^[0-9]+-/, '').replace(/-[0-9]+$/, '');

    return (
      <Text
        key={key}
        onPress={() => {

          if (this.props.userId !== userId) {
            this.props.navigation.navigate('otherProfile', {userId});
          } else {
            this.props.navigation.navigate('profile');
          }
        }}
        style={style.link}>
        {txt}
      </Text>
    );
  };

  formatHashtagNode = (txt) => {
    return (
      <Text
        // key={key}
        onPress={() => {
          this.props.navigation.navigate('Explore', {
            screen: 'TrendingPosts',
            params: {
              title: txt.split('#')[1],
            },
          });
        }}
        style={style.link}>
        {txt}
      </Text>
    );
  };

  getInitalLikedCount() {
    if (
      this.props.data?.totalLikes !== undefined &&
      this.props.data?.totalLikes !== this.state.likedCount
    ) {
      this.setState({likedCount: this.props.data?.totalLikes});
    }
  }

  componentDidMount() {

    this.getInitalLikedCount();
    this.getIsLiked();
    if (this.props?.data?.type == 'poll' && this.props?.data?.isShared)
      this.getSharedPollData(this.props?.data?.sharedFrom?.id);
  }

  getIsLiked = () => {
    firestore()
      .collection('Posts')
      .doc(this.props.data.id)
      .collection('Likes')
      .doc(this.props.userId)
      .get()
      .then((snap) => {
        if (snap.exists) {
          this.setState({liked: true});
        }
      })
      .catch((err) => {
        this.setState({likeError: true});
        errorLog('getting liked status', err);
      });
  };

  toggoleModal = () => {
    this.setState({shareModal: !this.state.shareModal});
  };

  formatAMPM(hours, minutes) {
    var hours = hours;
    var minutes = minutes;
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  likePost = async (item) => {
    if (!this.state.likeError) {
      if (this.state.liked) {
        this.setState({liked: false, likedCount: this.state.likedCount - 1});
      } else {
        this.setState({liked: true, likedCount: this.state.likedCount + 1});
      }
    }
    try {
      const postRef = firestore().collection('Posts').doc(item.data.id);
      const likedUserRef = postRef.collection('Likes').doc(this.props.userId);
      this.setState({blockLike: true});
      const state = await firestore().runTransaction(async (transaction) => {
        const snapshot = await transaction.get(likedUserRef);
        const postSnap = await transaction.get(postRef);
        if (snapshot.exists) {
          transaction.update(postRef, {
            totalLikes: firestore.FieldValue.increment(-1),
            activityCount: firestore.FieldValue.increment(-1),
          });
          transaction.delete(likedUserRef);
          return {
            liked: false,
            likedCount: postSnap.data().totalLikes - 1,
          };
        } else {
          transaction.update(postRef, {
            totalLikes: firestore.FieldValue.increment(1),
            activityCount: firestore.FieldValue.increment(1),
          });
          transaction.set(likedUserRef, {
            id: this.props.userId,
            displayName: this.props.displayName,
            profileUrl: this.props.profileUrl,
          });
          return {
            liked: true,
            likedCount: (postSnap.data()?.totalLikes || 0) + 1,
          };
        }
      });
      this.setState({...state, blockLike: false});
    } catch (error) {
      this.setState({blockLike: false``});
      errorLog('like/dislike', error);
      defaultAlert();
    }
  };

  submitPoll = (item, index, choice) => {
    let tempChoices = item?.data?.choices;
    tempChoices[index] = choice;
    let votedArr =
      item?.data?.votedArray != undefined ? item?.data?.votedArray : [];
    votedArr.push({
      name: this.props.displayName,
      userId: this.props.userId,
      image: this.props?.imageUrl || '',
    });
    firestore()
      .collection('Posts')
      .doc(item.data.id)
      .update({
        choices: tempChoices,
        votedArray: votedArr,
        totalVotes: item?.data?.totalVotes + 1,
      })
      .then(() => {
        if (item.data?.isShared)
          this.setState({
            sharedPollData: {
              ...this.state.sharedPollData,
              choices: tempChoices,
              votedArray: votedArr,
              totalVotes: item?.data?.totalVotes + 1,
              alreadyVoted: true,
            },
          });
      })
      .catch((err) => {
        alert('Please try again later');
      });
  };

  sharePost = async () => {
    // console.log('item', this.state.selectedPost?.data);
    if (this.state.selectedPost != null) {
      var item = this.state.selectedPost;
      let sharedFrom;
      if (item.data?.isShared) {
        sharedFrom = {
          userImage: item?.data?.sharedFrom?.userImage || null,
          title: item?.data?.sharedFrom?.title || null,
          user: item?.data?.sharedFrom?.user || null,
          urlReadmore: item?.data?.sharedFrom?.urlReadmore || null,
          date: item?.data?.sharedFrom?.date || null,
          id: item?.data?.sharedFrom?.id,
        };
      } else {
        sharedFrom = {
          userImage: item?.data?.userImage || null,
          title: item?.data?.title || null,
          user: item?.data?.user || null,
          urlReadmore: item?.data?.urlReadmore || null,
          date: item?.data?.date || null,
          id: item?.data?.id,
        };
      }
      let payLoad = {
        title: this.props.displayName || null,
        isReadMore: this.state.sharedText.length > 0 ? true : false,
        urlReadmore: this.state.sharedText || null,
        user: this.props.userId || null,
        access: item.data?.access,
        isHidden: item.data?.isHidden,
        storyAssets: item?.data?.storyAssets || null,
        date: new Date().getTime(),
        userImage: this.props?.profileUrl || null,
        access: item?.data?.access || null,
        type: item?.data?.type || null,
        isShared: true,
        sharedFrom: sharedFrom,
      };
      this.setState({shareModal: false});

      try {
        const batch = firestore().batch();

        batch.set(firestore().collection('Posts').doc(), payLoad);
        batch.update(firestore().collection('Posts').doc(item.data.id), {
          activityCount: firestore.FieldValue.increment(1),
        });
        await batch.commit();
      } catch (error) {
        defaultAlert();
      }
    }
  };

  CustomText = (props) => {
    if (typeof props == 'string' && props != '') {
      return (
        <View
          style={{
            minHeight:
              this.state.assets == undefined || this.state.assets.length == 0
                ? hp(8)
                : 0,
            justifyContent: 'center',
          }}>
          <HyperLink linkDefault={true} linkStyle={style.link}>
            <Text style={{marginHorizontal: 10, marginBottom: 10}}>
              {displayTextWithMentionsAndHashtags(
                props,
                this.formatMentionNode,
                this.formatHashtagNode,
              )}
            </Text>
          </HyperLink>
        </View>
      );
    } else {
      return null;
    }
  };

  getOtherUserData = (id) => {
    this.setState({otherUserLoader: true});
    getOtherUser(id).then((data) => {
      let tempArray = [];
      if (data.success) {
        this.setState({otherUserLoader: false, otheruserData: data.data[0]});
        // console.log(this.props.item, '---data--');
        if (data.data != undefined && data.data.length > 0) {
          let disabled = false;
          let followDisable = false;

          for (let i = 0; i < data.data[0].friendRequests.length; i++) {
            if (data.data[0].friendRequests[i].user == this.props.userId) {
              disabled = true;
              break;
            }
          }

          for (let i = 0; i < data.data[0].followers.length; i++) {
            if (data.data[0].followers[i].user == this.props.userId) {
              followDisable = true;
              break;
            }
          }
          this.props.navigation.navigate('otherProfile', {
            item: data.data[0],
            aleadyFirend: disabled,
            alreadyFollower: followDisable,
          });
        }
      }
    });
  };

  checkVoted = (data) => {
    var voted = false;
    let obj = data?.votedArray.find((o) => o.userId === this.props.userId);
    if (obj != undefined) {
      voted = true;
    }
    return voted;
  };

  getSharedPollData = (id) => {
    firestore()
      .collection('Posts')
      .doc(id)
      .get()
      .then((doc) =>
        this.setState(
          {
            sharedPollData: {
              ...doc.data(),
              id: doc.id,
              alreadyVoted: this.checkVoted(doc.data()),
            },
            votedChecked: true,
          },
          this.forceUpdate(),
        ),
      )
      .catch((err) => console.log('err', err));
  };

  reportPost = (id, item) => {
    try {
      const postRef = firestore().collection('Posts').doc(id);
      const reportRef = postRef.collection('Reports').doc(this.props.userId);
      reportRef.get().then((snap) => {
        if (snap.exists) alert('You already reported this post.');
        else {
          const body = {
            id: this.props.userId,
            profileUrl: this.props?.profileUrl,
            displayName: this.props?.displayName,
          };
          const batch = firestore().batch();
          batch.set(reportRef, body);
          batch.update(postRef, {
            isReported: true,
            reportCount: firestore.FieldValue.increment(1),
          });
          batch.commit();
          if (this.props.onRefresh) {
            this.props.onRefresh();
          }
        }
      });
    } catch (err) {
      console.log('err', err);
    }
  };

  commentCountIncrement = () => {
    if (this.props?.manualIncrement)
      this.setState({
        commentCount:
          Math.max(this.state.commentCount, this.props.data?.totalComments) + 1,
      });
  };


  muteUser = (username,creatorId) => {
    try {
     
      const ref = firestore().collection('Users').doc(this.props.userId);
      const muteRef = ref.collection('Mutes').doc(creatorId);
      muteRef.get().then((snap) => {
        if (snap.exists){
          var docRef = firestore().collection("Users").doc(this.props.userId).collection("Mutes");
          // delete the document
          docRef.doc(creatorId).delete();
          this.setState({alreadyMuted: false});
          if (this.props.onRefresh) {
            this.props.onRefresh();
          }
        } 
        else {
          const body = {
            id: creatorId,
            displayName: username,
          };
          const batch = firestore().batch();
          batch.set(muteRef, body);
          batch.commit();
          this.setState({alreadyMuted: true});
          if (this.props.onRefresh) {
            this.props.onRefresh();
          }
        }
      });
    } catch (err) {
      console.log('err', err);
    }
  }

  renderModal = (isMute, creatorId, userDisplayName) => {
    const {item, deletePost, reportPost} = this.props;
    return(
    <AppModalView
        visible={this.state.showModal}>
        <View style={{ paddingHorizontal: 30, paddingRight: 20, paddingTop: 15, paddingBottom: 40, backgroundColor: '#fff' }}>
          {
            deletePost ?
            <TouchableOpacity
            onPress={() =>{ 
              this.setState({showModal: false});
              deletePost(item?.data?.id, item?.data?.hashtags);
              if (this.props.onRefresh) {
            this.props.onRefresh();
          }
            }}
            style={style.modalButton}>
            <Text
            style={style.modalText}>
            Delete
            </Text>
          </TouchableOpacity>
          : null
          }
        
          {
            reportPost ?
            <TouchableOpacity
            onPress={() =>{
              this.setState({showModal: false});
              this.reportPost(item?.data?.id, item);
            }}
            style={style.modalButton}>
            <Text
            style={style.modalText}>
            Report
            </Text>
          </TouchableOpacity>
          :null
          }
          {
            isMute ?
            <TouchableOpacity
            onPress={() =>{
              this.setState({showModal: false});
             this.muteUser(userDisplayName, creatorId)
            }}
            style={style.modalButton}>
            <Text
            style={style.modalText}>
            {this.state.alreadyMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>
          :null
          }
          <TouchableOpacity
            onPress={() =>{this.setState({showModal: false})}}
            style={style.modalButton}>
            <Text
            style={style.modalText}>
            Cancel
            </Text>
          </TouchableOpacity>

          
        </View>
      </AppModalView>
    )
  }

  render() {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const item = this.props;
    const index = this.props.index;
    let date = new Date(item?.data?.date || '');
    let sharedDate = new Date(item.data?.sharedFrom?.date || '');

    let alreadyLiked = false;
    let voted = false;
    if (item?.data?.votedArray != undefined) {
      let obj = item?.data?.votedArray.find(
        (o) => o.userId === this.props.userId,
      );
      if (obj != undefined) {
        voted = true;
      }
    }
    const {hideCommentBtn, carousel, deletePost, reportPost} = this.props;
    const creatorId =
                  item?.data?.user?.split('_').length > 1
                    ? item.data.user.split('_')[1]
                    : item.data.user;

                    const userDisplayName = item.data.title;

    // if (!item.data?.user) return null;

    // if (item.data?.type == 'poll' && item.data?.isShared)
    //   console.log(
    //     'shared poll',
    //     this.state.sharedPollData,
    //     voted,
    //     this.state.sharedPollData?.alreadyVoted,
    //   );

    return (
      
      <Card
        containerStyle={{
          marginHorizontal: scale(8),
          elevation: 1,
          borderRadius: mScale(8),
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.18,
          shadowRadius: 1.0,
          paddingTop: vScale(10),
          paddingHorizontal: 0,
          paddingBottom: 0,
        }}
        wrapperStyle={{
          padding: 0,
          margin: 0,
        }}
        key={index}>
        <ListItem
          containerStyle={{
            padding: 0,
            marginLeft: scale(10),
            paddingBottom: vScale(15),
          }}>
             <RoundImage
            imageUrl={ item.data?.userImage}
            displayName={item.data?.title}
            size={50}
          />
          
          <ListItem.Content style={{margin: 0, padding: 0}}>
            {/* <TouchableOpacity
              onPress={() => {
                
                if (this.props.userId === creatorId) {
                  this.props.navigation.navigate('profile');
                } else
                  this.props.navigation.navigate('otherProfile', {
                    userId: creatorId,
                  });
              }}> */}
              <ListItem.Title
                style={{fontSize: 15, color: '#000', fontWeight: 'bold'}}>
                {item.data.title}
              </ListItem.Title>
            {/* </TouchableOpacity> */}

            {/* <ListItem.Subtitle style={{color: '#8c8c8c', fontSize: 13}}>
              {`${
                monthNames[date.getMonth()]
              } ${date.getDate()} at ${this.formatAMPM(
                date.getHours(),
                date.getMinutes(),
              )}`}
            </ListItem.Subtitle> */}
          </ListItem.Content>
          
          {/* {(deletePost || (reportPost && this.props.userId !== creatorId)) ? (
            <TouchableOpacity 
            onPress={() => {
              this.setState({showModal: true});
            }}
            >
              <Icon
                    name="dots-three-horizontal"
                    type="entypo"
                    size={14}
                    style={style.iconRight}
                    color="#8c8c8c"
                  />
            </TouchableOpacity>
            
          ) : null} */}
          
        </ListItem>
        {/* {item?.data?.urlReadmore && this.CustomText(item?.data?.urlReadmore)} */}
        {this.CustomText(item?.data?.urlReadmore)}
        {item.data?.isShared && (
          <>
            <Divider />
            <ListItem>
              <>
              <RoundImage
                  userId={item.data.sharedFrom.user.split('_').length > 1
                  ? item.data.sharedFrom.user.split('_')[1]
                  : item.data.sharedFrom.user}
                  imageUrl={item?.data?.sharedFrom?.userImage}
                  displayName={item?.data?.sharedFrom?.title}
                  size={30}
                />
                <ListItem.Content style={{marginLeft: 20}}>
                  <TouchableOpacity
                    onPress={() => {
                      const creatorId =
                        item.data.sharedFrom.user.split('_').length > 1
                          ? item.data.sharedFrom.user.split('_')[1]
                          : item.data.sharedFrom.user;
                      if (this.props.userId === creatorId) {
                        this.props.navigation.navigate('profile');
                      } else
                        this.props.navigation.navigate('otherProfile', {
                          userId: creatorId,
                        });
                    }}>
                    <ListItem.Subtitle
                      style={{fontSize: 10, fontWeight: 'bold'}}>
                      <Text style={{fontSize: 15, fontWeight: '700'}}>
                        {item?.data?.sharedFrom?.title}
                      </Text>
                    </ListItem.Subtitle>
                  </TouchableOpacity>
                  <ListItem.Subtitle style={{color: '#000'}}>
                    {`${
                      monthNames[sharedDate.getMonth()]
                    } ${sharedDate.getDate()} at ${this.formatAMPM(
                      sharedDate.getHours(),
                      sharedDate.getMinutes(),
                    )}`}
                  </ListItem.Subtitle>
                </ListItem.Content>
              </>
            </ListItem>
          </>
        )}
        {
          item?.data?.type != 'poll' &&
            item?.data?.sharedFrom &&
            this.CustomText(item?.data?.sharedFrom?.urlReadmore)
          // {item?.data?.urlReadmore}
          // <CustomText text={item?.data?.urlReadmore}/>
        }
        {item?.data?.type == 'poll' ? (
          item?.data?.isShared ? (
            this.state.votedChecked ? (
              <View>
                <ListItem containerStyle={{marginTop: 0, paddingBottom: 0}}>
                  <ListItem.Title>
                    {this.state.sharedPollData?.pollQuestion}
                  </ListItem.Title>
                </ListItem>
                <ListItem containerStyle={{marginTop: 0, paddingVertical: 0}}>
                  <RNPoll
                    totalVotes={this.state.sharedPollData?.totalVotes}
                    choices={this.state.sharedPollData?.choices || []}
                    hasBeenVoted={this.state.sharedPollData?.alreadyVoted}
                    pollContainerStyle={{
                      width: wp(85),
                      paddingBottom: vScale(10),
                    }}
                    onChoicePress={(selectedChoice) => {
                      this.submitPoll(
                        {data: this.state.sharedPollData},
                        selectedChoice.index,
                        selectedChoice,
                      );
                    }}
                  />
                </ListItem>
              </View>
            ) : null
          ) : (
            <View>
              <ListItem containerStyle={{marginTop: 0, paddingBottom: 0}}>
                <ListItem.Title>{item?.data?.pollQuestion}</ListItem.Title>
              </ListItem>
              <ListItem containerStyle={{marginTop: 0, paddingVertical: 0}}>
                <RNPoll
                  totalVotes={item?.data?.totalVotes}
                  choices={item?.data?.choices || []}
                  hasBeenVoted={voted}
                  pollContainerStyle={{
                    width: wp(85),
                    paddingBottom: vScale(10),
                  }}
                  onChoicePress={(selectedChoice) => {
                    this.submitPoll(item, selectedChoice.index, selectedChoice);
                  }}
                />
              </ListItem>
            </View>
          )
        ) : (
          <View>
            {this.state.assets != undefined && this.state.assets.length > 0 ? (
              carousel ? (
                <AssetCarousel
                  content={this.state.assets}
                  focused={this.props?.focused && this.state.playVideo}
                />
              ) : (
                <PostAsstes
                  content={this.state.assets}
                  // openComments={() => {
                  //   this.props.navigation.navigate('SinglePost', {
                  //     postData: item,
                  //     userId:this.props.userId
                  //   });
                  // }}
                  width={scale(355)}
                  focused={this.props?.focused && this.state.playVideo}
                  disableTouch={true}

                />
              )
            ) : (
              <></>
            )}
          </View>
        )}
        <Overlay
          isVisible={this.state.shareModal}
          onBackdropPress={this.toggoleModal}
          statusBarTranslucent={true}
          overlayStyle={{
            ...style.shareContainer,
            minHeight:
              this.state.assets != undefined && this.state.assets.length > 0
                ? hp(65)
                : hp(15),
          }}>
          <>
          <Input
            // placeholder="Say Something about this"
            //    leftIcon={{ type: 'entypo', name: 'text', size: 18, iconStyle: { marginHorizontal: 10 } }}
            //  label="Say Something"
            numberOfLines={5}
            multiline={true}
            inputStyle={{fontSize: 14}}
            inputContainerStyle={style.inputCont}
            // containerStyle={style.contStyle}
            placeholder="Add a comment"
            errorStyle={style.errorStyle}
            value={this.state.sharedText}
            onChangeText={(sharedText) => {
              this.setState({sharedText});
            }}
          />
          <Button
            title="Circulate"
            containerStyle={{
              backgroundColor: '#1e2348',
              marginHorizontal: wp(2),
            }}
            buttonStyle={{backgroundColor: 'transparent'}}
            onPress={this.sharePost}
          />
          <ScrollView
            style={{
              marginHorizontal: wp(2),
              marginVertical: hp(2),
              borderColor: 'silver',
              borderTopWidth: 1,
            }}>
            {item?.data?.type != 'poll'
              ? item?.data?.isShared
                ? this.CustomText(item?.data?.sharedFrom?.urlReadmore || '')
                : this.CustomText(item?.data?.urlReadmore || '')
              : null}
            {this.state.assets != undefined && this.state.assets.length > 0 ? (
              <View>
                <PostAsstes
                  content={this.state.assets.slice(0, 1)}
                  width={wp(87)}
                  height={hp(60)}
                  disableTouch={true}
                />
                {this.state.assets.length > 1 && (
                  <Text style={{color: 'blue', fontSize: mScale(16)}}>
                    + {this.state.assets.length - 1} more
                  </Text>
                )}
              </View>
            ) : item?.data?.type == 'poll' ? (
              <View>
                <ListItem
                  containerStyle={{marginVertical: 0, paddingBottom: 0}}>
                  <ListItem.Title>{item?.data?.pollQuestion}</ListItem.Title>
                </ListItem>
                <ListItem
                  containerStyle={{marginVertical: 0, paddingVertical: 0}}>
                  <RNPoll
                    totalVotes={item?.data?.totalVotes}
                    choices={item?.data?.choices}
                    hasBeenVoted={voted}
                    pollContainerStyle={{width: wp(75)}}
                    onChoicePress={() => {}}
                  />
                </ListItem>
              </View>
            ) : null}
          </ScrollView>
          </>
        </Overlay>
        
        <Divider />
        
       
      </Card>
    );
  }
}
const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgImage: {
    height: hp(100),
    resizeMode: 'contain',
    width: '100%',
    alignItems: 'center',
    //  opacity:.3
  },
  description: {
    margin: 10,
    fontSize: 12,
  },
  iconRight: {marginRight: 20},
  accountText: {fontSize: 18, fontWeight: 'bold'},
  accountsCategory: {margin: 10},
  categoryContainer: {
    borderBottomColor: 'silver',
    borderBottomWidth: 2,
    width: wp(85),
    marginTop: hp(5),
  },
  listCont: {
    backgroundColor: 'transparent',
    width: wp(89),
    padding: 4,
    margin: 0,
  },
  inputCont: {
    borderColor: 'silver',
    borderWidth: 1,
    borderRadius: wp(1),
    paddingLeft: wp(1),
    maxHeight: hp(20),
    minHeight: hp(12),
  },
  errorStyle: {height: 0},
  buttons: {
    backgroundColor: '#1b224d',
    width: wp(30),
    height: 40,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  buttonText: {color: '#fff', fontWeight: 'bold'},
  cardFooter: {
    height: hp(5),
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  cardFooterInner: {flexDirection: 'row', alignItems: 'center'},
  cardFooterInnerText: {fontSize: 12, color: '#17234e', marginLeft: 5},
  shareContainer: {
    width: wp(95),
    minHeight: hp(65),
    backgroundColor: '#fff',
    borderRadius: wp(3),
    paddingTop: hp(3),
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
  link: {
    fontSize: 16,
    fontWeight: '400',
    backgroundColor: 'rgba(36, 77, 201, 0.05)',
    color: '#244dc9',
  },
  modalButton: {
    height: 40, width: '100%',
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15
  },
  modalText: {
    fontSize: 14,
    fontWeight: '500'
  }
});

const mapStateToProps = (state) => {
  const {
    user: {userProfile},
  } = state;
  return {
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email,
    adult: userProfile.adult,
    country: userProfile.country,
    bio: userProfile.bio,
    userName: userProfile.userName,
    displayName: userProfile.displayName,
    profileUrl: userProfile.profileUrl || null,
    location: userProfile.location,
    cover: userProfile.coverUrl,
    birthdate: userProfile.birthdate,
    occupation: userProfile.occupation,
    userId: userProfile.userId,
  };
};

export default connect(mapStateToProps, null)(EventPostCard);

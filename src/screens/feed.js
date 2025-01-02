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
  Platform,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {connect} from 'react-redux';
import PostCard from '../components/postCard';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {getFirends, getFollowing} from '../backend/apis';

import {GiftedChat} from 'react-native-gifted-chat';
import {Overlay, Header, Icon} from 'react-native-elements';
import {getLivePartOfList, getPartOfList} from '../backend/paginatedList';
import EmptyListText from '../components/emptyListText';
import {mScale, scale, vScale} from '../configs/size';
import EmptyListLoader from '../components/emptyListLoader';
 import { AdView } from '../ads/AdView';

const EmptyListComponenet = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      height: vScale(490),
    }}>
    <Text
      style={{
        fontSize: mScale(26),
        fontWeight: 'bold',
        lineHeight: vScale(28),
      }}>
      Welcome to Citizens!
    </Text>
    <Text
      style={{
        fontSize: mScale(14),
        color: '#d9d9d9',
        fontWeight: 'bold',
        marginTop: vScale(8),
        width: scale(260),
      }}>
      This is the best spot to keep up with what's going on in the world. Now is
      the time to find some people and things to follow.
    </Text>
  </View>
);

class Feed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      feeds: [],
      showComments: false,
      postReference: null,
      messages: [],
      userFirends: [],
      feedLoader: false,
      loadingFeed: false,
      postContent: {},
      notCall: false,
      feedsLength: 0,
      postsFetched: [],
      lastDoc: null,
      loader: true,
      err: false,
      blockedUsers: [],
      /*onBlock= {() => blockPost(item.id)}, */
    };
  }

  postRef = database().ref('/posts');

  getPosts = async () => {

    const {uid} = auth().currentUser;
    console.log('userId',uid)
    var  firstBatch = this.formatFollowingArray().slice(0, 9);
    let mutedUser = [];
    let users = await firestore().collection("Users").doc(uid).get()
    let userData = users.data();
    let blockedUsers = userData.blockedUserByMe || []
    const muteRef = await firestore().collection("Users").doc(uid).collection("Mutes").get();
     muteRef.forEach(doc => {
      mutedUser.push(doc.id);
      firstBatch = firstBatch.filter(function(item) {
          return item !== doc.id
      })
    });
    

    this.unsub = firestore()
      .collection('Posts')
      .where('user', 'in', [uid, ...firstBatch])
      .where('isHidden', '==', false)
      .orderBy('date', 'desc')
      .limit(50)
      .onSnapshot(
        (snap) => {
          let lastDoc = null;
          if (snap.docs.length == 20) {
            lastDoc = snap.docs[snap.docs.length - 1];
          }

          const tempArr = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const isBlockedByUser = (item, uid) => {
            return item.blockedByUsers?.some(blockedUser => blockedUser.userId === uid);
          };
          const unmutedData = tempArr.filter((item) => {
            // Check if item is muted or blocked
            if (item.isShared && item.adminData && mutedUser.includes(item.adminData.id)) {
              return false; // Skip muted items
            } else if (isBlockedByUser(item, uid) || blockedUsers.includes(item.user)) {
              return false; // Skip blocked items
            }
            return true; // Include unmuted and unblocked items
          });
          this.setState({
            postsFetched: unmutedData,
            lastDoc: lastDoc,
            loader: false,
            err: false,
          });
        },
        (err) => {
          this.setState({
            loader: true,
            err: true,
          });
          console.log('error while getting posts', err);
         // alert('Something went wrong! Please try again later.');
        },
      );
  };
   addFieldsToExistingPosts = async () => {
    try {
      const snapshot = await firestore().collection('Users').get();
      const batch = firestore().batch(); // Create a batch for bulk updates
  
      snapshot.docs.forEach(doc => {
        const postRef = firestore().collection('Users').doc(doc.id);
        batch.update(postRef, {
          blockedUserByMe: [] 
        });
      });
  
      await batch.commit(); // Commit all updates in a single transaction
      console.log('All posts updated successfully!');
    } catch (error) {
      console.error('Error updating posts:', error);
    }
  };
  formatFollowingArray = () => {
    if (!this.props.followings) {
      return [];
    } else {
      return this.props.followings.reduce((acc, following) => {
        acc = [
          ...acc,
          ...following.users.filter(
            (userId) => userId !== auth().currentUser?.uid,
          ),
        ];

        return acc;
      }, []);
    }
  };

  componentWillReceiveProps(nextProps) {
    this.onRefresh()
   }

  componentDidMount() {
    this.getPosts();
    //this.addFieldsToExistingPosts()
  }
  componentDidUpdate(prevProps) {
    if (this.props.followings !== prevProps.followings) {
      this.unsubscribe();
      this.getPosts();
    }
  }
  componentWillUnmount() {
    this.unsubscribe();
  }

  unsubscribe() {
    if (typeof this.unsub === 'function') {
      this.unsub();
    }
  }

  onEndReached = () => {};

  onRefresh = () => {
    this.unsubscribe();
    this.getPosts();
  };

  render() {
    const {feeds} = this.state;

    return (
      <View style={style.container}>
        <StatusBar translucent backgroundColor="transparent" />
        {this.state.loader ? (
          <EmptyListLoader style={{height: vScale(490)}} size={'large'} />
        ) : this.state.err ? (
          <EmptyListText
            title="Server Not reachable! Try again later."
            style={{height: vScale(490)}}
            titleStyle={{fontSize: mScale(16), color: '#777747'}}
          />
        ) : (
          <FlatList
            data={this.state.postsFetched}
            // data={[]}
            style={{backgroundColor: '#d9d9d9'}}
            renderItem={({item, index}) => {
              return (
                <>
                 {index % 5 == 0 ?
                 <View style={{}}>
                <AdView type="video" media={true}  />
                </View>
                :
                null
              }
                <PostCard
                carousel={true}
                  onRefresh={this.onRefresh}
                  data={item}
                  index={index}
                  openComment={this.toggoleComments}
                  navigation={this.props.navigation}
                  focused={this.props?.focused}
                  reportPost={true}
                />
               
                </>
              );
            }}
            keyExtractor={(item) => item.id}
            onRefresh={() => this.onRefresh()}
            refreshing={this.state.loadingFeed}
            ref={(ref) => {
              this.props.scrollRefOfPost(ref);
            }}
            ListEmptyComponent={<EmptyListComponenet />}
           
          />
        )
        }
      </View>
    );
  }
}
const style = StyleSheet.create({
  container: {
    flex: 1, // alignItems: 'center', justifyContent: 'center'
    backgroundColor: '#fff',
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
    elevation: 0,
    borderRadius: 20,
    padding: 0,
  },
  contStyle: {margin: 0, padding: 0, marginLeft: 10},
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
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
  },
  cardFooterInner: {flexDirection: 'row', alignItems: 'center'},
  cardFooterInnerText: {fontSize: 12, margin: 5},
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});

const mapStateToProps = (state) => {
  const {
    user: {userProfile, userFollowings},
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
    displayName: userProfile.displayName,
    imageUrl: userProfile.imageUrl,
    location: userProfile.location,
    cover: userProfile.cover,
    birthdate: userProfile.birthdate,
    occupation: userProfile.occupation,
    userId: auth().currentUser?.uid,
    showComments: root.showComments,
    feeds: state.feeds,
    followings: userFollowings,
  };
};
const mapDispachToProps = (Dispatch) => {
  return {
    closeCommentsConatiner: () => Dispatch({type: 'closeCommentsConatiner'}),
    openCommentsConatiner: () => {
      Dispatch({type: 'openCommentsConatiner'});
    },
    scrollRefOfPost: (ref) => Dispatch({type: 'scrollRefOfPost', ref}),
    addFeeds: (feeds) => Dispatch({type: 'addFeeds', feeds: feeds}),
  };
};
export default connect(mapStateToProps, mapDispachToProps)(Feed);

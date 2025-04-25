import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Keyboard,
  ActivityIndicator,
} from 'react-native';

import Video from 'react-native-video';

import {Icon, Overlay} from 'react-native-elements';
import {mScale, scale, vScale} from '../../configs/size';
import RoundImage from '../roundImage';
import ClipComments from './comments';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ShareClip from './share';
import ClipMenu from './moreOptions';
import {useFocusEffect} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useSelector} from 'react-redux';
import errorLog from '../../Constants/errorLog';
import {checkFollowStatus, follow, unfollow} from '../../backend/friends';
import { DEVICE_HEIGHT, DEVICE_WIDTH } from '../appModal/AppModalView';

const Clip = (props) => {
  const [clip, setClip] = useState(props.clip);
  const [isLiked, setIsLiked] = useState(false);
  const [videoUri, setVideoUri] = useState('');
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [kboardHeight, setKboardheight] = useState(0);
  const [androidKboardHeight, setAndroidKboardheight] = useState(0);
  const [shareVisible, setShareVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showFollow, setShowFollow] = useState(false);
  const [followDoc, setFollowDoc] = useState();
  const [followDocData, setFollowDocData] = useState();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoader, setFollowLoader] = useState(false);
   const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(props.paused);

  const {bottom, top} = useSafeAreaInsets();

  const user = useSelector((state) => state.user.userProfile);

  // useFocusEffect(
  //   useCallback(() => {
  //      setPaused(props.paused);
  //     return () => {
  //       setPaused(true);
  //     };
  //   }, []),
  // );

  useEffect(() => {
    getIsLiked();
  }, [clip.videoUri]);

  useEffect(() => {
    setPaused(props.paused);
  }, [props.paused]);

  useEffect(() => {
    checkFollowStatus();
  }, [clip, user]);

  const checkFollowStatus = useCallback(async () => {
    const userid1 = user?.userId;
    const userid2 = clip?.userId;

    if (!userid1 || !userid2) {
      setShowFollow(false);
      return;
    }
    // this.setState({followLoader: true});
    try {
      const snap = await firestore()
        .collection('Follows')
        .where('identifiers', 'array-contains-any', [
          `${userid1}_${userid2}`,
          `${userid2}_${userid1}`,
        ])
        .get();
      if (snap.empty) {
        setIsFollowing(false);
        setShowFollow(true);
      } else if (snap.docs.length == 1) {
        if (snap.docs[0].data().isFollowingOtherUser[`${userid1}`] == true) {
          setIsFollowing(true);
          setShowFollow(true);
          setFollowDoc(snap.docs[0].ref);
          setFollowDocData(snap.docs[0].data());
        } else {
          setIsFollowing(false);
          setShowFollow(true);
          setFollowDoc(snap.docs[0].ref);
          setFollowDocData(snap.docs[0].data());
        }
      }
    } catch (error) {
      console.log('error while clip follow status', error);
      setShowFollow(false);
    }
  }, [clip, user]);

  const onSendFollowRequest = async () => {
    const userid1 = user?.userId;
    const userid2 = clip?.userId;
    try {
      const payload = {
        identifiers: [`${userid1}_${userid2}`, `${userid2}_${userid1}`],
        users: [userid1, userid2],
        userData: [
          {
            userId: userid1,
            profileUrl: user.profileUrl || null,
            displayName: user.displayName,
          },
          {
            userId: userid2,
            profileUrl: clip.userImage,
            displayName: clip.userName,
          },
        ],
        isFollowedByOtherUser: {
          ...followDocData?.isFollowedByOtherUser,
          [userid2]: true,
        },
        isFollowingOtherUser: {
          ...followDocData?.isFollowedByOtherUser,
          [userid1]: true,
        },
      };
      console.log('payload', payload);

      setFollowLoader(true);
      const result = await follow({
        payload,
        currentUserId: userid2,
        otherUserId: userid1,
      });
      // console.log('follow result', result);
      setIsFollowing(true);
      setFollowLoader(false);
    } catch (error) {
      console.log('error while follow', error);
      setFollowLoader(false);
    }
  };

  const unFollow = async () => {
    console.log('2');
    const userid1 = user.userId;
    const userid2 = clip?.userId;
    try {
      const payload = {
        currentUserId: userid2,
        otherUserId: userid1,
        isFollowedByOtherUser: {
          ...followDocData?.isFollowedByOtherUser,
          [userid2]: false,
        },
        isFollowingOtherUser: {
          ...followDocData?.isFollowingOtherUser,
          [userid1]: false,
        },
      };
      setFollowLoader(true);
      await unfollow({ref: followDoc, payload});
      setIsFollowing(false);
      setFollowLoader(false);
    } catch (error) {
      console.log('error', error);
      setFollowLoader(false);
    }
  };

  const getIsLiked = async () => {
    const likeRef = firestore()
      .collection('Clips')
      .doc(clip.id)
      .collection('Likes')
      .doc(user.userId);
    try {
      const snap = await likeRef.get();
      if (snap.exists) {
        setIsLiked(true);
      } else {
        setIsLiked(false);
      }
    } catch (error) {
      errorLog('getting clip liked status', error);
    }
  };

  const likeUnlikeClip = async () => {
    try {
      setClip({
        ...clip,
        totalLikes: isLiked
          ? (clip?.totalLikes || 0) - 1
          : (clip?.totalLikes || 0) + 1,
      });
      setIsLiked(!isLiked);
      await firestore().runTransaction(async (transaction) => {
        const clipRef = firestore().collection('Clips').doc(clip.id);
        const likeRef = clipRef.collection('Likes').doc(user.userId);
        const snap = await transaction.get(likeRef);
        if (snap.exists) {
          transaction.update(clipRef, {
            activityCount: firestore.FieldValue.increment(-1),
            totalLikes: firestore.FieldValue.increment(-1),
          });
          transaction.delete(likeRef);
        } else {
          transaction.update(clipRef, {
            activityCount: firestore.FieldValue.increment(1),
            totalLikes: firestore.FieldValue.increment(1),
          });
          transaction.set(likeRef, {
            displayName: user.displayName,
            profileUrl: user.profileUrl,
          });
        }
      });
    } catch (error) {
      errorLog('liking clip', error);
      setClip({
        ...clip,
        totalLikes: isLiked ? clip.totalLikes - 1 : clip.totalLikes + 1,
      });
      setIsLiked(!isLiked);
    }
  };

  const incrementCommentCount = async () => {
    setClip({...clip, totalComments: (clip.totalComments || 0) + 1});
  };

  useEffect(() => {
    const showAndroidSubscription = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setAndroidKboardheight(event.endCoordinates.height);
      },
    );
    const hideAndroidSubscription = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setAndroidKboardheight(0);
      },
    );
    const showSubscription = Keyboard.addListener(
      'keyboardWillShow',
      (event) => {
        setKboardheight(event.endCoordinates.height);
      },
    );
    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      setKboardheight(0);
    });

    Keyboard.scheduleLayoutAnimation((event) => {
      console.log('event', event);
    });
    // const showSubscription = Keyboard.addListener(
    //   'keyboardWillShow',
    //   (event) => {
    //     setKboardheight(event.endCoordinates.height);
    //   },
    // );
    // const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
    //   setKboardheight(0);
    // });

    return () => {
      showSubscription.remove();
      showAndroidSubscription.remove();
      hideSubscription.remove();
      hideAndroidSubscription.remove();
    };
  }, []);

  const onPlayPausePress = () => {
    setPaused(!paused);
  };

  const closeCommentsModal = () => {
    setCommentsVisible(false);
  };

  const closeShareModal = () => {
    setShareVisible(false);
  };

  const closeMenuModal = () => {
    setMenuVisible(false);
  };

  const followUnfollowUser = () => {
    console.log(1);
    if (isFollowing) {
      unFollow();
    } else {
      onSendFollowRequest();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          height: Dimensions.get('window').height - props.bottomHeight,
          paddingBottom: props?.hideCameraIcon ? vScale(25) : 0,
        },
      ]}>
      <TouchableWithoutFeedback onPress={onPlayPausePress}>
        <View>
          <Video
            source={{uri: clip.videoUri}}
            style={styles.video}
            onError={(e) => console.log(e)}
            resizeMode={'cover'}
            onLoad={() => {
              setTimeout(() => {
              setLoading(false)
            }, 5000);}} 
            repeat={true}
            paused={props?.paused || paused}
            poster={clip?.thumbnailUri || ''}
          />

          <View
            style={[
              styles.uiContainer,
              props?.paddingBottom && {paddingBottom: vScale(30)},
            ]}>
            <View style={styles.rightContainer}>
              {props?.hideCameraIcon ? (
                <View style={{height: vScale(30)}} />
              ) : (
                <TouchableOpacity
                  style={styles.iconContainer}
                  onPress={props.navigate}>
                  <Icon
                    name={'camera-outline'}
                    type={'ionicon'}
                    size={vScale(30)}
                    color={'white'}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={likeUnlikeClip}>
                <Icon
                  name={isLiked ? 'heart' : 'heart-outline'}
                  type={'ionicon'}
                  size={vScale(25)}
                  color={isLiked ? 'red' : 'white'}
                />
                <Text style={styles.statsLabel}>{clip?.totalLikes || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => {
                  setCommentsVisible(true);
                }}>
                <Icon
                  name={'chatbubble-outline'}
                  type={'ionicon'}
                  size={vScale(20)}
                  color="white"
                />
                <Text style={styles.statsLabel}>
                  {clip?.totalComments || 0}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomContainer}>
              <View style={[styles.userRow, {marginBottom: vScale(10)}]}>
                <View style={styles.userRow}>
                  <TouchableOpacity
                    style={{flexDirection: 'row', alignItems: 'center'}}
                    onPress={() => {
                      clip.userId == user.userId
                        ? props.navigatee('profile')
                        : props.navigatee('otherProfile', {
                            userId: clip.userId,
                          });
                    }}>
                    <RoundImage
                      userId={clip.userId}
                      imageUrl={clip.userImage}
                      displayName={clip.userName}
                    />
                    <Text style={styles.handle} numberOfLines={1}>
                      {clip.userName}
                    </Text>
                  </TouchableOpacity>
                  {showFollow && !props?.hideCameraIcon ? (
                    <TouchableOpacity style={styles.follow}>
                      {followLoader ? (
                        <ActivityIndicator size={'small'} color={'white'} />
                      ) : (
                        <Text
                          style={styles.followText}
                          onPress={followUnfollowUser}>
                          {isFollowing ? 'Following' : 'Follow'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ) : null}
                </View>
                <Icon
                  name={'ellipsis-vertical'}
                  type={'ionicon'}
                  size={mScale(18)}
                  color={'#ffffff'}
                  onPress={() => {
                    setMenuVisible(true);
                  }}
                />
              </View>
              {clip.caption ? (
                <Text style={styles.description}>{clip.caption}</Text>
              ) : null}

              {clip.songName ? (
                <View style={styles.songRow}>
                  <Icon
                    name={'beamed-note'}
                    type={'entypo'}
                    size={24}
                    color="white"
                  />
                  <Text style={styles.songName}>{clip.songName}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <Overlay
        overlayStyle={[
          styles.commentsOverlay,
          kboardHeight && {
            bottom: kboardHeight,
          },
          androidKboardHeight && {
            height: Dimensions.get('window').height - androidKboardHeight - top,
          },
        ]}
        isVisible={commentsVisible}
        onBackdropPress={closeCommentsModal}
        animationType="slide">
        <ClipComments
          clipId={clip.id}
          closeCommentsModal={closeCommentsModal}
          bottom={bottom}
          incrementCommentCount={incrementCommentCount}
        />
      </Overlay>
      <Overlay
        overlayStyle={[
          styles.shareOverlay,
          kboardHeight && {
            bottom: kboardHeight,
          },
        ]}
        isVisible={shareVisible}
        onBackdropPress={closeShareModal}
        animationType="slide">
        <ShareClip
          clipId={clip.id}
          closeShareModal={closeShareModal}
          bottom={bottom}
        />
      </Overlay>
      <Overlay
        overlayStyle={[
          styles.menuOverlay,
          kboardHeight && {
            bottom: kboardHeight,
          },
        ]}
        isVisible={menuVisible}
        onBackdropPress={closeMenuModal}
        animationType="slide">
        <ClipMenu
          clipId={clip.id}
          closeMenuModal={closeMenuModal}
          bottom={bottom}
          isMyClip={props.isMyClip}
          removeClipFromList={props.removeClipFromList}
          videoUri={clip.videoUri}
          reportClip={props?.reportClip || null}
        />
      </Overlay>
      {
        loading ? 
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: DEVICE_HEIGHT,
          width: DEVICE_WIDTH,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
        <ActivityIndicator
        size={'large'}
        color={'red'}
        />
        </View>
        :
        null
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: Dimensions.get('screen').height,
  },
  videPlayButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 100,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'black',
  },
  uiContainer: {
    height: '100%',
    justifyContent: 'flex-end',
  },
  bottomContainer: {
    paddingHorizontal: scale(10),
    paddingVertical: vScale(10),
    justifyContent: 'space-between',
  },
  handle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: scale(7),
    marginRight: scale(10),
    maxWidth: scale(150),
  },
  description: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '300',
    marginBottom: 10,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songName: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },

  songImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: '#4c4c4c',
  },

  //  right container
  rightContainer: {
    alignSelf: 'flex-end',
    height: vScale(180),
    justifyContent: 'space-between',
    marginRight: vScale(5),
    marginBottom: vScale(10),
  },
  profilePicture: {
    width: scale(50),
    height: scale(50),
    borderRadius: 25,
  },

  iconContainer: {
    alignItems: 'center',
  },
  statsLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  follow: {
    borderWidth: mScale(1),
    borderColor: '#ffffff',
    paddingHorizontal: scale(5),
    paddingVertical: vScale(2),
    borderRadius: mScale(5),
  },
  followText: {
    color: '#ffffff',
    fontSize: mScale(15),
  },
  commentsOverlay: {
    height: '80%',
    width: DEVICE_WIDTH,
    bottom: 0,
    position: 'absolute',
    paddingHorizontal: scale(15),
    paddingTop: vScale(15),
    borderTopRightRadius: mScale(15),
    borderTopLeftRadius: mScale(15),
  },
  shareOverlay: {
    minHeight: vScale(100),
    width: scale(375),
    bottom: 0,
    position: 'absolute',
    paddingHorizontal: scale(15),
    paddingTop: vScale(15),
    borderTopRightRadius: mScale(15),
    borderTopLeftRadius: mScale(15),
  },
  menuOverlay: {
    minHeight: vScale(80),
    width: scale(375),
    bottom: 0,
    position: 'absolute',
    paddingHorizontal: scale(15),
    paddingTop: vScale(15),
    borderTopRightRadius: mScale(15),
    borderTopLeftRadius: mScale(15),
  },
});

export default Clip;

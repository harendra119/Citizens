import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import moment from 'moment';
import { Icon } from 'react-native-elements';
import { useSelector } from 'react-redux';
import errorLog, { defaultAlert } from '../Constants/errorLog';
import { getPartOfList } from '../backend/paginatedList';
import Header from '../components/header';
import PostCard from '../components/postCard';
import { mScale, scale, vScale } from '../configs/size';
import { renderInitials } from './activism/ActivismDetails';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { Item } from 'react-native-paper/lib/typescript/components/Drawer/Drawer';
import Utility, { DEVICE_WIDTH } from '../utils/Utility';
import AppModalView from '../components/appModal/AppModalView';
import UserInfoService from '../utils/UserInfoService';
import { firebaseDbObject } from '../utils/FirebseDbObject';

const SinglePost = ({ navigation, route }) => {
  console.log('mohit', route.params?.postData);

  // return false;
  const id = route.params?.postData?.data?.id;
  const [comments, setComments] = useState<any[]>([]);
  const [commensq, setCommensq] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState();
  const [input, setInput] = useState('');
  const [kHeight, setkHeight] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editableComment, setEditableComment] = useState<any>(null);


  const userProfile = useSelector((state) => state.user.userProfile);

  useEffect(() => {



  });


  const postViewsUpdate = async () => {
    const postId = route.params?.postData?.data?.id;
    const userId = route.params?.userId;
    const ref = firestore().collection('Posts').doc(postId);
    const viewRef = ref.collection('Views').doc(userId);
    viewRef.get().then((snap) => {
      if (!snap.exists) {
        const bodyviews = {
          id: userId,
        };
        const batch = firestore().batch();
        batch.set(viewRef, bodyviews);
        batch.update(ref, { viewsCount: firestore.FieldValue.increment(1) });
        batch.commit();
      }
    });
  }

  useEffect(() => {

    const showSubscription = Keyboard.addListener(
      'keyboardWillShow',
      (event) => {
        const keyboardHeight = event.endCoordinates.height;
        setkHeight(keyboardHeight);
      },
    );

    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      setkHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const getComments = async () => {
    postViewsUpdate();

    try {
      const commentsRef = firestore()
        .collection('Posts')
        .doc(id)
        .collection('Comments')
        .limit(40)
        .orderBy('createdAt', 'desc');

      const allCommentsSnapshot = await commentsRef.get();

      const blockedCommentsRef = firestore().collection('Users').doc(UserInfoService.getUserId()).collection('BlockedComments');
      const blockedCommentsSnapshot = await blockedCommentsRef.get();

      // Create a set of blocked comment IDs
      const blockedCommentIds = new Set(
        blockedCommentsSnapshot.docs.map((doc) => doc.id)
      );

      // Step 3: Filter out blocked comments
      const visibleComments = allCommentsSnapshot.docs.filter((doc) => {
        return !blockedCommentIds.has(doc.id); // Exclude blocked comments
      });


      // const result = await getPartOfList({ ref, limitNum: 40 });
      setComments(visibleComments.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        docId: doc.id
      })));
      // setLastDoc(result.lastDoc);
    } catch (error) {
      defaultAlert();
      errorLog('while getting top trending posts', error);
    }
  };

  const getMoreComments = async () => {
    if (!lastDoc) {
      return;
    }
    try {
      const ref = firestore()
        .collection('Posts')
        .doc(id)
        .collection('Comments')
        .limit(15)
        .after(lastDoc);
      const result = await getPartOfList({ ref, limitNum: 15 });

      setComments([...comments, ...result.list]);
      setLastDoc(result.lastDoc);
    } catch (error) {
      defaultAlert();
      errorLog('while getting top trending posts', error);
    }
  };

  useEffect(() => {
    getComments();
  }, [commensq]);

  const blockComment = (item) => {
    Utility.showMessageWithActionCancel(async () => {
      try {
        // Add to user's blocked comments
        const blockedCommentRef = firebaseDbObject
          .collection('Users')
          .doc(UserInfoService.getUserId())
          .collection('BlockedComments')
          .doc(item.docId);

        await blockedCommentRef.set({ postId: id });
        // Increment blocked count on the comment document
        const commentRef = firebaseDbObject
          .collection('Posts')
          .doc(id)
          .collection('Comments')
          .doc(item.docId);

        await commentRef.update({
          blockedCount: firestore.FieldValue.increment(1),
        });
        getComments();
        console.log('Comment blocked successfully.');
      } catch (error) {
        Alert.alert('Error', 'Failed to block the comment. Please try again later.');
      }

    }, () => { }, 'Are you sure you want to block this comment', 'Block comment')
  }

  const deleteComment = (item) => {
    Utility.showMessageWithActionCancel(() => {
      try {
        firestore()
          .collection('Posts')
          .doc(id)
          .collection('Comments')
          .doc(item.docId)
          .delete().then(() => {
            getComments();
          });

        firestore()
          .collection('Posts')
          .doc(id).update({
            totalComments: firestore.FieldValue.increment(-1)
          })
      } catch (error) {
        Alert.alert('Error', 'Failed to delete the comment. Please try again later.');
      }

    }, () => { }, 'Are you sure you want to delete this comment', 'Delete comment')
  }

  const editComment = () => {
    try {
      firestore()
        .collection('Posts')
        .doc(id)
        .collection('Comments')
        .doc(editableComment.docId)
        .update({
          content: editableComment.content,
          lastEdited: firestore.Timestamp.now()
        }).then(() => {
          setEditableComment(null);
          getComments();
        })

    } catch (error) {
      Alert.alert('Error', 'Failed to edit the post. Please try again later.');
    }
  }

  const publishComment = async () => {
    if (!input || input == '') {
      return;
    }
    try {
      const batch = firestore().batch();
      const postRef = firestore().collection('Posts').doc(id);
      const commentsRef = postRef.collection('Comments').doc();

      const body = {
        content: input,
        id: userProfile.userId,
        profileUrl: userProfile.profileUrl || null,
        displayName: userProfile.displayName,
        createdAt: firestore.Timestamp.now(),
        blockedCount: 0
      };

      setInput('');
      setCommensq((prev) => [...prev, body]);
      console.log('++++' + comments.length)
      batch.update(postRef, {
        activityCount: firestore.FieldValue.increment(1),
        totalComments: firestore.FieldValue.increment(1),
      });
      batch.set(commentsRef, body);
      await batch.commit();


      setTimeout(async () => {
        if (route.params?.postData?.data?.user != userProfile.userId) {
          const refNoti = firestore().collection('Users').doc(route.params?.postData?.data?.user);
          const notificationRef = refNoti.collection('Notification').doc();
          const batchInner = firestore().batch();
          batchInner.set(notificationRef, {
            id: notificationRef.id,
            type: 'COMMENT_POST',
            displayName: userProfile.displayName,
            profileUrl: userProfile.profileUrl || null,
            senderId: userProfile.userId,
            text: userProfile.displayName + ' commented on your post.',
            postId: id,
            date: new Date()
          });
          await batchInner.commit();
        }

      }, 500);
      route.params?.commentCountIncrement &&
        route.params?.commentCountIncrement();

    } catch (error) {
      defaultAlert();
      errorLog('commenting', error);
    }
  };

  const renderComment = ({ item, index }) => {
    console.log(item)
    const data = route.params?.postData
    const a = new firestore.Timestamp(
      item.createdAt.seconds,
      item.createdAt.nanoseconds,
    );
    return (
      <>
        <View
          style={{
            margin: 10,
            marginTop: index == 0 ? 20 : null,
            width: DEVICE_WIDTH - 20,
            // alignItems: 'center',
            alignSelf: item.id == userProfile.userId ? 'flex-start' : 'flex-start',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.0,
          }}>

          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: mScale(10),
              padding: mScale(10),
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: vScale(10),
              }}>
              {item?.profileUrl ? (
                <Image
                  source={{ uri: item?.profileUrl }}
                  style={{
                    height: scale(25),
                    width: scale(25),
                    borderRadius: scale(25),
                    marginRight: scale(7),
                  }}
                />
              ) : (
                <View
                  style={{
                    height: scale(25),
                    width: scale(25),
                    borderRadius: scale(25),
                    marginRight: scale(7),
                    backgroundColor: '#d9d9d9',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text style={{ fontSize: 12 }}>
                    {renderInitials(item.displayName)}
                  </Text>
                </View>
              )}
              <Text style={{ fontWeight: 'bold', flex: 1, marginRight: 30 }} numberOfLines={1}>
                {item?.displayName}
              </Text>


              <TouchableOpacity
                onPress={() => {
                  setShowModal(true)
                }}
                style={{ padding: 10 }}
              >
                <Icon
                  name="dots-three-horizontal"
                  type="entypo"
                  size={14}
                  style={style.iconRight}
                  color="#8c8c8c"
                />
              </TouchableOpacity>

            </View>
            <View style={{ marginLeft: scale(10) }}>
              <Text>{item?.content}</Text>
            </View>
          </View>
          <Text
            style={{
              marginLeft: scale(8),
              marginTop: vScale(3),
              fontSize: mScale(10),
            }}>
            {moment(item.createdAt.toDate()).fromNow()}
          </Text>
        </View>
        <AppModalView
          visible={showModal}>
          <View style={{ paddingHorizontal: 30, paddingRight: 20, paddingTop: 15, paddingBottom: 40, backgroundColor: '#fff' }}>
            {
              item.id == UserInfoService.getUserId() ?
                <>
                  <TouchableOpacity
                    onPress={async () => {
                      setShowModal(false);
                      setTimeout(() => {
                        setEditableComment(item);
                      }, 100);

                    }}
                    style={style.modalButton}>
                    <Text
                      style={style.modalText}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={async () => {
                      setShowModal(false);
                      deleteComment(item)
                    }}
                    style={style.modalButton}>
                    <Text
                      style={style.modalText}>
                      Delete
                    </Text>
                  </TouchableOpacity>

                </>
                : <TouchableOpacity
                  onPress={async () => {
                    setShowModal(false);
                    blockComment(item)
                  }}
                  style={style.modalButton}>
                  <Text
                    style={style.modalText}>
                    Block
                  </Text>
                </TouchableOpacity>
            }
            <TouchableOpacity
              onPress={() => { setShowModal(false); }}
              style={style.modalButton}>
              <Text
                style={style.modalText}>
                Cancel
              </Text>
            </TouchableOpacity>

          </View>
        </AppModalView>
      </>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Header navigation={navigation} otherProfile={true} />
      <View style={{ height: vScale(540) }}>
        <FlatList
          ListHeaderComponent={
            <PostCard
              {...route.params.postData}
              hideCommentBtn={true}
              carousel={true}
              navigation={navigation}
              isAdmin={route.params.isAdmin}
              goBack={() => navigation.goBack()}
            />
          }
          extraData={comments}
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item}
          onEndReached={getMoreComments}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          borderColor: '#1e2348',
          borderWidth: 1,
          borderRadius: mScale(15),
          position: 'absolute',
          bottom: Platform.OS == 'ios' ? vScale(15) + kHeight : vScale(15),
          marginTop: vScale(130),
          paddingHorizontal: scale(10),
          backgroundColor: '#ffffff',
          height: vScale(40),
        }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Your thoughts ..."
          style={{ width: scale(300) }}
        />
        <TouchableOpacity
          style={{
            height: scale(30),
            width: scale(30),
            borderRadius: scale(15),
            backgroundColor: 'green',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={publishComment}>
          <Icon
            name="caret-forward"
            type="ionicon"
            size={vScale(22)}
            color="white"
          />
        </TouchableOpacity>
      </View>
      {
        editableComment ?
          <AppModalView
            visible={true}
            customStyle={{ opacity: 0.9 }}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(0, 0, 0, 0.9)' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'center',
                  borderColor: '#1e2348',
                  borderWidth: 1,
                  borderRadius: mScale(15),
                  paddingHorizontal: scale(10),
                  backgroundColor: '#ffffff',
                  height: vScale(40),
                }}>
                <TextInput
                  value={editableComment.content}
                  onChangeText={(value) => setEditableComment({ ...editableComment, content: value })}
                  placeholder="Your thoughts ..."
                  style={{ width: scale(300) }}
                />
                <TouchableOpacity
                  style={{
                    height: scale(30),
                    width: scale(30),
                    borderRadius: scale(15),
                    backgroundColor: 'green',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={editComment}>
                  <Icon
                    name="caret-forward"
                    type="ionicon"
                    size={vScale(22)}
                    color="white"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setEditableComment(null);
                }}
                style={{ borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginTop: 20, paddingHorizontal: 40, paddingVertical: 15 }}>
                <Text style={{ fontWeight: '700', color: '#000' }}>
                  Cancel
                </Text>
              </TouchableOpacity>

            </View>
          </AppModalView>
          :
          null
      }

    </View>
  );
};

export default SinglePost;


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
  iconRight: { marginRight: 20 },
  accountText: { fontSize: 18, fontWeight: 'bold' },
  accountsCategory: { margin: 10 },
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
    borderColor: '#eee',
    borderWidth: 1,
    padding: hp(1),
    borderRadius: 10,
    maxHeight: hp(18),
    minHeight: hp(12),
    marginTop: 10
  },
  errorStyle: { height: 0 },
  buttons: {
    backgroundColor: '#1b224d',
    width: wp(30),
    height: 40,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  cardFooter: {
    height: hp(5),
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  cardFooterInner: { flexDirection: 'row', alignItems: 'center' },
  cardFooterInnerText: { fontSize: 12, color: '#17234e', marginLeft: 5 },
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
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15
  },
  modalText: {
    fontSize: 14,
    fontWeight: '500'
  }
});

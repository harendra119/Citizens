import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {mScale, scale, vScale} from '../../configs/size';
import EmptyListLoader from '../emptyListLoader';
import EmptyListText from '../emptyListText';
import RoundImage from '../roundImage';
import firestore from '@react-native-firebase/firestore';
import errorLog, {defaultAlert} from '../../Constants/errorLog';
import {useSelector} from 'react-redux';
import { Keyboard } from 'react-native';
import UserInfoService from '../../utils/UserInfoService';
import Utility from '../../utils/Utility';
import AppModalView, { DEVICE_WIDTH } from '../appModal/AppModalView';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { addClipReply } from '../commentsReplies/Reply';
import AppLoader from '../AppLoader';

const ClipComments = ({clipId, bottom, incrementCommentCount, navigation}) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [input, setInput] = useState();
    const [lastDoc, setLastDoc] = useState();

  const [showModal, setShowModal] = useState(false);
  const [editableComment, setEditableComment] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState(null);  // Track which comment/reply is being replied to
  const [replyText, setReplyText] = useState("");  // Store reply text
  const [replyingToMap, setReplyingToMap] = useState({});
  const [replyTextMap, setReplyTextMap] = useState({});
  const [editableReply, setEditableReply] = useState(null);
  const [loader, setLoader] = useState(true);
  const [replyAndParentId, setReplyAndparentId] = useState(null);
  const [commnetItem, setCommnetItem] = useState(null);
  const [ShowCommentModal, setShowCommentModal] = useState(false);
  const [addNewComment, setAddNewComment] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  

  const userProfile = useSelector((state) => state.user.userProfile);

  
  useEffect(() => {
      if (commnetItem) {
        setShowCommentModal(true)
      } else {
        setShowCommentModal(false)
      }
    },[commnetItem])
  
    
    useEffect(() => {
      const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
        setKeyboardOpen(true);
      });
      const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardOpen(false);
      });
  
      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, []);
  
    
  
  useEffect(() => {
    getComments();
  }, []);

  const getComments = async () => {
    setLoader(true);
    try {
      const commentsRef = await firestore()
        .collection('Clips')
        .doc(clipId)
        .collection('Comments')
        .orderBy('createdAt', 'desc')
        .limit(40);
        const commentsSnapshot = await commentsRef.get();
        setLastDoc(commentsSnapshot.docs[commentsSnapshot.docs.length - 1]);
        const blockedCommentsRef = firestore()
          .collection('Users')
          .doc(UserInfoService.getUserId())
          .collection('BlockedComments');
  
        const blockedCommentsSnapshot = await blockedCommentsRef.get();
        const blockedCommentIds = new Set(
          blockedCommentsSnapshot.docs.map((doc) => doc.id)
        );
  
        const commentsWithReplies = await Promise.all(
          commentsSnapshot.docs.map(async (doc) => {
            if (blockedCommentIds.has(doc.id)) return null;
  
            const replies = await fetchRepliesRecursively(clipId, doc.id);
  
            return {
              ...doc.data(),
              id: doc.id,
              userId: doc.data().id,
              replies,
            };
          })
        );
  
        setComments(commentsWithReplies.filter(Boolean));
  
      setLoader(false);
      } catch (error) {
        setLoader(false);
        console.error('Error fetching comments:', error);
      }
  };

  const loadMoreComments = async () => {
    if (!lastDoc) return;

    const commentsRef = firestore()
      .collection('Clips')
      .doc(clipId)
      .collection('Comments')
      .orderBy('createdAt', 'desc')
      .startAfter(lastDoc)
      .limit(40);

    const snapshot = await commentsRef.get();

    // (repeat processing logic here for replies etc.)
  };

  const publishComment = async () => {
    if (!input || input == '') {
      return;
    }
    setAddNewComment(false);

    try {
      const batch = firestore().batch();
      const clipRef = firestore().collection('Clips').doc(clipId);
      const commentsRef = clipRef.collection('Comments').doc();

      const body = {
        comment: input,
        id: userProfile.userId,
        profileUrl: userProfile.profileUrl || null,
        displayName: userProfile.displayName,
        createdAt: firestore.Timestamp.now(),
        blockedCount: 0
      };

      batch.update(clipRef, {
        activityCount: firestore.FieldValue.increment(1),
        totalComments: firestore.FieldValue.increment(1),
      });
      batch.set(commentsRef, body);
      await batch.commit();
      setInput('');
      setComments([body, ...comments]);
      incrementCommentCount();
    } catch (error) {
      defaultAlert();
      errorLog('commenting', error);
    }
  };


  const updateComment = async (clipId, commentId, newText, getComments) => {
    try {
      const commentRef = firestore()
        .collection('Clips')
        .doc(clipId)
        .collection('Comments')
        .doc(commentId);
  
      await commentRef.update({
        comment: newText,
      });
      setEditableComment(null);
      await getComments(); // Refresh comments
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  
  const editComment = (comment) => {
    setCommnetItem(null)
    setTimeout(() => {
      setEditableComment(comment);
      setInput(comment.comment);
    }, 300);
   
  };

  const deleteComment = async (commentId) => {

    setCommnetItem(null)

    Utility.showMessageWithActionCancel(async () => {
      setLoader(true);

    await firestore()
      .collection('Clips')
      .doc(clipId)
      .collection('Comments')
      .doc(commentId)
      .delete();
    getComments();
    }, () => {

    },
      '',
      'Are you sure to delete message?'

    )
  };



  const updateReply = async (clipId, parentId, replyId, newText, getComments) => {
    setLoader(true);
    try {
      const replyRef = firestore()
        .collection('Clips')
        .doc(clipId)
        .collection('Comments')
        .doc(parentId);

      const findAndUpdateReply = async (ref) => {
        const repliesRef = ref.collection('Replies');
        const snapshot = await repliesRef.get();

        for (const doc of snapshot.docs) {
          if (doc.id === replyId) {
            await repliesRef.doc(replyId).update({ comment: newText });
            return true;
          } else {
            const nestedRef = repliesRef.doc(doc.id);
            const found = await findAndUpdateReply(nestedRef);
            if (found) return true;
          }
        }
        return false;
      };

      await findAndUpdateReply(replyRef);
      await getComments();
    } catch (error) {
      console.error('Error updating reply:', error);
    }
  };

  const editReply = (reply, parentId) => {
    setTimeout(() => {
      setEditableReply({ ...reply, parentId });
      setReplyText(reply.comment);
    }, 200);
   
    setShowModal(false);
    setReplyAndparentId(null)
  };

  const deleteReply = async (replyId, parentId) => {
    setShowModal(false);
    Utility.showMessageWithActionCancel(async () => {
      setLoader(true);
      await firestore()
        .collection('Clips')
        .doc(clipId)
        .collection('Comments')
        .doc(parentId)
        .collection('Replies')
        .doc(replyId)
        .delete();
      getComments();

    setReplyAndparentId(null)
    }, () => {

    setReplyAndparentId(null)
    },
      '',
      'Are you sure to delete message?'

    )

  };

  const fetchRepliesRecursively: any = async (clipId, commentId) => {
    const repliesRef = firestore()
      .collection('Clips')
      .doc(clipId)
      .collection('Comments')
      .doc(commentId)
      .collection('Replies')
      .orderBy('createdAt', 'asc');

    const repliesSnapshot = await repliesRef.get();

    const replies = await Promise.all(repliesSnapshot.docs.map(async (doc) => {
      const subReplies = await fetchRepliesRecursively(clipId, doc.id); // 👈 recursive call
      return {
        ...doc.data(),
        id: doc.id,
        userId: doc.data().id,
        replies: subReplies,
      };
    }));

    return replies;
  };

  useEffect(() => {
    if (replyAndParentId) {
      setShowModal(true);
    } else {
      setShowModal(false)
    }
  }, [replyAndParentId]);

  const renderCommentModal = () => {
    return <AppModalView
      visible={true}>
      <View style={{ paddingHorizontal: 30, paddingRight: 20, paddingTop: 15, paddingBottom: 40, backgroundColor: '#fff' }}>
        <TouchableOpacity
          style={styles.modalButton}
          onPress={() => editComment(commnetItem)}
        >
          <Text style={styles.modalText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modalButton}
          onPress={() => deleteComment(commnetItem?.id)}>
          <Text style={styles.modalText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { setCommnetItem(null) }}
          style={styles.modalButton}>
          <Text
            style={styles.modalText}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </AppModalView>
  }

  const renderModal = () => {
    return <AppModalView
       visible={showModal}>
       <View style={{ paddingHorizontal: 30, paddingRight: 20, paddingTop: 15, paddingBottom: 40, backgroundColor: '#fff' }}>
        <TouchableOpacity
          style={styles.modalButton}
          onPress={() => editReply(replyAndParentId?.reply, replyAndParentId.parentId)}>
          <Text style={styles.modalText}>Edit</Text>
        </TouchableOpacity>
 
        <TouchableOpacity
          style={styles.modalButton}
          onPress={() => deleteReply(replyAndParentId?.reply.id, replyAndParentId.parentId)}>
          <Text style={styles.modalText}>Delete</Text>
        </TouchableOpacity>
         
         <TouchableOpacity
           onPress={() => { setReplyAndparentId(null) }}
           style={styles.modalButton}>
           <Text
             style={styles.modalText}>
             Cancel
           </Text>
         </TouchableOpacity>
       </View>
     </AppModalView>
   }

   const renderReply = (reply, parentId) => {
    const isReplyingToThis = replyingTo === reply.id;
    console.log('######')
    console.log(reply.userId + ' :::: ' + userProfile.userId)
    const isOwnReply = reply.userId === userProfile.userId;
    return (
      <View key={reply.id} style={{ marginLeft: 20, marginTop: 10 }}>
        <View style={{ borderLeftWidth: 1, paddingLeft: 10, borderColor: 'rgba(0, 0, 0, 0.2)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
          <TouchableOpacity
            style={{flexDirection: 'row', flex: 1}}
            onPress={() => {
              if (reply.userId != userProfile.userId) {
                navigation.navigate('otherProfile', {userId: reply.userId});
              }
            }}
            >
            <RoundImage
              userId={reply.userId}
              imageUrl={reply.profileUrl}
              displayName={reply.displayName}
              size={30}
            />
            <View style={{}}>
              <Text style={{ fontWeight: 'bold', marginLeft: 6, flex: 1 }}>{reply.displayName}</Text>
              <Text style={{ fontSize: 10, color: 'gray', marginLeft: 6, flex: 1 }}>
                {moment(reply.createdAt.toDate()).fromNow()}
              </Text>
            </View>
            </TouchableOpacity>
            {isOwnReply && (
              <TouchableOpacity
              onPress={() => setReplyAndparentId({
                reply: reply,
                parentId: parentId
              })}
              style={{
                padding: 15,
                paddingRight: 10,
                alignSelf: 'flex-end'}}>
                  <Icon
                                    name="dots-three-horizontal"
                                    type="entypo"
                                    size={16}
                                    style={styles.iconRight}
                                    color="#8c8c8c"
                                  />
              </TouchableOpacity>
            )}
          </View>

          <Text style={{ marginHorizontal: 10, flex: 1 }}>{reply.comment}</Text>


          <View style={{ flexDirection: 'row', marginTop: 5 }}>
            <TouchableOpacity onPress={() => setReplyingTo(isReplyingToThis ? null : reply.id)}>
              <Text style={{ color: 'blue', fontSize: 12, fontWeight: 'bold', marginRight: 10 }}>Reply</Text>
            </TouchableOpacity>
          </View>

          {editableReply?.id === reply.id ? (
            <>
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
                     value={replyText}
                     onChangeText={setReplyText}
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
                    onPress={
                      async () => {
                        setReplyAndparentId(null)
                        setLoader(true)
                        const temp =JSON.parse(JSON.stringify(editableReply));
                        setEditableReply(null)
                        await updateReply(clipId, temp?.parentId, temp?.id, replyText, getComments);
                        
                        setLoader(false)
                      }
                    }>
                    <Icon
                      name="caret-forward"
                      type="ionicon"
                      size={vScale(22)}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => setEditableReply(null)}
                  style={{ borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginTop: 20, paddingHorizontal: 40, paddingVertical: 15 }}>
                  <Text style={{ fontWeight: '700', color: '#000' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

              </View>
            </AppModalView>
             
            </>
          ) : (
            null
          )}

          {isReplyingToThis && (
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginTop: 10,
              marginRight: 20,
              borderWidth: 1,
              borderColor: '#ccc',
               borderRadius: scale(15),
              padding: 10,
              }}>
              <TextInput
                style={{
                  flex: 1,
                  marginRight: 10
                }}
                placeholder="Write a reply..."
                value={replyText}
                onChangeText={setReplyText}
              />
              <TouchableOpacity
                onPress={() => {
                  addClipReply(clipId, reply.id, replyText, userProfile, getComments);
                  setReplyingTo(null);
                  setReplyText('');
                }}
                style={{
                  height: scale(30),
                  width: scale(30),
                  borderRadius: scale(15),
                  backgroundColor: 'green',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Icon
              name="caret-forward"
              type="ionicon"
              size={vScale(22)}
              color="white"
            />
              </TouchableOpacity>
            </View>
          )}

          {/* Render nested replies */}
          {reply.replies && reply.replies.length > 0 && (
            reply.replies.map((subReply) => renderReply(subReply, reply.id))
          )}
        </View>
      </View>
    );
  };

  const renderComment = ({ item }) => {
    console.log('commnete')
    console.log(item)
    const handleReplyPress = (commentId) => {
      setReplyingToMap(prev => ({
        ...prev,
        [commentId]: !prev[commentId]
      }));
    };

    const handleReplySend = async (parentCommentId) => {
      const replyText = replyTextMap[parentCommentId];
      if (!replyText) return;

      await addClipReply(clipId, parentCommentId, replyText, userProfile, getComments);
      setReplyTextMap(prev => ({ ...prev, [parentCommentId]: '' }));
      setReplyingToMap(prev => ({ ...prev, [parentCommentId]: false }));
    };

    return (
      <View style={{ margin: 10, width: DEVICE_WIDTH - 20 }}>
        {/* Main Comment */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 10, padding: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
            <TouchableOpacity
             style={{flexDirection: 'row', flex: 1}}
            onPress={() => {
              if (item.userId != userProfile.userId) {
                navigation.navigate('otherProfile', {userId: item.userId});
              }
            }}
            >
            <RoundImage
              userId={item.userId}
              imageUrl={item.profileUrl}
              displayName={item.displayName}
              size={30}
            />
            <View>
              <Text style={{ fontWeight: 'bold', marginLeft: 10 }}>{item.displayName}</Text>
              <Text style={{ fontSize: 10, color: 'gray', marginLeft: 10 }}>{moment(item.createdAt.toDate()).fromNow()}</Text>

            </View>
            </TouchableOpacity>
            { item.userId === userProfile.userId && (
              <TouchableOpacity
              onPress={() => setCommnetItem(item)}
              style={{
                padding: 15,
                paddingRight: 10,
                alignSelf: 'flex-end'}}>
                  <Icon
                                    name="dots-three-horizontal"
                                    type="entypo"
                                    size={16}
                                    style={styles.iconRight}
                                    color="#8c8c8c"
                                  />
              </TouchableOpacity>
            )}
          </View>
          <Text style={{ marginHorizontal: 10, flex: 1 }}>{item.comment}</Text>
          <TouchableOpacity onPress={() => handleReplyPress(item.id)}>
      <Text style={{ color: 'blue', fontSize: 12, fontWeight: 'bold', marginRight: 10  }}>Reply</Text>
    </TouchableOpacity>
          {replyingToMap[item.id] && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginTop: 10,
                borderWidth: 1,
                borderColor: '#ccc', borderRadius: scale(15),
                padding: 10,
                marginRight: 20,
                }}>
                <TextInput
                  style={{
                    flex: 1,
                    marginRight: 10
                  }}
                  value={replyTextMap[item.id] || ''}
                onChangeText={(text) =>
                  setReplyTextMap(prev => ({ ...prev, [item.id]: text }))
                }
                placeholder="Write a reply..."
                />
                <TouchableOpacity
                  onPress={() => {
                    handleReplySend(item.id);
                  }}
                  style={{
                    height: scale(30),
                    width: scale(30),
                    borderRadius: scale(15),
                    backgroundColor: 'green',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 10
                  }}
                >
                  <Icon
                name="caret-forward"
                type="ionicon"
                size={vScale(22)}
                color="white"
              />
                </TouchableOpacity>
              </View>
          )}

          {/* Replies */}
          {item.replies && item.replies.length > 0 && (
            <View style={{ marginLeft: 20, marginTop: 10 }}>
              {item.replies.map((reply) => renderReply(reply, item.id))}
            </View>
          )}
        </View>
      </View>
    );
  };



  return (
     <View
        style={{flex: 1}}
        keyboardShouldPersistTaps='handled'
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        
      >
       
    <View
      style={{
       flex: 1
      }}>
      <Text style={styles.title}>Comments</Text>
      <View style={styles.lineBreak} />
      {(
        <>
          <FlatList
          keyboardShouldPersistTaps='handled'
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item, index) => `${item.id}${index}`}
            showsVerticalScrollIndicator={false}
            style={{
              paddingTop: vScale(10),
              marginBottom: vScale(10 + 40),
            }}
            ListEmptyComponent={
              <EmptyListText
                title="Be the first to comment on this Clip."
                style={{height: vScale(427) - bottom - vScale(10)}}
              />
            }
          />

{
          addNewComment ?
          <AppModalView
          customStyle={{ opacity: 0.9 }}
          >
         <>
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
            returnKeyType='done'
            returnKeyLabel='Done'
            value={input}
            onChangeText={setInput}
            placeholder="Add a comment ..."
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

          <TouchableOpacity
                  onPress={() => {
                   setAddNewComment(false)
                  }}
                  style={{ borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginTop: 20, paddingHorizontal: 40, paddingVertical: 15 }}>
                  <Text style={{ fontWeight: '700', color: '#000' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
       
        </View>
         </>
         </AppModalView>
         :
         !keyboardOpen ?
         <TouchableOpacity
                  onPress={() => {
                    setAddNewComment(true)
                  }}
                  style={{ 
                    opacity: keyboardOpen ? 0 : 1,
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    paddingHorizontal: 20,
                    borderRadius: 20, 
                    backgroundColor: '#1e2348', 
                    height: 40, 
                    justifyContent: 'center', 
                    alignItems: 'center'
                   }}
                  >
                  <Text style={{ fontWeight: '700', color: '#fff' }}>
                    Add Comment
                  </Text>
                </TouchableOpacity>
                :
                null
        }
        
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
                    value={editableComment.comment}
                    onChangeText={(value) => setEditableComment({ ...editableComment, comment: value })}
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
                    onPress={
                      () => {
                        updateComment(clipId, editableComment.id, editableComment.comment, getComments )
                      }
                    }>
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
        </>
      )}
    </View>
    {showModal ? renderModal() : null}
      {ShowCommentModal ? renderCommentModal() : null}
      {loader ? <AppLoader /> : null}
    </View>
  );
};

export default ClipComments;

const styles = StyleSheet.create({
  commentCont: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    // paddingHorizontal: scale(20),
    width: '100%',
    marginBottom: vScale(10),
  },
  displayName: {
    fontSize: mScale(14),
    fontWeight: 'bold',
  },
  profileImage: {marginRight: scale(10)},
  comment: {
    fontSize: mScale(14),
    // marginTop: vScale(2),
  },
  createdAt: {
    fontSize: mScale(10),
    color: '#797979',
    marginTop: vScale(2),
  },
  title: {
    fontSize: mScale(18),
    fontWeight: 'bold',
  },
  lineBreak: {
    height: vScale(0.7),
    backgroundColor: '#797979',
    width: '100%',
    marginTop: vScale(8),
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
});

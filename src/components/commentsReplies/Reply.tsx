import firestore from '@react-native-firebase/firestore';
import UserInfoService from '../../utils/UserInfoService';

// Function to add a reply
export const addReply = async (postId, commentId, replyText, userProfile, getComments, parentReplyId = null) => {
  if (!replyText) return;

  try {
    const replyRef = firestore()
      .collection('Posts')
      .doc(postId)
      .collection('Comments')
      .doc(commentId)
      .collection('Replies')
      .doc();

    const replyData = {
      content: replyText,
      displayName: userProfile.displayName,
      profileUrl: userProfile.profileUrl || null,
      id: userProfile.userId,
      createdAt: firestore.Timestamp.now(),
      parentReplyId: parentReplyId || null, // this helps if you want to support deeper nesting in future
    };

    await replyRef.set(replyData);
    getComments(); // refresh comments
  } catch (error) {
    console.log("Error adding reply:", error);
  }
};

export const addClipReply = async (clipId, commentId, replyText, userProfile, getComments, parentReplyId = null) => {
  if (!replyText) return;
  try {
    const replyRef = firestore()
      .collection('Clips')
      .doc(clipId)
      .collection('Comments')
      .doc(commentId)
      .collection('Replies')
      .doc();

    const replyData = {
      comment: replyText,
      displayName: userProfile.displayName,
      profileUrl: userProfile.profileUrl || null,
      id: userProfile.userId,
      createdAt: firestore.Timestamp.now(),
      parentReplyId: parentReplyId || null, // this helps if you want to support deeper nesting in future
    };

    await replyRef.set(replyData);
    getComments(); // refresh comments
  } catch (error) {
    console.log("Error adding reply:", error);
  }
};



export const fetchReplies = async (postId, commentId, parentReplyId = null) => {
    try {
      let ref;
      if (parentReplyId) {
        // Fetch replies to a reply
        ref = firestore()
          .collection('POSTS')
          .doc(postId)
          .collection('Comments')
          .doc(commentId)
          .collection('Replies')
          .doc(parentReplyId)
          .collection('Replies');
      } else {
        // Fetch replies to the main comment
        ref = firestore()
          .collection('POSTS')
          .doc(postId)
          .collection('Comments')
          .doc(commentId)
          .collection('Replies');
      }
  
      const snapshot = await ref.orderBy('createdAt', 'asc').get();
      const replies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return replies;
    } catch (error) {
      console.error('Error fetching replies:', error);
      return [];
    }
  };


  export const deleteReply = async (postId, commentId, replyId, parentReplyId = null) => {
    try {
      let ref;
      if (parentReplyId) {
        // Delete reply from nested Replies
        ref = firestore()
          .collection('POSTS')
          .doc(postId)
          .collection('Comments')
          .doc(commentId)
          .collection('Replies')
          .doc(parentReplyId)
          .collection('Replies')
          .doc(replyId);
      } else {
        // Delete reply from the main Replies collection
        ref = firestore()
          .collection('POSTS')
          .doc(postId)
          .collection('Comments')
          .doc(commentId)
          .collection('Replies')
          .doc(replyId);
      }
  
      await ref.delete();
      console.log('Reply deleted successfully!');
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  export const sendReply = async (postId, parentCommentId, replyText, setReplyText, setShowReplyInput, isReplyToReply = false, userProfile, getComments) => {
    if (!replyText.trim()) return;
  
    const userId = UserInfoService.getUserId();
    const userName = userProfile?.displayName || "Unknown";
    const userProfilePic = userProfile?.profileUrl || null;
  
    const replyData = {
      id: userId, // User ID
      content: replyText,
      displayName: userName,
      profileUrl: userProfilePic,
      createdAt: firestore.FieldValue.serverTimestamp(),
      replies: [] // Empty array for nested replies
    };
  
    try {
      const commentRef = firestore()
        .collection("Posts")
        .doc(postId)
        .collection("Comments")
        .doc(parentCommentId);
  
      if (isReplyToReply) {
        await commentRef.update({
          replies: firestore.FieldValue.arrayUnion(replyData),
        });
      } else {
        await commentRef.update({
          replies: firestore.FieldValue.arrayUnion(replyData),
        });
      }
  
      setReplyText("");
      setShowReplyInput(false);
      getComments();
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };
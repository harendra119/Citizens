import firestore from '@react-native-firebase/firestore';

const sendFriendRequest = (payload) => {
  const {identifiers} = payload;
  return firestore().runTransaction(async (transaction) => {

    const ref = firestore().collection('Users').doc(payload.sendTo.userId);
    const notificationRef = ref.collection('Notification').doc();
    const batch = firestore().batch();
    batch.set(notificationRef, {
      id: notificationRef.id,
      type: 'FR_REQ',
      displayName: payload.sendBy.displayName,
      profileUrl: payload.sendBy.profileUrl,
      senderId: payload.sendBy.userId,
      text: payload.sendBy.displayName + ' sent you friend request',
      date: new Date()
    });
    await batch.commit();
    const snap = await firestore()
      .collection('Friends')
      .where('identifiers', 'array-contains-any', identifiers)
      .get();
    if (snap.empty) {
      return transaction.set(firestore().collection('Friends').doc(), payload);
    } else {
      if (snap.docs[0].data()?.status !== 'pending') {
        return transaction.update(snap.docs[0].ref, {
          ...snap.docs[0].data(),
          status: 'pending',
          sendBy: payload.sendBy,
          sendTo: payload.sendTo,
        });
      } else {
        throw new Error('Something went wrong');
      }
    }
  });
};

const respondFriendRequest = ({ref, status: Status}) => {
  return firestore().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (snapshot.data().status == 'pending') {
      const status = Status;
      const areFriends = Status == 'accepted' ? true : false;
      snapshot.data().users.map((id) => {
        transaction.update(firestore().collection('Users').doc(id), {
          friendsCount: firestore.FieldValue.increment(1),
        });
      });
      return transaction.update(ref, {status, areFriends});
    } else {
      throw 'User cancelled this request';
    }
  });
};

const cancelFriendRequest = ({ref}) => {
  return ref.update({
    status: 'cancelled',
  });

  // return firestore()
  //   .collection('Friends')
  //   .where('identifiers', 'array-contains-any', identifiers)
  //   .get()
  //   .then((res) => {
  //     if (res.docs.length == 1) {
  //       return res.docs[0].ref.update({
  //         ...res.docs[0].data(),
  //         status: 'cancelled',
  //       });
  //     }
  //   })
  //   .catch((err) => {
  //     return new Promise.reject();
  //   });
};

const unFriend = ({ref}) => {
  console.log(ref);
  return firestore().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (snapshot.data().areFriends == true) {
      snapshot.data().users.map((id) => {
        transaction.update(firestore().collection('Users').doc(id), {
          friendsCount: firestore.FieldValue.increment(-1),
        });
      });
      return transaction.update(ref, {areFriends: false, status: null});
    } else {
      throw 'User cancelled this request';
    }
  });
};

const follow = async ({payload, otherUserId, currentUserId}) => {
  const {identifiers} = payload;
  console.log(payload);
  try {
    await firestore().runTransaction(async (transaction) => {
      const snap = await firestore()
        .collection('Follows')
        .where('identifiers', 'array-contains-any', identifiers)
        .get();
      if (snap.empty) {
        console.log('empty');
        const newRef = firestore().collection('Follows').doc();
        console.log('newRef', newRef);
        transaction.update(firestore().collection('Users').doc(otherUserId), {
          followersCount: firestore.FieldValue.increment(1),
        });
        transaction.update(firestore().collection('Users').doc(currentUserId), {
          followingCount: firestore.FieldValue.increment(1),
        });
        console.log('updated');
        return transaction.set(newRef, payload);
      } else {
        console.log('0000');
        transaction.update(firestore().collection('Users').doc(otherUserId), {
          followersCount: firestore.FieldValue.increment(1),
        });
        transaction.update(firestore().collection('Users').doc(currentUserId), {
          followingCount: firestore.FieldValue.increment(1),
        });
        transaction.update(
          firestore().collection('Follows').doc(snap.docs[0].id),
          payload,
        );
      }


      const currentUserData = payload.userData.filter((userItem) => userItem.userId == currentUserId);
      if (currentUserData.length) {
        const refNoti = firestore().collection('Users').doc(otherUserId);
        const notificationRef = refNoti.collection('Notification').doc();
        const batchInner = firestore().batch();
        batchInner.set(notificationRef, {
          id: notificationRef.id,
          type: 'FOLLOW_REQ',
          displayName: currentUserData[0].displayName,
          profileUrl: currentUserData[0].profileUrl || null,
          senderId: currentUserData[0].userId,
          text:  currentUserData[0].displayName + ' started following you.',
          date: new Date()
        });
        await batchInner.commit();
      }
    });
  } catch (error) {
    throw error;
  }
};



const unfollow = ({ref, payload}) => {
  console.log('ref', Object.keys(ref));
  const {
    isFollowingOtherUser,
    isFollowedByOtherUser,
    currentUserId,
    otherUserId,
  } = payload;
  const batch = firestore().batch();
  batch.update(ref, {
    isFollowingOtherUser,
    isFollowedByOtherUser,
    currentUserId,
    otherUserId,
  });
  batch.update(firestore().collection('Users').doc(currentUserId), {
    followingCount: firestore.FieldValue.increment(-1),
  });
  batch.update(firestore().collection('Users').doc(otherUserId), {
    followersCount: firestore.FieldValue.increment(-1),
  });

  return batch.commit();
};

const checkFriendStatus = ({userid1, userid2}) => {
  return firestore()
    .collection('Friends')
    .where('identifiers', 'array-contains-any', [
      `${userid1}_${userid2}`,
      `${userid2}_${userid1}`,
    ])
    .get()
    .then((res) => {
      if (res.docs.length == 1) {
        return {
          ...res.docs[0].data(),
          id: res.docs[0].id,
          ref: res.docs[0].ref,
        };
      } else {
        return new Promise.resolve(null);
      }
    })
    .catch((err) => {
      console.log('checkFriend');
      return new Promise.reject(err);
    });
};

const checkFollowStatus = ({userid1, userid2}) => {
  return firestore()
    .collection('Follows')
    .where('identifiers', 'array-contains-any', [
      `${userid1}_${userid2}`,
      `${userid2}_${userid1}`,
    ])
    .get()
    .then((res) => {
      if (res.docs.length == 1) {
        return {
          ...res.docs[0].data(),
          id: res.docs[0].id,
          ref: res.docs[0].ref,
        };
      } else {
        return new Promise.resolve(null);
      }
    })
    .catch((err) => {
      console.log('checkFollow', err);
      return new Promise.reject(err);
    });
};

const getFriends = async (userId) => {
  return firestore()
    .collection('Friends')
    .where('users', 'array-contains', userId)
    .where('areFriends', '==', true)
    .get()
    .then((res) => {
      if (res.docs.length > 0) {
        const tempArr = res.docs.map((doc) => ({...doc.data(), id: doc.id}));
        return tempArr;
      } else return [];
    })
    .catch((err) => {
      return Promise.reject();
    });
};

const getFollowers = (userId) => {
  return firestore()
    .collection('Follows')
    .where('users', 'array-contains', userId)
    .where(`isFollowedByOtherUser.${userId}`, '==', true)

    .get()
    .then((res) => {
      const tempArr = res.docs.map((doc) => ({...doc.data(), id: doc.id}));
      return tempArr;
    })
    .catch((err) => {
      return Promise.reject();
    });
};

const getFollowing = (userId) => {
  
  return firestore()
    .collection('Follows')
    .where('users', 'array-contains', userId)
    .where(`isFollowingOtherUser.${userId}`, '==', true)
    .where(`is_movement`, '==', false)
    
    .get()
    .then((res) => {
      console.log(res);
      const tempArr = res.docs.map((doc) => ({...doc.data(), id: doc.id}));
      return tempArr;
    })
    .catch((err) => {
      console.log(err);
      return Promise.reject();
    });
};




const getFriendRequests = (userId) => {
  return firestore()
    .collection('Friends')
    .where('sendTo.userId', '==', userId)
    .where('status', '==', 'pending')
    .get()
    .then((res) => {
      const tempArr = res.docs.map((doc) => ({...doc.data(), id: doc.id}));
      return tempArr;
    })
    .catch((err) => {
      return Promise.reject();
    });
};

export {
  sendFriendRequest,
  cancelFriendRequest,
  follow,
  unfollow,
  checkFollowStatus,
  checkFriendStatus,
  getFriends,
  getFollowers,
  getFollowing,
  getFriendRequests,
  respondFriendRequest,
  unFriend,
};

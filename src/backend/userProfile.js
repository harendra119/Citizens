import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ErrorLog from '../Constants/errorLog';
import {
  setUserProfile,
  setUserFriends,
  setUserFollowings,
} from '../redux/actions/userActions';
import messaging from '@react-native-firebase/messaging';

const uid = auth().currentUser?.uid;

const profileRef = firestore().collection('Users');

const getUserProfile = (userid) => {
  return profileRef.doc(userid).onSnapshot(
    (snap) => {
      // console.log('response from firestore', snap);
      if (snap.exists) {
        const data = snap.data();
        messaging()
          .getToken()
          .then((token) => {
            if (data?.fcm != token) {
            }
          });
        setUserProfile(data);
      }
    },
    (err) => {
      console.log('error while getting your profile.', err.message);
    },
  );
};

const updateFcmToken = async (userId) => {
  try {
    const token = await messaging().getToken();
    profileRef.doc(userId).update({fcm: token});
  } catch (error) {
    console.log('unable to update fcm token');
  }
};

const updateUserProfile = async (uid, data) => {
  try {
    return await profileRef.doc(uid).update(data);
  } catch (err) {
    throw err;
  }
};

const uploadImage = async (url, refPath) => {
  if (!url) {
    return null;
  }
  const imgRef = storage().ref(refPath);
  try {
    await imgRef.putFile(url);
    try {
      const url = await imgRef.getDownloadURL();
      return url;
    } catch (error) {
      console.log('error while uploading image url', error);
      throw new Error('Something went wrong while uploading your image url.');
    }
  } catch (error) {
    console.log('error while updating your image', error);

    throw new Error('Something went wrong while updating your image.');
  }
};

const getUserFriends = (userId) => {
  return firestore()
    .collection('Friends')
    .where('users', 'array-contains', userId)
    .onSnapshot(
      (snap) => {
        let tempArr = snap.docs.map((item) => ({...item.data(), id: item.id}));
        setUserFriends(tempArr);
      },
      (err) => {
        ErrorLog(`getting friends, ${err.message}`);
      },
    );
};

const getUserFollowings = (userId) => {
  return firestore()
    .collection('Follows')
    .where('users', 'array-contains', userId)
    .where(`isFollowingOtherUser.${userId}`, '==', true)
    .onSnapshot(
      (snap) => {
        let tempArr = snap.docs.map((item) => ({...item.data(), id: item.id}));
        setUserFollowings(tempArr);
      },
      (err) => {
        ErrorLog(`getting followings, ${err.message}`);
      },
    );
};

const isUsernameTaken = async (username, userId) => {
  return new Promise(async (res, rej) => {
    try {
      const snap = await firestore()
        .collection('Users')
        .where('username', '==', username)
        .get();
      if (snap.docs.length == 0) {
        res(false);
      } else if (snap.docs[0].data().userId == userId) {
        res(false);
      } else {
        res(true);
      }
    } catch (error) {
      rej(error);
    }
  });
};

export {
  getUserProfile,
  updateUserProfile,
  uploadImage,
  getUserFriends,
  getUserFollowings,
  isUsernameTaken,
  updateFcmToken,
};

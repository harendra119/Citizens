import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const createUser = async (email, pwd, payload) => {
  try {
    const {user} = await auth().createUserWithEmailAndPassword(email, pwd);
    console.log('new user .................',user.uid);
    try {
      console.log('new user1 .................',user.uid);
        await user.sendEmailVerification()
        firestore()
          .collection('Users')
          .doc(user.uid)
          .set({...payload, userId: user.uid});
          console.log('new user2 .................',user.uid);
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      alert('That email address is already in use!');
      console.log('That email address is already in use!');
    } else if (error.code === 'auth/invalid-email') {
      alert('That email address is invalid!');
      console.log('That email address is invalid!');
    } else alert('Error Signing up.');
    console.error(error);
  }
};

export const sendVerificationEmail = async (email, pwd) => {
  

  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, pwd);
    const user = userCredential.user;
    const result = await user.sendEmailVerification();
    console.log('verfication result',user);
    return user.uid;
    console.log('user successfully logged in');
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log('er', errorCode);
    if (errorCode == 'auth/wrong-password') alert('Invalid password.');
    else if (errorCode == 'auth/too-many-requests') alert('Too many request please try again later.')
    else if (errorCode == 'auth/user-not-found')
      alert('Email does not exist. Try signing up.');
    else alert('Error logging in, .');
    throw error;
  }
};



export const signIn = async (email, pwd) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, pwd);
    // Signed in
    const user = userCredential.user;
    return user.uid;
    console.log('user successfully logged in');
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log('er', errorCode);
    if (errorCode == 'auth/wrong-password') alert('Invalid password.');
    else if (errorCode == 'auth/user-not-found')
      alert('Email does not exist. Try signing up.');
    else alert('Error logging in.');
    throw error;
  }
};

export const updatePassword = async (newPwd) => {
  return auth()
    .currentUser.updatePassword(newPwd)
    .then((res) => {
      console.log('res', res);
      alert('Password updated successfully');
    })
    .catch((err) => {
      switch (err.code) {
        case 'auth/weak-password':
          alert('Please enter a stronger Passwrod!');
          break;
        case 'auth/requires-recent-login':
          alert('Your session has expired. Please login and try again.');
          break;
        default:
          console.log('error', err.message);
          alert('Something went wrong. Please try again later.');
      }
    });
};

export const sendPasswordResetLink = async (email) => {
  try {
    const result = await auth().sendPasswordResetEmail(email);
    console.log('result', result);
    return result;
  } catch (error) {
    alert(error.message);
  }
};

export const socialSignin = async (payload, userId) => {
  const snap = await firestore().collection('Users').doc(userId).get();
  if (!snap.exists) {
    try {
      firestore()
        .collection('Users')
        .doc(userId)
        .set({...payload, userId: userId});
    } catch (err) {
      console.log('error creating user', err);
    }
  }
};

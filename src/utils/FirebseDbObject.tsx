
import firestore from '@react-native-firebase/firestore';

// Initialize Firestore and Authentication
export const firebaseDbObject = firestore();
export const getUserDoc = (userid: string)  => firestore().collection('Users').doc(userid);
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const getLivePartOfList = ({ref, limitNum}) => {
  return new Promise((resolve, reject) => {
    const unsub = ref.onSnapshot(
      (snap) => {
        let lastDoc = null;
        if (snap.docs.length == limitNum) {
          lastDoc = snap.docs[snap.docs.length - 1];
        }

        const tempArr = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        resolve({list: tempArr, lastDoc, unsub});
      },
      (err) => {
        reject(err);
      },
    );
  });
};

const getPartOfList = ({ref, limitNum}) => {
  return new Promise((resolve, reject) => {
    ref
      .get()
      .then((snap) => {
        let lastDoc;
        if (snap.docs.length < limitNum) {
          lastDoc = null;
        } else {
          lastDoc = snap.docs[snap.docs.length - 1];
        }

        const tempArr = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        resolve({list: tempArr, lastDoc});
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export {getLivePartOfList, getPartOfList};

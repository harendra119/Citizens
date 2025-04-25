import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';

export const useBlockedUsers = (userId) => {
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    if (!userId) return;

    // Listen for changes in the logged-in user's document
    const unsubscribe = firestore()
      .collection('Users')
      .doc(userId)
      .onSnapshot(async (doc) => {
        if (doc.exists) {
          const blockedUserIds = doc.data().blockedUserByMe || [];
          
          if (blockedUserIds.length === 0) {
            setBlockedUsers([]);
            return;
          }

          // Fetch blocked users info dynamically
          const usersSnapshot = await firestore()
            .collection('Users')
            .where('userId', 'in', blockedUserIds.slice(0, 10)) // Firestore supports max 10 in `in` query
            .get();

          const users = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setBlockedUsers(users);
        }
      });

    return () => unsubscribe(); // Cleanup on unmount
  }, [userId]);

  return blockedUsers;
};

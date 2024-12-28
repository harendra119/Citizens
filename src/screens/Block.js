// Function to block a post and its user
const blockPost = async (postId) => {
    try {
      // Step 1: Retrieve the post document to get the userId of the author
      const postSnapshot = await firestore()
        .collection('posts')
        .doc(postId)
        .get();
  
      if (!postSnapshot.exists) {
        console.error('Post not found');
        return;
      }
  
      const postData = postSnapshot.data();
      const userId = postData.userId; // Assuming the post has a 'userId' field
  
      // Step 2: Block the post by updating the isBlocked flag
      await firestore()
        .collection('posts')
        .doc(postId)
        .update({
          isBlocked: true, // Set this flag to block the post
        });
      console.log('Post blocked successfully!');
  
      // Step 3: Block the user by updating the user's document
      await firestore()
        .collection('users')  // Assuming you have a 'users' collection
        .doc(userId)
        .update({
          isBlocked: true,  // Set this flag to block the user
          // Optionally add other flags or fields to restrict the user's access further
        });
      console.log('User blocked successfully!');
  
      // Optional: Remove the blocked user's posts (if desired)
      const userPostsSnapshot = await firestore()
        .collection('posts')
        .where('userId', '==', userId)
        .get();
  
      userPostsSnapshot.forEach(async (userPost) => {
        await firestore()
          .collection('posts')
          .doc(userPost.id)
          .update({
            isBlocked: true,
          });
        console.log(`Post ${userPost.id} blocked successfully!`);
      });
  
    } catch (error) {
      console.error('Error blocking post or user: ', error);
    }
  };
  


/* H code to make Block */


import firestore from '@react-native-firebase/firestore';

const blockUser = async (blockingUserId, blockedUserId) => {
  try {
    // Update the blocker's document to include the blocked user
    await firestore()
      .collection('users')
      .doc(blockingUserId)
      .update({
        blockedUsers: firestore.FieldValue.arrayUnion(blockedUserId),
      });

    // Optionally, create a block record for future reference
    // Blocking feature should just have the person unfollow the person they are blocking and vice versa 
    // Then refresht he feed that way there is no feed.js edits and we can just refresh the feed since it only includes
    // the posts are shown to only show that of who they follow etc
    await firestore()
      .collection('blocks')
      .add({
        blockingUserId,
        blockedUserId,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

    console.log('User blocked successfully');
  } catch (error) {
    console.error('Error blocking user: ', error);
  }
};

const fetchPosts = async (currentUserId) => {
    try {
      // Fetch the list of blocked users for the current user
      const userDoc = await firestore()
        .collection('users')
        .doc(currentUserId)
        .get();
      
      const blockedUsers = userDoc.data().blockedUsers || [];
      
      // Fetch posts excluding those from blocked users
      const postsSnapshot = await firestore()
        .collection('posts')
        .where('userId', 'not-in', blockedUsers) // exclude posts from blocked users
        .get();
      
      const posts = postsSnapshot.docs.map(doc => doc.data());
      return posts;
    } catch (error) {
      console.error('Error fetching posts: ', error);
      return [];
    }
  };
  
import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

const Feed = ({ currentUserId }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      const fetchedPosts = await fetchPosts(currentUserId);
      setPosts(fetchedPosts);
    };

    loadPosts();
  }, [currentUserId]);

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View>
          <Text>{item.content}</Text>
        </View>
      )}
    />
  );
};

export default Feed;


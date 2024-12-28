import React, {useEffect, useState} from 'react';
import {View, Text, FlatList} from 'react-native';
import firestore from '@react-native-firebase/firestore';

import PostCard from '../../../components/postCard';
import errorLog, {defaultAlert} from '../../../Constants/errorLog';
import {getLivePartOfList, getPartOfList} from '../../../backend/paginatedList';

const LatestTrendingPosts = ({navigation, route}) => {
  const [lastDoc, setLastDoc] = useState();
  const [postsFetched, setPostsFetched] = useState([]);

  const title = route.params?.title || '';

  console.log(route.params);

  useEffect(() => {
    getPosts();
  }, [title]);

  const getPosts = async () => {
    const ref = firestore()
      .collection('Posts')
      .where('hashtags', 'array-contains', title)
      .where('access', '==', 'public_notHidden')
      .orderBy('date', 'desc')
      .limit(15);

    try {
      const result = await getPartOfList({ref, limitNum: 15});
      setPostsFetched(result.list);
      setLastDoc(result.lastDoc);
      console.log('ers', typeof result.lastDoc);
      // removeListener.current.unsub = result.unsub;
      console.log('unsub type', typeof result.unsub);
    } catch (error) {
      defaultAlert();
      errorLog('while getting top trending posts', error);
    }
  };

  const getMorePosts = async () => {
    if (!lastDoc) {
      return;
    }
    removeListener.current.unsub();
    const ref = firestore()
      .collection('Posts')
      .where('hashtags', 'array-contains', title)
      .where('access', '==', 'public_notHidden')
      .orderBy('date', 'desc')
      .limit(10)
      .startAfter(lastDoc);

    try {
      const result = await getPartOfList({ref, limitNum: 10});
      console.log('length', result.list.length);

      setPostsFetched([...postsFetched, ...result.list]);
      setLastDoc(result.lastDoc);
      removeListener.current = result.unsub;
      console.log('unsub type', typeof result.unsub);
    } catch (error) {
      defaultAlert();
      errorLog('while getting more top trending posts', error);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#FFF', paddingBottom: 15}}>
      {postsFetched.length > 0 && (
        <FlatList
          data={postsFetched}
          renderItem={({item, index}) => {
            return (
              <PostCard
                data={item}
                index={index}
                openComment={() => {}}
                navigation={navigation}
                reportPost={true}
              />
            );
          }}
          onEndReachedThreshold={0.5}
          onEndReached={getMorePosts}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

export default LatestTrendingPosts;

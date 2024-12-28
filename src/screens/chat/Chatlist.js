import React, {useContext, useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  Text,
  FlatList,
  Dimensions,
  Pressable,
} from 'react-native';
import database from '@react-native-firebase/database';
import {StackActions, useFocusEffect} from '@react-navigation/native';
import ChatCard from '../../components/chats/chatCard';
import EmptyListLoader from '../../components/emptyListLoader';
import EmptyListText from '../../components/emptyListText';
import ShowFirends from '../showFirends';
import ShowUsers from '../showUsers';
import {mScale, scale, vScale} from '../../configs/size';
import {useSelector} from 'react-redux';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Icon} from 'react-native-elements';

const {height, width} = Dimensions.get('window');

const ChatList = ({navigation}) => {
  const [chats, setChats] = useState([]);
  const [lastDoc, setLastDoc] = useState();
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [noChatsAvailable, setNoChatsAvailable] = useState(true);
  const [showFriends, setShowFriends] = useState(true);

  const {userProfile} = useSelector((state) => state.user);

  const isScrollStarted = useRef();

  const uid = '';

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={{marginLeft: scale(15)}}>
          <Icon name="arrow-back" type="Ionicon" size={vScale(22)} />
        </TouchableOpacity>
      ),
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      try {
        const onChildAdded = database()
          .ref(`/chats/${userProfile.userId}`)
          .orderByChild(`/lastMessage/createdAt`)
          .limitToLast(15)
          .once(
            'value',
            (snap) => {
              let tempArr = [];
              snap.forEach((childSnap) => {
                if (childSnap.val()) {
                  const {lastMessage} = childSnap.val();
                  let friendId = childSnap.key;
                  tempArr.push({lastMessage, friendId, chatId: childSnap.key});
                } else {
                  console.log('null');
                }
              });
              console.log('rr0', tempArr);
              if (tempArr.length > 0) {
                setShowFriends(false);
                if (tempArr.length < 15) {
                  setLastDoc();
                } else {
                  setLastDoc(tempArr[0].lastMessage.createdAt);
                }
              } else {
                setShowFriends(true);
              }
              setChats(tempArr.reverse());
              setLoading(false);
            },
            (err) => {
              setLoading(false);
              setHasError(true);
              console.log('error while chat', err);
            },
          );
      } catch (error) {
        setLoading(false);
        console.log('error while chat1', err);
      }
    }, []),
  );

  const getMoreChats = async () => {
    if (!lastDoc) {
      console.log('null');
      return;
    }
    try {
      const onChildAdded = database()
        .ref(`/chats/${userProfile.userId}`)
        .orderByChild(`/lastMessage/createdAt`)
        .endAt(lastDoc)
        .limitToLast(15)
        .once(
          'value',
          (snap) => {
            let tempArr = [];
            snap.forEach((childSnap) => {
              if (childSnap.val()) {
                // console.log('snap', childSnap.val());

                const {lastMessage} = childSnap.val();
                let friendId = childSnap.key;
                tempArr.push({lastMessage, friendId, chatId: childSnap.key});
              } else {
                console.log('null1');
              }
            });
            tempArr.splice(tempArr.length - 1, 1);
            console.log('rr', tempArr);
            if (tempArr.length < 14) {
              setLastDoc();
            } else {
              setLastDoc(tempArr[0].lastMessage.createdAt);
            }
            console.log('rr2', [...chats, ...tempArr.reverse()]);
            setChats([...chats, ...tempArr.reverse()]);
          },
          (err) => {
            setHasError(true);
            console.log('error while chat', err);
          },
        );
    } catch (error) {
      setLoading(false);
      console.log('error while chat1', error);
    }
  };

  const renderChooseChatToContinue = () => (
    <View
      style={{
        flex: 1,
        width: width,
        paddingHorizontal: scale(15),
        paddingVertical: vScale(20),
      }}>
      <Text style={styles.friendListHeading}>
        Selects any friend to start a conversation.
      </Text>
      {/* <ShowFirends
        navigate={(data) => navigation.navigate('SingleChat', {friendId: data})}
        userId={userProfile.userId}
      /> */}
      <ShowUsers
        navigate={(data) => navigation.navigate('SingleChat', {friendId: data})}
        userId={userProfile.userId}
      />
    </View>
  );

  const renderChat = ({item}) => <ChatCard {...item} navigation={navigation} />;

  return (
    <View style={styles.container}>
      {loading ? (
        <EmptyListLoader
          style={{
            height: height * 0.8,
            width: width * 0.9,
          }}
          size="large"
        />
      ) : hasError ? (
        <EmptyListText
          title={'Something went wrong. Please try again later.'}
          style={{
            height: height * 0.8,
            width: width * 0.9,
          }}
        />
      ) : showFriends ? (
        renderChooseChatToContinue()
      ) : (
        <FlatList
          data={chats}
          initialNumToRender={3}
          keyExtractor={(item) => `${item.chatId}`}
          renderItem={renderChat}
          ListEmptyComponent={
            <EmptyListText
              title={'No Live Chats at this moment'}
              style={{
                height: height * 0.8,
                width: width * 0.9,
              }}
            />
          }
          onMomentumScrollBegin={() => {
            console.log('yes');
            isScrollStarted.current = true;
          }}
          onEndReached={() => {
            if (isScrollStarted.current) {
              console.log('called');

              getMoreChats();
              isScrollStarted.current = false;
            }
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={<View style={{height: vScale(70)}} />}
        />
      )}
      {chats.length > 0 ? (
        <Pressable
          style={styles.openFriends}
          onPress={() => {
            setShowFriends(!showFriends);
          }}>
          <Icon
            name={showFriends ? 'close' : 'chat'}
            color={'#ffffff'}
            size={vScale(25)}
            type="Ionicon"
          />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
  },
  friendListHeading: {
    fontSize: mScale(22),
    fontWeight: '400',
    marginBottom: vScale(15),
    textAlign: 'center',
  },
  openFriends: {
    backgroundColor: '#1c2143',
    width: vScale(45),
    height: vScale(45),
    borderRadius: scale(25),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: vScale(20),
    right: scale(20),
  },
});

export default ChatList;

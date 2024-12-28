import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import {Icon, Input} from 'react-native-elements';
import {useFocusEffect} from '@react-navigation/native';

import {scale, vScale} from '../../configs/size';
import {tStyle} from '../../configs/textStyle';
import {GiftedChat} from 'react-native-gifted-chat';
import moment from 'moment';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import database from '@react-native-firebase/database';
import RoundImage from '../../components/roundImage';
import errorLog, {defaultAlert} from '../../Constants/errorLog';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import MessagePreview from '../../components/MessagePreview';
import MessageMedia from '../../components/chats/messageMedia';
import {stat} from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import {getLowerKey} from '../../utils/getLowerKey';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';

const formatMessageForGiftedChat = (item) => {
  // console.log('item in format', item, typeof item);

  return {
    _id: item.key,
    text: item.message,
    createdAt: item.createdAt,
    user: {
      _id: item.senderId,
    },
    assets: item.assets,
    deletedBy: item.deletedBy,
  };
};

const SingleChat = ({navigation, route}) => {
  const [chatInput, setChatInput] = useState('');
  const [chats, setChats] = useState([]);
  const [chatsLoaded, setChatsLoaded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [disableActionBtn, setDisableActionBtn] = useState(false);
  const [isChattingFirstTime, setIsChattingFirstTime] = useState(false);
  const [err, setErr] = useState(false);
  const [shouldFetchMessages, setShouldFetchMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState();
  const [assets, setAssets] = useState();
  const [viewOnly, setViewOnly] = useState(false);
  const [lastDoc, setLastDoc] = useState();

  const inputRef = useRef();

  const chatArr = useRef();

  chatArr.current = chats;

  const {userProfile} = useSelector((state) => state.user);

  const {bottom, top} = useSafeAreaInsets();

  const {friendId} = route.params;
  console.log('return users',friendId);

  const combinedId = getLowerKey(friendId.userId, userProfile.userId);
  console.log('combine id',combinedId);



  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <View style={[styles.topBar, {marginTop: top}]}>
          <View
            style={{flexDirection: 'row', alignItems: 'center', width: '70%'}}>
            <TouchableOpacity
              onPress={() => {
                navigation.setOptions({
                  header: () => null,
                }, () => {
                 
                })
                setTimeout(() => {
                  navigation.goBack();
                }, 100);
               
              }}>
              <Icon
                type="ionicon"
                name="chevron-back-outline"
                color="#000000"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarBg}
              // onPress={showProfileModal}
            >
              <RoundImage
              userId={friendId.userId}
                imageUrl={friendId.profileUrl}
                displayName={friendId.displayName}
                size={vScale(56)}
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              // onPress={showProfileModal}
            >
              <Text 
              style={[styles.text1, {width: '100%'}]} 
              numberOfLines={1}
              >
                {friendId.displayName}
              </Text>
            </TouchableOpacity>
          </View>
          {selectedMessage ? (
            <TouchableOpacity onPress={deleteSelectedMessage}>
              <Icon name={'delete'} type="Ionicon" size={scale(30)} />
            </TouchableOpacity>
          ) : null}
          <Menu>
            <MenuTrigger
              children={
                <Icon
                  name="dots-three-vertical"
                  type="entypo"
                  size={scale(25)}
                  style={{marginRight: scale(10)}}
                />
              }
            />
            <MenuOptions
              customStyles={{
                optionsContainer: {
                  width: scale(95),
                },
              }}>
              <MenuOption
                text="Delete Chat"
                onSelect={() => {
                  Alert.alert(
                    'Delete Chat History',
                    'Are you sure you want to delete your chat history?',
                    [
                      {
                        text: 'Yes',
                        onPress: deleteChat,
                      },
                      {
                        text: 'Cancel',
                      },
                    ],
                  );
                }}
              />
            </MenuOptions>
          </Menu>
        </View>
      ),
    });
  }, [selectedMessage]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsFocused(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsFocused(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const deleteChat = () => {
    try {
      let updates = {};
      updates[`/chats/${userProfile.userId}/${friendId.userId}`] = null;
      updates[`/messages/${userProfile.userId}/${friendId.userId}`] = null;
      database().ref().update(updates);
    } catch (error) {
      errorLog('deleting messages', error);
    }
  };

  const deleteSelectedMessage = async () => {
    try {
      console.log('selectedMesssage', selectedMessage);
      console.log('length', chatArr.current.length - 1);
      if (selectedMessage.index == chatArr.current.length - 1) {
        const lastMsgRef = database().ref(
          `chats/${userProfile.userId}/${friendId.userId}`,
        );

        await database()
          .ref(
            `/messages/${userProfile.userId}/${friendId.userId}/${selectedMessage.id}`,
          )
          .remove();
        await lastMsgRef.transaction((lastMessage) => {
          console.log('lastMsg', lastMessage);
          if (lastMessage) {
            console.log(0);
            if (lastMessage.messageId == selectedMessage.id) {
              return {...selectedMessage, message: 'This message was deleted'};
            }
          }
        });
      } else {
        await database()
          .ref(
            `/messages/${userProfile.userId}/${friendId.userId}/${selectedMessage.id}`,
          )
          .remove();
      }

      setSelectedMessage();
    } catch (error) {
      errorLog('deleting message', error);
      setSelectedMessage();
    }
  };

  const checkIfFirstTimeChatting = async () => {
    try {
      const snap = await database()
        .ref(`/messages/${userProfile.userId}/${friendId.userId}`)
        .limitToLast(20)
        .once('value');
      if (!snap.val()) {
        setShouldFetchMessages(true);
      } else {
        let tempArr = [];
        snap.forEach((childSnap, index) => {
          tempArr.push(
            formatMessageForGiftedChat({
              ...childSnap.val(),
              key: childSnap.key,
            }),
          );
        });
        console.log('messages1', tempArr.length);
        if (tempArr.length < 20) {
          setLastDoc();
        } else {
          setLastDoc(tempArr[0]._id);
        }
        setErr(false);
        setChats(tempArr.reverse());
        setShouldFetchMessages(true);
      }
    } catch (error) {
      setErr(true);
      console.log(error);
    }
  };

  const getMoreMessages = async () => {
    if (!lastDoc) {
      return;
    }
    try {
      const snap = await database()
        .ref(`/messages/${userProfile.userId}/${friendId.userId}`)
        .orderByKey()
        .endAt(lastDoc)
        .limitToLast(20)
        .once('value');

      let tempArr = [];
      snap.forEach((childSnap, index) => {
        tempArr.push(
          formatMessageForGiftedChat({...childSnap.val(), key: childSnap.key}),
        );
      });
      tempArr.splice(tempArr.length - 1, 1);
      console.log('messages 2', tempArr.length);
      if (tempArr.length < 19) {
        setLastDoc();
      } else {
        setLastDoc(tempArr[0]._id);
      }
      setChats([...chats, ...tempArr.reverse()]);
      setShouldFetchMessages(true);
    } catch (error) {
      setErr(true);
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfFirstTimeChatting();
  }, [combinedId]);

  useEffect(() => {
    if (!shouldFetchMessages) {
      return;
    }
    const chatRef = database()
      .ref(`/messages/${userProfile.userId}/${friendId.userId}`)
      .limitToLast(20);
    const onChildAdded = chatRef.on('child_added', (snap) => {
      addToMessages({...snap.val(), key: snap.key});
    });
    const onChildRemoved = chatRef.on('child_removed', (snap) =>
      removeFromMessages(snap.key),
    );
    const onChildChanged = chatRef.on('child_changed', (snap) => {
      updateMessage({...snap.val(), key: snap.key});
    });
    return () => {
      chatRef.off('child_added', onChildAdded);
      chatRef.off('child_removed', onChildRemoved);
      chatRef.off('child_changed', onChildChanged);
    };
  }, [shouldFetchMessages]);

  const addToMessages = useCallback(
    (newMessage) => {
      let curIndx = chatArr.current.findIndex(
        (item) => item._id == newMessage.key,
      );
      if (curIndx == -1) {
        setChats(
          GiftedChat.append(
            chatArr.current,
            formatMessageForGiftedChat(newMessage),
          ),
        );
        console.log(0);
        return;
      }
    },
    [chats],
  );

  const removeFromMessages = useCallback(
    (msgId) => {
      let newArr = chatArr.current.filter((item) => item._id != msgId);
      setChats(newArr);
    },
    [chats],
  );

  const updateMessage = useCallback(
    (msg) => {
      let newArr = [...chatArr.current];
      let msgIdx = chatArr.current.findIndex((item) => item._id == msg.key);
      console.log('msgIdx', msgIdx);
      newArr[msgIdx] = formatMessageForGiftedChat(msg);
      setChats(newArr);
    },
    [chats],
  );

  const sendMessageHandler = async (message, downloadUrls) => {
    let messageBody = {
      senderId: userProfile.userId,
      receiverId: friendId.userId,
      message: message,
      createdAt: Date.now(),
    };
    if (downloadUrls?.length > 0) {
      messageBody['assets'] = downloadUrls;
    }
    const updates = {};

    const messageKey = database()
      .ref(`/messages/` + combinedId)
      .push().key;

    updates[
      '/chats/' + friendId.userId + '/' + userProfile.userId + '/lastMessage'
    ] = {...messageBody, messageId: messageKey};
    updates[
      '/chats/' + userProfile.userId + '/' + friendId.userId + '/lastMessage'
    ] = {...messageBody, messageId: messageKey};

    updates[
      '/messages/' +
        userProfile.userId +
        '/' +
        friendId.userId +
        '/' +
        messageKey
    ] = messageBody;
    updates[
      '/messages/' +
        friendId.userId +
        '/' +
        userProfile.userId +
        '/' +
        messageKey
    ] = messageBody;

    try {
      database().ref().update(updates);

      setChatInput();
    } catch (error) {
      errorLog('sendingMessage', error);
    }
  };

  const openMediaPicker = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.video, DocumentPicker.types.images],
        allowMultiSelection: false,
        copyTo: 'cachesDirectory',
      });
      console.log('res', res);
      if (res.length > 0) {
        let assetsArr = res.map((item) => {
          let fileObj = {
            fileName: item.name,
            type: item.type.split('/')[0],
            uri: item.fileCopyUri,
          };
          if (item.type.split('/')[0] == 'video') {
            fileObj['uri'] = decodeURIComponent(item.fileCopyUri);
          }
          return fileObj;
        });
        setAssets(assetsArr);
        setViewOnly(false);
      }
    } catch (err) {
      // defaultAlert();
      console.log('err', err);
    }
  };

  const renderChats = ({currentMessage: item, nextMessage}) => {
    const myMessage = item.user._id === userProfile.userId;
    const isSameDay = nextMessage.createdAt
      ? moment(item.createdAt).isSame(nextMessage.createdAt, 'date')
      : true;

    let isFirstMessage =
      item._id == chatArr.current[chatArr.current?.length - 1]._id;

    if (Object.keys(item.deletedBy || {}).length > 0) {
      if (item.deletedBy[userProfile.userId] == true) {
        isDeleted = true;
      }
    }

    return (
      <View key={item._id}>
        {isFirstMessage && (
          <Text style={styles.day}>{moment(item.createdAt).format('LL')}</Text>
        )}
        <TouchableOpacity
          onPress={() => {
            if (selectedMessage?.id == item._id) {
              setSelectedMessage();
            } else {
              setAssets(item.assets);
              setViewOnly(true);
            }
          }}
          onLongPress={() => {
            setSelectedMessage({id: item._id, index: item.index});
          }}
          style={[
            styles.messageCont,
            myMessage ? {alignItems: 'flex-end'} : {alignItems: 'flex-start'},
            selectedMessage?.id == item._id && {
              backgroundColor: 'rgba(189,197,198,0.5)',
            },
          ]}>
          {item.assets?.length > 0 ? (
            <MessageMedia assets={item.assets} />
          ) : null}
          {item.text ? (
            <View
              style={[
                styles.messageTextCont,
                myMessage
                  ? {borderTopRightRadius: 0, borderTopLeftRadius: scale(100),

                    backgroundColor: 'rgb(25, 33, 76)'
                  }
                  : {
                      borderTopRightRadius: scale(100),
                      borderTopLeftRadius: 0,
                      backgroundColor: 'rgb(232, 232, 232)'
                    },
              ]}>
              <Text style={myMessage ? styles.text4White :  styles.text4}>{item.text}</Text>
            </View>
          ) : null}
          <Text
            style={[
              styles.msgTime,
              {alignSelf: myMessage ? 'flex-end' : 'flex-start'},
              !item.text && {marginTop: 0},
            ]}>
            {moment(item.createdAt).format('LT')}
          </Text>
        </TouchableOpacity>

        {!isSameDay && (
          <Text style={styles.day}>
            {moment(nextMessage.createdAt).format('LL')}
          </Text>
        )}
      </View>
    );
  };

  const renderTextInput = () =>
    !err ? (
      <View style={styles.typeBox}>
        <Input
          ref={inputRef}
          value={chatInput}
          onChangeText={(val) => setChatInput(val)}
          containerStyle={styles.inputContainerStyle}
          inputContainerStyle={{borderBottomWidth: 0}}
          inputStyle={styles.inputText}
          placeholder="Type here..."
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}>
          {/* <TouchableOpacity onPress={openMediaPicker}>
            <Icon
              type="ionicon"
              name="attach-outline"
              color="#000000"
              size={vScale(20)}
              style={{transform: [{rotate: '45deg'}]}}
            />
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.sendBtn}
            onPress={() => {
              if (chatInput == '') return;
              sendMessageHandler(chatInput);
              setChatInput('');
            }}>
            <Icon
              type="ionicon"
              name="send"
              color="#000000"
              size={vScale(16)}
              style={{transform: [{rotate: '-45deg'}]}}
            />
          </TouchableOpacity>
        </View>
      </View>
    ) : null;

  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: '#ECB968',
      }}>
      <View style={styles.chatContainer}>
        <GiftedChat
          messages={chats}
          user={{
            _id: userProfile.userId,
          }}
          loadEarlier={lastDoc ? true : false}
          onLoadEarlier={getMoreMessages}
          renderMessage={renderChats}
          // inverted={false}
          renderInputToolbar={renderTextInput}
          minInputToolbarHeight={vScale(96)}
          minComposerHeight={vScale(96)}
        />
      </View>
      {err && (
        <View
          style={{
            position: 'absolute',
            top: vScale(-40),
            bottom: 0,
            right: 0,
            left: 0,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: scale(20),
          }}>
          <Text
            style={{...tStyle('400', 22, 30, '#777777'), textAlign: 'center'}}>
            Unable to connect at the moment. Please try again later.
          </Text>
        </View>
      )}
      <Modal
        visible={assets?.length > 0}
        onRequestClose={() => {
          setAssets();
        }}>
        <MessagePreview
          assets={assets}
          closeModal={() => {
            setAssets();
          }}
          combinedId={combinedId}
          sendMessageHandler={sendMessageHandler}
          viewOnly={viewOnly}
        />
      </Modal>
      {chats.length === 0 && !isFocused && null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    paddingHorizontal: scale(12),
    paddingVertical: vScale(12),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarBg: {
    height: vScale(56),
    width: vScale(56),
    borderRadius: vScale(56),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginRight: scale(8),
    overflow: 'hidden',
  },
  text1: {
    ...tStyle('400', 24, 30, '#333333'),
  },
  text2: {
    ...tStyle('500', 12, 15, '#333333'),
    marginLeft: scale(4),
  },
  text5: {
    ...tStyle('500', 12, 15, '#EB5757'),
    marginLeft: scale(4),
  },
  text5a: {
    ...tStyle('500', 12, 15, '#333333CC'),
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: vScale(10),
  },
  imgWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: scale(84),
    width: scale(84),
    borderRadius: scale(150),
    borderColor: '#fff',
  },
  wrapper: {
    alignSelf: 'center',
    paddingVertical: vScale(20),
    position: 'absolute',
    top: vScale(235),
  },
  typeBox: {
    width: scale(320),
    height: vScale(56),
    alignSelf: 'center',
    // position: 'absolute',
    marginBottom: vScale(18),
    bottom: vScale(-16),
    borderRadius: scale(12),
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    borderWidth: 1,
  },
  inputContainerStyle: {
    width: '77%',
    alignItems: 'center',
    height: vScale(40),
    paddingLeft: 0,
    paddingTop: Platform.OS == 'ios' ? vScale(2) : 0,
  },
  inputText: {
    ...tStyle('500', 16, 22.4, '#333333'),
    // alignSelf: 'center',
    textAlignVertical: 'bottom',
  },
  sendBtn: {
    backgroundColor: '#F5F7FB',
    height: scale(40),
    width: scale(40),
    borderRadius: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginLeft: scale(5),
  },
  text3: {
    ...tStyle('500', 16, 22.4, '#000000'),
    alignSelf: 'center',
  },
  suggestionBox: {
    width: '100%',
    height: vScale(48),
    position: 'absolute',
    bottom: vScale(82),
  },
  suggestedChat: {
    height: vScale(48),
    paddingHorizontal: scale(12),
    borderRadius: scale(100),
    backgroundColor: '#EDF7F8',
    marginHorizontal: scale(5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  text4: {
    ...tStyle('500', 12, 15.6, '#333333'),
  },
  text4White: {
    ...tStyle('500', 12, 15.6, '#ffffff'),
  },
  messageCont: {
    paddingTop: vScale(10),
    paddingBottom: vScale(8),
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: scale(16),
    paddingLeft: scale(20),
  },
  messageTextCont: {
    minHeight: vScale(18),
    maxWidth: scale(264),
    borderRadius: scale(100),
    paddingLeft: scale(18),
    paddingRight: scale(12),
    paddingVertical: vScale(16),
    borderTopRightRadius: 0,
    backgroundColor: '#EDF7F8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  msgTime: {
    fontSize: 8,
    color: '#89898D',
    marginTop: vScale(8),
    // marginHorizontal: scale(28),
  },
  day: {
    fontSize: 14,
    color: '#89898D',
    alignSelf: 'center',
    marginVertical: vScale(8),
  },
  btnWrapper: {
    width: scale(328),
    height: vScale(37),
    marginBottom: vScale(6),
    flexDirection: 'row',
    marginLeft: scale(16),
  },
  declineBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFF0F0',
    flex: 1,
    borderTopLeftRadius: scale(8),
    borderBottomLeftRadius: scale(8),
  },
  acceptBtn: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAFFEA',
    flex: 1,
    borderTopRightRadius: scale(8),
    borderBottomRightRadius: scale(8),
  },
  declineText: {
    ...tStyle('500', 14, 18.8, '#D23535'),
    marginLeft: scale(4),
  },
  acceptText: {
    ...tStyle('500', 14, 18.8, '#25CB71'),
    marginLeft: scale(4),
  },
});

export default SingleChat;

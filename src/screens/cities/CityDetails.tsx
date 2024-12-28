import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import { Icon } from 'react-native-elements';
import { useSelector } from 'react-redux';

import ModalDropdown from 'react-native-modal-dropdown';
import { getFriends } from '../../backend/friends';
import PostCardAdmin from '../../components/AdminPostCard';
import EmptyListText from '../../components/emptyListText';
import EventPostCard from '../../components/EventPostCard';
import Header from '../../components/header';
import PostCard from '../../components/postCard';
import { mScale, scale, vScale } from '../../configs/size';
import { tStyle } from '../../configs/textStyle';
import ErrorLog, { defaultAlert } from '../../Constants/errorLog';
import Utility from '../../utils/Utility';

const NumPosts = 100;

export const renderInitials = (name) => {
  if (name) {
    if (name?.split(' ')?.length > 1 && name?.split(' ')[1] != '')
      return `${name[0]}${name.split(' ')[1][0]}`.toUpperCase();
    else return name[0];
  } else {
    return 'AA';
  }
};


const CityDetails = ({navigation, route}) => {
  const [movement, setMovement] = useState({});
  const [movementId, setMovementId] = useState(route.params?.id || '');
  const [friendsList, setFriendsList] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [postFetched, setPostFetched] = useState([]);
  const [postDiscusseionFetched, setPostDiscusseionFetched] = useState([]);
  const [evcentsFetched, setEvcentsFetched] = useState([]);


  const [eventFetched, setEventFetched] = useState([]);
  const [inputContent, setInputContent] = useState('Write something....');
  const [followDetails, setFollowDetails] = useState({
    isLiked: false,
    isFollowed: false,
    isInvited: false,
    inviteStatus: '',
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [allowPost,setAllowPost] = useState(false);
  const [checkedTab,setCheckedTab] = useState(1);

  const [checkedLifeTab,setCheckedLifeTab] = useState(1);
  const [checkedTodayTab,setCheckedTodayTab] = useState(1);
  const [tick, setTick] = useState(0);
  const [lastDoc, setLastDoc] = useState();
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const[movementEnded,setMovementEnded] = useState(false);

  const userProfile = useSelector((state) => state.user.userProfile);
  

  useEffect(() => {

    if (!movementId || !movement) return;
    updateViews(userProfile.userId,movementId);
    getFriends(userProfile.userId)
      .then((res) => {
        var tempArr = [];
        res.forEach((entry) => {
          entry.userData.forEach((user) => {
            if (user.userId != userProfile.userId) tempArr.push(user);
          });
        });
        setFriendsList(tempArr);
      })
      .catch((err) => console.log('error', err));
  }, []);


  const updateViews = async(userId,movementId)=>{
    try {

      await firestore().runTransaction(async (transaction) => {
        const movmentRef = firestore().collection('Movements').doc(movementId);
        const viewRef = movmentRef.collection('Views').doc(userId);
        const snap = await transaction.get(viewRef);
        if (!snap.exists) {
          // transaction.update(movmentRef, {
          //   viewCount: firestore.FieldValue.increment(1),
          // });
          transaction.set(viewRef, {
            id: userId,
  
          });
        }
      });
    } catch (error) {
      errorLog('liking clip', error);
    }
}
  const isMovementEnded = async(movement) =>{
    const movmentEndDate = await movement?.end_date?.seconds*1000;
    const isallowPost = await movement.allowPost;
    if(isallowPost){
      setAllowPost(isallowPost);
    }
    const currentdate= new Date().getTime();
    if(currentdate<movmentEndDate){
      setMovementEnded(false);
    }else{
      setMovementEnded(true);
    }
  }

  
  const  feedData = [
    {
      id: '1',
      title: 'Life',
    },
    {
      id: '2',
      title: 'Today',
      
    },
    {
      id: '3',
      title: 'Events',
      
    },
  ];
  const  lifeTabs = [
    {
      id: '1',
      title: 'Eats+Drinks',
    },
    {
      id: '2',
      title: 'Bars & Lounges',
      
    },
    {
      id: '3',
      title: 'Nightlife',
      
    },
    {
      id: '4',
      title: 'Coffee & Tea',
      
    },
    {
      id: '5',
      title: 'Shopping',
      
    },
    {
      id: '6',
      title: 'Hotels & Travels',
      
    },
    {
      id: '7',
      title: 'Arts & Entertainment',
      
    },
    {
      id: '8',
      title: 'Style+Beauty',
      
    },
    {
      id: '9',
      title: 'Arts & Entertainment',
      
    },
    {
      id: '10',
      title: 'Arts & Entertainment',
      
    },
  ];

  const  todayTabs = [
    {
      id: '1',
      title: 'Now',
    },
    {
      id: '2',
      title: 'Business',
      
    },
    {
      id: '3',
      title: 'Politics',
      
    },
    {
      id: '4',
      title: 'Technology',
      
    },
    {
      id: '5',
      title: 'Games',
      
    },
    {
      id: '6',
      title: 'Science',
      
    },
    {
      id: '7',
      title: 'Health+Fitness',
      
    },
    {
      id: '8',
      title: 'Style+Beauty',
      
    },
    {
      id: '9',
      title: 'Shopping',
      
    },
    {
      id: '10',
      title: 'Sports',
      
    },
    {
      id: '11',
      title: ' Lifestyle+Entertainment',
      
    },
    {
      id: '12',
      title: 'Questions',
      
    },
    {
      id: '13',
      title: 'News',
      
    },
    
  ];
  const handleSubCategoryPressed = (id)=>{
    if (checkedTab == 1){
      setCheckedLifeTab(id)
      }else{
       setCheckedTodayTab(id)
      }
       
     }
  const Item = ({ title,image,id }) => (
    <View style={{flex:1,margin:10}}> 
        <TouchableOpacity
        style={[checkedTab==id ? styles.selectedTab : styles.unSelectedTab]}
        onPress={()=> setCheckedTab(id) }
        >
        <Text style={{color:'#fff'}}>{title}</Text>
        </TouchableOpacity>
     </View>
    
    
  );
  const SubItem = ({ title,image,id }) => {
    var index = 0
    if (checkedTab == 1){
      index = checkedLifeTab
      }else{
        index = checkedTodayTab
      }
   return (
  

    <View style={{flex:1,margin:10}}> 
        <TouchableOpacity
        style={[index==id ? styles.selectedTab : styles.unSelectedTab]}
        onPress={ ()=>{handleSubCategoryPressed(id)} }
        >
        <Text style={{color:'#fff'}}>{title}</Text>
        </TouchableOpacity>
     </View>
    
    
  )
};
  
  const renderSubTabsItem = ({ item }) => (
    <SubItem title={item.title}  id={item.id}/>
  );
    const renderItem = ({ item }) => (
      <Item title={item.title}  id={item.id}/>
    );
  useEffect(() => {
  
    if (!movementId || !movement) return;
    var tempArr = [];
    isMovementEnded(movement);
    

    friendsList.forEach((user) => {
      firestore()
        .collection('Follows')
        .where('identifiers', 'array-contains', `${user.userId}_${movement.id}`)
        .onSnapshot(
          (snap) => {
            if (snap.docs.length > 0) {
              const followData = snap.docs[0].data();
              console.log('data', followData?.entityInfo);
              var followDetails = {
                isLiked: followData?.entityInfo?.status === 'following',
                isFollowed:
                  followData?.entityInfo?.status === 'following' &&
                  followData?.entityInfo?.canPost,
                isInvited: true,
                inviteStatus: followData?.entityInfo?.status,
              };
              console.log('details', followDetails);
              tempArr.push({...user, ...followDetails});
            } else {
              var followDetails = {
                isLiked: false,
                isFollowed: false,
                isInvited: false,
                inviteStatus: '',
              };
              console.log('idk');
              tempArr.push({...user, ...followDetails});
            }
          },
          (err) => console.log('error', err),
        );
    });
    setFilteredFriends(tempArr);
  }, [friendsList]);

  const fetchMovementDetails = useCallback(() => {
    if (!movementId || !movement) return;
    firestore()
      .collection('Movements')
      .doc(movementId)
      .onSnapshot(
        (snap) => {
          if (snap.data()?.adminInfo?.id == userProfile.userId) {
            
            setIsAdmin(true);
          }
          console.log(snap.data());
          setMovement(snap.data());
        },
        (err) => console.log('error', err),
      );
  }, [movementId]);

  useEffect(fetchMovementDetails, [fetchMovementDetails]);

  const renderCount = (count) => {
    if (count > 1000 && count < 1000000) return count * 0.001 + 'k';
    if (count > 999999) return count * 0.000001 + 'm';
    else return count;
  };
  const checkMovementEnded=(datetime)=>{
    var currentDateTime = new Date();
    // if(date1.getTime() === date2.getTime()){
      //same date
    // }
  }

  const fetchPosts = () => {
    if (!movementId || !movement) return;
    const matchId = movement.id+'_'+movement?.adminInfo?.id;

      return firestore()
      .collection('Posts')
      .where('movementData.id', '==', movementId)
      .where('isHidden', '==', false)
      .orderBy('date', 'desc')
      .limit(NumPosts)
      .onSnapshot(
        (snapshot) => {
          let tempArr = [];
          if (snapshot.docs.length == NumPosts) {
            setLastDoc(snapshot.docs[NumPosts - 1]);
          }
          snapshot.docs.forEach((doc) =>
            tempArr.push({...doc.data(), id: doc.id, updatedAt: Date.now()}),
          );
          
          var adminPost = tempArr.filter(data => data.user == matchId);
          var discussionPost = tempArr.filter(data => data.user != matchId);

          setPostFetched(adminPost);
          setPostDiscusseionFetched(discussionPost);
        },
        (err) => console.log('error while getting posts', err),
      );
    // }
    
  };

  const fetchEvents = () => {
    
    if (!movementId || !movement) return;
    const tempArr = [];
    const ref = firestore().collection('Movements').doc(movementId);
    // const muteRef = ref.collection('Mutes').doc(this.state.userId);
    return ref
      .collection('Events')
      // .where('movementData.id', '==', movementId)
      // .where('isHidden', '==', false)
      // .orderBy('date', 'desc')
      .limit(NumPosts)
      .onSnapshot(
        (snapshot) => {
          let tempArr = [];
          
          if (snapshot.docs.length == NumPosts) {
            setLastDoc(snapshot.docs[NumPosts - 1]);
          }
          snapshot.docs.forEach((doc) =>
            tempArr.push({...doc.data(), id: doc.id, updatedAt: Date.now()}),
          );
          for(let i = 0; i < tempArr.length; i++){
            if(tempArr[i].eventUrl != ''){
              tempArr[i].storyAssets = [{
                "aspectRatio": 0.9191489361702128,
                "duration": 5, "type": "image", "url":tempArr[i].eventUrl
              }];
            }
            
          }
          
          setEvcentsFetched(tempArr);
        },
        (err) => console.log('error while getting Events', err),
      );
  };

  useEffect(() => {
    fetchEvents();
    const unsub = fetchPosts();

    return () => {
      if (typeof unsub == 'function') unsub();
    };
  }, [movement]);

  const fetchMorePosts = () => {
    if (!movementId || !movement) return;
    if (!lastDoc) {
      return;
    }
    firestore()
      .collection('Posts')
      .where('movementData.id', '==', movementId)
      .where('isHidden', '==', false)
      .orderBy('date', 'desc')
      .limit(NumPosts)
      .get()
      .then((snapshot) => {
        if (snapshot.docs.length == NumPosts) {
          setLastDoc(snapshot.docs[NumPosts - 1]);
        }
        snapshot.docs.forEach((doc) =>
          tempArr.push({...doc.data(), id: doc.id}),
        );
        setPostFetched(tempArr);
      })
      .catch((err) => {
        ErrorLog(`getting more posts, ${err}`);
      });
  };

  const checkLiked = useCallback(() => {
    if (!movementId || !movement) return;
    firestore()
      .collection('Follows')
      .where(
        'identifiers',
        'array-contains',
        `${userProfile.userId}_${movement.id}`,
      )
      .onSnapshot(
        (snap) => {
          if (snap.docs.length > 0) {
            const followData = snap.docs[0].data();
            // console.log('data', followData);
            setFollowDetails({
              isLiked: followData?.entityInfo?.status === 'following',
              isFollowed:
                followData?.entityInfo?.status === 'following' &&
                followData?.entityInfo?.canPost,
              isInvited: true,
              inviteStatus: followData?.status,
            });
            setTick(tick + 1);
          }
        },
        (err) => console.log('error', err),
      );
  }, [movement, movementId]);

  useEffect(checkLiked, [checkLiked]);

  const followMovement = async () => {
    if (!followDetails.isLiked) await likeMovement(true);
    else {
      const id1 = userProfile.userId;
      const id2 = movement.id;
      try {
        var batch = firestore().batch();
        var followSnap = await firestore()
          .collection('Follows')
          .where('identifiers', 'array-contains', `${id1}_${id2}`)
          .get();
        var followRef = firestore()
          .collection('Follows')
          .doc(followSnap.docs[0].id);
        var movementSnap = await firestore()
          .collection('Movements')
          .doc(id2)
          .get();
        batch.update(followRef, {
          'entityInfo.canPost': true,
          'is_movement':true
        });
        batch.update(movementSnap.ref, {
          followedCount: firestore.FieldValue.increment(1),
        });
        return batch.commit();
      } catch (error) {
        console.log('error while follow', error);
      }
    }
  };

  const likeMovement = async (postRights = false) => {
    const id1 = userProfile.userId;
    const id2 = movement.id;
    const id3 = movement.adminInfo.id;
    const payload = {
      identifiers: [`${id1}_${id2}`, `${id2}_${id1}`],
      users: [id1, `${id2}_${id3}`],
      userData: [
        {
          userId: id1,
          profileUrl: userProfile.profileUrl || null,
          displayName: `${userProfile?.firstName} ${userProfile?.lastName}`,
        },
        {
          userId: id2,
          profileUrl: movement.profileUrl || null,
          displayName: movement.title,
        },
        {
          userId: id3,
          profileUrl: movement.adminInfo.profileUrl || null,
          displayName: movement.adminInfo.name,
        },
      ],
      isFollowedByOtherUser: {
        [id1]: false,
        [id2]: true,
      },
      isFollowingOtherUser: {
        [id1]: true,
        [id2]: false,
      },
      entityInfo: {
        invitedBy: {
          id: null,
          name: null,
          profileUrl: null,
        },
        name: movement.title,
        id: movement.id,
        profileUrl: movement.profileUrl || null,
        status: 'following',
        canPost: postRights,
        type: 'movement',
      },
    };
    try {
      var batch = firestore().batch();
      var followRef = firestore().collection('Follows').doc();
      var movementSnap = await firestore()
        .collection('Movements')
        .doc(id2)
        .get();
      batch.set(followRef, payload);
      batch.update(movementSnap.ref, {
        likedCount: firestore.FieldValue.increment(1),
      });
      if (postRights)
        batch.update(movementSnap.ref, {
          followedCount: firestore.FieldValue.increment(1),
        });
      return batch.commit();
    } catch (error) {
      console.log('error while follow', error);
    }
  };

  const unLikeMovement = async () => {
    const id1 = userProfile.userId;
    const id2 = movement.id;
    try {
      var batch = firestore().batch();
      var followSnap = await firestore()
        .collection('Follows')
        .where('identifiers', 'array-contains', `${id1}_${id2}`)
        .get();
      var followRef = firestore()
        .collection('Follows')
        .doc(followSnap.docs[0].id);
      var movementSnap = await firestore()
        .collection('Movements')
        .doc(id2)
        .get();
      batch.delete(followRef);
      batch.update(movementSnap.ref, {
        likedCount: firestore.FieldValue.increment(-1),
      });
      if (followDetails.isFollowed)
        batch.update(movementSnap.ref, {
          followedCount: firestore.FieldValue.increment(-1),
        });
      setFollowDetails({
        isLiked: false,
        isFollowed: false,
        isInvited: false,
        inviteStatus: '',
      });
      return batch.commit();
    } catch (error) {
      console.log('error while follow', error);
    }
  };

  const unFollowMovement = async () => {
    const id1 = userProfile.userId;
    const id2 = movement.id;
    try {
      var batch = firestore().batch();
      var followSnap = await firestore()
        .collection('Follows')
        .where('identifiers', 'array-contains', `${id1}_${id2}`)
        .get();
      var followRef = firestore()
        .collection('Follows')
        .doc(followSnap.docs[0].id);
      var movementSnap = await firestore()
        .collection('Movements')
        .doc(id2)
        .get();
      batch.update(followRef, {
        'entityInfo.canPost': false,
      });
      batch.update(movementSnap.ref, {
        followedCount: firestore.FieldValue.increment(-1),
      });
      setFollowDetails({
        isLiked: true,
        isFollowed: false,
        isInvited: true,
        inviteStatus: 'followed',
      });
      return batch.commit();
    } catch (error) {
      console.log('error while follow', error);
    }
  };

  const inviteToMovement = async (invitedUser) => {
    const id1 = invitedUser.userId;
    const id2 = movement.id;
    const id3 = movement.adminInfo.id;
    const payload = {
      identifiers: [`${id1}_${id2}`, `${id2}_${id1}`],
      users: [id1, `${id2}_${id3}`],
      userData: [
        {
          userId: id1,
          profileUrl: invitedUser.profileUrl || null,
          displayName: invitedUser.displayName || '',
        },
        {
          userId: id2,
          profileUrl: movement.profileUrl || null,
          displayName: movement.title,
        },
        {
          userId: id3,
          profileUrl: movement.adminInfo.profileUrl || null,
          displayName: movement.adminInfo.name,
        },
      ],
      isFollowedByOtherUser: {
        [id1]: false,
        [id2]: false,
      },
      isFollowingOtherUser: {
        [id1]: false,
        [id2]: false,
      },
      entityInfo: {
        invitedBy: {
          id: userProfile.userId,
          name: `${userProfile?.firstName} ${userProfile?.lastName}`,
          profileUrl: userProfile?.profileUrl || null,
        },
        name: movement.title,
        id: movement.id,
        profileUrl: movement.profileUrl || null,
        status: 'pending',
        canPost: true,
        type: 'movement',
      },
    };
    try {
      var followRef = firestore().collection('Follows').doc();
      await followRef.set(payload);
      var tempArr = filteredFriends;
      const index = tempArr.indexOf(invitedUser);
      tempArr.splice(index, 1);
      setFilteredFriends(tempArr);
      setTick(tick + 1);
      const ref = firestore().collection('Users').doc(id1);
    const notificationRef = ref.collection('Notification').doc();
    const batch = firestore().batch();
    
    batch.set(notificationRef, {
      id: notificationRef.id,
      type: 'MOVEMENT_INVITE',
      displayName: movement.adminInfo.name,
      profileUrl: movement.adminInfo.profileUrl || null,
      senderId: id3,
      text: movement.adminInfo.name + ' invited you to join Movement',
      postId: id2,
      date: new Date()
    });
    await batch.commit();
    } catch (error) {
      console.log('error while follow', error);
    }
  };

  const onSelectOptions = async (index, value) => {
    if (value == 'Edit') {
      navigation.navigate('CreateActivism', {movInfo: movement});
    }
    else if (value == 'Create Event') {
      navigation.navigate('CreateEvent', {movInfo: null,username:movement.username,movementId:movement.id});
    }
    else if (value == 'Delete') {
      const id = movement.id;
      try {
        setMovementId('');
        setMovement({});
        setDropdownLoading(true);
        var batch = firestore().batch();
        var followSnap = await firestore()
          .collection('Follows')
          .where('users', 'array-contains', `${id}_${movement.adminInfo.id}`)
          .get();
        followSnap.docs.map((doc) => batch.delete(doc.ref));
        batch.delete(firestore().collection('Movements').doc(id));
        await batch.commit();
        setDropdownLoading(false);
        navigation.navigate('CityList');
      } catch (error) {
        setDropdownLoading(false);
        defaultAlert();
        console.log('error while follow', error);
      }
    } else {
      navigation.navigate('Followers', {movId: movementId});
    }
  };

  const renderDropdownRow = (item) => (
    <View>
      <Text
        style={{
          color: 'gray',
          fontSize: mScale(14),
          alignSelf: 'flex-start',
          paddingVertical: vScale(6),
          paddingHorizontal: scale(5),
        }}>
        {item}
      </Text>
    </View>
  );

  
  const deletePost = async (docId, hashtags) => {
    console.log(docId, hashtags);
    try {
      if (hashtags && hashtags.length) {
        hashtags.forEach((item) => {
          firestore()
            .collection('Hashtags')
            .where('title', '==', item)
            .get()
            .then((snap) => {
              const count = snap.docs[0].data()?.count;
              const hashId = snap.docs[0].id;
              const hashRef = firestore().collection('Hashtags').doc(hashId);
              if (count > 0)
                return hashRef.update({
                  count: firestore.FieldValue.increment(-1),
                  date: new Date().getTime(),
                });
              else return hashRef.delete();
            });
        });
      }
      await firestore().collection('Posts').doc(docId).delete();
      if (postFetched?.length <= 0) {
        return;
      }
      const tempArr = [...postFetched];
      const postIndex = tempArr.findIndex((item) => item.id == docId);
      tempArr.splice(postIndex, 1);
      console.log(tempArr.length);
      setPostFetched(tempArr);
    } catch (error) {
      console.log('deleting post', error);
    }
  };

  const OpenURLButton = ({ url, children }) => {
    let urlToOpen = url;
    if (urlToOpen && !urlToOpen.includes('http')) {
      urlToOpen = 'https://'+ urlToOpen;
    }
    const handlePress = useCallback(async () => {
      // const supported = await Linking.canOpenURL(url);

      try{
      // if (supported) {
        await Linking.openURL(urlToOpen);
      // } else {
      //   alert(`Don't know how to open this URL: ${url}`);
      // }
    }catch(Error){
      alert('Given web link is not valid : '+urlToOpen)
    }
    }, [url]);
    return <Text onPress={handlePress}  style={{ fontSize: mScale(14),marginLeft: scale(10),textDecorationLine: "underline",textDecorationStyle: "solid",textDecorationColor: "#000",color: '#878585',}}>{url || ''}</Text>;
  };

  const renderPageHeader = () => (
    <>
      {movement?.coverUrl ? (
        <Image
          source={{uri: movement?.coverUrl}}
          style={{height: vScale(165), width: '100%'}}
        />
      ) : (
        <View style={styles.banner} />
      )}
      <View style={styles.profileWrapper}>
        <View style={styles.movementsLogo}>
          {movement?.profileUrl ? (
            <Image
              source={{uri: movement?.profileUrl}}
              style={{height: '100%', width: '100%'}}
              resizeMode="cover"
            />
          ) : (
            <Text style={{fontSize: mScale(24)}}>
              {movement?.title ? renderInitials(movement?.title) : ''}
            </Text>
          )}
        </View>
        <View style={{marginLeft: scale(10), width: scale(150)}}>
          <Text style={{fontSize: mScale(18)}}>{movement?.title}</Text>
          <Text style={{color: '#878585'}}>{movement?.username}</Text>
        </View>
        {isAdmin ? (
          <View>
            <View style={styles.dropDown}>
              {dropdownLoading ? (
                <ActivityIndicator size={'small'} color="blue" />
              ) : (
                <ModalDropdown
                  options={['Edit', 'Create Event', 'Followers', 'Delete']}
                  dropdownStyle={{
                    width: scale(100),
                    height: Platform.OS == 'ios' ? vScale(110) : vScale(120),
                    marginLeft: scale(0),
                    padding: 0,
                    margin: 0,
                    // flexWrap: 1,
                  }}
                  // ref={this.privacy}
                  defaultValue={'Options'}
                  style={{
                    height: vScale(25),
                    width: scale(108),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  textStyle={{
                    color: 'gray',
                    fontSize: 14,
                  }}
                  onSelect={onSelectOptions}
                />
              )}
            </View>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => setShowModal(true)}>
              <Text style={{color: '#fff'}}>Invite People +</Text>
            </TouchableOpacity>
            {/* {movementEnded && (
              <View
                style={{}}>
                <Text style={{color: 'red', fontWeight: '500'}}>Event Ended</Text>
              </View>
            )} */}
            
          </View>
        ) : (
          <View style={styles.iconWrapper}>
            <View style={{flexDirection: 'row'}}>
              {followDetails.isLiked ? (
                <TouchableOpacity style={styles.btn} onPress={unLikeMovement}>
                  <Text style={{color: '#fff'}}>Liked</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.iconBg}
                  onPress={() => likeMovement(false)}>
                  <Icon
                    name="thumbs-up"
                    type="ionicon"
                    size={vScale(12)}
                    color="#1e2348"
                  />
                </TouchableOpacity>
              )}
              {followDetails.isFollowed ? (
                <TouchableOpacity style={styles.btn} onPress={unFollowMovement}>
                  <Text style={{color: '#fff'}}>Following</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.iconBg}
                  onPress={followMovement}>
                  <Icon
                    name="person-add"
                    type="ionicon"
                    size={vScale(12)}
                    color="#1e2348"
                  />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => setShowModal(true)}>
              <Text style={{color: '#fff'}}>Invite People +</Text>
            </TouchableOpacity>
            {/* {movementEnded && (

              <View
                style={{}}>
                <Text style={{color: 'red', fontWeight: '500'}}>Event Ended</Text>
              </View>
            )} */}
          </View>
        )}
      </View>
      <View style={styles.actions}>
        <View style={styles.row}>
          <Icon
            name="list-outline"
            type="ionicon"
            size={vScale(20)}
            color="#878585"
          />
          <Text style={styles.text1}>{movement?.description || ''}</Text>
        </View>
        <View style={styles.row}>
          <Icon
            name="people-outline"
            type="ionicon"
            size={vScale(20)}
            color="#878585"
          />
          <Text style={styles.text1}>
            {renderCount(movement?.followedCount || 0)} followers
          </Text>
        </View>
        <View style={styles.row}>
          <Icon
            name="thumbs-up"
            type="ionicon"
            size={vScale(20)}
            color="#878585"
          />
          <Text style={styles.text1}>
            {renderCount(movement?.likedCount || 0)} likes
          </Text>
        </View>
        <View style={styles.row}>
          <Icon
            name="location-outline"
            type="ionicon"
            size={vScale(20)}
            color="#878585"
          />
          <Text style={styles.text1}>{movement?.location || ''}</Text>
        </View>
        <View style={styles.row}>
          <Icon
            name="globe-outline"
            type="ionicon"
            size={vScale(20)}
            color="#878585"
          />
          
            {/* {movement?.website && ( */}
              <TouchableOpacity >

              <OpenURLButton url={movement?.website}>Open Supported URL</OpenURLButton>


              {/* <Text  style={{ 
    fontSize: mScale(14),
    marginLeft: scale(10),
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
    textDecorationColor: "#000",
    color: '#878585',
    
    }}>{movement?.website || ''}</Text> */}
              </TouchableOpacity>
          {/* )} */}
          
        </View>
        <View style={styles.row}>
          {/* <Icon
            name="mail-outline"
            type="ionicon"
            size={vScale(5)}
            color="#878585"
          /> */}
                          <Image style={{height:20,width:20}} source={require('../../assets/category.png')} />

          <Text style={styles.text1}>{movement?.category || ''}</Text>
        </View>
        <View style={styles.row}>
          <Icon
            name="mail-outline"
            type="ionicon"
            size={vScale(20)}
            color="#878585"
          />
          <Text style={styles.text1}>{movement?.email || ''}</Text>
        </View>
      </View>
      {((followDetails.isFollowed && allowPost && checkedTab==2) || (isAdmin && checkedTab==1)) && (
        <TouchableOpacity
          style={[styles.actions, styles.row]}
          activeOpacity={1}
          onPress={() =>
            navigation.navigate('UploadPost', {
              entityObj: {
                entityType: 'movement',
                movementData: {
                  id: movementId,
                  title: movement?.title,
                  profileUrl: movement?.profileUrl,
                },
                adminData: movement?.adminInfo,
              },
            })
          }>
          {movement?.profileUrl ? (
            <Image
              source={{uri: movement?.profileUrl}}
              resizeMode="cover"
              style={{height: vScale(41), width: scale(51)}}
            />
          ) : (
            <View style={[styles.avatar]}>
              <Text>
                {movement?.title ? renderInitials(movement?.title) : ''}
              </Text>
            </View>
          )}
          <Text style={styles.text1} numberOfLines={1}>
            {inputContent}
          </Text>
        </TouchableOpacity>
      )}
      <View style={{
        flex:1,
        width: '100%',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
        alignContent:'center',
        alignItems:'center',
      }}>
        <FlatList
          horizontal={true}
          data={feedData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={{marginTop:5,marginBottom:5}}
        />
         <FlatList
          horizontal={true}
          data={checkedTab == 1 ? lifeTabs:todayTabs}
          renderItem={renderSubTabsItem}
          keyExtractor={item => item.id}
          style={{marginTop:5,marginBottom:5}}
        />
      </View>
    </>
  );

  if (!movement)
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Header navigation={navigation} />
        <View
          style={{
            position: 'absolute',
            top: vScale(313),
          }}>
          <Text>This movement doesn't exist.</Text>
        </View>
      </View>
    );
  else
    return (
      <View style={styles.container}>
        <Header navigation={navigation} />
        {(checkedTab == 1 && 
        <FlatList
          data={postFetched}
          style={{flex: 1}}
          ListHeaderComponent={renderPageHeader}
          renderItem={({item, index}) => {
            let showDelete = false;
            if (item?.user?.split('_').length > 1) {
              if (item.user?.split('_')[1] == userProfile.userId) {
                showDelete = true;
              }
            }
            return (
              <PostCardAdmin
                data={item}
                index={index}
                openComment={() => {}}
                navigation={navigation}
                deletePost={
                  showDelete
                    ? (docId, hashtags) => deletePost(docId, hashtags)
                    : null
                }
                reportPost={true}
              />
            );
          }}
          onEndReachedThreshold={0.5}
          onEndReached={fetchMorePosts}
          keyExtractor={(item) => item.id}
        />
        )}
        {(checkedTab == 2 && 
        <FlatList
          data={postDiscusseionFetched}
          style={{flex: 1}}
          ListHeaderComponent={renderPageHeader}
          renderItem={({item, index}) => {
            let showDelete = false;
            if (item?.user?.split('_').length > 1) {
              if (item.user?.split('_')[1] == userProfile.userId) {
                showDelete = true;
              }
            }
            return (
              <PostCard
                data={item}
                index={index}
                openComment={() => {}}
                navigation={navigation}
                deletePost={
                  showDelete
                    ? (docId, hashtags) => deletePost(docId, hashtags)
                    : null
                }
                reportPost={true}
              />
            );
          }}
          onEndReachedThreshold={0.5}
          onEndReached={fetchMorePosts}
          keyExtractor={(item) => item.id}
        />
        )}

      {(checkedTab == 3 &&
      
        // <View>
        //   <Text>hello</Text>
        // </View>
        <FlatList
        data={evcentsFetched}
        style={{flex: 1}}
        ListHeaderComponent={renderPageHeader}
        renderItem={({item, index}) => {
          let showDelete = false;
          // if (item?.user.split('_').length > 1) {
          //   if (item.user.split('_')[1] == userProfile.userId) {
          //     showDelete = true;
          //   }
          // }
          return (
            // <TouchableOpacity               
            // onPress = {() => 
            //   console.log(navigation.navigate('EventDetails', {id: item.id,parent_id:movement.id}))
            // }
            // >
            <EventPostCard
              data={item}
              index={index}
              openComment={() => {}}
              navigation={navigation}
              parent_id = {movement.id}
              deletePost={
                // showDelete
                //   ? (docId, hashtags) => deletePost(docId, hashtags)
                //   : 
                  null
              }
              reportPost={true}
            />
            // </TouchableOpacity>
          );
        }}
        onEndReachedThreshold={0.5}
        onEndReached={fetchMorePosts}
        keyExtractor={(item) => item.id}
      />
        
        )}
        <Modal
          visible={showModal || Utility.getMovIndex()}
          transparent={true}
          onRequestClose={() => {
            Utility.setMovIndex(false);
            setShowModal(false);
          }}>
          <TouchableOpacity
            activeOpacity={1}
            style={{flex: 2, backgroundColor: '#00000090'}}
            onPress={() => setShowModal(false)}
          />
          <View style={{flex: 3, backgroundColor: '#00000090'}}>
            <View style={styles.modal}>
              {filteredFriends.length > 0 ? (
                <ScrollView>
                  {filteredFriends.map((user) => {
                    if (user.userId == movement?.adminInfo?.id) return null;
                    return (
                      <>
                        <TouchableOpacity
                          style={styles.listContainer}
                          onPress={() => {}}>
                          <View style={styles.profilePic}>
                            {user.profileUrl ? (
                              <Image
                                source={{uri: user.profileUrl}}
                                style={{height: '100%', width: '100%'}}
                                resizeMode="cover"
                              />
                            ) : (
                              <Text>
                                {renderInitials(user?.displayName || '')}
                              </Text>
                            )}
                          </View>
                          <View
                            style={{marginLeft: scale(10), maxWidth: '45%'}}>
                            <Text
                              numberOfLines={1}
                              style={{
                                fontSize: mScale(18),
                                fontWeight: 'bold',
                              }}>
                              {user?.displayName}
                            </Text>
                          </View>
                          {user?.isInvited ? (
                            user?.isFollowed ? (
                              <TouchableOpacity
                                style={styles.btn1}
                                activeOpacity={1}>
                                <Text style={{color: '#fff'}}>Following</Text>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                style={styles.btn1}
                                activeOpacity={1}>
                                <Text style={{color: '#fff'}}>Invited</Text>
                              </TouchableOpacity>
                            )
                          ) : (
                            <TouchableOpacity
                              style={styles.btn1}
                              onPress={() => {
                                inviteToMovement(user);
                              }}>
                              <Text style={{color: '#fff'}}>Invite</Text>
                            </TouchableOpacity>
                          )}
                          {/* {true && (
                      <TouchableOpacity style={styles.btn2}>
                        <Text style={{color: '#fff'}}>Remove</Text>
                      </TouchableOpacity>
                    )} */}
                        </TouchableOpacity>
                        <View style={styles.divider} />
                      </>
                    );
                  })}
                </ScrollView>
              ) : (
                <EmptyListText
                  title={'No Friends Found!'}
                  titleStyle={{...tStyle('700', 20, 28, '#777777')}}
                  style={{flex: 1, height: '100%'}}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingBottom: vScale(10),
  },
  banner: {
    height: vScale(165),
    width: '100%',
    backgroundColor: '#d9d9d9',
  },
  movementsLogo: {
    height: vScale(60),
    width: scale(74),
    borderRadius: scale(5),
    backgroundColor: '#d9d9d9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  profileWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: scale(20),
    marginTop: vScale(5),
  },
  iconBg: {
    backgroundColor: '#d9d9d9',
    borderRadius: vScale(25),
    height: vScale(25),
    width: vScale(25),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
    marginVertical: scale(3),
  },
  iconWrapper: {
    position: 'absolute',
    right: scale(15),
    alignItems: 'center',
  },
  actions: {
    width: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    marginTop: vScale(15),
    paddingVertical: vScale(6),
    paddingLeft: scale(20),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: vScale(3),
  },
  text1: {
    color: '#878585',
    fontSize: mScale(14),
    marginLeft: scale(10),
  },
  text2: {
    color: '#878585',
    fontSize: mScale(10),
    marginLeft: scale(10),
  },
  btn: {
    backgroundColor: '#1e2348',
    paddingHorizontal: scale(5),
    paddingVertical: scale(2),
    borderRadius: scale(5),
    marginRight: scale(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: vScale(3),
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: scale(344),
    paddingLeft: scale(15),
    marginBottom: vScale(15),
  },
  modal: {
    flex: 1,
    backgroundColor: '#fff',
    paddingLeft: scale(10),
    paddingVertical: vScale(15),
    borderTopRightRadius: scale(15),
    borderTopLeftRadius: scale(15),
  },
  selectedTab:{
    backgroundColor:'#1e2348',
    paddingHorizontal:20,
    height:30,
    justifyContent:'center',
    borderRadius:25
},
unSelectedTab:{
    backgroundColor:'gray',
    paddingHorizontal:20,
    height:30,
    justifyContent:'center',
    borderRadius:25
},
  profilePic: {
    height: vScale(23),
    width: vScale(23),
    borderRadius: vScale(23),
    marginLeft: scale(5),
    backgroundColor: '#d9d9d9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  divider: {
    borderBottomWidth: 1,
    marginBottom: vScale(15),
    borderColor: '#d9d9d9',
    width: '80%',
    alignSelf: 'center',
  },
  btn1: {
    paddingVertical: scale(5),
    paddingHorizontal: scale(10),
    backgroundColor: '#1e2348',
    borderRadius: scale(5),
    position: 'absolute',
    right: 0,
  },
  btn2: {
    paddingVertical: scale(5),
    paddingHorizontal: scale(10),
    backgroundColor: 'red',
    borderRadius: scale(5),
    position: 'absolute',
    right: 0,
  },
  dropDown: {
    borderColor: '#000',
    borderWidth: 1,
    width: scale(108),
    height: vScale(30),
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'flex-end',
    margin: 5,
    padding: 0,
    justifyContent: 'center',
  },
  avatar: {
    height: mScale(40),
    width: mScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: mScale(25),
    backgroundColor: '#d9d9d9',
  },
});

export default CityDetails;

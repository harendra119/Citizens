import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';


import Image from 'react-native-fast-image';

import firestore from '@react-native-firebase/firestore';
import { Card, Icon } from 'react-native-elements';
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
import Utility, { DEVICE_HEIGHT, DEVICE_WIDTH } from '../../utils/Utility';
import { WebView } from 'react-native-webview';
import { firebaseDbObject } from '../../utils/FirebseDbObject';
import UserInfoService from '../../utils/UserInfoService';
import { DataProvider } from '../../components/DataContext';
import Feed from '../feed';
import CityFeeds from '../CityFeeds';
import { CITIES_TABS, LIFE_TAB_SUB_CATEGORIES, TODAY_TAB_SUB_CATEGORIES } from '../cities/CityConstants';
import CityService from './CityService';

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




const ActivismDetails = ({navigation, route}) => {
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
  const [allowPost,setAllowPost] = useState(false);
  

  const [tick, setTick] = useState(0);
  const [lastDoc, setLastDoc] = useState();
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const[movementEnded,setMovementEnded] = useState(false);

  









  const userProfile = useSelector((state) => state.user.userProfile);
  const currentUserId = userProfile.userId;
  const db = firebaseDbObject;

  const { cityId } = route.params;
  console.log(cityId)

  const [checkedTab,setCheckedTab] = useState(1);
  const [city, setCity] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [desc, setDesc] = useState('');
  const [followerCount, setFollowerCount] = useState(0);
  const [posts, setPosts] = useState([]);
  const [subcategory, setSubcategory] = useState(1);
  
    const [clips, setClips] = useState([]);


  useEffect(() => {
    const fetchCityDetails = async () => {
      const cityDoc = await firebaseDbObject.collection('cities').doc(cityId).get();
      setCity(cityDoc.data());
    };
    fetchCityDetails();
    fetchCityClips();
  }, [cityId]);




  useEffect(() => {
    const checkIfLiked = async () => {
      if (currentUserId) {
        const cityDoc = await db.collection('cities').doc(cityId).get();
        const likesSubcollection = await db
          .collection('cities')
          .doc(cityId)
          .collection('likes')
          .doc(currentUserId)
          .get();

        setIsLiked(likesSubcollection.exists);  // Check if user has liked this city
        setLikeCount(cityDoc.data()?.likes || 0);  // Get the current like count
        setFollowerCount(cityDoc.data()?.followers || 0);
        setDesc(cityDoc.data()?.desc)
      }
    };

    checkIfLiked();
  }, [cityId, currentUserId]);

  const fetchCityClips = () => {
    CityService.getClips(cityId, (clips) => {
      setClips(clips)
    })
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCityClips()
    });
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);


  const unfollowCity = async () => {
    const cityRef = db.collection('cities').doc(cityId);
    await db.collection('Users').doc(currentUserId).update({ followed_city: null });
    await cityRef.update({
      followers: firestore.FieldValue.increment(-1),  // Decrement like count
    });
    navigation.replace('CityList');
  };


  const toggleLike = async () => {
    const cityRef = db.collection('cities').doc(cityId);
    const likesRef = cityRef.collection('likes').doc(currentUserId);

    try {
      if (isLiked) {
        // Unlike the city: Remove user ID from likes subcollection
        await likesRef.delete();
        await cityRef.update({
          likes: firestore.FieldValue.increment(-1),  // Decrement like count
        });
      } else {
        // Like the city: Add user ID to likes subcollection
        await likesRef.set({
          userId: currentUserId,
        });
        await cityRef.update({
          likes: firestore.FieldValue.increment(1),  // Increment like count
        });
      }

      // Update the state
      setIsLiked(!isLiked);
      setLikeCount(likeCount + (isLiked ? -1 : 1));  // Adjust the like count based on action
    } catch (error) {
      console.error('Error updating like status:', error);
      Alert.alert('Error', 'There was a problem updating the like status.');
    }
  };


const onPostSubmission = () => {
  fetchPosts();
}

const fetchPosts = async () => {
  const postSnapshot = await db
    .collection('Posts')
    .where('cityId', '==', cityId)
    .where('tab', '==',   checkedTab)
    .where('subcategory', '==', subcategory)
    .get();
    console.log('############')
    const pos = postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    console.log(pos)
    console.log('############')
  setPosts(pos);
};

useEffect(() => {
  fetchPosts();
}, [subcategory, checkedTab]);


useEffect(() => {
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













  
  
  const handleSubCategoryPressed = (id)=>{
    setSubcategory(id)
  }
  const Item = ({ title,image,id }) => (
    <View style={{flex:1,marginHorizontal:10}}> 
        <TouchableOpacity
        style={[checkedTab==id ? styles.selectedTab : styles.unSelectedTab]}
        onPress={()=> {
          setSubcategory(1); 
          if (id == 4) {
            setCheckedTab(id)
           // navigation.navigate('TwitterAlerts')
          } else
            setCheckedTab(id)
        } }
        >
        <Text style={{color: checkedTab==id  ? '#fff' : 'black'}}>{title}</Text>
        </TouchableOpacity>
     </View>
    
    
  );
  const SubItem = ({ title,image,id }) => {
   
   return (
    <View style={{flex:1,margin:10, marginHorizontal: 2}}> 
        <TouchableOpacity
        style={[subcategory == id ? styles.selectedTab : styles.unSelectedTab]}
        onPress={ ()=>{handleSubCategoryPressed(id)} }
        >
        <Text style={{color: subcategory == id ? '#fff' : '#000'}}>{title}</Text>
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
  



  const renderCount = (count) => {
    if (count > 1000 && count < 1000000) return count * 0.001 + 'k';
    if (count > 999999) return count * 0.000001 + 'm';
    else return count;
  };
 

 


  useEffect(() => {
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

  

  const renderPageHeader = () => (
    <>
      <View style={{ flexDirection: 'row' }}>
        {
          clips && clips.length ?
          <ScrollView horizontal>
             
            {
              clips.map((clip) => {
                return  <View style={{
                  borderRadius: 10,
                  height: vScale(180), backgroundColor: '#fff',
                }}>
                
                <TouchableOpacity
              
                onPress={() => {navigation.navigate('ClipListCity',{cityId})}}
                >
                <Image
                  source={{ uri: clip.thumbnailUri }}
                  style={{ 
                    borderRadius: 10,
                    height: vScale(180), width: DEVICE_WIDTH / 3, marginRight: 6 }}
                />
                </TouchableOpacity>
                </View>
              })
            }

              <TouchableOpacity
                onPress={() => navigation.navigate('NewClip', { cityId: cityId })}
                style={{
                  flex: 1,
                  width: 100,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                <Image
                  source={require('../../assets/plus.png')}
                  style={{ height: 50, width: 50 }}
                />
              </TouchableOpacity>

          </ScrollView>
          :
          <>
          <Image
          source={{ uri: 'https://drive.google.com/uc?export=view&id=1uMRRxuXkj1arzJCMkj-wuMw5yFZiGZOm' }}
          style={{ height: vScale(165), width: '50%' }}
        />
        <TouchableOpacity 
        onPress={() => navigation.navigate('NewClip', {cityId: cityId})}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Image
            source={require('../../assets/plus.png')}
            style={{ height: 50, width: 50 }}
          />
        </TouchableOpacity>
          </>
        }
        
      </View>

      <View style={styles.profileWrapper}>
        <View style={styles.movementsLogo}>
            <Image
              source={require('../../assets/toranto.png')}
              style={{height: '100%', width: '100%'}}
              resizeMode="cover"
            />
        </View>
        <View style={{marginLeft: scale(10), width: scale(150)}}>
          <Text style={{fontSize: mScale(18)}}>{'Toronto'}</Text>
        </View>
          <View style={styles.iconWrapper}>
            <View style={{flexDirection: 'row'}}>
              {isLiked ? (
                <TouchableOpacity style={[styles.iconBg, {backgroundColor: '#1e2348'}]} onPress={toggleLike}>
                 <Icon
                    name="thumbs-up"
                    type="ionicon"
                    size={vScale(12)}
                    color="white"
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.iconBg}
                  onPress={toggleLike}>
                  <Icon
                    name="thumbs-up"
                    type="ionicon"
                    size={vScale(12)}
                    color="gray"
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.btn} onPress={unfollowCity}>
                  <Text style={{color: '#fff'}}>Leave</Text>
                </TouchableOpacity>
            </View>
           
          </View>
        
      </View>
      <View style={styles.actions}>
       
        <View style={styles.row}>
          <Icon
            name="people-outline"
            type="ionicon"
            size={vScale(20)}
            color="#878585"
          />
          <Text style={styles.text1}>
            {renderCount(followerCount || 0)} Torontonians
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
            {renderCount(likeCount || 0)} likes
          </Text>
        </View>

        <Text style={[{color: '#000', marginTop: 10}]}>
        Community Guidelines
          </Text>

        <View style={{flexDirection: 'row', alignItems: 'center', paddingRight: 10}}>
          <Text
            numberOfLines={1}
            style={[styles.text1, {flex: 1, marginLeft: 0}]}>
            {desc.replace(/\\n/g, '')}
          </Text>
          {
            desc &&  <TouchableOpacity
            onPress={() => Utility.showMessage(desc.replace(/\\n/g, '\n'))}
            style={{height: 40, justifyContent: 'center'}}>
            <Text
              numberOfLines={1}
              style={[styles.text1, {color: 'blue'}]}>
              {'read more'}
            </Text>
            </TouchableOpacity>
          }
         

        </View>
      </View>


      {((checkedTab==2) || (UserInfoService.isAdminLogin() && checkedTab==1)) && (
        <TouchableOpacity
          style={[styles.actions, styles.row]}
          activeOpacity={1}
          onPress={() =>
            navigation.navigate('UploadPost', {
              isFromCity: true,
              onPostPublish: onPostSubmission,
              cityId,
              subcategory,
              checkedTab
            })
          }>
          {userProfile.profileUrl ? (
            <Image
              source={{uri: userProfile.profileUrl}}
              resizeMode="cover"
              style={{height: vScale(41), width: scale(51)}}
            />
          ) : (
            <View style={[styles.avatar]}>
              <Text>
                {userProfile.displayName ? renderInitials(userProfile.displayName) : ''}
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
          data={CITIES_TABS}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={{marginTop:5}}
        />
        {
          checkedTab != 3 ?
          <FlatList
          horizontal={true}
          data={checkedTab == 1 ? LIFE_TAB_SUB_CATEGORIES : TODAY_TAB_SUB_CATEGORIES}
          renderItem={renderSubTabsItem}
          keyExtractor={item => item.id}
          style={{marginBottom:5}}
        />
        :
        null

        }
         
      </View>
    </>
  );

 
    return (
      <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        {(checkedTab == 1 ||  checkedTab == 2) ? 
        
        <FlatList
          data={[1]}
          style={{flex: 1}}
          ListHeaderComponent={renderPageHeader}
          renderItem={({item, index}) => {
            return (
                <CityFeeds 
                cityId={cityId}
                tab={checkedTab}
                subcategory={subcategory}
                navigation={navigation} focused={true}  />
            );
          }}
          onEndReachedThreshold={0.5}
          onEndReached={fetchMorePosts}
        />
         : null}
        

      {(checkedTab == 3 &&
      <>
       <TouchableOpacity
       style={{paddingHorizontal: 10}}
       onPress={() => {setSubcategory(1); setCheckedTab(1)}}
       >
          <Image
          style={{width: 40, height: 30}}
          source={require('../../assets/backArrow.png')}
          />
        </TouchableOpacity>
      <ScrollView style={{}}>
       
        <Card
        containerStyle={{
          marginHorizontal: scale(8),
          elevation: 1,
          borderRadius: mScale(8),
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.18,
          shadowRadius: 1.0,
          paddingTop: vScale(10),
          paddingHorizontal: 0,
          paddingBottom: 0,
        }}
        >
          <WebView
                  style={{height: 3000}}
                  source={{ uri: 'https://www.toronto.ca/explore-enjoy/festivals-events/festivals-events-calendar/' }}
                />

        </Card>
        
      </ScrollView>
      </>
          
        
        )}

{(checkedTab == 4 &&
      <>
      <View style={{flexDirection: 'row', paddingTop: 10}}>
       <TouchableOpacity
       style={{paddingHorizontal: 10}}
       onPress={() => {setSubcategory(1); setCheckedTab(1)}}
       >
          <Image
          style={{width: 40, height: 30}}
          source={require('../../assets/backArrow.png')}
          />
        </TouchableOpacity>
        <View style={{flex: 1, marginRight: 40}}>
        <TouchableOpacity
       style={{paddingHorizontal: 10, alignSelf: 'flex-end'}}
       onPress={() => {
        Utility.showMessage("Please login with your X account to get the latest updates. Please ignore if you already logged-in")
       }}
       >
          <Image
          style={{width: 40, height: 40}}
          source={require('../../assets/warning.png')}
          />
        </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{}}>
       
        <Card
        containerStyle={{
          marginHorizontal: scale(8),
          elevation: 1,
          borderRadius: mScale(8),
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.18,
          shadowRadius: 1.0,
          paddingTop: vScale(10),
          paddingHorizontal: 0,
          paddingBottom: 0,
        }}
        >
          <WebView
                  style={{height: DEVICE_HEIGHT}}
                  source={{ uri: 'https://x.com/TTCnotices' }}
                />

        </Card>
        
      </ScrollView>
      </>
          
        
        )}
      
      </View>
      </SafeAreaView>
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
    paddingHorizontal:10,
    height:30,
    justifyContent:'center',
    borderRadius:10
},
unSelectedTab:{
    backgroundColor:'lightgray',
    paddingHorizontal:10,
    height:30,
    justifyContent:'center',
    borderRadius:10
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

export default ActivismDetails;

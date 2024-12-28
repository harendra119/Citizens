import firestore from '@react-native-firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useSelector } from 'react-redux';

import EmptyListText from '../../components/emptyListText';
import Header from '../../components/header';
import { mScale, scale, vScale } from '../../configs/size';

const ActivismMain = ({navigation, route}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLikedModal, setShowLikedModal] = useState(false);
  const [showInviModal, setShowInviModal] = useState(false);
  const [visibleList, setVisibleList] = useState([]);
  const [movementList, setMovementList] = useState([]);
  const [newMovementList, setNewMovementList] = useState([]);
  const [allMovement, setAllMovements] = useState([]);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [checkedTab,setCheckedTab] = useState(1);


  const [likedMovementList, setLikedMovementList] = useState([]);
  const [invitedMovementList, setInvitedMovementList] = useState([]);

  const userProfile = useSelector((state) => state.user.userProfile);


  const fetchMyMovements = useCallback(() => {
    if (userProfile.userId)
    firestore()
      .collection('Movements')
      .where('adminInfo.id', '==', userProfile.userId)
      .onSnapshot(
        (snap) => {
          const tempArr = [];
          snap.docs.map((doc) => tempArr.push(doc.data()));
          setMovementList(tempArr);
        },
        (err) => console.log('error', err),
      );
  }, []);
  
  const fetchNewMovements = async() => {
    const _7daysago = Date.now() - (7 * 24 * 60 * 60 * 1000);

    try {
      const qSnapshot = await firestore()
        .collection('Movements')
        .where('date','>=',_7daysago)
        .orderBy('date', 'desc').get();

      let allDocs = [];
      qSnapshot.forEach(async (doc) => {
      
        allDocs.push({ id: doc.id, ...doc.data() });
        
      });
    
      const tempArr = [];

     
      await Promise.all(allDocs.map( async (doc) => {
        
        const viewRef =     firestore().collection('Movements').doc(doc.id).collection('Views').doc(userProfile.userId);
        await viewRef.get().then((snap) => {
          
          
          if (!snap.exists){
            tempArr.push(doc);
            
          } 

        });


      }));
      
      setNewMovementList(tempArr);
      
    } catch (err) {
      console.log('error',err);
    }


  };

  useEffect(fetchMyMovements, [fetchMyMovements, navigation]);

  const fetchAllMovements = () => {
    firestore()
      .collection('Movements')
      // .where("block."+userProfile.userId,"==",false)
      .onSnapshot(
        (snap) => {
          const tempArr = [];
          snap.docs.map(
            
            async(doc) => {
              const ref = firestore().collection('Movements').doc(doc.id);
              const muteRef = ref.collection('Block').doc(userProfile.userId);

              await muteRef.get().then((snapdoc) => {
                
                if (snapdoc.exists == false){
                  allMovement.push(doc.data());
                  
                }

              })
              
              
            });

            console.log('temarr Again', tempArr);
          setAllMovements(allMovement);
        },
        (err) => console.log('error', err),
      );
  };
  useEffect(()=>{
    fetchNewMovements();
  },[navigation])

  useEffect(() => {
    fetchAllMovements();
  }, [navigation]);

  const fetchMovements = useCallback(() => {
    firestore()
      .collection('Follows')
      .where('entityInfo.type', '==', 'movement')
      .where('users', 'array-contains', userProfile.userId)
      .onSnapshot(
        (snap) => {
          const tempArrLiked = [];
          const tempArrInvited = [];
          snap.docs.map((doc) => {
            const data = doc.data();
            if (data?.entityInfo?.status === 'following')
              if (data.identifiers[0].split('_').includes(userProfile.userId)) {
                tempArrLiked.push({
                  id: data.entityInfo.id,
                  title: data.entityInfo.name,
                  profileUrl: data.entityInfo.profileUrl,
                });
              }
            if (data?.entityInfo?.status === 'pending') {
              console.log('data ==>', data);
              console.log('uid', userProfile.userId);
              console.log(data.identifiers[0].split('_'));
              if (data.identifiers[0].split('_').includes(userProfile.userId)) {
                tempArrInvited.push({
                  id: data.entityInfo.id,
                  title: data.entityInfo.name,
                  profileUrl: data.entityInfo.profileUrl,
                  invitedBy: data.entityInfo.invitedBy
                });
              }
            }
          });
          setLikedMovementList(tempArrLiked);
          setInvitedMovementList(tempArrInvited);
        },
        (err) => console.log('error', err),
      );
  }, []);

  useEffect(fetchMovements, [fetchMovements, navigation]);

  const acceptInvite = async (id1, id2) => {
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
        'entityInfo.status': 'following',
        [`isFollowedByOtherUser.${id2}`]: true,
        [`isFollowingOtherUser.${id1}`]: true,
      });
      batch.update(movementSnap.ref, {
        followedCount: firestore.FieldValue.increment(1),
        likedCount: firestore.FieldValue.increment(1),
      });
      setShowInviModal(false);
      setShowLikedModal(false);
      return batch.commit();
    } catch (error) {
      console.log('error while follow', error);
    }
  };

  const declineInvite = async (id1, id2) => {
    try {
      var batch = firestore().batch();
      var followSnap = await firestore()
        .collection('Follows')
        .where('identifiers', 'array-contains', `${id1}_${id2}`)
        .get();
      var followRef = firestore()
        .collection('Follows')
        .doc(followSnap.docs[0].id);
      await followRef.delete();
      setShowInviModal(false);
      setShowLikedModal(false);
    } catch (error) {
      console.log('error while follow', error);
    }
  };

  const renderInitials = (name) => {
    if (name.split(' ').length > 1) return `${name[0]}${name.split(' ')[1][0]}`;
    else return name[0];
  };

  const  feedData = [
    {
      id: '1',
      title: 'New Movements',
    },
    {
      id: '2',
      title: 'All Movements',
      
    },

  ];

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
  
  
    const renderItem1 = ({ item }) => (
      <Item title={item.title}  id={item.id}/>
    );

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.movementList}
        onPress={() => navigation.navigate('ActivismDetails', {id: item.id})}>
        <View
          style={{
            ...styles.movementsLogo,
            backgroundColor: '#d9d9d9',
          }}>
          {item?.profileUrl ? (
            <Image
              source={{uri: item.profileUrl}}
              style={{height: '100%', width: '100%'}}
              resizeMode="cover"
            />
          ) : (
            <Text>{renderInitials(item?.title)}</Text>
          )}
        </View>
        <View style={{marginLeft: scale(10)}}>
          <Text style={{fontSize: mScale(18), fontWeight: 'bold'}}>
            {item?.title}
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {/* <View style={styles.greenDot} /> */}
            <Text style={{color: '#828282', fontSize: mScale(10)}}>
              {item?.followedCount || 0} followers
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{alignItems: 'center'}}>
    
      <Header navigation={navigation} />
      
      <TouchableOpacity
        style={styles.movementsDropdown}
        onPress={() => setShowDropdown(!showDropdown)}>
        <View style={styles.movementsLogo}>
          <Text style={{color: '#fff'}}>M</Text>
        </View>
        <Text style={{marginLeft: scale(10)}}>Your Movements</Text>
        <View style={{position: 'absolute', right: scale(10)}}>
          <Icon
            name={showDropdown ? 'chevron-up-outline' : 'chevron-down-outline'}
            type="ionicon"
            size={vScale(15)}
          />
        </View>
      </TouchableOpacity>
      {movementList.length > 0 && showDropdown && (
        <View style={{marginTop: vScale(15)}}>
          {movementList.map((item) => renderItem({item}))}
        </View>
      )}
      
      <View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreateActivism')}>
          <Icon
            name="add-circle-outline"
            type="ionicon"
            size={vScale(23)}
            color="#fff"
          />
          <Text style={styles.text1}>Create New Movement</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.movementList}
          onPress={() => {
            setShowLikedModal(true);
            setVisibleList(likedMovementList);
          }}>
          <View style={styles.iconBg}>
            <Icon
              name="thumbs-up"
              type="ionicon"
              size={vScale(12)}
              color="#1e2348"
            />
          </View>
          <Text style={styles.text2}>Liked Movements</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.movementList}
          onPress={() => {
            setShowInviModal(true);
            setVisibleList(invitedMovementList);
          }}>
          <View style={styles.iconBg}>
            <Icon
              name="person-add"
              type="ionicon"
              size={vScale(12)}
              color="#1e2348"
            />
          </View>
          <View style={{marginLeft: scale(10)}}>
            <Text style={{fontSize: mScale(16)}}>Invitations</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {/* <View style={styles.greenDot} /> */}
              <Text style={{fontSize: 12}}>
                {invitedMovementList.length} new
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        {/* new task */}
          
        
        <View>
          
          <View style={styles.movementsTab}>
              <FlatList
                horizontal={true}
                data={feedData}
                renderItem={renderItem1}
                keyExtractor={item => item.id}
                style={{marginTop:5,marginBottom:5}}
              />
            
          </View>
          
          {newMovementList.length > 0 
          && checkedTab == 1 
          && (
            <View style={{marginTop: vScale(15)}}>
              {newMovementList.map((item) => renderItem({item}))}
            </View>
          )}
          {allMovement.length > 0 
           && checkedTab == 2  
          && (
          <View style={{marginTop: vScale(15)}}>
            <FlatList
              data={allMovement}
              renderItem={renderItem}
              keyExtractor={(item, i) => i.toString()}
            />
          </View>
        )}
        </View>
        {/* new task */}

        {/* <View>
        <TouchableOpacity style={styles.movementsDropdown}>
              
            <View style={styles.movementsLogo}>
              <Text style={{color: '#fff'}}>M</Text>
            </View>
            <Text style={{marginLeft: scale(10)}}>New Movement</Text>
            <View style={{position: 'absolute', right: scale(10)}}>
              <Icon
                name={showNewDropdown ? 'chevron-up-outline' : 'chevron-down-outline'}
                type="ionicon"
                size={vScale(15)}
              />
            </View>
          </TouchableOpacity>
          
          {newMovementList.length > 0 
          && newMovementList 
          && (
            <View style={{marginTop: vScale(15)}}>
              {newMovementList.map((item) => renderItem({item}))}
            </View>
          )}
        </View> */}
        {/* <TouchableOpacity
          style={styles.movementsDropdown}
          onPress={() => setShowAllDropdown(!showAllDropdown)}>
          <View style={styles.movementsLogo}>
            <Text style={{color: '#fff'}}>M</Text>
          </View>
          <Text style={{marginLeft: scale(10)}}>All Movements</Text>
          <View style={{position: 'absolute', right: scale(10)}}>
            <Icon
              name={
                showAllDropdown ? 'chevron-up-outline' : 'chevron-down-outline'
              }
              type="ionicon"
              size={vScale(15)}
            />
          </View>
        </TouchableOpacity>
        
        {allMovement.length > 0 && showAllDropdown && (
          <View style={{marginTop: vScale(15)}}>
            <FlatList
              data={allMovement}
              renderItem={renderItem}
              keyExtractor={(item, i) => i.toString()}
            />
          </View>
        )} */}
      </View>
      
      <Modal
        visible={showLikedModal || showInviModal}
        transparent={true}
        onRequestClose={() => {
          setShowLikedModal(false);
          setShowInviModal(false);
        }}>
        <TouchableOpacity
          activeOpacity={1}
          style={{flex: 2, backgroundColor: '#00000090'}}
          onPress={() => {
            setShowLikedModal(false);
            setShowInviModal(false);
          }}
        />
        <View style={{flex: 3, backgroundColor: '#00000090'}}>
          {visibleList.length > 0 ? (
            <ScrollView contentContainerStyle={{flexGrow: 1}}>
              <View style={styles.modal}>
                {visibleList.map((movement) => (
                  <>
                    <TouchableOpacity
                      style={styles.movementList}
                      onPress={() => {
                        setShowInviModal(false);
                        setShowLikedModal(false);
                        navigation.navigate('ActivismDetails', {
                          id: movement.id,
                        });
                      }}>
                      <View
                        style={{
                          ...styles.movementsLogo,
                          backgroundColor: '#d9d9d9',
                        }}>
                        {movement.profileUrl ? (
                          <Image
                            source={{uri: movement.profileUrl}}
                            style={{height: '100%', width: '100%'}}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text>{renderInitials(movement?.title)}</Text>
                        )}
                      </View>
                      <View style={{marginLeft: scale(10), maxWidth: '45%'}}>
                        <Text
                          numberOfLines={1}
                          style={{fontSize: mScale(18), fontWeight: 'bold'}}>
                          {movement?.title}
                        </Text>
                      </View>
                      {showInviModal && (
                        <TouchableOpacity
                          style={styles.btn1}
                          onPress={() =>
                            acceptInvite(userProfile.userId, movement.id)
                          }>
                          <Text style={{color: '#fff'}}>Accept</Text>
                        </TouchableOpacity>
                      )}
                      {showInviModal && (
                        <TouchableOpacity
                          style={styles.btn2}
                          onPress={() =>
                            declineInvite(userProfile.userId, movement.id)
                          }>
                          <Text style={{color: '#fff'}}>Decline</Text>
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                    {
                      movement?.invitedBy?.name ?
                      <Text style={{marginHorizontal: 15, marginBottom: 5}}>
                        {'You were invited to join this movement by ' + movement?.invitedBy?.name}</Text>
                      :
                      null
                    }
                    <View style={styles.divider} />
                  </>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.modal}>
              <EmptyListText style={{height: '100%', marginLeft: -scale(10)}} />
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  movementsDropdown: {
    width: scale(344),
    height: vScale(45),
    marginTop: vScale(10),
    paddingLeft: scale(15),
    borderRadius: scale(5),
    backgroundColor: '#d9d9d9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  movementsTab: {
    // width: scale(344),
    // height: vScale(45),
    marginTop: vScale(10),
    paddingLeft: scale(15),
    borderRadius: scale(5),
    backgroundColor: '#d9d9d9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  movementsLogo: {
    height: vScale(23),
    width: vScale(23),
    borderRadius: vScale(23),
    marginLeft: scale(5),
    backgroundColor: '#1e2348',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  movementList: {
    flexDirection: 'row',
    alignItems: 'center',
    width: scale(344),
    paddingLeft: scale(15),
    marginBottom: vScale(15),
  },
  greenDot: {
    height: vScale(5),
    width: vScale(5),
    borderRadius: vScale(5),
    backgroundColor: '#2135EE',
    marginRight: scale(5),
  },
  createBtn: {
    width: scale(344),
    height: vScale(35),
    backgroundColor: '#1e2348',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(5),
    marginVertical: vScale(20),
  },
  text1: {
    fontSize: mScale(16),
    color: '#fff',
    marginLeft: scale(10),
  },
  iconBg: {
    backgroundColor: '#d9d9d9',
    borderRadius: vScale(25),
    height: vScale(25),
    width: vScale(25),
    justifyContent: 'center',
    alignItems: 'center',
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
  text2: {
    fontSize: mScale(16),
    marginLeft: scale(10),
  },
  modal: {
    flex: 1,
    backgroundColor: '#fff',
    paddingLeft: scale(10),
    paddingVertical: vScale(15),
    borderTopRightRadius: scale(15),
    borderTopLeftRadius: scale(15),
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
    right: scale(70),
  },
  btn2: {
    paddingVertical: scale(5),
    paddingHorizontal: scale(10),
    backgroundColor: 'red',
    borderRadius: scale(5),
    position: 'absolute',
    right: scale(0),
  },
});

export default ActivismMain;

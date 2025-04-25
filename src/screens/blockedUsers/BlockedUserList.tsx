import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    FlatList,
    StatusBar,
    Text,
    TouchableOpacity,
} from 'react-native';
import Image from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import Utility, { DEVICE_WIDTH } from '../../utils/Utility';
import Header from '../../components/header';
import { firebaseDbObject } from '../../utils/FirebseDbObject';
import firestore from '@react-native-firebase/firestore';
import { renderInitials } from '../cities/CityDetails';
import RoundImage from '../../components/roundImage';
import { useBlockedUsers } from './useBlockedUsers';

const BlockedUserList = ({ navigation }) => {
    const userProfile = useSelector((state) => state.user.userProfile);
   // const [blockedUserList, setBlockedUserList] = useState([])
    const blockedUserList = useBlockedUsers(userProfile?.userId);
    
    // useEffect(() => {
    //     getAllBlockedUser();
    // }, []);

    // const getAllBlockedUser = () => {
    //     getBlockedUsersList(userProfile?.userId).then(blockedUsers => {
    //         setBlockedUserList(blockedUsers);
    //         console.log(blockedUsers)
    //     });
    // }


    const unblockUser = async (blockedUserId) => {
        try {
            await firestore().collection('Users').doc(userProfile?.userId).update({
                blockedUserByMe: firestore.FieldValue.arrayRemove(blockedUserId)
            });
            // getAllBlockedUser();
            Utility.showMessage('User unblocked successfully');
        } catch (error) {
            Utility.showMessage('Error unblocking user');
        }
    };

    // const getBlockedUsers = async (userId) => {
    //     try {
    //         const userDoc = await firestore().collection('Users').doc(userId).get();

    //         if (!userDoc.exists) {
    //             console.log('User not found');
    //             return [];
    //         }

    //         const blockedUserIds = userDoc.data().blockedUserByMe || [];

    //         if (blockedUserIds.length === 0) {
    //             console.log('No blocked users');
    //             return [];
    //         }

    //         return blockedUserIds;
    //     } catch (error) {
    //         console.error('Error fetching blocked users:', error);
    //         return [];
    //     }
    // };

    // const fetchBlockedUsersDetails = async (blockedUserIds) => {
    //     try {
    //       const usersSnapshot = await firestore()
    //         .collection('Users')
    //         .where('userId', 'in', blockedUserIds) // Fetch users whose IDs match blocked list
    //         .get();
      
    //       const blockedUsers = usersSnapshot.docs.map(doc => ({
    //         id: doc.id,
    //         ...doc.data()
    //       }));
      
    //       return blockedUsers;
    //     } catch (error) {
    //       console.error('Error fetching blocked user details:', error);
    //       return [];
    //     }
    //   };


    //   const getBlockedUsersList = async (userId) => {
    //     const blockedUserIds = await getBlockedUsers(userId);
      
    //     if (blockedUserIds.length === 0) return [];
      
    //     const blockedUsersDetails = await fetchBlockedUsersDetails(blockedUserIds);
    //     return blockedUsersDetails;
    //   };
      
      
    const renderBlockUserlistItem = ({ item, index }) => {
        return (
            <View style={{
                backgroundColor: '#fff',
                margin: 10,
                padding: 20,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <TouchableOpacity 
                onPress={() => {
                    navigation.navigate('otherProfile', {
                        userId: item.userId,
                        fromBlockList: true
                      });
                }}
                style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                
                 <RoundImage
                                  userId={item.userId}
                                  imageUrl={item.profileUrl}
                                  displayName={item.displayName}
                                  size={50}
                                  style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 50,
                                }}
                                />
                
                
               <Text style={{ 
                                    marginLeft: 20, fontWeight: 'bold' }}>
                        {item.displayName}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                        onPress={() => {
                            Utility.showMessageWithActionCancel(
                                () => {
                                    unblockUser(item.userId) 
                                },
                                () => {},
                                'You want to unblock ' + item.displayName,
                                'Are you sure?'
                              )
                           
                        }}
                        style={{ borderRadius: 20, backgroundColor: '#1e2348', width: 80, marginLeft: 20, height: 40, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                        <Text style={{ fontWeight: '500', color: '#fff' }}>
                            Unblock
                        </Text>
                    </TouchableOpacity>
                
                {/* <Image
                    source={{ uri: item.img }}
                    resizeMode='stretch'
                    style={{
                        width: DEVICE_WIDTH,
                        height: DEVICE_WIDTH / 2
                    }}
                />
                <View style={{ padding: 15 }}>
                    <Text style={{ fontWeight: 'bold' }}>
                        {item.name}
                    </Text>
                    <Text numberOfLines={2} style={{ fontWeight: '400', marginVertical: 8 }}>
                        {item.desc}
                    </Text>
                    {
                        index == 0 ?
                        <TouchableOpacity 
                        onPress={() => {
                            followCity(item.id)
                        }}
                        style={{ borderRadius: 20, backgroundColor: '#1e2348', marginHorizontal: 50, height: 40, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                        <Text style={{ fontWeight: '500', color: '#fff' }}>
                            JOIN
                        </Text>
                    </TouchableOpacity>
                    :
                   
                    <Text
                    style={{
                        fontWeight: '600',
                        color: '#000',
                        textAlign: 'center',
                        marginVertical: 5
                    }}
                    >Launching Soon...</Text>
                    }
                   
                </View> */}


            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <Header navigation={navigation} />
            <StatusBar backgroundColor={'#000000'} />
            <View style={{flex: 1, backgroundColor: '#ccc', paddingTop: 10}}>
            <FlatList
                data={blockedUserList}
                renderItem={renderBlockUserlistItem}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => {
                    return `${item.id}-${index}`;
                }}
                style={{}}
            />
            </View>

        </View>
    );
};

export default BlockedUserList;


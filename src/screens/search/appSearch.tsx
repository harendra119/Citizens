import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon, SearchBar } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import Utility, { DEVICE_HEIGHT } from '../../utils/Utility';
import auth from '@react-native-firebase/auth';
import UserRow from '../../components/listItem';
import Feed from '../feed';
import { FloatingAction } from 'react-native-floating-action';

const saerchTypes = [
  {
    id: 1,
    title: 'Posts'
  },
  {
    id: 2,
    title: 'People'
  },
  {
    id: 3,
    title: 'Hashtags'
  }
  
];
const actions = [
  // {
  //   text: 'Highlights',
  //   icon: <Icon name="light-up" type="entypo" color="#1e2348" />,
  //   name: 'Highlights',
  //   color: '#ededed',
  //   position: 2,
  // },
  /*{
    text: 'Stories',
    icon: <Icon name="heart-o" type="font-awesome" color="#1e2348" />,
    name: 'Stories',
    color: '#ededed',
    position: 1,
  },*/
  {
    text: 'Post',
    icon: <Icon name="edit" type="font-awesome" color="#1e2348" />,
    name: 'Post',
    color: '#ededed',
    position: 2,
  },
  // {
  //   text: 'Watch',
  //   icon: <Icon name="video-call" type="material" color="#1e2348" />,
  //   name: 'Watch',
  //   color: '#ededed',
  //   position: 4,
  // },
];
const appSearch =  ({ navigation }) => {
  const [searchResult, setSearchResult] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState(1);
  const keyExtractor = (level, index) => index + '';

  useEffect(() => {
    Utility.setSearchType(searchType);
    getSearchResult(searchText)
  }, [searchText, searchType]);

  const getSearchResult = async (search) => {
    console.log("Search query:", search);
    const { uid } = auth().currentUser;
    if (search === '') {
      setSearchResult([]);
      return null;
    }
  
    try {
      if (searchType === 1) {
        const res = await firestore()
          .collection('Posts')
          .orderBy('urlReadmore')
          .startAt(search)
          .endAt(search + '~')
          .get();
  
        if (res.docs.length > 0) {
          const tempArr = res.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Posts:", tempArr);
          let users = await firestore().collection("Users").doc(uid).get()
          let userData = users.data();
          let blockedUsers = userData.blockedUserByMe || []
          const filterData = [];
          const isBlockedByUser = (item, uid) => {
            return item.blockedByUsers?.some(blockedUser => blockedUser.userId === uid);
          };
          tempArr.forEach((item) => {
              if (isBlockedByUser(item, uid)  || blockedUsers?.includes(item.user)){
                console.log('oofoofoof',item)
              }else{
                filterData.push(item)
               
              }
             
            
           })
          setSearchResult(filterData);
        } else {
          console.log("No posts found matching the search criteria.");
          setSearchResult([]);
        }
  
      } else if (searchType === 2) {
    
        const userDoc = await firestore().collection("Users").doc(uid).get();
        const userData = userDoc.data();
        const blockedUsers = userData?.blockedUserByMe || [];
  
        console.log("Blocked users by current user:", blockedUsers);
  
        const res = await firestore()
          .collection('Users')
          .orderBy('displayName')
          .startAt(search)
          .endAt(search + '~')
          .get();
  
        // Check if any documents are retrieved
        if (res.docs.length > 0) {
          console.log("Number of users retrieved:", res.docs.length);
  
          // Log all users before filtering
          const allUsers = res.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          console.log("All users before filtering:", allUsers);
  
          // Filter out blocked users and log each user
          const filteredUsers = allUsers.filter((user) => {
            const isBlocked = blockedUsers.includes(user.id);
            console.log(`User ID: ${user.id}, Name: ${user.displayName}, Blocked: ${isBlocked}`);
            return !isBlocked;
          });
  
          console.log("Filtered users after removing blocked:", filteredUsers);
          setSearchResult(filteredUsers);
        } else {
          console.log("No users found matching the search criteria.");
          setSearchResult([]);
        }
  
      } else if (searchType === 3) {
        const res = await firestore()
          .collection('Hashtags')
          .orderBy('title')
          .startAt(search.toLowerCase())
          .endAt(search.toLowerCase() + '~')
          .get();
  
        if (res.docs.length > 0) {
          const temp = res.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          console.log("Hashtags found:", temp);
          setSearchResult(temp);
        } else {
          console.log("No hashtags found matching the search criteria.");
          setSearchResult([]);
        }
  
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResult([]);
    }
  };
  
  

  const renderSearchedByItem = (data) => {
    return (
      <View style={{flex:1,flexDirection:'row',margin:5, alignItems: 'center'}}> 
      {
        data.index == 0 ?
        <Text style={{marginRight: 10, fontWeight: 'bold'}}></Text>
        :
        null
      }
          <TouchableOpacity
          style={searchType == (data.index + 1) ? styles.selectedTab : styles.unSelectedTab}
          onPress={()=>
          {
           setSearchType(data.item.id)
          }
          }
          >
          <Text style={{color:'#fff'}}>{data.item.title}</Text>
          </TouchableOpacity>
       </View>
    )
  }

  const renderSearchedItem = (data) => {
    return (
      <UserRow inHeader={false} item={data.item} searchType={searchType} navigation={navigation} onclose={() => {
       
      }}/>
    )
  }

  const emptyList = () => {
    if (searchText.length)
      return (

        <View style={{ height: DEVICE_HEIGHT - 100, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{
            color: '#000000',
            fontSize: 13
          }}>
            {'no data found!'}
          </Text>
        </View>)
    return null
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        <TouchableOpacity 
        onPress={() => {navigation.goBack()}}
        style={{ flexDirection: 'row' }}>
          <Image style={{ height: 20, width: 30 }} source={require('../../assets/backArrow.png')} />
          <Text style={{ color: '#000' }}>Back</Text>
        </TouchableOpacity>
        <SearchBar
          value={searchText}
          placeholder="Search" // MAIN SEARCH
          onChangeText={setSearchText}
          lightTheme={true}
          containerStyle={styles.headerCont}
          inputStyle={{ fontSize: 12 }}
          inputContainerStyle={styles.headerINput}
        />

        <View style={{ height: 80 }}>
          <FlatList
            horizontal={true}
            data={saerchTypes}
            renderItem={renderSearchedByItem}
            keyExtractor={item => item.id}
            style={{ marginTop: 5 }}
          />
        </View>
        {searchType == 1 ?
          <View style={{ flex: 1, marginTop: -20, marginHorizontal: -20 }}>
            {
              searchText ?
                <Feed navigation={navigation} focused={true} searchText={searchText} />
                :
                null
            }

        </View>
        : 
        <FlatList
          showsVerticalScrollIndicator={false}
          key={'searcheUni'}
          style={{ backgroundColor: '#fff', flex: 1, alignContent: 'center', paddingTop: 20 }}
          contentContainerStyle={{
            paddingHorizontal: 15,
            paddingBottom: 22,
            backgroundColor: '#fff'
          }}
          keyExtractor={keyExtractor}
          data={searchResult}
          renderItem={renderSearchedItem}
          ListEmptyComponent={emptyList}
        />}
        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: '#ffffff'
  },
  headerCont: {
    backgroundColor: '#e8e8e8',
    elevation: 0,
    borderWidth: 0,
    padding: 0,
    borderRadius: 20,
    marginTop: 30,
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  headerINput: { height: 50, borderRadius: 20, backgroundColor: '#e8e8e8' },
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
}
});

export default appSearch;

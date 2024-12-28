import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Loader from '../../components/loader';
import Error from '../../components/error';
import {Avatar, Button, ListItem} from 'react-native-elements';
import {mScale, scale, vScale} from '../../configs/size';
import EmptyListText from '../../components/emptyListText';
import {heightPercentageToDP} from 'react-native-responsive-screen';
import RoundImage from '../../components/roundImage';

const Followers = ({route, navigation}) => {
  const [followers, setFollowers] = useState([]);
  const [error, setError] = useState(false);
  const [loader, setLoader] = useState(true);
  const [blockers, setBlockers] = useState([]);

  const {movId} = route.params;

  const uid = auth().currentUser?.uid;

  useEffect(() => {
    getFollowers();
  }, []);

  const getFollowers = async () => {
    try {
      const snap = await firestore()
        .collection('Follows')
        .where('entityInfo.type', '==', 'movement')
        .where('entityInfo.id', '==', movId)
        .where('entityInfo.status', '==', 'following')
        .get();
      let tempArrs =  snap.docs.map((doc) => {
        let arr = doc.data().userData.filter((user) => user.userId !== movId
        );

        return {...arr[0], ref: doc.ref};
      });
      setFollowers(tempArrs);
      checkBlockSatus();
      setLoader(false);
    } catch (error) {
      setLoader(false);
      setError(true);
    }
  };

  const blockFollower  = async (ref,uid,username, index) => {

    try {
      // setLoader(true);
      const ref = firestore().collection('Movements').doc(movId);
      const muteRef = ref.collection('Block').doc(uid);
      await muteRef.get().then((snap) => {
        if (snap.exists){
          var docRef = firestore().collection("Movements").doc(movId).collection("Block");
          // delete the document
          docRef.doc(uid).delete();
          // setBlocked(false);
          
        } 
        else {
          const body = {
            id: uid,
            displayName: username,
          };
          const batch = firestore().batch();
          batch.set(muteRef, body);
          batch.commit();
          // this.setState({alreadyMuted: true});
          // setBlocked(true);

        }
      });
      await checkBlockSatus();
      // setLoader(false);

      console.log('blockers',blockers);
    } catch (err) {
      console.log('err', err);
    }
  }

  const checkBlockSatus = async() =>{
    try {
      const snap = await firestore().collection('Movements').doc(movId).collection('Block').get();
      let tempArrs =  [];
      snap.docs.map((doc) => {
        tempArrs.push(doc.data().id);
      });
      setBlockers(tempArrs);
    } catch (err) {
      console.log('err', err);
    }
  }

  const removeFollower = async (ref, index) => {
    try {
      const batch = firestore().batch();
      batch.delete(ref);
      batch.update(firestore().collection('Movements').doc(movId), {
        followedCount: firestore.FieldValue.increment(-1),
        likedCount: firestore.FieldValue.increment(-1),
      });
      await batch.commit();
      const tempArr = [...followers];
      tempArr[index] = {...tempArr[index], removed: true};
      setFollowers(tempArr);
    } catch (error) {
      console.log('error while accepting friend request', error);
      alert('Something went wrong!');
    }
  };

  const renderItem = ({item, index}) => (
    <ListItem containerStyle={{margin: 0, padding: 5}} key={0}>
      
      <RoundImage
        userId={item.userId}
        imageUrl={item.profileUrl}
        displayName={item?.displayName}
        size={50}
      />
      <ListItem.Content>
        <ListItem.Title style={{fontSize: 10}}>
          {`${item.displayName} ${item.userId == uid ? '(Admin)' : ''}`}
        </ListItem.Title>
      </ListItem.Content>
      {item.userId !== uid ? (
        <View style={([styles.bannerBottom], {flexDirection: 'row'})}>
          {item?.removed ? (
            <Button
              title="Removed"
              buttonStyle={[styles.acceptReject, {backgroundColor: '#18224f'}]}
              disabled={true}
            />
          ) : (
            <>
            <Button
              title="Remove"
              buttonStyle={[styles.acceptReject, {backgroundColor: '#18224f'}]}
              onPress={() => {
                removeFollower(item.ref, index);
              }}
            />
            
            <Button
              title={blockers.includes(item.userId) ? 'Un-Block' : 'Block'}
              buttonStyle={[styles.acceptReject, {backgroundColor: '#18224f'}]}
              onPress={() => {
                blockFollower(item.ref,item.userId,item?.displayName, index);
              }}
            />
            </>
          )}
        </View>
      ) : null}
    </ListItem>
  );

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: '5%',
        backgroundColor: '#ffffff',
        paddingTop: vScale(50),
      }}>
      <Text
        style={{
          alignSelf: 'center',
          fontSize: 18,
          fontWeight: 'bold',
          paddingBottom: vScale(10),
          textDecorationLine: 'underline',
        }}>
        Followers
      </Text>
      {loader ? (
        <Loader />
      ) : error ? (
        <Error />
      ) : (
        <FlatList
          data={followers}
          renderItem={renderItem}
          keyExtractor={(item) => item.userId}
          ListEmptyComponent={
            <EmptyListText style={{height: heightPercentageToDP(80)}} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    height: mScale(50),
    width: mScale(50),
    borderRadius: mScale(25),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d9d9d9',
    padding: 0,
    margin: 0,
  },
  bannerBottom: {
    flexDirection: 'row',
    marginBottom: 5,
    marginRight: 20,
    alignSelf: 'flex-end',
    marginTop: vScale(2),
  },
  acceptReject: {
    padding: 0,
    minWidth: scale(80),
    margin: 5,
    paddingHorizontal: scale(8),
    borderRadius: mScale(10),
  },
});

export default Followers;

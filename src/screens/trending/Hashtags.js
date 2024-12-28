import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {Icon} from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import {useDispatch, useSelector} from 'react-redux';

import {scale, mScale, vScale} from '../../configs/size';
import Header from '../../components/header';
import EmptyListText from '../../components/emptyListText';
import {tStyle} from '../../configs/textStyle';
import Drawer from '../../components/drawer';
import AppModalView from '../../components/appModal/AppModalView';

const {height, width} = Dimensions.get('window');

const Hashtags = ({navigation}) => {
  const [hashtagList, setHashtagList] = useState([]);
  const [optionSelected, setOptionSelected] = useState(-1);
  const [showModal, setShowModal] = useState(false);

  const userProfile = useSelector((state) => state?.user?.userProfile);

  const drawerVisible = useSelector((state) => state.root.drawer);
  const dispatch = useDispatch();

  useEffect(() => {
    
    var startOfToday = new Date(); 
    startOfToday.setHours(0,0,0,0);
    var unixStartOfTheDay = startOfToday.getTime();

    
    var endOfToday = new Date(); 
    endOfToday.setHours(23,59,59,999);
    var unixEndOfTheDay = endOfToday.getTime();


    firestore()
      .collection('Hashtags')
      .where('date','>=', unixStartOfTheDay)
      .where('date', '<=', unixEndOfTheDay)
      // .orderBy('count', 'desc')
      .limit(10)
      .onSnapshot(
        (snap) => {
          var tempArr = [];
          snap.docs.map((doc) => tempArr.push({id: doc.id, ...doc.data()}));

          tempArr.sort((a, b) => Number(b.count) - Number(a.count));

          setHashtagList(tempArr);
        },
        (err) => console.log('err', err),
      );
  }, []);

  const renderCount = (num) => {
    if (num > 999999) return `${num * 0.000001}m`;
    else if (num > 999) return `${num * 0.001}k`;
    else return num;
  };

  const reportHashtag = (id, title) => {
    setOptionSelected(-1);
    try {
      const ref = firestore().collection('Hashtags').doc(id);
      const reportRef = ref.collection('Reports').doc(userProfile?.userId);
      reportRef.get().then((snap) => {
        if (snap.exists) alert('You already reported this hashtag.');
        else {
          const body = {
            id: userProfile?.userId,
            profileUrl: userProfile?.profileUrl,
            displayName: userProfile?.displayName,
          };
          const batch = firestore().batch();
          batch.set(reportRef, body);
          batch.update(ref, {
            reportCount: firestore.FieldValue.increment(1),
            isReported: true,
          });
          batch.commit();
        }
      });
    } catch (err) {
      console.log('err', err);
    }
  };

  const renderModal = (id, title ) => {
    
    return(
    <AppModalView
        visible={showModal}>
        <View style={{ paddingHorizontal: 30, paddingRight: 20, paddingTop: 15, paddingBottom: 40, backgroundColor: '#fff' }}>
          
          {
            <TouchableOpacity
            onPress={() =>{
              setShowModal(false)
              reportHashtag(id, title)
            }}
            style={styles.modalButton}>
            <Text
            style={styles.modalText}>
            Report
            </Text>
          </TouchableOpacity>
          }
          <TouchableOpacity
            onPress={() =>{ setShowModal(false)}}
            style={styles.modalButton}>
            <Text
            style={styles.modalText}>
            Cancel
            </Text>
          </TouchableOpacity>

          
        </View>
      </AppModalView>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header navigation={navigation} />
      {/* <Drawer navigation={navigation} /> */}
      <Text style={styles.text1}>Trending</Text>
      {hashtagList.length > 0 ? (
        hashtagList.map((item, i) => (
          <TouchableOpacity
            style={styles.hashtagWrapper}
            onPress={() => {
              setOptionSelected(-1);
              navigation.navigate('TrendingPosts', {title: item?.title});
            }}>
            <View style={{flex: 1}}>
              <Text style={styles.text2}>#{item?.title}</Text>
              <Text style={styles.text3}>
                {renderCount(item?.count || 0)} circulating
              </Text>
            </View>
            <TouchableOpacity
            onPress={() => {
              setShowModal(true);
              setOptionSelected(i)
            }}>
              <Icon
                name="ellipsis-vertical"
                type="ionicon"
                size={14}
                color="#333"
                style={{padding: 5}}
              />
            </TouchableOpacity>
            {optionSelected == i && (
              
              renderModal(item?.id, item?.title)
              
            )}
          </TouchableOpacity>
        ))
      ) : (
        <EmptyListText
          title="No trends on Citizens. Start one yourself!"
          style={{
            height: height * 0.75,
            width: width * 0.9,
            alignSelf: 'center',
          }}
          titleStyle={{
            ...tStyle('700', 20, 28, '#777777'),
            textAlign: 'center',
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: vScale(15),
  },
  text1: {
    fontSize: mScale(18),
    color: '#19234D',
    marginTop: vScale(20),
    marginLeft: scale(25),
    fontWeight: 'bold',
  },
  hashtagWrapper: {
    marginLeft: scale(30),
    marginRight: scale(15),
    marginTop: vScale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text2: {
    fontSize: mScale(16),
    fontWeight: 'bold',
    color: '#333333',
  },
  text3: {
    fontSize: mScale(13),
    color: '#333333',
  },
  btn: {
    position: 'absolute',
    right: scale(20),
    top: vScale(10),
    borderColor: '#8c8c8c',
    borderWidth: 1,
    borderRadius: scale(5),
    padding: scale(5),
    paddingVertical: vScale(2),
  },
  modalButton: {
    height: 40, width: '100%',
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15
  },
  modalText: {
    fontSize: 14,
    fontWeight: '500'
  }
});

export default Hashtags;

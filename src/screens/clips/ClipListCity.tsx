import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StatusBar,
  Platform,
  Pressable,
  Text,
} from 'react-native';
import Clip from '../../components/clips/clip';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TabBarHeight} from '../../routes/bottomtab';
import {vScale} from '../../configs/size';
import firestore from '@react-native-firebase/firestore';
import {getPartOfList} from '../../backend/paginatedList';
import errorLog from '../../Constants/errorLog';
import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import {useSelector} from 'react-redux';
import {Icon} from 'react-native-elements';
import {tStyle} from '../../configs/textStyle';

const LimitNum = 10;

const ClipListCity = ({navigation, route}) => {
  const {bottom, top} = useSafeAreaInsets();
  const [currendInd, setCurrentInd] = useState(0);
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastDoc, setLastDoc] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const { cityId } = route?.params;
  const bottomHeight =
    Platform.OS == 'ios'
      ? bottom + TabBarHeight + vScale(10)
      : bottom + TabBarHeight;

  const userInfo = useSelector((state) => state.user.userProfile);

  useEffect(() => {
    getClips();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setCurrentInd(0);

      return () => {
        console.log('unfocus');
        setCurrentInd(-1);
      };
    }, []),
  );

  const getClips = async () => {
    try {
      setRefreshing(true);
      const _2daysago = Date.now() - (2 * 24 * 60 * 60 * 1000);
      const ref = firestore()
        .collection('Clips')
        .where('isHidden', '==', false)
        .where('cityId', '==', cityId)
        .where('date','>=',_2daysago)
        .orderBy('date', 'desc')
        .orderBy('activityCount', 'desc')
        .limit(LimitNum);
      const res = await getPartOfList({ref, limitNum: LimitNum});
      const {list, lastDoc} = res;
      const clip_create_today = moment().startOf('today').format('D-M-y');
      const clip_create_yesterday = moment().subtract(1, 'day').format('D-M-y');



      let clips_today = [];
      let clips_yesterday = [];
      let newArray = [];

      for (var i = list.length - 1; i >= 0; i--) {
        
        if(moment(list[i].date).format('D-M-y') == clip_create_today){
          clips_today.push(list[i]);
        }else{
          clips_yesterday.push(list[i]);
        }
        
      }

     
      const sortedProductsDsc= clips_today.sort((a,b)=>{
        
        return parseInt(b.activityCount)  - parseInt(a.activityCount);
     })

     let newlist = clips_today.concat(clips_yesterday);


    


      setClips(newlist);
      setLastDoc(lastDoc);
      setRefreshing(false);
    } catch (error) {
      setError(true);
      setRefreshing(false);
      errorLog('getting first set of Scenes', error);
    }
  };

  const _onViewableItemsChanged = useRef(({viewableItems, changed}) => {
    //console.log('viewableItems', viewableItems);
   // console.log('changed', changed);
    if (viewableItems.length > 0) {
      console.log('viewableItems' + viewableItems[0]?.index)
      setCurrentInd(viewableItems[0]?.index);
    }
  });

  const viewConfigRef = React.useRef({viewAreaCoveragePercentThreshold: 50});

  const renderClip = ({item, index}) => {
    console.log('index != currendInd' +  index + '  ' + currendInd)
    return <Clip
    cityOne={true}
      paused={
        index != currendInd
      }
      clip={item}
      bottomHeight={bottomHeight}
      navigatee={(route, params) => {
        setCurrentInd(-1);
        navigation.navigate(route, params);
      }}
      navigate={() => {
        setCurrentInd(-1);
        navigation.navigate('NewClip');
      }}
      reportClip={() => reportClip(item?.id)}
    />

  }

  const reportClip = (id) => {
    try {
      const ref = firestore().collection('Clips').doc(id);
      const reportRef = ref.collection('Reports').doc(userInfo?.userId);
      reportRef.get().then((snap) => {
        if (snap.exists) alert('You already reported this clip.');
        else {
          const body = {
            id: userInfo?.userId,
            profileUrl: userInfo?.profileUrl,
            displayName: userInfo?.displayName,
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

  const renderCreateBtn = () => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: vScale(667),
      }}>
      <Text style={{...tStyle('400', 24, 30, '#000')}}>Create</Text>
      <Pressable
        style={{
          marginTop: vScale(8),
          width: vScale(28),
          height: vScale(28),
          borderRadius: vScale(14),
          backgroundColor: '#1c2143',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => {
          navigation.navigate('NewClip');
        }}>
        <Icon name={'add'} type="Ionicon" size={vScale(18)} color={'#fff'} />
      </Pressable>
    </View>
  );

  return (
    <View style={{flex: 1, marginTop: top}}>
      <StatusBar backgroundColor={'#000000'} />
      <FlatList
        data={clips}
        renderItem={renderClip}
        showsVerticalScrollIndicator={false}
        snapToInterval={Dimensions.get('window').height - bottomHeight}
        snapToAlignment={'start'}
        decelerationRate={'fast'}
        onViewableItemsChanged={_onViewableItemsChanged.current}
        keyExtractor={(item, index) => {
          return `${item.id}-${index}`;
        }}
        getItemLayout={(data, index) => {
         
          const ITEM_HEIGHT = Dimensions.get('window').height - bottomHeight;
        
          return {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index};
        }}
        // viewabilityConfig={{
        //   itemVisiblePercentThreshold: 50,
        //   waitForInteraction: false,
        // }}
        viewabilityConfig={viewConfigRef.current}
        refreshing={refreshing}
        onRefresh={getClips}
        ListEmptyComponent={renderCreateBtn}
      />
    </View>
  );
};

export default ClipListCity;

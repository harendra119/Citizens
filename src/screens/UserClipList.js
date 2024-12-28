import React, {useState, useRef} from 'react';
import {View, Platform, StatusBar, FlatList, Dimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Clip from '../components/clips/clip';
import {scale, vScale, mScale} from '../configs/size';
// import {TabBarHeight} from '../routes/bottomtab';

const UserClipList = ({
  clipList,
  initialIndex,
  getMoreClips,
  newClipNavigate,
  closeModal,
  removeClipFromList,
  isMyClip = false,
}) => {
  const [currendInd, setCurrentInd] = useState(0);
  const {bottom, top} = useSafeAreaInsets();

  const bottomHeight = Platform.OS == 'ios' ? bottom + vScale(10) : bottom;

  const _onViewableItemsChanged = useRef(({viewableItems, changed}) => {
    if (viewableItems.length > 0) {
      setCurrentInd(viewableItems[0]?.index);
    }
  });
  const viewConfigRef = useRef({viewAreaCoveragePercentThreshold: 50});

  const renderClip = ({item, index}) => (
    <Clip
      paused={
        index != currendInd
        // false
      }
      clip={item}
      bottomHeight={bottomHeight}
      paddingBottom={true}
      navigate={() => {
        setCurrentInd(-1);
        newClipNavigate();
      }}
      navigatee={closeModal}
      isMyClip={isMyClip}
      removeClipFromList={removeClipFromList}
      hideCameraIcon={true}
    />
  );

  return (
    <View style={{flex: 1, marginTop: top}}>
      <StatusBar backgroundColor={'#000000'} />
      <FlatList
        data={clipList}
        renderItem={renderClip}
        initialScrollIndex={initialIndex}
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
          // console.log({
          //   length: ITEM_HEIGHT,
          //   offset: ITEM_HEIGHT * index,
          //   index,
          // });
          return {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index};
        }}
        // viewabilityConfig={{
        //   itemVisiblePercentThreshold: 50,
        //   waitForInteraction: false,
        // }}
        viewabilityConfig={viewConfigRef.current}
        onEndReached={getMoreClips}
      />
    </View>
  );
};

export default UserClipList;

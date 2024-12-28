import React, {useState} from 'react';
import {Modal} from 'react-native';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {mScale, scale, vScale} from '../../configs/size';
import StoryView from './StoryView';

const StorySize = 60;

export const dummyStories = [
  {
    preview:
      'https://kidscreen.com/wp/wp-content/uploads/2018/11/OggyandtheCockroaches.jpg',
    mediaList: [
      {
        type: 'image',
        uri: 'https://kidscreen.com/wp/wp-content/uploads/2018/11/OggyandtheCockroaches.jpg',
      },
      {
        type: 'image',
        uri: 'https://kidscreen.com/wp/wp-content/uploads/2018/11/OggyandtheCockroaches.jpg',
      },
    ],
    user: {
      displayName: 'Tushar Sharma',
      profileUrl:
        'https://kidscreen.com/wp/wp-content/uploads/2018/11/OggyandtheCockroaches.jpg',
    },
    lastUpdatedAt: 1644489111986,
  },
  {
    preview:
      'https://kidscreen.com/wp/wp-content/uploads/2018/11/OggyandtheCockroaches.jpg',
    mediaList: [
      {
        type: 'image',
        uri: 'https://kidscreen.com/wp/wp-content/uploads/2018/11/OggyandtheCockroaches.jpg',
      },
      {
        type: 'image',
        uri: 'https://kidscreen.com/wp/wp-content/uploads/2018/11/OggyandtheCockroaches.jpg',
      },
    ],
    user: {
      displayName: 'Tushar Sharma',
      profileUrl:
        'https://kidscreen.com/wp/wp-content/uploads/2018/11/OggyandtheCockroaches.jpg',
    },
    lastUpdatedAt: 1644489111986,
  },
  {
    preview:
      'https://kidscreen.com/wp/wp-content/uploads/2018/11/OggyandtheCockroaches.jpg',
    mediaList: [
      {
        type: 'image',
        uri: 'https://kidscreen.com/wp/wp-content/uploads/2018/11/OggyandtheCockroaches.jpg',
      },
      {
        type: 'image',
        uri: 'https://kidscreen.com/wp/wp-content/uploads/2018/11/OggyandtheCockroaches.jpg',
      },
    ],
    user: {
      displayName: 'Tushar Sharma',
      profileUrl:
        'https://kidscreen.com/wp/wp-content/uploads/2018/11/OggyandtheCockroaches.jpg',
    },
    lastUpdatedAt: 1644489111986,
  },
];

const RenderPreview = ({item}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const closeModal = () => {
    setModalVisible(false);
  };
  return (
    <>
      <TouchableOpacity
        style={styles.previewCont}
        onPress={() => {
          setModalVisible(true);
        }}>
        <Image
          source={{uri: item.preview}}
          style={{
            height: mScale(StorySize),
            width: mScale(StorySize),
            borderRadius: mScale(StorySize / 2),
            backgroundColor: '#d9d9d9',
          }}
        />
      </TouchableOpacity>
      {modalVisible && (
        <Modal onRequestClose={closeModal}>
          <StoryView {...item} closeModal={closeModal} />
        </Modal>
      )}
    </>
  );
};

const Stories = ({data}) => {
  const renderStory = ({item}) => <RenderPreview item={item} />;

  return (
    <View
      style={{
        height: mScale(StorySize + 8),
        width: '100%',
        marginTop: vScale(8),
      }}>
      <FlatList
        data={data}
        style={{
          // flex: 1,

          paddingLeft: '2.5%',
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${index}`}
        renderItem={renderStory}
        ListFooterComponent={() => <View style={{width: vScale(20)}} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  previewCont: {
    justifyContent: 'center',
    alignItems: 'center',
    height: mScale(StorySize + 4),
    width: mScale(StorySize + 4),
    borderWidth: mScale(1),
    borderRadius: mScale(StorySize / 2 + 2),
    borderColor: 'green',
    marginRight: mScale(8),
  },
});

export default Stories;

import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import moment from 'moment';
import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {mScale, scale, vScale} from '../../configs/size';
import {defaultAlert} from '../../Constants/errorLog';
import EmptyListLoader from '../emptyListLoader';
import EmptyListText from '../emptyListText';
import RoundImage from '../roundImage';

const ClipMenu = ({
  clipId,
  bottom,
  closeMenuModal,
  isMyClip,
  removeClipFromList,
  videoUri,
  reportClip,
}) => {
  const [deleting, setDeleting] = useState(false);

  const deleteClip = async () => {
    try {
      setDeleting(true);
      const ref = storage().refFromURL(videoUri);
      await ref.delete();
      await firestore().collection('Clips').doc(clipId).delete();
      removeClipFromList(clipId);
      setDeleting(false);
    } catch (error) {
      setDeleting(false);
      defaultAlert('deleting your clip');
    }
  };

  return (
    <View
      style={{
        marginBottom: bottom,
        height: '100%',
      }}>
      <TouchableOpacity
        style={styles.itemCont}
        onPress={async () => {
          await reportClip();
          Alert.alert('Citizens', 'Thanks for your feedback!', [
            {
              text: 'OK',
              onPress: () => {
                closeMenuModal();
              },
            },
          ]);
        }}>
        <Text style={[styles.title]}>Report</Text>
      </TouchableOpacity>

      {isMyClip ? (
        deleting ? (
          <ActivityIndicator size={'small'} color={'#000'} />
        ) : (
          <TouchableOpacity onPress={deleteClip} style={styles.itemCont}>
            <Text style={styles.title}>Delete</Text>
          </TouchableOpacity>
        )
      ) : null}
    </View>
  );
};

export default ClipMenu;

const styles = StyleSheet.create({
  commentCont: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    // paddingHorizontal: scale(20),
    width: '100%',
    marginBottom: vScale(10),
  },
  displayName: {
    fontSize: mScale(14),
    fontWeight: 'bold',
  },
  profileImage: {marginRight: scale(10)},
  comment: {
    fontSize: mScale(14),
    // marginTop: vScale(2),
  },
  createdAt: {
    fontSize: mScale(10),
    color: '#797979',
    marginTop: vScale(2),
  },
  title: {
    fontSize: mScale(18),
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  lineBreak: {
    height: vScale(0.7),
    backgroundColor: '#797979',
    width: '100%',
    marginTop: vScale(8),
  },
  itemCont: {
    paddingBottom: vScale(4),
    borderBottomWidth: 0.2,
    marginBottom: vScale(15),
  },
});

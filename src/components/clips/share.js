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
} from 'react-native';
import {Icon} from 'react-native-elements';
import {mScale, scale, vScale} from '../../configs/size';
import EmptyListLoader from '../emptyListLoader';
import EmptyListText from '../emptyListText';
import RoundImage from '../roundImage';

const ShareClip = ({clipId, bottom}) => {
  const [input, setInput] = useState();

  const publishComment = () => {};

  const renderInput = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        borderColor: '#1e2348',
        borderWidth: 1,
        borderRadius: mScale(15),
        paddingHorizontal: scale(10),
        backgroundColor: '#ffffff',
        height: vScale(80),
        marginTop: vScale(15),
      }}>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Your thoughts ..."
        style={{width: scale(300)}}
      />
      <TouchableOpacity
        style={{
          height: scale(30),
          width: scale(30),
          borderRadius: scale(15),
          backgroundColor: 'green',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={publishComment}>
        <Icon
          name="caret-forward"
          type="ionicon"
          size={vScale(22)}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={{
        marginBottom: bottom,
        height: '100%',
      }}>
      <Text style={styles.title}>Share this Clip</Text>
      {/* <View style={styles.lineBreak} /> */}
      {renderInput()}
    </View>
  );
};

export default ShareClip;

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
});

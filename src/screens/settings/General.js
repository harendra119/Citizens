import React, {useState, useEffect} from 'react';
import {View, Text, Switch, StyleSheet, TouchableOpacity} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useSelector} from 'react-redux';
import messaging from '@react-native-firebase/messaging';

import {vScale, scale, mScale} from '../../configs/size';

const General = ({navigation}) => {
  const [optionSelected, setOptionSelected] = useState([]);
  const [tick, setTick] = useState(0);

  const userId = useSelector((state) => state.user?.userProfile?.userId);

  const options = [
    {
      type: 'follow',
      text: 'Enable Follow Me',
    },
    {
      type: 'notifications',
      text: 'Send Me Notifications',
    },
    {
      type: 'soundNotifications',
      text: 'Enable Sound Notifications',
    },
  ];

  const toggleSwitch = (val) => {
    var tempArr = optionSelected;
    if (tempArr.indexOf(val) < 0) tempArr.push(val);
    else tempArr.splice(tempArr.indexOf(val), 1);
    setOptionSelected(tempArr);
    setTick(tick + 1);
  };

  const onSave = async () => {
    var body = {};
    options.forEach((item) => {
      body[item.type] = optionSelected.includes(item.type);
    });
    firestore()
      .collection('Users')
      .doc(userId)
      .get()
      .then((snap) => {
        snap.ref.update({generalSettings: body});
      })
      .then(() => navigation.goBack())
      .catch((err) => console.log('err', err));
  };

  useEffect(() => {
    firestore()
      .collection('Users')
      .doc(userId)
      .get()
      .then((snap) => {
        var data = snap.data()?.generalSettings;
        if (data) {
          var tempArr = [];
          Object.keys(data).forEach((key) => {
            if (data[key]) tempArr.push(key);
          });
          setOptionSelected(tempArr);
        }
      })
      .catch((err) => console.log('err', err));
  }, []);

  return (
    <View style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.text1}>General Settings</Text>
      <Text style={styles.text2}>
        Update your login preferences to help us personalize your experience.
      </Text>
      <View style={{marginTop: vScale(5)}}>
        {options.map((option, i) => (
          <View style={styles.options} key={i.toString()}>
            <Text style={styles.text3}>{option.text}</Text>
            <Switch
              trackColor={{false: '#c9c9c9', true: '#181d4d'}}
              thumbColor={
                optionSelected.includes(option.type) ? '#FFF' : '#828282'
              }
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => toggleSwitch(option.type)}
              value={optionSelected.includes(option.type)}
            />
          </View>
        ))}
      </View>
      <View style={styles.btnWrapper}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.text4}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
          <Text style={styles.text4}>Save</Text>
        </TouchableOpacity>
      </View>
      {/* <View style={styles.btmContainer}>
        <Text style={styles.text5}>Account Changes</Text>
        <Text style={styles.text6}>Hide your post and profile</Text>
        <Text style={styles.text6}>Delete your account and data</Text>
        <View style={styles.btnWrapper2}>
          <TouchableOpacity style={styles.cancelBtn}>
            <Text style={styles.text7}>Deactivate account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn}>
            <Text style={styles.text7}>Close account</Text>
          </TouchableOpacity>
        </View>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: vScale(15),
  },
  text1: {
    fontWeight: 'bold',
    fontSize: mScale(20),
    color: '#4d4d4d',
  },
  text2: {
    fontSize: mScale(14),
    color: '#8b8b8b',
  },
  options: {
    paddingVertical: vScale(15),
    borderBottomWidth: 1,
    borderColor: '#bfbfbf',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text3: {
    fontWeight: 'bold',
    fontSize: mScale(16),
    color: '#272727',
  },
  btnWrapper: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: vScale(15),
  },
  cancelBtn: {
    backgroundColor: '#bdbdbd',
    paddingHorizontal: scale(20),
    paddingVertical: vScale(4),
    borderRadius: scale(20),
    marginRight: scale(8),
  },
  saveBtn: {
    backgroundColor: '#18224f',
    paddingHorizontal: scale(20),
    paddingVertical: vScale(4),
    borderRadius: scale(20),
  },
  text4: {
    fontSize: mScale(16),
    color: '#FFF',
  },
  btmContainer: {
    backgroundColor: '#ebebeb',
    borderRadius: scale(10),
    padding: vScale(10),
    paddingLeft: scale(15),
    marginTop: vScale(15),
  },
  text5: {
    fontSize: mScale(16),
    color: '#4d4d4d',
    fontWeight: 'bold',
  },
  text6: {
    fontSize: mScale(14),
    color: '#8b8b8b',
  },
  btnWrapper2: {
    flexDirection: 'row',
    marginTop: vScale(10),
  },
  text7: {
    fontSize: mScale(12),
    color: '#FFF',
  },
});

export default General;

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {RadioButton, Checkbox} from 'react-native-paper';
import {useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';

import {vScale, scale, mScale} from '../../configs/size';

const Notifications = ({navigation}) => {
  const [allEmails, setAllEmails] = useState(true);
  const [optionSelected, setOptionSelected] = useState([]);
  const [otherOptionSelected, setOtherOptionSelected] = useState([]);
  const [tick, setTick] = useState(0);

  const userId = useSelector((state) => state.user?.userProfile?.userId);

  const options = [
    {
      type: 'friendRequests',
      text: 'Friend Requests',
    },
    {
      type: 'pageInvites',
      text: 'Page Invites',
    },
    {
      type: 'postActivity',
      text: 'Activity on my post',
    },
    {
      type: 'welcome',
      text: 'Welcome emails',
    },
    {
      type: 'announcement',
      text: 'Service announcements',
    },
  ];

  const otherOptions = [
    {
      type: 'friendRequests',
      text: 'Friend Requests',
    },
    {
      type: 'follow',
      text: 'Following Activity',
    },
    {
      type: 'pageInvites',
      text: 'Page Invites',
    },
    {
      type: 'messages',
      text: 'Messages',
    },
    {
      type: 'mentions',
      text: 'Mentions',
    },
    {
      type: 'pageActivity',
      text: 'Activity on my page',
    },
    {
      type: 'postActivity',
      text: 'Activity on my post',
    },
    // {
    //   type: 'birthday',
    //   text: 'Birthday',
    // },
  ];

  const optionSelectHandler = (val) => {
    var tempArr = optionSelected;
    if (tempArr.indexOf(val) < 0) tempArr.push(val);
    else tempArr.splice(tempArr.indexOf(val), 1);
    setOptionSelected(tempArr);
    setTick(tick + 1);
  };

  const otherOptionSelectHandler = (val) => {
    var tempArr = otherOptionSelected;
    if (tempArr.indexOf(val) < 0) tempArr.push(val);
    else tempArr.splice(tempArr.indexOf(val), 1);
    setOtherOptionSelected(tempArr);
    setTick(tick + 1);
  };

  const onSave = async () => {
    var body = {
      allEmails: allEmails,
      email: {},
      other: {},
    };
    options.forEach((item) => {
      body.email[item.type] = optionSelected.includes(item.type);
    });
    otherOptions.forEach((item) => {
      body.other[item.type] = otherOptionSelected.includes(item.type);
    });
    firestore()
      .collection('Users')
      .doc(userId)
      .get()
      .then((snap) => {
        snap.ref.update({notificationSettings: body});
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
        var data = snap.data()?.notificationSettings;
        var emailData = data?.email;
        var otherData = data?.other;
        if (data) {
          var tempArr = [];
          var tempArr2 = [];
          Object.keys(emailData).forEach((key) => {
            if (emailData[key]) tempArr.push(key);
          });
          Object.keys(otherData).forEach((key) => {
            if (otherData[key]) tempArr2.push(key);
          });
          setOptionSelected(tempArr);
          setOtherOptionSelected(tempArr2);
          setAllEmails(data?.allEmails);
        }
      })
      .catch((err) => console.log('err', err));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text1}>Notification Settings</Text>
      <View>
        <View style={styles.row}>
          <RadioButton.Android
            value={allEmails}
            status={allEmails ? 'checked' : 'unchecked'}
            onPress={() => setAllEmails(true)}
            color="#18254e"
          />
          <Text style={styles.text3}>
            Send me emails about my activity except for the notification emails
            that I unsubscribed from
          </Text>
        </View>
        <View style={styles.row}>
          <RadioButton.Android
            value={!allEmails}
            status={!allEmails ? 'checked' : 'unchecked'}
            onPress={() => setAllEmails(false)}
            color="#18254e"
          />
          <Text style={styles.text3}>
            Only send me required services announcements
          </Text>
        </View>
      </View>
      <View style={{marginTop: vScale(15)}}>
        <Text style={styles.text2}>
          I'd like to receive emails and updates from Citizens about
        </Text>
        {options.map((option, i) => (
          <View style={styles.row} key={i.toString()}>
            <Checkbox.Android
              status={
                optionSelected.includes(option.type) ? 'checked' : 'unchecked'
              }
              onPress={() => optionSelectHandler(option.type)}
              uncheckedColor="#8b8b8b"
              color="#18254e"
            />
            <Text style={styles.text3}>{option.text}</Text>
          </View>
        ))}
      </View>
      <View style={{marginTop: vScale(15)}}>
        <Text style={styles.text2}>Notification</Text>
        {otherOptions.map((option, i) => (
          <View style={styles.row} key={i.toString()}>
            <Checkbox.Android
              status={
                otherOptionSelected.includes(option.type)
                  ? 'checked'
                  : 'unchecked'
              }
              onPress={() => otherOptionSelectHandler(option.type)}
              uncheckedColor="#8b8b8b"
              color="#18254e"
            />
            <Text style={styles.text3}>{option.text}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: vScale(15),
    paddingRight: scale(80),
  },
  text1: {
    fontWeight: 'bold',
    fontSize: mScale(20),
    color: '#4d4d4d',
    marginBottom: vScale(5),
  },
  text2: {
    fontSize: mScale(15),
    color: '#202020',
    fontWeight: 'bold',
  },
  text3: {
    fontSize: mScale(14),
    color: '#8b8b8b',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vScale(5),
  },
  btnWrapper: {
    flexDirection: 'row',
    marginTop: vScale(15),
  },
  cancelBtn: {
    backgroundColor: '#bdbdbd',
    paddingHorizontal: scale(20),
    paddingVertical: vScale(4),
    borderRadius: scale(20),
    marginRight: scale(15),
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
});

export default Notifications;

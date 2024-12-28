import React from 'react';
import {StyleSheet, ScrollView, View, Text} from 'react-native';
import {Icon} from 'react-native-elements';
import {SafeAreaView} from 'react-native-safe-area-context';
import {mScale, scale, vScale} from '../configs/size';
import {tStyle} from '../configs/textStyle';
import privacyText from '../Constants/privacyText';
import termsText from '../Constants/termsText';

const PrivacyPolicy = ({navigation}) => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <View style={styles.row}>
          <Icon
            name={'arrow-back'}
            type="Ionicon"
            size={mScale(20)}
            color={'#000'}
            onPress={() => {
              navigation.goBack();
            }}
          />
          <Text style={styles.header}>Privacy Policy</Text>
        </View>
        <ScrollView style={styles.scrollCont}>
          {privacyText.map((item) => (
            <View>
              <Text style={styles.heading}>{item.heading}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: scale(20),
    paddingTop: vScale(10),
  },
  scrollCont: {
    marginTop: vScale(20),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    ...tStyle('800', 20, 26, '#000'),
    marginLeft: scale(10),
  },
  heading: {
    ...tStyle('800', 18, 24, '#888888'),
    marginVertical: vScale(10),
  },
  body: {
    ...tStyle('800', 14, 18, '#000'),
  },
});

export default PrivacyPolicy;

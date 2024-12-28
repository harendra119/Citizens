import React from 'react';
import {View} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import TopTrendingPosts from './TopTrendingPosts';
import LatestTrendingPosts from './LatestTrendingPosts';
import Header from '../../../components/header';

const Tab = createMaterialTopTabNavigator();

const TrendingPosts = ({navigation, route}) => {
  return (
    <View style={{flex: 1, backgroundColor: '#FFF'}}>
      <Header navigation={navigation} />
      <Tab.Navigator>
        <Tab.Screen name="Top">
          {() => <TopTrendingPosts navigation={navigation} route={route} />}
        </Tab.Screen>
        <Tab.Screen name="Latest">
          {() => <LatestTrendingPosts navigation={navigation} route={route} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
};

export default TrendingPosts;

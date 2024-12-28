import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Hashtags from './Hashtags';
import TrendingPosts from './trendingPosts';

const Stack = createStackNavigator();

const Trending = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Hashtags" component={Hashtags} />
      <Stack.Screen name="TrendingPosts" component={TrendingPosts} />
    </Stack.Navigator>
  );
};

export default Trending;

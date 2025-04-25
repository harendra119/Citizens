import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import ActivismMain from './ActivismMain';
import ActivismDetails from './ActivismDetails';
import CreateActivism from './CreateActivism';
import Followers from './Followers';
import CreateEvent from './CreateEvent';
import EventDetails from './EventDetails';
import CityList from '../cities/CityList';
import CityDetails from '../cities/CityDetails';
import ClipListCity from '../clips/ClipListCity';
import TwitterAlerts from '../twiitterAlerts/TwitterAlerts';

const Stack = createStackNavigator();

const Activism = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="CityList" component={CityList} />
      <Stack.Screen name="ActivismMain" component={ActivismMain} />
      <Stack.Screen name="ActivismDetails" component={ActivismDetails} />
      <Stack.Screen name="CityDetails" component={CityDetails} />
      <Stack.Screen name="TwitterAlerts" component={TwitterAlerts} />
      <Stack.Screen name="CreateActivism" component={CreateActivism} />
      <Stack.Screen name="CreateEvent" component={CreateEvent} />
      <Stack.Screen name="Followers" component={Followers} />
      <Stack.Screen name="EventDetails" component={EventDetails} />
       <Stack.Screen name="ClipListCity" component={ClipListCity} />
    </Stack.Navigator>
  );
};

export default Activism;

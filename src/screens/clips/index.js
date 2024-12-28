import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import ClipList from './ClipList';
import NewClip from './NewClip';
import EditClip from './EditClip';
import Play from './Play';

const Stack = createStackNavigator();

const ClipsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="ClipList" component={ClipList} />
      <Stack.Screen name="NewClip" component={NewClip} />
      <Stack.Screen name="EditClip" component={EditClip} />
      <Stack.Screen name="Play" component={Play} />
    </Stack.Navigator>
  );
};

export default ClipsStack;

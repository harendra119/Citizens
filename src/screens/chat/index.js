import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {Overlay} from 'react-native-elements';
import {useSelector} from 'react-redux';
import ChatList from './Chatlist';
import SingleChat from './SingleChat';

const Stack = createStackNavigator();

const ChatStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={'ChatList'}
        component={ChatList}
        options={{headerTitle: 'Messages', headerTitleAlign: 'center'}}
      />
      <Stack.Screen name={'SingleChat'} component={SingleChat} />
    </Stack.Navigator>
  );
};

export default ChatStack;

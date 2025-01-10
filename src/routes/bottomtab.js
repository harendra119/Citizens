//import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import * as React from 'react';
import {View, Text, Image} from 'react-native';
import {Icon, Avatar} from 'react-native-elements';


import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {useDispatch, useSelector} from 'react-redux';
import profileRoutes from './profileRoute';
import Home from './homeRoutes';
import {getFirends, getFollowing} from '../backend/apis';
import database from '@react-native-firebase/database';

import Activism from '../screens/activism';
import {mScale, scale, vScale} from '../configs/size';
import Trending from '../screens/trending';
import ClipsStack from '../screens/clips';
import Notifications from '../screens/notifications';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';

const Tab = createMaterialBottomTabNavigator();

export const TabBarHeight = vScale(54);

const WorkInprogress = () => {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Work in progress</Text>
    </View>
  );
};
export default function App() {

  const theme = useTheme();
theme.colors.secondaryContainer = "transperent"
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.userId);
  const feeds = useSelector((state) => state.feeds);
  return (
    <Tab.Navigator
      labeled={true}
      shifting={true}
      activeColor="#1c2143"
      initialRouteName="feed"
      tabBarOptions={{tabBarVisible: false}}
      
      barStyle={{
        
        backgroundColor: '#ffffff',
        borderTopWidth: 0.5,
        borderTopColor: '#808080',
        overflow: 'hidden',
        paddingBottom: 20,
        height: 80
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        listeners={{
          tabPress: (e) => {
            // Prevent default action
            // e.preventDefault();

            dispatch({type: 'scrollToTop'});
            getFirends(userId).then((data) => {
              if (data.success) {
                getFollowing(userId).then((following) => {
                  let onlyMine = false;
                  database()
                    .ref('/posts')
                    // limitToLast(7).
                    .on('value', (snapshot) => {
                      let tempFeed = [];
                      let prevFeedLength = feeds.length;
                      // this.props.addFeeds(tempFeed)
                      snapshot.forEach((child) => {
                        if (child.val().title != null) {
                          if (
                            child.val().access == 'public' &&
                            onlyMine == false
                          ) {
                            //     console.log(followers,'-----')
                            for (
                              let i = 0;
                              i < following.data.following.length;
                              i++
                            ) {
                              if (
                                following.data.following[i].user._id ==
                                child.val().user
                              ) {
                                let data = {
                                  data: child.val(),
                                  key: child.key,
                                };
                                tempFeed = [data].concat(tempFeed);
                                return;
                              }
                            }
                          } else if (
                            child.val().access == 'friends' &&
                            onlyMine == false
                          ) {
                            for (let i = 0; i < data.data.friends.length; i++) {
                              if (
                                data.data.friends[i].user._id ==
                                child.val().user
                              ) {
                                let data = {
                                  data: child.val(),
                                  key: child.key,
                                };
                                tempFeed = [data].concat(tempFeed);

                                break;
                              }
                            }
                          }
                          if (child.val().user == userId) {
                            let data = {
                              data: child.val(),
                              key: child.key,
                            };
                            tempFeed = [data].concat(tempFeed);
                          }
                        }
                        if (child.val().type == 'poll') {
                          let data = {
                            data: child.val(),
                            key: child.key,
                            type: 'poll',
                          };
                          tempFeed = [data].concat(tempFeed);
                        }
                      });

                      if (tempFeed.length > prevFeedLength) {
                        dispatch({type: 'addFeeds', feeds: []});
                        dispatch({type: 'addFeeds', feeds: tempFeed});
                      } else {
                        dispatch({type: 'addFeeds', feeds: tempFeed});
                      }

                      //   console.log('User data: ', snapshot.val());
                    });
                });
              }
            });
          },
        }}
        options={{
          
          tabBarLabel: 'Home',
          tabBarVisible: false,
          tabBarIcon: ({color, focused}) => (
            <Image
              source={require('../assets/home.png')} 
              style = {{
                width: vScale(20),
                height: vScale(20),
                tintColor: focused ? '#1c2143': '#aaa',
                marginTop: vScale(-4),

              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={Trending}
        options={{
          tabBarLabel: 'Explore',
          tabBarVisible: false,
          tabBarIcon: ({color, focused}) => (
            <Image
              source={require('../assets/explore.png')} 
              style = {{
                width: vScale(20),
                height: vScale(20),
                tintColor: focused ? '#1c2143': '#aaa',
                marginTop: vScale(-4),

              }}
            />
          ),
        }}
      />

      <Tab.Screen
        name="CityList"
        screen="CityList"
        
        listeners={{
          tabPress: (e) => {
         
          },
        }}
        component={Activism}
        options={{
          tabBarLabel: 'Cities',
          tabBarVisible: false,
          tabBarIcon: ({color, focused}) => (
            <Image
              source={require('../assets/toronto_icon_smaller.png')} 
              style = {{
                width: vScale(20),
                height: vScale(20),
                tintColor: focused ? '#1c2143': '#aaa',
                marginTop: vScale(-4),

              }}
            />
          ),
        }}
      />

      <Tab.Screen
              name="Notifications"
              listeners={{
                tabPress: (e) => {
                  // Prevent default action
                  // e.preventDefault();
                  //     dispatch({ type: 'changeFIlterState' })
                },
              }}
              component={Notifications}
              options={{
                tabBarLabel: 'Notifications',
                tabBarVisible: false,
              
                tabBarIcon: ({color, focused}) => (
                  <Image
                      source={require('../assets/bell.png')} 
                      style = {{
                        width: vScale(20),
                        height: vScale(20),
                        tintColor: focused ? '#1c2143': '#aaa',
                        marginTop: vScale(-4),

              }}
            />
                ),
              }}
            />

      <Tab.Screen
        name="Scenes"
        listeners={{
          tabPress: (e) => {
            // Prevent default action
            // e.preventDefault();
            //     dispatch({ type: 'changeFIlterState' })
          },
        }}
        component={ClipsStack}
        options={{
          tabBarLabel: 'Scenes',
          tabBarIcon: ({color, focused}) => (
            <Image
              source={require('../assets/scenes.png')} 
              style = {{
                width: vScale(20),
                height: vScale(20),
                tintColor: focused ? '#1c2143': '#aaa',
                marginTop: vScale(-4),

              }}
            />
          ),
        }}
      />

      
    </Tab.Navigator>
  );
}

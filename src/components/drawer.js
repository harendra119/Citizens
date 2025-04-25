import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  TextInput,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import {CachesDirectoryPath} from 'react-native-fs';
import * as RNFS from 'react-native-fs';

// import {} from 'react-native-fs';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';


import { scale, mScale, vScale } from '../configs/size';
import Loader from '../components/loader';


import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { Overlay } from 'react-native-elements';
import { connect } from 'react-redux';

import { Icon, Avatar, ListItem, Button, SearchBar } from 'react-native-elements';
import Header from './header';
import { FlatGrid } from 'react-native-super-grid';
import Utility, { DEVICE_HEIGHT, DEVICE_WIDTH } from '../utils/Utility';
class HeaderClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      showFeedback: false,
      feedback: '',
      loader:false,

    };
    this.toast = React.createRef();

  }

   
  deleteFile = () => {
    console.log(CachesDirectoryPath);
     var path = CachesDirectoryPath;
     return RNFS.unlink(path)
       .then(() => {
        //  console.log('FILE DELETED');
        //  Toast.show({
        //   text1: 'Cache Cleared',
        //   type: 'success',
        // });
       })
       .catch((err) => {
        // Toast.show({
        //   text1: 'Cache does not exist',
        //   type: 'error',
        // });
         console.log('errror : ',err.message);
       });
   };

  getIcon = (name) => {
    var iconName = 'person-outline';
    if (name == 'Friends') iconName = 'people-outline';
    if (name == 'Pages') iconName = 'newspaper-outline';
    if (name == 'Settings') iconName = 'settings-outline';
    if (name == 'Events') iconName = 'calendar-outline';
    if (name == 'Logout') iconName = 'log-out-outline';
    if (name == 'Delete Account') iconName = 'trash';
    if (name == 'Blocked List') iconName = 'ban-outline';
    if (name == 'Onboarding') iconName = 'telescope-sharp';
    if (name == 'Feedback') iconName = 'star';
    if (name == 'Clear Cache') iconName = 'nuclear-outline';

    return (
      <View style={style.wrapper}>
        <Icon name={iconName} type="ionicon" size={hp(4)} color="#1b224d" />
      </View>
    );
  };

 deleteAccount = async () => {
    const user = auth().currentUser;
  
    if (user) {
      const userId = user.uid;
  
      try {
        // Delete user data from all collections
        await this.deleteUserData(userId);
  
        // Finally, delete the user authentication account
        await user.delete();

        this.props.chnageDrawerItem(0);
    this.props.toggoleDrawer();
    this.props.removeUserData();
    
    auth().signOut();
    this.deleteFile();
  
        console.log('User account and data deleted successfully.');
      } catch (error) {
        console.error('Error deleting user data:', error);
      }
    } else {
      console.log('No user is signed in.');
    }
  };


  deleteUserData = async (userId) => {
    const collectionsToDelete = [
      'Clips', 
      'Feedback',
      'Follows',
      'Friends',
      'Hashtags',
      'Movements',
      'Posts',
      'Stories',
      'Users'
      // Add more collections as needed
    ];
  
    // Delete user data from each collection
    for (const collection of collectionsToDelete) {
      const querySnapshot = await firestore()
        .collection(collection)
        .where("userId", "==", userId)
        .get();
  
      const deletePromises = querySnapshot.docs.map((doc) => doc.ref.delete());
      await Promise.all(deletePromises);
      
    }
  };


  sendFeedback = async () => {
    if (!this.state.feedback) {
      Alert.alert('Please enter a  feedback message')
      return;
    }
    let chatId = auth().currentUser?.uid;
    const today = new Date().getTime()
    chatId = chatId + '' + today;
    const chatRef = firestore().collection('Feedback').doc(chatId);
    chatRef.get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) {
          chatRef.onSnapshot((doc) => {
          })
          // do stuff with the data  doc.data()      });
        } else {
          chatRef.set({
            id: chatId,
            date: new Date(),
            message: this.state.feedback,
            name: this.props.displayName,
            email: this.props.email
          })
        }
      });
    Alert.alert('', 'Thanks for submitting feedback. We will contact you soon.')
    this.setState({ showFeedback: false });
  }

  render() {
    const { search } = this.state;
    const { drawer, drawerItem, selctedDrawerItem } = this.props;

    console.log('navigation', this.props.navigation.current);

    return (

      <Overlay
        isVisible={drawer}
        // isVisible={false}
        onBackdropPress={this.props.toggoleDrawer}
        fullScreen
        overlayStyle={style.cont}>

        <>
          <StatusBar translucent backgroundColor="transparent" hidden />
          {
            this.state.showFeedback ?
              <View style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                height: DEVICE_HEIGHT,
                width: DEVICE_WIDTH,
                backgroundColor: 'white',
                zIndex: 999,
                paddingTop: 100,
                paddingHorizontal: 15
              }}>
                <Text style={{ fontSize: mScale(18), fontWeight: 'bold' }}>
                  {'Name: ' + this.props.displayName}
                </Text>
                <Text style={{ fontSize: mScale(18), fontWeight: 'bold', marginTop: 15 }}>
                  {'Email: ' + this.props.email}
                </Text>
                <TextInput
                  multiline
                  placeholder={'Type your message here....'}
                  value={this.state.feedback}
                  style={[{
                    textAlignVertical: 'top',
                    borderWidth: 1,
                    marginTop: 15,
                    paddingHorizontal: 10,
                    height: 150,
                    backgroundColor: '#ffffff',
                    borderColor: '#707070',
                    borderRadius: 8,
                    marginBottom: 20,
                  }, {
                    textAlignVertical: 'top', color: '#000000'
                  }]}
                  onChangeText={value => this.setState({ feedback: value })} />
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity
                    style={[style.btn1, { backgroundColor: 'red' }]}
                    onPress={() =>
                      this.setState({ showFeedback: false })
                    }>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancel</Text>
                  </TouchableOpacity>
                  <View style={{ width: 40 }} />
                  <TouchableOpacity
                    style={style.btn1}
                    onPress={() =>
                      this.sendFeedback()
                    }>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{' Send '}</Text>
                  </TouchableOpacity>
                </View>

              </View>
              :
              null
          }
          <View style={{height: 40}}/>
          <Header inHeader={true} navigation={this.props.navigation.current} />
          <Toast ref={this.toast} style={{zIndex: 9999}} />

          <View>
            <FlatGrid
              itemDimension={wp(40)}
              data={drawerItem}
              style={style.gridView}
              //staticDimension={150}
              // fixed
              spacing={10}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    style.itemContainer,
                    {
                      // // backgroundColor: selectedTheme == 1 ?
                      //     selectedCategory == index ? 'rgba(252,132,35,.5)' :
                      //         'rgba(92, 86, 85,.5)' :
                      //     selectedCategory == index ? 'rgba(252,132,35,.7)' :
                      //         '#fff',
                      // elevation: selectedCategory == index ? 0 : 5
                    },
                  ]}
                  onPress={() => {
                    console.log(index);

                    if (item.name == 'Profile') {
                      console.log('fg');
                      this.props.chnageDrawerItem(index);
                      this.props.toggoleDrawer();
                      this.props.navigation.current.navigate('ProfileRoutes');
                    } else if (item.name == 'Delete Account') {
                     
                      Utility.showMessageWithActionCancel(
                        () => {
                          this.deleteAccount()
                        },
                        () => {},
                        'Are you sure?',
                        'Delete Account'
                      )
                    }
                    else if (item.name == 'Blocked List') {
                      this.props.chnageDrawerItem(0);
                      this.props.toggoleDrawer();
                      this.props.navigation.current.removeListener(
                        'beforeRemove',
                      );
                      this.props.navigation.current.navigate('BlockedUserList')
                    }
                    else if (item.name == 'Onboarding') {
                      this.props.chnageDrawerItem(0);
                      this.props.toggoleDrawer();
                      this.props.navigation.current.removeListener(
                        'beforeRemove',
                      );
                      this.props.navigation.current.navigate('OnboardingView')
                    }
                    else if (item.name == 'Feedback') {
                      this.setState({ showFeedback: true });
                    }
                    else if (item.name == 'Logout') {
                      Utility.showMessageWithActionCancel(
                        () => {
                          this.props.chnageDrawerItem(0);
                      this.props.toggoleDrawer();
                      this.props.removeUserData();
                      auth().signOut();
                      this.props.navigation.current.navigate('loginScreen');
                        },
                        () => {},
                        'Are you sure?',
                        'Logout'
                      )
                      
                    } else if (item.name == 'Friends') {
                      this.props.chnageDrawerItem(0);
                      this.props.toggoleDrawer();
                      this.props.navigation.current.removeListener(
                        'beforeRemove',
                      );
                      this.props.navigation.current.navigate('friendsPage');
                    } else if (item.name == 'Settings') {
                      this.props.chnageDrawerItem(0);
                      this.props.toggoleDrawer();
                      this.props.navigation.current.removeListener(
                        'beforeRemove',
                      );
                      this.props.navigation.current.navigate('AccountSetting');
                    } else {
                      alert('Work in progress');
                    }
                  }}>
                  {this.getIcon(item.name)}
                  <Text allowFontScaling={false} style={[style.itemName]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            
            
          </View>
          <View               style={{    marginTop: 10,   alignContent:'center',alignItems:'center',justifyContent:'center',flex:1,

}}>
          <TouchableOpacity
                  onPress={this.deleteFile}
                  style={[{borderRadius: 5,
                      padding: 10,
                      height: 120,
                      marginTop: 5,
                      alignSelf: 'center',
                      justifyContent: 'center'}]} >
            <View style={{height: hp(7),
    width: hp(7),
    backgroundColor: '#d1d1d1',
    borderRadius: hp(7),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',}}>
              <Icon name='nuclear-outline' type="ionicon" size={hp(4)} color="#1b224d" />
            </View>
            <Text allowFontScaling={false} style={[style.itemName]}>
              Cache Clear
            </Text>
            
            </TouchableOpacity>
          </View>
          
        </>
        
      </Overlay>
    );
  }
}

const style = StyleSheet.create({
  buttonStyle: {
    backgroundColor: '#F18D9E',
    padding: 10,
    marginTop: 32,
    minWidth: 250,
    borderRadius: 5
  },
  containers: {
    flex: 1,
    padding: 10,
    backgroundColor: '#98DBC6',
  },
  container: {
    flex: 1,
  },
  cont: {
    backgroundColor: '#fbfbfb',
  },

  gridView: {
    marginTop: 10,
  },
  itemContainer: {
    borderRadius: 5,
    padding: 10,
    height: 120,
    marginTop: 5,

    alignSelf: 'center',
    justifyContent: 'center',
  },
  icons: {
    alignSelf: 'center',
    backgroundColor: '#f0efef',
    borderRadius: wp(100),
  },
  itemName: {
    fontSize: 16,

    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
  wrapper: {
    height: hp(7),
    width: hp(7),
    backgroundColor: '#d1d1d1',
    borderRadius: hp(7),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  btn1: {
    paddingVertical: scale(15),
    paddingHorizontal: scale(30),
    backgroundColor: '#1e2348',
    borderRadius: scale(5),
    alignSelf: 'center',
    marginTop: scale(15),
  },
});
const mapStateToProps = (state) => {
  const { root, user } = state;
  const { userProfile } = user;
  return {
    drawer: root.drawer,
    drawerItem: root.drawerItem,
    selctedDrawerItem: root.selctedDrawerItem,
    displayName: userProfile.displayName,
    email: userProfile.email
  };
};
const mapDispachToProps = (Dispatch) => {
  return {
    toggoleDrawer: () => Dispatch({ type: 'toggoleDrawer' }),
    chnageDrawerItem: (index) =>
      Dispatch({ type: 'chnageDrawerItem', index: index }),
    removeUserData: () => Dispatch({ type: 'REMOVE_USER_DATA' }),
  };
};

export default connect(mapStateToProps, mapDispachToProps)(HeaderClass);

import React, { Component,createContext } from 'react';

import { Alert, StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { FloatingAction } from 'react-native-floating-action';
import { connect } from 'react-redux';
import Header from '../components/header';
// import Stories from 'react-native-stories-media';
import Stories from '../components/stories';

// import NativeAdView, {AdManager} from 'react-native-ve-ads';
import firestore from '@react-native-firebase/firestore';
import RNExitApp from 'react-native-exit-app';
import { requestTrackingPermission } from 'react-native-tracking-transparency';
import {
  getFirends,
  getFollowers,
  getFriednRequest
} from '../backend/apis';
import Feed from './feed';
import { DataContext, DataProvider } from '../components/DataContext'
//  import {AdView} from '../ads/AdView';


var PushNotification = require('react-native-push-notification');

var cloudToken = '';

const actions = [
  // {
  //   text: 'Highlights',
  //   icon: <Icon name="light-up" type="entypo" color="#1e2348" />,
  //   name: 'Highlights',
  //   color: '#ededed',
  //   position: 2,
  // },
  /*{
    text: 'Stories',
    icon: <Icon name="heart-o" type="font-awesome" color="#1e2348" />,
    name: 'Stories',
    color: '#ededed',
    position: 1,
  },*/
  {
    text: 'Post',
    icon: <Icon name="edit" type="font-awesome" color="#1e2348" />,
    name: 'Post',
    color: '#ededed',
    position: 2,
  },
  // {
  //   text: 'Watch',
  //   icon: <Icon name="video-call" type="material" color="#1e2348" />,
  //   name: 'Watch',
  //   color: '#ededed',
  //   position: 4,
  // },
];
const data = [];
class Home extends Component {
  nativeAdViewRef;
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false,
      stories: [],
      focused: true,
      showAdd: true,
      count: 0
    };
  }
  fetchData = () => {
    this.setState({count: this.state.count+1});
  }
  componentDidMount() {
    this.unsubscribeFocus = this.props.navigation.addListener('focus', () => {
      this.fetchData();
    });
    PushNotification.configure({
      onRegister: function (token) {
        cloudToken = token.token;
      },
      onNotification: (notification) => {
        let onlyMine = false;
        // Alert.alert(notification.title, notification.message);
      },
    });

    this.props.navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      if (this.props.route.name == 'Home') {
        if (this.props.showComments) {
          this.props.closeCommentsConatiner();
        } else {
          RNExitApp.exitApp();
        }
      }
      //clear setInterval here and go back
    });

    //console.log('fetching stories');
    var date = new Date();
    date.setDate(date.getDate() - 1);
    var tempArray = [];
    firestore()
      .collection('Stories')
      .orderBy('lastUpdatedAt', 'desc')
      .where('lastUpdatedAt', '>=', date.getTime())
      .where('access', '==', 'public_notHidden')
      .onSnapshot(
        (snap) => {
          let tempArr = [];
          snap.docs.forEach((doc) => {
            const data = {...doc.data(), id: doc.id};
            // var storyAssets = data.storyAssets[0];
            //console.log('data', data);
            //console.log('story assets', storyAssets);
            tempArr.push({...data, id: doc.id});
          });
          this.setState({stories: tempArr});
        },
        (err) => {
          console.log('error while getting stories', err);
        },
      );

      requestTrackingPermission().then((trackingStatus) => {
        let trackingAuthorized = false;
      if (trackingStatus === 'authorized' || trackingStatus === 'unavailable') {
        trackingAuthorized = true;
      }

      // AdManager.setRequestConfiguration({
      //   trackingAuthorized,
      // }).then(() => {
      //   // if (this.nativeAdViewRef) {
      //   //   this.nativeAdViewRef.loadAd()
      //   // }
      // });
      });

      
  }

  componentWillUnmount() {
    if (this.unsubscribeFocus) {
      this.unsubscribeFocus();
    }
  }

  getFirendsFun() {
    getFirends(this.props.userId).then((data) => {
      let tempArray = [];
      if (data.success) {
        for (let i = 0; i < data.data.friends.length; i++) {
          tempArray.push(data.data.friends[i]);
        }
        this.props.addUserFirend(tempArray);
      }
    });
  }
  getFollowers() {
    getFollowers(this.props.userId).then((data) => {
      let tempArray = [];
      if (data.success) {
        for (let i = 0; i < data.data.followers.length; i++) {
          tempArray.push(data.data.followers[i]);
        }
        this.props.addUserFollowers(tempArray);
      }
    });
  }
  getFriendRequest() {
    getFriednRequest(this.props.userId).then((data) => {
      let tempArray = [];
      if (data.success) {
        for (let i = 0; i < data.data.friendRequests.length; i++) {
          tempArray.push({
            _id: data.data.friendRequests[i]._id,
            rejectionLoader: false,
            acceptLoader: false,
            user: {
              _id: data.data.friendRequests[i].user._id,
              imageUrl: data.data.friendRequests[i].user.imageUrl,
              displayName: data.data.friendRequests[i].user.displayName,
            },
          });
        }
        this.props.addUserFriendRequest(tempArray);
      }
    });
  }
  render() {
    return (
      <View style={style.container}>
        <Header
          navigation={this.props.navigation}
          removeFocus={() => this.setState({focused: false})}
        />
        {/* <Drawer
          navigation={this.props.navigation}
          isVisible={this.state.drawerVisible}
          toggleDrawer={() => {
            this.setState({drawerVisible: !this.state.drawerVisible});
          }}
        /> */}
       
        {this.state.stories?.length > 0 && (
          <Stories data={this.state.stories || []} />
        )}

        {/* <Stories /> */}
        <DataProvider>
        <Feed navigation={this.props.navigation} focused={this.state.focused} count = {this.state.count} />
        </DataProvider>
        <FloatingAction
          actions={actions}
          distanceToEdge={10}
          actionsPaddingTopBottom={1}
          buttonSize={50}
          onPressItem={(name) => {
            if (name == 'Stories') {
              this.setState({focused: false});
              this.props.navigation.navigate('uploadStories');
            } else if (name == 'Post') {
              this.setState({focused: false});
              this.props.navigation.navigate('UploadPost');
            }
          }}
          color="#1e2348"
          overlayColor="transparent"
        />
        {/* { this.state.showAdd && 
         <View
          style={{
            backgroundColor: 'white',
            position: 'absolute',
            top: 0,
            left: 0,
            width: DEVICE_WIDTH,
            height: DEVICE_HEIGHT,
            paddingTop: 60
          }}
        >
        
        <TouchableOpacity
        onPress={() => {this.setState({showAdd: false})}}
        style={{
          marginTop: 30,
          backgroundColor: '#1e2348',
          padding: 30,
          paddingVertical: 10,
          borderRadius: 10,
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{color: 'white'}}>Close Ad</Text>
      </TouchableOpacity>
       </View>
      } */}
      </View>
    );
  }
}
const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
const mapStateToProps = (state) => {
  return {
    stories: [...(state.stories || [])],
    userId: state.userId,
    token: state.token,
    showComments: state.showComments,
  };
};
const mapDispachToProps = (Dispatch) => {
  return {
    updateUser: (
      firstName,
      lastName,
      email,
      adult,
      country,
      displayName,
      username,
      imageUrl,
      location,
      occupation,
      token,
      user_id,
      about,
      cover,
      dob,
    ) =>
      Dispatch({
        type: 'updateUser',
        firstName: firstName,
        lastName: lastName,
        email: email,
        adult: adult,
        country: country,
        displayName: displayName,
        username: username,
        imageUrl: imageUrl,
        location: location,
        occupation: occupation,
        token: token,
        user_id: user_id,
        about: about,
        cover: cover,
        dob: dob,
      }),
    uploadStories: (stories) => Dispatch({type: 'uploadStories', stories}),
    addUserFollowers: (followers) =>
      Dispatch({type: 'addUserFollowers', followers}),
    addUserFirend: (firends) => Dispatch({type: 'addUserFirend', firends}),
    addUserFriendRequest: (friendRequest) =>
      Dispatch({type: 'addUserFriendRequest', friendRequest}),
    closeCommentsConatiner: () => Dispatch({type: 'closeCommentsConatiner'}),
    addFeeds: (feeds) => Dispatch({type: 'addFeeds', feeds: feeds}),
  };
};
export default connect(mapStateToProps, mapDispachToProps)(Home);

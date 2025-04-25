import {act} from 'react-test-renderer';

const initailState = {
  firstName: '',
  lastName: '',
  email: '',
  adult: '',
  country: '',
  bio: null,
  displayName: '',
  showComments: false,
  userName: null,
  imageUrl: null,
  location: null,
  occupation: null,
  userId: null,
  userToken: null,
  cover: null,
  birthdate: null,
  drawer: false,
  search: '',
  showSearcHresult: false,
  showEmail: true,
  profilePublic: true,
  allUsers: [],
  onlyfiveResult: [],
  chat: false,
  followers: 0,
  following: 0,
  token: '',
  userFriends: [],
  userFollowers: [],
  userFriendRequest: [],
  scrollRef: null,
  drawerItem: [
    {name: 'Profile', img: require('../assets/emailLogo.png')},
    {name: 'Friends', img: require('../assets/friends.png')},
    {name: 'Settings', img: require('../assets/settings.png')},
    {name: 'Feedback', img: require('../assets/settings.png')},
    {name: 'Blocked List', img: require('../assets/block_user.png')},
    {name: 'Onboarding', img: require('../assets/settings.png')},
    {name: 'Logout', img: require('../assets/logo.png')},
    {name: 'Delete Account', img: require('../assets/delete_acc.png')},
  ],
  stories: [
    // {
    //     username: "Guilherme",
    //     title: "Title story",
    //     profile:
    //       "https://avatars2.githubusercontent.com/u/26286830?s=460&u=5d586a3783a6edeb226c557240c0ba47294a4229&v=4",
    //     stories: [
    //       {
    //         id: 1,
    //         url:
    //           "https://images.unsplash.com/photo-1532579853048-ec5f8f15f88d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
    //         type: "image",
    //         duration: 2,
    //         isReadMore: true,
    //         url_readmore: "https://github.com/iguilhermeluis",
    //         created: "2021-01-07T03:24:00",
    //       },
    //     ],
    //   },
    //   {
    //     username: "Bruno",
    //   //  profile: "https://avatars2.githubusercontent.com/u/45196619?s=460&v=4",
    //     title: "Travel",
    //     stories: [
    //       {
    //         id: 0,
    //         url:
    //           "https://images.unsplash.com/photo-1500099817043-86d46000d58f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
    //         type: "image",
    //         duration: 2,
    //         isReadMore: true,
    //         url_readmore: "https://github.com/iguilhermeluis",
    //         created: "2021-01-07T03:24:00",
    //       },
    //       // {
    //       //   id: 1,
    //       //   url: "https://www.w3schools.com/html/mov_bbb.mp4",
    //       //   type: "video",
    //       //   duration: 2,
    //       //   isReadMore: true,
    //       //   url_readmore: "https://github.com/iguilhermeluis",
    //       //   created: "2021-01-07T03:24:00",
    //       // },
    //       {
    //         id: 2,
    //         url:
    //           "https://images.unsplash.com/photo-1476292026003-1df8db2694b8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
    //         type: "image",
    //         duration: 2,
    //         isReadMore: false,
    //         url_readmore: "",
    //         created: "2021-01-07T03:24:00",
    //       },
    //       {
    //         id: 3,
    //         url:
    //           "https://images.unsplash.com/photo-1498982261566-1c28c9cf4c02?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
    //         type: "image",
    //         duration: 2,
    //         isReadMore: true,
    //       },
    //     ],
    //   },
    //   {
    //     username: "Steve Jobs",
    //     profile:
    //       "https://s3.amazonaws.com/media.eremedia.com/uploads/2012/05/15181015/stevejobs.jpg",
    //     title: "Tech",
    //     stories: [
    //       {
    //         id: 1,
    //         url:
    //           "https://images.unsplash.com/photo-1515578706925-0dc1a7bfc8cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    //         type: "image",
    //         duration: 2,
    //         isReadMore: true,
    //         url_readmore: "https://github.com/iguilhermeluis",
    //         created: "2021-01-07T03:24:00",
    //       },
    //       {
    //         id: 3,
    //         url:
    //           "https://images.unsplash.com/photo-1496287437689-3c24997cca99?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
    //         type: "image",
    //         duration: 2,
    //         isReadMore: true,
    //         url_readmore: "https://github.com/iguilhermeluis",
    //         created: "2021-01-07T03:24:00",
    //       },
    //       {
    //         id: 4,
    //         url:
    //           "https://images.unsplash.com/photo-1514870262631-55de0332faf6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
    //         type: "image",
    //         duration: 2,
    //         isReadMore: true,
    //         url_readmore: "https://github.com/iguilhermeluis",
    //         created: "2021-01-07T03:24:00",
    //       },
    //     ],
    //   },
    //   {
    //     username: "Jacob",
    //     profile:
    //       "https://images.unsplash.com/profile-1531581190171-0cf831d86212?dpr=2&auto=format&fit=crop&w=150&h=150&q=60&crop=faces&bg=fff",
    //     title: "News",
    //     stories: [
    //       {
    //         id: 4,
    //         url:
    //           "https://images.unsplash.com/photo-1512101176959-c557f3516787?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
    //         type: "image",
    //         duration: 2,
    //         isReadMore: true,
    //         url_readmore: "https://github.com/iguilhermeluis",
    //         created: "2021-01-07T03:24:00",
    //       },
    //       {
    //         id: 5,
    //         url:
    //           "https://images.unsplash.com/photo-1478397453044-17bb5f994100?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
    //         type: "image",
    //         duration: 2,
    //         isReadMore: true,
    //         url_readmore: "https://github.com/iguilhermeluis",
    //         created: "2021-01-07T03:24:00",
    //       },
    //       {
    //         id: 4,
    //         url:
    //           "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=581&q=80",
    //         type: "image",
    //         duration: 2,
    //         isReadMore: true,
    //         url_readmore: "https://github.com/iguilhermeluis",
    //         created: "2021-01-07T03:24:00",
    //       },
    //     ],
    //   },
  ],
  selctedDrawerItem: 0,
  feeds: [],
};

const reducer = (state = initailState, action) => {
  const newState = {...state};

  if (action.type == 'addUserFirend') {
    newState.userFriends = action.firends;
  }

  if (action.type == 'closeCommentsConatiner') {
    newState.showComments = false;
  }
  if (action.type == 'openCommentsConatiner') {
    newState.showComments = true;
  }
  if (action.type == 'addUserFollowers') {
    newState.userFollowers = action.followers;
    newState.followers = action.followers.length;
  }

  if (action.type == 'addFeeds') {
    newState.feeds = action.feeds;
  }

  if (action.type == 'updateFollowingCOunt') {
    newState.following = action.following;
  }
  if (action.type == 'addUserFriendRequest') {
    newState.userFriendRequest = action.friendRequest;
  }
  if (action.type == 'scrollRefOfPost') {
    newState.scrollRef = action.ref;
  }
  if (action.type == 'scrollToTop') {
    if (newState.scrollRef != null) {
      newState.scrollRef.scrollToOffset({animated: true, y: 0});
    }
  }

  if (action.type == 'updateUser') {
    newState.firstName = action.firstName;
    newState.lastName = action.lastName;
    newState.email = action.email;
    newState.adult = action.adult;
    newState.country = action.country;
    newState.displayName = action.displayName;
    newState.userName = action.username;
    newState.imageUrl = action.imageUrl;
    newState.location = action.location;
    newState.occupation = action.occupation;
    newState.userToken = action.token;
    newState.userId = action.user_id;
    newState.bio = action.about;
    newState.cover = action.cover;
    newState.birthdate = action.dob;

    newState.followers = action.followers;
    newState.following = action.following;
    newState.showEmail = action.showEmail;
    newState.profilePublic = action.profilePublic;
  }
  if (action.type == 'updateCover') {
    newState.cover = action.cover;
  }

  if (action.type == 'toggoleDrawer') {
    newState.drawer = !newState.drawer;
  }

  if (action.type == 'chnageDrawerItem') {
    newState.selctedDrawerItem = action.index;
  }
  if (action.type == 'cloudToken') {
    newState.token = action.token;
  }
  if (action.type == 'addSearch') {
    newState.search = action.search;
    console.log(action.search, '=');
    //         if(action.search!='')
    //         {
    //         let tempArray=[]

    //         for(let i=0;i<newState.allUsers.length;i++)
    //         {
    //             if(newState.allUsers[i].displayName.toLowerCase().indexOf( action.search.toLowerCase())>-1)
    //             {
    //                 tempArray.push(newState.allUsers[i])
    //                 console.log(newState.allUsers[i].displayName,'==')
    //             }
    //         }
    //         if(tempArray.length>5)
    //         {
    //             newState.onlyfiveResult=tempArray.splice(0,5)
    //             newState.showSearcHresult = true;
    //         }
    //         else
    //     {
    //         newState.onlyfiveResult=tempArray
    //         newState.showSearcHresult = true;
    //     }
    // }
    // else
    // {
    //     newState.onlyfiveResult=[]
    // }
  }
  if (action.type == 'setAlluser') {
    newState.allUsers = action.users;
  }
  if (action.type == 'setOnlyFiveArray') {
    newState.onlyfiveResult = action.users;
  }
  if (action.type == 'showFiler') {
    newState.showSearcHresult = action.status;
  }

  if (action.type == 'closeSearchFilter') {
    console.log('--------------------------');
    newState.showSearcHresult = false;
  }
  if (action.type == 'updateStories') {
    let allStories = newState.stories;
    let exist = false;
    for (let i = 0; i < allStories.length; i++) {
      if (allStories[i]._id == newState.userId) {
        // allStories[i].stories=action.story
        // console.log(allStories[i].stories,'---------------')
        // userExist=true
        // newState.stories.splice(i,1)
        newState.stories[i] = action.story;
        exist = true;
        break;
      }
    }
    if (!exist) {
      newState.stories.unshift(action.story);
    }
    //
  }
  if (action.type == 'uploadStories') {
    let tempStories = [];
    for (let i = 0; i < action.stories.length; i++) {
      if (action.stories[i]._id == newState.userId) {
        tempStories.unshift(action.stories[i]);
      } else {
        tempStories.push(action.stories[i]);
      }
    }

    newState.stories = tempStories;
  }

  if (action.type == 'updateUserAndImage') {
    newState.firstName = action.firstName;
    newState.lastName = action.lastName;
    newState.email = action.email;
    newState.adult = action.adult;
    newState.country = action.country;
    newState.displayName = action.displayName;
    newState.userName = action.username;
    newState.imageUrl = action.imageUrl;
    newState.location = action.location;
    newState.occupation = action.occupation;
    newState.bio = action.about;
    newState.cover = action.cover;
    newState.birthdate = action.dob;
    newState.showEmail = action.emailPublic;
    newState.profilePublic = action.profilePublic;

    console.log(newState.profilePublic, '-----');
  }

  if (action.type == 'toggleChatScreen') {
    newState.chat = !newState.chat;
  }

  return newState;
};
export default reducer;

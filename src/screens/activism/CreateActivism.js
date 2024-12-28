import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView
} from 'react-native';
import {Icon,ListItem, CheckBox} from 'react-native-elements';
import {launchImageLibrary} from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import {useSelector} from 'react-redux';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import DatePicker from 'react-native-date-picker';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import ModalDropdown from 'react-native-modal-dropdown';



import Header from '../../components/header';
import {scale, mScale, vScale} from '../../configs/size';

const CreateActivism = ({navigation, route}) => {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [category, setCategory] = useState('Select Category');
  const [description, setDescription] = useState('');
  const [location, setLocatiom] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [showLoader, setShowLoader] = useState(false);
  const [allowPost, setAllowPost] = useState(false);

  const [open, setOpen] = useState(false)
  const [endDateopen, setEndDateOpen] = useState(false)

  const [start_date, setDate] = useState(new Date())
  const [end_date, setEndDate] = useState(new Date())



  const toastRef = useRef();
  const dropDown = useRef();


  const movInfo = route.params?.movInfo;

  const userProfile = useSelector((state) => state.user.userProfile);
  const adminInfo = {
    id: userProfile?.userId,
    name: userProfile?.displayName || userProfile?.firstName,
    profileUrl: userProfile?.profileUrl || '',
  };

  const makeid = (length = 28) => {
    var result = '';
    var characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  useEffect(() => {
    if (!movInfo) {
      return;
    }
    const {
      title,
      username,
      description,
      location,
      profileUrl,
      coverUrl,
      email,
      allowPost,
      website,
      category
    } = movInfo;
    // console.log('echo ',movInfo.start_date);
    setDate(new Date((movInfo.start_date.seconds)*1000));
    setTitle(title);
    setEndDate(new Date((movInfo.end_date.seconds)*1000));
    setAllowPost(allowPost);
    setUsername(username);
    setDescription(description);
    setLocatiom(location);
    setProfileUrl(profileUrl);
    setCoverUrl(coverUrl);
    setEmail(email);
    setWebsite(website);
    setCategory(category);
  }, []);

  
  const editActivism = async () => {
    let profilePhoto = null;
    let coverPhoto = null;
    const date = new Date();
    const {id} = movInfo;
    let movPayLoad = {
      id,
      start_date,
      end_date,
      allowPost,
      title,
      username: username,
      description,
      email,
      location,
      website,
      category,
    };
    setShowLoader(true);

    if(category == 'Select Category'){
      toastRef.current?.show({
        text1: 'The following fields are mandatory:',
        text2: 'Category',
        type: 'info',
      });
    }

    if (profileUrl && profileUrl !== '' && profileUrl !== movInfo.profileUrl) {
      try {
        const randomVar = title.split(' ')[0] + date.getTime();

        const ref1 = storage().ref(`images/profile/${randomVar}`);
        await ref1.putFile(profileUrl);
        profilePhoto = await ref1.getDownloadURL();
        movPayLoad['profileUrl'] = profilePhoto;
      } catch (error) {
        setShowLoader(false);
        alert('Something went wrong while uploading your Images.');
      }
    }

    if (coverUrl && coverUrl !== '' && coverUrl !== movInfo.coverUrl) {
      try {
        const randomVar = title.split(' ')[0] + date.getTime();

        const ref2 = storage().ref(`images/cover/${randomVar}`);
        await ref2.putFile(coverUrl);
        coverPhoto = await ref2.getDownloadURL();
        movPayLoad['coverUrl'] = coverUrl;
      } catch (error) {
        setShowLoader(false);

        alert('Something went wrong while uploading your images.');
      }
    }
    try {
      console.log('id',id);
      console.log('payload', movPayLoad);

      await firestore().collection('Movements').doc(id).update(movPayLoad);
      setShowLoader(false);
      navigation.goBack();
      setShowLoader(false);
    } catch (error) {
      console.log(error);

      alert('Something went wrong while updating your Movement.');
      setShowLoader(false);
    }
  };

  


  const createActivism = async () => {
    console.log(category);
    if (movInfo) {
      editActivism();
      return;
    }
    if (title && username && adminInfo && start_date && end_date && category != 'Select Category') {
      setShowLoader(true);
      const daten = new Date();
      var profilePhoto = '';
      var coverPhoto = '';
      const id = makeid();
      try {
        if (profileUrl) {
          const randomVar = title.split(' ')[0] + daten.getTime();
          const ref1 = storage().ref(`images/profile/${randomVar}`);
          try {
            await ref1.putFile(profileUrl);
            profilePhoto = await ref1.getDownloadURL();
          } catch (error) {
            alert(
              'Somthing went wrong while uploading Movement Profile Image.',
            );
          }
        }
        if (coverUrl) {
          const randomVar = title.split(' ')[0] + daten.getTime();
          const ref2 = storage().ref(`images/cover/${randomVar}`);
          try {
            await ref2.putFile(coverUrl);
            coverPhoto = await ref2.getDownloadURL();
          } catch (error) {
            alert('Somthing went wrong while uploading Movement Cover Image.');
          }
        }

        let movRef = firestore().collection('Movements').doc();
        let followRef = firestore().collection('Follows').doc();
        const date = new Date();

        let movPayLoad = {
          id: movRef.id,
          date: date.valueOf(),
          title,
          start_date:start_date,
          allowPost:allowPost,
          end_date:end_date,
          username: '@' + username,
          description,
          profileUrl: profilePhoto,
          coverUrl: coverPhoto,
          email,
          location,
          website,
          category,
          likedCount: 1,
          followedCount: 1,
          adminInfo,
        };

        const id1 = auth().currentUser.uid;
        const id2 = movRef.id;
        const id3 = id1;
        const followPayload = {
          identifiers: [`${id1}_${id2}`, `${id2}_${id1}`],
          users: [id1, `${id2}_${id1}`],
          userData: [
            {
              userId: id1,
              profileUrl: userProfile.profileUrl || null,
              displayName: `${userProfile?.firstName} ${userProfile?.lastName}`,
            },
            {
              userId: id2,
              profileUrl: profilePhoto,
              displayName: coverPhoto,
            },
          ],
          isFollowedByOtherUser: {
            [id1]: false,
            [id2]: true,
          },
          isFollowingOtherUser: {
            [id1]: true,
            [id2]: false,
          },
          entityInfo: {
            name: title,
            id: movRef.id,
            profileUrl: profilePhoto,
            status: 'following',
            canPost: true,
            type: 'movement',
          },
        };
        const batch = firestore().batch();
        batch.set(movRef, movPayLoad);
        batch.set(followRef, followPayload);
        await batch.commit();
        setShowLoader(false);
        navigation.goBack();
      } catch (err) {
        setShowLoader(false);
        console.log('error', err);
      }
    } else {
      toastRef.current?.show({
        text1: 'The following fields are mandatory:',
        text2: 'Title, Username and Category.',
        type: 'info',
      });
    }
  };

  


  const pickImage = async (type) => {
    const optionImages = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
        privateDirectory: true,
      },
      mediaType: 'photo',
      quality: 1,
      allowsEditing: true,
    };
    launchImageLibrary(optionImages, async (response) => {
      if (response.didCancel) {
      } else if (response.error) {
      } else if (response.customButton) {
        //console.log('User tapped custom button: ', response.customButton);
      } else {
        const url = response.assets[0].uri;
        if (type === 'cover') setCoverUrl(url);
        else setProfileUrl(url);
      }
    });
  };

  return (
    
    <View style={styles.container}>
      <Header navigation={navigation} />
      <ScrollView showsVerticalScrollIndicator={false} >
      <KeyboardAvoidingView behavior='padding' enabled style={{ flex: 1 }}>
        <View style={{height: vScale(165)}}>
          {coverUrl ? (
            <Image
              source={{uri: coverUrl}}
              style={{height: vScale(165), width: '100%'}}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.banner} />
          )}
          <View style={styles.profileBox}>
            {profileUrl ? (
              <Image
                source={{uri: profileUrl}}
                style={{height: scale(70), width: scale(70)}}
                resizeMode="cover"
              />
            ) : (
              <Icon
                name="person"
                type="ionicon"
                size={scale(40)}
                color="#c2c0c0"
              />
            )}
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => pickImage('profile')}>
            <Text style={styles.buttonText}>Select Movement Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{...styles.profileBtn, bottom: scale(45)}}
            onPress={() => pickImage('cover')}>
            <Text style={styles.buttonText}>Select Movement Cover</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCoverUrl('')}
            style={{
              position: 'absolute',
              right: scale(10),
              top: Platform.OS == 'ios' ? vScale(50) : vScale(10),
            }}>
            <Icon
              name="close-circle"
              type="ionicon"
              size={scale(25)}
              color="red"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setProfileUrl('')}
            style={{position: 'absolute', left: scale(65), bottom: scale(65)}}>
            <Icon
              name="close-circle"
              type="ionicon"
              size={scale(25)}
              color="red"
            />
          </TouchableOpacity>
        </View>
        {/* <Text style={styles.text1}>Start Date</Text>
        <TouchableOpacity style={styles.inputContainer} onPress={() => setOpen(true)}>
          <Icon name="calendar-outline"  type="ionicon" size={scale(18)} />
          <Text style={{flex: 1,paddingLeft: scale(5),}}>{start_date.toLocaleString()}</Text>
          <DatePicker
            modal
            open={open}
            date={start_date}
            onConfirm={(start_date) => {
              setOpen(false)
              setDate(start_date)
            }}
            onCancel={() => {
              setOpen(false)
            }}
          />
          
        </TouchableOpacity>
        <Text style={styles.text1}>End Date</Text>
        <TouchableOpacity style={styles.inputContainer} onPress={() => setEndDateOpen(true)}>
          <Icon name="calendar-outline" type="ionicon"  size={scale(18)} />
          
          <Text style={{flex: 1,paddingLeft: scale(5),}}>{end_date.toLocaleString()}</Text>

          <DatePicker
            modal
            open={endDateopen}
            date={end_date}
            onConfirm={(end_date) => {
              setEndDateOpen(false)
              setEndDate(end_date)
            }}
            onCancel={() => {
              setEndDateOpen(false)
            }}
          />
        </TouchableOpacity> */}


        <Text style={styles.text1}>Title</Text>
        <View style={styles.inputContainer}>
          <Icon name="person-outline" type="ionicon" size={scale(18)} />
          <TextInput
            placeholder="title"
            value={title}
            onChangeText={(val) => setTitle(val)}
            style={styles.input}
          />
        </View>
        <Text style={styles.text1}>Username</Text>
        <View style={styles.inputContainer}>
          <Icon name="person-outline" type="ionicon" size={scale(18)} />
          <TextInput
            placeholder="username"
            value={username}
            onChangeText={(val) => setUsername(val)}
            style={styles.input}
          />
        </View>
        <Text style={styles.text1}>Description</Text>
        <View style={styles.inputContainer}>
          <Icon name="person-outline" type="ionicon" size={scale(18)} />
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={(val) => setDescription(val)}
            multiline={true}
            numberOfLines={2}
            // style={{paddingRight: scale(15)}}
            style={styles.input}
          />
        </View>
        <Text style={styles.text1}>Location</Text>
        <View style={styles.inputContainer}>
          <Icon name="location-outline" type="ionicon" size={scale(18)} />
          <TextInput
            placeholder="location"
            value={location}
            onChangeText={(val) => setLocatiom(val)}
            style={styles.input}
          />
        </View>
        <Text style={styles.text1}>Email</Text>
        <View style={styles.inputContainer}>
          <Icon name="mail-outline" type="ionicon" size={scale(18)} />
          <TextInput
            placeholder="email"
            value={email}
            onChangeText={(val) => setEmail(val)}
            style={styles.input}
          />
        </View>
        <Text style={styles.text1}>Website</Text>
        <View style={{...styles.inputContainer, marginBottom: vScale(10)}}>
          <Icon name="globe-outline" type="ionicon" size={scale(18)} />
          <TextInput
            placeholder="website"
            value={website}
            onChangeText={(val) => setWebsite(val)}
            style={styles.input}
          />
        </View>
        <Text style={{...styles.text1,marginBottom: vScale(10)}}>Categories</Text>
          <ListItem style={{marginBottom: vScale(10)}}
                containerStyle={[
                  // style.listCont,
                  {
                    backgroundColor: 'transparent',
                    borderColor: 'silver',
                    borderWidth: 1,
                    borderRadius: 18,
                    height: vScale(39),
                    width: wp(80),
                    alignSelf: 'center',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    marginBottom: vScale(20)
                  },
                ]}>
                
                <Image style={{}} source={require('../../assets/category.png')} />
                <ListItem.Content>
                  <ModalDropdown
                    options={['Human Rights', 'Economic', 'Environment','Animal','Political','Religious','Art','Science']}
                    dropdownStyle={{
                      width: wp(70),
                      marginTop: hp(-4),
                      height: Platform.OS == 'ios' ? vScale(80) : vScale(100),
                    }}
                    ref={dropDown}
                    defaultValue={category}
                    textStyle={{
                      marginTop: Platform.OS == 'android' ? vScale(10) : 0,
                      marginLeft: scale(10),
                      color: 'gray',
                      width: '70%',
                      fontSize: 14,
                    }}
                    onSelect={(index, value) => {
                      setCategory(value)
                    }}
                  />
                </ListItem.Content>
                <Icon
                  name="caretdown"
                  type="antdesign"
                  size={12}
                  color="gray"
                  style={{marginRight: 10}}
                  onPress={() => {
                    dropDown.current?.show();
                  }}
                />
          </ListItem>

        <View style={{width: '80%',
    borderWidth: 1,
    height: vScale(50),
    marginTop: vScale(10),
    marginBottom: vScale(10),
    paddingLeft: scale(10),
    borderRadius: scale(20),
    borderColor: '#d9d9d9',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',}}>

          <CheckBox
            title="Allow Discussion"
            containerStyle={{flex: 1}}
            style={styles.input}
            onPress={() => {
              setAllowPost(!allowPost);
            }}
            checked={allowPost}
          />
        </View>
        <View style={{alignSelf: 'center', flexDirection: 'row'}}>
          {showLoader ? (
            <ActivityIndicator size="small" color="#1e2348" />
          ) : (
            <TouchableOpacity style={styles.btn} onPress={createActivism}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
     </KeyboardAvoidingView>
      </ScrollView>
      <Toast ref={toastRef} style={{zIndex: 9999}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  banner: {
    height: vScale(165),
    width: '100%',
    backgroundColor: '#d9d9d9',
  },
  profileBox: {
    height: scale(70),
    width: scale(70),
    borderRadius: scale(70),
    backgroundColor: '#e6e6e6',
    position: 'absolute',
    bottom: scale(20),
    left: scale(20),
    borderWidth: 1,
    borderColor: '#1e2348',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text1: {
    marginLeft: '10%',
    marginTop: vScale(15),
    fontSize: mScale(14),
    color: '#1e2348',
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '80%',
    borderWidth: 1,
    height: vScale(50),
    marginTop: vScale(5),
    paddingLeft: scale(10),
    borderRadius: scale(20),
    borderColor: '#d9d9d9',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: '#1e2348',
    width: scale(100),
    height: vScale(35),
    margin: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(20),
  },
  buttonText: {color: '#fff', fontWeight: 'bold'},
  profileBtn: {
    backgroundColor: '#1e2348',
    paddingHorizontal: scale(10),
    paddingVertical: vScale(3),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(20),
    position: 'absolute',
    bottom: scale(80),
    left: scale(100),
  },
  input: {
    flex: 1,
    paddingLeft: scale(5),
  },
});

export default CreateActivism;

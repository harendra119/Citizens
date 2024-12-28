import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {mScale, scale, vScale} from '../../configs/size';
import EmptyListLoader from '../emptyListLoader';
import EmptyListText from '../emptyListText';
import RoundImage from '../roundImage';
import firestore from '@react-native-firebase/firestore';
import errorLog, {defaultAlert} from '../../Constants/errorLog';
import {useSelector} from 'react-redux';

const dummyComments = [
  {
    user: {
      displayName: 'Tushar Sharma',
      userId: '12343',
      profileUrl:
        'https://firebasestorage.googleapis.com/v0/b/the-citizens.appspot.com/o/images%2Fprofile%2Fbrijeshsan97%40gmail.com?alt=media&token=01e4ef1f-49e8-40eb-9ea8-74bbfd840dcf',
    },
    comment:
      'Nice vid asihdajsdakjsdakjdaksdaksdaskdalkdjashldkajhdlajdhkajsdhkaljsh',
    createdAt: new Date(),
  },
  {
    user: {
      displayName: 'Joseph Micah',
      userId: '12344',
      profileUrl:
        'https://firebasestorage.googleapis.com:443/v0/b/the-citizens.appspot.com/o/images%2Fprofile%2FTs6@gmail.com?alt=media&token=40b7183d-92fa-4266-9b9f-97aa103b0ece',
    },
    comment: 'Really nice video!!!',
    createdAt: new Date(),
  },
  {
    user: {
      displayName: 'Brijesh Sanwariya',
      userId: '12345',
      profileUrl: '',
    },
    comment: 'Ahh Science!',
    createdAt: new Date(),
  },
  {
    user: {
      displayName: 'Tushar Sharma',
      userId: '12343',
      profileUrl:
        'https://firebasestorage.googleapis.com/v0/b/the-citizens.appspot.com/o/images%2Fprofile%2Fbrijeshsan97%40gmail.com?alt=media&token=01e4ef1f-49e8-40eb-9ea8-74bbfd840dcf',
    },
    comment:
      'Nice vid asihdajsdakjsdakjdaksdaksdaskdalkdjashldkajhdlajdhkajsdhkaljsh',
    createdAt: new Date(),
  },
  {
    user: {
      displayName: 'Joseph Micah',
      userId: '12344',
      profileUrl:
        'https://firebasestorage.googleapis.com:443/v0/b/the-citizens.appspot.com/o/images%2Fprofile%2FTs6@gmail.com?alt=media&token=40b7183d-92fa-4266-9b9f-97aa103b0ece',
    },
    comment: 'Really nice video!!!',
    createdAt: new Date(),
  },
  {
    user: {
      displayName: 'Brijesh Sanwariya',
      userId: '12345',
      profileUrl: '',
    },
    comment: 'Ahh Science!',
    createdAt: new Date(),
  },
  {
    user: {
      displayName: 'Tushar Sharma',
      userId: '12343',
      profileUrl:
        'https://firebasestorage.googleapis.com/v0/b/the-citizens.appspot.com/o/images%2Fprofile%2Fbrijeshsan97%40gmail.com?alt=media&token=01e4ef1f-49e8-40eb-9ea8-74bbfd840dcf',
    },
    comment:
      'Nice vid asihdajsdakjsdakjdaksdaksdaskdalkdjashldkajhdlajdhkajsdhkaljsh',
    createdAt: new Date(),
  },
  {
    user: {
      displayName: 'Joseph Micah',
      userId: '12344',
      profileUrl:
        'https://firebasestorage.googleapis.com:443/v0/b/the-citizens.appspot.com/o/images%2Fprofile%2FTs6@gmail.com?alt=media&token=40b7183d-92fa-4266-9b9f-97aa103b0ece',
    },
    comment: 'Really nice video!!!',
    createdAt: new Date(),
  },
  {
    user: {
      displayName: 'Brijesh Sanwariya',
      userId: '12345',
      profileUrl: '',
    },
    comment: 'Ahh Science!',
    createdAt: new Date(),
  },
  {
    user: {
      displayName: 'Tushar Sharma',
      userId: '12343',
      profileUrl:
        'https://firebasestorage.googleapis.com/v0/b/the-citizens.appspot.com/o/images%2Fprofile%2Fbrijeshsan97%40gmail.com?alt=media&token=01e4ef1f-49e8-40eb-9ea8-74bbfd840dcf',
    },
    comment:
      'Nice vid asihdajsdakjsdakjdaksdaksdaskdalkdjashldkajhdlajdhkajsdhkaljsh',
    createdAt: new Date(),
  },
  {
    user: {
      displayName: 'Joseph Micah',
      userId: '12344',
      profileUrl:
        'https://firebasestorage.googleapis.com:443/v0/b/the-citizens.appspot.com/o/images%2Fprofile%2FTs6@gmail.com?alt=media&token=40b7183d-92fa-4266-9b9f-97aa103b0ece',
    },
    comment: 'Really nice video!!!',
    createdAt: new Date(),
  },
  {
    user: {
      displayName: 'Brijesh Sanwariya',
      userId: '12345',
      profileUrl: '',
    },
    comment: 'Ahh Science!',
    createdAt: new Date(),
  },
  {
    user: {
      displayName: 'Tushar Sharma',
      userId: '12343',
      profileUrl:
        'https://firebasestorage.googleapis.com/v0/b/the-citizens.appspot.com/o/images%2Fprofile%2Fbrijeshsan97%40gmail.com?alt=media&token=01e4ef1f-49e8-40eb-9ea8-74bbfd840dcf',
    },
    comment:
      'Nice vid asihdajsdakjsdakjdaksdaksdaskdalkdjashldkajhdlajdhkajsdhkaljsh',
    createdAt: new Date(),
  },
  {
    user: {
      displayName: 'Joseph Micah',
      userId: '12344',
      profileUrl:
        'https://firebasestorage.googleapis.com:443/v0/b/the-citizens.appspot.com/o/images%2Fprofile%2FTs6@gmail.com?alt=media&token=40b7183d-92fa-4266-9b9f-97aa103b0ece',
    },
    comment: 'Really nice video!!!',
    createdAt: new Date(),
  },
  {
    user: {
      displayName: 'Brijesh Sanwariya',
      userId: '12345',
      profileUrl: '',
    },
    comment: 'Ahh Science!',
    createdAt: new Date(),
  },
];

const ClipComments = ({clipId, bottom, incrementCommentCount}) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [input, setInput] = useState();

  const userProfile = useSelector((state) => state.user.userProfile);

  useEffect(() => {
    getComments();
  }, []);

  const getComments = async () => {
    try {
      const snap = await firestore()
        .collection('Clips')
        .doc(clipId)
        .collection('Comments')
        .orderBy('createdAt', 'desc')
        .get();
      const comments = snap.docs.map((doc) => {
        return {id: doc.id, ...doc.data()};
      });
      setComments(comments);
      setLoading(false);
    } catch (error) {
      setError(true);
      setLoading(false);
      errorLog('getting clip comments', error);
    }
  };

  const publishComment = async () => {
    if (!input || input == '') {
      return;
    }
    try {
      const batch = firestore().batch();
      const clipRef = firestore().collection('Clips').doc(clipId);
      const commentsRef = clipRef.collection('Comments').doc();

      const body = {
        comment: input,
        id: userProfile.userId,
        profileUrl: userProfile.profileUrl || null,
        displayName: userProfile.displayName,
        createdAt: firestore.Timestamp.now(),
      };

      batch.update(clipRef, {
        activityCount: firestore.FieldValue.increment(1),
        totalComments: firestore.FieldValue.increment(1),
      });
      batch.set(commentsRef, body);
      await batch.commit();
      setInput();
      setComments([body, ...comments]);
      incrementCommentCount();
    } catch (error) {
      defaultAlert();
      errorLog('commenting', error);
    }
  };

  const renderComment = ({item}) => {
    const formatTime = item.createdAt.toDate();
    return (
      <View style={styles.commentCont}>
        <TouchableOpacity style={styles.profileImage}>
          <RoundImage
            imageUrl={item.profileUrl}
            displayName={item.displayName}
          />
        </TouchableOpacity>
        <View>
          <Text style={styles.displayName}>{item.displayName}</Text>
          <Text style={styles.comment}>{item.comment}</Text>
          <Text style={styles.createdAt}>{moment(formatTime).fromNow()}</Text>
        </View>
      </View>
    );
  };

  const renderInput = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        borderColor: '#1e2348',
        borderWidth: 1,
        borderRadius: mScale(15),
        position: 'absolute',
        bottom: vScale(10),
        paddingHorizontal: scale(10),
        backgroundColor: '#ffffff',
        height: vScale(40),
      }}>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Your thoughts ..."
        style={{width: scale(300)}}
      />
      <TouchableOpacity
        style={{
          height: scale(30),
          width: scale(30),
          borderRadius: scale(15),
          backgroundColor: 'green',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={publishComment}>
        <Icon
          name="caret-forward"
          type="ionicon"
          size={vScale(22)}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={{
        marginBottom: bottom,
        height: '100%',
      }}>
      <Text style={styles.title}>Comments</Text>
      <View style={styles.lineBreak} />
      {loading ? (
        <EmptyListLoader style={{height: vScale(467)}} />
      ) : error ? (
        <EmptyListText style={{height: vScale(467)}} />
      ) : (
        <>
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item, index) => `${index}`}
            showsVerticalScrollIndicator={false}
            style={{
              paddingTop: vScale(10),
              marginBottom: vScale(10 + 40),
            }}
            keyboardShouldPersistTaps={'always'}
            // ListFooterComponent={
            //   <View style={{height: bottomPadding + vScale(10)}} />
            // }
            ListEmptyComponent={
              <EmptyListText
                title="Be the first to comment on this Clip."
                style={{height: vScale(427) - bottom - vScale(10)}}
              />
            }
          />
          {renderInput()}
        </>
      )}
    </View>
  );
};

export default ClipComments;

const styles = StyleSheet.create({
  commentCont: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    // paddingHorizontal: scale(20),
    width: '100%',
    marginBottom: vScale(10),
  },
  displayName: {
    fontSize: mScale(14),
    fontWeight: 'bold',
  },
  profileImage: {marginRight: scale(10)},
  comment: {
    fontSize: mScale(14),
    // marginTop: vScale(2),
  },
  createdAt: {
    fontSize: mScale(10),
    color: '#797979',
    marginTop: vScale(2),
  },
  title: {
    fontSize: mScale(18),
    fontWeight: 'bold',
  },
  lineBreak: {
    height: vScale(0.7),
    backgroundColor: '#797979',
    width: '100%',
    marginTop: vScale(8),
  },
});

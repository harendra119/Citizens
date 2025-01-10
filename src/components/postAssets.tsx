import React, { createContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Alert,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import VideoPlayer from './videoPlayer/videoPlayer';
import { Overlay, Header, Icon } from 'react-native-elements';
// import GifImage from '@lowkey/react-native-gif'; // Harry did
import AppIntroSlider from 'react-native-app-intro-slider';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import { scale, vScale } from '../configs/size';
import FastImage from 'react-native-fast-image';
import { DataContext } from './DataContext'
import { DEVICE_WIDTH } from '../utils/Utility';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import ImageZoom from 'react-native-image-pan-zoom';
import AppModalView from './appModal/AppModalView';

const { width, height } = Dimensions.get('window');


export default class FbImages extends React.Component {
  static contextType = DataContext
  constructor(props) {
    super(props);
    this.flatListRef = React.createRef();
    this.state = {
      countFrom: 5,
      conditionalRender: false,
      images: this.props.content,
      showOverlay: false,
      currentIndex: 0,
      intervalId: null,
      scale: 1,
      pinchImg: null
    };

  }


  clickEventListener = () => {
    if (!this.props.disableTouch) {
      this.props.openComments();
    }
  };



  renderImage = (source, aspectRatio, width) => {

    const { height: propHeight, color } = this.props;

    const relativeHeight =
      aspectRatio && width ? width / aspectRatio : vScale(180);
    const finalHeight = propHeight ? propHeight : relativeHeight;

    return (
      <View>
        <TouchableWithoutFeedback
          onPress={() => this.setState({ pinchImg: { source, finalHeight, width } })}
        >
          <FastImage
            style={[
              styles.image,
              {
                height: finalHeight,
                width: width,
                backgroundColor: 'white',
              },
            ]}
            source={{ uri: source }}
            resizeMode={aspectRatio ? 'cover' : 'cover'}
          />
        </TouchableWithoutFeedback>
      </View>
    );
  };

  renderGif = (source, check) => {
    const { images } = this.state;

    // if(type=="video")
    // {return(this.renderVieo(conditionalRender,source.type))}
    return (
      <></>
      // <GifImage
      //   source={{uri: source}}
      //   style={[
      //     styles.image,
      //     {height: check ? heightPercentageToDP(100) : 200},
      //   ]}
      //   resizeMode={'stretch'}
      // />
    );
  };
  renderVideo = (source, aspectRatio, width, height) => {
    const { width: propWidth, height: propHeight } = this.props;

    let finalWidth = propWidth ? propWidth : width;

    const finalHeight = height || vScale(300);

    const paused =
      typeof this.props.paused == 'boolean' ? this.props.paused : false;

    return (
      <VideoPlayer
        source={{ uri: source }} // Can be a URL or a local file.
        ref={(ref) => {
          this.player = ref;
        }}
        onLoadStart={() => {
          // console.log('loading started', finalWidth);
        }}
        muted={true}
        disableBack={true}
        onEnterFullscreen={this.clickEventListener}
        paused={paused || !this.props?.focused}
        controlTimeout={30000}
        showOnStart={true}
        resizeMode={'contain'}
        volumeWidth={width * 0.4}
        style={[
          styles.image,
          {
            height: finalHeight,
            width: width,
            backgroundColor: '#000000',
          },
        ]}
      />
    );
  };
  renderOne() {
    const { images } = this.state;
    const { countFrom } = this.state;
    let conditionalRender = undefined;
    const { width: propWidth, height: propHeight } = this.props;
    let finalWidth = propWidth || widthPercentageToDP(95);

    return (
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.imageContent, styles.imageContent1]}
          onPress={() => {
            this.clickEventListener();
          }}>
          {this.renderAsset(
            images[0].type,
            images[0].url,
            images[0].aspectRatio,
            finalWidth,
          )}
        </TouchableOpacity>
      </View>
    );
  }
  renderOneForrHome(item) {
    console.log("gkgkkg", item)
    const { images } = this.state;
    const { countFrom } = this.state;
    let conditionalRender = undefined;
    const { width: propWidth, height: propHeight } = this.props;
    let finalWidth = DEVICE_WIDTH
    return (
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.imageContent, styles.imageContent1]}
          onPress={() => {
            this.clickEventListener();
          }}>
          {this.renderAsset(
            item.type,
            item.url,
            item.url.aspectRatio,
            finalWidth,
          )}
        </TouchableOpacity>
      </View>
    );
  }
  renderFlatList = (item) => {
    return (
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.imageContent, styles.imageContent1]}
          onPress={() => {
            this.clickEventListener();
          }}>
          {this.renderAsset(
            item.item.type,
            item.item.url,
            item.item.aspectRatio,
          )}
        </TouchableOpacity>
      </View>
    );
  };
  renderAsset = (type, url, aspectRatio, width) => {

    if (type == 'image' || type == 'gif') {
      return this.renderImage(url, aspectRatio, width);
    } else if (type == 'video') {
      return this.renderVideo(url, aspectRatio, width);
    } else if (type == 'gif') {
      return this.renderGif(url);
    }
  };

  renderOverlayAsset = (item) => {
    return (
      <TouchableOpacity
        style={[styles.imageContent1, { width: width }]}
        onPress={() => {
          this.clickEventListener();
        }}>
        {this.renderAsset(
          item.type,
          item.url,
          item.aspectRatio,
          widthPercentageToDP(100),
        )}
      </TouchableOpacity>
    );
  };

  renderTwo() {
    const { images } = this.state;
    const { countFrom } = this.state;
    const conditionalRender =
      [3, 4].includes(images.length) ||
      (images.length > +countFrom && [3, 4].includes(+countFrom));

    return (
      <View
        style={[
          styles.row,
          { alignItems: 'center', backgroundColor: '#000000' },
        ]}>
        <TouchableOpacity
          style={[styles.imageContent, styles.imageContent2]}
          onPress={() => {
            this.clickEventListener();
          }}>
          {this.renderAsset(
            conditionalRender ? images[1].type : images[0].type,
            conditionalRender ? images[1].url : images[0].url,
            conditionalRender ? images[1].aspectRatio : images[0].aspectRatio,
            widthPercentageToDP(47.5),
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.imageContent, styles.imageContent2]}
          onPress={() => {
            this.clickEventListener();
          }}>
          {this.renderAsset(
            conditionalRender ? images[2].type : images[1].type,
            conditionalRender ? images[2].url : images[1].url,
            conditionalRender ? images[2].aspectRatio : images[1].aspectRatio,
            widthPercentageToDP(47.5),
          )}
        </TouchableOpacity>
      </View>
    );
  }

  renderThree() {
    const { images } = this.state;
    const { countFrom } = this.state;
    const overlay =
      !countFrom ||
        countFrom > 5 ||
        (images.length > countFrom && [4, 5].includes(+countFrom))
        ? this.renderCountOverlay(true)
        : this.renderOverlay();
    const conditionalRender =
      images.length == 4 || (images.length > +countFrom && +countFrom == 4);

    return (
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.imageContent, styles.imageContent3]}
          onPress={() => {
            this.clickEventListener();
          }}>
          {this.renderAsset(
            conditionalRender ? images[1].type : images[2].type,
            conditionalRender ? images[1].url : images[2].url,
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.imageContent, styles.imageContent3]}
          onPress={() => {
            this.clickEventListener();
          }}>
          {this.renderAsset(
            conditionalRender ? images[2].type : images[3].type,
            conditionalRender ? images[2].url : images[3].url,
          )}
        </TouchableOpacity>
        {overlay}
      </View>
    );
  }

  renderOverlay() {
    const { images } = this.state;
    return (
      <TouchableOpacity
        style={[styles.imageContent, styles.imageContent3]}
        onPress={() => {
          this.clickEventListener();
        }}>
        <Image
          style={styles.image}
          source={{ uri: images[images.length - 1].url }}
        />
      </TouchableOpacity>
    );
  }

  renderCountOverlay(more) {
    const { images } = this.state;
    const { countFrom } = this.state;
    const extra = images.length - (countFrom && countFrom > 5 ? 5 : countFrom);
    const conditionalRender =
      images.length == 4 || (images.length > +countFrom && +countFrom == 4);
    return (
      <TouchableOpacity
        style={[styles.imageContent, styles.imageContent3]}
        onPress={() => {
          this.clickEventListener();
        }}>
        <Image
          style={styles.image}
          source={{ uri: conditionalRender ? images[3].url : images[4].url }}
        />
        <View style={styles.overlayContent}>
          <View>
            <Text style={styles.count}>+{extra}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  toggleOverlay = () => {
    this.setState({
      showOverlay: !this.state.showOverlay,
    });
  };
  _renderNextButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Icon
          name="controller-next"
          type="entypo"
          color="rgba(255, 255, 255, .9)"
          size={24}
        />
      </View>
    );
  };
  _renderDoneButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Icon
          name="controller-next"
          type="entypo"
          color="rgba(255, 255, 255, .9)"
          size={24}
        />
      </View>
    );
  };
  _renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        {this.renderAsset(item.type, item.url, true)}
      </View>
    );
  };
  componentDidMount() {
    setTimeout(() => {
      this.startAutoScroll();
    }, 500);  // 500ms delay to let FlatList render initially
  }

  componentWillUnmount() {
    clearInterval(this.scrollInterval);
  }

  startAutoScroll = () => {
    const { images } = this.state;
    const imagesToShow = images;

    if (imagesToShow.length === 0) return;

    this.scrollInterval = setInterval(() => {
      const { currentIndex } = this.state;
      const nextIndex = currentIndex + 1;
      if (nextIndex >= imagesToShow.length) {
        this.setState({ currentIndex: 0 }, () => {
          if (this.flatListRef.current) {
            this.flatListRef.current.scrollToIndex({ index: 0, animated: true });
          }
        });
      } else {
        this.setState({ currentIndex: nextIndex }, () => {
          if (this.flatListRef.current) {
            this.flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
          }
        });
      }
    }, 5000);
  };




  stopAutoScroll = () => {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
      this.setState({ intervalId: null });
    }
  };
  onScrollEnd = (event) => {
    const currentIndex = Math.floor(event.nativeEvent.contentOffset.x / DEVICE_WIDTH);
    this.setState({ currentIndex });

    this.stopAutoScroll();
    this.startAutoScroll();
  };
  render() {

    var { modal, index, countFrom } = this.state;
    var { images } = this.state;
    var imagesToShow = images;
    if (countFrom && images.length > countFrom) {
      imagesToShow.length = countFrom;
    }
    const { isTrue } = this.context ?? createContext();
    // if (isTrue){
    // return(
    //   <View style={styles.container}>
    //        <FlatList
    //   ref={this.flatListRef}
    //   data={imagesToShow}
    //   renderItem={({ item }) => this.renderOneForrHome(item)}
    //   keyExtractor={(item, index) => index.toString()}
    //   horizontal
    //   pagingEnabled
    //   showsHorizontalScrollIndicator={false}
    //   initialScrollIndex={0}
    //   getItemLayout={(data, index) => ({
    //     length: DEVICE_WIDTH,
    //     offset: DEVICE_WIDTH * index,
    //     index,
    //   })}
    //   onScrollEndDrag={this.onScrollEnd}
    //   style={{ width: DEVICE_WIDTH, height: 200 }}
    // />
    //       </View> 
    // )
    // }else{
    return (
      <View style={styles.container}>
        {[1, 3, 4].includes(imagesToShow.length) && this.renderOne()}
        {imagesToShow.length >= 2 &&
          imagesToShow.length != 4 &&
          this.renderTwo()}
        {imagesToShow.length >= 4 && this.renderThree()}
        <Overlay
          isVisible={this.state.showOverlay}
          // onBackdropPress={this.toggleOverlay}
          fullScreen>
          <>
            <Header
              leftComponent={{
                icon: 'arrow-back-ios',
                type: 'material',
                color: '#000',
                onPress: () => {
                  this.toggleOverlay();
                },
              }}
              containerStyle={{ backgroundColor: 'transparent', marginTop: -10 }}
            />
            <FlatList
              style={{ flex: 1 }}
              contentContainerStyle={{ alignItems: 'center' }}
              horizontal
              data={this.state.images}
              renderItem={({ item }) => this.renderOverlayAsset(item)}
              keyExtractor={(item, index) => index.toString()}
            />
          </>
        </Overlay>
        {
          this.state.pinchImg ?
            <AppModalView
              visible={true}
              customStyle={{ opacity: 1.9 }}
            >

              <ImageZoom cropWidth={Dimensions.get('window').width}
                cropHeight={Dimensions.get('window').height}
                imageWidth={this.state.pinchImg.width}
                imageHeight={this.state.pinchImg.finalHeight}>
                <FastImage style={{ width: this.state.pinchImg.width, height: this.state.pinchImg.finalHeight }}
                  source={{ uri: this.state.pinchImg.source }}
                  resizeMode='contain'
                />
              </ImageZoom>
              <TouchableOpacity
                onPress={() => { this.setState({ pinchImg: null }) }}
                style={{
                  backgroundColor: 'white',
                  height: 50,
                  width: 50,
                  position: 'absolute',
                  top: 60, right: 30,
                  borderRadius: 25,
                  justifyContent: 'center',
                  alignItems: 'center'

                }}>

                <Text style={{ fontSize: 30, fontWeight: 'bold' }}>x</Text>

              </TouchableOpacity>
            </AppModalView>
            :
            null
        }
      </View>
    );
  }
  // }
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // height: vScale(640),
    // width: scale(360),
    marginVertical: 0,
    marginHorizontal: 0,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  imageContent: {
    margin: 1,
    flex: 1,
    // backgroundColor:'red'
  },
  imageContent1: {
    margin: 1,
    width: '100%',
  },
  imageContent2: {
    margin: 1,
    width: '50%',
  },
  imageContent3: {
    margin: 1,
    width: '33.33%',
  },
  image: {
    width: '100%',
    height: 200,
  },
  //overlay efect
  overlayContent: {
    flex: 1,
    position: 'absolute',
    zIndex: 100,
    right: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontSize: 50,
    color: '#ffffff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 139, 1)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  buttonCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, .2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    overflow: 'hidden',
  },
});


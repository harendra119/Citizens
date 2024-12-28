import {Dimensions, Platform} from 'react-native';

const {width, height} = Dimensions.get('window');
const [shortDimension, longDimension] =
  width < height ? [width, height] : [height, width];

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 667;

export const scale = (size) => (shortDimension / guidelineBaseWidth) * size;
export const vScale = (size) => (longDimension / guidelineBaseHeight) * size;
export const mScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const isIPhoneXSize = (dim) => {
  return dim.height === 812 || dim.width === 812;
};

const isIPhoneXrSize = (dim) => {
  return dim.height === 896 || dim.width === 896;
};

const isIphoneX = () => {
  const dim = Dimensions.get('window');

  return (
    // This has to be iOS
    Platform.OS === 'ios' &&
    // Check either, iPhone X or XR
    (isIPhoneXSize(dim) || isIPhoneXrSize(dim))
  );
};

const isIpadSize = (dim) => {
  return dim.height === 1024 || dim.width === 1024;
};

const isIpad = () => {
  const dim = Dimensions.get('window');

  return (
    // This has to be iOS
    Platform.OS === 'ios' &&
    // Check either, iPhone X or XR
    isIpadSize(dim)
  );
};

const deviceWidth = width;
const deviceHeight = height;

export default {
  scale,
  mScale,
  vScale,
  deviceWidth,
  deviceHeight,
  isIphoneX,
  isIpad,
};

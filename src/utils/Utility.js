import { Alert, Dimensions } from "react-native";


export const DEVICE_HEIGHT = Dimensions.get('window').height;
export const DEVICE_WIDTH = Dimensions.get('window').width;


class Utility {
  static currentSearchType = 1;
  static currentReqIndex = false;
  static currentMovIndex = false;

  setSearchType = (searchType) => {
    Utility.currentSearchType = searchType;
  }

  getSearchType = () => {
    return Utility.currentSearchType;
  }

  setReqIndex = (index) => {
    Utility.currentReqIndex = index;
  }

  getReqIndex = () => {
    return Utility.currentReqIndex;
  }

  setMovIndex = (index) => {
    Utility.currentMovIndex = index;
  }

  getMovIndex = () => {
    return Utility.currentMovIndex;
  }

  showMessage = (message, title = '') => {
    Alert.alert(
      title,
      message
    );
  }

  showMessageWithActionCancel = (action, cancelAction, message, title = '') => {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          onPress: () => cancelAction(),
          style: 'destructive',
        },
        {
          text: 'Yes',
          onPress: () => action(),
          style: 'cancel',
        },
      ]
    );
  }
}

export default new Utility();
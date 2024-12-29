
import React from 'react';
import {
  View,
  Modal,
  Dimensions
} from 'react-native';

export const DEVICE_HEIGHT = Dimensions.get('window').height;
export const DEVICE_WIDTH = Dimensions.get('window').width;



const AppModalView = (props) => {
  return (
    <View>
      <Modal
        animationType='slide'
        transparent={true}
        visible={props.visible}>
          <View style={[{
            backgroundColor: 'black',
            opacity: 0.7,
            position: 'absolute',
            top: 0,
            left: 0,
            height: DEVICE_HEIGHT,
            width: DEVICE_WIDTH
          }, props.customStyle]} />
          <View  style= {props.style || { 
            flex: 1, 
            backgroundColor: 'transparent', 
            justifyContent: 'flex-end' 
          }}>
        {
          props.children
        }
        </View>
      </Modal>
    </View>
  );
}

export default AppModalView;
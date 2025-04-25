
import React from 'react'
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native'
import { DEVICE_HEIGHT, DEVICE_WIDTH } from '../utils/Utility'



export default function AppLoader(props) {
  return (
    <View style={[styles.loaderContent, props.style]}>
      <ActivityIndicator size={'large'} color={'blue'} />
       {props.message ? 
       <Text style={styles.title}>
        {props.message}
       </Text>
       :
       null
      }
    </View>
  )
}

const styles = StyleSheet.create({
  loaderContent: {
    position: 'absolute',
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
    backgroundColor: 'white',
    opacity: 0.8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontFamily: 'RedHatDisplay-Bold',
    color: '#000',
    marginTop: 30,
  }
})

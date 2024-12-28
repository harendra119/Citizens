import React, { createContext, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { scale, vScale } from '../configs/size';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

const AppHeader = (props: any) => {
    const navigation = useNavigation();
    const onBackPress = () => {
        navigation.goBack();
    }
    return (
        <SafeAreaView>
        <View style={{
            backgroundColor: '#1e2348',
        }}>
            <TouchableOpacity 
            style={[styles.iconBg, { backgroundColor: '#1e2348' }]} onPress={onBackPress}>
                <Icon
                   name="chevron-back-outline"
                    type="ionicon"
                    size={vScale(30)}
                    color="white"
                />
            </TouchableOpacity>
        </View>
        </SafeAreaView>
        
    );
};

export default AppHeader;

const styles = StyleSheet.create({
    iconBg: {
        backgroundColor: '#d9d9d9',
        borderRadius: vScale(25),
        width: 100,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginRight: scale(10),
        marginVertical: scale(3),
    },
})
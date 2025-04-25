import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    StatusBar,
    SafeAreaView,
    TouchableOpacity,
    Text,
} from 'react-native';
import Image from 'react-native-fast-image';
import { DEVICE_HEIGHT, DEVICE_WIDTH } from '../../utils/Utility';
import Header from '../../components/header';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { vScale } from '../../configs/size';

const LimitNum = 10;

const onboarding_images = [
    {
        id: 1,
        img:
            'https://drive.google.com/uc?export=view&id=1uMRRxuXkj1arzJCMkj-wuMw5yFZiGZOm',

    },
    {
        id: 2,
        img:
            'https://drive.google.com/uc?export=view&id=1H9Gj6GGnTFLmTmWCTFn4WSKvyYyG3-XO',

    },
    {
        id: 3,
        img:
            'https://drive.google.com/uc?export=view&id=1o58Q92MVVkeO8dq-v4SLRYh8I9KkseGb',

    },
    {
        id: 4,
        img:
            'https://drive.google.com/uc?export=view&id=1cpI509wEaXzPANf0Bha7z24ZR6H0uU9e',

    },
    {
        id: 5,
        img:
            'https://drive.google.com/uc?export=view&id=1KrYBXwmTbGgQICpEnlAsbO48-ITBECzW',

    },

];

const Onboarding = ({ navigation }) => {

    const [activeIndex, setActiveIndex] = useState(0);

    const renderItem = ({ item, index }) => {
        return (
            <Image
                source={{ uri: item.img }}
                resizeMode='stretch'
                style={{
                    width: DEVICE_WIDTH,
                    height: DEVICE_HEIGHT
                }}
            />
        )
    }


    return (
        <SafeAreaView style={{ flex: 1 }}>

            <View style={{ flex: 1, backgroundColor: '#eef3f7', paddingTop: 10 }}>
                <Carousel
                    data={onboarding_images}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `${index}`}
                    containerCustomStyle={{ flexGrow: 0 }}
                    horizontal
                    itemWidth={DEVICE_WIDTH}
                    sliderWidth={DEVICE_WIDTH}
                    slideStyle={{
                        flex: 1,
                        backgroundColor: '#ffffff',
                        justifyContent: 'center',
                    }}
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onSnapToItem={(idx) => {
                        setActiveIndex(idx);
                    }}
                />

                {
                    activeIndex == onboarding_images.length - 1 ?
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate("Home")
                            }}
                            style={{ borderRadius: 20, backgroundColor: '#1e2348', marginHorizontal: 50, height: 40, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                            <Text style={{ fontWeight: '500', color: '#fff' }}>
                                Let's get started
                            </Text>
                        </TouchableOpacity>
                        :
                        <Pagination
                            dotsLength={onboarding_images.length}

                            activeDotIndex={activeIndex}
                            containerStyle={{
                                position: 'absolute',
                                bottom: vScale(0),
                                alignSelf: 'center',
                                //   backgroundColor: 'gray',
                                justifyContent: 'center',
                            }}
                            dotStyle={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'white',
                            }}
                            dotContainerStyle={{
                                backgroundColor: 'rgb(0, 0, 0, 1)',
                                borderRadius: 10,
                                width: 12,
                                height: 12,

                            }}
                            inactiveDotStyle={
                                {
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: 'gray',
                                }
                            }
                            inactiveDotOpacity={0.9}
                            inactiveDotScale={1}
                        />
                }


            </View>
        </SafeAreaView>
    );
};

export default Onboarding;


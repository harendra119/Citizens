import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    FlatList,
    StatusBar,
    Text,
    TouchableOpacity,
} from 'react-native';
import Image from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import { DEVICE_WIDTH } from '../../utils/Utility';
import Header from '../../components/header';
import { firebaseDbObject } from '../../utils/FirebseDbObject';
import firestore from '@react-native-firebase/firestore';

const LimitNum = 10;

const cities = [
    {
        id: 1,
        name: 'Toronto',
        desc: `Toronto is the provincial capital of Ontario, in southeastern Canada. It is Canada's most populated city, a cosmopolitan hub, and the country's financial and commercial center. It is Canada's largest metropolis and a global leader in industries like business, banking, technology, entertainment, and culture. It is home to the Toronto Raptors and Maple Leafs.`,
        img:
            'https://drive.google.com/uc?export=view&id=1uMRRxuXkj1arzJCMkj-wuMw5yFZiGZOm',

    },
    {
        id: 2,
        name: 'Niagara Falls',
        desc: `Niagara Falls, a waterfall on the Niagara River, is one of the continent's most iconic sights. From the top of the Skylon Tower to the foot of the Canadian Horseshoe Falls, Niagara Falls is a breathtaking tourist and holiday destination. The city is a lively all-season destination with many attractions, including the SkyWheel and thrilling boat rides, and a memorable nightly Niagara Falls fireworks show. You'll also have easy access to nature, and there are numerous walking, hiking, and biking paths nearby`,
        img:
            'https://drive.google.com/uc?export=view&id=1H9Gj6GGnTFLmTmWCTFn4WSKvyYyG3-XO',

    },
    {
        id: 3,
        name: 'Vancouver',
        desc: `Vancouver is a thriving seaport on Canada's west coast, situated in the beautiful and incredible province of British Columbia. This noteworthy Canadian city is popular with both visitors and inhabitants due to its breathtaking beauty, many recreational opportunities, abundance of wildlife, and rich culture.`,
        img:
            'https://drive.google.com/uc?export=view&id=1o58Q92MVVkeO8dq-v4SLRYh8I9KkseGb',

    },
    {
        id: 4,
        name: 'Mississauga',
        desc: `Mississauga is both a residential suburb of Toronto and a vital industrial hub in its own right. Mississauga, Ontario's third largest municipality by population and sixth in Canada, is known for its vivid art, historic towns, innovative gastronomic, recreational areas, and shopping malls.`,
        img:
          'https://drive.google.com/uc?export=view&id=1cpI509wEaXzPANf0Bha7z24ZR6H0uU9e',
        
      },
      {
        id: 5,
        name: 'Ottawa',
        desc: `Ottawa is Canada's spectacular capital city, located on the south bank of the Ottawa River in Ontario. Ottawa is cosmopolitan, with museums, galleries, performing arts, and festivals, yet it retains the atmosphere of a small town and is reasonably priced. The most common languages spoken in Ottawa are English and French, and the city is multicultural and cosmopolitan. Ottawa offers something for everyone, from gorgeous gothic architecture to an infatuation with haunted houses and the paranormal. Every year, more than 7.3 million people visit the city to enjoy its tourist attractions and festivities.`,
        img:
          'https://drive.google.com/uc?export=view&id=1KrYBXwmTbGgQICpEnlAsbO48-ITBECzW',
        
      },
      {
        id: 6,
        name: 'Brampton',
        desc: `Brampton began as Canada's top "FlowerTown" in the late nineteenth century. This resulted from the city's large greenhouse sector, which transported roses, orchids, and cut flowers across the world. Downtown Brampton features a multitude of businesses and eateries along Queen Street and Main Street. The route hosts various yearly events, including an Easter Egg Hunt, a Santa Claus Parade, and a summer Farmers Market.`,
        img:
          'https://drive.google.com/uc?export=view&id=1i_w05hOe3iQFRKQmHZPx8RUx3YuSsCWn',
        
      },
      {
        id: 7,
        name: 'Montreal',
        desc: `Montreal, city, Quebec province, southeastern Canada. Montreal is the second most-populous city in Canada. It has the high culture, style and gourmet food of the most elegant corners of France, and the informality, innovation and gregarious warmth of North America. Based in the French-speaking province of Quebec, and a one-time French colony, it has both art galleries and nightclubs, couture and jeans, high-class wine and cheese-smothered chips.`,
        img:
          'https://drive.google.com/uc?export=view&id=1kla5LbuQPDmsDYVAEAEo_dWpLgBlxC6d',
        
      },
      {
        id: 8,
        name: 'Calgary',
        desc: `Calgary is recognized as the primary urban and economic centre for Alberta's southern region. Calgary's downtown enjoys everything you'd expect from a large city, including shopping, good restaurants, museums, and an abundance of entertainment options. Each of the neighboring communities has its own distinct personality, complete with boutiques, breweries, and a variety of public art. The petroleum sector, agriculture, and tourism are the primary economic drivers of Calgary.`,
        img:
          'https://drive.google.com/uc?export=view&id=1ZzLI_CC3a5_l9OCTW_yAoMXWOXH9Cx3k',
        
      },
];

const CityList = ({ navigation }) => {
    const userProfile = useSelector((state) => state.user.userProfile);
    const [citiesFromFirebase, setCitiesFromFirebase] = useState([]);
    const [isFollowingCity, setIsFollowingCity] = useState(null);
    

    useEffect(() => {
        const fetchCities = async () => {
          const citySnapshot = await firebaseDbObject.collection('cities').get();
          setCitiesFromFirebase(citySnapshot.docs.map(doc => ({ cityId: doc.id, ...doc.data() })));
        };
        fetchCities();
      }, []);

    useEffect(() => {
        const checkFollowedCity = async () => {
          const userDoc = await firebaseDbObject.collection('Users').doc(userProfile.userId).get();
          const followedCity = userDoc.data()?.followed_city;
          if (followedCity)
          setIsFollowingCity(followedCity);
        else {
            setIsFollowingCity(false);
        }
          if (followedCity) {
            navigation.navigate('ActivismDetails', { cityId: followedCity });
          }
        };
    
        checkFollowedCity();
      }, []);

    const followCity = async (cityId: string) => {
         await firebaseDbObject.collection('Users').doc(userProfile.userId).update({ followed_city: citiesFromFirebase[0].cityId });
         const cityRef = firebaseDbObject.collection('cities').doc(citiesFromFirebase[0].cityId);
         await cityRef.update({
            followers: firestore.FieldValue.increment(1),  // Decrement like count
          });
         navigation.navigate('ActivismDetails', {
           cityId: citiesFromFirebase[0].cityId
          });
      };

      const unfollowCity = async (cityId) => {
        const cityRef = firebaseDbObject.collection('cities').doc(citiesFromFirebase[0].cityId);
        await firebaseDbObject.collection('Users').doc(userProfile.userId).update({ followed_city: null });
        await cityRef.update({
          followers: firestore.FieldValue.increment(-1),  // Decrement like count
        });
      };

    const renderCity = ({ item, index }) => {
        return (
            <TouchableOpacity style={{
                backgroundColor: '#fff',
                marginBottom: 20

            }}
            onPress={() => {
                if (isFollowingCity) {
                    navigation.navigate('ActivismDetails', { cityId: isFollowingCity });
                }
            }}
            >
                <Image
                    source={{ uri: item.img }}
                    resizeMode='stretch'
                    style={{
                        width: DEVICE_WIDTH,
                        height: DEVICE_WIDTH / 2
                    }}
                />
                <View style={{ padding: 15 }}>
                    <Text style={{ fontWeight: 'bold' }}>
                        {item.name}
                    </Text>
                    <Text numberOfLines={2} style={{ fontWeight: '400', marginVertical: 8 }}>
                        {item.desc}
                    </Text>
                    {
                        index == 0 ?
                        isFollowingCity != null ?
                        <TouchableOpacity 
                        onPress={() => {
                            if (!isFollowingCity) {
                                followCity(item.id)
                                setIsFollowingCity(item.id)
                            } else {
                                unfollowCity(item.id)
                                setIsFollowingCity(false)
                            }
                           
                        }}
                        style={{ borderRadius: 20, backgroundColor: '#1e2348', marginHorizontal: 50, height: 40, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                        <Text style={{ fontWeight: '500', color: '#fff' }}>
                            {isFollowingCity ? 'LEAVE' : 'JOIN'}
                        </Text>
                    </TouchableOpacity>
                    :
                    null
                    :
                   
                    <Text
                    style={{
                        fontWeight: '600',
                        color: '#000',
                        textAlign: 'center',
                        marginVertical: 5
                    }}
                    >Launching Soon...</Text>
                    }
                   
                </View>


            </TouchableOpacity>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <Header navigation={navigation} />
            <StatusBar backgroundColor={'#000000'} />
            <View style={{flex: 1, backgroundColor: '#eef3f7', paddingTop: 10}}>
            <FlatList
                data={cities}
                renderItem={renderCity}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => {
                    return `${item.id}-${index}`;
                }}
                style={{}}
            />
            </View>

        </View>
    );
};

export default CityList;



// useEffect(() =>{
  //   try {
  //     // Add city to the 'cities' collection with tabs structure
  //     firestore().collection('cities').add({
  //       id: 1,
  //       name: 'Toronto',
  //       desc:"Toronto is the provincial capital of Ontario, in southeastern Canada. It is Canada's most populated city, a cosmopolitan hub, and the country's financial and commercial center. It is Canada's largest metropolis and a global leader in industries like business, banking, technology, entertainment, and culture. It is home to the Toronto Raptors and Maple Leafs.",
  //       img: 'https://drive.google.com/uc?export=view&id=1uMRRxuXkj1arzJCMkj-wuMw5yFZiGZOm',
  //       followers: 0,  // Initial followers count
  //       likes: 0,      // Initial likes count
  //       tabs: {
  //         life: [1, 2, 3, 4, 5, 6, 7, 8],  // Default subcategories for Life tab
  //         today: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],           // Default subcategories for Today tab
  //         events: [],                           // Events tab may not have subcategories
  //       },
  //     });

  //     console.error('SUCEssSS adding city:');
  //   } catch (error) {
     
  //     console.error('Errosssr adding city:', error);
  //   }
  // }, [])
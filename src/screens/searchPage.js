import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, ImageBackground, Keyboard, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';

import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

import { connect } from "react-redux";

import { getUsersforFilters,getUsers } from '../backend/apis'
import { Icon, Avatar, ListItem, Button, Header, SearchBar, Overlay } from 'react-native-elements'
import UserRow from '../components/listItem'
class HeaderClass extends Component {
    constructor(props) {
        super(props)
        this.state = {
            search: this.props.search,
            users: []
        }

    }
    componentDidMount() {
        getUsers().then((data) => {
            if (data.success) {

                this.props.setAlluser(data.data)
            } 
        });
        this.changeText()
    }

    changeText = () => {
        let tempArray = []
        for (let i = 0; i < this.props.allUsers.length; i++) {

            if (this.props.allUsers[i].displayName.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1) {
                tempArray.push(this.props.allUsers[i])
            }
        }
        this.setState({ users: tempArray })
    }
    renderItem = ({ item }) => (
        <UserRow inHeader={false} item={item} navigation={this.props.navigation} />

    );
    renderEmptyList = () => {
        return (
            <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center', height: hp(100) / 3 }}>
               {/* <Text style={{ textAlign: 'center' }}>No user exist....</Text> */}
            </View>

        )
    }
    render() {


        return (
            <View style={{ zIndex: 9999, flex: 1 }}>


                <Header
                    leftComponent={(<Avatar source={{ uri: this.props.imageUrl != null ? this.props.imageUrl : 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png' }} size={'small'} rounded containerStyle={{ borderColor: '#1b224d', borderWidth: 2 }} />)}
                    centerComponent={(
                        <View>
                            <SearchBar
                                placeholder="Search"
                                onChangeText={(search) => {
                                    this.setState({ search }, () => {
                                        this.changeText()
                                    })
                                }}
                                lightTheme={true}
                                containerStyle={style.headerCont}
                                inputStyle={{ fontSize: 12 }}
                                inputContainerStyle={style.headerINput}
                                value={this.state.search}
                            />
                        </View>)}

                    rightComponent={(
                        <View style={{ flexDirection: 'row' }}>
                            {/* <TouchableOpacity onPress={() => {
                                this.props.navigation.removeListener('beforeRemove')
                                this.props.navigation.navigate('loginScreen')
                            }}>
                                <Icon name="logout" type="material" color="#636363" size={20} style={{ margin: 5 }} />
                            </TouchableOpacity> */}
                            <TouchableOpacity onPress={this.props.toggoleDrawer}>
                                <Icon name="menu" type="entypo" color="#636363" size={20} style={{ margin: 5 }} />
                            </TouchableOpacity>
                        </View>
                    )}
                    containerStyle={{ backgroundColor: 'transaprent', padding: 0, margin: this.props.inHeader ? -10 : 0 }}
                />
                <FlatList
                    data={this.state.users}
                    renderItem={this.renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={this.renderEmptyList}
                />

            </View>
        );
    }
}

const style = StyleSheet.create({
    container: {
        flex: 1,
    },
    banner: { width: wp(100), height: hp(20) },
    image: {
        alignSelf: 'center',
        borderColor: '#1b224d', borderWidth: 2
    },
    listCont: { backgroundColor: 'transparent', width: wp(100), padding: 4, margin: 0 },
    userTitle: { alignSelf: 'center', fontSize: 18, fontWeight: 'bold' },
    nickName: { alignSelf: 'center', fontSize: 14, color: '#000' },
    row: { justifyContent: "flex-start", flexDirection: 'row', marginVertical: 5, width: wp(80), alignSelf: 'center' },
    innerRow: { flexDirection: 'row', alignItems: "center" },
    secondRow: { flexDirection: 'row', alignItems: "center" },
    innerText: { margin: 5, fontSize: 10 },
    buttonStyle: { height: 30, backgroundColor: 'transparent' },
    buttonCont: { backgroundColor: '#1e2348', width: wp(35), height: 30, borderRadius: 30, alignSelf: 'center', marginTop: hp(2), alignItems: 'center' },
    categoryContainer: { marginTop: hp(1), alignSelf: 'center' },
    accountsCategory: { margin: 10 },
    accountText: { fontSize: 16, fontWeight: '600' },
    bannerBottom: { flexDirection: 'row', marginBottom: 5, marginRight: 20, alignSelf: 'flex-end', marginTop: hp(2) },
    bannerIcon: { backgroundColor: '#1e2348', padding: 3, borderRadius: 100, margin: 5 },
    headerCont: { width: wp(61), backgroundColor: 'transparent', elevation: 0, borderWidth: 0, padding: 0 },
    headerINput: { height: hp(5), borderRadius: 20 },


});
const mapStateToProps = (state) => {

    return {
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        adult: state.adult,
        country: state.country,
        bio: state.bio,
        userName: state.userName,
        displayName: state.displayName,
        imageUrl: state.imageUrl,
        location: state.location,
        cover: state.cover,
        birthdate: state.birthdate,
        occupation: state.occupation,
        showSearcHresult: state.showSearcHresult,
        search: state.search,
        allUsers: state.allUsers,
        onlyfiveResult: state.onlyfiveResult
    }
}
const mapDispachToProps = (Dispatch) => {
    return {

        toggoleDrawer: () => Dispatch({ type: 'toggoleDrawer' }),
        addSearch: (search) => Dispatch({ type: 'addSearch', search: search }),
        setAlluser: (users) => Dispatch({ type: 'setAlluser', users: users }),
        // closeSearchFilter: () => Dispatch({ type: "closeSearchFilter" })
    }
}

export default connect(mapStateToProps, mapDispachToProps)(HeaderClass)

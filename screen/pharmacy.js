import React, {useEffect, useState} from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Dimensions, SafeAreaView, Image } from 'react-native'
import { AntDesign, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import { Api } from '../api/lienapi'
import * as Location from 'expo-location';

export default function Pharmacy(props) {
    const [search, setSearch] = useState('')
    const [drugs, setDrugs] = useState([])

    // const [location, setLocation] = useState([])

    const pharmacy = props.route.params.pharmacy

    // useEffect(() => {
    //     (async () => {
    //         let location = await Location.getCurrentPositionAsync({});
    //         setLocation({longitude: location.coords.longitude, latitude: location.coords.latitude})
    //     })();
    // }, []);

    const getDrugs = async() => {
        try {
            let response = await fetch(`${Api}pharmacies/${pharmacy.id}/drug/?q=${search}`)
            
            const json = await response.json()
            setDrugs(json.data)

        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if(search.length > 0) {
            getDrugs()
        }else[
            setDrugs([])
        ]
    }, [search])

    const is_open = () => {
        let current_hour = (new Date()).getHours();
        if (current_hour <= 22 || pharmacy.on_call)
            return true
        return false
    }

    return (
        <View style={styles.container}>
            <View style={{ borderBottomColor: '#DDDEE1', borderBottomWidth: 1, borderStyle: 'solid', backgroundColor: '#fff', paddingTop: (Dimensions.get('window').height / 16), paddingBottom: 8 }}>
                <SafeAreaView style={styles.inputContainer}>
                    <TouchableOpacity onPress={() => props.navigation.goBack() } activeOpacity={0.9}>
                        <AntDesign name="arrowleft" size={24} color="#3C4043" />
                    </TouchableOpacity>
                    <TextInput 
                        style={styles.input}
                        placeholder="Recherche un médicament"
                        value={search}
                        selectionColor="#00897E"
                        onChangeText={(text) => setSearch(text)}
                    />
                </SafeAreaView>
            </View>

            <View style={{ marginHorizontal: 10, marginVertical: 10 }}>
                <SafeAreaView style={{ flexDirection: 'row', marginBottom: 25 }} >
                    <Image 
                        source={{ uri: pharmacy.image}}
                        style={{ width: 140, height: 140, marginRight: 5, borderRadius: 6 }} 
                    />
                    <SafeAreaView style={{flexShrink: 1, width: '100%', justifyContent: 'space-between'}}>
                        <SafeAreaView>
                            <Text style={{ fontWeight: '400', fontFamily: 'Mulish', fontSize: 18, flexShrink: 0, marginBottom: 5 }}> { pharmacy.name } </Text>
                            <SafeAreaView style={{ flexDirection: 'row', marginBottom: 5 }}>
                                <Text style={{fontSize: 16, color: '#A7ABAD', marginRight: 50 }}> { pharmacy.distance.toPrecision(2) } km</Text>
                                <Text style={[{fontSize: 16}, is_open ? {color: '#00897E'} : {color: '#DA645C'} ]}>{ is_open ? 'Ouvert' : 'Fermé'}</Text>
                            </SafeAreaView>
                            <Text style={{fontSize: 16, color: '#A7ABAD'}}> +229 99 08 13 82</Text>
                        </SafeAreaView>

                        <TouchableOpacity style={[styles.badge_button, { backgroundColor: '#00897E' }]}>
                            <MaterialCommunityIcons name="directions" size={20} color="#fff" />
                            <Text style={{marginLeft: 6 ,alignSelf: 'center',fontFamily: 'Mulish', fontSize: 16, textAlign: 'center', color: 'white'}}>Itinéraire</Text>
                        </TouchableOpacity>
                    </SafeAreaView>
                </SafeAreaView>

                { (drugs.length > 0 && search.length > 0) && <SafeAreaView style={{ flexDirection: 'column' }} >
                        <Text style={{ fontFamily: 'Mulish', fontSize: 20, marginBottom: 10 }}> Résultats </Text>
                        <FlatList
                            data={drugs}
                            keyExtractor={(item) => item.id}
                            renderItem={({item}) => (
                                <SafeAreaView style={styles.itemContainer} activeOpacity={0.4}>
                                    <SafeAreaView style={{ marginRight: 15, alignSelf: 'center' }}>
                                        <Ionicons 
                                            name="location-outline" 
                                            size={24} 
                                            color="#3E4245" 
                                            style={{ 
                                                alignSelf: 'center',
                                                backgroundColor: '#E9EAEE',
                                                paddingHorizontal: 5,
                                                paddingVertical: 4,
                                                borderRadius: 20 
                                            }}/>
                                    </SafeAreaView>
                                    <SafeAreaView style={styles.itemleft}>
                                        <Text style={{ fontSize: 18 }}>{item.name}</Text>
                                        <Text style={{fontSize: 15}}> { item.dose } </Text>
                                    </SafeAreaView>
                                </SafeAreaView>
                            )}/>
                    </SafeAreaView>
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: "#fff",
        flexDirection: "column",
    },
    inputContainer: {
        flexDirection: 'row',
        display: 'flex',
        marginHorizontal: 18, 
        backgroundColor: "#fff",
        borderRadius: 40,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderColor: '#00897E',
        borderWidth: 1,
        borderStyle: 'solid',
    },
    input: {
        width: '86%',
        marginLeft: '2%',
        fontFamily: 'Mulish',
        fontSize: 16,
        fontWeight: '100',
        color: '#202125'
    },
    listContainer: {
        flex: 1,
    },
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        // paddingHorizontal: 18,
        paddingVertical: 8,
        borderBottomColor: '#DDDEE1',
        borderBottomWidth: 1,
    },
    itemleft: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexGrow: 1,
        alignSelf: 'center',
        height: '100%',
        paddingBottom: 14,
    },
    badge_button:{
        paddingHorizontal: 14,
        paddingVertical: 6,
        // backgroundColor: 'yellow',
        flexDirection: 'row' ,
        justifyContent: 'center',
        fontFamily: 'Mulish',
        borderRadius: 20,
        // width: Dimensions.get('window').width / 3.5,
        borderStyle: 'solid',
        borderColor: '#00897E',
        borderWidth: 1,
    }
})
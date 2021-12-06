import React, {useEffect, useState} from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Dimensions, SafeAreaView } from 'react-native'
import { AntDesign, Ionicons, Feather } from '@expo/vector-icons'
import { Api } from '../api/lienapi'
import * as Location from 'expo-location';

export default function Search(props) {
    const [search, setSearch] = useState('')
    const [location, setLocation] = useState([])
    const [pharmacies, setPharmacies] = useState([])

    const getPharmacies = async() => {
        try {
            let response = await fetch(`${Api}pharmacies/search/?q=${search}&lat=${location.latitude}&lng=${location.longitude}`)
            
            const json = await response.json()
            setPharmacies(json.data)

        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        (async () => {
            let location = await Location.getCurrentPositionAsync({});
            setLocation({longitude: location.coords.longitude, latitude: location.coords.latitude})
        })();
    }, []);

    useEffect(() => {
        if(search.length > 0) {
            getPharmacies()
        }
        else
            setPharmacies([])
    }, [search])

    const is_open = (pharmacy) => {
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
                        placeholder="Rechercher une pharmacie"
                        autoFocus={true}
                        value={search}
                        selectionColor="#00897E"
                        onChangeText={(text) => setSearch(text)}
                    />
                </SafeAreaView>
            </View>
            <View style={styles.listContainer}>
                <FlatList
                    data={pharmacies}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) => (
                        <TouchableOpacity onPress={() => { props.navigation.navigate('Pharmacy', { 'pharmacy': item }) }} style={styles.itemContainer} activeOpacity={0.4}>
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
                                <Text style={{fontSize: 13, color: '#A7ABAD'}}> {item.distance.toPrecision(2)} km</Text>
                            </SafeAreaView>
                            <SafeAreaView style={styles.itemleft}>
                                <SafeAreaView>
                                    <Text style={{ fontSize: 18 }}>{item.name}</Text>
                                    <Text style={[{fontSize: 15}, is_open(item) ? {color: '#00897E'} : {color: '#DA645C'} ]}>{ is_open(item) ? 'Ouvert' : 'Fermé'}</Text>
                                </SafeAreaView>
                                <Feather name="arrow-up-left" size={24} color="#3E4245" style={{ alignSelf: 'center' }} />
                            </SafeAreaView>
                        </TouchableOpacity>
                    )}
                />
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
        // position: 'absolute',
        flexDirection: 'row',
        // top: 55,
        // left: 0,
        // right: 0,
        display: 'flex',
        marginHorizontal: 18, 
        backgroundColor: "#fff",
        // elevation: 2,
        borderRadius: 40,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderColor: '#00897E',
        borderWidth: 1,
        borderStyle: 'solid',
        // backgroundColor: 'red',
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
        // backgroundColor: "red",
        // borderRadius: 40,
        // borderColor: '#c1c1c1',
        // borderWidth: 1,
        // borderStyle: 'solid',
        // backgroundColor: 'red',
    },
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        // backgroundColor: "yellow",
        // paddingHorizontal: 8,
        paddingHorizontal: 18,
        paddingVertical: 8,
        // borderColor: '#c1c1c1',
        // borderBottomWidth: 1,
        // borderStyle: 'solid',
    },
    itemleft: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexGrow: 1,
        alignSelf: 'center',
        borderBottomColor: '#DDDEE1',
        borderBottomWidth: 1,
        height: '100%',
        // backgroundColor: 'red',
        paddingBottom: 14,
        // alignContent: 'center',
        // alignItems: 'center',
    }
})
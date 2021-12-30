import React, {useEffect, useState, useRef} from 'react'
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Image } from 'react-native'
import { AntDesign, Ionicons, Feather } from '@expo/vector-icons'
import { SearchBar } from 'react-native-elements';
import { Api } from '../api/lienapi'
import * as Location from 'expo-location';
import { useDispatch } from 'react-redux'

export default function Search(props) {
    const dispatch = useDispatch()

    const [search, setSearch] = useState('')
    const [location, setLocation] = useState([])
    const [pharmacies, setPharmacies] = useState([])
    const [loading, setLoading] = useState(false)
    const [loading_more, setLoadingMore] = useState(false)
    const [nextLink, setNextLink] = useState(null)

    let search_input = useRef(null)

    const getPharmacies = async() => {
        setLoading(true)
        try {
            let response = await fetch(`${Api}pharmacies/search/?q=${search}&lat=${location.latitude}&lng=${location.longitude}`)
            
            const json = await response.json()
            setPharmacies(json.results)
            setNextLink(json.next)
            setLoading(false)

        } catch (error) {
            setLoading(false)
            console.error(error);
        }
    }

    useEffect(() => {
        (async () => {
            let location = await Location.getCurrentPositionAsync({});
            setLocation({longitude: location.coords.longitude, latitude: location.coords.latitude})
        })();
        search_input.focus()
    }, []);

    useEffect(() => {
        if(search.length > 0) {
            getPharmacies()
        }
        else
            setPharmacies([])
    }, [search])

    const loadMoreData = async() => {
        if (nextLink) {
            setLoadingMore(true)
            try {
                let response = await fetch(nextLink)
                
                const json = await response.json()
                setPharmacies([...pharmacies, ...json.results])
                setNextLink(json.next)
                setLoadingMore(false)
    
            } catch (error) {
                setLoadingMore(false)
                console.error(error);
            }
        }
    }

    const is_open = (pharmacy) => {
        let current_hour = (new Date()).getHours();
        if (current_hour <= 22 || pharmacy.on_call)
            return true
        return false
    }

    return (
        <View style={styles.container}>
            <View style={{ borderBottomColor: '#DDDEE1', borderBottomWidth: 1, borderStyle: 'solid', backgroundColor: '#fff', paddingTop: (Dimensions.get('window').height * 0.058), paddingBottom: 8 }}>
                <View style={styles.inputContainer}>
                    <TouchableOpacity onPress={() => props.navigation.goBack() } activeOpacity={0.9}>
                        <AntDesign name="arrowleft" size={24} color="#3C4043" />
                    </TouchableOpacity>
                    <SearchBar 
                        ref={(search) => search_input = search}
                        containerStyle={styles.input}
                        placeholder="Recherche une pharmacie"
                        value={search}
                        selectionColor="#00897E"
                        searchIcon={false}
                        onChangeText={(text) => setSearch(text)}
                        inputContainerStyle={{backgroundColor: 'transparent'}}
                        inputStyle={{fontFamily: 'Mulish', fontSize: 16, color: '#3C4043'}}
                    />
                </View>
            </View>
            <View style={styles.listContainer}>
                { (search.length > 0) && (
                    pharmacies.length > 0 ?
                    <FlatList
                        data={pharmacies}
                        keyboardShouldPersistTaps="always"
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity 
                                onPress={() => { 
                                    dispatch({type: 'setSelectedPharmacy', value: item})
                                    props.navigation.navigate('Pharmacy') }
                                } 
                                style={styles.itemContainer} activeOpacity={0.4}
                            >
                                <View style={{ marginRight: 15, alignSelf: 'center' }}>
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
                                </View>
                                <View style={styles.itemleft}>
                                    <View>
                                        <Text style={{ fontSize: 18 }}>{item.name}</Text>
                                        <Text style={[{fontSize: 15}, is_open(item) ? {color: '#00897E'} : {color: '#DA645C'} ]}>{ is_open(item) ? 'Ouvert' : 'Fermé'}</Text>
                                    </View>
                                    <Feather name="arrow-up-left" size={24} color="#3E4245" style={{ alignSelf: 'center' }} />
                                </View>
                            </TouchableOpacity>
                        )}
                        onEndReached={loadMoreData}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={ loading_more ? <ActivityIndicator size="large" color="#00897E" style={{ marginVertical: 10 }} /> : null}
                    /> : loading ? 
                        <ActivityIndicator size="large" color="#00897E"/> 
                    :
                        
                        <View style={{ justifyContent: 'center', alignContent: 'center' }} >
                            <Image
                                source={require('../assets/icons/indisponible.png')}
                                fadeDuration={0}
                                resizeMode="contain"
                                style={{ width: 200, height: 200, alignSelf: 'center', marginTop: 20 }}
                            />
                        </View>
                )}
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
        color: '#202125',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
    },
    listContainer: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
    },
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 18,
        paddingVertical: 8,
    },
    itemleft: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexGrow: 1,
        alignSelf: 'center',
        borderBottomColor: '#DDDEE1',
        borderBottomWidth: 1,
        height: '100%',
        paddingBottom: 14,
    },
    separator: {
        height: 0.5,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
})
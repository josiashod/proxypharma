import React, {useEffect, useState} from 'react'
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Image } from 'react-native'
import { AntDesign, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import { SearchBar } from 'react-native-elements';
import { Api } from '../api/lienapi'
import * as Location from 'expo-location';
import { useSelector, useDispatch } from 'react-redux'

export default function Pharmacy(props) {
    const dispatch = useDispatch()

    const [search, setSearch] = useState('')
    const [drugs, setDrugs] = useState([])
    const [loading, setLoading] = useState(false)
    const [loading_more, setLoadingMore] = useState(false)
    const [nextLink, setNextLink] = useState(null)

    const [location, setLocation] = useState(null)

    const selected_pharmacy = useSelector(state => state.appReducer.selected_pharmacy);
    const pharmacies = useSelector(state => state.appReducer.pharmacies);
    const active_tab = useSelector(state => state.appReducer.active_tab);

    useEffect(() => {
        (async () => {
            let location = await Location.getCurrentPositionAsync({});
            setLocation({longitude: location.coords.longitude, latitude: location.coords.latitude})
        })();

    }, []);

    const getDrugs = async() => {
        setLoading(true)
        try {
            let response = await fetch(`${Api}pharmacies/${selected_pharmacy.id}/drug/?q=${search}`)
            
            const json = await response.json()
            setDrugs(json.results)
            setNextLink(json.next)
            setLoading(false)

        } catch (error) {
            setLoading(false)
            console.error(error);
        }
    }

    const loadMoreData = async() => {
        if (nextLink) {
            setLoadingMore(true)
            try {
                let response = await fetch(nextLink)
                
                const json = await response.json()
                setDrugs([...drugs, ...json.results])
                setNextLink(json.next)
                setLoadingMore(false)
    
            } catch (error) {
                setLoadingMore(false)
                console.error(error);
            }
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
        if (current_hour <= 22 || selected_pharmacy.on_call)
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
                        containerStyle={styles.input}
                        placeholder="Recherche un médicament"
                        value={search}
                        selectionColor="#00897E"
                        searchIcon={false}
                        onChangeText={(text) => setSearch(text)}
                        inputContainerStyle={{backgroundColor: 'transparent'}}
                        inputStyle={{fontFamily: 'Mulish', fontSize: 16, color: '#3C4043'}}
                    />
                </View>
            </View>

            <View style={{ marginHorizontal: 10, marginVertical: 10 }}>
                <View style={{ flexDirection: 'row', marginBottom: 25 }} >
                    <Image 
                        source={{ uri: selected_pharmacy.image}}
                        style={{ width: 140, height: 140, marginRight: 5, borderRadius: 6 }} 
                    />
                    <View style={{flexShrink: 1, width: '100%', justifyContent: 'space-between'}}>
                        <View>
                            <Text style={{ fontWeight: '400', fontFamily: 'Mulish', fontSize: 18, flexShrink: 0, marginBottom: 5 }}> { selected_pharmacy.name } </Text>
                            <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                                <Text style={{fontSize: 16, color: '#A7ABAD', marginRight: 50 }}> { selected_pharmacy.distance.toPrecision(2) } km</Text>
                                <Text style={[{fontSize: 16}, is_open ? {color: '#00897E'} : {color: '#DA645C'} ]}>{ is_open ? 'Ouvert' : 'Fermé'}</Text>
                            </View>
                            <Text style={{fontSize: 16, color: '#A7ABAD'}}> +229 99 08 13 82</Text>
                        </View>

                        <TouchableOpacity 
                            onPress={() => {
                                dispatch({type: 'setModal', value: true})
                                dispatch({type: 'setWaypoints', value: [location, selected_pharmacy]})
                                props.navigation.popToTop()
                            }}
                            style={[styles.badge_button, { backgroundColor: '#00897E' }]}
                        >
                            <MaterialCommunityIcons name="directions" size={20} color="#fff" />
                            <Text style={{marginLeft: 6 ,alignSelf: 'center',fontFamily: 'Mulish', fontSize: 16, textAlign: 'center', color: 'white'}}>Itinéraire</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                { (search.length > 0) && (
                    (drugs.length > 0) ? <View style={{ flexDirection: 'column' }} >
                        <Text style={{ fontFamily: 'Mulish', fontSize: 20, marginBottom: 10 }}> Résultats </Text>
                        <View style={styles.listContainer}>
                            <FlatList
                                data={drugs}
                                keyExtractor={(item) => item.id}
                                renderItem={({item}) => (
                                    <View style={styles.itemContainer}>
                                        <View style={{ marginRight: 15, alignSelf: 'center' }}>
                                            <Image
                                                source={require('../assets/icons/drug-icon.png')}
                                                fadeDuration={0}
                                                style={{ width: 40, height: 40 }}
                                            />
                                        </View>
                                        <View style={styles.itemleft}>
                                            <Text style={{ fontSize: 18, fontFamily: 'Mulish-SemiBold' }}>{item.name + " ( " + item.type + ' )'}</Text>
                                            <View style={{ flexDirection: 'row' }} >
                                                <Text style={{fontSize: 15, marginRight: 20, color: '#A7ABAD'}}> { item.dose.replace(/ /g,'') } </Text>
                                                <Text style={{fontSize: 15, color: '#00897E'}}> En stock </Text>
                                            </View>
                                        </View>
                                    </View>
                                )}
                                onEndReached={loadMoreData}
                                onEndReachedThreshold={0.5}
                                ListFooterComponent={ loading_more ? <ActivityIndicator size="large" color="#00897E" style={{ marginVertical: 10 }} /> : null}
                            />
                        </View>
                    </View> : loading ? 
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
        height: '76%'
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
        // flexDirection: 'row',
        justifyContent: 'space-between',
        flexGrow: 1,
        alignSelf: 'center',
        height: '100%',
        flexShrink: 1
        // paddingBottom: 14,
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
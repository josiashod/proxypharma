import React, {useEffect, useState, useRef} from 'react'
import * as Animatable from 'react-native-animatable';
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Image, ScrollView, ToastAndroid } from 'react-native'
import { SearchBar } from 'react-native-elements';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { Api } from '../api/lienapi'
import * as Location from 'expo-location';
import { isEqual } from 'lodash'
import { Modalize } from 'react-native-modalize'
import { useDispatch, useSelector } from 'react-redux'

export default function Prescription(props) {
    const dispatch = useDispatch()
    const active_tab = useSelector(state => state.appReducer.active_tab);
    const modal = useSelector(state => state.appReducer.modal);

    const [search, setSearch] = useState('')
    const [location, setLocation] = useState([])
    const [drugs, setDrugs] = useState([])
    const [selected_drugs, setSelectedDrugs] = useState([])
    const [loading, setLoading] = useState(false)
    const [loading_pharmacies, setLoadingPharmacies] = useState(false)
    const [loading_more, setLoadingMore] = useState(false)
    const [nextLink, setNextLink] = useState(null)
    const [pharmacies, setPharmacies] = useState({
        'pharmacies': [],
        'on_call_pharmacies': [],
    })
    const [search_visible, setSearchVisible] = useState(false)

    let search_input = useRef(null)
    let animatable = useRef(null)

    const modalizeRef = useRef(null);

    useEffect(() => {
        (async () => {
            let location = await Location.getCurrentPositionAsync({});
            setLocation({longitude: location.coords.longitude, latitude: location.coords.latitude})
        })();
        search_input.focus()

        if ((new Date()).getHours() >= 21 || (new Date()).getHours() <= 7) {
            dispatch({type: 'setActiveTab', value:'on_call_pharmacies'})
        }else{
            dispatch({type: 'setActiveTab', value:'pharmacies'})
        }

    }, []);

    const onChangeText = (text) => {
        if (text.length <= 0) {
            setSearchVisible(false)
        }else if(text.length === 1 && !search_visible){
            setSearchVisible(true)
            animatable.fadeIn(200)
        }
        setSearch(text)
    }

    const getPharmacies = async() => {
        if (selected_drugs.length > 0) {
            modalizeRef.current.open()
            setLoadingPharmacies(true)
            try {
                let response = await fetch(`${Api}pharmacies/search_by_drugs/?lat=${location.latitude}&lng=${location.longitude}`,{
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        drugs: selected_drugs
                    })
                })
                
                const json = await response.json()
                setPharmacies(json.data)
                setLoadingPharmacies(false)

            } catch (error) {
                setLoadingPharmacies(false)
                console.error(error);
            }
        }else{
            if (!search_visible) {
                ToastAndroid.showWithGravity(
                    "Aucun médicament sélectionné pour la recherche",
                    ToastAndroid.SHORT,
                    ToastAndroid.TOP
                );
            }
        }
    }

    const is_open = (pharmacy) => {
        let current_hour = (new Date()).getHours();
        if (current_hour <= 22 || pharmacy.on_call)
            return true
        return false
    }

    useEffect(() => {
        if(search.length > 0) {
            getDrugs()
        }else[
            setDrugs([])
        ]
    }, [search])

    const getDrugs = async() => {
        setLoading(true)
        try {
            let response = await fetch(`${Api}drugs/search/?q=${search}`)
            
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

    const addDrug = (drug) => {
        let drug_exist = selected_drugs.filter((item) => item.id === drug.id)

        if(drug_exist.length === 0){
            setSelectedDrugs([...selected_drugs, drug])
            setSearch('')
            setSearchVisible(false)
        }else{
            ToastAndroid.showWithGravity(
                "Ce medicament est déjà dans la liste",
                ToastAndroid.SHORT,
                ToastAndroid.TOP
            );
        }
    }

    const removeDrug = (drug) => {
        setSelectedDrugs(selected_drugs.filter((item) => item.id !== drug.id))
    }

    return (
        <View style={styles.container} behavior={"padding"} enabled={true} >
            <View style={{ borderBottomColor: '#DDDEE1', borderBottomWidth: 1, borderStyle: 'solid', backgroundColor: '#fff', paddingTop: (Dimensions.get('window').height * 0.058), paddingBottom: 8 }}>
                <View style={styles.inputContainer}>
                    <TouchableOpacity onPress={() => props.navigation.goBack() } activeOpacity={0.9}>
                        <AntDesign name="arrowleft" size={24} color="#3C4043" />
                    </TouchableOpacity>
                    <SearchBar 
                        ref={(search) => search_input = search}
                        containerStyle={styles.input}
                        placeholder="Recherche un médicament"
                        value={search}
                        selectionColor="#00897E"
                        searchIcon={false}
                        onChangeText={(text) => onChangeText(text)}
                        inputContainerStyle={{backgroundColor: 'transparent'}}
                        inputStyle={{fontFamily: 'Mulish', fontSize: 16, color: '#3C4043'}}
                    />
                </View>
            </View>

            <View style={{ flex:1,  }}>
                {(selected_drugs.length <= 0) ?
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'Mulish-SemiBold', fontSize: 20 }}>
                            Aucun médicament selectionné
                        </Text>
                    </View>
                :
                    <View style={styles.listContainer}>
                        <FlatList
                            data={selected_drugs}
                            keyExtractor={(item) => item.id}
                            renderItem={({item}) => (
                                <View style={{...styles.itemContainer, marginHorizontal: 18}} activeOpacity={0.4}>
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
                                    <TouchableOpacity onPress={() => removeDrug(item)} activeOpacity={0.4} style={{alignSelf: 'center'}}>
                                        <AntDesign name="close" size={24} color="#00897E" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    </View>
                }
            </View>

            <Animatable.View ref={ref => animatable = ref} style={[styles.floating_search, !search_visible ? { height: 0 } : {}]}>
                { (search.length > 0) && (
                    (drugs.length > 0) ? <View style={{ flexDirection: 'column' }} >
                        <View style={styles.listContainer}>
                            <FlatList
                                data={drugs}
                                keyExtractor={(item) => item.id}
                                keyboardShouldPersistTaps="handled"
                                renderItem={({item}) => (
                                    <TouchableOpacity onPress={() => addDrug(item)} style={{...styles.itemContainer, marginHorizontal: 18}} activeOpacity={0.4}>
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
                                    </TouchableOpacity>
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
            </Animatable.View>

            {/* floatting button */}
            <View style={{ position: 'absolute', right: 18, bottom: 20 }}>
                <TouchableOpacity onPress={() => { getPharmacies() }} style={[styles.floating_button, {backgroundColor: '#00897E', marginBottom: 10 }]} activeOpacity={0.8}>
                    <Ionicons name="search" size={26} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <Modalize
                ref={modalizeRef} 
                snapPoint={Dimensions.get("window").height * 0.85} 
                modalHeight={Dimensions.get("window").height * 0.85} 
                withHandle={false}
                overlayStyle={styles.overlay_background}
                modalStyle={styles.modal_style}
                rootStyle={{elevation: 4}}
            >
                <Text style={{ fontFamily: 'Mulish', fontSize: 23, borderBottomColor: 'black', borderBottomWidth: 1, paddingBottom: 5 }}> Pharmacies trouvées </Text>
                {   loading_pharmacies ? 
                        <ActivityIndicator size="large" color="#00897E"/> 
                    :

                    (pharmacies[active_tab].length > 0) ?
                        <ScrollView style={{ height: Dimensions.get("window").height * 0.70 }}>
                            {pharmacies[active_tab].map((pharmacy, index) => (
                                <View style={{...styles.itemContainer,}} key={index}>
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
                                        <Text style={{fontSize: 13, color: '#A7ABAD'}}> {pharmacy.distance.toPrecision(2)} km</Text>
                                    </View>
                                    <View style={styles.itemleft}>
                                        <View>
                                            <Text style={{ fontSize: 18 }}>{pharmacy.name}</Text>
                                            <Text style={[{fontSize: 15}, is_open(pharmacy) ? {color: '#00897E'} : {color: '#DA645C'} ]}>{ is_open(pharmacy) ? 'Ouvert' : 'Fermé'}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}

                        </ScrollView>
                    :
                    <View style={{ justifyContent: 'center', alignContent: 'center' }} >
                        <Image
                            source={require('../assets/icons/indisponible.png')}
                            fadeDuration={0}
                            resizeMode="contain"
                            style={{ width: 200, height: 200, alignSelf: 'center', marginTop: 20 }}
                        />
                    </View>
                }
                <View style={{ marginTop: 8 }}>
                    <TouchableOpacity onPress={() => { 
                            dispatch({type: 'setPhamacies', value: pharmacies})
                            dispatch({type: 'setWaypoints', value: [ location, ...pharmacies[active_tab] ]})
                            dispatch({type: 'setSelectedPharmacy', value: false})
                            dispatch({type: 'setModal', value: true})
                            props.navigation.goBack()
                        }} 
                        style={[styles.badge_button, { backgroundColor: '#00897E', width: Dimensions.get("screen").width / 2 }]}
                    >
                        <MaterialCommunityIcons name="directions" size={20} color="#fff" style={{alignSelf: 'center'}} />
                        <Text style={{marginLeft: 6 ,alignSelf: 'center', fontSize: 16 ,fontFamily: 'Mulish', textAlign: 'center', color: 'white'}}>Itinéraire de parcours</Text>
                    </TouchableOpacity>
                </View>
            </Modalize>
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
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomColor: '#DDDEE1',
        borderBottomWidth: 1,
    },
    itemleft: {
        justifyContent: 'space-between',
        flexGrow: 1,
        alignSelf: 'center',
        height: '100%',
        flexShrink: 1
    },
    floating_search:{
        position: 'absolute',
        top: 118,
        alignSelf: 'center',
        height: Dimensions.get('window').height / 2.5,
        width: '92%',
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 15,
        marginHorizontal: 'auto',
    },
    floating_button:{
        width: 65,
        height: 65,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    overlay_background: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.10)',
    },
    modal_style:{
        paddingVertical: 10,
        paddingHorizontal: 15,
        position: 'relative',
        height: '100%',
    },
    badge_button:{
        paddingHorizontal: 14,
        paddingVertical: 6,
        flexDirection: 'row' ,
        justifyContent: 'center',
        fontFamily: 'Mulish',
        borderRadius: 20,
        borderStyle: 'solid',
        borderColor: '#00897E',
        borderWidth: 1,
        alignSelf: 'center',
    },
})
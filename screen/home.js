import React, { useState, useEffect, useRef } from 'react'
import { Dimensions, View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native'
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { Modalize } from 'react-native-modalize'
import MapView, { Marker, Polyline } from 'react-native-maps'
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions'
import { Api } from '../api/lienapi'
const GOOGLE_API_KEY = "AIzaSyDOUwKD-J_smbux5mgU_rt8uH31czYy5sQ"

const home = (props) => {
    var mapStyles = [
        {
            "featureType": "all",
            "elementType": "all",
            "stylers": [
                {
                    "hue": "#00ffbc"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [
                {
                    "saturation": -70
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "simplified"
                },
                {
                    "saturation": -60
                }
            ]
        }
    ]
    const [region, setRegion] = useState(null)
    const [location, setLocation] = useState(null)
    const [pharmacies, setPharmacies] = useState({
        'pharmacies': [],
        'on_call_pharmacies': [],
    })
    // const [errorMsg, setErrorMsg] = useState(null)
    const [active, setActive] = useState('pharmacies')
    const [selectedPharmacy, setSelectedPharmacy] = useState(null)
    const [trajectory, setTrajectory] = useState(null)

    const modalizeRef = useRef(null);

    const onOpen = (pharmacy) => {
        console.log(pharmacy)
        setSelectedPharmacy(pharmacy)
        modalizeRef.current?.open();
    };

    const changeTab = (tab) => {
        if( active != tab)
            setActive(tab)
    }

    const getPharmacies = async(region) => {
        try {
            let response = await fetch(`${Api}pharmacies/nearest/?lat=${region.latitude}&lng=${region.longitude}`)
            
            const json = await response.json()
            setPharmacies(json.data)

        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        (async () => {
            // let { status } = await Location.requestForegroundPermissionsAsync();
            // if (status !== 'granted') {
            //     setErrorMsg('Permission to access location was denied');
            //     return;
            // }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location)
            setRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.025,
                longitudeDelta: 0.0042,
            })
        })();
    }, []);

    useEffect(() => {
        if(region != null)
            getPharmacies(region)

    } , [region])

    const user_to_pharmacy = () => {
        let user_location = {longitude: location.coords.longitude, latitude: location.coords.latitude,}

        let pharmacy_location = {latitude: selectedPharmacy.latitude, longitude: selectedPharmacy.longitude}
        // let user_location = {latitude: pharmacies[active][0].latitude, longitude: pharmacies[active][0].longitude}

        // console.log(pharmacy_location)
        setTrajectory([user_location, pharmacy_location])
    }

    const is_open = () => {
        // selectedPharmacy
        let current_hour = (new Date()).getHours();
        if (current_hour > 22 && selectedPharmacy.on_call)
            return true
        return false
    }

    return (
        <View style={styles.container/*{flex: 1, paddingTop: 52, backgroundColor:"cyan", paddingLeft: 15, paddingRight: 15,}*/}>
            <MapView 
                style={styles.map}
                showsUserLocation={true}
                initialRegion={region}
                mapPadding={{top: 100, right: 10, bottom: 15, left: 0}}
                customMapStyle={mapStyles}
                loadingEnabled={true}
                toolbarEnabled={false}
                onRegionChangeComplete={(region, move) => { if(move.isGesture) setRegion(region)}}
            >
                {pharmacies[active].map((pharmacy, index) => (
                    <Marker
                        key={index}
                        coordinate={{latitude: pharmacy.latitude, longitude: pharmacy.longitude}}
                        title={pharmacy.name}
                        onCalloutPress={() => onOpen(pharmacy)}
                    >
                        <Image source={require('../assets/marker.png')} style={{width: 30, height: 30}} />
                    </Marker>
                ))}

                {
                    trajectory && 
                    <MapViewDirections 
                        origin={trajectory[0]}
                        destination={trajectory[1]}
                        apikey={GOOGLE_API_KEY} // insert your API Key here
                        strokeWidth={4}
                        strokeColor="#111111"
                    />
                }
            </MapView>

            <TouchableOpacity onPress={() => props.navigation.navigate('Search') } activeOpacity={0.9} style={styles.input_container}>
                <Ionicons name="search" size={24} color="#00897E" />
                <Text style={styles.input}>Rechercher une pharmacie</Text>
            </TouchableOpacity>

            <SafeAreaView style={styles.tabs} >
                <TouchableOpacity onPress={() => changeTab('on_call_pharmacies')} style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', paddingTop: 4, paddingBottom: 4, textAlign: 'center', flexGrow: 1, height: '100%' }} >
                    <Ionicons name="locate" size={24} color={active === 'on_call_pharmacies' ? '#00897E' : 'black'} />
                    <Text style={[{textAlign: 'center', fontFamily: 'Mulish'}, active === 'on_call_pharmacies' ? { color: '#00897E' } : { color: 'black' } ]}>De garde</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => changeTab('pharmacies')} style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', paddingTop: 4, paddingBottom: 4, textAlign: 'center', flexGrow: 1, height: '100%' }} >
                    <Ionicons name="locate" size={24} color={active === 'pharmacies' ? '#00897E' : 'black'} />
                    <Text style={[{textAlign: 'center', fontFamily: 'Mulish'}, active === 'pharmacies' ? { color: '#00897E' } : { color: 'black' } ]}>Toutes</Text>
                </TouchableOpacity>
            </SafeAreaView>
            
            <Modalize 
                ref={modalizeRef} 
                snapPoint={Dimensions.get("window").height * 0.26} 
                modalHeight={Dimensions.get("window").height * 0.26} 
                withHandle={false}
                overlayStyle={styles.overlay_background}
                modalStyle={styles.modal_style}
            >
                <SafeAreaView style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom:'6%'}}>
                    <SafeAreaView style={{}}>
                        <Text style={{fontFamily: 'Mulish', fontSize: 20, color: 'black', marginBottom: 1}}>{selectedPharmacy ? selectedPharmacy.name : ""}</Text>
                        <Text style={{fontSize: 16, color: '#aeaeae'}}> {selectedPharmacy ? selectedPharmacy.distance.toPrecision(2) : ""} km</Text>
                        
                        <SafeAreaView style={{ flexDirection: 'row' }}>
                            { selectedPharmacy && selectedPharmacy.phone && <Text style={{fontSize: 16, color: '#aeaeae', marginRight: 10}}>Tel : {selectedPharmacy.phone}</Text> }
                            <Text style={[{fontSize: 16}, is_open() ? {color: '#00897E'} : {color: 'red'} ]}>{ is_open() ? 'Ouvert' : 'Fermé'}</Text>
                        </SafeAreaView>

                    </SafeAreaView>
                    { selectedPharmacy && <Image source={{ uri: selectedPharmacy.thumbnail_image}} style={{width: 60, height: 60, borderRadius: 40}} />}
                </SafeAreaView>

                <SafeAreaView style={{ width: '100%', paddingVertical: 1, display: 'flex', flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => user_to_pharmacy()} style={[styles.badge_button, { marginRight: 10, backgroundColor: '#00897E', }]}>
                        <MaterialCommunityIcons name="directions" size={20} color="#fff" />
                        <Text style={{marginLeft: 6 ,alignSelf: 'center', fontSize: 16 ,fontFamily: 'Mulish', textAlign: 'center', color: 'white'}}>Itinéraire</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.badge_button, { marginRight: 10, }]}>
                        <Feather name="info" size={20} color="#00897E" />
                        <Text style={{ marginLeft: 6 ,alignSelf: 'center', fontSize: 16 ,fontFamily: 'Mulish', textAlign: 'center', color: '#00897E'}}>Consulter</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modalize>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: "#fff",
        // alignItems: "center",
        // justifyContent: 'center',
        // backgroundColor: 'red'
    },
    input_container: {
        position: 'absolute',
        flexDirection: 'row',
        top: 55,
        left: 0,
        right: 0,
        display: 'flex',
        marginHorizontal: 18, 
        backgroundColor: "#fff",
        elevation: 4,
        borderRadius: 40,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
    },
    input: {
        width: '86%',
        marginLeft: '2%',
        fontFamily: 'Mulish',
        fontSize: 16,
        fontWeight: '100',
        color: '#c1c1c1'
    },
    map:{
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        position: 'absolute',
        bottom: 0,
        top: 0,
    },
    tabs: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: (Dimensions.get("screen").height - Dimensions.get("window").height) / 1.6,
        backgroundColor: 'white',
        elevation: 6,
    },
    overlay_background: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.20)',
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

export default home

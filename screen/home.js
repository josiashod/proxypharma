import React, { useState, useEffect, useRef } from 'react'
import { Dimensions,View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { Ionicons, Feather } from '@expo/vector-icons'
import { Modalize } from 'react-native-modalize'
import MapView, { Marker } from 'react-native-maps'
import * as Location from 'expo-location';


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
    // const [location, setLocation] = useState(null)
    const [pharmacies, setPharmacies] = useState({
        'pharmacies': [],
        'on_call_pharmacies': [],
    })
    const [errorMsg, setErrorMsg] = useState(null)
    const [active, setActive] = useState('pharmacies')
    const [selectedPharmacy, setSelectedPharmacy] = useState({
        "created_at": "26-11-2021 12:14:14",
        "distance": 0.3363880611205903,
        "email": null,
        "id": 1144,
        "image": "https://awss3bucket-aladecouvertedubenin.s3.eu-central-1.amazonaws.com/1622718034622-pharmacie.jpg",
        "latitude": 6.3811515,
        "longitude": 2.4017752,
        "name": "Pharmacie vie nouvelle",
        "on_call": null,
        "phone": null,
        "thumbnail_image": "https://awss3bucket-aladecouvertedubenin.s3.eu-central-1.amazonaws.com/1622718035947-thumbnail_pharmacie.jpg",
        "updated_at": null,
        "website": "",
      })

    const modalizeRef = useRef(null);

    const onOpen = (pharmacy) => {
        // console.log(pharmacy)
        setSelectedPharmacy(pharmacy)
        modalizeRef.current?.open();
    };

    const changeTab = (tab) => {
        if( active != tab)
            setActive(tab)
    }

    const getPharmacies = async(region) => {
        try {
            let response = await fetch(`http://192.168.100.6:8000/api/pharmacies/nearest/?lat=${region.latitude}&lng=${region.longitude}`)
            
            const json = await response.json()
            setPharmacies(json.data)

        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
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
            </MapView>

            <TouchableOpacity onPress={() => props.navigation.navigate('Search') } activeOpacity={0.9} style={styles.input_container}>
                <Ionicons name="search" size={24} color="#00897E" />
                <Text style={styles.input}>Rechercher une pharmacie</Text>
            </TouchableOpacity>

            <View style={styles.tabs} >
                <TouchableOpacity onPress={() => changeTab('on_call_pharmacies')} style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', paddingTop: 4, paddingBottom: 4, textAlign: 'center', flexGrow: 1, height: '100%' }} >
                    <Ionicons name="locate" size={24} color={active === 'on_call_pharmacies' ? '#00897E' : 'black'} />
                    <Text style={[{textAlign: 'center', fontFamily: 'Mulish'}, active === 'on_call_pharmacies' ? { color: '#00897E' } : { color: 'black' } ]}>De garde</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => changeTab('pharmacies')} style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', paddingTop: 4, paddingBottom: 4, textAlign: 'center', flexGrow: 1, height: '100%' }} >
                    <Ionicons name="locate" size={24} color={active === 'pharmacies' ? '#00897E' : 'black'} />
                    <Text style={[{textAlign: 'center', fontFamily: 'Mulish'}, active === 'pharmacies' ? { color: '#00897E' } : { color: 'black' } ]}>Toutes</Text>
                </TouchableOpacity>
            </View>
            
            <Modalize 
                ref={modalizeRef} 
                snapPoint={Dimensions.get("window").height * 0.26} 
                modalHeight={Dimensions.get("window").height * 0.26} 
                withHandle={false}
                overlayStyle={styles.overlay_background}
                modalStyle={styles.modal_style}
            >
                <Text style={{fontFamily: 'Mulish', fontSize: 20, color: 'black', marginBottom: 1}}>{selectedPharmacy.name}</Text>
                <Text style={{fontSize: 15, color: '#c1c1c1'}}> {selectedPharmacy.distance.toPrecision(2)} km</Text>
                <View style={{ marginTop:'12%', width: '100%', paddingVertical: 1, display: 'flex', flexDirection: 'row' }}>
                    <TouchableOpacity style={[styles.badge_button, { marginRight: 10, backgroundColor: '#00897E', }]}>
                        <Feather name="info" size={20} color="#fff" />
                        <Text style={{marginLeft: 6 ,alignSelf: 'center', fontSize: 16 ,fontFamily: 'Mulish', textAlign: 'center', color: 'white'}}>Itinéraire</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.badge_button, { marginRight: 10, }]}>
                        <Feather name="info" size={20} color="#00897E" />
                        <Text style={{ marginLeft: 6 ,alignSelf: 'center', fontSize: 16 ,fontFamily: 'Mulish', textAlign: 'center', color: '#00897E'}}>Détails</Text>
                    </TouchableOpacity>
                </View>
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

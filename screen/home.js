import React, { useState, useEffect, useRef } from 'react'
import { Animated, Dimensions, View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native'
import { Ionicons, Feather, MaterialCommunityIcons, AntDesign, MaterialIcons, FontAwesome5 } from '@expo/vector-icons'
import { Modalize } from 'react-native-modalize'
import MapView, { Marker, Polyline } from 'react-native-maps'
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions'
import { Api } from '../api/lienapi'
const GOOGLE_API_KEY = "AIzaSyDOUwKD-J_smbux5mgU_rt8uH31czYy5sQ"
import { isEqual } from 'lodash'

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

    let map_view = useRef(null)

    // const [errorMsg, setErrorMsg] = useState(null)
    const [active, setActive] = useState('pharmacies')
    const [selectedPharmacy, setSelectedPharmacy] = useState(null)
    const [trajectory, setTrajectory] = useState(null)
    const [driving_mode, setDrivingMode] = useState('WALKING')
    const [direction_info, setDirectionInfo] = useState({
        duration: 0,
        distance: 0,
    })
    const [drive_start, setDriveStart] = useState(false)

    let markers = []

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

    const getPharmacies = async() => {
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
            getPharmacies()

    } , [region])

    const changeDrivingMode = (mode) => {
        if (mode !== driving_mode) {
            setDrivingMode(mode)
        }
    }

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
        if (current_hour <= 22 || selectedPharmacy.on_call)
            return true
        return false
    }

    const goToUserLocation = () => {
        let region_to_go = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.025,
            longitudeDelta: 0.0042,
        }
        if (!isEqual(region_to_go, region)) {
            setRegion(region_to_go)
            map_view.animateToRegion(region_to_go, 1000)
        }
    }

    return (
        <View style={styles.container/*{flex: 1, paddingTop: 52, backgroundColor:"cyan", paddingLeft: 15, paddingRight: 15,}*/}>
            <MapView 
                style={styles.map}
                showsUserLocation={true}
                followUserLocation={true}
                initialRegion={region}
                mapPadding={{top: 100, right: 10, bottom: 15, left: 0}}
                customMapStyle={mapStyles}
                loadingEnabled={true}
                toolbarEnabled={false}
                showsMyLocationButton={false}
                onRegionChangeComplete={(region, move) => { 
                    if(move.isGesture)
                        setRegion(region)
                }}

               ref={ref => (map_view = ref)}
            >
                {pharmacies[active].map((pharmacy, index) => (
                    <Marker
                        key={index}
                        coordinate={{latitude: pharmacy.latitude, longitude: pharmacy.longitude}}
                        title={pharmacy.name}
                        ref={ref => { markers[index] = ref }}
                        onCalloutPress={() => {onOpen(pharmacy), markers[index].hideCallout()}}
                    >
                        <Image source={require('../assets/icons/marker.png')} style={{width: 30, height: 30}} />
                    </Marker>
                ))}

                    {/* marker start */}
                    { trajectory && 
                        <Marker
                            // key={index}
                            coordinate={trajectory[0]}
                            // title={pharmacy.name}
                            // ref={ref => { markers[index] = ref }}
                            // onCalloutPress={() => {onOpen(pharmacy), markers[index].hideCallout()}}
                        >
                            <Image source={require('../assets/icons/icon-flag-start.png')} style={{width: 40, height: 40}} />
                        </Marker>
                    }

                    {/* marker end */}
                    { trajectory && 
                        <Marker
                            // key={index}
                            coordinate={trajectory[trajectory.length - 1]}
                            // title={pharmacy.name}
                            // ref={ref => { markers[index] = ref }}
                            // onCalloutPress={() => {onOpen(pharmacy), markers[index].hideCallout()}}
                        >
                            <Image source={require('../assets/icons/icon-flag-end.png')} style={{width: 40, height: 40}} />
                        </Marker>
                    }

                {
                    // trajectory && 
                    // <MapViewDirections 
                    //     lineDashPattern={[0, 0]}
                    //     mode={driving_mode}
                    //     origin={trajectory[0]}
                    //     destination={trajectory[trajectory.length - 1]}
                    //     optimizeWaypoints={true}
                    //     apikey={GOOGLE_API_KEY} // insert your API Key here
                    //     strokeWidth={4}
                    //     strokeColor="#00897E"
                    //     onReady={result => {
                    //         // console.log(result)
                    //         setDirectionInfo({
                    //             distance: result.distance,
                    //             duration: result.duration,
                    // })
                    //         // console.log(`Distance: ${result.distance} km`)
                    //         // console.log(`Duration: ${result.duration} min.`)
                    
                    //         // map_view.fitToCoordinates(result.coordinates, {
                    //         //   edgePadding: {
                    //         //     right: (width / 20),
                    //         //     bottom: (height / 20),
                    //         //     left: (width / 20),
                    //         //     top: (height / 20),
                    //         //   }
                    //         // });
                    //     }}

                    // />
                }
            </MapView>

            {/* header input */}
            <TouchableOpacity onPress={() => props.navigation.navigate('Search') } activeOpacity={0.9} style={styles.input_container}>
                <Ionicons name="search" size={24} color="#00897E" />
                <Text style={styles.input}>Rechercher une pharmacie</Text>
            </TouchableOpacity>

            {/* Header itinéraires */}

            {/* { trajectory && <Animated.View style={{...styles.itineraire_header}}>
                <TouchableOpacity onPress={() => {} } activeOpacity={0.9} style={{marginRight: 15}}>
                    <AntDesign name="arrowleft" size={24} color="#3C4043" />
                </TouchableOpacity>
                <View>
                    <Text style={{  fontFamily: 'Mulish', fontSize: 18, marginBottom: 10 }}>Quelle est votre moyen de transport ?</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 6, justifyContent: 'space-between' }} >
                        <TouchableOpacity onPress={() => changeDrivingMode('DRIVING') } style={[{ flexDirection: 'row', borderRadius: 40, paddingHorizontal: 8, paddingVertical: 4 }, driving_mode === 'DRIVING' ? { backgroundColor: '#00897E25' } : { color: '#3C4043' }]}>
                            <MaterialIcons name="directions-car" size={20} style={[ driving_mode === 'DRIVING' ? { color: '#00897E' } : { color: '#3C4043' } ]} />
                            { driving_mode === 'DRIVING' && <Text style={{  fontFamily: 'Mulish', fontSize: 14, alignSelf: 'center', marginLeft: 6, color: '#00897E'  }} >{ direction_info.duration } min</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => changeDrivingMode('BICYCLING') } style={[{ flexDirection: 'row', borderRadius: 40, paddingHorizontal: 8, paddingVertical: 4 }, driving_mode === 'BICYCLING' ? { backgroundColor: '#00897E25' } : { color: '#3C4043' }]}>
                                {driving_mode === 'BICYCLING' ? 
                                    <Image
                                        source={require('../assets/icons/icon-motorcycle-active.png')}
                                        fadeDuration={0}
                                        style={{ width: 22, height: 22 }}
                                    />
                                :
                                    <Image
                                        source={require('../assets/icons/icon-motorcycle.png')}
                                        fadeDuration={0}
                                        style={{ width: 22, height: 22 }}
                                    />
                                }
                            { driving_mode === 'BICYCLING' && <Text style={{  fontFamily: 'Mulish', fontSize: 14, alignSelf: 'center', marginLeft: 6, color: '#00897E'  }} >{ direction_info.duration } min</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => changeDrivingMode('WALKING') } style={[{ flexDirection: 'row', borderRadius: 40, paddingHorizontal: 8, paddingVertical: 4 }, driving_mode === 'WALKING' ? { backgroundColor: '#00897E25' } : { color: '#3C4043' }]}>
                            <MaterialIcons name="directions-walk" size={20} style={[ driving_mode === 'WALKING' ? { color: '#00897E' } : { color: '#3C4043' } ]} />
                            { driving_mode === 'WALKING' && <Text style={{  fontFamily: 'Mulish', fontSize: 14, alignSelf: 'center', marginLeft: 6, color: '#00897E'  }} >{ direction_info.duration } min</Text>}
                            <Text style={[{  fontFamily: 'Mulish', fontSize: 14, alignSelf: 'center', marginLeft: 4  }, driving_mode === 'WALKING' ? { color: '#00897E' } : { color: '#3C4043' } ]} >16 min</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>} */}

            {/* bottom tabs */}
            <SafeAreaView style={styles.tabs} >
                <TouchableOpacity onPress={() => changeTab('on_call_pharmacies')} style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', paddingTop: 4, paddingBottom: 4, textAlign: 'center', flexGrow: 1, height: '100%' }} >
                    {/* <Ionicons name="locate" size={24} color={active === 'on_call_pharmacies' ? '#00897E' : 'black'} /> */}
                    {active === 'on_call_pharmacies' ? <Image
                            source={require('../assets/icons/pharmacy-icon.png')}
                            fadeDuration={0}
                            style={{ width: 25, height: 25 }}
                        />
                        :
                        <Image
                            source={require('../assets/icons/pharmacy_garde_inactive-icon.png')}
                            fadeDuration={0}
                            style={{ width: 25, height: 25 }}
                        />
                    }
                    <Text style={[{textAlign: 'center', fontFamily: 'Mulish'}, active === 'on_call_pharmacies' ? { color: '#00897E' } : { color: 'black' } ]}>Gardes</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => changeTab('pharmacies')} style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', paddingTop: 4, paddingBottom: 4, textAlign: 'center', flexGrow: 1, height: '100%' }} >
                    {/* <Ionicons name="locate" size={24} color={active === 'pharmacies' ? '#00897E' : 'black'} /> */}
                    {active === 'pharmacies' ? <Image
                            source={require('../assets/icons/pharmacy.png')}
                            fadeDuration={10}
                            style={{ width: 30, height: 30 }}
                        />
                        :
                        <Image
                            source={require('../assets/icons/pharmacy_inactive-icon.png')}
                            fadeDuration={10}
                            style={{ width:24, height: 24 }}
                        />
                    }
                    <Text style={[{textAlign: 'center', fontFamily: 'Mulish'}, active === 'pharmacies' ? { color: '#00897E' } : { color: 'black' } ]}>Toutes</Text>
                </TouchableOpacity>
            </SafeAreaView>
            
            {/* bottom modal */}
            <Modalize 
                ref={modalizeRef} 
                snapPoint={Dimensions.get("window").height * 0.355} 
                modalHeight={Dimensions.get("window").height * 0.355} 
                withHandle={false}
                overlayStyle={styles.overlay_background}
                modalStyle={styles.modal_style}
                rootStyle={{elevation: 4}}
                onClose={() => {
                    setSelectedPharmacy(null)
                    // console.log('close')
                }}
                onClosed={() => {
                    console.log(drive_start)
                    if (!drive_start) {
                        setTrajectory(null)
                        console.log('setTrajectory')
                    }
                }}
            >
                <SafeAreaView style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom:'6%'}}>
                    <SafeAreaView style={{flexShrink: 1}}>
                        <Text style={{fontFamily: 'Mulish', fontSize: 20, color: 'black', marginBottom: 1, flexShrink: 0}}>{selectedPharmacy ? selectedPharmacy.name : ""}</Text>
                        <Text style={{fontSize: 16, color: '#A7ABAD'}}> {selectedPharmacy ? selectedPharmacy.distance.toPrecision(2) : ""} km</Text>
                        
                        <SafeAreaView style={{ flexDirection: 'row' }}>
                            { selectedPharmacy && selectedPharmacy.phone && <Text style={{fontSize: 16, color: '#A7ABAD', marginRight: 10}}>Tel : {selectedPharmacy.phone}</Text> }
                            <Text style={[{fontSize: 16}, is_open ? {color: '#00897E'} : {color: '#DA645C'} ]}>{ is_open ? 'Ouvert' : 'Fermé'}</Text>
                        </SafeAreaView>
                    </SafeAreaView>
                    { selectedPharmacy && <Image source={{ uri: selectedPharmacy.thumbnail_image}} style={{width: 60, height: 60, borderRadius: 40}} />}
                </SafeAreaView>

                <SafeAreaView style={{ width: '100%', paddingVertical: 1, display: 'flex', flexDirection: 'row', marginBottom: 11 }}>
                    { !trajectory ? 
                        <TouchableOpacity onPress={() => user_to_pharmacy()} style={[styles.badge_button, { marginRight: 10, backgroundColor: '#00897E', }]}>
                            <MaterialCommunityIcons name="directions" size={20} color="#fff" style={{alignSelf: 'center'}} />
                            <Text style={{marginLeft: 6 ,alignSelf: 'center', fontSize: 16 ,fontFamily: 'Mulish', textAlign: 'center', color: 'white'}}>Itinéraire</Text>
                        </TouchableOpacity>
                    :
                        <TouchableOpacity 
                            onPress={() => {
                                setDriveStart(true)
                                modalizeRef.current.close()
                            }} 
                            style={[styles.badge_button, { marginRight: 10, backgroundColor: '#00897E', }]}
                        >
                            <MaterialIcons name="navigation" size={20} color="#fff" style={{alignSelf: 'center'}} />
                            <Text style={{marginLeft: 6 ,alignSelf: 'center', fontSize: 16 ,fontFamily: 'Mulish', textAlign: 'center', color: 'white'}}>Démarrer</Text>
                        </TouchableOpacity>
                    }
                    <TouchableOpacity onPress={() => { props.navigation.navigate('Pharmacy', { 'pharmacy': selectedPharmacy }) }} style={[styles.badge_button, { marginRight: 10, }]}>
                        <Feather name="info" size={20} color="#00897E" style={{alignSelf: 'center'}} />
                        <Text style={{ marginLeft: 6 ,alignSelf: 'center', fontSize: 16 ,fontFamily: 'Mulish', textAlign: 'center', color: '#00897E'}}>Consulter</Text>
                    </TouchableOpacity>
                    { trajectory && <TouchableOpacity onPress={() => { setTrajectory(null) }} style={[styles.badge_button, { marginRight: 10, }]}>
                            <Ionicons name="close" size={20} color="#00897E" style={{alignSelf: 'center'}} />
                            <Text style={{ marginLeft: 6 ,alignSelf: 'center', fontSize: 16 ,fontFamily: 'Mulish', textAlign: 'center', color: '#00897E'}}>Annuler</Text>
                        </TouchableOpacity> }
                </SafeAreaView>

                { trajectory && <View>
                    <Text style={{  fontFamily: 'Mulish', fontSize: 18, marginBottom: 12 }}>Quelle est votre moyen de transport ?</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 6, justifyContent: 'space-around' }} >
                        <TouchableOpacity onPress={() => changeDrivingMode('DRIVING') } style={[{ flexDirection: 'row', borderRadius: 40, paddingHorizontal: 10, paddingVertical: 4 }, driving_mode === 'DRIVING' ? { backgroundColor: '#00897E25' } : { color: '#3C4043' }]}>
                            <MaterialIcons name="directions-car" size={20} style={[ driving_mode === 'DRIVING' ? { color: '#00897E' } : { color: '#3C4043' } ]} />
                            { driving_mode === 'DRIVING' && <Text style={{  fontFamily: 'Mulish', fontSize: 14, alignSelf: 'center', marginLeft: 6, color: '#00897E'  }} >{ direction_info.duration.toPrecision(2) } min</Text>}
                        </TouchableOpacity>

                        {/* <TouchableOpacity onPress={() => changeDrivingMode('BICYCLING') } style={[{ flexDirection: 'row', borderRadius: 40, paddingHorizontal: 10, paddingVertical: 4 }, driving_mode === 'BICYCLING' ? { backgroundColor: '#00897E25' } : { color: '#3C4043' }]}>
                                {driving_mode === 'BICYCLING' ? 
                                    <Image
                                        source={require('../assets/icons/icon-motorcycle-active.png')}
                                        fadeDuration={0}
                                        style={{ width: 22, height: 22 }}
                                    />
                                :
                                    <Image
                                        source={require('../assets/icons/icon-motorcycle.png')}
                                        fadeDuration={0}
                                        style={{ width: 22, height: 22 }}
                                    />
                                }
                            { driving_mode === 'BICYCLING' && <Text style={{  fontFamily: 'Mulish', fontSize: 14, alignSelf: 'center', marginLeft: 6, color: '#00897E'  }} >{ direction_info.duration.toPrecision(2) } min</Text>}
                        </TouchableOpacity> */}

                        <TouchableOpacity onPress={() => changeDrivingMode('WALKING') } style={[{ flexDirection: 'row', borderRadius: 40, paddingHorizontal: 10, paddingVertical: 4 }, driving_mode === 'WALKING' ? { backgroundColor: '#00897E25' } : { color: '#3C4043' }]}>
                            <MaterialIcons name="directions-walk" size={20} style={[ driving_mode === 'WALKING' ? { color: '#00897E' } : { color: '#3C4043' } ]} />
                            { driving_mode === 'WALKING' && <Text style={{  fontFamily: 'Mulish', fontSize: 14, alignSelf: 'center', marginLeft: 6, color: '#00897E'  }} >{ direction_info.duration.toPrecision(2) } min</Text>}
                            {/* <Text style={[{  fontFamily: 'Mulish', fontSize: 14, alignSelf: 'center', marginLeft: 4  }, driving_mode === 'WALKING' ? { color: '#00897E' } : { color: '#3C4043' } ]} >16 min</Text> */}
                        </TouchableOpacity>
                    </View>
                </View>}
            </Modalize>

            {/* floating button */}
            <View style={{ position: 'absolute', right: 18, bottom: styles.tabs.height + 20 }}>
                { !drive_start ? 
                    <View>
                        <TouchableOpacity onPress={() => {  }} style={[styles.floating_button, {backgroundColor: '#00897E', marginBottom: 10}]} activeOpacity={0.8}>
                            <Feather 
                                name="file-text" size={24} color="#FFF"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { goToUserLocation() }} style={[styles.floating_button, {backgroundColor: '#FFF', marginBottom: 10}]} activeOpacity={0.8}>
                            <MaterialIcons 
                                name="my-location" size={24} color="#00897E"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { }} style={[styles.floating_button, {backgroundColor: '#00897E', marginBottom: 10 }]} activeOpacity={0.8}>
                            <FontAwesome5 name="route" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                :
                   <View>
                        <TouchableOpacity 
                            onPress={() => { setDriveStart(false) }} 
                            style={[styles.floating_button, {backgroundColor: '#FFF', marginBottom: 10}]} 
                            activeOpacity={0.8}
                        >
                            <MaterialIcons 
                                name="close" size={24} color="#00897E"
                            />
                        </TouchableOpacity>

                        <Text style={{  fontFamily: 'Mulish-SemiBold', fontSize: 18, alignSelf: 'center', marginLeft: 6, color: '#00897E'  }}> { direction_info.distance.toPrecision(2) } km</Text>
                   </View>
                }

            </View>
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
    header:{
        position: 'absolute',
        width: '100%',
        height: 'auto',
        backgroundColor: '#FFF',
        elevation: 5,
        // alignItems: 'center',
        // justifyContent: 'center',

    },
    input_container: {
        position: 'absolute',
        flexDirection: 'row',
        top: (Dimensions.get('window').height * 0.07),
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
        height: (Dimensions.get("screen").height - Dimensions.get("window").height) / 1.5,
        backgroundColor: 'white',
        elevation: 6,
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
        // backgroundColor: 'yellow',
        flexDirection: 'row' ,
        justifyContent: 'center',
        fontFamily: 'Mulish',
        borderRadius: 20,
        // width: Dimensions.get('window').width / 3.5,
        borderStyle: 'solid',
        borderColor: '#00897E',
        borderWidth: 1,
    },
    floating_button:{
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    itineraire_header:{
        flexDirection: 'row',
        elevation: 4,
        borderBottomColor: '#DDDEE1',
        borderBottomWidth: 1,
        borderStyle: 'solid',
        backgroundColor: '#fff',
        paddingTop: (Dimensions.get('window').height / 17),
        paddingBottom: 8,
        paddingHorizontal: 18 
    }
})

export default home

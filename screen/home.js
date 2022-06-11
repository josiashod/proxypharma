import React, { useState, useEffect, useRef } from 'react'
import { Dimensions, View, Text, TouchableOpacity, StyleSheet, Image, ToastAndroid } from 'react-native'
import { Ionicons, Feather, MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons'
import { Modalize } from 'react-native-modalize'
import MapView, { Marker, Polyline } from 'react-native-maps'
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions'
import { Api } from '../api/lienapi'
const GOOGLE_API_KEY = "AIzaSyBkHepoElEVnbsS6895tzuHnhu2XAcWI1U"
import { isEqual } from 'lodash'

import { useSelector, useDispatch } from 'react-redux'

const home = (props) => {
    let executing = 0;
    const dispatch = useDispatch()

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

    let map_view = useRef(null)

    const pharmacies = useSelector(state => state.appReducer.pharmacies);
    const selected_pharmacy = useSelector(state => state.appReducer.selected_pharmacy);
    const waypoints = useSelector(state => state.appReducer.waypoints);
    const active_tab = useSelector(state => state.appReducer.active_tab);
    const moving = useSelector(state => state.appReducer.moving);
    const modal = useSelector(state => state.appReducer.modal);

    // const [errorMsg, setErrorMsg] = useState(null)
    const [driving_mode, setDrivingMode] = useState('WALKING')
    const [direction_info, setDirectionInfo] = useState({
        duration: 0,
        distance: 0,
    })
    const [modal_closed, setModalClosed] = useState(true)

    let markers = []

    const onOpen = (pharmacy) => {
        dispatch({type: 'setSelectedPharmacy', value: pharmacy})
        modalizeRef.current.open();
    };

    const modalizeRef = useRef(null);

    const changeTab = (tab) => {
        if(!moving) {
            if( active_tab != tab)
                dispatch({type: 'setActiveTab', value: tab})
                // setActive(tab)
        }else{
            ToastAndroid.showWithGravity(
                "Un trajet est en cours, veuillez mettre fin a celui-ci",
                ToastAndroid.SHORT,
                ToastAndroid.TOP
            );
        }
    }

    const getPharmacies = async() => {
        if (!waypoints.length > 0) {
            try {
                let response = await fetch(`${Api}pharmacies/nearest/?lat=${region.latitude}&lng=${region.longitude}`)
                
                const json = await response.json()
                dispatch({type: 'setPhamacies', value: json.data})
                // setPharmacies(json.data)
    
            } catch (error) {
                console.error(error);
            }
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

            if ((new Date()).getHours() >= 21 || (new Date()).getHours() <= 7) {
                dispatch({type: 'setActiveTab', value:'on_call_pharmacies'})
            }
        })();

    }, []);

    if (modal) {
        modalizeRef.current.open();
        dispatch({type: 'setModal', value: false})
    }

    useEffect(() => {
        if(region != null)
            getPharmacies()

    } , [region])

    useEffect(() => {
        if(!moving)
        {
            dispatch({type: 'setWaypoints', value: []})
        }
    } , [moving])

    useEffect(() => {
        if(modal_closed)
        {
            // if(pharmacies[active_tab].filter(pharmacy => {return pharmacy.id === selected_pharmacy.id}).length === 0){
            //     let new_pharmacies = Object.assign({}, pharmacies)
            //     new_pharmacies[active_tab] = [...pharmacies[active_tab], selected_pharmacy]

            //     // console.log(new_pharmacies[active_tab][new_pharmacies[active_tab].length - 1])
                
            //     dispatch({type: 'setPharmacies', value: new_pharmacies})
            // }

            // console.log(pharmacies[active_tab][pharmacies[active_tab].length - 1])

            dispatch({type: 'setSelectedPharmacy', value: null})
            if (!moving) {
                dispatch({type: 'setWaypoints', value: []})
            }
        }
    } , [modal_closed])

    const changeDrivingMode = (mode) => {
        if (mode !== driving_mode) {
            setDrivingMode(mode)
        }
    }

    const drawTrajectory = async (mode) => {
        let user_location = {longitude: location.coords.longitude, latitude: location.coords.latitude}

        if(mode === 'user_to_pharmacy'){
            let pharmacy_location = {latitude: selected_pharmacy.latitude, longitude: selected_pharmacy.longitude}
            dispatch({type: 'setWaypoints', value: [user_location, selected_pharmacy]})
        }else if (mode === 'path_to_all_nearest_pharmacies') {
            setRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.025,
                longitudeDelta: 0.0042,
            })
            dispatch({type: 'setWaypoints', value: [user_location, ...pharmacies[active_tab]]})
            dispatch({type: 'setSelectedPharmacy', value: true})
            // dispatch({type: 'setMoving', value: true})
            modalizeRef.current.open()
        }
        // else if (mode === 'path_to_list_of_pharmacies') {
        //     // setPharmacies(pharmacies_in_params)
        //     setSelectedPharmacy(false)
        //     setDriveStart(true)
        //     modalizeRef.current.open()
        // }
    }

    const is_open = () => {
        let current_hour = (new Date()).getHours();
        if (current_hour <= 22 || selected_pharmacy.on_call)
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

    // const setModalRef = (ref) => {
    //     if(!modal && executing === 0)
    //         dispatch({type: 'setModalRef', value: ref})
    // }

    return (
        <View style={styles.container/*{flex: 1, paddingTop: 52, backgroundColor:"cyan", paddingLeft: 15, paddingRight: 15,}*/}>
            <MapView 
                style={styles.map}
                showsUserLocation={true}
                followUserLocation={true}
                initialRegion={region}
                mapPadding={{top: 100, right: 10, bottom: 60, left: 0}}
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
                {pharmacies[active_tab].map((pharmacy, index) => (
                    <Marker
                        key={index}
                        coordinate={{latitude: pharmacy.latitude, longitude: pharmacy.longitude}}
                        title={pharmacy.name}
                        ref={ref => { markers[index] = ref }}
                        onCalloutPress={() => {
                            if(!moving){
                                onOpen(pharmacy)
                                markers[index].hideCallout()
                            }
                        }}
                    >
                            { ((waypoints.length > 0) && (waypoints[waypoints.length - 1] === pharmacy))
                                ? 
                                <Image source={require('../assets/icons/icon-flag-end.png')} style={{width: 30, height: 30}} />
                                :
                                <Image source={require('../assets/icons/marker.png')} style={{width: 30, height: 30}} />
                            }

                    </Marker>
                ))}

                    {/* marker start */}
                    { (waypoints.length > 0) && 
                        <Marker
                            // key={index}
                            coordinate={waypoints[0]}
                            // title={pharmacy.name}
                            // ref={ref => { markers[index] = ref }}
                            // onCalloutPress={() => {onOpen(pharmacy), markers[index].hideCallout()}}
                        >
                            <Image source={require('../assets/icons/icon-flag-start.png')} style={{width: 40, height: 40}} />
                        </Marker>
                    }
                {
                    (waypoints.length > 0) && 
                    <MapViewDirections 
                        lineDashPattern={[0, 0]}
                        mode={driving_mode}
                        origin={waypoints[0]}
                        destination={waypoints[waypoints.length - 1]}
                        waypoints={waypoints.slice(1, waypoints.length - 1)}
                        optimizeWaypoints={true}
                        apikey={GOOGLE_API_KEY} // insert your API Key here
                        strokeWidth={4}
                        strokeColor="#00897E"
                        onReady={result => {
                            // console.log(result)
                            setDirectionInfo({
                                distance: result.distance,
                                duration: result.duration,
                            })
                            // console.log(`Distance: ${result.distance} km`)
                            // console.log(`Duration: ${result.duration} min.`)
                    
                            // map_view.fitToCoordinates(result.coordinates, {
                            //   edgePadding: {
                            //     right: (width / 20),
                            //     bottom: (height / 20),
                            //     left: (width / 20),
                            //     top: (height / 20),
                            //   }
                            // });
                        }}

                    />
                }
            </MapView>

            {/* header input */}
            <TouchableOpacity onPress={() => props.navigation.navigate('Search') } activeOpacity={0.9} style={styles.input_container}>
                <Ionicons name="search" size={24} color="#00897E" />
                <Text style={styles.input}>Rechercher une pharmacie</Text>
            </TouchableOpacity>

            {/* bottom tabs */}
            <View style={styles.tabs} >
                <TouchableOpacity onPress={() => changeTab('on_call_pharmacies')} style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', paddingTop: 4, paddingBottom: 4, textAlign: 'center', flexGrow: 1, height: '100%' }} >
                    {/* <Ionicons name="locate" size={24} color={active_tab === 'on_call_pharmacies' ? '#00897E' : 'black'} /> */}
                    {active_tab === 'on_call_pharmacies' ? <Image
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
                    <Text style={[{textAlign: 'center', fontFamily: 'Mulish'}, active_tab === 'on_call_pharmacies' ? { color: '#00897E' } : { color: 'black' } ]}>Gardes</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => changeTab('pharmacies')} style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', paddingTop: 4, paddingBottom: 4, textAlign: 'center', flexGrow: 1, height: '100%' }} >
                    {/* <Ionicons name="locate" size={24} color={active_tab === 'pharmacies' ? '#00897E' : 'black'} /> */}
                    {active_tab === 'pharmacies' ? <Image
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
                    <Text style={[{textAlign: 'center', fontFamily: 'Mulish'}, active_tab === 'pharmacies' ? { color: '#00897E' } : { color: 'black' } ]}>Toutes</Text>
                </TouchableOpacity>
            </View>
            
            {/* bottom modal */}
            <Modalize 
                ref={modalizeRef}
                snapPoint={Dimensions.get("window").height * 0.355} 
                modalHeight={Dimensions.get("window").height * 0.355} 
                withHandle={false}
                overlayStyle={styles.overlay_background}
                modalStyle={styles.modal_style}
                rootStyle={{elevation: 4}}
                onClosed={() => {
                    setModalClosed(true)
                }}
                onOpened={() => {
                    setModalClosed(false)
                }}
            >
                <View style={{marginBottom:'4%'}}>
                    { (typeof(selected_pharmacy) === 'boolean') 
                        ? (selected_pharmacy ? 
                            <Text style={{fontFamily: 'Mulish', fontSize: 20, color: 'black', marginBottom: 1, flexShrink: 0}}> Parcourir les pharmacies les plus proches</Text>
                            :
                            <Text style={{fontFamily: 'Mulish', fontSize: 20, color: 'black', marginBottom: 1, flexShrink: 0}}> Parcourir les pharmacies les proches possedant votre ordonnances</Text>
                        )
                        :
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <View style={{flexShrink: 1}}>
                                <Text style={{fontFamily: 'Mulish', fontSize: 20, color: 'black', marginBottom: 1, flexShrink: 0}}>{selected_pharmacy ? selected_pharmacy.name : ""}</Text>
                                <Text style={{fontSize: 16, color: '#A7ABAD'}}> {selected_pharmacy ? selected_pharmacy.distance.toPrecision(2) : ""} km</Text>
                                
                                <View style={{ flexDirection: 'row' }}>
                                    { selected_pharmacy && selected_pharmacy.phone && <Text style={{fontSize: 16, color: '#A7ABAD', marginRight: 10}}>Tel : {selected_pharmacy.phone}</Text> }
                                    <Text style={[{fontSize: 16}, is_open ? {color: '#00897E'} : {color: '#DA645C'} ]}>{ is_open ? 'Ouvert' : 'Fermé'}</Text>
                                </View>
                            </View>
                            { selected_pharmacy && <Image source={{ uri: selected_pharmacy.thumbnail_image}} style={{width: 60, height: 60, borderRadius: 40}} />}
                        </View>
                    }
                </View>

                <View style={{ width: '100%', paddingVertical: 1, display: 'flex', flexDirection: 'row', marginBottom: 8 }}>
                    { (waypoints.length === 0) ? 
                        <TouchableOpacity onPress={() => drawTrajectory('user_to_pharmacy')} style={[styles.badge_button, { marginRight: 10, backgroundColor: '#00897E', }]}>
                            <MaterialCommunityIcons name="directions" size={20} color="#fff" style={{alignSelf: 'center'}} />
                            <Text style={{marginLeft: 6 ,alignSelf: 'center', fontSize: 16 ,fontFamily: 'Mulish', textAlign: 'center', color: 'white'}}>Itinéraire</Text>
                        </TouchableOpacity>
                    :
                        <TouchableOpacity 
                            onPress={() => {
                                dispatch({type: 'setMoving', value: true})
                                modalizeRef.current.close()
                            }} 
                            style={[styles.badge_button, { marginRight: 10, backgroundColor: '#00897E', }]}
                        >
                            <MaterialIcons name="navigation" size={20} color="#fff" style={{alignSelf: 'center'}} />
                            <Text style={{marginLeft: 6 ,alignSelf: 'center', fontSize: 16 ,fontFamily: 'Mulish', textAlign: 'center', color: 'white'}}>Démarrer</Text>
                        </TouchableOpacity>
                    }
                    {(typeof(selected_pharmacy) !== 'boolean' && waypoints.length === 0) && 
                        <TouchableOpacity onPress={() => { props.navigation.navigate('Pharmacy') }} style={[styles.badge_button, { marginRight: 10, }]}>
                            <Feather name="info" size={20} color="#00897E" style={{alignSelf: 'center'}} />
                            <Text style={{ marginLeft: 6 ,alignSelf: 'center', fontSize: 16 ,fontFamily: 'Mulish', textAlign: 'center', color: '#00897E'}}>Consulter</Text>
                        </TouchableOpacity>
                    }
                    
                    { (waypoints.length > 0) && <TouchableOpacity 
                            onPress={() => { 
                                dispatch({type: 'setWaypoints', value: []})
                                if(typeof(selected_pharmacy) === 'boolean')
                                {   
                                    modalizeRef.current.close()
                                    dispatch({type: 'setMoving', value: false})
                                }
                            }} 
                            style={[styles.badge_button, { marginRight: 10, }]}
                        >
                            <Ionicons name="close" size={20} color="#00897E" style={{alignSelf: 'center'}} />
                            <Text style={{ marginLeft: 6 ,alignSelf: 'center', fontSize: 16 ,fontFamily: 'Mulish', textAlign: 'center', color: '#00897E'}}>Annuler</Text>
                        </TouchableOpacity> }
                </View>

                { waypoints.length > 0 && <View>
                    <Text style={{  fontFamily: 'Mulish', fontSize: 18, marginBottom: 12 }}>Quelle est votre moyen de transport ?</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 6, justifyContent: 'space-around' }} >
                        <TouchableOpacity onPress={() => changeDrivingMode('DRIVING') } style={[{ flexDirection: 'row', borderRadius: 40, paddingHorizontal: 10, paddingVertical: 4 }, driving_mode === 'DRIVING' ? { backgroundColor: '#00897E25' } : { color: '#3C4043' }]}>
                            <MaterialIcons name="directions-car" size={20} style={[ driving_mode === 'DRIVING' ? { color: '#00897E' } : { color: '#3C4043' } ]} />
                            { driving_mode === 'DRIVING' && <Text style={{  fontFamily: 'Mulish', fontSize: 14, alignSelf: 'center', marginLeft: 6, color: '#00897E'  }} >{ direction_info.duration.toPrecision(2) } min</Text>}
                        </TouchableOpacity>

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
                { !moving ? 
                    <View>
                        <TouchableOpacity onPress={() => { props.navigation.navigate('Prescription') }} style={[styles.floating_button, {backgroundColor: '#00897E', marginBottom: 10}]} activeOpacity={0.8}>
                            <Feather 
                                name="file-text" size={24} color="#FFF"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { goToUserLocation() }} style={[styles.floating_button, {backgroundColor: '#FFF', marginBottom: 10}]} activeOpacity={0.8}>
                            <MaterialIcons 
                                name="my-location" size={24} color="#00897E"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { drawTrajectory('path_to_all_nearest_pharmacies') }} style={[styles.floating_button, {backgroundColor: '#00897E', marginBottom: 10 }]} activeOpacity={0.8}>
                            <FontAwesome5 name="route" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                :
                   <View>
                        <TouchableOpacity 
                            onPress={() => { dispatch({type: 'setMoving', value: false}) }} 
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
    },
    header:{
        position: 'absolute',
        width: '100%',
        height: 'auto',
        backgroundColor: '#FFF',
        elevation: 5,

    },
    input_container: {
        position: 'absolute',
        flexDirection: 'row',
        top: (Dimensions.get('window').height * 0.058),
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
    },
    tabs: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 55,
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

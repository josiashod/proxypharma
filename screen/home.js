import React, { useState } from 'react'
import { Dimensions,View, Text, TouchableOpacity, StyleSheet, SafeAreaView, TextInput } from 'react-native'
import {useDispatch} from 'react-redux'
import { Ionicons, AntDesign, FontAwesome, Octicons } from '@expo/vector-icons'

const home = () => {
    const dispatch = useDispatch()
    
    const [search, onChangeSearch] = useState("")

    return (
        <View style={{flex: 1, paddingTop: 52, backgroundColor:"cyan", paddingLeft: 15, paddingRight: 15,}}>
            <SafeAreaView style={styles.inputContainer}>
                <TextInput 
                    value={search}
                    onChangeText={onChangeSearch} 
                    style={styles.input} 
                />
                <Ionicons name="menu-outline" size={30} color="gray" style={styles.burger} />
            </SafeAreaView>
            <SafeAreaView style={{display: 'flex', flexDirection: 'row', marginTop: 12}}>
                <TouchableOpacity style={{ backgroundColor: 'white', elevation: 4, textAlign: 'center', padding: 10, borderRadius: 40, flexGrow: 1, marginRight: 10 }} >
                    <Text>Pharmacie de garde</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ backgroundColor: 'white', elevation: 4, textAlign: 'center', padding: 10, borderRadius: 40, flexGrow: 1 }} >
                    <Text>Toutes les pharmacies</Text>
                </TouchableOpacity>
            </SafeAreaView>

            {/* <Text>{Dimensions.get("screen").height}</Text>

            <TouchableOpacity onPress={() => dispatch({ type: "setConnected", value: false }) } style={{width: 200, height: 38, alignItems: 'center', justifyContent: 'center', marginTop: 10, backgroundColor: 'green' }} >
                <Text>Deconnexion</Text>
            </TouchableOpacity> */}


        </View>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        position: 'relative',
        display: 'flex',
    },
    input: {
        width: '100%',
        paddingLeft: 40,
        paddingRight: 10,
        paddingTop: 9,
        paddingBottom: 9,
        backgroundColor: "white",
        borderRadius: 40,
        fontSize: 15,
        fontWeight: '100',
        elevation: 4,
    },
    burger: {
        elevation: 4.5,
        position: 'absolute',
        top: '10%',
        left: 5
    }
})

export default home

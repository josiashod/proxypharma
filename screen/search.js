import React, {useState} from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import { Ionicons, AntDesign, Octicons } from '@expo/vector-icons'

export default function Search(props) {
    const [search, setSearch] = useState('')
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => props.navigation.goBack() } activeOpacity={0.9} style={styles.inputContainer}>
                <AntDesign name="arrowleft" size={24} color="#00897E" />
                <TextInput 
                    style={styles.input}
                    placeholder="Rechercher une pharmacie"
                    autoFocus={true}
                    value={search}
                    selectionColor="#00897E"
                    onChangeText={(text) => setSearch(text)}
                />
            </TouchableOpacity>
            <Text>Search</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: "#fff",
    },
    inputContainer: {
        position: 'absolute',
        flexDirection: 'row',
        top: 55,
        left: 0,
        right: 0,
        display: 'flex',
        marginHorizontal: 18, 
        backgroundColor: "#fff",
        elevation: 2,
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
    }
})
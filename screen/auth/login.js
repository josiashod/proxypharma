import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import {useDispatch} from 'react-redux'

const login = (props) => {

    const dispatch = useDispatch()

    return (
        
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}} >

            <Text>login</Text>

            <TouchableOpacity onPress={() => dispatch({ type: "setConnected", value: true }) } style={{width: 200, height: 38, alignItems: 'center', justifyContent: 'center', marginTop: 10, backgroundColor: 'green' }} >
                <Text>Me connecter</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => props.navigation.navigate('Signup') } style={{width: 200, height: 38, alignItems: 'center', justifyContent: 'center', marginTop: 10, backgroundColor: 'red' }} >
                <Text>navigate to signup</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => props.navigation.navigate('MdpForget') } style={{width: 200, height: 38, alignItems: 'center', justifyContent: 'center', marginTop: 10, backgroundColor: 'pink' }} >
                <Text>navigate to recoverymdp</Text>
            </TouchableOpacity>

        </View>
    )
}

export default login

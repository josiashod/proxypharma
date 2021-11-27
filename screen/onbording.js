import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import {useDispatch} from 'react-redux'

const onbording = (props) => {

    const dispatch = useDispatch()

    return (

        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}} >

            <Text>Onbording</Text>

            <TouchableOpacity onPress={() => dispatch({ type: "setFirstUse", value: false }) } style={{width: 200, height: 38, alignItems: 'center', justifyContent: 'center', marginTop: 10, backgroundColor: 'red'}} >
                <Text>Me connecter</Text>
            </TouchableOpacity>

        </View>

    )
}

export default onbording

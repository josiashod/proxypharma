import React, {useEffect} from 'react'
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'

import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import {useDispatch, useSelector, batch } from 'react-redux'

import { Ionicons, AntDesign, FontAwesome, Octicons } from '@expo/vector-icons'


import Onbording from '../screen/onbording'
import Login from '../screen/auth/login'
import Blank from '../screen/blank'
import Recoverymdp from '../screen/auth/recoverymdp'

import Home from '../screen/home'
import Search from '../screen/search'

const Stack = createStackNavigator()

const StackConnexion = () => {

    return (


        <Stack.Navigator>

            <Stack.Screen 
                name="Login" component={Login}
            />

            <Stack.Screen 
                name="Signup" component={Signup}
            />

            
            <Stack.Screen 
                name="MdpForget" component={Recoverymdp}
            />


        </Stack.Navigator>


    )

}


const StackMain = () => {

    return (


        <Stack.Navigator screenOptions={{ headerShown: false }}>

            <Stack.Screen 
                name="Home" component={Home}
            />

            <Stack.Screen 
                name="Search" component={Search}
            />

        </Stack.Navigator>


    )

}


const navigation = () => {

    const first_use = useSelector(state => state.parameterReducer.first_use);
    const connected = useSelector(state => state.parameterReducer.connected);

    return (

        <NavigationContainer >

            {first_use ?

                <Onbording/>

            :

                // !connected ?

                //     <StackConnexion/>

                // :

                <StackMain/>
            
            }

        </NavigationContainer>
        
    )

}
  
export default navigation


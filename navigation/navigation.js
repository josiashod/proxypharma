import React from 'react'
// import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'

import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import { useSelector } from 'react-redux'

// import { Ionicons, AntDesign, FontAwesome, Octicons } from '@expo/vector-icons'


// import Onbording from '../screen/onbording'
// import Login from '../screen/auth/login'
// import Blank from '../screen/blank'
// import Recoverymdp from '../screen/auth/recoverymdp'

import Home from '../screen/home'
import Search from '../screen/search'
import Pharmacy from '../screen/pharmacy'
import Prescription from '../screen/prescription'
import Splash from '../screen/splash'

// const Stack = createStackNavigator({
//     Splash: {
//         screen: Splash,
//         navigationOptions: {headerShown: false}
//     }},{
//         initialRouteName: 'Splash',
//     }
// )
const Stack = createStackNavigator()

// const StackConnexion = () => {

//     return (


//         <Stack.Navigator>

//             <Stack.Screen 
//                 name="Login" component={Login}
//             />

//             <Stack.Screen 
//                 name="Signup" component={Signup}
//             />

            
//             <Stack.Screen 
//                 name="MdpForget" component={Recoverymdp}
//             />


//         </Stack.Navigator>


//     )

// }

const StackSplash = () => {
    

    return (<Stack.Navigator screenOptions={{ headerShown: false }}>

        <Stack.Screen 
            name="Splash" component={Splash}
        />

    </Stack.Navigator>)
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

            <Stack.Screen
                name="Pharmacy" component={Pharmacy}
            />

            <Stack.Screen
                name="Prescription" component={Prescription}
            />

        </Stack.Navigator>


    )

}


const navigation = () => {

    // const first_use = useSelector(state => state.parameterReducer.first_use);
    const splash = useSelector(state => state.parameterReducer.splash);
    // const connected = useSelector(state => state.parameterReducer.connected);

    return (

        <NavigationContainer>

            { splash ? <StackSplash /> : /*first_use ? <Onbording /> : */<StackMain />  }

        </NavigationContainer>
        
    )

}
  
export default navigation


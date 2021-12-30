import React, {useEffect, useState} from 'react'
import { View, Image, Appearance } from 'react-native'
import { useDispatch } from 'react-redux'
import logo from '../assets/logo.png'

export default Splash = (props) => {
const [theme, setTheme] = useState('')
  const dispatch = useDispatch()

  useEffect(() => {
    setTimeout(() => {
      // props.navigation.navigate('Home')
      dispatch({type: 'setSplash', value: false})
    }, 1000)
  })
  

  return (
    <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center'}, Appearance.getColorScheme() === 'dark' ? {backgroundColor: '#022C2F'} : {backgroundColor: '#FFF'}]}>
      {/* <Text>Splash Screen {Appearance.getColorScheme()}</Text> */}
      <Image source={logo} style={{ width: 230, height: 230 }}></Image>
    </View>
  )
}
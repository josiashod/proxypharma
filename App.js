import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Navigation from './navigation/navigation';

import { Provider } from 'react-redux'
import configureStore from './store/configureStore';
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/es/integration/react'

import * as Location from 'expo-location';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';

const Store = configureStore()
const persistor = persistStore(Store)

export default function App() {

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  let [fontsLoaded] = useFonts({
    // Load a font `Mulish` from a static resource
    Mulish: require('./assets/fonts/Mulish-Regular.ttf'),

    // Any string can be used as the fontFamily name. Here we use an object to provide more control
    'Mulish-SemiBold': require('./assets/fonts/Mulish-SemiBold.ttf'),
    'Mulish-ExtraLight': require('./assets/fonts/Mulish-ExtraLight.ttf'),
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  if(!fontsLoaded) {
    return <AppLoading />
  }

  return (
    <Provider store={Store}>

      <PersistGate persistor={persistor}>

        <View style={styles.container}>

          <StatusBar style='dark'/>

          <Navigation/>

        </View>

      </PersistGate>

    </Provider>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
});

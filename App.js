import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Navigation from './navigation/navigation';

import { Provider } from 'react-redux'
import configureStore from './store/configureStore';
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/es/integration/react'

import * as Location from 'expo-location';

const Store = configureStore()
const persistor = persistStore(Store)

export default function App() {

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      console.log(location)
    })();
  }, []);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
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

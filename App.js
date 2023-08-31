import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import SplashScreen from 'react-native-splash-screen';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import MainNavigation from './navigation/MainNavigation';
import {Provider} from 'react-redux';
import {store} from './Store/store';
import {MenuProvider} from 'react-native-popup-menu';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage.clear();

const App = () => {
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 1000);
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <MenuProvider>
          <MainNavigation />
        </MenuProvider>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;

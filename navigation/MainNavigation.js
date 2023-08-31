import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import StackNavigation from './StackNavigation';
import AuthScreen from '../Screens/AuthScreen';
import {useSelector} from 'react-redux';
import StartUpScreen from '../Screens/StartUpScreen';
import NetInfo from '@react-native-community/netinfo';
import NoInternetScreen from '../Screens/NoInternetScreen';

const MainNavigation = () => {
  const isAuth = useSelector(
    state => state.auth.token !== null && state.auth.token !== '',
  );
  const didTryAutoLogin = useSelector(state => state.auth.didTryAutoLogin);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <NavigationContainer>
      {!isConnected ? (
        <NoInternetScreen />
      ) : isAuth ? (
        <StackNavigation />
      ) : didTryAutoLogin ? (
        <AuthScreen />
      ) : (
        <StartUpScreen />
      )}
    </NavigationContainer>
  );
};
export default MainNavigation;

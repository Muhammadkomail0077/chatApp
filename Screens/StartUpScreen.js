import React, {useEffect} from 'react';
import {ActivityIndicator, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {authenticate, setDidTryAutoLogin} from '../Store/authSlice';
import {getUserData} from '../utils/Actions/userAction';

const StartUpScreen = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const tryLogin = async () => {
      const storedAuthInfo = await AsyncStorage.getItem('userData');
      if (!storedAuthInfo) {
        dispatch(setDidTryAutoLogin());
        return;
      }
      const parsedData = JSON.parse(storedAuthInfo);
      const {userId, token, expiryDate: expiryDateString} = parsedData;
      const expiryDate = new Date(expiryDateString);
      if (expiryDate <= new Date() || !token || !userId) {
        dispatch(setDidTryAutoLogin());
        return;
      }
      const userData = await getUserData(userId);
      dispatch(authenticate({token: token, userData}));
    };
    tryLogin();
  }, [dispatch]);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size={35} color={'red'} />
    </View>
  );
};
export default StartUpScreen;

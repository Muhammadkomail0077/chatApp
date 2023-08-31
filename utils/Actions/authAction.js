import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {authenticate, logout} from '../../Store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getUserData} from './userAction';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import {useEffect} from 'react';

const firebaseConfig = {
  apiKey: 'AIzaSyBNtN5MtBImlPaMQQy2KoxuweE-Q2k7JJA',
  authDomain: 'whatsapp-338b3.firebaseapp.com',
  databaseURL: 'https://whatsapp-338b3-default-rtdb.firebaseio.com/',
  projectId: 'whatsapp-338b3',
  storageBucket: 'whatsapp-338b3.appspot.com',
  messagingSenderId: '235752567381',
  appId: '1:235752567381:web:ed2503883b2cc3539d9adc',
  measurementId: 'G-ZCE7RLYPB7',
};

// Initialize Firebase
if (!firebase.apps.length) {
  const app = firebase.initializeApp(firebaseConfig);
}

let timer;

export const SignUp = (firstname, lastname, email, password) => {
  return async dispatch => {
    try {
      const result = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const authToken = await result.user.getIdToken();
      const {expirationTime} = authToken;
      const expirationDuration = 360000; // Token expiration duration in seconds (adjust this value as per your requirements)
      const expiryDate = new Date(Date.now() + expirationDuration * 1000);
      const timeNow = new Date();
      const millisecondsUntilExpiry = expiryDate - timeNow;
      const userData = {
        firstname,
        lastname,
        email,
        userId: result.user.uid,
        signUpDate: new Date().toISOString(),
      };

      await createUser(userData);

      dispatch(authenticate({token: authToken, userData}));

      saveDataToStorage(authToken, result.user.uid, expiryDate);

      timer = setTimeout(() => {
        dispatch(userLogout(userData));
      }, millisecondsUntilExpiry);

      console.log('User account created & signed in');
    } catch (error) {
      console.log(error);
      const errorCode = error.code;
      let message;
      if (errorCode === 'auth/email-already-in-use') {
        message = 'That email address is already in use!';
      } else if (errorCode === 'auth/invalid-email') {
        message = 'That email address is invalid!';
      }
      throw new Error(message);
    }
  };
};

export const SignIn = (email, password) => {
  return async dispatch => {
    try {
      const result = await auth().signInWithEmailAndPassword(email, password);
      const authToken = await result.user.getIdToken();
      const expirationDuration = 3600;
      const expiryDate = new Date(Date.now() + expirationDuration * 1000);
      const timeNow = new Date();
      const millisecondsUntilExpiry = expiryDate - timeNow;

      const userData = await getUserData(result.user.uid);

      dispatch(authenticate({token: authToken, userData}));

      saveDataToStorage(authToken, result.user.uid, expiryDate);

      await storedPushToken(userData);

      timer = setTimeout(() => {
        dispatch(userLogout(userData));
      }, millisecondsUntilExpiry);

      console.log('User successfully logged in');
    } catch (error) {
      console.log(error);
      const errorCode = error.code;
      let message;
      if (
        errorCode === 'auth/user-not-found' ||
        errorCode === 'auth/wrong-password' ||
        errorCode
      ) {
        message = 'invalid Email or Password';
      }
      console.log(message);
      throw new Error(message);
    }
  };
};

export const userLogout = (userData) => {
  return async dispatch => {
    await removePushToken(userData)
    AsyncStorage.clear();
    clearTimeout(timer);
    dispatch(logout());
  };
};

export const updateSignedInUserData = async (userId, newData) => {
  if (newData.firstname && newData.lastname) {
    const firstLast = `${newData.firstname} ${newData.lastname}`.toLowerCase();
    newData.firstLast = firstLast;
  }

  await database()
    .ref(`users/${userId}`)
    .update(newData)
    .then(() => console.log('Data updated.'))
    .catch(() => console.log('Data not updated.'));
};

const createUser = async userData => {
  const {firstname, lastname, email, userId} = userData;
  const firstLast = `${firstname} ${lastname}`.toLowerCase();
  const user = {
    ...userData,
    firstLast,
  };
  database()
    .ref(`users/${userId}`)
    .set(user)
    .then(() => console.log('Data saved.'))
    .catch(() => console.log('Data not saved.'));
};

const saveDataToStorage = (token, userId, expiryDate) => {
  AsyncStorage.setItem(
    'userData',
    JSON.stringify({
      token,
      userId,
      expiryDate: expiryDate.toISOString(),
    }),
  );
};

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
  getFcmToken();
}

const getFcmToken = async () => {
  let fcmToken = await AsyncStorage.getItem('fcmToken');
  console.log('old fcm Token', fcmToken);
  if (!fcmToken) {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('new fcm token', fcmToken);
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    } catch (error) {
      console.log(error);
    }
  }
};

export const storedPushToken = async userData => {
  try {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      const tokenRef = database().ref(`users/${userData.userId}/pushToken`);

      // Fetch existing tokens from Firebase
      const existingTokensSnapshot = await tokenRef.once('value');
      const existingTokens = existingTokensSnapshot.val() || [];

      const newIndex = existingTokens.length;

      // Add the new token to the array if not already present
      if (!existingTokens.includes(fcmToken)) {
        existingTokens.push(fcmToken);
        existingTokens[newIndex] = fcmToken;
        await tokenRef.set(existingTokens);
      }
      await AsyncStorage.setItem('fcmToken', fcmToken);
    }
  } catch (error) {
    console.log(error);
  }
};

export const pushNotifications = () => {
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage.notification,
    );
  });

  // foreground Message Handling
  messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
  });

  // chech weather initial notification is available
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );
      }
    });
};

export const getUserPushTokens = async (userId) => {
  try {
      const userRef = database().ref(`users/${userId}/pushToken`);
      const snapshot = await userRef.once('value')
      if (!snapshot || !snapshot.exists()) {
          return {};
      }
      return snapshot.val() || {};
  } catch (error) {
      console.log(error);
  }
}

export const removePushToken = async (userData)=>{
  const token = await messaging().getToken();
  const tokenData = await getUserPushTokens(userData.userId)
  // console.log('token',token);
  // console.log('tokenData',tokenData);

  for(const key in tokenData){
    if(tokenData[key]=== token){
      delete tokenData[key]
      break
    }
  }

  const userRef = database().ref(`users/${userData.userId}/pushToken`);
await userRef.set(tokenData)
}


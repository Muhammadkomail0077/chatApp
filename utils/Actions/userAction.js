import database, {firebase} from '@react-native-firebase/database';
import 'firebase/database';

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

if (!firebase.apps.length) {
  const app = firebase.initializeApp(firebaseConfig);
}

export const getUserData = async userId => {
  try {
    const userRef = database().ref(`users/${userId}`);

    const snapshot = await userRef.once('value');
    return snapshot.val();
  } catch (error) {
    console.log('Error:', error);
  }
};

export const getUserChats = async userId => {
  try {
    const userRef = database().ref(`userChat/${userId}`);

    const snapshot = await userRef.once('value');
    return snapshot.val();
  } catch (error) {
    console.log('Error:', error);
  }
};

export const deleteUserChats = async (userId, key) => {
  try {
    const chatRef = database().ref(`userChat/${userId}/${key}`);

    chatRef.remove();
  } catch (error) {
    console.log('Error:', error);
    throw error;
  }
};

export const addUserChats = async (userId, chatId) => {
  try {
    const chatRef = database().ref(`userChat/${userId}`);

    chatRef.push(chatId);
  } catch (error) {
    console.log('Error:', error);
    throw error;
  }
};

export const searchUsers = async queryText => {
  const searchTerm = queryText.toLowerCase();

  try {
    const userRef = firebase.database().ref('users');
    const queryRef = userRef
      .orderByChild('firstLast')
      .startAt(searchTerm)
      .endAt(searchTerm + '\uf8ff');
    const snapshot = await queryRef.once('value');
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return {};
  } catch (error) {
    console.log(error);
    throw error;
  }
};

import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect, useState, useCallback, useRef} from 'react';
import ChatSetting from '../Screens/ChatSettings';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ChatList from '../Screens/ChatList';
import Setting from '../Screens/Setting';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ChatScreen from '../Screens/ChatScreen';
import NewChatScreen from '../Screens/NewChatScreen';
import {useDispatch, useSelector} from 'react-redux';
import firebase from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import PushNotification from 'react-native-push-notification';
import {useNavigation} from '@react-navigation/native';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {setStoredUsers} from '../Store/userSlice';
import {setChatsData} from '../Store/chatSlice';
import {setChatMessages, setStarredMessages} from '../Store/messagesSlice';
import Contact from '../Screens/Contact';
import ChatSettingsScreen from '../Screens/ChatSettingsScreen';
import DataListScreen from '../Screens/DataListScreen';
import {NavigationActions} from 'react-navigation';
// import { AppState, Platform } from 'react-native';
import {
  configurePushNotifications,
  getUserPushTokens,
  pushNotifications,
  removePushToken,
  requestUserPermission,
} from '../utils/Actions/authAction';
import NoInternetScreen from '../Screens/NoInternetScreen';
import MapviewScreen from '../Screens/MapviewScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const Tabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitle: '',
        headerShadowVisible: false,
      }}>
      <Tab.Screen
        name="Home"
        component={ChatList}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="chatbubble-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Setting"
        component={Setting}
        options={{
        headerShown: false,
          tabBarLabel: 'Settings',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const SubNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Group>
        <Stack.Screen
          name="Whatsapp"
          component={Tabs}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{headerTitle: ''}}
        />
        <Stack.Screen
          name="MapviewScreen"
          component={MapviewScreen}
          options={{headerTitle: 'Map'}}
        />
        <Stack.Screen
          name="ChatSettings"
          component={ChatSettingsScreen}
          options={{headerTitle: '', headerShadowVisible: false}}
        />
        <Stack.Screen
          name="Contact"
          component={Contact}
          options={{headerTitle: 'Contact Info'}}
        />
        <Stack.Screen
          name="DataList"
          component={DataListScreen}
          options={{headerTitle: ''}}
        />
        <Stack.Screen
          name="NoInternetScreen"
          component={NoInternetScreen}
          options={{headerTitle: ''}}
        />
      </Stack.Group>

      <Stack.Group
        screenOptions={{
          presentation: 'containedModal',
        }}>
        <Stack.Screen name="NewChat" component={NewChatScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

const StackNavigation = () => {
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

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const userData = useSelector(state => state.auth.userData);
  const storedUsers = useSelector(state => state.users.storedUsers);
  const chatMessages = useSelector(state => state.messages.messagesData);

  useEffect(() => {
    requestUserPermission();
    pushNotifications();
    
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification)
  },
      onRegistrationError: function(err) {
        console.error(err.message, err);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // setIsLoading(true)
      const userChatsRef = await database().ref('userChat');
      const refs = [userChatsRef];

      console.log('Subscribing to firebase listeners');

      userChatsRef.on('value', async querySnapshot => {
        const chatIdsData = (await querySnapshot.val()) || {};
        const chatIds = Object.values(chatIdsData);
        // console.log('chatMsg', chatIds);
        const chatsData = {};
        let chatsFoundCount = 0;
        const chatId = chatIds.map(x => {
          const chatIdValue = Object.values(x)[0];
          const chatRef = database().ref(`chats/${chatIdValue}`);
          refs.push(chatRef);
          // console.log('chatref... ', refs);

          chatRef.on('value', async chatSnapshot => {
            chatsFoundCount++;
            let data = await chatSnapshot.val();
            if (data && data.users) {
              if (!data.users.includes(userData.userId)) return;
              data.key = chatSnapshot.key;
              data.users.forEach(id => {
                // console.log('logs', id);
                if (storedUsers[id]) return;
                const userRef = database().ref(`users/${id}`);
                userRef.on('value', async userSnapshot => {
                  const userSnapshotData = await userSnapshot.val();
                  // console.log('chatsnapshot...', userSnapshotData);
                  dispatch(setStoredUsers({newUsers: {userSnapshotData}}));
                });
                refs.push(userRef);
              });
              chatsData[chatSnapshot.key] = data;
            }
            if (chatsFoundCount >= chatId.length) {
              dispatch(setChatsData({chatsData}));
              setIsLoading(false);
            }

            const chatIdVal = Object.values(x);
            chatIdVal.forEach(singleChatId => {
              const messagesRef = database().ref(`messages/${singleChatId}`);
              refs.push(messagesRef);
              messagesRef.on('value', async messageSnapshot => {
                // console.log('shafaq', messagesRef);
                const messagesData = await messageSnapshot.val();
                dispatch(setChatMessages({chatId: singleChatId, messagesData}));
                // console.log('console', setChatMessages({chatId: singleChatId, messagesData}));
              });
            });

            if (chatsFoundCount == 0) {
              setIsLoading(false);
            }
          });
        });
      });

      const userStarredMessageRef = database().ref(
        `userStarredMessages/${userData.userId}`,
      );
      refs.push(userStarredMessageRef);
      userStarredMessageRef.on('value', async querySnapshot => {
        const starredMessages = (await querySnapshot.val()) || {};
        dispatch(setStarredMessages({starredMessages}));
      });

      return () => {
        console.log('Unsubscribing firebase listeners');
        refs.forEach(ref => ref.off());
      };
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size={'large'} color={'blue'} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SubNavigation />
    </KeyboardAvoidingView>
  );
};

export default StackNavigation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

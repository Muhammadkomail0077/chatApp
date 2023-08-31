import RNFS from 'react-native-fs';
import React, {useCallback, useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  ImageBackground,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import bgImage from '../Assets/Images/bgImage.jpg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';
import PageContainer from '../components/PageContainer';
import Bubble from '../components/Bubble';
import {
  createChat,
  sendImgMessage,
  sendTextMessage,
} from '../utils/Actions/chatActions';
import firebase from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import {useSelector, useDispatch} from 'react-redux';
import {createSelector} from '@reduxjs/toolkit';
import ReplyTo from '../components/ReplyTo';
import {LaunchImagePicker, openCamera} from '../utils/LaunchImagePicker';
import AwesomeAlert from 'react-native-awesome-alerts';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import {uploadImageAsync} from '../utils/imagePickerHelper';
import Colors from '../constants/Colors';
import MapviewScreen from './MapviewScreen';

const ChatScreen = props => {
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

  const userData = useSelector(state => state.auth.userData);
  const storedUsers = useSelector(state => state.users.storedUsers);
  const storedChats = useSelector(state => state.chats.chatsData);
  const [chatId, setChatId] = useState(props.route?.params?.chatId);
  const [errorBanner, setErrorBanner] = useState('');
  const [replyingTo, setReplyingTo] = useState();
  // const uid = props?.route?.params.userId;
  const [chatUsers, setChatUsers] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [tempImageUri, setTempImageUri] = useState('');
  let previousMessageDate = null;
  const flatList = useRef();
  let lastMessageDateString = '';
  const [isLoading, setIsLoading] = useState(false);
  const chatMessagesSelector = createSelector(
    state => state.messages.messagesData[chatId],
    chatMessagesData => {
      if (!chatMessagesData) return [];

      const messageList = [];
      for (const key in chatMessagesData) {
        const message = chatMessagesData[key];

        messageList.push({
          key,
          ...message,
        });
      }
      messageList.sort((a, b) => a.timestamp - b.timestamp);
      return messageList;
    },
  );
  const chatMessages = useSelector(state => chatMessagesSelector(state));
  const newChatsData = props.route?.params?.newChatData;
  const chatData = (chatId && storedChats[chatId]) || newChatsData || {};
  const location = props.route.params.location;
  // const [locationMsg, setLocationMsg] = useState('');
  const formattedLocatioMsg =location && `Address: ${location.myAddress}, City: ${location.myCity}, Location: ${location.myCountry}, Latitude: ${location.myLatitude}, Longitude: ${location.myLongitude}.`;
  useEffect(() => {
    if (location) {
      setMessageText(formattedLocatioMsg);
    }
  }, [location]);

  useEffect(() => {
    if (!chatData) return;
    if (chatData && chatData.users) {
      setChatUsers(chatData.users);

      const userId = chatData.users.find(id => id !== userData.userId);
      const userRef = database().ref(`users/${userId}`);
      userRef.on('value', userSnapshot => {
        const userSnapshotData = userSnapshot.val();
        props.navigation.setOptions({
          headerTitle: chatData.chatName ?? `${userSnapshotData.firstLast}`,
          headerRight: () => {
            return (
              <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                {chatId && (
                  <Item
                    title="Chat Settings"
                    iconName="settings-outline"
                    onPress={() => {
                      chatData.isGroupChat
                        ? props.navigation.navigate('ChatSettings', {
                            chatId,
                          })
                        : props.navigation.navigate('Contact', {
                            uid: chatUsers.find(uid => uid !== userData.userId),
                          });
                    }}
                  />
                )}
              </HeaderButtons>
            );
          },
        });
      });
    }
  }, [chatData, chatUsers]);

  const sendMessage = useCallback(async () => {
    try {
      let id = chatId;
      if (!id) {
        id = await createChat(
          userData.userId,
          chatData.users,
          newChatsData && newChatsData.isGroupChat,
          newChatsData && newChatsData.chatName,
        );
        setChatId(id);
      }

      sendTextMessage(
        id,
        userData,
        messageText,
        replyingTo && replyingTo.key,
        chatUsers,
      );
      setMessageText('');
      // setLocationMsg('');
      setReplyingTo(null);
    } catch (error) {
      console.log(error);
      setErrorBanner('Message failed to send');
      setTimeout(() => {
        setErrorBanner('');
      }, 3000);
    }
  }, [messageText, chatId]);

  const pickImg = async () => {
    try {
      setIsLoading(true);
      const tempUri = await LaunchImagePicker();
      if (!tempUri) return;

      setIsLoading(false);

      setTempImageUri(tempUri);
    } catch (error) {
      setIsLoading(false);
      console.log('Error during image upload:', error);
    }
  };

  const takePhotos = async () => {
    try {
      setIsLoading(true);
      const tempUri = await openCamera();
      if (!tempUri) return;

      setIsLoading(false);

      setTempImageUri(tempUri);
    } catch (error) {
      setIsLoading(false);
      console.log('Error during image upload:', error);
    }
  };

  const uploadImage = useCallback(async () => {
    try {
      setIsLoading(true);
      let id = chatId;
      if (!id) {
        id = await createChat(
          userData.userId,
          chatData.customUser,
          newChatsData && newChatsData.isGroupChat,
          newChatsData && newChatsData.chatName,
        );
        setChatId(id);
      }
      // console.log('tu', tempImageUri);
      const downloadURL = await uploadImageAsync(tempImageUri, true);
      // console.log('du', downloadURL);
      setTempImageUri(downloadURL);
      setIsLoading(false);
      sendImgMessage(
        id,
        userData,
        downloadURL,
        replyingTo && replyingTo.key,
        chatUsers,
      );
      setReplyingTo(null);
      setTempImageUri('');
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  }, [tempImageUri]);
  // console.log('te', chatMessages);
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={bgImage} style={styles.bgImg}>
        <PageContainer style={{backgroundColor: 'transparent'}}>
          {!chatId && <Bubble text={'hi... its a new chat'} type="system" />}
          {errorBanner !== '' && (
            <Bubble text={'Something Went Wrong...'} type="error" />
          )}
          {chatId && (
            <FlatList
              ref={ref => (flatList.current = ref)}
              onContentSizeChange={() =>
                flatList.current.scrollToEnd({animated: false})
              }
              onLayout={() => flatList.current.scrollToEnd({animated: false})}
              data={chatMessages}
              renderItem={itemData => {
                // console.log('eg', itemData.item);
                const message = itemData.item;
                const isOwnMessage = message.sentBy === userData.userId;
                // const messageType = isOwnMessage ? 'myMsg' : 'otherMsg';
                let messageType;
                if (message.type && message.type === 'info') {
                  messageType = 'info';
                } else if (isOwnMessage) {
                  messageType = 'myMsg';
                } else {
                  messageType = 'otherMsg';
                }
                const sender = message.sentBy && storedUsers[message.sentBy];
                const name = sender && `${sender.firstLast}`;

                const messageDate = new Date(message.sentAt);
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const isToday =
                  messageDate.toDateString() === today.toDateString();
                const isYesterday =
                  messageDate.toDateString() === yesterday.toDateString();
                const messageDateString = isToday
                  ? 'Today'
                  : isYesterday
                  ? 'Yesterday'
                  : messageDate.toLocaleDateString();

                // Update lastMessageDateString
                lastMessageDateString = messageDateString;

                const isDifferentDay =
                  !previousMessageDate ||
                  messageDate.toDateString() !==
                    previousMessageDate.toDateString();

                if (isDifferentDay) {
                  previousMessageDate = messageDate;
                }
                // console.log(lastMessageDateString);
                return (
                  <View style={{marginTop: 10}}>
                    {isDifferentDay && (
                      <Text style={styles.dateSeparator}>
                        <Bubble text={messageDateString} type="system" />
                      </Text>
                    )}
                    <Bubble
                      text={message.text}
                      type={messageType}
                      messageId={message.key}
                      chatId={chatId}
                      userId={userData.userId}
                      date={message.sentAt}
                      name={
                        !chatData.isGroupChat || isOwnMessage ? undefined : name
                      }
                      setReply={() => {
                        setReplyingTo(message);
                      }}
                      replyingTo={
                        message.replyTo &&
                        chatMessages.find(i => i.key === message.replyTo)
                      }
                      imageUrl={message.imageUrl}
                    />
                    {message.imageUrl && (
                      <Image
                        source={{uri: message.imageUrl}}
                        style={styles.messageImage}
                      />
                    )}
                  </View>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </PageContainer>
        {replyingTo && (
          <ReplyTo
            text={replyingTo.text}
            user={storedUsers[replyingTo.sentBy]}
            onCancel={() => {
              setReplyingTo(null);
            }}
          />
        )}
      </ImageBackground>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Pressable onPress={pickImg}>
            <Ionicons
              style={styles.inputIcon}
              name="add"
              color={Colors.blue}
              size={30}
            />
          </Pressable>
          <Pressable onPress={() => props.navigation.navigate('MapviewScreen')}>
            <Ionicons
              style={styles.inputIcon}
              name="location-outline"
              color={Colors.blue}
              size={30}
            />
          </Pressable>
          <TextInput
            style={styles.textInput}
            value={messageText}
            placeholder="Type a message..."
            placeholderTextColor={Colors.lightGrey}
            onChangeText={text => setMessageText(text)}
            onSubmitEditing={sendMessage}
            // multiline={true}
            autoCorrect={false}
            returnKeyType="send"
            // blurOnSubmit={false}
          />
        </View>
        {messageText == '' ? (
          <Pressable onPress={takePhotos}>
            <Ionicons
              style={styles.inputIcon}
              name="camera"
              color={Colors.blue}
              size={30}
            />
          </Pressable>
        ) : (
          <Pressable onPress={sendMessage}>
            <Ionicons
              style={{...styles.icons, ...styles.send}}
              name="send"
              color="white"
              size={24}
            />
          </Pressable>
        )}
        <AwesomeAlert
          show={tempImageUri !== ''}
          title="Send image?"
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={true}
          showConfirmButton={true}
          cancelText="Cancel"
          confirmText="Send"
          // showConfirmLoading={isSendingImage}
          confirmButtonColor={'green'}
          cancelButtonColor={'red'}
          titleStyle={{letterSpacing: 0.3, fontWeight: 'bold'}}
          onCancelPressed={() => setTempImageUri('')}
          onConfirmPressed={uploadImage}
          onDismiss={() => setTempImageUri('')}
          customView={
            <View>
              {isLoading && (
                <ActivityIndicator size="small" color={Colors.primary} />
              )}
              {!isLoading &&
                tempImageUri &&
                typeof tempImageUri === 'string' && (
                  <Image
                    source={{uri: tempImageUri}}
                    style={{width: 200, height: 200}}
                  />
                )}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  send: {
    backgroundColor: 'green',
    paddingVertical: 5,
    marginHorizontal: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  bgImg: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  text: {
    fontFamily: 'Roboto-Bold.ttf',
    fontSize: 24,
  },
  messageImage: {
    width: '60%',
    resizeMode: 'cover',
  },
  dateSeparator: {
    textAlign: 'center',
    paddingBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 25,
  },
  inputIcon: {
    paddingHorizontal: 8,
  },
  textInput: {
    flex: 1, 
    fontSize: 16,
    color: Colors.textColor,
    maxWidth: 200,
  },
});
export default ChatScreen;

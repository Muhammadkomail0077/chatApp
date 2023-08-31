import firebase from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import {addUserChats, deleteUserChats, getUserChats} from './userAction';
import {getUserPushTokens} from './authAction';

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
export const createChat = async (
  loggedInUserData,
  chatData,
  isGroupChat,
  chatName,
) => {
  try {
    const newChatData2 = {
      users: [...chatData],
      createdBy: loggedInUserData,
      updatedBy: loggedInUserData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isGroupChat: isGroupChat,
      chatName: chatName,
    };

    const newChat = await database().ref('chats').push();

    await newChat
      .set(newChatData2)
      .then(() => console.log('chat saved'))
      .catch(() => console.log('chat not saved.'));

    const chatUsers = newChatData2.users;

    for (let i = 0; i < chatUsers.length; i++) {
      const userId = chatUsers[i];
      console.log('chatuserid', userId);
      if (userId) {
        const userChat = await database().ref(`userChat/${userId}`).push();

        await userChat
          .set(newChat.key)
          .then(() => console.log('User Chat saved.'))
          .catch(() => console.log('User Chat not saved.'));
      }
    }
    return newChat.key;
  } catch (error) {
    throw error;
  }
};

export const sendTextMessage = async (
  chatId,
  senderData,
  messageText,
  replyTo,
  chatUsers,
) => {
  await sendMessage(
    chatId,
    senderData.userId,
    null,
    messageText,
    replyTo,
    null,
  );
  const otherUsers = chatUsers.filter(uid => uid !== senderData.userId);
  await sendPushNotificationForUsers(
    otherUsers,
    `${senderData.firstLast}`,
    messageText,
    chatId,
  );
};

export const sendImgMessage = async (
  chatId,
  senderData,
  imageUrl,
  replyTo,
  chatUsers,
) => {
  sendMessage(chatId, senderData.userId, imageUrl, 'Image', replyTo, null);
  const otherUsers = chatUsers.filter(uid => uid !== senderData.userId);
  await sendPushNotificationForUsers(
    otherUsers,
    `${senderData.firstLast}`,
    `${senderData.firstname} sends an image`,
    chatId,
  );
};

export const sendInfoMessage = async (chatId, senderId, messageText) => {
  sendMessage(chatId, senderId, null, messageText, null, 'info');
};

export const updateChatData = async (chatId, userId, chatData) => {
  const chatRef = database().ref(`chats/${chatId}`);
  await chatRef.update({
    ...chatData,
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
  });
};

const sendMessage = async (
  chatId,
  senderId,
  imageUrl,
  messageText,
  replyTo,
  type,
) => {
  const messageRef = database().ref(`messages/${chatId}`);
  const messageData = {
    sentBy: senderId,
    sentAt: new Date().toISOString(),
    text: messageText,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
  };
  if (replyTo) {
    messageData.replyTo = replyTo;
  }
  if (imageUrl) {
    messageData.imageUrl = imageUrl;
  }
  if (type) {
    messageData.type = type;
  }
  await messageRef.push(messageData);

  const chatRef = database().ref(`chats/${chatId}`);
  await chatRef.update({
    updatedBy: senderId,
    updatedAt: new Date().toISOString(),
    latestMessage: messageText,
  });
};

export const starMessages = async (messageId, chatId, userId) => {
  try {
    const childRef = database().ref(
      `userStarredMessages/${userId}/${chatId}/${messageId}`,
    );
    const snapshot = await childRef.once('value');
    if (snapshot.exists()) {
      // starred item exist - unstar
      await childRef.remove();
    } else {
      // starred item does not exist - star
      const starredMessageData = {
        messageId,
        chatId,
        starredAt: new Date().toISOString(),
      };
      await childRef.set(starredMessageData);
    }
  } catch (error) {
    console.log(error);
  }
};

export const RemoveUserFromChat = async (
  userLoggedInData,
  userToRemoveData,
  chatData,
) => {
  const userToRemoveId = userToRemoveData.userId;
  const newUsers = chatData.users.filter(uid => uid !== userToRemoveId);
  await updateChatData(chatData.key, userLoggedInData.userId, {
    users: newUsers,
  });

  const userChats = await getUserChats(userToRemoveId);
  for (const key in userChats) {
    const currentChatId = userChats[key];
    if (currentChatId === chatData.key) {
      await deleteUserChats(userToRemoveId, key);
      break;
    }
  }
  const messageText =
    userLoggedInData.userId === userToRemoveData.userId
      ? `${userLoggedInData.firstname} left group`
      : `${userLoggedInData.firstname} removed ${userToRemoveData.firstname} from group`;
  sendInfoMessage(chatData.key, userLoggedInData.userId, messageText);
};

export const addUsersToChat = async (
  userLoggedInData,
  userToAddData,
  chatData,
) => {
  const existingUsers = Object.values(chatData.users);
  const newUsers = [];
  let userAddedName;
  userToAddData.forEach(async userToAdd => {
    const userToAddId = userToAdd.userId;
    if (existingUsers.includes(userToAddId)) return;
    newUsers.push(userToAddId);
    await addUserChats(userToAddId, chatData.key);
    userAddedName = `${userToAdd.firstLast}`;
  });
  if (newUsers.length === 0) return;
  await updateChatData(chatData.key, userLoggedInData.userId, {
    users: existingUsers.concat(newUsers),
  });
  const moreUserMessage =
    newUsers.length > 1 ? `and ${newUsers.length - 1} others ` : '';
  const messageText = `${userLoggedInData.firstLast} added ${userAddedName} ${moreUserMessage}to group`;
  await sendInfoMessage(chatData.key, userLoggedInData.userId, messageText);
};

const sendPushNotificationForUsers = async (chatUsers, title, body, chatId) => {
  chatUsers.forEach(async uid => {
    console.log('test');
    const tokens = await getUserPushTokens(uid);
    // console.log("test2");

    for (const key in tokens) {
      const token = tokens[key];
      // console.log("test3");

      await fetch(
        'https://fcm.googleapis.com/v1/projects/myproject-b5ae1/messages:send',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: token,
            title,
            body,
            data: {chatId},
          }),
        },
      );
    }
    // console.log("test3");
  });
};

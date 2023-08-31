import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import {useDispatch, useSelector} from 'react-redux';
import DataItem from '../components/DataItem';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import {setChatsId} from '../Store/chatIdSlice';
import Colors from '../constants/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const ChatList = props => {
  const dispatch = useDispatch();
  const selectedUser = props.route?.params?.selectedUserId;
  const selectedUserList = props.route?.params?.selectedUsers;
  // console.log('userlist', selectedUser);
  const chatName = props.route?.params?.chatName;
  // console.log('name...', chatName);
  const userData = useSelector(state => state.auth.userData);
  const storedUsers = useSelector(state => state.users.storedUsers);
  // console.log('storedUsers', storedUsers);
  const userChats = useSelector(state => state.chats.chatsData);
  // const isGroupChat = selectedUserList !== undefined;
  // console.log('userChat:', userChats);

  const formatamPm = dateString => {
    const date = new Date(dateString);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
  };

  useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item
              title="New Chat"
              iconName="create-outline"
              onPress={() => props.navigation.navigate('NewChat')}
            />
          </HeaderButtons>
        );
      },
    });
  }, []);

  useEffect(() => {
    if (!selectedUser && !selectedUserList) {
      return;
    }
    let chatData;
    let navigationProps;
    if (selectedUser) {
      // console.log('selectedusers', selectedUser);
      const userArray = Object.values(userChats);
      // console.log('userArrays', userArray);
      chatData = userArray.find(
        cd => !cd.isGroupChat && cd.users.includes(selectedUser),
      );
      // console.log('chatdata', chatData);
    }

    if (chatData) {
      navigationProps = {chatId: chatData.key};
    } else {
      const chatUsers = selectedUserList || [selectedUser];
      if (!chatUsers.includes(userData.userId)) {
        chatUsers.push(userData.userId);
      }
      navigationProps = {
        newChatData: {
          users: chatUsers,
          isGroupChat: selectedUserList !== undefined,
          chatName,
        },
      };
    }
    props.navigation.navigate('ChatScreen', navigationProps);
  }, [props.route?.params]);

  return (
    <PageContainer>
      <PageTitle text="Chats" />
      <View>
        <TouchableOpacity
          onPress={() =>
            props.navigation.navigate('NewChat', {isGroupChat: true})
          }>
          <Text style={styles.newGroupText}>New Group</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={Object.values(userChats)}
        renderItem={itemData => {
          const chatData = itemData.item;
          const chatId = chatData.key;
          const isGroupChat = chatData.isGroupChat;
          let title = '';
          const subTitle = chatData.latestMessage || 'New Chat...';
          const time = formatamPm(chatData.updatedAt)
          // console.log('chatData', chatData.updatedAt);
          // console.log('is', subTitle);
          let image = '';

          if (isGroupChat) {
            title = chatData.chatName;
            image = chatData.chatImage;
          } else {
            const otherUserId = chatData.users.find(
              uid => uid !== userData.userId,
            );
            const otherUser = storedUsers[otherUserId];

            if (!otherUser) return;

            title = `${otherUser.firstLast}`;
            image = otherUser.profilePic;
          }

          return (
            <DataItem
              title={title}
              subTitle={subTitle}
              image={image}
              time={time}
              onPress={() => props.navigation.navigate('ChatScreen', {chatId})}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </PageContainer>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Roboto-Bold.ttf',
    fontSize: 24,
  },
  newGroupText: {
    color: '#0096c7',
    fontSize: 18,
    marginVertical: 3,
  },
});

export default ChatList;

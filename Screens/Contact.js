import React, {useCallback, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import Colors from '../constants/Colors';
import PageContainer from '../components/PageContainer';
import ProfileImage from '../components/ProfileImage';
import PageTitle from '../components/PageTitle';
import {useEffect} from 'react';
import {getUserChats} from '../utils/Actions/userAction';
import DataItem from '../components/DataItem';
import Button from '../components/Button';
import {RemoveUserFromChat} from '../utils/Actions/chatActions';

const Contact = props => {
  const [isLoading, setIsLoading] = useState(false);
  const storedUsers = useSelector(state => state.users.storedUsers);
  const userData = useSelector(state => state.auth.userData);
  const uid = props.route.params.uid;
  const currentUser = storedUsers[uid];
  const storedChats = useSelector(state => state.chats.chatsData);
  const [commonChats, setCommonChats] = useState([]);
  const chatId = props.route.params.chatId;
  const chatData = chatId && storedChats[chatId];
  // console.log('currentUser',commonChats);

  useEffect(() => {
    const getCommonUserChats = async () => {
      const currentUserChats = await getUserChats(currentUser.userId);
      setCommonChats(
        Object.values(currentUserChats).filter(
          cid => storedChats[cid] && storedChats[cid].isGroupChat,
        ),
      );
    };

    getCommonUserChats();
  }, []);

  const removeFromChat = useCallback(async () => {
    try {
      setIsLoading(true);
      RemoveUserFromChat(userData, currentUser, chatData);
      props.navigation.goBack();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [props.navigation, isLoading]);

  return (
    <PageContainer>
      <View style={styles.topContainer}>
        <ProfileImage
          uri={currentUser.profilePic}
          size={80}
          style={{marginBottom: 5}}
        />

        <PageTitle text={`${currentUser.firstLast}`} />
        {currentUser.about && (
          <Text style={styles.about} numberOfLines={2}>
            {currentUser.about}
          </Text>
        )}
      </View>
      {commonChats.length > 0 && (
        <>
          <Text style={styles.heading}>
            {commonChats.length}{' '}
            {commonChats.length === 1 ? 'Group ' : 'Groups '}
            in Common
          </Text>
          {commonChats.map(cid => {
            // console.log(storedChats[cid]);
            const chatData = storedChats[cid];
            // console.log('chatData',chatData);
            return (
              <DataItem
                key={cid}
                title={chatData.chatName}
                subTitle={chatData.latestMessage}
                type={'link'}
                onPress={() =>
                  props.navigation.push('ChatScreen', {chatId: cid})
                }
                image={chatData.chatImage}
              />
            );
          })}
        </>
      )}
      {chatData &&
        chatData.isGroupChat &&
        (isLoading ? (
          <ActivityIndicator
            size={'small'}
            color={Colors.primary}
            style={{marginTop: 22}}
          />
        ) : (
          <Button
            label="Remove From Chat"
            color={Colors.red}
            onPress={removeFromChat}
          />
        ))}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  about: {
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.3,
    color: Colors.grey,
  },
  heading: {
    fontWeight: 'bold',
    letterSpacing: 0.3,
    color: Colors.textColor,
    marginTop: 8,
    marginVertical: 4,
  },
});

export default Contact;

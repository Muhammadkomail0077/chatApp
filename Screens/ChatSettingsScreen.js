import React, {useReducer, useCallback, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useSelector} from 'react-redux';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import ProfileImage from '../components/ProfileImage';
import Colors from '../constants/Colors';
import Input from '../components/Input';
import {reducer} from '../utils/Reducer/formReducer';
import {
  RemoveUserFromChat,
  addUsersToChat,
  updateChatData,
} from '../utils/Actions/chatActions';
import Button from '../components/Button';
import {validateInput} from '../utils/Actions/formAction';
import DataItem from '../components/DataItem';

const ChatSettingsScreen = props => {
  const chatId = props.route.params.chatId;
  const chatData = useSelector(state => state.chats.chatsData[chatId]) || {};
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const userData = useSelector(state => state.auth.userData);
  const storedUsers = useSelector(state => state.users.storedUsers);
  const selectedUsers = props.route.params && props.route.params.selectedUsers;
  const starredMessages = useSelector(state => state.messages.starredMessages);
  // console.log(chatData);

  const initialState = {
    inputValues: {
      chatName: chatData.chatName,
    },
    inputValidities: {
      chatName: undefined,
    },
    formIsValid: false,
  };

  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const inputChangeHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({inputId, validationResult: result, inputValue});
    },
    [dispatchFormState],
  );

  useEffect(() => {
    if (!selectedUsers) return;
    const selectedUserData = [];
    selectedUsers.forEach(uid => {
      if (uid === userData.userId) return;
      if (!storedUsers[uid]) {
        console.log('no user data found in data store');
        return;
      }
      selectedUserData.push(storedUsers[uid]);
    });
    // console.log(selectedUserData);
    addUsersToChat(userData, selectedUserData, chatData);
  }, [selectedUsers]);

  const saveHandler = useCallback(async () => {
    const updateUserData = formState.inputValues;
    try {
      setIsLoading(true);
      await updateChatData(chatId, userData.userId, updateUserData);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
      }, 3000);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [formState]);

  const hasChanges = () => {
    const currrentValues = formState.inputValues;
    return currrentValues.chatName != chatData.chatName;
  };

  const leaveGroup = useCallback(async () => {
    try {
      setIsLoading(true);
      RemoveUserFromChat(userData, userData, chatData);
      props.navigation.popToTop();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [props.navigation, isLoading]);

  if (!chatData.users) return null;

  return (
    <PageContainer>
      <PageTitle text="Chat Settings" />

      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <ProfileImage
          size={80}
          showEditIcon={true}
          chatId={chatId}
          userId={userData.userId}
          uri={chatData.chatImage}
        />
        <Input
          id="chatName"
          label="Chat Name"
          autoCapitalize="none"
          initialValue={chatData.chatName}
          allowEmpty={false}
          onInputChange={inputChangeHandler}
          errorText={formState.inputValidities['chatName']}
        />

        {successMsg && <Text style={styles.text}>Saved!</Text>}

        {isLoading ? (
          <ActivityIndicator
            size={'small'}
            color={Colors.primary}
            style={{marginTop: 22}}
          />
        ) : (
          hasChanges && (
            <Button
              // style={{flex: 1, }}
              disabled={!formState.formIsValid}
              label="Save changes"
              onPress={saveHandler}
            />
          )
        )}

        <View style={styles.sectionContainer}>
          <Text style={styles.heading}>
            {chatData.users.length} Participants
          </Text>
          <DataItem
            title="Add Users"
            icon={'plus'}
            type="button"
            onPress={() => {
              props.navigation.navigate('NewChat', {
                isGroupChat: true,
                existingUsers: chatData.users,
                chatId,
              });
            }}
          />
          {chatData.users.slice(0, 3).map(uid => {
            const currentUsers = storedUsers[uid];
            return (
              <DataItem
                key={uid}
                title={`${currentUsers.firstLast}`}
                subTitle={currentUsers.about}
                image={currentUsers.profilePic}
                type={uid !== userData.userId && 'link'}
                onPress={() => {
                  uid !== userData.userId &&
                    props.navigation.navigate('Contact', {uid, chatId});
                }}
              />
            );
          })}
          {chatData.users.length > 4 && (
            <DataItem
              title="View All"
              type="link"
              hideImage={true}
              onPress={() =>
                // console.log('lo', chatData.users, chatId);
                props.navigation.navigate('DataList', {
                  title: 'Participants',
                  data: chatData.users,
                  chatId,
                  type: 'users',
                })
              }
            />
          )}
        </View>
        <DataItem
          title="Starred Messages"
          type="link"
          hideImage={true}
          onPress={() =>
            props.navigation.navigate('DataList', {
              title: 'Starred Messages',
              data: Object.values(starredMessages),
              type: 'messages',
            })
          }
        />
      </ScrollView>
      {<Button label="Leave" color={Colors.red} onPress={() => leaveGroup()} />}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.textColor,
    letterSpacing: 0.3,
    fontWeight: 'bold',
    marginTop: 5,
  },
  sectionContainer: {
    width: '100%',
    marginTop: 2,
  },
  heading: {
    marginVertical: 8,
    color: Colors.textColor,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});

export default ChatSettingsScreen;

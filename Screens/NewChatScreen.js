import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import PageContainer from '../components/PageContainer';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {searchUsers} from '../utils/Actions/userAction';
import DataItem from './../components/DataItem';
import {useDispatch, useSelector} from 'react-redux';
import {setStoredUsers} from '../Store/userSlice';
import Colors from '../constants/Colors';
import ProfileImage from '../components/ProfileImage';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

const NewChatScreen = props => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState();
  const [noResultFound, setNoResultFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatName, setChatName] = useState('');
  const selectedUserFlatlist = useRef();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const userData = useSelector(state => state.auth.userData);
  const storedUsers = useSelector(state => state.users.storedUsers);
  const isGroupChat = props.route.params && props.route.params.isGroupChat;
  const existingUsers = props.route.params && props.route.params.existingUsers;
  const chatId = props.route.params && props.route.params.chatId;
  const [storeUsers, setStoreUsers] = useState({});
  const isNewGroup = !chatId;
  const isGroupChatDisabled =
    selectedUsers.length === 0 || (isNewGroup && chatName === '');

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

  // console.log('st', storeUsers);
  useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item title="Close" onPress={() => props.navigation.goBack()} />
          </HeaderButtons>
        );
      },
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            {isGroupChat && (
              <Item
                title={isNewGroup ? 'Create' : 'Add'}
                onPress={() => {
                  const screenName = isNewGroup ? 'Home' : 'ChatSettings';
                  props.navigation.navigate(screenName, {
                    selectedUsers,
                    chatName,
                    chatId,
                  });
                }}
                disabled={isGroupChatDisabled}
                color={isGroupChatDisabled ? Colors.lightGrey : undefined}
              />
            )}
          </HeaderButtons>
        );
      },
      headerTitle: isGroupChat ? 'Add participants' : 'New Chat',
    });
  }, [chatName, selectedUsers]);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (!searchTerm || searchTerm === '') {
        setUsers();
        setNoResultFound(false);
        return;
      }
      setIsLoading(true);

      const userResults = await searchUsers(searchTerm);
      delete userResults[userData.userId];
      setUsers(userResults);
      if (Object.keys(userResults).length === 0) {
        setNoResultFound(true);
      } else {
        setNoResultFound(false);
        dispatch(setStoredUsers({newUsers: userResults}));
      }
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  useEffect(() => {
    const storedUserRef = database().ref('users');
    storedUserRef.once('value', async snapshot => {
      const userData = snapshot.val();
      setStoreUsers(userData);
    });
  }, []);

  const userPressed = userId => {
    // console.log(userId);
    if (isGroupChat) {
      const newSelectedUsers = selectedUsers.includes(userId)
        ? selectedUsers.filter(id => id !== userId)
        : selectedUsers.concat(userId);
      setSelectedUsers(newSelectedUsers);
    } else {
      props.navigation.navigate('Home', {
        selectedUserId: userId,
      });
    }
  };

  const sortedUsers = Object.values(storeUsers).sort((a, b) => {
    // Compare users by their full names (you might need to adjust this depending on your data structure)
    const fullNameA = `${a.firstname} ${a.lastname}`.toLowerCase();
    const fullNameB = `${b.firstname} ${b.lastname}`.toLowerCase();
    return fullNameA.localeCompare(fullNameB);
  });

  return (
    <PageContainer>
      {isNewGroup && isGroupChat && (
        <View style={styles.chatNameContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textbox}
              placeholder="Enter a name for your group"
              placeholderTextColor={Colors.lightGrey}
              autoCorrect={false}
              autoComplete={'off'}
              onChangeText={text => setChatName(text)}
            />
          </View>
        </View>
      )}

      {isGroupChat && (
        <View style={styles.selectedUsersContainer}>
          <FlatList
            style={styles.selectedUsersList}
            data={selectedUsers}
            horizontal={true}
            keyExtractor={item => item}
            contentContainerStyle={{alignItems: 'center'}}
            ref={ref => (selectedUserFlatlist.current = ref)}
            onContentSizeChange={() =>
              selectedUserFlatlist.current.scrollToEnd()
            }
            renderItem={itemData => {
              const userId = itemData.item;
              const userData = storedUsers[userId];
              return (
                <ProfileImage
                  style={styles.selectedUserStyle}
                  size={40}
                  uri={userData.profilePic}
                  onPress={() => userPressed(userId)}
                  showRemoveIcon={true}
                />
              );
            }}
          />
        </View>
      )}

      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color={Colors.grey} />
        <TextInput
          placeholder="Search"
          placeholderTextColor={Colors.lightGrey}
          style={styles.searchBox}
          onChangeText={text => setSearchTerm(text)}
        />
      </View>

      {isLoading && (
        <View style={styles.commonStyle}>
          <ActivityIndicator size={'large'} color={'blue'} />
        </View>
      )}

      {!isLoading && !noResultFound && users && (
        <FlatList
          data={Object.keys(users)}
          renderItem={itemData => {
            const userId = itemData.item;
            const userData = users[userId];
            if (existingUsers && existingUsers.includes(userId)) return;
            return (
              <DataItem
                title={`${userData.firstname} ${userData.lastname}`}
                subTitle={userData.about}
                image={userData.profilePic}
                onPress={() => userPressed(userData.userId)}
                type={isGroupChat ? 'checkbox' : ''}
                isChecked={selectedUsers.includes(userId)}
              />
            );
          }}
        />
      )}

      {!isLoading && noResultFound && (
        <View style={styles.commonStyle}>
          <FontAwesome name="question" size={60} color={'grey'} />
          <Text style={styles.commonText}>No Users Found</Text>
        </View>
      )}

      {!isLoading && !users && storedUsers === undefined && (
        <View style={styles.commonStyle}>
          <FontAwesome
            name="users"
            size={60}
            color={'grey'}
            style={styles.iconStyle}
          />
          <Text style={styles.commonText}>
            Enter a name to search for a user
          </Text>
        </View>
      )}

      {!isLoading && !users && storedUsers && !isGroupChat && (
        <FlatList
          data={Object.values(sortedUsers)}
          keyExtractor={item => item.userId}
          renderItem={itemData => {
            const storeUser = itemData.item;
            if (storeUser.userId === userData.userId) return;

            return (
              <DataItem
                title={`${storeUser.firstLast}`}
                subTitle={storeUser.about}
                image={storeUser.profilePic}
                onPress={() => userPressed(storeUser.userId)}
              />
            );
          }}
        />
      )}
    </PageContainer>
  );
};
const styles = StyleSheet.create({
  searchBox: {
    marginLeft: 6,
    fontSize: 20,
    width: '100%',
    color: Colors.grey,
  },
  searchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.nearlyWhite,
    height: 50,
    paddingVertical: 2,
    paddingHorizontal: 12,
    marginVertical: 12,
    borderRadius: 5,
  },
  commonStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStyle: {
    marginBottom: 20,
  },
  commonText: {
    letterSpacing: 0.9,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.grey,
  },
  chatNameContainer: {
    paddingVertical: 10,
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: Colors.nearlyWhite,
    flexDirection: 'row',
    borderRadius: 2,
    color: Colors.textColor,
  },
  textbox: {
    color: Colors.textColor,
    width: '100%',
    letterSpacing: 0.3,
    fontSize: 15,
  },
  selectedUsersContainer: {
    height: 60,
    justifyContent: 'center',
  },
  selectedUsersList: {
    height: '100%',
  },
  selectedUserStyle: {
    marginRight: 10,
    marginBottom: 10,
  },
});

export default NewChatScreen;

import React, {useReducer, useCallback, useState, useMemo} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import Input from '../components/Input';
import {FontAwesome} from 'react-native-vector-icons/FontAwesome';
import {validateInput} from '../utils/Actions/formAction';
import {reducer} from '../utils/Reducer/formReducer';
import {useSelector, useDispatch} from 'react-redux';
import Button from '../components/Button';
import {updateSignedInUserData, userLogout} from '../utils/Actions/authAction';
import {updateLoggedInUserData} from '../Store/authSlice';
import ProfileImage from '../components/ProfileImage';
import DataItem from '../components/DataItem';

const Setting = props => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const userData = useSelector(state => state.auth.userData);
  const starredMessages = useSelector(
    state => state.messages.starredMessages ?? {},
  );
  // console.log('chats', Object.values(Object.keys(starredMessages)));
  const starredMessagesKeys = Object.values(Object.keys(starredMessages));

  const firstname = userData.firstname || '';
  const lastname = userData.lastname || '';
  const email = userData.email || '';
  const about = userData.about || '';

  const sortedStarredMessages = useMemo(() => {
    let result = [];

    const chats = Object.values(starredMessages);
    chats.forEach(chat => {
      result = result.concat(chat);
    });
    return result;
  }, [starredMessages]);
  // console.log('chatmsg', sortedStarredMessages);

  const initialState = {
    inputValues: {
      firstname,
      lastname,
      email,
      about,
    },
    inputValidities: {
      firstname: undefined,
      lastname: undefined,
      email: undefined,
      about: undefined,
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

  const saveHandler = useCallback(async () => {
    const updateUserData = formState.inputValues;
    try {
      setIsLoading(true);
      updateSignedInUserData(userData.userId, updateUserData);
      dispatch(updateLoggedInUserData({newData: updateUserData}));
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
      }, 3000);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [formState, dispatch]);

  const hasChanges = () => {
    const currrentValues = formState.inputValues;
    return (
      currrentValues.firstname != firstname ||
      currrentValues.lastname != lastname ||
      currrentValues.email != email ||
      currrentValues.about != about
    );
  };

  return (
    <PageContainer>
      <PageTitle text="Setting" style={{marginTop:25}} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContainer}>
        <ProfileImage
          size={100}
          userId={userData.userId}
          uri={userData.profilePic}
          showEditIcon={true}
        />
        <Input
          label="First Name"
          icon="user-o"
          iconPack={FontAwesome}
          id="firstname"
          onInputChange={inputChangeHandler}
          autoCapitalize="none"
          errorText={formState.inputValidities['firstname']}
          initialValue={userData.firstname}
        />
        <Input
          label="Last Name"
          icon="user-o"
          iconPack={FontAwesome}
          id="lastname"
          onInputChange={inputChangeHandler}
          autoCapitalize="none"
          errorText={formState.inputValidities['lastname']}
          initialValue={userData.lastname}
        />
        <Input
          label="Email"
          icon="user-o"
          iconPack={FontAwesome}
          id="email"
          onInputChange={inputChangeHandler}
          keyboardType="email-address"
          autoCapitalize="none"
          errorText={formState.inputValidities['email']}
          initialValue={userData.email}
        />
        <Input
          label="About"
          icon="lock"
          iconPack={FontAwesome}
          id="about"
          onInputChange={inputChangeHandler}
          autoCapitalize="none"
          errorText={formState.inputValidities['about']}
          initialValue={userData.about}
        />

        <View style={{marginTop: 20}}>
          {successMsg ? <Text>Saved!</Text> : ''}

          {isLoading ? (
            <ActivityIndicator
              color={'#3498db'}
              size={25}
              style={{marginVertical: 20}}
            />
          ) : (
            hasChanges() && (
              <Button
                disabled={!formState.formIsValid}
                label="Save"
                onPress={saveHandler}
                color={'#5fad56'}
                style={{marginTop: 50}}
              />
            )
          )}
        </View>
        <DataItem
          title="Starred Messages"
          type="link"
          hideImage={true}
          onPress={() =>
            props.navigation.navigate('DataList', {
              title: 'Starred Messages',
              data: sortedStarredMessages,
              type: 'messages',
            })
          }
        />
        <Button
          label="Logout"
          onPress={() => dispatch(userLogout(userData))}
          color={'red'}
        />
      </ScrollView>
    </PageContainer>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Roboto-Bold.ttf',
    fontSize: 24,
  },
});

export default Setting;

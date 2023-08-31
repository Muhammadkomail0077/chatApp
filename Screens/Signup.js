import React, {useCallback, useState, useReducer, useEffect} from 'react';
import Input from '../components/Input';
import {FontAwesome} from 'react-native-vector-icons/FontAwesome';
import Button from '../components/Button';
import {validateInput} from '../utils/Actions/formAction';
import {reducer} from '../utils/Reducer/formReducer';
import {SignUp} from '../utils/Actions/authAction';
import {ActivityIndicator, Alert, StyleSheet, View} from 'react-native';
import {useDispatch} from 'react-redux';
import PageContainer from '../components/PageContainer';

const initialState = {
  inputValues: {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
  },
  inputValidities: {
    firstname: false,
    lastname: false,
    email: false,
    password: false,
  },
  formIsValid: false,
};

const Signup = props => {
  const dispatch = useDispatch();
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const inputChangeHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({inputId, validationResult: result, inputValue});
    },
    [dispatchFormState],
  );

  useEffect(() => {
    if (error) {
      Alert.alert('An Error Occured', error, [{text: 'okay'}]);
    }
  }, [error]);

  const authHandler = useCallback(async () => {
    try {
      setIsLoading(true);
      const action = SignUp(
        formState.inputValues.firstname,
        formState.inputValues.lastname,
        formState.inputValues.email,
        formState.inputValues.password,
      );
      await dispatch(action);
      setError(null);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }, [dispatch, formState]);

  return (
    <View style={styles.container}>
      <Input
        label="First Name"
        icon="user-o"
        iconPack={FontAwesome}
        id="firstname"
        onInputChange={inputChangeHandler}
        autoCapitalize="none"
        errorText={formState.inputValidities['firstname']}
      />
      <Input
        label="Last Name"
        icon="user-o"
        iconPack={FontAwesome}
        id="lastname"
        onInputChange={inputChangeHandler}
        autoCapitalize="none"
        errorText={formState.inputValidities['lastname']}
      />
      <Input
        label="Email"
        icon="envelope-o"
        iconPack={FontAwesome}
        id="email"
        onInputChange={inputChangeHandler}
        keyboardType="email-address"
        autoCapitalize="none"
        errorText={formState.inputValidities['email']}
      />
      <Input
        label="Password"
        icon="lock"
        iconPack={FontAwesome}
        id="password"
        onInputChange={inputChangeHandler}
        secureTextEntry
        autoCapitalize="none"
        errorText={formState.inputValidities['password']}
      />
      {isLoading ? (
        <ActivityIndicator
          color={'#3498db'}
          size={25}
          style={{marginVertical: 20}}
        />
      ) : (
        <Button
          disabled={!formState.formIsValid}
          label="SignUp"
          onPress={authHandler}
          color={'#5fad56'}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
})

export default Signup;

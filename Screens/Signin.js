import React, {useCallback, useReducer, useState, useEffect} from 'react';
import Input from '../components/Input';
import {FontAwesome} from 'react-native-vector-icons/FontAwesome';
import Button from '../components/Button';
import {validateInput} from '../utils/Actions/formAction';
import {reducer} from '../utils/Reducer/formReducer';
import {SignIn} from '../utils/Actions/authAction';
import {useDispatch} from 'react-redux';
import {
  ActivityIndicator,
  Alert,
  View,
  StyleSheet,
} from 'react-native';

const isTestMode = true;

const initialState = {
  inputValues: {
    email: isTestMode ? 'samreen@gmail.com' : '',
    password: isTestMode ? '123456' : '',
  },
  inputValidities: {
    email: isTestMode,
    password: isTestMode,
  },
  formIsValid: isTestMode,
};

const Signin = () => {
  const dispatch = useDispatch();
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
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
      const action = SignIn(
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
          label="Email"
          icon="envelope-o"
          iconPack={FontAwesome}
          id="email"
          onInputChange={inputChangeHandler}
          value={formState.inputValues.email}
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
          value={formState.inputValues.password}
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
            label="Login"
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
 
});

export default Signin;

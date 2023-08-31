import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Input = props => {
  const [value, setValue] = useState(props.initialValue);
  
  const onChangeText = text => {
    setValue(text);
    props.onInputChange(props.id, text);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{props.label}</Text>
      <View style={styles.inputContainer}>
        <FontAwesome
          style={styles.icons}
          name={props.icon}
          color={props.color ? props.color : 'grey'}
          size={props.size ? props.size : 27}
        />
        <TextInput
          {...props}
          style={styles.textInput}
          onChangeText={onChangeText}
          value={value}
        />
      </View>
      {props.errorText && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{props.errorText[0]}</Text>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  errorContainer: {
    marginVertical: 2,
    marginHorizontal: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  label: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 18,
    letterSpacing: 0.3,
    marginTop: 6,
  },
  container: {
    width: '100%',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: '#e5e5e5',
    paddingHorizontal: 10,
    borderRadius: 2,
    flexDirection: 'row',
  },
  icons: {
    marginTop: 8,
    marginHorizontal: 5,
  },
  textInput: {
    letterSpacing: 0.3,
    color: 'black',
    paddingHorizontal: 6,
    flex: 1,
    fontSize: 16,
  },
});

export default Input;

import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const Button = props => {
  return (
    <TouchableOpacity
      onPress={props.disabled ? () => {} : props.onPress}
      style={{
        ...props.style,
        ...styles.btn,
        ...{backgroundColor: props.disabled ? 'lightgrey' : props.color},
      }}>
      <Text
        style={{
          ...styles.btnText,
          ...{color: props.disabled ? 'grey' : 'white'},
        }}>
        {props.label}
      </Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    justifyContent: 'center',
    // textAlign:'center',
    // flex:1,
    // alignItems: 'center',
    borderRadius: 8,
    marginVertical: 10,
  },
  btnText: {
    textAlign:'center',
    // width:70,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});
export default Button;

import {View, Text, StyleSheet} from 'react-native';

const PageTitle = props => {
  return (
    <View style={props.style}>
      <Text style={styles.text}>{props.text}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
  },
  text: {
    marginTop: 2,
    marginBottom:4,  
    fontSize: 28,
    letterSpacing: 0.3,
    fontWeight: 'bold',
    color: 'black',
  },
});
export default PageTitle;

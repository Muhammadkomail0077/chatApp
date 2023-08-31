import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Colors from '../constants/Colors';

const ReplyTo = props => {
  const {text, user, onCancel} = props;
  const name = `${user.firstLast}`;

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        <Text numberOfLines={1} style={{color:Colors.grey}}>{text}</Text>
      </View>
      <TouchableOpacity onPress={onCancel} style={{marginRight:10, paddingBottom:12}}>
        <AntDesign name="close" size={16} color={Colors.blue} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor:Colors.lightGrey,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftColor: Colors.blue,
    borderLeftWidth: 8,
    borderTopLeftRadius:12,
    borderBottomLeftRadius:12

  },
  textContainer: {
    flex: 1,
    marginRight: 5,
  },
  name: {
    color: Colors.blue,
    letterSpacing: 0.3,
  },
});

export default ReplyTo;

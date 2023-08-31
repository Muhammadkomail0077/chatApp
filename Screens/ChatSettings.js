import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const ChatSetting = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Chat Setting</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Roboto-Bold.ttf',
    fontSize: 24,
  },
});

export default ChatSetting;

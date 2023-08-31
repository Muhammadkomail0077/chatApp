import React from 'react';
import { Text, StyleSheet, View, Image } from 'react-native';
import Colors from '../constants/Colors';
import noInternetImage from '../Assets/Images/NoInternet.png';

const NoInternetScreen = () => {
  return (
    <View style={styles.container}>
      {/* <Image source={noInternetImage} style={styles.image} resizeMode="contain" /> */}
      <Text style={styles.message}>Oops! No Internet Connection</Text>
      <Text style={styles.subMessage}>Please check your connection and try again.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.beige,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
    backgroundColor:Colors.beige
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.red,
    marginBottom: 10,
  },
  subMessage: {
    fontSize: 16,
    color: Colors.textColor,
  },
});

export default NoInternetScreen;

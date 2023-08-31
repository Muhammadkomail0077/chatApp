import React, {useState} from 'react';
import PageContainer from '../components/PageContainer';
import {SafeAreaView} from 'react-native-safe-area-context';
import Signin from './Signin';
import Signup from './Signup';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import logo from '../Assets/Images/logo.png';
import bgImage from '../Assets/Images/backgroundImage.jpg';

const AuthScreen = () => {
  const [isSignup, setIsSignup] = useState(false);
  return (
    <View style={styles.container}>
      <ImageBackground source={bgImage} style={styles.backgroundImage}>
        {/* <SafeAreaView style={{flex: 1}}> */}
        {/* <PageContainer> */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <KeyboardAvoidingView
            style={styles.KeyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'height' : undefined}
            keyboardVerticalOffset={100}>
            <View style={styles.imageContainer}>
              <Image
                style={styles.img}
                resizeMode="contain"
                source={logo}></Image>
            </View>
            <View style={styles.inputContainer}>
              {isSignup ? <Signin /> : <Signup />}
            </View>
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => setIsSignup(isSignup => !isSignup)}>
              <Text style={styles.linkText}>{`Already ${
                !isSignup ? 'Sign In ?' : 'Sign Up ?'
              }`}</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </ScrollView>
        {/* </PageContainer> */}
        {/* </SafeAreaView> */}
      </ImageBackground>
    </View>
  );
};

const window = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  KeyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    paddingHorizontal: 20,
  },
  img: {
    width: '56%',
  },
  imageContainer: {
    // flex:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    color: '#3498db',
    letterSpacing: 0.3,
  },
  linkBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: window.width,
    height: window.height,
    resizeMode: 'cover',
  },
});

export default AuthScreen;

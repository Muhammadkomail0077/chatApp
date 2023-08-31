import React, {useState} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import userImage from '../Assets/Images/userImage.jpeg';
import Icon from 'react-native-vector-icons/FontAwesome';
import {LaunchImagePicker} from '../utils/LaunchImagePicker';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import RNFetchBlob from 'rn-fetch-blob';
import {updateSignedInUserData} from '../utils/Actions/authAction';
import {updateLoggedInUserData} from '../Store/authSlice';
// import ImagePicker from 'react-native-image-crop-picker';
import {useDispatch} from 'react-redux';
import Colors from '../constants/Colors';
import {updateChatData} from '../utils/Actions/chatActions';

const ProfileImage = props => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const source = props.uri ? {uri: props.uri} : userImage;
  const [img, setImg] = useState(source);
  const [imageUrl, setImageUrl] = useState(props.uri);
  const userId = props.userId;
  const chatId = props.chatId;
  const showEditIcon = props.showEditIcon && props.showEditIcon === true;
  const showRemoveIcon = props.showRemoveIcon && props.showRemoveIcon === true;

  const pickImg = async () => {
    try {
      const tempUri = await LaunchImagePicker();
      if (!tempUri) return;

      setIsLoading(true);

      const currentUser = auth().currentUser;
      if (!currentUser) {
        console.log('User is not authenticated.');
        return;
      }
      const imageBlob = await RNFetchBlob.fs.readFile(tempUri, 'base64');

      const imageName = tempUri.substring(tempUri.lastIndexOf('/') + 1);
      const reference = storage().ref(`profile_images/${imageName}`);
      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          uid: auth().currentUser.uid,
        },
      };
      const taskSnapshot = await reference.putString(
        imageBlob,
        'base64',
        metadata,
      );

      if (!taskSnapshot || !taskSnapshot.state === 'success') {
        console.log(
          'Upload failed. TaskSnapshot is undefined or not in success state.',
        );
        return;
      }

      const downloadURL = await reference.getDownloadURL();
      setImageUrl(downloadURL);

      if (chatId) {
        await updateChatData(chatId, userId, {chatImage: downloadURL});
      } else {
        const newData = {profilePic: downloadURL};
        await updateSignedInUserData(userId, newData);
        dispatch(updateLoggedInUserData({newData}));
      }

      setIsLoading(false); 
      setImg({uri: downloadURL});
    } catch (error) {
      setIsLoading(false);
      console.log('Error during image upload:', error);
    }
  };
  const Container = props.onPress || showEditIcon ? TouchableOpacity : View;
  return (
    <Container style={props.style} onPress={props.onPress || pickImg}>
      {isLoading ? (
        <View
          width={props.size}
          height={props.size}
          style={styles.loadingContainer}>
          <ActivityIndicator size={'small'} color={'blue'} />
        </View>
      ) : (
        <Image
          source={img}
          style={{...styles.image, ...{height: props.size, width: props.size}}}
        />
      )}
      {showEditIcon && !isLoading && (
        <View style={styles.editIcon}>
          <Text>
            <Icon name="pencil" size={25} color="black" />
          </Text>
        </View>
      )}
      {showRemoveIcon && !isLoading && (
        <View style={styles.removeIcon}>
          <Text>
            <Icon name="close" size={10} color="black" />
          </Text>
        </View>
      )}
    </Container>
  );
};
const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: Colors.grey,
    borderWidth: 2,
    borderRadius: 25,
    padding: 6,
    backgroundColor: Colors.grey,
  },
  image: {
    borderColor: Colors.grey,
    borderWidth: 1,
    borderRadius: 50,
    marginVertical: 10,
  },
  removeIcon: {
    position: 'absolute',
    bottom: 4,
    right: -2,
    backgroundColor: Colors.lightGrey,
    borderRadius: 20,
    padding: 3,
  },
});

export default ProfileImage;

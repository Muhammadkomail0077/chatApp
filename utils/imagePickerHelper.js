import RNFetchBlob from 'rn-fetch-blob';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

export const uploadImageAsync = async (tempUri, isChatImage = false) => {
  const imageBlob = await RNFetchBlob.fs.readFile(tempUri, 'base64');

  const imageName = tempUri.substring(tempUri.lastIndexOf('/') + 1);
  const pathFolder = isChatImage ? 'chat_images' : 'profile_images';
  const reference = storage().ref(`${pathFolder}/${imageName}`);
  const metadata = {
    contentType: 'image/jpeg',
    customMetadata: {
      uid: auth().currentUser.uid,
    },
  };
  const taskSnapshot = await reference.putString(
    imageBlob,
    'base64',
    pathFolder === 'profile_images' ? metadata : {},
  );

  if (!taskSnapshot || !taskSnapshot.state === 'success') {
    console.log(
      'Upload failed. TaskSnapshot is undefined or not in success state.',
    );
    return;
  }

  return downloadURL = await reference.getDownloadURL();

//   setImageUrl(downloadURL);

//   return (newData = {downloadURL});
};

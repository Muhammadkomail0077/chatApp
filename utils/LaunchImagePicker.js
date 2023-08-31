import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {PermissionsAndroid} from 'react-native';

export const LaunchImagePicker = async () => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    quality: 1,
    saveToPhotos: true,
  });
  if (!result.didCancel) {
    return result.assets[0].uri;
  }
};

// export const openCamera = async () => {

//   const result = await launchCamera({
//     mediaType: 'photo',
//     quality: 1,
//     saveToPhotos: true,

//   });
//   console.log(result);
// if (!result.didCancel) {

//  return result.assets[0].uri;
// }
// };

export const openCamera = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'App Camera Permission',
        message: 'App needs access to your camera ',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      const result = await launchCamera({
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 200,
        maxWidth: 200,
      });
      if (!result.didCancel) {
        return result.assets[0].uri;
      }
    } else {
      console.log('Camera permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};

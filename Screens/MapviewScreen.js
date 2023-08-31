import React, {useState, useEffect} from 'react';
import {Text, StyleSheet, View, Button, PermissionsAndroid} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';

const MapviewScreen = (props) => {
  const [myLongitude, setMyLongitude] = useState(null);
  const [myLatitude, setMyLatitude] = useState(null);
  const [myAddress, setMyAddress] = useState(null);
  const [myCity, setMyCity] = useState(null);
  const [myCountry, setMyCountry] = useState(null);
 const completeAdress= {myLongitude, myLatitude, myCity, myCountry, myAddress};
  const [selectedLocation, setSelectedLocation] = useState(null);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
          getCurrentLocation();
        } else {
          console.log('Location permission denied');
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const latitude = selectedLocation
          ? selectedLocation.latitude
          : position.coords.latitude;
        const longitude = selectedLocation
          ? selectedLocation.longitude
          : position.coords.longitude;

        setMyLatitude(latitude);
        setMyLongitude(longitude);
        // Now you have the latitude and longitude
        // console.log('Latitude:', latitude);
        // console.log('Longitude:', longitude);

        // Proceed with reverse geocoding
        reverseGeocode(latitude, longitude);
      },
      error => {
        console.error('Error getting current location:', error);
      },
      // {enableHighAccuracy: true, timeout: 30000, maximumAge: 1000},
    );
  };

  const reverseGeocode = (latitude, longitude) => {
    // Set your API key (required for some geocoding services)
    Geocoder.init('AIzaSyDtp3OKKerq7d8LiZjKwo78fm9QEg8MMZk');

    // Perform reverse geocoding
    Geocoder.from(latitude, longitude)
      .then(response => {
        const address = response.results[0].formatted_address;
        const city = response.results[0].address_components.find(component =>
          component.types.includes('locality'),
        ).long_name;
        const country = response.results[0].address_components.find(component =>
          component.types.includes('country'),
        ).long_name;
        setMyAddress(address);
        setMyCity(city);
        setMyCountry(country);
        // console.log('Address:', address);
        // console.log('City:', city);
        // console.log('Country:', country);
      })
      .catch(error => {
        console.error('Error during reverse geocoding:', error);
      });
  };

  // const handleSendLocation = async() => {
  //  await requestLocationPermission();
  //   console.log('done');
  // };
  useEffect(() => {
    requestLocationPermission();
  }, [selectedLocation, myAddress]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude:selectedLocation && selectedLocation.latitude || myLatitude || 24.881922004644167,
          // latitude:selectedLocation? selectedLocation.latitude : myLatitude,
          longitude:selectedLocation && selectedLocation.longitude || myLongitude || 67.0025709271431,
          // longitude:selectedLocation? selectedLocation.longitude: myLongitude,
          // currentLocation.longitude
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={e => setSelectedLocation(e.nativeEvent.coordinate)}>
        {selectedLocation && (
          <Marker coordinate={selectedLocation} title="Selected Location" />
        )}
      </MapView>
      <Button
        title="Send Location"
        onPress={() => props.navigation.navigate('ChatScreen',{location: completeAdress})}
        disabled={!selectedLocation}
      />
      {/* <View>
        <Text style={{color: 'red'}}>hello</Text>
      </View> */}
    </View>
  );
};
// };
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapviewScreen;

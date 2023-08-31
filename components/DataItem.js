import React from 'react';
import {StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import ProfileImage from './ProfileImage';
import Colors from '../constants/Colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const imageSize = 40;
const DataItem = props => {
  const {title, subTitle, image, onPress, type, isChecked, icon, time} = props;
  const hideImage = props.hideImage && props.hideImage === true;
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.container}>
        {!icon && !hideImage && <ProfileImage uri={image} size={imageSize} />}
        {icon && (
          <View style={styles.leftIconContainer}>
            <AntDesign name={icon} size={30} color={Colors.blue} />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text
            style={{
              ...styles.title,
              ...{color: type === 'button' ? Colors.blue : Colors.textColor},
            }}
            numberOfLines={1}>
            {title}
          </Text>
          {subTitle && (
            <Text style={styles.subTitle} numberOfLines={1}>
              {subTitle === 'Image' ? (
                <Text>
                  <FontAwesome name="image" size={15} color={Colors.grey} />{' '}
                  {subTitle}
                </Text>
              ) : (
                subTitle
              )}
            </Text>
          )}
        </View>
        {type === 'checkbox' && (
          <View
            style={{
              ...styles.iconContainer,
              ...(isChecked && styles.checkedStyle),
            }}>
            <Ionicons name="checkmark" size={18} color="white" />
          </View>
        )}
        {type === 'link' && (
          <View>
            <Ionicons
              name="chevron-forward-outline"
              size={18}
              color={Colors.grey}
            />
          </View>
        )}
        {
          time && <View><Text style={{color:Colors.grey, paddingBottom:22, fontSize:12}}>{time}</Text></View>
        }
      </View>
    </TouchableWithoutFeedback>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 50,
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'lightgrey',
  },
  textContainer: {
    marginLeft: 14,
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.3,
    color: Colors.grey,
  },
  subTitle: {
    letterSpacing: 0.3,
    fontFamily: 'regular',
    color: Colors.grey,
  },
  iconContainer: {
    borderWidth: 1,
    borderRadius: 50,
    borderColor: Colors.lightGrey,
    backgroundColor: 'white',
  },
  checkedStyle: {
    backgroundColor: Colors.primary,
    borderColor: 'transparent',
  },
  leftIconContainer: {
    backgroundColor: Colors.lightGrey,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    height: imageSize,
    width: imageSize,
  },
});
export default DataItem;

import {Text, View, StyleSheet} from 'react-native';
import {MenuOption} from 'react-native-popup-menu';
import Feather from 'react-native-vector-icons/Feather';
import Colors from '../constants/Colors';


export const CustomMenuItem = props => {
  const Icon = props.iconPack ?? Feather;

  return (
    <MenuOption onSelect={props.onSelect}>
      <View style={styles.menuItemContainer}>
        <Text style={styles.menuText}>{props.text}</Text>
        <Icon name={props.icon} size={18} color={Colors.textColor} />
      </View>
    </MenuOption>
  );
};
const styles = StyleSheet.create({
  menuItemContainer: {
    flexDirection: 'row',
    padding: 5,
    // backgroundColor:'red'
  },
  menuText: {
    flex: 1,
    // fontFamily: 'regular',
    letterSpacing: 0.3,
    fontSize: 16,
    color:Colors.textColor
  },
});

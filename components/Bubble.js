import React, {useRef} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import uuid from 'react-native-uuid';
import Clipboard from '@react-native-clipboard/clipboard';
import {CustomMenuItem} from './CustomMenuItem';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {starMessages} from '../utils/Actions/chatActions';
import {useSelector} from 'react-redux';
import Colors from '../constants/Colors';

const formatamPm = dateString => {
  const date = new Date(dateString);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes + ' ' + ampm;
};

const Bubble = props => {
  const {
    text,
    type,
    messageId,
    userId,
    chatId,
    date,
    setReply,
    replyingTo,
    name,
    imageUrl,
  } = props;
  const starredMessages = useSelector(state => state.messages.starredMessages);
  const storedUsers = useSelector(state => state.users.storedUsers);
  const bubbleStyle = {...styles.container};
  const textStyle = {...styles.text};
  const wrapperStyle = {...styles.wrapperStyle};
  const menuRef = useRef(null);
  const id = useRef(uuid.v4());
  let Container = View;
  let isUserMessage = false;
  const dateString = date && formatamPm(date);

  switch (type) {
    case 'reply':
      bubbleStyle.backgroundColor = '#F2F2F2';
      break;
    case 'system':
      textStyle.color = '#65644A';
      bubbleStyle.backgroundColor = Colors.beige;
      // textStyle.paddingHorizontal=8
      textStyle.fontSize=12
      bubbleStyle.alignItems = 'center';
      bubbleStyle.marginVertival = 8;
      break;
    case 'error':
      bubbleStyle.backgroundColor = '#dd0426';
      textStyle.color = 'white';
      bubbleStyle.marginTop = 10;
      break;
    case 'myMsg':
      wrapperStyle.justifyContent = 'flex-end';
      bubbleStyle.backgroundColor = '#E7FED6';
      bubbleStyle.maxWidth = '80%';
      isUserMessage = true;
      Container = TouchableWithoutFeedback;
      break;
    case 'otherMsg':
      wrapperStyle.justifyContent = 'flex-start';
      bubbleStyle.maxWidth = '80%';
      Container = TouchableWithoutFeedback;
      isUserMessage = true;
      break;
    case 'info':
      bubbleStyle.backgroundColor = Colors.nearlyWhite;
      bubbleStyle.alignItems = 'center';
      textStyle.textAlign='center'
      textStyle.color = Colors.darkGrey;
      textStyle.fontSize = 13;
      bubbleStyle.marginHorizontal = 20;
      bubbleStyle.paddingVertical= 7

    default:
      break;
  }

  const copyToClipboard = async text => {
    try {
      await Clipboard.setString(text);
    } catch (error) {
      console.log(error);
    }
  };

  const isStarredMessage =
    isUserMessage &&
    starredMessages[chatId] &&
    starredMessages[chatId][messageId] !== undefined;

  const replyingToUser = replyingTo && storedUsers[replyingTo.sentBy];

  return (
    <View style={wrapperStyle}>
      <Container
        onLongPress={() => {
          menuRef.current.props.ctx.menuActions.openMenu(id.current);
        }}
        style={{width: '100%'}}>
        <View style={bubbleStyle}>
          {name && (
            <Text
              style={{
                fontWeight: 'bold',
                color: Colors.textColor,
                marginBottom: 3,
              }}>
              {name}
            </Text>
          )}
          {replyingToUser && (
            <Bubble
              type="reply"
              text={replyingTo.text}
              name={`${replyingToUser.firstLast}`}
            />
          )}
          {!imageUrl && <Text style={textStyle}>{text}</Text>}

          {imageUrl && <Image source={{uri: imageUrl}} style={styles.img} />}
          {dateString && type !== 'info' && (
            <View style={styles.timeContainer}>
              {isStarredMessage && (
                <FontAwesome
                  name="star"
                  size={14}
                  color="grey"
                  style={{marginRight: 5, marginTop: 3}}
                />
              )}

              <Text style={{fontSize: 12, color: Colors.grey}}>
                {dateString}
              </Text>
            </View>
          )}
          <Menu name={id.current} ref={menuRef}>
            <MenuTrigger />
            <MenuOptions>
              <CustomMenuItem
                text="copy to clipboard"
                onSelect={() => copyToClipboard(text)}
                iconPack={Feather}
                icon={'copy'}
              />
              <CustomMenuItem
                text={`${isStarredMessage ? 'unstar' : 'star'} message`}
                onSelect={() => starMessages(messageId, chatId, userId)}
                iconPack={FontAwesome}
                icon={isStarredMessage ? 'star-o' : 'star'}
              />
              <CustomMenuItem
                text="Reply"
                onSelect={setReply}
                iconPack={Feather}
                icon={'arrow-left-circle'}
              />
            </MenuOptions>
          </Menu>
        </View>
      </Container>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapperStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingTop: 4,
    marginBottom: 6,
    borderColor: '#E2DACC',
    borderWidth: 1,
  },
  text: {
    fontFamily: 'regular',
    letterSpacing: 0.3,
    fontSize: 16,
    color: Colors.textColor,
  },
  menuItemContainer: {
    flexDirection: 'row',
    padding: 5,
  },
  menuText: {
    flex: 1,
    letterSpacing: 0.3,
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  img: {
    height: 250,
    width: 250,
    marginBottom: 5,
  },
});

export default Bubble;

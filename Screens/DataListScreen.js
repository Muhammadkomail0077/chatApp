import React, {useEffect} from 'react';
import {FlatList} from 'react-native';
import PageContainer from '../components/PageContainer';
import {useSelector} from 'react-redux';
import DataItem from '../components/DataItem';

const DataListScreen = props => {
  const storedUsers = useSelector(state => state.users.storedUsers);
  const userData = useSelector(state => state.auth.userData);
  const {title, type, chatId, data} = props.route.params;
  const messagesData = useSelector(state => state.messages.messagesData);
  // console.log('data', props.route.params);
  useEffect(
    () =>
      props.navigation.setOptions({
        headerTitle: title,
      }),
    [title],
  );
  return (
    <PageContainer>
      <FlatList
        data={data}
        keyExtractor={item =>
          title === 'Participants' ? item : Object.keys(item)
        }
        renderItem={itemData => {
          if (props.route.params.type === 'users') {
            const uid = itemData.item;
            const currentUser = storedUsers[uid];
            if (!currentUser) return;
            const isLoggedInUser = uid === userData.userId;
            return (
              <DataItem
                key={uid}
                title={`${currentUser.firstLast}`}
                subTitle={currentUser.about}
                image={currentUser.profilePic}
                onPress={
                  isLoggedInUser
                    ? undefined
                    : () => {
                        props.navigation.navigate('Contact', {uid, chatId});
                      }
                }
                type={isLoggedInUser ? undefined : 'link'}
              />
            );
          } else if (props.route.params.type === 'messages') {
            const starData = itemData.item;
            const starredMessageValues = Object.values(starData);
            const dataItems = starredMessageValues.map(starredMessage => {
              const {chatId, messageId} = starredMessage;
              const messagesForChat = messagesData[chatId];
              if (!messagesForChat) return;
              const messageData = messagesForChat[messageId];
              const sender =
                messageData.sentBy && storedUsers[messageData.sentBy];
              const name = sender && `${sender.firstLast}`;
              return (
                <DataItem
                  key={messageId}
                  title={name}
                  subTitle={messageData.text}
                />
              );
            });
            return dataItems;
          }
        }}
      />
    </PageContainer>
  );
};

export default DataListScreen;

// return <View style={{backgroundColor:'red', borderRadius:25, borderWidth:8, borderColor:'pink'}}><Text>hello</Text></View>

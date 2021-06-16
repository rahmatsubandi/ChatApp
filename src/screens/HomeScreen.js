import React, {useState, useEffect} from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {Button, Dialog, Divider, List, Portal} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import Loading from '../components/Loading';
// import useStatsBar from '../utils/useStatusBar';

export default function HomeScreen({navigation}) {
  // useStatsBar('light-content');

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveThreads, setLeaveThreads] = useState(null);

  function handleLeaveThreads(id) {
    const dbRef = firestore().collection('THREADS').doc(id);
    dbRef.delete().then(res => {
      console.log('Item removed from database with id ' + id);
      setLeaveThreads(null);
    });
  }

  function handleDismissLeaveThreads() {
    setLeaveThreads(null);
  }

  /**
   * Fetch threads from Firestore
   */
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('THREADS')
      .orderBy('latestMessage.createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const threads = querySnapshot.docs.map(documentSnapshot => {
          return {
            _id: documentSnapshot.id,
            // give defaults
            name: '',

            latestMessage: {
              text: '',
            },
            ...documentSnapshot.data(),
          };
        });

        setThreads(threads);

        if (loading) {
          setLoading(false);
        }
      });

    /**
     * unsubscribe listener
     */
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={threads}
        keyExtractor={item => item._id}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({item}) => (
          <TouchableOpacity>
            <List.Item
              title={item.name}
              description={item.latestMessage.text}
              titleNumberOfLines={1}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              descriptionNumberOfLines={1}
              onPress={() => navigation.navigate('Room', {thread: item})}
              onLongPress={() => {
                setLeaveThreads(item);
              }}
            />
          </TouchableOpacity>
        )}
      />
      <Portal>
        <Dialog visible={leaveThreads} onDismiss={handleDismissLeaveThreads}>
          <Dialog.Title>Delete Chat Room?</Dialog.Title>
          <Dialog.Actions>
            <Button onPress={handleDismissLeaveThreads}>Cancel</Button>
            <Button onPress={() => handleLeaveThreads(leaveThreads._id)}>
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  listTitle: {
    fontSize: 22,
  },
  listDescription: {
    fontSize: 16,
  },
});

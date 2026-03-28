import type { Ref } from 'react';
import { useImperativeHandle, useState } from 'react';
import type { ListRenderItem } from 'react-native';
import {
  Button,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useAppSelector } from '../../../store/hooks';

export type NicklistModalHandle = {
  show: () => void;
};

type Props = {
  ref?: Ref<NicklistModalHandle>;
  bufferId: string | null;
};

const renderItem: ListRenderItem<WeechatNicklist> = ({ item }) => (
  <View style={styles.listItem}>
    <View style={styles.row}>
      <Text style={styles.listItemText}>{item.name}</Text>
    </View>
  </View>
);

const keyExtractor = (item: WeechatNicklist) =>
  item.pointers[item.pointers.length - 1];

const NicklistModal: React.FC<Props> = ({ ref, bufferId }) => {
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => {
    return { show: () => setVisible(true) };
  });

  const nicklist = useAppSelector((state) =>
    bufferId ? (state.nicklists[bufferId] ?? null) : null
  );

  if (!bufferId) return;

  return (
    <Modal
      visible={visible}
      onRequestClose={() => setVisible(false)}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalWrapper}>
        <Pressable
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          onPress={() => setVisible(false)}
        />
        <View style={styles.modalView}>
          <FlatList
            data={nicklist}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
          />
          <Button title="Close" onPress={() => setVisible(false)} />
        </View>
      </View>
    </Modal>
  );
};

export default NicklistModal;

const styles = StyleSheet.create({
  modalWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  modalView: {
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: 280,
    marginTop: 48,
    marginBottom: 48
  },
  listItem: {
    flex: 1,
    height: 40,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  listItemText: {
    color: '#eee',
    fontWeight: 'bold',
    fontSize: 15
  },
  row: {
    flexDirection: 'row'
  }
});

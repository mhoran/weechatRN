import { useEffect, useRef } from 'react';
import type { ListRenderItem } from 'react-native';
import { Button, FlatList, Modal, StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../../../store/hooks';

type Props = {
  bufferId: string | null;
  visible: boolean;
  close: () => void;
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

const NicklistModal: React.FC<Props> = ({ bufferId, visible, close }) => {
  const nicklist = useAppSelector((state) =>
    bufferId ? (state.nicklists[bufferId] ?? null) : null
  );

  const lastBufferId = useRef(bufferId);

  useEffect(() => {
    if (bufferId !== lastBufferId.current) {
      lastBufferId.current = bufferId;
      if (visible) close();
    }
  });

  if (!bufferId) return;

  return (
    <Modal
      visible={visible}
      onRequestClose={close}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalWrapper}>
        <View style={styles.modalView}>
          <FlatList
            data={nicklist}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
          />
          <Button title="Close" onPress={close} />
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
    fontFamily: 'Thonburi',
    fontWeight: 'bold',
    fontSize: 15
  },
  row: {
    flexDirection: 'row'
  }
});

import { useRef } from 'react';
import {
  Button,
  FlatList,
  ListRenderItemInfo,
  Modal,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { ConnectedProps, connect } from 'react-redux';
import { StoreState } from '../../../store';

const connector = connect((state: StoreState, { bufferId }: OwnProps) => ({
  nicklist: (bufferId && state.nicklists[bufferId]) || []
}));

type PropsFromRedux = ConnectedProps<typeof connector>;

type OwnProps = {
  bufferId: string | null;
  visible: boolean;
  close: () => void;
};

type Props = OwnProps & PropsFromRedux;

type ItemProps = {
  item: ListRenderItemInfo<WeechatNicklist>;
};

const Item: React.FC<ItemProps> = ({ item }) => {
  return (
    <View style={styles.listItem}>
      <View style={styles.row}>
        <Text style={styles.listItemText}>{item.item.name}</Text>
      </View>
    </View>
  );
};

const NicklistModal: React.FC<Props> = ({
  bufferId,
  visible,
  nicklist,
  close
}) => {
  const lastBufferId = useRef(bufferId);

  if (bufferId !== lastBufferId.current) {
    lastBufferId.current = bufferId;
    visible && close();
  }

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
            renderItem={(item) => {
              return <Item item={item} />;
            }}
            keyExtractor={(item) => item.pointers[item.pointers.length - 1]}
          />
          <Button title="Close" onPress={close} />
        </View>
      </View>
    </Modal>
  );
};

export default connector(NicklistModal);

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

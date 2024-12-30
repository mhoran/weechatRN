import type * as React from 'react';
import { useCallback } from 'react';
import type { ListRenderItem } from 'react-native';
import { FlatList, StyleSheet, View } from 'react-native';
import { createSelector } from 'reselect';
import type { StoreState } from '../../../store';
import { useAppSelector } from '../../../store/hooks';
import type { HotListState } from '../../../store/hotlists';
import { createEmptyHotlist } from '../../../store/selectors';
import BufferListItem from './BufferListItem';

interface Props {
  currentBufferId: string | null;
  onSelectBuffer: (b: WeechatBuffer) => void;
}

const keyExtractor = (buffer: WeechatBuffer): string => buffer._id;

const selectBuffers = createSelector(
  [(state: StoreState) => state.buffers],
  (buffers) => Object.values(buffers).sort((a, b) => a.number - b.number)
);

const selectHotlist = createSelector(
  [
    (hotlist: HotListState, bufferId: string) => hotlist[bufferId],
    (hotlist: HotListState, bufferId: string) => bufferId
  ],
  (hotlist, bufferId) => hotlist ?? createEmptyHotlist(bufferId)
);

const BufferList: React.FC<Props> = ({ currentBufferId, onSelectBuffer }) => {
  const buffers = useAppSelector(selectBuffers);
  const hotlists = useAppSelector((state) => state.hotlists);
  const filterBuffers = useAppSelector(
    (state) => state.connection.filterBuffers
  );

  const renderListItem: ListRenderItem<WeechatBuffer> = useCallback(
    ({ item }) => {
      return (
        <BufferListItem
          buffer={item}
          onSelectBuffer={onSelectBuffer}
          isCurrentBuffer={currentBufferId === item.id}
          hotlist={selectHotlist(hotlists, item.id)}
          filterBuffers={filterBuffers}
        />
      );
    },
    [currentBufferId, hotlists, onSelectBuffer, filterBuffers]
  );

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.container}
        data={buffers}
        keyExtractor={keyExtractor}
        renderItem={renderListItem}
      />
    </View>
  );
};

export default BufferList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212'
  }
});

import * as React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, FlatList, View, ListRenderItem } from 'react-native';
import BufferListItem from './BufferListItem';
import { StoreState } from '../../../store';
import { getHotlistForBufferId } from '../../../store/selectors';
import { HotListState } from '../../../store/hotlists';

interface Props {
  buffers: WeechatBuffer[];
  currentBufferId: string | null;
  onSelectBuffer: (b: WeechatBuffer) => void;
  hotlists: HotListState;
  filterBuffers: boolean;
}

const keyExtractor = (buffer: WeechatBuffer): string => buffer.id;

class BufferList extends React.Component<Props> {
  renderListItem: ListRenderItem<WeechatBuffer> = ({ item }) => {
    const { onSelectBuffer, currentBufferId, hotlists } = this.props;

    return (
      <BufferListItem
        buffer={item}
        onSelectBuffer={onSelectBuffer}
        currentBufferId={currentBufferId}
        hotlist={getHotlistForBufferId(hotlists, item.id)}
      />
    );
  };

  visibleBuffer = (buffer: WeechatBuffer) => {
    const { filterBuffers, hotlists } = this.props;

    if (filterBuffers) {
      return (
        (buffer.local_variables.type != 'server' &&
          buffer.local_variables.type != null) ||
        (hotlists[buffer.id] && hotlists[buffer.id].sum != 0)
      );
    } else {
      return true;
    }
  };

  render() {
    const { buffers } = this.props;

    return (
      <View style={styles.container}>
        <FlatList
          style={styles.container}
          data={buffers.filter(this.visibleBuffer)}
          keyExtractor={keyExtractor}
          renderItem={this.renderListItem}
        />
      </View>
    );
  }
}

export default connect((state: StoreState) => ({
  hotlists: state.hotlists,
  filterBuffers: state.connection.filterBuffers
}))(BufferList);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212'
  }
});

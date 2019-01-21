import * as React from "react";
import { connect } from "react-redux";
import {
  StyleSheet,
  FlatList,
  View,
  ListRenderItem
} from "react-native";
import BufferListItem from "./BufferListItem";
import { StoreState } from "../../../store";
import { getHotlistForBufferId } from "../../../store/selectors";
import { HotListState } from '../../../store/hotlists';

interface Props {
  buffers: WeechatBuffer[];
  currentBufferId: string | null;
  onSelectBuffer: (b: WeechatBuffer) => any;
  hotlists: HotListState;
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
  render() {
    const { buffers } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.topbar} />
        <FlatList
          style={styles.container}
          data={buffers}
          keyExtractor={keyExtractor}
          renderItem={this.renderListItem}
        />
      </View>
    );
  }
}

export default connect((state: StoreState) => ({
  hotlists: state.hotlists
}))(BufferList);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212"
  },
  topbar: {
    height: 30
  }
});

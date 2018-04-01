import * as React from "react";
import {
  StyleSheet,
  Dimensions,
  Text,
  TouchableHighlight,
  FlatList,
  View,
  ListRenderItem
} from "react-native";
import BufferListItem from "./BufferListItem";

interface Props {
  buffers: WeechatBuffer[];
  currentBufferId: string | null;
  onSelectBuffer: (b: WeechatBuffer) => any;
}

const keyExtractor = (buffer: WeechatBuffer): string => buffer.id;

export default class BufferList extends React.Component<Props> {
  renderListItem: ListRenderItem<WeechatBuffer> = ({ item }) => {
    const { onSelectBuffer, currentBufferId } = this.props;

    return (
      <BufferListItem
        buffer={item}
        onSelectBuffer={onSelectBuffer}
        currentBufferId={currentBufferId}
      />
    );
  };
  render() {
    const { buffers, onSelectBuffer, currentBufferId } = this.props;

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212"
  },
  topbar: {
    height: 30
  }
});

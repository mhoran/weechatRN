import * as React from "react";
import {
  StyleSheet,
  Dimensions,
  Text,
  TouchableHighlight,
  FlatList,
  View
} from "react-native";
import { BufferListItem } from "./BufferListItem";

interface Props {
  buffers: WeechatBuffer[];
  currentBufferId: string | null;
  onSelectBuffer: (b: WeechatBuffer) => any;
}

export default class BufferList extends React.Component<Props> {
  render() {
    const { buffers, onSelectBuffer, currentBufferId } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.topbar} />
        <FlatList
          style={styles.container}
          data={buffers}
          keyExtractor={buffer => buffer.id}
          renderItem={({ item }) => (
            <BufferListItem
              buffer={item}
              onSelectBuffer={onSelectBuffer}
              currentBufferId={currentBufferId}
            />
          )}
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

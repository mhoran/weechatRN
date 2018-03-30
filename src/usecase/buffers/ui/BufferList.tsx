import React from "react";
import {
  StyleSheet,
  Dimensions,
  Text,
  TouchableHighlight,
  FlatList,
  View
} from "react-native";

interface BufferListItemProps {
  buffer: WeechatBuffer;
  currentBufferName: string;
  onSelectBuffer: (b: WeechatBuffer) => any;
}

const BufferListItem = ({
  buffer,
  currentBufferName,
  onSelectBuffer
}: BufferListItemProps) => (
  <TouchableHighlight
    onPress={() => onSelectBuffer(buffer)}
    underlayColor="#F2777A"
    style={[
      styles.listItem,
      currentBufferName === buffer.short_name
        ? { backgroundColor: "#F2777A" }
        : null
    ]}
  >
    <View style={styles.row}>
      <View style={styles.bufferName}>
        <Text
          style={[
            styles.listItemText,
            currentBufferName !== buffer.short_name ? { color: "#888" } : null
          ]}
        >
          {buffer.short_name || buffer.full_name}
        </Text>
      </View>
      <Text style={styles.listItemText}>1</Text>
    </View>
  </TouchableHighlight>
);

interface Props {
  buffers: WeechatBuffer[];
  currentBufferName: string;
  onSelectBuffer: (b: WeechatBuffer) => any;
}

export default class BufferList extends React.Component<Props> {
  render() {
    const { buffers, onSelectBuffer, currentBufferName } = this.props;

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
              currentBufferName={currentBufferName}
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
  },
  row: {
    flexDirection: "row"
  },
  bufferName: {
    flex: 1
  },
  listItem: {
    flex: 1,
    height: 40,
    paddingHorizontal: 20,
    justifyContent: "center"
  },
  listItemText: {
    color: "#eee",
    fontFamily: "Thonburi",
    fontWeight: "bold",
    fontSize: 15
  }
});

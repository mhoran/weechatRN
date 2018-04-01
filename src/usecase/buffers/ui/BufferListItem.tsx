import * as React from "react";
import {
  StyleSheet,
  Dimensions,
  Text,
  TouchableHighlight,
  FlatList,
  View
} from "react-native";

interface Props {
  buffer: WeechatBuffer;
  currentBufferId: string;
  onSelectBuffer: (b: WeechatBuffer) => any;
}

export const BufferListItem = ({
  buffer,
  currentBufferId,
  onSelectBuffer
}: Props) => (
  <TouchableHighlight
    onPress={() => onSelectBuffer(buffer)}
    underlayColor="#F2777A"
    style={[
      styles.listItem,
      currentBufferId === buffer.id ? { backgroundColor: "#F2777A" } : null
    ]}
  >
    <View style={styles.row}>
      <View style={styles.bufferName}>
        <Text
          style={[
            styles.listItemText,
            currentBufferId !== buffer.id ? { color: "#888" } : null
          ]}
        >
          {buffer.short_name || buffer.full_name}
        </Text>
      </View>
      <Text style={styles.listItemText}>1</Text>
    </View>
  </TouchableHighlight>
);

const styles = StyleSheet.create({
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
  },
  row: {
    flexDirection: "row"
  },
  bufferName: {
    flex: 1
  }
});

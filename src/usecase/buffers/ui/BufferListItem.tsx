import * as React from "react";
import {
  StyleSheet,
  Dimensions,
  Text,
  TouchableHighlight,
  FlatList,
  View,
  TextStyle,
  ViewStyle
} from "react-native";

interface Props {
  buffer: WeechatBuffer;
  currentBufferId: string;
  onSelectBuffer: (b: WeechatBuffer) => any;
}

const getBufferViewStyleFromProps = (props: Props): ViewStyle => {
  if (props.currentBufferId === props.buffer.id) {
    return { backgroundColor: "#f2777a" };
  } else if (false /* highlight */) {
    return { backgroundColor: "#ffcf7f" };
  } else {
    return null;
  }
};

const getBufferTextStyleFromProps = (props: Props): TextStyle => {
  if (props.currentBufferId === props.buffer.id) {
    return { color: "#fff" };
  } else if (false /* highlight */) {
    return { color: "#000" };
  } else {
    return null;
  }
};

export const BufferListItem = (props: Props) => {
  const { buffer, currentBufferId, onSelectBuffer } = props;
  return (
    <TouchableHighlight
      onPress={() => onSelectBuffer(buffer)}
      underlayColor="#F2777A"
      style={[styles.listItem, getBufferViewStyleFromProps(props)]}
    >
      <View style={styles.row}>
        <View style={styles.bufferName}>
          <Text
            style={[styles.listItemText, getBufferTextStyleFromProps(props)]}
          >
            {buffer.short_name || buffer.full_name}
          </Text>
        </View>
        <Text style={styles.listItemText}>1</Text>
      </View>
    </TouchableHighlight>
  );
};

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

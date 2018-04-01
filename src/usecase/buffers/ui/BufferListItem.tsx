import * as React from "react";
import { connect } from "react-redux";
import {
  StyleSheet,
  Dimensions,
  Text,
  TouchableHighlight,
  View,
  TextStyle,
  ViewStyle
} from "react-native";
import { StoreState } from "../../../store";
import { getHotlistForBufferId } from "../../../store/selectors";

interface Props {
  buffer: WeechatBuffer;
  hotlist: Hotlist;
  currentBufferId: string;
  onSelectBuffer: (b: WeechatBuffer) => any;
}

const getBufferViewStyleFromProps = (props: Props): ViewStyle => {
  if (props.currentBufferId === props.buffer.id) {
    return { backgroundColor: "#f2777a" };
  } else if (props.hotlist.highlight > 0) {
    return { backgroundColor: "#ffcf7f" };
  } else if (props.hotlist.sum > 0) {
    return { backgroundColor: "#3b4252" };
  } else {
    return null;
  }
};

const getBufferTextStyleFromProps = (props: Props): TextStyle => {
  if (props.currentBufferId === props.buffer.id) {
    return { color: "#fff" };
  } else if (props.hotlist.highlight > 0) {
    return { color: "#000" };
  } else if (props.hotlist.sum > 0) {
    return { color: "#ebcb8b" };
  } else {
    return null;
  }
};

const BufferListItem = (props: Props) => {
  const { buffer, hotlist, currentBufferId, onSelectBuffer } = props;
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
        {hotlist.sum > 0 && (
          <Text
            style={[styles.listItemText, getBufferTextStyleFromProps(props)]}
          >
            {hotlist.sum}
          </Text>
        )}
      </View>
    </TouchableHighlight>
  );
};

export default connect((state: StoreState, props: Props) => {
  const hotlist = getHotlistForBufferId(state.hotlists, props.buffer.id);
  return { hotlist };
})(BufferListItem);

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

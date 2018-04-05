import * as React from "react";
import {
  StyleSheet,
  Animated,
  Keyboard,
  FlatList,
  View,
  ListRenderItem
} from "react-native";
import * as _ from "lodash";

import BufferLine from "./BufferLine";

interface Props {
  lines: WeechatLine[];
  onLongPress: () => any;
  parseArgs: any;
  bufferId: string;
}

const keyExtractor = (line: WeechatLine, index: number) =>
  _.last(line.pointers);

export default class Buffer extends React.PureComponent<Props> {
  renderBuffer: ListRenderItem<WeechatLine> = ({ item }) => {
    const { onLongPress, parseArgs } = this.props;

    return (
      <BufferLine line={item} onLongPress={onLongPress} parseArgs={parseArgs} />
    );
  };
  render() {
    const { lines, onLongPress, parseArgs } = this.props;
    return (
      <FlatList
        data={lines.filter(line => line.displayed !== 0)}
        inverted
        keyboardDismissMode="interactive"
        keyExtractor={keyExtractor}
        renderItem={this.renderBuffer}
      />
    );
  }
}

const styles = StyleSheet.create({
  topbar: {
    height: 20,
    backgroundColor: "#001"
  },
  bottomBox: {
    height: 40,
    paddingHorizontal: 10,
    justifyContent: "center",
    backgroundColor: "#aaa"
  },
  inputBox: {
    height: 25,
    paddingHorizontal: 5,
    justifyContent: "center",
    borderColor: "gray",
    backgroundColor: "#fff"
  }
});

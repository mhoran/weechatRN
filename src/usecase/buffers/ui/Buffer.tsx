import * as React from "react";
import { StyleSheet, Animated, Keyboard, FlatList, View } from "react-native";
import { connect } from "react-redux";
import * as _ from "lodash";

import BufferLine from "./BufferLine";
import { StoreState } from "../../../store";

interface Props {
  lines: WeechatLine[];
  onLongPress: () => any;
  parseArgs: any;
  bufferId: string;
}

class Buffer extends React.Component<Props> {
  render() {
    const { lines, onLongPress, parseArgs } = this.props;
    return (
      <FlatList
        data={lines.filter(
          line => !_.includes(line.tags_array, "irc_smart_filter")
        )}
        inverted
        keyboardDismissMode="interactive"
        keyExtractor={line => _.last(line.pointers)}
        renderItem={({ item }) => (
          <BufferLine
            line={item}
            onLongPress={onLongPress}
            parseArgs={parseArgs}
          />
        )}
      />
    );
  }
}

export default connect((state: StoreState, { bufferId }: Props) => ({
  lines: state.lines[bufferId] || []
}))(Buffer);

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

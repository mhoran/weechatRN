import React from "react";
import {
  StyleSheet,
  Animated,
  Keyboard,
  FlatList,
  View,
  EmitterSubscription
} from "react-native";
import { connect } from "react-redux";
import * as _ from "lodash";

import AppleEasing from "react-apple-easing";

import BufferLine from "./BufferLine";
import { StoreState } from "../../../store";

//const easingFunction = Easing.bezier(0.55, 0.085, 0.68, 0.53);
const easingFunction = AppleEasing.easeIn;

interface Props {
  lines: WeechatLine[];
  onLongPress: () => any;
  parseArgs: any;
  bufferId: string;
}

interface State {
  keyboardOffset: Animated.Value;
}

class Buffer extends React.Component<Props, State> {
  cancelKeyboardWillShow: EmitterSubscription;
  cancelKeyboardWillHide: EmitterSubscription;

  state: State = {
    keyboardOffset: new Animated.Value(0)
  };

  componentDidMount() {
    this.cancelKeyboardWillShow = Keyboard.addListener("keyboardWillShow", e =>
      this._keyboardWillShow(e)
    );
    this.cancelKeyboardWillHide = Keyboard.addListener("keyboardWillHide", e =>
      this._keyboardWillHide(e)
    );
  }
  _keyboardWillShow(e) {
    console.log(e);
    Animated.timing(this.state.keyboardOffset, {
      toValue: e.endCoordinates.height,
      duration: e.duration,
      easing: easingFunction
    }).start();
  }
  _keyboardWillHide(e) {
    Animated.timing(this.state.keyboardOffset, {
      toValue: 0,
      duration: e.duration,
      easing: easingFunction
    }).start();
  }
  render() {
    const { lines, onLongPress, parseArgs } = this.props;
    return (
      <FlatList
        data={lines}
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

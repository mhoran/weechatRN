import React from "react";
import { StyleSheet, Animated, Keyboard, ListView, View } from "react-native";
import { connect } from "react-redux";

import AppleEasing from "react-apple-easing";

import BufferLine from "./BufferLine";

//const easingFunction = Easing.bezier(0.55, 0.085, 0.68, 0.53);
const easingFunction = AppleEasing.easeIn;

class Buffer extends React.Component {
  state = {
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
    const { dataSource, onLongPress, parseArgs } = this.props;
    return (
      <ListView
        style={styles.main}
        dataSource={dataSource}
        keyboardDismissMode="interactive"
        renderRow={line => (
          <BufferLine
            line={line}
            onLongPress={onLongPress}
            parseArgs={parseArgs}
          />
        )}
      />
    );
  }
}

export default connect((state, { buffer }) => {
  const dataSource = new ListView.DataSource({
    rowHasChanged: (r1, r2) => r1 !== r2
  });

  return {
    dataSource: dataSource.cloneWithRows(buffer.lines)
  };
})(Buffer);

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

import React from "react";
import {
  StyleSheet,
  AlertIOS,
  LinkingIOS,
  ActionSheetIOS,
  Animated,
  Keyboard,
  TextInput,
  Easing,
  View
} from "react-native";
import AppleEasing from "react-apple-easing";

import { connect } from "react-redux";

import { changeCurrentBuffer } from "../actions/BufferActions";

import BufferLine from "./BufferLine";
import Buffer from "./Buffer";
import { getParseArgs } from "../../../lib/helpers/parse-text-args";
import { formatUrl } from "../../../lib/helpers/url-formatter";

const easingFunction = Easing.bezier(0.55, 0.085, 0.68, 0.53);
//const easingFunction = AppleEasing.easeIn;

export default class BufferView extends React.Component {
  state = {
    keyboardOffset: new Animated.Value(0),
    inputWidth: new Animated.Value(350)
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
  handleOnFocus() {
    Animated.timing(this.state.inputWidth, {
      toValue: 310,
      duration: 250,
      easing: easingFunction
    }).start();
  }
  handleOnBlur() {
    Animated.timing(this.state.inputWidth, {
      toValue: 350,
      duration: 250,
      easing: Easing.inOut(Easing.ease)
    }).start();
  }
  handleOnLongPress(type, text) {
    ActionSheetIOS.showShareActionSheetWithOptions(
      {
        url: formatUrl(type, text),
        message: text
      },
      () => null,
      () => null
    );
  }
  handleOnPress(type, text) {
    // console.log(type, text);
    // if (type === "channel") {
    //   this.props.dispatch(changeCurrentBuffer(text));
    // } else {
    //   LinkingIOS.openURL(formatUrl(type, text));
    // }
  }
  render() {
    const { bufferId } = this.props;

    console.log({ bufferId });

    if (!bufferId) {
      return <View style={styles.container} />;
    }

    return (
      <Animated.View
        style={[styles.container, { marginBottom: this.state.keyboardOffset }]}
      >
        <Buffer
          bufferId={bufferId}
          onLongPress={line => null}
          parseArgs={getParseArgs(
            styles.link,
            this.handleOnPress,
            this.handleOnLongPress
          )}
        />
        <View style={styles.bottomBox}>
          <Animated.View style={{ width: this.state.inputWidth }}>
            <TextInput
              style={styles.inputBox}
              onFocus={() => this.handleOnFocus()}
              onBlur={() => this.handleOnBlur()}
            />
          </Animated.View>
        </View>
      </Animated.View>
    );
  }
}

const light = false;

const styles = StyleSheet.create({
  topbar: {
    height: 20,
    paddingHorizontal: 5,
    backgroundColor: "#001"
  },
  text: {
    color: "#eee"
  },
  container: {
    flex: 1,
    backgroundColor: light ? "#fff" : "#222"
  },
  main: {
    paddingVertical: 20
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

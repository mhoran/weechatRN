import * as React from "react";
import {
  StyleSheet,
  AlertIOS,
  LinkingIOS,
  ActionSheetIOS,
  KeyboardAvoidingView,
  Animated,
  Keyboard,
  TextInput,
  Easing,
  View,
  EmitterSubscription
} from "react-native";

import { connect } from "react-redux";

import { changeCurrentBuffer } from "../actions/BufferActions";

import BufferLine from "./BufferLine";
import Buffer from "./Buffer";
import { getParseArgs } from "../../../lib/helpers/parse-text-args";
import { formatUrl } from "../../../lib/helpers/url-formatter";

interface Props {
  bufferId: string;
  fetchLinesForBuffer: (string) => void;
}

interface State {
  inputWidth: Animated.Value;
}

export default class BufferContainer extends React.Component<Props, State> {
  state = {
    inputWidth: new Animated.Value(350)
  };

  handleOnFocus() {
    Animated.timing(this.state.inputWidth, {
      toValue: 310,
      duration: 250,
      easing: Easing.inOut(Easing.ease)
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

    if (!bufferId) {
      return <View style={styles.container} />;
    }

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
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
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  topbar: {
    height: 20,
    paddingHorizontal: 5,
    backgroundColor: "#001"
  },
  link: {
    textDecorationLine: "underline"
  },
  text: {
    color: "#eee"
  },
  container: {
    flex: 1,
    backgroundColor: "#222"
  },
  main: {
    paddingVertical: 20
  },
  bottomBox: {
    height: 40,
    paddingHorizontal: 10,
    justifyContent: "center",
    backgroundColor: "#333"
  },
  inputBox: {
    height: 25,
    paddingHorizontal: 5,
    justifyContent: "center",
    borderColor: "gray",
    backgroundColor: "#fff"
  }
});

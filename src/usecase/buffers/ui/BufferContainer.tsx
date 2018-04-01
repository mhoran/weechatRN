import * as React from "react";
import {
  StyleSheet,
  AlertIOS,
  Linking,
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
  fetchLinesForBuffer: (bufferId: string) => void;
  sendMessage: (message: string) => void;
}

interface State {
  inputWidth: Animated.Value;
  textValue: string;
}

export default class BufferContainer extends React.Component<Props, State> {
  state = {
    inputWidth: new Animated.Value(350),
    textValue: ""
  };

  parseArgs = getParseArgs(
    styles.link,
    this.handleOnPress,
    this.handleOnLongPress
  );

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
    console.log(type, text);
    if (type === "channel") {
      // this.props.dispatch(changeCurrentBuffer(text));
    } else {
      Linking.openURL(formatUrl(type, text));
    }
  }

  handleChangeText = (textValue: string) => {
    this.setState({
      textValue
    });
  };

  handleSubmit = () => {
    const { textValue } = this.state;
    this.props.sendMessage(textValue);
    this.setState({
      textValue: ""
    });
  };

  onLongPress = (line: WeechatLine) => {};

  render() {
    const { bufferId } = this.props;
    const { textValue } = this.state;

    if (!bufferId) {
      return <View style={styles.container} />;
    }

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <Buffer
          bufferId={bufferId}
          onLongPress={this.onLongPress}
          parseArgs={this.parseArgs}
        />
        <View style={styles.bottomBox}>
          <Animated.View style={{ width: this.state.inputWidth }}>
            <TextInput
              style={styles.inputBox}
              value={textValue}
              onChangeText={this.handleChangeText}
              onFocus={() => this.handleOnFocus()}
              onBlur={() => this.handleOnBlur()}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={this.handleSubmit}
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

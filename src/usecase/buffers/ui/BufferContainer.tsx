import * as React from "react";
import {
  StyleSheet,
  AlertIOS,
  Linking,
  ActionSheetIOS,
  KeyboardAvoidingView,
  Keyboard,
  TextInput,
  Image,
  Easing,
  View,
  Text,
  EmitterSubscription,
  TouchableOpacity,
  LayoutAnimation
} from "react-native";

import { connect } from "react-redux";
import * as _ from "lodash";
import ParsedText from "react-native-parsed-text";

import { changeCurrentBuffer } from "../actions/BufferActions";

import BufferLine from "./BufferLine";
import Buffer from "./Buffer";
import { getParseArgs } from "../../../lib/helpers/parse-text-args";
import { formatUrl } from "../../../lib/helpers/url-formatter";
import { renderWeechatFormat } from "../../../lib/weechat/color-formatter";
import { StoreState } from "../../../store";

interface Props {
  buffer: WeechatBuffer | null;
  lines: WeechatLine[];
  nicklist: WeechatNicklist[];
  bufferId: string;
  showTopic: boolean;
  sendMessage: (message: string) => void;
}

interface State {
  showTabButton: boolean;
  textValue: string;
}

class BufferContainer extends React.Component<Props, State> {
  state = {
    showTabButton: false,
    textValue: ""
  };

  parseArgs = getParseArgs(
    styles.link,
    this.handleOnPress,
    this.handleOnLongPress
  );

  handleOnFocus() {
    this.setState({
      showTabButton: true
    });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }
  handleOnBlur() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      showTabButton: false
    });
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

  tabCompleteNick = () => {
    const tokens = this.state.textValue.split(" ");
    const lastIndex = tokens.length - 1;
    const nickcomplete = tokens[lastIndex].toLowerCase();

    const alternatives = this.props.nicklist.filter(nick =>
      nick.name.toLowerCase().startsWith(nickcomplete)
    );

    if (alternatives[0]) {
      tokens[lastIndex] = alternatives[0].name + ": ";

      this.setState({
        textValue: tokens.join(" ")
      });
    }
  };

  onLongPress = () => {};

  render() {
    const { bufferId, buffer, showTopic, lines } = this.props;
    const { textValue, showTabButton } = this.state;

    if (!bufferId) {
      return <View style={styles.container} />;
    }

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        {showTopic && (
          <View>
            <Text>
              {renderWeechatFormat(buffer.title).map((props, index) => (
                <ParsedText {...props} key={index} parse={this.parseArgs} />
              ))}
            </Text>
          </View>
        )}
        <Buffer
          bufferId={bufferId}
          lines={lines}
          onLongPress={this.onLongPress}
          parseArgs={this.parseArgs}
        />
        <View style={styles.bottomBox}>
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
          {showTabButton && (
            <TouchableOpacity
              style={{ alignItems: "center", width: 40 }}
              onPress={this.tabCompleteNick}
            >
              <Image source={require("../../icons/long-arrow-right.png")} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    );
  }
}

export default connect((state: StoreState, { bufferId }: Props) => ({
  lines: state.lines[bufferId] || [],
  nicklist: state.nicklists[bufferId] || []
}))(BufferContainer);

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#333"
  },
  inputBox: {
    height: 25,
    paddingHorizontal: 5,
    justifyContent: "center",
    borderColor: "gray",
    backgroundColor: "#fff",
    flex: 1
  }
});

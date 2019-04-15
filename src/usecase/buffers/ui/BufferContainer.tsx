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
  selection: {start: number, end: number};
}

class BufferContainer extends React.Component<Props, State> {
  state = {
    showTabButton: false,
    textValue: "",
    selection: {
      start: 0,
      end: 0
    }
  };

  tabCompleteInProgress = false;
  tabCompleteMatches: WeechatNicklist[];
  tabCompleteIndex = 0;
  tabCompleteWordStart = 0;
  tabCompleteWordEnd = 0;

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

  clearTextInput = false;

  handleChangeText = (textValue: string) => {
    this.tabCompleteInProgress = false;
    this.setState({
      textValue: this.clearTextInput ? "" : textValue
    });
    this.clearTextInput = false
  };

  handleSubmit = () => {
    const { textValue } = this.state;
    textValue.split("\n").forEach((line) => {
      this.props.sendMessage(line);
    });
    this.clearTextInput = true;
  };

  tabCompleteNick = () => {
    const { textValue, selection } = this.state;
    const { nicklist } = this.props;

    if (!this.tabCompleteInProgress) {
      this.tabCompleteWordEnd = selection.start;

      this.tabCompleteWordStart = textValue.lastIndexOf(' ',
        this.tabCompleteWordEnd - 1) + 1;

      if (this.tabCompleteWordStart == this.tabCompleteWordEnd)
        return;

      const prefix = textValue.substring(this.tabCompleteWordStart,
        this.tabCompleteWordEnd).toLowerCase();

      this.tabCompleteMatches = nicklist.filter(nick =>
        nick.name.toLowerCase().startsWith(prefix)
      );
      if (this.tabCompleteMatches.length == 0) {
        return;
      }

      this.tabCompleteIndex = 0;
    } else {
      this.tabCompleteIndex = (this.tabCompleteIndex + 1) %
        this.tabCompleteMatches.length;
    }

    let nick = this.tabCompleteMatches[this.tabCompleteIndex].name;
    if (this.tabCompleteWordStart == 0) {
      nick += ": ";
    }

    this.setState({
      textValue: textValue.substring(0, this.tabCompleteWordStart) +
        nick + textValue.substring(this.tabCompleteWordEnd)
    });
    this.tabCompleteWordEnd = this.tabCompleteWordStart + nick.length;
    this.tabCompleteInProgress = true;
  };

  handleSelectionChange = ({ nativeEvent: { selection } }) => {
    this.setState({ selection })
  }

  onLongPress = () => {};

  render() {
    const { bufferId, buffer, showTopic, lines } = this.props;
    const { textValue, showTabButton, selection } = this.state;

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
            selection={selection}
            onSelectionChange={this.handleSelectionChange}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={this.handleSubmit}
            multiline={true}
            enablesReturnKeyAutomatically={true}
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
    paddingHorizontal: 10,
    paddingVertical: 7.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#333"
  },
  inputBox: {
    maxHeight: 60.5,
    padding: 5,
    justifyContent: "center",
    borderColor: "gray",
    backgroundColor: "#fff",
    flex: 1
  }
});

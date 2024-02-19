import * as React from 'react';
import {
  ActionSheetIOS,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import ParsedText from 'react-native-parsed-text';
import { connect, ConnectedProps } from 'react-redux';

import { getParseArgs } from '../../../lib/helpers/parse-text-args';
import { formatUrl } from '../../../lib/helpers/url-formatter';
import { renderWeechatFormat } from '../../../lib/weechat/color-formatter';
import { StoreState } from '../../../store';
import Buffer from './Buffer';

const connector = connect(
  (state: StoreState, { bufferId }: { bufferId: string }) => ({
    lines: state.lines[bufferId] || [],
    nicklist: state.nicklists[bufferId] || [],
    buffer: state.buffers[bufferId]
  })
);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
  bufferId: string;
  showTopic: boolean;
  sendMessage: (message: string) => void;
  fetchMoreLines: (lines: number) => void;
};

interface State {
  showTabButton: boolean;
  selection: { start: number; end: number };
}

class BufferContainer extends React.Component<Props, State> {
  state = {
    showTabButton: false,
    selection: {
      start: 0,
      end: 0
    }
  };

  tabCompleteInProgress = false;
  tabCompleteMatches: WeechatNicklist[] = [];
  tabCompleteIndex = 0;
  tabCompleteWordStart = 0;
  tabCompleteWordEnd = 0;

  textInput = React.createRef<TextInput>();
  textValue = '';

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

  handleOnLongPress(type: string, text: string) {
    ActionSheetIOS.showShareActionSheetWithOptions(
      {
        url: formatUrl(type, text),
        message: text
      },
      () => null,
      () => null
    );
  }

  handleOnPress(type: string, text: string) {
    console.log(type, text);
    if (type === 'channel') {
      // this.props.dispatch(changeCurrentBuffer(text));
    } else {
      Linking.openURL(formatUrl(type, text));
    }
  }

  handleChangeText = (textValue: string) => {
    this.tabCompleteInProgress = false;
    this.textValue = textValue;
  };

  handleSubmit = () => {
    this.textValue.split('\n').forEach((line) => {
      this.props.sendMessage(line);
    });
    this.handleChangeText('');
    this.textInput.current?.clear();
  };

  tabCompleteNick = () => {
    const { selection } = this.state;
    const { nicklist } = this.props;

    if (!this.tabCompleteInProgress) {
      this.tabCompleteWordEnd = selection.start;

      this.tabCompleteWordStart =
        this.textValue.lastIndexOf(' ', this.tabCompleteWordEnd - 1) + 1;

      if (this.tabCompleteWordStart == this.tabCompleteWordEnd) return;

      const prefix = this.textValue
        .substring(this.tabCompleteWordStart, this.tabCompleteWordEnd)
        .toLowerCase();

      this.tabCompleteMatches = nicklist.filter((nick) =>
        nick.name.toLowerCase().startsWith(prefix)
      );
      if (this.tabCompleteMatches.length == 0) {
        return;
      }

      this.tabCompleteIndex = 0;
    } else {
      this.tabCompleteIndex =
        (this.tabCompleteIndex + 1) % this.tabCompleteMatches.length;
    }

    let nick = this.tabCompleteMatches[this.tabCompleteIndex].name;
    if (this.tabCompleteWordStart == 0) {
      nick += ': ';
    }

    this.textInput.current?.setNativeProps({
      text: (this.textValue =
        this.textValue.substring(0, this.tabCompleteWordStart) +
        nick +
        this.textValue.substring(this.tabCompleteWordEnd))
    });
    this.tabCompleteWordEnd = this.tabCompleteWordStart + nick.length;
    this.tabCompleteInProgress = true;
  };

  handleSelectionChange = ({
    nativeEvent: { selection }
  }: {
    nativeEvent: { selection: { start: number; end: number } };
  }) => {
    this.setState({ selection });
  };

  onLongPress = () => {
    // not implemented
  };

  render() {
    const { bufferId, buffer, showTopic, lines } = this.props;
    const { showTabButton } = this.state;

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
          fetchMoreLines={this.props.fetchMoreLines}
        />
        <View style={styles.bottomBox}>
          <TextInput
            ref={this.textInput}
            style={styles.inputBox}
            onChangeText={this.handleChangeText}
            onFocus={() => this.handleOnFocus()}
            onBlur={() => this.handleOnBlur()}
            onSelectionChange={this.handleSelectionChange}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={this.handleSubmit}
            enablesReturnKeyAutomatically={true}
          />
          {showTabButton && (
            <TouchableOpacity
              style={{ alignItems: 'center', width: 40 }}
              onPress={this.tabCompleteNick}
            >
              <Image source={require('../../icons/long-arrow-right.png')} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    );
  }
}

export default connector(BufferContainer);

export const styles = StyleSheet.create({
  topbar: {
    height: 20,
    paddingHorizontal: 5,
    backgroundColor: '#001'
  },
  link: {
    textDecorationLine: 'underline'
  },
  text: {
    color: '#eee'
  },
  container: {
    flex: 1,
    backgroundColor: '#222'
  },
  main: {
    paddingVertical: 20
  },
  bottomBox: {
    paddingHorizontal: 10,
    paddingVertical: 7.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333'
  },
  inputBox: {
    maxHeight: 60.5,
    padding: 5,
    justifyContent: 'center',
    borderColor: 'gray',
    backgroundColor: '#fff',
    flex: 1
  }
});

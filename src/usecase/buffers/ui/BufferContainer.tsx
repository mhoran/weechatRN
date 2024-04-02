import * as React from 'react';
import {
  ActionSheetIOS,
  KeyboardAvoidingView,
  LayoutAnimation,
  Linking,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInputSelectionChangeEventData,
  TouchableOpacity,
  View
} from 'react-native';

import ParsedText from 'react-native-parsed-text';
import { connect, ConnectedProps } from 'react-redux';

import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { getParseArgs } from '../../../lib/helpers/parse-text-args';
import { formatUrl } from '../../../lib/helpers/url-formatter';
import { renderWeechatFormat } from '../../../lib/weechat/color-formatter';
import { WeeChatProtocol } from '../../../lib/weechat/parser';
import { StoreState } from '../../../store';
import Buffer from './Buffer';
import UndoTextInput from '../../shared/UndoTextInput';
import UploadButton from './UploadButton';
import { clearBufferNotificationAction } from '../../../store/actions';

const connector = connect((state: StoreState, { bufferId }: OwnProps) => ({
  lines: state.lines[bufferId] || [],
  nicklist: state.nicklists[bufferId] || [],
  buffer: state.buffers[bufferId],
  mediaUploadOptions: state.connection.mediaUploadOptions,
  notification:
    bufferId === state.app.notification?.bufferId &&
    state.app.notificationBufferLinesFetched
      ? state.app.notification
      : null
}));

type PropsFromRedux = ConnectedProps<typeof connector>;

type OwnProps = {
  bufferId: string;
  showTopic: boolean;
  sendMessage: (message: string) => void;
  fetchMoreLines: (lines: number) => void;
};

type Props = OwnProps & PropsFromRedux;

interface State {
  showTabButton: boolean;
  textValue: string;
  selection: { start: number; end: number };
}

class BufferContainer extends React.Component<Props, State> {
  state = {
    showTabButton: false,
    textValue: '',
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

  parseArgs = getParseArgs(
    styles.link,
    this.handleOnPress,
    this.handleOnLongPress
  );

  buffer = React.createRef<Buffer>();

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { notification } = this.props;
    if (
      notification &&
      notification.identifier !== prevProps.notification?.identifier
    ) {
      this.buffer.current?.scrollToLine(notification.lineId);
      this.props.dispatch(clearBufferNotificationAction());
    }
  }

  handleOnFocus = () => {
    this.setState({
      showTabButton: true
    });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  handleOnBlur = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      showTabButton: false
    });
  };

  handleOnLongPress(type: string, text: string) {
    ActionSheetIOS.showShareActionSheetWithOptions(
      {
        url: formatUrl(type, text)
      },
      () => null,
      () => null
    );
  }

  handleOnPress(type: string, text: string) {
    Linking.openURL(formatUrl(type, text));
  }

  handleChangeText = (textValue: string) => {
    this.tabCompleteInProgress = false;
    this.setState({ textValue });
  };

  handleSubmit = () => {
    const { textValue } = this.state;
    textValue.split('\n').forEach((line) => {
      this.props.sendMessage(line);
    });
    this.handleChangeText('');
  };

  tabCompleteNick = () => {
    const { textValue, selection } = this.state;
    const { nicklist } = this.props;

    if (!this.tabCompleteInProgress) {
      this.tabCompleteWordEnd = selection.start;

      this.tabCompleteWordStart =
        textValue.lastIndexOf(' ', this.tabCompleteWordEnd - 1) + 1;

      if (this.tabCompleteWordStart === this.tabCompleteWordEnd) return;

      const prefix = textValue
        .substring(this.tabCompleteWordStart, this.tabCompleteWordEnd)
        .toLowerCase();

      this.tabCompleteMatches = nicklist.filter((nick) =>
        nick.name.toLowerCase().startsWith(prefix)
      );
      if (this.tabCompleteMatches.length === 0) {
        return;
      }

      this.tabCompleteIndex = 0;
    } else {
      this.tabCompleteIndex =
        (this.tabCompleteIndex + 1) % this.tabCompleteMatches.length;
    }

    let nick = this.tabCompleteMatches[this.tabCompleteIndex].name;
    if (this.tabCompleteWordStart === 0) {
      nick += ': ';
    }

    this.setState({
      textValue:
        textValue.substring(0, this.tabCompleteWordStart) +
        nick +
        textValue.substring(this.tabCompleteWordEnd)
    });
    this.tabCompleteWordEnd = this.tabCompleteWordStart + nick.length;
    this.tabCompleteInProgress = true;
  };

  handleOnUpload = (url: string) => {
    this.setState(({ textValue, selection }) => ({
      textValue:
        textValue.substring(0, selection.start) +
        url +
        textValue.substring(selection.start)
    }));
  };

  handleSelectionChange = ({
    nativeEvent: { selection }
  }: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    this.setState({ selection });
  };

  onLongPress = (line: WeechatLine) => {
    const formattedPrefix = WeeChatProtocol.rawText2Rich(line.prefix);
    const prefix = formattedPrefix.map((node) => node.text);
    const formattedMessage = WeeChatProtocol.rawText2Rich(line.message);
    const message = formattedMessage.map((node) => node.text);

    ActionSheetIOS.showActionSheetWithOptions(
      { options: ['Copy', 'Cancel'], cancelButtonIndex: 2 },
      () => {
        const encloseNick =
          line.tags_array.includes('irc_privmsg') &&
          !line.tags_array.includes('irc_action');
        Clipboard.setStringAsync(
          `${encloseNick ? '<' : ''}${prefix.join('')}${encloseNick ? '>' : ''} ${message.join('')}`
        );
      }
    );
  };

  render() {
    const {
      bufferId,
      buffer,
      showTopic,
      lines,
      fetchMoreLines,
      mediaUploadOptions
    } = this.props;
    const { textValue, showTabButton } = this.state;

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
          ref={this.buffer}
          bufferId={bufferId}
          lines={lines}
          lastReadLine={buffer.last_read_line}
          onLongPress={this.onLongPress}
          parseArgs={this.parseArgs}
          fetchMoreLines={fetchMoreLines}
        />
        <View style={styles.bottomBox}>
          <UndoTextInput
            style={styles.inputBox}
            value={textValue}
            onChangeText={this.handleChangeText}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
            onSelectionChange={this.handleSelectionChange}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={this.handleSubmit}
            enablesReturnKeyAutomatically={true}
          />
          <UploadButton
            onUpload={this.handleOnUpload}
            style={styles.uploadButton}
            uploadOptions={mediaUploadOptions}
          />
          {showTabButton && (
            <TouchableOpacity
              style={styles.tabButton}
              onPress={this.tabCompleteNick}
            >
              <MaterialIcons name="keyboard-tab" size={27} color="white" />
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
  },
  uploadButton: {
    paddingLeft: 10
  },
  tabButton: {
    width: 40,
    paddingLeft: 10
  }
});

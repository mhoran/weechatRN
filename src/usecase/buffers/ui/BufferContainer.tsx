import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as React from 'react';
import type {
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData
} from 'react-native';
import {
  ActionSheetIOS,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import ParsedText from 'react-native-parsed-text';
import Animated, {
  FadeInRight,
  FadeOutRight,
  LinearTransition
} from 'react-native-reanimated';
import type { ConnectedProps } from 'react-redux';
import { connect } from 'react-redux';
import { getParseArgs } from '../../../lib/helpers/parse-text-args';
import { formatUrl } from '../../../lib/helpers/url-formatter';
import type RelayClient from '../../../lib/weechat/client';
import { renderWeechatFormat } from '../../../lib/weechat/color-formatter';
import type { StoreState } from '../../../store';
import * as actions from '../../../store/actions';
import { KeyboardAvoidingView } from '../../shared/KeyboardAvoidingView';
import Buffer from './Buffer';
import UploadButton from './UploadButton';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedIcon = Animated.createAnimatedComponent(MaterialIcons);

const connector = connect((state: StoreState, { bufferId }: OwnProps) => ({
  lines: state.lines[bufferId] ?? [],
  nicklist: state.nicklists[bufferId] ?? [],
  buffer: state.buffers[bufferId],
  mediaUploadOptions: state.connection.mediaUploadOptions,
  notification:
    bufferId === state.app.notification?.bufferId &&
    state.app.currentBufferLinesFetched
      ? state.app.notification
      : null
}));

type PropsFromRedux = ConnectedProps<typeof connector>;

type OwnProps = {
  bufferId: string;
  showTopic: boolean;
  client: RelayClient;
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

  handleLinkOnPress = (type: string, text: string) => {
    void Linking.openURL(formatUrl(type, text));
  };

  handleLinkOnLongPress = (type: string, text: string) => {
    ActionSheetIOS.showShareActionSheetWithOptions(
      {
        url: formatUrl(type, text)
      },
      () => null,
      () => null
    );
  };

  parseArgs = getParseArgs(
    styles.link,
    this.handleLinkOnPress,
    this.handleLinkOnLongPress
  );

  handleOnFocus = () => {
    this.setState({
      showTabButton: true
    });
  };

  handleOnBlur = () => {
    this.setState({
      showTabButton: false
    });
  };

  handleChangeText = (textValue: string) => {
    this.tabCompleteInProgress = false;
    this.setState({ textValue });
  };

  handleSubmit = () => {
    const { textValue } = this.state;
    textValue.split('\n').forEach((line) => {
      this.props.client.sendMessageToBuffer(this.props.buffer.full_name, line);
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

  handleLineOnLongPress = (line: WeechatLine) => {
    const prefix = renderWeechatFormat(line.prefix).map(
      (value) => value.children
    );
    const message = renderWeechatFormat(line.message).map(
      (value) => value.children
    );

    ActionSheetIOS.showActionSheetWithOptions(
      { options: ['Copy', 'Cancel'], cancelButtonIndex: 2 },
      () => {
        const encloseNick =
          line.tags_array.includes('irc_privmsg') &&
          !line.tags_array.includes('irc_action');
        void Clipboard.setStringAsync(
          `${encloseNick ? '<' : ''}${prefix.join('')}${encloseNick ? '>' : ''} ${message.join('')}`
        );
      }
    );
  };

  clearNotification = () => {
    this.props.dispatch(actions.clearBufferNotificationAction());
  };

  render() {
    const {
      bufferId,
      buffer,
      showTopic,
      lines,
      client,
      mediaUploadOptions,
      notification
    } = this.props;
    const { textValue, showTabButton } = this.state;

    return (
      <KeyboardAvoidingView style={styles.container} behavior="transform">
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
          lastReadLine={buffer.last_read_line}
          onLongPress={this.handleLineOnLongPress}
          parseArgs={this.parseArgs}
          client={client}
          notificationLineId={notification?.lineId}
          clearNotification={this.clearNotification}
        />
        <View style={styles.bottomBox}>
          <AnimatedTextInput
            layout={LinearTransition}
            style={styles.inputBox}
            value={textValue}
            onChangeText={this.handleChangeText}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
            onSelectionChange={this.handleSelectionChange}
            returnKeyType="send"
            submitBehavior="submit"
            onSubmitEditing={this.handleSubmit}
            enablesReturnKeyAutomatically={true}
            multiline={true}
            autoCorrect={false}
          />
          <Animated.View layout={LinearTransition}>
            <UploadButton
              onUpload={this.handleOnUpload}
              style={styles.uploadButton}
              uploadOptions={mediaUploadOptions}
            />
          </Animated.View>
          {showTabButton && (
            <TouchableOpacity
              style={styles.tabButton}
              onPress={this.tabCompleteNick}
            >
              <AnimatedIcon
                entering={FadeInRight}
                exiting={FadeOutRight}
                name="keyboard-tab"
                size={27}
                color="white"
              />
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
    backgroundColor: '#222',
    zIndex: -1
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

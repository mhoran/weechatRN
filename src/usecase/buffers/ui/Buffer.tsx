import { MaterialIcons } from '@expo/vector-icons';
import type { FlashListRef, ListRenderItem } from '@shopify/flash-list';
import { FlashList } from '@shopify/flash-list';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TextInput
} from 'react-native';
import { Button, StyleSheet, Text, View } from 'react-native';
import type { ParseShape } from 'react-native-parsed-text';
import type RelayClient from '../../../lib/weechat/client';
import BufferLine from './BufferLine';
import { styles as lineStyles } from './themes/Default';

interface Props {
  lines: WeechatLine[];
  lastReadLine?: number;
  onLongPress: (line: WeechatLine) => void;
  parseArgs: ParseShape[];
  bufferId: string;
  client: RelayClient;
  notificationLineId?: number;
  clearNotification: () => void;
}

const keyExtractor = (line: WeechatLine) => String(line.id);

interface HeaderProps {
  lines: WeechatLine[];
  fetchMoreLines: (lines: number) => void;
}

const Header: React.FC<HeaderProps> = ({ lines, fetchMoreLines }) => {
  const [desiredLines, setDesiredLines] = useState(
    Buffer.DEFAULT_LINE_INCREMENT
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(false);
  }, [lines]);

  if (!loading && lines.length < desiredLines) return;

  return (
    <Button
      title={loading ? 'Loading...' : 'Load more lines'}
      disabled={loading}
      onPress={() => {
        const next = desiredLines + Buffer.DEFAULT_LINE_INCREMENT;
        setLoading(true);
        setDesiredLines(next);
        fetchMoreLines(next);
      }}
    />
  );
};

const Buffer = ({
  lines,
  lastReadLine,
  onLongPress,
  parseArgs,
  bufferId,
  client,
  notificationLineId,
  clearNotification
}: Props) => {
  const measurer = useRef<TextInput>(null);
  const linesList = useRef<FlashListRef<WeechatLine>>(null);
  const listHeight = useRef(0);

  const [nickWidth, setNickWidth] = useState(0);
  const [showScrollToEndButton, setShowScrollToEndButton] = useState(false);

  useLayoutEffect(() => {
    measurer.current?.measure((x, y, width) => setNickWidth(width));
  }, []);

  useEffect(() => {
    if (notificationLineId === undefined) return;

    clearNotification();

    const index = lines.findIndex((line) => line.id === notificationLineId);
    if (index < 0) return;

    setTimeout(() => {
      void linesList.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5
      });
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationLineId]);

  const fetchMoreLines = useCallback(
    (lines: number) => {
      client.fetchBufferInfo(bufferId, lines);
    },
    [bufferId, client]
  );

  const renderBuffer: ListRenderItem<WeechatLine> = useCallback(
    ({ item, index }) => {
      let lastMessage;
      for (let i = index - 1; i >= 0; i--) {
        if (lines[i].displayed) {
          lastMessage = lines[i];
          break;
        }
      }

      return (
        <BufferLine
          line={item}
          onLongPress={onLongPress}
          parseArgs={parseArgs}
          nickWidth={nickWidth}
          lastReadLine={lastReadLine}
          lastMessageDate={lastMessage?.date}
        />
      );
    },
    [lastReadLine, lines, nickWidth, onLongPress, parseArgs]
  );

  const updateListHeight = useCallback(
    (event: LayoutChangeEvent) =>
      (listHeight.current = event.nativeEvent.layout.height),
    []
  );

  const handleOnScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {
        nativeEvent: {
          contentOffset: { y: contentOffsetY },
          contentSize: { height: contentHeight }
        }
      } = event;

      // FIXME: layoutMeasurement.height is incorrect when backgrounded on iOS
      if (contentOffsetY + listHeight.current < contentHeight) {
        setShowScrollToEndButton(true);
      } else {
        setShowScrollToEndButton(false);
      }
    },
    []
  );

  if (!nickWidth) {
    return (
      <View style={{ flex: 1, opacity: 0 }} aria-hidden>
        <Text
          ref={measurer}
          style={[lineStyles.text, { position: 'absolute' }]}
        >
          aaaaaaaa
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        ref={linesList}
        accessibilityLabel="Message list"
        style={styles.list}
        data={lines}
        key={bufferId}
        maintainVisibleContentPosition={{
          startRenderingFromBottom: true,
          autoscrollToBottomThreshold: 0.2,
          animateAutoScrollToBottom: false
        }}
        scrollsToTop={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        keyExtractor={keyExtractor}
        renderItem={renderBuffer}
        ListHeaderComponent={
          <Header lines={lines} fetchMoreLines={fetchMoreLines} />
        }
        onLayout={updateListHeight}
        onScroll={handleOnScroll}
      />
      {showScrollToEndButton && (
        <View style={styles.scrollToEndButton}>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={44}
            color="#fff"
            onPress={() => linesList.current?.scrollToEnd({ animated: true })}
            accessibilityLabel="Scroll to end"
          />
        </View>
      )}
    </View>
  );
};

Buffer.DEFAULT_LINE_INCREMENT = 300;

export default Buffer;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  list: {
    backgroundColor: '#2e3440'
  },
  scrollToEndButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    marginBottom: 10,
    marginRight: 10,
    width: 44,
    height: 44,
    borderRadius: '50%',
    backgroundColor: '#222',
    overflow: 'hidden'
  }
});

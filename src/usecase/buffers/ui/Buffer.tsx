import { MaterialIcons } from '@expo/vector-icons';
import type { FlashListRef, ListRenderItem } from '@shopify/flash-list';
import { FlashList } from '@shopify/flash-list';
import type { ViewToken } from '@shopify/flash-list';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewProps,
  TextInput
} from 'react-native';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  unreadButtonHeight: number;
}

const Header: React.FC<HeaderProps> = ({
  lines,
  fetchMoreLines,
  unreadButtonHeight
}) => {
  const [desiredLines, setDesiredLines] = useState(
    Buffer.DEFAULT_LINE_INCREMENT
  );
  const [loading, setLoading] = useState(false);
  const [prevLines, setPrevLines] = useState(lines);

  if (lines !== prevLines) {
    setPrevLines(lines);
    setLoading(false);
  }

  if (!loading && lines.length < desiredLines) return;

  return (
    <View
      style={{
        transform: [{ scaleY: -1 }],
        ...{ paddingTop: unreadButtonHeight }
      }}
    >
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
    </View>
  );
};

const renderScrollComponent = (props: ScrollViewProps) => (
  <ScrollView {...props} style={{ transform: [{ scaleY: -1 }] }} />
);

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
  const nickWidthMeasurer = useRef<TextInput>(null);
  const linesList = useRef<FlashListRef<WeechatLine>>(null);
  const jumpToUnreadButton = useRef<View>(null);
  const seenLastLine = useRef(false);

  const [nickWidth, setNickWidth] = useState(0);
  const [showScrollToEndButton, setShowScrollToEndButton] = useState(false);
  const [showJumpToUnread, setShowJumpToUnread] = useState(false);
  const [unreadButtonHeight, setUnreadButtonHeight] = useState(0);

  useLayoutEffect(() => {
    nickWidthMeasurer.current?.measure((x, y, width) => setNickWidth(width));
  }, []);

  useLayoutEffect(() => {
    if (!showJumpToUnread) {
      setUnreadButtonHeight(0);
      return;
    }

    jumpToUnreadButton.current?.measure((x, y, width, height) =>
      setUnreadButtonHeight(height)
    );
  }, [showJumpToUnread]);

  useLayoutEffect(() => {
    setShowScrollToEndButton(false);
    seenLastLine.current = false;
    setShowJumpToUnread(false);
  }, [bufferId]);

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
      client.fetchBufferLines(bufferId, lines);
    },
    [bufferId, client]
  );

  const renderBuffer: ListRenderItem<WeechatLine> = useCallback(
    ({ item, index }) => {
      let lastMessage;
      for (let i = index + 1; i < lines.length; i++) {
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

  const handleOnScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {
        nativeEvent: {
          contentOffset: { y: contentOffsetY },
          layoutMeasurement: { height: listHeight }
        }
      } = event;

      if (contentOffsetY > listHeight * 0.2) {
        setShowScrollToEndButton(true);
      } else {
        setShowScrollToEndButton(false);
      }
    },
    []
  );

  const handleViewableItemsChanged: (info: {
    viewableItems: ViewToken<WeechatLine>[];
  }) => void = useCallback(
    ({ viewableItems }) => {
      if (lastReadLine === undefined || seenLastLine.current) return;

      const item = viewableItems.find(
        (token) => token.item.id === lastReadLine
      )?.item;

      if (item) {
        setShowJumpToUnread(false);
        seenLastLine.current = true;
      } else {
        setShowJumpToUnread(true);
      }
    },
    [lastReadLine]
  );

  if (!nickWidth) {
    return (
      <View style={{ flex: 1, opacity: 0 }} aria-hidden>
        <Text
          ref={nickWidthMeasurer}
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
          disabled: true
        }}
        scrollsToTop={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        keyExtractor={keyExtractor}
        renderItem={renderBuffer}
        ListFooterComponent={
          <Header
            lines={lines}
            fetchMoreLines={fetchMoreLines}
            unreadButtonHeight={unreadButtonHeight}
          />
        }
        onScroll={handleOnScroll}
        onViewableItemsChanged={handleViewableItemsChanged}
        renderScrollComponent={renderScrollComponent}
      />
      {showJumpToUnread && (
        <View style={styles.jumpToUnreadWrapper}>
          <View ref={jumpToUnreadButton} style={styles.jumpToUnread}>
            <Text
              style={{ color: '#fff' }}
              accessibilityLabel="Scroll to unread"
              onPress={() => {
                const index = lines.findIndex(
                  (item) => item.id === lastReadLine
                );
                if (index < 0) {
                  linesList.current?.scrollToEnd({ animated: true });
                  return;
                }
                void linesList.current?.scrollToIndex({
                  index: index,
                  animated: true,
                  viewPosition: 1
                });
              }}
            >
              Scroll to unread
            </Text>
          </View>
        </View>
      )}
      {showScrollToEndButton && (
        <View style={styles.scrollToEndButton}>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={44}
            color="#fff"
            onPress={() => {
              linesList.current?.scrollToTop({ animated: true });
            }}
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
  },
  jumpToUnreadWrapper: {
    position: 'absolute',
    top: 0,
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  jumpToUnread: {
    backgroundColor: '#222',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  }
});

import * as React from 'react';
import {
  Button,
  CellRendererProps,
  FlatList,
  LayoutChangeEvent,
  ListRenderItem,
  Text,
  View
} from 'react-native';

import { useEffect, useState } from 'react';
import { ParseShape } from 'react-native-parsed-text';
import BufferLine from './BufferLine';
import { styles as lineStyles } from './themes/Default';

interface Props {
  lines: WeechatLine[];
  lastReadLine?: string;
  onLongPress: (line: WeechatLine) => void;
  parseArgs: ParseShape[];
  bufferId: string;
  fetchMoreLines: (lines: number) => void;
  notificationLineId?: string;
  clearNotification: () => void;
}

const keyExtractor = (line: WeechatLine) =>
  line.pointers[line.pointers.length - 1];

interface HeaderProps {
  bufferId: string;
  lines: number;
  fetchMoreLines: (lines: number) => void;
}

const Header: React.FC<HeaderProps> = ({ bufferId, lines, fetchMoreLines }) => {
  const [desiredLines, setDesiredLines] = useState(
    Buffer.DEFAULT_LINE_INCREMENT
  );
  useEffect(() => {
    setDesiredLines(Buffer.DEFAULT_LINE_INCREMENT);
  }, [bufferId]);

  if (lines < desiredLines) return;

  return (
    <Button
      title="Load more lines"
      onPress={() => {
        const next = desiredLines + Buffer.DEFAULT_LINE_INCREMENT;
        fetchMoreLines(next);
        setDesiredLines(next);
      }}
    />
  );
};

interface State {
  nickWidth: number;
  linesListKey: number;
  initialNumToRender: number;
}

export default class Buffer extends React.PureComponent<Props, State> {
  static readonly DEFAULT_LINE_INCREMENT = 300;
  static readonly NUM_LINES_TO_RENDER = 35;

  linesList = React.createRef<FlatList<WeechatLine>>();

  state: State = {
    nickWidth: 0,
    linesListKey: 0,
    initialNumToRender: 35
  };

  notificationLineId: string | null = null;

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { notificationLineId, clearNotification, lines } = this.props;

    if (
      notificationLineId &&
      notificationLineId !== prevProps.notificationLineId
    ) {
      clearNotification();

      const index = lines.findIndex(
        (line) => line.pointers.at(-1) === notificationLineId
      );
      if (index < 0) return;

      this.notificationLineId = notificationLineId;
      this.setState((state) => ({
        linesListKey: state.linesListKey + 1,
        initialNumToRender: index + 1 + Buffer.NUM_LINES_TO_RENDER
      }));

      return;
    }

    if (this.props.bufferId !== prevProps.bufferId) {
      this.setState((state) => ({
        linesListKey: state.linesListKey + 1,
        initialNumToRender: 35
      }));
    }
  }

  renderBuffer: ListRenderItem<WeechatLine> = ({ item, index }) => {
    const { onLongPress, parseArgs, lastReadLine, lines } = this.props;
    const { nickWidth } = this.state;

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
  };

  renderCell: React.FC<CellRendererProps<WeechatLine>> = ({
    cellKey,
    index,
    item,
    ...props
  }) => {
    const isNotificationLine =
      this.notificationLineId &&
      this.notificationLineId === item.pointers.at(-1);

    const onLayout = (event: LayoutChangeEvent) => {
      props.onLayout?.(event);

      this.notificationLineId = null;

      this.linesList.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5
      });
    };

    return (
      <View
        {...props}
        testID={`renderCell(${index})`}
        onLayout={isNotificationLine ? onLayout : props.onLayout}
      />
    );
  };

  render() {
    const { bufferId, lines, fetchMoreLines } = this.props;
    const { linesListKey, initialNumToRender } = this.state;

    if (!this.state.nickWidth) {
      return (
        <View style={{ flex: 1, opacity: 0 }} aria-hidden>
          <Text
            onLayout={(layout) => {
              this.setState({ nickWidth: layout.nativeEvent.layout.width });
            }}
            style={[lineStyles.text, { position: 'absolute' }]}
          >
            aaaaaaaa
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        ref={this.linesList}
        accessibilityLabel="Message list"
        data={lines}
        key={linesListKey}
        inverted
        keyboardDismissMode="interactive"
        keyExtractor={keyExtractor}
        renderItem={this.renderBuffer}
        initialNumToRender={initialNumToRender}
        maxToRenderPerBatch={Buffer.NUM_LINES_TO_RENDER}
        removeClippedSubviews={true}
        windowSize={15}
        CellRendererComponent={this.renderCell}
        ListFooterComponent={
          <Header
            bufferId={bufferId}
            lines={lines.length}
            fetchMoreLines={fetchMoreLines}
          />
        }
      />
    );
  }
}

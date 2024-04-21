import * as React from 'react';
import {
  Button,
  CellRendererProps,
  FlatList,
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
}

export default class Buffer extends React.PureComponent<Props, State> {
  static readonly DEFAULT_LINE_INCREMENT = 300;

  linesList = React.createRef<FlatList<WeechatLine>>();

  state: State = {
    nickWidth: 0,
    linesListKey: 0
  };

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>
  ): void {
    const { notificationLineId, clearNotification } = this.props;
    const { linesListKey } = this.state;

    if (
      this.props.bufferId !== prevProps.bufferId ||
      (notificationLineId &&
        notificationLineId !== prevProps.notificationLineId)
    ) {
      this.setState((state) => ({ linesListKey: state.linesListKey + 1 }));
    }

    if (notificationLineId && linesListKey !== prevState.linesListKey) {
      this.scrollToLine(notificationLineId);
      clearNotification();
    }
  }

  onCellLayout?: (index: number) => void;

  onScrollToIndexFailed = async (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    this.linesList.current?.scrollToIndex({
      index: info.highestMeasuredFrameIndex,
      animated: false
    });

    await new Promise<void>((resolve) => {
      this.onCellLayout = (index: number) => {
        if (index > info.highestMeasuredFrameIndex) resolve();
      };
    });
    this.onCellLayout = undefined;

    this.linesList.current?.scrollToIndex({
      index: info.index,
      animated: false,
      viewPosition: 0.5
    });
  };

  scrollToLine = async (lineId: string) => {
    const index = this.props.lines.findIndex(
      (line) => line.pointers[line.pointers.length - 1] === lineId
    );
    if (index < 0) return;

    this.linesList.current?.scrollToIndex({
      index: index,
      animated: false,
      viewPosition: 0.5
    });
  };

  renderBuffer: ListRenderItem<WeechatLine> = ({ item, index }) => {
    const { onLongPress, parseArgs, lastReadLine, lines } = this.props;
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
        nickWidth={this.state.nickWidth}
        lastReadLine={lastReadLine}
        lastMessageDate={lastMessage?.date}
      />
    );
  };

  renderCell: React.FC<CellRendererProps<WeechatLine>> = ({
    index,
    children,
    onLayout,
    style
  }) => {
    return (
      <View
        testID={`renderCell(${index})`}
        style={style}
        onLayout={(event) => {
          onLayout?.(event);
          this.onCellLayout?.(index);
        }}
      >
        {children}
      </View>
    );
  };

  render() {
    const { bufferId, lines, fetchMoreLines } = this.props;
    const { linesListKey } = this.state;

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
        initialNumToRender={35}
        maxToRenderPerBatch={35}
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
        onScrollToIndexFailed={this.onScrollToIndexFailed}
      />
    );
  }
}

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
import Measurer from './Measurer';
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
  messageWidth?: number;
}

export default class Buffer extends React.PureComponent<Props, State> {
  static readonly DEFAULT_LINE_INCREMENT = 300;

  linesList = React.createRef<FlatList<WeechatLine>>();

  state: State = {
    nickWidth: 0
  };

  measurer = new Measurer();

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>
  ): void {
    const { notificationLineId, clearNotification } = this.props;

    if (
      notificationLineId &&
      notificationLineId !== prevProps.notificationLineId
    ) {
      this.scrollToLine(notificationLineId);
      clearNotification();
    }

    if (this.state.messageWidth !== prevState.messageWidth)
      this.measurer.messageWidth = this.state.messageWidth;
  }

  scrollToLine = (lineId: string) => {
    const index = this.props.lines.findIndex(
      (line) => line.pointers[line.pointers.length - 1] === lineId
    );
    if (index < 0) return;

    this.linesList.current?.scrollToIndex({
      index: index,
      animated: true,
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

  getItemLayout = (
    data: ArrayLike<WeechatLine> | null | undefined,
    index: number
  ): { length: number; offset: number; index: number } => {
    console.log('getItemLayout', index);
    const result = this.measurer.measure(data, index);
    return { length: result.height, offset: result.offset, index: index };
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
          console.log('onLayout', index, event.nativeEvent.layout);
        }}
      >
        {children}
      </View>
    );
  };

  render() {
    const { bufferId, lines, fetchMoreLines } = this.props;

    if (!this.state.nickWidth || !this.state.messageWidth) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            opacity: 100,
            paddingHorizontal: 10,
            alignItems: 'flex-start'
          }}
          aria-hidden
        >
          <Text
            onLayout={(layout) => {
              this.setState({ nickWidth: layout.nativeEvent.layout.width });
            }}
            style={[lineStyles.text]}
          >
            aaaaaaaa
          </Text>
          <Text> </Text>
          <Text
            onLayout={(layout) => {
              this.setState({ messageWidth: layout.nativeEvent.layout.width });
            }}
            style={[lineStyles.text, { flex: 1 }]}
          ></Text>
          <Text style={lineStyles.text}> 00:00</Text>
        </View>
      );
    }

    return (
      <FlatList
        ref={this.linesList}
        accessibilityLabel="Message list"
        data={lines}
        key={bufferId}
        inverted
        keyboardDismissMode="interactive"
        keyExtractor={keyExtractor}
        renderItem={this.renderBuffer}
        initialNumToRender={35}
        maxToRenderPerBatch={35}
        removeClippedSubviews={true}
        windowSize={3}
        CellRendererComponent={this.renderCell}
        ListFooterComponent={
          <Header
            bufferId={bufferId}
            lines={lines.length}
            fetchMoreLines={fetchMoreLines}
          />
        }
        getItemLayout={this.getItemLayout}
      />
    );
  }
}

import * as React from 'react';
import { Button, View } from 'react-native';

import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { ParseShape } from 'react-native-parsed-text';
import { cef } from '../../../lib/weechat/colors';
import BufferLine from './BufferLine';

interface Props {
  lines: WeechatLine[];
  lastReadLine?: string;
  onLongPress: () => void;
  parseArgs: ParseShape[];
  bufferId: string;
  fetchMoreLines: (lines: number) => void;
}

interface State {
  desiredLines: number;
  bufferId: string;
}

const keyExtractor = (line: WeechatLine) =>
  line.pointers[line.pointers.length - 1];

export default class Buffer extends React.PureComponent<Props, State> {
  static readonly DEFAULT_LINE_INCREMENT = 300;

  linesList = React.createRef<FlashList<WeechatLine>>();

  state = {
    desiredLines: Buffer.DEFAULT_LINE_INCREMENT,
    bufferId: this.props.bufferId
  };

  static getDerivedStateFromProps = (props: Props, state: State) => {
    if (props.bufferId !== state.bufferId)
      return {
        desiredLines: Buffer.DEFAULT_LINE_INCREMENT,
        bufferId: props.bufferId
      };
    else return null;
  };

  componentDidUpdate(prevProps: Props) {
    const { bufferId } = this.props;
    if (bufferId !== prevProps.bufferId) {
      this.linesList.current?.scrollToOffset({ animated: false, offset: 0 });
    }
  }

  renderBuffer: ListRenderItem<WeechatLine> = ({ item }) => {
    const { onLongPress, parseArgs, lastReadLine } = this.props;
    const marker = item.pointers.at(-1) === lastReadLine;

    return (
      <>
        {item.displayed !== 0 && (
          <BufferLine
            line={item}
            onLongPress={onLongPress}
            parseArgs={parseArgs}
          />
        )}
        {marker && <View style={{ borderWidth: 1, borderColor: cef[5] }} />}
      </>
    );
  };

  renderMoreLinesButton = () => {
    const { lines } = this.props;
    if (lines.length < this.state.desiredLines) return;

    return (
      <Button
        title="Load more lines"
        onPress={() => {
          const desiredLines =
            this.state.desiredLines + Buffer.DEFAULT_LINE_INCREMENT;
          this.props.fetchMoreLines(desiredLines);
          this.setState(() => ({ desiredLines }));
        }}
      />
    );
  };

  render(): JSX.Element {
    const { lines } = this.props;
    return (
      <FlashList
        ref={this.linesList}
        data={lines}
        inverted
        keyboardDismissMode="interactive"
        keyExtractor={keyExtractor}
        renderItem={this.renderBuffer}
        ListFooterComponent={this.renderMoreLinesButton}
        estimatedItemSize={44}
      />
    );
  }
}

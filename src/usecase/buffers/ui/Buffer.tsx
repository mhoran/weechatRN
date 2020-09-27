import * as React from 'react';
import { FlatList, ListRenderItem } from 'react-native';

import BufferLine from './BufferLine';
import { ParseShape } from 'react-native-parsed-text';

interface Props {
  lines: WeechatLine[];
  onLongPress: () => void;
  parseArgs: ParseShape[];
  bufferId: string;
}

const keyExtractor = (line: WeechatLine) =>
  line.pointers[line.pointers.length - 1];

export default class Buffer extends React.PureComponent<Props> {
  renderBuffer: ListRenderItem<WeechatLine> = ({ item }) => {
    const { onLongPress, parseArgs } = this.props;

    return (
      <BufferLine line={item} onLongPress={onLongPress} parseArgs={parseArgs} />
    );
  };

  render(): JSX.Element {
    const { lines } = this.props;
    return (
      <FlatList
        data={lines.filter((line) => line.displayed !== 0)}
        inverted
        keyboardDismissMode="interactive"
        keyExtractor={keyExtractor}
        renderItem={this.renderBuffer}
      />
    );
  }
}

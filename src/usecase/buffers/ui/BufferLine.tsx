import * as React from 'react';
import { ParseShape } from 'react-native-parsed-text';

import Default from './themes/Default';

interface Props {
  line: WeechatLine;
  onLongPress: (line: WeechatLine) => void;
  parseArgs: ParseShape[];
}

export default class BufferLine extends React.PureComponent<Props> {
  render(): JSX.Element {
    const { line, onLongPress, parseArgs } = this.props;

    return (
      <Default line={line} onLongPress={onLongPress} parseArgs={parseArgs} />
    );
  }
}

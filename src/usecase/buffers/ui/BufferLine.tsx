import * as React from "react";

import Default from "./themes/Default";
import Messenger from "./themes/Messenger";

interface Props {
  line: WeechatLine;
  onLongPress: (any) => any;
  parseArgs: any;
}

export default class BufferLine extends React.PureComponent<Props> {
  render() {
    const { line, onLongPress, parseArgs } = this.props;

    return (
      <Default line={line} onLongPress={onLongPress} parseArgs={parseArgs} />
    );
  }
}

import React from "react";

import Default from "./themes/Default";
import Messenger from "./themes/Messenger";

export default class BufferLine extends React.Component {
  render() {
    const { line, onLongPress, parseArgs } = this.props;

    return (
      <Default line={line} onLongPress={onLongPress} parseArgs={parseArgs} />
    );
  }
}

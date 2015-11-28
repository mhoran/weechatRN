import React from 'react-native';

const {
    Component,
    } = React;

import Default from './themes/Default';
import Messenger from './themes/Messenger';

export default class BufferLine extends Component {
    render() {
        let { line, onLongPress, parseArgs } = this.props;

        return (
            <Default line={line} onLongPress={onLongPress} parseArgs={parseArgs} />
        );
    }
};
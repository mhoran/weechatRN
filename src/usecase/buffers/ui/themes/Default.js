import React from 'react-native';

import ParsedText from 'react-native-parsed-text';

import { hashNickToColor } from '../../../../lib/helpers/colorizer';

const {
    Component,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
    } = React;

const highlightedViewStyles = (line) => {
    if (line.highlight) {
        return {
            backgroundColor: '#FFCF7F',
        };
    } else {
        return null;
    }
};

const getHighlightedTextStyles = (line) => {
    if (line.highlight) {
        return {
            color: '#000'
        };
    } else {
        return null;
    }
};


export default class BufferLine extends Component {
    render() {
        let { line, onLongPress, parseArgs } = this.props;
        return (
            <TouchableHighlight onLongPress={() => onLongPress(line)}>
                <View style={[styles.container, highlightedViewStyles(line)]}>
                    <View style={styles.metaContainer}>
                        <View style={styles.userContainer}>
                            <Text style={[styles.text, styles.meta, {color: hashNickToColor(line.nick)}, getHighlightedTextStyles(line)]}>
                                {line.nick}
                            </Text>
                        </View>
                        <Text style={[styles.text, styles.meta, getHighlightedTextStyles(line)]}>{line.time}</Text>
                    </View>
                    <View style={[styles.messageContainer, highlightedViewStyles(line)]}>
                        <ParsedText
                            style={[styles.text, {color: hashNickToColor(line.nick)}, getHighlightedTextStyles(line)]}
                            parse={parseArgs}>
                        {line.message}
                        </ParsedText>
                    </View>
                </View>
            </TouchableHighlight>
        );
    }
};



const styles = StyleSheet.create({
    container: {
        backgroundColor: '#222',
        paddingTop: 4,
        paddingBottom: 8,
        paddingHorizontal: 7,
    },
    metaContainer: {
        flexDirection: 'row',
        paddingBottom: 2,
    },
    userContainer: {
        flex: 1,
    },
    messageContainer: {
        flex: 1,
        paddingHorizontal: 5,
    },
    text: {
        fontFamily: 'Menlo',
        color: '#eee',
        fontSize: 12
    },
    meta: {
        fontSize: 10
    }
});
import * as React from "react";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  TextStyle
} from "react-native";

import ParsedText from "react-native-parsed-text";
import {
  renderWeechatFormat,
  getHighlightedViewStyles,
  getHighlightedTextStyles
} from "../../../../lib/weechat/color-formatter";
import { formatDate } from "../../../../lib/helpers/date-formatter";

interface Props {
  line: WeechatLine;
  onLongPress: (any) => any;
  parseArgs: any;
}

export default class BufferLine extends React.Component<Props> {
  render() {
    const { line, onLongPress, parseArgs } = this.props;
    return (
      <TouchableHighlight onLongPress={() => onLongPress(line)}>
        <View style={[styles.container, getHighlightedViewStyles(line)]}>
          <View style={styles.metaContainer}>
            <View style={styles.userContainer}>
              <Text style={[styles.text, styles.meta]}>
                {renderWeechatFormat(line.prefix).map((props, index) => (
                  <Text {...props} key={index} />
                ))}
              </Text>
            </View>
            <Text
              style={[styles.text, styles.meta, getHighlightedTextStyles(line)]}
            >
              {formatDate(line.date_printed)}
            </Text>
          </View>
          <View
            style={[styles.messageContainer, getHighlightedViewStyles(line)]}
          >
            <Text style={styles.text}>
              {renderWeechatFormat(line.message).map((props, index) => (
                <ParsedText {...props} key={index} parse={parseArgs} />
              ))}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2e3440",
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 7
  },
  metaContainer: {
    flexDirection: "row",
    paddingBottom: 2
  },
  userContainer: {
    flex: 1
  },
  messageContainer: {
    flex: 1,
    paddingHorizontal: 5
  },
  text: {
    fontFamily: "Menlo",
    color: "#eee",
    fontSize: 12
  },
  meta: {
    fontSize: 10
  }
});

import * as React from "react";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";

import ParsedText from "react-native-parsed-text";
import {
  renderWeechatFormat,
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
        <View style={[styles.container]}>
          <View style={styles.metaContainer}>
            <View style={styles.userContainer}>
              <Text style={[styles.text, styles.meta]}>
                {renderWeechatFormat(line.prefix).map((props, index) => {
                  const { style, ...rest } = props;
                  return (
                    <Text {...rest} key={index}
                      style={ line.highlight ? styles.highlight : style }
                    />
                  )
                })}
              </Text>
            </View>
            <Text
              style={[styles.text, styles.meta]}
            >
              {formatDate(line.date)}
            </Text>
          </View>
          <View
            style={[styles.messageContainer]}
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
  },
  highlight: {
    backgroundColor: "magenta",
    color: "yellow"
  }
});

import React from "react";
import {
  StyleSheet,
  Text,
  Dimensions,
  TouchableHighlight,
  View
} from "react-native";

const highlightedViewStyles = line => {};

const getHighlightedTextStyles = line => {};

const messageIsFromMe = line => {
  return line.nick === "Ndushi";
};

export default class BufferLine extends React.Component {
  render() {
    const { line } = this.props;
    return (
      <View style={[styles.container, highlightedViewStyles(line)]}>
        <View style={styles.metaContainer}>
          <View style={styles.userContainer}>
            {messageIsFromMe(line) ? null : (
              <Text
                style={[
                  styles.text,
                  styles.meta,
                  getHighlightedTextStyles(line)
                ]}
              >
                {line.nick}
              </Text>
            )}
          </View>
        </View>
        <View style={messageIsFromMe(line) ? { alignItems: "flex-end" } : null}>
          <TouchableHighlight
            style={[
              styles.messageContainer,
              messageIsFromMe(line) ? { backgroundColor: "#067FFF" } : null
            ]}
            underlayColor="#aaa"
          >
            <View style={highlightedViewStyles(line)}>
              <Text
                style={[
                  styles.text,
                  messageIsFromMe(line) ? { color: "#FFF" } : null,
                  getHighlightedTextStyles(line)
                ]}
              >
                {line.message}
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 7
  },
  metaContainer: {
    flexDirection: "row",
    paddingBottom: 2
  },
  userContainer: {
    paddingHorizontal: 10,
    flex: 1
  },
  messageContainer: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    width: width * 0.7,
    backgroundColor: "#E5E5EA",
    borderRadius: 15
  },
  text: {
    color: "#000",
    fontSize: 14
  },
  meta: {
    fontSize: 9
  }
});

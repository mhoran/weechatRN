import React from "react";
import {
  StyleSheet,
  Dimensions,
  Text,
  TouchableHighlight,
  ScrollView,
  View
} from "react-native";

export default class BufferList extends React.Component {
  render() {
    const { buffers, onSelectBuffer, currentBufferName } = this.props;

    const buffersList = Object.keys(buffers).map(key => buffers[key]);

    return (
      <View style={styles.container}>
        <View style={styles.topbar} />
        <ScrollView style={styles.container}>
          {buffersList.map(buffer => (
            <TouchableHighlight
              key={buffer.name}
              onPress={() => onSelectBuffer(buffer)}
              underlayColor="#F2777A"
              style={[
                styles.listItem,
                currentBufferName === buffer.name
                  ? { backgroundColor: "#F2777A" }
                  : null
              ]}
            >
              <View style={styles.row}>
                <View style={styles.bufferName}>
                  <Text
                    style={[
                      styles.listItemText,
                      currentBufferName !== buffer.name
                        ? { color: "#888" }
                        : null
                    ]}
                  >
                    {buffer.name}
                  </Text>
                </View>
                <Text style={styles.listItemText}>1</Text>
              </View>
            </TouchableHighlight>
          ))}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212"
  },
  topbar: {
    height: 30
  },
  row: {
    flexDirection: "row"
  },
  bufferName: {
    flex: 1
  },
  listItem: {
    flex: 1,
    height: 40,
    paddingHorizontal: 20,
    justifyContent: "center"
  },
  listItemText: {
    color: "#eee",
    fontFamily: "Thonburi",
    fontWeight: "bold",
    fontSize: 15
  }
});

import * as React from 'react';
import type { TextStyle } from 'react-native';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';

interface Props {
  buffer: WeechatBuffer;
  hotlist: Hotlist;
  isCurrentBuffer: boolean;
  onSelectBuffer: (b: WeechatBuffer) => void;
  filterBuffers: boolean;
}

export default class BufferListItem extends React.PureComponent<Props> {
  getBufferViewStyleFromProps = (): TextStyle | null => {
    const { isCurrentBuffer, hotlist } = this.props;

    if (isCurrentBuffer) {
      return { backgroundColor: '#f2777a' };
    } else if (hotlist.highlight > 0) {
      return { backgroundColor: '#ffcf7f' };
    } else if (hotlist.sum > 0) {
      return { backgroundColor: '#3b4252' };
    } else {
      return null;
    }
  };

  getBufferTextStyleFromProps = (): TextStyle | null => {
    const { isCurrentBuffer, hotlist } = this.props;

    if (isCurrentBuffer) {
      return { color: '#fff' };
    } else if (hotlist.highlight > 0) {
      return { color: '#000' };
    } else if (hotlist.sum > 0) {
      return { color: '#ebcb8b' };
    } else {
      return null;
    }
  };

  render() {
    const { buffer, hotlist, onSelectBuffer, filterBuffers, isCurrentBuffer } =
      this.props;

    if (
      filterBuffers &&
      !isCurrentBuffer &&
      (!buffer.local_variables.type ||
        buffer.local_variables.type === 'server') &&
      hotlist.sum === 0
    )
      return;

    return (
      <TouchableHighlight
        onPress={() => onSelectBuffer(buffer)}
        underlayColor="#F2777A"
        style={[styles.listItem, this.getBufferViewStyleFromProps()]}
      >
        <View style={styles.row}>
          <View style={styles.bufferName}>
            <Text
              style={[styles.listItemText, this.getBufferTextStyleFromProps()]}
            >
              {buffer.short_name || buffer.full_name}
            </Text>
          </View>
          {hotlist.sum > 0 && (
            <Text
              style={[styles.listItemText, this.getBufferTextStyleFromProps()]}
            >
              {hotlist.sum}
            </Text>
          )}
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  listItem: {
    flex: 1,
    height: 40,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  listItemText: {
    color: '#eee',
    fontFamily: 'Thonburi',
    fontWeight: 'bold',
    fontSize: 15
  },
  row: {
    flexDirection: 'row'
  },
  bufferName: {
    flex: 1
  }
});

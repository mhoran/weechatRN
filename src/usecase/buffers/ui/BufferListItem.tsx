import * as React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableHighlight,
  View
} from 'react-native';

interface Props {
  buffer: WeechatBuffer;
  hotlist: Hotlist;
  currentBufferId: string | null;
  onSelectBuffer: (b: WeechatBuffer) => void;
}

export default class BufferListItem extends React.Component<Props> {
  getBufferViewStyleFromProps = (): TextStyle | null => {
    const { currentBufferId, buffer, hotlist } = this.props;

    if (currentBufferId === buffer.id) {
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
    const { currentBufferId, buffer, hotlist } = this.props;

    if (currentBufferId === buffer.id) {
      return { color: '#fff' };
    } else if (hotlist.highlight > 0) {
      return { color: '#000' };
    } else if (hotlist.sum > 0) {
      return { color: '#ebcb8b' };
    } else {
      return null;
    }
  };

  render(): JSX.Element {
    const { buffer, hotlist, onSelectBuffer } = this.props;

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

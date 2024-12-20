import type * as React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import type { ParseShape } from 'react-native-parsed-text';
import ParsedText from 'react-native-parsed-text';
import { formatDate } from '../../../../lib/helpers/date-formatter';
import { renderWeechatFormat } from '../../../../lib/weechat/color-formatter';

interface Props {
  line: WeechatLine;
  onLongPress: (line: WeechatLine) => void;
  parseArgs: ParseShape[];
  nickWidth: number;
}

const BufferLine: React.FC<Props> = ({
  line,
  onLongPress,
  parseArgs,
  nickWidth
}) => {
  return (
    <TouchableHighlight onLongPress={() => onLongPress(line)}>
      <View style={[styles.container]}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.text,
            {
              width: nickWidth,
              textAlign: 'right'
            }
          ]}
        >
          {renderWeechatFormat(line.prefix).map((props, index) => {
            const { style, ...rest } = props;
            return (
              <Text
                {...rest}
                key={index}
                style={[line.highlight ? styles.highlight : style]}
              />
            );
          })}
        </Text>
        <Text style={styles.text}> </Text>

        <View style={[styles.messageContainer]}>
          <Text style={styles.text}>
            {renderWeechatFormat(line.message).map((props, index) => (
              <ParsedText {...props} key={index} parse={parseArgs} />
            ))}
          </Text>
        </View>

        <Text style={[styles.text]}> {formatDate(line.date)}</Text>
      </View>
    </TouchableHighlight>
  );
};

export default BufferLine;

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2e3440',
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: 'row'
  },
  messageContainer: {
    flex: 1
  },
  text: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#eee',
    fontSize: 14
  },
  highlight: {
    backgroundColor: 'magenta',
    color: 'yellow'
  }
});

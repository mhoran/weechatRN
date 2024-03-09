import { ParseShape } from 'react-native-parsed-text';

import { Text, View } from 'react-native';
import { formatDateDayChange } from '../../../lib/helpers/date-formatter';
import { cof } from '../../../lib/weechat/colors';
import Default, { styles } from './themes/Default';

interface Props {
  line: WeechatLine;
  onLongPress: (line: WeechatLine) => void;
  parseArgs: ParseShape[];
  marker: boolean;
  letterWidth: number;
  showDate: boolean;
}

const BufferLine: React.FC<Props> = ({
  line,
  onLongPress,
  parseArgs,
  marker,
  letterWidth,
  showDate
}) => {
  return (
    <>
      {showDate && (
        <View style={[styles.container]}>
          <Text style={[styles.text, { color: cof.chat_day_change.color }]}>
            -- {formatDateDayChange(line.date)} --
          </Text>
        </View>
      )}
      {line.displayed !== 0 && (
        <Default
          line={line}
          onLongPress={onLongPress}
          parseArgs={parseArgs}
          letterWidth={letterWidth}
        />
      )}
      {marker && (
        <View
          style={{ borderWidth: 1, borderColor: cof.chat_read_marker.color }}
        />
      )}
    </>
  );
};

export default BufferLine;

import { ParseShape } from 'react-native-parsed-text';

import { Text, View } from 'react-native';
import { formatDateDayChange } from '../../../lib/helpers/date-formatter';
import { cof } from '../../../lib/weechat/colors';
import Default, { styles } from './themes/Default';
import { isSameDay } from 'date-fns';

interface Props {
  line: WeechatLine;
  onLongPress: (line: WeechatLine) => void;
  parseArgs: ParseShape[];
  letterWidth: number;
  lastReadLine?: string;
  lastMessageDate?: string;
}

const BufferLine: React.FC<Props> = ({
  line,
  onLongPress,
  parseArgs,
  letterWidth,
  lastReadLine,
  lastMessageDate
}) => {
  const showLine = line.displayed !== 0;
  const showDate = !(lastMessageDate && isSameDay(line.date, lastMessageDate));
  const showReadMarker = line.pointers.at(-1) === lastReadLine;

  return (
    <>
      {showLine && (
        <>
          {showDate && (
            <View style={[styles.container]}>
              <Text style={[styles.text, { color: cof.chat_day_change.color }]}>
                -- {formatDateDayChange(line.date)} --
              </Text>
            </View>
          )}
          <Default
            line={line}
            onLongPress={onLongPress}
            parseArgs={parseArgs}
            letterWidth={letterWidth}
          />
        </>
      )}
      {showReadMarker && (
        <View
          style={{ borderWidth: 1, borderColor: cof.chat_read_marker.color }}
        />
      )}
    </>
  );
};

export default BufferLine;

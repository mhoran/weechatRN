import { ParseShape } from 'react-native-parsed-text';

import { View } from 'react-native';
import { cef } from '../../../lib/weechat/colors';
import Default from './themes/Default';

interface Props {
  line: WeechatLine;
  onLongPress: (line: WeechatLine) => void;
  parseArgs: ParseShape[];
  marker: boolean;
}

const BufferLine: React.FC<Props> = ({
  line,
  onLongPress,
  parseArgs,
  marker
}) => {
  return (
    <>
      {line.displayed !== 0 && (
        <Default line={line} onLongPress={onLongPress} parseArgs={parseArgs} />
      )}
      {marker && <View style={{ borderWidth: 1, borderColor: cef[5] }} />}
    </>
  );
};

export default BufferLine;

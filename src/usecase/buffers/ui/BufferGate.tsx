import { View } from 'react-native';
import BufferContainer, { styles } from './BufferContainer';
import RelayClient from '../../../lib/weechat/client';

type Props = {
  bufferId: string | null;
  showTopic: boolean;
  client: RelayClient;
};

const BufferGate: React.FC<Props> = (props: Props) => {
  if (props.bufferId) {
    return <BufferContainer {...props} bufferId={props.bufferId} />;
  } else {
    return <View style={styles.container} />;
  }
};

export default BufferGate;

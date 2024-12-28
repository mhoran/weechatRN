import { View, StyleSheet } from 'react-native';
import type RelayClient from '../../../lib/weechat/client';
import BufferContainer from './BufferContainer';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222'
  }
});

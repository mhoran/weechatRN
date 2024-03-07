import { View } from 'react-native';
import BufferContainer, { styles } from './BufferContainer';

type Props = {
  bufferId: string | null;
  showTopic: boolean;
  sendMessage: (message: string) => void;
  fetchMoreLines: (lines: number) => void;
};

const BufferGate: React.FC<Props> = (props: Props) => {
  if (props.bufferId) {
    return <BufferContainer {...props} bufferId={props.bufferId} />;
  } else {
    return <View style={styles.container} />;
  }
};

export default BufferGate;

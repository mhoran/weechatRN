import * as React from 'react';
import { View } from 'react-native';
import BufferContainer, { styles } from './BufferContainer';

type Props = {
  bufferId: string | null;
  showTopic: boolean;
  sendMessage: (message: string) => void;
};

const BufferGate = (props: Props): JSX.Element => {
  if (props.bufferId) {
    return <BufferContainer {...props} bufferId={props.bufferId} />;
  } else {
    return <View style={styles.container} />;
  }
};

export default BufferGate;

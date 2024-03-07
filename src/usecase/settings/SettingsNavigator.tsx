import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ConnectionError } from '../../lib/weechat/connection';
import LoginForm from '../login/LoginForm';
import UploadSettings from './UploadSettings';

type Props = {
  onConnect: (hostname: string, password: string, ssl: boolean) => void;
  connecting: boolean;
  connectionError: ConnectionError | null;
};

const SettingsNavigator: React.FC<Props> = ({
  onConnect,
  connecting,
  connectionError
}) => {
  const [showUploadSettings, setShowUploadSettings] = useState(false);

  if (showUploadSettings) {
    return (
      <UploadSettings
        setShowUploadSettings={setShowUploadSettings}
      ></UploadSettings>
    );
  }
  return (
    <LoginForm
      onConnect={onConnect}
      connecting={connecting}
      connectionError={connectionError}
      setShowUploadSettings={setShowUploadSettings}
    ></LoginForm>
  );
};

export default SettingsNavigator;

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    flex: 1,
    padding: 20
  },
  header: {
    textAlign: 'center',
    color: '#4157af',
    fontSize: 20
  },
  text: {
    padding: 10,
    color: '#4157af',
    fontSize: 18
  },
  input: {
    marginVertical: 10,
    padding: 10,
    borderBottomWidth: 2,
    fontSize: 18,
    borderColor: '#4157af',
    color: '#4157af'
  },
  centeredButton: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  button: {
    borderWidth: 2,
    borderColor: '#4157af',
    width: 200,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  buttonText: {
    textAlign: 'center',
    color: '#4157af',
    fontWeight: '400',
    fontSize: 18,
    textTransform: 'uppercase'
  }
});

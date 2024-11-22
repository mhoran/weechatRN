import { useState } from 'react';
import type { ConnectionError } from '../../lib/weechat/connection';
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

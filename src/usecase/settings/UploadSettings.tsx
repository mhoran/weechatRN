import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity
} from 'react-native';
import UndoTextInput from '../buffers/ui/UndoTextInput';
import { styles } from './SettingsNavigator';
import { ConnectedProps, connect } from 'react-redux';
import { StoreState } from '../../store';

const connector = connect((state: StoreState) => ({
  uploadOptions: state.connection.mediaUploadOptions
}));

type Props = {
  setShowUploadSettings: (show: boolean) => void;
} & ConnectedProps<typeof connector>;

const UploadSettings: React.FC<Props> = ({
  uploadOptions,
  dispatch,
  setShowUploadSettings
}) => {
  const [uploadUrl, setUploadUrl] = useState(uploadOptions.url);
  const [basicAuth, setBasicAuth] = useState(uploadOptions.basicAuth);
  const [username, setUsername] = useState(uploadOptions.username);
  const [password, setPassword] = useState(uploadOptions.password);

  const onPress = () => {
    dispatch({
      type: 'SET_MEDIA_UPLOAD_OPTIONS',
      payload: {
        url: uploadUrl,
        basicAuth: basicAuth,
        username: username,
        password: password
      }
    });
    setShowUploadSettings(false);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.header}>Media Upload Settings</Text>

        <UndoTextInput
          style={styles.input}
          placeholderTextColor="#4157af"
          keyboardType="url"
          autoCapitalize="none"
          placeholder="Media Upload URL"
          onChangeText={setUploadUrl}
          value={uploadUrl}
          autoCorrect={false}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.text}>Basic Auth</Text>
          <Switch
            style={{ margin: 10 }}
            onValueChange={setBasicAuth}
            value={basicAuth}
          />
        </View>
        {basicAuth && (
          <>
            <UndoTextInput
              style={styles.input}
              placeholderTextColor="#4157af"
              keyboardType="url"
              autoCapitalize="none"
              placeholder="Media Upload Username"
              onChangeText={setUsername}
              value={username}
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholderTextColor="#4157af"
              autoCapitalize="none"
              placeholder="Media Upload Password"
              secureTextEntry
              onChangeText={setPassword}
              value={password}
            />
          </>
        )}
        <View style={styles.centeredButton}>
          <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default connector(UploadSettings);

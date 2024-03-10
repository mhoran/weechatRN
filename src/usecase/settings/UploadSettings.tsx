import { useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConnectedProps, connect } from 'react-redux';
import { StoreState } from '../../store';
import UndoTextInput from '../buffers/ui/UndoTextInput';
import { styles } from './SettingsNavigator';
import { setMediaUploadOptionsAction } from '../../store/actions';

const connector = connect((state: StoreState) => ({
  uploadOptions: {
    ...state.connection.mediaUploadOptions,
    headers:
      state.connection.mediaUploadOptions.headers &&
      Object.entries(state.connection.mediaUploadOptions.headers)
  }
}));

type Props = {
  setShowUploadSettings: (show: boolean) => void;
} & ConnectedProps<typeof connector>;

const UploadSettings: React.FC<Props> = ({
  uploadOptions: {
    headers: uploadOptionsHeaders = [['', '']],
    ...uploadOptions
  },
  dispatch,
  setShowUploadSettings
}) => {
  const [uploadOptionsState, setUploadOptionsState] = useState({
    ...uploadOptions,
    headers: uploadOptionsHeaders
  });

  const setUploadOptionsUrl = (url: string) => {
    setUploadOptionsState((state) => ({ ...state, url }));
  };

  const setUploadOptionsBasicAuth = (basicAuth: boolean) => {
    setUploadOptionsState((state) => ({ ...state, basicAuth }));
  };

  const setUploadOptionsUsername = (username: string) => {
    setUploadOptionsState((state) => ({ ...state, username }));
  };

  const setUploadOptionsPassword = (password: string) => {
    setUploadOptionsState((state) => ({ ...state, password }));
  };

  const setUploadOptionsFieldName = (fieldName: string) => {
    setUploadOptionsState((state) => ({ ...state, fieldName }));
  };

  const setUploadOptionsRegexp = (regexp: string) => {
    setUploadOptionsState((state) => ({ ...state, regexp }));
  };

  const setUploadOptionsHeaderName = (index: number, name: string) => {
    setUploadOptionsState((state) => ({
      ...state,
      headers: state.headers.map((header, currentIndex) =>
        index === currentIndex ? [name, header[1]] : header
      )
    }));
  };

  const setUploadOptionsHeaderValue = (index: number, value: string) => {
    setUploadOptionsState((state) => ({
      ...state,
      headers: state.headers.map((header, currentIndex) =>
        index === currentIndex ? [header[0], value] : header
      )
    }));
  };

  const setUploadOptions = () => {
    const { headers, ...rest } = uploadOptionsState;
    const headersObject = headers.reduce<Record<string, string>>(
      (headers, [headerName, headerValue]) => {
        if (headerName && headerValue) headers[headerName] = headerValue;
        return headers;
      },
      {}
    );

    dispatch(
      setMediaUploadOptionsAction({
        ...rest,
        username: rest.username || undefined,
        password: rest.password || undefined,
        fieldName: rest.fieldName || undefined,
        regexp: rest.regexp || undefined,
        ...(Object.keys(headersObject).length > 0 && { headers: headersObject })
      })
    );
    setShowUploadSettings(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <ScrollView alwaysBounceVertical={false}>
          <StatusBar barStyle="dark-content" />
          <Text style={styles.header}>Media Upload Settings</Text>
          <UndoTextInput
            style={styles.input}
            placeholderTextColor="#4157af"
            keyboardType="url"
            autoCapitalize="none"
            placeholder="Upload Service URL"
            onChangeText={setUploadOptionsUrl}
            value={uploadOptionsState.url}
            autoCorrect={false}
          />
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text style={styles.text}>Use Basic Auth</Text>
            <Switch
              style={{ margin: 10 }}
              onValueChange={setUploadOptionsBasicAuth}
              value={uploadOptionsState.basicAuth}
              accessibilityLabel="Use Basic Auth"
            />
          </View>
          {uploadOptionsState.basicAuth && (
            <>
              <UndoTextInput
                style={styles.input}
                placeholderTextColor="#4157af"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Upload Service Username"
                onChangeText={setUploadOptionsUsername}
                value={uploadOptionsState.username}
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                placeholderTextColor="#4157af"
                autoCapitalize="none"
                placeholder="Upload Service Password"
                secureTextEntry
                onChangeText={setUploadOptionsPassword}
                value={uploadOptionsState.password}
              />
            </>
          )}
          <UndoTextInput
            style={styles.input}
            placeholderTextColor="#4157af"
            autoCapitalize="none"
            placeholder="Form Field Name (default: file)"
            autoCorrect={false}
            onChangeText={setUploadOptionsFieldName}
            value={uploadOptionsState.fieldName}
          />
          <UndoTextInput
            style={styles.input}
            placeholderTextColor="#4157af"
            autoCapitalize="none"
            placeholder="RegExp (default: /^https://\S+/)"
            autoCorrect={false}
            keyboardType="ascii-capable"
            onChangeText={setUploadOptionsRegexp}
            value={uploadOptionsState.regexp}
          />
          {uploadOptionsState.headers.map(
            ([headerName, headerValue], index) => {
              return (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    columnGap: 10
                  }}
                >
                  <UndoTextInput
                    style={[styles.input, { minWidth: 300, flexGrow: 1 }]}
                    placeholderTextColor="#4157af"
                    autoCapitalize="none"
                    placeholder="Header Name (optional)"
                    autoCorrect={false}
                    value={headerName}
                    onChangeText={(text) =>
                      setUploadOptionsHeaderName(index, text)
                    }
                  />
                  <UndoTextInput
                    style={[styles.input, { minWidth: 300, flexGrow: 1 }]}
                    placeholderTextColor="#4157af"
                    autoCapitalize="none"
                    placeholder="Header Value (optional)"
                    autoCorrect={false}
                    value={headerValue}
                    onChangeText={(text) =>
                      setUploadOptionsHeaderValue(index, text)
                    }
                  />
                </View>
              );
            }
          )}
          <View style={styles.centeredButton}>
            <TouchableOpacity style={styles.button} onPress={setUploadOptions}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.centeredButton, { paddingTop: 10 }]}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowUploadSettings(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default connector(UploadSettings);

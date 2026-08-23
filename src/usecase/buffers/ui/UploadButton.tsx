import type { MenuAction, NativeActionEvent } from '@expo/ui/community/menu';
import { MenuView } from '@expo/ui/community/menu';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';
import { Buffer } from 'buffer';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { fetch } from 'expo/fetch';
import { memo, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import UploadSpinner from './UploadSpinner';

interface Props {
  onUpload: (url: string) => void;
  style?: StyleProp<ViewStyle>;
  uploadOptions: {
    url?: string;
    fieldName?: string;
    regexp?: string;
    basicAuth: boolean;
    username?: string;
    password?: string;
    headers?: Record<string, string>;
  };
}

const actions: MenuAction[] = [
  {
    id: 'library',
    title: 'Upload from library',
    image: 'photo.on.rectangle'
  },
  {
    id: 'files',
    title: 'Upload from files',
    image: 'folder'
  },
  { id: 'camera', title: 'Open camera', image: 'camera' }
];

const UploadButton: React.FC<Props> = ({
  onUpload,
  style,
  uploadOptions: {
    fieldName: uploadOptionsFieldName = 'file',
    regexp: uploadOptionsRegexp = '^https://\\S+',
    headers: uploadOptionsHeaders = {},
    ...uploadOptions
  }
}) => {
  const [showSpinner, setShowSpinner] = useState(false);

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: false
    });

    if (result.canceled) return;

    void handleImagePicked(result.assets[0].uri);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: false,
      quality: 1
    });

    if (result.canceled) return;

    void handleImagePicked(result.assets[0].uri);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: false
    });

    if (result.canceled) return;

    void handleImagePicked(result.assets[0].uri);
  };

  const handleImagePicked = async (fileUri: string) => {
    try {
      setShowSpinner(true);
      const file = new File(fileUri);
      const uploadUrl = await uploadImage(file);
      const matches = uploadUrl?.match(new RegExp(uploadOptionsRegexp));
      if (!matches) return alert('Failed to extract URL from response');
      onUpload(matches[1] || matches[0]);
    } catch {
      alert('Upload failed');
    } finally {
      setShowSpinner(false);
    }
  };

  const uploadImage = async (file: File) => {
    if (!uploadOptions.url) return;

    const formData = new FormData();
    formData.append(uploadOptionsFieldName, file);

    const response = await fetch(uploadOptions.url, {
      method: 'POST',
      body: formData,
      headers: {
        ...(uploadOptions.basicAuth && {
          Authorization:
            'Basic ' +
            Buffer.from(
              `${uploadOptions.username}:${uploadOptions.password}`
            ).toString('base64')
        }),
        ...uploadOptionsHeaders
      }
    });

    if (response.status === 200) return response.text();
    else throw Error('Upload failed');
  };

  const handleOnPressAction = (e: NativeActionEvent) => {
    switch (e.nativeEvent.event) {
      case 'library':
        return pickImage();
      case 'files':
        return pickDocument();
      case 'camera':
        return takePhoto();
    }
  };

  if (
    !uploadOptions.url ||
    !uploadOptionsFieldName ||
    (uploadOptions.basicAuth &&
      (!uploadOptions.username || !uploadOptions.password))
  )
    return;

  if (showSpinner) {
    return (
      <View style={style} accessibilityLabel="Image Uploading">
        <UploadSpinner />
      </View>
    );
  }

  return (
    <MenuView actions={actions} onPressAction={handleOnPressAction}>
      <View style={style} accessibilityLabel="Upload Image">
        <MaterialIcons name="attach-file" size={27} color="white" />
      </View>
    </MenuView>
  );
};

export default memo(UploadButton);

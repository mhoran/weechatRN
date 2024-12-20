import { MaterialIcons } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import UploadSpinner from './UploadSpinner';

interface Props {
  onUpload: (url: string) => void;
  style?: StyleProp<ViewStyle>;
  uploadOptions: {
    url: string;
    fieldName?: string;
    regexp?: string;
    basicAuth: boolean;
    username?: string;
    password?: string;
    headers?: Record<string, string>;
  };
}

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
      mediaTypes: ['images'],
      allowsMultipleSelection: false
    });

    void handleImagePicked(result);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 1
    });

    void handleImagePicked(result);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: false,
      type: 'image/*'
    });

    void handleImagePicked(result);
  };

  const handleImagePicked = async (
    pickerResult:
      | ImagePicker.ImagePickerResult
      | DocumentPicker.DocumentPickerResult
  ) => {
    try {
      if (pickerResult.canceled) {
        return;
      } else {
        setShowSpinner(true);
        const uploadUrl = await uploadImage(pickerResult.assets[0].uri);
        const matches = uploadUrl.match(new RegExp(uploadOptionsRegexp));
        if (!matches) return alert('Failed to extract URL from response');
        onUpload(matches[1] || matches[0]);
      }
    } catch {
      alert('Upload failed');
    } finally {
      setShowSpinner(false);
    }
  };

  const uploadImage = async (fileUri: string) => {
    const response = await FileSystem.uploadAsync(uploadOptions.url, fileUri, {
      fieldName: uploadOptionsFieldName,
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
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

    if (response.status === 200) return response.body;
    else throw Error('Upload failed');
  };

  const singleTap = Gesture.Tap()
    .onStart(() => void pickImage())
    .runOnJS(true)
    .withTestId('uploadButtonSingleTap');

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => void pickDocument())
    .runOnJS(true);

  const longPress = Gesture.LongPress()
    .onStart(() => void takePhoto())
    .runOnJS(true);

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
    <GestureDetector
      gesture={Gesture.Exclusive(doubleTap, singleTap, longPress)}
    >
      <View style={style} accessibilityLabel="Upload Image">
        <MaterialIcons name="photo-library" size={27} color="white" />
      </View>
    </GestureDetector>
  );
};

export default UploadButton;

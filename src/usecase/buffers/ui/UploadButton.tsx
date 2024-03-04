import { MaterialIcons } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

interface Props {
  onUpload: (url: string) => void;
  style?: StyleProp<ViewStyle>;
  uploadOptions: {
    url: string;
    fieldName?: string;
    basicAuth: boolean;
    username?: string;
    password?: string;
  };
}

const UploadButton: React.FC<Props> = ({
  onUpload,
  style,
  uploadOptions: {
    fieldName: uploadOptionsFieldName = 'file',
    ...uploadOptions
  }
}) => {
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false
    });

    handleImagePicked(result);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1
    });

    handleImagePicked(result);
  };

  const handleImagePicked = async (
    pickerResult: ImagePicker.ImagePickerResult
  ) => {
    try {
      if (pickerResult.canceled) {
        return;
      } else {
        const uploadUrl = await uploadImage(pickerResult.assets[0].uri);
        onUpload(uploadUrl);
      }
    } catch (e) {
      alert('Upload failed');
    }
  };

  const uploadImage = async (fileUri: string) => {
    const response = await FileSystem.uploadAsync(uploadOptions.url, fileUri, {
      fieldName: uploadOptionsFieldName,
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(
            `${uploadOptions.username}:${uploadOptions.password}`
          ).toString('base64')
      }
    });

    if (response.status == 200) return response.body;
    else throw 'Upload failed';
  };

  if (
    !uploadOptions.url ||
    !uploadOptionsFieldName ||
    (uploadOptions.basicAuth &&
      (!uploadOptions.username || !uploadOptions.password))
  )
    return;

  return (
    <TouchableOpacity
      onPress={pickImage}
      onLongPress={takePhoto}
      style={style}
      accessibilityLabel="Upload Image"
    >
      <MaterialIcons name="photo-library" size={27} color="white" />
    </TouchableOpacity>
  );
};

export default UploadButton;

import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { fireEvent, render, screen } from '@testing-library/react-native';
import UploadButton from '../../../../src/usecase/buffers/ui/UploadButton';

jest.mock('expo-file-system', () => {
  const FileSystem = jest.requireActual('expo-file-system');
  return {
    FileSystemUploadType: FileSystem.FileSystemUploadType,
    uploadAsync: jest.fn()
  };
});
const mockedFileSystem = jest.mocked(FileSystem);

describe(UploadButton, () => {
  it('uploads an image from library on press', async () => {
    jest
      .spyOn(ImagePicker, 'launchImageLibraryAsync')
      .mockImplementation(() => {
        return Promise.resolve({
          assets: [{ uri: 'file:///tmp/image.jpg' }]
        } as ImagePicker.ImagePickerResult);
      });

    mockedFileSystem.uploadAsync.mockImplementation(() => {
      return Promise.resolve({
        status: 200,
        body: 'http://example.com/image.jpg'
      } as FileSystem.FileSystemUploadResult);
    });

    const onUpload = jest.fn();
    const uploadOptions = {
      url: 'https://example.com',
      basicAuth: true,
      username: 'test',
      password: 'changeme'
    };
    render(<UploadButton onUpload={onUpload} uploadOptions={uploadOptions} />);
    const button = screen.getByLabelText('Upload Image');

    fireEvent(button, 'press');

    await new Promise(process.nextTick);
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1
    });
    expect(FileSystem.uploadAsync).toHaveBeenCalledWith(
      'https://example.com',
      'file:///tmp/image.jpg',
      {
        fieldName: 'file',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        headers: {
          Authorization:
            'Basic ' + Buffer.from('test:changeme').toString('base64')
        }
      }
    );
    expect(onUpload).toHaveBeenCalledWith('http://example.com/image.jpg');
  });

  it('hides the button when the url is empty', () => {
    const uploadOptions = {
      url: '',
      basicAuth: false
    };
    render(<UploadButton onUpload={jest.fn()} uploadOptions={uploadOptions} />);

    expect(screen.queryByLabelText('Upload Image')).toBeNull();
  });

  it('hides the button when the field name is empty', () => {
    const uploadOptions = {
      url: 'http://example.com',
      fieldName: '',
      basicAuth: false
    };
    render(<UploadButton onUpload={jest.fn()} uploadOptions={uploadOptions} />);

    expect(screen.queryByLabelText('Upload Image')).toBeNull();
  });

  describe('basic auth disabled', () => {
    it('shows the button when the url is not empty', () => {
      const uploadOptions = {
        url: 'http://example.com',
        basicAuth: false
      };
      render(
        <UploadButton onUpload={jest.fn()} uploadOptions={uploadOptions} />
      );

      expect(screen.queryByLabelText('Upload Image')).not.toBeNull();
    });
  });

  describe('basic auth enabled', () => {
    it('hides the button when the username or password is empty', () => {
      const uploadOptions = {
        url: 'http://example.com',
        basicAuth: true,
        username: '',
        password: ''
      };
      const { rerender } = render(
        <UploadButton onUpload={jest.fn()} uploadOptions={uploadOptions} />
      );

      expect(screen.queryByLabelText('Upload Image')).toBeNull();

      rerender(
        <UploadButton
          onUpload={jest.fn()}
          uploadOptions={{ ...uploadOptions, username: 'test', password: '' }}
        />
      );

      expect(screen.queryByLabelText('Upload Image')).toBeNull();

      rerender(
        <UploadButton
          onUpload={jest.fn()}
          uploadOptions={{
            ...uploadOptions,
            username: '',
            password: 'changeme'
          }}
        />
      );

      expect(screen.queryByLabelText('Upload Image')).toBeNull();
    });
  });
});

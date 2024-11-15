import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { EASConfig } from 'expo/config';

export const registerForPushNotificationsAsync = async (): Promise<void> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  // only ask if permissions have not already been determined, because
  // iOS won't necessarily prompt the user a second time.
  if (existingStatus !== Notifications.PermissionStatus.GRANTED) {
    // Android remote notification permissions are granted during the app
    // install, so this will only ask on iOS
    await Notifications.requestPermissionsAsync();
  }
};

export const getPushNotificationStatusAsync = async (): Promise<
  string | undefined
> => {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== Notifications.PermissionStatus.GRANTED) {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== Notifications.PermissionStatus.GRANTED) {
      return;
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: (Constants.expoConfig?.extra?.eas as EASConfig | undefined)
          ?.projectId
      })
    ).data;
  }

  return token;
};

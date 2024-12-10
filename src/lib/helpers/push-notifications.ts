import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import type { EASConfig } from 'expo/config';

export const registerForPushNotificationsAsync = async (): Promise<
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

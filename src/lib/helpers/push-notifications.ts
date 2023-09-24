import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

export const registerForPushNotificationsAsync = async (): Promise<void> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  // only ask if permissions have not already been determined, because
  // iOS won't necessarily prompt the user a second time.
  if (existingStatus !== 'granted') {
    // Android remote notification permissions are granted during the app
    // install, so this will only ask on iOS
    await Notifications.requestPermissionsAsync();
  }
};

export const getPushNotificationStatusAsync = async (): Promise<
  string | undefined
> => {
  let token;
  if (Constants.isDevice) {
    const {
      status: existingStatus
    } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    })).data;
  }

  return token;
};

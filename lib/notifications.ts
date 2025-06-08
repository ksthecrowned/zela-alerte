import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { updateUser } from './firestore';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowInList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Échec de l\'obtention des permissions pour les notifications push!');
      return null;
    }
    
    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      })).data;
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token push:', error);
    }
  } else {
    alert('Les notifications push nécessitent un appareil physique');
  }

  return token;
}

export async function updateUserNotificationToken(userId: string, token: string) {
  try {
    await updateUser(userId, { fcmToken: token });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du token FCM:', error);
  }
}

export function setupNotificationListeners() {
  // Handle notification received while app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification reçue en premier plan:', notification);
  });

  // Handle notification tapped
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification tapée:', response);
    const data = response.notification.request.content.data;
    
    // Navigate to specific screen based on notification data
    if (data?.reportId) {
      // Navigate to report details
    }
  });

  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}

export async function sendLocalNotification(title: string, body: string, data?: any) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // Show immediately
  });
}
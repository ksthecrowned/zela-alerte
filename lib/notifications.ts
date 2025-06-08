import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getSubscribedUsersForReport, updateUser } from './firestore';
import { OutageReport } from '@/types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
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
        projectId: process.env.EXPO_PUBLIC_EAS_APP_ID,
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
      sound: 'default',
    },
    trigger: null, // Show immediately
  });
}

export async function notifyUsersOfNewReport(reportData: OutageReport) {
  try {
    const subscribedUsers = await getSubscribedUsersForReport(reportData);
    const tokens = subscribedUsers
      .map(u => u.fcmToken)
      .filter(token => typeof token === 'string' && token.startsWith('ExponentPushToken'));

    if (tokens.length === 0) return;

    const messageBody = `Incident à ${reportData.neighborhood} (${reportData.serviceType})`;

    const batches = chunkArray(tokens, 100);

    for (const batch of batches) {
      const messages = batch.map(token => ({
        to: token,
        sound: 'default',
        title: '🚨 Nouvelle alerte',
        body: messageBody,
        data: { reportId: reportData.id },
      }));

      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const json = await res.json();

      if (!res.ok || json?.data?.some((d: any) => d.status !== 'ok')) {
        console.warn('Réponse partiellement invalide:', json);
      }
    }
  } catch (e) {
    console.error('Erreur lors de l\'envoi des notifications:', e);
  }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
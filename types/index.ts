export interface User {
  id: string;
  email: string;
  displayName?: string;
  city?: string;
  neighborhoods?: string[];
  notificationPreferences?: {
    electricity: boolean;
    water: boolean;
    internet: boolean;
    allUpdates: boolean;
  };
  fcmToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OutageReport {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  city: string;
  neighborhood: string;
  serviceType: 'electricity' | 'water' | 'internet';
  status: 'outage' | 'restored';
  description?: string;
  imageUrl?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    reportId?: string;
    city?: string;
    serviceType?: string;
    status?: string;
  };
}
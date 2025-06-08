import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, OutageReport } from '@/types';

// Collections
const USERS_COLLECTION = 'users';
const REPORTS_COLLECTION = 'reports';

// User operations
export const createUser = async (userId: string, userData: Partial<User>) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateUser = async (userId: string, userData: Partial<User>) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    ...userData,
    updatedAt: serverTimestamp(),
  });
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      id: userSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as User;
  }
  
  return null;
};

// Report operations
export const createReport = async (reportData: Omit<OutageReport, 'id' | 'createdAt' | 'updatedAt'>) => {
  const reportsRef = collection(db, REPORTS_COLLECTION);
  const docRef = await addDoc(reportsRef, {
    ...reportData,
    description: reportData.description ?? '',
    timestamp: Timestamp.fromDate(reportData.timestamp),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return docRef.id;
};

export const updateReport = async (reportId: string, reportData: Partial<OutageReport>) => {
  const reportRef = doc(db, REPORTS_COLLECTION, reportId);
  await updateDoc(reportRef, {
    ...reportData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteReport = async (reportId: string) => {
  const reportRef = doc(db, REPORTS_COLLECTION, reportId);
  await deleteDoc(reportRef);
};

export const getReports = async (
  city?: string,
  serviceType?: string,
  status?: string,
  limitCount: number = 50
): Promise<OutageReport[]> => {
  let q = query(
    collection(db, REPORTS_COLLECTION),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  if (city) {
    q = query(q, where('city', '==', city));
  }
  
  if (serviceType) {
    q = query(q, where('serviceType', '==', serviceType));
  }
  
  if (status) {
    q = query(q, where('status', '==', status));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      timestamp: data.timestamp?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as OutageReport;
  });
};

export const subscribeToReports = (
  callback: (reports: OutageReport[]) => void,
  city?: string,
  serviceType?: string,
  status?: string,
  limitCount: number = 50
) => {
  let q = query(
    collection(db, REPORTS_COLLECTION),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  if (city) {
    q = query(q, where('city', '==', city));
  }
  
  if (serviceType) {
    q = query(q, where('serviceType', '==', serviceType));
  }
  
  if (status) {
    q = query(q, where('status', '==', status));
  }

  return onSnapshot(q, (querySnapshot) => {
    const reports = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as OutageReport;
    });
    
    callback(reports);
  });
};

export const getUserReports = async (userId: string): Promise<OutageReport[]> => {
  const q = query(
    collection(db, REPORTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      timestamp: data.timestamp?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as OutageReport;
  });
};

export async function getSubscribedUsersForReport(report: OutageReport): Promise<User[]> {
  // Construction de la requête avec filtre ville + type de service
  const usersRef = collection(db, 'users');

  const q = query(
    usersRef,
    where('city', '==', report.city),
    where(`notificationPreferences.${report.serviceType}`, '==', true)
  );

  const snapshot = await getDocs(q);

  const users: User[] = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as User[];

  // Filtrage uniquement sur le quartier (Firestore ne permet pas de faire `array-contains` sur deux champs en même temps)
  return users.filter(user =>
    !!user.fcmToken &&
    user.neighborhoods?.includes(report.neighborhood)
  );
}
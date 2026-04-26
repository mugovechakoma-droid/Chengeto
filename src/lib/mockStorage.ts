import { Patient, Referral, UserProfile } from '../types';
import { Notification } from '../components/NotificationCenter';

const STORAGE_KEYS = {
  PATIENTS: 'chengeto_mock_patients',
  REFERRALS: 'chengeto_mock_referrals',
  NOTIFICATIONS: 'chengeto_mock_notifications'
};

export const getLocalData = <T>(key: string, defaultValue: T[]): T[] => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
};

export const setLocalData = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const addLocalItem = <T>(key: string, item: T, defaultValue: T[] = []) => {
  const data = getLocalData<T>(key, defaultValue);
  const newData = [item, ...data];
  setLocalData(key, newData);
  return newData;
};

export const updateLocalItem = <T extends { id: string }>(key: string, id: string, updates: Partial<T>) => {
  const data = getLocalData<T>(key, []);
  const newData = data.map(item => item.id === id ? { ...item, ...updates } : item);
  setLocalData(key, newData);
  return newData;
};

export { STORAGE_KEYS };

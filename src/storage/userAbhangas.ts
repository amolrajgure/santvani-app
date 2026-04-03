import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';
import type { Abhang } from '../types';

export async function loadUserAbhangas(): Promise<Abhang[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.USER_ABHANGAS);
    if (!json) return [];
    return JSON.parse(json) as Abhang[];
  } catch {
    return [];
  }
}

export async function saveUserAbhangas(abhangas: Abhang[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ABHANGAS, JSON.stringify(abhangas));
  } catch {
    // silently fail
  }
}

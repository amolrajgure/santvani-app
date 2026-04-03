import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';

export async function loadFavorites(): Promise<Set<string>> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!json) return new Set();
    const arr: string[] = JSON.parse(json);
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export async function saveFavorites(ids: Set<string>): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify([...ids]));
  } catch {
    // silently fail
  }
}

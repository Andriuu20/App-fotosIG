import AsyncStorage from '@react-native-async-storage/async-storage';

export type Corner = 'abajo-derecha' | 'abajo-izquierda' | 'arriba-derecha' | 'arriba-izquierda';

export interface Settings {
  morningEnabled: boolean;
  morningHour: number;
  morningMinute: number;
  afternoonEnabled: boolean;
  afternoonHour: number;
  afternoonMinute: number;
  /** Marca de agua muy sutil (versión gratis). Premium la quita. */
  watermark: boolean;
  watermarkCorner: Corner;
}

export const DEFAULT_SETTINGS: Settings = {
  morningEnabled: true,
  morningHour: 9,
  morningMinute: 0,
  afternoonEnabled: true,
  afternoonHour: 18,
  afternoonMinute: 30,
  watermark: true,
  watermarkCorner: 'abajo-derecha',
};

const KEY = 'settings.v1';

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}

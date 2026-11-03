/**
 * Ubicación aproximada, hora dorada (calculada en el móvil con suncalc)
 * y tiempo actual (API gratuita de Open-Meteo, sin clave).
 */
import * as Location from 'expo-location';
import { getTimes } from 'suncalc';

import type { Conditions, WeatherKind } from './suggestions';

export interface Coords {
  latitude: number;
  longitude: number;
}

export async function getCoords(): Promise<Coords | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const last = await Location.getLastKnownPositionAsync();
    const pos = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }));
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {
    return null;
  }
}

export function sunTimes(now: Date, c: Coords) {
  const t = getTimes(now, c.latitude, c.longitude);
  return {
    sunrise: t.sunrise,
    goldenHourEndMorning: t.goldenHourEnd,
    goldenHourStart: t.goldenHour,
    sunset: t.sunset,
  };
}

/** Códigos WMO de Open-Meteo → tipo de tiempo simple. */
export function weatherFromCode(code: number): WeatherKind {
  if (code === 0 || code === 1) return 'sol';
  if (code === 2 || code === 3) return 'nubes';
  if (code === 45 || code === 48) return 'niebla';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'nieve';
  if (code >= 95) return 'tormenta';
  return 'lluvia'; // 51-67, 80-82: llovizna, lluvia y chubascos
}

export async function fetchWeather(c: Coords): Promise<WeatherKind | undefined> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${c.latitude.toFixed(3)}` +
      `&longitude=${c.longitude.toFixed(3)}&current=weather_code`;
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const data = (await res.json()) as { current?: { weather_code?: number } };
    const code = data.current?.weather_code;
    return typeof code === 'number' ? weatherFromCode(code) : undefined;
  } catch {
    return undefined;
  }
}

export async function loadConditions(): Promise<Conditions> {
  const now = new Date();
  const coords = await getCoords();
  if (!coords) return { now };
  const weather = await fetchWeather(coords);
  return { now, weather, ...sunTimes(now, coords) };
}

export const WEATHER_LABEL: Record<WeatherKind, string> = {
  sol: '☀️ Soleado',
  nubes: '☁️ Nublado',
  lluvia: '🌧️ Lluvia',
  niebla: '🌫️ Niebla',
  nieve: '❄️ Nieve',
  tormenta: '⛈️ Tormenta',
};

export function formatTime(d: Date | null | undefined): string {
  if (!d) return '--:--';
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

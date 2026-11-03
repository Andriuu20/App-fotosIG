/**
 * Pide frases y canciones al pequeño servidor (carpeta /server), que es el
 * único que conoce la clave de la API de Claude.
 */
import Constants from 'expo-constants';

export interface Frase {
  tono: 'positiva' | 'graciosa' | 'poetica';
  texto: string;
}

export interface Cancion {
  titulo: string;
  artista: string;
  motivo: string;
}

export interface CaptionResult {
  frases: Frase[];
  canciones: Cancion[];
}

interface Extra {
  captionApiUrl?: string;
  captionApiKey?: string;
}

function config(): Extra {
  const extra = (Constants.expoConfig?.extra ?? {}) as Extra;
  return {
    captionApiUrl: process.env.EXPO_PUBLIC_CAPTION_API_URL ?? extra.captionApiUrl,
    captionApiKey: process.env.EXPO_PUBLIC_CAPTION_API_KEY ?? extra.captionApiKey,
  };
}

export function captionsConfigured(): boolean {
  return Boolean(config().captionApiUrl);
}

export async function fetchCaptions(imageBase64: string, idea?: string): Promise<CaptionResult> {
  const { captionApiUrl, captionApiKey } = config();
  if (!captionApiUrl) {
    throw new Error('Falta configurar EXPO_PUBLIC_CAPTION_API_URL (ver README)');
  }
  const res = await fetch(captionApiUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(captionApiKey ? { 'x-app-key': captionApiKey } : {}),
    },
    body: JSON.stringify({ imageBase64, idea, idioma: 'es' }),
  });
  const data = (await res.json().catch(() => ({}))) as Partial<CaptionResult> & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
  return { frases: data.frases ?? [], canciones: data.canciones ?? [] };
}

export const TONO_LABEL: Record<Frase['tono'], string> = {
  positiva: '😊 Positiva',
  graciosa: '😂 Graciosa',
  poetica: '🌙 Poética',
};

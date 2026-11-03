/**
 * Versiones mejoradas de la foto, calculadas en el móvil (gratis):
 * recorte al formato de Instagram + estilo de color "aesthetic" con Skia.
 */
import { File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { ImageFormat, Skia, matchFont, type SkCanvas } from '@shopify/react-native-skia';
import { Platform } from 'react-native';

import type { Corner } from './settings';

export type Format = 'post' | 'historia';

export interface Style {
  id: string;
  name: string;
  /** Matriz de color 4x5 (RGBA) de Skia. */
  matrix: number[];
}

const IDENTITY = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];

function multiply(a: number[], b: number[]): number[] {
  // Composición de dos matrices 4x5 (a después de b).
  const out = new Array<number>(20).fill(0);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      let v = c === 4 ? a[r * 5 + 4] : 0;
      for (let k = 0; k < 4; k++) v += a[r * 5 + k] * (c === 4 ? b[k * 5 + 4] : b[k * 5 + c]);
      out[r * 5 + c] = v;
    }
  }
  return out;
}

function saturation(s: number): number[] {
  const lr = 0.2126 * (1 - s);
  const lg = 0.7152 * (1 - s);
  const lb = 0.0722 * (1 - s);
  return [lr + s, lg, lb, 0, 0, lr, lg + s, lb, 0, 0, lr, lg, lb + s, 0, 0, 0, 0, 0, 1, 0];
}

/** Contraste alrededor del gris medio; `lift` sube los negros (efecto película). */
function contrast(c: number, lift = 0): number[] {
  const t = (1 - c) * 0.5 + lift;
  return [c, 0, 0, 0, t, 0, c, 0, 0, t, 0, 0, c, 0, t, 0, 0, 0, 1, 0];
}

function tint(r: number, g: number, b: number): number[] {
  return [1, 0, 0, 0, r, 0, 1, 0, 0, g, 0, 0, 1, 0, b, 0, 0, 0, 1, 0];
}

function brightness(f: number): number[] {
  return [f, 0, 0, 0, 0, 0, f, 0, 0, 0, 0, 0, f, 0, 0, 0, 0, 0, 1, 0];
}

const compose = (...ms: number[][]) => ms.reduce((acc, m) => multiply(m, acc), IDENTITY);

export const STYLES: Style[] = [
  { id: 'luz', name: 'Luz limpia', matrix: compose(brightness(1.06), contrast(1.08), saturation(1.12)) },
  { id: 'dorado', name: 'Dorado', matrix: compose(tint(0.05, 0.02, -0.04), saturation(1.08), contrast(1.05)) },
  { id: 'pelicula', name: 'Película', matrix: compose(saturation(0.8), contrast(0.88, 0.04), tint(0.02, 0.01, 0)) },
  // Más estilos (premium en el futuro):
  { id: 'frio', name: 'Frío', matrix: compose(tint(-0.03, 0, 0.05), contrast(1.06), saturation(0.95)) },
  { id: 'bn', name: 'B/N', matrix: compose(saturation(0), contrast(1.15)) },
];

/** Las 3 versiones que se proponen por defecto. */
export const DEFAULT_STYLE_IDS = ['luz', 'dorado', 'pelicula'];

const TARGET_WIDTH = 1080; // ancho máximo que usa Instagram
const ASPECT: Record<Format, number> = { post: 4 / 5, historia: 9 / 16 };

/** Recorta al centro con la proporción de Instagram y reduce a 1080 px de ancho. */
export async function cropForInstagram(
  uri: string,
  width: number,
  height: number,
  format: Format,
): Promise<{ uri: string; width: number; height: number }> {
  const target = ASPECT[format];
  let cw = width;
  let ch = Math.round(width / target);
  if (ch > height) {
    ch = height;
    cw = Math.round(height * target);
  }
  const originX = Math.round((width - cw) / 2);
  const originY = Math.round((height - ch) / 2);
  const outW = Math.min(TARGET_WIDTH, cw);
  const outH = Math.round(outW / target);

  const ctx = ImageManipulator.manipulate(uri);
  ctx.crop({ originX, originY, width: cw, height: ch }).resize({ width: outW, height: outH });
  const ref = await ctx.renderAsync();
  const result = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.95 });
  return { uri: result.uri, width: result.width, height: result.height };
}

function drawWatermark(canvas: SkCanvas, w: number, h: number, corner: Corner) {
  const size = Math.round(w * 0.026);
  const font = matchFont({
    fontFamily: Platform.select({ ios: 'Helvetica Neue', default: 'sans-serif' }),
    fontSize: size,
    fontWeight: '600',
  });
  const text = 'FotosIG';
  const textW = font.measureText(text).width;
  const margin = Math.round(w * 0.03);
  const x = corner.endsWith('derecha') ? w - margin - textW : margin;
  const y = corner.startsWith('abajo') ? h - margin : margin + size;
  const paint = Skia.Paint();
  paint.setColor(Skia.Color('rgba(255,255,255,0.45)'));
  const shadow = Skia.Paint();
  shadow.setColor(Skia.Color('rgba(0,0,0,0.18)'));
  canvas.drawText(text, x + 1, y + 1, shadow, font);
  canvas.drawText(text, x, y, paint, font);
}

/** Aplica un estilo (y la marca de agua opcional) y guarda la imagen en caché. */
export async function renderStyled(
  uri: string,
  style: Style,
  watermark: Corner | null,
): Promise<string> {
  const base64 = await new File(uri).base64();
  const image = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(base64));
  if (!image) throw new Error('No se pudo leer la imagen');
  const w = image.width();
  const h = image.height();
  const surface = Skia.Surface.MakeOffscreen(w, h);
  if (!surface) throw new Error('No se pudo preparar la imagen');
  const canvas = surface.getCanvas();
  const paint = Skia.Paint();
  paint.setColorFilter(Skia.ColorFilter.MakeMatrix(style.matrix));
  canvas.drawImageRect(image, Skia.XYWHRect(0, 0, w, h), Skia.XYWHRect(0, 0, w, h), paint);
  if (watermark) drawWatermark(canvas, w, h, watermark);
  surface.flush();
  const out = surface.makeImageSnapshot().encodeToBase64(ImageFormat.JPEG, 92);

  const file = new File(Paths.cache, `version-${style.id}-${Date.now()}.jpg`);
  file.create();
  file.write(out, { encoding: 'base64' });
  return file.uri;
}

/** Versión pequeña (768 px) en base64 para enviarla a la IA. */
export async function smallBase64(uri: string): Promise<string> {
  const ctx = ImageManipulator.manipulate(uri);
  ctx.resize({ width: 768 });
  const ref = await ctx.renderAsync();
  const result = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
  if (!result.base64) throw new Error('No se pudo preparar la foto');
  return result.base64;
}

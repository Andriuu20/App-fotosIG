/**
 * Galería privada: las fotos se guardan solo dentro de la app
 * (carpeta de documentos), con un índice JSON.
 */
import { Directory, File, Paths } from 'expo-file-system';

export interface GalleryItem {
  id: string;
  uri: string;
  createdAt: string; // ISO
  idea?: string;
  frase?: string;
  cancion?: string;
}

const dir = () => new Directory(Paths.document, 'galeria');
const indexFile = () => new File(dir(), 'index.json');

function ensureDir() {
  const d = dir();
  if (!d.exists) d.create({ intermediates: true });
}

export async function listGallery(): Promise<GalleryItem[]> {
  ensureDir();
  const f = indexFile();
  if (!f.exists) return [];
  try {
    const items = JSON.parse(await f.text()) as GalleryItem[];
    return items.filter((i) => new File(i.uri).exists);
  } catch {
    return [];
  }
}

async function writeIndex(items: GalleryItem[]) {
  const f = indexFile();
  if (!f.exists) f.create();
  f.write(JSON.stringify(items));
}

export async function addToGallery(
  sourceUri: string,
  meta: Omit<GalleryItem, 'id' | 'uri' | 'createdAt'>,
): Promise<GalleryItem> {
  ensureDir();
  const id = `${Date.now()}`;
  const dest = new File(dir(), `${id}.jpg`);
  await new File(sourceUri).copy(dest);
  const item: GalleryItem = { id, uri: dest.uri, createdAt: new Date().toISOString(), ...meta };
  const items = await listGallery();
  await writeIndex([item, ...items]);
  return item;
}

export async function removeFromGallery(id: string): Promise<void> {
  const items = await listGallery();
  const item = items.find((i) => i.id === id);
  if (item) {
    const f = new File(item.uri);
    if (f.exists) f.delete();
  }
  await writeIndex(items.filter((i) => i.id !== id));
}

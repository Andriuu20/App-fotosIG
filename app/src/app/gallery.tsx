import { useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../components/ui';
import { listGallery, removeFromGallery, type GalleryItem } from '../lib/gallery';

function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function GalleryScreen() {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      listGallery().then(setItems);
    }, []),
  );

  const onPress = (item: GalleryItem) => {
    const details = [item.idea, item.frase && `“${item.frase}”`, item.cancion && `🎵 ${item.cancion}`]
      .filter(Boolean)
      .join('\n');
    Alert.alert(dayLabel(item.createdAt), details || undefined, [
      { text: 'Compartir', onPress: () => Sharing.shareAsync(item.uri, { mimeType: 'image/jpeg' }) },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          await removeFromGallery(item.id);
          setItems(await listGallery());
        },
      },
      { text: 'Cerrar', style: 'cancel' },
    ]);
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🖼️</Text>
        <Text style={styles.emptyText}>Aquí aparecerán tus fotos de cada día. Solo las ves tú.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      numColumns={3}
      contentContainerStyle={styles.list}
      columnWrapperStyle={{ gap: 4 }}
      renderItem={({ item }) => (
        <Pressable style={styles.cell} onPress={() => onPress(item)}>
          <Image source={{ uri: item.uri }} style={styles.image} />
          <Text style={styles.date}>{dayLabel(item.createdAt)}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 4, gap: 4 },
  cell: { flex: 1 / 3 },
  image: { width: '100%', aspectRatio: 4 / 5, borderRadius: 6, backgroundColor: colors.border },
  date: { fontSize: 11, color: colors.muted, textAlign: 'center', marginVertical: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: colors.muted, textAlign: 'center' },
});

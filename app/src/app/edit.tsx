import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { Button, Card, colors } from '../components/ui';
import { TONO_LABEL, fetchCaptions, type CaptionResult } from '../lib/caption';
import {
  DEFAULT_STYLE_IDS,
  STYLES,
  cropForInstagram,
  renderStyled,
  smallBase64,
  type Format,
} from '../lib/filters';
import { addToGallery } from '../lib/gallery';
import { flow } from '../lib/session';
import { loadSettings } from '../lib/settings';

interface Version {
  id: string;
  name: string;
  uri: string;
}

export default function EditScreen() {
  const photo = flow.photo;
  const withText = flow.mode === 'foto-texto';
  const { width: screenW } = useWindowDimensions();

  const [format, setFormat] = useState<Format>('post');
  const [versions, setVersions] = useState<Version[]>([]);
  const [selected, setSelected] = useState(0);
  const [rendering, setRendering] = useState(true);

  const [captions, setCaptions] = useState<CaptionResult | null>(null);
  const [captionError, setCaptionError] = useState<string | null>(null);
  const [fraseIndex, setFraseIndex] = useState<number | null>(null);
  const [cancionIndex, setCancionIndex] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);
  const [saved, setSaved] = useState(false);

  // 1) Versiones mejoradas (recorte + estilos), en el móvil.
  useEffect(() => {
    if (!photo) return;
    let cancelled = false;
    setRendering(true);
    (async () => {
      try {
        const settings = await loadSettings();
        const corner = settings.watermark ? settings.watermarkCorner : null;
        const cropped = await cropForInstagram(photo.uri, photo.width, photo.height, format);
        const styles = STYLES.filter((s) => DEFAULT_STYLE_IDS.includes(s.id));
        const out: Version[] = [];
        for (const style of styles) {
          out.push({ id: style.id, name: style.name, uri: await renderStyled(cropped.uri, style, corner) });
        }
        if (!cancelled) {
          setVersions(out);
          setSelected(0);
          setSaved(false);
        }
      } catch (e) {
        if (!cancelled) Alert.alert('Ups', e instanceof Error ? e.message : 'No se pudo editar la foto');
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photo, format]);

  // 2) Frases y canciones con IA (solo en modo "foto con texto").
  const loadCaptions = useCallback(async () => {
    if (!photo) return;
    setCaptionError(null);
    setCaptions(null);
    try {
      const b64 = await smallBase64(photo.uri);
      const result = await fetchCaptions(b64, flow.suggestion?.title);
      setCaptions(result);
      setFraseIndex(result.frases.length ? 0 : null);
      setCancionIndex(result.canciones.length ? 0 : null);
    } catch (e) {
      setCaptionError(e instanceof Error ? e.message : 'No se pudieron cargar las frases');
    }
  }, [photo]);

  useEffect(() => {
    if (withText) loadCaptions();
  }, [withText, loadCaptions]);

  if (!photo) {
    return (
      <View style={styles.center}>
        <Button title="Hacer una foto" onPress={() => router.replace('/camera')} />
      </View>
    );
  }

  const current = versions[selected];
  const frase = captions && fraseIndex !== null ? captions.frases[fraseIndex] : undefined;
  const cancion = captions && cancionIndex !== null ? captions.canciones[cancionIndex] : undefined;
  const previewW = screenW - 40;
  const previewH = previewW / (format === 'post' ? 4 / 5 : 9 / 16);

  const save = async () => {
    if (!current || saved) return;
    await addToGallery(current.uri, {
      idea: flow.suggestion?.title,
      frase: frase?.texto,
      cancion: cancion ? `${cancion.titulo} — ${cancion.artista}` : undefined,
    });
    setSaved(true);
  };

  const share = async () => {
    if (!current) return;
    setSharing(true);
    try {
      if (frase) await Clipboard.setStringAsync(frase.texto);
      await save();
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('No disponible', 'Compartir no está disponible en este dispositivo.');
        return;
      }
      if (frase || cancion) {
        const parts = [
          frase ? 'La frase está copiada: pégala en el texto.' : '',
          cancion ? `Añade "${cancion.titulo}" con el sticker de música 🎵.` : '',
        ].filter(Boolean);
        await new Promise<void>((resolve) =>
          Alert.alert('Antes de compartir', parts.join('\n'), [{ text: 'Vale', onPress: () => resolve() }]),
        );
      }
      await Sharing.shareAsync(current.uri, {
        mimeType: 'image/jpeg',
        UTI: 'public.jpeg',
        dialogTitle: 'Compartir en Instagram, WhatsApp o TikTok',
      });
    } catch (e) {
      Alert.alert('Ups', e instanceof Error ? e.message : 'No se pudo compartir');
    } finally {
      setSharing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.segment}>
        {(['post', 'historia'] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFormat(f)}
            style={[styles.segmentItem, format === f && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, format === f && styles.segmentTextActive]}>
              {f === 'post' ? 'Publicación 4:5' : 'Historia 9:16'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.preview, { width: previewW, height: Math.min(previewH, previewW * 1.5) }]}>
        {rendering || !current ? (
          <ActivityIndicator color={colors.accent} size="large" />
        ) : (
          <Image source={{ uri: current.uri }} style={StyleSheet.absoluteFill} resizeMode="contain" />
        )}
      </View>

      <Text style={styles.section}>Elige una versión</Text>
      <View style={styles.versions}>
        {versions.map((v, i) => (
          <Pressable key={v.id} onPress={() => setSelected(i)} style={styles.versionItem}>
            <Image
              source={{ uri: v.uri }}
              style={[styles.thumb, i === selected && styles.thumbSelected]}
              resizeMode="cover"
            />
            <Text style={[styles.versionName, i === selected && { color: colors.accent }]}>{v.name}</Text>
          </Pressable>
        ))}
      </View>

      {withText && (
        <Card style={{ gap: 10 }}>
          <Text style={styles.section}>Frases</Text>
          {!captions && !captionError && (
            <View style={styles.row}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.muted}>Mirando tu foto…</Text>
            </View>
          )}
          {captionError && (
            <>
              <Text style={styles.error}>{captionError}</Text>
              <Button title="Reintentar" variant="secondary" onPress={loadCaptions} />
            </>
          )}
          {captions?.frases.map((f, i) => (
            <Pressable
              key={i}
              onPress={() => setFraseIndex(i)}
              style={[styles.option, fraseIndex === i && styles.optionSelected]}
            >
              <Text style={styles.optionLabel}>{TONO_LABEL[f.tono]}</Text>
              <Text style={styles.optionText}>{f.texto}</Text>
            </Pressable>
          ))}

          {captions && captions.canciones.length > 0 && (
            <>
              <Text style={[styles.section, { marginTop: 8 }]}>Canciones</Text>
              {captions.canciones.map((c, i) => (
                <Pressable
                  key={i}
                  onPress={() => setCancionIndex(i)}
                  style={[styles.option, cancionIndex === i && styles.optionSelected]}
                >
                  <Text style={styles.optionText}>
                    🎵 {c.titulo} — {c.artista}
                  </Text>
                  <Text style={styles.muted}>{c.motivo}</Text>
                </Pressable>
              ))}
              <Text style={styles.muted}>
                Añade la canción desde el sticker de música de Instagram al publicar.
              </Text>
            </>
          )}
        </Card>
      )}

      <Button title="Compartir" onPress={share} loading={sharing} disabled={!current || rendering} />
      <Button
        title={saved ? '✓ Guardada en tu galería' : 'Guardar en mi galería'}
        variant="secondary"
        onPress={save}
        disabled={!current || rendering || saved}
      />
      <Button title="Repetir foto" variant="secondary" onPress={() => router.replace('/camera')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 48, gap: 14 },
  center: { flex: 1, justifyContent: 'center', padding: 24 },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    padding: 4,
  },
  segmentItem: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.card },
  segmentText: { color: colors.muted, fontWeight: '600' },
  segmentTextActive: { color: colors.text },
  preview: {
    alignSelf: 'center',
    backgroundColor: '#EFE8E1',
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { fontSize: 17, fontWeight: '700', color: colors.text },
  versions: { flexDirection: 'row', gap: 12 },
  versionItem: { flex: 1, alignItems: 'center', gap: 6 },
  thumb: { width: '100%', aspectRatio: 4 / 5, borderRadius: 10, borderWidth: 3, borderColor: 'transparent' },
  thumbSelected: { borderColor: colors.accent },
  versionName: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  muted: { color: colors.muted, fontSize: 14 },
  error: { color: '#C0392B' },
  option: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, gap: 4 },
  optionSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  optionLabel: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  optionText: { fontSize: 16, color: colors.text },
});

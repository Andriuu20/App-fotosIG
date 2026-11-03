import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FramingGuide } from '../components/FramingGuide';
import { Button, colors } from '../components/ui';
import { flow } from '../lib/session';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');

  if (!permission) return <View style={styles.black} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permission}>
        <Text style={styles.permissionText}>Necesitamos la cámara para ayudarte a encuadrar la foto.</Text>
        <Button title="Permitir cámara" onPress={requestPermission} />
        <Button title="Volver" variant="secondary" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current || !ready || busy) return;
    setBusy(true);
    try {
      const pic = await cameraRef.current.takePictureAsync({ quality: 0.95 });
      flow.photo = { uri: pic.uri, width: pic.width, height: pic.height };
      router.replace('/edit');
    } finally {
      setBusy(false);
    }
  };

  const tips = flow.suggestion?.tips ?? ['Coloca lo importante en un cruce de líneas', 'Busca más luz'];

  return (
    <View style={styles.black}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        onCameraReady={() => setReady(true)}
      />
      <SafeAreaView style={StyleSheet.absoluteFill} edges={['top', 'bottom']}>
        <View style={styles.guideArea}>
          <FramingGuide tips={tips} />
        </View>
        <View style={styles.controls}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.side}>
            <Text style={styles.sideText}>✕</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Hacer foto"
            onPress={takePhoto}
            disabled={!ready || busy}
            style={({ pressed }) => [styles.shutter, (pressed || busy) && { transform: [{ scale: 0.92 }] }]}
          >
            <View style={styles.shutterInner} />
          </Pressable>
          <Pressable
            onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
            hitSlop={12}
            style={styles.side}
          >
            <Text style={styles.sideText}>⟲</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  black: { flex: 1, backgroundColor: '#000' },
  permission: { flex: 1, padding: 24, gap: 16, justifyContent: 'center', backgroundColor: colors.bg },
  permissionText: { fontSize: 18, color: colors.text, textAlign: 'center', marginBottom: 8 },
  guideArea: { flex: 1 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  side: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  sideText: { color: '#fff', fontSize: 26 },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
});

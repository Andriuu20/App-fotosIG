/**
 * Guía de encuadre en directo: cuadrícula de tercios, nivel del horizonte
 * (con el acelerómetro) y consejos que van rotando.
 */
import { Accelerometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

interface Props {
  tips: string[];
}

interface Tilt {
  /** Giro respecto al horizonte, en grados (0 = recto). */
  roll: number;
  /** El móvil está casi plano (foto cenital, desde arriba). */
  flat: boolean;
}

function useTilt(): Tilt {
  const [tilt, setTilt] = useState<Tilt>({ roll: 0, flat: false });
  useEffect(() => {
    Accelerometer.setUpdateInterval(120);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      // En Android el signo de los ejes va al revés que en iOS.
      const sx = Platform.OS === 'android' ? -x : x;
      const flat = Math.abs(z) > 0.85;
      const roll = (Math.atan2(sx, Math.abs(y)) * 180) / Math.PI;
      setTilt((prev) => ({ flat, roll: prev.roll * 0.6 + roll * 0.4 }));
    });
    return () => sub.remove();
  }, []);
  return tilt;
}

export function FramingGuide({ tips }: Props) {
  const { roll, flat } = useTilt();
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (tips.length < 2) return;
    const id = setInterval(() => setTipIndex((i) => (i + 1) % tips.length), 4500);
    return () => clearInterval(id);
  }, [tips.length]);

  const straight = Math.abs(roll) < 1.5;
  const levelColor = straight ? '#7CFC9A' : Math.abs(roll) < 4 ? '#FFD66B' : '#FF8A80';

  let message = tips[tipIndex] ?? 'Coloca lo importante en un cruce de líneas';
  if (flat) message = 'Foto desde arriba: centra el objeto';
  else if (Math.abs(roll) >= 4) message = 'Endereza el móvil: el horizonte está torcido';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Cuadrícula de tercios */}
      <View style={[styles.vLine, { left: '33.33%' }]} />
      <View style={[styles.vLine, { left: '66.66%' }]} />
      <View style={[styles.hLine, { top: '33.33%' }]} />
      <View style={[styles.hLine, { top: '66.66%' }]} />

      {/* Nivel del horizonte */}
      {!flat && (
        <View style={styles.levelWrap}>
          <View style={[styles.levelFixed]} />
          <View
            style={[
              styles.levelLine,
              { backgroundColor: levelColor, transform: [{ rotate: `${-roll}deg` }] },
            ]}
          />
          {straight && <Text style={styles.ok}>✓ Recto</Text>}
        </View>
      )}
      {flat && <View style={styles.centerDot} />}

      {/* Consejo */}
      <View style={styles.tip}>
        <Text style={styles.tipText}>{message}</Text>
      </View>
    </View>
  );
}

const LINE = 'rgba(255,255,255,0.45)';

const styles = StyleSheet.create({
  vLine: { position: 'absolute', top: 0, bottom: 0, width: StyleSheet.hairlineWidth * 2, backgroundColor: LINE },
  hLine: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth * 2, backgroundColor: LINE },
  levelWrap: {
    position: 'absolute',
    top: '50%',
    left: '25%',
    right: '25%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelFixed: { position: 'absolute', width: '30%', height: 2, backgroundColor: 'rgba(255,255,255,0.35)' },
  levelLine: { width: '100%', height: 2, borderRadius: 1 },
  ok: { position: 'absolute', top: 10, color: '#7CFC9A', fontWeight: '600', fontSize: 13 },
  centerDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 36,
    height: 36,
    marginLeft: -18,
    marginTop: -18,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  tip: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    maxWidth: '90%',
  },
  tipText: { color: '#fff', fontSize: 15, textAlign: 'center' },
});

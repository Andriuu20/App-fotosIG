import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Card, colors } from '../components/ui';
import { captionsConfigured } from '../lib/caption';
import { scheduleDailyNotifications } from '../lib/notifications';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Corner, type Settings } from '../lib/settings';

const CORNERS: { id: Corner; label: string }[] = [
  { id: 'arriba-izquierda', label: '↖' },
  { id: 'arriba-derecha', label: '↗' },
  { id: 'abajo-izquierda', label: '↙' },
  { id: 'abajo-derecha', label: '↘' },
];

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function TimeStepper({
  hour,
  minute,
  min,
  max,
  onChange,
}: {
  hour: number;
  minute: number;
  min: number;
  max: number;
  onChange: (h: number, m: number) => void;
}) {
  const step = (delta: number) => {
    let total = hour * 60 + minute + delta;
    total = Math.max(min * 60, Math.min(max * 60 + 30, total));
    onChange(Math.floor(total / 60), total % 60);
  };
  return (
    <View style={styles.stepper}>
      <Pressable onPress={() => step(-30)} hitSlop={8} style={styles.stepBtn}>
        <Text style={styles.stepText}>−</Text>
      </Pressable>
      <Text style={styles.time}>
        {pad(hour)}:{pad(minute)}
      </Text>
      <Pressable onPress={() => step(30)} hitSlop={8} style={styles.stepBtn}>
        <Text style={styles.stepText}>+</Text>
      </Pressable>
    </View>
  );
}

export default function SettingsScreen() {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings().then((v) => {
      setS(v);
      setLoaded(true);
    });
  }, []);

  const update = (patch: Partial<Settings>) => {
    const next = { ...s, ...patch };
    setS(next);
    saveSettings(next);
    if (
      'morningEnabled' in patch ||
      'morningHour' in patch ||
      'afternoonEnabled' in patch ||
      'afternoonHour' in patch
    ) {
      scheduleDailyNotifications(next).catch(() => {});
    }
  };

  if (!loaded) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.section}>Avisos (máximo 2 al día)</Text>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>☀️ Mañana</Text>
          <Switch value={s.morningEnabled} onValueChange={(v) => update({ morningEnabled: v })} />
        </View>
        {s.morningEnabled && (
          <TimeStepper
            hour={s.morningHour}
            minute={s.morningMinute}
            min={6}
            max={12}
            onChange={(h, m) => update({ morningHour: h, morningMinute: m })}
          />
        )}
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>🌇 Tarde</Text>
          <Switch value={s.afternoonEnabled} onValueChange={(v) => update({ afternoonEnabled: v })} />
        </View>
        {s.afternoonEnabled && (
          <TimeStepper
            hour={s.afternoonHour}
            minute={s.afternoonMinute}
            min={15}
            max={21}
            onChange={(h, m) => update({ afternoonHour: h, afternoonMinute: m })}
          />
        )}
      </Card>

      <Text style={styles.section}>Marca de agua</Text>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Logo pequeño y transparente</Text>
          <Switch value={s.watermark} onValueChange={(v) => update({ watermark: v })} />
        </View>
        {s.watermark && (
          <View style={styles.corners}>
            {CORNERS.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => update({ watermarkCorner: c.id })}
                style={[styles.corner, s.watermarkCorner === c.id && styles.cornerActive]}
              >
                <Text style={styles.cornerText}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
        <Text style={styles.muted}>En la versión premium no hay marca de agua.</Text>
      </Card>

      <Text style={styles.section}>Frases y canciones (IA)</Text>
      <Card style={styles.card}>
        <Text style={styles.muted}>
          {captionsConfigured()
            ? '✓ Usando IA (servidor configurado). Si falla, se usan las frases de la app.'
            : 'Usando frases y canciones de la app (gratis, sin IA). Para activar la IA, mira el README.'}
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12, paddingBottom: 40 },
  section: { fontSize: 15, fontWeight: '700', color: colors.muted, marginTop: 8 },
  card: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 16, color: colors.text, flexShrink: 1 },
  divider: { height: 1, backgroundColor: colors.border },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16, alignSelf: 'flex-start' },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 20, color: colors.accent, fontWeight: '700' },
  time: { fontSize: 18, fontVariant: ['tabular-nums'], color: colors.text, minWidth: 56, textAlign: 'center' },
  corners: { flexDirection: 'row', gap: 10 },
  corner: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  cornerText: { fontSize: 20 },
  muted: { color: colors.muted, fontSize: 14 },
});

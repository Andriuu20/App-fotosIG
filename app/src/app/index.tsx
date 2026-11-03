import { Link, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, colors } from '../components/ui';
import { WEATHER_LABEL, formatTime, loadConditions } from '../lib/conditions';
import { scheduleDailyNotifications } from '../lib/notifications';
import { startFlow, type Mode } from '../lib/session';
import { loadSettings } from '../lib/settings';
import { goldenState, momentOf, suggestionsFor, type Conditions } from '../lib/suggestions';

const GREETING = {
  manana: 'Buenos días',
  mediodia: 'Buenas tardes',
  tarde: 'Buenas tardes',
  noche: 'Buenas noches',
} as const;

export default function Home() {
  const [conditions, setConditions] = useState<Conditions>({ now: new Date() });
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    loadConditions()
      .then(setConditions)
      .finally(() => setLoading(false));
    loadSettings()
      .then(scheduleDailyNotifications)
      .catch(() => {});
  }, []);

  const ideas = useMemo(() => suggestionsFor(conditions), [conditions]);
  const idea = ideas[index % ideas.length];
  const golden = goldenState(conditions);

  const go = (mode: Mode) => {
    startFlow(mode, idea);
    router.push('/camera');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>{GREETING[momentOf(conditions.now)]} 👋</Text>
      <Text style={styles.subtitle}>Sal, mira a tu alrededor y llévate la foto perfecta.</Text>

      <Card style={styles.ideaCard}>
        {loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <>
            <Text style={styles.emoji}>{idea.emoji}</Text>
            <Text style={styles.ideaTitle}>{idea.title}</Text>
            <Text style={styles.ideaBody}>{idea.body}</Text>
            {ideas.length > 1 && (
              <Pressable onPress={() => setIndex((i) => i + 1)} hitSlop={10}>
                <Text style={styles.other}>🔄 Otra idea</Text>
              </Pressable>
            )}
          </>
        )}
      </Card>

      {(conditions.weather || conditions.sunset) && (
        <View style={styles.infoRow}>
          {conditions.weather && <Text style={styles.info}>{WEATHER_LABEL[conditions.weather]}</Text>}
          {conditions.goldenHourStart && (
            <Text style={styles.info}>
              {golden === 'manana' || golden === 'tarde'
                ? '🌅 Hora dorada ahora'
                : `🌅 Hora dorada ${formatTime(conditions.goldenHourStart)}`}
            </Text>
          )}
        </View>
      )}

      <View style={styles.buttons}>
        <Button title="📷  Solo foto" onPress={() => go('solo-foto')} />
        <Button title="✍️  Foto con frase y canción" variant="secondary" onPress={() => go('foto-texto')} />
      </View>

      <View style={styles.links}>
        <Link href="/gallery" style={styles.link}>
          🖼️ Mi galería
        </Link>
        <Link href="/settings" style={styles.link}>
          ⚙️ Ajustes
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40, gap: 16 },
  greeting: { fontSize: 30, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 16, color: colors.muted, marginTop: -8 },
  ideaCard: { gap: 8, paddingVertical: 24, minHeight: 180, justifyContent: 'center' },
  emoji: { fontSize: 44 },
  ideaTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  ideaBody: { fontSize: 16, color: colors.muted, lineHeight: 22 },
  other: { color: colors.accent, fontWeight: '600', marginTop: 8, fontSize: 15 },
  infoRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  info: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    color: colors.text,
    overflow: 'hidden',
  },
  buttons: { gap: 12, marginTop: 8 },
  links: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  link: { fontSize: 16, color: colors.text, padding: 8 },
});

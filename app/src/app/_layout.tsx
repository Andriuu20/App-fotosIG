import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '../components/ui';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
          headerBackTitle: 'Atrás',
        }}
      >
        <Stack.Screen name="index" options={{ title: '' }} />
        <Stack.Screen name="camera" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="edit" options={{ title: 'Tu foto' }} />
        <Stack.Screen name="gallery" options={{ title: 'Mi galería' }} />
        <Stack.Screen name="settings" options={{ title: 'Ajustes' }} />
      </Stack>
    </>
  );
}

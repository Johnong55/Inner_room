import '@/global.css';

import {
  CormorantGaramond_600SemiBold,
  useFonts as useCormorantFonts,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  useFonts as useManropeFonts,
} from '@expo-google-fonts/manrope';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { palette } from '@/constants/theme';
import { PrivacyGate } from '@/components/privacy/PrivacyGate';
import { initializeDatabase } from '@/database';
import { usePreferencesStore } from '@/stores/usePreferencesStore';

void SplashScreen.preventAutoHideAsync();

const innerRoomTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: palette.ink, card: palette.ink, text: palette.cream, border: palette.line, primary: palette.moss },
};

export default function RootLayout() {
  const [serifLoaded] = useCormorantFonts({ CormorantGaramond_600SemiBold });
  const [sansLoaded] = useManropeFonts({ Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold });
  const hydrate = usePreferencesStore((state) => state.hydrate);

  useEffect(() => {
    void Promise.all([hydrate(), initializeDatabase()]);
  }, [hydrate]);

  useEffect(() => {
    if (serifLoaded && sansLoaded) void SplashScreen.hideAsync();
  }, [sansLoaded, serifLoaded]);

  if (!serifLoaded || !sansLoaded) return null;

  return (
    <ThemeProvider value={innerRoomTheme}>
      <StatusBar style="light" />
      <PrivacyGate>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.ink }, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="journal/editor" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="journal/[id]" />
        <Stack.Screen name="conversation" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="quiet" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="untangle" />
        <Stack.Screen name="letters" />
        <Stack.Screen name="safety" options={{ presentation: 'modal' }} />
      </Stack>
      </PrivacyGate>
    </ThemeProvider>
  );
}

import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { usePreferencesStore } from '@/stores/usePreferencesStore';

export default function EntryRoute() {
  const hydrated = usePreferencesStore((state) => state.hydrated);
  const hasOnboarded = usePreferencesStore((state) => state.hasOnboarded);
  if (!hydrated) return <View className="flex-1 bg-ink" />;
  return <Redirect href={hasOnboarded ? '/(tabs)' : '/onboarding'} />;
}

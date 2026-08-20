import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { palette } from '@/constants/theme';
import { PressableScale } from './PressableScale';
import { Type } from './Type';

export function PageHeader({ title, subtitle, back = false }: { title: string; subtitle?: string; back?: boolean }) {
  const router = useRouter();
  return (
    <View className="mb-7 pt-4">
      {back ? (
        <PressableScale accessibilityLabel="Quay lại" onPress={() => router.back()} className="mb-5 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: palette.inkSoft }}>
          <ChevronLeft color={palette.cream} size={20} />
        </PressableScale>
      ) : null}
      <Type variant="title">{title}</Type>
      {subtitle ? <Type muted className="mt-2 max-w-[340px]">{subtitle}</Type> : null}
    </View>
  );
}

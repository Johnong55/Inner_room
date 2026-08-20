import { forwardRef, type ReactNode } from 'react';
import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/constants/theme';

type Props = ScrollViewProps & { children: ReactNode; scroll?: boolean; padded?: boolean };

export const Screen = forwardRef<ScrollView, Props>(function Screen(
  { children, scroll = true, padded = true, contentContainerStyle, ...props },
  ref,
) {
  const content = scroll ? (
    <ScrollView
      ref={ref}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[{ flexGrow: 1, paddingHorizontal: padded ? 20 : 0, paddingBottom: 120 }, contentContainerStyle]}
      {...props}>
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${padded ? 'px-5' : ''}`}>{children}</View>
  );

  return <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.ink }}>{content}</SafeAreaView>;
});

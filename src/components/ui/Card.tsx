import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { palette } from '@/constants/theme';

export function Card({ className = '', style, ...props }: ComponentProps<typeof View>) {
  return (
    <View
      {...props}
      className={`rounded-[18px] border p-5 ${className}`}
      style={[{ backgroundColor: palette.inkRaised, borderColor: palette.line }, style]}
    />
  );
}

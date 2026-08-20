import type { ComponentProps } from 'react';
import { Text } from 'react-native';

import { palette } from '@/constants/theme';

type Props = ComponentProps<typeof Text> & {
  variant?: 'display' | 'title' | 'heading' | 'body' | 'small' | 'eyebrow';
  muted?: boolean;
};

const variants = {
  display: 'font-display text-[38px] leading-[42px]',
  title: 'font-display text-[32px] leading-[36px]',
  heading: 'font-semibold text-[18px] leading-7',
  body: 'font-sans text-[15px] leading-6',
  small: 'font-sans text-[13px] leading-5',
  eyebrow: 'font-semibold text-[11px] uppercase tracking-[2px]',
};

export function Type({ variant = 'body', muted, className = '', style, ...props }: Props) {
  return (
    <Text
      {...props}
      className={`${variants[variant]} ${className}`}
      style={[{ color: muted ? palette.fog : palette.cream }, style]}
    />
  );
}

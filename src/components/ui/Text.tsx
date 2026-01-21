/**
 * MCG Golf App - Text Component
 * Typography component with built-in text styles
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { textStyles, TextStyle } from '@/design';

interface TextProps extends RNTextProps {
  variant?: TextStyle;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export function Text({
  variant = 'bodyMedium',
  color,
  align,
  style,
  children,
  ...props
}: TextProps) {
  const { colors } = useTheme();

  const textStyle = textStyles[variant];
  const textColor = color || colors.text;

  return (
    <RNText
      style={[
        textStyle,
        { color: textColor },
        align && { textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

// Convenience components for common text styles
export function Heading({
  level = 1,
  ...props
}: Omit<TextProps, 'variant'> & { level?: 1 | 2 | 3 | 4 }) {
  const variants: Record<number, TextStyle> = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
  };
  const { colors } = useTheme();

  return <Text variant={variants[level]} color={colors.textHeading} {...props} />;
}

export function BodyText(props: Omit<TextProps, 'variant'>) {
  return <Text variant="bodyMedium" {...props} />;
}

export function Caption(props: Omit<TextProps, 'variant'>) {
  const { colors } = useTheme();
  return <Text variant="caption" color={colors.textMuted} {...props} />;
}

export function Label(props: Omit<TextProps, 'variant'>) {
  return <Text variant="labelMedium" {...props} />;
}

// Metric display component for TrackMan-style numbers
export function MetricValue({
  value,
  unit,
  size = 'medium',
  color,
  ...props
}: Omit<TextProps, 'variant' | 'children'> & {
  value: string | number;
  unit?: string;
  size?: 'small' | 'medium' | 'large';
}) {
  const { colors } = useTheme();
  const variants: Record<string, TextStyle> = {
    small: 'metricSmall',
    medium: 'metricMedium',
    large: 'metricLarge',
  };

  return (
    <RNText style={styles.metricContainer}>
      <Text variant={variants[size]} color={color || colors.textHeading} {...props}>
        {value}
      </Text>
      {unit && (
        <Text variant="metricUnit" color={colors.textMuted}>
          {' '}{unit}
        </Text>
      )}
    </RNText>
  );
}

const styles = StyleSheet.create({
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
});

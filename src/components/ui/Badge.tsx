/**
 * MCG Golf App - Badge Component
 * Status indicators, tags, and labels
 */

import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius } from '@/design';
import { Text } from './Text';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  outlined?: boolean;
}

export function Badge({
  label,
  variant = 'primary',
  size = 'medium',
  icon,
  outlined = false,
  style,
  ...props
}: BadgeProps) {
  const { colors } = useTheme();

  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: outlined ? 'transparent' : colors.primaryMuted,
          text: colors.primary,
          border: colors.primary,
        };
      case 'secondary':
        return {
          bg: outlined ? 'transparent' : colors.secondaryMuted,
          text: colors.secondary,
          border: colors.secondary,
        };
      case 'success':
        return {
          bg: outlined ? 'transparent' : colors.successLight,
          text: colors.success,
          border: colors.success,
        };
      case 'warning':
        return {
          bg: outlined ? 'transparent' : colors.warningLight,
          text: colors.warning,
          border: colors.warning,
        };
      case 'error':
        return {
          bg: outlined ? 'transparent' : colors.errorLight,
          text: colors.error,
          border: colors.error,
        };
      case 'info':
        return {
          bg: outlined ? 'transparent' : colors.infoLight,
          text: colors.info,
          border: colors.info,
        };
      case 'neutral':
      default:
        return {
          bg: outlined ? 'transparent' : colors.backgroundTertiary,
          text: colors.textSecondary,
          border: colors.border,
        };
    }
  };

  const sizeStyles = {
    small: {
      paddingVertical: spacing[0.5],
      paddingHorizontal: spacing[2],
      gap: spacing[1],
      textVariant: 'caption' as const,
    },
    medium: {
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[3],
      gap: spacing[1.5],
      textVariant: 'labelSmall' as const,
    },
    large: {
      paddingVertical: spacing[1.5],
      paddingHorizontal: spacing[4],
      gap: spacing[2],
      textVariant: 'labelMedium' as const,
    },
  };

  const variantColors = getVariantColors();
  const sizeStyle = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantColors.bg,
          borderColor: variantColors.border,
          borderWidth: outlined ? 1 : 0,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
        },
        style,
      ]}
      {...props}
    >
      {icon && <View style={{ marginRight: sizeStyle.gap }}>{icon}</View>}
      <Text variant={sizeStyle.textVariant} color={variantColors.text}>
        {label}
      </Text>
    </View>
  );
}

// Score badge - displays a score with color coding
interface ScoreBadgeProps extends ViewProps {
  score: number;
  maxScore?: number;
  size?: BadgeSize;
}

export function ScoreBadge({ score, maxScore = 100, size = 'medium', style, ...props }: ScoreBadgeProps) {
  const percentage = (score / maxScore) * 100;

  let variant: BadgeVariant = 'success';
  if (percentage < 50) variant = 'error';
  else if (percentage < 70) variant = 'warning';
  else if (percentage < 85) variant = 'info';

  return (
    <Badge
      label={`${score}/${maxScore}`}
      variant={variant}
      size={size}
      style={style}
      {...props}
    />
  );
}

// Difficulty badge
interface DifficultyBadgeProps extends ViewProps {
  level: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  size?: BadgeSize;
}

export function DifficultyBadge({ level, size = 'small', style, ...props }: DifficultyBadgeProps) {
  const variants: Record<string, BadgeVariant> = {
    beginner: 'success',
    intermediate: 'info',
    advanced: 'warning',
    pro: 'error',
  };

  const labels: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    pro: 'Pro',
  };

  return (
    <Badge
      label={labels[level]}
      variant={variants[level]}
      size={size}
      style={style}
      {...props}
    />
  );
}

// Category/tag badge
interface TagProps extends ViewProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Tag({ label, selected = false, style, ...props }: TagProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: selected ? colors.primary : colors.backgroundSecondary,
          borderColor: selected ? colors.primary : colors.border,
        },
        style,
      ]}
      {...props}
    >
      <Text
        variant="labelSmall"
        color={selected ? '#FFFFFF' : colors.textSecondary}
      >
        {label}
      </Text>
    </View>
  );
}

// Notification dot
interface DotProps {
  color?: string;
  size?: number;
  pulse?: boolean;
}

export function Dot({ color, size = 8, pulse = false }: DotProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          backgroundColor: color || colors.error,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  tag: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: radius.full,
  },
});

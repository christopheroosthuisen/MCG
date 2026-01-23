/**
 * MCG Golf App - Card Component
 * Premium card containers with multiple variants
 */

import React from 'react';
import { View, StyleSheet, Pressable, ViewProps, PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius, shadowsIOS, elevation } from '@/design';

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'gradient';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: keyof typeof spacing;
  borderRadius?: keyof typeof radius;
  children: React.ReactNode;
}

export function Card({
  variant = 'elevated',
  padding = 4,
  borderRadius = 'xl',
  style,
  children,
  ...props
}: CardProps) {
  const { colors, isDark } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          ...shadowsIOS.md,
          borderWidth: 0,
        };

      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };

      case 'filled':
        return {
          backgroundColor: colors.backgroundSecondary,
          borderWidth: 0,
        };

      default:
        return {
          backgroundColor: colors.surface,
          ...shadowsIOS.md,
        };
    }
  };

  return (
    <View
      style={[
        styles.base,
        getVariantStyles(),
        { padding: spacing[padding], borderRadius: radius[borderRadius] },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

// Pressable card variant
interface PressableCardProps extends Omit<PressableProps, 'style'> {
  variant?: CardVariant;
  padding?: keyof typeof spacing;
  borderRadius?: keyof typeof radius;
  children: React.ReactNode;
  style?: ViewProps['style'];
}

export function PressableCard({
  variant = 'elevated',
  padding = 4,
  borderRadius = 'xl',
  style,
  children,
  ...props
}: PressableCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: colors.surface,
          padding: spacing[padding],
          borderRadius: radius[borderRadius],
          ...(variant === 'elevated' ? shadowsIOS.md : {}),
          ...(variant === 'outlined' ? { borderWidth: 1, borderColor: colors.border } : {}),
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

// Gradient card for featured content
interface GradientCardProps extends ViewProps {
  colors?: [string, string];
  padding?: keyof typeof spacing;
  borderRadius?: keyof typeof radius;
  children: React.ReactNode;
}

export function GradientCard({
  colors: gradientColors,
  padding = 6,
  borderRadius = '2xl',
  style,
  children,
  ...props
}: GradientCardProps) {
  const { gradients } = useTheme();

  return (
    <LinearGradient
      colors={gradientColors || gradients.primaryCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.base,
        styles.gradientCard,
        { padding: spacing[padding], borderRadius: radius[borderRadius] },
        style,
      ]}
      {...props}
    >
      {children}
    </LinearGradient>
  );
}

// Metric card for TrackMan-style data display
interface MetricCardProps extends ViewProps {
  size?: 'small' | 'medium' | 'large';
  highlighted?: boolean;
  children: React.ReactNode;
}

export function MetricCard({
  size = 'medium',
  highlighted = false,
  style,
  children,
  ...props
}: MetricCardProps) {
  const { colors } = useTheme();

  const sizeStyles = {
    small: {
      padding: spacing[2],
      minWidth: 70,
    },
    medium: {
      padding: spacing[3],
      minWidth: 90,
    },
    large: {
      padding: spacing[4],
      minWidth: 120,
    },
  };

  return (
    <View
      style={[
        styles.metricCard,
        sizeStyles[size],
        {
          backgroundColor: highlighted ? colors.primaryMuted : colors.backgroundSecondary,
          borderColor: highlighted ? colors.primary : 'transparent',
          borderWidth: highlighted ? 1 : 0,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

// Glass-morphism card for overlays
interface GlassCardProps extends ViewProps {
  blur?: number;
  opacity?: number;
  children: React.ReactNode;
}

export function GlassCard({
  blur = 20,
  opacity = 0.8,
  style,
  children,
  ...props
}: GlassCardProps) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.base,
        styles.glassCard,
        {
          backgroundColor: isDark
            ? `rgba(30, 30, 40, ${opacity})`
            : `rgba(255, 255, 255, ${opacity})`,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  gradientCard: {
    ...shadowsIOS.lg,
  },
  metricCard: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassCard: {
    borderRadius: radius.xl,
    padding: spacing[4],
    // Note: For true blur effect, use expo-blur BlurView in actual implementation
  },
});

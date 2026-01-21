/**
 * MCG Golf App - Button Component
 * Premium button with multiple variants and states
 */

import React from 'react';
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  View,
  PressableProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius, layout, textStyles, shadowsIOS } from '@/design';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  style?: PressableProps['style'];
}

export function Button({
  variant = 'primary',
  size = 'medium',
  label,
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();

  const sizeStyles = {
    small: {
      height: layout.buttonHeightSmall,
      paddingHorizontal: spacing[4],
      gap: spacing[2],
    },
    medium: {
      height: layout.buttonHeightMedium,
      paddingHorizontal: spacing[6],
      gap: spacing[2],
    },
    large: {
      height: layout.buttonHeightLarge,
      paddingHorizontal: spacing[8],
      gap: spacing[3],
    },
  };

  const textVariants = {
    small: 'buttonSmall' as const,
    medium: 'buttonMedium' as const,
    large: 'buttonLarge' as const,
  };

  const getVariantStyles = (pressed: boolean) => {
    const baseOpacity = disabled ? 0.5 : pressed ? 0.9 : 1;

    switch (variant) {
      case 'primary':
        return {
          useGradient: true,
          gradientColors: [colors.primary, colors.primaryDark] as [string, string],
          textColor: '#FFFFFF',
          borderWidth: 0,
          borderColor: 'transparent',
          opacity: baseOpacity,
        };

      case 'secondary':
        return {
          useGradient: true,
          gradientColors: [colors.secondary, colors.secondaryDark] as [string, string],
          textColor: '#FFFFFF',
          borderWidth: 0,
          borderColor: 'transparent',
          opacity: baseOpacity,
        };

      case 'outline':
        return {
          useGradient: false,
          backgroundColor: pressed ? colors.primaryMuted : 'transparent',
          textColor: colors.primary,
          borderWidth: 2,
          borderColor: colors.primary,
          opacity: baseOpacity,
        };

      case 'ghost':
        return {
          useGradient: false,
          backgroundColor: pressed ? colors.backgroundSecondary : 'transparent',
          textColor: colors.text,
          borderWidth: 0,
          borderColor: 'transparent',
          opacity: baseOpacity,
        };

      case 'danger':
        return {
          useGradient: false,
          backgroundColor: pressed ? colors.errorLight : colors.error,
          textColor: '#FFFFFF',
          borderWidth: 0,
          borderColor: 'transparent',
          opacity: baseOpacity,
        };

      default:
        return {
          useGradient: false,
          backgroundColor: colors.primary,
          textColor: '#FFFFFF',
          borderWidth: 0,
          borderColor: 'transparent',
          opacity: baseOpacity,
        };
    }
  };

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...props}
    >
      {({ pressed }) => {
        const variantStyles = getVariantStyles(pressed);

        const content = (
          <View style={styles.content}>
            {loading ? (
              <ActivityIndicator color={variantStyles.textColor} size="small" />
            ) : (
              <>
                {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
                <Text
                  variant={textVariants[size]}
                  color={variantStyles.textColor}
                  style={styles.label}
                >
                  {label}
                </Text>
                {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
              </>
            )}
          </View>
        );

        if (variantStyles.useGradient) {
          return (
            <LinearGradient
              colors={variantStyles.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.gradientContainer,
                sizeStyles[size],
                { opacity: variantStyles.opacity },
                variant === 'primary' && shadowsIOS.orange,
              ]}
            >
              {content}
            </LinearGradient>
          );
        }

        return (
          <View
            style={[
              styles.solidContainer,
              sizeStyles[size],
              {
                backgroundColor: variantStyles.backgroundColor,
                borderWidth: variantStyles.borderWidth,
                borderColor: variantStyles.borderColor,
                opacity: variantStyles.opacity,
              },
            ]}
          >
            {content}
          </View>
        );
      }}
    </Pressable>
  );
}

// Icon-only button variant
export function IconButton({
  icon,
  variant = 'ghost',
  size = 'medium',
  ...props
}: Omit<ButtonProps, 'label' | 'leftIcon' | 'rightIcon'> & { icon: React.ReactNode }) {
  const { colors } = useTheme();

  const sizes = {
    small: 36,
    medium: 44,
    large: 52,
  };

  const getBackgroundColor = (pressed: boolean) => {
    if (variant === 'primary') return colors.primary;
    if (variant === 'secondary') return colors.secondary;
    if (pressed) return colors.backgroundSecondary;
    return 'transparent';
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.iconButton,
        {
          width: sizes[size],
          height: sizes[size],
          backgroundColor: getBackgroundColor(pressed),
        },
      ]}
      {...props}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  gradientContainer: {
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  solidContainer: {
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginHorizontal: spacing[1],
  },
  label: {
    textAlign: 'center',
  },
  iconButton: {
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

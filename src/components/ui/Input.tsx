/**
 * MCG Golf App - Input Component
 * Text input with validation states and accessories
 */

import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius, layout, textStyles } from '@/design';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  size?: 'medium' | 'large';
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      size = 'medium',
      style,
      ...props
    },
    ref
  ) => {
    const { colors, isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const hasError = !!error;
    const height = size === 'large' ? layout.inputHeightLarge : layout.inputHeight;

    const getBorderColor = () => {
      if (hasError) return colors.error;
      if (isFocused) return colors.primary;
      return colors.border;
    };

    const getBackgroundColor = () => {
      if (isDark) return colors.backgroundSecondary;
      return colors.surface;
    };

    return (
      <View style={styles.container}>
        {label && (
          <Text
            variant="labelMedium"
            color={hasError ? colors.error : colors.textSecondary}
            style={styles.label}
          >
            {label}
          </Text>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              height,
              backgroundColor: getBackgroundColor(),
              borderColor: getBorderColor(),
              borderWidth: isFocused ? 2 : 1,
            },
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              textStyles.bodyMedium,
              { color: colors.text },
              leftIcon && { paddingLeft: 0 },
              rightIcon && { paddingRight: 0 },
              style,
            ]}
            placeholderTextColor={colors.textMuted}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {rightIcon && (
            <Pressable
              onPress={onRightIconPress}
              style={styles.rightIcon}
              disabled={!onRightIconPress}
            >
              {rightIcon}
            </Pressable>
          )}
        </View>

        {(error || hint) && (
          <Text
            variant="caption"
            color={hasError ? colors.error : colors.textMuted}
            style={styles.helperText}
          >
            {error || hint}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

// Search input variant
interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onClear?: () => void;
}

export function SearchInput({ onClear, value, ...props }: SearchInputProps) {
  const { colors } = useTheme();

  return (
    <Input
      placeholder="Search..."
      leftIcon={
        <View style={styles.searchIcon}>
          {/* Search icon would go here - using placeholder */}
          <Text color={colors.textMuted}>🔍</Text>
        </View>
      }
      rightIcon={
        value ? (
          <Pressable onPress={onClear}>
            <Text color={colors.textMuted}>✕</Text>
          </Pressable>
        ) : undefined
      }
      onRightIconPress={onClear}
      value={value}
      {...props}
    />
  );
}

// Numeric input for metrics
interface NumericInputProps extends Omit<InputProps, 'keyboardType'> {
  unit?: string;
  min?: number;
  max?: number;
}

export function NumericInput({ unit, min, max, ...props }: NumericInputProps) {
  const { colors } = useTheme();

  return (
    <Input
      keyboardType="numeric"
      rightIcon={
        unit ? (
          <Text variant="labelSmall" color={colors.textMuted}>
            {unit}
          </Text>
        ) : undefined
      }
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    marginBottom: spacing[2],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingHorizontal: spacing[4],
  },
  input: {
    flex: 1,
    height: '100%',
  },
  leftIcon: {
    marginRight: spacing[3],
  },
  rightIcon: {
    marginLeft: spacing[3],
    padding: spacing[1],
  },
  helperText: {
    marginTop: spacing[1],
  },
  searchIcon: {
    opacity: 0.5,
  },
});

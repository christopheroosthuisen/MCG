/**
 * MCG Golf App - Progress Bar Component
 * Visual progress indicators with multiple variants
 */

import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius, durations } from '@/design';
import { Text } from './Text';

type ProgressVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gradient';
type ProgressSize = 'small' | 'medium' | 'large';

interface ProgressBarProps extends ViewProps {
  progress: number; // 0-100
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  variant = 'primary',
  size = 'medium',
  showLabel = false,
  animated = true,
  style,
  ...props
}: ProgressBarProps) {
  const { colors, gradients } = useTheme();

  const clampedProgress = Math.max(0, Math.min(100, progress));

  const sizeStyles = {
    small: { height: 4 },
    medium: { height: 8 },
    large: { height: 12 },
  };

  const getColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const animatedWidth = useAnimatedStyle(() => {
    return {
      width: animated
        ? withTiming(`${clampedProgress}%`, {
            duration: durations.slow,
            easing: Easing.out(Easing.cubic),
          })
        : `${clampedProgress}%`,
    };
  }, [clampedProgress, animated]);

  return (
    <View style={[styles.container, style]} {...props}>
      <View
        style={[
          styles.track,
          sizeStyles[size],
          { backgroundColor: colors.backgroundTertiary },
        ]}
      >
        {variant === 'gradient' ? (
          <Animated.View style={[styles.fill, animatedWidth]}>
            <LinearGradient
              colors={gradients.orangeGlow as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientFill}
            />
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.fill,
              sizeStyles[size],
              { backgroundColor: getColor() },
              animatedWidth,
            ]}
          />
        )}
      </View>

      {showLabel && (
        <Text variant="labelSmall" color={colors.textMuted} style={styles.label}>
          {Math.round(clampedProgress)}%
        </Text>
      )}
    </View>
  );
}

// Circular progress indicator
interface CircularProgressProps extends ViewProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
}

export function CircularProgress({
  progress,
  size = 80,
  strokeWidth = 8,
  color,
  backgroundColor,
  showValue = true,
  style,
  ...props
}: CircularProgressProps) {
  const { colors } = useTheme();

  const clampedProgress = Math.max(0, Math.min(100, progress));
  const progressColor = color || colors.primary;
  const bgColor = backgroundColor || colors.backgroundTertiary;

  // SVG calculations
  const center = size / 2;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <View style={[{ width: size, height: size }, style]} {...props}>
      {/* Using View-based approach since SVG requires additional setup */}
      <View
        style={[
          styles.circularTrack,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: bgColor,
          },
        ]}
      />
      {showValue && (
        <View style={styles.circularLabel}>
          <Text variant="metricMedium" color={colors.textHeading}>
            {Math.round(clampedProgress)}
          </Text>
        </View>
      )}
    </View>
  );
}

// Score ring - displays a score with color coding
interface ScoreRingProps extends ViewProps {
  score: number;
  maxScore?: number;
  size?: number;
  label?: string;
}

export function ScoreRing({
  score,
  maxScore = 100,
  size = 100,
  label,
  style,
  ...props
}: ScoreRingProps) {
  const { colors } = useTheme();

  const percentage = (score / maxScore) * 100;

  let color = colors.success;
  if (percentage < 50) color = colors.error;
  else if (percentage < 70) color = colors.warning;
  else if (percentage < 85) color = colors.info;

  return (
    <View style={[styles.scoreRingContainer, style]} {...props}>
      <View
        style={[
          styles.scoreRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 6,
            borderColor: colors.backgroundTertiary,
          },
        ]}
      >
        <View
          style={[
            styles.scoreRingFill,
            {
              width: size - 12,
              height: size - 12,
              borderRadius: (size - 12) / 2,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <Text variant="metricLarge" color={color}>
            {score}
          </Text>
          {label && (
            <Text variant="caption" color={colors.textMuted}>
              {label}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

// Step progress for multi-step flows
interface StepProgressProps extends ViewProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function StepProgress({
  currentStep,
  totalSteps,
  labels,
  style,
  ...props
}: StepProgressProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.stepContainer, style]} {...props}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === totalSteps - 1;

        return (
          <React.Fragment key={index}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: isCompleted || isCurrent
                      ? colors.primary
                      : colors.backgroundTertiary,
                    borderWidth: isCurrent ? 3 : 0,
                    borderColor: colors.primaryMuted,
                  },
                ]}
              >
                {isCompleted && (
                  <Text color="#FFFFFF" variant="caption">✓</Text>
                )}
              </View>
              {labels && labels[index] && (
                <Text
                  variant="caption"
                  color={isCurrent ? colors.primary : colors.textMuted}
                  style={styles.stepLabel}
                >
                  {labels[index]}
                </Text>
              )}
            </View>

            {!isLast && (
              <View
                style={[
                  styles.stepConnector,
                  {
                    backgroundColor: isCompleted
                      ? colors.primary
                      : colors.backgroundTertiary,
                  },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radius.full,
  },
  gradientFill: {
    flex: 1,
    height: '100%',
    borderRadius: radius.full,
  },
  label: {
    marginLeft: spacing[2],
    minWidth: 36,
  },
  circularTrack: {
    position: 'absolute',
  },
  circularLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingContainer: {
    alignItems: 'center',
  },
  scoreRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingFill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    marginTop: spacing[1],
    textAlign: 'center',
    maxWidth: 60,
  },
  stepConnector: {
    height: 2,
    flex: 1,
    marginTop: 11,
    marginHorizontal: spacing[2],
  },
});

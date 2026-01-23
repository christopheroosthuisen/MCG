/**
 * MCG Golf App - Analysis Progress Component
 * Loading states and progress indicators for video analysis
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius } from '@/design';
import { Text, ProgressBar } from '@/components/ui';
import { AnalysisProgress as AnalysisProgressType, AnalysisStatus } from '@/types/analysis';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================

interface AnalysisProgressProps {
  progress: AnalysisProgressType;
  onCancel?: () => void;
  showDetails?: boolean;
}

// ============================================
// STEP DEFINITIONS
// ============================================

interface AnalysisStep {
  status: AnalysisStatus;
  label: string;
  description: string;
  icon: string;
  estimatedDuration: number; // seconds
}

const ANALYSIS_STEPS: AnalysisStep[] = [
  {
    status: 'uploading',
    label: 'Uploading Video',
    description: 'Preparing your video for analysis',
    icon: 'cloud-upload',
    estimatedDuration: 5,
  },
  {
    status: 'processing-video',
    label: 'Processing Video',
    description: 'Extracting frames and optimizing quality',
    icon: 'film',
    estimatedDuration: 10,
  },
  {
    status: 'detecting-poses',
    label: 'Detecting Poses',
    description: 'Identifying body positions and joints',
    icon: 'body',
    estimatedDuration: 15,
  },
  {
    status: 'analyzing-swing',
    label: 'Analyzing Swing',
    description: 'Evaluating mechanics and technique',
    icon: 'analytics',
    estimatedDuration: 20,
  },
  {
    status: 'generating-feedback',
    label: 'Generating Feedback',
    description: 'Creating personalized recommendations',
    icon: 'chatbubbles',
    estimatedDuration: 10,
  },
];

// ============================================
// ANIMATED ICONS
// ============================================

const PulsingIcon = ({ name, color, size }: { name: string; color: string; size: number }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 500, easing: Easing.ease }),
        withTiming(1, { duration: 500, easing: Easing.ease })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name as any} size={size} color={color} />
    </Animated.View>
  );
};

const RotatingIcon = ({ name, color, size }: { name: string; color: string; size: number }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name as any} size={size} color={color} />
    </Animated.View>
  );
};

// ============================================
// STEP INDICATOR
// ============================================

const StepIndicator = ({
  step,
  index,
  currentStepIndex,
  isActive,
  isComplete,
}: {
  step: AnalysisStep;
  index: number;
  currentStepIndex: number;
  isActive: boolean;
  isComplete: boolean;
}) => {
  const { colors } = useTheme();

  const getStepColor = () => {
    if (isComplete) return colors.success;
    if (isActive) return colors.primary;
    return 'rgba(255,255,255,0.2)';
  };

  return (
    <View style={styles.stepIndicator}>
      <View
        style={[
          styles.stepDot,
          { backgroundColor: getStepColor() },
          isActive && styles.stepDotActive,
        ]}
      >
        {isComplete ? (
          <Ionicons name="checkmark" size={14} color="#FFF" />
        ) : isActive ? (
          <View style={styles.stepDotInner} />
        ) : (
          <Text variant="caption" color="#888">
            {index + 1}
          </Text>
        )}
      </View>

      {index < ANALYSIS_STEPS.length - 1 && (
        <View
          style={[
            styles.stepConnector,
            { backgroundColor: isComplete ? colors.success : 'rgba(255,255,255,0.1)' },
          ]}
        />
      )}
    </View>
  );
};

// ============================================
// ANALYSIS PROGRESS COMPONENT
// ============================================

export function AnalysisProgressView({
  progress,
  onCancel,
  showDetails = true,
}: AnalysisProgressProps) {
  const { colors } = useTheme();
  const [elapsedTime, setElapsedTime] = useState(0);

  // Find current step index
  const currentStepIndex = ANALYSIS_STEPS.findIndex(
    (step) => step.status === progress.status
  );
  const currentStep = ANALYSIS_STEPS[currentStepIndex] || ANALYSIS_STEPS[0];

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Error state
  if (progress.status === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.errorState}>
          <View style={[styles.errorIcon, { backgroundColor: `${colors.error}30` }]}>
            <Ionicons name="alert-circle" size={48} color={colors.error} />
          </View>
          <Text variant="h3" color="#FFF" style={styles.errorTitle}>
            Analysis Failed
          </Text>
          <Text variant="bodyMedium" color="#AAA" align="center">
            {progress.message || 'Something went wrong. Please try again.'}
          </Text>
        </View>
      </View>
    );
  }

  // Complete state
  if (progress.status === 'complete') {
    return (
      <Animated.View
        entering={FadeIn}
        style={styles.container}
      >
        <View style={styles.completeState}>
          <View style={[styles.completeIcon, { backgroundColor: `${colors.success}30` }]}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          </View>
          <Text variant="h2" color="#FFF" style={styles.completeTitle}>
            Analysis Complete!
          </Text>
          <Text variant="bodyMedium" color="#AAA" align="center">
            Your swing has been analyzed. View your results below.
          </Text>
          <View style={styles.completeStats}>
            <View style={styles.completeStat}>
              <Text variant="metricMedium" color={colors.primary}>
                {formatTime(elapsedTime)}
              </Text>
              <Text variant="caption" color="#888">
                Processing time
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main progress area */}
      <View style={styles.mainProgress}>
        {/* Animated icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
          {progress.status === 'detecting-poses' ? (
            <RotatingIcon name="scan" size={48} color={colors.primary} />
          ) : (
            <PulsingIcon name={currentStep.icon} size={48} color={colors.primary} />
          )}
        </View>

        {/* Status text */}
        <Text variant="h3" color="#FFF" style={styles.statusTitle}>
          {currentStep.label}
        </Text>
        <Text variant="bodyMedium" color="#AAA" align="center" style={styles.statusDescription}>
          {progress.message || currentStep.description}
        </Text>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <ProgressBar
            progress={progress.progress}
            variant="gradient"
            size="large"
            showLabel
          />
        </View>

        {/* Time estimate */}
        {progress.estimatedTimeRemaining && (
          <View style={styles.timeEstimate}>
            <Ionicons name="time-outline" size={16} color="#888" />
            <Text variant="caption" color="#888">
              About {Math.ceil(progress.estimatedTimeRemaining / 60)} min remaining
            </Text>
          </View>
        )}
      </View>

      {/* Steps indicator */}
      {showDetails && (
        <View style={styles.stepsSection}>
          <View style={styles.stepsRow}>
            {ANALYSIS_STEPS.map((step, index) => (
              <StepIndicator
                key={step.status}
                step={step}
                index={index}
                currentStepIndex={currentStepIndex}
                isActive={index === currentStepIndex}
                isComplete={index < currentStepIndex}
              />
            ))}
          </View>

          {/* Step labels */}
          <View style={styles.stepLabels}>
            {ANALYSIS_STEPS.map((step, index) => (
              <View key={step.status} style={styles.stepLabelContainer}>
                <Text
                  variant="caption"
                  color={index <= currentStepIndex ? '#FFF' : '#666'}
                  align="center"
                  numberOfLines={2}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Cancel button */}
      {onCancel && (
        <View style={styles.cancelSection}>
          <Text
            variant="labelMedium"
            color="#888"
            style={styles.cancelText}
            onPress={onCancel}
          >
            Cancel Analysis
          </Text>
        </View>
      )}

      {/* Elapsed time */}
      <View style={styles.elapsedTime}>
        <Text variant="caption" color="#666">
          Elapsed: {formatTime(elapsedTime)}
        </Text>
      </View>
    </View>
  );
}

// ============================================
// MINI PROGRESS BAR (for overlay)
// ============================================

interface MiniProgressProps {
  progress: AnalysisProgressType;
  onPress?: () => void;
}

export function MiniAnalysisProgress({ progress, onPress }: MiniProgressProps) {
  const { colors } = useTheme();
  const currentStep = ANALYSIS_STEPS.find((s) => s.status === progress.status);

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={styles.miniContainer}
    >
      <View style={styles.miniContent}>
        <ActivityIndicator size="small" color={colors.primary} />
        <View style={styles.miniTextContainer}>
          <Text variant="labelSmall" color="#FFF">
            {currentStep?.label || 'Analyzing...'}
          </Text>
          <View style={styles.miniProgressBar}>
            <View
              style={[
                styles.miniProgressFill,
                {
                  width: `${progress.progress}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </View>
        <Text variant="labelSmall" color={colors.primary}>
          {progress.progress}%
        </Text>
      </View>
    </Animated.View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D12',
    padding: spacing[4],
    justifyContent: 'center',
  },

  // Main progress
  mainProgress: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  statusTitle: {
    marginBottom: spacing[2],
  },
  statusDescription: {
    marginBottom: spacing[6],
    maxWidth: 280,
  },
  progressBarContainer: {
    width: '100%',
    maxWidth: 300,
  },
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
  },

  // Steps section
  stepsSection: {
    marginBottom: spacing[6],
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  stepDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  stepConnector: {
    width: 40,
    height: 2,
    marginHorizontal: spacing[1],
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[2],
  },
  stepLabelContainer: {
    width: 60,
    alignItems: 'center',
  },

  // Cancel section
  cancelSection: {
    alignItems: 'center',
    marginTop: spacing[4],
  },
  cancelText: {
    padding: spacing[2],
  },

  // Elapsed time
  elapsedTime: {
    position: 'absolute',
    bottom: spacing[4],
    right: spacing[4],
  },

  // Error state
  errorState: {
    alignItems: 'center',
  },
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  errorTitle: {
    marginBottom: spacing[2],
  },

  // Complete state
  completeState: {
    alignItems: 'center',
  },
  completeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  completeTitle: {
    marginBottom: spacing[2],
  },
  completeStats: {
    flexDirection: 'row',
    gap: spacing[6],
    marginTop: spacing[6],
  },
  completeStat: {
    alignItems: 'center',
  },

  // Mini progress
  miniContainer: {
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    borderRadius: radius.xl,
    padding: spacing[3],
    margin: spacing[2],
  },
  miniContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  miniTextContainer: {
    flex: 1,
  },
  miniProgressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: spacing[1],
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default AnalysisProgressView;

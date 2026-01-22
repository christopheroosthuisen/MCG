/**
 * MCG Golf App - Keyframe Marker Component
 * System for marking 4 key swing positions
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius, shadowsIOS } from '@/design';
import { Text, Button } from '@/components/ui';
import { Keyframe, KeyframeType, REQUIRED_KEYFRAMES } from '@/types/analysis';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// KEYFRAME DEFINITIONS
// ============================================

interface KeyframeDefinition {
  type: KeyframeType;
  label: string;
  shortLabel: string;
  shortcut: string;
  color: string;
  icon: string;
  description: string;
  tips: string[];
}

const KEYFRAME_DEFINITIONS: KeyframeDefinition[] = [
  {
    type: 'backswing-start',
    label: 'Backswing Start',
    shortLabel: 'Start',
    shortcut: '1',
    color: '#00FFFF',
    icon: 'play-back-outline',
    description: 'The moment the club begins moving back',
    tips: [
      'Club should be just leaving address position',
      'Weight should still be centered',
      'Hands should be starting to move',
    ],
  },
  {
    type: 'top-of-backswing',
    label: 'Top of Backswing',
    shortLabel: 'Top',
    shortcut: '2',
    color: '#FF00FF',
    icon: 'arrow-up-outline',
    description: 'Maximum backswing position',
    tips: [
      'Club should be at the highest point',
      'Full shoulder turn completed',
      'Weight transferred to trail side',
    ],
  },
  {
    type: 'impact',
    label: 'Impact',
    shortLabel: 'Impact',
    shortcut: '3',
    color: '#FFFF00',
    icon: 'flash-outline',
    description: 'The moment of ball contact',
    tips: [
      'Club face striking the ball',
      'Hips should be open to target',
      'Weight shifted to lead side',
    ],
  },
  {
    type: 'finish',
    label: 'Finish',
    shortLabel: 'Finish',
    shortcut: '4',
    color: '#00FF00',
    icon: 'checkmark-circle-outline',
    description: 'Full follow-through position',
    tips: [
      'Full rotation completed',
      'Belt buckle facing target',
      'Balanced finish position',
    ],
  },
];

// ============================================
// TYPES
// ============================================

interface KeyframeMarkerProps {
  keyframes: Keyframe[];
  currentTime: number;
  duration: number;
  onMark: (type: KeyframeType, timestamp: number) => void;
  onNavigate: (timestamp: number) => void;
  onClear: (type: KeyframeType) => void;
  onClearAll: () => void;
  isMarkingMode: boolean;
  onToggleMarkingMode: () => void;
}

// ============================================
// KEYFRAME MARKER COMPONENT
// ============================================

export function KeyframeMarker({
  keyframes,
  currentTime,
  duration,
  onMark,
  onNavigate,
  onClear,
  onClearAll,
  isMarkingMode,
  onToggleMarkingMode,
}: KeyframeMarkerProps) {
  const { colors } = useTheme();
  const [selectedKeyframe, setSelectedKeyframe] = useState<KeyframeType | null>(null);
  const [showTips, setShowTips] = useState(false);

  // Find current keyframe being marked
  const currentDefinition = selectedKeyframe
    ? KEYFRAME_DEFINITIONS.find((k) => k.type === selectedKeyframe)
    : null;

  // Get keyframe data by type
  const getKeyframeData = useCallback(
    (type: KeyframeType): Keyframe | undefined => {
      return keyframes.find((k) => k.type === type);
    },
    [keyframes]
  );

  // Check completion status
  const completionStatus = useMemo(() => {
    const marked = REQUIRED_KEYFRAMES.filter((type) => {
      const kf = getKeyframeData(type);
      return kf?.isMarked;
    }).length;
    return {
      marked,
      total: REQUIRED_KEYFRAMES.length,
      isComplete: marked === REQUIRED_KEYFRAMES.length,
      percentage: (marked / REQUIRED_KEYFRAMES.length) * 100,
    };
  }, [keyframes, getKeyframeData]);

  // Handle keyframe button press
  const handleKeyframePress = useCallback(
    (type: KeyframeType) => {
      const kf = getKeyframeData(type);

      if (isMarkingMode) {
        // In marking mode, mark the current position
        onMark(type, currentTime);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Move to next unmarked keyframe
        const currentIndex = REQUIRED_KEYFRAMES.indexOf(type);
        const nextUnmarked = REQUIRED_KEYFRAMES.slice(currentIndex + 1).find(
          (t) => !getKeyframeData(t)?.isMarked
        );
        if (nextUnmarked) {
          setSelectedKeyframe(nextUnmarked);
        } else {
          setSelectedKeyframe(null);
        }
      } else if (kf?.isMarked) {
        // Navigate to marked position
        onNavigate(kf.timestamp);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        // Select for marking
        setSelectedKeyframe(type);
        setShowTips(true);
      }
    },
    [isMarkingMode, currentTime, onMark, onNavigate, getKeyframeData]
  );

  // Handle long press to clear
  const handleLongPress = useCallback(
    (type: KeyframeType) => {
      const kf = getKeyframeData(type);
      if (kf?.isMarked) {
        onClear(type);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    },
    [getKeyframeData, onClear]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="bookmark-outline" size={20} color="#FFFFFF" />
          <Text variant="h4" color="#FFFFFF">
            Key Positions
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Completion indicator */}
          <View style={styles.completionBadge}>
            <Text variant="labelSmall" color={completionStatus.isComplete ? colors.success : '#AAA'}>
              {completionStatus.marked}/{completionStatus.total}
            </Text>
          </View>

          {/* Marking mode toggle */}
          <Pressable
            style={[
              styles.markingModeButton,
              isMarkingMode && { backgroundColor: colors.primary },
            ]}
            onPress={onToggleMarkingMode}
          >
            <Ionicons
              name={isMarkingMode ? 'radio-button-on' : 'radio-button-off'}
              size={16}
              color={isMarkingMode ? '#FFF' : '#AAA'}
            />
            <Text
              variant="labelSmall"
              color={isMarkingMode ? '#FFF' : '#AAA'}
            >
              {isMarkingMode ? 'Marking' : 'Mark'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Keyframe buttons */}
      <View style={styles.keyframeButtons}>
        {KEYFRAME_DEFINITIONS.map((def) => {
          const kf = getKeyframeData(def.type);
          const isMarked = kf?.isMarked ?? false;
          const isSelected = selectedKeyframe === def.type;
          const isAutoDetected = kf?.autoDetected ?? false;

          return (
            <Pressable
              key={def.type}
              style={[
                styles.keyframeButton,
                isMarked && { borderColor: def.color },
                isSelected && {
                  backgroundColor: `${def.color}30`,
                  borderColor: def.color,
                },
              ]}
              onPress={() => handleKeyframePress(def.type)}
              onLongPress={() => handleLongPress(def.type)}
              delayLongPress={500}
            >
              {/* Shortcut number */}
              <View
                style={[
                  styles.shortcutBadge,
                  { backgroundColor: isMarked ? def.color : 'rgba(255,255,255,0.2)' },
                ]}
              >
                <Text
                  variant="labelSmall"
                  color={isMarked ? '#000' : '#FFF'}
                >
                  {def.shortcut}
                </Text>
              </View>

              {/* Icon */}
              <Ionicons
                name={def.icon as any}
                size={24}
                color={isMarked ? def.color : '#888'}
              />

              {/* Label */}
              <Text
                variant="caption"
                color={isMarked ? '#FFF' : '#888'}
                style={styles.keyframeLabel}
              >
                {def.shortLabel}
              </Text>

              {/* Marked indicator */}
              {isMarked && (
                <View
                  style={[styles.markedIndicator, { backgroundColor: def.color }]}
                >
                  <Ionicons
                    name={isAutoDetected ? 'sparkles' : 'checkmark'}
                    size={10}
                    color="#000"
                  />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Tips panel (shown when selecting a keyframe) */}
      {showTips && currentDefinition && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[styles.tipsPanel, { borderLeftColor: currentDefinition.color }]}
        >
          <View style={styles.tipsPanelHeader}>
            <Text variant="h4" color="#FFF">
              {currentDefinition.label}
            </Text>
            <Pressable onPress={() => setShowTips(false)}>
              <Ionicons name="close" size={20} color="#888" />
            </Pressable>
          </View>

          <Text variant="bodySmall" color="#AAA" style={styles.tipsDescription}>
            {currentDefinition.description}
          </Text>

          <View style={styles.tipsList}>
            {currentDefinition.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={14} color={currentDefinition.color} />
                <Text variant="caption" color="#CCC">
                  {tip}
                </Text>
              </View>
            ))}
          </View>

          <Button
            label={`Mark ${currentDefinition.shortLabel} (Press ${currentDefinition.shortcut})`}
            variant="primary"
            size="small"
            onPress={() => {
              onMark(currentDefinition.type, currentTime);
              setShowTips(false);
              setSelectedKeyframe(null);
            }}
          />
        </Animated.View>
      )}

      {/* Timeline markers */}
      {duration > 0 && (
        <View style={styles.timelineContainer}>
          <View style={styles.timelineTrack}>
            {/* Current position indicator */}
            <View
              style={[
                styles.currentPositionMarker,
                { left: `${(currentTime / duration) * 100}%` },
              ]}
            />

            {/* Keyframe markers on timeline */}
            {keyframes
              .filter((kf) => kf.isMarked)
              .map((kf) => {
                const def = KEYFRAME_DEFINITIONS.find((d) => d.type === kf.type);
                if (!def) return null;

                return (
                  <Pressable
                    key={kf.type}
                    style={[
                      styles.timelineMarker,
                      {
                        left: `${(kf.timestamp / duration) * 100}%`,
                        backgroundColor: def.color,
                      },
                    ]}
                    onPress={() => onNavigate(kf.timestamp)}
                  >
                    <Text variant="caption" color="#000" style={styles.timelineMarkerLabel}>
                      {def.shortcut}
                    </Text>
                  </Pressable>
                );
              })}
          </View>
        </View>
      )}

      {/* Keyboard shortcuts hint */}
      {isMarkingMode && (
        <View style={styles.shortcutsHint}>
          <Ionicons name="keypad-outline" size={14} color="#666" />
          <Text variant="caption" color="#666">
            Press 1-4 to mark positions
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================
// MINI KEYFRAME BAR (for bottom controls)
// ============================================

interface MiniKeyframeBarProps {
  keyframes: Keyframe[];
  currentTime: number;
  duration: number;
  onNavigate: (timestamp: number) => void;
  onExpandPress: () => void;
}

export function MiniKeyframeBar({
  keyframes,
  currentTime,
  duration,
  onNavigate,
  onExpandPress,
}: MiniKeyframeBarProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.miniBar}>
      {KEYFRAME_DEFINITIONS.map((def) => {
        const kf = keyframes.find((k) => k.type === def.type);
        const isMarked = kf?.isMarked ?? false;
        const isCurrent = kf && Math.abs(currentTime - kf.timestamp) < 100;

        return (
          <Pressable
            key={def.type}
            style={[
              styles.miniButton,
              isMarked && { backgroundColor: `${def.color}40` },
              isCurrent && { backgroundColor: def.color },
            ]}
            onPress={() => kf?.isMarked && onNavigate(kf.timestamp)}
            disabled={!isMarked}
          >
            <Text
              variant="labelSmall"
              color={isMarked ? (isCurrent ? '#000' : def.color) : '#555'}
            >
              {def.shortcut}
            </Text>
          </Pressable>
        );
      })}

      <Pressable style={styles.expandButton} onPress={onExpandPress}>
        <Ionicons name="expand-outline" size={16} color="#888" />
      </Pressable>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    borderRadius: radius.xl,
    padding: spacing[4],
    margin: spacing[2],
    ...shadowsIOS.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  completionBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.md,
  },
  markingModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Keyframe buttons
  keyframeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  keyframeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  shortcutBadge: {
    position: 'absolute',
    top: spacing[1],
    right: spacing[1],
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyframeLabel: {
    marginTop: spacing[1],
  },
  markedIndicator: {
    position: 'absolute',
    bottom: spacing[1],
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tips panel
  tipsPanel: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  tipsPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  tipsDescription: {
    marginBottom: spacing[3],
  },
  tipsList: {
    marginBottom: spacing[3],
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },

  // Timeline
  timelineContainer: {
    height: 24,
    marginBottom: spacing[2],
  },
  timelineTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 10,
    position: 'relative',
  },
  currentPositionMarker: {
    position: 'absolute',
    top: -8,
    width: 2,
    height: 20,
    backgroundColor: '#FFFFFF',
    marginLeft: -1,
  },
  timelineMarker: {
    position: 'absolute',
    top: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineMarkerLabel: {
    fontSize: 9,
    fontWeight: 'bold',
  },

  // Shortcuts hint
  shortcutsHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },

  // Mini bar
  miniBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  miniButton: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandButton: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing[2],
  },
});

export default KeyframeMarker;

/**
 * MCG Golf App - Feedback Panel Component
 * Displays AI feedback with text, voice, and realtime options
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInRight,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius, shadowsIOS } from '@/design';
import { Text, Button, Badge, Card, ProgressBar } from '@/components/ui';
import {
  FeedbackMessage,
  FeedbackConfig,
  FeedbackMode,
  SwingIssue,
  KeyframeType,
} from '@/types/analysis';

// ============================================
// TYPES
// ============================================

interface FeedbackPanelProps {
  messages: FeedbackMessage[];
  issues: SwingIssue[];
  overallScore?: number;
  config: FeedbackConfig;
  onConfigChange: (config: Partial<FeedbackConfig>) => void;
  onDrillPress?: (drillId: string) => void;
  onLessonPress?: (lessonId: string) => void;
  onMessagePress?: (message: FeedbackMessage) => void;
  isAnalyzing?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// ============================================
// FEEDBACK MODE BUTTON
// ============================================

const FeedbackModeButton = ({
  mode,
  currentMode,
  onPress,
  icon,
  label,
}: {
  mode: FeedbackMode;
  currentMode: FeedbackMode;
  onPress: () => void;
  icon: string;
  label: string;
}) => {
  const { colors } = useTheme();
  const isActive = mode === currentMode;

  return (
    <Pressable
      style={[
        styles.modeButton,
        isActive && { backgroundColor: colors.primary },
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon as any}
        size={18}
        color={isActive ? '#FFF' : '#888'}
      />
      <Text
        variant="caption"
        color={isActive ? '#FFF' : '#888'}
      >
        {label}
      </Text>
    </Pressable>
  );
};

// ============================================
// ISSUE CARD
// ============================================

const IssueCard = ({
  issue,
  onDrillPress,
  onLessonPress,
  onNavigate,
}: {
  issue: SwingIssue;
  onDrillPress?: (drillId: string) => void;
  onLessonPress?: (lessonId: string) => void;
  onNavigate?: (timestamp: number) => void;
}) => {
  const { colors } = useTheme();

  const severityColors = {
    critical: colors.error,
    warning: colors.warning,
    suggestion: colors.info,
  };

  const severityIcons = {
    critical: 'alert-circle',
    warning: 'warning',
    suggestion: 'bulb',
  };

  return (
    <Animated.View
      entering={SlideInRight.duration(300)}
      style={[
        styles.issueCard,
        { borderLeftColor: severityColors[issue.severity] },
      ]}
    >
      {/* Header */}
      <View style={styles.issueHeader}>
        <View style={styles.issueHeaderLeft}>
          <Ionicons
            name={severityIcons[issue.severity] as any}
            size={18}
            color={severityColors[issue.severity]}
          />
          <Text variant="h4" color="#FFF" style={styles.issueTitle}>
            {issue.title}
          </Text>
        </View>
        <Badge
          label={issue.position.replace('-', ' ')}
          variant="neutral"
          size="small"
        />
      </View>

      {/* Description */}
      <Text variant="bodySmall" color="#AAA" style={styles.issueDescription}>
        {issue.description}
      </Text>

      {/* Solution */}
      <View style={styles.solutionBox}>
        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
        <Text variant="bodySmall" color="#CCC" style={styles.solutionText}>
          {issue.solution}
        </Text>
      </View>

      {/* Related content */}
      {(issue.relatedDrills.length > 0 || issue.relatedLessons.length > 0) && (
        <View style={styles.relatedContent}>
          {issue.relatedDrills.length > 0 && (
            <Pressable
              style={styles.relatedButton}
              onPress={() => onDrillPress?.(issue.relatedDrills[0])}
            >
              <Ionicons name="fitness-outline" size={14} color={colors.primary} />
              <Text variant="caption" color={colors.primary}>
                View Drill
              </Text>
            </Pressable>
          )}
          {issue.relatedLessons.length > 0 && (
            <Pressable
              style={styles.relatedButton}
              onPress={() => onLessonPress?.(issue.relatedLessons[0])}
            >
              <Ionicons name="play-circle-outline" size={14} color={colors.secondary} />
              <Text variant="caption" color={colors.secondary}>
                Watch Lesson
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Navigate to position */}
      {issue.timestamp && onNavigate && (
        <Pressable
          style={styles.navigateButton}
          onPress={() => onNavigate(issue.timestamp)}
        >
          <Ionicons name="locate-outline" size={14} color="#888" />
          <Text variant="caption" color="#888">
            Go to frame
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
};

// ============================================
// FEEDBACK PANEL COMPONENT
// ============================================

export function FeedbackPanel({
  messages,
  issues,
  overallScore,
  config,
  onConfigChange,
  onDrillPress,
  onLessonPress,
  onMessagePress,
  isAnalyzing = false,
  isExpanded = true,
  onToggleExpand,
}: FeedbackPanelProps) {
  const { colors } = useTheme();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
  const speechQueue = useRef<FeedbackMessage[]>([]);

  // Voice feedback functions
  const speakMessage = useCallback(
    async (message: FeedbackMessage) => {
      if (!config.voiceEnabled) return;

      try {
        setIsSpeaking(true);
        await Speech.speak(message.content, {
          rate: config.voiceSpeed,
          pitch: config.voicePitch,
          volume: config.voiceVolume,
          onDone: () => {
            setIsSpeaking(false);
            // Play next in queue
            if (speechQueue.current.length > 0) {
              const next = speechQueue.current.shift();
              if (next) speakMessage(next);
            }
          },
          onStopped: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      } catch (error) {
        setIsSpeaking(false);
      }
    },
    [config]
  );

  const stopSpeaking = useCallback(async () => {
    try {
      await Speech.stop();
      speechQueue.current = [];
      setIsSpeaking(false);
    } catch (error) {
      // Ignore
    }
  }, []);

  const playAllFeedback = useCallback(() => {
    const speakableMessages = messages.filter(
      (m) => m.type === 'correction' || m.type === 'instruction'
    );
    if (speakableMessages.length > 0) {
      speechQueue.current = speakableMessages.slice(1);
      speakMessage(speakableMessages[0]);
    }
  }, [messages, speakMessage]);

  // Auto-play feedback when enabled
  useEffect(() => {
    if (config.autoPlay && messages.length > 0 && !isSpeaking) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.type === 'correction' || latestMessage.type === 'instruction') {
        speakMessage(latestMessage);
      }
    }
  }, [messages, config.autoPlay]);

  // Mode change handler
  const handleModeChange = (mode: FeedbackMode) => {
    onConfigChange({
      mode,
      voiceEnabled: mode === 'voice' || mode === 'both' || mode === 'realtime',
    });
  };

  // Score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return colors.success;
    if (score >= 70) return colors.info;
    if (score >= 50) return colors.warning;
    return colors.error;
  };

  // Sort issues by severity
  const sortedIssues = [...issues].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, suggestion: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  if (!isExpanded) {
    return (
      <Pressable style={styles.collapsedPanel} onPress={onToggleExpand}>
        <Ionicons name="chatbubbles-outline" size={20} color="#FFF" />
        {issues.length > 0 && (
          <View style={[styles.notificationDot, { backgroundColor: colors.primary }]}>
            <Text variant="caption" color="#FFF" style={{ fontSize: 10 }}>
              {issues.length}
            </Text>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="chatbubbles" size={20} color={colors.primary} />
          <Text variant="h4" color="#FFF">
            AI Feedback
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Voice control */}
          {config.voiceEnabled && (
            <Pressable
              style={styles.voiceButton}
              onPress={isSpeaking ? stopSpeaking : playAllFeedback}
            >
              <Ionicons
                name={isSpeaking ? 'stop-circle' : 'volume-high'}
                size={18}
                color={isSpeaking ? colors.error : colors.primary}
              />
            </Pressable>
          )}

          {/* Collapse button */}
          {onToggleExpand && (
            <Pressable style={styles.collapseButton} onPress={onToggleExpand}>
              <Ionicons name="chevron-down" size={20} color="#888" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Mode selector */}
      <View style={styles.modeSelector}>
        <FeedbackModeButton
          mode="text"
          currentMode={config.mode}
          onPress={() => handleModeChange('text')}
          icon="text-outline"
          label="Text"
        />
        <FeedbackModeButton
          mode="voice"
          currentMode={config.mode}
          onPress={() => handleModeChange('voice')}
          icon="volume-medium-outline"
          label="Voice"
        />
        <FeedbackModeButton
          mode="both"
          currentMode={config.mode}
          onPress={() => handleModeChange('both')}
          icon="apps-outline"
          label="Both"
        />
        <FeedbackModeButton
          mode="realtime"
          currentMode={config.mode}
          onPress={() => handleModeChange('realtime')}
          icon="pulse-outline"
          label="Realtime"
        />
      </View>

      {/* Overall Score */}
      {overallScore !== undefined && (
        <View style={styles.scoreSection}>
          <View style={styles.scoreCircle}>
            <Text
              variant="metricLarge"
              color={getScoreColor(overallScore)}
            >
              {overallScore}
            </Text>
            <Text variant="caption" color="#888">
              /100
            </Text>
          </View>
          <View style={styles.scoreDetails}>
            <Text variant="h4" color="#FFF">
              Overall Score
            </Text>
            <ProgressBar
              progress={overallScore}
              variant={overallScore >= 70 ? 'success' : 'warning'}
              size="small"
            />
          </View>
        </View>
      )}

      {/* Analyzing state */}
      {isAnalyzing && (
        <View style={styles.analyzingState}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text variant="bodySmall" color="#AAA">
            Analyzing your swing...
          </Text>
        </View>
      )}

      {/* Issues list */}
      {!isAnalyzing && issues.length > 0 && (
        <ScrollView
          style={styles.issuesList}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.issuesHeader}>
            <Text variant="labelMedium" color="#888">
              {issues.length} issue{issues.length !== 1 ? 's' : ''} found
            </Text>
          </View>

          {sortedIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onDrillPress={onDrillPress}
              onLessonPress={onLessonPress}
            />
          ))}
        </ScrollView>
      )}

      {/* No issues state */}
      {!isAnalyzing && issues.length === 0 && overallScore !== undefined && (
        <View style={styles.noIssuesState}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          <Text variant="h4" color="#FFF" style={styles.noIssuesTitle}>
            Great Swing!
          </Text>
          <Text variant="bodySmall" color="#AAA" align="center">
            No major issues detected. Keep up the good work!
          </Text>
        </View>
      )}

      {/* Voice settings (when voice is enabled) */}
      {(config.mode === 'voice' || config.mode === 'both' || config.mode === 'realtime') && (
        <View style={styles.voiceSettings}>
          <Pressable
            style={styles.settingsToggle}
            onPress={() => onConfigChange({ showSubtitles: !config.showSubtitles })}
          >
            <Ionicons
              name={config.showSubtitles ? 'checkbox' : 'square-outline'}
              size={16}
              color="#888"
            />
            <Text variant="caption" color="#888">
              Show subtitles
            </Text>
          </Pressable>

          <Pressable
            style={styles.settingsToggle}
            onPress={() => onConfigChange({ autoPlay: !config.autoPlay })}
          >
            <Ionicons
              name={config.autoPlay ? 'checkbox' : 'square-outline'}
              size={16}
              color="#888"
            />
            <Text variant="caption" color="#888">
              Auto-play feedback
            </Text>
          </Pressable>
        </View>
      )}

      {/* Current speaking indicator */}
      {isSpeaking && config.showSubtitles && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.subtitleBar}
        >
          <Ionicons name="volume-high" size={16} color={colors.primary} />
          <Text variant="bodySmall" color="#FFF" style={styles.subtitleText}>
            {messages[currentMessageIndex]?.content || 'Speaking...'}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

// ============================================
// DEFAULT CONFIG
// ============================================

export const DEFAULT_FEEDBACK_CONFIG: FeedbackConfig = {
  mode: 'both',
  voiceEnabled: true,
  voiceSpeed: 1.0,
  voiceVolume: 1.0,
  voicePitch: 1.0,
  voiceGender: 'male',
  autoPlay: false,
  showSubtitles: true,
  realtimeDelay: 500,
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    borderRadius: radius.xl,
    padding: spacing[4],
    maxHeight: 400,
    ...shadowsIOS.lg,
  },
  collapsedPanel: {
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    borderRadius: radius.full,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowsIOS.lg,
  },
  notificationDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
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
  voiceButton: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapseButton: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Mode selector
  modeSelector: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.md,
  },

  // Score section
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  scoreCircle: {
    alignItems: 'center',
  },
  scoreDetails: {
    flex: 1,
    gap: spacing[2],
  },

  // Analyzing state
  analyzingState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    paddingVertical: spacing[6],
  },

  // Issues list
  issuesList: {
    flex: 1,
  },
  issuesHeader: {
    marginBottom: spacing[2],
  },
  issueCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  issueHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  issueTitle: {
    flex: 1,
  },
  issueDescription: {
    marginBottom: spacing[3],
  },
  solutionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  solutionText: {
    flex: 1,
  },
  relatedContent: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  relatedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    alignSelf: 'flex-end',
  },

  // No issues state
  noIssuesState: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  noIssuesTitle: {
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },

  // Voice settings
  voiceSettings: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: spacing[3],
  },
  settingsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },

  // Subtitle bar
  subtitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: radius.lg,
    padding: spacing[3],
    marginTop: spacing[3],
  },
  subtitleText: {
    flex: 1,
  },
});

export default FeedbackPanel;

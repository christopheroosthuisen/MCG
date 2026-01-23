/**
 * MCG Golf App - Drill Detail Screen
 * View and practice a single drill
 */

import React, { useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius } from '@/design';
import {
  Text,
  Button,
  Card,
  Badge,
  DifficultyBadge,
  ProgressBar,
} from '@/components/ui';
import { Drill, DrillStep } from '@/types/golf';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sample drills data (would come from API/store)
const SAMPLE_DRILLS: Record<string, Drill> = {
  'drill-1': {
    id: 'drill-1',
    name: 'Gate Drill for Path Control',
    description:
      'Use alignment sticks to create a visual gate that helps you develop a consistent swing path and eliminate slices or hooks.',
    category: 'full-swing',
    difficulty: 'intermediate',
    duration: 15,
    equipment: ['2 alignment sticks', 'Golf balls', '7 iron'],
    steps: [
      {
        order: 1,
        title: 'Setup the Gate',
        instruction:
          'Place two alignment sticks on the ground, parallel to your target line. Space them about 6 inches apart, just outside your ball position.',
        checkpoint: 'Sticks should point directly at target',
      },
      {
        order: 2,
        title: 'Position Your Ball',
        instruction:
          'Place the ball centered between the sticks. Your club should pass through the gate cleanly during the swing.',
        checkpoint: 'Ball centered between sticks',
      },
      {
        order: 3,
        title: 'Practice Swings',
        instruction:
          'Make slow practice swings, focusing on the club passing through the gate without touching either stick.',
        duration: 60,
        checkpoint: 'Club passes cleanly through gate',
      },
      {
        order: 4,
        title: 'Hit Shots',
        instruction:
          'Start hitting balls at 50% speed. Focus on the club entering and exiting through the gate. Gradually increase speed as you gain consistency.',
        duration: 180,
        checkpoint: 'Consistent contact without hitting sticks',
      },
      {
        order: 5,
        title: 'Narrow the Gate',
        instruction:
          'Once comfortable, move the sticks closer together (4 inches apart). This increases the precision required.',
        checkpoint: 'Can hit 5 shots in a row without touching sticks',
      },
    ],
    isPremium: false,
  },
  'drill-2': {
    id: 'drill-2',
    name: 'Tempo Counting Drill',
    description:
      'Develop consistent swing tempo by counting during your backswing and downswing. A 3:1 ratio (backswing:downswing) is ideal.',
    category: 'tempo',
    difficulty: 'beginner',
    duration: 10,
    equipment: ['Any club', 'Golf balls'],
    steps: [
      {
        order: 1,
        title: 'Understand the Count',
        instruction:
          'Your backswing should take 3 counts, your downswing 1 count. Say "one-two-three" during backswing, "four" at impact.',
      },
      {
        order: 2,
        title: 'Practice Without Ball',
        instruction:
          'Make full swings while counting out loud. "One-two-three... four!" The tempo should feel smooth and unhurried.',
        duration: 120,
      },
      {
        order: 3,
        title: 'Add the Ball',
        instruction:
          'Hit shots while maintaining the count. The ball flight should be more consistent as your tempo stabilizes.',
        duration: 300,
      },
    ],
    isPremium: false,
  },
  'drill-hip-rotation': {
    id: 'drill-hip-rotation',
    name: 'Hip Rotation Power Drill',
    description:
      'Learn to use your hips to generate power and maintain proper sequencing in your downswing.',
    category: 'rotation',
    difficulty: 'intermediate',
    duration: 12,
    equipment: ['Alignment stick', 'Any club'],
    steps: [
      {
        order: 1,
        title: 'Hip Belt Setup',
        instruction:
          'Thread an alignment stick through your belt loops so it extends on both sides of your hips. This makes hip rotation visible.',
      },
      {
        order: 2,
        title: 'Feel the Turn',
        instruction:
          'At address, the stick should be parallel to target line. In backswing, the stick turns 45 degrees. At impact, it should point left of target.',
        duration: 120,
      },
      {
        order: 3,
        title: 'Lead with Hips',
        instruction:
          'Practice starting the downswing by rotating your hips toward the target BEFORE your arms drop. The stick should lead the way.',
        duration: 180,
      },
      {
        order: 4,
        title: 'Full Speed',
        instruction:
          'Hit balls focusing on the hip lead. Your power should increase as the sequence improves.',
        duration: 300,
      },
    ],
    isPremium: false,
  },
};

export default function DrillDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id, fromAnalysis } = useLocalSearchParams<{ id: string; fromAnalysis?: string }>();

  const [currentStep, setCurrentStep] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Get drill data
  const drill = SAMPLE_DRILLS[id] || SAMPLE_DRILLS['drill-1'];

  // Calculate progress
  const progress = drill.steps.length > 0
    ? Math.round((completedSteps.length / drill.steps.length) * 100)
    : 0;

  // Handle step completion
  const handleCompleteStep = useCallback(() => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < drill.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, completedSteps, drill.steps.length]);

  // Handle start drill
  const handleStartDrill = useCallback(() => {
    setIsStarted(true);
    setCurrentStep(0);
    setCompletedSteps([]);
  }, []);

  // Handle finish drill
  const handleFinishDrill = useCallback(() => {
    // In a real app, this would save the drill session
    router.back();
  }, [router]);

  // Navigate to analyze with this drill
  const handlePracticeWithCamera = useCallback(() => {
    router.push('/analysis/live');
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Button
          label=""
          variant="ghost"
          size="small"
          leftIcon={<Ionicons name="arrow-back" size={24} color={colors.textHeading} />}
          onPress={() => router.back()}
        />
        <View style={styles.headerCenter}>
          <Badge
            label={drill.category.replace('-', ' ').toUpperCase()}
            variant="neutral"
            size="small"
          />
        </View>
        <Button
          label=""
          variant="ghost"
          size="small"
          leftIcon={<Ionicons name="bookmark-outline" size={24} color={colors.textHeading} />}
          onPress={() => {}}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* From Analysis Banner */}
        {fromAnalysis && (
          <Card variant="filled" style={[styles.analysisBanner, { backgroundColor: colors.primaryMuted }]}>
            <Ionicons name="analytics" size={20} color={colors.primary} />
            <Text variant="bodySmall" color={colors.primary} style={styles.analysisBannerText}>
              Recommended based on your swing analysis
            </Text>
          </Card>
        )}

        {/* Drill Info */}
        <View style={styles.drillInfo}>
          <Text variant="displaySmall" color={colors.textHeading}>
            {drill.name}
          </Text>
          <View style={styles.metaRow}>
            <DifficultyBadge level={drill.difficulty} />
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={colors.textMuted} />
              <Text variant="caption" color={colors.textMuted}>{drill.duration} min</Text>
            </View>
          </View>
          <Text variant="bodyMedium" color={colors.textSecondary} style={styles.description}>
            {drill.description}
          </Text>
        </View>

        {/* Equipment */}
        {drill.equipment && drill.equipment.length > 0 && (
          <Card variant="outlined" style={styles.equipmentCard}>
            <View style={styles.equipmentHeader}>
              <Ionicons name="construct-outline" size={20} color={colors.primary} />
              <Text variant="labelMedium" color={colors.textHeading}>Equipment Needed</Text>
            </View>
            <View style={styles.equipmentList}>
              {drill.equipment.map((item, index) => (
                <View key={index} style={styles.equipmentItem}>
                  <View style={[styles.equipmentDot, { backgroundColor: colors.primary }]} />
                  <Text variant="bodySmall" color={colors.textSecondary}>{item}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Progress (if started) */}
        {isStarted && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text variant="labelMedium" color={colors.textHeading}>Progress</Text>
              <Text variant="labelMedium" color={colors.primary}>{progress}%</Text>
            </View>
            <ProgressBar progress={progress} variant="primary" size="medium" />
          </View>
        )}

        {/* Steps */}
        <View style={styles.stepsSection}>
          <Text variant="h2" style={styles.stepsTitle}>Steps</Text>

          {drill.steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = isStarted && currentStep === index;

            return (
              <Card
                key={step.order}
                variant={isCurrent ? 'elevated' : 'outlined'}
                style={[
                  styles.stepCard,
                  isCurrent && { borderColor: colors.primary, borderWidth: 2 },
                  isCompleted && { opacity: 0.7 },
                ]}
              >
                <View style={styles.stepHeader}>
                  <View
                    style={[
                      styles.stepNumber,
                      {
                        backgroundColor: isCompleted
                          ? colors.success
                          : isCurrent
                          ? colors.primary
                          : colors.backgroundSecondary,
                      },
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    ) : (
                      <Text variant="labelSmall" color={isCurrent ? '#FFF' : colors.textMuted}>
                        {step.order}
                      </Text>
                    )}
                  </View>
                  <View style={styles.stepHeaderContent}>
                    <Text variant="h4" color={colors.textHeading}>
                      {step.title}
                    </Text>
                    {step.duration && (
                      <Text variant="caption" color={colors.textMuted}>
                        ~{Math.round(step.duration / 60)} min
                      </Text>
                    )}
                  </View>
                </View>

                <Text variant="bodySmall" color={colors.textSecondary} style={styles.stepInstruction}>
                  {step.instruction}
                </Text>

                {step.checkpoint && (
                  <View style={[styles.checkpoint, { backgroundColor: colors.successLight }]}>
                    <Ionicons name="flag" size={14} color={colors.success} />
                    <Text variant="caption" color={colors.success}>
                      {step.checkpoint}
                    </Text>
                  </View>
                )}

                {isCurrent && (
                  <Button
                    label="Complete Step"
                    variant="primary"
                    size="medium"
                    onPress={handleCompleteStep}
                    style={styles.stepButton}
                  />
                )}
              </Card>
            );
          })}
        </View>

        {/* Video Preview Placeholder */}
        <Card variant="filled" style={styles.videoPlaceholder}>
          <View style={[styles.videoThumbnail, { backgroundColor: colors.backgroundTertiary }]}>
            <Ionicons name="play-circle" size={48} color={colors.textMuted} />
          </View>
          <Text variant="labelMedium" color={colors.textSecondary} style={styles.videoLabel}>
            Demo Video Coming Soon
          </Text>
        </Card>

        {/* Tips */}
        <Card variant="filled" style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={18} color={colors.warning} />
            <Text variant="labelMedium" color={colors.warning}>PRO TIP</Text>
          </View>
          <Text variant="bodySmall" color={colors.textSecondary}>
            Record your practice with the camera to track improvements over time. The AI will analyze your progress and adjust recommendations.
          </Text>
        </Card>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {!isStarted ? (
          <>
            <Button
              label="Practice with Camera"
              variant="outline"
              size="large"
              leftIcon={<Ionicons name="videocam" size={20} color={colors.primary} />}
              onPress={handlePracticeWithCamera}
              style={styles.actionButton}
            />
            <Button
              label="Start Drill"
              variant="primary"
              size="large"
              rightIcon={<Ionicons name="play" size={20} color="#FFF" />}
              onPress={handleStartDrill}
              style={styles.actionButton}
            />
          </>
        ) : completedSteps.length === drill.steps.length ? (
          <Button
            label="Complete Drill"
            variant="primary"
            size="large"
            rightIcon={<Ionicons name="checkmark-circle" size={20} color="#FFF" />}
            onPress={handleFinishDrill}
            style={styles.singleAction}
          />
        ) : (
          <View style={styles.stepNavigation}>
            <Button
              label="Previous"
              variant="ghost"
              size="medium"
              leftIcon={<Ionicons name="chevron-back" size={20} color={colors.textSecondary} />}
              onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            />
            <Text variant="labelMedium" color={colors.textSecondary}>
              Step {currentStep + 1} of {drill.steps.length}
            </Text>
            <Button
              label="Next"
              variant="ghost"
              size="medium"
              rightIcon={<Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
              onPress={() => setCurrentStep(Math.min(drill.steps.length - 1, currentStep + 1))}
              disabled={currentStep === drill.steps.length - 1}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },

  // Analysis banner
  analysisBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  analysisBannerText: {
    flex: 1,
  },

  // Drill info
  drillInfo: {
    marginBottom: spacing[6],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginTop: spacing[3],
    marginBottom: spacing[3],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  description: {
    lineHeight: 22,
  },

  // Equipment
  equipmentCard: {
    marginBottom: spacing[6],
  },
  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  equipmentList: {
    gap: spacing[2],
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  equipmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Progress
  progressSection: {
    marginBottom: spacing[6],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },

  // Steps
  stepsSection: {
    marginBottom: spacing[6],
  },
  stepsTitle: {
    marginBottom: spacing[4],
  },
  stepCard: {
    marginBottom: spacing[3],
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  stepHeaderContent: {
    flex: 1,
  },
  stepInstruction: {
    marginLeft: 40,
    lineHeight: 20,
  },
  checkpoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginLeft: 40,
    marginTop: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
  },
  stepButton: {
    marginTop: spacing[4],
    marginLeft: 40,
  },

  // Video placeholder
  videoPlaceholder: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  videoThumbnail: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  videoLabel: {
    textAlign: 'center',
  },

  // Tips
  tipsCard: {
    backgroundColor: 'rgba(255, 200, 0, 0.1)',
    marginBottom: spacing[4],
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },

  // Bottom actions
  bottomActions: {
    flexDirection: 'row',
    padding: spacing[4],
    gap: spacing[3],
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
  },
  singleAction: {
    flex: 1,
  },
  stepNavigation: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

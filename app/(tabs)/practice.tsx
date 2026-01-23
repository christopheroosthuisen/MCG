/**
 * MCG Golf App - Practice Screen
 * Hub for starting practice sessions and tracking progress
 */

import React, { useCallback } from 'react';
import { ScrollView, View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius, layout } from '@/design';
import { Text, Button, Card, Badge, ProgressBar } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mock data
const WEEKLY_STATS = {
  hoursGoal: 5,
  hoursCompleted: 3.25,
  sessionsThisWeek: 4,
  streak: 7,
  avgSessionLength: 42,
};

const PRACTICE_TYPES = [
  {
    id: 'full-swing',
    title: 'Full Swing',
    subtitle: 'Driver to wedge',
    icon: 'flash',
    gradient: ['#FF8200', '#FF9A33'],
  },
  {
    id: 'short-game',
    title: 'Short Game',
    subtitle: 'Chips & pitches',
    icon: 'golf',
    gradient: ['#115740', '#1a7a5a'],
  },
  {
    id: 'putting',
    title: 'Putting',
    subtitle: 'Speed & line',
    icon: 'ellipse-outline',
    gradient: ['#3B82F6', '#60A5FA'],
  },
  {
    id: 'bunker',
    title: 'Bunker',
    subtitle: 'Sand saves',
    icon: 'layers',
    gradient: ['#D4A574', '#C4956A'],
  },
];

const RECOMMENDED_DRILLS = [
  {
    id: 'drill-1',
    title: 'Gate Drill',
    category: 'Putting',
    duration: '15 min',
    difficulty: 'Beginner',
    reason: 'Based on recent putting stats',
  },
  {
    id: 'drill-hip-rotation',
    title: 'Hip Rotation Drill',
    category: 'Full Swing',
    duration: '20 min',
    difficulty: 'Intermediate',
    reason: 'Improve your hip clearance',
  },
  {
    id: 'drill-2',
    title: 'Distance Control Ladder',
    category: 'Short Game',
    duration: '25 min',
    difficulty: 'All Levels',
    reason: 'Sharpen your wedge distances',
  },
];

const RECENT_SESSIONS = [
  {
    id: '1',
    type: 'Full Swing',
    date: 'Today',
    duration: '45 min',
    shotsHit: 62,
    focus: 'Driver accuracy',
    improvement: '+3%',
  },
  {
    id: '2',
    type: 'Putting',
    date: 'Yesterday',
    duration: '30 min',
    shotsHit: 45,
    focus: 'Speed control',
    improvement: '+5%',
  },
  {
    id: '3',
    type: 'Short Game',
    date: '2 days ago',
    duration: '35 min',
    shotsHit: 48,
    focus: 'Chip contact',
    improvement: '+2%',
  },
];

// Animated Practice Type Card Component
function PracticeTypeCard({
  item,
  index,
  onPress,
}: {
  item: typeof PRACTICE_TYPES[0];
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 100).springify()}
      style={styles.practiceCardWrapper}
    >
      <AnimatedPressable
        style={[styles.practiceCard, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <LinearGradient
          colors={item.gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.practiceCardGradient}
        >
          <View style={styles.practiceIconContainer}>
            <Ionicons name={item.icon as any} size={28} color="#FFF" />
          </View>
          <Text variant="h4" color="#FFF" style={styles.practiceTitle}>
            {item.title}
          </Text>
          <Text variant="caption" color="rgba(255,255,255,0.8)">
            {item.subtitle}
          </Text>
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
}

// Drill Card Component
function DrillCard({
  drill,
  index,
  colors,
  onPress,
}: {
  drill: typeof RECOMMENDED_DRILLS[0];
  index: number;
  colors: any;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Animated.View entering={FadeInRight.delay(400 + index * 100).springify()}>
      <AnimatedPressable
        style={[
          styles.drillCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
          animatedStyle,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <View style={styles.drillContent}>
          <View style={styles.drillHeader}>
            <Text variant="labelMedium" color={colors.textHeading}>
              {drill.title}
            </Text>
            <Badge label={drill.difficulty} variant="neutral" size="small" />
          </View>
          <Text variant="caption" color={colors.textMuted} style={styles.drillReason}>
            {drill.reason}
          </Text>
          <View style={styles.drillMeta}>
            <View style={styles.drillMetaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text variant="caption" color={colors.textSecondary}>
                {drill.duration}
              </Text>
            </View>
            <View style={styles.drillMetaItem}>
              <Ionicons name="golf-outline" size={14} color={colors.textMuted} />
              <Text variant="caption" color={colors.textSecondary}>
                {drill.category}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.drillArrow, { backgroundColor: colors.primaryMuted }]}>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

// Session Card Component
function SessionCard({
  session,
  index,
  colors,
}: {
  session: typeof RECENT_SESSIONS[0];
  index: number;
  colors: any;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Animated.View entering={FadeInDown.delay(600 + index * 100).springify()}>
      <AnimatedPressable
        style={[
          styles.sessionCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
          animatedStyle,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.sessionLeft}>
          <View style={styles.sessionTypeRow}>
            <Text variant="labelMedium" color={colors.textHeading}>
              {session.type}
            </Text>
            <View style={[styles.improvementBadge, { backgroundColor: colors.successLight }]}>
              <Ionicons name="trending-up" size={12} color={colors.success} />
              <Text variant="caption" color={colors.success}>
                {session.improvement}
              </Text>
            </View>
          </View>
          <Text variant="caption" color={colors.textMuted}>
            {session.focus}
          </Text>
          <View style={styles.sessionStats}>
            <Text variant="caption" color={colors.textSecondary}>
              {session.duration}
            </Text>
            <View style={[styles.sessionDot, { backgroundColor: colors.border }]} />
            <Text variant="caption" color={colors.textSecondary}>
              {session.shotsHit} shots
            </Text>
          </View>
        </View>
        <Text variant="caption" color={colors.textMuted}>
          {session.date}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function PracticeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const progressPercent = (WEEKLY_STATS.hoursCompleted / WEEKLY_STATS.hoursGoal) * 100;

  const handleStartSession = useCallback((type: string) => {
    // Navigate to session setup
    console.log('Starting session:', type);
  }, []);

  const handleDrillPress = useCallback((drillId: string) => {
    router.push(`/learn/drill/${drillId}`);
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.header}>
          <Text variant="displaySmall" color={colors.textHeading}>
            Practice
          </Text>
          <Text variant="bodyMedium" color={colors.textSecondary}>
            Build consistency through focused sessions
          </Text>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.primaryMuted }]}>
            <Text variant="metricMedium" color={colors.primary}>
              {WEEKLY_STATS.streak}
            </Text>
            <Text variant="caption" color={colors.textSecondary}>
              Day Streak
            </Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.successLight }]}>
            <Text variant="metricMedium" color={colors.success}>
              {WEEKLY_STATS.sessionsThisWeek}
            </Text>
            <Text variant="caption" color={colors.textSecondary}>
              This Week
            </Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.infoLight }]}>
            <Text variant="metricMedium" color={colors.info}>
              {WEEKLY_STATS.avgSessionLength}
            </Text>
            <Text variant="caption" color={colors.textSecondary}>
              Avg Minutes
            </Text>
          </View>
        </Animated.View>

        {/* Weekly Goal */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Card variant="elevated" style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleRow}>
                <Ionicons name="flag" size={20} color={colors.primary} />
                <Text variant="labelMedium" color={colors.textHeading}>
                  Weekly Goal
                </Text>
              </View>
              <Text variant="caption" color={colors.textMuted}>
                {WEEKLY_STATS.hoursCompleted} / {WEEKLY_STATS.hoursGoal} hrs
              </Text>
            </View>
            <ProgressBar
              progress={progressPercent}
              variant="gradient"
              size="medium"
              style={styles.progressBar}
            />
            <Text variant="caption" color={colors.textMuted} style={styles.goalMotivation}>
              {progressPercent >= 100
                ? 'Goal achieved! Keep up the momentum.'
                : `${(WEEKLY_STATS.hoursGoal - WEEKLY_STATS.hoursCompleted).toFixed(1)} hours to go`}
            </Text>
          </Card>
        </Animated.View>

        {/* Practice Types */}
        <View style={styles.section}>
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text variant="h3" color={colors.textHeading} style={styles.sectionTitle}>
              Start Session
            </Text>
          </Animated.View>

          <View style={styles.practiceGrid}>
            {PRACTICE_TYPES.map((item, index) => (
              <PracticeTypeCard
                key={item.id}
                item={item}
                index={index}
                onPress={() => handleStartSession(item.id)}
              />
            ))}
          </View>
        </View>

        {/* Quick Start */}
        <Animated.View entering={FadeInDown.delay(350).springify()}>
          <Pressable style={styles.quickStartContainer}>
            <LinearGradient
              colors={[colors.primary, '#FF9A33']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.quickStartCard}
            >
              <View style={styles.quickStartContent}>
                <View style={styles.quickStartBadge}>
                  <Ionicons name="sparkles" size={14} color={colors.primary} />
                  <Text variant="caption" color={colors.primary}>
                    AI Recommended
                  </Text>
                </View>
                <Text variant="h4" color="#FFF">
                  Quick Practice
                </Text>
                <Text variant="caption" color="rgba(255,255,255,0.8)">
                  25 min session tailored to your needs
                </Text>
              </View>
              <View style={styles.quickStartButton}>
                <Ionicons name="play" size={24} color={colors.primary} />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Recommended Drills */}
        <View style={styles.section}>
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.sectionHeader}>
            <Text variant="h3" color={colors.textHeading}>
              Recommended Drills
            </Text>
            <Pressable onPress={() => router.push('/learn')}>
              <Text variant="labelSmall" color={colors.primary}>
                See All
              </Text>
            </Pressable>
          </Animated.View>

          {RECOMMENDED_DRILLS.map((drill, index) => (
            <DrillCard
              key={drill.id}
              drill={drill}
              index={index}
              colors={colors}
              onPress={() => handleDrillPress(drill.id)}
            />
          ))}
        </View>

        {/* Recent Sessions */}
        <View style={styles.section}>
          <Animated.View entering={FadeInDown.delay(550).springify()} style={styles.sectionHeader}>
            <Text variant="h3" color={colors.textHeading}>
              Recent Sessions
            </Text>
            <Pressable>
              <Text variant="labelSmall" color={colors.primary}>
                View All
              </Text>
            </Pressable>
          </Animated.View>

          {RECENT_SESSIONS.map((session, index) => (
            <SessionCard
              key={session.id}
              session={session}
              index={index}
              colors={colors}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[24],
  },

  // Header
  header: {
    marginBottom: spacing[5],
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[5],
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
  },

  // Goal Card
  goalCard: {
    marginBottom: spacing[6],
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  progressBar: {
    marginBottom: spacing[2],
  },
  goalMotivation: {
    textAlign: 'center',
  },

  // Sections
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    marginBottom: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },

  // Practice Grid
  practiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  practiceCardWrapper: {
    width: (SCREEN_WIDTH - spacing[4] * 2 - spacing[3]) / 2,
  },
  practiceCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  practiceCardGradient: {
    padding: spacing[4],
    alignItems: 'center',
    minHeight: 130,
    justifyContent: 'center',
  },
  practiceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  practiceTitle: {
    marginBottom: spacing[1],
  },

  // Quick Start
  quickStartContainer: {
    marginBottom: spacing[6],
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  quickStartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  quickStartContent: {
    flex: 1,
  },
  quickStartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: '#FFF',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing[2],
  },
  quickStartButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Drill Cards
  drillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing[3],
  },
  drillContent: {
    flex: 1,
  },
  drillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  drillReason: {
    marginBottom: spacing[2],
  },
  drillMeta: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  drillMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  drillArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing[3],
  },

  // Session Cards
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing[3],
  },
  sessionLeft: {
    flex: 1,
  },
  sessionTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  sessionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  sessionDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
});

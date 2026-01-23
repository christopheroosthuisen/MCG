/**
 * MCG Golf App - Home Screen
 * Dashboard with personalized content, quick actions, and recent activity
 */

import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius } from '@/design';
import {
  Text,
  Button,
  Card,
  GradientCard,
  PressableCard,
  Badge,
  ProgressBar,
} from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Get time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Mock data for recent swings
const RECENT_SWINGS = [
  { id: '1', date: 'Today', club: 'Driver', score: 85, issue: 'Over-rotation' },
  { id: '2', date: 'Yesterday', club: '7 Iron', score: 78, issue: 'Early extension' },
  { id: '3', date: '2 days ago', club: 'Wedge', score: 92, issue: null },
];

export default function HomeScreen() {
  const { colors, gradients } = useTheme();
  const router = useRouter();
  const [greeting] = useState(getGreeting());

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Greeting */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <View style={styles.greetingContent}>
            <Text variant="bodyMedium" color={colors.textMuted}>
              {greeting}
            </Text>
            <Text variant="displaySmall" color={colors.textHeading}>
              Welcome back
            </Text>
          </View>

          <Pressable
            style={[styles.streakBadge, { backgroundColor: colors.primaryMuted }]}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="flame" size={22} color={colors.primary} />
            <View>
              <Text variant="labelLarge" color={colors.primary}>7</Text>
              <Text variant="caption" color={colors.textMuted}>Day Streak</Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* Primary CTA - Continue Learning */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GradientCard style={styles.primaryCard}>
            <View style={styles.cardBadge}>
              <Badge label="CONTINUE LEARNING" variant="neutral" size="small" />
            </View>

            <Text variant="h2" color="#FFFFFF" style={styles.cardTitle}>
              Mastering the 50-Yard Pitch
            </Text>
            <Text variant="bodyMedium" color="rgba(255,255,255,0.8)" style={styles.cardSubtitle}>
              Lesson 3 of 8 • The Scoring Zone
            </Text>

            <View style={styles.progressContainer}>
              <ProgressBar progress={37} variant="gradient" size="small" />
              <Text variant="caption" color="rgba(255,255,255,0.7)" style={styles.progressText}>
                37% Complete
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <Button
                label="Continue"
                variant="primary"
                size="medium"
                rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFF" />}
                onPress={() => router.push('/learn')}
              />
              <View style={styles.duration}>
                <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.7)" />
                <Text variant="caption" color="rgba(255,255,255,0.7)">12 min left</Text>
              </View>
            </View>
          </GradientCard>
        </Animated.View>

        {/* Quick Stats Row */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.statsRow}
        >
          <StatCard
            icon="videocam"
            value="24"
            label="Swings"
            color={colors.primary}
            bgColor={colors.primaryMuted}
          />
          <StatCard
            icon="time"
            value="4.2h"
            label="Practice"
            color={colors.info}
            bgColor={colors.infoLight}
          />
          <StatCard
            icon="trending-up"
            value="+12%"
            label="Improved"
            color={colors.success}
            bgColor={colors.successLight}
          />
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.section}
        >
          <Text variant="h3" style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <QuickAction
              icon="videocam"
              label="Record Swing"
              subtitle="Live analysis"
              color={colors.primary}
              onPress={() => router.push('/analysis/live')}
            />
            <QuickAction
              icon="cloud-upload"
              label="Upload Video"
              subtitle="From library"
              color={colors.secondary}
              onPress={() => router.push('/(tabs)/analyze')}
            />
          </View>
        </Animated.View>

        {/* AI Coach Tip */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <Card variant="outlined" style={styles.coachCard}>
            <View style={styles.coachHeader}>
              <View style={[styles.coachAvatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="sparkles" size={18} color="#FFF" />
              </View>
              <View style={styles.coachInfo}>
                <Text variant="labelMedium">AI Coach Insight</Text>
                <View style={styles.onlineIndicator}>
                  <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
                  <Text variant="caption" color={colors.success}>Active</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
            <View style={[styles.coachMessage, { backgroundColor: colors.backgroundSecondary }]}>
              <Text variant="bodySmall" color={colors.textSecondary}>
                "Based on your recent practice, focus on hip rotation through impact.
                I've prepared a drill specifically for you."
              </Text>
            </View>
            <Button
              label="View Recommended Drill"
              variant="ghost"
              size="small"
              rightIcon={<Ionicons name="arrow-forward" size={16} color={colors.primary} />}
              onPress={() => router.push('/learn/drill/drill-hip-rotation')}
            />
          </Card>
        </Animated.View>

        {/* Recent Swings */}
        <Animated.View
          entering={FadeInDown.delay(600).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text variant="h3">Recent Swings</Text>
            <Pressable onPress={() => router.push('/(tabs)/analyze')}>
              <Text variant="labelMedium" color={colors.primary}>See All</Text>
            </Pressable>
          </View>

          {RECENT_SWINGS.map((swing, index) => (
            <Animated.View
              key={swing.id}
              entering={FadeInRight.delay(700 + index * 100).springify()}
            >
              <SwingCard
                swing={swing}
                colors={colors}
                onPress={() => router.push({
                  pathname: '/analysis/[id]',
                  params: { id: swing.id }
                })}
              />
            </Animated.View>
          ))}
        </Animated.View>

        {/* Today's Goal */}
        <Animated.View entering={FadeInDown.delay(900).springify()}>
          <Card variant="filled" style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={[styles.goalIcon, { backgroundColor: colors.secondaryMuted }]}>
                <Ionicons name="flag" size={20} color={colors.secondary} />
              </View>
              <View style={styles.goalInfo}>
                <Text variant="labelMedium">Today's Goal</Text>
                <Text variant="caption" color={colors.textMuted}>
                  Complete 3 practice drills
                </Text>
              </View>
              <Text variant="h3" color={colors.secondary}>1/3</Text>
            </View>
            <ProgressBar progress={33} variant="secondary" size="small" />
          </Card>
        </Animated.View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: spacing[4] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Stat Card Component
function StatCard({
  icon,
  value,
  label,
  color,
  bgColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: string;
  bgColor: string;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <Animated.View style={animatedStyle}>
        <Card variant="elevated" padding={3} style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: bgColor }]}>
            <Ionicons name={icon} size={18} color={color} />
          </View>
          <Text variant="labelLarge" color={colors.textHeading}>{value}</Text>
          <Text variant="caption" color={colors.textMuted}>{label}</Text>
        </Card>
      </Animated.View>
    </Pressable>
  );
}

// Quick Action Component
function QuickAction({
  icon,
  label,
  subtitle,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
      style={styles.quickActionWrapper}
    >
      <Animated.View style={animatedStyle}>
        <Card variant="elevated" padding={4} style={styles.quickActionCard}>
          <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={28} color={color} />
          </View>
          <Text variant="labelMedium" color={colors.textHeading}>{label}</Text>
          <Text variant="caption" color={colors.textMuted}>{subtitle}</Text>
        </Card>
      </Animated.View>
    </Pressable>
  );
}

// Swing Card Component
function SwingCard({
  swing,
  colors,
  onPress,
}: {
  swing: typeof RECENT_SWINGS[0];
  colors: any;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getScoreColor = (score: number) => {
    if (score >= 85) return colors.success;
    if (score >= 70) return colors.warning;
    return colors.error;
  };

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
    >
      <Animated.View style={animatedStyle}>
        <Card variant="outlined" style={styles.swingCard}>
          <View style={styles.swingLeft}>
            <View style={[styles.swingScore, { borderColor: getScoreColor(swing.score) }]}>
              <Text variant="labelLarge" color={getScoreColor(swing.score)}>
                {swing.score}
              </Text>
            </View>
          </View>
          <View style={styles.swingInfo}>
            <Text variant="labelMedium" color={colors.textHeading}>{swing.club}</Text>
            <Text variant="caption" color={colors.textMuted}>{swing.date}</Text>
            {swing.issue && (
              <Badge label={swing.issue} variant="warning" size="small" />
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Card>
      </Animated.View>
    </Pressable>
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
    paddingBottom: spacing[8],
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[6],
  },
  greetingContent: {
    flex: 1,
    gap: spacing[1],
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.xl,
  },

  // Primary Card
  primaryCard: {
    marginBottom: spacing[6],
  },
  cardBadge: {
    marginBottom: spacing[2],
  },
  cardTitle: {
    marginBottom: spacing[1],
  },
  cardSubtitle: {
    marginBottom: spacing[4],
  },
  progressContainer: {
    marginBottom: spacing[4],
  },
  progressText: {
    marginTop: spacing[2],
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[2],
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sections
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    marginBottom: spacing[4],
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  quickActionWrapper: {
    flex: 1,
  },
  quickActionCard: {
    alignItems: 'center',
    gap: spacing[2],
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },

  // Coach Card
  coachCard: {
    marginBottom: spacing[6],
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  coachInfo: {
    flex: 1,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  coachMessage: {
    padding: spacing[3],
    borderRadius: radius.lg,
    marginBottom: spacing[3],
  },

  // Swing Card
  swingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  swingLeft: {
    marginRight: spacing[3],
  },
  swingScore: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swingInfo: {
    flex: 1,
    gap: spacing[1],
  },

  // Goal Card
  goalCard: {
    marginBottom: spacing[4],
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  goalInfo: {
    flex: 1,
  },
});

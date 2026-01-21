/**
 * MCG Golf App - Home Screen
 * Dashboard with personalized content and quick actions
 */

import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius, layout } from '@/design';
import {
  Text,
  Heading,
  Button,
  Card,
  GradientCard,
  PressableCard,
  Badge,
  ProgressBar,
  MetricValue,
} from '@/components/ui';

export default function HomeScreen() {
  const { colors, gradients } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingContent}>
            <Text variant="h1" color={colors.textHeading}>
              Good morning, <Text color={colors.primary}>Player</Text>
            </Text>
            <Text variant="bodyMedium" color={colors.textSecondary}>
              Ready to elevate your short game?
            </Text>
          </View>

          <View style={[styles.streakBadge, { backgroundColor: colors.primaryMuted }]}>
            <Ionicons name="flame" size={24} color={colors.primary} />
            <View>
              <Text variant="metricSmall" color={colors.primary}>7</Text>
              <Text variant="caption" color={colors.textMuted}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Primary Action Card */}
        <GradientCard style={styles.primaryCard}>
          <View style={styles.cardBadge}>
            <Badge label="CONTINUE LEARNING" variant="neutral" size="small" />
          </View>

          <Text variant="h2" color="#FFFFFF" style={styles.cardTitle}>
            Mastering the 50-Yard Pitch
          </Text>
          <Text variant="bodyMedium" color="rgba(255,255,255,0.8)" style={styles.cardSubtitle}>
            Lesson 3 of 8 - The Scoring Zone
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

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="book-outline"
            iconBg={colors.primaryMuted}
            iconColor={colors.primary}
            value="12"
            label="Lessons Done"
          />
          <StatCard
            icon="golf-outline"
            iconBg={colors.infoLight}
            iconColor={colors.info}
            value="3.5"
            label="Hours Practice"
          />
          <StatCard
            icon="trending-up-outline"
            iconBg={colors.secondaryMuted}
            iconColor={colors.secondary}
            value="+15%"
            label="Improvement"
          />
          <StatCard
            icon="analytics-outline"
            iconBg={colors.errorLight}
            iconColor={colors.error}
            value="82"
            label="Avg Score"
          />
        </View>

        {/* Two Column Grid */}
        <View style={styles.twoColumnGrid}>
          {/* AI Coach Card */}
          <Card variant="elevated" style={styles.gridCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.coachAvatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
              </View>
              <View style={styles.cardHeaderText}>
                <Text variant="h4">AI Coach</Text>
                <View style={styles.onlineStatus}>
                  <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
                  <Text variant="caption" color={colors.success}>Online</Text>
                </View>
              </View>
            </View>

            <View style={[styles.coachMessage, { backgroundColor: colors.backgroundSecondary, borderLeftColor: colors.primary }]}>
              <Text variant="bodySmall" color={colors.text}>
                "Based on your recent sessions, let's focus on distance control with your wedges today."
              </Text>
            </View>

            <Button
              label="Chat with Coach"
              variant="outline"
              size="small"
              onPress={() => router.push('/learn')}
            />
          </Card>

          {/* Recommended Drill Card */}
          <Card variant="elevated" style={styles.gridCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="flash" size={24} color={colors.primary} />
              <Text variant="h4" style={{ flex: 1 }}>Today's Drill</Text>
            </View>

            <View style={styles.drillPreview}>
              <View style={[styles.drillThumbnail, { backgroundColor: colors.secondaryMuted }]}>
                <Ionicons name="golf" size={32} color={colors.secondary} />
              </View>
              <View style={styles.drillInfo}>
                <Text variant="labelMedium">Clock Drill</Text>
                <View style={styles.drillMeta}>
                  <Badge label="Short Game" variant="secondary" size="small" />
                  <Text variant="caption" color={colors.textMuted}>15 min</Text>
                </View>
              </View>
            </View>

            <Button
              label="Start Drill"
              variant="secondary"
              size="small"
              onPress={() => router.push('/practice')}
            />
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text variant="h2" style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            <QuickActionCard
              icon="videocam"
              label="Record Swing"
              onPress={() => router.push('/analyze')}
              colors={colors}
            />
            <QuickActionCard
              icon="golf"
              label="Practice"
              onPress={() => router.push('/practice')}
              colors={colors}
            />
            <QuickActionCard
              icon="analytics"
              label="My Stats"
              onPress={() => router.push('/profile')}
              colors={colors}
            />
            <QuickActionCard
              icon="school"
              label="Lessons"
              onPress={() => router.push('/learn')}
              colors={colors}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Stat Card Component
function StatCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
}) {
  const { colors } = useTheme();

  return (
    <Card variant="elevated" padding={3} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.statContent}>
        <Text variant="metricSmall" color={colors.textHeading}>{value}</Text>
        <Text variant="caption" color={colors.textMuted}>{label}</Text>
      </View>
    </Card>
  );
}

// Quick Action Card Component
function QuickActionCard({
  icon,
  label,
  onPress,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  colors: any;
}) {
  return (
    <PressableCard
      variant="elevated"
      padding={4}
      style={styles.actionCard}
      onPress={onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: colors.backgroundSecondary }]}>
        <Ionicons name={icon} size={28} color={colors.text} />
      </View>
      <Text variant="labelMedium" align="center">{label}</Text>
    </PressableCard>
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

  // Greeting
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[6],
  },
  greetingContent: {
    flex: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: radius.xl,
  },

  // Primary Card
  primaryCard: {
    marginBottom: spacing[6],
  },
  cardBadge: {
    marginBottom: spacing[3],
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

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
    minWidth: '45%',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },

  // Two Column Grid
  twoColumnGrid: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  gridCard: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  cardHeaderText: {
    flex: 1,
  },
  coachAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[0.5],
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  coachMessage: {
    padding: spacing[3],
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    marginBottom: spacing[4],
  },

  // Drill Preview
  drillPreview: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  drillThumbnail: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drillInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing[2],
  },
  drillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },

  // Quick Actions
  quickActionsSection: {
    marginTop: spacing[2],
  },
  sectionTitle: {
    marginBottom: spacing[4],
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  actionCard: {
    width: '47%',
    alignItems: 'center',
    gap: spacing[3],
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

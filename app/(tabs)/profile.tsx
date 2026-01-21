/**
 * MCG Golf App - Profile Screen
 * User profile, stats, and settings
 */

import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius, layout } from '@/design';
import {
  Text,
  Button,
  Card,
  PressableCard,
  Badge,
  ProgressBar,
  ScoreRing,
} from '@/components/ui';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  // Mock user data
  const user = {
    name: 'John Player',
    handicap: 12.4,
    memberSince: 'Jan 2024',
    isPremium: true,
    avatar: null,
    stats: {
      totalSessions: 47,
      totalHours: 23.5,
      currentStreak: 7,
      longestStreak: 14,
    },
    averageScores: {
      fullSwing: 81,
      shortGame: 85,
      putting: 78,
      overall: 82,
    },
    achievements: [
      { id: '1', name: '7 Day Streak', icon: 'flame', earned: true },
      { id: '2', name: 'Short Game Pro', icon: 'golf', earned: true },
      { id: '3', name: '100 Sessions', icon: 'trophy', earned: false },
    ],
  };

  const menuItems = [
    { id: 'clubs', icon: 'golf-outline', label: 'My Clubs', badge: null },
    { id: 'goals', icon: 'flag-outline', label: 'Goals', badge: '2 active' },
    { id: 'history', icon: 'time-outline', label: 'Session History', badge: null },
    { id: 'export', icon: 'download-outline', label: 'Export Data', badge: null },
    { id: 'settings', icon: 'settings-outline', label: 'Settings', badge: null },
    { id: 'help', icon: 'help-circle-outline', label: 'Help & Support', badge: null },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
            <Text variant="displaySmall" color="#FFFFFF">
              {user.name.split(' ').map((n) => n[0]).join('')}
            </Text>
          </View>

          <Text variant="h1" color={colors.textHeading} style={styles.userName}>
            {user.name}
          </Text>

          <View style={styles.profileMeta}>
            <Badge
              label={user.isPremium ? 'PRO MEMBER' : 'FREE'}
              variant={user.isPremium ? 'primary' : 'neutral'}
              size="small"
            />
            <Text variant="caption" color={colors.textMuted}>
              Member since {user.memberSince}
            </Text>
          </View>

          <View style={styles.handicapContainer}>
            <Text variant="caption" color={colors.textMuted}>Handicap Index</Text>
            <Text variant="metricLarge" color={colors.primary}>{user.handicap}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text variant="metricMedium" color={colors.textHeading}>
              {user.stats.totalSessions}
            </Text>
            <Text variant="caption" color={colors.textMuted}>Sessions</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text variant="metricMedium" color={colors.textHeading}>
              {user.stats.totalHours}h
            </Text>
            <Text variant="caption" color={colors.textMuted}>Practice</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <View style={styles.streakValue}>
              <Ionicons name="flame" size={20} color={colors.primary} />
              <Text variant="metricMedium" color={colors.textHeading}>
                {user.stats.currentStreak}
              </Text>
            </View>
            <Text variant="caption" color={colors.textMuted}>Day Streak</Text>
          </View>
        </View>

        {/* Performance Overview */}
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>Performance</Text>

          <Card variant="elevated" style={styles.performanceCard}>
            <View style={styles.scoresGrid}>
              <View style={styles.scoreItem}>
                <ScoreRing score={user.averageScores.fullSwing} size={70} />
                <Text variant="caption" color={colors.textMuted} style={styles.scoreLabel}>
                  Full Swing
                </Text>
              </View>
              <View style={styles.scoreItem}>
                <ScoreRing score={user.averageScores.shortGame} size={70} />
                <Text variant="caption" color={colors.textMuted} style={styles.scoreLabel}>
                  Short Game
                </Text>
              </View>
              <View style={styles.scoreItem}>
                <ScoreRing score={user.averageScores.putting} size={70} />
                <Text variant="caption" color={colors.textMuted} style={styles.scoreLabel}>
                  Putting
                </Text>
              </View>
              <View style={styles.scoreItem}>
                <ScoreRing score={user.averageScores.overall} size={70} />
                <Text variant="caption" color={colors.textMuted} style={styles.scoreLabel}>
                  Overall
                </Text>
              </View>
            </View>

            <Button
              label="View Detailed Stats"
              variant="outline"
              size="medium"
              fullWidth
            />
          </Card>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h2">Achievements</Text>
            <Button label="View All" variant="ghost" size="small" />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}
          >
            {user.achievements.map((achievement) => (
              <Card
                key={achievement.id}
                variant={achievement.earned ? 'elevated' : 'outlined'}
                padding={4}
                style={[
                  styles.achievementCard,
                  !achievement.earned && { opacity: 0.5 },
                ]}
              >
                <View
                  style={[
                    styles.achievementIcon,
                    {
                      backgroundColor: achievement.earned
                        ? colors.primaryMuted
                        : colors.backgroundTertiary,
                    },
                  ]}
                >
                  <Ionicons
                    name={achievement.icon as any}
                    size={28}
                    color={achievement.earned ? colors.primary : colors.textMuted}
                  />
                </View>
                <Text
                  variant="labelSmall"
                  color={achievement.earned ? colors.textHeading : colors.textMuted}
                  align="center"
                >
                  {achievement.name}
                </Text>
                {achievement.earned && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                )}
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          {menuItems.map((item, index) => (
            <PressableCard
              key={item.id}
              variant="elevated"
              padding={4}
              style={[
                styles.menuItem,
                index === 0 && styles.menuItemFirst,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
            >
              <Ionicons name={item.icon as any} size={22} color={colors.text} />
              <Text variant="bodyMedium" style={styles.menuLabel}>{item.label}</Text>
              {item.badge && (
                <Badge label={item.badge} variant="neutral" size="small" />
              )}
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </PressableCard>
          ))}
        </View>

        {/* Sign Out */}
        <Button
          label="Sign Out"
          variant="ghost"
          size="medium"
          fullWidth
          style={styles.signOutButton}
        />

        {/* Version */}
        <Text variant="caption" color={colors.textMuted} align="center" style={styles.version}>
          MCG Golf v1.0.0
        </Text>
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
    paddingBottom: spacing[8],
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  userName: {
    marginBottom: spacing[2],
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  handicapContainer: {
    alignItems: 'center',
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing[4],
    marginBottom: spacing[6],
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  streakValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
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

  // Performance Card
  performanceCard: {
    alignItems: 'center',
  },
  scoresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing[4],
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    marginTop: spacing[2],
  },

  // Achievements
  achievementsScroll: {
    paddingRight: spacing[4],
  },
  achievementCard: {
    alignItems: 'center',
    marginRight: spacing[3],
    minWidth: 100,
    gap: spacing[2],
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  menuItemFirst: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  menuItemLast: {
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    marginBottom: 0,
  },
  menuLabel: {
    flex: 1,
  },

  // Sign Out
  signOutButton: {
    marginTop: spacing[4],
  },

  // Version
  version: {
    marginTop: spacing[4],
  },
});

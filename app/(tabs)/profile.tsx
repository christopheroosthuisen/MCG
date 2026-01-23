/**
 * MCG Golf App - Profile Screen
 * User profile, stats, and settings
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
import { spacing, radius } from '@/design';
import { Text, Button, Badge } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mock user data
const USER = {
  name: 'John Player',
  handicap: 12.4,
  memberSince: 'Jan 2024',
  isPremium: true,
  stats: {
    totalSessions: 47,
    totalHours: 23.5,
    currentStreak: 7,
  },
  performance: {
    fullSwing: 81,
    shortGame: 85,
    putting: 78,
    overall: 82,
  },
};

const ACHIEVEMENTS = [
  { id: '1', name: '7 Day Streak', icon: 'flame', earned: true, color: '#FF8200' },
  { id: '2', name: 'Short Game Pro', icon: 'golf', earned: true, color: '#115740' },
  { id: '3', name: '100 Sessions', icon: 'trophy', earned: false, color: '#FFD700' },
  { id: '4', name: 'Perfect Score', icon: 'star', earned: false, color: '#3B82F6' },
];

const MENU_ITEMS = [
  { id: 'clubs', icon: 'golf-outline', label: 'My Clubs' },
  { id: 'goals', icon: 'flag-outline', label: 'Goals', badge: '2' },
  { id: 'history', icon: 'time-outline', label: 'Session History' },
  { id: 'export', icon: 'download-outline', label: 'Export Data' },
  { id: 'settings', icon: 'settings-outline', label: 'Settings' },
  { id: 'help', icon: 'help-circle-outline', label: 'Help & Support' },
];

// Score Ring Component
function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.scoreRingContainer}>
      <View style={[styles.scoreRingOuter, { borderColor: colors.border }]}>
        <View style={[styles.scoreRingProgress, { borderColor: color }]} />
        <View style={styles.scoreRingInner}>
          <Text variant="labelMedium" color={colors.textHeading}>
            {score}
          </Text>
        </View>
      </View>
      <Text variant="caption" color={colors.textMuted} style={styles.scoreRingLabel}>
        {label}
      </Text>
    </View>
  );
}

// Achievement Card Component
function AchievementCard({
  achievement,
  index,
  colors,
}: {
  achievement: typeof ACHIEVEMENTS[0];
  index: number;
  colors: any;
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
    <Animated.View entering={FadeInRight.delay(300 + index * 75).springify()}>
      <AnimatedPressable
        style={[
          styles.achievementCard,
          {
            backgroundColor: achievement.earned ? `${achievement.color}15` : colors.surface,
            borderColor: achievement.earned ? `${achievement.color}30` : colors.border,
            opacity: achievement.earned ? 1 : 0.5,
          },
          animatedStyle,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View
          style={[
            styles.achievementIcon,
            {
              backgroundColor: achievement.earned
                ? `${achievement.color}20`
                : colors.backgroundSecondary,
            },
          ]}
        >
          <Ionicons
            name={achievement.icon as any}
            size={24}
            color={achievement.earned ? achievement.color : colors.textMuted}
          />
        </View>
        <Text
          variant="caption"
          color={achievement.earned ? colors.textHeading : colors.textMuted}
          style={styles.achievementName}
        >
          {achievement.name}
        </Text>
        {achievement.earned && (
          <View style={[styles.achievementCheck, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark" size={10} color="#FFF" />
          </View>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

// Menu Item Component
function MenuItem({
  item,
  index,
  colors,
  onPress,
}: {
  item: typeof MENU_ITEMS[0];
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
    <Animated.View entering={FadeInDown.delay(400 + index * 50).springify()}>
      <AnimatedPressable
        style={[
          styles.menuItem,
          { backgroundColor: colors.surface, borderColor: colors.border },
          animatedStyle,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <View style={[styles.menuIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name={item.icon as any} size={20} color={colors.textSecondary} />
        </View>
        <Text variant="bodyMedium" color={colors.textHeading} style={styles.menuLabel}>
          {item.label}
        </Text>
        {item.badge && (
          <View style={[styles.menuBadge, { backgroundColor: colors.primaryMuted }]}>
            <Text variant="caption" color={colors.primary}>
              {item.badge}
            </Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const handleMenuPress = useCallback((itemId: string) => {
    console.log('Menu pressed:', itemId);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
            <Text variant="displaySmall" color="#FFF">
              {USER.name.split(' ').map((n) => n[0]).join('')}
            </Text>
          </View>

          <Text variant="h2" color={colors.textHeading} style={styles.userName}>
            {USER.name}
          </Text>

          <View style={styles.profileMeta}>
            {USER.isPremium && (
              <View style={[styles.proBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="star" size={12} color="#FFF" />
                <Text variant="caption" color="#FFF">
                  PRO
                </Text>
              </View>
            )}
            <Text variant="caption" color={colors.textMuted}>
              Member since {USER.memberSince}
            </Text>
          </View>
        </Animated.View>

        {/* Handicap & Stats Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LinearGradient
            colors={[colors.primary, '#FF9A33']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsCard}
          >
            <View style={styles.handicapSection}>
              <Text variant="caption" color="rgba(255,255,255,0.8)">
                Handicap Index
              </Text>
              <Text variant="metricLarge" color="#FFF">
                {USER.handicap}
              </Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.quickStats}>
              <View style={styles.quickStatItem}>
                <Text variant="labelMedium" color="#FFF">
                  {USER.stats.totalSessions}
                </Text>
                <Text variant="caption" color="rgba(255,255,255,0.8)">
                  Sessions
                </Text>
              </View>
              <View style={styles.quickStatItem}>
                <Text variant="labelMedium" color="#FFF">
                  {USER.stats.totalHours}h
                </Text>
                <Text variant="caption" color="rgba(255,255,255,0.8)">
                  Practice
                </Text>
              </View>
              <View style={styles.quickStatItem}>
                <View style={styles.streakRow}>
                  <Ionicons name="flame" size={16} color="#FFF" />
                  <Text variant="labelMedium" color="#FFF">
                    {USER.stats.currentStreak}
                  </Text>
                </View>
                <Text variant="caption" color="rgba(255,255,255,0.8)">
                  Streak
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Performance Section */}
        <View style={styles.section}>
          <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.sectionHeader}>
            <Text variant="h3" color={colors.textHeading}>
              Performance
            </Text>
            <Pressable>
              <Text variant="labelSmall" color={colors.primary}>
                Details
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.performanceCard}>
            <View style={styles.scoresRow}>
              <ScoreRing score={USER.performance.fullSwing} label="Full Swing" color={colors.primary} />
              <ScoreRing score={USER.performance.shortGame} label="Short Game" color={colors.secondary} />
              <ScoreRing score={USER.performance.putting} label="Putting" color={colors.info} />
              <ScoreRing score={USER.performance.overall} label="Overall" color={colors.success} />
            </View>
          </Animated.View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.sectionHeader}>
            <Text variant="h3" color={colors.textHeading}>
              Achievements
            </Text>
            <Pressable>
              <Text variant="labelSmall" color={colors.primary}>
                View All
              </Text>
            </Pressable>
          </Animated.View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}
          >
            {ACHIEVEMENTS.map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                index={index}
                colors={colors}
              />
            ))}
          </ScrollView>
        </View>

        {/* Menu Section */}
        <View style={styles.section}>
          <Animated.View entering={FadeInDown.delay(350).springify()}>
            <Text variant="h3" color={colors.textHeading} style={styles.sectionTitle}>
              Settings
            </Text>
          </Animated.View>

          {MENU_ITEMS.map((item, index) => (
            <MenuItem
              key={item.id}
              item={item}
              index={index}
              colors={colors}
              onPress={() => handleMenuPress(item.id)}
            />
          ))}
        </View>

        {/* Sign Out */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Pressable style={[styles.signOutButton, { borderColor: colors.border }]}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text variant="labelMedium" color={colors.error}>
              Sign Out
            </Text>
          </Pressable>
        </Animated.View>

        {/* Version */}
        <Animated.View entering={FadeInDown.delay(650).springify()}>
          <Text variant="caption" color={colors.textMuted} style={styles.version}>
            MCG Golf v1.0.0
          </Text>
        </Animated.View>
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

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  userName: {
    marginBottom: spacing[2],
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },

  // Stats Card
  statsCard: {
    borderRadius: radius.xl,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  handicapSection: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  statsDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: spacing[4],
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  streakRow: {
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

  // Performance
  performanceCard: {
    paddingVertical: spacing[2],
  },
  scoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreRingContainer: {
    alignItems: 'center',
    flex: 1,
  },
  scoreRingOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scoreRingProgress: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderTopColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
  },
  scoreRingInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingLabel: {
    marginTop: spacing[2],
    textAlign: 'center',
  },

  // Achievements
  achievementsScroll: {
    paddingRight: spacing[4],
  },
  achievementCard: {
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    marginRight: spacing[3],
    minWidth: 90,
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  achievementName: {
    textAlign: 'center',
  },
  achievementCheck: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing[2],
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  menuLabel: {
    flex: 1,
  },
  menuBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
    marginRight: spacing[2],
  },

  // Sign Out
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing[4],
  },

  // Version
  version: {
    textAlign: 'center',
  },
});

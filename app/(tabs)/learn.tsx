/**
 * MCG Golf App - Learn Screen
 * Lessons, drills, and AI coaching
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
import { Text, Button, Card, Badge, ProgressBar } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mock data
const CONTINUE_LEARNING = {
  id: 'lesson-1',
  title: 'The Scoring Zone',
  chapter: 'Chapter 3: Distance Control',
  instructor: 'Joe Mayo',
  progress: 37,
  duration: '12 min left',
  image: null,
};

const LEARNING_PATHS = [
  {
    id: 'short-game',
    title: 'Short Game Mastery',
    lessons: 12,
    progress: 45,
    gradient: ['#115740', '#1a7a5a'],
    icon: 'golf',
  },
  {
    id: 'putting',
    title: 'Putting Fundamentals',
    lessons: 8,
    progress: 20,
    gradient: ['#3B82F6', '#60A5FA'],
    icon: 'ellipse-outline',
  },
  {
    id: 'full-swing',
    title: 'Full Swing Mechanics',
    lessons: 15,
    progress: 0,
    gradient: ['#FF8200', '#FF9A33'],
    icon: 'flash',
  },
];

const FEATURED_DRILLS = [
  {
    id: 'drill-1',
    title: 'Gate Drill',
    category: 'Putting',
    duration: '15 min',
    difficulty: 'Beginner',
  },
  {
    id: 'drill-hip-rotation',
    title: 'Hip Rotation',
    category: 'Full Swing',
    duration: '20 min',
    difficulty: 'Intermediate',
  },
  {
    id: 'drill-2',
    title: 'Distance Ladder',
    category: 'Short Game',
    duration: '25 min',
    difficulty: 'All Levels',
  },
];

const DRILL_CATEGORIES = [
  { id: 'chipping', name: 'Chipping', count: 24, color: '#115740' },
  { id: 'putting', name: 'Putting', count: 32, color: '#3B82F6' },
  { id: 'bunker', name: 'Bunker', count: 12, color: '#D4A574' },
  { id: 'tempo', name: 'Tempo', count: 15, color: '#FF8200' },
];

// Learning Path Card Component
function PathCard({
  path,
  index,
  onPress,
}: {
  path: typeof LEARNING_PATHS[0];
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(200 + index * 100).springify()}
      style={styles.pathCardWrapper}
    >
      <AnimatedPressable
        style={[styles.pathCard, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <LinearGradient
          colors={path.gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pathCardGradient}
        >
          <View style={styles.pathIconCircle}>
            <Ionicons name={path.icon as any} size={24} color="#FFF" />
          </View>
          <Text variant="labelMedium" color="#FFF" numberOfLines={1}>
            {path.title}
          </Text>
          <Text variant="caption" color="rgba(255,255,255,0.7)">
            {path.lessons} lessons
          </Text>
          {path.progress > 0 && (
            <View style={styles.pathProgress}>
              <View style={styles.pathProgressBar}>
                <View
                  style={[styles.pathProgressFill, { width: `${path.progress}%` }]}
                />
              </View>
              <Text variant="caption" color="rgba(255,255,255,0.7)">
                {path.progress}%
              </Text>
            </View>
          )}
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
  drill: typeof FEATURED_DRILLS[0];
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
    <Animated.View entering={FadeInDown.delay(400 + index * 100).springify()}>
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
        <View style={[styles.drillIcon, { backgroundColor: colors.primaryMuted }]}>
          <Ionicons name="fitness" size={20} color={colors.primary} />
        </View>
        <View style={styles.drillContent}>
          <Text variant="labelMedium" color={colors.textHeading}>
            {drill.title}
          </Text>
          <View style={styles.drillMeta}>
            <Text variant="caption" color={colors.textMuted}>
              {drill.category}
            </Text>
            <View style={[styles.metricDot, { backgroundColor: colors.border }]} />
            <Text variant="caption" color={colors.textMuted}>
              {drill.duration}
            </Text>
          </View>
        </View>
        <View style={[styles.drillArrow, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

// Category Pill Component
function CategoryPill({
  category,
  index,
  colors,
  onPress,
}: {
  category: typeof DRILL_CATEGORIES[0];
  index: number;
  colors: any;
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
    <Animated.View entering={FadeInRight.delay(500 + index * 75).springify()}>
      <AnimatedPressable
        style={[
          styles.categoryPill,
          { backgroundColor: `${category.color}15`, borderColor: `${category.color}30` },
          animatedStyle,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <Text variant="labelSmall" color={category.color}>
          {category.name}
        </Text>
        <Text variant="caption" color={colors.textMuted}>
          {category.count}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function LearnScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const handleContinueLearning = useCallback(() => {
    router.push(`/learn/lesson/${CONTINUE_LEARNING.id}`);
  }, [router]);

  const handlePathPress = useCallback((pathId: string) => {
    console.log('Path pressed:', pathId);
  }, []);

  const handleDrillPress = useCallback((drillId: string) => {
    router.push(`/learn/drill/${drillId}`);
  }, [router]);

  const handleCategoryPress = useCallback((categoryId: string) => {
    console.log('Category pressed:', categoryId);
  }, []);

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
            Learn
          </Text>
          <Text variant="bodyMedium" color={colors.textSecondary}>
            Master your game with expert coaching
          </Text>
        </Animated.View>

        {/* AI Coach Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Pressable
            style={[styles.coachCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.coachAvatar, { backgroundColor: colors.primary }]}>
              <Ionicons name="sparkles" size={22} color="#FFF" />
            </View>
            <View style={styles.coachContent}>
              <Text variant="labelMedium" color={colors.textHeading}>
                AI Coach
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                Ask any golf question
              </Text>
            </View>
            <View style={[styles.coachButton, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="chatbubble" size={18} color={colors.primary} />
            </View>
          </Pressable>
        </Animated.View>

        {/* Continue Learning */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.section}>
          <Text variant="h3" color={colors.textHeading} style={styles.sectionTitle}>
            Continue Learning
          </Text>

          <Pressable style={styles.continueContainer} onPress={handleContinueLearning}>
            <LinearGradient
              colors={[colors.primary, '#FF9A33']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueCard}
            >
              <View style={styles.continueLeft}>
                <Badge label="IN PROGRESS" variant="neutral" size="small" />
                <Text variant="h4" color="#FFF" style={styles.continueTitle}>
                  {CONTINUE_LEARNING.title}
                </Text>
                <Text variant="caption" color="rgba(255,255,255,0.8)">
                  {CONTINUE_LEARNING.chapter}
                </Text>
                <View style={styles.continueProgress}>
                  <View style={styles.continueProgressBar}>
                    <View
                      style={[
                        styles.continueProgressFill,
                        { width: `${CONTINUE_LEARNING.progress}%` },
                      ]}
                    />
                  </View>
                  <Text variant="caption" color="rgba(255,255,255,0.8)">
                    {CONTINUE_LEARNING.duration}
                  </Text>
                </View>
              </View>
              <View style={styles.continuePlay}>
                <Ionicons name="play" size={28} color={colors.primary} />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Learning Paths */}
        <View style={styles.section}>
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.sectionHeader}>
            <Text variant="h3" color={colors.textHeading}>
              Learning Paths
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
            contentContainerStyle={styles.pathsScroll}
          >
            {LEARNING_PATHS.map((path, index) => (
              <PathCard
                key={path.id}
                path={path}
                index={index}
                onPress={() => handlePathPress(path.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Featured Drills */}
        <View style={styles.section}>
          <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.sectionHeader}>
            <Text variant="h3" color={colors.textHeading}>
              Featured Drills
            </Text>
            <Pressable>
              <Text variant="labelSmall" color={colors.primary}>
                See All
              </Text>
            </Pressable>
          </Animated.View>

          {FEATURED_DRILLS.map((drill, index) => (
            <DrillCard
              key={drill.id}
              drill={drill}
              index={index}
              colors={colors}
              onPress={() => handleDrillPress(drill.id)}
            />
          ))}
        </View>

        {/* Drill Categories */}
        <View style={styles.section}>
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <Text variant="h3" color={colors.textHeading} style={styles.sectionTitle}>
              Browse by Category
            </Text>
          </Animated.View>

          <View style={styles.categoriesRow}>
            {DRILL_CATEGORIES.map((category, index) => (
              <CategoryPill
                key={category.id}
                category={category}
                index={index}
                colors={colors}
                onPress={() => handleCategoryPress(category.id)}
              />
            ))}
          </View>
        </View>

        {/* Tip of the Day */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <View style={[styles.tipCard, { backgroundColor: colors.secondaryMuted }]}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={18} color={colors.secondary} />
              <Text variant="labelSmall" color={colors.secondary}>
                Tip of the Day
              </Text>
            </View>
            <Text variant="bodySmall" color={colors.textSecondary} style={styles.tipText}>
              "For consistent chip shots, keep your weight on your front foot throughout the swing and let the club do the work."
            </Text>
            <Text variant="caption" color={colors.textMuted}>
              — Joe Mayo
            </Text>
          </View>
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

  // Header
  header: {
    marginBottom: spacing[5],
  },

  // Coach Card
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing[6],
  },
  coachAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  coachContent: {
    flex: 1,
  },
  coachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Continue Learning
  continueContainer: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  continueLeft: {
    flex: 1,
  },
  continueTitle: {
    marginTop: spacing[2],
    marginBottom: spacing[1],
  },
  continueProgress: {
    marginTop: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  continueProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  continueProgressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  continuePlay: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing[3],
  },

  // Learning Paths
  pathsScroll: {
    paddingRight: spacing[4],
  },
  pathCardWrapper: {
    width: 140,
    marginRight: spacing[3],
  },
  pathCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  pathCardGradient: {
    padding: spacing[4],
    alignItems: 'flex-start',
    minHeight: 160,
  },
  pathIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  pathProgress: {
    width: '100%',
    marginTop: spacing[3],
  },
  pathProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginBottom: spacing[1],
  },
  pathProgressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },

  // Drill Cards
  drillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing[3],
  },
  drillIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  drillContent: {
    flex: 1,
  },
  drillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[1],
  },
  metricDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  drillArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Categories
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1,
  },

  // Tip Card
  tipCard: {
    padding: spacing[4],
    borderRadius: radius.lg,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  tipText: {
    marginBottom: spacing[2],
    lineHeight: 20,
  },
});

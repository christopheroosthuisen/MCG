/**
 * MCG Golf App - Learn Screen
 * Lessons, drills, and AI coaching
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
  GradientCard,
  PressableCard,
  Badge,
  DifficultyBadge,
  ProgressBar,
} from '@/components/ui';

export default function LearnScreen() {
  const { colors, gradients } = useTheme();
  const router = useRouter();

  // Featured lesson
  const featuredLesson = {
    id: '1',
    title: 'The Scoring Zone Masterclass',
    instructor: 'Joe Mayo',
    duration: '2.5 hrs',
    lessons: 8,
    progress: 37,
    difficulty: 'intermediate' as const,
  };

  // Learning paths
  const learningPaths = [
    {
      id: 'short-game',
      title: 'Short Game Mastery',
      description: '12 lessons to transform your scoring',
      progress: 45,
      icon: 'golf',
      color: colors.secondary,
    },
    {
      id: 'putting',
      title: 'Putting Fundamentals',
      description: 'Read greens and sink more putts',
      progress: 20,
      icon: 'ellipse',
      color: colors.info,
    },
    {
      id: 'full-swing',
      title: 'Full Swing Mechanics',
      description: 'Build a consistent, powerful swing',
      progress: 0,
      icon: 'flash',
      color: colors.primary,
    },
  ];

  // Drill categories
  const drillCategories = [
    { id: 'chipping', name: 'Chipping', count: 24, icon: 'golf-outline' },
    { id: 'pitching', name: 'Pitching', count: 18, icon: 'resize-outline' },
    { id: 'bunker', name: 'Bunker', count: 12, icon: 'layers-outline' },
    { id: 'putting', name: 'Putting', count: 32, icon: 'ellipse-outline' },
    { id: 'tempo', name: 'Tempo', count: 15, icon: 'pulse-outline' },
    { id: 'alignment', name: 'Alignment', count: 10, icon: 'git-merge-outline' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="displaySmall" color={colors.textHeading}>Learn</Text>
          <Text variant="bodyMedium" color={colors.textSecondary}>
            Master your game with Joe Mayo's expertise
          </Text>
        </View>

        {/* AI Coach Quick Access */}
        <Card variant="elevated" style={styles.coachCard}>
          <View style={styles.coachHeader}>
            <View style={[styles.coachAvatar, { backgroundColor: colors.primary }]}>
              <Ionicons name="sparkles" size={24} color="#FFF" />
            </View>
            <View style={styles.coachInfo}>
              <Text variant="h4">AI Coach</Text>
              <Text variant="caption" color={colors.textMuted}>
                Get personalized guidance
              </Text>
            </View>
            <Button
              label="Chat"
              variant="primary"
              size="small"
              rightIcon={<Ionicons name="chatbubble" size={16} color="#FFF" />}
            />
          </View>
        </Card>

        {/* Featured Course */}
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>Continue Learning</Text>

          <GradientCard style={styles.featuredCard}>
            <View style={styles.featuredHeader}>
              <Badge label="FEATURED COURSE" variant="neutral" size="small" />
              <DifficultyBadge level={featuredLesson.difficulty} />
            </View>

            <Text variant="h2" color="#FFFFFF" style={styles.featuredTitle}>
              {featuredLesson.title}
            </Text>

            <View style={styles.featuredMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="person" size={14} color="rgba(255,255,255,0.7)" />
                <Text variant="caption" color="rgba(255,255,255,0.7)">{featuredLesson.instructor}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time" size={14} color="rgba(255,255,255,0.7)" />
                <Text variant="caption" color="rgba(255,255,255,0.7)">{featuredLesson.duration}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="book" size={14} color="rgba(255,255,255,0.7)" />
                <Text variant="caption" color="rgba(255,255,255,0.7)">{featuredLesson.lessons} lessons</Text>
              </View>
            </View>

            <View style={styles.featuredProgress}>
              <ProgressBar progress={featuredLesson.progress} variant="gradient" size="small" />
              <Text variant="caption" color="rgba(255,255,255,0.7)" style={styles.progressText}>
                {featuredLesson.progress}% Complete
              </Text>
            </View>

            <Button
              label="Continue Lesson 3"
              variant="primary"
              size="medium"
              rightIcon={<Ionicons name="play" size={18} color="#FFF" />}
            />
          </GradientCard>
        </View>

        {/* Learning Paths */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h2">Learning Paths</Text>
            <Button label="View All" variant="ghost" size="small" />
          </View>

          {learningPaths.map((path) => (
            <PressableCard
              key={path.id}
              variant="elevated"
              padding={4}
              style={styles.pathCard}
            >
              <View style={[styles.pathIcon, { backgroundColor: `${path.color}15` }]}>
                <Ionicons name={path.icon as any} size={28} color={path.color} />
              </View>
              <View style={styles.pathContent}>
                <Text variant="h4">{path.title}</Text>
                <Text variant="caption" color={colors.textMuted}>{path.description}</Text>
                <View style={styles.pathProgress}>
                  <ProgressBar
                    progress={path.progress}
                    variant={path.progress > 0 ? 'primary' : 'gradient'}
                    size="small"
                  />
                  <Text variant="caption" color={colors.textMuted}>{path.progress}%</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </PressableCard>
          ))}
        </View>

        {/* Drill Library */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h2">Drill Library</Text>
            <Button label="Browse All" variant="ghost" size="small" />
          </View>

          <View style={styles.drillsGrid}>
            {drillCategories.map((category) => (
              <PressableCard
                key={category.id}
                variant="outlined"
                padding={4}
                style={styles.drillCategory}
              >
                <Ionicons name={category.icon as any} size={24} color={colors.primary} />
                <Text variant="labelMedium" style={styles.drillCategoryName}>
                  {category.name}
                </Text>
                <Text variant="caption" color={colors.textMuted}>
                  {category.count} drills
                </Text>
              </PressableCard>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <Card variant="filled" style={styles.tipCard}>
          <View style={[styles.tipIcon, { backgroundColor: colors.warningLight }]}>
            <Ionicons name="bulb" size={24} color={colors.warning} />
          </View>
          <View style={styles.tipContent}>
            <Text variant="h4">Tip of the Day</Text>
            <Text variant="bodySmall" color={colors.textSecondary}>
              "For consistent chip shots, keep your weight on your front foot throughout the swing and let the club do the work."
            </Text>
            <Text variant="caption" color={colors.textMuted} style={styles.tipAuthor}>
              — Joe Mayo
            </Text>
          </View>
        </Card>
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

  // Header
  header: {
    marginBottom: spacing[6],
  },

  // Coach Card
  coachCard: {
    marginBottom: spacing[6],
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  coachInfo: {
    flex: 1,
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

  // Featured Card
  featuredCard: {
    paddingVertical: spacing[6],
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  featuredTitle: {
    marginBottom: spacing[3],
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  featuredProgress: {
    marginBottom: spacing[4],
  },
  progressText: {
    marginTop: spacing[2],
  },

  // Path Cards
  pathCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  pathIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  pathContent: {
    flex: 1,
  },
  pathProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },

  // Drills Grid
  drillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  drillCategory: {
    width: '31%',
    alignItems: 'center',
  },
  drillCategoryName: {
    marginTop: spacing[2],
    marginBottom: spacing[0.5],
  },

  // Tip Card
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  tipContent: {
    flex: 1,
  },
  tipAuthor: {
    marginTop: spacing[2],
    fontStyle: 'italic',
  },
});

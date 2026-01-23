/**
 * MCG Golf App - Lesson Detail Screen
 * View lesson content with chapters and video
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
  PressableCard,
} from '@/components/ui';
import { Lesson, LessonChapter } from '@/types/golf';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sample lessons data (would come from API/store)
const SAMPLE_LESSONS: Record<string, Lesson> = {
  'lesson-1': {
    id: 'lesson-1',
    title: 'Mastering the Chip Shot',
    description:
      'Learn the fundamentals of chipping to consistently get up and down from around the green. This lesson covers setup, technique, and club selection.',
    category: 'chipping',
    difficulty: 'beginner',
    duration: 25,
    instructor: {
      id: 'joe-mayo',
      name: 'Joe Mayo',
      title: 'TrackMan Maestro & PGA Instructor',
      bio: '20+ years of teaching experience with TrackMan certification.',
      avatarUrl: '',
      credentials: ['PGA Professional', 'TrackMan Certified', 'TPI Certified'],
    },
    chapters: [
      {
        id: 'ch-1',
        title: 'Introduction to Chipping',
        duration: 4,
        videoUrl: '',
      },
      {
        id: 'ch-2',
        title: 'The Setup Position',
        duration: 6,
        videoUrl: '',
        drills: ['drill-chip-setup'],
      },
      {
        id: 'ch-3',
        title: 'Club Selection Strategy',
        duration: 5,
        videoUrl: '',
      },
      {
        id: 'ch-4',
        title: 'Stroke Technique',
        duration: 7,
        videoUrl: '',
        drills: ['drill-chip-stroke', 'drill-tempo'],
      },
      {
        id: 'ch-5',
        title: 'Practice Drills & Wrap Up',
        duration: 3,
        videoUrl: '',
        drills: ['drill-chip-ladder', 'drill-chip-clock'],
      },
    ],
    thumbnailUrl: '',
    isPremium: false,
    rating: 4.8,
    reviewCount: 324,
  },
  'lesson-hip-sequence': {
    id: 'lesson-hip-sequence',
    title: 'Hip Rotation Sequencing',
    description:
      'Understand how proper hip rotation creates power and consistency in your swing. Learn the correct sequence from address through impact.',
    category: 'rotation',
    difficulty: 'intermediate',
    duration: 30,
    instructor: {
      id: 'joe-mayo',
      name: 'Joe Mayo',
      title: 'TrackMan Maestro & PGA Instructor',
      bio: '20+ years of teaching experience with TrackMan certification.',
      avatarUrl: '',
      credentials: ['PGA Professional', 'TrackMan Certified', 'TPI Certified'],
    },
    chapters: [
      {
        id: 'ch-1',
        title: 'Why Hip Rotation Matters',
        duration: 5,
        videoUrl: '',
      },
      {
        id: 'ch-2',
        title: 'Understanding the Kinetic Chain',
        duration: 6,
        videoUrl: '',
      },
      {
        id: 'ch-3',
        title: 'The Backswing Hip Turn',
        duration: 6,
        videoUrl: '',
        drills: ['drill-hip-rotation'],
      },
      {
        id: 'ch-4',
        title: 'Initiating the Downswing',
        duration: 8,
        videoUrl: '',
        drills: ['drill-bump-turn', 'drill-hip-lead'],
      },
      {
        id: 'ch-5',
        title: 'Common Faults & Fixes',
        duration: 5,
        videoUrl: '',
      },
    ],
    thumbnailUrl: '',
    isPremium: false,
    rating: 4.9,
    reviewCount: 189,
  },
};

export default function LessonDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id, fromAnalysis, chapterId } = useLocalSearchParams<{
    id: string;
    fromAnalysis?: string;
    chapterId?: string;
  }>();

  const [currentChapterIndex, setCurrentChapterIndex] = useState(
    chapterId ? parseInt(chapterId, 10) : 0
  );
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Get lesson data
  const lesson = SAMPLE_LESSONS[id] || SAMPLE_LESSONS['lesson-1'];
  const currentChapter = lesson.chapters[currentChapterIndex];

  // Calculate progress
  const progress = lesson.chapters.length > 0
    ? Math.round((completedChapters.length / lesson.chapters.length) * 100)
    : 0;

  // Total duration watched
  const watchedDuration = lesson.chapters
    .filter((ch) => completedChapters.includes(ch.id))
    .reduce((sum, ch) => sum + ch.duration, 0);

  // Handle chapter completion
  const handleCompleteChapter = useCallback(() => {
    if (!completedChapters.includes(currentChapter.id)) {
      setCompletedChapters([...completedChapters, currentChapter.id]);
    }
    // Auto-advance to next chapter
    if (currentChapterIndex < lesson.chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  }, [currentChapter, completedChapters, currentChapterIndex, lesson.chapters.length]);

  // Navigate to drill
  const handleDrillPress = useCallback(
    (drillId: string) => {
      router.push({
        pathname: '/learn/drill/[id]',
        params: { id: drillId, fromAnalysis: fromAnalysis },
      });
    },
    [router, fromAnalysis]
  );

  // Select chapter
  const handleChapterSelect = useCallback((index: number) => {
    setCurrentChapterIndex(index);
    setIsPlaying(true);
  }, []);

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
            label={lesson.category.replace('-', ' ').toUpperCase()}
            variant="neutral"
            size="small"
          />
        </View>
        <Button
          label=""
          variant="ghost"
          size="small"
          leftIcon={<Ionicons name="share-outline" size={24} color={colors.textHeading} />}
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

        {/* Video Player Placeholder */}
        <Card variant="elevated" style={styles.videoContainer}>
          <View style={[styles.videoPlayer, { backgroundColor: colors.backgroundTertiary }]}>
            <Ionicons name="play-circle" size={64} color={colors.textMuted} />
            <Text variant="labelMedium" color={colors.textMuted} style={styles.videoPlaceholderText}>
              Video Coming Soon
            </Text>
          </View>
          <View style={styles.videoControls}>
            <Text variant="caption" color={colors.textMuted}>
              Chapter {currentChapterIndex + 1}: {currentChapter.title}
            </Text>
            <Text variant="caption" color={colors.textMuted}>
              {currentChapter.duration} min
            </Text>
          </View>
        </Card>

        {/* Lesson Info */}
        <View style={styles.lessonInfo}>
          <Text variant="h1" color={colors.textHeading}>
            {lesson.title}
          </Text>
          <View style={styles.metaRow}>
            <DifficultyBadge level={lesson.difficulty} />
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={colors.textMuted} />
              <Text variant="caption" color={colors.textMuted}>{lesson.duration} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <Text variant="caption" color={colors.textMuted}>
                {lesson.rating} ({lesson.reviewCount})
              </Text>
            </View>
          </View>
        </View>

        {/* Instructor */}
        <Card variant="outlined" style={styles.instructorCard}>
          <View style={[styles.instructorAvatar, { backgroundColor: colors.primary }]}>
            <Text variant="h3" color="#FFF">
              {lesson.instructor.name.charAt(0)}
            </Text>
          </View>
          <View style={styles.instructorInfo}>
            <Text variant="h4">{lesson.instructor.name}</Text>
            <Text variant="caption" color={colors.textMuted}>
              {lesson.instructor.title}
            </Text>
          </View>
        </Card>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text variant="labelMedium" color={colors.textHeading}>Your Progress</Text>
            <Text variant="labelMedium" color={colors.primary}>{progress}%</Text>
          </View>
          <ProgressBar progress={progress} variant="primary" size="medium" />
          <Text variant="caption" color={colors.textMuted} style={styles.progressDetail}>
            {watchedDuration} of {lesson.duration} minutes watched
          </Text>
        </View>

        {/* Description */}
        <Text variant="bodyMedium" color={colors.textSecondary} style={styles.description}>
          {lesson.description}
        </Text>

        {/* Chapters */}
        <View style={styles.chaptersSection}>
          <Text variant="h2" style={styles.sectionTitle}>
            Chapters ({lesson.chapters.length})
          </Text>

          {lesson.chapters.map((chapter, index) => {
            const isCompleted = completedChapters.includes(chapter.id);
            const isCurrent = currentChapterIndex === index;

            return (
              <PressableCard
                key={chapter.id}
                variant={isCurrent ? 'elevated' : 'outlined'}
                padding={4}
                style={[
                  styles.chapterCard,
                  isCurrent && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => handleChapterSelect(index)}
              >
                <View style={styles.chapterLeft}>
                  <View
                    style={[
                      styles.chapterNumber,
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
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    ) : (
                      <Text variant="caption" color={isCurrent ? '#FFF' : colors.textMuted}>
                        {index + 1}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.chapterContent}>
                  <Text variant="labelMedium" color={colors.textHeading}>
                    {chapter.title}
                  </Text>
                  <View style={styles.chapterMeta}>
                    <Text variant="caption" color={colors.textMuted}>
                      {chapter.duration} min
                    </Text>
                    {chapter.drills && chapter.drills.length > 0 && (
                      <Badge
                        label={`${chapter.drills.length} Drill${chapter.drills.length > 1 ? 's' : ''}`}
                        variant="info"
                        size="small"
                      />
                    )}
                  </View>
                </View>

                <Ionicons
                  name={isCurrent ? 'pause-circle' : 'play-circle'}
                  size={32}
                  color={isCurrent ? colors.primary : colors.textMuted}
                />
              </PressableCard>
            );
          })}
        </View>

        {/* Related Drills for Current Chapter */}
        {currentChapter.drills && currentChapter.drills.length > 0 && (
          <View style={styles.drillsSection}>
            <Text variant="h2" style={styles.sectionTitle}>
              Practice Drills
            </Text>
            <Text variant="bodySmall" color={colors.textSecondary} style={styles.drillsSubtitle}>
              Reinforce what you learned in this chapter
            </Text>

            {currentChapter.drills.map((drillId) => (
              <PressableCard
                key={drillId}
                variant="outlined"
                padding={4}
                style={styles.drillCard}
                onPress={() => handleDrillPress(drillId)}
              >
                <View style={[styles.drillIcon, { backgroundColor: colors.secondaryMuted }]}>
                  <Ionicons name="fitness" size={24} color={colors.secondary} />
                </View>
                <View style={styles.drillContent}>
                  <Text variant="labelMedium" color={colors.textHeading}>
                    Related Drill
                  </Text>
                  <Text variant="caption" color={colors.textMuted}>
                    Tap to view and practice
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </PressableCard>
            ))}
          </View>
        )}

        {/* Mark Complete Button */}
        {!completedChapters.includes(currentChapter.id) && (
          <Button
            label="Mark Chapter Complete"
            variant="primary"
            size="large"
            rightIcon={<Ionicons name="checkmark-circle" size={20} color="#FFF" />}
            onPress={handleCompleteChapter}
            style={styles.completeButton}
          />
        )}
      </ScrollView>
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

  // Video
  videoContainer: {
    marginBottom: spacing[6],
    padding: 0,
    overflow: 'hidden',
  },
  videoPlayer: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderText: {
    marginTop: spacing[2],
  },
  videoControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing[3],
  },

  // Lesson info
  lessonInfo: {
    marginBottom: spacing[4],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginTop: spacing[3],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },

  // Instructor
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  instructorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  instructorInfo: {
    flex: 1,
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
  progressDetail: {
    marginTop: spacing[2],
  },

  // Description
  description: {
    marginBottom: spacing[6],
    lineHeight: 22,
  },

  // Chapters
  chaptersSection: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    marginBottom: spacing[4],
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  chapterLeft: {
    marginRight: spacing[3],
  },
  chapterNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterContent: {
    flex: 1,
  },
  chapterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginTop: spacing[1],
  },

  // Drills
  drillsSection: {
    marginBottom: spacing[6],
  },
  drillsSubtitle: {
    marginBottom: spacing[4],
    marginTop: -spacing[2],
  },
  drillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  drillIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  drillContent: {
    flex: 1,
  },

  // Complete button
  completeButton: {
    marginTop: spacing[4],
  },
});

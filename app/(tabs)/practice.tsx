/**
 * MCG Golf App - Practice Screen
 * Hub for starting practice sessions and tracking progress
 */

import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
} from '@/components/ui';

export default function PracticeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const practiceTypes = [
    {
      id: 'short-game',
      title: 'Short Game',
      description: 'Chips, pitches, and bunker shots',
      icon: 'golf',
      color: colors.secondary,
      bgColor: colors.secondaryMuted,
    },
    {
      id: 'putting',
      title: 'Putting',
      description: 'Green reading and stroke mechanics',
      icon: 'ellipse-outline',
      color: colors.info,
      bgColor: colors.infoLight,
    },
    {
      id: 'full-swing',
      title: 'Full Swing',
      description: 'Driver through wedges',
      icon: 'flash',
      color: colors.primary,
      bgColor: colors.primaryMuted,
    },
    {
      id: 'specific-drill',
      title: 'Specific Drill',
      description: 'Choose from drill library',
      icon: 'list',
      color: colors.textSecondary,
      bgColor: colors.backgroundSecondary,
    },
  ];

  const recentSessions = [
    {
      id: '1',
      type: 'Short Game',
      date: 'Today',
      duration: '45 min',
      shots: 62,
      avgScore: 84,
    },
    {
      id: '2',
      type: 'Putting',
      date: 'Yesterday',
      duration: '30 min',
      shots: 45,
      avgScore: 78,
    },
    {
      id: '3',
      type: 'Full Swing',
      date: '2 days ago',
      duration: '60 min',
      shots: 85,
      avgScore: 81,
    },
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
          <Text variant="displaySmall" color={colors.textHeading}>Practice</Text>
          <Text variant="bodyMedium" color={colors.textSecondary}>
            Choose your focus area and start improving
          </Text>
        </View>

        {/* Weekly Goal */}
        <Card variant="elevated" style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Ionicons name="flag" size={24} color={colors.primary} />
            <Text variant="h4">Weekly Goal</Text>
          </View>
          <Text variant="bodySmall" color={colors.textSecondary} style={styles.goalText}>
            Practice 5 hours this week
          </Text>
          <ProgressBar progress={65} variant="gradient" size="medium" showLabel />
          <Text variant="caption" color={colors.textMuted} style={styles.goalSubtext}>
            3.25 / 5 hours completed
          </Text>
        </Card>

        {/* Practice Types */}
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>Start Session</Text>

          <View style={styles.practiceGrid}>
            {practiceTypes.map((type) => (
              <PressableCard
                key={type.id}
                variant="elevated"
                padding={4}
                style={styles.practiceCard}
                onPress={() => {
                  // Navigate to session setup
                }}
              >
                <View style={[styles.practiceIcon, { backgroundColor: type.bgColor }]}>
                  <Ionicons name={type.icon as any} size={28} color={type.color} />
                </View>
                <Text variant="h4" style={styles.practiceTitle}>{type.title}</Text>
                <Text variant="caption" color={colors.textMuted} style={styles.practiceDesc}>
                  {type.description}
                </Text>
              </PressableCard>
            ))}
          </View>
        </View>

        {/* Quick Start */}
        <GradientCard style={styles.quickStartCard}>
          <View style={styles.quickStartContent}>
            <Text variant="h3" color="#FFFFFF">Quick Practice</Text>
            <Text variant="bodySmall" color="rgba(255,255,255,0.8)">
              AI-selected drills based on your recent performance
            </Text>
          </View>
          <Button
            label="Start Now"
            variant="primary"
            size="medium"
            rightIcon={<Ionicons name="play" size={18} color="#FFF" />}
          />
        </GradientCard>

        {/* Recent Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h2">Recent Sessions</Text>
            <Button label="View All" variant="ghost" size="small" />
          </View>

          {recentSessions.map((session) => (
            <PressableCard
              key={session.id}
              variant="outlined"
              padding={4}
              style={styles.sessionCard}
            >
              <View style={styles.sessionHeader}>
                <View>
                  <Text variant="h4">{session.type}</Text>
                  <Text variant="caption" color={colors.textMuted}>{session.date}</Text>
                </View>
                <Badge label={`Score: ${session.avgScore}`} variant="success" size="small" />
              </View>

              <View style={styles.sessionStats}>
                <View style={styles.sessionStat}>
                  <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                  <Text variant="bodySmall" color={colors.textSecondary}>{session.duration}</Text>
                </View>
                <View style={styles.sessionStat}>
                  <Ionicons name="golf-outline" size={16} color={colors.textMuted} />
                  <Text variant="bodySmall" color={colors.textSecondary}>{session.shots} shots</Text>
                </View>
              </View>
            </PressableCard>
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
    paddingBottom: spacing[8],
  },

  // Header
  header: {
    marginBottom: spacing[6],
  },

  // Goal Card
  goalCard: {
    marginBottom: spacing[6],
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  goalText: {
    marginBottom: spacing[3],
  },
  goalSubtext: {
    marginTop: spacing[2],
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
  practiceCard: {
    width: '47%',
    alignItems: 'center',
  },
  practiceIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  practiceTitle: {
    marginBottom: spacing[1],
    textAlign: 'center',
  },
  practiceDesc: {
    textAlign: 'center',
  },

  // Quick Start
  quickStartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
  },
  quickStartContent: {
    flex: 1,
    marginRight: spacing[4],
  },

  // Session Cards
  sessionCard: {
    marginBottom: spacing[3],
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  sessionStats: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  sessionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
});

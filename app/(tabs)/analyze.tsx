/**
 * MCG Golf App - Analyze Screen
 * Video analysis hub with TrackMan-style metrics
 */

import { ScrollView, View, StyleSheet, Image } from 'react-native';
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
  MetricCard,
  ScoreRing,
  ProgressBar,
} from '@/components/ui';

export default function AnalyzeScreen() {
  const { colors, gradients } = useTheme();
  const router = useRouter();

  // Sample recent analyses
  const recentAnalyses = [
    {
      id: '1',
      club: '7 Iron',
      score: 85,
      date: 'Today',
      thumbnail: null,
      metrics: {
        clubSpeed: 87.2,
        ballSpeed: 112.5,
        launchAngle: 18.2,
        spinRate: 6240,
      },
    },
    {
      id: '2',
      club: 'Pitching Wedge',
      score: 92,
      date: 'Today',
      thumbnail: null,
      metrics: {
        clubSpeed: 72.1,
        ballSpeed: 94.8,
        launchAngle: 28.4,
        spinRate: 8920,
      },
    },
    {
      id: '3',
      club: 'Driver',
      score: 78,
      date: 'Yesterday',
      thumbnail: null,
      metrics: {
        clubSpeed: 108.5,
        ballSpeed: 158.2,
        launchAngle: 12.8,
        spinRate: 2840,
      },
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
          <Text variant="displaySmall" color={colors.textHeading}>Analyze</Text>
          <Text variant="bodyMedium" color={colors.textSecondary}>
            Record and analyze your swing with AI
          </Text>
        </View>

        {/* Record New Swing CTA */}
        <GradientCard style={styles.recordCard}>
          <View style={styles.recordIcon}>
            <Ionicons name="videocam" size={48} color="rgba(255,255,255,0.9)" />
          </View>
          <View style={styles.recordContent}>
            <Text variant="h2" color="#FFFFFF">Record New Swing</Text>
            <Text variant="bodySmall" color="rgba(255,255,255,0.8)" style={styles.recordDesc}>
              Get instant AI feedback with pose tracking and TrackMan-style metrics
            </Text>
            <Button
              label="Start Recording"
              variant="primary"
              size="large"
              fullWidth
              rightIcon={<Ionicons name="camera" size={20} color="#FFF" />}
            />
          </View>
        </GradientCard>

        {/* Analysis Features */}
        <View style={styles.featuresRow}>
          <Card variant="filled" padding={3} style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="body" size={24} color={colors.primary} />
            </View>
            <Text variant="labelSmall" color={colors.textSecondary}>Pose Tracking</Text>
          </Card>

          <Card variant="filled" padding={3} style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: colors.secondaryMuted }]}>
              <Ionicons name="speedometer" size={24} color={colors.secondary} />
            </View>
            <Text variant="labelSmall" color={colors.textSecondary}>Speed Data</Text>
          </Card>

          <Card variant="filled" padding={3} style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: colors.infoLight }]}>
              <Ionicons name="git-compare" size={24} color={colors.info} />
            </View>
            <Text variant="labelSmall" color={colors.textSecondary}>Compare</Text>
          </Card>

          <Card variant="filled" padding={3} style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="analytics" size={24} color={colors.warning} />
            </View>
            <Text variant="labelSmall" color={colors.textSecondary}>Trends</Text>
          </Card>
        </View>

        {/* Recent Analyses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h2">Recent Analyses</Text>
            <Button label="View All" variant="ghost" size="small" />
          </View>

          {recentAnalyses.map((analysis) => (
            <PressableCard
              key={analysis.id}
              variant="elevated"
              padding={0}
              style={styles.analysisCard}
            >
              {/* Thumbnail / Video Preview */}
              <View style={[styles.analysisThumbnail, { backgroundColor: colors.backgroundTertiary }]}>
                <Ionicons name="play-circle" size={40} color={colors.textMuted} />
                <Badge
                  label={analysis.club}
                  variant="neutral"
                  size="small"
                  style={styles.clubBadge}
                />
              </View>

              {/* Analysis Info */}
              <View style={styles.analysisContent}>
                <View style={styles.analysisHeader}>
                  <View>
                    <Text variant="h4">{analysis.club}</Text>
                    <Text variant="caption" color={colors.textMuted}>{analysis.date}</Text>
                  </View>
                  <ScoreRing score={analysis.score} size={50} />
                </View>

                {/* Key Metrics */}
                <View style={styles.metricsRow}>
                  <MetricItem
                    label="Club Speed"
                    value={analysis.metrics.clubSpeed.toFixed(1)}
                    unit="mph"
                    colors={colors}
                  />
                  <MetricItem
                    label="Ball Speed"
                    value={analysis.metrics.ballSpeed.toFixed(1)}
                    unit="mph"
                    colors={colors}
                  />
                  <MetricItem
                    label="Launch"
                    value={analysis.metrics.launchAngle.toFixed(1)}
                    unit="°"
                    colors={colors}
                  />
                  <MetricItem
                    label="Spin"
                    value={Math.round(analysis.metrics.spinRate).toString()}
                    unit="rpm"
                    colors={colors}
                  />
                </View>
              </View>
            </PressableCard>
          ))}
        </View>

        {/* Swing Positions Section */}
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>Swing Positions</Text>
          <Text variant="bodySmall" color={colors.textSecondary} style={styles.sectionDesc}>
            We analyze 8 key positions in your swing
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.positionsScroll}
          >
            {['Address', 'Takeaway', 'Backswing', 'Top', 'Downswing', 'Impact', 'Follow Through', 'Finish'].map(
              (position, index) => (
                <Card
                  key={position}
                  variant="outlined"
                  padding={3}
                  style={styles.positionCard}
                >
                  <View style={[styles.positionNumber, { backgroundColor: colors.primaryMuted }]}>
                    <Text variant="labelSmall" color={colors.primary}>{index + 1}</Text>
                  </View>
                  <Text variant="caption" color={colors.textSecondary} style={styles.positionLabel}>
                    {position}
                  </Text>
                </Card>
              )
            )}
          </ScrollView>
        </View>

        {/* Import Video Option */}
        <Card variant="outlined" style={styles.importCard}>
          <Ionicons name="cloud-upload-outline" size={32} color={colors.textMuted} />
          <View style={styles.importContent}>
            <Text variant="h4">Import Video</Text>
            <Text variant="caption" color={colors.textMuted}>
              Analyze videos from your camera roll
            </Text>
          </View>
          <Button label="Import" variant="outline" size="small" />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// Metric Item Component
function MetricItem({
  label,
  value,
  unit,
  colors,
}: {
  label: string;
  value: string;
  unit: string;
  colors: any;
}) {
  return (
    <View style={styles.metricItem}>
      <Text variant="metricSmall" color={colors.textHeading}>{value}</Text>
      <Text variant="caption" color={colors.textMuted}>{unit}</Text>
      <Text variant="caption" color={colors.textMuted}>{label}</Text>
    </View>
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

  // Record Card
  recordCard: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  recordIcon: {
    marginBottom: spacing[4],
  },
  recordContent: {
    alignItems: 'center',
    width: '100%',
  },
  recordDesc: {
    textAlign: 'center',
    marginVertical: spacing[3],
  },

  // Features Row
  featuresRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },

  // Sections
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    marginBottom: spacing[2],
  },
  sectionDesc: {
    marginBottom: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },

  // Analysis Card
  analysisCard: {
    marginBottom: spacing[4],
    overflow: 'hidden',
  },
  analysisThumbnail: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  clubBadge: {
    position: 'absolute',
    top: spacing[2],
    left: spacing[2],
  },
  analysisContent: {
    padding: spacing[4],
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },

  // Metrics Row
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
  },

  // Positions Scroll
  positionsScroll: {
    paddingRight: spacing[4],
  },
  positionCard: {
    alignItems: 'center',
    marginRight: spacing[2],
    minWidth: 80,
  },
  positionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  positionLabel: {
    textAlign: 'center',
  },

  // Import Card
  importCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  importContent: {
    flex: 1,
  },
});

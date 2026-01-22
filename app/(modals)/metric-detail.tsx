/**
 * MCG Golf App - Metric Detail Modal
 * Detailed view of a specific metric with history and insights
 */

import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius } from '@/design';
import { Text, Button, Card, Badge, ProgressBar } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Metric definitions
const METRIC_INFO: Record<string, {
  name: string;
  unit: string;
  description: string;
  idealRange: { min: number; max: number };
  tips: string[];
  category: string;
}> = {
  'ball-speed': {
    name: 'Ball Speed',
    unit: 'mph',
    description: 'The speed of the ball immediately after impact. Higher ball speed generally leads to more distance.',
    idealRange: { min: 140, max: 180 },
    tips: [
      'Focus on solid contact in the center of the face',
      'Increase clubhead speed through better rotation',
      'Check your equipment for proper fitting',
    ],
    category: 'Ball Data',
  },
  'launch-angle': {
    name: 'Launch Angle',
    unit: '°',
    description: 'The vertical angle at which the ball leaves the clubface. Optimal launch varies by club.',
    idealRange: { min: 10, max: 15 },
    tips: [
      'Ball position affects launch - forward = higher',
      'Attack angle influences launch angle',
      'Loft at impact is the primary factor',
    ],
    category: 'Ball Data',
  },
  'spin-rate': {
    name: 'Spin Rate',
    unit: 'rpm',
    description: 'The rate at which the ball spins after impact. Affects trajectory and stopping power.',
    idealRange: { min: 2200, max: 2800 },
    tips: [
      'Clean grooves help maintain consistent spin',
      'Strike location affects spin significantly',
      'Ball type influences spin characteristics',
    ],
    category: 'Ball Data',
  },
  'club-speed': {
    name: 'Club Speed',
    unit: 'mph',
    description: 'The speed of the clubhead at impact. Primary driver of distance potential.',
    idealRange: { min: 95, max: 115 },
    tips: [
      'Proper sequencing maximizes speed',
      'Grip pressure affects speed - lighter is often better',
      'Physical conditioning improves speed over time',
    ],
    category: 'Club Data',
  },
  'smash-factor': {
    name: 'Smash Factor',
    unit: '',
    description: 'The ratio of ball speed to club speed. Measures efficiency of energy transfer.',
    idealRange: { min: 1.45, max: 1.50 },
    tips: [
      'Center contact maximizes smash factor',
      'Driver max is around 1.50, irons lower',
      'Consistent smash factor = consistent distance',
    ],
    category: 'Impact',
  },
  'attack-angle': {
    name: 'Attack Angle',
    unit: '°',
    description: 'The vertical direction the club is moving at impact. Positive = up, negative = down.',
    idealRange: { min: -4, max: 4 },
    tips: [
      'Driver: slightly positive (+2 to +5)',
      'Irons: slightly negative (-2 to -5)',
      'Ball position affects attack angle',
    ],
    category: 'Club Data',
  },
  'club-path': {
    name: 'Club Path',
    unit: '°',
    description: 'The horizontal direction the club is moving at impact relative to target line.',
    idealRange: { min: -3, max: 3 },
    tips: [
      'Inside-out path tends to create draws',
      'Outside-in path tends to create fades',
      'Path combined with face angle determines curve',
    ],
    category: 'Club Data',
  },
  'face-angle': {
    name: 'Face Angle',
    unit: '°',
    description: 'The direction the clubface is pointing at impact relative to target line.',
    idealRange: { min: -2, max: 2 },
    tips: [
      'Face angle is primary factor in starting direction',
      'Grip affects face angle significantly',
      'Check alignment regularly',
    ],
    category: 'Club Data',
  },
};

// Sample history data
const generateHistory = (current: number) => {
  const history = [];
  for (let i = 6; i >= 0; i--) {
    history.push({
      date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
      value: current + (Math.random() - 0.5) * current * 0.1,
    });
  }
  return history;
};

export default function MetricDetailModal() {
  const { colors } = useTheme();
  const router = useRouter();
  const { metricId, value, previousValue } = useLocalSearchParams<{
    metricId: string;
    value: string;
    previousValue?: string;
  }>();

  const metric = METRIC_INFO[metricId || 'ball-speed'];
  const currentValue = parseFloat(value || '0');
  const prevValue = previousValue ? parseFloat(previousValue) : undefined;
  const change = prevValue ? ((currentValue - prevValue) / prevValue) * 100 : undefined;

  // Generate mock history
  const history = useMemo(() => generateHistory(currentValue), [currentValue]);

  // Calculate where value falls in ideal range
  const rangePosition = useMemo(() => {
    if (!metric) return 50;
    const { min, max } = metric.idealRange;
    const range = max - min;
    const position = ((currentValue - min) / range) * 100;
    return Math.max(0, Math.min(100, position));
  }, [metric, currentValue]);

  const isInIdealRange = metric
    ? currentValue >= metric.idealRange.min && currentValue <= metric.idealRange.max
    : true;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textHeading} />
          </Pressable>
        </View>
        <Text variant="h3" color={colors.textHeading}>
          {metric?.name || 'Metric Detail'}
        </Text>
        <View style={styles.headerRight}>
          <Badge label={metric?.category || 'Data'} variant="neutral" size="small" />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Value */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.valueSection}>
          <View style={styles.mainValue}>
            <Text variant="metricLarge" color={colors.primary} style={styles.valueText}>
              {currentValue.toFixed(metric?.unit === '' ? 2 : 0)}
            </Text>
            <Text variant="h4" color={colors.textMuted}>
              {metric?.unit}
            </Text>
          </View>

          {/* Change indicator */}
          {change !== undefined && (
            <View style={styles.changeRow}>
              <Ionicons
                name={change >= 0 ? 'trending-up' : 'trending-down'}
                size={20}
                color={change >= 0 ? colors.success : colors.error}
              />
              <Text
                variant="labelMedium"
                color={change >= 0 ? colors.success : colors.error}
              >
                {change >= 0 ? '+' : ''}{change.toFixed(1)}% from last session
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Ideal Range */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Card variant="outlined" style={styles.rangeCard}>
            <View style={styles.rangeHeader}>
              <Text variant="labelMedium" color={colors.textHeading}>
                Ideal Range
              </Text>
              <Badge
                label={isInIdealRange ? 'In Range' : 'Out of Range'}
                variant={isInIdealRange ? 'success' : 'warning'}
                size="small"
              />
            </View>

            <View style={styles.rangeBar}>
              <View style={[styles.rangeTrack, { backgroundColor: colors.backgroundSecondary }]}>
                <View
                  style={[
                    styles.idealZone,
                    { backgroundColor: colors.successLight },
                  ]}
                />
                <View
                  style={[
                    styles.currentMarker,
                    {
                      left: `${rangePosition}%`,
                      backgroundColor: isInIdealRange ? colors.success : colors.warning,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.rangeLabels}>
              <Text variant="caption" color={colors.textMuted}>
                {metric?.idealRange.min}{metric?.unit}
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                {metric?.idealRange.max}{metric?.unit}
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Card variant="filled" style={styles.descriptionCard}>
            <Ionicons name="information-circle" size={20} color={colors.info} />
            <Text variant="bodySmall" color={colors.textSecondary} style={styles.descriptionText}>
              {metric?.description}
            </Text>
          </Card>
        </Animated.View>

        {/* History Chart (simplified) */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.historySection}>
          <Text variant="h3" style={styles.sectionTitle}>
            Recent History
          </Text>

          <Card variant="outlined" style={styles.chartCard}>
            <View style={styles.chartContainer}>
              {history.map((point, index) => {
                const height = (point.value / (metric?.idealRange.max || 200)) * 100;
                return (
                  <View key={index} style={styles.chartBar}>
                    <View
                      style={[
                        styles.chartBarFill,
                        {
                          height: `${Math.min(100, height)}%`,
                          backgroundColor: colors.primary,
                          opacity: 0.3 + (index / history.length) * 0.7,
                        },
                      ]}
                    />
                    <Text variant="caption" color={colors.textMuted} style={styles.chartLabel}>
                      {point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </Animated.View>

        {/* Tips */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.tipsSection}>
          <Text variant="h3" style={styles.sectionTitle}>
            Tips to Improve
          </Text>

          {metric?.tips.map((tip, index) => (
            <Card key={index} variant="outlined" style={styles.tipCard}>
              <View style={[styles.tipNumber, { backgroundColor: colors.primaryMuted }]}>
                <Text variant="labelSmall" color={colors.primary}>
                  {index + 1}
                </Text>
              </View>
              <Text variant="bodySmall" color={colors.textSecondary} style={styles.tipText}>
                {tip}
              </Text>
            </Card>
          ))}
        </Animated.View>

        {/* Related Drills */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <Button
            label="View Related Drills"
            variant="primary"
            size="large"
            leftIcon={<Ionicons name="fitness" size={20} color="#FFF" />}
            onPress={() => router.push('/learn')}
            style={styles.drillsButton}
          />
        </Animated.View>
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
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
  },
  headerLeft: {
    width: 44,
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },

  // Value section
  valueSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  mainValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing[2],
  },
  valueText: {
    fontSize: 64,
    lineHeight: 72,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },

  // Range card
  rangeCard: {
    marginBottom: spacing[4],
  },
  rangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  rangeBar: {
    marginBottom: spacing[2],
  },
  rangeTrack: {
    height: 8,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  idealZone: {
    position: 'absolute',
    left: '20%',
    right: '20%',
    top: 0,
    bottom: 0,
  },
  currentMarker: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -4,
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Description
  descriptionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  descriptionText: {
    flex: 1,
    lineHeight: 20,
  },

  // History
  historySection: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    marginBottom: spacing[3],
  },
  chartCard: {
    padding: spacing[4],
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  chartBarFill: {
    width: '80%',
    borderRadius: radius.sm,
    minHeight: 4,
  },
  chartLabel: {
    marginTop: spacing[2],
    fontSize: 9,
  },

  // Tips
  tipsSection: {
    marginBottom: spacing[6],
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  tipText: {
    flex: 1,
  },

  // Drills button
  drillsButton: {
    marginTop: spacing[4],
  },
});

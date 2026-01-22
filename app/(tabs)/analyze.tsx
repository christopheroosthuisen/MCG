/**
 * MCG Golf App - Analyze Tab
 * Video analysis hub with upload, recording, and recent analyses
 */

import React, { useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius, layout } from '@/design';
import {
  Text,
  Button,
  Card,
  GradientCard,
  PressableCard,
  Badge,
  ScoreRing,
} from '@/components/ui';
import { VideoUpload } from '@/components/analysis';
import { VideoFile, CameraPosition } from '@/types/analysis';

export default function AnalyzeScreen() {
  const { colors, gradients } = useTheme();
  const router = useRouter();

  const [showUploadView, setShowUploadView] = useState(false);
  const [selectedCameraPosition, setSelectedCameraPosition] = useState<CameraPosition>('face-on');

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

  // Handle video selected from upload
  const handleVideoSelected = useCallback((video: VideoFile) => {
    // Navigate to analysis screen with the video
    router.push({
      pathname: '/analysis/[id]',
      params: {
        id: video.id,
        videoUri: video.uri,
      },
    });
  }, [router]);

  // Handle record press
  const handleRecordPress = useCallback(() => {
    // Navigate to live camera view
    router.push('/analysis/live');
  }, [router]);

  // Quick import video
  const handleQuickImport = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant access to your photo library to upload videos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 1,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const videoFile: VideoFile = {
          id: Date.now().toString(),
          uri: asset.uri,
          localUri: asset.uri,
          duration: (asset.duration || 0) * 1000,
          width: asset.width || 0,
          height: asset.height || 0,
          fps: 30,
          fileSize: asset.fileSize || 0,
          mimeType: asset.mimeType || 'video/mp4',
          createdAt: new Date(),
        };
        handleVideoSelected(videoFile);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video. Please try again.');
    }
  }, [handleVideoSelected]);

  // View analysis details
  const handleViewAnalysis = useCallback((analysisId: string) => {
    router.push({
      pathname: '/analysis/[id]',
      params: { id: analysisId },
    });
  }, [router]);

  // If showing upload view
  if (showUploadView) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#0D0D12' }]} edges={['top']}>
        <View style={styles.uploadHeader}>
          <Button
            label="Back"
            variant="ghost"
            size="small"
            leftIcon={<Ionicons name="arrow-back" size={20} color="#FFF" />}
            onPress={() => setShowUploadView(false)}
          />
        </View>
        <VideoUpload
          onVideoSelected={handleVideoSelected}
          onRecordPress={handleRecordPress}
          selectedPosition={selectedCameraPosition}
          onPositionSelect={setSelectedCameraPosition}
        />
      </SafeAreaView>
    );
  }

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
            <View style={styles.recordButtons}>
              <Button
                label="Upload Video"
                variant="outline"
                size="medium"
                leftIcon={<Ionicons name="cloud-upload" size={18} color={colors.primary} />}
                onPress={() => setShowUploadView(true)}
                style={styles.recordButton}
              />
              <Button
                label="Record"
                variant="primary"
                size="medium"
                rightIcon={<Ionicons name="camera" size={18} color="#FFF" />}
                onPress={handleRecordPress}
                style={styles.recordButton}
              />
            </View>
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
              onPress={() => handleViewAnalysis(analysis.id)}
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
          <Text variant="h2" style={styles.sectionTitle}>Key Positions</Text>
          <Text variant="bodySmall" color={colors.textSecondary} style={styles.sectionDesc}>
            Mark 4 key positions for complete analysis
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.positionsScroll}
          >
            {[
              { num: 1, name: 'Backswing Start', color: '#00FFFF' },
              { num: 2, name: 'Top', color: '#FF00FF' },
              { num: 3, name: 'Impact', color: '#FFFF00' },
              { num: 4, name: 'Finish', color: '#00FF00' },
            ].map((position) => (
              <Card
                key={position.num}
                variant="outlined"
                padding={4}
                style={styles.positionCard}
              >
                <View style={[styles.positionNumber, { backgroundColor: `${position.color}30`, borderColor: position.color }]}>
                  <Text variant="h4" color={position.color}>{position.num}</Text>
                </View>
                <Text variant="caption" color={colors.textSecondary} style={styles.positionLabel}>
                  {position.name}
                </Text>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Quick Import */}
        <Card variant="outlined" style={styles.importCard}>
          <Ionicons name="images-outline" size={32} color={colors.textMuted} />
          <View style={styles.importContent}>
            <Text variant="h4">Quick Import</Text>
            <Text variant="caption" color={colors.textMuted}>
              Select a video from your library
            </Text>
          </View>
          <Button
            label="Import"
            variant="outline"
            size="small"
            onPress={handleQuickImport}
          />
        </Card>

        {/* Pro tip */}
        <Card variant="filled" style={styles.proTipCard}>
          <View style={styles.proTipHeader}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
            <Text variant="labelMedium" color={colors.primary}>
              PRO TIP
            </Text>
          </View>
          <Text variant="bodySmall" color={colors.textSecondary}>
            For best results, record at 60fps and ensure good lighting. Face-on and down-the-line views give the most comprehensive analysis.
          </Text>
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

  // Upload header
  uploadHeader: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
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
  recordButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    width: '100%',
  },
  recordButton: {
    flex: 1,
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
    marginRight: spacing[3],
    minWidth: 90,
  },
  positionNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
    borderWidth: 2,
  },
  positionLabel: {
    textAlign: 'center',
  },

  // Import Card
  importCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  importContent: {
    flex: 1,
  },

  // Pro tip
  proTipCard: {
    backgroundColor: 'rgba(255, 130, 0, 0.1)',
  },
  proTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
});

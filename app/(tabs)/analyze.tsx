/**
 * MCG Golf App - Analyze Tab
 * Video analysis hub with upload, recording, and recent analyses
 */

import React, { useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet, Alert, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius, layout } from '@/design';
import { Text, Button, Card, Badge } from '@/components/ui';
import { VideoUpload } from '@/components/analysis';
import { VideoFile, CameraPosition } from '@/types/analysis';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Sample recent analyses
const RECENT_ANALYSES = [
  {
    id: '1',
    club: '7 Iron',
    score: 85,
    date: 'Today',
    time: '2:30 PM',
    metrics: {
      clubSpeed: 87.2,
      ballSpeed: 112.5,
      launchAngle: 18.2,
      spinRate: 6240,
    },
  },
  {
    id: '2',
    club: 'Driver',
    score: 78,
    date: 'Today',
    time: '11:15 AM',
    metrics: {
      clubSpeed: 108.5,
      ballSpeed: 158.2,
      launchAngle: 12.8,
      spinRate: 2840,
    },
  },
  {
    id: '3',
    club: 'Pitching Wedge',
    score: 92,
    date: 'Yesterday',
    time: '4:00 PM',
    metrics: {
      clubSpeed: 72.1,
      ballSpeed: 94.8,
      launchAngle: 28.4,
      spinRate: 8920,
    },
  },
];

const KEY_POSITIONS = [
  { num: 1, name: 'Setup', color: '#00FFFF' },
  { num: 2, name: 'Top', color: '#FF00FF' },
  { num: 3, name: 'Impact', color: '#FFFF00' },
  { num: 4, name: 'Finish', color: '#00FF00' },
];

// Score Ring Component
function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const { colors } = useTheme();
  const circumference = (size - 8) * Math.PI;
  const progress = (score / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 85) return colors.success;
    if (score >= 70) return colors.warning;
    return colors.error;
  };

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 4,
          borderColor: colors.border,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 4,
          borderColor: getScoreColor(),
          borderTopColor: 'transparent',
          borderRightColor: score > 25 ? getScoreColor() : 'transparent',
          borderBottomColor: score > 50 ? getScoreColor() : 'transparent',
          borderLeftColor: score > 75 ? getScoreColor() : 'transparent',
          transform: [{ rotate: '-45deg' }],
        }}
      />
      <Text variant="labelMedium" color={colors.textHeading}>
        {score}
      </Text>
    </View>
  );
}

// Analysis Card Component
function AnalysisCard({
  analysis,
  index,
  colors,
  onPress,
}: {
  analysis: typeof RECENT_ANALYSES[0];
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
    <Animated.View entering={FadeInDown.delay(300 + index * 100).springify()}>
      <AnimatedPressable
        style={[
          styles.analysisCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
          animatedStyle,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {/* Left: Video Thumbnail Placeholder */}
        <View style={[styles.thumbnail, { backgroundColor: colors.backgroundTertiary }]}>
          <Ionicons name="play-circle" size={32} color={colors.textMuted} />
        </View>

        {/* Middle: Info */}
        <View style={styles.analysisInfo}>
          <View style={styles.analysisHeader}>
            <Text variant="labelMedium" color={colors.textHeading}>
              {analysis.club}
            </Text>
            <Badge
              label={analysis.score >= 85 ? 'Great' : analysis.score >= 70 ? 'Good' : 'Review'}
              variant={analysis.score >= 85 ? 'success' : analysis.score >= 70 ? 'warning' : 'neutral'}
              size="small"
            />
          </View>
          <Text variant="caption" color={colors.textMuted}>
            {analysis.date} at {analysis.time}
          </Text>
          <View style={styles.metricsPreview}>
            <Text variant="caption" color={colors.textSecondary}>
              {analysis.metrics.clubSpeed.toFixed(0)} mph
            </Text>
            <View style={[styles.metricDot, { backgroundColor: colors.border }]} />
            <Text variant="caption" color={colors.textSecondary}>
              {analysis.metrics.launchAngle.toFixed(0)}° launch
            </Text>
          </View>
        </View>

        {/* Right: Score */}
        <ScoreRing score={analysis.score} size={48} />
      </AnimatedPressable>
    </Animated.View>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  label,
  color,
  bgColor,
  index,
}: {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
  index: number;
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

  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 50).springify()} style={styles.featureWrapper}>
      <AnimatedPressable
        style={[styles.featureCard, { backgroundColor: colors.surface }, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.featureIcon, { backgroundColor: bgColor }]}>
          <Ionicons name={icon as any} size={22} color={color} />
        </View>
        <Text variant="caption" color={colors.textSecondary} style={styles.featureLabel}>
          {label}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function AnalyzeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [showUploadView, setShowUploadView] = useState(false);
  const [selectedCameraPosition, setSelectedCameraPosition] = useState<CameraPosition>('face-on');

  // Handle video selected from upload
  const handleVideoSelected = useCallback((video: VideoFile) => {
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
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.header}>
          <Text variant="displaySmall" color={colors.textHeading}>
            Analyze
          </Text>
          <Text variant="bodyMedium" color={colors.textSecondary}>
            AI-powered swing analysis
          </Text>
        </Animated.View>

        {/* Main CTA Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Pressable style={styles.ctaContainer} onPress={() => setShowUploadView(true)}>
            <LinearGradient
              colors={[colors.primary, '#FF9A33']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaCard}
            >
              <View style={styles.ctaIconContainer}>
                <Ionicons name="videocam" size={40} color="#FFF" />
              </View>
              <Text variant="h3" color="#FFF" style={styles.ctaTitle}>
                New Analysis
              </Text>
              <Text variant="caption" color="rgba(255,255,255,0.8)" style={styles.ctaSubtitle}>
                Record or upload a swing video
              </Text>
              <View style={styles.ctaButtons}>
                <Pressable
                  style={[styles.ctaButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                  onPress={handleQuickImport}
                >
                  <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
                  <Text variant="labelSmall" color="#FFF">
                    Upload
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.ctaButton, { backgroundColor: '#FFF' }]}
                  onPress={handleRecordPress}
                >
                  <Ionicons name="camera" size={20} color={colors.primary} />
                  <Text variant="labelSmall" color={colors.primary}>
                    Record
                  </Text>
                </Pressable>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Feature Pills */}
        <View style={styles.featuresRow}>
          <FeatureCard
            icon="body"
            label="Pose"
            color={colors.primary}
            bgColor={colors.primaryMuted}
            index={0}
          />
          <FeatureCard
            icon="speedometer"
            label="Metrics"
            color={colors.success}
            bgColor={colors.successLight}
            index={1}
          />
          <FeatureCard
            icon="git-compare"
            label="Compare"
            color={colors.info}
            bgColor={colors.infoLight}
            index={2}
          />
          <FeatureCard
            icon="analytics"
            label="Trends"
            color={colors.warning}
            bgColor={colors.warningLight}
            index={3}
          />
        </View>

        {/* Key Positions */}
        <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.section}>
          <Text variant="h3" color={colors.textHeading} style={styles.sectionTitle}>
            Key Positions
          </Text>
          <View style={styles.positionsRow}>
            {KEY_POSITIONS.map((pos, index) => (
              <Animated.View
                key={pos.num}
                entering={FadeInRight.delay(300 + index * 75).springify()}
                style={styles.positionItem}
              >
                <View
                  style={[
                    styles.positionCircle,
                    { backgroundColor: `${pos.color}20`, borderColor: pos.color },
                  ]}
                >
                  <Text variant="labelMedium" color={pos.color}>
                    {pos.num}
                  </Text>
                </View>
                <Text variant="caption" color={colors.textMuted}>
                  {pos.name}
                </Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Recent Analyses */}
        <View style={styles.section}>
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.sectionHeader}>
            <Text variant="h3" color={colors.textHeading}>
              Recent Analyses
            </Text>
            <Pressable>
              <Text variant="labelSmall" color={colors.primary}>
                View All
              </Text>
            </Pressable>
          </Animated.View>

          {RECENT_ANALYSES.map((analysis, index) => (
            <AnalysisCard
              key={analysis.id}
              analysis={analysis}
              index={index}
              colors={colors}
              onPress={() => handleViewAnalysis(analysis.id)}
            />
          ))}
        </View>

        {/* Pro Tip */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <View style={[styles.proTipCard, { backgroundColor: colors.primaryMuted }]}>
            <View style={styles.proTipIcon}>
              <Ionicons name="bulb" size={18} color={colors.primary} />
            </View>
            <View style={styles.proTipContent}>
              <Text variant="labelSmall" color={colors.primary}>
                Pro Tip
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                Record at 60fps with good lighting for the most accurate analysis.
              </Text>
            </View>
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

  // Upload header
  uploadHeader: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
  },

  // Header
  header: {
    marginBottom: spacing[5],
  },

  // CTA Card
  ctaContainer: {
    marginBottom: spacing[5],
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  ctaCard: {
    padding: spacing[5],
    alignItems: 'center',
  },
  ctaIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  ctaTitle: {
    marginBottom: spacing[1],
  },
  ctaSubtitle: {
    marginBottom: spacing[4],
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
  },

  // Features Row
  featuresRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  featureWrapper: {
    flex: 1,
  },
  featureCard: {
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderRadius: radius.lg,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  featureLabel: {
    textAlign: 'center',
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

  // Key Positions
  positionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  positionItem: {
    alignItems: 'center',
    flex: 1,
  },
  positionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },

  // Analysis Card
  analysisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing[3],
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  analysisInfo: {
    flex: 1,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  metricsPreview: {
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

  // Pro Tip
  proTipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing[4],
    borderRadius: radius.lg,
    gap: spacing[3],
  },
  proTipIcon: {
    marginTop: 2,
  },
  proTipContent: {
    flex: 1,
  },
});

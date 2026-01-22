/**
 * MCG Golf App - Video Upload Component
 * Upload videos with guidelines for optimal analysis
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius, shadowsIOS } from '@/design';
import { Text, Button, Card, Badge, ProgressBar } from '@/components/ui';
import {
  VideoFile,
  VideoUploadGuidelines,
  CameraPosition,
} from '@/types/analysis';

// ============================================
// UPLOAD GUIDELINES DATA
// ============================================

const CAMERA_POSITION_GUIDELINES: Record<CameraPosition, VideoUploadGuidelines> = {
  'face-on': {
    cameraPosition: 'face-on',
    tips: [
      'Position camera directly in front of the golfer',
      'Camera should be at hip height',
      'Ensure full body is visible in frame',
      'Keep camera level and steady',
      'Record at least 3 full swings',
    ],
    warnings: [
      'Avoid filming against bright backgrounds',
      'Ensure adequate lighting on the golfer',
      'Remove any obstructions between camera and golfer',
    ],
    optimalSettings: {
      resolution: '1080p or higher',
      fps: 60,
      lighting: 'Bright, even lighting preferred',
      distance: '10-15 feet from golfer',
      angle: 'Perpendicular to target line',
    },
  },
  'down-the-line': {
    cameraPosition: 'down-the-line',
    tips: [
      'Position camera behind the golfer, along target line',
      'Camera should be at hand height at address',
      'Ensure club and ball are visible',
      'Capture the full swing arc',
      'Record at least 3 full swings',
    ],
    warnings: [
      'Avoid filming directly into the sun',
      'Keep the target line visible if possible',
      'Ensure the club shaft is visible throughout',
    ],
    optimalSettings: {
      resolution: '1080p or higher',
      fps: 60,
      lighting: 'Side lighting works best',
      distance: '8-12 feet behind golfer',
      angle: 'Aligned with target line',
    },
  },
  'behind': {
    cameraPosition: 'behind',
    tips: [
      'Position camera directly behind the golfer',
      'Camera should be at shoulder height',
      'Center the golfer in frame',
      'Capture weight shift and rotation',
    ],
    warnings: [
      'This angle is supplementary to main views',
      'Ensure sufficient distance for safety',
    ],
    optimalSettings: {
      resolution: '1080p or higher',
      fps: 60,
      lighting: 'Even lighting preferred',
      distance: '12-15 feet behind golfer',
      angle: 'Center of back',
    },
  },
};

// ============================================
// TYPES
// ============================================

interface VideoUploadProps {
  onVideoSelected: (video: VideoFile) => void;
  onRecordPress: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
  showGuidelines?: boolean;
  selectedPosition?: CameraPosition;
  onPositionSelect?: (position: CameraPosition) => void;
}

// ============================================
// CAMERA POSITION SELECTOR
// ============================================

const CameraPositionCard = ({
  position,
  isSelected,
  onSelect,
}: {
  position: CameraPosition;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const { colors } = useTheme();

  const positionData = {
    'face-on': {
      label: 'Face-On',
      description: 'Front view of the golfer',
      icon: 'person-outline',
      recommended: true,
    },
    'down-the-line': {
      label: 'Down the Line',
      description: 'Behind, along target line',
      icon: 'arrow-forward-outline',
      recommended: true,
    },
    'behind': {
      label: 'Behind',
      description: 'Directly behind golfer',
      icon: 'eye-outline',
      recommended: false,
    },
  };

  const data = positionData[position];

  return (
    <Pressable
      style={[
        styles.positionCard,
        isSelected && {
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}20`,
        },
      ]}
      onPress={onSelect}
    >
      <View style={styles.positionCardHeader}>
        <View
          style={[
            styles.positionIcon,
            { backgroundColor: isSelected ? colors.primary : 'rgba(255,255,255,0.1)' },
          ]}
        >
          <Ionicons
            name={data.icon as any}
            size={24}
            color={isSelected ? '#FFF' : '#888'}
          />
        </View>
        {data.recommended && (
          <Badge label="Recommended" variant="primary" size="small" />
        )}
      </View>

      <Text
        variant="h4"
        color={isSelected ? '#FFF' : '#AAA'}
        style={styles.positionLabel}
      >
        {data.label}
      </Text>
      <Text variant="caption" color="#888">
        {data.description}
      </Text>

      {isSelected && (
        <View style={styles.selectedCheck}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        </View>
      )}
    </Pressable>
  );
};

// ============================================
// VIDEO UPLOAD COMPONENT
// ============================================

export function VideoUpload({
  onVideoSelected,
  onRecordPress,
  isUploading = false,
  uploadProgress = 0,
  showGuidelines = true,
  selectedPosition = 'face-on',
  onPositionSelect,
}: VideoUploadProps) {
  const { colors } = useTheme();
  const [showTips, setShowTips] = useState(showGuidelines);
  const [selectedTab, setSelectedTab] = useState<'upload' | 'record'>('upload');

  const guidelines = CAMERA_POSITION_GUIDELINES[selectedPosition];

  // Request permissions and pick video
  const handlePickVideo = useCallback(async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant access to your photo library to upload videos.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Pick video
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 1,
        videoMaxDuration: 60, // Max 60 seconds
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        const videoFile: VideoFile = {
          id: Date.now().toString(),
          uri: asset.uri,
          localUri: asset.uri,
          duration: (asset.duration || 0) * 1000, // Convert to ms
          width: asset.width || 0,
          height: asset.height || 0,
          fps: 30, // Default, will be detected later
          fileSize: asset.fileSize || 0,
          mimeType: asset.mimeType || 'video/mp4',
          createdAt: new Date(),
        };

        onVideoSelected(videoFile);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video. Please try again.');
    }
  }, [onVideoSelected]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="displaySmall" color="#FFF">
          Upload Swing Video
        </Text>
        <Text variant="bodyMedium" color="#AAA" style={styles.subtitle}>
          Get AI-powered analysis of your swing
        </Text>
      </View>

      {/* Tab selector */}
      <View style={styles.tabSelector}>
        <Pressable
          style={[
            styles.tab,
            selectedTab === 'upload' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setSelectedTab('upload')}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={20}
            color={selectedTab === 'upload' ? '#FFF' : '#888'}
          />
          <Text
            variant="labelMedium"
            color={selectedTab === 'upload' ? '#FFF' : '#888'}
          >
            Upload Video
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tab,
            selectedTab === 'record' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setSelectedTab('record')}
        >
          <Ionicons
            name="videocam-outline"
            size={20}
            color={selectedTab === 'record' ? '#FFF' : '#888'}
          />
          <Text
            variant="labelMedium"
            color={selectedTab === 'record' ? '#FFF' : '#888'}
          >
            Record New
          </Text>
        </Pressable>
      </View>

      {/* Camera position selector */}
      <View style={styles.section}>
        <Text variant="h4" color="#FFF" style={styles.sectionTitle}>
          Select Camera Angle
        </Text>

        <View style={styles.positionGrid}>
          {(['face-on', 'down-the-line', 'behind'] as CameraPosition[]).map(
            (position) => (
              <CameraPositionCard
                key={position}
                position={position}
                isSelected={selectedPosition === position}
                onSelect={() => onPositionSelect?.(position)}
              />
            )
          )}
        </View>
      </View>

      {/* Guidelines */}
      {showTips && (
        <Animated.View
          entering={FadeIn}
          style={styles.guidelinesSection}
        >
          <Pressable
            style={styles.guidelinesHeader}
            onPress={() => setShowTips(!showTips)}
          >
            <View style={styles.guidelinesHeaderLeft}>
              <Ionicons name="bulb" size={20} color={colors.warning} />
              <Text variant="h4" color="#FFF">
                Recording Tips
              </Text>
            </View>
            <Ionicons
              name={showTips ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#888"
            />
          </Pressable>

          {/* Tips list */}
          <View style={styles.tipsList}>
            {guidelines.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text variant="bodySmall" color="#CCC">
                  {tip}
                </Text>
              </View>
            ))}
          </View>

          {/* Warnings */}
          {guidelines.warnings.length > 0 && (
            <View style={styles.warningsSection}>
              <Text variant="labelSmall" color={colors.warning} style={styles.warningsTitle}>
                AVOID
              </Text>
              {guidelines.warnings.map((warning, index) => (
                <View key={index} style={styles.warningItem}>
                  <Ionicons name="warning" size={14} color={colors.warning} />
                  <Text variant="caption" color="#AAA">
                    {warning}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Optimal settings */}
          <View style={styles.settingsGrid}>
            <View style={styles.settingItem}>
              <Ionicons name="videocam" size={16} color="#888" />
              <Text variant="caption" color="#888">
                {guidelines.optimalSettings.resolution}
              </Text>
            </View>
            <View style={styles.settingItem}>
              <Ionicons name="speedometer" size={16} color="#888" />
              <Text variant="caption" color="#888">
                {guidelines.optimalSettings.fps} FPS
              </Text>
            </View>
            <View style={styles.settingItem}>
              <Ionicons name="sunny" size={16} color="#888" />
              <Text variant="caption" color="#888">
                {guidelines.optimalSettings.lighting}
              </Text>
            </View>
            <View style={styles.settingItem}>
              <Ionicons name="resize" size={16} color="#888" />
              <Text variant="caption" color="#888">
                {guidelines.optimalSettings.distance}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Upload/Record area */}
      <View style={styles.actionArea}>
        {selectedTab === 'upload' ? (
          <Pressable
            style={[
              styles.uploadZone,
              isUploading && styles.uploadZoneDisabled,
            ]}
            onPress={handlePickVideo}
            disabled={isUploading}
          >
            {isUploading ? (
              <View style={styles.uploadingState}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text variant="h4" color="#FFF" style={styles.uploadingText}>
                  Uploading...
                </Text>
                <View style={styles.uploadProgressContainer}>
                  <ProgressBar
                    progress={uploadProgress}
                    variant="primary"
                    size="medium"
                    showLabel
                  />
                </View>
              </View>
            ) : (
              <>
                <View
                  style={[styles.uploadIcon, { backgroundColor: `${colors.primary}30` }]}
                >
                  <Ionicons name="cloud-upload" size={48} color={colors.primary} />
                </View>
                <Text variant="h4" color="#FFF" style={styles.uploadTitle}>
                  Tap to Select Video
                </Text>
                <Text variant="bodySmall" color="#888" align="center">
                  Choose a video from your library{'\n'}
                  MP4, MOV supported • Max 60 seconds
                </Text>
              </>
            )}
          </Pressable>
        ) : (
          <Pressable style={styles.recordZone} onPress={onRecordPress}>
            <View
              style={[styles.recordButton, { backgroundColor: colors.error }]}
            >
              <View style={styles.recordButtonInner} />
            </View>
            <Text variant="h4" color="#FFF" style={styles.recordTitle}>
              Start Recording
            </Text>
            <Text variant="bodySmall" color="#888" align="center">
              Record directly from your camera{'\n'}
              with real-time pose tracking
            </Text>
          </Pressable>
        )}
      </View>

      {/* Pro tip */}
      <Card variant="outlined" style={styles.proTipCard}>
        <View style={styles.proTipHeader}>
          <Ionicons name="sparkles" size={18} color={colors.primary} />
          <Text variant="labelMedium" color={colors.primary}>
            PRO TIP
          </Text>
        </View>
        <Text variant="bodySmall" color="#AAA">
          For the best analysis, record both face-on AND down-the-line views.
          This gives our AI a complete picture of your swing mechanics.
        </Text>
      </Card>
    </ScrollView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D12',
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },

  // Header
  header: {
    marginBottom: spacing[6],
  },
  subtitle: {
    marginTop: spacing[2],
  },

  // Tab selector
  tabSelector: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
  },

  // Section
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    marginBottom: spacing[3],
  },

  // Position grid
  positionGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  positionCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.xl,
    padding: spacing[4],
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  positionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  positionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionLabel: {
    marginBottom: spacing[1],
  },
  selectedCheck: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
  },

  // Guidelines
  guidelinesSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.xl,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  guidelinesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  guidelinesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  tipsList: {
    marginBottom: spacing[4],
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  warningsSection: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: radius.lg,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  warningsTitle: {
    marginBottom: spacing[2],
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  settingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.md,
  },

  // Action area
  actionArea: {
    marginBottom: spacing[6],
  },
  uploadZone: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius['2xl'],
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    padding: spacing[8],
    alignItems: 'center',
  },
  uploadZoneDisabled: {
    opacity: 0.7,
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  uploadTitle: {
    marginBottom: spacing[2],
  },
  uploadingState: {
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: spacing[4],
    marginBottom: spacing[3],
  },
  uploadProgressContainer: {
    width: '100%',
    maxWidth: 200,
  },

  // Record zone
  recordZone: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius['2xl'],
    padding: spacing[8],
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  recordButtonInner: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: '#FFF',
  },
  recordTitle: {
    marginBottom: spacing[2],
  },

  // Pro tip
  proTipCard: {
    backgroundColor: 'rgba(255, 130, 0, 0.1)',
    borderColor: 'rgba(255, 130, 0, 0.3)',
  },
  proTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
});

export default VideoUpload;

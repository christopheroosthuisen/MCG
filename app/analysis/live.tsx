/**
 * MCG Golf App - Live Camera Analysis
 * Real-time skeleton tracking and swing recording
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius } from '@/design';
import { Text, Button, Badge, Card } from '@/components/ui';
import { SkeletonOverlay } from '@/components/analysis';
import {
  CameraPosition,
  LiveAnalysisConfig,
  LiveAnalysisState,
  VideoFile,
} from '@/types/analysis';
import { PoseLandmarks, BodyAngles } from '@/types/golf';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Camera position guidelines
const CAMERA_GUIDELINES: Record<CameraPosition, { title: string; tips: string[] }> = {
  'face-on': {
    title: 'Face-On View',
    tips: [
      'Position camera directly in front',
      'Align camera at hip height',
      'Keep full body in frame',
    ],
  },
  'down-the-line': {
    title: 'Down the Line',
    tips: [
      'Position camera behind along target line',
      'Angle slightly to see face and back',
      'Include club and ground line',
    ],
  },
  'behind': {
    title: 'Behind View',
    tips: [
      'Position directly behind golfer',
      'Align with center of stance',
      'Capture full swing arc',
    ],
  },
};

export default function LiveCameraScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  // Camera state
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>('face-on');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Live analysis config
  const [config, setConfig] = useState<LiveAnalysisConfig>({
    cameraPosition: 'face-on',
    showSkeleton: true,
    showRealTimeFeedback: true,
    showProOverlay: false,
    audioFeedback: false,
    hapticFeedback: true,
    recordingEnabled: true,
    analysisInterval: 100,
  });

  // Live analysis state (simulated for now)
  const [analysisState, setAnalysisState] = useState<LiveAnalysisState>({
    isActive: true,
    isRecording: false,
    frameRate: 30,
    latency: 45,
    realtimeScore: undefined,
  });

  // Simulated pose data (would come from ML model)
  const [currentPose, setCurrentPose] = useState<PoseLandmarks | undefined>();

  // Recording timer
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  // Animations
  const recordingPulse = useSharedValue(1);
  const gridOpacity = useSharedValue(0.3);

  // Recording pulse animation
  useEffect(() => {
    if (isRecording) {
      recordingPulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      recordingPulse.value = withTiming(1);
    }
  }, [isRecording]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
      setRecordingDuration(0);
    }

    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle camera facing
  const toggleCameraFacing = useCallback(() => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  // Cycle camera position
  const cycleCameraPosition = useCallback(() => {
    const positions: CameraPosition[] = ['face-on', 'down-the-line', 'behind'];
    const currentIndex = positions.indexOf(cameraPosition);
    const nextIndex = (currentIndex + 1) % positions.length;
    setCameraPosition(positions[nextIndex]);
    setConfig((prev) => ({ ...prev, cameraPosition: positions[nextIndex] }));

    if (config.hapticFeedback) {
      Haptics.selectionAsync();
    }
  }, [cameraPosition, config.hapticFeedback]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!cameraRef.current) return;

    try {
      if (config.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      setIsRecording(true);
      setAnalysisState((prev) => ({ ...prev, isRecording: true }));

      const video = await cameraRef.current.recordAsync({
        maxDuration: 30,
      });

      if (video) {
        // Navigate to analysis with the recorded video
        const videoFile: VideoFile = {
          id: Date.now().toString(),
          uri: video.uri,
          localUri: video.uri,
          duration: recordingDuration * 1000,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          fps: 30,
          fileSize: 0,
          mimeType: 'video/mp4',
          createdAt: new Date(),
        };

        router.push({
          pathname: '/analysis/[id]',
          params: {
            id: videoFile.id,
            videoUri: videoFile.uri,
          },
        });
      }
    } catch (error) {
      Alert.alert('Recording Error', 'Failed to record video. Please try again.');
      setIsRecording(false);
      setAnalysisState((prev) => ({ ...prev, isRecording: false }));
    }
  }, [config.hapticFeedback, recordingDuration, router]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!cameraRef.current) return;

    try {
      if (config.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      await cameraRef.current.stopRecording();
      setIsRecording(false);
      setAnalysisState((prev) => ({ ...prev, isRecording: false }));
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  }, [config.hapticFeedback]);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Toggle skeleton
  const toggleSkeleton = useCallback(() => {
    setConfig((prev) => ({ ...prev, showSkeleton: !prev.showSkeleton }));
    if (config.hapticFeedback) {
      Haptics.selectionAsync();
    }
  }, [config.hapticFeedback]);

  // Toggle realtime feedback
  const toggleFeedback = useCallback(() => {
    setConfig((prev) => ({ ...prev, showRealTimeFeedback: !prev.showRealTimeFeedback }));
    if (config.hapticFeedback) {
      Haptics.selectionAsync();
    }
  }, [config.hapticFeedback]);

  // Close camera
  const handleClose = useCallback(() => {
    if (isRecording) {
      Alert.alert(
        'Stop Recording?',
        'You are currently recording. Stop and discard the recording?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Stop & Exit',
            style: 'destructive',
            onPress: () => {
              stopRecording();
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  }, [isRecording, stopRecording, router]);

  // Recording button animation style
  const recordButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: recordingPulse.value }],
  }));

  // Request permission if needed
  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#0D0D12' }]}>
        <View style={styles.centered}>
          <Text variant="bodyMedium" color={colors.textSecondary}>
            Loading camera...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#0D0D12' }]}>
        <View style={styles.permissionContainer}>
          <View style={[styles.permissionIcon, { backgroundColor: colors.primaryMuted }]}>
            <Ionicons name="camera" size={48} color={colors.primary} />
          </View>
          <Text variant="h2" style={styles.permissionTitle}>
            Camera Access Required
          </Text>
          <Text variant="bodyMedium" color={colors.textSecondary} style={styles.permissionText}>
            MCG needs camera access to record your swing and provide real-time analysis.
          </Text>
          <Button
            label="Grant Permission"
            variant="primary"
            size="large"
            onPress={requestPermission}
            style={styles.permissionButton}
          />
          <Button
            label="Go Back"
            variant="ghost"
            size="medium"
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="video"
      >
        {/* Guidelines Overlay */}
        {showGuidelines && !isRecording && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.guidelinesOverlay}
          >
            {/* Center grid lines */}
            <View style={styles.gridLines}>
              <View style={[styles.gridLineH, { top: '33%' }]} />
              <View style={[styles.gridLineH, { top: '66%' }]} />
              <View style={[styles.gridLineV, { left: '33%' }]} />
              <View style={[styles.gridLineV, { left: '66%' }]} />
            </View>

            {/* Position indicator */}
            <View style={styles.positionGuide}>
              <Badge
                label={CAMERA_GUIDELINES[cameraPosition].title}
                variant="neutral"
                size="medium"
              />
            </View>
          </Animated.View>
        )}

        {/* Skeleton Overlay */}
        {config.showSkeleton && currentPose && (
          <SkeletonOverlay
            pose={currentPose}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            config={{
              visible: true,
              color: colors.primary,
              opacity: 0.8,
              lineWidth: 3,
              jointSize: 8,
              showLabels: false,
              showAngles: true,
              highlightedJoints: [],
            }}
          />
        )}

        {/* Top Controls */}
        <SafeAreaView style={styles.topControls} edges={['top']}>
          {/* Close button */}
          <Button
            label=""
            variant="ghost"
            size="small"
            leftIcon={<Ionicons name="close" size={28} color="#FFF" />}
            onPress={handleClose}
            style={styles.closeButton}
          />

          {/* Recording indicator */}
          {isRecording && (
            <Animated.View
              entering={FadeIn}
              style={styles.recordingIndicator}
            >
              <View style={styles.recordingDot} />
              <Text variant="labelMedium" color="#FF3B30">
                {formatDuration(recordingDuration)}
              </Text>
            </Animated.View>
          )}

          {/* Top right controls */}
          <View style={styles.topRightControls}>
            {/* Flip camera */}
            <Button
              label=""
              variant="ghost"
              size="small"
              leftIcon={<Ionicons name="camera-reverse" size={24} color="#FFF" />}
              onPress={toggleCameraFacing}
              style={styles.iconButton}
            />
          </View>
        </SafeAreaView>

        {/* Realtime Feedback Overlay */}
        {config.showRealTimeFeedback && analysisState.realtimeFeedback && (
          <Animated.View
            entering={FadeIn}
            style={styles.feedbackOverlay}
          >
            {analysisState.realtimeFeedback.slice(0, 2).map((msg) => (
              <View key={msg.id} style={styles.feedbackBubble}>
                <Text variant="caption" color="#FFF">
                  {msg.content}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Stats Overlay */}
        <View style={styles.statsOverlay}>
          <View style={styles.statItem}>
            <Text variant="caption" color="rgba(255,255,255,0.6)">FPS</Text>
            <Text variant="labelMedium" color="#FFF">{analysisState.frameRate}</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="caption" color="rgba(255,255,255,0.6)">Latency</Text>
            <Text variant="labelMedium" color="#FFF">{analysisState.latency}ms</Text>
          </View>
          {analysisState.realtimeScore !== undefined && (
            <View style={styles.statItem}>
              <Text variant="caption" color="rgba(255,255,255,0.6)">Score</Text>
              <Text variant="labelMedium" color={colors.primary}>
                {analysisState.realtimeScore}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Controls */}
        <SafeAreaView style={styles.bottomControls} edges={['bottom']}>
          {/* Left tools */}
          <View style={styles.leftTools}>
            <Button
              label=""
              variant={config.showSkeleton ? 'primary' : 'ghost'}
              size="small"
              leftIcon={
                <Ionicons
                  name="body"
                  size={22}
                  color={config.showSkeleton ? '#FFF' : 'rgba(255,255,255,0.7)'}
                />
              }
              onPress={toggleSkeleton}
              style={[styles.toolButton, config.showSkeleton && styles.toolButtonActive]}
            />
            <Button
              label=""
              variant={config.showRealTimeFeedback ? 'primary' : 'ghost'}
              size="small"
              leftIcon={
                <Ionicons
                  name="chatbubble-ellipses"
                  size={22}
                  color={config.showRealTimeFeedback ? '#FFF' : 'rgba(255,255,255,0.7)'}
                />
              }
              onPress={toggleFeedback}
              style={[styles.toolButton, config.showRealTimeFeedback && styles.toolButtonActive]}
            />
          </View>

          {/* Record Button */}
          <Animated.View style={recordButtonStyle}>
            <Button
              label=""
              variant="ghost"
              size="large"
              onPress={toggleRecording}
              style={styles.recordButton}
              leftIcon={
                <View style={[
                  styles.recordButtonInner,
                  isRecording && styles.recordButtonRecording
                ]}>
                  {isRecording ? (
                    <View style={styles.stopIcon} />
                  ) : (
                    <View style={styles.recordIcon} />
                  )}
                </View>
              }
            />
          </Animated.View>

          {/* Right tools */}
          <View style={styles.rightTools}>
            <Button
              label=""
              variant="ghost"
              size="small"
              leftIcon={
                <Ionicons
                  name="grid"
                  size={22}
                  color={showGuidelines ? colors.primary : 'rgba(255,255,255,0.7)'}
                />
              }
              onPress={() => setShowGuidelines(!showGuidelines)}
              style={styles.toolButton}
            />
            <Button
              label=""
              variant="ghost"
              size="small"
              leftIcon={<Ionicons name="location" size={22} color="rgba(255,255,255,0.7)" />}
              onPress={cycleCameraPosition}
              style={styles.toolButton}
            />
          </View>
        </SafeAreaView>

        {/* Camera Position Tips */}
        {showGuidelines && !isRecording && (
          <Animated.View
            entering={FadeIn.delay(200)}
            exiting={FadeOut}
            style={styles.tipsContainer}
          >
            <Card variant="filled" style={styles.tipsCard}>
              <Text variant="labelSmall" color={colors.primary} style={styles.tipsTitle}>
                {CAMERA_GUIDELINES[cameraPosition].title.toUpperCase()}
              </Text>
              {CAMERA_GUIDELINES[cameraPosition].tips.map((tip, index) => (
                <View key={index} style={styles.tipRow}>
                  <Ionicons name="checkmark" size={14} color={colors.success} />
                  <Text variant="caption" color={colors.textSecondary} style={styles.tipText}>
                    {tip}
                  </Text>
                </View>
              ))}
              <Button
                label="Hide Tips"
                variant="ghost"
                size="small"
                onPress={() => setShowGuidelines(false)}
                style={styles.hideTipsButton}
              />
            </Card>
          </Animated.View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },

  // Permission screen
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  permissionTitle: {
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: spacing[6],
    maxWidth: 280,
  },
  permissionButton: {
    marginBottom: spacing[3],
    minWidth: 200,
  },

  // Guidelines overlay
  guidelinesOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  positionGuide: {
    position: 'absolute',
    top: 100,
  },

  // Top controls
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
  },
  topRightControls: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },

  // Feedback overlay
  feedbackOverlay: {
    position: 'absolute',
    top: 120,
    left: spacing[4],
    right: spacing[4],
    gap: spacing[2],
  },
  feedbackBubble: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },

  // Stats overlay
  statsOverlay: {
    position: 'absolute',
    top: 120,
    right: spacing[4],
    gap: spacing[1],
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
  },

  // Bottom controls
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  leftTools: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing[2],
  },
  rightTools: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  toolButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: radius.full,
    width: 44,
    height: 44,
  },
  toolButtonActive: {
    backgroundColor: 'rgba(255,130,0,0.3)',
  },

  // Record button
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonRecording: {
    // When recording, we show stop icon
  },
  recordIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF3B30',
  },
  stopIcon: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },

  // Tips container
  tipsContainer: {
    position: 'absolute',
    bottom: 140,
    left: spacing[4],
    right: spacing[4],
  },
  tipsCard: {
    backgroundColor: 'rgba(13, 13, 18, 0.9)',
    padding: spacing[4],
  },
  tipsTitle: {
    marginBottom: spacing[3],
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  tipText: {
    flex: 1,
  },
  hideTipsButton: {
    marginTop: spacing[2],
  },
});

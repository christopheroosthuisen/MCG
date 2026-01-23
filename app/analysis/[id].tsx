/**
 * MCG Golf App - Video Analysis Screen
 * Full-featured swing analysis with AI feedback
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius } from '@/design';
import { Text, Button } from '@/components/ui';
import {
  VideoPlayer,
  VideoPlayerRef,
  SkeletonOverlay,
  DEFAULT_SKELETON_CONFIG,
  PRO_OVERLAY_CONFIG,
  AnalysisToolbar,
  KeyframeMarker,
  MiniKeyframeBar,
  FeedbackPanel,
  DEFAULT_FEEDBACK_CONFIG,
  AnalysisProgressView,
  MiniAnalysisProgress,
} from '@/components/analysis';
import {
  Keyframe,
  KeyframeType,
  AnalysisToolbarState,
  AnalysisToolType,
  DrawnAnnotation,
  FeedbackConfig,
  AnalysisProgress,
  AnalysisResult,
  SwingIssue,
  FeedbackMessage,
  PoseLandmarks,
  SkeletonConfig,
} from '@/types/analysis';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// MOCK DATA (for demonstration)
// ============================================

const createMockKeyframes = (): Keyframe[] => [
  {
    id: '1',
    type: 'backswing-start',
    timestamp: 0,
    frameNumber: 0,
    label: 'Backswing Start',
    shortcut: '1',
    color: '#00FFFF',
    isRequired: true,
    isMarked: false,
  },
  {
    id: '2',
    type: 'top-of-backswing',
    timestamp: 0,
    frameNumber: 0,
    label: 'Top of Backswing',
    shortcut: '2',
    color: '#FF00FF',
    isRequired: true,
    isMarked: false,
  },
  {
    id: '3',
    type: 'impact',
    timestamp: 0,
    frameNumber: 0,
    label: 'Impact',
    shortcut: '3',
    color: '#FFFF00',
    isRequired: true,
    isMarked: false,
  },
  {
    id: '4',
    type: 'finish',
    timestamp: 0,
    frameNumber: 0,
    label: 'Finish',
    shortcut: '4',
    color: '#00FF00',
    isRequired: true,
    isMarked: false,
  },
];

const MOCK_ISSUES: SwingIssue[] = [
  {
    id: '1',
    severity: 'warning',
    position: 'top-of-backswing',
    title: 'Over-rotation at top',
    description: 'Your shoulders are rotating past 90 degrees which can lead to inconsistency.',
    solution: 'Focus on stopping your shoulder turn when your lead arm is parallel to the ground.',
    relatedDrills: ['drill-1'],
    relatedLessons: ['lesson-1'],
    timestamp: 1200,
    frameNumber: 36,
  },
  {
    id: '2',
    severity: 'critical',
    position: 'impact',
    title: 'Hip rotation stall',
    description: 'Your hips are not rotating through impact, causing you to rely on your arms.',
    solution: 'Focus on leading the downswing with your hips rotating toward the target.',
    relatedDrills: ['drill-hip-rotation'],
    relatedLessons: ['lesson-hip-sequence'],
    timestamp: 1800,
    frameNumber: 54,
  },
  {
    id: '3',
    severity: 'suggestion',
    position: 'backswing-start',
    title: 'Tempo inconsistency',
    description: 'Your takeaway tempo varies between swings, affecting consistency.',
    solution: 'Practice with a metronome or counting to establish a consistent tempo.',
    relatedDrills: ['drill-2'],
    relatedLessons: ['lesson-1'],
    timestamp: 400,
    frameNumber: 12,
  },
];

// ============================================
// ANALYSIS SCREEN COMPONENT
// ============================================

export default function AnalysisScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id, videoUri } = useLocalSearchParams<{ id: string; videoUri: string }>();

  const videoRef = useRef<VideoPlayerRef>(null);

  // Video state
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Keyframes
  const [keyframes, setKeyframes] = useState<Keyframe[]>(createMockKeyframes());
  const [isMarkingMode, setIsMarkingMode] = useState(false);
  const [showKeyframePanel, setShowKeyframePanel] = useState(false);

  // Skeleton
  const [skeletonConfig, setSkeletonConfig] = useState<SkeletonConfig>(DEFAULT_SKELETON_CONFIG);
  const [showProOverlay, setShowProOverlay] = useState(false);
  const [currentPose, setCurrentPose] = useState<PoseLandmarks | null>(null);
  const [proModelPose, setProModelPose] = useState<PoseLandmarks | null>(null);

  // Toolbar
  const [toolbarState, setToolbarState] = useState<AnalysisToolbarState>({
    isExpanded: false,
    activeTool: null,
    activeColor: '#00FFFF',
    lineWidth: 4,
    annotations: [],
    showGrid: false,
    gridSize: 50,
  });

  // Feedback
  const [feedbackConfig, setFeedbackConfig] = useState<FeedbackConfig>(DEFAULT_FEEDBACK_CONFIG);
  const [feedbackExpanded, setFeedbackExpanded] = useState(true);
  const [issues, setIssues] = useState<SwingIssue[]>([]);
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [overallScore, setOverallScore] = useState<number | undefined>(undefined);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    status: 'idle',
    progress: 0,
    message: '',
    currentStep: 0,
    totalSteps: 5,
  });

  // UI state
  const [showControls, setShowControls] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(true);

  // Handle video load
  const handleVideoLoad = useCallback((duration: number, fps: number) => {
    setVideoDuration(duration);
    setVideoLoaded(true);
  }, []);

  // Handle time update
  const handleTimeUpdate = useCallback((timeMs: number, frame: number) => {
    setCurrentTime(timeMs);
    setCurrentFrame(frame);

    // Here you would update the pose based on pre-computed data
    // setCurrentPose(poseDataForFrame[frame]);
  }, []);

  // Mark keyframe
  const handleMarkKeyframe = useCallback((type: KeyframeType, timestamp: number) => {
    setKeyframes((prev) =>
      prev.map((kf) =>
        kf.type === type
          ? {
              ...kf,
              timestamp,
              frameNumber: Math.floor((timestamp / 1000) * 30), // Assuming 30fps
              isMarked: true,
              markedAt: new Date(),
            }
          : kf
      )
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  // Navigate to keyframe
  const handleNavigateToKeyframe = useCallback((timestamp: number) => {
    videoRef.current?.seekTo(timestamp);
  }, []);

  // Clear keyframe
  const handleClearKeyframe = useCallback((type: KeyframeType) => {
    setKeyframes((prev) =>
      prev.map((kf) =>
        kf.type === type
          ? { ...kf, timestamp: 0, frameNumber: 0, isMarked: false }
          : kf
      )
    );
  }, []);

  // Toggle marking mode
  const handleToggleMarkingMode = useCallback(() => {
    setIsMarkingMode((prev) => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // Handle tool selection
  const handleToolSelect = useCallback((tool: AnalysisToolType | null) => {
    setToolbarState((prev) => ({
      ...prev,
      isExpanded: tool !== null || prev.isExpanded,
      activeTool: tool,
    }));
  }, []);

  // Start analysis
  const handleStartAnalysis = useCallback(async () => {
    // Check if all keyframes are marked
    const allMarked = keyframes.every((kf) => !kf.isRequired || kf.isMarked);
    if (!allMarked) {
      // Show message to mark keyframes first
      return;
    }

    setIsAnalyzing(true);

    // Simulate analysis progress
    const steps: AnalysisProgress['status'][] = [
      'processing-video',
      'detecting-poses',
      'analyzing-swing',
      'generating-feedback',
      'complete',
    ];

    for (let i = 0; i < steps.length; i++) {
      setAnalysisProgress({
        status: steps[i],
        progress: ((i + 1) / steps.length) * 100,
        message: '',
        currentStep: i + 1,
        totalSteps: steps.length,
        estimatedTimeRemaining: (steps.length - i - 1) * 10,
      });

      if (steps[i] !== 'complete') {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Set mock results
    setIssues(MOCK_ISSUES);
    setOverallScore(78);
    setIsAnalyzing(false);
  }, [keyframes]);

  // Navigate to drill/lesson from analysis feedback
  const handleDrillPress = useCallback((drillId: string) => {
    router.push({
      pathname: '/learn/drill/[id]',
      params: { id: drillId, fromAnalysis: 'true' },
    });
  }, [router]);

  const handleLessonPress = useCallback((lessonId: string) => {
    router.push({
      pathname: '/learn/lesson/[id]',
      params: { id: lessonId, fromAnalysis: 'true' },
    });
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Video Player with overlays */}
      <View style={styles.videoContainer}>
        <VideoPlayer
          ref={videoRef}
          source={{ uri: videoUri || '' }}
          showControls={showControls}
          showTimeline={true}
          showFrameCounter={true}
          showSpeedControl={true}
          keyframes={keyframes}
          onKeyframePress={(kf) => handleNavigateToKeyframe(kf.timestamp)}
          onTimeUpdate={handleTimeUpdate}
          onLoad={handleVideoLoad}
          fps={30}
        >
          {/* Skeleton overlay */}
          {currentPose && (
            <SkeletonOverlay
              landmarks={currentPose}
              proModelLandmarks={showProOverlay ? proModelPose || undefined : undefined}
              config={skeletonConfig}
              proModelConfig={showProOverlay ? PRO_OVERLAY_CONFIG : undefined}
              containerWidth={SCREEN_WIDTH}
              containerHeight={SCREEN_HEIGHT * 0.6}
              showComparison={showProOverlay}
            />
          )}

          {/* Grid overlay would go here */}
          {toolbarState.showGrid && (
            <View style={styles.gridOverlay}>
              {/* Grid implementation */}
            </View>
          )}
        </VideoPlayer>

        {/* Analysis progress overlay */}
        {isAnalyzing && (
          <View style={styles.analysisOverlay}>
            <MiniAnalysisProgress progress={analysisProgress} />
          </View>
        )}
      </View>

      {/* Top bar */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </Pressable>

        <View style={styles.topBarCenter}>
          <Text variant="labelMedium" color="#FFF">
            Swing Analysis
          </Text>
        </View>

        <View style={styles.topBarActions}>
          {/* Skeleton toggle */}
          <Pressable
            style={[
              styles.topBarButton,
              skeletonConfig.visible && { backgroundColor: colors.primary },
            ]}
            onPress={() =>
              setSkeletonConfig((prev) => ({ ...prev, visible: !prev.visible }))
            }
          >
            <Ionicons
              name="body-outline"
              size={20}
              color={skeletonConfig.visible ? '#FFF' : '#888'}
            />
          </Pressable>

          {/* Pro overlay toggle */}
          <Pressable
            style={[
              styles.topBarButton,
              showProOverlay && { backgroundColor: colors.secondary },
            ]}
            onPress={() => setShowProOverlay((prev) => !prev)}
          >
            <Ionicons
              name="people-outline"
              size={20}
              color={showProOverlay ? '#FFF' : '#888'}
            />
          </Pressable>

          {/* Tools toggle */}
          <Pressable
            style={[
              styles.topBarButton,
              toolbarState.isExpanded && { backgroundColor: colors.primary },
            ]}
            onPress={() =>
              setToolbarState((prev) => ({ ...prev, isExpanded: !prev.isExpanded }))
            }
          >
            <Ionicons
              name="build-outline"
              size={20}
              color={toolbarState.isExpanded ? '#FFF' : '#888'}
            />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Analysis toolbar (collapsible) */}
      {toolbarState.isExpanded && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.toolbarContainer}
        >
          <AnalysisToolbar
            state={toolbarState}
            onToolSelect={handleToolSelect}
            onColorChange={(color) =>
              setToolbarState((prev) => ({ ...prev, activeColor: color }))
            }
            onLineWidthChange={(width) =>
              setToolbarState((prev) => ({ ...prev, lineWidth: width }))
            }
            onToggleGrid={() =>
              setToolbarState((prev) => ({ ...prev, showGrid: !prev.showGrid }))
            }
            onClearAnnotations={() =>
              setToolbarState((prev) => ({ ...prev, annotations: [] }))
            }
            onUndo={() => {}}
            onRedo={() => {}}
            position="right"
            canUndo={toolbarState.annotations.length > 0}
            canRedo={false}
          />
        </Animated.View>
      )}

      {/* Bottom panel */}
      {showBottomPanel && (
        <Animated.View
          entering={SlideInDown}
          exiting={SlideOutDown}
          style={styles.bottomPanel}
        >
          {/* Keyframe mini bar */}
          <View style={styles.keyframeMiniBar}>
            <MiniKeyframeBar
              keyframes={keyframes}
              currentTime={currentTime}
              duration={videoDuration}
              onNavigate={handleNavigateToKeyframe}
              onExpandPress={() => setShowKeyframePanel(true)}
            />

            {/* Analyze button */}
            <Button
              label={isAnalyzing ? 'Analyzing...' : 'Analyze Swing'}
              variant="primary"
              size="small"
              loading={isAnalyzing}
              disabled={isAnalyzing || !keyframes.every((kf) => !kf.isRequired || kf.isMarked)}
              onPress={handleStartAnalysis}
            />
          </View>

          {/* Feedback panel */}
          {(issues.length > 0 || overallScore !== undefined) && (
            <FeedbackPanel
              messages={messages}
              issues={issues}
              overallScore={overallScore}
              config={feedbackConfig}
              onConfigChange={(config) =>
                setFeedbackConfig((prev) => ({ ...prev, ...config }))
              }
              onDrillPress={handleDrillPress}
              onLessonPress={handleLessonPress}
              isAnalyzing={isAnalyzing}
              isExpanded={feedbackExpanded}
              onToggleExpand={() => setFeedbackExpanded((prev) => !prev)}
            />
          )}
        </Animated.View>
      )}

      {/* Keyframe marking panel (full screen when expanded) */}
      {showKeyframePanel && (
        <Animated.View
          entering={SlideInDown}
          exiting={SlideOutDown}
          style={styles.keyframePanelOverlay}
        >
          <Pressable
            style={styles.keyframePanelBackdrop}
            onPress={() => setShowKeyframePanel(false)}
          />
          <View style={styles.keyframePanelContent}>
            <KeyframeMarker
              keyframes={keyframes}
              currentTime={currentTime}
              duration={videoDuration}
              onMark={handleMarkKeyframe}
              onNavigate={handleNavigateToKeyframe}
              onClear={handleClearKeyframe}
              onClearAll={() => setKeyframes(createMockKeyframes())}
              isMarkingMode={isMarkingMode}
              onToggleMarkingMode={handleToggleMarkingMode}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  analysisOverlay: {
    position: 'absolute',
    bottom: 100,
    left: spacing[2],
    right: spacing[2],
  },

  // Top bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[2],
    paddingBottom: spacing[2],
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  topBarActions: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Toolbar container
  toolbarContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    zIndex: 100,
  },

  // Bottom panel
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingTop: spacing[3],
    paddingHorizontal: spacing[2],
    paddingBottom: spacing[6],
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
  },
  keyframeMiniBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
    paddingHorizontal: spacing[2],
  },

  // Keyframe panel overlay
  keyframePanelOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 200,
  },
  keyframePanelBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  keyframePanelContent: {
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
});

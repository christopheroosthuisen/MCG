/**
 * MCG Golf App - Video Analysis Types
 * Comprehensive types for video analysis, pose tracking, and AI coaching
 */

import { SwingPosition, BodyAngles, PoseLandmarks, SwingMetrics, DrillCategory } from './golf';

// ============================================
// VIDEO SOURCE TYPES
// ============================================

export type VideoSource = 'upload' | 'camera' | 'library';
export type CameraPosition = 'face-on' | 'down-the-line' | 'behind';

export interface VideoFile {
  id: string;
  uri: string;
  localUri?: string;
  duration: number;          // ms
  width: number;
  height: number;
  fps: number;
  fileSize: number;          // bytes
  mimeType: string;
  thumbnailUri?: string;
  createdAt: Date;
}

export interface VideoUploadGuidelines {
  cameraPosition: CameraPosition;
  tips: string[];
  warnings: string[];
  optimalSettings: {
    resolution: string;
    fps: number;
    lighting: string;
    distance: string;
    angle: string;
  };
}

// ============================================
// KEYFRAME / TIMESTAMP MARKERS
// ============================================

export type KeyframeType =
  | 'address'
  | 'backswing-start'
  | 'backswing-mid'
  | 'top-of-backswing'
  | 'downswing-start'
  | 'downswing-mid'
  | 'impact'
  | 'follow-through'
  | 'finish';

export interface Keyframe {
  id: string;
  type: KeyframeType;
  timestamp: number;         // ms from video start
  frameNumber: number;
  label: string;
  shortcut: string;          // keyboard shortcut (1, 2, 3, 4)
  color: string;
  isRequired: boolean;
  isMarked: boolean;
  markedAt?: Date;
  autoDetected?: boolean;
  confidence?: number;       // 0-1 if auto-detected
}

export interface KeyframeSet {
  videoId: string;
  keyframes: Keyframe[];
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Required keyframes for basic analysis
export const REQUIRED_KEYFRAMES: KeyframeType[] = [
  'backswing-start',
  'top-of-backswing',
  'impact',
  'finish',
];

// ============================================
// SKELETON / POSE OVERLAY
// ============================================

export interface SkeletonConfig {
  visible: boolean;
  color: string;
  opacity: number;
  lineWidth: number;
  jointSize: number;
  showLabels: boolean;
  showAngles: boolean;
  highlightedJoints: string[];
}

export interface PoseFrame {
  frameNumber: number;
  timestamp: number;
  landmarks: PoseLandmarks;
  angles: BodyAngles;
  confidence: number;
  isKeyframe: boolean;
}

export interface PoseTrackingResult {
  videoId: string;
  frames: PoseFrame[];
  averageConfidence: number;
  processedAt: Date;
  processingTime: number;    // ms
}

// ============================================
// PRO MODEL OVERLAY
// ============================================

export interface ProModel {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  category: 'driver' | 'iron' | 'wedge' | 'putter';
  swingType: 'full' | 'pitch' | 'chip' | 'putt';
  instructor?: string;
  poseData: PoseFrame[];
  videoUrl?: string;
  isPremium: boolean;
}

export interface ProModelOverlayConfig {
  visible: boolean;
  modelId: string;
  opacity: number;
  color: string;
  syncMode: 'keyframe' | 'time' | 'manual';
  offset: number;            // time offset in ms
  scale: number;             // size multiplier
  position: { x: number; y: number };
}

// ============================================
// ANALYSIS TOOLS
// ============================================

export type AnalysisToolType =
  | 'pointer'
  | 'line'
  | 'angle'
  | 'circle'
  | 'arrow'
  | 'freehand'
  | 'text'
  | 'measure'
  | 'grid'
  | 'spine-line'
  | 'swing-plane'
  | 'shoulder-line'
  | 'hip-line'
  | 'knee-line'
  | 'club-path'
  | 'face-angle';

export interface AnalysisTool {
  id: AnalysisToolType;
  name: string;
  description: string;
  icon: string;
  category: 'basic' | 'lines' | 'body' | 'club' | 'advanced';
  color: string;
  isPremium: boolean;
  shortcut?: string;
}

export interface DrawnAnnotation {
  id: string;
  toolType: AnalysisToolType;
  points: Array<{ x: number; y: number }>;
  frameNumber: number;
  color: string;
  lineWidth: number;
  text?: string;
  angle?: number;
  distance?: number;
  createdAt: Date;
  createdBy: 'user' | 'ai' | 'coach';
}

export interface AnalysisToolbarState {
  isExpanded: boolean;
  activeTool: AnalysisToolType | null;
  activeColor: string;
  lineWidth: number;
  annotations: DrawnAnnotation[];
  showGrid: boolean;
  gridSize: number;
}

// ============================================
// VIDEO PLAYER STATE
// ============================================

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;       // ms
  duration: number;          // ms
  currentFrame: number;
  totalFrames: number;
  playbackSpeed: number;     // 0.25, 0.5, 1, 1.5, 2
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  loopRange?: { start: number; end: number };
  zoomLevel: number;
  panOffset: { x: number; y: number };
}

export interface VideoControlsConfig {
  showTimeline: boolean;
  showFrameCounter: boolean;
  showSpeedControl: boolean;
  showKeyframeMarkers: boolean;
  showZoomControls: boolean;
  enableScrubbing: boolean;
  enableFrameStep: boolean;
  enableLooping: boolean;
}

// ============================================
// ANALYSIS SESSION
// ============================================

export type AnalysisStatus =
  | 'idle'
  | 'uploading'
  | 'processing-video'
  | 'detecting-poses'
  | 'analyzing-swing'
  | 'generating-feedback'
  | 'complete'
  | 'error';

export interface AnalysisProgress {
  status: AnalysisStatus;
  progress: number;          // 0-100
  message: string;
  estimatedTimeRemaining?: number; // seconds
  currentStep: number;
  totalSteps: number;
}

export interface SwingIssue {
  id: string;
  severity: 'critical' | 'warning' | 'suggestion';
  position: KeyframeType;
  title: string;
  description: string;
  solution: string;
  affectedAngles?: string[];
  idealRange?: { min: number; max: number };
  actualValue?: number;
  relatedDrills: string[];   // drill IDs
  relatedLessons: string[];  // lesson IDs
  timestamp: number;
  frameNumber: number;
}

export interface AnalysisResult {
  id: string;
  videoId: string;
  userId: string;
  status: AnalysisStatus;
  progress: AnalysisProgress;

  // Keyframes
  keyframes: KeyframeSet;

  // Pose data
  poseTracking?: PoseTrackingResult;

  // Swing metrics
  swingMetrics?: SwingMetrics;

  // Issues and feedback
  issues: SwingIssue[];
  overallScore: number;
  positionScores: Partial<Record<KeyframeType, number>>;

  // Annotations
  annotations: DrawnAnnotation[];

  // AI summary
  aiSummary?: string;

  // Related content
  recommendedDrills: string[];
  recommendedLessons: string[];

  // Timestamps
  createdAt: Date;
  completedAt?: Date;
  processingTime?: number;
}

// ============================================
// FEEDBACK SYSTEM
// ============================================

export type FeedbackMode = 'text' | 'voice' | 'both' | 'realtime';

export interface FeedbackConfig {
  mode: FeedbackMode;
  voiceEnabled: boolean;
  voiceSpeed: number;        // 0.5 - 2
  voiceVolume: number;       // 0 - 1
  voicePitch: number;        // 0.5 - 2
  voiceGender: 'male' | 'female';
  autoPlay: boolean;
  showSubtitles: boolean;
  realtimeDelay: number;     // ms delay for realtime feedback
}

export interface FeedbackMessage {
  id: string;
  type: 'tip' | 'correction' | 'praise' | 'instruction' | 'warning';
  content: string;
  audioUrl?: string;
  timestamp?: number;        // video timestamp this relates to
  position?: KeyframeType;
  priority: 'high' | 'medium' | 'low';
  relatedIssueId?: string;
  relatedDrillId?: string;
  relatedLessonId?: string;
  createdAt: Date;
}

export interface CoachingSession {
  id: string;
  analysisId: string;
  feedbackConfig: FeedbackConfig;
  messages: FeedbackMessage[];
  isLive: boolean;
  startedAt: Date;
  endedAt?: Date;
}

// ============================================
// LIVE CAMERA ANALYSIS
// ============================================

export interface LiveAnalysisConfig {
  cameraPosition: CameraPosition;
  showSkeleton: boolean;
  showRealTimeFeedback: boolean;
  showProOverlay: boolean;
  proModelId?: string;
  audioFeedback: boolean;
  hapticFeedback: boolean;
  recordingEnabled: boolean;
  analysisInterval: number;  // ms between pose analyses
}

export interface LiveAnalysisState {
  isActive: boolean;
  isRecording: boolean;
  currentPose?: PoseLandmarks;
  currentAngles?: BodyAngles;
  realtimeScore?: number;
  realtimeFeedback?: FeedbackMessage[];
  frameRate: number;
  latency: number;           // processing latency in ms
}

// ============================================
// COMPARISON VIEW
// ============================================

export interface ComparisonConfig {
  mode: 'side-by-side' | 'overlay' | 'split';
  syncMode: 'keyframe' | 'time';
  primaryVideoId: string;
  secondaryVideoId: string;  // or pro model ID
  primaryKeyframe: KeyframeType;
  secondaryKeyframe: KeyframeType;
}

// ============================================
// VIEW PREFERENCES
// ============================================

export interface AnalysisViewPreferences {
  defaultCameraPosition: CameraPosition;
  defaultPlaybackSpeed: number;
  showSkeletonByDefault: boolean;
  skeletonColor: string;
  annotationColor: string;
  autoPlayFeedback: boolean;
  feedbackMode: FeedbackMode;
  toolbarPosition: 'left' | 'right';
  showTipsOnUpload: boolean;
}

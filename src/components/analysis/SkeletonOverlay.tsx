/**
 * MCG Golf App - Skeleton Overlay Component
 * Renders pose skeleton and pro model overlay on video
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Line,
  Circle,
  G,
  Text as SvgText,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  withTiming,
  SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { PoseLandmarks, SkeletonConfig, BodyAngles } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================

interface SkeletonOverlayProps {
  landmarks?: PoseLandmarks;
  proModelLandmarks?: PoseLandmarks;
  config: SkeletonConfig;
  proModelConfig?: {
    visible: boolean;
    color: string;
    opacity: number;
  };
  angles?: BodyAngles;
  containerWidth: number;
  containerHeight: number;
  showComparison?: boolean;
}

interface Point {
  x: number;
  y: number;
}

// ============================================
// SKELETON CONNECTIONS
// ============================================

// Define the connections between body parts for drawing lines
const SKELETON_CONNECTIONS: [keyof PoseLandmarks, keyof PoseLandmarks][] = [
  // Torso
  ['leftShoulder', 'rightShoulder'],
  ['leftShoulder', 'leftHip'],
  ['rightShoulder', 'rightHip'],
  ['leftHip', 'rightHip'],

  // Left arm
  ['leftShoulder', 'leftElbow'],
  ['leftElbow', 'leftWrist'],

  // Right arm
  ['rightShoulder', 'rightElbow'],
  ['rightElbow', 'rightWrist'],

  // Left leg
  ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftAnkle'],

  // Right leg
  ['rightHip', 'rightKnee'],
  ['rightKnee', 'rightAnkle'],

  // Spine (virtual line from hip center to shoulder center)
  // This will be drawn separately
];

// Joint labels for display
const JOINT_LABELS: Partial<Record<keyof PoseLandmarks, string>> = {
  leftShoulder: 'L.Shoulder',
  rightShoulder: 'R.Shoulder',
  leftElbow: 'L.Elbow',
  rightElbow: 'R.Elbow',
  leftWrist: 'L.Wrist',
  rightWrist: 'R.Wrist',
  leftHip: 'L.Hip',
  rightHip: 'R.Hip',
  leftKnee: 'L.Knee',
  rightKnee: 'R.Knee',
  leftAnkle: 'L.Ankle',
  rightAnkle: 'R.Ankle',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const scalePoint = (
  point: { x: number; y: number },
  containerWidth: number,
  containerHeight: number
): Point => ({
  x: point.x * containerWidth,
  y: point.y * containerHeight,
});

const getMidpoint = (p1: Point, p2: Point): Point => ({
  x: (p1.x + p2.x) / 2,
  y: (p1.y + p2.y) / 2,
});

const calculateAngle = (p1: Point, p2: Point, p3: Point): number => {
  const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
  const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
  let angle = Math.abs((angle1 - angle2) * (180 / Math.PI));
  if (angle > 180) angle = 360 - angle;
  return Math.round(angle);
};

// ============================================
// SKELETON OVERLAY COMPONENT
// ============================================

export function SkeletonOverlay({
  landmarks,
  proModelLandmarks,
  config,
  proModelConfig,
  angles,
  containerWidth,
  containerHeight,
  showComparison = false,
}: SkeletonOverlayProps) {
  const { colors } = useTheme();

  // Scale landmarks to container size
  const scaledLandmarks = useMemo(() => {
    if (!landmarks) return null;
    const scaled: Record<string, Point> = {};
    Object.entries(landmarks).forEach(([key, value]) => {
      if (value && typeof value.position === 'object') {
        scaled[key] = scalePoint(value.position, containerWidth, containerHeight);
      }
    });
    return scaled;
  }, [landmarks, containerWidth, containerHeight]);

  const scaledProModelLandmarks = useMemo(() => {
    if (!proModelLandmarks) return null;
    const scaled: Record<string, Point> = {};
    Object.entries(proModelLandmarks).forEach(([key, value]) => {
      if (value && typeof value.position === 'object') {
        scaled[key] = scalePoint(value.position, containerWidth, containerHeight);
      }
    });
    return scaled;
  }, [proModelLandmarks, containerWidth, containerHeight]);

  if (!config.visible || !scaledLandmarks) return null;

  // Calculate derived points
  const hipCenter = scaledLandmarks.leftHip && scaledLandmarks.rightHip
    ? getMidpoint(scaledLandmarks.leftHip, scaledLandmarks.rightHip)
    : null;

  const shoulderCenter = scaledLandmarks.leftShoulder && scaledLandmarks.rightShoulder
    ? getMidpoint(scaledLandmarks.leftShoulder, scaledLandmarks.rightShoulder)
    : null;

  // Calculate angles to display
  const displayAngles: Array<{ point: Point; angle: number; label: string }> = [];

  if (config.showAngles && scaledLandmarks) {
    // Left elbow angle
    if (scaledLandmarks.leftShoulder && scaledLandmarks.leftElbow && scaledLandmarks.leftWrist) {
      const angle = calculateAngle(
        scaledLandmarks.leftShoulder,
        scaledLandmarks.leftElbow,
        scaledLandmarks.leftWrist
      );
      displayAngles.push({
        point: scaledLandmarks.leftElbow,
        angle,
        label: `${angle}°`,
      });
    }

    // Right elbow angle
    if (scaledLandmarks.rightShoulder && scaledLandmarks.rightElbow && scaledLandmarks.rightWrist) {
      const angle = calculateAngle(
        scaledLandmarks.rightShoulder,
        scaledLandmarks.rightElbow,
        scaledLandmarks.rightWrist
      );
      displayAngles.push({
        point: scaledLandmarks.rightElbow,
        angle,
        label: `${angle}°`,
      });
    }

    // Left knee angle
    if (scaledLandmarks.leftHip && scaledLandmarks.leftKnee && scaledLandmarks.leftAnkle) {
      const angle = calculateAngle(
        scaledLandmarks.leftHip,
        scaledLandmarks.leftKnee,
        scaledLandmarks.leftAnkle
      );
      displayAngles.push({
        point: scaledLandmarks.leftKnee,
        angle,
        label: `${angle}°`,
      });
    }
  }

  return (
    <Svg
      width={containerWidth}
      height={containerHeight}
      style={StyleSheet.absoluteFill}
    >
      <Defs>
        {/* Gradient for skeleton lines */}
        <LinearGradient id="skeletonGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={config.color} stopOpacity={config.opacity} />
          <Stop offset="1" stopColor={config.color} stopOpacity={config.opacity * 0.7} />
        </LinearGradient>

        {/* Gradient for pro model */}
        <LinearGradient id="proModelGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={proModelConfig?.color || '#00FFFF'} stopOpacity={proModelConfig?.opacity || 0.5} />
          <Stop offset="1" stopColor={proModelConfig?.color || '#00FFFF'} stopOpacity={(proModelConfig?.opacity || 0.5) * 0.7} />
        </LinearGradient>
      </Defs>

      {/* Pro model skeleton (drawn first, behind user skeleton) */}
      {proModelConfig?.visible && scaledProModelLandmarks && (
        <G opacity={proModelConfig.opacity}>
          {/* Pro model connections */}
          {SKELETON_CONNECTIONS.map(([start, end], index) => {
            const startPoint = scaledProModelLandmarks[start];
            const endPoint = scaledProModelLandmarks[end];
            if (!startPoint || !endPoint) return null;

            return (
              <Line
                key={`pro-line-${index}`}
                x1={startPoint.x}
                y1={startPoint.y}
                x2={endPoint.x}
                y2={endPoint.y}
                stroke={proModelConfig.color}
                strokeWidth={config.lineWidth - 1}
                strokeLinecap="round"
                strokeDasharray="5,5"
              />
            );
          })}

          {/* Pro model joints */}
          {Object.entries(scaledProModelLandmarks).map(([key, point]) => (
            <Circle
              key={`pro-joint-${key}`}
              cx={point.x}
              cy={point.y}
              r={config.jointSize - 2}
              fill={proModelConfig.color}
              opacity={0.5}
            />
          ))}
        </G>
      )}

      {/* User skeleton connections */}
      <G>
        {SKELETON_CONNECTIONS.map(([start, end], index) => {
          const startPoint = scaledLandmarks[start];
          const endPoint = scaledLandmarks[end];
          if (!startPoint || !endPoint) return null;

          const isHighlighted =
            config.highlightedJoints.includes(start) ||
            config.highlightedJoints.includes(end);

          return (
            <Line
              key={`line-${index}`}
              x1={startPoint.x}
              y1={startPoint.y}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke={isHighlighted ? colors.primary : config.color}
              strokeWidth={isHighlighted ? config.lineWidth + 2 : config.lineWidth}
              strokeLinecap="round"
              opacity={config.opacity}
            />
          );
        })}

        {/* Spine line */}
        {hipCenter && shoulderCenter && (
          <Line
            x1={hipCenter.x}
            y1={hipCenter.y}
            x2={shoulderCenter.x}
            y2={shoulderCenter.y}
            stroke={config.color}
            strokeWidth={config.lineWidth + 1}
            strokeLinecap="round"
            strokeDasharray="8,4"
            opacity={config.opacity}
          />
        )}
      </G>

      {/* User joints */}
      <G>
        {Object.entries(scaledLandmarks).map(([key, point]) => {
          const isHighlighted = config.highlightedJoints.includes(key);
          const jointRadius = isHighlighted ? config.jointSize + 4 : config.jointSize;

          return (
            <G key={`joint-${key}`}>
              {/* Outer glow for highlighted joints */}
              {isHighlighted && (
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={jointRadius + 4}
                  fill={colors.primary}
                  opacity={0.3}
                />
              )}

              {/* Joint circle */}
              <Circle
                cx={point.x}
                cy={point.y}
                r={jointRadius}
                fill={isHighlighted ? colors.primary : config.color}
                stroke="#FFFFFF"
                strokeWidth={2}
                opacity={config.opacity}
              />

              {/* Joint label */}
              {config.showLabels && JOINT_LABELS[key as keyof PoseLandmarks] && (
                <SvgText
                  x={point.x + jointRadius + 4}
                  y={point.y + 4}
                  fill="#FFFFFF"
                  fontSize={10}
                  fontWeight="bold"
                  opacity={0.8}
                >
                  {JOINT_LABELS[key as keyof PoseLandmarks]}
                </SvgText>
              )}
            </G>
          );
        })}
      </G>

      {/* Angle displays */}
      <G>
        {displayAngles.map((item, index) => (
          <G key={`angle-${index}`}>
            {/* Angle background */}
            <Circle
              cx={item.point.x}
              cy={item.point.y - 20}
              r={16}
              fill="rgba(0,0,0,0.7)"
            />
            {/* Angle text */}
            <SvgText
              x={item.point.x}
              y={item.point.y - 16}
              fill="#FFFFFF"
              fontSize={11}
              fontWeight="bold"
              textAnchor="middle"
            >
              {item.label}
            </SvgText>
          </G>
        ))}
      </G>

      {/* Comparison lines (if showing comparison with pro model) */}
      {showComparison && scaledProModelLandmarks && (
        <G opacity={0.6}>
          {Object.entries(scaledLandmarks).map(([key, userPoint]) => {
            const proPoint = scaledProModelLandmarks[key];
            if (!proPoint) return null;

            // Draw a line connecting user joint to pro model joint
            return (
              <Line
                key={`comparison-${key}`}
                x1={userPoint.x}
                y1={userPoint.y}
                x2={proPoint.x}
                y2={proPoint.y}
                stroke={colors.warning}
                strokeWidth={1}
                strokeDasharray="3,3"
              />
            );
          })}
        </G>
      )}
    </Svg>
  );
}

// ============================================
// SKELETON CONFIG PRESETS
// ============================================

export const DEFAULT_SKELETON_CONFIG: SkeletonConfig = {
  visible: true,
  color: '#00FFFF', // Cyan
  opacity: 0.9,
  lineWidth: 3,
  jointSize: 6,
  showLabels: false,
  showAngles: true,
  highlightedJoints: [],
};

export const PRO_OVERLAY_CONFIG = {
  visible: true,
  color: '#FF00FF', // Magenta
  opacity: 0.5,
};

export const MINIMAL_SKELETON_CONFIG: SkeletonConfig = {
  ...DEFAULT_SKELETON_CONFIG,
  showLabels: false,
  showAngles: false,
  lineWidth: 2,
  jointSize: 4,
};

export const DETAILED_SKELETON_CONFIG: SkeletonConfig = {
  ...DEFAULT_SKELETON_CONFIG,
  showLabels: true,
  showAngles: true,
  lineWidth: 4,
  jointSize: 8,
};

export default SkeletonOverlay;

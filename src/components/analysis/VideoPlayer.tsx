/**
 * MCG Golf App - Video Player Component
 * Custom video player with frame-accurate controls for swing analysis
 */

import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius } from '@/design';
import { Text } from '@/components/ui';
import { VideoPlayerState, Keyframe } from '@/types/analysis';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================

export interface VideoPlayerRef {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seekTo: (positionMs: number) => Promise<void>;
  stepForward: () => Promise<void>;
  stepBackward: () => Promise<void>;
  setPlaybackSpeed: (speed: number) => void;
  getCurrentTime: () => number;
  getCurrentFrame: () => number;
  getState: () => VideoPlayerState;
}

interface VideoPlayerProps {
  source: { uri: string };
  style?: any;
  showControls?: boolean;
  showTimeline?: boolean;
  showFrameCounter?: boolean;
  showSpeedControl?: boolean;
  keyframes?: Keyframe[];
  onKeyframePress?: (keyframe: Keyframe) => void;
  onTimeUpdate?: (timeMs: number, frame: number) => void;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  onLoad?: (duration: number, fps: number) => void;
  children?: React.ReactNode; // For overlays (skeleton, annotations, etc.)
  fps?: number;
}

// ============================================
// PLAYBACK SPEEDS
// ============================================

const PLAYBACK_SPEEDS = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2];

// ============================================
// VIDEO PLAYER COMPONENT
// ============================================

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  (
    {
      source,
      style,
      showControls = true,
      showTimeline = true,
      showFrameCounter = true,
      showSpeedControl = true,
      keyframes = [],
      onKeyframePress,
      onTimeUpdate,
      onPlaybackStateChange,
      onLoad,
      children,
      fps = 30,
    },
    ref
  ) => {
    const { colors } = useTheme();
    const videoRef = useRef<Video>(null);

    // Player state
    const [state, setState] = useState<VideoPlayerState>({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      currentFrame: 0,
      totalFrames: 0,
      playbackSpeed: 1,
      volume: 1,
      isMuted: true,
      isLooping: false,
      zoomLevel: 1,
      panOffset: { x: 0, y: 0 },
    });

    const [controlsVisible, setControlsVisible] = useState(true);
    const [isScrubbing, setIsScrubbing] = useState(false);

    // Animated values
    const controlsOpacity = useSharedValue(1);
    const progressPosition = useSharedValue(0);

    // Auto-hide controls
    useEffect(() => {
      if (state.isPlaying && controlsVisible) {
        const timer = setTimeout(() => {
          controlsOpacity.value = withTiming(0, { duration: 300 });
          setControlsVisible(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [state.isPlaying, controlsVisible]);

    // Show controls on tap
    const handleTap = useCallback(() => {
      if (!controlsVisible) {
        controlsOpacity.value = withTiming(1, { duration: 200 });
        setControlsVisible(true);
      }
    }, [controlsVisible]);

    // Playback controls
    const play = useCallback(async () => {
      await videoRef.current?.playAsync();
    }, []);

    const pause = useCallback(async () => {
      await videoRef.current?.pauseAsync();
    }, []);

    const togglePlayPause = useCallback(async () => {
      if (state.isPlaying) {
        await pause();
      } else {
        await play();
      }
    }, [state.isPlaying, play, pause]);

    const seekTo = useCallback(async (positionMs: number) => {
      await videoRef.current?.setPositionAsync(positionMs);
    }, []);

    const stepForward = useCallback(async () => {
      const frameDuration = 1000 / fps;
      const newPosition = Math.min(state.currentTime + frameDuration, state.duration);
      await seekTo(newPosition);
    }, [state.currentTime, state.duration, fps, seekTo]);

    const stepBackward = useCallback(async () => {
      const frameDuration = 1000 / fps;
      const newPosition = Math.max(state.currentTime - frameDuration, 0);
      await seekTo(newPosition);
    }, [state.currentTime, fps, seekTo]);

    const setPlaybackSpeed = useCallback((speed: number) => {
      videoRef.current?.setRateAsync(speed, true);
      setState((prev) => ({ ...prev, playbackSpeed: speed }));
    }, []);

    const cycleSpeed = useCallback(() => {
      const currentIndex = PLAYBACK_SPEEDS.indexOf(state.playbackSpeed);
      const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
      setPlaybackSpeed(PLAYBACK_SPEEDS[nextIndex]);
    }, [state.playbackSpeed, setPlaybackSpeed]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      play,
      pause,
      seekTo,
      stepForward,
      stepBackward,
      setPlaybackSpeed,
      getCurrentTime: () => state.currentTime,
      getCurrentFrame: () => state.currentFrame,
      getState: () => state,
    }));

    // Handle playback status updates
    const handlePlaybackStatusUpdate = useCallback(
      (status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;

        const currentTime = status.positionMillis;
        const duration = status.durationMillis || 0;
        const isPlaying = status.isPlaying;
        const currentFrame = Math.floor((currentTime / 1000) * fps);
        const totalFrames = Math.floor((duration / 1000) * fps);

        setState((prev) => ({
          ...prev,
          currentTime,
          duration,
          isPlaying,
          currentFrame,
          totalFrames,
        }));

        // Update progress bar
        if (!isScrubbing && duration > 0) {
          progressPosition.value = currentTime / duration;
        }

        // Callbacks
        onTimeUpdate?.(currentTime, currentFrame);
        if (prev.isPlaying !== isPlaying) {
          onPlaybackStateChange?.(isPlaying);
        }
      },
      [fps, isScrubbing, onTimeUpdate, onPlaybackStateChange]
    );

    // Handle video load
    const handleLoad = useCallback(
      (status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;
        const duration = status.durationMillis || 0;
        onLoad?.(duration, fps);
      },
      [fps, onLoad]
    );

    // Timeline scrubbing
    const handleTimelinePress = useCallback(
      (event: GestureResponderEvent) => {
        const { locationX } = event.nativeEvent;
        const timelineWidth = SCREEN_WIDTH - spacing[8] * 2;
        const progress = Math.max(0, Math.min(1, locationX / timelineWidth));
        const seekPosition = progress * state.duration;
        seekTo(seekPosition);
      },
      [state.duration, seekTo]
    );

    // Format time display
    const formatTime = (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const frames = Math.floor((ms % 1000) / (1000 / fps));
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`;
    };

    // Animated styles
    const controlsAnimatedStyle = useAnimatedStyle(() => ({
      opacity: controlsOpacity.value,
    }));

    const progressAnimatedStyle = useAnimatedStyle(() => ({
      width: `${progressPosition.value * 100}%`,
    }));

    return (
      <Pressable style={[styles.container, style]} onPress={handleTap}>
        {/* Video */}
        <Video
          ref={videoRef}
          source={source}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isMuted={state.isMuted}
          isLooping={state.isLooping}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onLoad={handleLoad}
        />

        {/* Overlay children (skeleton, annotations, etc.) */}
        <View style={styles.overlayContainer} pointerEvents="box-none">
          {children}
        </View>

        {/* Controls overlay */}
        {showControls && (
          <Animated.View style={[styles.controlsOverlay, controlsAnimatedStyle]}>
            {/* Top bar - frame counter and speed */}
            <View style={[styles.topBar, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
              {showFrameCounter && (
                <View style={styles.frameCounter}>
                  <Text variant="metricUnit" color="#FFFFFF">
                    Frame {state.currentFrame} / {state.totalFrames}
                  </Text>
                </View>
              )}

              {showSpeedControl && (
                <Pressable style={styles.speedButton} onPress={cycleSpeed}>
                  <Text variant="labelSmall" color="#FFFFFF">
                    {state.playbackSpeed}x
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Center play/pause */}
            <View style={styles.centerControls}>
              <Pressable
                style={[styles.playButton, { backgroundColor: colors.primary }]}
                onPress={togglePlayPause}
              >
                <Ionicons
                  name={state.isPlaying ? 'pause' : 'play'}
                  size={32}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>

            {/* Bottom controls */}
            <View style={[styles.bottomBar, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
              {/* Frame step controls */}
              <View style={styles.frameControls}>
                <Pressable style={styles.frameButton} onPress={stepBackward}>
                  <Ionicons name="play-back" size={20} color="#FFFFFF" />
                </Pressable>

                <Pressable style={styles.frameButton} onPress={togglePlayPause}>
                  <Ionicons
                    name={state.isPlaying ? 'pause' : 'play'}
                    size={24}
                    color="#FFFFFF"
                  />
                </Pressable>

                <Pressable style={styles.frameButton} onPress={stepForward}>
                  <Ionicons name="play-forward" size={20} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Time display */}
              <View style={styles.timeDisplay}>
                <Text variant="metricUnit" color="#FFFFFF">
                  {formatTime(state.currentTime)}
                </Text>
                <Text variant="metricUnit" color="rgba(255,255,255,0.5)">
                  {' / '}
                </Text>
                <Text variant="metricUnit" color="rgba(255,255,255,0.5)">
                  {formatTime(state.duration)}
                </Text>
              </View>

              {/* Timeline */}
              {showTimeline && (
                <Pressable
                  style={styles.timeline}
                  onPress={handleTimelinePress}
                >
                  {/* Track */}
                  <View style={[styles.timelineTrack, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                    {/* Progress */}
                    <Animated.View
                      style={[
                        styles.timelineProgress,
                        { backgroundColor: colors.primary },
                        progressAnimatedStyle,
                      ]}
                    />

                    {/* Keyframe markers */}
                    {keyframes.map((keyframe) => {
                      const position = state.duration > 0
                        ? (keyframe.timestamp / state.duration) * 100
                        : 0;
                      return (
                        <Pressable
                          key={keyframe.id}
                          style={[
                            styles.keyframeMarker,
                            {
                              left: `${position}%`,
                              backgroundColor: keyframe.isMarked
                                ? keyframe.color
                                : 'rgba(255,255,255,0.5)',
                            },
                          ]}
                          onPress={() => {
                            seekTo(keyframe.timestamp);
                            onKeyframePress?.(keyframe);
                          }}
                        />
                      );
                    })}
                  </View>

                  {/* Scrubber handle */}
                  <Animated.View
                    style={[
                      styles.scrubber,
                      { backgroundColor: colors.primary },
                      { left: `${(state.currentTime / state.duration) * 100}%` },
                    ]}
                  />
                </Pressable>
              )}
            </View>
          </Animated.View>
        )}
      </Pressable>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    paddingTop: spacing[6],
  },
  frameCounter: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: radius.md,
  },
  speedButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.md,
  },

  // Center controls
  centerControls: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 8,
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    paddingBottom: spacing[6],
  },
  frameControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[6],
    marginBottom: spacing[3],
  },
  frameButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },

  // Timeline
  timeline: {
    height: 24,
    justifyContent: 'center',
    marginHorizontal: spacing[2],
  },
  timelineTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  timelineProgress: {
    height: '100%',
    borderRadius: 2,
  },
  keyframeMarker: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scrubber: {
    position: 'absolute',
    top: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
});

export default VideoPlayer;

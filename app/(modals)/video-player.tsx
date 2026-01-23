/**
 * MCG Golf App - Video Player Modal
 * Full-screen video playback modal
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius } from '@/design';
import { Text, Button } from '@/components/ui';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VideoPlayerModal() {
  const { colors } = useTheme();
  const router = useRouter();
  const { uri, title } = useLocalSearchParams<{ uri: string; title?: string }>();

  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Auto-hide controls
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const controlsOpacity = useSharedValue(1);

  const resetControlsTimer = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    setShowControls(true);
    controlsOpacity.value = withTiming(1, { duration: 200 });

    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        controlsOpacity.value = withTiming(0, { duration: 300 });
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying, controlsOpacity]);

  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setDuration(status.durationMillis || 0);
      setCurrentTime(status.positionMillis || 0);
      setProgress(
        status.durationMillis
          ? (status.positionMillis || 0) / status.durationMillis
          : 0
      );
    }
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    resetControlsTimer();
  }, [isPlaying, resetControlsTimer]);

  const handleSeek = useCallback(async (value: number) => {
    if (!videoRef.current || !duration) return;
    await videoRef.current.setPositionAsync(value * duration);
  }, [duration]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Video */}
      <Pressable style={styles.videoContainer} onPress={resetControlsTimer}>
        {uri ? (
          <Video
            ref={videoRef}
            source={{ uri }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.backgroundTertiary }]}>
            <Ionicons name="videocam-off" size={48} color={colors.textMuted} />
            <Text variant="bodyMedium" color={colors.textMuted} style={styles.placeholderText}>
              No video provided
            </Text>
          </View>
        )}
      </Pressable>

      {/* Controls Overlay */}
      {showControls && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[styles.controlsOverlay, controlsAnimatedStyle]}
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={28} color="#FFF" />
            </Pressable>
            {title && (
              <Text variant="labelMedium" color="#FFF" numberOfLines={1} style={styles.title}>
                {title}
              </Text>
            )}
            <View style={styles.closeButton} />
          </View>

          {/* Center play/pause */}
          <Pressable style={styles.centerControl} onPress={togglePlayPause}>
            <View style={styles.playButton}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={40}
                color="#FFF"
              />
            </View>
          </Pressable>

          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            {/* Progress bar */}
            <Pressable
              style={styles.progressBarContainer}
              onPress={(e) => {
                const x = e.nativeEvent.locationX;
                const width = SCREEN_WIDTH - spacing[8];
                handleSeek(x / width);
              }}
            >
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progress * 100}%`, backgroundColor: colors.primary },
                  ]}
                />
              </View>
            </Pressable>

            {/* Time */}
            <View style={styles.timeRow}>
              <Text variant="caption" color="#FFF">
                {formatTime(currentTime)}
              </Text>
              <Text variant="caption" color="#FFF">
                {formatTime(duration)}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  placeholder: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: spacing[3],
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[12],
    paddingHorizontal: spacing[4],
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing[2],
  },
  centerControl: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[8],
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  progressBarContainer: {
    height: 40,
    justifyContent: 'center',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[1],
  },
});

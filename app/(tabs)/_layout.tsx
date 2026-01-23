/**
 * MCG Golf App - Tab Navigation Layout
 * Bottom tab bar with animated icons and smooth transitions
 */

import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius, shadowsIOS } from '@/design';
import { Text } from '@/components/ui';

type TabIconName = keyof typeof Ionicons.glyphMap;

interface AnimatedTabIconProps {
  name: TabIconName;
  nameOutline: TabIconName;
  focused: boolean;
  color: string;
  label: string;
}

// Animated Tab Icon Component
function AnimatedTabIcon({ name, nameOutline, focused, color, label }: AnimatedTabIconProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(focused ? 1 : 0);
  const translateY = useSharedValue(focused ? 0 : 0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0, {
      damping: 15,
      stiffness: 400,
    });
    translateY.value = withSpring(focused ? -2 : 0, {
      damping: 15,
      stiffness: 400,
    });
  }, [focused, scale, translateY]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: interpolate(scale.value, [0, 1], [1, 1.05]) },
    ],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: scale.value,
    transform: [{ scale: interpolate(scale.value, [0, 1], [0.8, 1]) }],
  }));

  return (
    <Animated.View style={[styles.iconContainer, containerAnimatedStyle]}>
      <Animated.View
        style={[
          styles.iconBackground,
          { backgroundColor: colors.primaryMuted },
          backgroundAnimatedStyle,
        ]}
      />
      <Ionicons
        name={focused ? name : nameOutline}
        size={22}
        color={color}
      />
    </Animated.View>
  );
}

// Custom Tab Bar Button with scale animation
function TabBarButton({
  onPress,
  onLongPress,
  children,
  accessibilityState,
}: {
  onPress: () => void;
  onLongPress: () => void;
  children: React.ReactNode;
  accessibilityState?: { selected?: boolean };
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabBarButton}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
}

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarIcon,
        tabBarButton: (props) => (
          <TabBarButton
            onPress={props.onPress || (() => {})}
            onLongPress={props.onLongPress || (() => {})}
            accessibilityState={props.accessibilityState}
          >
            {props.children}
          </TabBarButton>
        ),
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingTop: spacing[2],
          paddingBottom: Platform.OS === 'ios' ? spacing[7] : spacing[3],
          ...shadowsIOS.xl,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: spacing[1],
        },
        tabBarItemStyle: {
          paddingTop: spacing[1],
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon
              name="home"
              nameOutline="home-outline"
              focused={focused}
              color={color}
              label="Home"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon
              name="golf"
              nameOutline="golf-outline"
              focused={focused}
              color={color}
              label="Practice"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="analyze"
        options={{
          title: 'Analyze',
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon
              name="videocam"
              nameOutline="videocam-outline"
              focused={focused}
              color={color}
              label="Analyze"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon
              name="school"
              nameOutline="school-outline"
              focused={focused}
              color={color}
              label="Learn"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon
              name="person"
              nameOutline="person-outline"
              focused={focused}
              color={color}
              label="Profile"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 48,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBackground: {
    position: 'absolute',
    width: 48,
    height: 32,
    borderRadius: radius.lg,
  },
  tabBarButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

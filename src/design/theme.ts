/**
 * MCG Golf App - Theme System
 * Unified theme combining all design tokens
 */

import { colors } from './colors';
import { fontFamilies, fontWeights, fontSizes, lineHeights, letterSpacing, textStyles } from './typography';
import { spacing, radius, shadowsIOS, elevation, layout, zIndex, durations, hitSlop } from './spacing';

// Light theme (default)
export const lightTheme = {
  dark: false,
  colors: {
    // Core
    primary: colors.primary.orange,
    primaryLight: colors.primary.orangeLight,
    primaryDark: colors.primary.orangeDark,
    primaryMuted: colors.primary.orangeMuted,

    secondary: colors.secondary.green,
    secondaryLight: colors.secondary.greenLight,
    secondaryDark: colors.secondary.greenDark,
    secondaryMuted: colors.secondary.greenMuted,

    // Backgrounds
    background: colors.background.primary,
    backgroundSecondary: colors.background.secondary,
    backgroundTertiary: colors.background.tertiary,

    // Surfaces (cards, modals, etc.)
    surface: colors.neutral.white,
    surfaceElevated: colors.neutral.white,

    // Text
    text: colors.text.primary,
    textHeading: colors.text.heading,
    textSecondary: colors.text.secondary,
    textMuted: colors.text.muted,
    textInverse: colors.text.inverse,
    textLink: colors.text.link,

    // Borders
    border: colors.neutral.lightGray,
    borderFocused: colors.primary.orange,

    // Semantic
    success: colors.semantic.success,
    successLight: colors.semantic.successLight,
    warning: colors.semantic.warning,
    warningLight: colors.semantic.warningLight,
    error: colors.semantic.error,
    errorLight: colors.semantic.errorLight,
    info: colors.semantic.info,
    infoLight: colors.semantic.infoLight,

    // Navigation
    tabBar: colors.neutral.white,
    tabBarIcon: colors.text.muted,
    tabBarIconActive: colors.primary.orange,

    // Overlay
    overlay: colors.background.overlay,

    // Golf-specific
    fairway: colors.golf.fairway,
    rough: colors.golf.rough,
    bunker: colors.golf.bunker,
    water: colors.golf.water,
  },
  gradients: colors.gradients,
} as const;

// Dark theme (for video analysis screens and low-light)
export const darkTheme = {
  dark: true,
  colors: {
    // Core
    primary: colors.primary.orange,
    primaryLight: colors.primary.orangeLight,
    primaryDark: colors.primary.orangeDark,
    primaryMuted: 'rgba(255, 130, 0, 0.15)',

    secondary: colors.secondary.greenLight,
    secondaryLight: colors.secondary.green,
    secondaryDark: colors.secondary.greenDark,
    secondaryMuted: 'rgba(17, 87, 64, 0.2)',

    // Backgrounds
    background: '#0D0D12',
    backgroundSecondary: '#16161D',
    backgroundTertiary: '#1E1E28',

    // Surfaces
    surface: '#1E1E28',
    surfaceElevated: '#252530',

    // Text
    text: '#E8E8ED',
    textHeading: '#FFFFFF',
    textSecondary: '#A0A0AB',
    textMuted: '#6B6B78',
    textInverse: colors.text.heading,
    textLink: colors.primary.orangeLight,

    // Borders
    border: '#2E2E3A',
    borderFocused: colors.primary.orange,

    // Semantic
    success: '#34D399',
    successLight: 'rgba(52, 211, 153, 0.15)',
    warning: '#FBBF24',
    warningLight: 'rgba(251, 191, 36, 0.15)',
    error: '#F87171',
    errorLight: 'rgba(248, 113, 113, 0.15)',
    info: '#60A5FA',
    infoLight: 'rgba(96, 165, 250, 0.15)',

    // Navigation
    tabBar: '#16161D',
    tabBarIcon: '#6B6B78',
    tabBarIconActive: colors.primary.orange,

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Golf-specific
    fairway: '#4ADE80',
    rough: '#22C55E',
    bunker: '#D4A574',
    water: '#60A5FA',
  },
  gradients: {
    ...colors.gradients,
    primaryCard: ['#1E1E28', '#16161D'],
    darkOverlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)'],
  },
} as const;

// Combined theme object
export const theme = {
  light: lightTheme,
  dark: darkTheme,

  // Shared tokens (theme-independent)
  fonts: {
    families: fontFamilies,
    weights: fontWeights,
    sizes: fontSizes,
    lineHeights,
    letterSpacing,
  },
  textStyles,
  spacing,
  radius,
  shadows: shadowsIOS,
  elevation,
  layout,
  zIndex,
  durations,
  hitSlop,
} as const;

export type Theme = typeof lightTheme;
export type ThemeColors = keyof Theme['colors'];

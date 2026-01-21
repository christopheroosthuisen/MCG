/**
 * MCG Golf App - Spacing & Layout System
 * Consistent spacing for a polished, professional feel
 */

// Base spacing unit (4px)
const BASE = 4;

// Spacing scale
export const spacing = {
  0: 0,
  px: 1,
  0.5: BASE * 0.5,    // 2px
  1: BASE,             // 4px
  1.5: BASE * 1.5,     // 6px
  2: BASE * 2,         // 8px
  2.5: BASE * 2.5,     // 10px
  3: BASE * 3,         // 12px
  4: BASE * 4,         // 16px
  5: BASE * 5,         // 20px
  6: BASE * 6,         // 24px
  7: BASE * 7,         // 28px
  8: BASE * 8,         // 32px
  9: BASE * 9,         // 36px
  10: BASE * 10,       // 40px
  11: BASE * 11,       // 44px
  12: BASE * 12,       // 48px
  14: BASE * 14,       // 56px
  16: BASE * 16,       // 64px
  20: BASE * 20,       // 80px
  24: BASE * 24,       // 96px
  28: BASE * 28,       // 112px
  32: BASE * 32,       // 128px
} as const;

// Border radius
export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// Shadows for iOS
export const shadowsIOS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  // Colored shadows for premium feel
  orange: {
    shadowColor: '#FF8200',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  green: {
    shadowColor: '#115740',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
} as const;

// Elevation for Android (maps to shadow sizes)
export const elevation = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  '2xl': 16,
} as const;

// Layout constants
export const layout = {
  // Screen padding
  screenPaddingHorizontal: spacing[4],
  screenPaddingVertical: spacing[6],

  // Card padding
  cardPadding: spacing[4],
  cardPaddingLarge: spacing[6],

  // Max content widths
  maxContentWidth: 600,
  maxWideContentWidth: 800,

  // Bottom tab bar height
  tabBarHeight: 80,

  // Header heights
  headerHeight: 56,
  headerHeightLarge: 96,

  // Common icon sizes
  iconSizeSmall: 16,
  iconSizeMedium: 24,
  iconSizeLarge: 32,
  iconSizeXL: 48,

  // Avatar sizes
  avatarSizeSmall: 32,
  avatarSizeMedium: 44,
  avatarSizeLarge: 64,
  avatarSizeXL: 96,

  // Button heights
  buttonHeightSmall: 36,
  buttonHeightMedium: 44,
  buttonHeightLarge: 52,

  // Input heights
  inputHeight: 48,
  inputHeightLarge: 56,

  // Metric card sizes (for TrackMan-style displays)
  metricCardSmall: 80,
  metricCardMedium: 100,
  metricCardLarge: 140,
} as const;

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
} as const;

// Animation durations
export const durations = {
  fastest: 100,
  fast: 150,
  normal: 200,
  slow: 300,
  slowest: 500,
} as const;

// Common hitSlop for touch targets (accessibility)
export const hitSlop = {
  small: { top: 8, right: 8, bottom: 8, left: 8 },
  medium: { top: 12, right: 12, bottom: 12, left: 12 },
  large: { top: 16, right: 16, bottom: 16, left: 16 },
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
export type Shadow = keyof typeof shadowsIOS;

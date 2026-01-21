/**
 * MCG Golf App - Color System
 * Official brand colors + premium palette for golf training
 *
 * BRAND COLORS (from style guide):
 * - UT Orange: #FF8200 (PMS 151) - Primary action color
 * - Golf Ball White: #FFFFFF - Primary base
 * - Fairway Green: #115740 - Secondary base
 * - Maestro Gray: #4B4B4B - Text & secondary elements
 */

export const colors = {
  // ============================================
  // OFFICIAL BRAND COLORS
  // ============================================

  brand: {
    utOrange: '#FF8200',        // PMS 151 - Energy, enthusiasm, Tennessee roots
    golfBallWhite: '#FFFFFF',   // Clarity, precision, clean slate
    fairwayGreen: '#115740',    // Growth, health, sophistication
    maestroGray: '#4B4B4B',     // Professional, readable body copy
  },

  // ============================================
  // EXTENDED PALETTE
  // ============================================

  // Primary - UT Orange variations
  primary: {
    orange: '#FF8200',          // Main brand orange
    orangeLight: '#FFA033',     // Lighter variant for hover states
    orangeDark: '#E67400',      // Darker variant for pressed states
    orangeMuted: 'rgba(255, 130, 0, 0.1)', // Background tints
    orangeGlow: 'rgba(255, 130, 0, 0.3)',  // For glow effects
  },

  // Secondary - Fairway Green variations
  secondary: {
    green: '#115740',           // Main brand green
    greenLight: '#1A7A5A',      // Lighter for hover
    greenDark: '#0D4330',       // Darker for pressed
    greenMuted: 'rgba(17, 87, 64, 0.1)', // Background tints
  },

  // Neutrals - Extended scale based on Maestro Gray
  neutral: {
    white: '#FFFFFF',           // Golf Ball White
    offWhite: '#F8F9FA',        // Subtle backgrounds
    lightGray: '#E9ECEF',       // Borders, dividers
    mediumGray: '#9CA3AF',      // Placeholder text
    maestroGray: '#4B4B4B',     // Official brand gray - body text
    darkGray: '#343A40',        // Headings
    charcoal: '#1F2937',        // Dark UI elements
    nearBlack: '#111827',       // Darkest UI
    black: '#000000',
  },

  // Semantic Colors
  semantic: {
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  },

  // Text Colors (aligned with brand)
  text: {
    heading: '#1F2937',         // Dark charcoal for headings
    primary: '#4B4B4B',         // Maestro Gray - main body text
    secondary: '#6B7280',       // Secondary text
    muted: '#9CA3AF',           // Muted/placeholder text
    inverse: '#FFFFFF',         // White text on dark backgrounds
    link: '#FF8200',            // UT Orange for links
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#E9ECEF',
    dark: '#1A1A2E',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Golf-Specific Colors
  golf: {
    fairway: '#228B22',
    rough: '#355E3B',
    bunker: '#C2B280',
    water: '#4A90D9',
    green: '#90EE90',
    tee: '#8B4513',
  },

  // Gradient Definitions (for use with LinearGradient)
  gradients: {
    primaryCard: ['#115740', '#0D4330'],
    orangeGlow: ['#FF8200', '#FFA033'],
    darkOverlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)'],
    lightOverlay: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)'],
    greenSubtle: ['rgba(17, 87, 64, 0.05)', 'rgba(17, 87, 64, 0.02)'],
    orangeSubtle: ['rgba(255, 130, 0, 0.1)', 'rgba(255, 130, 0, 0.05)'],
  },
} as const;

// Type exports
export type ColorPalette = typeof colors;
export type PrimaryColors = keyof typeof colors.primary;
export type SemanticColors = keyof typeof colors.semantic;

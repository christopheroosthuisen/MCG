/**
 * MCG Golf App - Theme Hook
 * Access theme values throughout the app
 */

import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, theme as themeTokens } from '@/design';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof lightTheme.colors;
  gradients: typeof lightTheme.gradients;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    // Fallback when used outside provider (shouldn't happen in production)
    const systemColorScheme = useColorScheme();
    const isDark = systemColorScheme === 'dark';
    const currentTheme = isDark ? darkTheme : lightTheme;

    return {
      mode: 'system' as ThemeMode,
      isDark,
      colors: currentTheme.colors,
      gradients: currentTheme.gradients,
      setMode: () => {},
      // Also expose design tokens
      ...themeTokens,
    };
  }

  return {
    ...context,
    // Also expose design tokens
    ...themeTokens,
  };
}

// Quick access to specific theme values
export function useColors() {
  const { colors } = useTheme();
  return colors;
}

export function useSpacing() {
  return themeTokens.spacing;
}

export function useLayout() {
  return themeTokens.layout;
}

export function useTextStyles() {
  return themeTokens.textStyles;
}

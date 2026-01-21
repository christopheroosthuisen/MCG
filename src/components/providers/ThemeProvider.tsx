/**
 * MCG Golf App - Theme Provider
 * Manages theme state and provides theme context to the app
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext, ThemeMode } from '@/hooks/useTheme';
import { lightTheme, darkTheme } from '@/design';

const THEME_STORAGE_KEY = '@mcg_theme_mode';

interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode = 'system' }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(initialMode);

  // Load saved theme preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedMode) => {
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setModeState(savedMode as ThemeMode);
      }
    });
  }, []);

  // Determine if dark mode is active
  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  // Get current theme colors
  const currentTheme = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  // Set theme mode and persist
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
  }, []);

  // Context value
  const contextValue = useMemo(
    () => ({
      mode,
      isDark,
      colors: currentTheme.colors,
      gradients: currentTheme.gradients,
      setMode,
    }),
    [mode, isDark, currentTheme, setMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={currentTheme.colors.background}
      />
      {children}
    </ThemeContext.Provider>
  );
}

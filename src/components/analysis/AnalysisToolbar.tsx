/**
 * MCG Golf App - Analysis Toolbar Component
 * Collapsible panel with drawing and analysis tools
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { spacing, radius, shadowsIOS } from '@/design';
import { Text } from '@/components/ui';
import {
  AnalysisTool,
  AnalysisToolType,
  AnalysisToolbarState,
} from '@/types/analysis';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOOLBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 56;

// ============================================
// TOOL DEFINITIONS
// ============================================

const ANALYSIS_TOOLS: AnalysisTool[] = [
  // Basic tools
  {
    id: 'pointer',
    name: 'Pointer',
    description: 'Select and move annotations',
    icon: 'hand-left-outline',
    category: 'basic',
    color: '#FFFFFF',
    isPremium: false,
    shortcut: 'P',
  },
  {
    id: 'line',
    name: 'Line',
    description: 'Draw straight lines',
    icon: 'remove-outline',
    category: 'basic',
    color: '#00FFFF',
    isPremium: false,
    shortcut: 'L',
  },
  {
    id: 'angle',
    name: 'Angle',
    description: 'Measure angles between lines',
    icon: 'analytics-outline',
    category: 'basic',
    color: '#FFFF00',
    isPremium: false,
    shortcut: 'A',
  },
  {
    id: 'circle',
    name: 'Circle',
    description: 'Draw circles and ellipses',
    icon: 'ellipse-outline',
    category: 'basic',
    color: '#FF00FF',
    isPremium: false,
    shortcut: 'C',
  },
  {
    id: 'arrow',
    name: 'Arrow',
    description: 'Draw directional arrows',
    icon: 'arrow-forward-outline',
    category: 'basic',
    color: '#00FF00',
    isPremium: false,
    shortcut: 'R',
  },
  {
    id: 'freehand',
    name: 'Freehand',
    description: 'Draw freehand lines',
    icon: 'brush-outline',
    category: 'basic',
    color: '#FF8200',
    isPremium: false,
    shortcut: 'F',
  },
  {
    id: 'text',
    name: 'Text',
    description: 'Add text annotations',
    icon: 'text-outline',
    category: 'basic',
    color: '#FFFFFF',
    isPremium: false,
    shortcut: 'T',
  },

  // Body analysis tools
  {
    id: 'spine-line',
    name: 'Spine Line',
    description: 'Draw spine angle indicator',
    icon: 'fitness-outline',
    category: 'body',
    color: '#00FFFF',
    isPremium: false,
  },
  {
    id: 'shoulder-line',
    name: 'Shoulder Line',
    description: 'Draw shoulder alignment',
    icon: 'resize-outline',
    category: 'body',
    color: '#FF6B6B',
    isPremium: false,
  },
  {
    id: 'hip-line',
    name: 'Hip Line',
    description: 'Draw hip alignment',
    icon: 'resize-outline',
    category: 'body',
    color: '#4ECDC4',
    isPremium: false,
  },
  {
    id: 'knee-line',
    name: 'Knee Line',
    description: 'Draw knee flex indicator',
    icon: 'resize-outline',
    category: 'body',
    color: '#45B7D1',
    isPremium: false,
  },

  // Club analysis tools
  {
    id: 'swing-plane',
    name: 'Swing Plane',
    description: 'Draw swing plane line',
    icon: 'trending-up-outline',
    category: 'club',
    color: '#FF8200',
    isPremium: true,
  },
  {
    id: 'club-path',
    name: 'Club Path',
    description: 'Trace the club path',
    icon: 'git-branch-outline',
    category: 'club',
    color: '#9B59B6',
    isPremium: true,
  },
  {
    id: 'face-angle',
    name: 'Face Angle',
    description: 'Show club face angle',
    icon: 'square-outline',
    category: 'club',
    color: '#E74C3C',
    isPremium: true,
  },

  // Advanced tools
  {
    id: 'grid',
    name: 'Grid Overlay',
    description: 'Show alignment grid',
    icon: 'grid-outline',
    category: 'advanced',
    color: 'rgba(255,255,255,0.3)',
    isPremium: false,
    shortcut: 'G',
  },
  {
    id: 'measure',
    name: 'Measure',
    description: 'Measure distances',
    icon: 'swap-horizontal-outline',
    category: 'advanced',
    color: '#F1C40F',
    isPremium: true,
  },
];

// Tool categories
const TOOL_CATEGORIES = [
  { id: 'basic', name: 'Basic Tools', icon: 'create-outline' },
  { id: 'body', name: 'Body Lines', icon: 'body-outline' },
  { id: 'club', name: 'Club Analysis', icon: 'golf-outline' },
  { id: 'advanced', name: 'Advanced', icon: 'options-outline' },
];

// Color palette for annotations
const COLOR_PALETTE = [
  '#00FFFF', // Cyan
  '#FF00FF', // Magenta
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#FF8200', // Orange (brand)
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFFFFF', // White
];

// Line width options
const LINE_WIDTHS = [2, 4, 6, 8];

// ============================================
// TYPES
// ============================================

interface AnalysisToolbarProps {
  state: AnalysisToolbarState;
  onToolSelect: (tool: AnalysisToolType | null) => void;
  onColorChange: (color: string) => void;
  onLineWidthChange: (width: number) => void;
  onToggleGrid: () => void;
  onClearAnnotations: () => void;
  onUndo: () => void;
  onRedo: () => void;
  position?: 'left' | 'right';
  canUndo?: boolean;
  canRedo?: boolean;
}

// ============================================
// ANALYSIS TOOLBAR COMPONENT
// ============================================

export function AnalysisToolbar({
  state,
  onToolSelect,
  onColorChange,
  onLineWidthChange,
  onToggleGrid,
  onClearAnnotations,
  onUndo,
  onRedo,
  position = 'right',
  canUndo = false,
  canRedo = false,
}: AnalysisToolbarProps) {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('basic');

  // Animation values
  const expandedValue = useSharedValue(state.isExpanded ? 1 : 0);

  // Update animation when expanded state changes
  React.useEffect(() => {
    expandedValue.value = withSpring(state.isExpanded ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [state.isExpanded]);

  // Animated styles for the toolbar container
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    width: interpolate(
      expandedValue.value,
      [0, 1],
      [COLLAPSED_WIDTH, TOOLBAR_WIDTH],
      Extrapolation.CLAMP
    ),
  }));

  // Animated styles for content opacity
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      expandedValue.value,
      [0.5, 1],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  // Toggle expand/collapse
  const toggleExpanded = useCallback(() => {
    const newExpanded = !state.isExpanded;
    onToolSelect(newExpanded ? state.activeTool : null);
  }, [state.isExpanded, state.activeTool, onToolSelect]);

  // Get tools for current category
  const categoryTools = ANALYSIS_TOOLS.filter(
    (tool) => tool.category === selectedCategory
  );

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'left' ? styles.containerLeft : styles.containerRight,
        { backgroundColor: 'rgba(20, 20, 30, 0.95)' },
        containerAnimatedStyle,
      ]}
    >
      {/* Collapse/Expand Toggle */}
      <Pressable
        style={[styles.toggleButton, { backgroundColor: colors.primary }]}
        onPress={toggleExpanded}
      >
        <Ionicons
          name={state.isExpanded ? 'chevron-forward' : 'build-outline'}
          size={20}
          color="#FFFFFF"
        />
      </Pressable>

      {/* Collapsed state - just show active tool */}
      {!state.isExpanded && (
        <View style={styles.collapsedContent}>
          {state.activeTool && (
            <View style={[styles.activeToolIndicator, { backgroundColor: state.activeColor }]}>
              <Ionicons
                name={ANALYSIS_TOOLS.find((t) => t.id === state.activeTool)?.icon as any || 'create-outline'}
                size={20}
                color="#000"
              />
            </View>
          )}
        </View>
      )}

      {/* Expanded content */}
      <Animated.View style={[styles.expandedContent, contentAnimatedStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h4" color="#FFFFFF">Analysis Tools</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={[styles.headerButton, !canUndo && styles.headerButtonDisabled]}
              onPress={onUndo}
              disabled={!canUndo}
            >
              <Ionicons name="arrow-undo" size={18} color={canUndo ? '#FFFFFF' : '#666'} />
            </Pressable>
            <Pressable
              style={[styles.headerButton, !canRedo && styles.headerButtonDisabled]}
              onPress={onRedo}
              disabled={!canRedo}
            >
              <Ionicons name="arrow-redo" size={18} color={canRedo ? '#FFFFFF' : '#666'} />
            </Pressable>
            <Pressable style={styles.headerButton} onPress={onClearAnnotations}>
              <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
            </Pressable>
          </View>
        </View>

        {/* Category tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {TOOL_CATEGORIES.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={selectedCategory === category.id ? '#FFF' : '#AAA'}
              />
              <Text
                variant="caption"
                color={selectedCategory === category.id ? '#FFF' : '#AAA'}
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Tools grid */}
        <View style={styles.toolsGrid}>
          {categoryTools.map((tool) => (
            <Pressable
              key={tool.id}
              style={[
                styles.toolButton,
                state.activeTool === tool.id && {
                  backgroundColor: tool.color,
                  borderColor: '#FFFFFF',
                },
              ]}
              onPress={() => onToolSelect(tool.id)}
            >
              <Ionicons
                name={tool.icon as any}
                size={22}
                color={state.activeTool === tool.id ? '#000' : tool.color}
              />
              <Text
                variant="caption"
                color={state.activeTool === tool.id ? '#000' : '#CCC'}
                style={styles.toolLabel}
              >
                {tool.name}
              </Text>
              {tool.isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={8} color="#FFD700" />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Color picker */}
        <View style={styles.section}>
          <Text variant="labelSmall" color="#888" style={styles.sectionLabel}>
            COLOR
          </Text>
          <View style={styles.colorPicker}>
            {COLOR_PALETTE.map((color) => (
              <Pressable
                key={color}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color },
                  state.activeColor === color && styles.colorSwatchActive,
                ]}
                onPress={() => onColorChange(color)}
              />
            ))}
          </View>
        </View>

        {/* Line width */}
        <View style={styles.section}>
          <Text variant="labelSmall" color="#888" style={styles.sectionLabel}>
            LINE WIDTH
          </Text>
          <View style={styles.lineWidthPicker}>
            {LINE_WIDTHS.map((width) => (
              <Pressable
                key={width}
                style={[
                  styles.lineWidthButton,
                  state.lineWidth === width && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => onLineWidthChange(width)}
              >
                <View
                  style={[
                    styles.lineWidthPreview,
                    {
                      height: width,
                      backgroundColor:
                        state.lineWidth === width ? '#FFF' : state.activeColor,
                    },
                  ]}
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Grid toggle */}
        <Pressable
          style={[
            styles.gridToggle,
            state.showGrid && { backgroundColor: 'rgba(255,255,255,0.1)' },
          ]}
          onPress={onToggleGrid}
        >
          <Ionicons
            name="grid-outline"
            size={20}
            color={state.showGrid ? colors.primary : '#888'}
          />
          <Text
            variant="labelMedium"
            color={state.showGrid ? '#FFF' : '#888'}
          >
            Show Grid
          </Text>
          <View style={styles.toggleSwitch}>
            <View
              style={[
                styles.toggleKnob,
                state.showGrid && {
                  backgroundColor: colors.primary,
                  transform: [{ translateX: 16 }],
                },
              ]}
            />
          </View>
        </Pressable>

        {/* Annotation count */}
        <View style={styles.annotationCount}>
          <Ionicons name="layers-outline" size={16} color="#888" />
          <Text variant="caption" color="#888">
            {state.annotations.length} annotation{state.annotations.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    bottom: 120,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadowsIOS.xl,
  },
  containerLeft: {
    left: spacing[2],
  },
  containerRight: {
    right: spacing[2],
  },

  // Toggle button
  toggleButton: {
    position: 'absolute',
    top: spacing[2],
    left: spacing[2],
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // Collapsed content
  collapsedContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 56,
  },
  activeToolIndicator: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Expanded content
  expandedContent: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: spacing[3],
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },

  // Category tabs
  categoryScroll: {
    maxHeight: 40,
    marginBottom: spacing[3],
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  // Tools grid
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  toolButton: {
    width: 72,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toolLabel: {
    marginTop: spacing[1],
    fontSize: 9,
  },
  premiumBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section
  section: {
    marginBottom: spacing[4],
  },
  sectionLabel: {
    marginBottom: spacing[2],
  },

  // Color picker
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },

  // Line width
  lineWidthPicker: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  lineWidthButton: {
    width: 44,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineWidthPreview: {
    width: 24,
    borderRadius: 2,
  },

  // Grid toggle
  gridToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: radius.lg,
    marginBottom: spacing[3],
  },
  toggleSwitch: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginLeft: 'auto',
    padding: 2,
  },
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#888',
  },

  // Annotation count
  annotationCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    justifyContent: 'center',
    paddingVertical: spacing[2],
  },
});

export default AnalysisToolbar;

# MCG (Master Club Golf) - Project Documentation

## Overview

MCG is a premium golf training app designed by Joe Mayo (TrackMan Maestro). The app focuses on AI-powered video analysis, swing coaching, and comprehensive training tools for golfers of all skill levels.

## Tech Stack

- **Framework**: React Native with Expo SDK 50
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand
- **Animations**: React Native Reanimated
- **Styling**: React Native StyleSheet with custom design system
- **Icons**: @expo/vector-icons (Ionicons)

## Brand Colors

```typescript
// Primary
UT Orange: #FF8200 (PMS 151) - Primary brand color
Golf Ball White: #FFFFFF - Clean backgrounds
Fairway Green: #115740 - Secondary accent
Maestro Gray: #4B4B4B - Text and neutral elements
```

## Directory Structure

```
/home/user/MCG/
├── app/                          # Expo Router screens
│   ├── (modals)/                 # Modal screens
│   │   ├── metric-detail.tsx     # TrackMan metric detail view
│   │   └── video-player.tsx      # Full-screen video player
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── _layout.tsx           # Tab navigator config
│   │   ├── index.tsx             # Home dashboard
│   │   ├── practice.tsx          # Practice hub
│   │   ├── analyze.tsx           # Video analysis entry
│   │   ├── learn.tsx             # Learning content
│   │   └── profile.tsx           # User profile
│   ├── analysis/                 # Analysis flow screens
│   │   ├── _layout.tsx           # Analysis stack navigator
│   │   ├── [id].tsx              # Main analysis screen
│   │   └── live.tsx              # Live camera analysis
│   ├── learn/                    # Learning platform screens
│   │   ├── _layout.tsx           # Learn stack navigator
│   │   ├── drill/[id].tsx        # Drill detail screen
│   │   └── lesson/[id].tsx       # Lesson detail screen
│   └── _layout.tsx               # Root layout with providers
├── src/
│   ├── components/
│   │   ├── analysis/             # Analysis-specific components
│   │   │   ├── AnalysisProgress.tsx
│   │   │   ├── AnalysisToolbar.tsx
│   │   │   ├── FeedbackPanel.tsx
│   │   │   ├── KeyframeMarker.tsx
│   │   │   ├── SkeletonOverlay.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── VideoUpload.tsx
│   │   │   └── index.ts
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Text.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── design/                   # Design system tokens
│   │   ├── colors.ts             # Color palette
│   │   ├── spacing.ts            # Spacing, shadows, layout
│   │   ├── typography.ts         # Font scales
│   │   ├── theme.ts              # Light/dark themes
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useTheme.ts           # Theme context hook
│   │   └── index.ts
│   └── types/
│       ├── analysis.ts           # Video analysis types
│       ├── common.ts             # Utility types
│       ├── golf.ts               # Golf domain types
│       ├── navigation.ts         # Route types
│       └── index.ts
├── package.json
├── tsconfig.json
├── babel.config.js
├── app.json                      # Expo config
└── CLAUDE.md                     # This file
```

## Key Components

### UI Components (`src/components/ui/`)

- **Text**: Typography component with variants (h1-h4, body, caption, metric displays)
- **Button**: Primary, secondary, outline, ghost variants with loading states
- **Card**: Elevated, outlined, filled, gradient, metric, and glass variants
- **Badge**: Status indicators with success, warning, error, info variants
- **Input**: Text input with validation states
- **ProgressBar**: Animated progress indicator

### Analysis Components (`src/components/analysis/`)

- **VideoPlayer**: Custom video player with frame-accurate controls, playback speed, keyframe markers
- **SkeletonOverlay**: Pose visualization using react-native-svg, supports pro model comparison
- **AnalysisToolbar**: Collapsible drawing tools (line, angle, circle, freehand, swing plane, etc.)
- **KeyframeMarker**: 4-position marking system (backswing start, top, impact, finish)
- **FeedbackPanel**: AI feedback display with text/voice/realtime modes, uses expo-speech
- **VideoUpload**: Camera position guidelines (face-on, down-the-line, behind)
- **AnalysisProgress**: Multi-step loading states during AI analysis

## Type System

### Golf Types (`src/types/golf.ts`)

```typescript
// Key interfaces
- ClubType, ClubCategory, Club
- ShotType, ShotShape, LieType
- BallData, ClubData, ImpactData (TrackMan metrics)
- SwingPosition, SwingMetrics, SwingAnalysis
- PoseLandmarks, BodyAngles (pose detection)
- Drill, DrillStep, DrillSession
- Lesson, LessonChapter, Instructor
```

### Analysis Types (`src/types/analysis.ts`)

```typescript
// Key interfaces
- VideoFile, VideoSource, CameraPosition
- Keyframe, KeyframeType, KeyframeSet
- SkeletonConfig, PoseFrame, PoseTrackingResult
- ProModel, ProModelOverlayConfig
- AnalysisTool, AnalysisToolType, DrawnAnnotation
- FeedbackConfig, FeedbackMode, FeedbackMessage
- SwingIssue, AnalysisResult, AnalysisProgress
- LiveAnalysisConfig, LiveAnalysisState
```

## Navigation Structure

```
Root Stack
├── (tabs) - Tab Navigator
│   ├── index (Home)
│   ├── practice (Practice Hub)
│   ├── analyze (Analysis Entry)
│   ├── learn (Learning Content)
│   └── profile (User Profile)
├── analysis - Stack Navigator
│   ├── [id] (Analysis Screen)
│   └── live (Live Camera)
├── learn - Stack Navigator
│   ├── drill/[id] (Drill Detail)
│   └── lesson/[id] (Lesson Detail)
└── (modals) - Modal Screens
    ├── video-player (Full-screen Video)
    └── metric-detail (Metric Detail)
```

## Design System

### Spacing Scale (4px base)

```typescript
spacing[1] = 4px
spacing[2] = 8px
spacing[3] = 12px
spacing[4] = 16px
spacing[6] = 24px
spacing[8] = 32px
```

### Border Radius

```typescript
radius.sm = 4
radius.md = 8
radius.lg = 12
radius.xl = 16
radius['2xl'] = 20
radius.full = 9999
```

### Shadows (Web-compatible boxShadow)

```typescript
shadowsIOS.sm = '0px 1px 2px rgba(0, 0, 0, 0.05)'
shadowsIOS.md = '0px 2px 4px rgba(0, 0, 0, 0.08)'
shadowsIOS.lg = '0px 4px 8px rgba(0, 0, 0, 0.1)'
```

## Development Commands

```bash
# Start development server
npm start

# Start with specific platform
npm run ios
npm run android
npm run web

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run typecheck

# Build for production
npm run build:ios
npm run build:android
```

## Key Features

### Video Analysis System
1. **Video Upload**: Supports camera recording or library import
2. **Camera Guidelines**: Position tips for face-on, down-the-line, behind views
3. **Keyframe Marking**: Mark 4 key swing positions with keyboard shortcuts
4. **Skeleton Overlay**: Real-time pose visualization with angle measurements
5. **Pro Model Comparison**: Overlay professional swing for comparison
6. **Drawing Tools**: Lines, angles, circles for swing analysis
7. **AI Feedback**: Text, voice, or real-time coaching feedback
8. **Issue Detection**: Identifies swing issues with severity levels

### Learning Platform
1. **Drills**: Step-by-step practice drills with equipment lists and checkpoints
2. **Lessons**: Video chapters with instructor info and progress tracking
3. **Integration**: Analysis feedback links directly to relevant drills/lessons

### Live Camera Analysis (Native only)
- Real-time skeleton tracking
- Recording with swing analysis
- FPS and latency monitoring
- Haptic feedback support

## Platform Considerations

### Web Compatibility
- expo-camera not supported on web (shows fallback UI)
- Shadow styles use `boxShadow` instead of native shadow properties
- Some native features conditionally loaded

### Path Aliases

```typescript
// tsconfig.json paths
"@/*": ["src/*"]

// Usage
import { useTheme } from '@/hooks/useTheme';
import { Text, Button } from '@/components/ui';
```

## Dependencies

### Core
- expo ~50.0.0
- react 18.2.0
- react-native 0.73.2
- expo-router ~3.4.0

### Media
- expo-av ~13.10.0 (video playback)
- expo-camera ~14.0.0 (recording)
- expo-image-picker ~14.7.0
- expo-speech ~11.7.0 (voice feedback)

### UI/Animation
- react-native-reanimated ~3.6.0
- react-native-gesture-handler ~2.14.0
- react-native-svg 14.1.0
- expo-linear-gradient ~12.7.0

### Storage
- @react-native-async-storage/async-storage 1.21.0
- expo-file-system ~16.0.0
- expo-media-library ~15.9.0

## Future Enhancements

- [ ] Actual ML pose detection integration
- [ ] Cloud video storage and sync
- [ ] Social features (share swings, leaderboards)
- [ ] Equipment tracking and recommendations
- [ ] Practice session scheduling
- [ ] Integration with launch monitors (TrackMan, FlightScope)
- [ ] Course management and round tracking

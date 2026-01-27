# MCG (Master Club Golf) - Web Application

## Overview

MCG is a premium golf training web application designed by Joe Mayo (TrackMan Maestro). While inspired by a React Native specification, this implementation targets modern web browsers using React 18, tailored for mobile-first responsive usage.

## Tech Stack

- **Framework**: React 18 (Web)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini API (Multimodal)
- **Icons**: SVG (Inline)

## Brand Colors

- **UT Orange**: #FF8200 (PMS 151)
- **Golf Ball White**: #FFFFFF
- **Fairway Green**: #115740
- **Maestro Gray**: #4B4B4B

## Directory Structure

```
/
├── index.tsx             # Entry point
├── index.html            # HTML Shell
├── App.tsx               # Main Application Component & Navigation
├── types.ts              # Global Type Definitions
├── constants.ts          # Global Constants, Theme & Mock Data
├── services/
│   └── geminiService.ts  # Google GenAI Integration
└── components/
    ├── UIComponents.tsx  # Reusable UI (Button, Card, Badge, Inputs, ProgressBar)
    └── AnalysisViews.tsx # Complex views (VideoRecorder, SkeletonOverlay, Metrics)
```

## Features Implemented

### 1. Navigation Architecture
- Tab-based navigation (Home, Practice, Analyze, Learn, Profile).
- Sub-view navigation state management within `App.tsx`.
- Responsive layout with bottom navigation bar for mobile feel.

### 2. Video Analysis
- **Camera Integration**: Uses `navigator.mediaDevices` for web-based camera access.
- **Recording Flow**: IDLE -> RECORDING -> PROCESSING -> COMPLETE.
- **Overlay System**: Simulated Pose Skeleton overlaying the video feed.
- **Drawing Tools**: Toolbar for Lines, Angles, Circles.

### 3. Dashboard & Data
- **TrackMan-style Metrics**: Displays Club Speed, Ball Speed, Smash Factor, etc.
- **Progress Tracking**: Visual progress bars for drills and lessons.
- **Feedback System**: Categorized AI feedback with severity levels.

### 4. Practice & Learn
- **Drill Library**: List of drills with step-by-step instructions.
- **Lesson Player**: Chapter-based lesson viewing structure.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

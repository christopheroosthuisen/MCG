# MCG - Master Club Golf

> The ultimate golf training app designed by Joe Mayo (TrackMan Maestro)

A premium React Native application focused on short game mastery while covering all aspects of golf improvement. Built with professional design standards, AI-powered coaching, and TrackMan-style analytics.

## Features

### Core Capabilities
- **Video Swing Analysis** - AI-powered pose tracking and swing breakdown
- **TrackMan-Style Metrics** - Ball speed, launch angle, spin rate, club path, and more
- **8-Position Swing Analysis** - Address, Takeaway, Backswing, Top, Downswing, Impact, Follow-Through, Finish
- **AI Coach** - Personalized guidance based on your performance data
- **Practice Sessions** - Structured practice with progress tracking
- **Drill Library** - Comprehensive drills for every aspect of the game
- **Learning Paths** - Curated lesson sequences for systematic improvement

### Focus Areas
- Short Game (Chipping, Pitching, Bunker)
- Putting
- Full Swing
- Tempo & Timing
- Alignment & Setup

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Animations**: React Native Reanimated
- **UI Components**: Custom design system

## Project Structure

```
MCG/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home dashboard
│   │   ├── practice.tsx   # Practice hub
│   │   ├── analyze.tsx    # Video analysis
│   │   ├── learn.tsx      # Lessons & drills
│   │   └── profile.tsx    # User profile
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/           # Base UI components
│   │   └── providers/    # Context providers
│   ├── design/           # Design system
│   │   ├── colors.ts     # Color palette
│   │   ├── typography.ts # Typography scale
│   │   ├── spacing.ts    # Spacing & layout
│   │   └── theme.ts      # Theme configuration
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript definitions
│   │   ├── golf.ts       # Golf-related types
│   │   ├── navigation.ts # Navigation types
│   │   └── common.ts     # Common utilities
│   ├── services/         # API & external services
│   ├── store/            # State management
│   └── utils/            # Utility functions
└── assets/               # Static assets
```

## Design System

### Brand Colors
| Color | Hex | Usage |
|-------|-----|-------|
| UT Orange | `#FF8200` | Primary actions, accents |
| Golf Ball White | `#FFFFFF` | Primary backgrounds |
| Fairway Green | `#115740` | Secondary elements |
| Maestro Gray | `#4B4B4B` | Body text |

### Typography
- **Display**: Headlines and hero text
- **Body**: Primary content
- **Metric**: TrackMan-style numbers and data

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd MCG

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Development

### Available Scripts

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript checks
```

### Code Style
- ESLint + Prettier for consistent formatting
- TypeScript strict mode enabled
- Component-based architecture

## Roadmap

### Phase 1 - Foundation ✅
- [x] Project setup with Expo
- [x] Design system implementation
- [x] Core UI components
- [x] Tab navigation structure
- [x] Screen layouts

### Phase 2 - Core Features
- [ ] User authentication
- [ ] Video recording & playback
- [ ] Basic swing analysis
- [ ] Practice session tracking
- [ ] Drill execution

### Phase 3 - AI & Analytics
- [ ] Pose detection integration
- [ ] Swing metrics calculation
- [ ] AI coaching engine
- [ ] Progress analytics
- [ ] Personalized recommendations

### Phase 4 - Premium Features
- [ ] Advanced video analysis
- [ ] Swing comparison
- [ ] Pro instructor lessons
- [ ] Community features
- [ ] Subscription system

## Contributing

This is a proprietary project. Please contact the development team for contribution guidelines.

## License

Proprietary - All rights reserved.

---

**MCG - Master Club Golf**
*Elevate Your Game with Joe Mayo*

# MCG New Features Plan V2 - Advanced Feature Categories

## Research Summary

Building on the initial 8 feature categories, this second phase introduces **8 additional feature categories** with **32 new components** focused on deeper engagement, video analysis, fitness integration, and on-course assistance.

### Additional Apps Analyzed:
- **V1 Golf** - Swing video analysis & pro comparisons
- **Hudl Technique** - Frame-by-frame breakdown
- **Zepp Golf** - Swing metrics & 3D analysis
- **Golf Pad GPS** - On-course tracking & GPS
- **The Grint** - Handicap tracking & statistics
- **TPI (Titleist Performance Institute)** - Golf fitness
- **Skillest** - Remote coaching & lesson booking
- **Golflogix** - Course mapping & distances

---

## Feature Categories Overview (Phase 2)

| Category | Components | Priority | Complexity |
|----------|------------|----------|------------|
| 9. Swing Video Library | 5 | High | High |
| 10. Equipment & Bag Manager | 4 | Medium | Medium |
| 11. Goal Setting & Progress | 5 | High | Medium |
| 12. Round Replay & Analysis | 4 | High | High |
| 13. On-Course Assistant | 5 | High | High |
| 14. Fitness & Physical Training | 5 | Medium | Medium |
| 15. Coach Connection | 4 | Medium | Medium |
| 16. Handicap Tracker | 4 | High | Low |

---

## CATEGORY 9: Swing Video Library

**Inspired by:** V1 Golf, Hudl Technique, Zepp Golf

### 9.1 Video Collection Manager
**Purpose:** Organize and categorize all swing videos.

**Components:**
- `SwingLibraryGrid` - Gallery view of all recorded swings
- `SwingVideoCard` - Thumbnail with metadata overlay
- `VideoFilterBar` - Filter by club, date, tags, rating
- `SwingFolderSystem` - Organize into custom folders
- `QuickCompareSelector` - Select videos for comparison

### 9.2 Frame-by-Frame Analysis
**Purpose:** Detailed breakdown of swing positions.

**Components:**
- `FrameScrubber` - Precise frame navigation
- `KeyPositionMarkers` - Mark P1-P10 positions
- `AngleMeasurementTool` - Measure shaft angles, spine tilt
- `DrawingOverlay` - Draw lines, circles, arrows
- `PositionComparison` - Compare same position across videos

### 9.3 Pro Comparison
**Purpose:** Compare your swing to tour professionals.

**Components:**
- `ProLibraryBrowser` - Browse pro swing library
- `SideBySidePlayer` - Synchronized dual video playback
- `TempoComparison` - Compare swing tempo/timing
- `OverlayMode` - Overlay your swing on pro swing
- `MatchPercentage` - AI-calculated similarity score

### 9.4 Swing Trends
**Purpose:** Track swing changes over time.

**Components:**
- `SwingTimeline` - Visual timeline of swing evolution
- `MetricTrendChart` - Track angles/positions over time
- `BeforeAfterWidget` - Quick before/after comparison
- `ImprovementHighlight` - AI-detected improvements

### 9.5 Video Sharing
**Purpose:** Share swings for feedback.

**Components:**
- `ShareVideoModal` - Share options (coach, friends, social)
- `VideoExportSettings` - Quality, format, annotations
- `FeedbackRequestForm` - Request specific feedback
- `CommentThread` - Discussion on shared videos

---

## CATEGORY 10: Equipment & Bag Manager

**Inspired by:** Arccos, MyGolfSpy, Golf Digest Equipment

### 10.1 Virtual Golf Bag
**Purpose:** Complete digital representation of your bag.

**Components:**
- `BagVisualization` - Visual 14-club layout
- `ClubDetailCard` - Specs, purchase date, notes
- `ClubSpecsForm` - Edit loft, lie, shaft, grip
- `BagComplianceChecker` - Ensure 14-club limit

### 10.2 Club Performance Tracking
**Purpose:** Track how each club performs.

**Components:**
- `ClubPerformanceCard` - Stats per club
- `ClubUsageChart` - Frequency of use
- `PerformanceByCondition` - Wind, elevation effects
- `ClubComparisonTool` - Compare two clubs

### 10.3 Equipment History
**Purpose:** Track equipment changes.

**Components:**
- `EquipmentTimeline` - History of gear changes
- `FittingLogEntry` - Record fitting sessions
- `PerformanceImpactNote` - Track impact of changes

### 10.4 Gear Recommendations
**Purpose:** AI-suggested equipment.

**Components:**
- `FittingRecommendation` - Based on swing data
- `GapAnalysis` - Identify distance gaps
- `UpgradeAdvisor` - Suggest equipment improvements
- `ShaftFlexCalculator` - Recommend shaft based on speed

---

## CATEGORY 11: Goal Setting & Progress

**Inspired by:** Strava, MyFitnessPal, Habitica

### 11.1 SMART Goal Creator
**Purpose:** Build specific, measurable goals.

**Components:**
- `GoalWizard` - Step-by-step goal creation
- `GoalTypeSelector` - Handicap, stats, practice time
- `MilestoneBuilder` - Break into smaller milestones
- `DeadlinePicker` - Set target dates

### 11.2 Progress Dashboard
**Purpose:** Visual progress tracking.

**Components:**
- `GoalProgressCard` - Individual goal status
- `ProgressRing` - Circular progress indicator
- `MilestoneTimeline` - Timeline of achieved milestones
- `StreakTracker` - Consecutive days/weeks

### 11.3 Achievement System
**Purpose:** Gamified accomplishments.

**Components:**
- `AchievementGrid` - All available achievements
- `AchievementUnlockModal` - Celebration on unlock
- `AchievementProgress` - Progress toward next
- `RarityIndicator` - Common to legendary

### 11.4 Improvement Roadmap
**Purpose:** AI-generated improvement path.

**Components:**
- `RoadmapView` - Visual path to goal
- `PhaseCard` - Current phase details
- `NextStepsWidget` - Immediate action items
- `AdaptiveAdjustment` - Adjusts based on progress

### 11.5 Progress Reports
**Purpose:** Regular progress summaries.

**Components:**
- `WeeklyReportCard` - 7-day summary
- `MonthlyProgressReport` - 30-day deep dive
- `YearInReview` - Annual statistics
- `ShareableProgressCard` - Social sharing format

---

## CATEGORY 12: Round Replay & Analysis

**Inspired by:** Shot Scope, Arccos, Golf Pad

### 12.1 Shot-by-Shot Replay
**Purpose:** Review every shot from a round.

**Components:**
- `RoundReplayPlayer` - Navigate through round
- `ShotCard` - Individual shot details
- `HoleReplayView` - Hole-by-hole breakdown
- `ShotPathVisualization` - Show shot trajectories

### 12.2 Pattern Recognition
**Purpose:** Identify recurring patterns.

**Components:**
- `MissPatternHeatmap` - Visual miss tendencies
- `ClubPatternAnalysis` - Performance by club
- `SituationAnalysis` - Performance in situations
- `TrendAlertSystem` - Alert on negative patterns

### 12.3 Scoring Breakdown
**Purpose:** Understand where strokes are lost.

**Components:**
- `ScoringDistribution` - Birdie/par/bogey chart
- `StrokeLossAnalysis` - Where strokes were lost
- `ParBreakdown` - Performance by par type
- `HoleTypeAnalysis` - Scoring by hole difficulty

### 12.4 Round Comparison
**Purpose:** Compare rounds over time.

**Components:**
- `RoundComparisonView` - Side-by-side rounds
- `ImprovementHighlight` - What got better
- `ConsistencyMeter` - Round-to-round variance
- `CourseSpecificTrend` - Performance at same course

---

## CATEGORY 13: On-Course Assistant

**Inspired by:** Arccos Caddie, Golflogix, 18Birdies GPS

### 13.1 Live Distance Calculator
**Purpose:** Real-time distance information.

**Components:**
- `DistanceToTargetCard` - Distance to selected point
- `LayupDistanceCalculator` - Optimal layup distances
- `CarryVsRollEstimate` - Based on conditions
- `ElevationAdjustment` - Adjusted playing distance

### 13.2 Smart Club Suggestion
**Purpose:** AI-powered club recommendations.

**Components:**
- `ClubSuggestionWidget` - Recommended club
- `ConfidenceIndicator` - AI confidence level
- `AlternativeOptions` - Other viable clubs
- `ConditionFactors` - What's affecting suggestion

### 13.3 Shot Tracking
**Purpose:** Log shots during play.

**Components:**
- `QuickShotLogger` - Fast shot entry
- `ShotLocationPicker` - Tap to mark location
- `LiveScoringCard` - Running score
- `StatTrackerWidget` - Live FIR/GIR/Putts

### 13.4 Hazard Mapping
**Purpose:** Know where trouble lurks.

**Components:**
- `HazardOverlay` - Show hazards on map
- `CarryDistanceMarker` - Distance to clear
- `SafeZoneHighlight` - Optimal landing areas
- `BailoutOption` - Safe play alternatives

### 13.5 Caddie Tips
**Purpose:** AI caddie advice.

**Components:**
- `HoleStrategyTip` - Pre-hole advice
- `WindAdjustmentTip` - Wind compensation
- `PinPositionAdvice` - Attack or safe play
- `ConfidenceBooster` - Positive mental cues

---

## CATEGORY 14: Fitness & Physical Training

**Inspired by:** TPI, GolfForever, GOLFWOD

### 14.1 Golf-Specific Workouts
**Purpose:** Exercises designed for golf.

**Components:**
- `WorkoutCard` - Workout overview
- `ExerciseVideoPlayer` - Demo videos
- `WorkoutTimer` - Rest/work intervals
- `EquipmentFilter` - By available equipment

### 14.2 Flexibility Program
**Purpose:** Improve golf-specific flexibility.

**Components:**
- `FlexibilityRoutine` - Guided stretching
- `RangeOfMotionTest` - Measure flexibility
- `DailyStretchReminder` - Push notifications
- `ProgressPhotos` - Track flexibility gains

### 14.3 Strength Training
**Purpose:** Build golf power.

**Components:**
- `StrengthProgram` - Periodized training
- `OneRepMaxCalculator` - Strength tracking
- `ExerciseLibrary` - Full exercise database
- `ProgressChart` - Strength improvements

### 14.4 Speed Training
**Purpose:** Increase clubhead speed.

**Components:**
- `SpeedTrainingProtocol` - Overspeed training
- `SpeedTestLogger` - Track speed gains
- `SpeedProgressChart` - Speed over time
- `SpeedGoalSetter` - Target speed goals

### 14.5 Recovery & Injury Prevention
**Purpose:** Stay healthy and play more.

**Components:**
- `RecoveryRoutine` - Post-round recovery
- `InjuryPreventionTips` - Common golf injuries
- `PainLogTracker` - Track soreness/pain
- `RestDayRecommendation` - When to rest

---

## CATEGORY 15: Coach Connection

**Inspired by:** Skillest, CoachNow, V1 Golf Academy

### 15.1 Find a Coach
**Purpose:** Discover qualified instructors.

**Components:**
- `CoachSearchFilter` - Location, specialty, price
- `CoachProfileCard` - Bio, credentials, reviews
- `CoachComparisonTool` - Compare instructors
- `CoachReviewSystem` - Student reviews

### 15.2 Lesson Booking
**Purpose:** Schedule lessons easily.

**Components:**
- `AvailabilityCalendar` - Coach schedule
- `LessonTypeSelector` - In-person, video, playing
- `BookingConfirmation` - Confirm and pay
- `LessonReminder` - Upcoming lesson alerts

### 15.3 Data Sharing
**Purpose:** Share stats with your coach.

**Components:**
- `DataSharingDashboard` - What to share
- `CoachInsightPanel` - Coach's view of your data
- `ProgressReportForCoach` - Formatted for instruction
- `VideoShareQueue` - Videos pending review

### 15.4 Lesson Notes & Drills
**Purpose:** Access assigned work.

**Components:**
- `LessonNotesViewer` - Post-lesson notes
- `AssignedDrillsList` - Homework drills
- `DrillCompletionTracker` - Mark drills done
- `FeedbackLoop` - Questions for coach

---

## CATEGORY 16: Handicap Tracker

**Inspired by:** The Grint, GHIN, Golf Genius

### 16.1 Handicap Dashboard
**Purpose:** Central handicap information.

**Components:**
- `HandicapIndexCard` - Current index display
- `TrendChart` - Handicap over time
- `ScoreDifferentialList` - Contributing rounds
- `LowHighIndex` - Low/high index tracking

### 16.2 Round Posting
**Purpose:** Easy score submission.

**Components:**
- `QuickPostForm` - Fast round entry
- `CourseRatingLookup` - Find course/slope
- `AdjustedGrossCalculator` - ESC adjustments
- `PostingConfirmation` - Verify and submit

### 16.3 Handicap Projection
**Purpose:** See where you're headed.

**Components:**
- `ProjectionCalculator` - "What if" scenarios
- `GoalHandicapTracker` - Path to target index
- `DroppingScoreAlert` - When scores drop off
- `ImprovementPace` - Rate of improvement

### 16.4 Course Handicap Calculator
**Purpose:** Know your strokes.

**Components:**
- `CourseHandicapCard` - Strokes for course/tees
- `PlayingHandicapAdjust` - Format adjustments
- `StrokeHoleAllocation` - Which holes get strokes
- `TeeRecommendation` - Best tees for ability

---

## Implementation Priority (Phase 2)

### Phase 2A - High Impact
1. **Swing Video Library** - Visual learning & progress
2. **Goal Setting & Progress** - Motivation & engagement
3. **Handicap Tracker** - Core golfer need
4. **On-Course Assistant** - Real-time value

### Phase 2B - Enhanced Experience
5. **Round Replay & Analysis** - Deep insights
6. **Equipment & Bag Manager** - Equipment optimization
7. **Fitness & Training** - Physical improvement
8. **Coach Connection** - Professional guidance

---

## Data Models Required (Phase 2)

```typescript
// Swing Video Library
interface SwingVideo {
    id: string;
    recordedAt: Date;
    club: string;
    angle: 'FACE_ON' | 'DOWN_THE_LINE' | 'OTHER';
    duration: number;
    thumbnailUrl: string;
    videoUrl: string;
    tags: string[];
    rating: 1 | 2 | 3 | 4 | 5;
    keyPositions: KeyPosition[];
    annotations: Annotation[];
    folderId?: string;
}

interface KeyPosition {
    name: string;
    frameNumber: number;
    angles: { name: string; value: number }[];
}

// Equipment
interface ClubInBag {
    id: string;
    type: ClubType;
    brand: string;
    model: string;
    loft: number;
    lie: number;
    shaft: ShaftSpec;
    grip: string;
    purchaseDate: Date;
    notes: string;
    stats: ClubStats;
}

interface ShaftSpec {
    brand: string;
    model: string;
    flex: 'L' | 'A' | 'R' | 'S' | 'X';
    weight: number;
    kickPoint: 'LOW' | 'MID' | 'HIGH';
}

// Goals
interface GolfGoal {
    id: string;
    type: 'HANDICAP' | 'STAT' | 'PRACTICE' | 'SKILL' | 'FITNESS';
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    startDate: Date;
    targetDate: Date;
    milestones: Milestone[];
    status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'FAILED';
}

interface Milestone {
    id: string;
    title: string;
    targetValue: number;
    targetDate: Date;
    completedDate?: Date;
    status: 'PENDING' | 'COMPLETED';
}

// On-Course
interface OnCourseRound {
    id: string;
    courseId: string;
    teeId: string;
    startTime: Date;
    currentHole: number;
    shots: LiveShot[];
    conditions: PlayingConditions;
    liveScore: number;
}

interface LiveShot {
    holeNumber: number;
    shotNumber: number;
    club: string;
    startLocation: GeoLocation;
    endLocation: GeoLocation;
    result: ShotResult;
    timestamp: Date;
}

// Fitness
interface Workout {
    id: string;
    name: string;
    category: 'STRENGTH' | 'FLEXIBILITY' | 'SPEED' | 'RECOVERY';
    duration: number;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    equipment: string[];
    exercises: WorkoutExercise[];
    targetAreas: string[];
}

// Handicap
interface HandicapRecord {
    id: string;
    userId: string;
    currentIndex: number;
    lowIndex: number;
    highIndex: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    scoringRecords: ScoringRecord[];
    lastUpdated: Date;
}

interface ScoringRecord {
    id: string;
    date: Date;
    courseId: string;
    teeId: string;
    grossScore: number;
    adjustedScore: number;
    courseRating: number;
    slopeRating: number;
    scoreDifferential: number;
    isUsedInCalculation: boolean;
}
```

---

## Component File Structure (Phase 2)

```
/implementations/
├── NewFeatures_SwingLibrary.tsx
├── NewFeatures_Equipment.tsx
├── NewFeatures_Goals.tsx
├── NewFeatures_RoundReplay.tsx
├── NewFeatures_OnCourse.tsx
├── NewFeatures_Fitness.tsx
├── NewFeatures_Coaching.tsx
└── NewFeatures_Handicap.tsx
```

---

*Ready to proceed with Phase 2 code implementation.*

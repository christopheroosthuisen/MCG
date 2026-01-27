/**
 * NewFeatures_Fitness.tsx
 * Fitness & Physical Training System for MCG Golf App
 *
 * Inspired by: TPI, GolfForever, GOLFWOD
 *
 * Features:
 * - Golf-Specific Workouts
 * - Flexibility Programs
 * - Strength Training
 * - Speed Training
 * - Recovery & Injury Prevention
 */

import React, { useState, useEffect, useRef } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type WorkoutCategory = 'STRENGTH' | 'FLEXIBILITY' | 'SPEED' | 'RECOVERY' | 'WARMUP';
type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type BodyArea = 'CORE' | 'HIPS' | 'SHOULDERS' | 'BACK' | 'LEGS' | 'FULL_BODY';
type Equipment = 'NONE' | 'RESISTANCE_BAND' | 'DUMBBELLS' | 'KETTLEBELL' | 'FOAM_ROLLER' | 'SPEED_STICK';

interface Exercise {
  id: string;
  name: string;
  description: string;
  targetAreas: BodyArea[];
  duration?: number; // seconds
  reps?: number;
  sets?: number;
  restBetweenSets?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  instructions: string[];
  tips: string[];
  equipment: Equipment[];
}

interface Workout {
  id: string;
  name: string;
  description: string;
  category: WorkoutCategory;
  difficulty: DifficultyLevel;
  duration: number; // minutes
  exercises: WorkoutExercise[];
  targetAreas: BodyArea[];
  equipment: Equipment[];
  caloriesBurned: number;
  golfBenefit: string;
}

interface WorkoutExercise {
  exercise: Exercise;
  order: number;
  customReps?: number;
  customSets?: number;
  customDuration?: number;
}

interface FlexibilityTest {
  id: string;
  name: string;
  description: string;
  targetArea: BodyArea;
  measurementType: 'DEGREES' | 'INCHES' | 'PASS_FAIL';
  goodRange: { min: number; max: number };
  averageRange: { min: number; max: number };
  instructions: string[];
}

interface SpeedTestResult {
  id: string;
  date: Date;
  clubSpeed: number;
  peakSpeed: number;
  protocol: string;
  notes: string;
}

interface PainLog {
  id: string;
  date: Date;
  bodyArea: BodyArea | string;
  painLevel: number; // 1-10
  description: string;
  trigger?: string;
}

interface WorkoutLog {
  id: string;
  workoutId: string;
  date: Date;
  duration: number;
  completed: boolean;
  notes?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#FF8200',
  secondary: '#115740',
  background: '#F5F5F5',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#FAFAFA',
    100: '#F7F7F7',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
  },
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  strength: '#8B5CF6',
  flexibility: '#22C55E',
  speed: '#F59E0B',
  recovery: '#3B82F6',
};

const CATEGORY_CONFIG: Record<WorkoutCategory, { label: string; icon: string; color: string }> = {
  STRENGTH: { label: 'Strength', icon: '💪', color: COLORS.strength },
  FLEXIBILITY: { label: 'Flexibility', icon: '🧘', color: COLORS.flexibility },
  SPEED: { label: 'Speed', icon: '⚡', color: COLORS.speed },
  RECOVERY: { label: 'Recovery', icon: '🌿', color: COLORS.recovery },
  WARMUP: { label: 'Warmup', icon: '🔥', color: COLORS.primary },
};

const DIFFICULTY_CONFIG: Record<DifficultyLevel, { label: string; color: string }> = {
  BEGINNER: { label: 'Beginner', color: COLORS.success },
  INTERMEDIATE: { label: 'Intermediate', color: COLORS.warning },
  ADVANCED: { label: 'Advanced', color: COLORS.error },
};

const BODY_AREA_ICONS: Record<BodyArea, string> = {
  CORE: '🎯',
  HIPS: '🦵',
  SHOULDERS: '💪',
  BACK: '🔙',
  LEGS: '🦿',
  FULL_BODY: '🏃',
};

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_EXERCISES: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Hip Rotations',
    description: 'Improve hip mobility for better rotation',
    targetAreas: ['HIPS'],
    duration: 30,
    sets: 2,
    equipment: ['NONE'],
    instructions: [
      'Stand with feet shoulder-width apart',
      'Place hands on hips',
      'Rotate hips in large circles',
      'Switch direction halfway',
    ],
    tips: ['Keep upper body stable', 'Make circles as large as possible'],
  },
  {
    id: 'ex-2',
    name: 'Thoracic Spine Rotation',
    description: 'Increase rotational mobility in upper back',
    targetAreas: ['BACK', 'SHOULDERS'],
    duration: 45,
    sets: 2,
    equipment: ['NONE'],
    instructions: [
      'Get on all fours (tabletop position)',
      'Place one hand behind your head',
      'Rotate thoracic spine, bringing elbow up',
      'Return to starting position',
    ],
    tips: ['Keep hips square', 'Move slowly and controlled'],
  },
  {
    id: 'ex-3',
    name: 'Anti-Rotation Press',
    description: 'Build core stability for powerful rotation',
    targetAreas: ['CORE'],
    reps: 12,
    sets: 3,
    restBetweenSets: 45,
    equipment: ['RESISTANCE_BAND'],
    instructions: [
      'Attach band to fixed point at chest height',
      'Stand perpendicular to anchor point',
      'Hold band at chest with both hands',
      'Press straight out, resisting rotation',
    ],
    tips: ['Brace core throughout', 'Keep shoulders square'],
  },
  {
    id: 'ex-4',
    name: 'Glute Bridge',
    description: 'Activate glutes for power and stability',
    targetAreas: ['HIPS', 'LEGS'],
    reps: 15,
    sets: 3,
    restBetweenSets: 30,
    equipment: ['NONE'],
    instructions: [
      'Lie on back with knees bent, feet flat',
      'Drive through heels to lift hips',
      'Squeeze glutes at top',
      'Lower with control',
    ],
    tips: ['Avoid arching lower back', 'Hold top position for 2 seconds'],
  },
  {
    id: 'ex-5',
    name: 'Speed Swings - Driver',
    description: 'Overspeed training for driver',
    targetAreas: ['FULL_BODY'],
    reps: 5,
    sets: 3,
    restBetweenSets: 60,
    equipment: ['SPEED_STICK'],
    instructions: [
      'Use lightest speed stick',
      'Take full backswing',
      'Swing as fast as possible',
      'Focus on maximum speed, not position',
    ],
    tips: ['Rest fully between sets', 'Swing freely without tension'],
  },
];

const MOCK_WORKOUTS: Workout[] = [
  {
    id: 'workout-1',
    name: 'Golf Mobility Routine',
    description: 'Essential daily stretches for golfers',
    category: 'FLEXIBILITY',
    difficulty: 'BEGINNER',
    duration: 15,
    exercises: [
      { exercise: MOCK_EXERCISES[0], order: 1 },
      { exercise: MOCK_EXERCISES[1], order: 2 },
    ],
    targetAreas: ['HIPS', 'BACK', 'SHOULDERS'],
    equipment: ['NONE'],
    caloriesBurned: 45,
    golfBenefit: 'Improved turn and rotation',
  },
  {
    id: 'workout-2',
    name: 'Core Power Builder',
    description: 'Build a stable, powerful core for golf',
    category: 'STRENGTH',
    difficulty: 'INTERMEDIATE',
    duration: 25,
    exercises: [
      { exercise: MOCK_EXERCISES[2], order: 1 },
      { exercise: MOCK_EXERCISES[3], order: 2 },
    ],
    targetAreas: ['CORE', 'HIPS'],
    equipment: ['RESISTANCE_BAND'],
    caloriesBurned: 120,
    golfBenefit: 'More stable swing and consistent ball striking',
  },
  {
    id: 'workout-3',
    name: 'Speed Training Protocol',
    description: 'Overspeed training for club head speed',
    category: 'SPEED',
    difficulty: 'INTERMEDIATE',
    duration: 20,
    exercises: [
      { exercise: MOCK_EXERCISES[4], order: 1 },
    ],
    targetAreas: ['FULL_BODY'],
    equipment: ['SPEED_STICK'],
    caloriesBurned: 80,
    golfBenefit: 'Increased driver distance',
  },
  {
    id: 'workout-4',
    name: 'Post-Round Recovery',
    description: 'Essential recovery routine after playing',
    category: 'RECOVERY',
    difficulty: 'BEGINNER',
    duration: 10,
    exercises: [
      { exercise: MOCK_EXERCISES[0], order: 1 },
      { exercise: MOCK_EXERCISES[1], order: 2 },
    ],
    targetAreas: ['FULL_BODY'],
    equipment: ['FOAM_ROLLER'],
    caloriesBurned: 30,
    golfBenefit: 'Faster recovery, reduced soreness',
  },
];

const MOCK_FLEXIBILITY_TESTS: FlexibilityTest[] = [
  {
    id: 'test-1',
    name: 'Shoulder Turn Test',
    description: 'Measure your shoulder rotation range',
    targetArea: 'SHOULDERS',
    measurementType: 'DEGREES',
    goodRange: { min: 90, max: 120 },
    averageRange: { min: 70, max: 89 },
    instructions: [
      'Sit in a chair with good posture',
      'Cross arms over chest',
      'Rotate shoulders as far as possible',
      'Measure angle from starting position',
    ],
  },
  {
    id: 'test-2',
    name: 'Hip Internal Rotation',
    description: 'Check hip mobility for proper rotation',
    targetArea: 'HIPS',
    measurementType: 'DEGREES',
    goodRange: { min: 45, max: 60 },
    averageRange: { min: 30, max: 44 },
    instructions: [
      'Sit on edge of table, legs hanging',
      'Rotate lower leg outward',
      'Measure angle of rotation',
    ],
  },
];

const MOCK_SPEED_RESULTS: SpeedTestResult[] = [
  { id: 'speed-1', date: new Date('2024-03-20'), clubSpeed: 108, peakSpeed: 112, protocol: 'Superspeed', notes: 'Felt good' },
  { id: 'speed-2', date: new Date('2024-03-13'), clubSpeed: 106, peakSpeed: 110, protocol: 'Superspeed', notes: '' },
  { id: 'speed-3', date: new Date('2024-03-06'), clubSpeed: 105, peakSpeed: 109, protocol: 'Superspeed', notes: '' },
  { id: 'speed-4', date: new Date('2024-02-28'), clubSpeed: 103, peakSpeed: 107, protocol: 'Superspeed', notes: 'Starting program' },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * WorkoutCard - Workout overview
 */
interface WorkoutCardProps {
  workout: Workout;
  onStart?: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onStart }) => {
  const categoryConfig = CATEGORY_CONFIG[workout.category];
  const difficultyConfig = DIFFICULTY_CONFIG[workout.difficulty];

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      {/* Header */}
      <div style={{
        padding: 16,
        backgroundColor: categoryConfig.color,
        color: COLORS.white,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <span style={{ fontSize: 24, marginRight: 8 }}>{categoryConfig.icon}</span>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{workout.name}</span>
          </div>
          <span style={{
            fontSize: 11,
            padding: '4px 10px',
            backgroundColor: 'rgba(255,255,255,0.25)',
            borderRadius: 12,
            fontWeight: 600,
          }}>
            {difficultyConfig.label}
          </span>
        </div>
        <p style={{ fontSize: 13, opacity: 0.9, marginTop: 6 }}>
          {workout.description}
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: 16,
        borderBottom: `1px solid ${COLORS.gray[200]}`,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{workout.duration}</div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>min</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{workout.exercises.length}</div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>exercises</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{workout.caloriesBurned}</div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>cal</div>
        </div>
      </div>

      {/* Target Areas */}
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 12, color: COLORS.gray[500], marginBottom: 8 }}>Target Areas</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {workout.targetAreas.map(area => (
            <span
              key={area}
              style={{
                fontSize: 12,
                padding: '4px 10px',
                backgroundColor: COLORS.gray[100],
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>{BODY_AREA_ICONS[area]}</span>
              {area.replace('_', ' ')}
            </span>
          ))}
        </div>

        <div style={{
          marginTop: 12,
          padding: 10,
          backgroundColor: `${categoryConfig.color}10`,
          borderRadius: 8,
          fontSize: 13,
          color: COLORS.gray[700],
        }}>
          🎯 {workout.golfBenefit}
        </div>
      </div>

      {/* Start Button */}
      {onStart && (
        <div style={{ padding: 16, paddingTop: 0 }}>
          <button
            onClick={onStart}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 10,
              border: 'none',
              backgroundColor: categoryConfig.color,
              color: COLORS.white,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Start Workout
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * ExerciseCard - Individual exercise display
 */
interface ExerciseCardProps {
  exercise: Exercise;
  isActive?: boolean;
  onComplete?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isActive, onComplete }) => {
  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      boxShadow: isActive ? `0 0 0 2px ${COLORS.primary}` : '0 2px 8px rgba(0,0,0,0.08)',
      opacity: isActive ? 1 : 0.7,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{exercise.name}</div>
          <div style={{ fontSize: 13, color: COLORS.gray[500], marginTop: 2 }}>
            {exercise.description}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {exercise.duration && (
            <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.primary }}>
              {formatDuration(exercise.duration)}
            </span>
          )}
          {exercise.reps && (
            <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.primary }}>
              {exercise.sets}×{exercise.reps}
            </span>
          )}
        </div>
      </div>

      {/* Target Areas */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {exercise.targetAreas.map(area => (
          <span
            key={area}
            style={{
              fontSize: 11,
              padding: '2px 8px',
              backgroundColor: COLORS.gray[100],
              borderRadius: 10,
            }}
          >
            {BODY_AREA_ICONS[area]} {area}
          </span>
        ))}
      </div>

      {/* Instructions */}
      {isActive && (
        <div style={{
          padding: 12,
          backgroundColor: COLORS.gray[50],
          borderRadius: 8,
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Instructions</div>
          {exercise.instructions.map((instruction, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: 8,
                marginBottom: 4,
                fontSize: 13,
                color: COLORS.gray[600],
              }}
            >
              <span style={{ color: COLORS.primary }}>{index + 1}.</span>
              <span>{instruction}</span>
            </div>
          ))}
        </div>
      )}

      {/* Complete Button */}
      {isActive && onComplete && (
        <button
          onClick={onComplete}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: 'none',
            backgroundColor: COLORS.success,
            color: COLORS.white,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Complete ✓
        </button>
      )}
    </div>
  );
};

/**
 * WorkoutTimer - Rest/work intervals
 */
interface WorkoutTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  label?: string;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ initialSeconds, onComplete, label = 'Timer' }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onComplete]);

  const progress = ((initialSeconds - seconds) / initialSeconds) * 100;

  const toggleTimer = () => {
    if (seconds === 0) {
      setSeconds(initialSeconds);
    }
    setIsRunning(!isRunning);
  };

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 24,
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{ fontSize: 14, color: COLORS.gray[500], marginBottom: 8 }}>{label}</div>

      {/* Timer Circle */}
      <div style={{
        position: 'relative',
        width: 160,
        height: 160,
        margin: '0 auto 20px',
      }}>
        <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="transparent"
            stroke={COLORS.gray[200]}
            strokeWidth="10"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="transparent"
            stroke={COLORS.primary}
            strokeWidth="10"
            strokeDasharray={440}
            strokeDashoffset={440 - (440 * progress) / 100}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <span style={{ fontSize: 36, fontWeight: 700 }}>
            {formatDuration(seconds)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          onClick={toggleTimer}
          style={{
            padding: '12px 32px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: isRunning ? COLORS.warning : COLORS.primary,
            color: COLORS.white,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {isRunning ? 'Pause' : seconds === 0 ? 'Restart' : 'Start'}
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
            setSeconds(initialSeconds);
          }}
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            border: `1px solid ${COLORS.gray[300]}`,
            backgroundColor: COLORS.white,
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

/**
 * FlexibilityTestCard - ROM test display
 */
interface FlexibilityTestCardProps {
  test: FlexibilityTest;
  lastResult?: number;
  onTest?: () => void;
}

const FlexibilityTestCard: React.FC<FlexibilityTestCardProps> = ({ test, lastResult, onTest }) => {
  const getResultStatus = (result: number) => {
    if (result >= test.goodRange.min) return { label: 'Good', color: COLORS.success };
    if (result >= test.averageRange.min) return { label: 'Average', color: COLORS.warning };
    return { label: 'Needs Work', color: COLORS.error };
  };

  const status = lastResult ? getResultStatus(lastResult) : null;

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{test.name}</div>
          <div style={{ fontSize: 13, color: COLORS.gray[500], marginTop: 2 }}>
            {test.description}
          </div>
        </div>
        <span style={{
          fontSize: 11,
          padding: '4px 10px',
          backgroundColor: COLORS.gray[100],
          borderRadius: 12,
        }}>
          {BODY_AREA_ICONS[test.targetArea]} {test.targetArea}
        </span>
      </div>

      {/* Last Result */}
      {lastResult && status && (
        <div style={{
          marginTop: 12,
          padding: 12,
          backgroundColor: `${status.color}10`,
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Last Result</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: status.color }}>
              {lastResult}°
            </div>
          </div>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: status.color,
          }}>
            {status.label}
          </span>
        </div>
      )}

      {/* Range Info */}
      <div style={{
        marginTop: 12,
        display: 'flex',
        gap: 8,
      }}>
        <span style={{
          fontSize: 11,
          padding: '4px 8px',
          backgroundColor: `${COLORS.success}15`,
          color: COLORS.success,
          borderRadius: 4,
        }}>
          Good: {test.goodRange.min}°+
        </span>
        <span style={{
          fontSize: 11,
          padding: '4px 8px',
          backgroundColor: `${COLORS.warning}15`,
          color: COLORS.warning,
          borderRadius: 4,
        }}>
          Avg: {test.averageRange.min}-{test.averageRange.max}°
        </span>
      </div>

      {onTest && (
        <button
          onClick={onTest}
          style={{
            width: '100%',
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${COLORS.primary}`,
            backgroundColor: COLORS.white,
            color: COLORS.primary,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Take Test
        </button>
      )}
    </div>
  );
};

/**
 * SpeedProgressChart - Speed gains over time
 */
interface SpeedProgressChartProps {
  results: SpeedTestResult[];
}

const SpeedProgressChart: React.FC<SpeedProgressChartProps> = ({ results }) => {
  const sortedResults = [...results].sort((a, b) => a.date.getTime() - b.date.getTime());
  const maxSpeed = Math.max(...results.map(r => r.peakSpeed)) + 5;
  const minSpeed = Math.min(...results.map(r => r.clubSpeed)) - 5;
  const range = maxSpeed - minSpeed;

  const speedGain = results.length >= 2
    ? results[0].clubSpeed - results[results.length - 1].clubSpeed
    : 0;

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Speed Progress</h3>
        {speedGain > 0 && (
          <span style={{
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.success,
          }}>
            +{speedGain} mph
          </span>
        )}
      </div>

      {/* Chart */}
      <div style={{
        height: 150,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        padding: '0 10px',
      }}>
        {sortedResults.map((result, index) => (
          <div
            key={result.id}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.speed }}>
              {result.peakSpeed}
            </span>
            <div style={{
              width: '100%',
              backgroundColor: `${COLORS.speed}30`,
              borderRadius: '4px 4px 0 0',
              height: `${((result.peakSpeed - minSpeed) / range) * 100}px`,
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${((result.clubSpeed - minSpeed) / range) * 100}px`,
                backgroundColor: COLORS.speed,
                borderRadius: '4px 4px 0 0',
              }} />
            </div>
            <span style={{ fontSize: 10, color: COLORS.gray[500] }}>
              {result.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        marginTop: 12,
        paddingTop: 12,
        borderTop: `1px solid ${COLORS.gray[200]}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, backgroundColor: COLORS.speed, borderRadius: 2 }} />
          <span style={{ fontSize: 11, color: COLORS.gray[500] }}>Club Speed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, backgroundColor: `${COLORS.speed}30`, borderRadius: 2 }} />
          <span style={{ fontSize: 11, color: COLORS.gray[500] }}>Peak Speed</span>
        </div>
      </div>
    </div>
  );
};

/**
 * PainLogEntry - Log pain/soreness
 */
interface PainLogEntryProps {
  onLog: (log: Omit<PainLog, 'id' | 'date'>) => void;
}

const PainLogEntry: React.FC<PainLogEntryProps> = ({ onLog }) => {
  const [bodyArea, setBodyArea] = useState('');
  const [painLevel, setPainLevel] = useState(1);
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (bodyArea) {
      onLog({ bodyArea, painLevel, description });
      setBodyArea('');
      setPainLevel(1);
      setDescription('');
    }
  };

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Log Pain/Soreness</h3>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: COLORS.gray[600], display: 'block', marginBottom: 4 }}>
          Body Area
        </label>
        <select
          value={bodyArea}
          onChange={(e) => setBodyArea(e.target.value)}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${COLORS.gray[300]}`,
            fontSize: 14,
          }}
        >
          <option value="">Select area...</option>
          <option value="Lower Back">Lower Back</option>
          <option value="Upper Back">Upper Back</option>
          <option value="Left Shoulder">Left Shoulder</option>
          <option value="Right Shoulder">Right Shoulder</option>
          <option value="Left Hip">Left Hip</option>
          <option value="Right Hip">Right Hip</option>
          <option value="Left Knee">Left Knee</option>
          <option value="Right Knee">Right Knee</option>
          <option value="Left Elbow">Left Elbow</option>
          <option value="Right Elbow">Right Elbow</option>
          <option value="Left Wrist">Left Wrist</option>
          <option value="Right Wrist">Right Wrist</option>
          <option value="Neck">Neck</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: COLORS.gray[600], display: 'block', marginBottom: 8 }}>
          Pain Level: {painLevel}/10
        </label>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
            <button
              key={level}
              onClick={() => setPainLevel(level)}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 4,
                border: 'none',
                backgroundColor: painLevel >= level
                  ? (level <= 3 ? COLORS.success : level <= 6 ? COLORS.warning : COLORS.error)
                  : COLORS.gray[200],
                color: painLevel >= level ? COLORS.white : COLORS.gray[500],
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: COLORS.gray[600], display: 'block', marginBottom: 4 }}>
          Notes (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the pain or what triggered it..."
          rows={2}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${COLORS.gray[300]}`,
            fontSize: 14,
            resize: 'none',
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!bodyArea}
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 8,
          border: 'none',
          backgroundColor: bodyArea ? COLORS.primary : COLORS.gray[300],
          color: COLORS.white,
          fontSize: 14,
          fontWeight: 600,
          cursor: bodyArea ? 'pointer' : 'not-allowed',
        }}
      >
        Log Entry
      </button>
    </div>
  );
};

/**
 * RecoveryRecommendation - Rest day suggestions
 */
interface RecoveryRecommendationProps {
  lastWorkoutDate: Date;
  recentPainLogs: PainLog[];
  workoutsThisWeek: number;
}

const RecoveryRecommendation: React.FC<RecoveryRecommendationProps> = ({
  lastWorkoutDate,
  recentPainLogs,
  workoutsThisWeek,
}) => {
  const daysSinceLastWorkout = Math.floor(
    (new Date().getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const hasPain = recentPainLogs.some(log => log.painLevel >= 5);

  let recommendation = '';
  let color = COLORS.success;
  let icon = '✅';

  if (hasPain) {
    recommendation = 'Consider a rest day - you logged significant pain recently. Try light stretching only.';
    color = COLORS.error;
    icon = '⚠️';
  } else if (workoutsThisWeek >= 5) {
    recommendation = 'Great week! Consider taking tomorrow off for recovery.';
    color = COLORS.warning;
    icon = '💤';
  } else if (daysSinceLastWorkout === 0) {
    recommendation = "You worked out today. Make sure to get good sleep for recovery.";
    color = COLORS.success;
    icon = '😴';
  } else if (daysSinceLastWorkout >= 3) {
    recommendation = "It's been a few days - a light mobility session would help maintain flexibility.";
    color = COLORS.info;
    icon = '🧘';
  } else {
    recommendation = "You're on a good schedule. Keep it up!";
    color = COLORS.success;
    icon = '💪';
  }

  return (
    <div style={{
      backgroundColor: `${color}10`,
      borderRadius: 12,
      padding: 16,
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.gray[800] }}>
            Recovery Status
          </div>
          <p style={{ fontSize: 13, color: COLORS.gray[600], marginTop: 4 }}>
            {recommendation}
          </p>
          <div style={{
            display: 'flex',
            gap: 12,
            marginTop: 8,
            fontSize: 12,
            color: COLORS.gray[500],
          }}>
            <span>Workouts this week: {workoutsThisWeek}</span>
            <span>•</span>
            <span>Last workout: {daysSinceLastWorkout === 0 ? 'Today' : `${daysSinceLastWorkout}d ago`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN HUB VIEW
// ============================================================================

type FitnessTabView = 'WORKOUTS' | 'FLEXIBILITY' | 'SPEED' | 'RECOVERY';

const FitnessHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FitnessTabView>('WORKOUTS');
  const [workouts] = useState<Workout[]>(MOCK_WORKOUTS);
  const [flexTests] = useState<FlexibilityTest[]>(MOCK_FLEXIBILITY_TESTS);
  const [speedResults] = useState<SpeedTestResult[]>(MOCK_SPEED_RESULTS);
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory | 'ALL'>('ALL');

  const tabs = [
    { id: 'WORKOUTS' as FitnessTabView, label: 'Workouts', icon: '🏋️' },
    { id: 'FLEXIBILITY' as FitnessTabView, label: 'Flexibility', icon: '🧘' },
    { id: 'SPEED' as FitnessTabView, label: 'Speed', icon: '⚡' },
    { id: 'RECOVERY' as FitnessTabView, label: 'Recovery', icon: '🌿' },
  ];

  const filteredWorkouts = selectedCategory === 'ALL'
    ? workouts
    : workouts.filter(w => w.category === selectedCategory);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.background,
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: COLORS.white,
        padding: 16,
        borderBottom: `1px solid ${COLORS.gray[200]}`,
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
          Fitness & Training
        </h1>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: 4,
          backgroundColor: COLORS.gray[100],
          padding: 4,
          borderRadius: 10,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: activeTab === tab.id ? COLORS.white : 'transparent',
                color: activeTab === tab.id ? COLORS.primary : COLORS.gray[500],
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span style={{ display: 'block', fontSize: 16 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        {activeTab === 'WORKOUTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Category Filter */}
            <div style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 8,
            }}>
              <button
                onClick={() => setSelectedCategory('ALL')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: 'none',
                  backgroundColor: selectedCategory === 'ALL' ? COLORS.primary : COLORS.gray[200],
                  color: selectedCategory === 'ALL' ? COLORS.white : COLORS.gray[600],
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                All
              </button>
              {(Object.keys(CATEGORY_CONFIG) as WorkoutCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: 'none',
                    backgroundColor: selectedCategory === cat
                      ? CATEGORY_CONFIG[cat].color
                      : COLORS.gray[200],
                    color: selectedCategory === cat ? COLORS.white : COLORS.gray[600],
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {CATEGORY_CONFIG[cat].icon} {CATEGORY_CONFIG[cat].label}
                </button>
              ))}
            </div>

            {/* Workout List */}
            {filteredWorkouts.map(workout => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onStart={() => console.log('Starting workout:', workout.name)}
              />
            ))}
          </div>
        )}

        {activeTab === 'FLEXIBILITY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Range of Motion Tests</h2>
            {flexTests.map(test => (
              <FlexibilityTestCard
                key={test.id}
                test={test}
                lastResult={test.id === 'test-1' ? 85 : 40}
              />
            ))}

            <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>
              Daily Stretch Routine
            </h2>
            <WorkoutTimer
              initialSeconds={300}
              label="5 Minute Stretch"
            />
          </div>
        )}

        {activeTab === 'SPEED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SpeedProgressChart results={speedResults} />

            <div style={{
              backgroundColor: COLORS.white,
              borderRadius: 12,
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                Current Stats
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
              }}>
                <div style={{
                  padding: 16,
                  backgroundColor: `${COLORS.speed}10`,
                  borderRadius: 8,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.speed }}>
                    {speedResults[0].clubSpeed}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Club Speed (mph)</div>
                </div>
                <div style={{
                  padding: 16,
                  backgroundColor: COLORS.gray[50],
                  borderRadius: 8,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>
                    {speedResults[0].peakSpeed}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Peak Speed (mph)</div>
                </div>
              </div>
            </div>

            <button style={{
              padding: 14,
              borderRadius: 10,
              border: 'none',
              backgroundColor: COLORS.speed,
              color: COLORS.white,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              ⚡ Log New Speed Test
            </button>
          </div>
        )}

        {activeTab === 'RECOVERY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <RecoveryRecommendation
              lastWorkoutDate={new Date(Date.now() - 1000 * 60 * 60 * 24)}
              recentPainLogs={[]}
              workoutsThisWeek={3}
            />

            <PainLogEntry
              onLog={(log) => console.log('Logged pain:', log)}
            />

            <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>
              Post-Round Recovery
            </h2>
            {workouts.filter(w => w.category === 'RECOVERY').map(workout => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Usage Example:
 *
 * import { FitnessHub } from './NewFeatures_Fitness';
 *
 * function App() {
 *   return <FitnessHub />;
 * }
 *
 * Individual components can also be imported:
 * - WorkoutCard - Workout overview
 * - ExerciseCard - Individual exercise
 * - WorkoutTimer - Timer component
 * - FlexibilityTestCard - ROM test display
 * - SpeedProgressChart - Speed gains chart
 * - PainLogEntry - Log pain/soreness
 * - RecoveryRecommendation - Rest suggestions
 */

export {
  // Main Hub
  FitnessHub,

  // Workout Components
  WorkoutCard,
  ExerciseCard,
  WorkoutTimer,

  // Flexibility Components
  FlexibilityTestCard,

  // Speed Components
  SpeedProgressChart,

  // Recovery Components
  PainLogEntry,
  RecoveryRecommendation,

  // Types
  type Workout,
  type Exercise,
  type FlexibilityTest,
  type SpeedTestResult,
  type PainLog,
  type WorkoutCategory,
  type DifficultyLevel,
  type BodyArea,
};

export default FitnessHub;

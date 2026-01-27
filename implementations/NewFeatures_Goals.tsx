/**
 * NewFeatures_Goals.tsx
 * Goal Setting & Progress System for MCG Golf App
 *
 * Inspired by: Strava, MyFitnessPal, Habitica
 *
 * Features:
 * - SMART Goal Creator with wizard
 * - Progress Dashboard with visual tracking
 * - Achievement/Gamification System
 * - AI-Generated Improvement Roadmap
 * - Weekly/Monthly Progress Reports
 */

import React, { useState, useEffect } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type GoalType = 'HANDICAP' | 'STAT' | 'PRACTICE' | 'SKILL' | 'FITNESS';
type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'FAILED';
type MilestoneStatus = 'PENDING' | 'COMPLETED' | 'CURRENT';
type AchievementRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
type PhaseStatus = 'COMPLETED' | 'CURRENT' | 'UPCOMING';

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  targetDate: Date;
  completedDate?: Date;
  status: MilestoneStatus;
}

interface GolfGoal {
  id: string;
  type: GoalType;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  targetDate: Date;
  milestones: Milestone[];
  status: GoalStatus;
  createdAt: Date;
  icon: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  category: string;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  xpReward: number;
}

interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: PhaseStatus;
  tasks: RoadmapTask[];
  targetOutcome: string;
}

interface RoadmapTask {
  id: string;
  title: string;
  isCompleted: boolean;
  category: 'PRACTICE' | 'PLAY' | 'LEARN' | 'FITNESS';
}

interface WeeklyStats {
  practiceMinutes: number;
  roundsPlayed: number;
  drillsCompleted: number;
  goalsProgress: number;
  achievementsUnlocked: number;
  streakDays: number;
}

interface ProgressReport {
  id: string;
  type: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  periodStart: Date;
  periodEnd: Date;
  stats: WeeklyStats;
  highlights: string[];
  areasToImprove: string[];
  goalProgress: { goalId: string; progressDelta: number }[];
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
    100: '#F7F7F7',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
  },
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  rarity: {
    COMMON: '#9CA3AF',
    UNCOMMON: '#22C55E',
    RARE: '#3B82F6',
    EPIC: '#8B5CF6',
    LEGENDARY: '#F59E0B',
  }
};

const GOAL_TYPE_CONFIG: Record<GoalType, { icon: string; label: string; color: string }> = {
  HANDICAP: { icon: '🎯', label: 'Handicap', color: COLORS.primary },
  STAT: { icon: '📊', label: 'Statistics', color: COLORS.info },
  PRACTICE: { icon: '⏱️', label: 'Practice', color: COLORS.success },
  SKILL: { icon: '🏌️', label: 'Skill', color: COLORS.secondary },
  FITNESS: { icon: '💪', label: 'Fitness', color: COLORS.warning },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_GOALS: GolfGoal[] = [
  {
    id: 'goal-1',
    type: 'HANDICAP',
    title: 'Single Digit Handicap',
    description: 'Reduce my handicap to single digits by end of season',
    targetValue: 9.9,
    currentValue: 12.4,
    unit: 'index',
    startDate: new Date('2024-01-01'),
    targetDate: new Date('2024-10-01'),
    status: 'ACTIVE',
    createdAt: new Date('2024-01-01'),
    icon: '🎯',
    milestones: [
      {
        id: 'ms-1',
        title: 'Break 12',
        description: 'Get handicap below 12.0',
        targetValue: 11.9,
        currentValue: 12.4,
        targetDate: new Date('2024-04-01'),
        status: 'CURRENT',
      },
      {
        id: 'ms-2',
        title: 'Break 11',
        description: 'Get handicap below 11.0',
        targetValue: 10.9,
        currentValue: 12.4,
        targetDate: new Date('2024-07-01'),
        status: 'PENDING',
      },
      {
        id: 'ms-3',
        title: 'Single Digits',
        description: 'Get handicap below 10.0',
        targetValue: 9.9,
        currentValue: 12.4,
        targetDate: new Date('2024-10-01'),
        status: 'PENDING',
      },
    ],
  },
  {
    id: 'goal-2',
    type: 'STAT',
    title: 'Greens in Regulation Master',
    description: 'Hit 50% of greens in regulation',
    targetValue: 50,
    currentValue: 38,
    unit: '%',
    startDate: new Date('2024-02-01'),
    targetDate: new Date('2024-08-01'),
    status: 'ACTIVE',
    createdAt: new Date('2024-02-01'),
    icon: '📊',
    milestones: [
      {
        id: 'ms-4',
        title: 'Hit 40% GIR',
        description: 'Reach 40% greens in regulation',
        targetValue: 40,
        currentValue: 38,
        targetDate: new Date('2024-04-01'),
        status: 'CURRENT',
      },
      {
        id: 'ms-5',
        title: 'Hit 45% GIR',
        description: 'Reach 45% greens in regulation',
        targetValue: 45,
        currentValue: 38,
        targetDate: new Date('2024-06-01'),
        status: 'PENDING',
      },
    ],
  },
  {
    id: 'goal-3',
    type: 'PRACTICE',
    title: 'Consistent Practice',
    description: 'Practice at least 5 hours per week',
    targetValue: 5,
    currentValue: 3.5,
    unit: 'hrs/week',
    startDate: new Date('2024-03-01'),
    targetDate: new Date('2024-12-31'),
    status: 'ACTIVE',
    createdAt: new Date('2024-03-01'),
    icon: '⏱️',
    milestones: [],
  },
];

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'First Steps',
    description: 'Complete your first practice session',
    icon: '👣',
    rarity: 'COMMON',
    category: 'Getting Started',
    unlockedAt: new Date('2024-01-15'),
    progress: 1,
    maxProgress: 1,
    isUnlocked: true,
    xpReward: 50,
  },
  {
    id: 'ach-2',
    title: 'Goal Setter',
    description: 'Create your first goal',
    icon: '🎯',
    rarity: 'COMMON',
    category: 'Goals',
    unlockedAt: new Date('2024-01-16'),
    progress: 1,
    maxProgress: 1,
    isUnlocked: true,
    xpReward: 50,
  },
  {
    id: 'ach-3',
    title: 'Week Warrior',
    description: 'Practice 7 days in a row',
    icon: '🔥',
    rarity: 'UNCOMMON',
    category: 'Streaks',
    progress: 5,
    maxProgress: 7,
    isUnlocked: false,
    xpReward: 150,
  },
  {
    id: 'ach-4',
    title: 'Iron Will',
    description: 'Complete 50 iron drills',
    icon: '🏌️',
    rarity: 'RARE',
    category: 'Practice',
    progress: 32,
    maxProgress: 50,
    isUnlocked: false,
    xpReward: 300,
  },
  {
    id: 'ach-5',
    title: 'Birdie Hunter',
    description: 'Make 25 birdies',
    icon: '🐦',
    rarity: 'RARE',
    category: 'Scoring',
    progress: 12,
    maxProgress: 25,
    isUnlocked: false,
    xpReward: 300,
  },
  {
    id: 'ach-6',
    title: 'Eagle Eye',
    description: 'Make an eagle',
    icon: '🦅',
    rarity: 'EPIC',
    category: 'Scoring',
    progress: 0,
    maxProgress: 1,
    isUnlocked: false,
    xpReward: 500,
  },
  {
    id: 'ach-7',
    title: 'Course Conqueror',
    description: 'Shoot under par',
    icon: '👑',
    rarity: 'LEGENDARY',
    category: 'Scoring',
    progress: 0,
    maxProgress: 1,
    isUnlocked: false,
    xpReward: 1000,
  },
  {
    id: 'ach-8',
    title: 'Marathon Practicer',
    description: 'Log 100 hours of practice',
    icon: '⏳',
    rarity: 'EPIC',
    category: 'Practice',
    progress: 42,
    maxProgress: 100,
    isUnlocked: false,
    xpReward: 500,
  },
];

const MOCK_ROADMAP: RoadmapPhase[] = [
  {
    id: 'phase-1',
    title: 'Foundation Building',
    description: 'Establish consistent practice habits and identify key weaknesses',
    duration: '4 weeks',
    status: 'COMPLETED',
    targetOutcome: 'Solid practice routine established',
    tasks: [
      { id: 't1', title: 'Complete swing assessment', isCompleted: true, category: 'LEARN' },
      { id: 't2', title: 'Establish weekly practice schedule', isCompleted: true, category: 'PRACTICE' },
      { id: 't3', title: 'Play 3 tracked rounds', isCompleted: true, category: 'PLAY' },
    ],
  },
  {
    id: 'phase-2',
    title: 'Short Game Focus',
    description: 'Dedicate time to improving putting and chipping',
    duration: '6 weeks',
    status: 'CURRENT',
    targetOutcome: 'Reduce putts per round by 2',
    tasks: [
      { id: 't4', title: 'Complete 10 putting drills', isCompleted: true, category: 'PRACTICE' },
      { id: 't5', title: 'Learn distance control techniques', isCompleted: true, category: 'LEARN' },
      { id: 't6', title: 'Practice chipping 3x per week', isCompleted: false, category: 'PRACTICE' },
      { id: 't7', title: 'Play 5 rounds tracking short game', isCompleted: false, category: 'PLAY' },
    ],
  },
  {
    id: 'phase-3',
    title: 'Iron Play Mastery',
    description: 'Improve iron accuracy and distance control',
    duration: '6 weeks',
    status: 'UPCOMING',
    targetOutcome: 'Increase GIR to 45%',
    tasks: [
      { id: 't8', title: 'Work on ball striking drills', isCompleted: false, category: 'PRACTICE' },
      { id: 't9', title: 'Learn trajectory control', isCompleted: false, category: 'LEARN' },
      { id: 't10', title: 'Complete swing tempo training', isCompleted: false, category: 'FITNESS' },
    ],
  },
  {
    id: 'phase-4',
    title: 'Course Management',
    description: 'Improve decision-making and strategy on the course',
    duration: '4 weeks',
    status: 'UPCOMING',
    targetOutcome: 'Break target handicap',
    tasks: [
      { id: 't11', title: 'Study course strategy concepts', isCompleted: false, category: 'LEARN' },
      { id: 't12', title: 'Play 8 rounds with strategy focus', isCompleted: false, category: 'PLAY' },
    ],
  },
];

const MOCK_WEEKLY_REPORT: ProgressReport = {
  id: 'report-1',
  type: 'WEEKLY',
  periodStart: new Date('2024-03-18'),
  periodEnd: new Date('2024-03-24'),
  stats: {
    practiceMinutes: 285,
    roundsPlayed: 2,
    drillsCompleted: 12,
    goalsProgress: 8,
    achievementsUnlocked: 1,
    streakDays: 5,
  },
  highlights: [
    'Personal best putting average: 31 putts/round',
    'Completed 12 drills this week',
    'Maintained 5-day practice streak',
  ],
  areasToImprove: [
    'Iron approach accuracy needs work',
    'Fairway hit percentage dropped',
  ],
  goalProgress: [
    { goalId: 'goal-1', progressDelta: 0.3 },
    { goalId: 'goal-2', progressDelta: 2 },
  ],
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDateFull = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const getDaysRemaining = (targetDate: Date): number => {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const calculateProgress = (current: number, target: number, start: number = 0): number => {
  if (target === start) return 100;
  return Math.min(100, Math.max(0, ((current - start) / (target - start)) * 100));
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * ProgressRing - Circular progress indicator
 */
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 80,
  strokeWidth = 8,
  color = COLORS.primary,
  backgroundColor = COLORS.gray[200],
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      {children && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * GoalTypeSelector - Select goal type during creation
 */
interface GoalTypeSelectorProps {
  selected: GoalType | null;
  onSelect: (type: GoalType) => void;
}

const GoalTypeSelector: React.FC<GoalTypeSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {(Object.keys(GOAL_TYPE_CONFIG) as GoalType[]).map((type) => {
        const config = GOAL_TYPE_CONFIG[type];
        const isSelected = selected === type;

        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            style={{
              padding: 16,
              borderRadius: 12,
              border: `2px solid ${isSelected ? config.color : COLORS.gray[200]}`,
              backgroundColor: isSelected ? `${config.color}15` : COLORS.white,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 28 }}>{config.icon}</span>
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              color: isSelected ? config.color : COLORS.gray[600],
            }}>
              {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

/**
 * MilestoneBuilder - Add milestones to a goal
 */
interface MilestoneBuilderProps {
  milestones: Partial<Milestone>[];
  onAdd: () => void;
  onUpdate: (index: number, milestone: Partial<Milestone>) => void;
  onRemove: (index: number) => void;
}

const MilestoneBuilder: React.FC<MilestoneBuilderProps> = ({
  milestones,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.gray[700] }}>
          Milestones (Optional)
        </span>
        <button
          onClick={onAdd}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: `1px solid ${COLORS.primary}`,
            backgroundColor: 'transparent',
            color: COLORS.primary,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Add Milestone
        </button>
      </div>

      {milestones.map((milestone, index) => (
        <div
          key={index}
          style={{
            padding: 12,
            backgroundColor: COLORS.gray[100],
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: COLORS.gray[500] }}>
              Milestone {index + 1}
            </span>
            <button
              onClick={() => onRemove(index)}
              style={{
                padding: 4,
                backgroundColor: 'transparent',
                border: 'none',
                color: COLORS.error,
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              ×
            </button>
          </div>
          <input
            type="text"
            placeholder="Milestone title"
            value={milestone.title || ''}
            onChange={(e) => onUpdate(index, { ...milestone, title: e.target.value })}
            style={{
              padding: 8,
              borderRadius: 6,
              border: `1px solid ${COLORS.gray[300]}`,
              fontSize: 14,
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              placeholder="Target"
              value={milestone.targetValue || ''}
              onChange={(e) => onUpdate(index, { ...milestone, targetValue: Number(e.target.value) })}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 6,
                border: `1px solid ${COLORS.gray[300]}`,
                fontSize: 14,
              }}
            />
            <input
              type="date"
              value={milestone.targetDate instanceof Date ? milestone.targetDate.toISOString().split('T')[0] : ''}
              onChange={(e) => onUpdate(index, { ...milestone, targetDate: new Date(e.target.value) })}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 6,
                border: `1px solid ${COLORS.gray[300]}`,
                fontSize: 14,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * GoalWizard - Step-by-step goal creation
 */
interface GoalWizardProps {
  onComplete: (goal: Partial<GolfGoal>) => void;
  onCancel: () => void;
}

const GoalWizard: React.FC<GoalWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [goalData, setGoalData] = useState<Partial<GolfGoal>>({
    milestones: [],
  });
  const [milestones, setMilestones] = useState<Partial<Milestone>[]>([]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      onComplete({
        ...goalData,
        milestones: milestones as Milestone[],
        status: 'ACTIVE',
        createdAt: new Date(),
        startDate: new Date(),
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onCancel();
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!goalData.type;
      case 2: return !!goalData.title && goalData.targetValue !== undefined;
      case 3: return !!goalData.targetDate;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: COLORS.white,
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: 16,
          borderBottom: `1px solid ${COLORS.gray[200]}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>Create Goal</span>
          <span style={{ fontSize: 14, color: COLORS.gray[500] }}>Step {step} of 4</span>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 4,
          backgroundColor: COLORS.gray[200],
        }}>
          <div style={{
            height: '100%',
            width: `${(step / 4) * 100}%`,
            backgroundColor: COLORS.primary,
            transition: 'width 0.3s',
          }} />
        </div>

        {/* Content */}
        <div style={{ padding: 20 }}>
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                What type of goal?
              </h3>
              <GoalTypeSelector
                selected={goalData.type || null}
                onSelect={(type) => setGoalData({ ...goalData, type })}
              />
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                Define your goal
              </h3>
              <div>
                <label style={{ fontSize: 12, color: COLORS.gray[600], marginBottom: 4, display: 'block' }}>
                  Goal Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Break 80"
                  value={goalData.title || ''}
                  onChange={(e) => setGoalData({ ...goalData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: `1px solid ${COLORS.gray[300]}`,
                    fontSize: 14,
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: COLORS.gray[600], marginBottom: 4, display: 'block' }}>
                  Description
                </label>
                <textarea
                  placeholder="What does achieving this goal mean to you?"
                  value={goalData.description || ''}
                  onChange={(e) => setGoalData({ ...goalData, description: e.target.value })}
                  rows={3}
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
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: COLORS.gray[600], marginBottom: 4, display: 'block' }}>
                    Target Value
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 9.9"
                    value={goalData.targetValue || ''}
                    onChange={(e) => setGoalData({ ...goalData, targetValue: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: `1px solid ${COLORS.gray[300]}`,
                      fontSize: 14,
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: COLORS.gray[600], marginBottom: 4, display: 'block' }}>
                    Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., handicap"
                    value={goalData.unit || ''}
                    onChange={(e) => setGoalData({ ...goalData, unit: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: `1px solid ${COLORS.gray[300]}`,
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                Set your deadline
              </h3>
              <div>
                <label style={{ fontSize: 12, color: COLORS.gray[600], marginBottom: 4, display: 'block' }}>
                  Target Date
                </label>
                <input
                  type="date"
                  value={goalData.targetDate instanceof Date ? goalData.targetDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setGoalData({ ...goalData, targetDate: new Date(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: `1px solid ${COLORS.gray[300]}`,
                    fontSize: 14,
                  }}
                />
              </div>
              {goalData.targetDate && (
                <div style={{
                  padding: 12,
                  backgroundColor: COLORS.gray[100],
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span style={{ fontSize: 20 }}>📅</span>
                  <span style={{ fontSize: 14, color: COLORS.gray[600] }}>
                    {getDaysRemaining(goalData.targetDate as Date)} days to achieve your goal
                  </span>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                Add milestones
              </h3>
              <p style={{ fontSize: 14, color: COLORS.gray[500] }}>
                Break your goal into smaller checkpoints to stay motivated.
              </p>
              <MilestoneBuilder
                milestones={milestones}
                onAdd={() => setMilestones([...milestones, {}])}
                onUpdate={(index, milestone) => {
                  const updated = [...milestones];
                  updated[index] = milestone;
                  setMilestones(updated);
                }}
                onRemove={(index) => {
                  setMilestones(milestones.filter((_, i) => i !== index));
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: 16,
          borderTop: `1px solid ${COLORS.gray[200]}`,
          display: 'flex',
          gap: 12,
        }}>
          <button
            onClick={handleBack}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${COLORS.gray[300]}`,
              backgroundColor: COLORS.white,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: 'none',
              backgroundColor: canProceed() ? COLORS.primary : COLORS.gray[300],
              color: COLORS.white,
              fontSize: 14,
              fontWeight: 600,
              cursor: canProceed() ? 'pointer' : 'not-allowed',
            }}
          >
            {step === 4 ? 'Create Goal' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * GoalProgressCard - Individual goal status display
 */
interface GoalProgressCardProps {
  goal: GolfGoal;
  onTap?: () => void;
}

const GoalProgressCard: React.FC<GoalProgressCardProps> = ({ goal, onTap }) => {
  const config = GOAL_TYPE_CONFIG[goal.type];
  const progress = calculateProgress(goal.currentValue, goal.targetValue);
  const daysRemaining = getDaysRemaining(goal.targetDate);
  const currentMilestone = goal.milestones.find(m => m.status === 'CURRENT');

  return (
    <div
      onClick={onTap}
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: onTap ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <ProgressRing progress={progress} size={60} color={config.color}>
          <span style={{ fontSize: 14, fontWeight: 700, color: config.color }}>
            {Math.round(progress)}%
          </span>
        </ProgressRing>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>{goal.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{goal.title}</span>
          </div>

          <div style={{ fontSize: 12, color: COLORS.gray[500], marginBottom: 8 }}>
            {goal.currentValue} / {goal.targetValue} {goal.unit}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              fontSize: 11,
              color: daysRemaining < 30 ? COLORS.warning : COLORS.gray[400],
              fontWeight: daysRemaining < 30 ? 600 : 400,
            }}>
              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
            </span>

            {currentMilestone && (
              <span style={{
                fontSize: 11,
                color: COLORS.primary,
                fontWeight: 500,
              }}>
                Next: {currentMilestone.title}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * MilestoneTimeline - Visual timeline of milestones
 */
interface MilestoneTimelineProps {
  milestones: Milestone[];
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {milestones.map((milestone, index) => {
        const isLast = index === milestones.length - 1;
        const statusColors = {
          COMPLETED: COLORS.success,
          CURRENT: COLORS.primary,
          PENDING: COLORS.gray[300],
        };

        return (
          <div key={milestone.id} style={{ display: 'flex', gap: 12 }}>
            {/* Timeline line and dot */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 20,
            }}>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: statusColors[milestone.status],
                border: `2px solid ${milestone.status === 'CURRENT' ? COLORS.white : 'transparent'}`,
                boxShadow: milestone.status === 'CURRENT' ? `0 0 0 2px ${COLORS.primary}` : 'none',
              }} />
              {!isLast && (
                <div style={{
                  width: 2,
                  flex: 1,
                  backgroundColor: milestone.status === 'COMPLETED' ? COLORS.success : COLORS.gray[200],
                  minHeight: 40,
                }} />
              )}
            </div>

            {/* Content */}
            <div style={{
              flex: 1,
              paddingBottom: isLast ? 0 : 16,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
                <div>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: milestone.status === 'PENDING' ? COLORS.gray[400] : COLORS.gray[700],
                  }}>
                    {milestone.title}
                  </span>
                  <div style={{ fontSize: 12, color: COLORS.gray[500], marginTop: 2 }}>
                    Target: {milestone.targetValue}
                  </div>
                </div>
                <span style={{
                  fontSize: 11,
                  color: COLORS.gray[400],
                }}>
                  {formatDate(milestone.targetDate)}
                </span>
              </div>
              {milestone.status === 'CURRENT' && (
                <div style={{
                  marginTop: 8,
                  padding: 8,
                  backgroundColor: `${COLORS.primary}10`,
                  borderRadius: 6,
                  fontSize: 12,
                  color: COLORS.primary,
                }}>
                  Current: {milestone.currentValue} / {milestone.targetValue}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * StreakTracker - Shows consecutive practice days
 */
interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  weekDays: boolean[];
}

const StreakTracker: React.FC<StreakTrackerProps> = ({
  currentStreak,
  longestStreak,
  weekDays,
}) => {
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Practice Streak</span>
          <div style={{ fontSize: 12, color: COLORS.gray[500] }}>
            Best: {longestStreak} days
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 12px',
          backgroundColor: currentStreak > 0 ? `${COLORS.primary}15` : COLORS.gray[100],
          borderRadius: 20,
        }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <span style={{
            fontSize: 18,
            fontWeight: 700,
            color: currentStreak > 0 ? COLORS.primary : COLORS.gray[400],
          }}>
            {currentStreak}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {dayLabels.map((label, index) => (
          <div key={index} style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: COLORS.gray[400] }}>{label}</span>
            <div style={{
              marginTop: 6,
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: weekDays[index] ? COLORS.success : COLORS.gray[200],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {weekDays[index] && (
                <span style={{ color: COLORS.white, fontSize: 14 }}>✓</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * AchievementCard - Individual achievement display
 */
interface AchievementCardProps {
  achievement: Achievement;
  onTap?: () => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onTap }) => {
  const rarityColor = COLORS.rarity[achievement.rarity];
  const progress = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <div
      onClick={onTap}
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        opacity: achievement.isUnlocked ? 1 : 0.7,
        cursor: onTap ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: achievement.isUnlocked ? `${rarityColor}20` : COLORS.gray[100],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px solid ${achievement.isUnlocked ? rarityColor : COLORS.gray[300]}`,
        }}>
          <span style={{
            fontSize: 24,
            filter: achievement.isUnlocked ? 'none' : 'grayscale(100%)',
          }}>
            {achievement.icon}
          </span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{achievement.title}</span>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: rarityColor,
              textTransform: 'uppercase',
            }}>
              {achievement.rarity}
            </span>
          </div>
          <span style={{ fontSize: 12, color: COLORS.gray[500] }}>
            {achievement.description}
          </span>

          {!achievement.isUnlocked && (
            <div style={{ marginTop: 8 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
                color: COLORS.gray[500],
                marginBottom: 4,
              }}>
                <span>{achievement.progress} / {achievement.maxProgress}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div style={{
                height: 4,
                backgroundColor: COLORS.gray[200],
                borderRadius: 2,
              }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  backgroundColor: rarityColor,
                  borderRadius: 2,
                }} />
              </div>
            </div>
          )}

          {achievement.isUnlocked && achievement.unlockedAt && (
            <div style={{
              marginTop: 4,
              fontSize: 11,
              color: COLORS.success,
            }}>
              Unlocked {formatDate(achievement.unlockedAt)} · +{achievement.xpReward} XP
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * AchievementGrid - Grid of all achievements
 */
interface AchievementGridProps {
  achievements: Achievement[];
  filter: 'ALL' | 'UNLOCKED' | 'LOCKED';
}

const AchievementGrid: React.FC<AchievementGridProps> = ({ achievements, filter }) => {
  const filtered = achievements.filter(a => {
    if (filter === 'UNLOCKED') return a.isUnlocked;
    if (filter === 'LOCKED') return !a.isUnlocked;
    return true;
  });

  const grouped = filtered.reduce((acc, achievement) => {
    if (!acc[achievement.category]) acc[achievement.category] = [];
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3 style={{
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.gray[600],
            marginBottom: 12,
          }}>
            {category}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * AchievementUnlockModal - Celebration on achievement unlock
 */
interface AchievementUnlockModalProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementUnlockModal: React.FC<AchievementUnlockModalProps> = ({
  achievement,
  onClose,
}) => {
  const rarityColor = COLORS.rarity[achievement.rarity];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 32,
        textAlign: 'center',
        maxWidth: 320,
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          backgroundColor: `${rarityColor}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          border: `3px solid ${rarityColor}`,
        }}>
          <span style={{ fontSize: 40 }}>{achievement.icon}</span>
        </div>

        <div style={{
          fontSize: 12,
          fontWeight: 700,
          color: rarityColor,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          {achievement.rarity} Achievement Unlocked!
        </div>

        <h2 style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 8,
        }}>
          {achievement.title}
        </h2>

        <p style={{
          fontSize: 14,
          color: COLORS.gray[500],
          marginBottom: 16,
        }}>
          {achievement.description}
        </p>

        <div style={{
          padding: '8px 16px',
          backgroundColor: COLORS.primary,
          borderRadius: 20,
          display: 'inline-block',
          marginBottom: 24,
        }}>
          <span style={{
            color: COLORS.white,
            fontWeight: 700,
            fontSize: 16,
          }}>
            +{achievement.xpReward} XP
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 10,
            border: 'none',
            backgroundColor: COLORS.primary,
            color: COLORS.white,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Awesome!
        </button>
      </div>
    </div>
  );
};

/**
 * PhaseCard - Current roadmap phase details
 */
interface PhaseCardProps {
  phase: RoadmapPhase;
  isCurrent: boolean;
}

const PhaseCard: React.FC<PhaseCardProps> = ({ phase, isCurrent }) => {
  const completedTasks = phase.tasks.filter(t => t.isCompleted).length;
  const progress = (completedTasks / phase.tasks.length) * 100;

  const statusColors = {
    COMPLETED: COLORS.success,
    CURRENT: COLORS.primary,
    UPCOMING: COLORS.gray[400],
  };

  const categoryIcons = {
    PRACTICE: '🎯',
    PLAY: '⛳',
    LEARN: '📚',
    FITNESS: '💪',
  };

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      boxShadow: isCurrent ? `0 0 0 2px ${COLORS.primary}` : '0 2px 8px rgba(0,0,0,0.08)',
      opacity: phase.status === 'UPCOMING' ? 0.7 : 1,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
      }}>
        <div>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            color: statusColors[phase.status],
            textTransform: 'uppercase',
          }}>
            {phase.status}
          </span>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{phase.title}</h3>
          <span style={{ fontSize: 12, color: COLORS.gray[500] }}>{phase.duration}</span>
        </div>
        {phase.status !== 'UPCOMING' && (
          <ProgressRing progress={progress} size={44} strokeWidth={4}>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{Math.round(progress)}%</span>
          </ProgressRing>
        )}
      </div>

      <p style={{
        fontSize: 13,
        color: COLORS.gray[600],
        marginBottom: 12,
      }}>
        {phase.description}
      </p>

      {phase.status !== 'UPCOMING' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {phase.tasks.map(task => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: 8,
                backgroundColor: COLORS.gray[50],
                borderRadius: 6,
              }}
            >
              <div style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                backgroundColor: task.isCompleted ? COLORS.success : COLORS.gray[200],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {task.isCompleted && (
                  <span style={{ color: COLORS.white, fontSize: 12 }}>✓</span>
                )}
              </div>
              <span style={{ fontSize: 13, color: COLORS.gray[600] }}>
                {categoryIcons[task.category]}
              </span>
              <span style={{
                fontSize: 13,
                color: task.isCompleted ? COLORS.gray[500] : COLORS.gray[700],
                textDecoration: task.isCompleted ? 'line-through' : 'none',
              }}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: 12,
        padding: 8,
        backgroundColor: `${statusColors[phase.status]}10`,
        borderRadius: 6,
      }}>
        <span style={{ fontSize: 12, color: statusColors[phase.status] }}>
          🎯 Outcome: {phase.targetOutcome}
        </span>
      </div>
    </div>
  );
};

/**
 * RoadmapView - Visual improvement path
 */
interface RoadmapViewProps {
  phases: RoadmapPhase[];
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ phases }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Your Improvement Path</h2>
        <span style={{ fontSize: 12, color: COLORS.gray[500] }}>
          {phases.filter(p => p.status === 'COMPLETED').length} / {phases.length} phases
        </span>
      </div>

      {phases.map((phase, index) => (
        <div key={phase.id}>
          <PhaseCard phase={phase} isCurrent={phase.status === 'CURRENT'} />
          {index < phases.length - 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '8px 0',
            }}>
              <div style={{
                width: 2,
                height: 24,
                backgroundColor: phase.status === 'COMPLETED' ? COLORS.success : COLORS.gray[200],
              }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * NextStepsWidget - Immediate action items
 */
interface NextStepsWidgetProps {
  currentPhase: RoadmapPhase;
}

const NextStepsWidget: React.FC<NextStepsWidgetProps> = ({ currentPhase }) => {
  const incompleteTasks = currentPhase.tasks.filter(t => !t.isCompleted).slice(0, 3);

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 18 }}>📋</span>
        <span style={{ fontSize: 16, fontWeight: 700 }}>Next Steps</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {incompleteTasks.map((task, index) => (
          <div
            key={task.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: 12,
              backgroundColor: index === 0 ? `${COLORS.primary}10` : COLORS.gray[50],
              borderRadius: 8,
              border: index === 0 ? `1px solid ${COLORS.primary}30` : 'none',
            }}
          >
            <span style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: index === 0 ? COLORS.primary : COLORS.gray[300],
              color: COLORS.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
            }}>
              {index + 1}
            </span>
            <span style={{
              fontSize: 14,
              color: COLORS.gray[700],
              fontWeight: index === 0 ? 600 : 400,
            }}>
              {task.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * WeeklyReportCard - 7-day summary
 */
interface WeeklyReportCardProps {
  report: ProgressReport;
}

const WeeklyReportCard: React.FC<WeeklyReportCardProps> = ({ report }) => {
  const stats = [
    { label: 'Practice Time', value: `${Math.round(report.stats.practiceMinutes / 60)}h ${report.stats.practiceMinutes % 60}m`, icon: '⏱️' },
    { label: 'Rounds Played', value: report.stats.roundsPlayed.toString(), icon: '⛳' },
    { label: 'Drills Done', value: report.stats.drillsCompleted.toString(), icon: '🎯' },
    { label: 'Streak', value: `${report.stats.streakDays} days`, icon: '🔥' },
  ];

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
        backgroundColor: COLORS.primary,
        color: COLORS.white,
      }}>
        <div style={{ fontSize: 12, opacity: 0.9 }}>Weekly Report</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
          {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 1,
        backgroundColor: COLORS.gray[200],
      }}>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              padding: 16,
              backgroundColor: COLORS.white,
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 20 }}>{stat.icon}</span>
            <div style={{
              fontSize: 20,
              fontWeight: 700,
              color: COLORS.gray[800],
              marginTop: 4,
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: COLORS.gray[500] }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Highlights */}
      <div style={{ padding: 16 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>✨ Highlights</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {report.highlights.map((highlight, index) => (
            <div
              key={index}
              style={{
                padding: 8,
                backgroundColor: `${COLORS.success}10`,
                borderRadius: 6,
                fontSize: 13,
                color: COLORS.gray[700],
              }}
            >
              {highlight}
            </div>
          ))}
        </div>
      </div>

      {/* Areas to Improve */}
      {report.areasToImprove.length > 0 && (
        <div style={{ padding: '0 16px 16px' }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>🎯 Focus Areas</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {report.areasToImprove.map((area, index) => (
              <div
                key={index}
                style={{
                  padding: 8,
                  backgroundColor: `${COLORS.warning}10`,
                  borderRadius: 6,
                  fontSize: 13,
                  color: COLORS.gray[700],
                }}
              >
                {area}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ShareableProgressCard - Social sharing format
 */
interface ShareableProgressCardProps {
  goals: GolfGoal[];
  achievements: Achievement[];
  streak: number;
}

const ShareableProgressCard: React.FC<ShareableProgressCardProps> = ({
  goals,
  achievements,
  streak,
}) => {
  const activeGoals = goals.filter(g => g.status === 'ACTIVE');
  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const totalXP = unlockedAchievements.reduce((sum, a) => sum + a.xpReward, 0);

  return (
    <div style={{
      backgroundColor: COLORS.secondary,
      borderRadius: 16,
      padding: 24,
      color: COLORS.white,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 32 }}>⛳</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>
          MCG Golf Progress
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 20,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{activeGoals.length}</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>Active Goals</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{unlockedAchievements.length}</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>Achievements</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{streak}🔥</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>Day Streak</div>
        </div>
      </div>

      <div style={{
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        textAlign: 'center',
      }}>
        <span style={{ fontSize: 14 }}>Total XP Earned: </span>
        <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>
          {totalXP.toLocaleString()}
        </span>
      </div>

      <div style={{
        marginTop: 16,
        textAlign: 'center',
        fontSize: 12,
        opacity: 0.6,
      }}>
        mayoconservatoryofgolf.com
      </div>
    </div>
  );
};

// ============================================================================
// MAIN HUB VIEW
// ============================================================================

type GoalsTabView = 'GOALS' | 'ACHIEVEMENTS' | 'ROADMAP' | 'REPORTS';

const GoalsProgressHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GoalsTabView>('GOALS');
  const [showGoalWizard, setShowGoalWizard] = useState(false);
  const [goals, setGoals] = useState<GolfGoal[]>(MOCK_GOALS);
  const [achievements] = useState<Achievement[]>(MOCK_ACHIEVEMENTS);
  const [achievementFilter, setAchievementFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);

  const tabs = [
    { id: 'GOALS' as GoalsTabView, label: 'Goals', icon: '🎯' },
    { id: 'ACHIEVEMENTS' as GoalsTabView, label: 'Achievements', icon: '🏆' },
    { id: 'ROADMAP' as GoalsTabView, label: 'Roadmap', icon: '🗺️' },
    { id: 'REPORTS' as GoalsTabView, label: 'Reports', icon: '📊' },
  ];

  const handleGoalCreate = (goalData: Partial<GolfGoal>) => {
    const newGoal: GolfGoal = {
      id: `goal-${Date.now()}`,
      type: goalData.type || 'SKILL',
      title: goalData.title || '',
      description: goalData.description || '',
      targetValue: goalData.targetValue || 0,
      currentValue: 0,
      unit: goalData.unit || '',
      startDate: new Date(),
      targetDate: goalData.targetDate || new Date(),
      milestones: goalData.milestones || [],
      status: 'ACTIVE',
      createdAt: new Date(),
      icon: GOAL_TYPE_CONFIG[goalData.type || 'SKILL'].icon,
    };
    setGoals([...goals, newGoal]);
    setShowGoalWizard(false);
  };

  const currentPhase = MOCK_ROADMAP.find(p => p.status === 'CURRENT');

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
          Goals & Progress
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
        {activeTab === 'GOALS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Add Goal Button */}
            <button
              onClick={() => setShowGoalWizard(true)}
              style={{
                padding: 16,
                borderRadius: 12,
                border: `2px dashed ${COLORS.primary}`,
                backgroundColor: `${COLORS.primary}05`,
                color: COLORS.primary,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 20 }}>+</span>
              Create New Goal
            </button>

            {/* Streak Tracker */}
            <StreakTracker
              currentStreak={5}
              longestStreak={12}
              weekDays={[true, true, true, true, true, false, false]}
            />

            {/* Goals List */}
            <div>
              <h2 style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
                color: COLORS.gray[700],
              }}>
                Active Goals ({goals.filter(g => g.status === 'ACTIVE').length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {goals.filter(g => g.status === 'ACTIVE').map(goal => (
                  <GoalProgressCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>

            {/* Selected Goal Milestones (show for first goal as example) */}
            {goals[0]?.milestones.length > 0 && (
              <div style={{
                backgroundColor: COLORS.white,
                borderRadius: 12,
                padding: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}>
                <h3 style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 16,
                  color: COLORS.gray[700],
                }}>
                  {goals[0].title} - Milestones
                </h3>
                <MilestoneTimeline milestones={goals[0].milestones} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'ACHIEVEMENTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Achievement Stats */}
            <div style={{
              display: 'flex',
              gap: 12,
            }}>
              {['ALL', 'UNLOCKED', 'LOCKED'].map(filter => {
                const count = filter === 'ALL'
                  ? achievements.length
                  : filter === 'UNLOCKED'
                    ? achievements.filter(a => a.isUnlocked).length
                    : achievements.filter(a => !a.isUnlocked).length;

                return (
                  <button
                    key={filter}
                    onClick={() => setAchievementFilter(filter as any)}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 8,
                      border: achievementFilter === filter
                        ? `2px solid ${COLORS.primary}`
                        : `1px solid ${COLORS.gray[200]}`,
                      backgroundColor: achievementFilter === filter
                        ? `${COLORS.primary}10`
                        : COLORS.white,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: achievementFilter === filter ? COLORS.primary : COLORS.gray[700],
                    }}>
                      {count}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: COLORS.gray[500],
                    }}>
                      {filter === 'ALL' ? 'Total' : filter === 'UNLOCKED' ? 'Unlocked' : 'Locked'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Achievement Grid */}
            <AchievementGrid achievements={achievements} filter={achievementFilter} />
          </div>
        )}

        {activeTab === 'ROADMAP' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {currentPhase && <NextStepsWidget currentPhase={currentPhase} />}
            <RoadmapView phases={MOCK_ROADMAP} />
          </div>
        )}

        {activeTab === 'REPORTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <WeeklyReportCard report={MOCK_WEEKLY_REPORT} />

            <ShareableProgressCard
              goals={goals}
              achievements={achievements}
              streak={5}
            />

            <button style={{
              padding: 14,
              borderRadius: 10,
              border: 'none',
              backgroundColor: COLORS.primary,
              color: COLORS.white,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}>
              📤 Share Progress
            </button>
          </div>
        )}
      </div>

      {/* Goal Wizard Modal */}
      {showGoalWizard && (
        <GoalWizard
          onComplete={handleGoalCreate}
          onCancel={() => setShowGoalWizard(false)}
        />
      )}

      {/* Achievement Unlock Modal */}
      {showUnlockModal && unlockedAchievement && (
        <AchievementUnlockModal
          achievement={unlockedAchievement}
          onClose={() => {
            setShowUnlockModal(false);
            setUnlockedAchievement(null);
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Usage Example:
 *
 * import { GoalsProgressHub } from './NewFeatures_Goals';
 *
 * function App() {
 *   return <GoalsProgressHub />;
 * }
 *
 * Individual components can also be imported:
 * - GoalWizard - Step-by-step goal creation
 * - GoalProgressCard - Display individual goal
 * - ProgressRing - Circular progress indicator
 * - MilestoneTimeline - Timeline of milestones
 * - StreakTracker - Practice streak display
 * - AchievementCard - Individual achievement
 * - AchievementGrid - All achievements
 * - AchievementUnlockModal - Celebration modal
 * - RoadmapView - Improvement path visualization
 * - PhaseCard - Roadmap phase details
 * - NextStepsWidget - Immediate action items
 * - WeeklyReportCard - 7-day summary
 * - ShareableProgressCard - Social sharing format
 */

export {
  // Main Hub
  GoalsProgressHub,

  // Goal Components
  GoalWizard,
  GoalTypeSelector,
  MilestoneBuilder,
  GoalProgressCard,
  MilestoneTimeline,
  ProgressRing,
  StreakTracker,

  // Achievement Components
  AchievementCard,
  AchievementGrid,
  AchievementUnlockModal,

  // Roadmap Components
  RoadmapView,
  PhaseCard,
  NextStepsWidget,

  // Report Components
  WeeklyReportCard,
  ShareableProgressCard,

  // Types
  type GolfGoal,
  type Milestone,
  type Achievement,
  type RoadmapPhase,
  type ProgressReport,
  type GoalType,
  type AchievementRarity,
};

export default GoalsProgressHub;

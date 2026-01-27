/**
 * NewFeatures_AICoach.tsx
 * AI Swing Coach System for MCG App
 *
 * Features:
 * - Real-time Swing Analysis with AI feedback
 * - Personalized Drill Recommendations
 * - Voice-guided Practice Sessions
 * - Progress Tracking & Comparisons
 */

import React, { useState, useEffect, useRef } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type SwingType = 'driver' | 'iron' | 'wedge' | 'putter' | 'chip' | 'pitch';
type FaultCategory = 'setup' | 'backswing' | 'transition' | 'downswing' | 'impact' | 'follow_through';
type SeverityLevel = 'minor' | 'moderate' | 'major';
type DrillDifficulty = 'beginner' | 'intermediate' | 'advanced';
type SessionType = 'quick_check' | 'full_analysis' | 'drill_practice' | 'comparison';

interface SwingAnalysis {
  id: string;
  timestamp: string;
  swingType: SwingType;
  videoUrl?: string;
  thumbnailUrl?: string;
  overallScore: number;
  faults: SwingFault[];
  positives: string[];
  keyMetrics: SwingMetrics;
  aiSummary: string;
  drillRecommendations: string[];
  comparisonToBaseline?: ComparisonResult;
}

interface SwingFault {
  id: string;
  category: FaultCategory;
  title: string;
  description: string;
  severity: SeverityLevel;
  timestamp?: number; // Video timestamp in seconds
  correction: string;
  relatedDrills: string[];
  visualAid?: string;
}

interface SwingMetrics {
  clubPath: number;
  faceAngle: number;
  attackAngle: number;
  tempo: number;
  hipRotation: number;
  shoulderRotation: number;
  spineAngle: number;
  headMovement: number;
  weightTransfer: number;
  handPosition: number;
}

interface Drill {
  id: string;
  name: string;
  description: string;
  targetFault: FaultCategory;
  difficulty: DrillDifficulty;
  duration: number; // in minutes
  reps?: number;
  equipment: string[];
  steps: DrillStep[];
  videoUrl?: string;
  tips: string[];
  commonMistakes: string[];
}

interface DrillStep {
  number: number;
  instruction: string;
  duration?: number;
  imageUrl?: string;
  voicePrompt?: string;
}

interface PracticeSession {
  id: string;
  type: SessionType;
  startTime: string;
  endTime?: string;
  drills: SessionDrill[];
  swingsRecorded: number;
  totalDuration: number;
  focusAreas: FaultCategory[];
  notes?: string;
}

interface SessionDrill {
  drillId: string;
  drillName: string;
  completed: boolean;
  repsCompleted: number;
  targetReps: number;
  feedback?: string;
}

interface ComparisonResult {
  baselineDate: string;
  currentDate: string;
  improvements: MetricChange[];
  regressions: MetricChange[];
  overall: 'improved' | 'same' | 'regressed';
  percentageChange: number;
}

interface MetricChange {
  metric: string;
  previousValue: number;
  currentValue: number;
  change: number;
  isImprovement: boolean;
}

interface VoiceCommand {
  command: string;
  action: () => void;
}

interface AICoachMessage {
  id: string;
  type: 'ai' | 'user' | 'system';
  content: string;
  timestamp: string;
  attachments?: {
    type: 'video' | 'image' | 'drill' | 'analysis';
    data: any;
  }[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#FF8200',
  secondary: '#115740',
  white: '#FFFFFF',
  gray: '#4B4B4B',
  lightGray: '#F5F5F5',
  mediumGray: '#E0E0E0',
  darkGray: '#333333',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  ai: '#8B5CF6',
};

const SWING_TYPES: Record<SwingType, { name: string; icon: string }> = {
  driver: { name: 'Driver', icon: '🏌️' },
  iron: { name: 'Iron', icon: '🏌️‍♂️' },
  wedge: { name: 'Wedge', icon: '⛳' },
  putter: { name: 'Putter', icon: '🎯' },
  chip: { name: 'Chip', icon: '📍' },
  pitch: { name: 'Pitch', icon: '🌙' },
};

const FAULT_CATEGORIES: Record<FaultCategory, { name: string; icon: string; color: string }> = {
  setup: { name: 'Setup', icon: '🎯', color: '#3B82F6' },
  backswing: { name: 'Backswing', icon: '⬆️', color: '#8B5CF6' },
  transition: { name: 'Transition', icon: '🔄', color: '#EC4899' },
  downswing: { name: 'Downswing', icon: '⬇️', color: '#F59E0B' },
  impact: { name: 'Impact', icon: '💥', color: '#EF4444' },
  follow_through: { name: 'Follow Through', icon: '🏁', color: '#22C55E' },
};

const SEVERITY_CONFIG: Record<SeverityLevel, { name: string; color: string }> = {
  minor: { name: 'Minor', color: COLORS.success },
  moderate: { name: 'Moderate', color: COLORS.warning },
  major: { name: 'Major', color: COLORS.error },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockAnalysis: SwingAnalysis = {
  id: 'a1',
  timestamp: '2025-07-15T10:30:00',
  swingType: 'driver',
  overallScore: 72,
  faults: [
    {
      id: 'f1',
      category: 'backswing',
      title: 'Over-rotation',
      description: 'Your backswing extends past parallel, causing loss of control and inconsistent contact.',
      severity: 'moderate',
      timestamp: 1.2,
      correction: 'Stop your backswing when your left shoulder reaches under your chin. Feel like your swing is shorter.',
      relatedDrills: ['d1', 'd2'],
    },
    {
      id: 'f2',
      category: 'impact',
      title: 'Early Extension',
      description: 'Hips are moving toward the ball through impact, causing thin and topped shots.',
      severity: 'major',
      timestamp: 2.1,
      correction: 'Maintain your spine angle through impact. Feel like your rear end stays against a wall.',
      relatedDrills: ['d3', 'd4'],
    },
    {
      id: 'f3',
      category: 'setup',
      title: 'Grip Pressure',
      description: 'Grip appears too tight, restricting natural wrist hinge and clubhead speed.',
      severity: 'minor',
      timestamp: 0.5,
      correction: 'Hold the club like you\'re holding a small bird - firm enough it won\'t fly away, gentle enough not to hurt it.',
      relatedDrills: ['d5'],
    },
  ],
  positives: [
    'Excellent tempo throughout the swing',
    'Good weight shift to your lead side',
    'Solid balance at finish position',
    'Nice shoulder turn creating good coil',
  ],
  keyMetrics: {
    clubPath: 2.5,
    faceAngle: 1.2,
    attackAngle: -1.5,
    tempo: 3.2,
    hipRotation: 45,
    shoulderRotation: 92,
    spineAngle: 32,
    headMovement: 1.8,
    weightTransfer: 78,
    handPosition: 85,
  },
  aiSummary: 'Your swing shows good fundamentals with room for improvement in the backswing length and impact position. Focus on the drills below to address the early extension - this is your biggest power leak right now.',
  drillRecommendations: ['d3', 'd4', 'd1'],
};

const mockDrills: Drill[] = [
  {
    id: 'd1',
    name: 'Mirror Backswing Check',
    description: 'Use a mirror to monitor your backswing length and positions',
    targetFault: 'backswing',
    difficulty: 'beginner',
    duration: 10,
    reps: 20,
    equipment: ['Mirror', 'Any club'],
    steps: [
      { number: 1, instruction: 'Set up facing a mirror with your normal stance', voicePrompt: 'Set up facing the mirror' },
      { number: 2, instruction: 'Make slow backswings, stopping at the top', voicePrompt: 'Slow backswing, stop at the top' },
      { number: 3, instruction: 'Check that the shaft is parallel to the ground', voicePrompt: 'Check your shaft position' },
      { number: 4, instruction: 'Your left arm should be straight and club pointing at target', voicePrompt: 'Left arm straight, club at target' },
    ],
    tips: ['Use your phone to record from behind', 'Focus on feeling the correct position'],
    commonMistakes: ['Going too fast', 'Not checking positions'],
  },
  {
    id: 'd3',
    name: 'Wall Drill for Early Extension',
    description: 'Learn to maintain posture by keeping your rear against a wall',
    targetFault: 'impact',
    difficulty: 'intermediate',
    duration: 15,
    reps: 30,
    equipment: ['Wall', 'Short iron'],
    steps: [
      { number: 1, instruction: 'Set up with your rear end touching a wall', voicePrompt: 'Position your rear against the wall' },
      { number: 2, instruction: 'Take practice swings keeping contact with the wall', voicePrompt: 'Swing while maintaining wall contact' },
      { number: 3, instruction: 'Focus on hip rotation not extension', voicePrompt: 'Rotate your hips, don\'t thrust' },
      { number: 4, instruction: 'Gradually increase speed while maintaining contact', voicePrompt: 'Increase speed slowly' },
    ],
    tips: ['Start with half swings', 'Use a pool noodle between you and wall for comfort'],
    commonMistakes: ['Standing too close to wall', 'Losing contact at impact'],
  },
  {
    id: 'd5',
    name: 'Grip Pressure Scale',
    description: 'Learn the correct grip pressure using a 1-10 scale',
    targetFault: 'setup',
    difficulty: 'beginner',
    duration: 5,
    equipment: ['Any club'],
    steps: [
      { number: 1, instruction: 'Grip the club as tight as possible - this is 10', voicePrompt: 'Grip tight, this is level 10' },
      { number: 2, instruction: 'Now let it be almost falling out - this is 1', voicePrompt: 'Very light, level 1' },
      { number: 3, instruction: 'Find a 4 out of 10 - this is ideal', voicePrompt: 'Find level 4 - that\'s your target' },
      { number: 4, instruction: 'Make swings maintaining this pressure', voicePrompt: 'Swing with level 4 pressure' },
    ],
    tips: ['Check pressure at address and impact', 'Light pressure in last three fingers of lead hand'],
    commonMistakes: ['Tightening grip during swing', 'Too loose causing club slippage'],
  },
];

const mockSession: PracticeSession = {
  id: 's1',
  type: 'drill_practice',
  startTime: '2025-07-15T09:00:00',
  drills: [
    { drillId: 'd1', drillName: 'Mirror Backswing Check', completed: true, repsCompleted: 20, targetReps: 20 },
    { drillId: 'd3', drillName: 'Wall Drill for Early Extension', completed: false, repsCompleted: 15, targetReps: 30 },
    { drillId: 'd5', drillName: 'Grip Pressure Scale', completed: false, repsCompleted: 0, targetReps: 10 },
  ],
  swingsRecorded: 5,
  totalDuration: 25,
  focusAreas: ['backswing', 'impact'],
};

const mockComparison: ComparisonResult = {
  baselineDate: '2025-06-01',
  currentDate: '2025-07-15',
  improvements: [
    { metric: 'Club Path', previousValue: 5.2, currentValue: 2.5, change: -2.7, isImprovement: true },
    { metric: 'Weight Transfer', previousValue: 65, currentValue: 78, change: 13, isImprovement: true },
    { metric: 'Tempo', previousValue: 3.8, currentValue: 3.2, change: -0.6, isImprovement: true },
  ],
  regressions: [
    { metric: 'Head Movement', previousValue: 1.2, currentValue: 1.8, change: 0.6, isImprovement: false },
  ],
  overall: 'improved',
  percentageChange: 12,
};

const mockMessages: AICoachMessage[] = [
  { id: 'm1', type: 'ai', content: 'Welcome back! I noticed you\'ve been working hard on your early extension. Ready for today\'s practice session?', timestamp: '2025-07-15T09:00:00' },
  { id: 'm2', type: 'user', content: 'Yes, let\'s focus on driver today', timestamp: '2025-07-15T09:01:00' },
  { id: 'm3', type: 'ai', content: 'Great choice! Based on your recent sessions, I recommend starting with the Wall Drill to reinforce your posture, then we\'ll capture a few swings for analysis.', timestamp: '2025-07-15T09:01:30' },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return COLORS.success;
  if (score >= 60) return COLORS.warning;
  return COLORS.error;
};

const getScoreLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Fair';
  if (score >= 60) return 'Needs Work';
  return 'Focus Here';
};

// ============================================================================
// COMPONENTS - Swing Analysis
// ============================================================================

interface SwingScoreRingProps {
  score: number;
  size?: number;
  label?: string;
}

const SwingScoreRing: React.FC<SwingScoreRingProps> = ({ score, size = 120, label }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={COLORS.lightGray}
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: size * 0.3, fontWeight: 700, color: getScoreColor(score) }}>
          {score}
        </div>
        {label && (
          <div style={{ fontSize: 12, color: COLORS.gray }}>{label}</div>
        )}
      </div>
    </div>
  );
};

// Swing Fault Card Component
interface SwingFaultCardProps {
  fault: SwingFault;
  onViewDrill: (drillId: string) => void;
}

const SwingFaultCard: React.FC<SwingFaultCardProps> = ({ fault, onViewDrill }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      overflow: 'hidden',
      border: `1px solid ${COLORS.mediumGray}`,
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: 16,
          border: 'none',
          backgroundColor: 'transparent',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        {/* Severity Indicator */}
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: SEVERITY_CONFIG[fault.severity].color,
          marginTop: 6,
          flexShrink: 0,
        }} />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{
                fontSize: 12,
                color: FAULT_CATEGORIES[fault.category].color,
                fontWeight: 600,
              }}>
                {FAULT_CATEGORIES[fault.category].icon} {FAULT_CATEGORIES[fault.category].name}
              </span>
            </div>
            <span style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 4,
              backgroundColor: `${SEVERITY_CONFIG[fault.severity].color}20`,
              color: SEVERITY_CONFIG[fault.severity].color,
            }}>
              {SEVERITY_CONFIG[fault.severity].name}
            </span>
          </div>

          <div style={{ fontWeight: 600, marginTop: 4 }}>{fault.title}</div>
          <div style={{ fontSize: 14, color: COLORS.gray, marginTop: 4 }}>
            {fault.description}
          </div>
        </div>

        <span style={{
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>
          ▼
        </span>
      </button>

      {expanded && (
        <div style={{
          padding: 16,
          paddingTop: 0,
          borderTop: `1px solid ${COLORS.lightGray}`,
        }}>
          <div style={{
            padding: 12,
            backgroundColor: `${COLORS.success}15`,
            borderRadius: 8,
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.success, marginBottom: 4 }}>
              💡 Correction
            </div>
            <div style={{ fontSize: 14 }}>{fault.correction}</div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Recommended Drills</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {fault.relatedDrills.map((drillId) => (
              <button
                key={drillId}
                onClick={() => onViewDrill(drillId)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${COLORS.primary}`,
                  backgroundColor: COLORS.white,
                  color: COLORS.primary,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                View Drill →
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Positives List Component
interface PositivesListProps {
  positives: string[];
}

const PositivesList: React.FC<PositivesListProps> = ({ positives }) => {
  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: COLORS.success }}>
        ✓ What You're Doing Well
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {positives.map((positive, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 10,
              backgroundColor: `${COLORS.success}10`,
              borderRadius: 8,
            }}
          >
            <span style={{ color: COLORS.success }}>✓</span>
            <span style={{ fontSize: 14 }}>{positive}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Swing Metrics Grid Component
interface SwingMetricsGridProps {
  metrics: SwingMetrics;
}

const SwingMetricsGrid: React.FC<SwingMetricsGridProps> = ({ metrics }) => {
  const metricLabels: { key: keyof SwingMetrics; label: string; unit: string; ideal: string }[] = [
    { key: 'clubPath', label: 'Club Path', unit: '°', ideal: '0-2°' },
    { key: 'faceAngle', label: 'Face Angle', unit: '°', ideal: '0-1°' },
    { key: 'attackAngle', label: 'Attack Angle', unit: '°', ideal: '-3 to 3°' },
    { key: 'tempo', label: 'Tempo', unit: ':1', ideal: '3:1' },
    { key: 'hipRotation', label: 'Hip Rotation', unit: '°', ideal: '40-50°' },
    { key: 'shoulderRotation', label: 'Shoulder Turn', unit: '°', ideal: '90-100°' },
  ];

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Key Metrics</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {metricLabels.map(({ key, label, unit, ideal }) => (
          <div
            key={key}
            style={{
              padding: 12,
              backgroundColor: COLORS.lightGray,
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 12, color: COLORS.gray }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              {metrics[key]}{unit}
            </div>
            <div style={{ fontSize: 11, color: COLORS.gray }}>Ideal: {ideal}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Analysis Summary Card Component
interface AnalysisSummaryCardProps {
  analysis: SwingAnalysis;
}

const AnalysisSummaryCard: React.FC<AnalysisSummaryCardProps> = ({ analysis }) => {
  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <SwingScoreRing score={analysis.overallScore} size={80} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {getScoreLabel(analysis.overallScore)}
          </div>
          <div style={{ fontSize: 14, color: COLORS.gray }}>
            {SWING_TYPES[analysis.swingType].icon} {SWING_TYPES[analysis.swingType].name} Swing
          </div>
          <div style={{ fontSize: 12, color: COLORS.gray, marginTop: 4 }}>
            {new Date(analysis.timestamp).toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{
        padding: 12,
        backgroundColor: `${COLORS.ai}15`,
        borderRadius: 8,
        borderLeft: `4px solid ${COLORS.ai}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 16 }}>🤖</span>
          <span style={{ fontWeight: 600, color: COLORS.ai }}>AI Coach Summary</span>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{analysis.aiSummary}</div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Drills
// ============================================================================

interface DrillCardProps {
  drill: Drill;
  onStart: (drillId: string) => void;
}

const DrillCard: React.FC<DrillCardProps> = ({ drill, onStart }) => {
  const difficultyColor = {
    beginner: COLORS.success,
    intermediate: COLORS.warning,
    advanced: COLORS.error,
  }[drill.difficulty];

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <span style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 4,
              backgroundColor: FAULT_CATEGORIES[drill.targetFault].color,
              color: COLORS.white,
            }}>
              {FAULT_CATEGORIES[drill.targetFault].name}
            </span>
            <span style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 4,
              backgroundColor: `${difficultyColor}20`,
              color: difficultyColor,
              textTransform: 'capitalize',
            }}>
              {drill.difficulty}
            </span>
          </div>

          <div style={{ fontWeight: 700, fontSize: 16 }}>{drill.name}</div>
          <div style={{ fontSize: 14, color: COLORS.gray, marginTop: 4 }}>
            {drill.description}
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 13, color: COLORS.gray }}>
            <span>⏱️ {formatDuration(drill.duration)}</span>
            {drill.reps && <span>🔁 {drill.reps} reps</span>}
          </div>
        </div>
      </div>

      {/* Equipment */}
      <div style={{
        marginTop: 12,
        paddingTop: 12,
        borderTop: `1px solid ${COLORS.lightGray}`,
      }}>
        <div style={{ fontSize: 12, color: COLORS.gray, marginBottom: 6 }}>Equipment needed:</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {drill.equipment.map((item, index) => (
            <span
              key={index}
              style={{
                padding: '4px 8px',
                backgroundColor: COLORS.lightGray,
                borderRadius: 4,
                fontSize: 12,
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => onStart(drill.id)}
        style={{
          width: '100%',
          marginTop: 16,
          padding: 12,
          borderRadius: 8,
          border: 'none',
          backgroundColor: COLORS.primary,
          color: COLORS.white,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Start Drill
      </button>
    </div>
  );
};

// Drill Player Component
interface DrillPlayerProps {
  drill: Drill;
  onComplete: () => void;
  onExit: () => void;
}

const DrillPlayer: React.FC<DrillPlayerProps> = ({ drill, onComplete, onExit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [repsCompleted, setRepsCompleted] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const step = drill.steps[currentStep];
  const isLastStep = currentStep === drill.steps.length - 1;
  const targetReps = drill.reps || 1;

  const handleNextStep = () => {
    if (isLastStep) {
      if (repsCompleted + 1 >= targetReps) {
        onComplete();
      } else {
        setRepsCompleted(repsCompleted + 1);
        setCurrentStep(0);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: COLORS.darkGray,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: 16,
        paddingTop: 48,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button
          onClick={onExit}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: COLORS.white,
            cursor: 'pointer',
          }}
        >
          ✕ Exit
        </button>
        <div style={{ color: COLORS.white, fontWeight: 600 }}>{drill.name}</div>
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: voiceEnabled ? COLORS.primary : 'rgba(255,255,255,0.2)',
            color: COLORS.white,
            cursor: 'pointer',
          }}
        >
          {voiceEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* Progress */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {drill.steps.map((_, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: index <= currentStep ? COLORS.primary : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 8,
          color: COLORS.white,
          fontSize: 14,
        }}>
          <span>Step {currentStep + 1} of {drill.steps.length}</span>
          {targetReps > 1 && (
            <span>Rep {repsCompleted + 1} of {targetReps}</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
      }}>
        <div style={{
          fontSize: 64,
          marginBottom: 24,
        }}>
          {FAULT_CATEGORIES[drill.targetFault].icon}
        </div>

        <div style={{
          fontSize: 24,
          fontWeight: 700,
          color: COLORS.white,
          textAlign: 'center',
          marginBottom: 16,
        }}>
          {step.instruction}
        </div>

        {step.voicePrompt && voiceEnabled && (
          <div style={{
            padding: 12,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: COLORS.white,
            fontSize: 14,
            marginTop: 16,
          }}>
            🎤 "{step.voicePrompt}"
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div style={{ padding: 16 }}>
        <button
          onClick={handleNextStep}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 12,
            border: 'none',
            backgroundColor: COLORS.primary,
            color: COLORS.white,
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {isLastStep && repsCompleted + 1 >= targetReps ? 'Complete Drill' : 'Next Step →'}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Practice Session
// ============================================================================

interface SessionProgressProps {
  session: PracticeSession;
}

const SessionProgress: React.FC<SessionProgressProps> = ({ session }) => {
  const completedDrills = session.drills.filter(d => d.completed).length;
  const totalDrills = session.drills.length;
  const progress = (completedDrills / totalDrills) * 100;

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Today's Practice</div>
          <div style={{ fontSize: 14, color: COLORS.gray }}>
            {formatDuration(session.totalDuration)} • {session.swingsRecorded} swings recorded
          </div>
        </div>
        <div style={{
          fontSize: 24,
          fontWeight: 700,
          color: COLORS.primary,
        }}>
          {completedDrills}/{totalDrills}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: 8,
        backgroundColor: COLORS.lightGray,
        borderRadius: 4,
        marginBottom: 16,
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: COLORS.primary,
          borderRadius: 4,
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Drills List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {session.drills.map((drill, index) => (
          <div
            key={drill.drillId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              backgroundColor: drill.completed ? `${COLORS.success}15` : COLORS.lightGray,
              borderRadius: 8,
            }}
          >
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: drill.completed ? COLORS.success : COLORS.mediumGray,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.white,
              fontSize: 12,
            }}>
              {drill.completed ? '✓' : index + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{drill.drillName}</div>
              <div style={{ fontSize: 12, color: COLORS.gray }}>
                {drill.repsCompleted}/{drill.targetReps} reps
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Comparison
// ============================================================================

interface ComparisonChartProps {
  comparison: ComparisonResult;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ comparison }) => {
  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Progress Comparison</h3>
        <span style={{
          padding: '4px 12px',
          borderRadius: 12,
          backgroundColor: comparison.overall === 'improved' ? `${COLORS.success}20` : `${COLORS.error}20`,
          color: comparison.overall === 'improved' ? COLORS.success : COLORS.error,
          fontSize: 14,
          fontWeight: 600,
        }}>
          {comparison.overall === 'improved' ? `↑ ${comparison.percentageChange}%` : `↓ ${comparison.percentageChange}%`}
        </span>
      </div>

      <div style={{ fontSize: 13, color: COLORS.gray, marginBottom: 16 }}>
        {new Date(comparison.baselineDate).toLocaleDateString()} → {new Date(comparison.currentDate).toLocaleDateString()}
      </div>

      {/* Improvements */}
      {comparison.improvements.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.success, marginBottom: 8 }}>
            ✓ Improvements
          </div>
          {comparison.improvements.map((change, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 8,
                backgroundColor: `${COLORS.success}10`,
                borderRadius: 6,
                marginBottom: 4,
              }}
            >
              <span>{change.metric}</span>
              <span style={{ fontWeight: 600, color: COLORS.success }}>
                {change.previousValue} → {change.currentValue}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Regressions */}
      {comparison.regressions.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.error, marginBottom: 8 }}>
            ✗ Needs Attention
          </div>
          {comparison.regressions.map((change, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 8,
                backgroundColor: `${COLORS.error}10`,
                borderRadius: 6,
                marginBottom: 4,
              }}
            >
              <span>{change.metric}</span>
              <span style={{ fontWeight: 600, color: COLORS.error }}>
                {change.previousValue} → {change.currentValue}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTS - AI Chat
// ============================================================================

interface AIChatProps {
  messages: AICoachMessage[];
  onSendMessage: (message: string) => void;
  onRecordSwing: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ messages, onSendMessage, onRecordSwing }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: 400,
    }}>
      {/* Header */}
      <div style={{
        padding: 12,
        backgroundColor: COLORS.ai,
        color: COLORS.white,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 20 }}>🤖</span>
        <div>
          <div style={{ fontWeight: 600 }}>AI Swing Coach</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Ask me anything about your swing</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: 12,
              borderRadius: 12,
              backgroundColor: msg.type === 'user' ? COLORS.primary : COLORS.lightGray,
              color: msg.type === 'user' ? COLORS.white : COLORS.darkGray,
              borderBottomRightRadius: msg.type === 'user' ? 4 : 12,
              borderBottomLeftRadius: msg.type === 'ai' ? 4 : 12,
            }}>
              {msg.type === 'ai' && (
                <div style={{ fontSize: 12, color: COLORS.ai, marginBottom: 4 }}>🤖 Coach</div>
              )}
              <div style={{ fontSize: 14 }}>{msg.content}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        padding: 8,
        borderTop: `1px solid ${COLORS.lightGray}`,
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
      }}>
        <button
          onClick={onRecordSwing}
          style={{
            padding: '6px 12px',
            borderRadius: 16,
            border: `1px solid ${COLORS.primary}`,
            backgroundColor: COLORS.white,
            color: COLORS.primary,
            fontSize: 12,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          📹 Record Swing
        </button>
        <button
          onClick={() => onSendMessage('Show me my progress')}
          style={{
            padding: '6px 12px',
            borderRadius: 16,
            border: `1px solid ${COLORS.mediumGray}`,
            backgroundColor: COLORS.white,
            fontSize: 12,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          📈 My Progress
        </button>
        <button
          onClick={() => onSendMessage('Give me a drill to practice')}
          style={{
            padding: '6px 12px',
            borderRadius: 16,
            border: `1px solid ${COLORS.mediumGray}`,
            backgroundColor: COLORS.white,
            fontSize: 12,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          🎯 Get Drill
        </button>
      </div>

      {/* Input */}
      <div style={{
        padding: 12,
        borderTop: `1px solid ${COLORS.lightGray}`,
        display: 'flex',
        gap: 8,
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your swing..."
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: `1px solid ${COLORS.mediumGray}`,
            fontSize: 14,
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: COLORS.ai,
            color: COLORS.white,
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Video Recording
// ============================================================================

interface SwingRecorderProps {
  onCapture: (videoData: any) => void;
  onClose: () => void;
}

const SwingRecorder: React.FC<SwingRecorderProps> = ({ onCapture, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedSwingType, setSelectedSwingType] = useState<SwingType>('driver');

  const startRecording = () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          setIsRecording(true);
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 5) {
            setIsRecording(false);
            onCapture({ swingType: selectedSwingType, duration: prev });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: COLORS.darkGray,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: 16,
        paddingTop: 48,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button
          onClick={onClose}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: COLORS.white,
            cursor: 'pointer',
          }}
        >
          ✕ Cancel
        </button>
        <div style={{ color: COLORS.white, fontWeight: 600 }}>Record Swing</div>
        <div style={{ width: 80 }} />
      </div>

      {/* Camera View */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          width: '90%',
          aspectRatio: '9/16',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {countdown !== null ? (
            <div style={{
              fontSize: 96,
              fontWeight: 700,
              color: COLORS.white,
            }}>
              {countdown}
            </div>
          ) : isRecording ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: COLORS.error,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                animation: 'pulse 1s infinite',
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  backgroundColor: COLORS.white,
                }} />
              </div>
              <div style={{
                marginTop: 16,
                color: COLORS.white,
                fontSize: 24,
                fontWeight: 700,
              }}>
                {recordingTime}s / 5s
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: COLORS.white }}>
              <span style={{ fontSize: 64 }}>📹</span>
              <div style={{ marginTop: 16, fontSize: 16 }}>Position camera to capture full swing</div>
            </div>
          )}
        </div>
      </div>

      {/* Swing Type Selector */}
      {!isRecording && countdown === null && (
        <div style={{ padding: 16 }}>
          <div style={{ color: COLORS.white, fontSize: 14, marginBottom: 8, textAlign: 'center' }}>
            Select swing type:
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {(Object.keys(SWING_TYPES) as SwingType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedSwingType(type)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: 'none',
                  backgroundColor: selectedSwingType === type ? COLORS.primary : 'rgba(255,255,255,0.2)',
                  color: COLORS.white,
                  cursor: 'pointer',
                }}
              >
                {SWING_TYPES[type].icon} {SWING_TYPES[type].name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Record Button */}
      {!isRecording && countdown === null && (
        <div style={{ padding: 16, paddingBottom: 32 }}>
          <button
            onClick={startRecording}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 12,
              border: 'none',
              backgroundColor: COLORS.primary,
              color: COLORS.white,
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🎬 Start Recording
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN HUB COMPONENT
// ============================================================================

type CoachTab = 'analysis' | 'drills' | 'session' | 'chat';

const AICoachHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CoachTab>('analysis');
  const [showRecorder, setShowRecorder] = useState(false);
  const [showDrillPlayer, setShowDrillPlayer] = useState<Drill | null>(null);
  const [messages, setMessages] = useState<AICoachMessage[]>(mockMessages);

  const tabs: { id: CoachTab; label: string; icon: string }[] = [
    { id: 'analysis', label: 'Analysis', icon: '📊' },
    { id: 'drills', label: 'Drills', icon: '🎯' },
    { id: 'session', label: 'Session', icon: '📋' },
    { id: 'chat', label: 'AI Chat', icon: '🤖' },
  ];

  const handleSendMessage = (content: string) => {
    const newMessage: AICoachMessage = {
      id: `m${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages([...messages, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: AICoachMessage = {
        id: `m${Date.now() + 1}`,
        type: 'ai',
        content: `I understand you're asking about "${content}". Based on your recent swings, I recommend focusing on maintaining your spine angle through impact. Would you like me to suggest some specific drills?`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  if (showDrillPlayer) {
    return (
      <DrillPlayer
        drill={showDrillPlayer}
        onComplete={() => setShowDrillPlayer(null)}
        onExit={() => setShowDrillPlayer(null)}
      />
    );
  }

  if (showRecorder) {
    return (
      <SwingRecorder
        onCapture={(data) => {
          console.log('Captured:', data);
          setShowRecorder(false);
        }}
        onClose={() => setShowRecorder(false)}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.lightGray,
      paddingBottom: 80,
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: COLORS.ai,
        padding: 20,
        paddingTop: 48,
        color: COLORS.white,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32 }}>🤖</span>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>AI Swing Coach</div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>Your personal golf instructor</div>
          </div>
        </div>

        <button
          onClick={() => setShowRecorder(true)}
          style={{
            width: '100%',
            marginTop: 16,
            padding: 14,
            borderRadius: 12,
            border: '2px solid rgba(255,255,255,0.3)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: COLORS.white,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          📹 Record New Swing
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        backgroundColor: COLORS.white,
        borderBottom: `1px solid ${COLORS.lightGray}`,
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: 12,
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === tab.id ? `2px solid ${COLORS.ai}` : '2px solid transparent',
              color: activeTab === tab.id ? COLORS.ai : COLORS.gray,
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>{tab.icon}</span>
            <span style={{ fontSize: 12 }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        {activeTab === 'analysis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnalysisSummaryCard analysis={mockAnalysis} />

            <div style={{ fontSize: 16, fontWeight: 700 }}>Areas to Improve</div>
            {mockAnalysis.faults.map((fault) => (
              <SwingFaultCard
                key={fault.id}
                fault={fault}
                onViewDrill={(id) => {
                  const drill = mockDrills.find(d => d.id === id);
                  if (drill) setShowDrillPlayer(drill);
                }}
              />
            ))}

            <PositivesList positives={mockAnalysis.positives} />
            <SwingMetricsGrid metrics={mockAnalysis.keyMetrics} />
            <ComparisonChart comparison={mockComparison} />
          </div>
        )}

        {activeTab === 'drills' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              padding: 12,
              backgroundColor: `${COLORS.ai}15`,
              borderRadius: 8,
              fontSize: 14,
            }}>
              🎯 These drills are personalized based on your recent swing analysis
            </div>

            {mockDrills.map((drill) => (
              <DrillCard
                key={drill.id}
                drill={drill}
                onStart={() => setShowDrillPlayer(drill)}
              />
            ))}
          </div>
        )}

        {activeTab === 'session' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SessionProgress session={mockSession} />

            <button
              onClick={() => setShowRecorder(true)}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 8,
                border: `2px dashed ${COLORS.primary}`,
                backgroundColor: COLORS.white,
                color: COLORS.primary,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📹 Record Practice Swing
            </button>
          </div>
        )}

        {activeTab === 'chat' && (
          <AIChat
            messages={messages}
            onSendMessage={handleSendMessage}
            onRecordSwing={() => setShowRecorder(true)}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

const AICoachExample: React.FC = () => {
  return <AICoachHub />;
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Types
  type SwingAnalysis,
  type SwingFault,
  type SwingMetrics,
  type Drill,
  type DrillStep,
  type PracticeSession,
  type ComparisonResult,
  type AICoachMessage,
  type SwingType,
  type FaultCategory,
  type SeverityLevel,

  // Analysis Components
  SwingScoreRing,
  SwingFaultCard,
  PositivesList,
  SwingMetricsGrid,
  AnalysisSummaryCard,

  // Drill Components
  DrillCard,
  DrillPlayer,

  // Session Components
  SessionProgress,

  // Comparison Components
  ComparisonChart,

  // Chat Components
  AIChat,

  // Recording Components
  SwingRecorder,

  // Main Hub
  AICoachHub,

  // Example
  AICoachExample,
};

export default AICoachHub;

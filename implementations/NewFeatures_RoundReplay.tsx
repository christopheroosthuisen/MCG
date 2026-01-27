/**
 * NewFeatures_RoundReplay.tsx
 * Round Replay & Analysis System for MCG Golf App
 *
 * Inspired by: Shot Scope, Arccos, Golf Pad
 *
 * Features:
 * - Shot-by-Shot Replay navigation
 * - Pattern Recognition & Heatmaps
 * - Scoring Breakdown analysis
 * - Round Comparison tools
 */

import React, { useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type ShotResult = 'FAIRWAY' | 'ROUGH' | 'BUNKER' | 'GREEN' | 'WATER' | 'OB' | 'FRINGE';
type ShotShape = 'STRAIGHT' | 'FADE' | 'DRAW' | 'SLICE' | 'HOOK' | 'PUSH' | 'PULL';
type MissDirection = 'LEFT' | 'RIGHT' | 'SHORT' | 'LONG' | 'ON_TARGET';

interface GeoLocation {
  lat: number;
  lng: number;
  elevation?: number;
}

interface Shot {
  id: string;
  holeNumber: number;
  shotNumber: number;
  club: string;
  startLocation: GeoLocation;
  endLocation: GeoLocation;
  distance: number;
  result: ShotResult;
  shape?: ShotShape;
  missDirection?: MissDirection;
  isPenalty?: boolean;
  notes?: string;
}

interface HoleScore {
  holeNumber: number;
  par: number;
  score: number;
  shots: Shot[];
  putts: number;
  fairwayHit?: boolean;
  greenInRegulation: boolean;
  upAndDown?: boolean;
  sandSave?: boolean;
}

interface RoundData {
  id: string;
  courseId: string;
  courseName: string;
  date: Date;
  tees: string;
  courseRating: number;
  slopeRating: number;
  totalScore: number;
  frontNine: number;
  backNine: number;
  holes: HoleScore[];
  stats: RoundStats;
  conditions?: PlayingConditions;
}

interface RoundStats {
  fairwaysHit: number;
  fairwaysTotal: number;
  greensInRegulation: number;
  greensTotal: number;
  totalPutts: number;
  penalties: number;
  upAndDowns: number;
  upAndDownAttempts: number;
  sandSaves: number;
  sandSaveAttempts: number;
  birdiesOrBetter: number;
  pars: number;
  bogeys: number;
  doubleBogeyOrWorse: number;
  longestDrive: number;
  avgDriveDistance: number;
}

interface PlayingConditions {
  weather: 'SUNNY' | 'CLOUDY' | 'RAINY' | 'WINDY';
  temperature: number;
  windSpeed: number;
  windDirection: string;
}

interface PatternData {
  club: string;
  missCount: { left: number; right: number; short: number; long: number };
  hitRate: number;
  avgDistance: number;
  totalShots: number;
}

interface TrendAlert {
  id: string;
  type: 'WARNING' | 'INFO' | 'POSITIVE';
  category: string;
  message: string;
  rounds: number;
  stat: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
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
  birdie: '#22C55E',
  par: '#3B82F6',
  bogey: '#F59E0B',
  double: '#EF4444',
};

const SHOT_RESULT_COLORS: Record<ShotResult, string> = {
  FAIRWAY: COLORS.success,
  ROUGH: COLORS.warning,
  BUNKER: '#D4A574',
  GREEN: COLORS.success,
  WATER: COLORS.info,
  OB: COLORS.error,
  FRINGE: '#84CC16',
};

// ============================================================================
// MOCK DATA
// ============================================================================

const generateMockShots = (holeNumber: number, par: number, score: number): Shot[] => {
  const shots: Shot[] = [];
  const putts = Math.min(score, Math.floor(Math.random() * 2) + 1);
  const fullSwings = score - putts;

  for (let i = 1; i <= fullSwings; i++) {
    shots.push({
      id: `shot-${holeNumber}-${i}`,
      holeNumber,
      shotNumber: i,
      club: i === 1 ? (par >= 4 ? 'Driver' : '7 Iron') : ['7 Iron', '8 Iron', 'PW', 'SW'][Math.floor(Math.random() * 4)],
      startLocation: { lat: 33.45 + Math.random() * 0.01, lng: -111.94 + Math.random() * 0.01 },
      endLocation: { lat: 33.45 + Math.random() * 0.01, lng: -111.94 + Math.random() * 0.01 },
      distance: i === 1 ? 240 + Math.floor(Math.random() * 40) : 80 + Math.floor(Math.random() * 80),
      result: ['FAIRWAY', 'ROUGH', 'GREEN', 'BUNKER'][Math.floor(Math.random() * 4)] as ShotResult,
      shape: ['STRAIGHT', 'FADE', 'DRAW'][Math.floor(Math.random() * 3)] as ShotShape,
      missDirection: ['ON_TARGET', 'LEFT', 'RIGHT'][Math.floor(Math.random() * 3)] as MissDirection,
    });
  }

  for (let i = 1; i <= putts; i++) {
    shots.push({
      id: `putt-${holeNumber}-${i}`,
      holeNumber,
      shotNumber: fullSwings + i,
      club: 'Putter',
      startLocation: { lat: 33.45, lng: -111.94 },
      endLocation: { lat: 33.45, lng: -111.94 },
      distance: i === 1 ? 15 + Math.floor(Math.random() * 20) : 2 + Math.floor(Math.random() * 3),
      result: 'GREEN',
    });
  }

  return shots;
};

const generateMockHoles = (): HoleScore[] => {
  const pars = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 5, 4, 4, 3, 4, 5, 4];
  return pars.map((par, index) => {
    const variance = Math.floor(Math.random() * 3) - 1;
    const score = par + variance + (Math.random() > 0.8 ? 1 : 0);
    const shots = generateMockShots(index + 1, par, score);
    const putts = shots.filter(s => s.club === 'Putter').length;

    return {
      holeNumber: index + 1,
      par,
      score,
      shots,
      putts,
      fairwayHit: par >= 4 ? Math.random() > 0.4 : undefined,
      greenInRegulation: score - putts <= par - 2,
      upAndDown: !shots.some(s => s.result === 'GREEN' && s.shotNumber < score - putts) && putts <= 2,
    };
  });
};

const MOCK_ROUND: RoundData = {
  id: 'round-1',
  courseId: 'course-1',
  courseName: 'TPC Scottsdale',
  date: new Date('2024-03-20'),
  tees: 'Blue',
  courseRating: 72.1,
  slopeRating: 131,
  totalScore: 82,
  frontNine: 40,
  backNine: 42,
  holes: generateMockHoles(),
  stats: {
    fairwaysHit: 8,
    fairwaysTotal: 14,
    greensInRegulation: 9,
    greensTotal: 18,
    totalPutts: 32,
    penalties: 1,
    upAndDowns: 4,
    upAndDownAttempts: 7,
    sandSaves: 1,
    sandSaveAttempts: 2,
    birdiesOrBetter: 2,
    pars: 8,
    bogeys: 6,
    doubleBogeyOrWorse: 2,
    longestDrive: 285,
    avgDriveDistance: 248,
  },
  conditions: {
    weather: 'SUNNY',
    temperature: 78,
    windSpeed: 12,
    windDirection: 'SW',
  },
};

const MOCK_COMPARISON_ROUND: RoundData = {
  ...MOCK_ROUND,
  id: 'round-2',
  date: new Date('2024-02-15'),
  totalScore: 86,
  frontNine: 43,
  backNine: 43,
  holes: generateMockHoles(),
  stats: {
    ...MOCK_ROUND.stats,
    fairwaysHit: 6,
    greensInRegulation: 7,
    totalPutts: 34,
    birdiesOrBetter: 1,
    bogeys: 8,
    doubleBogeyOrWorse: 3,
  },
};

const MOCK_PATTERN_DATA: PatternData[] = [
  { club: 'Driver', missCount: { left: 8, right: 12, short: 2, long: 3 }, hitRate: 58, avgDistance: 248, totalShots: 42 },
  { club: '3 Wood', missCount: { left: 4, right: 6, short: 3, long: 1 }, hitRate: 52, avgDistance: 218, totalShots: 28 },
  { club: '5 Iron', missCount: { left: 6, right: 4, short: 5, long: 2 }, hitRate: 48, avgDistance: 178, totalShots: 35 },
  { club: '7 Iron', missCount: { left: 3, right: 5, short: 4, long: 3 }, hitRate: 62, avgDistance: 158, totalShots: 52 },
  { club: 'PW', missCount: { left: 2, right: 3, short: 6, long: 4 }, hitRate: 68, avgDistance: 122, totalShots: 45 },
];

const MOCK_TREND_ALERTS: TrendAlert[] = [
  {
    id: 'alert-1',
    type: 'WARNING',
    category: 'Putting',
    message: 'Your 3-putt rate has increased by 15% over the last 5 rounds',
    rounds: 5,
    stat: '3-Putt Rate',
    trend: 'UP',
  },
  {
    id: 'alert-2',
    type: 'POSITIVE',
    category: 'Driving',
    message: 'Fairway accuracy has improved from 45% to 58%',
    rounds: 10,
    stat: 'FIR %',
    trend: 'UP',
  },
  {
    id: 'alert-3',
    type: 'INFO',
    category: 'Approach',
    message: 'Your GIR from 125-150 yards is below average',
    rounds: 8,
    stat: 'GIR 125-150y',
    trend: 'STABLE',
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getScoreColor = (score: number, par: number): string => {
  const diff = score - par;
  if (diff <= -1) return COLORS.birdie;
  if (diff === 0) return COLORS.par;
  if (diff === 1) return COLORS.bogey;
  return COLORS.double;
};

const getScoreLabel = (score: number, par: number): string => {
  const diff = score - par;
  if (diff <= -2) return 'Eagle';
  if (diff === -1) return 'Birdie';
  if (diff === 0) return 'Par';
  if (diff === 1) return 'Bogey';
  if (diff === 2) return 'Double';
  return `+${diff}`;
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * ShotCard - Individual shot details
 */
interface ShotCardProps {
  shot: Shot;
  isSelected?: boolean;
  onSelect?: () => void;
}

const ShotCard: React.FC<ShotCardProps> = ({ shot, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: 12,
        backgroundColor: isSelected ? `${COLORS.primary}10` : COLORS.white,
        borderRadius: 10,
        border: isSelected ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.gray[200]}`,
        cursor: onSelect ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        backgroundColor: COLORS.gray[100],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        color: COLORS.gray[600],
      }}>
        {shot.shotNumber}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{shot.club}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.primary }}>
            {shot.distance}y
          </span>
        </div>
        <div style={{
          display: 'flex',
          gap: 8,
          marginTop: 4,
        }}>
          <span style={{
            fontSize: 11,
            padding: '2px 8px',
            backgroundColor: `${SHOT_RESULT_COLORS[shot.result]}20`,
            color: SHOT_RESULT_COLORS[shot.result],
            borderRadius: 4,
            fontWeight: 500,
          }}>
            {shot.result}
          </span>
          {shot.shape && (
            <span style={{
              fontSize: 11,
              color: COLORS.gray[500],
            }}>
              {shot.shape}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * HoleReplayView - Hole-by-hole breakdown
 */
interface HoleReplayViewProps {
  hole: HoleScore;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const HoleReplayView: React.FC<HoleReplayViewProps> = ({ hole, isExpanded, onToggle }) => {
  const scoreColor = getScoreColor(hole.score, hole.par);

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          padding: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: onToggle ? 'pointer' : 'default',
          backgroundColor: `${scoreColor}10`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: scoreColor,
            color: COLORS.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
          }}>
            {hole.holeNumber}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              Par {hole.par}
            </div>
            <div style={{ fontSize: 12, color: COLORS.gray[500] }}>
              {hole.shots.length} shots
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: scoreColor,
          }}>
            {hole.score}
          </div>
          <div style={{
            fontSize: 11,
            color: scoreColor,
            fontWeight: 500,
          }}>
            {getScoreLabel(hole.score, hole.par)}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        padding: '8px 16px',
        backgroundColor: COLORS.gray[50],
        display: 'flex',
        gap: 16,
      }}>
        {hole.fairwayHit !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: hole.fairwayHit ? COLORS.success : COLORS.error,
            }} />
            <span style={{ fontSize: 11, color: COLORS.gray[600] }}>FIR</span>
          </div>
        )}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: hole.greenInRegulation ? COLORS.success : COLORS.error,
          }} />
          <span style={{ fontSize: 11, color: COLORS.gray[600] }}>GIR</span>
        </div>
        <div style={{
          fontSize: 11,
          color: COLORS.gray[600],
        }}>
          {hole.putts} putts
        </div>
      </div>

      {/* Expanded Shots */}
      {isExpanded && (
        <div style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {hole.shots.map(shot => (
            <ShotCard key={shot.id} shot={shot} />
          ))}
        </div>
      )}

      {/* Expand indicator */}
      {onToggle && (
        <div style={{
          padding: 8,
          textAlign: 'center',
          borderTop: `1px solid ${COLORS.gray[200]}`,
        }}>
          <span style={{ fontSize: 12, color: COLORS.gray[400] }}>
            {isExpanded ? '▲ Collapse' : '▼ Show shots'}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * RoundReplayPlayer - Navigate through round
 */
interface RoundReplayPlayerProps {
  round: RoundData;
}

const RoundReplayPlayer: React.FC<RoundReplayPlayerProps> = ({ round }) => {
  const [currentHole, setCurrentHole] = useState(1);
  const [expandedHole, setExpandedHole] = useState<number | null>(null);

  const hole = round.holes[currentHole - 1];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      {/* Round Header */}
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
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{round.courseName}</h2>
            <div style={{ fontSize: 13, color: COLORS.gray[500] }}>
              {formatDate(round.date)} • {round.tees} Tees
            </div>
          </div>
          <div style={{
            fontSize: 32,
            fontWeight: 700,
            color: COLORS.primary,
          }}>
            {round.totalScore}
          </div>
        </div>

        {/* Score summary */}
        <div style={{
          display: 'flex',
          gap: 16,
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px solid ${COLORS.gray[200]}`,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{round.frontNine}</div>
            <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Front</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{round.backNine}</div>
            <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Back</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{round.stats.totalPutts}</div>
            <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Putts</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {round.stats.fairwaysHit}/{round.stats.fairwaysTotal}
            </div>
            <div style={{ fontSize: 11, color: COLORS.gray[500] }}>FIR</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {round.stats.greensInRegulation}/{round.stats.greensTotal}
            </div>
            <div style={{ fontSize: 11, color: COLORS.gray[500] }}>GIR</div>
          </div>
        </div>
      </div>

      {/* Hole Navigator */}
      <div style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        padding: '4px 0',
      }}>
        {round.holes.map((h) => (
          <button
            key={h.holeNumber}
            onClick={() => setCurrentHole(h.holeNumber)}
            style={{
              minWidth: 36,
              height: 36,
              borderRadius: '50%',
              border: currentHole === h.holeNumber
                ? `2px solid ${COLORS.primary}`
                : 'none',
              backgroundColor: currentHole === h.holeNumber
                ? COLORS.white
                : getScoreColor(h.score, h.par),
              color: currentHole === h.holeNumber
                ? COLORS.primary
                : COLORS.white,
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {h.holeNumber}
          </button>
        ))}
      </div>

      {/* Current Hole View */}
      <HoleReplayView
        hole={hole}
        isExpanded={expandedHole === hole.holeNumber}
        onToggle={() => setExpandedHole(
          expandedHole === hole.holeNumber ? null : hole.holeNumber
        )}
      />

      {/* Navigation Controls */}
      <div style={{
        display: 'flex',
        gap: 12,
      }}>
        <button
          onClick={() => setCurrentHole(Math.max(1, currentHole - 1))}
          disabled={currentHole === 1}
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 10,
            border: `1px solid ${COLORS.gray[300]}`,
            backgroundColor: COLORS.white,
            fontSize: 14,
            fontWeight: 600,
            cursor: currentHole === 1 ? 'not-allowed' : 'pointer',
            opacity: currentHole === 1 ? 0.5 : 1,
          }}
        >
          ← Previous Hole
        </button>
        <button
          onClick={() => setCurrentHole(Math.min(18, currentHole + 1))}
          disabled={currentHole === 18}
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 10,
            border: 'none',
            backgroundColor: currentHole === 18 ? COLORS.gray[300] : COLORS.primary,
            color: COLORS.white,
            fontSize: 14,
            fontWeight: 600,
            cursor: currentHole === 18 ? 'not-allowed' : 'pointer',
          }}
        >
          Next Hole →
        </button>
      </div>
    </div>
  );
};

/**
 * MissPatternHeatmap - Visual miss tendencies
 */
interface MissPatternHeatmapProps {
  data: PatternData;
}

const MissPatternHeatmap: React.FC<MissPatternHeatmapProps> = ({ data }) => {
  const total = data.missCount.left + data.missCount.right + data.missCount.short + data.missCount.long;
  const getOpacity = (count: number) => Math.min(1, count / total * 3);

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
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{data.club}</h3>
        <span style={{ fontSize: 12, color: COLORS.gray[500] }}>
          {data.totalShots} shots
        </span>
      </div>

      {/* Heatmap Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: 4,
        aspectRatio: '1/1',
        maxWidth: 200,
        margin: '0 auto',
      }}>
        {/* Top row */}
        <div />
        <div style={{
          backgroundColor: `rgba(239, 68, 68, ${getOpacity(data.missCount.long)})`,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: data.missCount.long > 0 ? COLORS.white : COLORS.gray[300],
        }}>
          {data.missCount.long}
        </div>
        <div />

        {/* Middle row */}
        <div style={{
          backgroundColor: `rgba(59, 130, 246, ${getOpacity(data.missCount.left)})`,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: data.missCount.left > 0 ? COLORS.white : COLORS.gray[300],
        }}>
          {data.missCount.left}
        </div>
        <div style={{
          backgroundColor: COLORS.success,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: COLORS.white,
        }}>
          🎯
        </div>
        <div style={{
          backgroundColor: `rgba(245, 158, 11, ${getOpacity(data.missCount.right)})`,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: data.missCount.right > 0 ? COLORS.white : COLORS.gray[300],
        }}>
          {data.missCount.right}
        </div>

        {/* Bottom row */}
        <div />
        <div style={{
          backgroundColor: `rgba(168, 85, 247, ${getOpacity(data.missCount.short)})`,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: data.missCount.short > 0 ? COLORS.white : COLORS.gray[300],
        }}>
          {data.missCount.short}
        </div>
        <div />
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 12,
        marginTop: 16,
      }}>
        <span style={{ fontSize: 10, color: COLORS.info }}>● Left</span>
        <span style={{ fontSize: 10, color: COLORS.warning }}>● Right</span>
        <span style={{ fontSize: 10, color: COLORS.error }}>● Long</span>
        <span style={{ fontSize: 10, color: '#A855F7' }}>● Short</span>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: 16,
        paddingTop: 12,
        borderTop: `1px solid ${COLORS.gray[200]}`,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>
            {data.hitRate}%
          </div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Hit Rate</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {data.avgDistance}y
          </div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Avg Dist</div>
        </div>
      </div>
    </div>
  );
};

/**
 * ScoringDistribution - Birdie/par/bogey chart
 */
interface ScoringDistributionProps {
  stats: RoundStats;
}

const ScoringDistribution: React.FC<ScoringDistributionProps> = ({ stats }) => {
  const total = stats.birdiesOrBetter + stats.pars + stats.bogeys + stats.doubleBogeyOrWorse;

  const distribution = [
    { label: 'Birdies+', count: stats.birdiesOrBetter, color: COLORS.birdie, icon: '🐦' },
    { label: 'Pars', count: stats.pars, color: COLORS.par, icon: '⭐' },
    { label: 'Bogeys', count: stats.bogeys, color: COLORS.bogey, icon: '📉' },
    { label: 'Double+', count: stats.doubleBogeyOrWorse, color: COLORS.double, icon: '😬' },
  ];

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Scoring Distribution</h3>

      {/* Bar Chart */}
      <div style={{
        display: 'flex',
        height: 120,
        gap: 8,
        alignItems: 'flex-end',
        marginBottom: 16,
      }}>
        {distribution.map((item) => (
          <div
            key={item.label}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>
              {item.count}
            </span>
            <div style={{
              width: '100%',
              height: `${(item.count / Math.max(...distribution.map(d => d.count))) * 80}px`,
              backgroundColor: item.color,
              borderRadius: '4px 4px 0 0',
              minHeight: item.count > 0 ? 20 : 0,
              transition: 'height 0.3s',
            }} />
            <span style={{ fontSize: 11, color: COLORS.gray[500] }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Percentages */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
      }}>
        {distribution.map((item) => (
          <div
            key={item.label}
            style={{
              padding: 8,
              backgroundColor: `${item.color}10`,
              borderRadius: 8,
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: item.color }}>
              {Math.round((item.count / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * StrokeLossAnalysis - Where strokes are lost
 */
interface StrokeLossAnalysisProps {
  round: RoundData;
}

const StrokeLossAnalysis: React.FC<StrokeLossAnalysisProps> = ({ round }) => {
  // Calculate strokes lost by category (simplified)
  const par = 72; // Assume standard par
  const strokesOver = round.totalScore - par;

  const analysis = [
    {
      category: 'Driving',
      strokes: round.stats.fairwaysHit < 8 ? 2 : 0,
      description: 'Missed fairways led to harder approach shots',
    },
    {
      category: 'Approach',
      strokes: round.stats.greensInRegulation < 10 ? 3 : 1,
      description: 'GIR below target',
    },
    {
      category: 'Short Game',
      strokes: round.stats.upAndDowns < round.stats.upAndDownAttempts * 0.5 ? 2 : 0,
      description: 'Up and down conversion',
    },
    {
      category: 'Putting',
      strokes: round.stats.totalPutts > 32 ? 2 : 0,
      description: 'Above average putts',
    },
    {
      category: 'Penalties',
      strokes: round.stats.penalties,
      description: 'Penalty strokes',
    },
  ].filter(a => a.strokes > 0);

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
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Strokes Lost</h3>
        <span style={{
          fontSize: 14,
          fontWeight: 700,
          color: strokesOver > 0 ? COLORS.error : COLORS.success,
        }}>
          {strokesOver > 0 ? '+' : ''}{strokesOver} vs Par
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {analysis.map((item) => (
          <div
            key={item.category}
            style={{
              padding: 12,
              backgroundColor: COLORS.gray[50],
              borderRadius: 8,
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{item.category}</span>
              <span style={{
                fontSize: 14,
                fontWeight: 700,
                color: COLORS.error,
              }}>
                +{item.strokes}
              </span>
            </div>
            <span style={{ fontSize: 12, color: COLORS.gray[500] }}>
              {item.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * TrendAlertCard - Alert on patterns
 */
interface TrendAlertCardProps {
  alert: TrendAlert;
}

const TrendAlertCard: React.FC<TrendAlertCardProps> = ({ alert }) => {
  const typeConfig = {
    WARNING: { color: COLORS.warning, icon: '⚠️' },
    INFO: { color: COLORS.info, icon: 'ℹ️' },
    POSITIVE: { color: COLORS.success, icon: '✅' },
  };

  const config = typeConfig[alert.type];

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${config.color}`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <span style={{ fontSize: 20 }}>{config.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: config.color,
              textTransform: 'uppercase',
            }}>
              {alert.category}
            </span>
            <span style={{ fontSize: 11, color: COLORS.gray[400] }}>
              Last {alert.rounds} rounds
            </span>
          </div>
          <p style={{
            fontSize: 14,
            color: COLORS.gray[700],
            marginTop: 4,
          }}>
            {alert.message}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 8,
          }}>
            <span style={{
              fontSize: 12,
              color: COLORS.gray[500],
            }}>
              {alert.stat}
            </span>
            <span style={{
              fontSize: 12,
              color: alert.trend === 'UP'
                ? (alert.type === 'POSITIVE' ? COLORS.success : COLORS.error)
                : alert.trend === 'DOWN'
                  ? (alert.type === 'POSITIVE' ? COLORS.error : COLORS.success)
                  : COLORS.gray[400],
            }}>
              {alert.trend === 'UP' ? '↑' : alert.trend === 'DOWN' ? '↓' : '→'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * RoundComparisonView - Side-by-side rounds
 */
interface RoundComparisonViewProps {
  round1: RoundData;
  round2: RoundData;
}

const RoundComparisonView: React.FC<RoundComparisonViewProps> = ({ round1, round2 }) => {
  const comparisons = [
    { label: 'Total Score', val1: round1.totalScore, val2: round2.totalScore, lower: true },
    { label: 'Front 9', val1: round1.frontNine, val2: round2.frontNine, lower: true },
    { label: 'Back 9', val1: round1.backNine, val2: round2.backNine, lower: true },
    { label: 'Total Putts', val1: round1.stats.totalPutts, val2: round2.stats.totalPutts, lower: true },
    { label: 'FIR', val1: round1.stats.fairwaysHit, val2: round2.stats.fairwaysHit, lower: false },
    { label: 'GIR', val1: round1.stats.greensInRegulation, val2: round2.stats.greensInRegulation, lower: false },
    { label: 'Birdies', val1: round1.stats.birdiesOrBetter, val2: round2.stats.birdiesOrBetter, lower: false },
    { label: 'Double+', val1: round1.stats.doubleBogeyOrWorse, val2: round2.stats.doubleBogeyOrWorse, lower: true },
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
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        backgroundColor: COLORS.gray[100],
      }}>
        <div style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: COLORS.gray[500] }}>{formatDate(round1.date)}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary }}>{round1.totalScore}</div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          fontWeight: 600,
          color: COLORS.gray[400],
        }}>
          vs
        </div>
        <div style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: COLORS.gray[500] }}>{formatDate(round2.date)}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.secondary }}>{round2.totalScore}</div>
        </div>
      </div>

      {/* Comparison Rows */}
      <div>
        {comparisons.map((comp, index) => {
          const winner = comp.lower
            ? (comp.val1 < comp.val2 ? 1 : comp.val1 > comp.val2 ? 2 : 0)
            : (comp.val1 > comp.val2 ? 1 : comp.val1 < comp.val2 ? 2 : 0);

          return (
            <div
              key={comp.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                padding: 12,
                borderBottom: index < comparisons.length - 1 ? `1px solid ${COLORS.gray[200]}` : 'none',
              }}
            >
              <div style={{
                textAlign: 'center',
                fontWeight: winner === 1 ? 700 : 400,
                color: winner === 1 ? COLORS.success : COLORS.gray[700],
              }}>
                {comp.val1}
              </div>
              <div style={{
                fontSize: 12,
                color: COLORS.gray[500],
                textAlign: 'center',
              }}>
                {comp.label}
              </div>
              <div style={{
                textAlign: 'center',
                fontWeight: winner === 2 ? 700 : 400,
                color: winner === 2 ? COLORS.success : COLORS.gray[700],
              }}>
                {comp.val2}
              </div>
            </div>
          );
        })}
      </div>

      {/* Improvement Summary */}
      <div style={{
        padding: 16,
        backgroundColor: `${COLORS.success}10`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}>
          <span style={{ fontSize: 16 }}>📈</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Improvement Highlights</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {round1.totalScore < round2.totalScore && (
            <span style={{ fontSize: 13, color: COLORS.gray[600] }}>
              • Score improved by {round2.totalScore - round1.totalScore} strokes
            </span>
          )}
          {round1.stats.greensInRegulation > round2.stats.greensInRegulation && (
            <span style={{ fontSize: 13, color: COLORS.gray[600] }}>
              • Hit {round1.stats.greensInRegulation - round2.stats.greensInRegulation} more greens
            </span>
          )}
          {round1.stats.totalPutts < round2.stats.totalPutts && (
            <span style={{ fontSize: 13, color: COLORS.gray[600] }}>
              • {round2.stats.totalPutts - round1.stats.totalPutts} fewer putts
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * ConsistencyMeter - Round-to-round variance
 */
interface ConsistencyMeterProps {
  scores: number[];
}

const ConsistencyMeter: React.FC<ConsistencyMeterProps> = ({ scores }) => {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = Math.sqrt(
    scores.reduce((acc, score) => acc + Math.pow(score - avg, 2), 0) / scores.length
  );

  const consistencyRating = variance < 3 ? 'Excellent' : variance < 5 ? 'Good' : variance < 8 ? 'Average' : 'Needs Work';
  const consistencyColor = variance < 3 ? COLORS.success : variance < 5 ? COLORS.info : variance < 8 ? COLORS.warning : COLORS.error;

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Consistency</h3>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
      }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: `${consistencyColor}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 20,
            fontWeight: 700,
            color: consistencyColor,
          }}>
            {variance.toFixed(1)}
          </span>
        </div>
        <div>
          <div style={{
            fontSize: 16,
            fontWeight: 600,
            color: consistencyColor,
          }}>
            {consistencyRating}
          </div>
          <div style={{ fontSize: 12, color: COLORS.gray[500] }}>
            Standard Deviation
          </div>
        </div>
      </div>

      {/* Score Range */}
      <div style={{
        padding: 12,
        backgroundColor: COLORS.gray[50],
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'space-around',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.success }}>
            {Math.min(...scores)}
          </div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Best</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>
            {avg.toFixed(0)}
          </div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Average</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.error }}>
            {Math.max(...scores)}
          </div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Worst</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN HUB VIEW
// ============================================================================

type ReplayTabView = 'REPLAY' | 'PATTERNS' | 'SCORING' | 'COMPARE';

const RoundReplayHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReplayTabView>('REPLAY');
  const [round] = useState<RoundData>(MOCK_ROUND);
  const [comparisonRound] = useState<RoundData>(MOCK_COMPARISON_ROUND);
  const [patternData] = useState<PatternData[]>(MOCK_PATTERN_DATA);
  const [alerts] = useState<TrendAlert[]>(MOCK_TREND_ALERTS);

  const tabs = [
    { id: 'REPLAY' as ReplayTabView, label: 'Replay', icon: '🎬' },
    { id: 'PATTERNS' as ReplayTabView, label: 'Patterns', icon: '🎯' },
    { id: 'SCORING' as ReplayTabView, label: 'Scoring', icon: '📊' },
    { id: 'COMPARE' as ReplayTabView, label: 'Compare', icon: '⚖️' },
  ];

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
          Round Analysis
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
        {activeTab === 'REPLAY' && (
          <RoundReplayPlayer round={round} />
        )}

        {activeTab === 'PATTERNS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Miss Patterns</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
            }}>
              {patternData.slice(0, 4).map(data => (
                <MissPatternHeatmap key={data.club} data={data} />
              ))}
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Trend Alerts</h2>
            {alerts.map(alert => (
              <TrendAlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}

        {activeTab === 'SCORING' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ScoringDistribution stats={round.stats} />
            <StrokeLossAnalysis round={round} />
            <ConsistencyMeter scores={[82, 86, 79, 84, 81, 88, 83]} />
          </div>
        )}

        {activeTab === 'COMPARE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <RoundComparisonView round1={round} round2={comparisonRound} />
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
 * import { RoundReplayHub } from './NewFeatures_RoundReplay';
 *
 * function App() {
 *   return <RoundReplayHub />;
 * }
 *
 * Individual components can also be imported:
 * - RoundReplayPlayer - Navigate through round
 * - ShotCard - Individual shot details
 * - HoleReplayView - Hole-by-hole breakdown
 * - MissPatternHeatmap - Visual miss tendencies
 * - ScoringDistribution - Birdie/par/bogey chart
 * - StrokeLossAnalysis - Where strokes were lost
 * - TrendAlertCard - Pattern alerts
 * - RoundComparisonView - Side-by-side comparison
 * - ConsistencyMeter - Round variance analysis
 */

export {
  // Main Hub
  RoundReplayHub,

  // Replay Components
  RoundReplayPlayer,
  ShotCard,
  HoleReplayView,

  // Pattern Components
  MissPatternHeatmap,
  TrendAlertCard,

  // Scoring Components
  ScoringDistribution,
  StrokeLossAnalysis,
  ConsistencyMeter,

  // Comparison Components
  RoundComparisonView,

  // Types
  type RoundData,
  type HoleScore,
  type Shot,
  type RoundStats,
  type PatternData,
  type TrendAlert,
  type ShotResult,
};

export default RoundReplayHub;

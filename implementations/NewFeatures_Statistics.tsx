/**
 * NewFeatures_Statistics.tsx
 * Advanced Statistics & Analytics System for MCG Golf App
 *
 * Inspired by: DataGolf, PGA Tour Stats, Shot Scope Analytics
 *
 * Features:
 * - Strokes Gained detailed breakdown
 * - Predictive analytics
 * - Detailed performance breakdowns
 * - Peer and pro comparisons
 */

import React, { useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type StatCategory = 'DRIVING' | 'APPROACH' | 'SHORT_GAME' | 'PUTTING';
type TrendDirection = 'UP' | 'DOWN' | 'STABLE';
type BenchmarkLevel = 'SCRATCH' | 'SINGLE' | 'BOGEY' | 'HIGH' | 'TOUR';

interface StrokesGainedData {
  category: StatCategory;
  value: number;
  trend: TrendDirection;
  percentile: number;
  vsLastMonth: number;
}

interface DistanceBreakdown {
  range: string;
  shots: number;
  sgValue: number;
  proximity: number;
  girPercentage: number;
}

interface LieTypeStats {
  lieType: string;
  shots: number;
  avgProximity: number;
  sgValue: number;
  successRate: number;
}

interface ClubEfficiency {
  club: string;
  shots: number;
  avgDistance: number;
  dispersion: number;
  efficiency: number;
  trend: TrendDirection;
}

interface PredictiveInsight {
  id: string;
  type: 'IMPROVEMENT' | 'RISK' | 'OPPORTUNITY';
  title: string;
  description: string;
  confidence: number;
  impact: string;
  actionItem: string;
}

interface PersonalRecord {
  id: string;
  category: string;
  value: number | string;
  date: Date;
  course?: string;
  previousBest?: number | string;
}

interface BenchmarkComparison {
  stat: string;
  yourValue: number;
  benchmarks: {
    level: BenchmarkLevel;
    value: number;
  }[];
}

interface SeasonComparison {
  stat: string;
  currentSeason: number;
  lastSeason: number;
  change: number;
  changePercent: number;
}

interface TimeOfDayStat {
  timeSlot: string;
  roundsPlayed: number;
  avgScore: number;
  bestScore: number;
  avgSG: number;
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
  driving: '#8B5CF6',
  approach: '#3B82F6',
  shortGame: '#22C55E',
  putting: '#F59E0B',
};

const STAT_CATEGORY_CONFIG: Record<StatCategory, { label: string; icon: string; color: string }> = {
  DRIVING: { label: 'Off the Tee', icon: '🏌️', color: COLORS.driving },
  APPROACH: { label: 'Approach', icon: '🎯', color: COLORS.approach },
  SHORT_GAME: { label: 'Short Game', icon: '⛳', color: COLORS.shortGame },
  PUTTING: { label: 'Putting', icon: '🕳️', color: COLORS.putting },
};

const BENCHMARK_LABELS: Record<BenchmarkLevel, { label: string; color: string }> = {
  TOUR: { label: 'Tour Avg', color: '#8B5CF6' },
  SCRATCH: { label: 'Scratch', color: COLORS.success },
  SINGLE: { label: 'Single Digit', color: COLORS.info },
  BOGEY: { label: 'Bogey Golfer', color: COLORS.warning },
  HIGH: { label: '20+ Hcp', color: COLORS.gray[400] },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_SG_DATA: StrokesGainedData[] = [
  { category: 'DRIVING', value: 0.42, trend: 'UP', percentile: 68, vsLastMonth: 0.15 },
  { category: 'APPROACH', value: -0.28, trend: 'DOWN', percentile: 42, vsLastMonth: -0.12 },
  { category: 'SHORT_GAME', value: 0.65, trend: 'UP', percentile: 75, vsLastMonth: 0.22 },
  { category: 'PUTTING', value: -0.18, trend: 'STABLE', percentile: 45, vsLastMonth: 0.02 },
];

const MOCK_DISTANCE_BREAKDOWN: DistanceBreakdown[] = [
  { range: '50-75y', shots: 42, sgValue: 0.15, proximity: 12, girPercentage: 0 },
  { range: '75-100y', shots: 38, sgValue: 0.08, proximity: 18, girPercentage: 72 },
  { range: '100-125y', shots: 56, sgValue: -0.05, proximity: 24, girPercentage: 65 },
  { range: '125-150y', shots: 68, sgValue: -0.12, proximity: 32, girPercentage: 52 },
  { range: '150-175y', shots: 52, sgValue: -0.22, proximity: 42, girPercentage: 38 },
  { range: '175-200y', shots: 34, sgValue: -0.35, proximity: 52, girPercentage: 28 },
  { range: '200y+', shots: 22, sgValue: -0.45, proximity: 65, girPercentage: 18 },
];

const MOCK_LIE_STATS: LieTypeStats[] = [
  { lieType: 'Fairway', shots: 245, avgProximity: 28, sgValue: 0.12, successRate: 58 },
  { lieType: 'Light Rough', shots: 98, avgProximity: 38, sgValue: -0.08, successRate: 42 },
  { lieType: 'Heavy Rough', shots: 34, avgProximity: 52, sgValue: -0.32, successRate: 24 },
  { lieType: 'Fairway Bunker', shots: 18, avgProximity: 45, sgValue: -0.25, successRate: 28 },
  { lieType: 'Greenside Bunker', shots: 42, avgProximity: 15, sgValue: 0.08, successRate: 65 },
];

const MOCK_CLUB_EFFICIENCY: ClubEfficiency[] = [
  { club: 'Driver', shots: 142, avgDistance: 252, dispersion: 28, efficiency: 85, trend: 'UP' },
  { club: '3 Wood', shots: 48, avgDistance: 228, dispersion: 22, efficiency: 78, trend: 'STABLE' },
  { club: '5 Iron', shots: 86, avgDistance: 182, dispersion: 18, efficiency: 72, trend: 'DOWN' },
  { club: '7 Iron', shots: 124, avgDistance: 162, dispersion: 14, efficiency: 82, trend: 'UP' },
  { club: 'PW', shots: 156, avgDistance: 122, dispersion: 10, efficiency: 88, trend: 'UP' },
  { club: 'SW', shots: 98, avgDistance: 85, dispersion: 12, efficiency: 75, trend: 'STABLE' },
];

const MOCK_PREDICTIONS: PredictiveInsight[] = [
  {
    id: 'pred-1',
    type: 'IMPROVEMENT',
    title: 'Handicap Drop Incoming',
    description: 'Based on your recent improvement trajectory, you\'re on track to break single digits within 6 weeks.',
    confidence: 78,
    impact: '-1.2 strokes',
    actionItem: 'Maintain current practice frequency',
  },
  {
    id: 'pred-2',
    type: 'OPPORTUNITY',
    title: 'Approach Game Opportunity',
    description: 'Your 125-150y approaches are underperforming. Improving here could save 2 strokes per round.',
    confidence: 85,
    impact: '-2.0 strokes/round',
    actionItem: 'Focus on 8-iron distance control drills',
  },
  {
    id: 'pred-3',
    type: 'RISK',
    title: 'Putting Regression',
    description: 'Your putting stats show signs of regression. Recent 3-putt rate has increased.',
    confidence: 62,
    impact: '+0.5 strokes/round',
    actionItem: 'Schedule putting practice session',
  },
];

const MOCK_RECORDS: PersonalRecord[] = [
  { id: 'rec-1', category: 'Lowest Round', value: 74, date: new Date('2024-03-15'), course: 'TPC Scottsdale', previousBest: 76 },
  { id: 'rec-2', category: 'Lowest Front 9', value: 35, date: new Date('2024-03-15'), course: 'TPC Scottsdale', previousBest: 36 },
  { id: 'rec-3', category: 'Best GIR Round', value: '14/18', date: new Date('2024-02-28'), course: 'Grayhawk Talon' },
  { id: 'rec-4', category: 'Most Birdies', value: 5, date: new Date('2024-03-15'), course: 'TPC Scottsdale', previousBest: 4 },
  { id: 'rec-5', category: 'Longest Drive', value: 298, date: new Date('2024-01-20'), course: 'Troon North' },
];

const MOCK_BENCHMARKS: BenchmarkComparison[] = [
  {
    stat: 'Driving Distance',
    yourValue: 252,
    benchmarks: [
      { level: 'TOUR', value: 295 },
      { level: 'SCRATCH', value: 270 },
      { level: 'SINGLE', value: 250 },
      { level: 'BOGEY', value: 220 },
    ],
  },
  {
    stat: 'GIR %',
    yourValue: 52,
    benchmarks: [
      { level: 'TOUR', value: 67 },
      { level: 'SCRATCH', value: 58 },
      { level: 'SINGLE', value: 48 },
      { level: 'BOGEY', value: 32 },
    ],
  },
  {
    stat: 'Putts/Round',
    yourValue: 31,
    benchmarks: [
      { level: 'TOUR', value: 29 },
      { level: 'SCRATCH', value: 30 },
      { level: 'SINGLE', value: 32 },
      { level: 'BOGEY', value: 35 },
    ],
  },
];

const MOCK_SEASON_COMPARISON: SeasonComparison[] = [
  { stat: 'Scoring Average', currentSeason: 82.4, lastSeason: 85.1, change: -2.7, changePercent: -3.2 },
  { stat: 'Handicap Index', currentSeason: 9.4, lastSeason: 12.1, change: -2.7, changePercent: -22.3 },
  { stat: 'Fairways Hit %', currentSeason: 58, lastSeason: 52, change: 6, changePercent: 11.5 },
  { stat: 'Greens in Reg %', currentSeason: 52, lastSeason: 45, change: 7, changePercent: 15.6 },
  { stat: 'Putts per GIR', currentSeason: 1.82, lastSeason: 1.95, change: -0.13, changePercent: -6.7 },
];

const MOCK_TIME_STATS: TimeOfDayStat[] = [
  { timeSlot: 'Early (6-8am)', roundsPlayed: 12, avgScore: 84, bestScore: 78, avgSG: -0.2 },
  { timeSlot: 'Morning (8-11am)', roundsPlayed: 28, avgScore: 82, bestScore: 74, avgSG: 0.4 },
  { timeSlot: 'Midday (11am-2pm)', roundsPlayed: 18, avgScore: 83, bestScore: 76, avgSG: 0.1 },
  { timeSlot: 'Afternoon (2-5pm)', roundsPlayed: 22, avgScore: 85, bestScore: 79, avgSG: -0.5 },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatSG = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}`;
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * StrokesGainedOverview - SG summary card
 */
interface StrokesGainedOverviewProps {
  data: StrokesGainedData[];
}

const StrokesGainedOverview: React.FC<StrokesGainedOverviewProps> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Strokes Gained</h3>
          <p style={{ fontSize: 12, color: COLORS.gray[500] }}>vs Scratch Golfer</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: total >= 0 ? COLORS.success : COLORS.error,
          }}>
            {formatSG(total)}
          </div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Total SG</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.map((item) => {
          const config = STAT_CATEGORY_CONFIG[item.category];
          const barWidth = Math.min(100, Math.abs(item.value) * 50 + 10);

          return (
            <div key={item.category}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{config.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{config.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: item.value >= 0 ? COLORS.success : COLORS.error,
                  }}>
                    {formatSG(item.value)}
                  </span>
                  <span style={{
                    fontSize: 10,
                    color: item.trend === 'UP' ? COLORS.success : item.trend === 'DOWN' ? COLORS.error : COLORS.gray[400],
                  }}>
                    {item.trend === 'UP' ? '↑' : item.trend === 'DOWN' ? '↓' : '→'}
                  </span>
                </div>
              </div>
              <div style={{
                height: 8,
                backgroundColor: COLORS.gray[100],
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  left: item.value >= 0 ? '50%' : `${50 - barWidth / 2}%`,
                  width: `${barWidth / 2}%`,
                  height: '100%',
                  backgroundColor: item.value >= 0 ? COLORS.success : COLORS.error,
                  borderRadius: 4,
                }} />
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: 2,
                  backgroundColor: COLORS.gray[300],
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * DistanceBreakdownChart - SG by distance
 */
interface DistanceBreakdownChartProps {
  data: DistanceBreakdown[];
}

const DistanceBreakdownChart: React.FC<DistanceBreakdownChartProps> = ({ data }) => {
  const maxShots = Math.max(...data.map(d => d.shots));

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Approach by Distance</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.map((row, index) => (
          <div key={index}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}>
              <span style={{ fontSize: 12, fontWeight: 500, width: 70 }}>{row.range}</span>
              <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                <span style={{ color: COLORS.gray[500] }}>{row.shots} shots</span>
                <span style={{
                  fontWeight: 600,
                  color: row.sgValue >= 0 ? COLORS.success : COLORS.error,
                }}>
                  {formatSG(row.sgValue)}
                </span>
                <span style={{ color: COLORS.gray[500] }}>{row.proximity}ft</span>
              </div>
            </div>
            <div style={{
              height: 20,
              backgroundColor: COLORS.gray[100],
              borderRadius: 4,
              overflow: 'hidden',
              display: 'flex',
            }}>
              <div style={{
                width: `${(row.shots / maxShots) * 100}%`,
                height: '100%',
                backgroundColor: row.sgValue >= 0 ? COLORS.success : row.sgValue > -0.2 ? COLORS.warning : COLORS.error,
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 8,
              }}>
                <span style={{ fontSize: 10, color: COLORS.white, fontWeight: 600 }}>
                  {row.girPercentage > 0 ? `${row.girPercentage}% GIR` : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        marginTop: 16,
        paddingTop: 12,
        borderTop: `1px solid ${COLORS.gray[200]}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: COLORS.success, opacity: 0.7 }} />
          <span style={{ fontSize: 10, color: COLORS.gray[500] }}>Gaining</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: COLORS.warning, opacity: 0.7 }} />
          <span style={{ fontSize: 10, color: COLORS.gray[500] }}>Neutral</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: COLORS.error, opacity: 0.7 }} />
          <span style={{ fontSize: 10, color: COLORS.gray[500] }}>Losing</span>
        </div>
      </div>
    </div>
  );
};

/**
 * LieTypeAnalysis - Performance by lie
 */
interface LieTypeAnalysisProps {
  data: LieTypeStats[];
}

const LieTypeAnalysis: React.FC<LieTypeAnalysisProps> = ({ data }) => {
  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Performance by Lie</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((lie, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 12,
              backgroundColor: COLORS.gray[50],
              borderRadius: 10,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{lie.lieType}</div>
              <div style={{ fontSize: 11, color: COLORS.gray[500] }}>{lie.shots} shots</div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 60px)',
              gap: 8,
              textAlign: 'center',
            }}>
              <div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: lie.sgValue >= 0 ? COLORS.success : COLORS.error,
                }}>
                  {formatSG(lie.sgValue)}
                </div>
                <div style={{ fontSize: 9, color: COLORS.gray[400] }}>SG</div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{lie.avgProximity}ft</div>
                <div style={{ fontSize: 9, color: COLORS.gray[400] }}>Prox</div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{lie.successRate}%</div>
                <div style={{ fontSize: 9, color: COLORS.gray[400] }}>Success</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ClubEfficiencyTable - Club performance
 */
interface ClubEfficiencyTableProps {
  data: ClubEfficiency[];
}

const ClubEfficiencyTable: React.FC<ClubEfficiencyTableProps> = ({ data }) => {
  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{ padding: 16, borderBottom: `1px solid ${COLORS.gray[200]}` }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Club Efficiency</h3>
      </div>

      <div>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr 1fr 1fr 60px',
          padding: '10px 16px',
          backgroundColor: COLORS.gray[50],
          fontSize: 11,
          color: COLORS.gray[500],
          fontWeight: 600,
        }}>
          <span>Club</span>
          <span style={{ textAlign: 'right' }}>Avg Dist</span>
          <span style={{ textAlign: 'right' }}>Dispersion</span>
          <span style={{ textAlign: 'right' }}>Efficiency</span>
          <span style={{ textAlign: 'right' }}>Trend</span>
        </div>

        {/* Rows */}
        {data.map((club, index) => (
          <div
            key={club.club}
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 1fr 1fr 60px',
              padding: '12px 16px',
              borderBottom: index < data.length - 1 ? `1px solid ${COLORS.gray[100]}` : 'none',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600 }}>{club.club}</span>
            <span style={{ fontSize: 13, textAlign: 'right' }}>{club.avgDistance}y</span>
            <span style={{ fontSize: 13, textAlign: 'right' }}>±{club.dispersion}y</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
              <div style={{
                width: 40,
                height: 6,
                backgroundColor: COLORS.gray[200],
                borderRadius: 3,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${club.efficiency}%`,
                  height: '100%',
                  backgroundColor: club.efficiency >= 80 ? COLORS.success : club.efficiency >= 60 ? COLORS.warning : COLORS.error,
                }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{club.efficiency}%</span>
            </div>
            <span style={{
              fontSize: 14,
              textAlign: 'right',
              color: club.trend === 'UP' ? COLORS.success : club.trend === 'DOWN' ? COLORS.error : COLORS.gray[400],
            }}>
              {club.trend === 'UP' ? '↑' : club.trend === 'DOWN' ? '↓' : '→'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * PredictiveInsightCard - AI predictions
 */
interface PredictiveInsightCardProps {
  insight: PredictiveInsight;
  onAction?: () => void;
}

const PredictiveInsightCard: React.FC<PredictiveInsightCardProps> = ({ insight, onAction }) => {
  const typeConfig = {
    IMPROVEMENT: { icon: '📈', color: COLORS.success },
    OPPORTUNITY: { icon: '💡', color: COLORS.info },
    RISK: { icon: '⚠️', color: COLORS.warning },
  };

  const config = typeConfig[insight.type];

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
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 24 }}>{config.icon}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{insight.title}</div>
            <div style={{
              fontSize: 10,
              color: COLORS.gray[500],
              marginTop: 2,
            }}>
              {insight.confidence}% confidence
            </div>
          </div>
        </div>
        <span style={{
          fontSize: 14,
          fontWeight: 700,
          color: config.color,
        }}>
          {insight.impact}
        </span>
      </div>

      <p style={{
        fontSize: 13,
        color: COLORS.gray[600],
        lineHeight: 1.5,
        marginBottom: 12,
      }}>
        {insight.description}
      </p>

      <div style={{
        padding: 10,
        backgroundColor: `${config.color}10`,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: COLORS.gray[700] }}>
          💪 {insight.actionItem}
        </span>
        {onAction && (
          <button
            onClick={onAction}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: config.color,
              color: COLORS.white,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Take Action
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * PersonalRecordsCard - Best performances
 */
interface PersonalRecordsCardProps {
  records: PersonalRecord[];
}

const PersonalRecordsCard: React.FC<PersonalRecordsCardProps> = ({ records }) => {
  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Personal Records</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {records.map((record) => (
          <div
            key={record.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 12,
              backgroundColor: COLORS.gray[50],
              borderRadius: 10,
            }}
          >
            <span style={{
              fontSize: 24,
              marginRight: 12,
            }}>
              🏆
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{record.category}</div>
              <div style={{ fontSize: 11, color: COLORS.gray[500] }}>
                {record.course && `${record.course} • `}{formatDate(record.date)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.primary,
              }}>
                {record.value}{typeof record.value === 'number' && record.category.includes('Distance') ? 'y' : ''}
              </div>
              {record.previousBest && (
                <div style={{ fontSize: 10, color: COLORS.gray[400] }}>
                  prev: {record.previousBest}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * BenchmarkChart - Comparison visualization
 */
interface BenchmarkChartProps {
  data: BenchmarkComparison[];
}

const BenchmarkChart: React.FC<BenchmarkChartProps> = ({ data }) => {
  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>How You Compare</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {data.map((stat, index) => {
          const allValues = [stat.yourValue, ...stat.benchmarks.map(b => b.value)];
          const min = Math.min(...allValues) * 0.9;
          const max = Math.max(...allValues) * 1.1;
          const range = max - min;

          const getPosition = (val: number) => ((val - min) / range) * 100;

          return (
            <div key={index}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 8,
              }}>
                {stat.stat}
              </div>
              <div style={{
                position: 'relative',
                height: 40,
                backgroundColor: COLORS.gray[100],
                borderRadius: 8,
              }}>
                {/* Benchmark markers */}
                {stat.benchmarks.map((benchmark) => (
                  <div
                    key={benchmark.level}
                    style={{
                      position: 'absolute',
                      left: `${getPosition(benchmark.value)}%`,
                      top: 0,
                      bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div style={{
                      width: 2,
                      flex: 1,
                      backgroundColor: BENCHMARK_LABELS[benchmark.level].color,
                      opacity: 0.5,
                    }} />
                    <span style={{
                      fontSize: 9,
                      color: BENCHMARK_LABELS[benchmark.level].color,
                      whiteSpace: 'nowrap',
                    }}>
                      {benchmark.value}
                    </span>
                  </div>
                ))}

                {/* Your marker */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${getPosition(stat.yourValue)}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: COLORS.primary,
                    border: '3px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    zIndex: 1,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 16,
        paddingTop: 12,
        borderTop: `1px solid ${COLORS.gray[200]}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: COLORS.primary,
          }} />
          <span style={{ fontSize: 10, color: COLORS.gray[600] }}>You</span>
        </div>
        {Object.entries(BENCHMARK_LABELS).slice(0, 4).map(([level, config]) => (
          <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 2,
              height: 12,
              backgroundColor: config.color,
            }} />
            <span style={{ fontSize: 10, color: COLORS.gray[600] }}>{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * SeasonComparisonCard - Year over year
 */
interface SeasonComparisonCardProps {
  data: SeasonComparison[];
}

const SeasonComparisonCard: React.FC<SeasonComparisonCardProps> = ({ data }) => {
  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Season Comparison</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.map((stat, index) => {
          const isImprovement = (stat.stat.includes('Score') || stat.stat.includes('Handicap') || stat.stat.includes('Putts'))
            ? stat.change < 0
            : stat.change > 0;

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 12,
                backgroundColor: COLORS.gray[50],
                borderRadius: 10,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{stat.stat}</div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <span style={{ fontSize: 12, color: COLORS.gray[400] }}>
                  {stat.lastSeason}
                </span>
                <span style={{ color: COLORS.gray[300] }}>→</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>
                  {stat.currentSeason}
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 10,
                  backgroundColor: isImprovement ? `${COLORS.success}15` : `${COLORS.error}15`,
                  color: isImprovement ? COLORS.success : COLORS.error,
                }}>
                  {stat.changePercent > 0 ? '+' : ''}{stat.changePercent.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * TimeOfDayAnalysis - When you play best
 */
interface TimeOfDayAnalysisProps {
  data: TimeOfDayStat[];
}

const TimeOfDayAnalysis: React.FC<TimeOfDayAnalysisProps> = ({ data }) => {
  const best = data.reduce((prev, curr) => (curr.avgScore < prev.avgScore ? curr : prev));

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Time of Day Analysis</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.map((slot) => {
          const isBest = slot === best;

          return (
            <div
              key={slot.timeSlot}
              style={{
                padding: 14,
                backgroundColor: isBest ? `${COLORS.success}10` : COLORS.gray[50],
                borderRadius: 10,
                border: isBest ? `2px solid ${COLORS.success}` : 'none',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{slot.timeSlot}</span>
                    {isBest && (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '2px 6px',
                        backgroundColor: COLORS.success,
                        color: COLORS.white,
                        borderRadius: 8,
                      }}>
                        BEST
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.gray[500] }}>
                    {slot.roundsPlayed} rounds
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: 16,
                  textAlign: 'right',
                }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{slot.avgScore}</div>
                    <div style={{ fontSize: 9, color: COLORS.gray[400] }}>Avg</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.success }}>
                      {slot.bestScore}
                    </div>
                    <div style={{ fontSize: 9, color: COLORS.gray[400] }}>Best</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN HUB VIEW
// ============================================================================

type StatsTabView = 'STROKES_GAINED' | 'BREAKDOWN' | 'PREDICTIONS' | 'COMPARE';

const StatisticsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StatsTabView>('STROKES_GAINED');
  const [sgData] = useState<StrokesGainedData[]>(MOCK_SG_DATA);
  const [distanceData] = useState<DistanceBreakdown[]>(MOCK_DISTANCE_BREAKDOWN);
  const [lieData] = useState<LieTypeStats[]>(MOCK_LIE_STATS);
  const [clubData] = useState<ClubEfficiency[]>(MOCK_CLUB_EFFICIENCY);
  const [predictions] = useState<PredictiveInsight[]>(MOCK_PREDICTIONS);
  const [records] = useState<PersonalRecord[]>(MOCK_RECORDS);
  const [benchmarks] = useState<BenchmarkComparison[]>(MOCK_BENCHMARKS);
  const [seasonData] = useState<SeasonComparison[]>(MOCK_SEASON_COMPARISON);
  const [timeData] = useState<TimeOfDayStat[]>(MOCK_TIME_STATS);

  const tabs = [
    { id: 'STROKES_GAINED' as StatsTabView, label: 'SG', icon: '📊' },
    { id: 'BREAKDOWN' as StatsTabView, label: 'Details', icon: '🔍' },
    { id: 'PREDICTIONS' as StatsTabView, label: 'AI', icon: '🤖' },
    { id: 'COMPARE' as StatsTabView, label: 'Compare', icon: '⚖️' },
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
          Advanced Statistics
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
        {activeTab === 'STROKES_GAINED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <StrokesGainedOverview data={sgData} />
            <DistanceBreakdownChart data={distanceData} />
            <LieTypeAnalysis data={lieData} />
          </div>
        )}

        {activeTab === 'BREAKDOWN' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ClubEfficiencyTable data={clubData} />
            <TimeOfDayAnalysis data={timeData} />
            <PersonalRecordsCard records={records} />
          </div>
        )}

        {activeTab === 'PREDICTIONS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {predictions.map(insight => (
              <PredictiveInsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}

        {activeTab === 'COMPARE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <BenchmarkChart data={benchmarks} />
            <SeasonComparisonCard data={seasonData} />
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  StatisticsHub,
  StrokesGainedOverview,
  DistanceBreakdownChart,
  LieTypeAnalysis,
  ClubEfficiencyTable,
  PredictiveInsightCard,
  PersonalRecordsCard,
  BenchmarkChart,
  SeasonComparisonCard,
  TimeOfDayAnalysis,
  type StrokesGainedData,
  type DistanceBreakdown,
  type LieTypeStats,
  type ClubEfficiency,
  type PredictiveInsight,
  type PersonalRecord,
  type BenchmarkComparison,
  type SeasonComparison,
};

export default StatisticsHub;

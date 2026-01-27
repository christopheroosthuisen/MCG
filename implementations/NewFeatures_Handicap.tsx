/**
 * NewFeatures_Handicap.tsx
 * Handicap Tracker System for MCG Golf App
 *
 * Inspired by: The Grint, GHIN, Golf Genius
 *
 * Features:
 * - Handicap Dashboard with trends
 * - Easy Round Posting
 * - Handicap Projection tools
 * - Course Handicap Calculator
 */

import React, { useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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
  courseName: string;
  teeId: string;
  teeName: string;
  grossScore: number;
  adjustedScore: number;
  courseRating: number;
  slopeRating: number;
  scoreDifferential: number;
  isUsedInCalculation: boolean;
  pcc?: number; // Playing Conditions Calculation
}

interface Course {
  id: string;
  name: string;
  city: string;
  state: string;
  tees: CourseTee[];
}

interface CourseTee {
  id: string;
  name: string;
  color: string;
  courseRating: number;
  slopeRating: number;
  parTotal: number;
  totalYardage: number;
  holeData: HoleHandicapData[];
}

interface HoleHandicapData {
  holeNumber: number;
  par: number;
  yardage: number;
  strokeIndex: number; // 1-18 for handicap allocation
}

interface HandicapProjection {
  currentIndex: number;
  projectedIndex: number;
  requiredScore: number;
  roundsToAchieve: number;
  scenarioDescription: string;
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
};

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_SCORING_RECORDS: ScoringRecord[] = [
  {
    id: 'score-1',
    date: new Date('2024-03-20'),
    courseId: 'course-1',
    courseName: 'TPC Scottsdale',
    teeId: 'tee-1',
    teeName: 'Blue',
    grossScore: 82,
    adjustedScore: 82,
    courseRating: 72.1,
    slopeRating: 131,
    scoreDifferential: 8.5,
    isUsedInCalculation: true,
  },
  {
    id: 'score-2',
    date: new Date('2024-03-13'),
    courseId: 'course-2',
    courseName: 'Grayhawk Talon',
    teeId: 'tee-2',
    teeName: 'Blue',
    grossScore: 86,
    adjustedScore: 85,
    courseRating: 71.8,
    slopeRating: 135,
    scoreDifferential: 11.0,
    isUsedInCalculation: true,
  },
  {
    id: 'score-3',
    date: new Date('2024-03-06'),
    courseId: 'course-1',
    courseName: 'TPC Scottsdale',
    teeId: 'tee-1',
    teeName: 'Blue',
    grossScore: 79,
    adjustedScore: 79,
    courseRating: 72.1,
    slopeRating: 131,
    scoreDifferential: 5.9,
    isUsedInCalculation: true,
  },
  {
    id: 'score-4',
    date: new Date('2024-02-28'),
    courseId: 'course-3',
    courseName: 'We-Ko-Pa Cholla',
    teeId: 'tee-3',
    teeName: 'Gold',
    grossScore: 84,
    adjustedScore: 84,
    courseRating: 73.2,
    slopeRating: 138,
    scoreDifferential: 8.9,
    isUsedInCalculation: true,
  },
  {
    id: 'score-5',
    date: new Date('2024-02-21'),
    courseId: 'course-2',
    courseName: 'Grayhawk Talon',
    teeId: 'tee-2',
    teeName: 'Blue',
    grossScore: 88,
    adjustedScore: 87,
    courseRating: 71.8,
    slopeRating: 135,
    scoreDifferential: 12.7,
    isUsedInCalculation: true,
  },
  {
    id: 'score-6',
    date: new Date('2024-02-14'),
    courseId: 'course-1',
    courseName: 'TPC Scottsdale',
    teeId: 'tee-1',
    teeName: 'Blue',
    grossScore: 81,
    adjustedScore: 81,
    courseRating: 72.1,
    slopeRating: 131,
    scoreDifferential: 7.7,
    isUsedInCalculation: true,
  },
  {
    id: 'score-7',
    date: new Date('2024-02-07'),
    courseId: 'course-4',
    courseName: 'Troon North Monument',
    teeId: 'tee-4',
    teeName: 'Blue',
    grossScore: 91,
    adjustedScore: 89,
    courseRating: 74.0,
    slopeRating: 145,
    scoreDifferential: 11.7,
    isUsedInCalculation: false,
  },
  {
    id: 'score-8',
    date: new Date('2024-01-31'),
    courseId: 'course-1',
    courseName: 'TPC Scottsdale',
    teeId: 'tee-1',
    teeName: 'Blue',
    grossScore: 83,
    adjustedScore: 83,
    courseRating: 72.1,
    slopeRating: 131,
    scoreDifferential: 9.4,
    isUsedInCalculation: true,
  },
];

const MOCK_HANDICAP: HandicapRecord = {
  id: 'handicap-1',
  userId: 'user-1',
  currentIndex: 9.4,
  lowIndex: 7.2,
  highIndex: 14.8,
  trend: 'DOWN',
  scoringRecords: MOCK_SCORING_RECORDS,
  lastUpdated: new Date('2024-03-20'),
};

const MOCK_COURSE: Course = {
  id: 'course-1',
  name: 'TPC Scottsdale',
  city: 'Scottsdale',
  state: 'AZ',
  tees: [
    {
      id: 'tee-1',
      name: 'Blue',
      color: '#3B82F6',
      courseRating: 72.1,
      slopeRating: 131,
      parTotal: 72,
      totalYardage: 6692,
      holeData: [
        { holeNumber: 1, par: 4, yardage: 408, strokeIndex: 11 },
        { holeNumber: 2, par: 4, yardage: 427, strokeIndex: 5 },
        { holeNumber: 3, par: 3, yardage: 172, strokeIndex: 17 },
        { holeNumber: 4, par: 5, yardage: 548, strokeIndex: 3 },
        { holeNumber: 5, par: 4, yardage: 453, strokeIndex: 1 },
        { holeNumber: 6, par: 4, yardage: 389, strokeIndex: 9 },
        { holeNumber: 7, par: 3, yardage: 215, strokeIndex: 13 },
        { holeNumber: 8, par: 4, yardage: 447, strokeIndex: 7 },
        { holeNumber: 9, par: 5, yardage: 528, strokeIndex: 15 },
        { holeNumber: 10, par: 4, yardage: 405, strokeIndex: 12 },
        { holeNumber: 11, par: 3, yardage: 148, strokeIndex: 18 },
        { holeNumber: 12, par: 5, yardage: 526, strokeIndex: 6 },
        { holeNumber: 13, par: 4, yardage: 425, strokeIndex: 4 },
        { holeNumber: 14, par: 4, yardage: 386, strokeIndex: 10 },
        { holeNumber: 15, par: 4, yardage: 501, strokeIndex: 2 },
        { holeNumber: 16, par: 3, yardage: 162, strokeIndex: 16 },
        { holeNumber: 17, par: 4, yardage: 332, strokeIndex: 14 },
        { holeNumber: 18, par: 5, yardage: 522, strokeIndex: 8 },
      ],
    },
    {
      id: 'tee-2',
      name: 'White',
      color: '#FFFFFF',
      courseRating: 70.2,
      slopeRating: 125,
      parTotal: 72,
      totalYardage: 6254,
      holeData: [],
    },
    {
      id: 'tee-3',
      name: 'Gold',
      color: '#F59E0B',
      courseRating: 68.5,
      slopeRating: 120,
      parTotal: 72,
      totalYardage: 5835,
      holeData: [],
    },
  ],
};

const HISTORICAL_INDEXES = [
  { date: new Date('2024-03-20'), index: 9.4 },
  { date: new Date('2024-03-01'), index: 10.2 },
  { date: new Date('2024-02-15'), index: 10.8 },
  { date: new Date('2024-02-01'), index: 11.5 },
  { date: new Date('2024-01-15'), index: 12.1 },
  { date: new Date('2024-01-01'), index: 12.4 },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDateFull = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const calculateScoreDifferential = (
  adjustedScore: number,
  courseRating: number,
  slopeRating: number,
  pcc: number = 0
): number => {
  return ((113 / slopeRating) * (adjustedScore - courseRating - pcc));
};

const calculateCourseHandicap = (
  handicapIndex: number,
  slopeRating: number,
  courseRating: number,
  parTotal: number
): number => {
  return Math.round((handicapIndex * (slopeRating / 113)) + (courseRating - parTotal));
};

const getESCMax = (courseHandicap: number, par: number): number => {
  // Equitable Stroke Control maximum
  if (courseHandicap <= 9) return par + 2;
  if (courseHandicap <= 19) return 7;
  if (courseHandicap <= 29) return 8;
  if (courseHandicap <= 39) return 9;
  return 10;
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * HandicapIndexCard - Current index display
 */
interface HandicapIndexCardProps {
  record: HandicapRecord;
}

const HandicapIndexCard: React.FC<HandicapIndexCardProps> = ({ record }) => {
  const trendColors = {
    UP: COLORS.error,
    DOWN: COLORS.success,
    STABLE: COLORS.gray[500],
  };
  const trendIcons = {
    UP: '↑',
    DOWN: '↓',
    STABLE: '→',
  };

  return (
    <div style={{
      backgroundColor: COLORS.secondary,
      borderRadius: 20,
      padding: 24,
      color: COLORS.white,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>
          Handicap Index
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, marginBottom: 8 }}>
          {record.currentIndex.toFixed(1)}
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: 20,
        }}>
          <span style={{ color: trendColors[record.trend], fontSize: 16 }}>
            {trendIcons[record.trend]}
          </span>
          <span style={{ fontSize: 13 }}>
            Trending {record.trend.toLowerCase()}
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: 24,
        paddingTop: 20,
        borderTop: '1px solid rgba(255,255,255,0.2)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{record.lowIndex.toFixed(1)}</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Low Index</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{record.highIndex.toFixed(1)}</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>High Index</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 600 }}>
            {record.scoringRecords.filter(r => r.isUsedInCalculation).length}
          </div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Rounds Used</div>
        </div>
      </div>

      <div style={{
        marginTop: 16,
        textAlign: 'center',
        fontSize: 11,
        opacity: 0.6,
      }}>
        Updated {formatDateFull(record.lastUpdated)}
      </div>
    </div>
  );
};

/**
 * TrendChart - Handicap over time visualization
 */
interface TrendChartProps {
  data: { date: Date; index: number }[];
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  const maxIndex = Math.max(...data.map(d => d.index)) + 2;
  const minIndex = Math.min(...data.map(d => d.index)) - 2;
  const range = maxIndex - minIndex;

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Index Trend</h3>

      <div style={{
        height: 150,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        paddingBottom: 24,
        position: 'relative',
      }}>
        {/* Y-axis labels */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingRight: 8,
        }}>
          <span style={{ fontSize: 10, color: COLORS.gray[400] }}>{maxIndex.toFixed(0)}</span>
          <span style={{ fontSize: 10, color: COLORS.gray[400] }}>{minIndex.toFixed(0)}</span>
        </div>

        {/* Chart bars */}
        <div style={{
          marginLeft: 30,
          flex: 1,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
        }}>
          {sortedData.map((point, index) => {
            const height = ((maxIndex - point.index) / range) * 120;
            const isLatest = index === sortedData.length - 1;

            return (
              <div
                key={point.date.toISOString()}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{
                  fontSize: 10,
                  fontWeight: isLatest ? 700 : 400,
                  color: isLatest ? COLORS.primary : COLORS.gray[600],
                }}>
                  {point.index.toFixed(1)}
                </span>
                <div style={{
                  width: '100%',
                  maxWidth: 40,
                  height: Math.max(20, 120 - height),
                  backgroundColor: isLatest ? COLORS.primary : COLORS.secondary,
                  borderRadius: '4px 4px 0 0',
                  opacity: isLatest ? 1 : 0.6 + (index / sortedData.length) * 0.4,
                }} />
                <span style={{
                  fontSize: 9,
                  color: COLORS.gray[400],
                  whiteSpace: 'nowrap',
                }}>
                  {formatDate(point.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        marginTop: 12,
        padding: 12,
        backgroundColor: `${COLORS.success}10`,
        borderRadius: 8,
        textAlign: 'center',
      }}>
        <span style={{ fontSize: 13, color: COLORS.gray[700] }}>
          Improved by{' '}
          <span style={{ fontWeight: 700, color: COLORS.success }}>
            {(sortedData[0].index - sortedData[sortedData.length - 1].index).toFixed(1)}
          </span>
          {' '}strokes since {formatDate(sortedData[0].date)}
        </span>
      </div>
    </div>
  );
};

/**
 * ScoreDifferentialList - Contributing rounds display
 */
interface ScoreDifferentialListProps {
  records: ScoringRecord[];
}

const ScoreDifferentialList: React.FC<ScoreDifferentialListProps> = ({ records }) => {
  const sortedRecords = [...records].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        padding: 16,
        borderBottom: `1px solid ${COLORS.gray[200]}`,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent Rounds</h3>
        <p style={{ fontSize: 12, color: COLORS.gray[500], marginTop: 4 }}>
          Your 8 best of last 20 rounds are used
        </p>
      </div>

      <div>
        {sortedRecords.map((record, index) => (
          <div
            key={record.id}
            style={{
              padding: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: index < sortedRecords.length - 1 ? `1px solid ${COLORS.gray[100]}` : 'none',
              backgroundColor: record.isUsedInCalculation ? `${COLORS.success}05` : 'transparent',
            }}
          >
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                {record.isUsedInCalculation && (
                  <span style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: COLORS.success,
                    color: COLORS.white,
                    fontSize: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    ✓
                  </span>
                )}
                <span style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.gray[800],
                }}>
                  {record.courseName}
                </span>
              </div>
              <div style={{
                fontSize: 12,
                color: COLORS.gray[500],
                marginTop: 4,
                marginLeft: record.isUsedInCalculation ? 24 : 0,
              }}>
                {record.teeName} • {formatDateFull(record.date)}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.gray[800],
              }}>
                {record.grossScore}
              </div>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: record.scoreDifferential <= 10 ? COLORS.success : COLORS.gray[500],
              }}>
                {record.scoreDifferential.toFixed(1)} diff
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * QuickPostForm - Fast round entry
 */
interface QuickPostFormProps {
  onSubmit: (data: { courseId: string; teeId: string; score: number }) => void;
  courses: Course[];
}

const QuickPostForm: React.FC<QuickPostFormProps> = ({ onSubmit, courses }) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedTee, setSelectedTee] = useState<string>('');
  const [score, setScore] = useState<number | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const course = courses.find(c => c.id === selectedCourse);
  const tee = course?.tees.find(t => t.id === selectedTee);

  const handleSubmit = () => {
    if (selectedCourse && selectedTee && score) {
      onSubmit({
        courseId: selectedCourse,
        teeId: selectedTee,
        score: score,
      });
      setScore('');
    }
  };

  const scoreDiff = score && tee
    ? calculateScoreDifferential(score, tee.courseRating, tee.slopeRating)
    : null;

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Post a Round</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: COLORS.gray[600], display: 'block', marginBottom: 4 }}>
            Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSelectedTee('');
            }}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${COLORS.gray[300]}`,
              fontSize: 14,
            }}
          >
            <option value="">Select course...</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {course && (
          <div>
            <label style={{ fontSize: 12, color: COLORS.gray[600], display: 'block', marginBottom: 4 }}>
              Tees
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {course.tees.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTee(t.id)}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 8,
                    border: selectedTee === t.id
                      ? `2px solid ${COLORS.primary}`
                      : `1px solid ${COLORS.gray[300]}`,
                    backgroundColor: selectedTee === t.id ? `${COLORS.primary}10` : COLORS.white,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: t.color,
                    border: t.color === '#FFFFFF' ? `1px solid ${COLORS.gray[300]}` : 'none',
                    margin: '0 auto 6px',
                  }} />
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: COLORS.gray[500] }}>
                    {t.slopeRating}/{t.courseRating}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: COLORS.gray[600], display: 'block', marginBottom: 4 }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
            <label style={{ fontSize: 12, color: COLORS.gray[600], display: 'block', marginBottom: 4 }}>
              Adjusted Gross Score
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value ? Number(e.target.value) : '')}
              placeholder="82"
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

        {scoreDiff !== null && (
          <div style={{
            padding: 12,
            backgroundColor: COLORS.gray[50],
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 13, color: COLORS.gray[600] }}>
              Score Differential:{' '}
              <span style={{
                fontWeight: 700,
                color: scoreDiff <= 10 ? COLORS.success : COLORS.gray[800],
              }}>
                {scoreDiff.toFixed(1)}
              </span>
            </span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedCourse || !selectedTee || !score}
          style={{
            padding: 14,
            borderRadius: 10,
            border: 'none',
            backgroundColor: (selectedCourse && selectedTee && score) ? COLORS.primary : COLORS.gray[300],
            color: COLORS.white,
            fontSize: 16,
            fontWeight: 600,
            cursor: (selectedCourse && selectedTee && score) ? 'pointer' : 'not-allowed',
          }}
        >
          Post Round
        </button>
      </div>
    </div>
  );
};

/**
 * CourseHandicapCard - Strokes for specific course/tees
 */
interface CourseHandicapCardProps {
  handicapIndex: number;
  course: Course;
  tee: CourseTee;
}

const CourseHandicapCard: React.FC<CourseHandicapCardProps> = ({
  handicapIndex,
  course,
  tee,
}) => {
  const courseHandicap = calculateCourseHandicap(
    handicapIndex,
    tee.slopeRating,
    tee.courseRating,
    tee.parTotal
  );

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        padding: 16,
        backgroundColor: tee.color === '#FFFFFF' ? COLORS.gray[200] : tee.color,
        color: tee.color === '#FFFFFF' || tee.color === '#F59E0B' ? COLORS.gray[800] : COLORS.white,
      }}>
        <div style={{ fontSize: 14 }}>{course.name}</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{tee.name} Tees</div>
      </div>

      <div style={{ padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: COLORS.gray[500], marginBottom: 8 }}>
          Course Handicap
        </div>
        <div style={{
          fontSize: 52,
          fontWeight: 700,
          color: COLORS.secondary,
        }}>
          {courseHandicap}
        </div>
        <div style={{ fontSize: 13, color: COLORS.gray[500], marginTop: 8 }}>
          strokes
        </div>
      </div>

      <div style={{
        padding: 16,
        borderTop: `1px solid ${COLORS.gray[200]}`,
        display: 'flex',
        justifyContent: 'space-around',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{tee.courseRating}</div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Rating</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{tee.slopeRating}</div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Slope</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{tee.totalYardage}</div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Yards</div>
        </div>
      </div>
    </div>
  );
};

/**
 * StrokeHoleAllocation - Which holes get strokes
 */
interface StrokeHoleAllocationProps {
  courseHandicap: number;
  holeData: HoleHandicapData[];
}

const StrokeHoleAllocation: React.FC<StrokeHoleAllocationProps> = ({
  courseHandicap,
  holeData,
}) => {
  const getStrokesOnHole = (strokeIndex: number): number => {
    if (courseHandicap >= strokeIndex) {
      return 1 + Math.floor((courseHandicap - strokeIndex) / 18);
    }
    return 0;
  };

  const front9 = holeData.filter(h => h.holeNumber <= 9);
  const back9 = holeData.filter(h => h.holeNumber > 9);

  const HoleRow = ({ holes }: { holes: HoleHandicapData[] }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${holes.length}, 1fr)`,
        gap: 4,
      }}>
        {holes.map(hole => {
          const strokes = getStrokesOnHole(hole.strokeIndex);
          return (
            <div
              key={hole.holeNumber}
              style={{
                textAlign: 'center',
                padding: 8,
              }}
            >
              <div style={{
                fontSize: 11,
                color: COLORS.gray[500],
                marginBottom: 4,
              }}>
                {hole.holeNumber}
              </div>
              <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: COLORS.gray[700],
              }}>
                {hole.par}
              </div>
              {strokes > 0 && (
                <div style={{
                  marginTop: 4,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                }}>
                  {Array(strokes).fill(null).map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: COLORS.primary,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Stroke Allocation</h3>
      <p style={{ fontSize: 12, color: COLORS.gray[500], marginBottom: 16 }}>
        You receive {courseHandicap} strokes on this course
      </p>

      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: COLORS.gray[600],
          marginBottom: 8,
        }}>
          Front 9
        </div>
        <HoleRow holes={front9} />
      </div>

      <div>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: COLORS.gray[600],
          marginBottom: 8,
        }}>
          Back 9
        </div>
        <HoleRow holes={back9} />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        padding: 10,
        backgroundColor: COLORS.gray[50],
        borderRadius: 8,
      }}>
        <div style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: COLORS.primary,
        }} />
        <span style={{ fontSize: 12, color: COLORS.gray[600] }}>
          = 1 stroke on this hole
        </span>
      </div>
    </div>
  );
};

/**
 * ProjectionCalculator - What-if scenarios
 */
interface ProjectionCalculatorProps {
  currentIndex: number;
  targetIndex: number;
  onTargetChange: (target: number) => void;
}

const ProjectionCalculator: React.FC<ProjectionCalculatorProps> = ({
  currentIndex,
  targetIndex,
  onTargetChange,
}) => {
  // Simplified projection calculation
  const indexDiff = currentIndex - targetIndex;
  const roundsNeeded = Math.ceil(indexDiff * 2.5);
  const avgScoreNeeded = 72 + (targetIndex * 1.1);

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Goal Projector</h3>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: COLORS.gray[600], display: 'block', marginBottom: 8 }}>
          Target Handicap Index
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <input
            type="range"
            min="0"
            max={currentIndex}
            step="0.1"
            value={targetIndex}
            onChange={(e) => onTargetChange(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{
            fontSize: 24,
            fontWeight: 700,
            color: COLORS.primary,
            minWidth: 50,
          }}>
            {targetIndex.toFixed(1)}
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
      }}>
        <div style={{
          padding: 16,
          backgroundColor: `${COLORS.primary}10`,
          borderRadius: 10,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.primary }}>
            ~{roundsNeeded}
          </div>
          <div style={{ fontSize: 12, color: COLORS.gray[600] }}>Rounds Needed</div>
        </div>
        <div style={{
          padding: 16,
          backgroundColor: `${COLORS.secondary}10`,
          borderRadius: 10,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.secondary }}>
            {avgScoreNeeded.toFixed(0)}
          </div>
          <div style={{ fontSize: 12, color: COLORS.gray[600] }}>Avg Score Target</div>
        </div>
      </div>

      <div style={{
        marginTop: 16,
        padding: 12,
        backgroundColor: COLORS.gray[50],
        borderRadius: 8,
        fontSize: 13,
        color: COLORS.gray[600],
        lineHeight: 1.5,
      }}>
        💡 To reach {targetIndex.toFixed(1)}, you need to consistently shoot around {avgScoreNeeded.toFixed(0)}
        for your next {roundsNeeded} rounds on a course with slope ~130.
      </div>
    </div>
  );
};

/**
 * TeeRecommendation - Best tees for ability
 */
interface TeeRecommendationProps {
  handicapIndex: number;
  course: Course;
}

const TeeRecommendation: React.FC<TeeRecommendationProps> = ({ handicapIndex, course }) => {
  // Simple recommendation logic based on handicap
  const getRecommendedTee = (): CourseTee | null => {
    if (handicapIndex < 10) {
      return course.tees.find(t => t.name === 'Blue') || course.tees[0];
    } else if (handicapIndex < 20) {
      return course.tees.find(t => t.name === 'White') || course.tees[1];
    } else {
      return course.tees.find(t => t.name === 'Gold') || course.tees[2];
    }
  };

  const recommendedTee = getRecommendedTee();

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
        Recommended Tees
      </h3>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        {course.tees.map(tee => {
          const isRecommended = tee.id === recommendedTee?.id;
          const courseHcp = calculateCourseHandicap(
            handicapIndex,
            tee.slopeRating,
            tee.courseRating,
            tee.parTotal
          );

          return (
            <div
              key={tee.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 12,
                backgroundColor: isRecommended ? `${COLORS.success}10` : COLORS.gray[50],
                borderRadius: 10,
                border: isRecommended ? `2px solid ${COLORS.success}` : 'none',
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: tee.color,
                border: tee.color === '#FFFFFF' ? `1px solid ${COLORS.gray[300]}` : 'none',
                marginRight: 12,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{tee.name}</span>
                  {isRecommended && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 8px',
                      backgroundColor: COLORS.success,
                      color: COLORS.white,
                      borderRadius: 10,
                    }}>
                      RECOMMENDED
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: COLORS.gray[500] }}>
                  {tee.totalYardage} yards • Course Hcp: {courseHcp}
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

type HandicapTabView = 'OVERVIEW' | 'POST' | 'CALCULATOR' | 'PROJECT';

const HandicapTrackerHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HandicapTabView>('OVERVIEW');
  const [handicapRecord] = useState<HandicapRecord>(MOCK_HANDICAP);
  const [course] = useState<Course>(MOCK_COURSE);
  const [selectedTeeIndex, setSelectedTeeIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(7.0);

  const selectedTee = course.tees[selectedTeeIndex];
  const courseHandicap = calculateCourseHandicap(
    handicapRecord.currentIndex,
    selectedTee.slopeRating,
    selectedTee.courseRating,
    selectedTee.parTotal
  );

  const tabs = [
    { id: 'OVERVIEW' as HandicapTabView, label: 'Overview', icon: '📊' },
    { id: 'POST' as HandicapTabView, label: 'Post', icon: '➕' },
    { id: 'CALCULATOR' as HandicapTabView, label: 'Calculate', icon: '🧮' },
    { id: 'PROJECT' as HandicapTabView, label: 'Project', icon: '🎯' },
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
          Handicap Tracker
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
        {activeTab === 'OVERVIEW' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <HandicapIndexCard record={handicapRecord} />
            <TrendChart data={HISTORICAL_INDEXES} />
            <ScoreDifferentialList records={handicapRecord.scoringRecords} />
          </div>
        )}

        {activeTab === 'POST' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <QuickPostForm
              courses={[course]}
              onSubmit={(data) => console.log('Posted:', data)}
            />
          </div>
        )}

        {activeTab === 'CALCULATOR' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Tee Selector */}
            <div style={{
              backgroundColor: COLORS.white,
              borderRadius: 12,
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                Select Tees
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {course.tees.map((tee, index) => (
                  <button
                    key={tee.id}
                    onClick={() => setSelectedTeeIndex(index)}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 8,
                      border: selectedTeeIndex === index
                        ? `2px solid ${COLORS.primary}`
                        : `1px solid ${COLORS.gray[300]}`,
                      backgroundColor: selectedTeeIndex === index ? `${COLORS.primary}10` : COLORS.white,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: tee.color,
                      border: tee.color === '#FFFFFF' ? `1px solid ${COLORS.gray[300]}` : 'none',
                      margin: '0 auto 6px',
                    }} />
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{tee.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <CourseHandicapCard
              handicapIndex={handicapRecord.currentIndex}
              course={course}
              tee={selectedTee}
            />

            {selectedTee.holeData.length > 0 && (
              <StrokeHoleAllocation
                courseHandicap={courseHandicap}
                holeData={selectedTee.holeData}
              />
            )}

            <TeeRecommendation
              handicapIndex={handicapRecord.currentIndex}
              course={course}
            />
          </div>
        )}

        {activeTab === 'PROJECT' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ProjectionCalculator
              currentIndex={handicapRecord.currentIndex}
              targetIndex={targetIndex}
              onTargetChange={setTargetIndex}
            />

            <div style={{
              backgroundColor: COLORS.white,
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                Milestone Goals
              </h3>
              {[
                { index: 9.9, label: 'Single Digits' },
                { index: 5.0, label: 'Low Single' },
                { index: 2.0, label: 'Scratch' },
              ].filter(m => m.index < handicapRecord.currentIndex).map(milestone => (
                <div
                  key={milestone.index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 12,
                    backgroundColor: COLORS.gray[50],
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{milestone.label}</div>
                    <div style={{ fontSize: 12, color: COLORS.gray[500] }}>
                      Index: {milestone.index.toFixed(1)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.primary,
                  }}>
                    {(handicapRecord.currentIndex - milestone.index).toFixed(1)} to go
                  </div>
                </div>
              ))}
            </div>
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
 * import { HandicapTrackerHub } from './NewFeatures_Handicap';
 *
 * function App() {
 *   return <HandicapTrackerHub />;
 * }
 */

export {
  // Main Hub
  HandicapTrackerHub,

  // Dashboard Components
  HandicapIndexCard,
  TrendChart,
  ScoreDifferentialList,

  // Posting Components
  QuickPostForm,

  // Calculator Components
  CourseHandicapCard,
  StrokeHoleAllocation,
  TeeRecommendation,

  // Projection Components
  ProjectionCalculator,

  // Utility Functions
  calculateScoreDifferential,
  calculateCourseHandicap,
  getESCMax,

  // Types
  type HandicapRecord,
  type ScoringRecord,
  type Course,
  type CourseTee,
  type HoleHandicapData,
};

export default HandicapTrackerHub;

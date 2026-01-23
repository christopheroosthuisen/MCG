/**
 * MCG Golf App - Golf Data Types
 * Comprehensive types for swing analysis, metrics, and training
 */

// ============================================
// CLUB TYPES
// ============================================

export type ClubType =
  | 'driver'
  | '3-wood'
  | '5-wood'
  | '7-wood'
  | 'hybrid'
  | '2-iron'
  | '3-iron'
  | '4-iron'
  | '5-iron'
  | '6-iron'
  | '7-iron'
  | '8-iron'
  | '9-iron'
  | 'pitching-wedge'
  | 'gap-wedge'
  | '52-wedge'
  | '54-wedge'
  | '56-wedge'
  | '58-wedge'
  | '60-wedge'
  | 'lob-wedge'
  | 'putter';

export type ClubCategory = 'driver' | 'wood' | 'hybrid' | 'iron' | 'wedge' | 'putter';

export interface Club {
  id: string;
  type: ClubType;
  category: ClubCategory;
  name: string;
  loft: number; // degrees
  brand?: string;
  model?: string;
}

// ============================================
// SHOT TYPES
// ============================================

export type ShotType =
  | 'full-swing'
  | 'pitch'
  | 'chip'
  | 'flop'
  | 'bunker'
  | 'punch'
  | 'draw'
  | 'fade'
  | 'putt';

export type ShotShape = 'straight' | 'draw' | 'fade' | 'hook' | 'slice' | 'push' | 'pull';

export type LieType = 'tee' | 'fairway' | 'rough' | 'bunker' | 'fringe' | 'green';

// ============================================
// TRACKMAN-STYLE METRICS
// ============================================

export interface BallData {
  ballSpeed: number;          // mph
  launchAngle: number;        // degrees (vertical)
  launchDirection: number;    // degrees (horizontal, + = right)
  spinRate: number;           // rpm
  spinAxis: number;           // degrees (+ = right tilt)
  carry: number;              // yards
  total: number;              // yards (carry + roll)
  offline: number;            // yards (+ = right)
  apex: number;               // feet (max height)
  landingAngle: number;       // degrees
}

export interface ClubData {
  clubSpeed: number;          // mph
  attackAngle: number;        // degrees (- = down)
  clubPath: number;           // degrees (+ = inside-out)
  faceAngle: number;          // degrees (+ = open)
  faceToPath: number;         // degrees
  dynamicLoft: number;        // degrees
  spinLoft: number;           // degrees
  lowPoint: number;           // inches (relative to ball)
  swingPlane: number;         // degrees
  swingDirection: number;     // degrees
}

export interface ImpactData {
  smashFactor: number;        // ratio (ball speed / club speed)
  strikeLocation: {
    vertical: number;         // mm from center (+ = high)
    horizontal: number;       // mm from center (+ = toe)
  };
}

export interface SwingMetrics {
  ball: BallData;
  club: ClubData;
  impact: ImpactData;
  timestamp: Date;
}

// ============================================
// SWING ANALYSIS
// ============================================

export type SwingPosition =
  | 'address'
  | 'takeaway'
  | 'backswing'
  | 'top'
  | 'downswing'
  | 'impact'
  | 'follow-through'
  | 'finish';

export interface SwingPositionAnalysis {
  position: SwingPosition;
  timestamp: number;          // ms from start
  frameNumber: number;
  score: number;              // 0-100
  isCorrect: boolean;
  issues?: SwingIssue[];
}

export interface SwingIssue {
  id: string;
  position: SwingPosition;
  type: 'critical' | 'warning' | 'suggestion';
  title: string;
  description: string;
  solution: string;
  relatedDrills?: string[];   // drill IDs
}

export interface BodyAngles {
  // Spine angles
  spineAngle: number;
  spineTilt: number;

  // Hip/Pelvis
  pelvisTurn: number;
  pelvisSway: number;
  pelvisTilt: number;

  // Torso/Chest
  chestTurn: number;
  xFactor: number;            // chest turn - pelvis turn

  // Arms
  leadArmAngle: number;
  trailArmAngle: number;
  elbowStraightness: number;

  // Wrists
  wristHinge: number;
  wristCock: number;

  // Knees
  leadKneeFlexion: number;
  trailKneeFlexion: number;
}

export interface SwingTempo {
  backswingDuration: number;  // ms
  downswingDuration: number;  // ms
  ratio: number;              // backswing / downswing (ideal ~3:1)
  totalDuration: number;      // ms
}

export interface SwingAnalysis {
  id: string;
  userId: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  club: ClubType;
  shotType: ShotType;
  metrics?: SwingMetrics;
  positions: SwingPositionAnalysis[];
  bodyAngles: Partial<Record<SwingPosition, BodyAngles>>;
  tempo: SwingTempo;
  overallScore: number;       // 0-100
  createdAt: Date;
}

// ============================================
// POSE DETECTION (for skeleton overlay)
// ============================================

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface PoseKeypoint {
  name: string;
  position: Point2D;
  confidence: number;
}

export interface PoseLandmarks {
  // Head
  nose: PoseKeypoint;
  leftEye: PoseKeypoint;
  rightEye: PoseKeypoint;
  leftEar: PoseKeypoint;
  rightEar: PoseKeypoint;

  // Upper body
  leftShoulder: PoseKeypoint;
  rightShoulder: PoseKeypoint;
  leftElbow: PoseKeypoint;
  rightElbow: PoseKeypoint;
  leftWrist: PoseKeypoint;
  rightWrist: PoseKeypoint;

  // Torso
  leftHip: PoseKeypoint;
  rightHip: PoseKeypoint;

  // Lower body
  leftKnee: PoseKeypoint;
  rightKnee: PoseKeypoint;
  leftAnkle: PoseKeypoint;
  rightAnkle: PoseKeypoint;
}

// ============================================
// DRILLS & PRACTICE
// ============================================

export type DrillCategory =
  | 'full-swing'
  | 'short-game'
  | 'putting'
  | 'chipping'
  | 'pitching'
  | 'bunker'
  | 'tempo'
  | 'alignment'
  | 'impact'
  | 'rotation';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';

export interface Drill {
  id: string;
  name: string;
  description: string;
  category: DrillCategory;
  difficulty: DifficultyLevel;
  duration: number;           // minutes
  equipment?: string[];
  steps: DrillStep[];
  videoUrl?: string;
  thumbnailUrl?: string;
  targetMetric?: keyof BallData | keyof ClubData;
  targetValue?: number;
  isPremium: boolean;
}

export interface DrillStep {
  order: number;
  title: string;
  instruction: string;
  duration?: number;          // seconds
  imageUrl?: string;
  videoUrl?: string;
  checkpoint?: string;
}

export interface DrillSession {
  id: string;
  drillId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  reps: number;
  notes?: string;
  rating?: number;            // 1-5
  swingAnalyses?: string[];   // analysis IDs
}

// ============================================
// PRACTICE SESSIONS
// ============================================

export interface PracticeSession {
  id: string;
  userId: string;
  type: 'range' | 'course' | 'short-game' | 'putting' | 'simulator';
  startedAt: Date;
  endedAt?: Date;
  location?: string;
  shots: Shot[];
  drills?: DrillSession[];
  notes?: string;
  goals?: string[];
  weather?: WeatherConditions;
}

export interface Shot {
  id: string;
  sessionId: string;
  club: ClubType;
  shotType: ShotType;
  lie?: LieType;
  target?: {
    distance: number;
    direction?: number;
  };
  metrics?: SwingMetrics;
  analysis?: string;          // analysis ID
  timestamp: Date;
  notes?: string;
}

export interface WeatherConditions {
  temperature: number;        // Fahrenheit
  windSpeed: number;          // mph
  windDirection: number;      // degrees
  humidity: number;           // percentage
  altitude?: number;          // feet
}

// ============================================
// USER & PROGRESS
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  handicap?: number;
  homeClub?: string;
  goals: string[];
  skillLevel: DifficultyLevel;
  dominantHand: 'right' | 'left';
  createdAt: Date;
  isPremium: boolean;
  premiumUntil?: Date;
}

export interface UserStats {
  totalPracticeSessions: number;
  totalPracticeTime: number;  // minutes
  totalShots: number;
  currentStreak: number;      // days
  longestStreak: number;
  averageScores: {
    fullSwing: number;
    shortGame: number;
    putting: number;
    overall: number;
  };
  clubAverages: Partial<Record<ClubType, Partial<BallData>>>;
  improvements: Improvement[];
}

export interface Improvement {
  metric: string;
  previousValue: number;
  currentValue: number;
  percentChange: number;
  period: 'week' | 'month' | 'all-time';
  recordedAt: Date;
}

// ============================================
// LESSONS & LEARNING
// ============================================

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: DrillCategory;
  difficulty: DifficultyLevel;
  duration: number;           // minutes
  instructor: Instructor;
  chapters: LessonChapter[];
  thumbnailUrl: string;
  isPremium: boolean;
  rating: number;
  reviewCount: number;
}

export interface LessonChapter {
  id: string;
  title: string;
  duration: number;           // minutes
  videoUrl: string;
  drills?: string[];          // drill IDs
  quiz?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  credentials: string[];
}

// ============================================
// AI COACH
// ============================================

export interface CoachMessage {
  id: string;
  role: 'user' | 'coach';
  content: string;
  timestamp: Date;
  attachments?: {
    type: 'image' | 'video' | 'analysis';
    url: string;
    analysisId?: string;
  }[];
  suggestions?: string[];
}

export interface CoachConversation {
  id: string;
  userId: string;
  messages: CoachMessage[];
  context?: {
    currentGoal?: string;
    recentAnalyses?: string[];
    focusArea?: DrillCategory;
  };
  createdAt: Date;
  updatedAt: Date;
}

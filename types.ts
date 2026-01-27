// Golf Domain Types

export type ClubCategory = 'PUTTER' | 'WEDGE' | 'IRON' | 'WOOD'; // Reordered: Green to Tee
export type ClubType = 'PUTTER' | 'LW' | 'SW' | 'GW' | 'PW' | 'IRON-9' | 'IRON-8' | 'IRON-7' | 'IRON-6' | 'IRON-5' | 'IRON-4' | 'IRON-3' | 'HYBRID' | '5-WOOD' | '3-WOOD' | 'DRIVER';

export interface Club {
    id: string;
    name: string;
    category: ClubCategory;
    type: ClubType;
    loft?: string;
    shaft?: string;
}

export type ShotShape = 'DRAW' | 'FADE' | 'STRAIGHT' | 'HOOK' | 'SLICE' | 'PUSH' | 'PULL';
export type ShortGameShot = 'BUMP_RUN' | 'FLOP' | 'PITCH' | 'CHECKER' | 'BUNKER_EXPLOSION' | 'BUNKER_CHUNK' | 'PUTT_LAG' | 'PUTT_SHORT';

export interface SwingMetrics {
    clubSpeed?: number;
    ballSpeed?: number;
    smashFactor?: number;
    carryDistance?: number;
    totalDistance?: number;
    spinRate?: number;
    launchAngle?: number;
    path?: number;
    faceToPath?: number;
    faceAngle?: number; // Added for D-Plane
    attackAngle?: number; // Added for D-Plane
    // Short Game Specifics
    launchDirection?: number;
    skidDistance?: number; // Putting
    rollDistance?: number; // Putting
}

// Data Import Types
export type ImportSource = 'ARCCOS' | 'TANGENT' | 'TRACKMAN' | 'GCQUAD' | 'MANUAL' | 'SHOT_DOCTOR';

export interface StrokesGainedStats {
    offTee: number;
    approach: number;
    aroundGreen: number;
    putting: number;
    total: number;
    handicap: number;
}

export interface RecommendationEngine {
    focusArea: 'DRIVING' | 'IRON_PLAY' | 'SHORT_GAME' | 'PUTTING';
    recommendedDrills: string[]; // Drill IDs
    recommendedCourseId?: string;
    reasoning: string;
}

// Bag of Shots Types
export type ShotLie = 'TEE' | 'FAIRWAY' | 'ROUGH' | 'BUNKER_FAIRWAY' | 'BUNKER_GREEN' | 'DIVOT';
export type ShotTrajectory = 'LOW' | 'STANDARD' | 'HIGH';

export interface BagShotSlot {
    id: string;
    title: string;
    distanceRange: string; // e.g. "150-175y"
    lie: ShotLie;
    shape: ShotShape;
    trajectory: ShotTrajectory;
    isMastered: boolean;
    videoUrl?: string; // Proof of mastery
    masteryDate?: Date;
}

// User Profile Types

export interface SwingDNA {
    driverSpeed: number;
    ironCarry7: number;
    tempo: 'FAST' | 'MODERATE' | 'SMOOTH';
    typicalShape: ShotShape;
    handicap: number;
    dexterity: 'RIGHT' | 'LEFT';
    height: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    memberStatus: 'FREE' | 'PRO' | 'TOUR';
    avatarUrl: string;
    homeCourse: string;
    stats: {
        roundsPlayed: number;
        avgScore: number;
        fairwaysHit: number; // percentage
        greensInRegulation: number; // percentage
        puttsPerRound: number;
    };
    bag: Club[];
    swingDNA: SwingDNA;
}

// Analysis Types

export type AnalysisStatus = 'IDLE' | 'RECORDING' | 'PROCESSING' | 'ANALYZING' | 'COMPLETE' | 'ERROR';

export type KeyframeType = 'ADDRESS' | 'TAKEAWAY' | 'TOP' | 'DOWNSWING' | 'IMPACT' | 'FOLLOW_THROUGH' | 'FINISH';

export interface Keyframe {
    id: string;
    type: KeyframeType;
    timestamp: number; // in seconds
    thumbnail?: string;
}

export type ToolType = 'POINTER' | 'LINE' | 'ANGLE' | 'CIRCLE' | 'RECT' | 'FREEHAND' | 'GRID' | 'SKELETON';
export type PlaybackSpeed = 0.1 | 0.25 | 0.5 | 1.0;

export interface SkeletonConfig {
    showArms: boolean;
    showLegs: boolean;
    showTorso: boolean;
    showHead: boolean;
}

export interface DrawnAnnotation {
    id: string;
    type: ToolType;
    points: { x: number; y: number }[]; // Normalized 0-1 coordinates
    color: string;
    strokeWidth: number;
}

export interface FeedbackMessage {
    id: string;
    timestamp: number; // Related to video timestamp
    text: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    category: 'POSTURE' | 'GRIP' | 'TEMPO' | 'PLANE' | 'ROTATION';
    correction?: string; // Drill ID or text
    audioUrl?: string; // Optional TTS override
}

export interface PoseLandmark {
    x: number;
    y: number;
    visibility: number;
    name: string;
}

export interface PoseFrame {
    timestamp: number;
    landmarks: PoseLandmark[];
}

export interface SwingAnalysis {
    id: string;
    date: Date;
    videoUrl: string;
    thumbnailUrl: string;
    clubUsed: ClubType;
    tags: string[]; // e.g. "Bunker", "Good Tempo"
    metrics: SwingMetrics;
    feedback: FeedbackMessage[];
    keyframes: Keyframe[];
    poseData?: PoseFrame[];
    annotations?: DrawnAnnotation[];
    score: number; // 0-100
}

// Learning Types

export interface DrillStep {
    order: number;
    text: string;
    duration?: number; // seconds
}

export interface Drill {
    id: string;
    title: string;
    description: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    category: 'PUTTING' | 'CHIPPING' | 'BUNKER' | 'SHORT_GAME' | 'FULL_SWING' | 'MENTAL'; // Reordered & Expanded
    steps: DrillStep[];
    thumbnailUrl: string;
    durationMinutes: number;
}

// Enhanced Course Types - Green to Tee Philosophy
export type CourseCategoryType = 'PUTTING' | 'CHIPPING' | 'PITCHING' | 'SAND' | 'IRON_PLAY' | 'LONG_GAME' | 'DRIVER' | 'QUANT_ANALYSIS';

export interface LessonResource {
    id: string;
    type: 'PDF' | 'LINK' | 'DRILL';
    title: string;
    url: string;
}

export interface CourseLesson {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    durationMinutes: number;
    completed: boolean;
    locked: boolean;
    keyTakeaways: string[];
    resources: LessonResource[];
    targetMetrics?: {
        label: string;
        value: string;
    }[];
}

export interface CourseModule {
    id: string;
    title: string;
    lessons: CourseLesson[];
}

export interface Course {
    id: string;
    title: string;
    subtitle: string;
    category: CourseCategoryType;
    description: string;
    thumbnailUrl: string;
    instructor: string;
    modules: CourseModule[];
    totalDuration: number;
    progress: number; // 0-100
    handicapImpact: number; // e.g. 2.5 strokes gained
    tagline: string; // e.g. "The Overture"
}

export interface LearningPath {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    courseIds: string[];
    totalCourses: number;
}

// Legacy compat
export interface Lesson extends CourseLesson {
    instructor: string;
    chapters: any[]; 
    thumbnailUrl: string;
    totalDuration: number;
    progress: number;
}

// Practice & Goals

export interface PracticeGoal {
    id: string;
    title: string; // e.g., "Speed Training"
    metric: keyof SwingMetrics; // e.g., "clubSpeed"
    targetValue: number;
    currentValue: number;
    unit: string;
    deadline?: Date;
    progress: number; // 0-100
}

export interface TrackManSession {
    id: string;
    date: Date;
    location: string;
    shotsHit: number;
    club: ClubType;
    avgMetrics: SwingMetrics;
    bestMetrics: SwingMetrics; // Personal Bests for this session
    consistencyScore: number; // 0-100, AI calculated dispersion
    notes: string;
}

// App State Types
export type Tab = 'HOME' | 'PRACTICE' | 'ANALYZE' | 'LEARN' | 'PROFILE';
export type AnalysisViewMode = 'CAMERA' | 'REVIEW' | 'COMPARISON';
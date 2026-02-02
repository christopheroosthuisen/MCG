
// Golf Domain Types

export type ClubCategory = 'PUTTER' | 'WEDGE' | 'IRON' | 'WOOD';
export type ClubType = 'PUTTER' | 'LW' | 'SW' | 'GW' | 'PW' | 'IRON-9' | 'IRON-8' | 'IRON-7' | 'IRON-6' | 'IRON-5' | 'IRON-4' | 'IRON-3' | 'HYBRID' | '5-WOOD' | '3-WOOD' | 'DRIVER';

export interface Club {
    id: string;
    name: string;
    category: ClubCategory;
    type: ClubType;
    brand?: string;
    model?: string;
    loft?: string;
    shaft?: string;
    purchaseDate?: Date;
    notes?: string;
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
    faceAngle?: number; 
    attackAngle?: number;
    launchDirection?: number;
    skidDistance?: number;
    rollDistance?: number;
}

// Data Import Types
export type ImportSource = 'ARCCOS' | '18BIRDIES' | 'GOLFSHOT' | 'THEGRINT' | 'HOLE19' | 'GOLFPAD' | 'SWINGU' | 'GOLFLOGIX' | 'GOLFPLAYED' | 'SHOTSCOPE' | 'MANUAL' | 'SHOT_DOCTOR';

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
    recommendedDrills: string[]; 
    recommendedCourseId?: string;
    reasoning: string;
}

// Bag of Shots Types
export type ShotLie = 'TEE' | 'FAIRWAY' | 'ROUGH' | 'BUNKER_FAIRWAY' | 'BUNKER_GREEN' | 'DIVOT';
export type ShotTrajectory = 'LOW' | 'STANDARD' | 'HIGH';

export interface BagShotSlot {
    id: string;
    title: string;
    distanceRange: string;
    lie: ShotLie;
    shape: ShotShape;
    trajectory: ShotTrajectory;
    isMastered: boolean;
    videoUrl?: string;
    masteryDate?: Date;
}

// User Profile Types

export interface SwingDNA {
    driverSpeed: number;
    ironCarry7: number;
    tempo: 'FAST' | 'MODERATE' | 'SMOOTH';
    typicalShape: ShotShape;
    handicap: number;
    dexterity: 'Right' | 'Left';
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
        fairwaysHit: number; 
        greensInRegulation: number; 
        puttsPerRound: number;
        streak: number; // New: Daily streak
    };
    bag: Club[];
    swingDNA: SwingDNA;
    coachId?: string;
    onboardingCompleted: boolean;
}

// Analysis Types

export type AnalysisStatus = 'IDLE' | 'SELECT_SOURCE' | 'PREVIEW' | 'RECORDING' | 'PROCESSING' | 'ANALYZING' | 'COMPLETE' | 'ERROR';

export type KeyframeType = 'ADDRESS' | 'TAKEAWAY' | 'TOP' | 'DOWNSWING' | 'IMPACT' | 'FOLLOW_THROUGH' | 'FINISH';

export interface Keyframe {
    id: string;
    type: KeyframeType;
    timestamp: number; 
    thumbnail?: string;
}

export type ToolType = 'POINTER' | 'LINE' | 'ANGLE' | 'CIRCLE' | 'RECT' | 'FREEHAND' | 'SKELETON';
export type PlaybackSpeed = 0.1 | 0.25 | 0.5 | 1.0;

export interface SkeletonConfig {
    showArms: boolean;
    showLegs: boolean;
    showTorso: boolean;
    showHead: boolean;
}

export interface Point {
    x: number;
    y: number;
}

export interface DrawnAnnotation {
    id: string;
    type: ToolType;
    points: Point[]; 
    color: string;
    strokeWidth: number;
    frameTimestamp?: number; // Optional: To show only on specific frames
}

export interface FeedbackMessage {
    id: string;
    timestamp: number; 
    text: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    category: 'POSTURE' | 'GRIP' | 'TEMPO' | 'PLANE' | 'ROTATION';
    correction?: string; 
    audioUrl?: string; 
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
    tags: string[]; 
    metrics: SwingMetrics;
    feedback: FeedbackMessage[];
    keyframes: Keyframe[];
    poseData?: PoseFrame[];
    annotations?: DrawnAnnotation[];
    score: number;
    folderId?: string;
}

// --- SWING LIBRARY TYPES ---

export interface SwingAngle {
    name: string;
    value: number;
    ideal?: number;
    tolerance?: number;
}

export interface KeyPosition {
    id: string;
    name: string;
    frameNumber: number;
    timestamp: number;
    angles: SwingAngle[];
    thumbnail?: string;
}

export interface Annotation {
    id: string;
    type: 'LINE' | 'CIRCLE' | 'ARROW' | 'ANGLE' | 'TEXT';
    frameNumber: number;
    points: { x: number; y: number }[];
    color: string;
    text?: string;
}

export interface SwingVideo {
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
    notes?: string;
    aiScore?: number;
}

export interface VideoFolder {
    id: string;
    name: string;
    color: string;
    videoCount: number;
    createdAt: Date;
}

export interface ProSwing {
    id: string;
    playerName: string;
    tournament?: string;
    club: string;
    angle: 'FACE_ON' | 'DOWN_THE_LINE';
    videoUrl: string;
    thumbnailUrl: string;
    keyMetrics: { name: string; value: string }[];
}

// Learning Types

export interface DrillStep {
    order: number;
    text: string;
    duration?: number; 
}

export interface Drill {
    id: string;
    title: string;
    description: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    category: 'PUTTING' | 'CHIPPING' | 'BUNKER' | 'SHORT_GAME' | 'FULL_SWING' | 'MENTAL';
    steps: DrillStep[];
    thumbnailUrl: string;
    durationMinutes: number;
}

export type CourseCategoryType = 'PUTTING' | 'CHIPPING' | 'PITCHING' | 'SAND' | 'SHORT_GAME' | 'IRON_PLAY' | 'LONG_GAME' | 'DRIVER' | 'QUANT_ANALYSIS';

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
    progress: number; 
    handicapImpact: number; 
    tagline: string;
}

export interface LearningPath {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    courseIds: string[];
    totalCourses: number;
}

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
    title: string; 
    metric: keyof SwingMetrics;
    targetValue: number;
    currentValue: number;
    unit: string;
    deadline?: Date;
    progress: number;
}

export interface TrackManSession {
    id: string;
    date: Date;
    location: string;
    shotsHit: number;
    club: ClubType;
    avgMetrics: SwingMetrics;
    bestMetrics: SwingMetrics;
    consistencyScore: number;
    notes: string;
}

// --- NEW PHASE 2 TYPES ---

// On-Course
export interface OnCourseRound {
    id: string;
    courseName: string;
    date: Date;
    score: number;
    par: number;
    holesPlayed: number;
    fairwaysHit: number;
    greensInRegulation: number;
    putts: number;
    isCompleted: boolean;
}

// Fitness
export interface Workout {
    id: string;
    title: string;
    category: 'STRENGTH' | 'FLEXIBILITY' | 'SPEED' | 'RECOVERY';
    duration: number; // minutes
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    thumbnailUrl: string;
    exercisesCount: number;
    completed?: boolean;
}

// Handicap
export interface HandicapRecord {
    id: string;
    date: Date;
    index: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    roundsIncluded: number;
}

// Coach
export interface CoachProfile {
    id: string;
    name: string;
    title: string;
    location: string;
    avatarUrl: string;
    specialty: string;
    rate: number;
}

// System Logs
export interface ActionLog {
    id: string;
    type: 'ADD_SWING' | 'ADD_SESSION' | 'UPDATE_GOAL' | 'COMPLETE_LESSON' | 'MASTER_SHOT' | 'AI_CHAT' | 'ROUND_COMPLETE' | 'WORKOUT_COMPLETE';
    timestamp: Date;
    details: any;
}

// --- NEW SOCIAL & STATS TYPES ---

export interface GolfFriend {
    id: string;
    name: string;
    avatarUrl?: string;
    handicap: number;
    homeCourse: string;
    status: 'ONLINE' | 'PLAYING' | 'OFFLINE';
    lastActive: Date;
    mutualFriends: number;
    roundsTogether: number;
}

export interface ActivityItem {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    type: 'ROUND' | 'ACHIEVEMENT' | 'PR' | 'CHALLENGE' | 'TOURNAMENT';
    timestamp: Date;
    data: any;
    likes: number;
    comments: number;
    hasLiked: boolean;
}

export interface Competition {
    id: string;
    type: 'STROKE' | 'MATCH' | 'STABLEFORD' | 'SKINS' | 'NASSAU' | 'WOLF';
    name: string;
    players: CompetitionPlayer[];
    status: 'SETUP' | 'IN_PROGRESS' | 'COMPLETE';
    currentHole: number;
    stakes?: string;
}

export interface CompetitionPlayer {
    id: string;
    name: string;
    avatarUrl?: string;
    handicap: number;
    score: number;
    thru: number;
    position: number;
}

export interface Tournament {
    id: string;
    name: string;
    description: string;
    format: string;
    startDate: Date;
    endDate: Date;
    entryFee?: number;
    prize?: string;
    participants: number;
    maxParticipants: number;
    status: 'UPCOMING' | 'ACTIVE' | 'COMPLETE';
    leaderboard: TournamentEntry[];
}

export interface TournamentEntry {
    rank: number;
    playerId: string;
    playerName: string;
    playerAvatar?: string;
    score: number;
    roundsPlayed: number;
    movement: 'UP' | 'DOWN' | 'SAME';
}

export interface ShareableScorecard {
    roundId: string;
    playerName: string;
    courseName: string;
    date: Date;
    score: number;
    par: number;
    highlights: string[];
    stats: {
        fairways: string;
        gir: string;
        putts: number;
    };
}

export interface StrokesGained {
    roundId: string;
    date: Date;
    courseName: string;
    offTheTee: number;
    approach: number;
    aroundGreen: number;
    putting: number;
    total: number;
    benchmarkHandicap: number;
    totalStrokes: number;
    coursePar: number;
}

export interface SGBenchmark {
    handicap: number;
    offTheTee: number;
    approach: number;
    aroundGreen: number;
    putting: number;
}

// --- SETTINGS & PREFERENCES TYPES ---

export type MeasurementUnit = 'yards' | 'meters';
export type TemperatureUnit = 'fahrenheit' | 'celsius';
export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'zh';
export type HandPreference = 'right' | 'left';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional';
export type SubscriptionTier = 'free' | 'premium' | 'pro';
export type PlayFrequency = 'rarely' | 'monthly' | 'weekly' | 'daily';

export interface AppPreferences {
  theme: ThemeMode;
  language: Language;
  distanceUnit: MeasurementUnit;
  temperatureUnit: TemperatureUnit;
  hapticFeedback: boolean;
  soundEffects: boolean;
  autoPlayVideos: boolean;
  defaultCamera: 'front' | 'back';
  videoQuality: 'low' | 'medium' | 'high';
  offlineMode: boolean;
  dataUsage: 'low' | 'standard' | 'unlimited';
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showHandicap: boolean;
  showScores: boolean;
  showLocation: boolean;
  shareAnalytics: boolean;
  personalizationData: boolean;
  marketingEmails: boolean;
  partnerOffers: boolean;
}

export interface LinkedAccount {
  provider: 'google' | 'apple' | 'facebook' | 'ghin' | 'trackman';
  email?: string;
  connected: boolean;
  lastSynced?: string;
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  renewalDate?: string;
  price?: number;
  billingCycle?: 'monthly' | 'annual';
  features: string[];
}

export interface GolfProfile {
  handicap: number;
  handicapIndex?: number;
  skillLevel: SkillLevel;
  handPreference: HandPreference;
  averageScore: number;
  drivingDistance: number;
  goals: string[];
  favoriteClub?: string;
  playFrequency: 'daily' | 'weekly' | 'monthly' | 'occasionally';
}

// --- ROUND REPLAY TYPES ---

export type ShotResult = 'FAIRWAY' | 'ROUGH' | 'BUNKER' | 'GREEN' | 'WATER' | 'OB' | 'FRINGE';
export type MissDirection = 'LEFT' | 'RIGHT' | 'SHORT' | 'LONG' | 'ON_TARGET';

export interface GeoLocation {
  lat: number;
  lng: number;
  elevation?: number;
}

export interface Shot {
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

export interface HoleScore {
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

export interface DetailedRound extends OnCourseRound {
  frontNine: number;
  backNine: number;
  courseRating: number;
  slopeRating: number;
  tees: string;
  holes: HoleScore[];
  stats: RoundStats;
  conditions?: PlayingConditions;
  totalScore: number;
}

export interface RoundStats {
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

export interface PlayingConditions {
  weather: 'SUNNY' | 'CLOUDY' | 'RAINY' | 'WINDY';
  temperature: number;
  windSpeed: number;
  windDirection: string;
  altitude: number;
  humidity: number;
}

export interface PatternData {
  club: string;
  missCount: { left: number; right: number; short: number; long: number };
  hitRate: number;
  avgDistance: number;
  totalShots: number;
}

export interface TrendAlert {
  id: string;
  type: 'WARNING' | 'INFO' | 'POSITIVE';
  category: string;
  message: string;
  rounds: number;
  stat: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// --- PUTTING LAB TYPES ---

export interface PuttingStats {
    puttsPerRound: number;
    oneFootMake: number; // percentage
    threeFootMake: number;
    sixFootMake: number;
    tenFootMake: number;
    fifteenFootMake: number;
    twentyFootMake: number;
    firstPuttProximity: number; // average feet from hole on lag putts
    threeputts: number; // per round
    totalPutts: number; // all time
    roundsTracked: number;
}

export interface GreenReading {
    slope: number; // percentage (2% = 2)
    direction: 'LEFT' | 'RIGHT' | 'UPHILL' | 'DOWNHILL' | 'UPHILL_LEFT' | 'UPHILL_RIGHT' | 'DOWNHILL_LEFT' | 'DOWNHILL_RIGHT';
    distance: number; // feet
    stimp: number; // green speed
    aimPoint: number; // inches to aim outside hole
    breakAmount: number; // total break in inches
}

export interface PuttingGame {
    id: string;
    name: string;
    description: string;
    rules: string[];
    icon: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

// --- ONBOARDING TYPES ---

export type OnboardingStep = 'welcome' | 'profile' | 'golf_info' | 'goals' | 'preferences' | 'tour' | 'complete';

export interface OnboardingData {
  firstName: string;
  lastName: string;
  email: string;
  skillLevel: SkillLevel;
  handPreference: HandPreference;
  playFrequency: PlayFrequency;
  yearsPlaying: number;
  goals: string[];
  focusAreas: string[];
  distanceUnit: 'yards' | 'meters';
  notifications: boolean;
  shareProgress: boolean;
  handicap?: number;
}

// --- NOTIFICATION TYPES ---

export type NotificationType = 'achievement' | 'reminder' | 'social' | 'tournament' | 'lesson' | 'weather' | 'practice' | 'system' | 'coaching' | 'milestone';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  status: NotificationStatus;
  priority: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
}

export interface NotificationPreference {
  type: NotificationType;
  enabled: boolean;
  push: boolean;
  email: boolean;
  inApp: boolean;
  sound: boolean;
  vibrate: boolean;
}

// --- ON COURSE TYPES ---

export interface Hazard {
  id: string;
  type: 'WATER' | 'BUNKER' | 'OB' | 'PENALTY_AREA';
  name: string;
  carryDistance: number;
  clearDistance: number;
  side: 'LEFT' | 'RIGHT' | 'CENTER' | 'FRONT';
  shape: GeoLocation[];
}

export interface LayupTarget {
  id: string;
  name: string;
  distance: number;
  location: GeoLocation;
  leavesDistance: number;
  isSafe: boolean;
}

export interface HoleData {
  number: number;
  par: number;
  yardage: number;
  handicapIndex: number;
  teeLocation: GeoLocation;
  greenCenter: GeoLocation;
  pinLocation: GeoLocation;
  hazards: Hazard[];
  layupTargets: LayupTarget[];
}

export interface ClubData {
  name: string;
  avgDistance: number;
  minDistance: number;
  maxDistance: number;
  dispersion: number;
}

export interface ClubSuggestion {
  club: string;
  confidence: number;
  adjustedDistance: number;
  reason: string;
  alternates: { club: string; reason: string }[];
}

export interface LiveShot {
  id: string;
  holeNumber: number;
  shotNumber: number;
  club: string;
  result?: 'FAIRWAY' | 'ROUGH' | 'GREEN' | 'BUNKER' | 'WATER' | 'OB';
  timestamp: Date;
}

export interface LiveRoundStats {
  fairwaysHit: number;
  fairwayAttempts: number;
  greensHit: number;
  greenAttempts: number;
  totalPutts: number;
  penalties: number;
}

export interface CaddieTip {
  id: string;
  type: 'STRATEGY' | 'WIND' | 'PIN' | 'MENTAL';
  title: string;
  message: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  icon: string;
}

// App State Types
export type Tab = 'HOME' | 'PRACTICE' | 'ANALYZE' | 'LEARN' | 'PROFILE' | 'SOCIAL';

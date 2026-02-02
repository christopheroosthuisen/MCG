
import { Drill, Lesson, SwingAnalysis, Course, PracticeGoal, TrackManSession, UserProfile, LearningPath, BagShotSlot, OnCourseRound, Workout, HandicapRecord, CoachProfile, SwingVideo, VideoFolder, ProSwing, GolfFriend, ActivityItem, Tournament, StrokesGained, AppPreferences, PrivacySettings, LinkedAccount, SubscriptionInfo, GolfProfile, DetailedRound, PatternData, TrendAlert, PuttingStats, PuttingGame, HoleScore, Shot, Notification, NotificationPreference, HoleData, PlayingConditions, ClubData, CaddieTip } from "./types";

export const COLORS = {
    primary: '#FF8200', // UT Orange
    secondary: '#115740', // Fairway Green
    white: '#FFFFFF',
    gray: '#4B4B4B',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    border: '#E5E7EB',
    dark: '#111827',
    videoControls: '#1F2937', // Dark gray for video UI
    premium: '#FFD700',
    // Stat specific colors
    driving: '#8B5CF6',
    approach: '#3B82F6',
    shortGame: '#22C55E',
    putting: '#F59E0B',
    birdie: '#22C55E',
    par: '#3B82F6',
    bogey: '#F59E0B',
    double: '#EF4444',
    water: '#3B82F6',
    bunker: '#D4A574',
};

export const SPACING = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
};

export const MOCK_USER_PROFILE: UserProfile = {
    id: 'u1',
    name: 'Tiger Woods',
    email: 'goat@pgatour.com',
    memberStatus: 'TOUR',
    avatarUrl: 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=400',
    homeCourse: 'Medalist Golf Club',
    onboardingCompleted: true,
    stats: {
        roundsPlayed: 14,
        avgScore: 68.2,
        fairwaysHit: 72,
        greensInRegulation: 78,
        puttsPerRound: 28.5,
        streak: 7
    },
    swingDNA: {
        driverSpeed: 122,
        ironCarry7: 178,
        tempo: 'FAST',
        typicalShape: 'FADE',
        handicap: +6.4,
        dexterity: 'Right',
        height: '6\' 1"'
    },
    bag: [
        { id: 'c1', name: 'Qi10 LS', category: 'WOOD', type: 'DRIVER', loft: '9.0°', shaft: 'Ventus Black 6X' },
        { id: 'c2', name: 'Qi10 Tour', category: 'WOOD', type: '3-WOOD', loft: '15.0°', shaft: 'Ventus Black 8X' },
        { id: 'c3', name: 'P770', category: 'IRON', type: 'IRON-3', shaft: 'Project X 6.5' },
        { id: 'c4', name: 'P7TW', category: 'IRON', type: 'IRON-4', shaft: 'Dynamic Gold X100' },
        { id: 'c5', name: 'P7TW', category: 'IRON', type: 'IRON-5', shaft: 'Dynamic Gold X100' },
        { id: 'c6', name: 'P7TW', category: 'IRON', type: 'IRON-6', shaft: 'Dynamic Gold X100' },
        { id: 'c7', name: 'P7TW', category: 'IRON', type: 'IRON-7', shaft: 'Dynamic Gold X100' },
        { id: 'c8', name: 'P7TW', category: 'IRON', type: 'IRON-8', shaft: 'Dynamic Gold X100' },
        { id: 'c9', name: 'P7TW', category: 'IRON', type: 'IRON-9', shaft: 'Dynamic Gold X100' },
        { id: 'c10', name: 'MG4', category: 'WEDGE', type: 'PW', loft: '48°', shaft: 'Dynamic Gold S400' },
        { id: 'c11', name: 'MG4', category: 'WEDGE', type: 'SW', loft: '56°', shaft: 'Dynamic Gold S400' },
        { id: 'c12', name: 'MG4', category: 'WEDGE', type: 'LW', loft: '60°', shaft: 'Dynamic Gold S400' },
        { id: 'c13', name: 'Newport 2 GSS', category: 'PUTTER', type: 'PUTTER', loft: '3.5°', shaft: 'Ping Blackout' }
    ]
};

export const MOCK_BAG_SLOTS: BagShotSlot[] = [
    {
        id: 'bs1',
        title: 'Stock 7 Iron',
        distanceRange: '172-175 yards',
        lie: 'FAIRWAY',
        shape: 'STRAIGHT',
        trajectory: 'STANDARD',
        isMastered: true,
        masteryDate: new Date('2023-11-15')
    },
    {
        id: 'bs2',
        title: 'Low Punch',
        distanceRange: '140-150 yards',
        lie: 'ROUGH',
        shape: 'DRAW',
        trajectory: 'LOW',
        isMastered: false
    },
    {
        id: 'bs3',
        title: 'High Flop',
        distanceRange: '20-30 yards',
        lie: 'ROUGH',
        shape: 'STRAIGHT',
        trajectory: 'HIGH',
        isMastered: true,
        masteryDate: new Date('2024-01-20')
    }
];

export const MOCK_LEARNING_PATHS: LearningPath[] = [
    {
        id: 'path1',
        title: 'Breaking 90',
        description: 'Complete guide to scoring better without changing your swing mechanics.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12db464?auto=format&fit=crop&q=80&w=600',
        courseIds: ['c1', 'c2'],
        totalCourses: 3
    },
    {
        id: 'path2',
        title: 'Elite Ball Striking',
        description: 'Learn to compress the ball like a tour pro.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1629210087796-749e7b243452?auto=format&fit=crop&q=80&w=600',
        courseIds: ['c3'],
        totalCourses: 2
    }
];

export const MOCK_COURSES: Course[] = [
    {
        id: 'c1',
        title: 'Driver Unleashed',
        subtitle: 'Add 20 Yards',
        category: 'DRIVER',
        description: 'Unlock your potential distance through ground force mechanics and optimized launch conditions.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=600',
        instructor: 'Dr. Sasho MacKenzie',
        modules: [
            {
                id: 'm1',
                title: 'Ground Force',
                lessons: [
                    {
                        id: 'l1',
                        title: 'Using the Ground',
                        description: 'Introduction to vertical force.',
                        videoUrl: '',
                        durationMinutes: 12,
                        completed: true,
                        locked: false,
                        keyTakeaways: ['Push down to go up', 'Timing is key'],
                        resources: []
                    }
                ]
            }
        ],
        totalDuration: 45,
        progress: 33,
        handicapImpact: 2.1,
        tagline: 'BOMB IT'
    },
    {
        id: 'c2',
        title: 'Short Game Wizardry',
        subtitle: 'Up & Down',
        category: 'SHORT_GAME',
        description: 'Master the wedges from 100 yards and in.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1592919505780-30395071e867?auto=format&fit=crop&q=80&w=600',
        instructor: 'Phil Mickelson',
        modules: [],
        totalDuration: 60,
        progress: 0,
        handicapImpact: 3.5,
        tagline: 'SAVE PAR'
    },
    {
        id: 'c3',
        title: 'Strokes Gained 101',
        subtitle: 'Math of Scoring',
        category: 'QUANT_ANALYSIS',
        description: 'Understand where you are actually losing strokes.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
        instructor: 'Mark Broadie',
        modules: [],
        totalDuration: 90,
        progress: 10,
        handicapImpact: 1.5,
        tagline: 'DATA DRIVEN'
    }
];

export const MOCK_DRILLS: Drill[] = [
    {
        id: 'd1',
        title: 'Gate Drill',
        description: 'Classic putting drill for start line control.',
        difficulty: 'BEGINNER',
        category: 'PUTTING',
        steps: [{ order: 1, text: 'Place two tees just wider than putter head.' }],
        thumbnailUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=400',
        durationMinutes: 15
    },
    {
        id: 'd2',
        title: 'Clock Drill',
        description: 'Pressure putting from 3, 6, and 9 feet.',
        difficulty: 'INTERMEDIATE',
        category: 'PUTTING',
        steps: [],
        thumbnailUrl: 'https://images.unsplash.com/photo-1622602737677-4b711979b939?auto=format&fit=crop&q=80&w=400',
        durationMinutes: 20
    }
];

export const MOCK_LESSONS: Lesson[] = [];

export const MOCK_RECENT_SWINGS: SwingAnalysis[] = [
    {
        id: 's1',
        date: new Date(Date.now() - 86400000),
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=400',
        clubUsed: 'DRIVER',
        tags: ['Power', 'Range'],
        metrics: { clubSpeed: 118, carryDistance: 295 },
        feedback: [],
        keyframes: [],
        score: 92
    },
    {
        id: 's2',
        date: new Date(Date.now() - 172800000),
        videoUrl: '',
        thumbnailUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12db464?auto=format&fit=crop&q=80&w=400',
        clubUsed: 'IRON-7',
        tags: ['Tempo'],
        metrics: { clubSpeed: 92, carryDistance: 175 },
        feedback: [],
        keyframes: [],
        score: 85
    }
];

export const MOCK_GOALS: PracticeGoal[] = [
    {
        id: 'g1',
        title: 'Increase Driver Speed',
        metric: 'clubSpeed',
        targetValue: 125,
        currentValue: 118,
        unit: 'mph',
        deadline: new Date('2024-06-01'),
        progress: 65
    }
];

export const MOCK_SESSIONS: TrackManSession[] = [
    {
        id: 'ts1',
        date: new Date(Date.now() - 86400000 * 2),
        location: 'Indoor Lab',
        shotsHit: 45,
        club: 'DRIVER',
        avgMetrics: { clubSpeed: 116, spinRate: 2400 },
        bestMetrics: { clubSpeed: 119 },
        consistencyScore: 88,
        notes: 'Feeling fast today.'
    }
];

export const MOCK_ROUNDS: OnCourseRound[] = [
    {
        id: 'r1',
        courseName: 'Pebble Beach',
        date: new Date(Date.now() - 86400000 * 3),
        score: 74,
        par: 72,
        holesPlayed: 18,
        fairwaysHit: 9,
        greensInRegulation: 12,
        putts: 31,
        isCompleted: true
    }
];

export const MOCK_WORKOUTS: Workout[] = [
    {
        id: 'w1',
        title: 'Rotational Power',
        category: 'SPEED',
        duration: 45,
        difficulty: 'ADVANCED',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400',
        exercisesCount: 8,
        completed: false
    }
];

export const MOCK_HANDICAP_HISTORY: HandicapRecord[] = [
    { id: 'h1', date: new Date('2024-01-01'), index: 5.4, trend: 'STABLE', roundsIncluded: 20 },
    { id: 'h2', date: new Date('2024-02-01'), index: 4.8, trend: 'DOWN', roundsIncluded: 20 },
    { id: 'h3', date: new Date('2024-03-01'), index: 4.2, trend: 'DOWN', roundsIncluded: 20 }
];

export const MOCK_COACH: CoachProfile = {
    id: 'coach1',
    name: 'Butch Harmon',
    title: 'Swing Consultant',
    location: 'Las Vegas, NV',
    avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
    specialty: 'Full Swing',
    rate: 500
};

export const MOCK_SWING_VIDEOS: SwingVideo[] = [
    {
        id: 'sv1',
        recordedAt: new Date(Date.now() - 86400000),
        club: 'DRIVER',
        angle: 'FACE_ON',
        duration: 3.2,
        thumbnailUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=400',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        tags: ['Speed Training'],
        rating: 4,
        keyPositions: [
            { id: 'kp1', name: 'Top', frameNumber: 45, timestamp: 1.5, angles: [{ name: 'Shoulder Turn', value: 95, ideal: 90 }] }
        ],
        annotations: [],
        aiScore: 88
    },
    {
        id: 'sv2',
        recordedAt: new Date(Date.now() - 172800000),
        club: 'IRON-7',
        angle: 'DOWN_THE_LINE',
        duration: 3.5,
        thumbnailUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12db464?auto=format&fit=crop&q=80&w=400',
        videoUrl: '',
        tags: ['Tempo'],
        rating: 5,
        keyPositions: [],
        annotations: [],
        aiScore: 92
    }
];

export const MOCK_FOLDERS: VideoFolder[] = [
    { id: 'f1', name: 'Driver Swings', color: '#FF8200', videoCount: 12, createdAt: new Date() },
    { id: 'f2', name: 'Wedge Play', color: '#10B981', videoCount: 8, createdAt: new Date() }
];

export const MOCK_PRO_SWINGS: ProSwing[] = [
    {
        id: 'pro1',
        playerName: 'Rory McIlroy',
        club: 'DRIVER',
        angle: 'FACE_ON',
        videoUrl: '',
        thumbnailUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
        keyMetrics: [{ name: 'Shoulder Turn', value: '110°' }]
    },
    {
        id: 'pro2',
        playerName: 'Tiger Woods',
        club: 'IRON-7',
        angle: 'DOWN_THE_LINE',
        videoUrl: '',
        thumbnailUrl: 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=200',
        keyMetrics: [{ name: 'Plane', value: 'Neutral' }]
    }
];

export const MOCK_FRIENDS: GolfFriend[] = [
    {
        id: 'f1',
        name: 'Jordan Spieth',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
        handicap: 0.2,
        homeCourse: 'Brook Hollow',
        status: 'PLAYING',
        lastActive: new Date(),
        mutualFriends: 12,
        roundsTogether: 8
    },
    {
        id: 'f2',
        name: 'Rory McIlroy',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
        handicap: 0.5,
        homeCourse: 'Royal County Down',
        status: 'ONLINE',
        lastActive: new Date(Date.now() - 3600000),
        mutualFriends: 8,
        roundsTogether: 3
    },
    {
        id: 'f3',
        name: 'Scottie Scheffler',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        handicap: 0.1,
        homeCourse: 'Royal Oaks',
        status: 'OFFLINE',
        lastActive: new Date(Date.now() - 86400000),
        mutualFriends: 5,
        roundsTogether: 1
    }
];

export const MOCK_ACTIVITY: ActivityItem[] = [
    {
        id: 'a1',
        userId: 'f1',
        userName: 'Jordan Spieth',
        userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
        type: 'ROUND',
        timestamp: new Date(Date.now() - 3600000),
        data: { score: 68, course: 'Colonial CC', par: 70 },
        likes: 24,
        comments: 5,
        hasLiked: false
    },
    {
        id: 'a2',
        userId: 'f2',
        userName: 'Rory McIlroy',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
        type: 'ACHIEVEMENT',
        timestamp: new Date(Date.now() - 86400000),
        data: { achievement: '30-Day Streak', description: 'Practiced for 30 days straight!' },
        likes: 42,
        comments: 12,
        hasLiked: true
    },
    {
        id: 'a3',
        userId: 'f3',
        userName: 'Scottie Scheffler',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        type: 'PR',
        timestamp: new Date(Date.now() - 172800000),
        data: { metric: 'Driver Distance', oldValue: 295, newValue: 302 },
        likes: 18,
        comments: 3,
        hasLiked: false
    }
];

export const MOCK_TOURNAMENTS: Tournament[] = [
    {
        id: 't1',
        name: 'MCG Weekly Challenge',
        description: 'Post your best 18-hole score this week',
        format: 'Stroke Play (Net)',
        startDate: new Date(),
        endDate: new Date(Date.now() + 604800000),
        participants: 128,
        maxParticipants: 256,
        status: 'ACTIVE',
        leaderboard: [
            { rank: 1, playerId: 'p1', playerName: 'Mike Johnson', score: -4, roundsPlayed: 2, movement: 'UP' },
            { rank: 2, playerId: 'p2', playerName: 'Sarah Davis', score: -3, roundsPlayed: 1, movement: 'SAME' },
            { rank: 3, playerId: 'p3', playerName: 'Tom Wilson', score: -2, roundsPlayed: 2, movement: 'DOWN' }
        ]
    },
    {
        id: 't2',
        name: 'Short Game Showdown',
        description: 'Best Up & Down percentage wins',
        format: 'Skills Challenge',
        startDate: new Date(Date.now() + 86400000 * 3),
        endDate: new Date(Date.now() + 86400000 * 10),
        entryFee: 10,
        prize: '$500 Pro Shop Credit',
        participants: 64,
        maxParticipants: 128,
        status: 'UPCOMING',
        leaderboard: []
    }
];

export const MOCK_SG_HISTORY: StrokesGained[] = [
    {
        roundId: 'r1',
        date: new Date(Date.now() - 86400000 * 1),
        courseName: 'Medalist Golf Club',
        offTheTee: 0.8,
        approach: -0.5,
        aroundGreen: 0.3,
        putting: -0.2,
        total: 0.4,
        benchmarkHandicap: 5,
        totalStrokes: 74,
        coursePar: 72
    },
    {
        roundId: 'r2',
        date: new Date(Date.now() - 86400000 * 4),
        courseName: 'PGA National',
        offTheTee: 0.5,
        approach: 1.2,
        aroundGreen: -0.3,
        putting: 0.5,
        total: 1.9,
        benchmarkHandicap: 5,
        totalStrokes: 71,
        coursePar: 72
    },
    {
        roundId: 'r3',
        date: new Date(Date.now() - 86400000 * 8),
        courseName: 'Seminole',
        offTheTee: -0.3,
        approach: 0.2,
        aroundGreen: 0.8,
        putting: -0.8,
        total: -0.1,
        benchmarkHandicap: 5,
        totalStrokes: 75,
        coursePar: 72
    },
    {
        roundId: 'r4',
        date: new Date(Date.now() - 86400000 * 12),
        courseName: 'Bear\'s Club',
        offTheTee: 1.2,
        approach: 0.6,
        aroundGreen: 0.2,
        putting: 0.3,
        total: 2.3,
        benchmarkHandicap: 5,
        totalStrokes: 70,
        coursePar: 72
    },
    {
        roundId: 'r5',
        date: new Date(Date.now() - 86400000 * 16),
        courseName: 'Medalist Golf Club',
        offTheTee: 0.1,
        approach: -1.2,
        aroundGreen: 0.5,
        putting: -0.5,
        total: -1.1,
        benchmarkHandicap: 5,
        totalStrokes: 77,
        coursePar: 72
    }
];

export const MOCK_GOLF_PROFILE: GolfProfile = {
  handicap: 12.4,
  handicapIndex: 12.4,
  skillLevel: 'intermediate',
  handPreference: 'right',
  averageScore: 84,
  drivingDistance: 245,
  goals: ['Break 80', 'Hit more fairways', 'Improve putting'],
  favoriteClub: '7 Iron',
  playFrequency: 'weekly',
};

export const MOCK_PREFERENCES: AppPreferences = {
  theme: 'system',
  language: 'en',
  distanceUnit: 'yards',
  temperatureUnit: 'fahrenheit',
  hapticFeedback: true,
  soundEffects: true,
  autoPlayVideos: true,
  defaultCamera: 'back',
  videoQuality: 'high',
  offlineMode: false,
  dataUsage: 'standard',
};

export const MOCK_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibility: 'friends',
  showHandicap: true,
  showScores: true,
  showLocation: false,
  shareAnalytics: true,
  personalizationData: true,
  marketingEmails: false,
  partnerOffers: false,
};

export const MOCK_LINKED_ACCOUNTS: LinkedAccount[] = [
  { provider: 'google', email: 'john.doe@gmail.com', connected: true, lastSynced: '2025-07-15T10:00:00' },
  { provider: 'apple', connected: false },
  { provider: 'ghin', email: 'johndoe', connected: true, lastSynced: '2025-07-14T18:00:00' },
  { provider: 'trackman', connected: false },
];

export const MOCK_SUBSCRIPTION: SubscriptionInfo = {
  tier: 'premium',
  status: 'active',
  startDate: '2024-01-15',
  renewalDate: '2025-01-15',
  price: 9.99,
  billingCycle: 'monthly',
  features: [
    'Unlimited swing analysis',
    'AI coaching insights',
    'Advanced statistics',
    'No ads',
    'Priority support',
  ],
};

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
      result: ['FAIRWAY', 'ROUGH', 'GREEN', 'BUNKER'][Math.floor(Math.random() * 4)] as any,
      shape: ['STRAIGHT', 'FADE', 'DRAW'][Math.floor(Math.random() * 3)] as any,
      missDirection: ['ON_TARGET', 'LEFT', 'RIGHT'][Math.floor(Math.random() * 3)] as any,
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

export const MOCK_DETAILED_ROUND: DetailedRound = {
  id: 'round-1',
  courseName: 'TPC Scottsdale',
  date: new Date('2024-03-20'),
  tees: 'Blue',
  courseRating: 72.1,
  slopeRating: 131,
  totalScore: 82,
  score: 82,
  par: 72,
  holesPlayed: 18,
  isCompleted: true,
  putts: 32,
  fairwaysHit: 8,
  greensInRegulation: 9,
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
    altitude: 1200,
    humidity: 25
  },
};

export const MOCK_COMPARISON_DETAILED_ROUND: DetailedRound = {
  ...MOCK_DETAILED_ROUND,
  id: 'round-2',
  date: new Date('2024-02-15'),
  totalScore: 86,
  frontNine: 43,
  backNine: 43,
  holes: generateMockHoles(),
  stats: {
    ...MOCK_DETAILED_ROUND.stats,
    fairwaysHit: 6,
    greensInRegulation: 7,
    totalPutts: 34,
    birdiesOrBetter: 1,
    bogeys: 8,
    doubleBogeyOrWorse: 3,
  },
};

export const MOCK_PATTERN_DATA: PatternData[] = [
  { club: 'Driver', missCount: { left: 8, right: 12, short: 2, long: 3 }, hitRate: 58, avgDistance: 248, totalShots: 42 },
  { club: '3 Wood', missCount: { left: 4, right: 6, short: 3, long: 1 }, hitRate: 52, avgDistance: 218, totalShots: 28 },
  { club: '5 Iron', missCount: { left: 6, right: 4, short: 5, long: 2 }, hitRate: 48, avgDistance: 178, totalShots: 35 },
  { club: '7 Iron', missCount: { left: 3, right: 5, short: 4, long: 3 }, hitRate: 62, avgDistance: 158, totalShots: 52 },
  { club: 'PW', missCount: { left: 2, right: 3, short: 6, long: 4 }, hitRate: 68, avgDistance: 122, totalShots: 45 },
];

export const MOCK_TREND_ALERTS: TrendAlert[] = [
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

export const MOCK_PUTTING_STATS: PuttingStats = {
    puttsPerRound: 28.5,
    oneFootMake: 99,
    threeFootMake: 95,
    sixFootMake: 72,
    tenFootMake: 45,
    fifteenFootMake: 22,
    twentyFootMake: 12,
    firstPuttProximity: 3.2,
    threeputts: 0.8,
    totalPutts: 1247,
    roundsTracked: 44
};

export const TOUR_AVERAGES: PuttingStats = {
    puttsPerRound: 29.0,
    oneFootMake: 99.8,
    threeFootMake: 96.5,
    sixFootMake: 75,
    tenFootMake: 50,
    fifteenFootMake: 30,
    twentyFootMake: 17,
    firstPuttProximity: 2.8,
    threeputts: 0.3,
    totalPutts: 0,
    roundsTracked: 0
};

export const PUTTING_GAMES: PuttingGame[] = [
    {
        id: 'horse',
        name: 'H-O-R-S-E',
        description: 'Classic match play putting game',
        rules: [
            'Opponent chooses putt distance and line',
            'If they make it, you must match it',
            'Miss and you get a letter',
            'First to spell HORSE loses'
        ],
        icon: '🐴',
        difficulty: 'MEDIUM'
    },
    {
        id: 'around-world',
        name: 'Around the World',
        description: 'Make putts from every direction',
        rules: [
            'Set up balls at 8 positions around hole at 4 feet',
            'Make all 8 in a row to complete',
            'Miss and restart from position 1',
            'Track best streak'
        ],
        icon: '🌍',
        difficulty: 'HARD'
    },
    {
        id: 'pressure-putt',
        name: 'Pressure Putt Pro',
        description: 'Simulate tournament pressure',
        rules: [
            '5 putts from increasing distances (3, 5, 7, 9, 12 ft)',
            'Each putt worth increasing points',
            'Miss any putt and game ends',
            'Target: Complete all 5'
        ],
        icon: '🎯',
        difficulty: 'HARD'
    },
    {
        id: 'ladder',
        name: 'Putting Ladder',
        description: 'Master distance control',
        rules: [
            'Putts from 3, 6, 9, 12, 15 feet',
            'Must make each distance to advance',
            '3 attempts per distance',
            'Track highest rung reached'
        ],
        icon: '🪜',
        difficulty: 'MEDIUM'
    }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'achievement',
    title: 'New Achievement Unlocked!',
    message: 'You\'ve completed 50 practice sessions. Keep up the great work!',
    timestamp: '2025-07-15T10:30:00',
    status: 'unread',
    priority: 'medium',
    actionUrl: '/achievements',
    actionLabel: 'View Achievement',
  },
  {
    id: 'n2',
    type: 'tournament',
    title: 'Tournament Registration Open',
    message: 'The Summer Championship is now accepting registrations. Limited spots available!',
    timestamp: '2025-07-15T09:00:00',
    status: 'unread',
    priority: 'high',
    actionUrl: '/tournaments/summer-championship',
    actionLabel: 'Register Now',
  },
  {
    id: 'n3',
    type: 'weather',
    title: 'Weather Alert',
    message: 'Rain expected at 2 PM for your tee time at Pebble Beach. Consider rescheduling.',
    timestamp: '2025-07-15T08:00:00',
    status: 'unread',
    priority: 'urgent',
    actionUrl: '/tee-times',
    actionLabel: 'View Options',
  },
  {
    id: 'n4',
    type: 'coaching',
    title: 'AI Coach Insight',
    message: 'Based on your recent rounds, focusing on short game could save you 3-4 strokes per round.',
    timestamp: '2025-07-14T18:00:00',
    status: 'read',
    priority: 'medium',
    actionUrl: '/coach',
    actionLabel: 'Start Drill',
  },
];

export const MOCK_HOLE: HoleData = {
  number: 7,
  par: 4,
  yardage: 425,
  handicapIndex: 3,
  teeLocation: { lat: 33.45, lng: -111.94, elevation: 1200 },
  greenCenter: { lat: 33.455, lng: -111.935, elevation: 1210 },
  pinLocation: { lat: 33.4552, lng: -111.9348, elevation: 1210 },
  hazards: [
    {
      id: 'haz-1',
      type: 'WATER',
      name: 'Lake - Left',
      carryDistance: 220,
      clearDistance: 250,
      side: 'LEFT',
      shape: [],
    },
    {
      id: 'haz-2',
      type: 'BUNKER',
      name: 'Fairway Bunker - Right',
      carryDistance: 245,
      clearDistance: 265,
      side: 'RIGHT',
      shape: [],
    },
    {
      id: 'haz-3',
      type: 'BUNKER',
      name: 'Greenside Bunker',
      carryDistance: 410,
      clearDistance: 420,
      side: 'FRONT',
      shape: [],
    },
  ],
  layupTargets: [
    {
      id: 'layup-1',
      name: 'Safe Layup',
      distance: 210,
      location: { lat: 33.452, lng: -111.938, elevation: 1205 },
      leavesDistance: 165,
      isSafe: true,
    },
    {
      id: 'layup-2',
      name: 'Aggressive',
      distance: 255,
      location: { lat: 33.453, lng: -111.937, elevation: 1207 },
      leavesDistance: 120,
      isSafe: false,
    },
  ],
};

export const MOCK_CONDITIONS: PlayingConditions = {
  weather: 'SUNNY',
  temperature: 72,
  windSpeed: 12,
  windDirection: 'NW',
  altitude: 1200,
  humidity: 35,
};

export const MOCK_CLUBS: ClubData[] = [
  { name: 'Driver', avgDistance: 255, minDistance: 240, maxDistance: 275, dispersion: 28 },
  { name: '3 Wood', avgDistance: 230, minDistance: 215, maxDistance: 245, dispersion: 22 },
  { name: '5 Wood', avgDistance: 210, minDistance: 195, maxDistance: 225, dispersion: 20 },
  { name: '4 Hybrid', avgDistance: 195, minDistance: 185, maxDistance: 210, dispersion: 18 },
  { name: '5 Iron', avgDistance: 180, minDistance: 170, maxDistance: 190, dispersion: 16 },
  { name: '6 Iron', avgDistance: 168, minDistance: 160, maxDistance: 178, dispersion: 14 },
  { name: '7 Iron', avgDistance: 155, minDistance: 148, maxDistance: 165, dispersion: 12 },
  { name: '8 Iron', avgDistance: 143, minDistance: 136, maxDistance: 152, dispersion: 10 },
  { name: '9 Iron', avgDistance: 130, minDistance: 124, maxDistance: 138, dispersion: 9 },
  { name: 'PW', avgDistance: 118, minDistance: 112, maxDistance: 126, dispersion: 8 },
  { name: 'GW', avgDistance: 105, minDistance: 98, maxDistance: 112, dispersion: 8 },
  { name: 'SW', avgDistance: 90, minDistance: 82, maxDistance: 98, dispersion: 10 },
  { name: 'LW', avgDistance: 75, minDistance: 65, maxDistance: 85, dispersion: 12 },
];

export const MOCK_CADDIE_TIPS: CaddieTip[] = [
  {
    id: 'tip-1',
    type: 'STRATEGY',
    title: 'Play for Position',
    message: "With water left, aim right-center of fairway. A 230-yard shot leaves you a comfortable 9-iron in.",
    priority: 'HIGH',
    icon: '🎯',
  },
  {
    id: 'tip-2',
    type: 'WIND',
    title: 'Wind Adjustment',
    message: 'NW wind at 12 mph - add 8 yards and aim slightly left.',
    priority: 'MEDIUM',
    icon: '💨',
  },
  {
    id: 'tip-3',
    type: 'PIN',
    title: 'Pin Position',
    message: 'Pin is back-left, tucked behind bunker. Safer play is center-right of green.',
    priority: 'MEDIUM',
    icon: '📍',
  },
  {
    id: 'tip-4',
    type: 'MENTAL',
    title: 'Trust Your Swing',
    message: "You've hit this club well today. Commit to your target and make a confident swing.",
    priority: 'LOW',
    icon: '💪',
  },
];

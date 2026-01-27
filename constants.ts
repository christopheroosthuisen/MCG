import { Drill, Lesson, SwingAnalysis, Course, PracticeGoal, TrackManSession, UserProfile, LearningPath } from "./types";

export const COLORS = {
    primary: '#FF8200', // UT Orange
    secondary: '#115740', // Fairway Green
    white: '#FFFFFF',
    gray: '#4B4B4B',
    background: '#F5F5F7',
    surface: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    border: '#E5E7EB',
    dark: '#111827',
    videoControls: '#1F2937' // Dark gray for video UI
};

export const SPACING = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
};

export const RADIUS = {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
};

// --- USER PROFILE ---

export const MOCK_USER_PROFILE: UserProfile = {
    id: 'u1',
    name: 'Tiger Woods',
    email: 'goat@pgatour.com',
    memberStatus: 'TOUR',
    avatarUrl: 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=400',
    homeCourse: 'Medalist Golf Club',
    stats: {
        roundsPlayed: 14,
        avgScore: 68.2,
        fairwaysHit: 72,
        greensInRegulation: 78,
        puttsPerRound: 28.5
    },
    swingDNA: {
        driverSpeed: 122,
        ironCarry7: 178,
        tempo: 'FAST',
        typicalShape: 'FADE',
        handicap: +6.4,
        dexterity: 'RIGHT',
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

// --- LEARNING CONTENT ---

export const MOCK_LEARNING_PATHS: LearningPath[] = [
    {
        id: 'p1',
        title: 'The Short Game Specialist',
        description: 'Master the art of scoring from 100 yards and in.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1629210087796-749e7b243452?auto=format&fit=crop&q=80&w=800',
        courseIds: ['c7', 'c5', 'c6'],
        totalCourses: 3
    },
    {
        id: 'p2',
        title: 'The Data Analyst',
        description: 'Learn to read TrackMan numbers and optimize your flight.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
        courseIds: ['q1', 'q2'],
        totalCourses: 2
    },
    {
        id: 'p3',
        title: 'The Ball Striker',
        description: 'Compress the ball and control trajectory with your irons.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1535132011086-b8818f016104?auto=format&fit=crop&q=80&w=800',
        courseIds: ['c3', 'c1'],
        totalCourses: 2
    }
];

export const MOCK_COURSES: Course[] = [
    // ... Existing Courses ...
    {
        id: 'c7',
        title: 'Putting Mastery',
        subtitle: 'The Cadence of Scoring',
        tagline: 'Movement I: The Green',
        category: 'PUTTING',
        description: 'Speed, read, and start line. 40% of your strokes happen here. Master the data behind the most important club in the bag.',
        instructor: 'Joe Mayo',
        thumbnailUrl: 'https://images.unsplash.com/photo-1629210087796-749e7b243452?auto=format&fit=crop&q=80&w=800', 
        totalDuration: 60,
        progress: 45,
        handicapImpact: 4.5,
        modules: [
            {
                id: 'm7-1',
                title: 'Start Line Control',
                lessons: [
                    {
                         id: 'l7-1-1',
                         title: 'The Gate Drill',
                         description: 'Ensuring your ball starts on the intended line every time.',
                         videoUrl: '',
                         durationMinutes: 12,
                         completed: true,
                         locked: false,
                         keyTakeaways: ['Face angle at impact accounts for 90% of start direction', 'Eye position affects aim'],
                         resources: [],
                         targetMetrics: [{ label: 'Launch Dir', value: '< 0.5°' }]
                    }
                ]
            }
        ]
    },
    {
        id: 'c5',
        title: 'Chipping Artistry',
        subtitle: 'Rhythm & Flow',
        tagline: 'Movement II: The Fringe',
        category: 'CHIPPING',
        description: 'Around the green artistry. Simplify your technique to eliminate double bogeys and save par from anywhere.',
        instructor: 'Joe Mayo',
        thumbnailUrl: 'https://images.unsplash.com/photo-1615112189490-6750059c994f?auto=format&fit=crop&q=80&w=800',
        totalDuration: 30,
        progress: 10,
        handicapImpact: 3.0,
        modules: []
    },
    {
        id: 'c6',
        title: 'Bunker Play',
        subtitle: 'Texture & Splash',
        tagline: 'Movement III: The Sand',
        category: 'SAND',
        description: 'Understanding bounce and sand interaction. Turn fear into confidence with proper setup and release.',
        instructor: 'Joe Mayo',
        thumbnailUrl: 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=80&w=800',
        totalDuration: 25,
        progress: 0,
        handicapImpact: 1.2,
        modules: []
    },
    {
        id: 'c4',
        title: 'Pitching',
        subtitle: 'Control & Trajectory',
        tagline: 'Movement IV: The Wedge',
        category: 'PITCHING',
        description: 'From 30 to 80 yards. Learn to modulate spin and flight for pin-point accuracy using the "Clock System".',
        instructor: 'Joe Mayo',
        thumbnailUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800',
        totalDuration: 40,
        progress: 0,
        handicapImpact: 2.5,
        modules: []
    },
    {
        id: 'c3',
        title: 'Iron Play',
        subtitle: 'The Heart of the Round',
        tagline: 'Movement V: The Approach',
        category: 'IRON_PLAY',
        description: 'Reliability and repeatability. The movements required to hit greens from 150-175 yards.',
        instructor: 'Joe Mayo',
        thumbnailUrl: 'https://images.unsplash.com/photo-1535132011086-b8818f016104?auto=format&fit=crop&q=80&w=800',
        totalDuration: 50,
        progress: 0,
        handicapImpact: 1.8,
        modules: []
    },
    {
        id: 'c1',
        title: 'Driving',
        subtitle: 'Maximum Distance',
        tagline: 'Movement VI: The Tee',
        category: 'DRIVER',
        description: 'Set the tone for your round. Master the optimized launch conditions required for modern driving performance.',
        instructor: 'Joe Mayo',
        thumbnailUrl: 'https://images.unsplash.com/photo-1591123720664-325d62597771?auto=format&fit=crop&q=80&w=800',
        totalDuration: 45,
        progress: 0,
        handicapImpact: 2.1,
        modules: []
    },
    // --- QUANT COURSES ---
    {
        id: 'q1',
        title: 'Intro to Ball Flight Physics',
        subtitle: 'The Science of the D-Plane',
        tagline: 'Quant Lab I',
        category: 'QUANT_ANALYSIS',
        description: 'Understand the D-Plane, Spin Axis, and why the ball curves. Essential for diagnosing your own misses.',
        instructor: 'Dr. Sasho MacKenzie',
        thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800', // Abstract/Tech
        totalDuration: 55,
        progress: 0,
        handicapImpact: 1.5,
        modules: []
    },
    {
        id: 'q2',
        title: 'Strokes Gained 101',
        subtitle: 'Smart Strategy',
        tagline: 'Quant Lab II',
        category: 'QUANT_ANALYSIS',
        description: 'Stop aiming at flags. Learn how strokes gained data should dictate your course management strategy.',
        instructor: 'Mark Broadie',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800', // Graph/Chart
        totalDuration: 40,
        progress: 0,
        handicapImpact: 3.2,
        modules: []
    }
];

export const MOCK_DRILLS: Drill[] = [
    {
        id: '3',
        title: 'Gate Putting',
        description: 'Improve your start line accuracy on the greens.',
        difficulty: 'ADVANCED',
        category: 'PUTTING',
        thumbnailUrl: 'https://images.unsplash.com/photo-1631116618155-6074e787a30b?auto=format&fit=crop&q=80&w=800',
        durationMinutes: 20,
        steps: [
            { order: 1, text: 'Place two tees just wider than the putter head.' },
            { order: 2, text: 'Place two more tees 1 foot in front to create a gate.' },
            { order: 3, text: 'Putt through both gates without touching tees.' }
        ]
    },
    {
        id: 'd-putt-2',
        title: 'The Clock Drill',
        description: 'Simulate pressure putting from 3, 6, and 9 feet around the hole.',
        difficulty: 'INTERMEDIATE',
        category: 'PUTTING',
        thumbnailUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12db464?auto=format&fit=crop&q=80&w=800',
        durationMinutes: 15,
        steps: [
            { order: 1, text: 'Place balls at 12, 3, 6, and 9 o\'clock positions at 3 feet.' },
            { order: 2, text: 'Make all 4 in a row. If you miss, restart.' },
            { order: 3, text: 'Move back to 4 feet and repeat.' }
        ]
    },
    {
        id: '4',
        title: 'The Towel Drill',
        description: 'Low point control for consistent chipping. Eliminates chunks and skulls.',
        difficulty: 'BEGINNER',
        category: 'CHIPPING',
        thumbnailUrl: 'https://images.unsplash.com/photo-1596547608848-3601569427db?auto=format&fit=crop&q=80&w=800',
        durationMinutes: 10,
        steps: [
            { order: 1, text: 'Place a small towel 4 inches behind the ball.' },
            { order: 2, text: 'Hit chip shots without disturbing the towel.' },
            { order: 3, text: 'Focus on weight forward setup.' }
        ]
    },
    {
        id: 'd-chip-2',
        title: 'Landing Spot Ladder',
        description: 'Develop touch and distance control for chip shots.',
        difficulty: 'ADVANCED',
        category: 'CHIPPING',
        thumbnailUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800',
        durationMinutes: 20,
        steps: [
            { order: 1, text: 'Place towels at 10, 20, and 30 feet.' },
            { order: 2, text: 'Land the ball on the first towel.' },
            { order: 3, text: 'Progress to the next only after success.' }
        ]
    },
    {
        id: 'd-bunker-1',
        title: 'The Line in the Sand',
        description: 'Learn to strike the sand in the correct spot every time for consistent splashes.',
        difficulty: 'BEGINNER',
        category: 'BUNKER',
        thumbnailUrl: 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=80&w=800',
        durationMinutes: 15,
        steps: [
            { order: 1, text: 'Draw a line in the sand perpendicular to your target.' },
            { order: 2, text: 'Practice straddling the line and striking 2 inches behind it.' },
            { order: 3, text: 'Ensure the divot exits well after the line.' }
        ]
    },
    {
        id: 'd-bunker-2',
        title: 'The Fried Egg Escape',
        description: 'Advanced technique for getting the ball out of a buried lie.',
        difficulty: 'ADVANCED',
        category: 'BUNKER',
        thumbnailUrl: 'https://images.unsplash.com/photo-1605142859392-2342551ec94d?auto=format&fit=crop&q=80&w=800',
        durationMinutes: 10,
        steps: [
            { order: 1, text: 'Close the clubface slightly (hood it).' },
            { order: 2, text: 'Swing steeper into the sand behind the ball.' },
            { order: 3, text: 'Do not follow through aggressively.' }
        ]
    },
    {
        id: '1',
        title: 'Perfect Takeaway',
        description: 'Master the first 2 feet of your swing to ensure a solid plane.',
        difficulty: 'BEGINNER',
        category: 'FULL_SWING',
        thumbnailUrl: 'https://images.unsplash.com/photo-1592850935576-1c258d4ae01a?auto=format&fit=crop&q=80&w=800',
        durationMinutes: 10,
        steps: [
            { order: 1, text: 'Set up with alignment sticks on the ground.' },
            { order: 2, text: 'Keep club head outside your hands.' },
            { order: 3, text: 'Pause at parallel to check face angle.' }
        ]
    }
];

export const MOCK_LESSONS: Lesson[] = [
    {
        id: '1',
        title: 'The Art of the Short Game',
        instructor: 'Joe Mayo',
        description: 'Why 100 yards and in is the fastest way to lower scores.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800',
        totalDuration: 45,
        progress: 0,
        chapters: [],
        completed: false,
        locked: false,
        keyTakeaways: [],
        resources: [],
        videoUrl: '',
        durationMinutes: 45
    }
];

export const MOCK_RECENT_SWINGS: SwingAnalysis[] = [
    {
        id: '103',
        date: new Date(Date.now() - 3600000), // 1 hour ago
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1629210087796-749e7b243452?auto=format&fit=crop&q=80&w=400',
        clubUsed: 'LW',
        tags: ['Bunker', 'Short Sided', 'Save'],
        metrics: {
            clubSpeed: 45,
            ballSpeed: 48,
            carryDistance: 12,
            launchAngle: 42.0,
            spinRate: 3500
        },
        feedback: [
            {
                id: 'f3',
                timestamp: 1.0,
                text: 'Excellent use of bounce. Shallow entry.',
                severity: 'INFO',
                category: 'PLANE'
            }
        ],
        keyframes: [],
        score: 95
    },
    {
        id: '101',
        date: new Date(Date.now() - 86400000), // Yesterday
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // Placeholder
        thumbnailUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=400',
        clubUsed: 'DRIVER',
        tags: ['Range', 'Speed Training'],
        metrics: {
            clubSpeed: 105,
            ballSpeed: 152,
            carryDistance: 245,
            launchAngle: 12.5,
            spinRate: 2400
        },
        feedback: [
             {
                id: 'f1',
                timestamp: 1.2,
                text: 'Good shoulder turn at the top.',
                severity: 'INFO',
                category: 'ROTATION'
            },
            {
                id: 'f2',
                timestamp: 2.1,
                text: 'Slight early extension before impact.',
                severity: 'WARNING',
                category: 'POSTURE',
                correction: 'Try the Impact Bag Drill'
            }
        ],
        keyframes: [],
        score: 82
    }
];

export const MOCK_GOALS: PracticeGoal[] = [
    {
        id: 'g3',
        title: 'Up & Down %',
        metric: 'smashFactor', // Reusing type for mock
        targetValue: 60,
        currentValue: 42,
        unit: '%',
        progress: 70,
        deadline: new Date(Date.now() + 86400000 * 15)
    },
    {
        id: 'g1',
        title: 'Speed Training',
        metric: 'clubSpeed',
        targetValue: 110,
        currentValue: 105,
        unit: 'mph',
        progress: 65,
        deadline: new Date(Date.now() + 86400000 * 30)
    }
];

export const MOCK_SESSIONS: TrackManSession[] = [
    {
        id: 's3',
        date: new Date(Date.now() - 3600000 * 2),
        location: 'Short Game Area',
        shotsHit: 40,
        club: 'SW',
        avgMetrics: { clubSpeed: 50, ballSpeed: 52, carryDistance: 45, spinRate: 6000 },
        bestMetrics: { clubSpeed: 52, ballSpeed: 55, carryDistance: 48, spinRate: 6200 },
        consistencyScore: 92,
        notes: 'Working on 50 yard landing spots.'
    },
    {
        id: 's1',
        date: new Date(Date.now() - 86400000),
        location: 'The Studio',
        shotsHit: 50,
        club: 'DRIVER',
        avgMetrics: { clubSpeed: 104, ballSpeed: 151, carryDistance: 242, spinRate: 2500 },
        bestMetrics: { clubSpeed: 106, ballSpeed: 154, carryDistance: 248, spinRate: 2350 },
        consistencyScore: 88,
        notes: 'Focused on tempo. Feeling good about the transition.'
    }
];
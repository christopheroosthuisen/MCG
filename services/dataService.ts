
import { MOCK_USER_PROFILE, MOCK_RECENT_SWINGS, MOCK_SESSIONS, MOCK_GOALS, MOCK_COURSES, MOCK_DRILLS, MOCK_BAG_SLOTS, MOCK_ROUNDS, MOCK_WORKOUTS, MOCK_HANDICAP_HISTORY, MOCK_COACH } from '../constants';
import { UserProfile, SwingAnalysis, TrackManSession, PracticeGoal, BagShotSlot, Course, Drill, ActionLog, Club, OnCourseRound, Workout, HandicapRecord, CoachProfile, StrokesGained, SGBenchmark } from '../types';

// ============================================================
// STROKES GAINED CALCULATION ENGINE
// Based on Mark Broadie's research (Columbia University)
// ============================================================

/**
 * PGA Tour baseline expected strokes from various distances and lies.
 * Source: Broadie, M. (2014). "Every Shot Counts" - Columbia University research.
 * These are interpolated from the published lookup tables.
 *
 * Expected strokes = average strokes to hole out from a given distance & lie.
 */

// Expected strokes from TEE (distance in yards)
const EXPECTED_STROKES_TEE: [number, number][] = [
    [100, 2.92], [125, 2.99], [150, 3.05], [175, 3.12], [200, 3.19],
    [225, 3.25], [250, 3.33], [275, 3.42], [300, 3.50], [325, 3.58],
    [350, 3.68], [375, 3.78], [400, 3.90], [425, 4.02], [450, 4.17],
    [475, 4.33], [500, 4.50], [525, 4.68], [550, 4.87],
];

// Expected strokes from FAIRWAY (distance in yards to hole)
const EXPECTED_STROKES_FAIRWAY: [number, number][] = [
    [20, 2.40], [40, 2.55], [60, 2.70], [80, 2.82], [100, 2.92],
    [120, 2.99], [140, 3.05], [160, 3.12], [180, 3.21], [200, 3.32],
    [220, 3.45], [240, 3.58], [260, 3.72],
];

// Expected strokes from ROUGH (distance in yards to hole)
const EXPECTED_STROKES_ROUGH: [number, number][] = [
    [20, 2.56], [40, 2.72], [60, 2.88], [80, 3.00], [100, 3.10],
    [120, 3.18], [140, 3.26], [160, 3.35], [180, 3.45], [200, 3.58],
    [220, 3.72], [240, 3.87], [260, 4.02],
];

// Expected strokes from SAND (distance in yards to hole)
const EXPECTED_STROKES_SAND: [number, number][] = [
    [10, 2.53], [20, 2.73], [30, 2.90], [40, 3.05], [60, 3.25],
    [80, 3.40], [100, 3.55],
];

// Expected strokes from GREEN (distance in FEET to hole)
// This is the PGA Tour putting baseline - the core of SG Putting
const EXPECTED_STROKES_GREEN: [number, number][] = [
    [1, 1.001], [2, 1.009], [3, 1.040], [4, 1.100], [5, 1.150],
    [6, 1.210], [7, 1.265], [8, 1.320], [9, 1.370], [10, 1.410],
    [12, 1.490], [15, 1.590], [20, 1.720], [25, 1.820], [30, 1.880],
    [35, 1.930], [40, 1.960], [45, 1.980], [50, 2.000], [60, 2.040],
    [75, 2.080], [90, 2.120],
];

/**
 * Interpolate expected strokes from a lookup table.
 * Uses linear interpolation between the two nearest entries.
 */
function interpolateExpectedStrokes(table: [number, number][], distance: number): number {
    if (distance <= table[0][0]) return table[0][1];
    if (distance >= table[table.length - 1][0]) return table[table.length - 1][1];

    for (let i = 0; i < table.length - 1; i++) {
        const [d1, s1] = table[i];
        const [d2, s2] = table[i + 1];
        if (distance >= d1 && distance <= d2) {
            const t = (distance - d1) / (d2 - d1);
            return s1 + t * (s2 - s1);
        }
    }
    return table[table.length - 1][1];
}

type ShotLie = 'TEE' | 'FAIRWAY' | 'ROUGH' | 'SAND' | 'GREEN' | 'RECOVERY';

/**
 * Get expected strokes to hole out from a given lie and distance.
 * @param lie - The type of lie
 * @param distanceYards - Distance to hole in yards (or feet if on green)
 */
export function getExpectedStrokes(lie: ShotLie, distanceYards: number): number {
    switch (lie) {
        case 'TEE': return interpolateExpectedStrokes(EXPECTED_STROKES_TEE, distanceYards);
        case 'FAIRWAY': return interpolateExpectedStrokes(EXPECTED_STROKES_FAIRWAY, distanceYards);
        case 'ROUGH': return interpolateExpectedStrokes(EXPECTED_STROKES_ROUGH, distanceYards);
        case 'SAND': return interpolateExpectedStrokes(EXPECTED_STROKES_SAND, distanceYards);
        case 'GREEN': return interpolateExpectedStrokes(EXPECTED_STROKES_GREEN, distanceYards); // distance in feet
        case 'RECOVERY': return interpolateExpectedStrokes(EXPECTED_STROKES_ROUGH, distanceYards) + 0.3;
        default: return interpolateExpectedStrokes(EXPECTED_STROKES_FAIRWAY, distanceYards);
    }
}

/**
 * Calculate Strokes Gained for a single shot.
 *
 * SG = Expected_before - (Expected_after + 1)
 *
 * If holed out: Expected_after = 0, so SG = Expected_before - 1
 * A positive SG means the shot was better than the tour average.
 */
export function calculateShotSG(
    startLie: ShotLie,
    startDistance: number,
    endLie: ShotLie | 'HOLED',
    endDistance: number
): number {
    const expectedBefore = getExpectedStrokes(startLie, startDistance);
    const expectedAfter = endLie === 'HOLED' ? 0 : getExpectedStrokes(endLie, endDistance);
    return expectedBefore - expectedAfter - 1;
}

/**
 * Comprehensive SG benchmarks by handicap level.
 * Based on Mark Broadie's research and PGA Tour ShotLink data.
 * Values represent strokes gained per round vs. scratch golfer baseline.
 *
 * Scratch (0) = 0.0 across all categories (baseline)
 * Positive = better than scratch, Negative = worse than scratch
 *
 * The distribution of total strokes lost by handicap:
 * - Off the Tee: ~18% of total gap
 * - Approach: ~35% of total gap (biggest separator)
 * - Around Green: ~17% of total gap
 * - Putting: ~30% of total gap
 */
export const SG_BENCHMARKS_FULL: SGBenchmark[] = [
    { handicap: -5, offTheTee: 1.0,  approach: 2.2,  aroundGreen: 0.7,  putting: 1.1  }, // Tour elite
    { handicap: 0,  offTheTee: 0.0,  approach: 0.0,  aroundGreen: 0.0,  putting: 0.0  }, // Scratch
    { handicap: 5,  offTheTee: -0.9, approach: -1.8, aroundGreen: -0.9, putting: -1.5 },
    { handicap: 10, offTheTee: -1.8, approach: -3.5, aroundGreen: -1.7, putting: -3.0 },
    { handicap: 15, offTheTee: -2.7, approach: -5.2, aroundGreen: -2.6, putting: -4.5 },
    { handicap: 20, offTheTee: -3.6, approach: -7.0, aroundGreen: -3.4, putting: -6.0 },
    { handicap: 25, offTheTee: -4.5, approach: -8.8, aroundGreen: -4.3, putting: -7.5 },
    { handicap: 30, offTheTee: -5.4, approach: -10.5, aroundGreen: -5.1, putting: -9.0 },
];

/**
 * Get the SG benchmark for a specific handicap using interpolation.
 */
export function getSGBenchmark(handicap: number): SGBenchmark {
    const table = SG_BENCHMARKS_FULL;
    if (handicap <= table[0].handicap) return { ...table[0] };
    if (handicap >= table[table.length - 1].handicap) return { ...table[table.length - 1] };

    for (let i = 0; i < table.length - 1; i++) {
        if (handicap >= table[i].handicap && handicap <= table[i + 1].handicap) {
            const t = (handicap - table[i].handicap) / (table[i + 1].handicap - table[i].handicap);
            return {
                handicap,
                offTheTee: table[i].offTheTee + t * (table[i + 1].offTheTee - table[i].offTheTee),
                approach: table[i].approach + t * (table[i + 1].approach - table[i].approach),
                aroundGreen: table[i].aroundGreen + t * (table[i + 1].aroundGreen - table[i].aroundGreen),
                putting: table[i].putting + t * (table[i + 1].putting - table[i].putting),
            };
        }
    }
    return { ...table[table.length - 1] };
}

/**
 * Estimate strokes gained from round-level statistics.
 *
 * When we don't have shot-by-shot data, we estimate SG from aggregate stats
 * using statistical relationships derived from PGA Tour data:
 *
 * SG Off Tee ≈ f(fairways hit, driving distance)
 * SG Approach ≈ f(GIR, proximity to hole)
 * SG Around Green ≈ f(scrambling %, up-and-down %)
 * SG Putting ≈ f(putts per round, putts per GIR)
 */
export function estimateSGFromRoundStats(round: {
    score: number;
    par: number;
    fairwaysHit: number;
    fairwaysTotal?: number;
    greensInRegulation: number;
    greensTotal?: number;
    putts: number;
    holesPlayed: number;
}): StrokesGained {
    const holes = round.holesPlayed || 18;
    const scaleFactor = 18 / holes; // normalize to 18-hole equivalent

    const fairwayPct = round.fairwaysTotal
        ? round.fairwaysHit / round.fairwaysTotal
        : round.fairwaysHit / (holes <= 9 ? 7 : 14); // par 3s don't count

    const girPct = round.greensTotal
        ? round.greensInRegulation / round.greensTotal
        : round.greensInRegulation / holes;

    const puttsPerHole = round.putts / holes;
    const scoreOverPar = (round.score - round.par) * scaleFactor;

    // --- SG Putting estimation ---
    // Tour average: ~29 putts/18 holes (1.611 putts/hole)
    // Each putt over average ≈ -1.0 SG (approximately)
    // Adjusted for GIR (more GIR = more birdie putts = more putts expected)
    const expectedPuttsPerHole = 1.611 + (girPct - 0.67) * 0.4; // GIR baseline ~67%
    const sgPutting = -((puttsPerHole - expectedPuttsPerHole) * holes * scaleFactor);

    // --- SG Approach estimation ---
    // Tour average GIR: ~67%. Each percentage point of GIR ≈ 0.11 SG
    // Additional penalty for very low GIR (non-linear)
    const girDiff = girPct - 0.67;
    let sgApproach = girDiff * holes * 0.11 * scaleFactor;
    if (girPct < 0.40) {
        sgApproach -= (0.40 - girPct) * holes * 0.05 * scaleFactor; // extra penalty for very poor iron play
    }

    // --- SG Off Tee estimation ---
    // Tour average fairway hit: ~62%. Each pct point ≈ 0.04 SG
    // Missing fairway costs about 0.3 strokes on average
    const fwyDiff = fairwayPct - 0.62;
    const sgOffTee = fwyDiff * (holes <= 9 ? 7 : 14) * 0.04 * scaleFactor;

    // --- SG Around Green ---
    // Derived: total SG minus the other three categories
    // Total SG = par - score (positive = under par = good)
    const sgTotal = -(scoreOverPar); // negative score = positive SG
    const sgAroundGreen = sgTotal - sgPutting - sgApproach - sgOffTee;

    return {
        roundId: '',
        date: new Date(),
        courseName: '',
        offTheTee: Math.round(sgOffTee * 100) / 100,
        approach: Math.round(sgApproach * 100) / 100,
        aroundGreen: Math.round(sgAroundGreen * 100) / 100,
        putting: Math.round(sgPutting * 100) / 100,
        total: Math.round(sgTotal * 100) / 100,
        benchmarkHandicap: 0,
        totalStrokes: round.score,
        coursePar: round.par,
    };
}

// ============================================================
// HANDICAP INDEX CALCULATION (USGA/WHS 2024 Rules)
// ============================================================

/**
 * Calculate Score Differential per USGA World Handicap System:
 *
 * Score Differential = (113 / Slope Rating) × (Adjusted Gross Score - Course Rating)
 *
 * Standard Slope Rating = 113
 * If slope/rating unknown, use reasonable defaults.
 */
export function calculateScoreDifferential(
    adjustedGrossScore: number,
    courseRating: number = 72.0,
    slopeRating: number = 113
): number {
    return (113 / slopeRating) * (adjustedGrossScore - courseRating);
}

/**
 * Calculate Handicap Index per WHS rules:
 * 1. Take best 8 of last 20 Score Differentials
 * 2. Average those 8
 * 3. Multiply by 0.96 (96% adjustment)
 * 4. Truncate to one decimal place (do NOT round)
 *
 * For fewer than 20 rounds, the number of differentials used varies:
 * - 3 rounds: lowest 1, minus additional 2.0 adjustment
 * - 4 rounds: lowest 1, minus 1.0
 * - 5 rounds: lowest 1, minus 0.0
 * - 6 rounds: lowest 2
 * - 7-8 rounds: lowest 2
 * - 9-11 rounds: lowest 3
 * - 12-14 rounds: lowest 4
 * - 15-16 rounds: lowest 5
 * - 17-18 rounds: lowest 6
 * - 19 rounds: lowest 7
 * - 20+ rounds: lowest 8
 */
export function calculateHandicapIndex(differentials: number[]): number {
    const n = differentials.length;
    if (n < 3) return -1; // Not enough rounds

    const sorted = [...differentials].sort((a, b) => a - b);

    let count: number;
    let adjustment = 0;

    if (n === 3) { count = 1; adjustment = -2.0; }
    else if (n === 4) { count = 1; adjustment = -1.0; }
    else if (n === 5) { count = 1; adjustment = 0; }
    else if (n <= 8) { count = 2; adjustment = 0; }
    else if (n <= 11) { count = 3; adjustment = 0; }
    else if (n <= 14) { count = 4; adjustment = 0; }
    else if (n <= 16) { count = 5; adjustment = 0; }
    else if (n <= 18) { count = 6; adjustment = 0; }
    else if (n === 19) { count = 7; adjustment = 0; }
    else { count = 8; adjustment = 0; } // 20+

    const best = sorted.slice(0, count);
    const average = best.reduce((sum, d) => sum + d, 0) / count;
    const index = (average + adjustment) * 0.96;

    // Truncate to 1 decimal (do not round per WHS rules)
    return Math.floor(index * 10) / 10;
}

// ============================================================
// PUTTING MAKE PERCENTAGE (PGA Tour Baselines)
// ============================================================

/**
 * PGA Tour one-putt make percentages by distance.
 * Source: PGA Tour ShotLink data (2019-2023 averages)
 */
export const TOUR_PUTTING_MAKE_PCT: [number, number][] = [
    [1, 99.9], [2, 99.5], [3, 96.0], [4, 88.0], [5, 77.0],
    [6, 66.0], [7, 58.0], [8, 50.0], [9, 45.0], [10, 40.0],
    [12, 33.0], [15, 24.0], [20, 15.0], [25, 10.0], [30, 7.0],
    [40, 3.5], [50, 2.0], [60, 1.2],
];

/**
 * Get PGA Tour one-putt make percentage at a given distance.
 */
export function getTourPuttMakePct(distanceFeet: number): number {
    return interpolateExpectedStrokes(TOUR_PUTTING_MAKE_PCT, distanceFeet);
}

class DataService {
    private user: UserProfile;
    private swings: SwingAnalysis[];
    private sessions: TrackManSession[];
    private goals: PracticeGoal[];
    private bagSlots: BagShotSlot[];
    private courses: Course[];
    private drills: Drill[];
    private actionLog: ActionLog[];
    private rounds: OnCourseRound[];
    private workouts: Workout[];
    private handicapHistory: HandicapRecord[];
    private coach: CoachProfile;

    private readonly STORAGE_KEY = 'mcg_app_data_v2';

    constructor() {
        // Try to load from local storage
        const savedData = localStorage.getItem(this.STORAGE_KEY);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                this.user = parsed.user;
                // Restore Dates (JSON serializes dates to strings)
                this.swings = parsed.swings.map((s: any) => ({ ...s, date: new Date(s.date) }));
                this.sessions = parsed.sessions.map((s: any) => ({ ...s, date: new Date(s.date) }));
                this.goals = parsed.goals.map((g: any) => ({ ...g, deadline: g.deadline ? new Date(g.deadline) : undefined }));
                this.bagSlots = parsed.bagSlots.map((b: any) => ({ ...b, masteryDate: b.masteryDate ? new Date(b.masteryDate) : undefined }));
                this.actionLog = parsed.actionLog.map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) }));
                this.courses = parsed.courses || [...MOCK_COURSES]; 
                this.drills = parsed.drills || [...MOCK_DRILLS];
                this.rounds = parsed.rounds?.map((r: any) => ({ ...r, date: new Date(r.date) })) || [...MOCK_ROUNDS];
                this.workouts = parsed.workouts || [...MOCK_WORKOUTS];
                this.handicapHistory = parsed.handicapHistory?.map((h: any) => ({ ...h, date: new Date(h.date) })) || [...MOCK_HANDICAP_HISTORY];
                this.coach = parsed.coach || MOCK_COACH;
            } catch (e) {
                console.error("Failed to parse saved data, resetting to defaults", e);
                this.resetToDefaults();
            }
        } else {
            this.resetToDefaults();
        }
    }

    private resetToDefaults() {
        this.user = { ...MOCK_USER_PROFILE };
        this.swings = [...MOCK_RECENT_SWINGS];
        this.sessions = [...MOCK_SESSIONS];
        this.goals = [...MOCK_GOALS];
        this.bagSlots = [...MOCK_BAG_SLOTS];
        this.courses = [...MOCK_COURSES];
        this.drills = [...MOCK_DRILLS];
        this.rounds = [...MOCK_ROUNDS];
        this.workouts = [...MOCK_WORKOUTS];
        this.handicapHistory = [...MOCK_HANDICAP_HISTORY];
        this.coach = MOCK_COACH;
        this.actionLog = [];
        this.save();
    }

    private save() {
        const data = {
            user: this.user,
            swings: this.swings,
            sessions: this.sessions,
            goals: this.goals,
            bagSlots: this.bagSlots,
            courses: this.courses,
            drills: this.drills,
            actionLog: this.actionLog,
            rounds: this.rounds,
            workouts: this.workouts,
            handicapHistory: this.handicapHistory,
            coach: this.coach
        };
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Failed to save to localStorage", e);
        }
    }

    // --- GETTERS ---
    getUser() { return this.user; }
    getSwings() { return this.swings.sort((a, b) => b.date.getTime() - a.date.getTime()); }
    getSessions() { return this.sessions.sort((a, b) => b.date.getTime() - a.date.getTime()); }
    getGoals() { return this.goals; }
    getBagSlots() { return this.bagSlots; }
    getCourses() { return this.courses; }
    getDrills() { return this.drills; }
    getRecentActions() { return this.actionLog.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 20); }
    getRounds() { return this.rounds.sort((a, b) => b.date.getTime() - a.date.getTime()); }
    getWorkouts() { return this.workouts; }
    getHandicapHistory() { return this.handicapHistory; }
    getCoach() { return this.coach; }

    // --- ACTIONS ---

    addSwing(swing: SwingAnalysis) {
        this.swings.unshift(swing);
        this.logAction('ADD_SWING', { id: swing.id, club: swing.clubUsed });
        this.save();
    }

    addSession(session: TrackManSession) {
        this.sessions.unshift(session);
        this.logAction('ADD_SESSION', { id: session.id, shots: session.shotsHit });
        // Update streak logic (simplified)
        this.user.stats.streak += 1;
        this.save();
    }

    updateBagSlot(slotId: string, updates: Partial<BagShotSlot>) {
        const index = this.bagSlots.findIndex(s => s.id === slotId);
        if (index !== -1) {
            const wasMastered = this.bagSlots[index].isMastered;
            this.bagSlots[index] = { ...this.bagSlots[index], ...updates };
            
            // Log if mastered status changed to true
            if (updates.isMastered && !wasMastered) {
                 this.bagSlots[index].masteryDate = new Date();
                 this.logAction('MASTER_SHOT', { title: this.bagSlots[index].title });
            }
            this.save();
        }
    }

    addBagSlot(slot: BagShotSlot) {
        this.bagSlots.push(slot);
        this.save();
    }

    updateGoal(goalId: string, updates: Partial<PracticeGoal>) {
        const index = this.goals.findIndex(g => g.id === goalId);
        if (index !== -1) {
            this.goals[index] = { ...this.goals[index], ...updates };
            if (updates.progress !== undefined) {
                this.logAction('UPDATE_GOAL', { title: this.goals[index].title, progress: updates.progress });
            }
            this.save();
        }
    }

    updateUser(updates: Partial<UserProfile>) {
        this.user = { ...this.user, ...updates };
        this.save();
    }

    // New action to complete onboarding
    completeOnboarding(handicap: number, dexterity: 'Right' | 'Left') {
        this.user.swingDNA.handicap = handicap;
        this.user.swingDNA.dexterity = dexterity as any;
        this.user.onboardingCompleted = true;
        this.save();
    }

    updateBag(bag: Club[]) {
        this.user.bag = bag;
        this.save();
    }

    completeLesson(courseId: string, lessonId: string) {
        const courseIndex = this.courses.findIndex(c => c.id === courseId);
        if (courseIndex === -1) return;

        let lessonFound = false;
        let lessonTitle = '';

        // Find and update lesson
        this.courses[courseIndex].modules.forEach(mod => {
            const lesson = mod.lessons.find(l => l.id === lessonId);
            if (lesson && !lesson.completed) {
                lesson.completed = true;
                lessonTitle = lesson.title;
                lessonFound = true;
            }
        });

        if (lessonFound) {
            const allLessons = this.courses[courseIndex].modules.flatMap(m => m.lessons);
            const completedCount = allLessons.filter(l => l.completed).length;
            this.courses[courseIndex].progress = Math.round((completedCount / allLessons.length) * 100);
            
            this.logAction('COMPLETE_LESSON', { title: lessonTitle, course: this.courses[courseIndex].title });
            this.save();
        }
    }
    
    // New Actions
    addRound(round: OnCourseRound) {
        this.rounds.unshift(round);
        this.logAction('ROUND_COMPLETE', { course: round.courseName, score: round.score });

        // Calculate proper USGA handicap index from round history
        const recentRounds = this.rounds
            .filter(r => r.isCompleted && r.score > 0)
            .slice(0, 20); // Last 20 rounds per WHS

        if (recentRounds.length >= 3) {
            const differentials = recentRounds.map(r =>
                calculateScoreDifferential(r.score, 72.0, 113) // Default course rating / slope
            );
            const newIndex = calculateHandicapIndex(differentials);
            if (newIndex >= 0) {
                this.user.swingDNA.handicap = newIndex;
                // Add to history
                this.handicapHistory.unshift({
                    id: crypto.randomUUID(),
                    date: new Date(),
                    handicap: newIndex,
                    round: round.courseName
                });
            }
        }

        this.save();
    }

    /**
     * Calculate SG estimates for a completed round using aggregate stats.
     */
    calculateRoundSG(round: OnCourseRound): StrokesGained {
        const sg = estimateSGFromRoundStats({
            score: round.score,
            par: round.par,
            fairwaysHit: round.fairwaysHit,
            greensInRegulation: round.greensInRegulation,
            putts: round.putts,
            holesPlayed: round.holesPlayed,
        });
        sg.roundId = round.id;
        sg.date = round.date;
        sg.courseName = round.courseName;
        return sg;
    }

    /**
     * Get SG data for all completed rounds with stats.
     */
    getSGHistory(): StrokesGained[] {
        return this.rounds
            .filter(r => r.isCompleted && r.putts > 0 && r.greensInRegulation >= 0)
            .map(r => this.calculateRoundSG(r));
    }

    completeWorkout(id: string) {
        const index = this.workouts.findIndex(w => w.id === id);
        if (index !== -1) {
            this.workouts[index].completed = true;
            this.logAction('WORKOUT_COMPLETE', { title: this.workouts[index].title });
            this.save();
        }
    }

    private logAction(type: ActionLog['type'], details: any) {
        const action: ActionLog = {
            id: crypto.randomUUID(),
            type,
            timestamp: new Date(),
            details
        };
        this.actionLog.unshift(action);
        if (this.actionLog.length > 50) this.actionLog.pop();
    }
}

export const db = new DataService();

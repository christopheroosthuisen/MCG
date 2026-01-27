// ============================================================
// CATEGORY 6: GAMIFICATION & ENGAGEMENT
// ============================================================
// Copy each section into your project as needed.
//
// COMPONENTS INCLUDED:
// 1. Achievement System - Badges and achievements
// 2. StreakTracker - Extended streak functionality
// 3. WeeklyChallenge - Challenge cards
// 4. DailyFocus - Shot/drill of the day
// 5. LevelProgress - XP and level system
// 6. Leaderboard - Rankings display
// 7. MilestoneToast - Achievement notifications
// ============================================================

import React, { useState, useEffect } from 'react';
import { Text, Button, Card, Badge, ProgressBar } from './UIComponents';
import { COLORS } from '../constants';

// ============================================================
// 1. ACHIEVEMENT SYSTEM
// ============================================================

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: 'practice' | 'learning' | 'analysis' | 'milestone';
    unlocked: boolean;
    unlockedAt?: Date;
    progress?: number; // 0-100 for progressive achievements
    requirement?: number; // e.g., "Complete 10 drills"
    current?: number; // e.g., "You've done 7"
}

// Achievement data structure
export const ACHIEVEMENTS: Achievement[] = [
    // Practice Achievements
    { id: 'first_swing', title: 'First Swing', description: 'Record your first swing', icon: '🎬', category: 'practice', unlocked: false },
    { id: 'swing_10', title: 'Dedicated', description: 'Record 10 swings', icon: '📹', category: 'practice', unlocked: false, requirement: 10 },
    { id: 'swing_50', title: 'Film Buff', description: 'Record 50 swings', icon: '🎥', category: 'practice', unlocked: false, requirement: 50 },
    { id: 'tempo_master', title: 'Rhythm King', description: 'Complete 25 tempo sessions', icon: '🎵', category: 'practice', unlocked: false, requirement: 25 },
    { id: 'early_bird', title: 'Early Bird', description: 'Practice before 7am', icon: '🌅', category: 'practice', unlocked: false },

    // Learning Achievements
    { id: 'first_lesson', title: 'Student', description: 'Complete your first lesson', icon: '📖', category: 'learning', unlocked: false },
    { id: 'course_complete', title: 'Graduate', description: 'Complete a full course', icon: '🎓', category: 'learning', unlocked: false },
    { id: 'short_game_master', title: 'Short Game Specialist', description: 'Complete all short game courses', icon: '⛳', category: 'learning', unlocked: false },
    { id: 'quant_curious', title: 'Data Driven', description: 'Complete a Quant Lab course', icon: '📊', category: 'learning', unlocked: false },

    // Analysis Achievements
    { id: 'first_analysis', title: 'Under the Microscope', description: 'Get your first AI analysis', icon: '🔬', category: 'analysis', unlocked: false },
    { id: 'pro_score', title: 'Pro Form', description: 'Score 90+ on a swing analysis', icon: '⭐', category: 'analysis', unlocked: false },
    { id: 'data_import', title: 'Analyst', description: 'Import TrackMan or GCQuad data', icon: '📈', category: 'analysis', unlocked: false },

    // Milestone Achievements
    { id: 'streak_7', title: 'Week Warrior', description: '7-day practice streak', icon: '🔥', category: 'milestone', unlocked: false },
    { id: 'streak_30', title: 'Monthly Master', description: '30-day practice streak', icon: '💪', category: 'milestone', unlocked: false },
    { id: 'handicap_drop', title: 'Breaking Through', description: 'Drop your handicap by 2 strokes', icon: '📉', category: 'milestone', unlocked: false },
];

// Achievement Badge Component
export const AchievementBadge: React.FC<{
    achievement: Achievement;
    size?: 'sm' | 'md' | 'lg';
    showProgress?: boolean;
    onClick?: () => void;
}> = ({ achievement, size = 'md', showProgress = false, onClick }) => {
    const sizes = {
        sm: { container: 'w-12 h-12', icon: 'text-xl', ring: 'border-2' },
        md: { container: 'w-16 h-16', icon: 'text-2xl', ring: 'border-3' },
        lg: { container: 'w-20 h-20', icon: 'text-3xl', ring: 'border-4' }
    };

    const s = sizes[size];

    return (
        <button
            onClick={onClick}
            className={`
                relative ${s.container} rounded-full flex items-center justify-center
                transition-all hover:scale-105 active:scale-95
                ${achievement.unlocked
                    ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30'
                    : 'bg-gray-100'
                }
            `}
        >
            {/* Progress ring for progressive achievements */}
            {showProgress && achievement.progress !== undefined && !achievement.unlocked && (
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                    />
                    <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="none"
                        stroke={COLORS.primary}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${achievement.progress * 2.83} 283`}
                    />
                </svg>
            )}

            {/* Icon */}
            <span className={`${s.icon} ${achievement.unlocked ? '' : 'grayscale opacity-40'}`}>
                {achievement.icon}
            </span>

            {/* Unlock indicator */}
            {achievement.unlocked && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                </div>
            )}
        </button>
    );
};

// Achievement Detail Card
export const AchievementCard: React.FC<{
    achievement: Achievement;
    onClaim?: () => void;
}> = ({ achievement, onClaim }) => {
    const progress = achievement.current && achievement.requirement
        ? (achievement.current / achievement.requirement) * 100
        : achievement.progress || 0;

    return (
        <Card variant={achievement.unlocked ? 'elevated' : 'outlined'} className={`
            ${achievement.unlocked ? 'border-l-4 border-l-orange-500' : ''}
        `}>
            <div className="flex items-center gap-4">
                <AchievementBadge achievement={achievement} />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Text variant="h4" className="truncate">{achievement.title}</Text>
                        {achievement.unlocked && (
                            <Badge variant="success">Unlocked</Badge>
                        )}
                    </div>
                    <Text variant="caption" className="truncate">{achievement.description}</Text>

                    {/* Progress for incomplete achievements */}
                    {!achievement.unlocked && achievement.requirement && (
                        <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>{achievement.current || 0} / {achievement.requirement}</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <ProgressBar progress={progress} />
                        </div>
                    )}
                </div>

                {/* Claim button for just-unlocked */}
                {achievement.unlocked && onClaim && (
                    <Button size="sm" onClick={onClaim}>
                        Claim
                    </Button>
                )}
            </div>
        </Card>
    );
};

// Achievements Grid
export const AchievementsGrid: React.FC<{
    achievements: Achievement[];
    onAchievementClick?: (achievement: Achievement) => void;
}> = ({ achievements, onAchievementClick }) => {
    const categories = ['practice', 'learning', 'analysis', 'milestone'] as const;
    const categoryLabels = {
        practice: 'Practice',
        learning: 'Learning',
        analysis: 'Analysis',
        milestone: 'Milestones'
    };

    return (
        <div className="space-y-6">
            {categories.map(category => {
                const categoryAchievements = achievements.filter(a => a.category === category);
                const unlocked = categoryAchievements.filter(a => a.unlocked).length;

                return (
                    <div key={category}>
                        <div className="flex items-center justify-between mb-3">
                            <Text variant="h4">{categoryLabels[category]}</Text>
                            <Text variant="caption">{unlocked}/{categoryAchievements.length}</Text>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {categoryAchievements.map(achievement => (
                                <AchievementBadge
                                    key={achievement.id}
                                    achievement={achievement}
                                    onClick={() => onAchievementClick?.(achievement)}
                                    showProgress
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ============================================================
// 2. EXTENDED STREAK TRACKER
// ============================================================

interface StreakData {
    current: number;
    longest: number;
    lastActiveDate: Date;
    weekHistory: boolean[]; // Last 7 days, today = index 6
}

export const StreakCard: React.FC<{
    streak: StreakData;
    onPracticeToday?: () => void;
}> = ({ streak, onPracticeToday }) => {
    const isActiveToday = streak.weekHistory[6];
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <Card variant="elevated" className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <Text variant="caption" color="rgba(255,255,255,0.8)">Current Streak</Text>
                    <div className="flex items-baseline gap-2">
                        <Text variant="metric" color="white" className="text-4xl">{streak.current}</Text>
                        <Text variant="body" color="rgba(255,255,255,0.8)">days</Text>
                    </div>
                </div>
                <div className="text-right">
                    <Text variant="caption" color="rgba(255,255,255,0.6)">Longest</Text>
                    <Text variant="h4" color="white">{streak.longest} days</Text>
                </div>
            </div>

            {/* Week visualization */}
            <div className="flex justify-between mb-4">
                {streak.weekHistory.map((active, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center
                            ${active
                                ? 'bg-white text-orange-500'
                                : i === 6
                                    ? 'border-2 border-white/50 border-dashed'
                                    : 'bg-white/20'
                            }
                        `}>
                            {active ? '✓' : i === 6 ? '?' : ''}
                        </div>
                        <span className="text-[10px] text-white/60">{dayLabels[i]}</span>
                    </div>
                ))}
            </div>

            {/* CTA if not active today */}
            {!isActiveToday && onPracticeToday && (
                <Button
                    fullWidth
                    variant="outline"
                    onClick={onPracticeToday}
                    className="border-white text-white hover:bg-white/20"
                >
                    Keep Your Streak Alive!
                </Button>
            )}
        </Card>
    );
};

// ============================================================
// 3. WEEKLY CHALLENGE
// ============================================================

interface WeeklyChallenge {
    id: string;
    title: string;
    description: string;
    type: 'drills' | 'swings' | 'lessons' | 'practice_time';
    target: number;
    current: number;
    reward: string;
    endsAt: Date;
    icon: string;
}

export const WeeklyChallengeCard: React.FC<{
    challenge: WeeklyChallenge;
    onViewDetails?: () => void;
}> = ({ challenge, onViewDetails }) => {
    const progress = (challenge.current / challenge.target) * 100;
    const daysLeft = Math.ceil((challenge.endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const isComplete = challenge.current >= challenge.target;

    return (
        <Card
            variant="filled"
            className={`
                ${isComplete
                    ? 'bg-green-50 border-green-200'
                    : 'bg-purple-50 border-purple-100'
                }
            `}
            onClick={onViewDetails}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{challenge.icon}</span>
                    <Badge variant={isComplete ? 'success' : 'info'}>
                        {isComplete ? 'Complete!' : 'Weekly Challenge'}
                    </Badge>
                </div>
                {!isComplete && (
                    <Text variant="caption" className="text-purple-600">
                        {daysLeft} days left
                    </Text>
                )}
            </div>

            <Text variant="h3" className="mb-1">{challenge.title}</Text>
            <Text variant="caption" className="mb-4">{challenge.description}</Text>

            <div className="flex items-center justify-between mb-2">
                <Text variant="caption" className="font-bold">
                    {challenge.current} / {challenge.target}
                </Text>
                <Text variant="caption">
                    Reward: {challenge.reward}
                </Text>
            </div>

            <ProgressBar
                progress={progress}
                color={isComplete ? '#10B981' : '#8B5CF6'}
            />
        </Card>
    );
};

// ============================================================
// 4. DAILY FOCUS / SHOT OF THE DAY
// ============================================================

interface DailyFocus {
    type: 'shot' | 'drill' | 'tip';
    title: string;
    description: string;
    icon: string;
    actionLabel: string;
    category?: string;
}

export const DailyFocusCard: React.FC<{
    focus: DailyFocus;
    onAction: () => void;
    onDismiss?: () => void;
}> = ({ focus, onAction, onDismiss }) => {
    const typeColors = {
        shot: 'from-green-500 to-emerald-600',
        drill: 'from-blue-500 to-indigo-600',
        tip: 'from-amber-500 to-orange-600'
    };

    const typeLabels = {
        shot: "Today's Shot",
        drill: "Today's Drill",
        tip: "Pro Tip"
    };

    return (
        <Card
            variant="elevated"
            className={`bg-gradient-to-br ${typeColors[focus.type]} text-white relative overflow-hidden`}
        >
            {/* Dismiss button */}
            {onDismiss && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDismiss();
                    }}
                    className="absolute top-3 right-3 text-white/60 hover:text-white"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            )}

            {/* Content */}
            <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{focus.icon}</span>
                <div>
                    <Badge variant="dark" className="bg-white/20 text-white">
                        {typeLabels[focus.type]}
                    </Badge>
                </div>
            </div>

            <Text variant="h3" color="white" className="mb-1">{focus.title}</Text>
            <Text variant="caption" className="text-white/80 mb-4">{focus.description}</Text>

            <Button
                variant="outline"
                onClick={onAction}
                className="border-white text-white hover:bg-white/20"
                fullWidth
            >
                {focus.actionLabel}
            </Button>

            {/* Decorative element */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full"/>
        </Card>
    );
};

// ============================================================
// 5. LEVEL & XP PROGRESS
// ============================================================

interface UserLevel {
    level: number;
    title: string;
    currentXP: number;
    nextLevelXP: number;
    totalXP: number;
}

const LEVEL_TITLES = [
    'Beginner', 'Novice', 'Apprentice', 'Intermediate',
    'Skilled', 'Advanced', 'Expert', 'Master', 'Maestro', 'Legend'
];

export const LevelProgressCard: React.FC<{
    userLevel: UserLevel;
    onViewDetails?: () => void;
}> = ({ userLevel, onViewDetails }) => {
    const progress = (userLevel.currentXP / userLevel.nextLevelXP) * 100;

    return (
        <Card variant="outlined" onClick={onViewDetails}>
            <div className="flex items-center gap-4">
                {/* Level badge */}
                <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <span className="text-white font-black text-xl">{userLevel.level}</span>
                    </div>
                    {/* XP ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="28"
                            cy="28"
                            r="26"
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="3"
                        />
                        <circle
                            cx="28"
                            cy="28"
                            r="26"
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${progress * 1.63} 163`}
                        />
                    </svg>
                </div>

                {/* Info */}
                <div className="flex-1">
                    <Text variant="caption" className="text-orange-500 font-bold">
                        {userLevel.title}
                    </Text>
                    <Text variant="h4">Level {userLevel.level}</Text>
                    <div className="flex items-center gap-2 mt-1">
                        <ProgressBar progress={progress} className="flex-1 h-1.5"/>
                        <Text variant="caption" className="text-[10px]">
                            {userLevel.currentXP}/{userLevel.nextLevelXP} XP
                        </Text>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// XP Gain Toast
export const XPGainToast: React.FC<{
    amount: number;
    reason: string;
    show: boolean;
}> = ({ amount, reason, show }) => {
    if (!show) return null;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top fade-in duration-300">
            <div className="bg-gray-900 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <span className="text-green-400 font-bold">+{amount} XP</span>
                <span className="text-gray-400">•</span>
                <span className="text-sm">{reason}</span>
            </div>
        </div>
    );
};

// ============================================================
// 6. MILESTONE TOAST / ACHIEVEMENT NOTIFICATION
// ============================================================

export const AchievementToast: React.FC<{
    achievement: Achievement;
    show: boolean;
    onDismiss: () => void;
    onView: () => void;
}> = ({ achievement, show, onDismiss, onView }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onDismiss, 5000);
            return () => clearTimeout(timer);
        }
    }, [show, onDismiss]);

    if (!show) return null;

    return (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top duration-500">
            <Card variant="elevated" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl">
                <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-3xl">{achievement.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <Text variant="caption" color="rgba(255,255,255,0.8)">
                            Achievement Unlocked!
                        </Text>
                        <Text variant="h4" color="white">{achievement.title}</Text>
                        <Text variant="caption" color="rgba(255,255,255,0.7)">
                            {achievement.description}
                        </Text>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={onView}
                            className="text-xs text-white font-bold underline"
                        >
                            View
                        </button>
                        <button
                            onClick={onDismiss}
                            className="text-xs text-white/60"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

// ============================================================
// USAGE EXAMPLES
// ============================================================
/*

// Example 1: Achievements in Profile
const ProfileTab = () => {
    const [achievements, setAchievements] = useState(ACHIEVEMENTS);
    const [selectedAchievement, setSelectedAchievement] = useState(null);

    return (
        <div>
            <Text variant="h2" className="mb-4">Achievements</Text>
            <AchievementsGrid
                achievements={achievements}
                onAchievementClick={setSelectedAchievement}
            />
        </div>
    );
};


// Example 2: Streak on Home Screen
const HomeScreen = () => {
    const streak = {
        current: 7,
        longest: 14,
        lastActiveDate: new Date(),
        weekHistory: [true, true, true, false, true, true, false]
    };

    return (
        <StreakCard
            streak={streak}
            onPracticeToday={() => navigateTo('PRACTICE')}
        />
    );
};


// Example 3: Weekly Challenge
const HomeScreen = () => {
    const challenge = {
        id: '1',
        title: 'Putting Week',
        description: 'Complete 5 putting drills this week',
        type: 'drills',
        target: 5,
        current: 3,
        reward: '50 XP',
        endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        icon: '🏌️'
    };

    return <WeeklyChallengeCard challenge={challenge} />;
};


// Example 4: Daily Focus
const HomeScreen = () => {
    const dailyFocus = {
        type: 'shot',
        title: 'The Bump & Run',
        description: 'Master the low-trajectory chip for firm conditions',
        icon: '⛳',
        actionLabel: 'Learn This Shot'
    };

    return (
        <DailyFocusCard
            focus={dailyFocus}
            onAction={() => navigateToDrill('bump-run')}
        />
    );
};


// Example 5: Achievement unlock flow
const App = () => {
    const [unlockedAchievement, setUnlockedAchievement] = useState(null);

    const checkAchievements = () => {
        // Check conditions and unlock
        if (swingCount === 10) {
            const achievement = ACHIEVEMENTS.find(a => a.id === 'swing_10');
            setUnlockedAchievement({ ...achievement, unlocked: true });
        }
    };

    return (
        <>
            {/* App content *}

            <AchievementToast
                achievement={unlockedAchievement}
                show={!!unlockedAchievement}
                onDismiss={() => setUnlockedAchievement(null)}
                onView={() => navigateTo('PROFILE')}
            />
        </>
    );
};

*/

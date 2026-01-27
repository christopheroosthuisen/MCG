// ============================================================
// CATEGORY 2: HOME SCREEN ENHANCEMENTS
// ============================================================
// Copy each section into your project as needed.
//
// COMPONENTS INCLUDED:
// 1. StreakWidget - Daily practice streak counter
// 2. EnhancedStatsCard - Improved stats with sparklines
// 3. SwingScoreRing - Circular score visualization
// 4. QuickActions - Quick access button grid
// 5. ContinueCard - Resume where you left off
// 6. RecentSwingCard - Enhanced swing card design
// ============================================================

import React from 'react';
import { Text, Button, Card, Badge, ProgressBar } from './UIComponents';
import { COLORS } from '../constants';

// ============================================================
// 1. STREAK WIDGET
// ============================================================
// Shows daily practice streak - Add below welcome header in HomeView

export const StreakWidget: React.FC<{
    streak: number;
    isActiveToday?: boolean;
}> = ({ streak, isActiveToday = false }) => {
    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            isActiveToday
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-orange-50 text-orange-600'
        }`}>
            <span className={`text-xl ${isActiveToday ? 'animate-pulse' : ''}`}>🔥</span>
            <span className="font-bold">{streak} Day Streak</span>
            {isActiveToday && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
            )}
        </div>
    );
};

// ============================================================
// 2. ENHANCED STATS CARDS
// ============================================================
// Replace existing stats grid with these improved cards

interface SparklineProps {
    data: number[];
    color: string;
    height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color, height = 32 }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width="100%" height={height} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* End dot */}
            <circle
                cx={100}
                cy={height - ((data[data.length - 1] - min) / range) * height}
                r="3"
                fill={color}
            />
        </svg>
    );
};

export const HandicapCard: React.FC<{
    handicap: number;
    trend: number; // positive = improving (going down), negative = getting worse
    history?: number[];
}> = ({ handicap, trend, history = [14, 13.5, 13.2, 12.8, 12.5, 12] }) => {
    const isPositive = trend > 0;

    return (
        <Card variant="elevated" className="col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                }}/>
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <Text variant="metric-label" className="text-gray-400 mb-1">Handicap Index</Text>
                        <div className="flex items-baseline gap-2">
                            <Text variant="metric" color="white" className="text-5xl">
                                {handicap > 0 ? '+' : ''}{handicap.toFixed(1)}
                            </Text>
                        </div>
                    </div>

                    {/* Trend indicator */}
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                        isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            {isPositive
                                ? <path d="M7 14l5-5 5 5H7z"/>
                                : <path d="M7 10l5 5 5-5H7z"/>
                            }
                        </svg>
                        <span className="text-xs font-bold">{Math.abs(trend).toFixed(1)}</span>
                    </div>
                </div>

                {/* Sparkline */}
                <div className="mt-4 h-8">
                    <Sparkline data={history} color="#10B981" height={32}/>
                </div>
                <Text variant="caption" className="text-gray-500 mt-2">Last 30 days</Text>
            </div>
        </Card>
    );
};

export const StatCard: React.FC<{
    label: string;
    value: string | number;
    icon: string;
    color: 'green' | 'orange' | 'blue' | 'gray';
    subtitle?: string;
}> = ({ label, value, icon, color, subtitle }) => {
    const colorStyles = {
        green: 'bg-green-600 shadow-green-600/30',
        orange: 'bg-orange-500 shadow-orange-500/30',
        blue: 'bg-blue-600 shadow-blue-600/30',
        gray: 'bg-gray-700 shadow-gray-700/30'
    };

    return (
        <Card variant="elevated" className={`${colorStyles[color]} text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{icon}</span>
            </div>
            <Text variant="metric" color="white" className="text-2xl">{value}</Text>
            <Text variant="caption" color="rgba(255,255,255,0.7)">{label}</Text>
            {subtitle && (
                <Text variant="caption" color="rgba(255,255,255,0.5)" className="text-[10px] mt-1">
                    {subtitle}
                </Text>
            )}
        </Card>
    );
};

// ============================================================
// 3. SWING SCORE RING
// ============================================================
// Circular progress for swing analysis scores

export const SwingScoreRing: React.FC<{
    score: number;
    size?: number;
    strokeWidth?: number;
}> = ({ score, size = 48, strokeWidth = 4 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (score: number) => {
        if (score >= 80) return '#10B981'; // Green
        if (score >= 60) return '#F59E0B'; // Amber
        return '#EF4444'; // Red
    };

    const color = getColor(score);

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-bold text-sm" style={{ color }}>{score}</span>
            </div>
        </div>
    );
};

// ============================================================
// 4. QUICK ACTIONS GRID
// ============================================================
// Quick access buttons below AI Swing Check card

interface QuickActionProps {
    icon: string;
    label: string;
    onClick: () => void;
    badge?: string;
}

export const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick, badge }) => {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all relative"
        >
            {badge && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {badge}
                </span>
            )}
            <span className="text-2xl mb-2">{icon}</span>
            <Text variant="caption" className="text-[11px] font-medium text-center leading-tight">
                {label}
            </Text>
        </button>
    );
};

export const QuickActionsGrid: React.FC<{
    onTempoTool: () => void;
    onContinueCourse: () => void;
    onDailyDrill: () => void;
    onBagOfShots?: () => void;
}> = ({ onTempoTool, onContinueCourse, onDailyDrill, onBagOfShots }) => {
    return (
        <div className="grid grid-cols-4 gap-3">
            <QuickAction icon="📏" label="Tempo" onClick={onTempoTool} />
            <QuickAction icon="📚" label="Course" onClick={onContinueCourse} badge="1" />
            <QuickAction icon="🎯" label="Daily Drill" onClick={onDailyDrill} />
            <QuickAction icon="🏌️" label="Bag" onClick={onBagOfShots || (() => {})} />
        </div>
    );
};

// ============================================================
// 5. CONTINUE WHERE YOU LEFT OFF
// ============================================================
// Shows last activity for returning users

interface LastActivityData {
    type: 'course' | 'drill' | 'swing';
    title: string;
    subtitle: string;
    progress?: number;
    thumbnail?: string;
}

export const ContinueCard: React.FC<{
    activity: LastActivityData;
    onResume: () => void;
}> = ({ activity, onResume }) => {
    const icons = {
        course: '📖',
        drill: '🎯',
        swing: '📹'
    };

    const colors = {
        course: 'border-l-orange-500',
        drill: 'border-l-green-500',
        swing: 'border-l-blue-500'
    };

    return (
        <Card variant="outlined" className={`border-l-4 ${colors[activity.type]}`}>
            <div className="flex items-center gap-4">
                {activity.thumbnail ? (
                    <img
                        src={activity.thumbnail}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover"
                    />
                ) : (
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                        {icons[activity.type]}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <Text variant="caption" className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                        Continue {activity.type === 'course' ? 'Learning' : activity.type === 'drill' ? 'Practice' : 'Reviewing'}
                    </Text>
                    <Text variant="h4" className="truncate">{activity.title}</Text>
                    <Text variant="caption" className="truncate">{activity.subtitle}</Text>

                    {activity.progress !== undefined && (
                        <ProgressBar progress={activity.progress} className="h-1 mt-2"/>
                    )}
                </div>

                <Button size="sm" variant="ghost" onClick={onResume} className="flex-shrink-0">
                    Resume
                </Button>
            </div>
        </Card>
    );
};

// ============================================================
// 6. ENHANCED RECENT SWING CARD
// ============================================================
// Improved swing card with score ring and better layout

export const RecentSwingCard: React.FC<{
    swing: {
        id: string;
        thumbnailUrl: string;
        clubUsed: string;
        date: Date;
        score?: number;
        tags?: string[];
    };
    onClick: () => void;
}> = ({ swing, onClick }) => {
    const timeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <button
            onClick={onClick}
            className="flex-shrink-0 w-36 group"
        >
            <div className="relative rounded-2xl overflow-hidden mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                <img
                    src={swing.thumbnailUrl}
                    alt={`${swing.clubUsed} swing`}
                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Score badge */}
                {swing.score && (
                    <div className="absolute bottom-2 right-2">
                        <SwingScoreRing score={swing.score} size={36} strokeWidth={3}/>
                    </div>
                )}

                {/* Club badge */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-bold">
                    {swing.clubUsed}
                </div>
            </div>

            <div className="px-1">
                <Text variant="caption" className="text-[11px] text-gray-500">
                    {timeAgo(swing.date)}
                </Text>
                {swing.tags && swing.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 overflow-hidden">
                        <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full truncate">
                            {swing.tags[0]}
                        </span>
                    </div>
                )}
            </div>
        </button>
    );
};

// ============================================================
// USAGE EXAMPLE: UPDATED HOME VIEW STRUCTURE
// ============================================================
// Replace your HomeView content with this structure:
/*

const HomeView = () => {
    const [showFirstTimeTip, setShowFirstTimeTip] = useState(() => {
        return !localStorage.getItem('mcg_first_tip_dismissed');
    });

    return (
        <div className="p-6 space-y-6">
            {/* Header with Streak *}
            <div className="flex items-center justify-between">
                <div>
                    <Text variant="caption" className="text-gray-500">
                        {getTimeBasedGreeting(user.name)}
                    </Text>
                    <Text variant="h2">Dashboard</Text>
                </div>
                <div className="flex items-center gap-3">
                    <StreakWidget streak={7} isActiveToday={true} />
                    <img
                        src={user.avatarUrl}
                        className="w-10 h-10 rounded-full border-2 border-orange-500"
                        alt="Profile"
                    />
                </div>
            </div>

            {/* First Time Tip *}
            {showFirstTimeTip && (
                <FirstTimeTip
                    onDismiss={() => {
                        localStorage.setItem('mcg_first_tip_dismissed', 'true');
                        setShowFirstTimeTip(false);
                    }}
                    onAction={() => {
                        setShowFirstTimeTip(false);
                        setRecordingActive(true);
                    }}
                />
            )}

            {/* Stats Grid *}
            <div className="grid grid-cols-2 gap-4">
                <HandicapCard
                    handicap={6.4}
                    trend={0.3}
                    history={[8.2, 7.8, 7.5, 7.1, 6.8, 6.4]}
                />
                <StatCard
                    label="Avg Score"
                    value="68.2"
                    icon="📊"
                    color="green"
                    subtitle="Last 14 rounds"
                />
            </div>

            {/* Continue Where You Left Off *}
            <ContinueCard
                activity={{
                    type: 'course',
                    title: 'Putting Mastery',
                    subtitle: 'Lesson 3: Start Line Control',
                    progress: 45
                }}
                onResume={() => navigateTo('LEARN')}
            />

            {/* AI Swing Check CTA *}
            <Card
                variant="elevated"
                className="bg-gradient-to-br from-gray-900 to-gray-800 cursor-pointer group"
                onClick={() => setRecordingActive(true)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-2xl">📹</span>
                    </div>
                    <div className="flex-1">
                        <Text variant="h3" color="white">AI Swing Check</Text>
                        <Text variant="caption" className="text-gray-400">
                            Get instant feedback on your technique
                        </Text>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </div>
            </Card>

            {/* Quick Actions *}
            <QuickActionsGrid
                onTempoTool={openTempoTool}
                onContinueCourse={() => navigateTo('LEARN')}
                onDailyDrill={openDailyDrill}
                onBagOfShots={openBagOfShots}
            />

            {/* Recent Swings *}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <Text variant="h4">Recent Swings</Text>
                    <button className="text-orange-500 text-sm font-medium">View All</button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
                    {MOCK_RECENT_SWINGS.map(swing => (
                        <RecentSwingCard
                            key={swing.id}
                            swing={swing}
                            onClick={() => openAnalysis(swing.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

*/

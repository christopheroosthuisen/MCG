// ============================================================
// CATEGORY 7: PRACTICE HUB IMPROVEMENTS
// ============================================================
// Copy each section into your project as needed.
//
// COMPONENTS INCLUDED:
// 1. DrillCard (Enhanced) - With difficulty dots & recommended tag
// 2. EnhancedPracticeTimer - With audio cues & milestones
// 3. GoalCard (Enhanced) - With trend visualization
// 4. SessionSummary - End of session modal
// 5. DrillFilters - Improved filter bar
// 6. PrimaryFocusCard - Enhanced focus widget
// 7. ToolCard - Improved tool buttons
// 8. SessionStats - Real-time session statistics
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { Text, Button, Card, Badge, ProgressBar, Tabs } from './UIComponents';
import { COLORS } from '../constants';
import { Drill, PracticeGoal } from '../types';

// ============================================================
// 1. ENHANCED DRILL CARD
// ============================================================

interface EnhancedDrillCardProps {
    drill: Drill;
    onClick: () => void;
    isRecommended?: boolean;
    completedCount?: number;
}

// Difficulty dots component
const DifficultyIndicator: React.FC<{ level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' }> = ({ level }) => {
    const levels = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3 };
    const count = levels[level];
    const colors = {
        BEGINNER: '#10B981',    // Green
        INTERMEDIATE: '#F59E0B', // Amber
        ADVANCED: '#EF4444'      // Red
    };

    return (
        <div className="flex gap-1 items-center">
            {[1, 2, 3].map(i => (
                <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors`}
                    style={{
                        backgroundColor: i <= count ? colors[level] : '#E5E7EB'
                    }}
                />
            ))}
        </div>
    );
};

export const EnhancedDrillCard: React.FC<EnhancedDrillCardProps> = ({
    drill,
    onClick,
    isRecommended = false,
    completedCount = 0
}) => {
    const categoryColors: Record<string, string> = {
        PUTTING: '#10B981',
        CHIPPING: '#3B82F6',
        BUNKER: '#F59E0B',
        FULL_SWING: '#8B5CF6',
        SHORT_GAME: '#EC4899'
    };

    return (
        <Card
            variant="elevated"
            className="relative overflow-hidden group cursor-pointer"
            onClick={onClick}
        >
            {/* Recommended Badge */}
            {isRecommended && (
                <div className="absolute top-3 right-3 z-10">
                    <Badge variant="success" className="shadow-sm">
                        <span className="flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                            </svg>
                            Recommended
                        </span>
                    </Badge>
                </div>
            )}

            {/* Thumbnail */}
            <div className="relative h-32 -mx-5 -mt-5 mb-4 overflow-hidden">
                <img
                    src={drill.thumbnailUrl}
                    alt={drill.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"/>

                {/* Category pill */}
                <div
                    className="absolute bottom-3 left-3 px-2 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wide"
                    style={{ backgroundColor: categoryColors[drill.category] || '#6B7280' }}
                >
                    {drill.category.replace('_', ' ')}
                </div>

                {/* Duration */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span className="text-[10px] text-white font-medium">{drill.durationMinutes}m</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <Text variant="h4" className="truncate mb-1">{drill.title}</Text>
                    <Text variant="caption" className="line-clamp-2">{drill.description}</Text>
                </div>

                {/* Difficulty */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <DifficultyIndicator level={drill.difficulty} />
                    <Text variant="caption" className="text-[10px]">{drill.difficulty}</Text>
                </div>
            </div>

            {/* Completion count */}
            {completedCount > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <Text variant="caption" className="text-green-600 flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                        Completed {completedCount}x
                    </Text>
                    <Button size="sm" variant="ghost" className="text-xs">
                        View History
                    </Button>
                </div>
            )}
        </Card>
    );
};

// ============================================================
// 2. ENHANCED PRACTICE TIMER
// ============================================================

interface EnhancedPracticeTimerProps {
    onClose: () => void;
    onSave: (data: SessionData) => void;
    enableAudio?: boolean;
}

interface SessionData {
    duration: number;
    shots: number;
    notes: string;
    club?: string;
}

export const EnhancedPracticeTimer: React.FC<EnhancedPracticeTimerProps> = ({
    onClose,
    onSave,
    enableAudio = true
}) => {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [shots, setShots] = useState(0);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [notes, setNotes] = useState('');
    const [selectedClub, setSelectedClub] = useState<string>('');
    const [audioEnabled, setAudioEnabled] = useState(enableAudio);

    const audioContextRef = useRef<AudioContext | null>(null);
    const previousShots = useRef(0);

    // Timer effect
    useEffect(() => {
        let interval: any = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    // Audio feedback for milestones
    useEffect(() => {
        if (!audioEnabled) return;

        // Play sound on shot milestones
        if (shots > 0 && shots !== previousShots.current) {
            previousShots.current = shots;

            if (shots % 25 === 0) {
                playMilestoneSound('high'); // 25, 50, 75, 100...
            } else if (shots % 10 === 0) {
                playMilestoneSound('medium'); // 10, 20, 30...
            } else {
                playClickSound();
            }
        }
    }, [shots, audioEnabled]);

    const playClickSound = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    };

    const playMilestoneSound = (type: 'medium' | 'high') => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        const frequencies = type === 'high' ? [523, 659, 784] : [440, 554];

        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.1);
            osc.stop(ctx.currentTime + i * 0.1 + 0.2);
        });
    };

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleEnd = () => {
        setIsActive(false);
        setShowSummary(true);
    };

    const handleSave = () => {
        onSave({
            duration: seconds,
            shots,
            notes,
            club: selectedClub
        });
        onClose();
    };

    const clubs = ['Driver', '3-Wood', '5-Iron', '7-Iron', '9-Iron', 'PW', 'SW', 'Putter'];

    // Minimized state
    if (isMinimized && !showSummary) {
        return (
            <div
                className="bg-orange-500 text-white rounded-full px-4 py-2 shadow-lg flex items-center justify-between gap-4 cursor-pointer hover:bg-orange-600 transition-colors"
                onClick={() => setIsMinimized(false)}
            >
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"/>
                    <span className="font-mono font-bold">{formatTime(seconds)}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase">{shots} Shots</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShots(s => s + 1);
                        }}
                        className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                    >
                        +
                    </button>
                </div>
            </div>
        );
    }

    // Summary modal
    if (showSummary) {
        return (
            <div className="bg-[#111827] text-white rounded-3xl p-6 shadow-2xl shadow-black/50 border border-gray-700">
                <Text variant="h3" color="white" className="mb-4">Session Summary</Text>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                        <div className="text-3xl font-black font-mono">{formatTime(seconds)}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold mt-1">Duration</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                        <div className="text-3xl font-black">{shots}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold mt-1">Shots Hit</div>
                    </div>
                </div>

                {/* Club selector */}
                <div className="mb-4">
                    <Text variant="caption" className="text-gray-400 mb-2 block">Primary Club Used</Text>
                    <div className="flex flex-wrap gap-2">
                        {clubs.map(club => (
                            <button
                                key={club}
                                onClick={() => setSelectedClub(club)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                    selectedClub === club
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                            >
                                {club}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <Text variant="caption" className="text-gray-400 mb-2 block">Session Notes (optional)</Text>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="How did it feel? What did you work on?"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 text-sm resize-none h-20 focus:border-orange-500 focus:outline-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1 text-gray-400">
                        Discard
                    </Button>
                    <Button variant="primary" onClick={handleSave} className="flex-1">
                        Save Session
                    </Button>
                </div>
            </div>
        );
    }

    // Full timer
    return (
        <div className="bg-[#111827] text-white rounded-3xl p-5 shadow-2xl shadow-black/50 border border-gray-700">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                        <Text variant="caption" className="text-green-500 font-bold uppercase tracking-widest text-[10px]">
                            Active Session
                        </Text>
                    </div>
                    <div className="font-mono text-4xl font-black tracking-tight">{formatTime(seconds)}</div>
                </div>
                <div className="flex gap-2">
                    {/* Audio toggle */}
                    <button
                        onClick={() => setAudioEnabled(!audioEnabled)}
                        className={`p-2 rounded-full transition-colors ${audioEnabled ? 'text-orange-500 bg-orange-500/20' : 'text-gray-400 hover:bg-white/10'}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {audioEnabled ? (
                                <>
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                                </>
                            ) : (
                                <>
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                    <line x1="23" y1="9" x2="17" y2="15"/>
                                    <line x1="17" y1="9" x2="23" y2="15"/>
                                </>
                            )}
                        </svg>
                    </button>
                    <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Shot counter & milestones */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="text-center">
                        <span className="text-4xl font-bold">{shots}</span>
                        <div className="text-[10px] text-gray-400 uppercase font-bold mt-1">Shots Hit</div>
                    </div>
                    {/* Milestone progress */}
                    <div className="mt-3">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span>Next: {Math.ceil(shots / 25) * 25}</span>
                            <span>{25 - (shots % 25)} to go</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-orange-500 transition-all duration-300"
                                style={{ width: `${(shots % 25) / 25 * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Log shot button */}
                <button
                    onClick={() => setShots(s => s + 1)}
                    className="bg-orange-500 hover:bg-orange-600 active:scale-95 rounded-2xl p-4 flex flex-col items-center justify-center transition-all"
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    <span className="text-[10px] text-white uppercase font-bold mt-2">Log Shot</span>
                </button>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
                <Button
                    variant={isActive ? 'secondary' : 'primary'}
                    fullWidth
                    onClick={() => setIsActive(!isActive)}
                    className={isActive ? 'bg-gray-700' : ''}
                >
                    {isActive ? 'Pause' : 'Resume'}
                </Button>
                <Button variant="danger" onClick={handleEnd}>
                    End
                </Button>
            </div>
        </div>
    );
};

// ============================================================
// 3. ENHANCED GOAL CARD
// ============================================================

interface EnhancedGoalCardProps {
    goal: PracticeGoal;
    history?: number[]; // Last 7 data points for sparkline
    onEdit?: () => void;
}

const MiniSparkline: React.FC<{ data: number[]; height?: number }> = ({ data, height = 24 }) => {
    if (data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const trend = data[data.length - 1] > data[0] ? '#10B981' : '#EF4444';

    return (
        <svg width="100%" height={height} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke={trend}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle
                cx="100"
                cy={height - ((data[data.length - 1] - min) / range) * height}
                r="3"
                fill={trend}
            />
        </svg>
    );
};

export const EnhancedGoalCard: React.FC<EnhancedGoalCardProps> = ({
    goal,
    history = [],
    onEdit
}) => {
    const daysLeft = goal.deadline
        ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    const isOnTrack = goal.progress >= 50 || (daysLeft && daysLeft > 14);

    return (
        <Card variant="elevated" className="relative">
            {/* Edit button */}
            {onEdit && (
                <button
                    onClick={onEdit}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
            )}

            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isOnTrack ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                }`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                        <line x1="4" y1="22" x2="4" y2="15"/>
                    </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <Text variant="h4" className="truncate pr-8">{goal.title}</Text>

                    <div className="flex items-baseline gap-2 my-2">
                        <span className="text-2xl font-black">{goal.currentValue}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-lg text-gray-500">{goal.targetValue}</span>
                        <span className="text-sm text-gray-400">{goal.unit}</span>
                    </div>

                    {/* Progress bar */}
                    <ProgressBar progress={goal.progress} />

                    {/* Meta info */}
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-medium">{Math.round(goal.progress)}% complete</span>
                            {daysLeft && (
                                <>
                                    <span>•</span>
                                    <span className={daysLeft < 7 ? 'text-red-500' : ''}>
                                        {daysLeft} days left
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Trend indicator */}
                        {history.length > 0 && (
                            <div className="w-20 h-6">
                                <MiniSparkline data={history} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

// ============================================================
// 4. IMPROVED DRILL FILTERS
// ============================================================

type DrillCategory = 'ALL' | 'PUTTING' | 'CHIPPING' | 'BUNKER' | 'FULL_SWING';
type DrillDifficulty = 'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

interface DrillFiltersProps {
    activeCategory: DrillCategory;
    activeDifficulty: DrillDifficulty;
    onCategoryChange: (category: DrillCategory) => void;
    onDifficultyChange: (difficulty: DrillDifficulty) => void;
    resultCount?: number;
}

export const DrillFilters: React.FC<DrillFiltersProps> = ({
    activeCategory,
    activeDifficulty,
    onCategoryChange,
    onDifficultyChange,
    resultCount
}) => {
    const categories: { value: DrillCategory; label: string; icon: string }[] = [
        { value: 'ALL', label: 'All', icon: '📋' },
        { value: 'PUTTING', label: 'Putting', icon: '🎯' },
        { value: 'CHIPPING', label: 'Chipping', icon: '⛳' },
        { value: 'BUNKER', label: 'Bunker', icon: '🏖️' },
        { value: 'FULL_SWING', label: 'Full Swing', icon: '🏌️' }
    ];

    const difficulties: { value: DrillDifficulty; label: string }[] = [
        { value: 'ALL', label: 'Any Level' },
        { value: 'BEGINNER', label: 'Beginner' },
        { value: 'INTERMEDIATE', label: 'Intermediate' },
        { value: 'ADVANCED', label: 'Advanced' }
    ];

    return (
        <div className="space-y-3">
            {/* Category filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat.value}
                        onClick={() => onCategoryChange(cat.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                            activeCategory === cat.value
                                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Difficulty & Results count */}
            <div className="flex items-center justify-between">
                <select
                    value={activeDifficulty}
                    onChange={(e) => onDifficultyChange(e.target.value as DrillDifficulty)}
                    className="bg-gray-100 border-0 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-orange-500"
                >
                    {difficulties.map(diff => (
                        <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                </select>

                {resultCount !== undefined && (
                    <Text variant="caption" className="text-gray-500">
                        {resultCount} drill{resultCount !== 1 ? 's' : ''} found
                    </Text>
                )}
            </div>
        </div>
    );
};

// ============================================================
// 5. PRIMARY FOCUS CARD
// ============================================================

interface PrimaryFocusProps {
    title: string;
    description: string;
    progress: number;
    targetDate?: Date;
    onViewDetails: () => void;
}

export const PrimaryFocusCard: React.FC<PrimaryFocusProps> = ({
    title,
    description,
    progress,
    targetDate,
    onViewDetails
}) => {
    return (
        <Card
            variant="elevated"
            className="bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden"
            onClick={onViewDetails}
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2"/>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <Badge variant="warning" className="bg-orange-500/20 text-orange-400">
                            Primary Focus
                        </Badge>
                        <Text variant="h3" color="white" className="mt-2">{title}</Text>
                        <Text variant="caption" className="text-gray-400 mt-1">{description}</Text>
                    </div>

                    <div className="relative w-16 h-16">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="#374151" strokeWidth="3"/>
                            <circle
                                cx="18" cy="18" r="16"
                                fill="none"
                                stroke="#FF8200"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={`${progress} 100`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">{progress}%</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <ProgressBar progress={progress} className="flex-1 mr-4"/>
                    {targetDate && (
                        <Text variant="caption" className="text-gray-500 text-xs whitespace-nowrap">
                            {Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d left
                        </Text>
                    )}
                </div>
            </div>
        </Card>
    );
};

// ============================================================
// 6. TOOL CARD
// ============================================================

interface ToolCardProps {
    title: string;
    description: string;
    icon: string;
    color: 'orange' | 'green' | 'blue' | 'purple';
    badge?: string;
    onClick: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
    title,
    description,
    icon,
    color,
    badge,
    onClick
}) => {
    const colorStyles = {
        orange: 'from-orange-500 to-amber-500 shadow-orange-500/30',
        green: 'from-green-500 to-emerald-500 shadow-green-500/30',
        blue: 'from-blue-500 to-indigo-500 shadow-blue-500/30',
        purple: 'from-purple-500 to-pink-500 shadow-purple-500/30'
    };

    return (
        <button
            onClick={onClick}
            className={`w-full bg-gradient-to-br ${colorStyles[color]} text-white rounded-2xl p-4 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-left relative overflow-hidden`}
        >
            {badge && (
                <div className="absolute top-2 right-2">
                    <Badge variant="dark" className="bg-white/20 text-white text-[10px]">
                        {badge}
                    </Badge>
                </div>
            )}

            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                    {icon}
                </div>
                <div>
                    <Text variant="h4" color="white">{title}</Text>
                    <Text variant="caption" className="text-white/70 text-xs">{description}</Text>
                </div>
            </div>
        </button>
    );
};

// ============================================================
// USAGE EXAMPLES
// ============================================================
/*

// Example 1: Enhanced Drill Card
<EnhancedDrillCard
    drill={drill}
    onClick={() => openDrill(drill.id)}
    isRecommended={recommendedDrillIds.includes(drill.id)}
    completedCount={getUserDrillCompletions(drill.id)}
/>

// Example 2: Enhanced Practice Timer
<EnhancedPracticeTimer
    onClose={() => setSessionActive(false)}
    onSave={(data) => saveSession(data)}
    enableAudio={true}
/>

// Example 3: Goal Card with history
<EnhancedGoalCard
    goal={goal}
    history={[42, 44, 45, 47, 49, 52, 55]} // Last 7 readings
    onEdit={() => openGoalEditor(goal.id)}
/>

// Example 4: Drill Filters
const [category, setCategory] = useState<DrillCategory>('ALL');
const [difficulty, setDifficulty] = useState<DrillDifficulty>('ALL');

<DrillFilters
    activeCategory={category}
    activeDifficulty={difficulty}
    onCategoryChange={setCategory}
    onDifficultyChange={setDifficulty}
    resultCount={filteredDrills.length}
/>

// Example 5: Tools section
<div className="grid grid-cols-2 gap-3">
    <ToolCard
        title="Tempo Trainer"
        description="Find your rhythm"
        icon="📏"
        color="orange"
        onClick={openTempoTool}
    />
    <ToolCard
        title="Bag of Shots"
        description="Track mastery"
        icon="🎯"
        color="green"
        badge="5/12"
        onClick={openBagOfShots}
    />
</div>

*/

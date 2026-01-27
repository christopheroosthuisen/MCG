/**
 * ============================================================
 * MCG - NEW FEATURES: PRACTICE GAMES & CHALLENGES
 * ============================================================
 *
 * Inspired by: CORE Golf, Perfect Practice Golf, SwingU
 *
 * This file contains components for gamified practice sessions:
 * - Practice Game Engine (Par 18, Up & Down, 21, Clock Drill, etc.)
 * - Random Practice Mode
 * - Practice Plan Builder
 * - Drill Scoring System
 *
 * Copy this entire file into your AI Studio project.
 * ============================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { COLORS } from '../constants';

// ============================================================
// TYPES
// ============================================================

export interface PracticeGame {
    id: string;
    name: string;
    category: 'PUTTING' | 'SHORT_GAME' | 'FULL_SWING' | 'MIXED';
    rules: string[];
    scoringType: 'POINTS' | 'STROKES' | 'PERCENTAGE' | 'COUNTDOWN';
    duration: number; // minutes
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    icon: string;
    description: string;
    targetScore?: number;
    personalBest?: number;
}

export interface GameSession {
    gameId: string;
    startTime: Date;
    currentScore: number;
    currentRound: number;
    totalRounds: number;
    shots: GameShot[];
    isComplete: boolean;
}

export interface GameShot {
    round: number;
    success: boolean;
    points: number;
    notes?: string;
}

export interface RandomShot {
    club: string;
    distance: number;
    shotType: string;
    lie: string;
    target: string;
}

export interface PracticePlan {
    id: string;
    name: string;
    focusAreas: string[];
    totalDuration: number;
    blocks: PracticeBlock[];
    targetWeakness?: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export interface PracticeBlock {
    order: number;
    type: 'WARMUP' | 'DRILL' | 'GAME' | 'COOLDOWN';
    duration: number;
    title: string;
    description?: string;
    drillId?: string;
    gameId?: string;
    notes?: string;
}

export interface DrillScore {
    drillId: string;
    date: Date;
    score: number;
    maxScore: number;
    notes?: string;
}

// ============================================================
// MOCK DATA - PRACTICE GAMES
// ============================================================

export const PRACTICE_GAMES: PracticeGame[] = [
    {
        id: 'par18',
        name: 'Par 18',
        category: 'MIXED',
        rules: [
            '18 random shots from different clubs/distances',
            'Score each shot like a hole (par 3)',
            'Perfect strike = birdie (2), Good = par (3), Miss = bogey+ (4+)',
            'Track total strokes vs par 54'
        ],
        scoringType: 'STROKES',
        duration: 30,
        difficulty: 'MEDIUM',
        icon: '⛳',
        description: 'Simulate on-course pressure with 18 varied shots',
        targetScore: 54,
        personalBest: 58
    },
    {
        id: 'updown',
        name: 'Up & Down Challenge',
        category: 'SHORT_GAME',
        rules: [
            '10 different short game scenarios',
            'Chip/pitch onto green and one-putt to save',
            '1 point for each successful up & down',
            'Target: 7/10 for low handicappers'
        ],
        scoringType: 'POINTS',
        duration: 20,
        difficulty: 'MEDIUM',
        icon: '🎯',
        description: 'Master the scoring shots from around the green',
        targetScore: 7,
        personalBest: 6
    },
    {
        id: 'putting100',
        name: '100-Point Putting',
        category: 'PUTTING',
        rules: [
            'Putts from 3, 6, 9, 12, and 15 feet',
            'Points: 3ft=1pt, 6ft=2pt, 9ft=3pt, 12ft=4pt, 15ft=5pt',
            '4 putts from each distance (20 total)',
            'Max score: 60 points'
        ],
        scoringType: 'POINTS',
        duration: 15,
        difficulty: 'EASY',
        icon: '🔵',
        description: 'Distance-based point system for putting mastery',
        targetScore: 45,
        personalBest: 42
    },
    {
        id: 'blackjack',
        name: '21 (Blackjack)',
        category: 'PUTTING',
        rules: [
            'Start 20 feet from hole',
            'Each putt scores based on proximity to hole',
            'In the hole = 5pts, Inside 1ft = 3pts, 1-3ft = 1pt',
            'Get as close to 21 as possible without going over'
        ],
        scoringType: 'COUNTDOWN',
        duration: 10,
        difficulty: 'EASY',
        icon: '🃏',
        description: 'Strategic putting game with risk/reward',
        targetScore: 21
    },
    {
        id: 'clockdrill',
        name: 'Clock Drill Pro',
        category: 'PUTTING',
        rules: [
            'Place balls at 12, 3, 6, and 9 o\'clock positions',
            'Start at 3 feet, progress to 4, 5, 6 feet',
            'Must make all 4 at each distance to advance',
            'Miss = restart that distance'
        ],
        scoringType: 'POINTS',
        duration: 15,
        difficulty: 'HARD',
        icon: '🕐',
        description: 'Pressure putting from all angles',
        targetScore: 16,
        personalBest: 12
    },
    {
        id: 'ladder',
        name: 'Ladder Challenge',
        category: 'FULL_SWING',
        rules: [
            'Hit to targets at 50, 75, 100, 125, 150 yards',
            'Must hit within 10% of distance to advance',
            '2 attempts per rung',
            'Track highest rung reached'
        ],
        scoringType: 'POINTS',
        duration: 20,
        difficulty: 'MEDIUM',
        icon: '🪜',
        description: 'Progressive distance control challenge',
        targetScore: 5,
        personalBest: 4
    }
];

// ============================================================
// PRACTICE GAME CARD
// ============================================================

export const PracticeGameCard: React.FC<{
    game: PracticeGame;
    onStart: (game: PracticeGame) => void;
    showPersonalBest?: boolean;
}> = ({ game, onStart, showPersonalBest = true }) => {
    const difficultyColors = {
        EASY: { bg: 'bg-green-100', text: 'text-green-700' },
        MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
        HARD: { bg: 'bg-red-100', text: 'text-red-700' }
    };

    const categoryIcons = {
        PUTTING: '🟢',
        SHORT_GAME: '🔶',
        FULL_SWING: '🔵',
        MIXED: '🎨'
    };

    return (
        <div
            className="bg-white rounded-3xl p-5 shadow-lg shadow-gray-200/50
                       hover:shadow-xl transition-all duration-300 cursor-pointer
                       hover:-translate-y-1 border border-gray-100"
            onClick={() => onStart(game)}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{game.icon}</span>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">{game.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm">{categoryIcons[game.category]}</span>
                            <span className="text-xs text-gray-500">{game.category.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold
                    ${difficultyColors[game.difficulty].bg}
                    ${difficultyColors[game.difficulty].text}`}>
                    {game.difficulty}
                </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">{game.description}</p>

            {/* Stats Row */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-bold text-gray-900">{game.duration}m</p>
                    </div>
                    {game.targetScore && (
                        <div className="text-center">
                            <p className="text-xs text-gray-500">Target</p>
                            <p className="font-bold text-gray-900">{game.targetScore}</p>
                        </div>
                    )}
                </div>
                {showPersonalBest && game.personalBest && (
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Personal Best</p>
                        <p className="font-bold" style={{ color: COLORS.primary }}>
                            {game.personalBest}
                        </p>
                    </div>
                )}
            </div>

            {/* Start Button */}
            <button
                className="w-full py-3 rounded-2xl font-bold text-white
                           transition-all duration-200 active:scale-[0.98]"
                style={{ backgroundColor: COLORS.primary }}
                onClick={(e) => {
                    e.stopPropagation();
                    onStart(game);
                }}
            >
                Start Game
            </button>
        </div>
    );
};

// ============================================================
// GAME SCORE TRACKER (Live Scoring)
// ============================================================

export const GameScoreTracker: React.FC<{
    game: PracticeGame;
    session: GameSession;
    onScoreUpdate: (shot: GameShot) => void;
    onComplete: () => void;
    onCancel: () => void;
}> = ({ game, session, onScoreUpdate, onComplete, onCancel }) => {
    const [showRules, setShowRules] = useState(false);

    const progress = (session.currentRound / session.totalRounds) * 100;
    const isLastRound = session.currentRound === session.totalRounds;

    const handleScore = (success: boolean, points: number) => {
        onScoreUpdate({
            round: session.currentRound,
            success,
            points
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={onCancel}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕ Exit
                        </button>
                        <div className="text-center">
                            <span className="text-2xl mr-2">{game.icon}</span>
                            <span className="font-bold text-gray-900">{game.name}</span>
                        </div>
                        <button
                            onClick={() => setShowRules(!showRules)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            📋 Rules
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${progress}%`,
                                backgroundColor: COLORS.primary
                            }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                        Round {session.currentRound} of {session.totalRounds}
                    </p>
                </div>
            </div>

            {/* Rules Dropdown */}
            {showRules && (
                <div className="mx-5 mt-4 bg-white rounded-2xl p-4 shadow-md">
                    <h4 className="font-bold mb-2">Rules</h4>
                    <ul className="space-y-2">
                        {game.rules.map((rule, i) => (
                            <li key={i} className="flex gap-2 text-sm text-gray-600">
                                <span className="text-gray-400">•</span>
                                {rule}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Score Display */}
            <div className="px-5 py-8">
                <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                        Current Score
                    </p>
                    <p
                        className="text-6xl font-black mb-4"
                        style={{ color: COLORS.primary }}
                    >
                        {session.currentScore}
                    </p>
                    {game.targetScore && (
                        <p className="text-sm text-gray-500">
                            Target: {game.targetScore} |
                            {game.personalBest && ` PB: ${game.personalBest}`}
                        </p>
                    )}
                </div>
            </div>

            {/* Scoring Buttons */}
            <div className="px-5 space-y-4">
                <p className="text-center text-gray-600 font-medium mb-4">
                    How did you do on this shot?
                </p>

                {game.scoringType === 'POINTS' && (
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => handleScore(false, 0)}
                            className="py-4 rounded-2xl font-bold bg-gray-200 text-gray-600
                                       active:scale-95 transition-all"
                        >
                            Miss (0)
                        </button>
                        <button
                            onClick={() => handleScore(true, 1)}
                            className="py-4 rounded-2xl font-bold bg-yellow-100 text-yellow-700
                                       active:scale-95 transition-all"
                        >
                            OK (1)
                        </button>
                        <button
                            onClick={() => handleScore(true, 2)}
                            className="py-4 rounded-2xl font-bold text-white
                                       active:scale-95 transition-all"
                            style={{ backgroundColor: COLORS.success }}
                        >
                            Great (2)
                        </button>
                    </div>
                )}

                {game.scoringType === 'STROKES' && (
                    <div className="grid grid-cols-4 gap-3">
                        {[2, 3, 4, 5].map((strokes) => (
                            <button
                                key={strokes}
                                onClick={() => handleScore(strokes <= 3, strokes)}
                                className={`py-4 rounded-2xl font-bold active:scale-95 transition-all
                                    ${strokes === 2 ? 'bg-green-500 text-white' : ''}
                                    ${strokes === 3 ? 'bg-blue-500 text-white' : ''}
                                    ${strokes === 4 ? 'bg-yellow-500 text-white' : ''}
                                    ${strokes === 5 ? 'bg-red-500 text-white' : ''}`}
                            >
                                {strokes}
                            </button>
                        ))}
                    </div>
                )}

                {game.scoringType === 'PERCENTAGE' && (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleScore(false, 0)}
                            className="py-6 rounded-2xl font-bold bg-red-100 text-red-700
                                       active:scale-95 transition-all text-xl"
                        >
                            ✗ Miss
                        </button>
                        <button
                            onClick={() => handleScore(true, 1)}
                            className="py-6 rounded-2xl font-bold text-white
                                       active:scale-95 transition-all text-xl"
                            style={{ backgroundColor: COLORS.success }}
                        >
                            ✓ Make
                        </button>
                    </div>
                )}
            </div>

            {/* Complete Button */}
            {isLastRound && (
                <div className="px-5 mt-8">
                    <button
                        onClick={onComplete}
                        className="w-full py-4 rounded-2xl font-bold text-white
                                   active:scale-95 transition-all"
                        style={{ backgroundColor: COLORS.secondary }}
                    >
                        Complete Game
                    </button>
                </div>
            )}

            {/* Shot History */}
            {session.shots.length > 0 && (
                <div className="px-5 mt-8">
                    <h4 className="font-bold text-gray-900 mb-3">Shot History</h4>
                    <div className="flex flex-wrap gap-2">
                        {session.shots.map((shot, i) => (
                            <div
                                key={i}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center
                                    font-bold text-sm
                                    ${shot.success
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'}`}
                            >
                                {shot.points}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================
// GAME RESULTS MODAL
// ============================================================

export const GameResultsModal: React.FC<{
    game: PracticeGame;
    session: GameSession;
    onClose: () => void;
    onPlayAgain: () => void;
    onShare?: () => void;
}> = ({ game, session, onClose, onPlayAgain, onShare }) => {
    const successCount = session.shots.filter(s => s.success).length;
    const successRate = Math.round((successCount / session.shots.length) * 100);
    const isNewPB = game.personalBest && session.currentScore > game.personalBest;
    const beatTarget = game.targetScore &&
        (game.scoringType === 'STROKES'
            ? session.currentScore <= game.targetScore
            : session.currentScore >= game.targetScore);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-bounce-in">
                {/* Header */}
                <div
                    className="p-6 text-center text-white"
                    style={{
                        background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`
                    }}
                >
                    {isNewPB && (
                        <div className="mb-2">
                            <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full
                                           text-xs font-bold uppercase">
                                🏆 New Personal Best!
                            </span>
                        </div>
                    )}
                    <span className="text-5xl mb-2 block">{game.icon}</span>
                    <h2 className="text-2xl font-bold">{game.name}</h2>
                    <p className="text-white/80 text-sm mt-1">Game Complete</p>
                </div>

                {/* Score */}
                <div className="p-6 text-center border-b border-gray-100">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                        Final Score
                    </p>
                    <p
                        className="text-5xl font-black"
                        style={{ color: beatTarget ? COLORS.success : COLORS.primary }}
                    >
                        {session.currentScore}
                    </p>
                    {game.targetScore && (
                        <p className={`text-sm mt-2 font-medium
                            ${beatTarget ? 'text-green-600' : 'text-gray-500'}`}>
                            {beatTarget ? '✓ Target achieved!' : `Target: ${game.targetScore}`}
                        </p>
                    )}
                </div>

                {/* Stats */}
                <div className="p-6 grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{successCount}</p>
                        <p className="text-xs text-gray-500">Successes</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
                        <p className="text-xs text-gray-500">Success Rate</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{session.totalRounds}</p>
                        <p className="text-xs text-gray-500">Total Shots</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 space-y-3">
                    <button
                        onClick={onPlayAgain}
                        className="w-full py-4 rounded-2xl font-bold text-white
                                   active:scale-95 transition-all"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        Play Again
                    </button>
                    <div className="flex gap-3">
                        {onShare && (
                            <button
                                onClick={onShare}
                                className="flex-1 py-3 rounded-2xl font-bold border-2
                                           active:scale-95 transition-all"
                                style={{
                                    borderColor: COLORS.primary,
                                    color: COLORS.primary
                                }}
                            >
                                Share
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-2xl font-bold bg-gray-200 text-gray-700
                                       active:scale-95 transition-all"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// GAME LEADERBOARD
// ============================================================

interface LeaderboardEntry {
    rank: number;
    playerName: string;
    score: number;
    date: Date;
    isCurrentUser: boolean;
}

export const GameLeaderboard: React.FC<{
    game: PracticeGame;
    entries: LeaderboardEntry[];
    onClose: () => void;
}> = ({ game, entries, onClose }) => {
    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
            {/* Header */}
            <div
                className="p-5 text-white"
                style={{ backgroundColor: COLORS.secondary }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{game.icon}</span>
                        <div>
                            <h3 className="font-bold">{game.name}</h3>
                            <p className="text-white/70 text-sm">Leaderboard</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white">
                        ✕
                    </button>
                </div>
            </div>

            {/* Entries */}
            <div className="divide-y divide-gray-100">
                {entries.map((entry) => (
                    <div
                        key={entry.rank}
                        className={`px-5 py-4 flex items-center justify-between
                            ${entry.isCurrentUser ? 'bg-orange-50' : ''}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                font-bold text-sm
                                ${entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' : ''}
                                ${entry.rank === 2 ? 'bg-gray-300 text-gray-700' : ''}
                                ${entry.rank === 3 ? 'bg-orange-300 text-orange-900' : ''}
                                ${entry.rank > 3 ? 'bg-gray-100 text-gray-600' : ''}`}>
                                {entry.rank}
                            </div>
                            <div>
                                <p className={`font-medium ${entry.isCurrentUser ? 'text-orange-600' : 'text-gray-900'}`}>
                                    {entry.playerName}
                                    {entry.isCurrentUser && ' (You)'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {entry.date.toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <p className="text-xl font-bold" style={{ color: COLORS.primary }}>
                            {entry.score}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================
// RANDOM SHOT GENERATOR
// ============================================================

const CLUBS = ['PW', '9i', '8i', '7i', '6i', '5i', 'HY', '3W', 'DR'];
const SHOT_TYPES = ['Standard', 'Draw', 'Fade', 'Punch', 'Flop', 'Bump & Run'];
const LIES = ['Fairway', 'Light Rough', 'Heavy Rough', 'Uphill', 'Downhill', 'Sidehill'];
const TARGETS = ['Center of Green', 'Front Pin', 'Back Pin', 'Left Side', 'Right Side'];

export const RandomShotGenerator: React.FC<{
    onGenerate?: (shot: RandomShot) => void;
}> = ({ onGenerate }) => {
    const [currentShot, setCurrentShot] = useState<RandomShot | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [shotCount, setShotCount] = useState(0);

    const generateShot = useCallback(() => {
        setIsGenerating(true);

        // Simulate quick shuffle animation
        setTimeout(() => {
            const club = CLUBS[Math.floor(Math.random() * CLUBS.length)];
            const baseDistance = {
                'PW': 125, '9i': 135, '8i': 145, '7i': 155,
                '6i': 165, '5i': 175, 'HY': 190, '3W': 220, 'DR': 260
            }[club] || 150;

            const distance = baseDistance + Math.floor(Math.random() * 20) - 10;
            const shotType = SHOT_TYPES[Math.floor(Math.random() * SHOT_TYPES.length)];
            const lie = LIES[Math.floor(Math.random() * LIES.length)];
            const target = TARGETS[Math.floor(Math.random() * TARGETS.length)];

            const shot: RandomShot = { club, distance, shotType, lie, target };
            setCurrentShot(shot);
            setShotCount(prev => prev + 1);
            setIsGenerating(false);
            onGenerate?.(shot);
        }, 500);
    }, [onGenerate]);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">Random Practice</h3>
                    <p className="text-sm text-gray-500">Eliminate block practice</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                        {shotCount}
                    </p>
                    <p className="text-xs text-gray-500">Shots</p>
                </div>
            </div>

            {/* Current Shot Display */}
            {currentShot && !isGenerating && (
                <div className="mb-6 space-y-4">
                    {/* Main Shot Info */}
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                        <p className="text-sm text-gray-500 mb-1">Shot</p>
                        <p className="text-4xl font-black text-gray-900">
                            {currentShot.club}
                        </p>
                        <p className="text-xl font-bold mt-1" style={{ color: COLORS.primary }}>
                            {currentShot.distance} yards
                        </p>
                    </div>

                    {/* Shot Details Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-500">Shot Type</p>
                            <p className="font-bold text-sm text-gray-900">{currentShot.shotType}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-500">Lie</p>
                            <p className="font-bold text-sm text-gray-900">{currentShot.lie}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-500">Target</p>
                            <p className="font-bold text-sm text-gray-900">{currentShot.target}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Button */}
            <button
                onClick={generateShot}
                disabled={isGenerating}
                className={`w-full py-4 rounded-2xl font-bold text-white
                           transition-all duration-200
                           ${isGenerating ? 'opacity-70' : 'active:scale-[0.98]'}`}
                style={{ backgroundColor: COLORS.primary }}
            >
                {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">🎲</span>
                        Generating...
                    </span>
                ) : currentShot ? (
                    'Next Shot'
                ) : (
                    'Generate Shot'
                )}
            </button>

            {/* Variability Meter */}
            {shotCount > 5 && (
                <div className="mt-4 p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Practice Variability</span>
                        <span className="text-sm font-bold text-green-700">Excellent</span>
                    </div>
                    <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                        <div
                            className="h-full rounded-full bg-green-500 transition-all"
                            style={{ width: `${Math.min(100, shotCount * 10)}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================
// PRACTICE PLAN VIEW
// ============================================================

export const PracticePlanView: React.FC<{
    plan: PracticePlan;
    currentBlockIndex: number;
    onBlockComplete: (index: number) => void;
    onPlanComplete: () => void;
}> = ({ plan, currentBlockIndex, onBlockComplete, onPlanComplete }) => {
    const completedBlocks = currentBlockIndex;
    const progress = (completedBlocks / plan.blocks.length) * 100;
    const totalTime = plan.blocks.reduce((sum, b) => sum + b.duration, 0);
    const remainingTime = plan.blocks
        .slice(currentBlockIndex)
        .reduce((sum, b) => sum + b.duration, 0);

    const blockTypeIcons = {
        WARMUP: '🔥',
        DRILL: '⚡',
        GAME: '🎮',
        COOLDOWN: '❄️'
    };

    const blockTypeColors = {
        WARMUP: 'bg-orange-100 border-orange-300',
        DRILL: 'bg-blue-100 border-blue-300',
        GAME: 'bg-purple-100 border-purple-300',
        COOLDOWN: 'bg-cyan-100 border-cyan-300'
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-5 py-4">
                    <h2 className="font-bold text-xl text-gray-900">{plan.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        {plan.focusAreas.map((area, i) => (
                            <span
                                key={i}
                                className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600"
                            >
                                {area}
                            </span>
                        ))}
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-500">
                                Block {currentBlockIndex + 1} of {plan.blocks.length}
                            </span>
                            <span className="font-medium" style={{ color: COLORS.primary }}>
                                {remainingTime} min remaining
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${progress}%`,
                                    backgroundColor: COLORS.primary
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Blocks */}
            <div className="px-5 py-6 space-y-4">
                {plan.blocks.map((block, index) => {
                    const isCompleted = index < currentBlockIndex;
                    const isCurrent = index === currentBlockIndex;
                    const isUpcoming = index > currentBlockIndex;

                    return (
                        <div
                            key={index}
                            className={`rounded-2xl border-2 p-4 transition-all duration-300
                                ${isCurrent ? blockTypeColors[block.type] : ''}
                                ${isCompleted ? 'bg-green-50 border-green-300 opacity-70' : ''}
                                ${isUpcoming ? 'bg-white border-gray-200 opacity-50' : ''}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">
                                        {isCompleted ? '✅' : blockTypeIcons[block.type]}
                                    </span>
                                    <div>
                                        <p className="font-bold text-gray-900">{block.title}</p>
                                        {block.description && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                {block.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs text-gray-500">
                                                {block.duration} min
                                            </span>
                                            <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full text-gray-600">
                                                {block.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {isCurrent && (
                                    <button
                                        onClick={() => onBlockComplete(index)}
                                        className="px-4 py-2 rounded-xl font-bold text-white
                                                   active:scale-95 transition-all"
                                        style={{ backgroundColor: COLORS.success }}
                                    >
                                        Done
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Complete Plan Button */}
            {currentBlockIndex >= plan.blocks.length && (
                <div className="px-5 mt-4">
                    <button
                        onClick={onPlanComplete}
                        className="w-full py-4 rounded-2xl font-bold text-white
                                   active:scale-95 transition-all"
                        style={{ backgroundColor: COLORS.secondary }}
                    >
                        Complete Practice Session
                    </button>
                </div>
            )}
        </div>
    );
};

// ============================================================
// PRACTICE PLAN CARD (for selection)
// ============================================================

export const PracticePlanCard: React.FC<{
    plan: PracticePlan;
    onStart: (plan: PracticePlan) => void;
}> = ({ plan, onStart }) => {
    const difficultyColors = {
        BEGINNER: 'bg-green-100 text-green-700',
        INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
        ADVANCED: 'bg-red-100 text-red-700'
    };

    return (
        <div
            className="bg-white rounded-3xl p-5 shadow-lg cursor-pointer
                       hover:-translate-y-1 transition-all duration-300"
            onClick={() => onStart(plan)}
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {plan.blocks.length} activities • {plan.totalDuration} min
                    </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold
                    ${difficultyColors[plan.difficulty]}`}>
                    {plan.difficulty}
                </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {plan.focusAreas.map((area, i) => (
                    <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                    >
                        {area}
                    </span>
                ))}
            </div>

            {/* Block Preview */}
            <div className="flex gap-1 mb-4">
                {plan.blocks.map((block, i) => (
                    <div
                        key={i}
                        className={`h-2 rounded-full flex-1
                            ${block.type === 'WARMUP' ? 'bg-orange-300' : ''}
                            ${block.type === 'DRILL' ? 'bg-blue-300' : ''}
                            ${block.type === 'GAME' ? 'bg-purple-300' : ''}
                            ${block.type === 'COOLDOWN' ? 'bg-cyan-300' : ''}`}
                    />
                ))}
            </div>

            <button
                className="w-full py-3 rounded-2xl font-bold text-white
                           active:scale-95 transition-all"
                style={{ backgroundColor: COLORS.primary }}
            >
                Start Plan
            </button>
        </div>
    );
};

// ============================================================
// DRILL SCORE INPUT & HISTORY
// ============================================================

export const DrillScoreInput: React.FC<{
    drillName: string;
    maxScore: number;
    onSubmit: (score: number, notes?: string) => void;
}> = ({ drillName, maxScore, onSubmit }) => {
    const [score, setScore] = useState<number>(0);
    const [notes, setNotes] = useState('');

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 text-lg mb-4">{drillName}</h3>

            {/* Score Input */}
            <div className="mb-6">
                <label className="text-sm text-gray-500 block mb-2">
                    Score (out of {maxScore})
                </label>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setScore(Math.max(0, score - 1))}
                        className="w-12 h-12 rounded-xl bg-gray-200 font-bold text-xl
                                   active:scale-95 transition-all"
                    >
                        -
                    </button>
                    <div className="flex-1 text-center">
                        <span
                            className="text-5xl font-black"
                            style={{ color: COLORS.primary }}
                        >
                            {score}
                        </span>
                        <span className="text-gray-400 text-2xl"> / {maxScore}</span>
                    </div>
                    <button
                        onClick={() => setScore(Math.min(maxScore, score + 1))}
                        className="w-12 h-12 rounded-xl font-bold text-xl text-white
                                   active:scale-95 transition-all"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                            width: `${(score / maxScore) * 100}%`,
                            backgroundColor: COLORS.success
                        }}
                    />
                </div>
                <p className="text-sm text-gray-500 text-center mt-2">
                    {Math.round((score / maxScore) * 100)}% Success Rate
                </p>
            </div>

            {/* Notes */}
            <div className="mb-6">
                <label className="text-sm text-gray-500 block mb-2">Notes (optional)</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How did the drill feel? Any observations?"
                    className="w-full p-3 rounded-xl border border-gray-300 focus:border-orange-500
                               focus:ring-2 focus:ring-orange-500/20 outline-none resize-none"
                    rows={3}
                />
            </div>

            {/* Submit */}
            <button
                onClick={() => onSubmit(score, notes)}
                className="w-full py-4 rounded-2xl font-bold text-white
                           active:scale-95 transition-all"
                style={{ backgroundColor: COLORS.primary }}
            >
                Save Score
            </button>
        </div>
    );
};

// ============================================================
// DRILL HISTORY CHART
// ============================================================

export const DrillHistoryChart: React.FC<{
    drillName: string;
    history: DrillScore[];
    maxScore: number;
}> = ({ drillName, history, maxScore }) => {
    const recentHistory = history.slice(-10);
    const maxValue = Math.max(...recentHistory.map(h => h.score), maxScore);
    const personalBest = Math.max(...history.map(h => h.score));
    const average = history.reduce((sum, h) => sum + h.score, 0) / history.length;
    const trend = recentHistory.length >= 2
        ? recentHistory[recentHistory.length - 1].score - recentHistory[0].score
        : 0;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-bold text-gray-900">{drillName}</h3>
                    <p className="text-sm text-gray-500">Last {recentHistory.length} attempts</p>
                </div>
                {personalBest >= maxScore && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                        🏆 Perfect Score
                    </span>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                        {personalBest}
                    </p>
                    <p className="text-xs text-gray-500">Best</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-700">
                        {average.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500">Avg</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className={`text-2xl font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend >= 0 ? '+' : ''}{trend}
                    </p>
                    <p className="text-xs text-gray-500">Trend</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-32 flex items-end gap-1">
                {recentHistory.map((entry, i) => (
                    <div
                        key={i}
                        className="flex-1 flex flex-col items-center"
                    >
                        <div
                            className="w-full rounded-t-lg transition-all duration-500"
                            style={{
                                height: `${(entry.score / maxValue) * 100}%`,
                                backgroundColor: entry.score === personalBest
                                    ? COLORS.primary
                                    : '#E5E7EB',
                                minHeight: '8px'
                            }}
                        />
                        <span className="text-xs text-gray-400 mt-1">
                            {entry.date.getMonth() + 1}/{entry.date.getDate()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================
// PERSONAL RECORD BADGE
// ============================================================

export const PersonalRecordBadge: React.FC<{
    isNewPR: boolean;
    previousBest?: number;
    newScore: number;
}> = ({ isNewPR, previousBest, newScore }) => {
    if (!isNewPR) return null;

    return (
        <div className="flex items-center justify-center">
            <div
                className="px-6 py-3 rounded-2xl text-center animate-pulse"
                style={{
                    background: `linear-gradient(135deg, #FFD700, ${COLORS.primary})`
                }}
            >
                <span className="text-2xl">🏆</span>
                <p className="text-white font-bold text-lg mt-1">New Personal Record!</p>
                {previousBest && (
                    <p className="text-white/80 text-sm">
                        Previous: {previousBest} → New: {newScore}
                    </p>
                )}
            </div>
        </div>
    );
};

// ============================================================
// MOCK DATA - PRACTICE PLANS
// ============================================================

export const MOCK_PRACTICE_PLANS: PracticePlan[] = [
    {
        id: 'pp1',
        name: 'Short Game Sharpener',
        focusAreas: ['Chipping', 'Putting', 'Wedges'],
        totalDuration: 45,
        difficulty: 'INTERMEDIATE',
        targetWeakness: 'Around the Green',
        blocks: [
            { order: 1, type: 'WARMUP', duration: 5, title: 'Stretch & Mobility', description: 'Golf-specific stretches' },
            { order: 2, type: 'DRILL', duration: 10, title: 'Gate Putting', description: 'Work on start line' },
            { order: 3, type: 'GAME', duration: 10, title: '21 Blackjack', description: 'Lag putting game', gameId: 'blackjack' },
            { order: 4, type: 'DRILL', duration: 10, title: 'Towel Drill', description: 'Chip contact control' },
            { order: 5, type: 'GAME', duration: 8, title: 'Up & Down', description: '10 scenarios', gameId: 'updown' },
            { order: 6, type: 'COOLDOWN', duration: 2, title: 'Stretch', description: 'Cool down stretches' }
        ]
    },
    {
        id: 'pp2',
        name: 'Full Swing Focus',
        focusAreas: ['Driver', 'Irons', 'Distance Control'],
        totalDuration: 60,
        difficulty: 'ADVANCED',
        blocks: [
            { order: 1, type: 'WARMUP', duration: 10, title: 'Dynamic Warmup', description: 'Full body activation' },
            { order: 2, type: 'DRILL', duration: 15, title: 'Perfect Takeaway', description: 'First 2 feet of swing' },
            { order: 3, type: 'GAME', duration: 15, title: 'Ladder Challenge', description: 'Distance targets', gameId: 'ladder' },
            { order: 4, type: 'DRILL', duration: 10, title: 'Driver Tempo', description: '3/4 swing focus' },
            { order: 5, type: 'GAME', duration: 8, title: 'Par 18', description: 'Full simulation', gameId: 'par18' },
            { order: 6, type: 'COOLDOWN', duration: 2, title: 'Stretch', description: 'Hip and shoulder stretches' }
        ]
    },
    {
        id: 'pp3',
        name: 'Putting Perfection',
        focusAreas: ['Short Putts', 'Lag Putting', 'Speed Control'],
        totalDuration: 30,
        difficulty: 'BEGINNER',
        blocks: [
            { order: 1, type: 'WARMUP', duration: 3, title: 'Eye Line Check', description: 'Setup fundamentals' },
            { order: 2, type: 'DRILL', duration: 7, title: 'Gate Putting', description: '3-foot gates' },
            { order: 3, type: 'GAME', duration: 8, title: 'Clock Drill', description: 'Pressure putts', gameId: 'clockdrill' },
            { order: 4, type: 'GAME', duration: 10, title: '100-Point Putting', description: 'Distance challenge', gameId: 'putting100' },
            { order: 5, type: 'COOLDOWN', duration: 2, title: 'Free Putting', description: 'Feel the stroke' }
        ]
    }
];

// ============================================================
// GAMES BROWSER (Main View)
// ============================================================

export const PracticeGamesBrowser: React.FC<{
    onStartGame: (game: PracticeGame) => void;
    onStartPlan: (plan: PracticePlan) => void;
}> = ({ onStartGame, onStartPlan }) => {
    const [activeTab, setActiveTab] = useState<'GAMES' | 'PLANS' | 'RANDOM'>('GAMES');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

    const categories = ['ALL', 'PUTTING', 'SHORT_GAME', 'FULL_SWING', 'MIXED'];
    const filteredGames = selectedCategory === 'ALL'
        ? PRACTICE_GAMES
        : PRACTICE_GAMES.filter(g => g.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-5 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Practice Games</h1>
                    <p className="text-sm text-gray-500">Transform practice into play</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    {(['GAMES', 'PLANS', 'RANDOM'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wide
                                border-b-2 transition-all
                                ${activeTab === tab
                                    ? 'border-orange-500 text-gray-900'
                                    : 'border-transparent text-gray-400'}`}
                            style={activeTab === tab ? { borderColor: COLORS.primary } : {}}
                        >
                            {tab === 'GAMES' && '🎮 '}
                            {tab === 'PLANS' && '📋 '}
                            {tab === 'RANDOM' && '🎲 '}
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="px-5 py-6">
                {activeTab === 'GAMES' && (
                    <>
                        {/* Category Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-4 -mx-5 px-5">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                                        transition-all
                                        ${selectedCategory === cat
                                            ? 'text-white'
                                            : 'bg-white text-gray-600 border border-gray-200'}`}
                                    style={selectedCategory === cat
                                        ? { backgroundColor: COLORS.primary }
                                        : {}}
                                >
                                    {cat.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        {/* Games Grid */}
                        <div className="grid gap-4">
                            {filteredGames.map((game) => (
                                <PracticeGameCard
                                    key={game.id}
                                    game={game}
                                    onStart={onStartGame}
                                />
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'PLANS' && (
                    <div className="grid gap-4">
                        {MOCK_PRACTICE_PLANS.map((plan) => (
                            <PracticePlanCard
                                key={plan.id}
                                plan={plan}
                                onStart={onStartPlan}
                            />
                        ))}
                    </div>
                )}

                {activeTab === 'RANDOM' && (
                    <RandomShotGenerator />
                )}
            </div>
        </div>
    );
};

// ============================================================
// HOOK: usePracticeGame
// ============================================================

export const usePracticeGame = (game: PracticeGame) => {
    const [session, setSession] = useState<GameSession>({
        gameId: game.id,
        startTime: new Date(),
        currentScore: 0,
        currentRound: 1,
        totalRounds: game.scoringType === 'STROKES' ? 18 :
                     game.id === 'updown' ? 10 :
                     game.id === 'putting100' ? 20 :
                     game.id === 'clockdrill' ? 16 : 10,
        shots: [],
        isComplete: false
    });

    const updateScore = (shot: GameShot) => {
        setSession(prev => ({
            ...prev,
            currentScore: prev.currentScore + shot.points,
            currentRound: prev.currentRound + 1,
            shots: [...prev.shots, shot],
            isComplete: prev.currentRound >= prev.totalRounds
        }));
    };

    const completeGame = () => {
        setSession(prev => ({ ...prev, isComplete: true }));
    };

    const resetGame = () => {
        setSession({
            gameId: game.id,
            startTime: new Date(),
            currentScore: 0,
            currentRound: 1,
            totalRounds: session.totalRounds,
            shots: [],
            isComplete: false
        });
    };

    return { session, updateScore, completeGame, resetGame };
};

// ============================================================
// CSS ANIMATIONS (Add to your global styles)
// ============================================================

/*
@keyframes bounce-in {
    0% { transform: scale(0.5); opacity: 0; }
    70% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
}

.animate-bounce-in {
    animation: bounce-in 0.4s ease-out;
}
*/

// ============================================================
// USAGE EXAMPLE
// ============================================================

/*
import {
    PracticeGamesBrowser,
    GameScoreTracker,
    GameResultsModal,
    usePracticeGame,
    PRACTICE_GAMES
} from './NewFeatures_PracticeGames';

const PracticeGamesScreen: React.FC = () => {
    const [activeGame, setActiveGame] = useState<PracticeGame | null>(null);
    const [showResults, setShowResults] = useState(false);

    if (!activeGame) {
        return (
            <PracticeGamesBrowser
                onStartGame={setActiveGame}
                onStartPlan={(plan) => console.log('Start plan:', plan)}
            />
        );
    }

    const { session, updateScore, completeGame, resetGame } = usePracticeGame(activeGame);

    if (showResults) {
        return (
            <GameResultsModal
                game={activeGame}
                session={session}
                onClose={() => {
                    setActiveGame(null);
                    setShowResults(false);
                }}
                onPlayAgain={() => {
                    resetGame();
                    setShowResults(false);
                }}
            />
        );
    }

    return (
        <GameScoreTracker
            game={activeGame}
            session={session}
            onScoreUpdate={updateScore}
            onComplete={() => setShowResults(true)}
            onCancel={() => setActiveGame(null)}
        />
    );
};
*/

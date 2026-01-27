/**
 * ============================================================
 * MCG - NEW FEATURES: GREEN READING & PUTTING LAB
 * ============================================================
 *
 * Inspired by: Putt Vision, AimPoint, Tour Read Golf, Slopegraide
 *
 * This file contains components for putting mastery:
 * - Green Reading Trainer
 * - AimPoint Calculator
 * - Putting Speed Trainer
 * - Putting Statistics Dashboard
 * - Virtual Putting Games
 *
 * Copy this entire file into your AI Studio project.
 * ============================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { COLORS } from '../constants';

// ============================================================
// TYPES
// ============================================================

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

export interface PuttingSession {
    id: string;
    date: Date;
    totalPutts: number;
    makeRate: number;
    avgDistance: number;
    drillType: string;
}

// ============================================================
// MOCK DATA
// ============================================================

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

// ============================================================
// AIMPOINT CALCULATOR
// ============================================================

export const AimPointCalculator: React.FC<{
    onCalculate?: (reading: GreenReading) => void;
}> = ({ onCalculate }) => {
    const [slope, setSlope] = useState(2);
    const [direction, setDirection] = useState<'LEFT' | 'RIGHT'>('RIGHT');
    const [distance, setDistance] = useState(10);
    const [stimp, setStimp] = useState(10);
    const [verticalSlope, setVerticalSlope] = useState<'FLAT' | 'UPHILL' | 'DOWNHILL'>('FLAT');

    // Calculate aim point based on AimPoint Express methodology
    const calculation = useMemo(() => {
        // Simplified AimPoint calculation
        // Real AimPoint uses foot calibration and more complex physics

        // Break amount increases with: slope, distance, stimp
        const slopeMultiplier = slope / 100;
        const distanceEffect = Math.sqrt(distance) * 2;
        const stimpEffect = stimp / 10;
        const verticalEffect = verticalSlope === 'UPHILL' ? 0.8 :
                               verticalSlope === 'DOWNHILL' ? 1.3 : 1.0;

        const breakAmount = slopeMultiplier * distanceEffect * stimpEffect * verticalEffect * 12; // inches
        const aimPoint = breakAmount / 2; // Aim point is roughly half the total break at entry

        // Speed factor for downhill/uphill
        const speedFactor = verticalSlope === 'DOWNHILL' ? 'Easy pace - ball will roll out' :
                           verticalSlope === 'UPHILL' ? 'Firm stroke needed' :
                           'Normal pace';

        return {
            breakAmount: Math.round(breakAmount * 10) / 10,
            aimPoint: Math.round(aimPoint * 10) / 10,
            speedFactor,
            cupEdge: Math.ceil(aimPoint / 2.125) // 2.125" is half cup width
        };
    }, [slope, distance, stimp, verticalSlope]);

    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Header */}
            <div
                className="p-6 text-center text-white"
                style={{ backgroundColor: COLORS.secondary }}
            >
                <h2 className="text-xl font-bold">AimPoint Calculator</h2>
                <p className="text-white/70 text-sm mt-1">Find your aim point</p>
            </div>

            <div className="p-6 space-y-6">
                {/* Slope Input */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Slope</label>
                        <span className="text-sm font-bold" style={{ color: COLORS.primary }}>{slope}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="6"
                        step="0.5"
                        value={slope}
                        onChange={(e) => setSlope(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Flat</span>
                        <span>Moderate</span>
                        <span>Severe</span>
                    </div>
                </div>

                {/* Break Direction */}
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Break Direction</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setDirection('LEFT')}
                            className={`py-3 rounded-xl font-bold transition-all
                                ${direction === 'LEFT' ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                            style={direction === 'LEFT' ? { backgroundColor: COLORS.primary } : {}}
                        >
                            ← Left to Right
                        </button>
                        <button
                            onClick={() => setDirection('RIGHT')}
                            className={`py-3 rounded-xl font-bold transition-all
                                ${direction === 'RIGHT' ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                            style={direction === 'RIGHT' ? { backgroundColor: COLORS.primary } : {}}
                        >
                            Right to Left →
                        </button>
                    </div>
                </div>

                {/* Vertical Slope */}
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Hill</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['UPHILL', 'FLAT', 'DOWNHILL'] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setVerticalSlope(v)}
                                className={`py-2 rounded-xl text-sm font-medium transition-all
                                    ${verticalSlope === v ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                                style={verticalSlope === v ? { backgroundColor: COLORS.primary } : {}}
                            >
                                {v === 'UPHILL' && '↑ Uphill'}
                                {v === 'FLAT' && '— Flat'}
                                {v === 'DOWNHILL' && '↓ Downhill'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Distance */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Distance</label>
                        <span className="text-sm font-bold" style={{ color: COLORS.primary }}>{distance} ft</span>
                    </div>
                    <input
                        type="range"
                        min="3"
                        max="30"
                        value={distance}
                        onChange={(e) => setDistance(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Green Speed */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Green Speed (Stimp)</label>
                        <span className="text-sm font-bold" style={{ color: COLORS.primary }}>{stimp}</span>
                    </div>
                    <input
                        type="range"
                        min="7"
                        max="14"
                        step="0.5"
                        value={stimp}
                        onChange={(e) => setStimp(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Slow (7)</span>
                        <span>Tour (11)</span>
                        <span>Fast (14)</span>
                    </div>
                </div>

                {/* Result */}
                <div className="p-6 rounded-2xl" style={{ backgroundColor: `${COLORS.secondary}15` }}>
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-500">Aim Point</p>
                        <p className="text-4xl font-black" style={{ color: COLORS.secondary }}>
                            {calculation.aimPoint}"
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            {direction === 'LEFT' ? 'Right' : 'Left'} of center
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-500">Total Break</p>
                            <p className="text-xl font-bold text-gray-900">{calculation.breakAmount}"</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Cup Edges</p>
                            <p className="text-xl font-bold text-gray-900">{calculation.cupEdge}</p>
                        </div>
                    </div>

                    <p className="text-center text-sm text-gray-600 mt-4">
                        {calculation.speedFactor}
                    </p>
                </div>

                {/* Visual Break Line */}
                <div className="relative h-40 bg-green-100 rounded-2xl overflow-hidden">
                    {/* Green surface */}
                    <div className="absolute inset-0 bg-gradient-to-b from-green-200 to-green-300" />

                    {/* Hole */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-600" />

                    {/* Ball */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border border-gray-300" />

                    {/* Break line */}
                    <svg className="absolute inset-0" viewBox="0 0 200 160">
                        <path
                            d={`M 100 140 Q ${direction === 'LEFT' ? 100 + calculation.breakAmount * 2 : 100 - calculation.breakAmount * 2} 80 100 30`}
                            stroke={COLORS.primary}
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            fill="none"
                        />
                        {/* Aim point marker */}
                        <circle
                            cx={direction === 'LEFT' ? 100 + calculation.aimPoint * 2 : 100 - calculation.aimPoint * 2}
                            cy={30}
                            r="4"
                            fill={COLORS.primary}
                        />
                    </svg>

                    {/* Labels */}
                    <div className="absolute top-2 left-2 text-xs text-green-800 font-medium">
                        {slope}% {direction === 'LEFT' ? '→' : '←'}
                    </div>
                    <div className="absolute bottom-2 right-2 text-xs text-green-800 font-medium">
                        {distance} ft
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// PUTTING STATS DASHBOARD
// ============================================================

export const PuttingStatsDashboard: React.FC<{
    stats: PuttingStats;
    tourAverages?: PuttingStats;
}> = ({ stats, tourAverages = TOUR_AVERAGES }) => {
    const distances = [
        { label: '3 ft', yours: stats.threeFootMake, tour: tourAverages.threeFootMake },
        { label: '6 ft', yours: stats.sixFootMake, tour: tourAverages.sixFootMake },
        { label: '10 ft', yours: stats.tenFootMake, tour: tourAverages.tenFootMake },
        { label: '15 ft', yours: stats.fifteenFootMake, tour: tourAverages.fifteenFootMake },
        { label: '20 ft', yours: stats.twentyFootMake, tour: tourAverages.twentyFootMake }
    ];

    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="p-6" style={{ backgroundColor: `${COLORS.primary}15` }}>
                <h3 className="font-bold text-gray-900 text-lg">Putting Statistics</h3>
                <p className="text-sm text-gray-600">{stats.roundsTracked} rounds tracked</p>
            </div>

            <div className="p-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-3xl font-black" style={{ color: COLORS.primary }}>
                            {stats.puttsPerRound.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">Putts/Round</p>
                        <p className={`text-xs mt-1 ${stats.puttsPerRound <= tourAverages.puttsPerRound ? 'text-green-600' : 'text-red-600'}`}>
                            Tour: {tourAverages.puttsPerRound}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-3xl font-black" style={{ color: COLORS.primary }}>
                            {stats.firstPuttProximity.toFixed(1)}'
                        </p>
                        <p className="text-xs text-gray-500">1st Putt Prox</p>
                        <p className={`text-xs mt-1 ${stats.firstPuttProximity <= tourAverages.firstPuttProximity ? 'text-green-600' : 'text-red-600'}`}>
                            Tour: {tourAverages.firstPuttProximity}'
                        </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-3xl font-black" style={{ color: COLORS.primary }}>
                            {stats.threeputts.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">3-Putts/Rnd</p>
                        <p className={`text-xs mt-1 ${stats.threeputts <= tourAverages.threeputts ? 'text-green-600' : 'text-red-600'}`}>
                            Tour: {tourAverages.threeputts}
                        </p>
                    </div>
                </div>

                {/* Make Percentage by Distance */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-900">Make % by Distance</h4>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.primary }} />
                                <span>You</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-gray-300" />
                                <span>Tour</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {distances.map((d) => {
                            const vsTour = d.yours - d.tour;
                            return (
                                <div key={d.label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">{d.label}</span>
                                        <span className={`font-bold ${vsTour >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {d.yours}% ({vsTour >= 0 ? '+' : ''}{vsTour}%)
                                        </span>
                                    </div>
                                    <div className="relative h-4 bg-gray-200 rounded-full">
                                        {/* Tour average marker */}
                                        <div
                                            className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
                                            style={{ left: `${d.tour}%` }}
                                        />
                                        {/* Your percentage */}
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${d.yours}%`,
                                                backgroundColor: vsTour >= 0 ? COLORS.success : COLORS.primary
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Total Stats */}
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPutts.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total putts tracked</p>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// PUTTING SPEED TRAINER
// ============================================================

export const PuttingSpeedTrainer: React.FC<{
    onComplete?: (results: { distance: number; proximity: number }[]) => void;
}> = ({ onComplete }) => {
    const [currentDistance, setCurrentDistance] = useState(20);
    const [results, setResults] = useState<{ distance: number; proximity: number }[]>([]);
    const [inputProximity, setInputProximity] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    const distances = [20, 30, 40, 50]; // feet
    const currentIndex = distances.indexOf(currentDistance);

    const handleLogResult = () => {
        const proximity = parseFloat(inputProximity);
        if (isNaN(proximity)) return;

        const newResults = [...results, { distance: currentDistance, proximity }];
        setResults(newResults);
        setInputProximity('');

        if (currentIndex < distances.length - 1) {
            setCurrentDistance(distances[currentIndex + 1]);
        } else {
            setIsComplete(true);
            onComplete?.(newResults);
        }
    };

    const averageProximity = results.length > 0
        ? results.reduce((sum, r) => sum + r.proximity, 0) / results.length
        : 0;

    if (isComplete) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-lg">
                <div className="text-center mb-6">
                    <span className="text-5xl mb-4 block">🎯</span>
                    <h3 className="font-bold text-gray-900 text-xl">Speed Training Complete!</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                        <p className="text-3xl font-bold text-green-600">
                            {averageProximity.toFixed(1)}'
                        </p>
                        <p className="text-xs text-gray-500">Avg Proximity</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <p className="text-3xl font-bold text-blue-600">
                            {results.length}
                        </p>
                        <p className="text-xs text-gray-500">Putts Logged</p>
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-2 mb-6">
                    {results.map((r, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">{r.distance} ft lag putt</span>
                            <span className={`font-bold ${r.proximity <= 3 ? 'text-green-600' : 'text-orange-600'}`}>
                                {r.proximity}' from hole
                            </span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => {
                        setResults([]);
                        setCurrentDistance(20);
                        setIsComplete(false);
                    }}
                    className="w-full py-4 rounded-2xl font-bold text-white active:scale-95 transition-all"
                    style={{ backgroundColor: COLORS.primary }}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div
                className="p-6 text-center text-white"
                style={{ backgroundColor: COLORS.secondary }}
            >
                <h3 className="font-bold text-lg">Lag Putting Speed Trainer</h3>
                <p className="text-white/70 text-sm mt-1">Get the ball to die at the hole</p>
            </div>

            <div className="p-6">
                {/* Progress */}
                <div className="flex gap-2 mb-6">
                    {distances.map((d, i) => (
                        <div
                            key={d}
                            className={`flex-1 h-2 rounded-full transition-all
                                ${i < currentIndex ? 'bg-green-500' : ''}
                                ${i === currentIndex ? '' : ''}
                                ${i > currentIndex ? 'bg-gray-200' : ''}`}
                            style={i === currentIndex ? { backgroundColor: COLORS.primary } : {}}
                        />
                    ))}
                </div>

                {/* Current Distance */}
                <div className="text-center mb-8">
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Current Putt</p>
                    <p className="text-6xl font-black text-gray-900 mt-2">{currentDistance}'</p>
                    <p className="text-gray-600 mt-2">Putt {currentIndex + 1} of {distances.length}</p>
                </div>

                {/* Instructions */}
                <div className="p-4 bg-blue-50 rounded-xl mb-6">
                    <p className="text-sm text-blue-700">
                        <strong>Goal:</strong> Lag the ball to within 3 feet of the hole.
                        Focus on smooth tempo and consistent backswing length.
                    </p>
                </div>

                {/* Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        How close did you finish? (feet from hole)
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={inputProximity}
                            onChange={(e) => setInputProximity(e.target.value)}
                            placeholder="e.g., 2.5"
                            className="flex-1 px-4 py-3 border rounded-xl text-center text-xl font-bold
                                       focus:outline-none focus:border-orange-500"
                        />
                        <button
                            onClick={handleLogResult}
                            disabled={!inputProximity}
                            className={`px-6 py-3 rounded-xl font-bold text-white transition-all
                                ${inputProximity ? 'active:scale-95' : 'opacity-50'}`}
                            style={{ backgroundColor: COLORS.primary }}
                        >
                            Log
                        </button>
                    </div>
                </div>

                {/* Quick Entry Buttons */}
                <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((ft) => (
                        <button
                            key={ft}
                            onClick={() => setInputProximity(ft.toString())}
                            className="py-3 rounded-xl bg-gray-100 font-medium text-gray-600 active:scale-95"
                        >
                            {ft}'
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ============================================================
// GREEN READING QUIZ
// ============================================================

interface QuizQuestion {
    id: string;
    slope: number;
    direction: 'LEFT' | 'RIGHT';
    distance: number;
    correctAnswer: 'A' | 'B' | 'C';
    options: {
        A: string;
        B: string;
        C: string;
    };
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        id: 'q1',
        slope: 2,
        direction: 'RIGHT',
        distance: 10,
        correctAnswer: 'B',
        options: {
            A: '1 cup left',
            B: '2 cups left',
            C: '3 cups left'
        }
    },
    {
        id: 'q2',
        slope: 3,
        direction: 'LEFT',
        distance: 15,
        correctAnswer: 'C',
        options: {
            A: '2 cups right',
            B: '3 cups right',
            C: '4 cups right'
        }
    },
    {
        id: 'q3',
        slope: 1,
        direction: 'RIGHT',
        distance: 6,
        correctAnswer: 'A',
        options: {
            A: 'Inside left edge',
            B: '1 cup left',
            C: '2 cups left'
        }
    }
];

export const GreenReadingQuiz: React.FC<{
    onComplete?: (score: number, total: number) => void;
}> = ({ onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const question = QUIZ_QUESTIONS[currentQuestion];

    const handleAnswer = (answer: 'A' | 'B' | 'C') => {
        setSelectedAnswer(answer);
        setShowResult(true);

        if (answer === question.correctAnswer) {
            setScore(s => s + 1);
        }

        setTimeout(() => {
            if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
                setCurrentQuestion(c => c + 1);
                setSelectedAnswer(null);
                setShowResult(false);
            } else {
                setIsComplete(true);
                onComplete?.(score + (answer === question.correctAnswer ? 1 : 0), QUIZ_QUESTIONS.length);
            }
        }, 1500);
    };

    if (isComplete) {
        const finalScore = score;
        const percentage = Math.round((finalScore / QUIZ_QUESTIONS.length) * 100);

        return (
            <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
                <span className="text-5xl mb-4 block">
                    {percentage >= 70 ? '🏆' : percentage >= 40 ? '📚' : '🎯'}
                </span>
                <h3 className="font-bold text-gray-900 text-xl mb-2">Quiz Complete!</h3>
                <p className="text-4xl font-black mb-4" style={{ color: COLORS.primary }}>
                    {finalScore} / {QUIZ_QUESTIONS.length}
                </p>
                <p className="text-gray-600 mb-6">
                    {percentage >= 70 && 'Excellent! You have a great eye for reading greens.'}
                    {percentage >= 40 && percentage < 70 && 'Good effort! Keep practicing your reads.'}
                    {percentage < 40 && 'Keep studying! Green reading takes time to master.'}
                </p>
                <button
                    onClick={() => {
                        setCurrentQuestion(0);
                        setScore(0);
                        setSelectedAnswer(null);
                        setShowResult(false);
                        setIsComplete(false);
                    }}
                    className="w-full py-4 rounded-2xl font-bold text-white active:scale-95 transition-all"
                    style={{ backgroundColor: COLORS.primary }}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="p-6" style={{ backgroundColor: COLORS.secondary }}>
                <div className="flex justify-between items-center text-white">
                    <h3 className="font-bold">Green Reading Quiz</h3>
                    <span className="text-white/70">
                        {currentQuestion + 1} / {QUIZ_QUESTIONS.length}
                    </span>
                </div>
            </div>

            <div className="p-6">
                {/* Question Visual */}
                <div className="relative h-32 bg-green-100 rounded-xl mb-6 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-sm text-green-800 mb-2">
                            {question.distance} ft putt • {question.slope}% slope • Breaks {question.direction === 'LEFT' ? 'left to right' : 'right to left'}
                        </p>
                        <p className="font-bold text-green-900">Where should you aim?</p>
                    </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                    {(['A', 'B', 'C'] as const).map((opt) => {
                        const isCorrect = opt === question.correctAnswer;
                        const isSelected = opt === selectedAnswer;

                        return (
                            <button
                                key={opt}
                                onClick={() => !showResult && handleAnswer(opt)}
                                disabled={showResult}
                                className={`w-full p-4 rounded-xl text-left font-medium transition-all
                                    ${!showResult ? 'bg-gray-100 hover:bg-gray-200 active:scale-[0.98]' : ''}
                                    ${showResult && isCorrect ? 'bg-green-100 border-2 border-green-500' : ''}
                                    ${showResult && isSelected && !isCorrect ? 'bg-red-100 border-2 border-red-500' : ''}
                                    ${showResult && !isSelected && !isCorrect ? 'bg-gray-100 opacity-50' : ''}`}
                            >
                                <span className="font-bold mr-2">{opt}.</span>
                                {question.options[opt]}
                                {showResult && isCorrect && <span className="float-right">✓</span>}
                                {showResult && isSelected && !isCorrect && <span className="float-right">✗</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Score */}
                <div className="mt-6 text-center">
                    <span className="text-sm text-gray-500">
                        Score: <span className="font-bold" style={{ color: COLORS.primary }}>{score}</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// VIRTUAL PUTTING GAMES
// ============================================================

export interface PuttingGame {
    id: string;
    name: string;
    description: string;
    rules: string[];
    icon: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

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

export const PuttingGameCard: React.FC<{
    game: PuttingGame;
    onStart: (game: PuttingGame) => void;
}> = ({ game, onStart }) => {
    const difficultyColors = {
        EASY: 'bg-green-100 text-green-700',
        MEDIUM: 'bg-yellow-100 text-yellow-700',
        HARD: 'bg-red-100 text-red-700'
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all cursor-pointer"
             onClick={() => onStart(game)}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{game.icon}</span>
                    <div>
                        <h4 className="font-bold text-gray-900">{game.name}</h4>
                        <p className="text-sm text-gray-500">{game.description}</p>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${difficultyColors[game.difficulty]}`}>
                    {game.difficulty}
                </span>
            </div>

            <button
                className="w-full py-3 rounded-xl font-bold text-white active:scale-95 transition-all"
                style={{ backgroundColor: COLORS.primary }}
            >
                Play
            </button>
        </div>
    );
};

// ============================================================
// PUTTING LAB MAIN VIEW
// ============================================================

export const PuttingLab: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'STATS' | 'AIMPOINT' | 'TRAINING' | 'GAMES'>('STATS');

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-5 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Putting Lab</h1>
                    <p className="text-sm text-gray-500">Master the most important club</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {(['STATS', 'AIMPOINT', 'TRAINING', 'GAMES'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 min-w-[80px] pb-3 text-sm font-bold uppercase tracking-wide
                                border-b-2 transition-all whitespace-nowrap px-2
                                ${activeTab === tab
                                    ? 'border-orange-500 text-gray-900'
                                    : 'border-transparent text-gray-400'}`}
                            style={activeTab === tab ? { borderColor: COLORS.primary } : {}}
                        >
                            {tab === 'STATS' && '📊'}
                            {tab === 'AIMPOINT' && '🎯'}
                            {tab === 'TRAINING' && '⚡'}
                            {tab === 'GAMES' && '🎮'}
                            {' '}{tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="px-5 py-6 space-y-6">
                {activeTab === 'STATS' && (
                    <PuttingStatsDashboard stats={MOCK_PUTTING_STATS} />
                )}

                {activeTab === 'AIMPOINT' && (
                    <>
                        <AimPointCalculator />
                        <GreenReadingQuiz />
                    </>
                )}

                {activeTab === 'TRAINING' && (
                    <PuttingSpeedTrainer />
                )}

                {activeTab === 'GAMES' && (
                    <div className="space-y-4">
                        {PUTTING_GAMES.map((game) => (
                            <PuttingGameCard
                                key={game.id}
                                game={game}
                                onStart={(g) => console.log('Starting game:', g.name)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================
// USAGE EXAMPLE
// ============================================================

/*
import {
    PuttingLab,
    PuttingStatsDashboard,
    AimPointCalculator,
    PuttingSpeedTrainer,
    GreenReadingQuiz,
    PuttingGameCard,
    MOCK_PUTTING_STATS,
    PUTTING_GAMES
} from './NewFeatures_PuttingLab';

// Full Putting Lab
const PuttingScreen: React.FC = () => {
    return <PuttingLab />;
};

// Individual Components
const QuickAimPoint: React.FC = () => {
    return <AimPointCalculator onCalculate={(reading) => console.log(reading)} />;
};
*/

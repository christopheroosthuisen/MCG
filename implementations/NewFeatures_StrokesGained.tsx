/**
 * ============================================================
 * MCG - NEW FEATURES: STROKES GAINED DASHBOARD
 * ============================================================
 *
 * Inspired by: Arccos, Pinpoint, Draw More Circles, SwingU
 *
 * This file contains components for strokes gained analytics:
 * - Round Entry Wizard
 * - SG Overview Card
 * - SG Category Breakdown
 * - SG Trend Charts
 * - Benchmark Comparison
 * - Improvement Recommendations
 *
 * Copy this entire file into your AI Studio project.
 * ============================================================
 */

import React, { useState, useMemo } from 'react';
import { COLORS } from '../constants';

// ============================================================
// TYPES
// ============================================================

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

export interface HoleData {
    holeNumber: number;
    par: number;
    distance: number;
    strokes: number;
    putts: number;
    fairwayHit?: boolean;
    greenInRegulation: boolean;
    penaltyStrokes: number;
    shots: ShotData[];
}

export interface ShotData {
    shotNumber: number;
    club: string;
    startLie: 'TEE' | 'FAIRWAY' | 'ROUGH' | 'SAND' | 'GREEN' | 'RECOVERY';
    startDistance: number;
    endDistance: number;
    result: 'GOOD' | 'OK' | 'POOR';
}

export interface SGBenchmark {
    handicap: number;
    offTheTee: number;
    approach: number;
    aroundGreen: number;
    putting: number;
}

// Strokes gained benchmarks by handicap
export const SG_BENCHMARKS: SGBenchmark[] = [
    { handicap: 0, offTheTee: 0, approach: 0, aroundGreen: 0, putting: 0 },
    { handicap: 5, offTheTee: -0.5, approach: -0.8, aroundGreen: -0.4, putting: -0.3 },
    { handicap: 10, offTheTee: -1.0, approach: -1.5, aroundGreen: -0.8, putting: -0.7 },
    { handicap: 15, offTheTee: -1.5, approach: -2.2, aroundGreen: -1.2, putting: -1.1 },
    { handicap: 20, offTheTee: -2.0, approach: -3.0, aroundGreen: -1.6, putting: -1.4 },
    { handicap: 25, offTheTee: -2.5, approach: -3.8, aroundGreen: -2.0, putting: -1.7 },
];

// ============================================================
// MOCK DATA
// ============================================================

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

// ============================================================
// SG OVERVIEW CARD
// ============================================================

export const SGOverviewCard: React.FC<{
    sgData: StrokesGained;
    onViewDetails?: () => void;
}> = ({ sgData, onViewDetails }) => {
    const isPositive = sgData.total >= 0;

    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Header with Total */}
            <div
                className="p-6 text-center text-white"
                style={{
                    background: isPositive
                        ? `linear-gradient(135deg, ${COLORS.success}, #059669)`
                        : `linear-gradient(135deg, ${COLORS.error}, #DC2626)`
                }}
            >
                <p className="text-sm opacity-80 uppercase tracking-wider">Total Strokes Gained</p>
                <p className="text-5xl font-black mt-2">
                    {isPositive ? '+' : ''}{sgData.total.toFixed(1)}
                </p>
                <p className="text-sm opacity-80 mt-2">
                    vs {sgData.benchmarkHandicap} handicap benchmark
                </p>
            </div>

            {/* Category Breakdown */}
            <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Off the Tee', value: sgData.offTheTee, icon: '🏌️' },
                        { label: 'Approach', value: sgData.approach, icon: '🎯' },
                        { label: 'Around Green', value: sgData.aroundGreen, icon: '⛳' },
                        { label: 'Putting', value: sgData.putting, icon: '🔵' }
                    ].map((cat) => (
                        <div
                            key={cat.label}
                            className={`p-4 rounded-xl ${cat.value >= 0 ? 'bg-green-50' : 'bg-red-50'}`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span>{cat.icon}</span>
                                <span className="text-xs text-gray-600">{cat.label}</span>
                            </div>
                            <p className={`text-2xl font-bold ${cat.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {cat.value >= 0 ? '+' : ''}{cat.value.toFixed(1)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Round Info */}
                <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">{sgData.courseName}</p>
                        <p className="text-sm text-gray-500">
                            {sgData.date.toLocaleDateString()} • {sgData.totalStrokes} ({sgData.totalStrokes - sgData.coursePar >= 0 ? '+' : ''}{sgData.totalStrokes - sgData.coursePar})
                        </p>
                    </div>
                    {onViewDetails && (
                        <button
                            onClick={onViewDetails}
                            className="text-sm font-medium"
                            style={{ color: COLORS.primary }}
                        >
                            Details →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================================
// SG CATEGORY BREAKDOWN (Detailed View)
// ============================================================

export const SGCategoryBreakdown: React.FC<{
    history: StrokesGained[];
    selectedCategory?: 'OTT' | 'APP' | 'ARG' | 'PUTT';
}> = ({ history, selectedCategory }) => {
    const [activeCategory, setActiveCategory] = useState<'OTT' | 'APP' | 'ARG' | 'PUTT'>(
        selectedCategory || 'OTT'
    );

    const categories = [
        { id: 'OTT' as const, label: 'Off the Tee', key: 'offTheTee' as const, icon: '🏌️', description: 'Tee shots on par 4s and 5s' },
        { id: 'APP' as const, label: 'Approach', key: 'approach' as const, icon: '🎯', description: 'Shots from 100+ yards' },
        { id: 'ARG' as const, label: 'Around Green', key: 'aroundGreen' as const, icon: '⛳', description: 'Chips, pitches, bunker shots' },
        { id: 'PUTT' as const, label: 'Putting', key: 'putting' as const, icon: '🔵', description: 'All putts on the green' }
    ];

    const currentCategory = categories.find(c => c.id === activeCategory)!;
    const values = history.map(h => h[currentCategory.key]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const best = Math.max(...values);
    const worst = Math.min(...values);

    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Category Tabs */}
            <div className="flex border-b border-gray-200">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex-1 py-4 text-center transition-all
                            ${activeCategory === cat.id
                                ? 'bg-gray-50 border-b-2'
                                : 'text-gray-400'}`}
                        style={activeCategory === cat.id ? { borderColor: COLORS.primary } : {}}
                    >
                        <span className="text-lg">{cat.icon}</span>
                        <p className={`text-xs mt-1 ${activeCategory === cat.id ? 'font-bold text-gray-900' : ''}`}>
                            {cat.label}
                        </p>
                    </button>
                ))}
            </div>

            <div className="p-6">
                {/* Category Description */}
                <p className="text-sm text-gray-500 mb-4">{currentCategory.description}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className={`text-2xl font-bold ${avg >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {avg >= 0 ? '+' : ''}{avg.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Average</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                        <p className="text-2xl font-bold text-green-600">
                            +{best.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Best</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl">
                        <p className="text-2xl font-bold text-red-600">
                            {worst.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Worst</p>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Recent Rounds</p>
                    {history.slice(0, 5).map((round, i) => {
                        const value = round[currentCategory.key];
                        const maxAbs = Math.max(Math.abs(best), Math.abs(worst), 2);
                        const width = (Math.abs(value) / maxAbs) * 50;

                        return (
                            <div key={round.roundId} className="flex items-center gap-3">
                                <div className="w-24 text-right">
                                    <p className="text-xs text-gray-500 truncate">{round.courseName}</p>
                                </div>
                                <div className="flex-1 h-6 bg-gray-100 rounded relative">
                                    {/* Center line */}
                                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300" />
                                    {/* Bar */}
                                    <div
                                        className={`absolute top-0 bottom-0 rounded transition-all duration-500
                                            ${value >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                        style={{
                                            left: value >= 0 ? '50%' : `${50 - width}%`,
                                            width: `${width}%`
                                        }}
                                    />
                                </div>
                                <div className="w-12 text-right">
                                    <span className={`text-sm font-bold ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {value >= 0 ? '+' : ''}{value.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ============================================================
// SG TREND CHART
// ============================================================

export const SGTrendChart: React.FC<{
    history: StrokesGained[];
    metric: 'total' | 'offTheTee' | 'approach' | 'aroundGreen' | 'putting';
    title?: string;
}> = ({ history, metric, title }) => {
    const sortedHistory = [...history].sort((a, b) => a.date.getTime() - b.date.getTime());
    const values = sortedHistory.map(h => h[metric]);
    const maxVal = Math.max(...values.map(Math.abs), 2);
    const minVal = -maxVal;

    // Calculate trend line (simple linear regression)
    const n = values.length;
    const sumX = values.reduce((_, __, i) => _ + i, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((a, v, i) => a + i * v, 0);
    const sumX2 = values.reduce((_, __, i) => _ + i * i, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const trendDirection = slope > 0.05 ? 'IMPROVING' : slope < -0.05 ? 'DECLINING' : 'STABLE';

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                        {title || 'Strokes Gained Trend'}
                    </h3>
                    <p className="text-sm text-gray-500">Last {history.length} rounds</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold
                    ${trendDirection === 'IMPROVING' ? 'bg-green-100 text-green-700' : ''}
                    ${trendDirection === 'DECLINING' ? 'bg-red-100 text-red-700' : ''}
                    ${trendDirection === 'STABLE' ? 'bg-gray-100 text-gray-700' : ''}`}>
                    {trendDirection === 'IMPROVING' && '↑ Improving'}
                    {trendDirection === 'DECLINING' && '↓ Declining'}
                    {trendDirection === 'STABLE' && '→ Stable'}
                </span>
            </div>

            {/* Chart */}
            <div className="relative h-48">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-400">
                    <span>+{maxVal.toFixed(0)}</span>
                    <span>0</span>
                    <span>{minVal.toFixed(0)}</span>
                </div>

                {/* Chart area */}
                <div className="absolute left-12 right-0 top-0 bottom-0">
                    {/* Zero line */}
                    <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300" />

                    {/* Grid lines */}
                    <div className="absolute left-0 right-0 top-1/4 h-px bg-gray-100" />
                    <div className="absolute left-0 right-0 top-3/4 h-px bg-gray-100" />

                    {/* Data points and line */}
                    <svg className="absolute inset-0" viewBox={`0 0 ${values.length * 40} 200`} preserveAspectRatio="none">
                        {/* Area fill */}
                        <path
                            d={`M 0 100 ${values.map((v, i) => {
                                const x = i * 40 + 20;
                                const y = 100 - (v / maxVal) * 80;
                                return `L ${x} ${y}`;
                            }).join(' ')} L ${(values.length - 1) * 40 + 20} 100 Z`}
                            fill={COLORS.primary}
                            opacity="0.1"
                        />

                        {/* Line */}
                        <path
                            d={`M ${values.map((v, i) => {
                                const x = i * 40 + 20;
                                const y = 100 - (v / maxVal) * 80;
                                return `${x} ${y}`;
                            }).join(' L ')}`}
                            stroke={COLORS.primary}
                            strokeWidth="3"
                            fill="none"
                        />

                        {/* Trend line */}
                        <path
                            d={`M 20 ${100 - (intercept / maxVal) * 80} L ${(values.length - 1) * 40 + 20} ${100 - ((slope * (values.length - 1) + intercept) / maxVal) * 80}`}
                            stroke={trendDirection === 'IMPROVING' ? COLORS.success : trendDirection === 'DECLINING' ? COLORS.error : '#9CA3AF'}
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            fill="none"
                        />

                        {/* Data points */}
                        {values.map((v, i) => {
                            const x = i * 40 + 20;
                            const y = 100 - (v / maxVal) * 80;
                            return (
                                <circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r="6"
                                    fill={v >= 0 ? COLORS.success : COLORS.error}
                                    stroke="white"
                                    strokeWidth="2"
                                />
                            );
                        })}
                    </svg>
                </div>
            </div>

            {/* X-axis labels */}
            <div className="ml-12 flex justify-between mt-2">
                {sortedHistory.map((h, i) => (
                    <span key={i} className="text-xs text-gray-400">
                        {h.date.getMonth() + 1}/{h.date.getDate()}
                    </span>
                ))}
            </div>
        </div>
    );
};

// ============================================================
// BENCHMARK COMPARISON
// ============================================================

export const SGBenchmarkComparison: React.FC<{
    currentSG: StrokesGained;
    targetHandicap?: number;
}> = ({ currentSG, targetHandicap }) => {
    const currentBenchmark = SG_BENCHMARKS.find(b => b.handicap === currentSG.benchmarkHandicap)
        || SG_BENCHMARKS[0];
    const targetBench = SG_BENCHMARKS.find(b => b.handicap === (targetHandicap || currentSG.benchmarkHandicap - 5))
        || SG_BENCHMARKS[0];

    const categories = [
        { label: 'Off the Tee', current: currentSG.offTheTee, benchmark: currentBenchmark.offTheTee, target: targetBench.offTheTee },
        { label: 'Approach', current: currentSG.approach, benchmark: currentBenchmark.approach, target: targetBench.approach },
        { label: 'Around Green', current: currentSG.aroundGreen, benchmark: currentBenchmark.aroundGreen, target: targetBench.aroundGreen },
        { label: 'Putting', current: currentSG.putting, benchmark: currentBenchmark.putting, target: targetBench.putting }
    ];

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Handicap Comparison</h3>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.primary }} />
                    <span>You</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-300" />
                    <span>{currentSG.benchmarkHandicap} HCP</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.success }} />
                    <span>{targetHandicap || currentSG.benchmarkHandicap - 5} HCP</span>
                </div>
            </div>

            {/* Category Comparison Bars */}
            <div className="space-y-6">
                {categories.map((cat) => {
                    const maxAbs = 3;
                    const currentWidth = ((cat.current + maxAbs) / (maxAbs * 2)) * 100;
                    const benchWidth = ((cat.benchmark + maxAbs) / (maxAbs * 2)) * 100;
                    const targetWidth = ((cat.target + maxAbs) / (maxAbs * 2)) * 100;
                    const gap = cat.target - cat.current;

                    return (
                        <div key={cat.label}>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                                <span className={`text-sm font-bold ${gap <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {gap <= 0 ? '✓' : `${gap.toFixed(1)} to go`}
                                </span>
                            </div>
                            <div className="relative h-8 bg-gray-100 rounded-lg">
                                {/* Center line */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 z-10" />

                                {/* Benchmark bar */}
                                <div
                                    className="absolute top-2 h-1 bg-gray-300 rounded"
                                    style={{ left: '50%', width: `${Math.abs(benchWidth - 50)}%`, transform: benchWidth < 50 ? 'translateX(-100%)' : '' }}
                                />

                                {/* Target bar */}
                                <div
                                    className="absolute top-5 h-1 rounded"
                                    style={{
                                        backgroundColor: COLORS.success,
                                        left: '50%',
                                        width: `${Math.abs(targetWidth - 50)}%`,
                                        transform: targetWidth < 50 ? 'translateX(-100%)' : ''
                                    }}
                                />

                                {/* Current value marker */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md"
                                    style={{
                                        backgroundColor: COLORS.primary,
                                        left: `${currentWidth}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                />
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-gray-400">
                                <span>-3.0</span>
                                <span>0</span>
                                <span>+3.0</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ============================================================
// IMPROVEMENT RECOMMENDATIONS
// ============================================================

export const ImprovementRecommendations: React.FC<{
    sgData: StrokesGained[];
}> = ({ sgData }) => {
    const averages = useMemo(() => {
        const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
        return {
            offTheTee: avg(sgData.map(s => s.offTheTee)),
            approach: avg(sgData.map(s => s.approach)),
            aroundGreen: avg(sgData.map(s => s.aroundGreen)),
            putting: avg(sgData.map(s => s.putting))
        };
    }, [sgData]);

    // Find weakest category
    const categories = [
        { id: 'offTheTee', label: 'Off the Tee', value: averages.offTheTee },
        { id: 'approach', label: 'Approach', value: averages.approach },
        { id: 'aroundGreen', label: 'Around Green', value: averages.aroundGreen },
        { id: 'putting', label: 'Putting', value: averages.putting }
    ].sort((a, b) => a.value - b.value);

    const weakest = categories[0];
    const strongest = categories[3];

    // Improvement projections
    const potentialImprovement = Math.abs(weakest.value) * 0.5;

    // Drill recommendations based on weakness
    const drillRecommendations: Record<string, { drill: string; reason: string }[]> = {
        offTheTee: [
            { drill: 'Alignment Stick Drill', reason: 'Improve club path consistency' },
            { drill: 'Tempo Training', reason: 'Better rhythm for straighter drives' }
        ],
        approach: [
            { drill: 'Distance Control Ladder', reason: 'Dial in carry distances' },
            { drill: '9-Shot Drill', reason: 'Develop shot shaping skills' }
        ],
        aroundGreen: [
            { drill: 'Landing Spot Practice', reason: 'Improve distance control' },
            { drill: 'Up & Down Challenge', reason: 'Simulate course pressure' }
        ],
        putting: [
            { drill: 'Gate Putting', reason: 'Improve start line accuracy' },
            { drill: 'Lag Putting Ladder', reason: 'Better speed control' }
        ]
    };

    const recommendations = drillRecommendations[weakest.id] || [];

    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6" style={{ backgroundColor: `${COLORS.primary}15` }}>
                <h3 className="font-bold text-gray-900 text-lg">AI Recommendations</h3>
                <p className="text-sm text-gray-600 mt-1">Based on your last {sgData.length} rounds</p>
            </div>

            <div className="p-6">
                {/* Weakness Alert */}
                <div className="p-4 bg-red-50 rounded-xl mb-6">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="font-bold text-red-700">Biggest Opportunity: {weakest.label}</p>
                            <p className="text-sm text-red-600 mt-1">
                                You're losing an average of {Math.abs(weakest.value).toFixed(1)} strokes here.
                                {weakest.id === 'approach' && ' Focus on approach shots from 100-200 yards.'}
                                {weakest.id === 'putting' && ' Work on putts inside 10 feet.'}
                                {weakest.id === 'aroundGreen' && ' Practice chips and pitches from varied lies.'}
                                {weakest.id === 'offTheTee' && ' Prioritize fairways over distance.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Strength Highlight */}
                <div className="p-4 bg-green-50 rounded-xl mb-6">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">💪</span>
                        <div>
                            <p className="font-bold text-green-700">Strength: {strongest.label}</p>
                            <p className="text-sm text-green-600 mt-1">
                                You're gaining {strongest.value.toFixed(1)} strokes on average. Keep it up!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Improvement Projection */}
                <div className="p-4 bg-blue-50 rounded-xl mb-6">
                    <p className="font-bold text-blue-700 mb-2">Potential Impact</p>
                    <p className="text-sm text-blue-600">
                        If you improve {weakest.label} by 50%, you could save
                        <span className="font-bold text-blue-800"> {potentialImprovement.toFixed(1)} strokes per round</span>.
                        That's approximately <span className="font-bold">{(potentialImprovement * 20).toFixed(0)} strokes per season</span>!
                    </p>
                </div>

                {/* Recommended Drills */}
                <div>
                    <p className="font-bold text-gray-900 mb-3">Recommended Practice</p>
                    <div className="space-y-3">
                        {recommendations.map((rec, i) => (
                            <div key={i} className="p-4 border border-gray-200 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{rec.drill}</p>
                                        <p className="text-sm text-gray-500">{rec.reason}</p>
                                    </div>
                                    <button
                                        className="px-4 py-2 rounded-xl text-sm font-bold text-white active:scale-95 transition-all"
                                        style={{ backgroundColor: COLORS.primary }}
                                    >
                                        Start
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// ROUND ENTRY WIZARD (Step-by-step logging)
// ============================================================

export const RoundEntryWizard: React.FC<{
    onComplete: (data: StrokesGained) => void;
    onCancel: () => void;
}> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState<'COURSE' | 'SUMMARY' | 'HOLES' | 'COMPLETE'>('COURSE');
    const [courseName, setCourseName] = useState('');
    const [coursePar, setCoursePar] = useState(72);
    const [totalStrokes, setTotalStrokes] = useState(72);
    const [putts, setPutts] = useState(30);
    const [fairwaysHit, setFairwaysHit] = useState(7);
    const [greens, setGreens] = useState(9);

    // Simplified SG calculation based on summary stats
    const calculateSG = () => {
        // This is a simplified calculation - real SG requires shot-by-shot data
        const scoreToPar = totalStrokes - coursePar;
        const expectedPutts = 29; // baseline for scratch
        const expectedFairways = 9;
        const expectedGreens = 12;

        const puttingSG = (expectedPutts - putts) * 0.3;
        const approachSG = (greens - expectedGreens) * 0.25;
        const offTeeSG = (fairwaysHit - expectedFairways) * 0.15;
        const aroundGreenSG = -scoreToPar - (puttingSG + approachSG + offTeeSG);

        return {
            offTheTee: Math.round(offTeeSG * 10) / 10,
            approach: Math.round(approachSG * 10) / 10,
            aroundGreen: Math.round(aroundGreenSG * 10) / 10,
            putting: Math.round(puttingSG * 10) / 10,
            total: Math.round((offTeeSG + approachSG + aroundGreenSG + puttingSG) * 10) / 10
        };
    };

    const handleComplete = () => {
        const sg = calculateSG();
        onComplete({
            roundId: `r-${Date.now()}`,
            date: new Date(),
            courseName,
            offTheTee: sg.offTheTee,
            approach: sg.approach,
            aroundGreen: sg.aroundGreen,
            putting: sg.putting,
            total: sg.total,
            benchmarkHandicap: 10,
            totalStrokes,
            coursePar
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-5 py-4 flex items-center justify-between">
                    <button onClick={onCancel} className="text-gray-500">
                        ✕ Cancel
                    </button>
                    <h2 className="font-bold text-gray-900">Log Round</h2>
                    <div className="w-16" /> {/* Spacer */}
                </div>

                {/* Progress */}
                <div className="px-5 pb-4">
                    <div className="flex gap-2">
                        {['COURSE', 'SUMMARY', 'COMPLETE'].map((s, i) => (
                            <div
                                key={s}
                                className={`flex-1 h-1 rounded-full transition-all
                                    ${['COURSE', 'SUMMARY', 'COMPLETE'].indexOf(step) >= i
                                        ? ''
                                        : 'bg-gray-200'}`}
                                style={{
                                    backgroundColor: ['COURSE', 'SUMMARY', 'COMPLETE'].indexOf(step) >= i
                                        ? COLORS.primary
                                        : undefined
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-5">
                {/* Step: Course Info */}
                {step === 'COURSE' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Course Name
                            </label>
                            <input
                                type="text"
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                placeholder="e.g., Medalist Golf Club"
                                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Course Par
                            </label>
                            <div className="flex gap-3">
                                {[70, 71, 72, 73].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setCoursePar(p)}
                                        className={`flex-1 py-3 rounded-xl font-bold transition-all
                                            ${coursePar === p ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                                        style={coursePar === p ? { backgroundColor: COLORS.primary } : {}}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setStep('SUMMARY')}
                            disabled={!courseName}
                            className={`w-full py-4 rounded-2xl font-bold text-white transition-all
                                ${courseName ? 'active:scale-95' : 'opacity-50'}`}
                            style={{ backgroundColor: COLORS.primary }}
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Step: Round Summary */}
                {step === 'SUMMARY' && (
                    <div className="space-y-6">
                        {/* Total Score */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Total Strokes
                            </label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setTotalStrokes(s => s - 1)}
                                    className="w-12 h-12 rounded-xl bg-gray-200 font-bold text-xl active:scale-95"
                                >
                                    -
                                </button>
                                <div className="flex-1 text-center">
                                    <span className="text-5xl font-black text-gray-900">{totalStrokes}</span>
                                    <p className={`text-sm mt-1 ${totalStrokes - coursePar <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {totalStrokes - coursePar === 0 ? 'Even' : (totalStrokes - coursePar > 0 ? '+' : '')}{totalStrokes - coursePar}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setTotalStrokes(s => s + 1)}
                                    className="w-12 h-12 rounded-xl font-bold text-xl text-white active:scale-95"
                                    style={{ backgroundColor: COLORS.primary }}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                                <label className="text-xs text-gray-500">Putts</label>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <button
                                        onClick={() => setPutts(p => Math.max(0, p - 1))}
                                        className="w-8 h-8 rounded-lg bg-gray-100 text-sm active:scale-95"
                                    >
                                        -
                                    </button>
                                    <span className="text-2xl font-bold w-10">{putts}</span>
                                    <button
                                        onClick={() => setPutts(p => p + 1)}
                                        className="w-8 h-8 rounded-lg bg-gray-100 text-sm active:scale-95"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                                <label className="text-xs text-gray-500">Fairways</label>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <button
                                        onClick={() => setFairwaysHit(f => Math.max(0, f - 1))}
                                        className="w-8 h-8 rounded-lg bg-gray-100 text-sm active:scale-95"
                                    >
                                        -
                                    </button>
                                    <span className="text-2xl font-bold w-10">{fairwaysHit}/14</span>
                                    <button
                                        onClick={() => setFairwaysHit(f => Math.min(14, f + 1))}
                                        className="w-8 h-8 rounded-lg bg-gray-100 text-sm active:scale-95"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                                <label className="text-xs text-gray-500">GIR</label>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <button
                                        onClick={() => setGreens(g => Math.max(0, g - 1))}
                                        className="w-8 h-8 rounded-lg bg-gray-100 text-sm active:scale-95"
                                    >
                                        -
                                    </button>
                                    <span className="text-2xl font-bold w-10">{greens}/18</span>
                                    <button
                                        onClick={() => setGreens(g => Math.min(18, g + 1))}
                                        className="w-8 h-8 rounded-lg bg-gray-100 text-sm active:scale-95"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preview SG */}
                        <div className="bg-gray-100 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-2">Estimated Strokes Gained</p>
                            <p className={`text-2xl font-bold ${calculateSG().total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {calculateSG().total >= 0 ? '+' : ''}{calculateSG().total.toFixed(1)}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('COURSE')}
                                className="flex-1 py-4 rounded-2xl font-bold bg-gray-200 text-gray-700 active:scale-95"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleComplete}
                                className="flex-1 py-4 rounded-2xl font-bold text-white active:scale-95"
                                style={{ backgroundColor: COLORS.primary }}
                            >
                                Save Round
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================
// STROKES GAINED DASHBOARD (Main View)
// ============================================================

export const StrokesGainedDashboard: React.FC<{
    onAddRound?: () => void;
}> = ({ onAddRound }) => {
    const [showWizard, setShowWizard] = useState(false);
    const [sgHistory, setSgHistory] = useState(MOCK_SG_HISTORY);

    const latestRound = sgHistory[0];

    if (showWizard) {
        return (
            <RoundEntryWizard
                onComplete={(data) => {
                    setSgHistory([data, ...sgHistory]);
                    setShowWizard(false);
                }}
                onCancel={() => setShowWizard(false)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10 px-5 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Strokes Gained</h1>
                        <p className="text-sm text-gray-500">Know where you're gaining & losing</p>
                    </div>
                    <button
                        onClick={() => setShowWizard(true)}
                        className="px-4 py-2 rounded-xl font-bold text-white active:scale-95 transition-all"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        + Log Round
                    </button>
                </div>
            </div>

            <div className="px-5 py-6 space-y-6">
                {/* Latest Round Overview */}
                <SGOverviewCard sgData={latestRound} />

                {/* Trend Chart */}
                <SGTrendChart
                    history={sgHistory}
                    metric="total"
                    title="Total SG Trend"
                />

                {/* Category Breakdown */}
                <SGCategoryBreakdown history={sgHistory} />

                {/* Benchmark Comparison */}
                <SGBenchmarkComparison
                    currentSG={latestRound}
                    targetHandicap={0}
                />

                {/* Recommendations */}
                <ImprovementRecommendations sgData={sgHistory} />
            </div>
        </div>
    );
};

// ============================================================
// USAGE EXAMPLE
// ============================================================

/*
import {
    StrokesGainedDashboard,
    SGOverviewCard,
    SGCategoryBreakdown,
    SGTrendChart,
    ImprovementRecommendations,
    MOCK_SG_HISTORY
} from './NewFeatures_StrokesGained';

// Full Dashboard
const SGScreen: React.FC = () => {
    return <StrokesGainedDashboard />;
};

// Individual Components
const QuickSGView: React.FC = () => {
    return <SGOverviewCard sgData={MOCK_SG_HISTORY[0]} />;
};
*/

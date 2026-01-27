/**
 * ============================================================
 * MCG - NEW FEATURES: COURSE STRATEGY PLANNER
 * ============================================================
 *
 * Inspired by: DECADE Golf, Hello Birdie, BlueGolf
 *
 * This file contains components for course strategy:
 * - Digital Yardage Book
 * - Hole Strategy Cards
 * - Pre-Round Game Plan
 * - Shot Dispersion Tracker
 * - Risk/Reward Analyzer
 *
 * Copy this entire file into your AI Studio project.
 * ============================================================
 */

import React, { useState, useMemo } from 'react';
import { COLORS } from '../constants';

// ============================================================
// TYPES
// ============================================================

export interface YardageBook {
    id: string;
    courseName: string;
    courseRating: number;
    slope: number;
    holes: HoleStrategy[];
    createdAt: Date;
    lastPlayed?: Date;
}

export interface HoleStrategy {
    holeNumber: number;
    par: number;
    distance: number;
    handicapIndex: number;
    teeShot: TeeStrategy;
    approach?: ApproachStrategy;
    notes: string[];
    hazards: Hazard[];
    idealScore: number;
}

export interface TeeStrategy {
    club: string;
    target: string;
    avoidLeft: string;
    avoidRight: string;
    layupYardage?: number;
}

export interface ApproachStrategy {
    preferredClub: string;
    missZone: 'SHORT' | 'LONG' | 'LEFT' | 'RIGHT' | 'CENTER';
    pinPositions: {
        front: string;
        middle: string;
        back: string;
    };
}

export interface Hazard {
    type: 'WATER' | 'BUNKER' | 'OB' | 'TREES' | 'SLOPE';
    location: string;
    distanceFromTee?: number;
    avoidanceStrategy: string;
}

export interface GamePlan {
    id: string;
    courseId: string;
    date: Date;
    targetScore: number;
    strategyNotes: string;
    holeTargets: HoleTarget[];
    conditions: PlayingConditions;
}

export interface HoleTarget {
    holeNumber: number;
    targetScore: number;
    clubSelection: string[];
    keyThought: string;
    riskLevel: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
}

export interface PlayingConditions {
    wind: 'CALM' | 'LIGHT' | 'MODERATE' | 'STRONG';
    windDirection: string;
    firmness: 'SOFT' | 'NORMAL' | 'FIRM';
    pinPositions: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface ShotDispersion {
    club: string;
    shots: DispersionPoint[];
    pattern: 'STRAIGHT' | 'FADE' | 'DRAW' | 'RANDOM';
    leftMiss: number;
    rightMiss: number;
    shortMiss: number;
    longMiss: number;
}

export interface DispersionPoint {
    x: number; // yards offline (negative = left)
    y: number; // yards short of target (negative = long)
}

// ============================================================
// MOCK DATA
// ============================================================

export const MOCK_YARDAGE_BOOK: YardageBook = {
    id: 'yb1',
    courseName: 'Medalist Golf Club',
    courseRating: 73.2,
    slope: 137,
    createdAt: new Date(),
    lastPlayed: new Date(Date.now() - 86400000 * 3),
    holes: [
        {
            holeNumber: 1,
            par: 4,
            distance: 425,
            handicapIndex: 7,
            teeShot: {
                club: 'Driver',
                target: 'Center-left of fairway bunker',
                avoidLeft: 'Trees - unplayable',
                avoidRight: 'Fairway bunker at 265'
            },
            approach: {
                preferredClub: '7 Iron',
                missZone: 'SHORT',
                pinPositions: {
                    front: 'Carry 145, land short of ridge',
                    middle: 'Full 7-iron to center',
                    back: 'Club up, avoid back bunker'
                }
            },
            notes: ['Favor left side off tee', 'Green slopes back to front'],
            hazards: [
                { type: 'BUNKER', location: 'Right fairway', distanceFromTee: 265, avoidanceStrategy: 'Aim left center' },
                { type: 'TREES', location: 'Left of fairway', avoidanceStrategy: 'Stay in fairway' }
            ],
            idealScore: 4
        },
        {
            holeNumber: 2,
            par: 3,
            distance: 185,
            handicapIndex: 15,
            teeShot: {
                club: '5 Iron',
                target: 'Center of green',
                avoidLeft: 'Water - big miss',
                avoidRight: 'Bunker - better miss'
            },
            notes: ['Club up if into wind', 'Always miss right'],
            hazards: [
                { type: 'WATER', location: 'Left of green', avoidanceStrategy: 'Aim right of pin always' },
                { type: 'BUNKER', location: 'Right greenside', avoidanceStrategy: 'Acceptable miss' }
            ],
            idealScore: 3
        },
        {
            holeNumber: 3,
            par: 5,
            distance: 545,
            handicapIndex: 3,
            teeShot: {
                club: 'Driver',
                target: 'Left side of fairway',
                avoidLeft: 'Rough - playable',
                avoidRight: 'Bunkers at 280-300',
                layupYardage: 100
            },
            approach: {
                preferredClub: 'PW',
                missZone: 'SHORT',
                pinPositions: {
                    front: 'Land short and roll on',
                    middle: 'Full swing to center',
                    back: 'Two-putt territory'
                }
            },
            notes: ['Reachable in 2 if in fairway', 'Layup to 100 if in trouble'],
            hazards: [
                { type: 'BUNKER', location: 'Right fairway 280-300', avoidanceStrategy: 'Hit 3-wood or aim left' },
                { type: 'WATER', location: 'In front of green', avoidanceStrategy: 'Lay up to 100 if unsure' }
            ],
            idealScore: 5
        }
    ]
};

// ============================================================
// HOLE STRATEGY CARD
// ============================================================

export const HoleStrategyCard: React.FC<{
    hole: HoleStrategy;
    onEdit?: () => void;
    expanded?: boolean;
}> = ({ hole, onEdit, expanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(expanded);

    const parColors = {
        3: 'bg-green-100 text-green-700',
        4: 'bg-blue-100 text-blue-700',
        5: 'bg-purple-100 text-purple-700'
    };

    const hazardIcons = {
        WATER: '💧',
        BUNKER: '🏖️',
        OB: '⛔',
        TREES: '🌲',
        SLOPE: '⛰️'
    };

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Header - Always visible */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl
                        ${parColors[hole.par as 3 | 4 | 5] || 'bg-gray-100 text-gray-700'}`}>
                        {hole.holeNumber}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">Par {hole.par}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">{hole.distance} yds</span>
                        </div>
                        <p className="text-sm text-gray-500">HCP #{hole.handicapIndex}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {hole.hazards.slice(0, 3).map((h, i) => (
                        <span key={i} className="text-lg">{hazardIcons[h.type]}</span>
                    ))}
                    <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
                    {/* Tee Shot Strategy */}
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🏌️</span>
                            <span className="font-bold text-blue-700">Tee Shot: {hole.teeShot.club}</span>
                        </div>
                        <p className="text-sm text-blue-600 mb-2">
                            <strong>Target:</strong> {hole.teeShot.target}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <span className="text-red-700">⬅️ Avoid Left:</span>
                                <p className="text-red-600">{hole.teeShot.avoidLeft}</p>
                            </div>
                            <div className="p-2 bg-red-100 rounded-lg">
                                <span className="text-red-700">➡️ Avoid Right:</span>
                                <p className="text-red-600">{hole.teeShot.avoidRight}</p>
                            </div>
                        </div>
                        {hole.teeShot.layupYardage && (
                            <p className="text-sm text-blue-600 mt-2">
                                <strong>Layup:</strong> {hole.teeShot.layupYardage} yards out
                            </p>
                        )}
                    </div>

                    {/* Approach Strategy */}
                    {hole.approach && (
                        <div className="p-3 bg-green-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🎯</span>
                                <span className="font-bold text-green-700">Approach: {hole.approach.preferredClub}</span>
                            </div>
                            <p className="text-sm text-green-600 mb-2">
                                <strong>Miss Zone:</strong> {hole.approach.missZone}
                            </p>
                            <div className="space-y-1 text-xs text-green-600">
                                <p><strong>Front Pin:</strong> {hole.approach.pinPositions.front}</p>
                                <p><strong>Middle Pin:</strong> {hole.approach.pinPositions.middle}</p>
                                <p><strong>Back Pin:</strong> {hole.approach.pinPositions.back}</p>
                            </div>
                        </div>
                    )}

                    {/* Hazards */}
                    <div>
                        <p className="font-bold text-gray-700 mb-2">Hazards</p>
                        <div className="space-y-2">
                            {hole.hazards.map((hazard, i) => (
                                <div key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                                    <span>{hazardIcons[hazard.type]}</span>
                                    <div className="text-sm">
                                        <p className="text-red-700 font-medium">{hazard.location}</p>
                                        <p className="text-red-600">{hazard.avoidanceStrategy}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    {hole.notes.length > 0 && (
                        <div>
                            <p className="font-bold text-gray-700 mb-2">Notes</p>
                            <ul className="space-y-1">
                                {hole.notes.map((note, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                        <span className="text-gray-400">•</span>
                                        {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Edit Button */}
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="w-full py-2 rounded-xl bg-gray-100 text-gray-600 font-medium active:scale-95 transition-all"
                        >
                            Edit Strategy
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// ============================================================
// YARDAGE BOOK VIEW
// ============================================================

export const YardageBookView: React.FC<{
    book: YardageBook;
    onHoleSelect?: (hole: HoleStrategy) => void;
}> = ({ book, onHoleSelect }) => {
    const [selectedNine, setSelectedNine] = useState<'FRONT' | 'BACK'>('FRONT');

    const displayedHoles = selectedNine === 'FRONT'
        ? book.holes.filter(h => h.holeNumber <= 9)
        : book.holes.filter(h => h.holeNumber > 9);

    const totalPar = displayedHoles.reduce((sum, h) => sum + h.par, 0);
    const totalYards = displayedHoles.reduce((sum, h) => sum + h.distance, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div
                className="p-6 text-white"
                style={{ background: `linear-gradient(135deg, ${COLORS.secondary}, #0D4F3C)` }}
            >
                <h2 className="text-xl font-bold">{book.courseName}</h2>
                <p className="text-white/70 text-sm mt-1">
                    Rating: {book.courseRating} / Slope: {book.slope}
                </p>
                {book.lastPlayed && (
                    <p className="text-white/60 text-xs mt-2">
                        Last played: {book.lastPlayed.toLocaleDateString()}
                    </p>
                )}
            </div>

            {/* Nine Selector */}
            <div className="bg-white px-5 py-3 flex border-b border-gray-200">
                {(['FRONT', 'BACK'] as const).map((nine) => (
                    <button
                        key={nine}
                        onClick={() => setSelectedNine(nine)}
                        className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all
                            ${selectedNine === nine ? 'text-white' : 'text-gray-500'}`}
                        style={selectedNine === nine ? { backgroundColor: COLORS.primary } : {}}
                    >
                        {nine} 9
                    </button>
                ))}
            </div>

            {/* Summary */}
            <div className="bg-white px-5 py-3 flex justify-around border-b border-gray-100">
                <div className="text-center">
                    <p className="text-sm text-gray-500">Par</p>
                    <p className="text-xl font-bold text-gray-900">{totalPar}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-500">Yards</p>
                    <p className="text-xl font-bold text-gray-900">{totalYards.toLocaleString()}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-500">Holes</p>
                    <p className="text-xl font-bold text-gray-900">{displayedHoles.length}</p>
                </div>
            </div>

            {/* Holes */}
            <div className="px-5 py-4 space-y-3">
                {displayedHoles.map((hole) => (
                    <HoleStrategyCard
                        key={hole.holeNumber}
                        hole={hole}
                        onEdit={() => onHoleSelect?.(hole)}
                    />
                ))}
            </div>
        </div>
    );
};

// ============================================================
// PRE-ROUND GAME PLAN WIZARD
// ============================================================

export const GamePlanWizard: React.FC<{
    book: YardageBook;
    onComplete: (plan: GamePlan) => void;
    onCancel: () => void;
}> = ({ book, onComplete, onCancel }) => {
    const [step, setStep] = useState<'CONDITIONS' | 'TARGETS' | 'REVIEW'>('CONDITIONS');
    const [conditions, setConditions] = useState<PlayingConditions>({
        wind: 'LIGHT',
        windDirection: 'N',
        firmness: 'NORMAL',
        pinPositions: 'MEDIUM'
    });
    const [targetScore, setTargetScore] = useState(book.courseRating);
    const [strategyNotes, setStrategyNotes] = useState('');

    const handleComplete = () => {
        const plan: GamePlan = {
            id: `gp-${Date.now()}`,
            courseId: book.id,
            date: new Date(),
            targetScore,
            strategyNotes,
            conditions,
            holeTargets: book.holes.map(h => ({
                holeNumber: h.holeNumber,
                targetScore: h.idealScore,
                clubSelection: [h.teeShot.club, h.approach?.preferredClub || ''].filter(Boolean),
                keyThought: h.notes[0] || 'Play smart',
                riskLevel: 'MODERATE'
            }))
        };
        onComplete(plan);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-5 py-4 flex items-center justify-between">
                    <button onClick={onCancel} className="text-gray-500">✕ Cancel</button>
                    <h2 className="font-bold text-gray-900">Game Plan</h2>
                    <div className="w-16" />
                </div>

                {/* Progress */}
                <div className="px-5 pb-4">
                    <div className="flex gap-2">
                        {['CONDITIONS', 'TARGETS', 'REVIEW'].map((s, i) => (
                            <div
                                key={s}
                                className={`flex-1 h-1 rounded-full transition-all
                                    ${['CONDITIONS', 'TARGETS', 'REVIEW'].indexOf(step) >= i
                                        ? ''
                                        : 'bg-gray-200'}`}
                                style={{
                                    backgroundColor: ['CONDITIONS', 'TARGETS', 'REVIEW'].indexOf(step) >= i
                                        ? COLORS.primary
                                        : undefined
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-5">
                {/* Step 1: Conditions */}
                {step === 'CONDITIONS' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Playing Conditions</h3>

                            {/* Wind */}
                            <div className="mb-4">
                                <label className="text-sm font-medium text-gray-700 block mb-2">Wind</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['CALM', 'LIGHT', 'MODERATE', 'STRONG'] as const).map((w) => (
                                        <button
                                            key={w}
                                            onClick={() => setConditions(c => ({ ...c, wind: w }))}
                                            className={`py-2 rounded-xl text-sm font-medium transition-all
                                                ${conditions.wind === w ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                                            style={conditions.wind === w ? { backgroundColor: COLORS.primary } : {}}
                                        >
                                            {w}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Wind Direction */}
                            {conditions.wind !== 'CALM' && (
                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Wind From</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['N', 'E', 'S', 'W'].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => setConditions(c => ({ ...c, windDirection: d }))}
                                                className={`py-2 rounded-xl text-sm font-medium transition-all
                                                    ${conditions.windDirection === d ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                                                style={conditions.windDirection === d ? { backgroundColor: COLORS.primary } : {}}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Green Firmness */}
                            <div className="mb-4">
                                <label className="text-sm font-medium text-gray-700 block mb-2">Green Firmness</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['SOFT', 'NORMAL', 'FIRM'] as const).map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setConditions(c => ({ ...c, firmness: f }))}
                                            className={`py-2 rounded-xl text-sm font-medium transition-all
                                                ${conditions.firmness === f ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                                            style={conditions.firmness === f ? { backgroundColor: COLORS.primary } : {}}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pin Positions */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">Pin Positions</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['EASY', 'MEDIUM', 'HARD'] as const).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setConditions(c => ({ ...c, pinPositions: p }))}
                                            className={`py-2 rounded-xl text-sm font-medium transition-all
                                                ${conditions.pinPositions === p ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                                            style={conditions.pinPositions === p ? { backgroundColor: COLORS.primary } : {}}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep('TARGETS')}
                            className="w-full py-4 rounded-2xl font-bold text-white active:scale-95 transition-all"
                            style={{ backgroundColor: COLORS.primary }}
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Step 2: Targets */}
                {step === 'TARGETS' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Set Your Target</h3>

                            <div className="text-center mb-6">
                                <p className="text-sm text-gray-500 mb-2">Target Score</p>
                                <div className="flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => setTargetScore(s => s - 1)}
                                        className="w-12 h-12 rounded-xl bg-gray-200 font-bold text-xl active:scale-95"
                                    >
                                        -
                                    </button>
                                    <span className="text-5xl font-black text-gray-900">{targetScore}</span>
                                    <button
                                        onClick={() => setTargetScore(s => s + 1)}
                                        className="w-12 h-12 rounded-xl font-bold text-xl text-white active:scale-95"
                                        style={{ backgroundColor: COLORS.primary }}
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Course Rating: {book.courseRating}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">
                                    Strategy Notes
                                </label>
                                <textarea
                                    value={strategyNotes}
                                    onChange={(e) => setStrategyNotes(e.target.value)}
                                    placeholder="Key thoughts for today's round..."
                                    className="w-full p-3 border rounded-xl resize-none focus:outline-none focus:border-orange-500"
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('CONDITIONS')}
                                className="flex-1 py-4 rounded-2xl font-bold bg-gray-200 text-gray-700 active:scale-95"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep('REVIEW')}
                                className="flex-1 py-4 rounded-2xl font-bold text-white active:scale-95"
                                style={{ backgroundColor: COLORS.primary }}
                            >
                                Review
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {step === 'REVIEW' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Game Plan Summary</h3>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500">Course</p>
                                    <p className="font-bold text-gray-900">{book.courseName}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                                        <p className="text-sm text-gray-500">Target</p>
                                        <p className="text-2xl font-bold text-gray-900">{targetScore}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                                        <p className="text-sm text-gray-500">Wind</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {conditions.wind} {conditions.windDirection}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-xl">
                                    <p className="text-sm text-blue-600 font-medium">Key Focus</p>
                                    <p className="text-blue-700">{strategyNotes || 'Play your game'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('TARGETS')}
                                className="flex-1 py-4 rounded-2xl font-bold bg-gray-200 text-gray-700 active:scale-95"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleComplete}
                                className="flex-1 py-4 rounded-2xl font-bold text-white active:scale-95"
                                style={{ backgroundColor: COLORS.success }}
                            >
                                Start Round
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================
// SHOT DISPERSION VISUALIZER
// ============================================================

export const ShotDispersionView: React.FC<{
    dispersion: ShotDispersion;
}> = ({ dispersion }) => {
    const maxOffset = Math.max(
        Math.abs(dispersion.leftMiss),
        Math.abs(dispersion.rightMiss),
        Math.abs(dispersion.shortMiss),
        Math.abs(dispersion.longMiss),
        20 // minimum scale
    );

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">{dispersion.club} Dispersion</h3>
                    <p className="text-sm text-gray-500">{dispersion.shots.length} shots tracked</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold
                    ${dispersion.pattern === 'STRAIGHT' ? 'bg-green-100 text-green-700' : ''}
                    ${dispersion.pattern === 'FADE' ? 'bg-blue-100 text-blue-700' : ''}
                    ${dispersion.pattern === 'DRAW' ? 'bg-purple-100 text-purple-700' : ''}
                    ${dispersion.pattern === 'RANDOM' ? 'bg-red-100 text-red-700' : ''}`}>
                    {dispersion.pattern}
                </span>
            </div>

            {/* Dispersion Grid */}
            <div className="relative h-64 bg-green-100 rounded-xl overflow-hidden mb-4">
                {/* Grid lines */}
                <div className="absolute inset-0">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-green-300" />
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-green-300" />
                </div>

                {/* Target marker */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                </div>

                {/* Shot markers */}
                {dispersion.shots.map((shot, i) => {
                    const x = 50 + (shot.x / maxOffset) * 40;
                    const y = 50 + (shot.y / maxOffset) * 40;
                    return (
                        <div
                            key={i}
                            className="absolute w-3 h-3 rounded-full bg-blue-500 opacity-70 -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${x}%`, top: `${y}%` }}
                        />
                    );
                })}

                {/* Labels */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-green-700">Long</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-green-700">Short</div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-green-700">Left</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-700">Right</div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-red-600">{dispersion.leftMiss}y</p>
                    <p className="text-xs text-gray-500">Left</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">{dispersion.rightMiss}y</p>
                    <p className="text-xs text-gray-500">Right</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-orange-600">{dispersion.shortMiss}y</p>
                    <p className="text-xs text-gray-500">Short</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">{dispersion.longMiss}y</p>
                    <p className="text-xs text-gray-500">Long</p>
                </div>
            </div>

            {/* Recommendation */}
            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">
                    <strong>Aim Adjustment:</strong> Based on your {dispersion.pattern.toLowerCase()} pattern,
                    aim {dispersion.rightMiss > dispersion.leftMiss ? 'slightly left' : 'slightly right'} of your target.
                </p>
            </div>
        </div>
    );
};

// ============================================================
// RISK/REWARD ANALYZER
// ============================================================

export const RiskRewardAnalyzer: React.FC<{
    aggressive: {
        success: number; // percentage
        reward: number; // strokes saved
        penalty: number; // strokes lost on failure
    };
    conservative: {
        success: number;
        reward: number;
        penalty: number;
    };
}> = ({ aggressive, conservative }) => {
    // Expected value calculation
    const aggressiveEV = (aggressive.success / 100) * aggressive.reward -
                         ((100 - aggressive.success) / 100) * aggressive.penalty;
    const conservativeEV = (conservative.success / 100) * conservative.reward -
                          ((100 - conservative.success) / 100) * conservative.penalty;

    const recommendation = aggressiveEV > conservativeEV ? 'AGGRESSIVE' : 'CONSERVATIVE';

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Risk/Reward Analysis</h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Aggressive Option */}
                <div className={`p-4 rounded-xl border-2 ${recommendation === 'AGGRESSIVE' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🔥</span>
                        <span className="font-bold text-gray-900">Aggressive</span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Success Rate</span>
                            <span className="font-medium">{aggressive.success}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">If Success</span>
                            <span className="font-medium text-green-600">+{aggressive.reward}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">If Fail</span>
                            <span className="font-medium text-red-600">-{aggressive.penalty}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                            <div className="flex justify-between">
                                <span className="font-medium">Expected Value</span>
                                <span className={`font-bold ${aggressiveEV >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {aggressiveEV >= 0 ? '+' : ''}{aggressiveEV.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conservative Option */}
                <div className={`p-4 rounded-xl border-2 ${recommendation === 'CONSERVATIVE' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🎯</span>
                        <span className="font-bold text-gray-900">Conservative</span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Success Rate</span>
                            <span className="font-medium">{conservative.success}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">If Success</span>
                            <span className="font-medium text-green-600">+{conservative.reward}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">If Fail</span>
                            <span className="font-medium text-red-600">-{conservative.penalty}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                            <div className="flex justify-between">
                                <span className="font-medium">Expected Value</span>
                                <span className={`font-bold ${conservativeEV >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {conservativeEV >= 0 ? '+' : ''}{conservativeEV.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendation */}
            <div className="p-4 rounded-xl" style={{ backgroundColor: `${COLORS.secondary}15` }}>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">💡</span>
                    <span className="font-bold" style={{ color: COLORS.secondary }}>Recommendation</span>
                </div>
                <p className="text-sm text-gray-700">
                    The <strong>{recommendation.toLowerCase()}</strong> play has a better expected value.
                    {recommendation === 'AGGRESSIVE'
                        ? ` With ${aggressive.success}% success rate and high reward, the risk is justified.`
                        : ` The ${conservative.success}% success rate provides more consistent results.`}
                </p>
            </div>
        </div>
    );
};

// ============================================================
// COURSE STRATEGY MAIN VIEW
// ============================================================

export const CourseStrategyPlanner: React.FC = () => {
    const [showWizard, setShowWizard] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<GamePlan | null>(null);

    if (showWizard) {
        return (
            <GamePlanWizard
                book={MOCK_YARDAGE_BOOK}
                onComplete={(plan) => {
                    setCurrentPlan(plan);
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
                        <h1 className="text-2xl font-bold text-gray-900">Course Strategy</h1>
                        <p className="text-sm text-gray-500">Plan your round</p>
                    </div>
                    <button
                        onClick={() => setShowWizard(true)}
                        className="px-4 py-2 rounded-xl font-bold text-white active:scale-95 transition-all"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        + New Plan
                    </button>
                </div>
            </div>

            {/* Current Plan */}
            {currentPlan && (
                <div className="px-5 py-4">
                    <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">✅</span>
                            <span className="font-bold text-green-700">Active Game Plan</span>
                        </div>
                        <p className="text-sm text-green-600">
                            Target: {currentPlan.targetScore} • {currentPlan.conditions.wind} wind from {currentPlan.conditions.windDirection}
                        </p>
                    </div>
                </div>
            )}

            {/* Yardage Book */}
            <YardageBookView book={MOCK_YARDAGE_BOOK} />
        </div>
    );
};

// ============================================================
// USAGE EXAMPLE
// ============================================================

/*
import {
    CourseStrategyPlanner,
    YardageBookView,
    HoleStrategyCard,
    GamePlanWizard,
    ShotDispersionView,
    RiskRewardAnalyzer,
    MOCK_YARDAGE_BOOK
} from './NewFeatures_CourseStrategy';

// Full Strategy Planner
const StrategyScreen: React.FC = () => {
    return <CourseStrategyPlanner />;
};

// Individual Components
const HolePreview: React.FC = () => {
    return <HoleStrategyCard hole={MOCK_YARDAGE_BOOK.holes[0]} expanded />;
};
*/

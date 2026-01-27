/**
 * ============================================================
 * MCG - NEW FEATURES: CLUB DISTANCE MANAGER
 * ============================================================
 *
 * Inspired by: Arccos, Shot Scope, Hole19
 *
 * This file contains components for club distance tracking:
 * - Smart Club Distances (entry & tracking)
 * - Club Gapping Chart (visual gaps)
 * - Condition Adjustments (altitude, temp, wind)
 * - Club Recommendation Engine
 * - Club Performance Analytics
 *
 * Copy this entire file into your AI Studio project.
 * ============================================================
 */

import React, { useState, useMemo } from 'react';
import { COLORS } from '../constants';

// ============================================================
// TYPES
// ============================================================

export interface ClubDistance {
    clubId: string;
    clubName: string;
    clubType: 'DRIVER' | 'WOOD' | 'HYBRID' | 'IRON' | 'WEDGE' | 'PUTTER';
    avgCarry: number;
    avgTotal: number;
    maxCarry: number;
    minCarry: number;
    dispersionLeft: number; // yards offline left
    dispersionRight: number; // yards offline right
    shotCount: number;
    lastUpdated: Date;
    confidenceRating: 1 | 2 | 3 | 4 | 5;
}

export interface DistanceEntry {
    id: string;
    clubId: string;
    carry: number;
    total: number;
    date: Date;
    conditions?: ShotConditions;
    notes?: string;
}

export interface ShotConditions {
    altitude?: number; // feet
    temperature?: number; // fahrenheit
    wind?: { speed: number; direction: 'INTO' | 'HELPING' | 'CROSS_LEFT' | 'CROSS_RIGHT' };
    lie?: 'FAIRWAY' | 'ROUGH' | 'SAND' | 'TEE';
}

export interface ClubRecommendation {
    primary: ClubDistance;
    alternate?: ClubDistance;
    adjustedDistance: number;
    reasoning: string;
}

// ============================================================
// MOCK DATA
// ============================================================

export const MOCK_CLUB_DISTANCES: ClubDistance[] = [
    {
        clubId: 'dr',
        clubName: 'Driver',
        clubType: 'DRIVER',
        avgCarry: 265,
        avgTotal: 285,
        maxCarry: 278,
        minCarry: 252,
        dispersionLeft: 12,
        dispersionRight: 18,
        shotCount: 45,
        lastUpdated: new Date(),
        confidenceRating: 5
    },
    {
        clubId: '3w',
        clubName: '3 Wood',
        clubType: 'WOOD',
        avgCarry: 235,
        avgTotal: 250,
        maxCarry: 245,
        minCarry: 225,
        dispersionLeft: 10,
        dispersionRight: 15,
        shotCount: 28,
        lastUpdated: new Date(),
        confidenceRating: 4
    },
    {
        clubId: '5w',
        clubName: '5 Wood',
        clubType: 'WOOD',
        avgCarry: 215,
        avgTotal: 228,
        maxCarry: 225,
        minCarry: 205,
        dispersionLeft: 8,
        dispersionRight: 12,
        shotCount: 22,
        lastUpdated: new Date(),
        confidenceRating: 4
    },
    {
        clubId: '4h',
        clubName: '4 Hybrid',
        clubType: 'HYBRID',
        avgCarry: 200,
        avgTotal: 212,
        maxCarry: 210,
        minCarry: 190,
        dispersionLeft: 8,
        dispersionRight: 10,
        shotCount: 35,
        lastUpdated: new Date(),
        confidenceRating: 5
    },
    {
        clubId: '5i',
        clubName: '5 Iron',
        clubType: 'IRON',
        avgCarry: 185,
        avgTotal: 195,
        maxCarry: 195,
        minCarry: 175,
        dispersionLeft: 7,
        dispersionRight: 9,
        shotCount: 30,
        lastUpdated: new Date(),
        confidenceRating: 4
    },
    {
        clubId: '6i',
        clubName: '6 Iron',
        clubType: 'IRON',
        avgCarry: 172,
        avgTotal: 180,
        maxCarry: 182,
        minCarry: 162,
        dispersionLeft: 6,
        dispersionRight: 8,
        shotCount: 42,
        lastUpdated: new Date(),
        confidenceRating: 5
    },
    {
        clubId: '7i',
        clubName: '7 Iron',
        clubType: 'IRON',
        avgCarry: 158,
        avgTotal: 165,
        maxCarry: 168,
        minCarry: 148,
        dispersionLeft: 5,
        dispersionRight: 7,
        shotCount: 55,
        lastUpdated: new Date(),
        confidenceRating: 5
    },
    {
        clubId: '8i',
        clubName: '8 Iron',
        clubType: 'IRON',
        avgCarry: 145,
        avgTotal: 152,
        maxCarry: 155,
        minCarry: 135,
        dispersionLeft: 5,
        dispersionRight: 6,
        shotCount: 48,
        lastUpdated: new Date(),
        confidenceRating: 5
    },
    {
        clubId: '9i',
        clubName: '9 Iron',
        clubType: 'IRON',
        avgCarry: 132,
        avgTotal: 138,
        maxCarry: 142,
        minCarry: 122,
        dispersionLeft: 4,
        dispersionRight: 5,
        shotCount: 52,
        lastUpdated: new Date(),
        confidenceRating: 5
    },
    {
        clubId: 'pw',
        clubName: 'PW',
        clubType: 'WEDGE',
        avgCarry: 120,
        avgTotal: 125,
        maxCarry: 130,
        minCarry: 110,
        dispersionLeft: 4,
        dispersionRight: 4,
        shotCount: 60,
        lastUpdated: new Date(),
        confidenceRating: 5
    },
    {
        clubId: 'gw',
        clubName: '50° GW',
        clubType: 'WEDGE',
        avgCarry: 105,
        avgTotal: 108,
        maxCarry: 115,
        minCarry: 95,
        dispersionLeft: 3,
        dispersionRight: 4,
        shotCount: 65,
        lastUpdated: new Date(),
        confidenceRating: 5
    },
    {
        clubId: 'sw',
        clubName: '56° SW',
        clubType: 'WEDGE',
        avgCarry: 85,
        avgTotal: 88,
        maxCarry: 95,
        minCarry: 75,
        dispersionLeft: 3,
        dispersionRight: 3,
        shotCount: 70,
        lastUpdated: new Date(),
        confidenceRating: 5
    },
    {
        clubId: 'lw',
        clubName: '60° LW',
        clubType: 'WEDGE',
        avgCarry: 70,
        avgTotal: 72,
        maxCarry: 80,
        minCarry: 60,
        dispersionLeft: 2,
        dispersionRight: 3,
        shotCount: 58,
        lastUpdated: new Date(),
        confidenceRating: 4
    }
];

// ============================================================
// CLUB DISTANCE CARD
// ============================================================

export const ClubDistanceCard: React.FC<{
    club: ClubDistance;
    onEdit: (club: ClubDistance) => void;
    onAddShot: (club: ClubDistance) => void;
    showDispersion?: boolean;
}> = ({ club, onEdit, onAddShot, showDispersion = true }) => {
    const typeColors = {
        DRIVER: 'bg-red-100 text-red-700',
        WOOD: 'bg-orange-100 text-orange-700',
        HYBRID: 'bg-yellow-100 text-yellow-700',
        IRON: 'bg-blue-100 text-blue-700',
        WEDGE: 'bg-green-100 text-green-700',
        PUTTER: 'bg-gray-100 text-gray-700'
    };

    const confidenceStars = '★'.repeat(club.confidenceRating) + '☆'.repeat(5 - club.confidenceRating);
    const range = club.maxCarry - club.minCarry;

    return (
        <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${typeColors[club.clubType]}`}>
                        {club.clubName}
                    </span>
                    <span className="text-yellow-500 text-sm">{confidenceStars}</span>
                </div>
                <span className="text-xs text-gray-400">{club.shotCount} shots</span>
            </div>

            {/* Main Distance Display */}
            <div className="text-center mb-4">
                <p className="text-4xl font-black text-gray-900">{club.avgCarry}</p>
                <p className="text-sm text-gray-500">
                    Carry • <span className="text-gray-700 font-medium">{club.avgTotal} total</span>
                </p>
            </div>

            {/* Range Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{club.minCarry}y</span>
                    <span>Range: {range}y</span>
                    <span>{club.maxCarry}y</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full relative">
                    <div
                        className="absolute h-full rounded-full"
                        style={{
                            left: '0%',
                            width: '100%',
                            backgroundColor: COLORS.primary,
                            opacity: 0.3
                        }}
                    />
                    <div
                        className="absolute h-full w-3 rounded-full"
                        style={{
                            left: `${((club.avgCarry - club.minCarry) / range) * 100}%`,
                            transform: 'translateX(-50%)',
                            backgroundColor: COLORS.primary
                        }}
                    />
                </div>
            </div>

            {/* Dispersion */}
            {showDispersion && (
                <div className="flex items-center justify-center gap-4 mb-4 py-2 bg-gray-50 rounded-xl">
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Left</p>
                        <p className="font-bold text-red-500">{club.dispersionLeft}y</p>
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Right</p>
                        <p className="font-bold text-blue-500">{club.dispersionRight}y</p>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => onAddShot(club)}
                    className="flex-1 py-2 rounded-xl font-medium text-white active:scale-95 transition-all"
                    style={{ backgroundColor: COLORS.primary }}
                >
                    + Add Shot
                </button>
                <button
                    onClick={() => onEdit(club)}
                    className="px-4 py-2 rounded-xl font-medium bg-gray-100 text-gray-600 active:scale-95 transition-all"
                >
                    Edit
                </button>
            </div>
        </div>
    );
};

// ============================================================
// CLUB GAPPING CHART
// ============================================================

export const ClubGappingChart: React.FC<{
    clubs: ClubDistance[];
    onClubSelect?: (club: ClubDistance) => void;
}> = ({ clubs, onClubSelect }) => {
    const sortedClubs = [...clubs].sort((a, b) => b.avgCarry - a.avgCarry);
    const maxDistance = Math.max(...clubs.map(c => c.avgCarry));

    // Calculate gaps between clubs
    const gaps = sortedClubs.slice(0, -1).map((club, i) => ({
        from: sortedClubs[i + 1].clubName,
        to: club.clubName,
        gap: club.avgCarry - sortedClubs[i + 1].avgCarry
    }));

    const idealGap = 12; // yards
    const hasGapIssue = gaps.some(g => g.gap > 18 || g.gap < 8);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">Club Gapping</h3>
                    <p className="text-sm text-gray-500">Ideal gap: 10-15 yards</p>
                </div>
                {hasGapIssue && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                        ⚠️ Gap Issues
                    </span>
                )}
            </div>

            {/* Visual Chart */}
            <div className="space-y-2 mb-6">
                {sortedClubs.map((club, i) => {
                    const width = (club.avgCarry / maxDistance) * 100;
                    const gap = i > 0 ? sortedClubs[i - 1].avgCarry - club.avgCarry : 0;
                    const isGapIssue = gap > 18 || (gap < 8 && gap > 0);

                    return (
                        <div key={club.clubId} className="flex items-center gap-3">
                            <div className="w-16 text-right">
                                <span className="text-sm font-medium text-gray-700">
                                    {club.clubName}
                                </span>
                            </div>
                            <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                                <div
                                    className="h-full rounded-lg transition-all duration-500 cursor-pointer hover:brightness-110"
                                    style={{
                                        width: `${width}%`,
                                        backgroundColor: isGapIssue ? COLORS.warning : COLORS.primary
                                    }}
                                    onClick={() => onClubSelect?.(club)}
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600">
                                    {club.avgCarry}y
                                </span>
                            </div>
                            {i > 0 && (
                                <div className={`w-12 text-center text-xs font-bold
                                    ${isGapIssue ? 'text-yellow-600' : 'text-gray-400'}`}>
                                    {gap}y
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Gap Summary */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                        {Math.round(gaps.reduce((s, g) => s + g.gap, 0) / gaps.length)}y
                    </p>
                    <p className="text-xs text-gray-500">Avg Gap</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-green-600">
                        {Math.min(...gaps.map(g => g.gap))}y
                    </p>
                    <p className="text-xs text-gray-500">Min Gap</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-red-600">
                        {Math.max(...gaps.map(g => g.gap))}y
                    </p>
                    <p className="text-xs text-gray-500">Max Gap</p>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// CONDITION ADJUSTMENT CALCULATOR
// ============================================================

export const ConditionAdjustment: React.FC<{
    baseDistance: number;
    clubName: string;
    onAdjustedDistance: (adjusted: number) => void;
}> = ({ baseDistance, clubName, onAdjustedDistance }) => {
    const [altitude, setAltitude] = useState(0);
    const [temperature, setTemperature] = useState(70);
    const [windSpeed, setWindSpeed] = useState(0);
    const [windDirection, setWindDirection] = useState<'INTO' | 'HELPING' | 'CROSS'>('INTO');

    const calculateAdjustment = useMemo(() => {
        // Altitude: ~2% per 1000ft
        const altAdjust = (altitude / 1000) * 0.02 * baseDistance;

        // Temperature: ~0.2% per degree from 70°F
        const tempAdjust = ((temperature - 70) / 10) * 0.02 * baseDistance;

        // Wind: ~1 yard per 1mph for INTO/HELPING
        let windAdjust = 0;
        if (windDirection === 'INTO') {
            windAdjust = -windSpeed * 1;
        } else if (windDirection === 'HELPING') {
            windAdjust = windSpeed * 0.5; // helping wind is less effective
        }
        // Cross wind doesn't affect distance much

        const totalAdjust = Math.round(altAdjust + tempAdjust + windAdjust);
        const adjusted = baseDistance + totalAdjust;

        return { altAdjust, tempAdjust, windAdjust, totalAdjust, adjusted };
    }, [altitude, temperature, windSpeed, windDirection, baseDistance]);

    React.useEffect(() => {
        onAdjustedDistance(calculateAdjustment.adjusted);
    }, [calculateAdjustment.adjusted, onAdjustedDistance]);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Condition Adjustments</h3>

            {/* Base Distance */}
            <div className="text-center mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">{clubName} Base Distance</p>
                <p className="text-3xl font-black text-gray-900">{baseDistance}y</p>
            </div>

            {/* Altitude Slider */}
            <div className="mb-4">
                <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Altitude</label>
                    <span className="text-sm font-bold" style={{ color: COLORS.primary }}>
                        {altitude.toLocaleString()} ft
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10000"
                    step="500"
                    value={altitude}
                    onChange={(e) => setAltitude(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Sea Level</span>
                    <span>Denver (5,280)</span>
                    <span>10,000ft</span>
                </div>
            </div>

            {/* Temperature Slider */}
            <div className="mb-4">
                <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Temperature</label>
                    <span className="text-sm font-bold" style={{ color: COLORS.primary }}>
                        {temperature}°F
                    </span>
                </div>
                <input
                    type="range"
                    min="40"
                    max="100"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Cold (40°)</span>
                    <span>Standard (70°)</span>
                    <span>Hot (100°)</span>
                </div>
            </div>

            {/* Wind */}
            <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 block mb-2">Wind</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {(['INTO', 'CROSS', 'HELPING'] as const).map((dir) => (
                        <button
                            key={dir}
                            onClick={() => setWindDirection(dir)}
                            className={`py-2 rounded-xl text-sm font-medium transition-all
                                ${windDirection === dir
                                    ? 'text-white'
                                    : 'bg-gray-100 text-gray-600'}`}
                            style={windDirection === dir ? { backgroundColor: COLORS.primary } : {}}
                        >
                            {dir === 'INTO' && '↓ Into'}
                            {dir === 'CROSS' && '→ Cross'}
                            {dir === 'HELPING' && '↑ Helping'}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">Wind Speed</span>
                    <span className="text-sm font-bold" style={{ color: COLORS.primary }}>
                        {windSpeed} mph
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="30"
                    value={windSpeed}
                    onChange={(e) => setWindSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Adjustment Breakdown */}
            <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Altitude Effect</span>
                    <span className={calculateAdjustment.altAdjust >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {calculateAdjustment.altAdjust >= 0 ? '+' : ''}{Math.round(calculateAdjustment.altAdjust)}y
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Temperature Effect</span>
                    <span className={calculateAdjustment.tempAdjust >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {calculateAdjustment.tempAdjust >= 0 ? '+' : ''}{Math.round(calculateAdjustment.tempAdjust)}y
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Wind Effect</span>
                    <span className={calculateAdjustment.windAdjust >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {calculateAdjustment.windAdjust >= 0 ? '+' : ''}{Math.round(calculateAdjustment.windAdjust)}y
                    </span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                        <span className="font-bold text-gray-700">Total Adjustment</span>
                        <span className={`font-bold ${calculateAdjustment.totalAdjust >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {calculateAdjustment.totalAdjust >= 0 ? '+' : ''}{calculateAdjustment.totalAdjust}y
                        </span>
                    </div>
                </div>
            </div>

            {/* Adjusted Distance */}
            <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: `${COLORS.primary}15` }}>
                <p className="text-sm text-gray-500">Play It As</p>
                <p className="text-4xl font-black" style={{ color: COLORS.primary }}>
                    {calculateAdjustment.adjusted}y
                </p>
            </div>
        </div>
    );
};

// ============================================================
// CLUB RECOMMENDATION ENGINE
// ============================================================

export const ClubRecommendationEngine: React.FC<{
    targetDistance: number;
    clubs: ClubDistance[];
    conditions?: ShotConditions;
}> = ({ targetDistance, clubs, conditions }) => {
    const recommendation = useMemo((): ClubRecommendation | null => {
        if (clubs.length === 0) return null;

        // Find clubs closest to target
        const sorted = [...clubs].sort((a, b) => {
            const diffA = Math.abs(a.avgCarry - targetDistance);
            const diffB = Math.abs(b.avgCarry - targetDistance);
            return diffA - diffB;
        });

        const primary = sorted[0];
        const alternate = sorted[1];

        // Calculate adjusted distance based on conditions
        let adjustment = 0;
        if (conditions?.altitude) {
            adjustment += (conditions.altitude / 1000) * 0.02 * targetDistance;
        }
        if (conditions?.temperature) {
            adjustment += ((conditions.temperature - 70) / 10) * 0.02 * targetDistance;
        }
        if (conditions?.wind) {
            if (conditions.wind.direction === 'INTO') {
                adjustment -= conditions.wind.speed * 1;
            } else if (conditions.wind.direction === 'HELPING') {
                adjustment += conditions.wind.speed * 0.5;
            }
        }

        const adjustedTarget = targetDistance - adjustment;

        // Re-sort based on adjusted target
        const resorted = [...clubs].sort((a, b) => {
            const diffA = Math.abs(a.avgCarry - adjustedTarget);
            const diffB = Math.abs(b.avgCarry - adjustedTarget);
            return diffA - diffB;
        });

        const adjustedPrimary = resorted[0];
        const adjustedAlternate = resorted[1];

        // Generate reasoning
        let reasoning = `${adjustedPrimary.clubName} carries ${adjustedPrimary.avgCarry}y on average.`;
        if (adjustment !== 0) {
            reasoning += ` Adjusted for conditions (+${Math.round(adjustment)}y effective).`;
        }
        if (adjustedPrimary.confidenceRating >= 4) {
            reasoning += ' High confidence based on shot history.';
        }

        return {
            primary: adjustedPrimary,
            alternate: adjustedAlternate,
            adjustedDistance: Math.round(adjustedTarget),
            reasoning
        };
    }, [targetDistance, clubs, conditions]);

    if (!recommendation) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
                <p className="text-gray-500">No clubs available for recommendation</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Header */}
            <div
                className="p-4 text-white text-center"
                style={{ backgroundColor: COLORS.secondary }}
            >
                <p className="text-sm opacity-80">Target Distance</p>
                <p className="text-3xl font-black">{targetDistance}y</p>
                {recommendation.adjustedDistance !== targetDistance && (
                    <p className="text-sm opacity-80 mt-1">
                        Plays as: {recommendation.adjustedDistance}y
                    </p>
                )}
            </div>

            {/* Primary Recommendation */}
            <div className="p-6">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                    Recommended Club
                </p>
                <div className="flex items-center gap-4 mb-4">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        {recommendation.primary.clubName}
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">
                            {recommendation.primary.avgCarry}y
                        </p>
                        <p className="text-sm text-gray-500">
                            Range: {recommendation.primary.minCarry}-{recommendation.primary.maxCarry}y
                        </p>
                    </div>
                </div>

                {/* Alternate */}
                {recommendation.alternate && (
                    <div className="p-3 bg-gray-50 rounded-xl mb-4">
                        <p className="text-xs text-gray-500 mb-1">Alternate Option</p>
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">
                                {recommendation.alternate.clubName}
                            </span>
                            <span className="text-sm text-gray-500">
                                {recommendation.alternate.avgCarry}y
                            </span>
                        </div>
                    </div>
                )}

                {/* Reasoning */}
                <p className="text-sm text-gray-600 leading-relaxed">
                    {recommendation.reasoning}
                </p>

                {/* Confidence */}
                <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-gray-500">Confidence:</span>
                    <span className="text-yellow-500">
                        {'★'.repeat(recommendation.primary.confidenceRating)}
                        {'☆'.repeat(5 - recommendation.primary.confidenceRating)}
                    </span>
                    <span className="text-xs text-gray-400">
                        ({recommendation.primary.shotCount} shots)
                    </span>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// DISTANCE ENTRY MODAL
// ============================================================

export const DistanceEntryModal: React.FC<{
    club: ClubDistance;
    onSubmit: (entry: Omit<DistanceEntry, 'id'>) => void;
    onClose: () => void;
}> = ({ club, onSubmit, onClose }) => {
    const [carry, setCarry] = useState(club.avgCarry);
    const [total, setTotal] = useState(club.avgTotal);
    const [notes, setNotes] = useState('');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div
                    className="p-4 text-white flex items-center justify-between"
                    style={{ backgroundColor: COLORS.primary }}
                >
                    <h3 className="font-bold text-lg">Log Shot - {club.clubName}</h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Carry Distance */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Carry Distance (yards)
                        </label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setCarry(c => Math.max(0, c - 5))}
                                className="w-12 h-12 rounded-xl bg-gray-200 font-bold text-xl active:scale-95"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={carry}
                                onChange={(e) => setCarry(Number(e.target.value))}
                                className="flex-1 text-center text-3xl font-bold py-3 border rounded-xl focus:outline-none focus:border-orange-500"
                            />
                            <button
                                onClick={() => setCarry(c => c + 5)}
                                className="w-12 h-12 rounded-xl font-bold text-xl text-white active:scale-95"
                                style={{ backgroundColor: COLORS.primary }}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Total Distance */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Total Distance (yards)
                        </label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setTotal(t => Math.max(0, t - 5))}
                                className="w-12 h-12 rounded-xl bg-gray-200 font-bold text-xl active:scale-95"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={total}
                                onChange={(e) => setTotal(Number(e.target.value))}
                                className="flex-1 text-center text-3xl font-bold py-3 border rounded-xl focus:outline-none focus:border-orange-500"
                            />
                            <button
                                onClick={() => setTotal(t => t + 5)}
                                className="w-12 h-12 rounded-xl font-bold text-xl text-white active:scale-95"
                                style={{ backgroundColor: COLORS.primary }}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Shot felt solid, slight fade..."
                            className="w-full p-3 border rounded-xl resize-none focus:outline-none focus:border-orange-500"
                            rows={3}
                        />
                    </div>

                    {/* Compare to Average */}
                    <div className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Your average</span>
                            <span className="font-medium">{club.avgCarry}y carry</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-500">This shot</span>
                            <span className={`font-bold ${carry > club.avgCarry ? 'text-green-600' : carry < club.avgCarry ? 'text-red-600' : 'text-gray-600'}`}>
                                {carry > club.avgCarry ? '+' : ''}{carry - club.avgCarry}y
                            </span>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={() => onSubmit({
                            clubId: club.clubId,
                            carry,
                            total,
                            date: new Date(),
                            notes: notes || undefined
                        })}
                        className="w-full py-4 rounded-2xl font-bold text-white active:scale-95 transition-all"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        Save Shot
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// CLUB PERFORMANCE ANALYTICS
// ============================================================

export const ClubPerformanceAnalytics: React.FC<{
    club: ClubDistance;
    recentShots: DistanceEntry[];
}> = ({ club, recentShots }) => {
    const clubShots = recentShots.filter(s => s.clubId === club.clubId);
    const avgRecent = clubShots.length > 0
        ? Math.round(clubShots.reduce((s, shot) => s + shot.carry, 0) / clubShots.length)
        : club.avgCarry;
    const trend = avgRecent - club.avgCarry;
    const consistency = club.maxCarry - club.minCarry;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">{club.clubName}</h3>
                    <p className="text-sm text-gray-500">Performance Analytics</p>
                </div>
                <span className="text-yellow-500 text-lg">
                    {'★'.repeat(club.confidenceRating)}
                </span>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-3xl font-black text-gray-900">{club.avgCarry}y</p>
                    <p className="text-xs text-gray-500">Avg Carry</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-3xl font-black text-gray-900">{consistency}y</p>
                    <p className="text-xs text-gray-500">Distance Range</p>
                </div>
            </div>

            {/* Trend */}
            <div className={`p-4 rounded-xl mb-6 ${trend >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Recent Trend</span>
                    <span className={`font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}y
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Based on last {clubShots.length} shots
                </p>
            </div>

            {/* Dispersion Pattern */}
            <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Dispersion Pattern</p>
                <div className="relative h-32 bg-green-100 rounded-xl overflow-hidden">
                    {/* Fairway representation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* Target */}
                        <div className="relative">
                            <div className="w-4 h-4 rounded-full bg-red-500" />
                            {/* Left dispersion */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 h-2 bg-blue-400 rounded-r opacity-50"
                                style={{
                                    right: '100%',
                                    width: `${club.dispersionLeft * 3}px`
                                }}
                            />
                            {/* Right dispersion */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 h-2 bg-red-400 rounded-l opacity-50"
                                style={{
                                    left: '100%',
                                    width: `${club.dispersionRight * 3}px`
                                }}
                            />
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="absolute bottom-2 left-2 text-xs text-gray-600">
                        L: {club.dispersionLeft}y
                    </div>
                    <div className="absolute bottom-2 right-2 text-xs text-gray-600">
                        R: {club.dispersionRight}y
                    </div>
                </div>
            </div>

            {/* Shot Count */}
            <div className="text-center p-3 bg-gray-100 rounded-xl">
                <p className="text-sm text-gray-600">
                    <span className="font-bold" style={{ color: COLORS.primary }}>
                        {club.shotCount}
                    </span>
                    {' '}shots tracked
                </p>
                <p className="text-xs text-gray-400">
                    Last updated: {club.lastUpdated.toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};

// ============================================================
// CLUB MANAGER MAIN VIEW
// ============================================================

export const ClubDistanceManager: React.FC<{
    onClubSelect?: (club: ClubDistance) => void;
}> = ({ onClubSelect }) => {
    const [activeTab, setActiveTab] = useState<'DISTANCES' | 'GAPPING' | 'CALCULATOR'>('DISTANCES');
    const [selectedClub, setSelectedClub] = useState<ClubDistance | null>(null);
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [targetDistance, setTargetDistance] = useState(150);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-5 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Club Distances</h1>
                    <p className="text-sm text-gray-500">Know your numbers</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    {(['DISTANCES', 'GAPPING', 'CALCULATOR'] as const).map((tab) => (
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
                            {tab === 'DISTANCES' && '📏 '}
                            {tab === 'GAPPING' && '📊 '}
                            {tab === 'CALCULATOR' && '🧮 '}
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="px-5 py-6">
                {activeTab === 'DISTANCES' && (
                    <div className="grid gap-4">
                        {MOCK_CLUB_DISTANCES.map((club) => (
                            <ClubDistanceCard
                                key={club.clubId}
                                club={club}
                                onEdit={(c) => {
                                    setSelectedClub(c);
                                    onClubSelect?.(c);
                                }}
                                onAddShot={(c) => {
                                    setSelectedClub(c);
                                    setShowEntryModal(true);
                                }}
                            />
                        ))}
                    </div>
                )}

                {activeTab === 'GAPPING' && (
                    <ClubGappingChart
                        clubs={MOCK_CLUB_DISTANCES}
                        onClubSelect={onClubSelect}
                    />
                )}

                {activeTab === 'CALCULATOR' && (
                    <div className="space-y-6">
                        {/* Target Input */}
                        <div className="bg-white rounded-3xl p-6 shadow-lg">
                            <label className="text-sm font-medium text-gray-700 block mb-2">
                                Target Distance
                            </label>
                            <input
                                type="number"
                                value={targetDistance}
                                onChange={(e) => setTargetDistance(Number(e.target.value))}
                                className="w-full text-center text-4xl font-bold py-4 border-2 rounded-2xl
                                           focus:outline-none focus:border-orange-500"
                            />
                            <p className="text-center text-sm text-gray-500 mt-2">yards to target</p>
                        </div>

                        {/* Recommendation */}
                        <ClubRecommendationEngine
                            targetDistance={targetDistance}
                            clubs={MOCK_CLUB_DISTANCES}
                        />

                        {/* Condition Adjustments */}
                        {MOCK_CLUB_DISTANCES.find(c => Math.abs(c.avgCarry - targetDistance) < 20) && (
                            <ConditionAdjustment
                                baseDistance={targetDistance}
                                clubName={MOCK_CLUB_DISTANCES.find(c => Math.abs(c.avgCarry - targetDistance) < 20)?.clubName || ''}
                                onAdjustedDistance={() => {}}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Entry Modal */}
            {showEntryModal && selectedClub && (
                <DistanceEntryModal
                    club={selectedClub}
                    onSubmit={(entry) => {
                        console.log('New shot entry:', entry);
                        setShowEntryModal(false);
                    }}
                    onClose={() => setShowEntryModal(false)}
                />
            )}
        </div>
    );
};

// ============================================================
// USAGE EXAMPLE
// ============================================================

/*
import {
    ClubDistanceManager,
    ClubDistanceCard,
    ClubGappingChart,
    ClubRecommendationEngine,
    ConditionAdjustment,
    ClubPerformanceAnalytics,
    MOCK_CLUB_DISTANCES
} from './NewFeatures_ClubManager';

// Full Manager View
const ClubScreen: React.FC = () => {
    return <ClubDistanceManager onClubSelect={(club) => console.log('Selected:', club)} />;
};

// Individual Components
const QuickLookup: React.FC = () => {
    const [target, setTarget] = useState(150);

    return (
        <ClubRecommendationEngine
            targetDistance={target}
            clubs={MOCK_CLUB_DISTANCES}
        />
    );
};
*/

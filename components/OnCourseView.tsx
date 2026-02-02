
import React, { useState, useEffect, useMemo } from 'react';
import { Text, Card, Button, Badge } from './UIComponents';
import { COLORS, MOCK_HOLE, MOCK_CLUBS, MOCK_CONDITIONS, MOCK_CADDIE_TIPS } from '../constants';
import { db } from '../services/dataService';
import { ClubData, HoleData, PlayingConditions, ClubSuggestion, Hazard, LayupTarget } from '../types';

const Icons = {
    MapPin: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
    Flag: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>,
    Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Wind: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>,
    Robot: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
};

// --- DISTANCE ADJUSTMENT ENGINE ---
// Based on Trackman research and USGA distance standards
//
// Temperature: ~1.5-2 yards per 10°F from 70°F baseline per 100y of carry.
//   Source: Trackman data shows ~0.2% per °F for irons, ~0.15% for driver.
//   We use 1.8y per 10°F per 100y (0.18% per °F) as a good average.
//
// Altitude: Air density decreases ~3% per 1000ft. Ball flight is less
//   impeded, so distance increases. Rule of thumb: ~2% per 1000ft for
//   irons and ~2.5% for driver (lower spin = more altitude effect).
//   Using 2% per 1000ft as a balanced estimate.
//
// Elevation change: The "1 yard per 3 feet" rule is a common approximation.
//   More precisely: each foot of elevation change ≈ 0.3-0.35 yards for
//   mid-irons. We use the standard 1:3 ratio.
//
// Humidity: Humid air is LESS dense than dry air (water vapor is lighter
//   than nitrogen/oxygen). A 50% increase in humidity adds ~1 yard per
//   100 yards. Effect is small but real.
//
// Wind: The most complex factor. Headwind has roughly 2x the effect of
//   tailwind at the same speed due to increased spin effect.
//   Rule of thumb: 1% distance change per mph headwind, 0.5% per mph tailwind.
//   Crosswind doesn't change distance much but affects lateral dispersion.
//
const calculateAdjustedDistance = (baseDist: number, conditions: PlayingConditions, elevation: number) => {
    const factors: string[] = [];
    let adj = baseDist;

    // --- Temperature adjustment ---
    // Baseline: 70°F. Each °F deviation ≈ 0.18% distance per 100y.
    const tempDiff = conditions.temperature - 70;
    if (Math.abs(tempDiff) >= 5) {
        const tempPct = tempDiff * 0.0018; // 0.18% per degree
        const val = baseDist * tempPct;
        adj += val;
        factors.push(`Temp ${val > 0 ? '+' : ''}${Math.round(val)}y`);
    }

    // --- Altitude adjustment ---
    // ~2% per 1000 feet of elevation above sea level
    if (conditions.altitude > 500) {
        const altPct = (conditions.altitude / 1000) * 0.02;
        const altVal = baseDist * altPct;
        adj += altVal;
        factors.push(`Alt +${Math.round(altVal)}y`);
    }

    // --- Elevation change (uphill/downhill to target) ---
    // 1 yard per 3 feet of elevation change
    if (Math.abs(elevation) >= 3) {
        const elevAdj = elevation / 3;
        adj += elevAdj;
        factors.push(`Elev ${elevAdj > 0 ? '+' : ''}${Math.round(elevAdj)}y`);
    }

    // --- Humidity adjustment ---
    // Humid air is lighter. ~0.5 yard per 25% humidity increase per 100y
    if (conditions.humidity !== undefined) {
        const humDiff = (conditions.humidity - 50) / 25; // normalize to 50% baseline
        if (Math.abs(humDiff) >= 1) {
            const humVal = baseDist * humDiff * 0.005; // ~0.5% per 25% humidity
            adj += humVal;
            factors.push(`Hum ${humVal > 0 ? '+' : ''}${Math.round(humVal)}y`);
        }
    }

    // --- Wind adjustment ---
    // Headwind: ~1% per mph (2x effect of tailwind due to added spin/drag)
    // Tailwind: ~0.5% per mph
    // Cross: minimal distance effect (mainly lateral)
    if (conditions.windSpeed > 5) {
        const dir = conditions.windDirection || '';
        let windFactor = 0;

        // Determine head/tail component based on direction
        // Assume player is hitting "South" (toward target)
        // N = headwind, S = tailwind, E/W = cross
        if (dir.includes('N') && !dir.includes('S')) {
            // Headwind component
            const headComponent = dir === 'N' ? 1.0 : 0.707; // NE/NW = partial
            windFactor = -conditions.windSpeed * headComponent * 0.01; // 1% per mph headwind
        } else if (dir.includes('S') && !dir.includes('N')) {
            // Tailwind component
            const tailComponent = dir === 'S' ? 1.0 : 0.707;
            windFactor = conditions.windSpeed * tailComponent * 0.005; // 0.5% per mph tailwind
        }
        // Pure E or W = crosswind, minimal distance impact

        if (Math.abs(windFactor) > 0) {
            const windVal = baseDist * windFactor;
            adj += windVal;
            factors.push(`Wind ${windVal > 0 ? '+' : ''}${Math.round(windVal)}y`);
        }
    }

    return { distance: Math.round(adj), factors };
};

/**
 * Club suggestion algorithm with confidence scoring.
 *
 * Confidence is based on:
 * - Distance match (primary): how close the club's average is to the target
 * - Dispersion (if available): tighter dispersion = higher confidence
 * - Conditions: wind/slope may favor a particular club approach
 *
 * A confidence of 90+ = "no brainer" club selection
 * 70-89 = good choice, 50-69 = toss-up between clubs, <50 = between clubs
 */
const getClubSuggestion = (target: number, clubs: ClubData[]): { club: ClubData; confidence: number; alternative?: ClubData } => {
    const sorted = [...clubs]
        .filter(c => c.avgDistance > 0)
        .sort((a, b) => Math.abs(a.avgDistance - target) - Math.abs(b.avgDistance - target));

    const best = sorted[0];
    const diff = Math.abs(best.avgDistance - target);

    // Confidence: 100 at 0 diff, drops ~3 per yard of difference
    // Floors at 20% (there's always some club that works)
    const confidence = Math.max(20, Math.min(98, 100 - diff * 3));

    const alternative = sorted.length > 1 ? sorted[1] : undefined;

    return { club: best, confidence, alternative };
};

// --- COMPONENTS ---

export const OnCourseView: React.FC = () => {
    const [mode, setMode] = useState<'PLAY' | 'HISTORY'>('PLAY');
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return <ActiveRoundView onEndRound={() => setIsPlaying(false)} />;
    }

    return (
        <div className="pb-32 animate-in fade-in duration-500 bg-[#F5F5F7]">
            <div className="px-4 pt-6 sticky top-0 bg-[#F5F5F7] z-10 pb-4">
                <Text variant="caption" className="uppercase font-bold tracking-widest text-orange-500 mb-1">On Course</Text>
                <div className="flex justify-between items-end mb-4">
                    <Text variant="h1" className="mb-0">Play Golf</Text>
                </div>
                <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                    <button 
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'PLAY' ? 'bg-green-600 text-white shadow' : 'text-gray-500'}`}
                        onClick={() => setMode('PLAY')}
                    >
                        Play Round
                    </button>
                    <button 
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'HISTORY' ? 'bg-green-600 text-white shadow' : 'text-gray-500'}`}
                        onClick={() => setMode('HISTORY')}
                    >
                        History
                    </button>
                </div>
            </div>

            {mode === 'PLAY' && (
                <div className="px-4 space-y-6">
                    <Card variant="filled" className="bg-gradient-to-br from-green-800 to-green-900 text-white overflow-hidden relative min-h-[200px] flex flex-col justify-center items-center text-center shadow-lg cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => setIsPlaying(true)}>
                        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center"></div>
                        <div className="relative z-10 p-6">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⛳</div>
                            <Text variant="h2" color="white" className="mb-2">Start New Round</Text>
                            <Text color="gray-300" className="mb-6 max-w-xs mx-auto text-sm">GPS, Shot Tracking & Maestro Caddie</Text>
                            <Button variant="primary" size="lg" className="bg-white text-green-900 hover:bg-gray-100 border-none">Tee Off</Button>
                        </div>
                    </Card>

                    <div>
                        <Text variant="h3" className="mb-3">Nearby Courses</Text>
                        <div className="space-y-3">
                            {['TPC Summerlin', 'Shadow Creek', 'Wynn Golf Club'].map((course, i) => (
                                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer hover:border-green-500 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                                            <Icons.Flag />
                                        </div>
                                        <div>
                                            <Text variant="h4" className="text-sm font-bold">{course}</Text>
                                            <Text variant="caption" className="text-xs">{(i * 1.5 + 2.1).toFixed(1)} miles away</Text>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="text-xs h-8">Select</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {mode === 'HISTORY' && (
                <div className="px-4 text-center py-12 text-gray-400">
                    <p>No round history yet.</p>
                </div>
            )}
        </div>
    );
};

const ActiveRoundView: React.FC<{ onEndRound: () => void }> = ({ onEndRound }) => {
    const hole = MOCK_HOLE;
    const conditions = MOCK_CONDITIONS;
    const clubs = MOCK_CLUBS;
    const [distToPin, setDistToPin] = useState(hole.yardage); // Simulate GPS updates
    
    // Derived values
    const elevation = -8; // Mock elevation
    const { distance: adjustedDist, factors } = calculateAdjustedDistance(distToPin, conditions, elevation);
    const suggestion = getClubSuggestion(adjustedDist, clubs);
    const [activeTip, setActiveTip] = useState(MOCK_CADDIE_TIPS[0]);

    return (
        <div className="fixed inset-0 bg-gray-900 text-white z-50 flex flex-col">
            {/* Top Bar */}
            <div className="px-4 py-3 flex justify-between items-center bg-black/40 backdrop-blur-md safe-area-top z-20 absolute top-0 left-0 right-0">
                <button onClick={onEndRound} className="text-gray-300 hover:text-white text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">Exit</button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">TPC Summerlin</span>
                    <span className="text-lg font-black font-mono">Hole {hole.number} <span className="text-gray-500 font-normal">|</span> Par {hole.par}</span>
                </div>
                <div className="bg-green-600 px-3 py-1 rounded-lg text-sm font-bold shadow-lg shadow-green-900/50">E</div>
            </div>

            {/* Visualizer (Simulated) */}
            <div className="flex-1 relative bg-gray-800 overflow-hidden">
                {/* Background Map Placeholder */}
                <div className="absolute inset-0 bg-[#1e293b] flex items-center justify-center">
                    <div className="w-1/2 h-full bg-green-900/20 border-l-2 border-r-2 border-white/5 relative">
                        {/* Hazards */}
                        {hole.hazards.map((h, i) => (
                            <div key={i} className={`absolute w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-[8px] font-bold shadow-lg ${h.type === 'WATER' ? 'bg-blue-500/80 text-white' : 'bg-yellow-200/80 text-yellow-900'}`}
                                style={{ top: `${(h.carryDistance / hole.yardage) * 80}%`, [h.side === 'LEFT' ? 'left' : 'right']: '-20%' }}>
                                {h.carryDistance}
                            </div>
                        ))}
                    </div>
                </div>

                {/* HUD */}
                <div className="absolute top-20 left-4 right-4 flex justify-between items-start pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 text-xs">
                        <div className="flex items-center gap-1 mb-1 font-bold"><Icons.Wind /> {conditions.windSpeed} mph {conditions.windDirection}</div>
                        <div className="text-[10px] text-gray-400">Plays {adjustedDist > distToPin ? '+' : ''}{adjustedDist - distToPin}y</div>
                    </div>
                    
                    <div className="bg-orange-600 text-white p-3 rounded-xl shadow-lg shadow-orange-900/50 animate-in slide-in-from-right duration-500 text-right">
                        <div className="text-[9px] font-bold uppercase opacity-80 mb-0.5">Suggested Club</div>
                        <div className="text-2xl font-black leading-none">{suggestion.club.name}</div>
                        <div className="text-[10px] opacity-90 mt-1">{suggestion.confidence}% Confidence</div>
                    </div>
                </div>

                {/* Center Distance */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
                    <div className="bg-white text-black px-4 py-2 rounded-full shadow-2xl font-black text-xl flex items-center gap-2 mb-2">
                        <Icons.Flag /> {distToPin}y
                    </div>
                    <div className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm inline-block">
                        Plays Like <span className="font-bold text-orange-400">{adjustedDist}y</span>
                    </div>
                </div>

                {/* Caddie Tip Toast */}
                <div className="absolute bottom-32 left-4 right-4 cursor-pointer pointer-events-auto" onClick={() => setActiveTip(MOCK_CADDIE_TIPS[(MOCK_CADDIE_TIPS.indexOf(activeTip) + 1) % MOCK_CADDIE_TIPS.length])}>
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-3 rounded-xl border border-gray-700 shadow-2xl flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-lg">
                            <Icons.Robot />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <div className="text-[10px] text-blue-400 font-bold uppercase mb-1">Maestro Strategy</div>
                                <div className="text-[10px] text-gray-500">Tap for more</div>
                            </div>
                            <div className="text-xs leading-relaxed text-gray-200 font-medium">{activeTip.message}</div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 right-6">
                    <button className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-transform border-4 border-green-500/30">
                        <Icons.Plus />
                    </button>
                </div>
            </div>

            {/* Bottom Panel */}
            <div className="bg-gray-900 p-4 pb-8 border-t border-gray-800 safe-area-bottom grid grid-cols-3 gap-4 text-center relative z-20">
                 <div>
                    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Front</div>
                    <div className="text-xl font-bold text-gray-300">{distToPin - 12}</div>
                 </div>
                 <div>
                    <div className="text-green-500 text-[10px] uppercase font-bold tracking-wider mb-1">Adjusted</div>
                    <div className="text-3xl font-black text-white">{adjustedDist}</div>
                 </div>
                 <div>
                    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Back</div>
                    <div className="text-xl font-bold text-gray-300">{distToPin + 15}</div>
                 </div>
            </div>
        </div>
    );
};


import React, { useState, useMemo } from 'react';
import { COLORS, MOCK_PUTTING_STATS, PUTTING_GAMES, TOUR_AVERAGES } from '../constants';
import { PuttingStats, GreenReading } from '../types';
import { ScreenHeader, Card, Button, Badge } from './UIComponents';
import { getTourPuttMakePct, getExpectedStrokes } from '../services/dataService';

// ============================================================
// AIMPOINT GREEN READING PHYSICS ENGINE
// ============================================================

/**
 * Calculate putt break using physics-based model.
 *
 * The ball rolling on a tilted green follows a curved path due to gravity.
 * The key physics:
 *
 * Break distance = (g * sin(theta) * t^2) / 2
 *
 * Where:
 *   g = 9.81 m/s² (gravity)
 *   theta = slope angle (derived from slope %)
 *   t = time ball is rolling (derived from distance & stimp)
 *
 * Stimpmeter relationship:
 *   A stimp reading of S means a ball rolled from the ramp (at fixed height)
 *   will travel S feet. This gives us the deceleration rate:
 *   deceleration = 2 * v0 / (S * 0.3048) where v0 ≈ 1.83 m/s (standard ramp)
 *
 * Roll time for a putt of distance D on stimp S:
 *   v0_putt = sqrt(2 * decel * D_meters)
 *   t_roll = v0_putt / decel
 *
 * Lateral displacement due to slope during roll:
 *   break = 0.5 * g * sin(slope_angle) * t_roll^2
 *
 * AimPoint offset: aim at roughly break_amount * 0.65 (accounting for
 * the ball's curved path - you don't aim at the full break distance
 * because the ball curves during roll, not at the start line only).
 */
function calculateGreenReading(
    slopePct: number,
    distanceFeet: number,
    stimpReading: number,
    isUphill: boolean = false,
    grainDirection: 'WITH' | 'AGAINST' | 'CROSS' | 'NONE' = 'NONE'
): {
    breakInches: number;
    aimInches: number;
    cupEdges: number;
    rollTime: number;
    initialSpeed: number;
    adjustedDistance: number;
    effectiveStimpmeter: number;
    sgExpectedPutts: number;
} {
    const G = 32.174; // gravity in ft/s²
    const STIMP_RAMP_VELOCITY = 6.0; // ft/s (standard USGA Stimpmeter ramp exit speed)

    // --- Grain adjustment ---
    // Grain affects effective green speed (stimp):
    // With grain: ball rolls further (add ~0.5-1.0 to stimp)
    // Against grain: ball rolls shorter (subtract ~0.5-1.0)
    // Cross grain: adds slight lateral drift (~15% more break)
    let effectiveStimpmeter = stimpReading;
    let grainBreakMultiplier = 1.0;
    if (grainDirection === 'WITH') effectiveStimpmeter += 0.75;
    else if (grainDirection === 'AGAINST') effectiveStimpmeter -= 0.75;
    else if (grainDirection === 'CROSS') grainBreakMultiplier = 1.15;

    effectiveStimpmeter = Math.max(5, Math.min(16, effectiveStimpmeter));

    // --- Deceleration from Stimpmeter ---
    // From stimp physics: v0^2 = 2 * a * d
    // where v0 = ramp exit velocity, d = stimp distance
    // a = v0^2 / (2 * stimp_feet)
    const deceleration = (STIMP_RAMP_VELOCITY * STIMP_RAMP_VELOCITY) / (2 * effectiveStimpmeter);

    // --- Uphill/Downhill adjustment ---
    // Uphill putts play longer (need more initial speed → more time for break to act)
    // Downhill putts play shorter (less initial speed → but more time at slow speeds)
    // Rule of thumb: 1% slope ≈ 10-15% distance adjustment
    const slopeAngleRad = Math.atan(slopePct / 100);
    let adjustedDistance = distanceFeet;
    if (isUphill) {
        // Uphill: effective distance increases by slope factor
        adjustedDistance = distanceFeet * (1 + slopePct * 0.12);
    } else {
        // Downhill: effective distance decreases, but break increases
        adjustedDistance = distanceFeet * (1 - slopePct * 0.08);
    }
    adjustedDistance = Math.max(1, adjustedDistance);

    // --- Initial putt velocity needed ---
    // v0^2 = 2 * a * d (kinematic equation)
    const v0 = Math.sqrt(2 * deceleration * adjustedDistance);

    // --- Roll time ---
    // t = v0 / a (time to decelerate to zero)
    const rollTime = v0 / deceleration;

    // --- Lateral break calculation ---
    // Side slope component of gravity: g * sin(theta)
    // Lateral displacement = 0.5 * g_lateral * t^2
    const lateralAccel = G * Math.sin(slopeAngleRad);
    let breakFeet = 0.5 * lateralAccel * rollTime * rollTime;

    // Apply grain multiplier for cross-grain
    breakFeet *= grainBreakMultiplier;

    // Downhill putts: ball is moving slower for longer, so break is amplified
    if (!isUphill) {
        breakFeet *= (1 + slopePct * 0.15);
    }

    const breakInches = breakFeet * 12;

    // --- AimPoint calculation ---
    // The aim point is NOT the full break amount. Because the ball curves,
    // you aim at approximately 65% of the total break (the "1/3 - 2/3 rule":
    // 2/3 of break happens in the last 1/3 of the putt as ball slows down).
    const aimInches = breakInches * 0.65;

    // Cup edges (golf cup diameter = 4.25 inches, radius = 2.125 inches)
    const cupEdges = Math.ceil(aimInches / 2.125);

    // --- SG Expected putts from this distance ---
    const sgExpectedPutts = getExpectedStrokes('GREEN', distanceFeet);

    return {
        breakInches: Math.round(breakInches * 10) / 10,
        aimInches: Math.round(aimInches * 10) / 10,
        cupEdges: Math.max(0, cupEdges),
        rollTime: Math.round(rollTime * 100) / 100,
        initialSpeed: Math.round(v0 * 100) / 100,
        adjustedDistance: Math.round(adjustedDistance * 10) / 10,
        effectiveStimpmeter: Math.round(effectiveStimpmeter * 10) / 10,
        sgExpectedPutts: Math.round(sgExpectedPutts * 1000) / 1000,
    };
}

const AimPointCalculator: React.FC = () => {
    const [slope, setSlope] = useState(2);
    const [distance, setDistance] = useState(10);
    const [stimp, setStimp] = useState(10);
    const [direction, setDirection] = useState<'LEFT' | 'RIGHT'>('RIGHT');
    const [isUphill, setIsUphill] = useState(false);
    const [grain, setGrain] = useState<'WITH' | 'AGAINST' | 'CROSS' | 'NONE'>('NONE');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const result = useMemo(() => {
        return calculateGreenReading(slope, distance, stimp, isUphill, grain);
    }, [slope, distance, stimp, isUphill, grain]);

    // Tour make percentage at this distance
    const tourMakePct = useMemo(() => getTourPuttMakePct(distance), [distance]);

    return (
        <Card variant="elevated" className="border-t-4 border-t-green-600 p-0 overflow-hidden">
            <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-green-900">AimPoint Calculator</h3>
                    <p className="text-[10px] text-green-700">Physics-based green reading</p>
                </div>
                <span className="text-xs font-bold text-green-700 bg-white px-2 py-1 rounded-lg shadow-sm">Green Reading</span>
            </div>
            <div className="p-5 space-y-5">
                {/* Slope */}
                <div>
                    <div className="flex justify-between mb-2 text-sm font-bold text-gray-700">
                        <span>Side Slope</span>
                        <span className="text-green-700">{slope}%</span>
                    </div>
                    <input type="range" min="0" max="6" step="0.5" value={slope} onChange={e => setSlope(Number(e.target.value))} className="w-full accent-green-600" />
                    <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                        <span>Flat</span>
                        <span>Severe (6%)</span>
                    </div>
                </div>

                {/* Distance */}
                <div>
                    <div className="flex justify-between mb-2 text-sm font-bold text-gray-700">
                        <span>Distance to Hole</span>
                        <span className="text-green-700">{distance} ft</span>
                    </div>
                    <input type="range" min="3" max="60" value={distance} onChange={e => setDistance(Number(e.target.value))} className="w-full accent-green-600" />
                    <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                        <span>3 ft</span>
                        <span>60 ft</span>
                    </div>
                </div>

                {/* Stimp */}
                <div>
                    <div className="flex justify-between mb-2 text-sm font-bold text-gray-700">
                        <span>Green Speed (Stimp)</span>
                        <span className="text-green-700">{stimp}</span>
                    </div>
                    <input type="range" min="7" max="14" step="0.5" value={stimp} onChange={e => setStimp(Number(e.target.value))} className="w-full accent-green-600" />
                    <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                        <span>Slow (7)</span>
                        <span>Tour (10-11)</span>
                        <span>Fast (14)</span>
                    </div>
                </div>

                {/* Break Direction */}
                <div className="flex gap-2">
                    <button onClick={() => setDirection('LEFT')} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${direction === 'LEFT' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600'}`}>Left Break</button>
                    <button onClick={() => setDirection('RIGHT')} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${direction === 'RIGHT' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600'}`}>Right Break</button>
                </div>

                {/* Advanced Options */}
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-green-600 font-bold">
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </button>

                {showAdvanced && (
                    <div className="space-y-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                        {/* Uphill/Downhill */}
                        <div>
                            <span className="text-xs font-bold text-gray-600 mb-1.5 block">Elevation</span>
                            <div className="flex gap-2">
                                <button onClick={() => setIsUphill(true)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border ${isUphill ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-500'}`}>Uphill</button>
                                <button onClick={() => setIsUphill(false)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border ${!isUphill ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-500'}`}>Downhill / Flat</button>
                            </div>
                        </div>

                        {/* Grain */}
                        <div>
                            <span className="text-xs font-bold text-gray-600 mb-1.5 block">Grain Direction</span>
                            <div className="grid grid-cols-4 gap-1.5">
                                {(['NONE', 'WITH', 'AGAINST', 'CROSS'] as const).map(g => (
                                    <button key={g} onClick={() => setGrain(g)} className={`py-1.5 rounded-lg text-[9px] font-bold border ${grain === g ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-500'}`}>
                                        {g === 'NONE' ? 'None' : g === 'WITH' ? 'With' : g === 'AGAINST' ? 'Against' : 'Cross'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* RESULT */}
                <div className="bg-gray-900 text-white rounded-xl p-4">
                    <div className="text-center mb-3">
                        <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Aim Target</div>
                        <div className="text-3xl font-black mb-1">
                            {result.aimInches}" {direction === 'LEFT' ? 'Right' : 'Left'}
                        </div>
                        <div className="text-sm text-gray-400 font-medium">
                            ({result.cupEdges} cup{result.cupEdges !== 1 ? 's' : ''} out)
                        </div>
                    </div>

                    {/* Visual aim guide */}
                    <div className="relative h-16 mx-auto w-48 mb-3">
                        {/* Hole */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-700 border-2 border-gray-500" />
                        {/* Aim point */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50"
                            style={{
                                left: `${50 + (direction === 'RIGHT' ? -1 : 1) * Math.min(result.aimInches * 1.5, 45)}%`,
                            }}
                        />
                        {/* Aim line */}
                        <div className="absolute top-1/2 left-1/2 -translate-y-px h-px bg-orange-500/50"
                            style={{
                                width: `${Math.min(result.aimInches * 1.5, 45)}%`,
                                transform: `translateX(${direction === 'RIGHT' ? '-100%' : '0'})`,
                            }}
                        />
                        {/* Cup edges markers */}
                        {Array.from({ length: Math.min(result.cupEdges, 6) }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-gray-600 rounded opacity-40"
                                style={{
                                    left: `${50 + (direction === 'RIGHT' ? -1 : 1) * (i + 1) * 7}%`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Detailed metrics */}
                    <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-700 pt-3">
                        <div>
                            <div className="text-[9px] text-gray-500 uppercase">Total Break</div>
                            <div className="text-sm font-bold">{result.breakInches}"</div>
                        </div>
                        <div>
                            <div className="text-[9px] text-gray-500 uppercase">Plays Like</div>
                            <div className="text-sm font-bold">{result.adjustedDistance} ft</div>
                        </div>
                        <div>
                            <div className="text-[9px] text-gray-500 uppercase">Roll Time</div>
                            <div className="text-sm font-bold">{result.rollTime}s</div>
                        </div>
                    </div>

                    {/* Tour stats */}
                    <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-[10px]">
                        <div>
                            <span className="text-gray-500">Tour make %: </span>
                            <span className="text-orange-400 font-bold">{tourMakePct.toFixed(0)}%</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Expected putts: </span>
                            <span className="text-orange-400 font-bold">{result.sgExpectedPutts.toFixed(3)}</span>
                        </div>
                        {grain !== 'NONE' && (
                            <div>
                                <span className="text-gray-500">Eff. Stimp: </span>
                                <span className="text-orange-400 font-bold">{result.effectiveStimpmeter}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Physics explanation */}
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                    <p className="text-[9px] text-green-700 font-bold uppercase mb-1">How This Works</p>
                    <p className="text-[10px] text-green-800 leading-relaxed">
                        Uses Stimpmeter physics to calculate deceleration rate (a = v0^2 / 2S),
                        then derives roll time from putt distance. Lateral break = 0.5 * g * sin(slope) * t^2.
                        Aim point uses the 65% rule (2/3 of break occurs in last 1/3 of roll).
                        {isUphill ? ' Uphill adjustment: +12% per 1% slope.' : ''}
                        {grain !== 'NONE' ? ` Grain ${grain.toLowerCase()}: ${grain === 'WITH' ? '+0.75' : grain === 'AGAINST' ? '-0.75' : '15% more break'} stimp adjustment.` : ''}
                    </p>
                </div>
            </div>
        </Card>
    );
};

const PuttingSpeedTrainer: React.FC = () => {
    const [distance, setDistance] = useState(20);
    const [log, setLog] = useState<{dist: number, result: number}[]>([]);

    const addLog = (res: number) => setLog([...log, { dist: distance, result: res }]);

    // Calculate SG for putting drill results
    const sgAnalysis = useMemo(() => {
        if (log.length === 0) return null;
        const totalSG = log.reduce((acc, entry) => {
            // Expected strokes from initial distance
            const expected = getExpectedStrokes('GREEN', entry.dist);
            // Expected strokes from result distance (where ball stopped)
            const remaining = entry.result === 0 ? 0 : getExpectedStrokes('GREEN', entry.result);
            // SG = expected_before - (expected_after + 1)
            // For speed training, we measure proximity, so SG ≈ expected - remaining - 1
            return acc + (expected - remaining - 1);
        }, 0);
        return {
            totalSG: Math.round(totalSG * 100) / 100,
            avgSG: Math.round((totalSG / log.length) * 100) / 100,
        };
    }, [log]);

    return (
        <Card className="p-0 overflow-hidden">
            <div className="bg-blue-50 p-4 border-b border-blue-100">
                <h3 className="font-bold text-blue-900">Speed Trainer</h3>
                <p className="text-[10px] text-blue-600">Track proximity and SG Putting</p>
            </div>
            <div className="p-5">
                <div className="text-center mb-6">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-2">Target Distance</div>
                    <div className="text-5xl font-black text-gray-900">{distance}'</div>
                    <div className="text-[10px] text-gray-400 mt-1">
                        Tour make: {getTourPuttMakePct(distance).toFixed(0)}% | Expected putts: {getExpectedStrokes('GREEN', distance).toFixed(3)}
                    </div>
                    <div className="flex justify-center gap-2 mt-4">
                        {[10, 20, 30, 40, 50].map(d => (
                            <button key={d} onClick={() => setDistance(d)} className={`w-10 h-10 rounded-full font-bold text-xs transition-all ${distance === d ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-500'}`}>{d}</button>
                        ))}
                    </div>
                </div>
                <div className="text-sm font-bold text-gray-700 mb-3">Result (ft from hole):</div>
                <div className="grid grid-cols-6 gap-2">
                    {[0, 1, 2, 3, 4, 5].map(r => (
                        <button key={r} onClick={() => addLog(r)} className={`py-2 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 ${r === 0 ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white'}`}>
                            {r === 0 ? 'Made' : `${r}'`}
                        </button>
                    ))}
                </div>
                {log.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                            <span>Recent ({log.length} putts)</span>
                            <span>Avg Prox: {(log.reduce((a,b)=>a+b.result,0)/log.length).toFixed(1)}'</span>
                        </div>
                        <div className="flex gap-1 overflow-x-auto pb-1">
                            {log.slice(-8).map((l, i) => (
                                <div key={i} className={`w-8 h-8 flex-shrink-0 rounded flex items-center justify-center text-xs font-bold text-white ${l.result === 0 ? 'bg-green-600' : l.result <= 2 ? 'bg-green-500' : l.result <= 3 ? 'bg-yellow-500' : 'bg-orange-500'}`}>
                                    {l.result === 0 ? '!' : l.result}
                                </div>
                            ))}
                        </div>
                        {sgAnalysis && (
                            <div className="mt-3 bg-gray-50 rounded-lg p-2 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-500">SG Putting (session)</span>
                                <span className={`text-sm font-bold ${sgAnalysis.avgSG >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {sgAnalysis.avgSG >= 0 ? '+' : ''}{sgAnalysis.avgSG} per putt
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

export const PuttingLabView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [tab, setTab] = useState<'TRAIN' | 'STATS'>('TRAIN');

    return (
        <div className="bg-[#F5F5F7] min-h-screen pb-32 animate-in slide-in-from-right duration-300">
            <ScreenHeader
                title="Putting Lab"
                subtitle="Short Game"
                leftAction={<button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg></button>}
            />

            <div className="px-4 mb-6">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    <button onClick={() => setTab('TRAIN')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'TRAIN' ? 'bg-gray-900 text-white shadow' : 'text-gray-500'}`}>Training</button>
                    <button onClick={() => setTab('STATS')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'STATS' ? 'bg-gray-900 text-white shadow' : 'text-gray-500'}`}>Stats</button>
                </div>
            </div>

            <div className="px-4 space-y-6">
                {tab === 'TRAIN' && (
                    <>
                        <AimPointCalculator />
                        <PuttingSpeedTrainer />
                        <div className="space-y-3">
                            <h3 className="font-bold text-gray-900">Mini Games</h3>
                            {PUTTING_GAMES.map(g => (
                                <div key={g.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-orange-200">
                                    <div className="text-2xl">{g.icon}</div>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm">{g.name}</div>
                                        <div className="text-xs text-gray-500 line-clamp-1">{g.description}</div>
                                    </div>
                                    <Badge variant={g.difficulty === 'EASY' ? 'success' : g.difficulty === 'MEDIUM' ? 'warning' : 'error'} className="text-[10px]">{g.difficulty}</Badge>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {tab === 'STATS' && (
                    <Card className="p-0">
                        <div className="bg-orange-50 p-4 border-b border-orange-100">
                            <h3 className="font-bold text-orange-900">Performance</h3>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-3 rounded-xl text-center">
                                    <div className="text-2xl font-black text-gray-900">{MOCK_PUTTING_STATS.puttsPerRound}</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">Putts/Rnd</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl text-center">
                                    <div className="text-2xl font-black text-gray-900">{MOCK_PUTTING_STATS.threeputts}</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">3-Putts</div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Make Percentage vs PGA Tour</h4>
                                {[3, 6, 10, 15, 20].map(ft => {
                                    const key = ft === 3 ? 'threeFootMake' : ft === 6 ? 'sixFootMake' : ft === 10 ? 'tenFootMake' : ft === 15 ? 'fifteenFootMake' : 'twentyFootMake';
                                    const val = MOCK_PUTTING_STATS[key as keyof PuttingStats] as number;
                                    const tourVal = getTourPuttMakePct(ft);
                                    return (
                                        <div key={ft}>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span>{ft} ft</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-gray-400">Tour: {tourVal.toFixed(0)}%</span>
                                                    <span className={val >= tourVal ? 'text-green-600' : 'text-orange-500'}>{val}%</span>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
                                                {/* Tour baseline marker */}
                                                <div className="absolute top-0 bottom-0 w-px bg-gray-400 z-10" style={{ left: `${tourVal}%` }} />
                                                <div className={`h-full rounded-full ${val >= tourVal ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${val}%` }}></div>
                                            </div>
                                            <div className="text-right text-[9px] text-gray-400 mt-0.5">
                                                {val >= tourVal ? `+${(val - tourVal).toFixed(0)}% vs tour` : `${(val - tourVal).toFixed(0)}% vs tour`}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

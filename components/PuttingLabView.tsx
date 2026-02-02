
import React, { useState, useMemo } from 'react';
import { COLORS, MOCK_PUTTING_STATS, PUTTING_GAMES, TOUR_AVERAGES } from '../constants';
import { PuttingStats, GreenReading } from '../types';
import { ScreenHeader, Card, Button, Badge } from './UIComponents';

const AimPointCalculator: React.FC = () => {
    const [slope, setSlope] = useState(2);
    const [distance, setDistance] = useState(10);
    const [stimp, setStimp] = useState(10);
    const [direction, setDirection] = useState<'LEFT' | 'RIGHT'>('RIGHT');

    const result = useMemo(() => {
        // Simplified physics
        const breakAmt = (slope / 100) * Math.sqrt(distance) * (stimp / 10) * 12;
        return {
            breakInches: Math.round(breakAmt * 10) / 10,
            aimInches: Math.round((breakAmt / 2) * 10) / 10,
            cupEdges: Math.ceil((breakAmt / 2) / 2.125)
        };
    }, [slope, distance, stimp]);

    return (
        <Card variant="elevated" className="border-t-4 border-t-green-600 p-0 overflow-hidden">
            <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
                <h3 className="font-bold text-green-900">AimPoint Calc</h3>
                <span className="text-xs font-bold text-green-700 bg-white px-2 py-1 rounded-lg shadow-sm">Green Reading</span>
            </div>
            <div className="p-5 space-y-5">
                <div>
                    <div className="flex justify-between mb-2 text-sm font-bold text-gray-700"><span>Slope</span><span>{slope}%</span></div>
                    <input type="range" min="0" max="6" step="0.5" value={slope} onChange={e => setSlope(Number(e.target.value))} className="w-full accent-green-600" />
                </div>
                <div>
                    <div className="flex justify-between mb-2 text-sm font-bold text-gray-700"><span>Distance</span><span>{distance} ft</span></div>
                    <input type="range" min="3" max="30" value={distance} onChange={e => setDistance(Number(e.target.value))} className="w-full accent-green-600" />
                </div>
                <div>
                    <div className="flex justify-between mb-2 text-sm font-bold text-gray-700"><span>Stimp</span><span>{stimp}</span></div>
                    <input type="range" min="7" max="14" step="0.5" value={stimp} onChange={e => setStimp(Number(e.target.value))} className="w-full accent-green-600" />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setDirection('LEFT')} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${direction === 'LEFT' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600'}`}>Left Break</button>
                    <button onClick={() => setDirection('RIGHT')} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${direction === 'RIGHT' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600'}`}>Right Break</button>
                </div>
                <div className="bg-gray-900 text-white rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Aim Target</div>
                    <div className="text-3xl font-black mb-1">{result.aimInches}" {direction === 'LEFT' ? 'Right' : 'Left'}</div>
                    <div className="text-sm text-gray-400 font-medium">({result.cupEdges} cups out)</div>
                </div>
            </div>
        </Card>
    );
};

const PuttingSpeedTrainer: React.FC = () => {
    const [distance, setDistance] = useState(20);
    const [log, setLog] = useState<{dist: number, result: number}[]>([]);

    const addLog = (res: number) => setLog([...log, { dist: distance, result: res }]);

    return (
        <Card className="p-0 overflow-hidden">
            <div className="bg-blue-50 p-4 border-b border-blue-100">
                <h3 className="font-bold text-blue-900">Speed Trainer</h3>
            </div>
            <div className="p-5">
                <div className="text-center mb-6">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-2">Target Distance</div>
                    <div className="text-5xl font-black text-gray-900">{distance}'</div>
                    <div className="flex justify-center gap-2 mt-4">
                        {[20, 30, 40, 50].map(d => (
                            <button key={d} onClick={() => setDistance(d)} className={`w-10 h-10 rounded-full font-bold text-xs transition-all ${distance === d ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-500'}`}>{d}</button>
                        ))}
                    </div>
                </div>
                <div className="text-sm font-bold text-gray-700 mb-3">Result (ft from hole):</div>
                <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map(r => (
                        <button key={r} onClick={() => addLog(r)} className="py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50">{r}'</button>
                    ))}
                </div>
                {log.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-2"><span>Recent</span><span>Avg Prox: {(log.reduce((a,b)=>a+b.result,0)/log.length).toFixed(1)}'</span></div>
                        <div className="flex gap-1 overflow-x-auto pb-1">
                            {log.slice(-5).map((l, i) => (
                                <div key={i} className={`w-8 h-8 flex-shrink-0 rounded flex items-center justify-center text-xs font-bold text-white ${l.result <= 3 ? 'bg-green-500' : 'bg-orange-500'}`}>{l.result}</div>
                            ))}
                        </div>
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
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Make Percentage</h4>
                                {[3, 6, 10, 15, 20].map(ft => {
                                    const key = ft === 3 ? 'threeFootMake' : ft === 6 ? 'sixFootMake' : ft === 10 ? 'tenFootMake' : ft === 15 ? 'fifteenFootMake' : 'twentyFootMake';
                                    const val = MOCK_PUTTING_STATS[key as keyof PuttingStats] as number;
                                    const tour = TOUR_AVERAGES[key as keyof PuttingStats] as number;
                                    return (
                                        <div key={ft}>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span>{ft} ft</span>
                                                <span className={val >= tour ? 'text-green-600' : 'text-orange-500'}>{val}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${val >= tour ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${val}%` }}></div>
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


import React, { useState } from 'react';
import { COLORS, MOCK_DETAILED_ROUND, MOCK_COMPARISON_DETAILED_ROUND, MOCK_PATTERN_DATA, MOCK_TREND_ALERTS } from '../constants';
import { DetailedRound, HoleScore, Shot, ShotResult, PatternData, TrendAlert } from '../types';
import { ScreenHeader, Card, Badge } from './UIComponents';

const SHOT_RESULT_COLORS: Record<ShotResult, string> = {
  FAIRWAY: COLORS.success, ROUGH: COLORS.warning, BUNKER: '#D4A574', GREEN: COLORS.success, WATER: COLORS.info, OB: COLORS.error, FRINGE: '#84CC16',
};

const getScoreColor = (score: number, par: number): string => {
  const diff = score - par;
  if (diff <= -1) return COLORS.birdie;
  if (diff === 0) return COLORS.par;
  if (diff === 1) return COLORS.bogey;
  return COLORS.double;
};

const ShotCard: React.FC<{ shot: Shot }> = ({ shot }) => (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">{shot.shotNumber}</div>
        <div className="flex-1">
            <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-gray-900">{shot.club}</span>
                <span className="font-bold text-sm text-orange-600">{shot.distance}y</span>
            </div>
            <div className="flex gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ backgroundColor: `${SHOT_RESULT_COLORS[shot.result]}20`, color: SHOT_RESULT_COLORS[shot.result] }}>{shot.result}</span>
                {shot.shape && <span className="text-[10px] text-gray-400">{shot.shape}</span>}
            </div>
        </div>
    </div>
);

const HoleReplayView: React.FC<{ hole: HoleScore }> = ({ hole }) => {
    const scoreColor = getScoreColor(hole.score, hole.par);
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="p-4 flex justify-between items-center" style={{ backgroundColor: `${scoreColor}10` }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: scoreColor }}>{hole.holeNumber}</div>
                    <div>
                        <div className="font-bold text-sm">Par {hole.par}</div>
                        <div className="text-xs text-gray-500">{hole.shots.length} shots</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black" style={{ color: scoreColor }}>{hole.score}</div>
                </div>
            </div>
            <div className="p-2 bg-gray-50 flex gap-4 border-b border-gray-100 px-4">
                <div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${hole.fairwayHit ? 'bg-green-500' : 'bg-red-500'}`} /><span className="text-xs text-gray-600 font-medium">FIR</span></div>
                <div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${hole.greenInRegulation ? 'bg-green-500' : 'bg-red-500'}`} /><span className="text-xs text-gray-600 font-medium">GIR</span></div>
                <div className="text-xs text-gray-600 font-medium ml-auto">{hole.putts} Putts</div>
            </div>
            <div className="p-4 space-y-2">
                {hole.shots.map(s => <ShotCard key={s.id} shot={s} />)}
            </div>
        </div>
    );
};

const MissPatternHeatmap: React.FC<{ data: PatternData }> = ({ data }) => {
    const total = data.missCount.left + data.missCount.right + data.missCount.short + data.missCount.long;
    const getOpacity = (count: number) => Math.min(1, Math.max(0.1, count / total * 2));
    
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-sm">{data.club}</h4>
                <span className="text-xs text-gray-500">{data.totalShots} shots</span>
            </div>
            <div className="grid grid-cols-3 grid-rows-3 gap-1 aspect-square max-w-[180px] mx-auto">
                <div/>
                <div className="rounded bg-red-500 flex items-center justify-center text-white text-xs font-bold" style={{ opacity: getOpacity(data.missCount.long) }}>{data.missCount.long}</div>
                <div/>
                <div className="rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold" style={{ opacity: getOpacity(data.missCount.left) }}>{data.missCount.left}</div>
                <div className="rounded bg-green-500 flex items-center justify-center text-white text-xl">🎯</div>
                <div className="rounded bg-orange-500 flex items-center justify-center text-white text-xs font-bold" style={{ opacity: getOpacity(data.missCount.right) }}>{data.missCount.right}</div>
                <div/>
                <div className="rounded bg-purple-500 flex items-center justify-center text-white text-xs font-bold" style={{ opacity: getOpacity(data.missCount.short) }}>{data.missCount.short}</div>
                <div/>
            </div>
            <div className="mt-4 flex justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <div className="text-center"><div className="font-bold text-orange-600 text-base">{data.hitRate}%</div>Hit Rate</div>
                <div className="text-center"><div className="font-bold text-gray-900 text-base">{data.avgDistance}y</div>Avg Dist</div>
            </div>
        </div>
    );
};

export const RoundReplayHub: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [tab, setTab] = useState<'REPLAY' | 'PATTERNS'>('REPLAY');
    const [currentHoleNum, setCurrentHoleNum] = useState(1);
    const round = MOCK_DETAILED_ROUND;

    return (
        <div className="bg-[#F5F5F7] min-h-screen pb-32 animate-in slide-in-from-right duration-300">
            <ScreenHeader 
                title="Round Analysis"
                subtitle={round.courseName}
                leftAction={<button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg></button>}
            />

            <div className="px-4 mb-4">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    <button onClick={() => setTab('REPLAY')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'REPLAY' ? 'bg-gray-900 text-white shadow' : 'text-gray-500'}`}>Replay</button>
                    <button onClick={() => setTab('PATTERNS')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'PATTERNS' ? 'bg-gray-900 text-white shadow' : 'text-gray-500'}`}>Patterns</button>
                </div>
            </div>

            <div className="px-4">
                {tab === 'REPLAY' && (
                    <div className="space-y-4">
                        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                            {round.holes.map(h => (
                                <button 
                                    key={h.holeNumber}
                                    onClick={() => setCurrentHoleNum(h.holeNumber)}
                                    className={`min-w-[40px] h-10 rounded-full flex items-center justify-center text-sm font-bold border transition-all ${currentHoleNum === h.holeNumber ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-500 border-gray-200'}`}
                                >
                                    {h.holeNumber}
                                </button>
                            ))}
                        </div>
                        <HoleReplayView hole={round.holes[currentHoleNum - 1]} />
                        <div className="flex gap-3 mt-4">
                            <button disabled={currentHoleNum === 1} onClick={() => setCurrentHoleNum(n => Math.max(1, n-1))} className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm disabled:opacity-50">Prev Hole</button>
                            <button disabled={currentHoleNum === 18} onClick={() => setCurrentHoleNum(n => Math.min(18, n+1))} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-50">Next Hole</button>
                        </div>
                    </div>
                )}

                {tab === 'PATTERNS' && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                            <div className="text-xl">💡</div>
                            <div>
                                <div className="font-bold text-blue-900 text-sm">Trend Alert</div>
                                <div className="text-xs text-blue-800 leading-relaxed mt-1">Your 3-putt rate is trending up over the last 5 rounds. Focus on lag putting speed.</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {MOCK_PATTERN_DATA.slice(0, 4).map(p => <MissPatternHeatmap key={p.club} data={p} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

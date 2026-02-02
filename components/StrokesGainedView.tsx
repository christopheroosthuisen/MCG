
import React, { useState, useMemo } from 'react';
import { COLORS, MOCK_SG_HISTORY } from '../constants';
import { StrokesGained, SGBenchmark } from '../types';
import { ScreenHeader } from './UIComponents';

// SG Benchmarks
const SG_BENCHMARKS: SGBenchmark[] = [
    { handicap: 0, offTheTee: 0, approach: 0, aroundGreen: 0, putting: 0 },
    { handicap: 5, offTheTee: -0.5, approach: -0.8, aroundGreen: -0.4, putting: -0.3 },
    { handicap: 10, offTheTee: -1.0, approach: -1.5, aroundGreen: -0.8, putting: -0.7 },
];

export const SGOverviewCard: React.FC<{ sgData: StrokesGained; onViewDetails?: () => void }> = ({ sgData, onViewDetails }) => {
    const isPositive = sgData.total >= 0;
    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="p-6 text-center text-white" style={{ background: isPositive ? `linear-gradient(135deg, ${COLORS.success}, #059669)` : `linear-gradient(135deg, ${COLORS.error}, #DC2626)` }}>
                <p className="text-sm opacity-80 uppercase tracking-wider">Total Strokes Gained</p>
                <p className="text-5xl font-black mt-2">{isPositive ? '+' : ''}{sgData.total.toFixed(1)}</p>
                <p className="text-sm opacity-80 mt-2">vs {sgData.benchmarkHandicap} handicap benchmark</p>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                    {[{ label: 'Off Tee', value: sgData.offTheTee }, { label: 'Approach', value: sgData.approach }, { label: 'Around Green', value: sgData.aroundGreen }, { label: 'Putting', value: sgData.putting }].map((cat) => (
                        <div key={cat.label} className={`p-4 rounded-xl ${cat.value >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                            <span className="text-xs text-gray-600 block mb-1">{cat.label}</span>
                            <p className={`text-2xl font-bold ${cat.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>{cat.value >= 0 ? '+' : ''}{cat.value.toFixed(1)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const SGTrendChart: React.FC<{ history: StrokesGained[]; metric: 'total' | 'offTheTee' | 'approach' | 'aroundGreen' | 'putting'; title?: string }> = ({ history, metric, title }) => {
    const sortedHistory = [...history].sort((a, b) => a.date.getTime() - b.date.getTime());
    const values = sortedHistory.map(h => h[metric]);
    const maxVal = Math.max(...values.map(Math.abs), 2);
    
    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 text-lg mb-4">{title || 'Strokes Gained Trend'}</h3>
            <div className="relative h-48 border-l border-b border-gray-200">
                <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300" />
                <svg className="absolute inset-0" viewBox={`0 0 ${values.length * 40} 200`} preserveAspectRatio="none">
                    {values.map((v, i) => {
                        const x = i * 40 + 20;
                        const y = 100 - (v / maxVal) * 80;
                        return <circle key={i} cx={x} cy={y} r="4" fill={v >= 0 ? COLORS.success : COLORS.error} />;
                    })}
                    <path d={`M ${values.map((v, i) => `${i * 40 + 20} ${100 - (v / maxVal) * 80}`).join(' L ')}`} stroke={COLORS.primary} strokeWidth="2" fill="none" />
                </svg>
            </div>
        </div>
    );
};

export const StrokesGainedDashboard: React.FC<{ onAddRound?: () => void }> = ({ onAddRound }) => {
    const [sgHistory, setSgHistory] = useState(MOCK_SG_HISTORY);
    const latestRound = sgHistory[0];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="px-5 py-6 space-y-6">
                <SGOverviewCard sgData={latestRound} />
                <SGTrendChart history={sgHistory} metric="total" title="Total SG Trend" />
            </div>
        </div>
    );
};

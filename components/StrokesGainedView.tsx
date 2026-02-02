
import React, { useState, useMemo } from 'react';
import { COLORS, MOCK_SG_HISTORY } from '../constants';
import { StrokesGained, SGBenchmark } from '../types';
import { ScreenHeader } from './UIComponents';
import { db, SG_BENCHMARKS_FULL, getSGBenchmark, estimateSGFromRoundStats } from '../services/dataService';

/**
 * Get the SG category label and explanation for a given value relative to benchmark.
 */
function getSGRating(value: number): { label: string; color: string; description: string } {
    if (value >= 1.5) return { label: 'Elite', color: 'text-green-600', description: 'Tour-level performance' };
    if (value >= 0.5) return { label: 'Strong', color: 'text-green-500', description: 'Above average for your level' };
    if (value >= -0.5) return { label: 'Average', color: 'text-gray-600', description: 'Consistent with your handicap' };
    if (value >= -1.5) return { label: 'Needs Work', color: 'text-orange-500', description: 'Below expected for your level' };
    return { label: 'Weakness', color: 'text-red-600', description: 'Significant area for improvement' };
}

/**
 * SGBarChart - Horizontal bar visualization with benchmark comparison
 */
const SGBarChart: React.FC<{
    label: string;
    value: number;
    benchmark: number;
    maxAbsValue: number;
}> = ({ label, value, benchmark, maxAbsValue }) => {
    const rating = getSGRating(value - benchmark);
    const barScale = maxAbsValue > 0 ? Math.min(1, Math.abs(value) / maxAbsValue) : 0;
    const isPositive = value >= 0;
    const relativeToBaseline = value - benchmark;

    return (
        <div className="mb-4 last:mb-0">
            <div className="flex justify-between items-baseline mb-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{label}</span>
                    <span className={`text-[10px] font-bold uppercase ${rating.color}`}>{rating.label}</span>
                </div>
                <div className="text-right">
                    <span className={`text-lg font-black ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{value.toFixed(2)}
                    </span>
                </div>
            </div>
            {/* Bar */}
            <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                {/* Center line */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-300 z-10" />
                {/* Value bar */}
                <div
                    className={`absolute top-0 bottom-0 rounded-full transition-all duration-500 ${isPositive ? 'bg-green-500' : 'bg-red-400'}`}
                    style={{
                        left: isPositive ? '50%' : `${50 - barScale * 50}%`,
                        width: `${barScale * 50}%`,
                    }}
                />
                {/* Benchmark marker */}
                {benchmark !== 0 && (
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-orange-500 z-20"
                        style={{
                            left: `${50 + (benchmark / maxAbsValue) * 50}%`,
                        }}
                        title={`Benchmark: ${benchmark.toFixed(2)}`}
                    />
                )}
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-gray-400">
                <span>vs. Benchmark: {relativeToBaseline >= 0 ? '+' : ''}{relativeToBaseline.toFixed(2)}</span>
                <span>{rating.description}</span>
            </div>
        </div>
    );
};

export const SGOverviewCard: React.FC<{ sgData: StrokesGained; onViewDetails?: () => void }> = ({ sgData, onViewDetails }) => {
    const isPositive = sgData.total >= 0;
    const benchmark = getSGBenchmark(sgData.benchmarkHandicap);

    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="p-6 text-center text-white" style={{ background: isPositive ? `linear-gradient(135deg, ${COLORS.success}, #059669)` : `linear-gradient(135deg, ${COLORS.error}, #DC2626)` }}>
                <p className="text-sm opacity-80 uppercase tracking-wider">Total Strokes Gained</p>
                <p className="text-5xl font-black mt-2">{isPositive ? '+' : ''}{sgData.total.toFixed(1)}</p>
                <p className="text-sm opacity-80 mt-2">
                    vs scratch ({sgData.benchmarkHandicap > 0 ? `${sgData.benchmarkHandicap} hcp benchmark` : 'tour baseline'})
                </p>
                {sgData.totalStrokes > 0 && (
                    <p className="text-xs opacity-60 mt-1">
                        Shot {sgData.totalStrokes} on par {sgData.coursePar} at {sgData.courseName}
                    </p>
                )}
            </div>
            <div className="p-6">
                {/* Category breakdown with bars */}
                <div className="mb-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Category Breakdown</h4>
                    <SGBarChart label="Off the Tee" value={sgData.offTheTee} benchmark={benchmark.offTheTee} maxAbsValue={3} />
                    <SGBarChart label="Approach" value={sgData.approach} benchmark={benchmark.approach} maxAbsValue={3} />
                    <SGBarChart label="Around Green" value={sgData.aroundGreen} benchmark={benchmark.aroundGreen} maxAbsValue={3} />
                    <SGBarChart label="Putting" value={sgData.putting} benchmark={benchmark.putting} maxAbsValue={3} />
                </div>

                {/* Quick grid summary */}
                <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-100">
                    {[
                        { label: 'Off Tee', value: sgData.offTheTee },
                        { label: 'Approach', value: sgData.approach },
                        { label: 'Short Game', value: sgData.aroundGreen },
                        { label: 'Putting', value: sgData.putting },
                    ].map((cat) => (
                        <div key={cat.label} className={`p-3 rounded-xl text-center ${cat.value >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                            <span className="text-[10px] text-gray-500 block mb-0.5">{cat.label}</span>
                            <p className={`text-lg font-bold ${cat.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {cat.value >= 0 ? '+' : ''}{cat.value.toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const SGTrendChart: React.FC<{
    history: StrokesGained[];
    metric: 'total' | 'offTheTee' | 'approach' | 'aroundGreen' | 'putting';
    title?: string;
}> = ({ history, metric, title }) => {
    const sortedHistory = [...history].sort((a, b) => a.date.getTime() - b.date.getTime());
    const values = sortedHistory.map(h => h[metric]);
    const maxVal = Math.max(...values.map(Math.abs), 2);

    // Calculate moving average (3-round)
    const movingAvg = values.map((_, i) => {
        const start = Math.max(0, i - 2);
        const subset = values.slice(start, i + 1);
        return subset.reduce((a, b) => a + b, 0) / subset.length;
    });

    // Stats
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const best = Math.max(...values);
    const trend = values.length >= 2 ? values[values.length - 1] - values[0] : 0;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">{title || 'Strokes Gained Trend'}</h3>
                    <p className="text-xs text-gray-400">{values.length} rounds tracked</p>
                </div>
                <div className="text-right">
                    <div className={`text-sm font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {trend >= 0 ? 'Improving' : 'Declining'} ({trend >= 0 ? '+' : ''}{trend.toFixed(2)})
                    </div>
                    <div className="text-[10px] text-gray-400">Avg: {avg.toFixed(2)} | Best: {best >= 0 ? '+' : ''}{best.toFixed(2)}</div>
                </div>
            </div>
            <div className="relative h-48 border-l border-b border-gray-200">
                {/* Zero line */}
                <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300 z-0" />
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 text-[9px] text-gray-400 -ml-2">0</div>

                <svg className="absolute inset-0" viewBox={`0 0 ${Math.max(values.length * 40, 120)} 200`} preserveAspectRatio="none">
                    {/* Data points */}
                    {values.map((v, i) => {
                        const x = i * 40 + 20;
                        const y = 100 - (v / maxVal) * 80;
                        return (
                            <g key={i}>
                                {/* Vertical reference line to zero */}
                                <line x1={x} y1={100} x2={x} y2={y} stroke={v >= 0 ? COLORS.success : COLORS.error} strokeWidth="2" opacity="0.3" />
                                <circle cx={x} cy={y} r="5" fill={v >= 0 ? COLORS.success : COLORS.error} />
                            </g>
                        );
                    })}
                    {/* Trend line */}
                    {values.length > 1 && (
                        <path
                            d={`M ${values.map((v, i) => `${i * 40 + 20} ${100 - (v / maxVal) * 80}`).join(' L ')}`}
                            stroke={COLORS.primary} strokeWidth="2" fill="none" opacity="0.5"
                        />
                    )}
                    {/* Moving average line */}
                    {movingAvg.length > 1 && (
                        <path
                            d={`M ${movingAvg.map((v, i) => `${i * 40 + 20} ${100 - (v / maxVal) * 80}`).join(' L ')}`}
                            stroke={COLORS.primary} strokeWidth="3" fill="none" strokeDasharray="none"
                        />
                    )}
                </svg>
            </div>
            <div className="flex justify-center gap-4 mt-3 text-[10px] text-gray-400">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-orange-500 rounded opacity-50" /> Individual rounds
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-orange-500 rounded" /> 3-round average
                </div>
            </div>
        </div>
    );
};

/**
 * SG Benchmark Comparison Table
 */
const SGBenchmarkTable: React.FC<{ userHandicap: number; latestSG?: StrokesGained }> = ({ userHandicap, latestSG }) => {
    const userBenchmark = getSGBenchmark(userHandicap);
    const categories = ['offTheTee', 'approach', 'aroundGreen', 'putting'] as const;
    const labels = { offTheTee: 'Off Tee', approach: 'Approach', aroundGreen: 'Short Game', putting: 'Putting' };

    return (
        <div className="bg-white rounded-3xl p-5 shadow-lg">
            <h3 className="font-bold text-gray-900 mb-1">Benchmark Comparison</h3>
            <p className="text-xs text-gray-400 mb-4">Your performance vs. handicap-level expectation</p>

            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left py-2 font-bold text-gray-500">Category</th>
                            <th className="text-center py-2 font-bold text-gray-500">Expected ({userHandicap} hcp)</th>
                            {latestSG && <th className="text-center py-2 font-bold text-orange-500">Your Actual</th>}
                            {latestSG && <th className="text-center py-2 font-bold text-gray-500">Diff</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => {
                            const expected = userBenchmark[cat];
                            const actual = latestSG ? latestSG[cat === 'offTheTee' ? 'offTheTee' : cat] : null;
                            const diff = actual !== null ? actual - expected : null;
                            return (
                                <tr key={cat} className="border-b border-gray-50">
                                    <td className="py-2.5 font-bold text-gray-700">{labels[cat]}</td>
                                    <td className="py-2.5 text-center text-gray-500">{expected.toFixed(2)}</td>
                                    {actual !== null && (
                                        <td className={`py-2.5 text-center font-bold ${actual >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {actual >= 0 ? '+' : ''}{actual.toFixed(2)}
                                        </td>
                                    )}
                                    {diff !== null && (
                                        <td className={`py-2.5 text-center font-bold ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Insight */}
            {latestSG && (
                <div className="mt-4 bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Key Insight</p>
                    {(() => {
                        const diffs = categories.map(cat => ({
                            cat,
                            label: labels[cat],
                            diff: latestSG[cat === 'offTheTee' ? 'offTheTee' : cat] - userBenchmark[cat],
                        }));
                        const worst = [...diffs].sort((a, b) => a.diff - b.diff)[0];
                        const best = [...diffs].sort((a, b) => b.diff - a.diff)[0];
                        return (
                            <p className="text-xs text-gray-600">
                                <span className="font-bold text-green-600">{best.label}</span> is your strongest category
                                ({best.diff >= 0 ? '+' : ''}{best.diff.toFixed(2)} vs benchmark).
                                Focus improvement on <span className="font-bold text-red-500">{worst.label}</span>
                                ({worst.diff >= 0 ? '+' : ''}{worst.diff.toFixed(2)} vs benchmark).
                            </p>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export const StrokesGainedDashboard: React.FC<{ onAddRound?: () => void }> = ({ onAddRound }) => {
    const [sgHistory, setSgHistory] = useState(MOCK_SG_HISTORY);
    const [activeMetric, setActiveMetric] = useState<'total' | 'offTheTee' | 'approach' | 'aroundGreen' | 'putting'>('total');
    const latestRound = sgHistory[0];
    const userHandicap = db.getUser().swingDNA?.handicap || 12;

    // Calculate averages
    const averages = useMemo(() => {
        if (sgHistory.length === 0) return null;
        const sum = sgHistory.reduce((acc, sg) => ({
            offTheTee: acc.offTheTee + sg.offTheTee,
            approach: acc.approach + sg.approach,
            aroundGreen: acc.aroundGreen + sg.aroundGreen,
            putting: acc.putting + sg.putting,
            total: acc.total + sg.total,
        }), { offTheTee: 0, approach: 0, aroundGreen: 0, putting: 0, total: 0 });
        const n = sgHistory.length;
        return {
            offTheTee: sum.offTheTee / n,
            approach: sum.approach / n,
            aroundGreen: sum.aroundGreen / n,
            putting: sum.putting / n,
            total: sum.total / n,
        };
    }, [sgHistory]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="px-5 py-6 space-y-6">
                <SGOverviewCard sgData={latestRound} />

                {/* Metric selector */}
                <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                    {[
                        { id: 'total', label: 'Total' },
                        { id: 'offTheTee', label: 'Off Tee' },
                        { id: 'approach', label: 'Approach' },
                        { id: 'aroundGreen', label: 'Short Game' },
                        { id: 'putting', label: 'Putting' },
                    ].map(m => (
                        <button
                            key={m.id}
                            onClick={() => setActiveMetric(m.id as any)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                                activeMetric === m.id
                                    ? 'bg-orange-500 text-white shadow-sm'
                                    : 'bg-white text-gray-500 border border-gray-200'
                            }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                <SGTrendChart history={sgHistory} metric={activeMetric} title={`SG ${activeMetric === 'total' ? 'Total' : activeMetric === 'offTheTee' ? 'Off the Tee' : activeMetric === 'aroundGreen' ? 'Around Green' : activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)} Trend`} />

                <SGBenchmarkTable userHandicap={userHandicap} latestSG={latestRound} />

                {/* Averages card */}
                {averages && (
                    <div className="bg-white rounded-3xl p-5 shadow-lg">
                        <h3 className="font-bold text-gray-900 mb-1">Round Averages</h3>
                        <p className="text-xs text-gray-400 mb-4">Last {sgHistory.length} rounds</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Off the Tee', value: averages.offTheTee },
                                { label: 'Approach', value: averages.approach },
                                { label: 'Around Green', value: averages.aroundGreen },
                                { label: 'Putting', value: averages.putting },
                            ].map(cat => (
                                <div key={cat.label} className={`p-3 rounded-xl border ${cat.value >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase block mb-0.5">{cat.label}</span>
                                    <span className={`text-xl font-black ${cat.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {cat.value >= 0 ? '+' : ''}{cat.value.toFixed(2)}
                                    </span>
                                    <span className="text-[9px] text-gray-400 block">per round avg</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

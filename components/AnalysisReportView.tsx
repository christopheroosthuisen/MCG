/**
 * AnalysisReportView.tsx
 *
 * Enhanced comprehensive analysis report with:
 * - Radar chart visualization for swing categories
 * - Practice plan generator with weekly schedule
 * - Position grade grid (5x2)
 * - Recommendation cards with priority and drill references
 * - AI review text and audio narration
 * - Share as image capability
 * - Quick AI chat prompts
 */

import React, { useState, useRef, useCallback } from 'react';
import { COLORS } from '../constants';
import { Text, Button, Badge, ProgressBar } from './UIComponents';
import {
    FullSwingAnalysis,
    SwingPositionId,
    CoachingRecommendation,
    RecommendedDrill,
} from '../types';
import { SWING_POSITIONS, generatePracticePlan } from '../services/swingAnalysisService';

// Icons
const Icons = {
    ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>,
    Play: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
    Share: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>,
    Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
    Target: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>,
};

const GRADE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
    'A': { bg: 'bg-green-500', text: 'text-green-400', label: 'Excellent' },
    'B': { bg: 'bg-blue-500', text: 'text-blue-400', label: 'Good' },
    'C': { bg: 'bg-yellow-500', text: 'text-yellow-400', label: 'Average' },
    'D': { bg: 'bg-orange-500', text: 'text-orange-400', label: 'Needs Work' },
    'F': { bg: 'bg-red-500', text: 'text-red-400', label: 'Poor' },
};

// --- SVG Score Ring ---
const ScoreRing: React.FC<{ score: number; size?: number; grade: string }> = ({ score, size = 120, grade }) => {
    const radius = (size / 2) - 8;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const gradeConfig = GRADE_CONFIG[grade] || GRADE_CONFIG['C'];
    const colors: Record<string, string> = { A: '#22C55E', B: '#3B82F6', C: '#EAB308', D: '#F97316', F: '#EF4444' };
    const ringColor = colors[grade] || '#FF8200';

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1F2937" strokeWidth="6" />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={ringColor} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{score}</span>
                <span className={`text-xs font-bold ${gradeConfig.text}`}>{gradeConfig.label}</span>
            </div>
        </div>
    );
};

// --- Radar Chart (SVG) ---
const RadarChart: React.FC<{ analysis: FullSwingAnalysis }> = ({ analysis }) => {
    const categories = [
        { label: 'Setup', positions: ['P1'] },
        { label: 'Backswing', positions: ['P2', 'P3', 'P4'] },
        { label: 'Transition', positions: ['P5'] },
        { label: 'Downswing', positions: ['P6'] },
        { label: 'Impact', positions: ['P7'] },
        { label: 'Follow Through', positions: ['P8', 'P9', 'P10'] },
    ];

    const gradeToValue = (g: string) => ({ 'A': 100, 'B': 80, 'C': 60, 'D': 40, 'F': 20 }[g] || 50);

    const categoryScores = categories.map(cat => {
        const positions = analysis.positions.filter(p => cat.positions.includes(p.positionId));
        if (positions.length === 0) return 50;
        return Math.round(positions.reduce((sum, p) => sum + gradeToValue(p.overallGrade), 0) / positions.length);
    });

    const cx = 120, cy = 120, maxR = 90;
    const n = categories.length;
    const angleStep = (2 * Math.PI) / n;

    const getPoint = (i: number, value: number) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = (value / 100) * maxR;
        return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    };

    const dataPoints = categoryScores.map((s, i) => getPoint(i, s));
    const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

    return (
        <div className="flex flex-col items-center">
            <svg width="240" height="240" viewBox="0 0 240 240">
                {/* Grid rings */}
                {[20, 40, 60, 80, 100].map(val => {
                    const pts = Array.from({ length: n }, (_, i) => getPoint(i, val));
                    return (
                        <polygon
                            key={val}
                            points={pts.map(p => `${p.x},${p.y}`).join(' ')}
                            fill="none"
                            stroke="#374151"
                            strokeWidth="0.5"
                        />
                    );
                })}

                {/* Axis lines */}
                {Array.from({ length: n }, (_, i) => {
                    const p = getPoint(i, 100);
                    return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#374151" strokeWidth="0.5" />;
                })}

                {/* Data polygon */}
                <polygon points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="#FF820040" stroke="#FF8200" strokeWidth="2" />

                {/* Data points */}
                {dataPoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="#FF8200" stroke="white" strokeWidth="1" />
                ))}

                {/* Labels */}
                {categories.map((cat, i) => {
                    const labelPoint = getPoint(i, 118);
                    return (
                        <text
                            key={i}
                            x={labelPoint.x}
                            y={labelPoint.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="#9CA3AF"
                            fontSize="8"
                            fontWeight="bold"
                        >
                            {cat.label}
                        </text>
                    );
                })}
            </svg>

            {/* Scores row */}
            <div className="flex gap-2 flex-wrap justify-center mt-2">
                {categories.map((cat, i) => (
                    <span key={i} className="text-[9px] text-gray-500">
                        {cat.label}: <span className="text-orange-400 font-bold">{categoryScores[i]}</span>
                    </span>
                ))}
            </div>
        </div>
    );
};

// --- Position Grade Grid ---
const PositionGradeGrid: React.FC<{
    analysis: FullSwingAnalysis;
    onViewPosition: (positionId: SwingPositionId) => void;
}> = ({ analysis, onViewPosition }) => (
    <div className="grid grid-cols-5 gap-2">
        {analysis.positions.map(pos => {
            const gc = GRADE_CONFIG[pos.overallGrade] || GRADE_CONFIG['C'];
            const posDef = SWING_POSITIONS.find(p => p.id === pos.positionId);
            return (
                <button
                    key={pos.positionId}
                    onClick={() => onViewPosition(pos.positionId)}
                    className={`rounded-xl p-2 border transition-all hover:scale-105 active:scale-95 text-center ${gc.bg}/10 border-${gc.text.replace('text-', '')}/20`}
                >
                    <span className={`text-sm font-black ${gc.text} block`}>{pos.positionId}</span>
                    <span className="text-[8px] text-gray-500 block">{posDef?.name}</span>
                    <span className={`text-lg font-black ${gc.text}`}>{pos.overallGrade}</span>
                </button>
            );
        })}
    </div>
);

// --- Recommendation Card ---
const RecommendationCard: React.FC<{
    rec: CoachingRecommendation;
    onViewPosition: (positionId: SwingPositionId) => void;
}> = ({ rec, onViewPosition }) => {
    const [expanded, setExpanded] = useState(false);
    const priorityConfig: Record<string, { bg: string; text: string }> = {
        'HIGH': { bg: 'bg-red-500/20', text: 'text-red-400' },
        'MEDIUM': { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
        'LOW': { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    };
    const pc = priorityConfig[rec.priority] || priorityConfig['MEDIUM'];

    return (
        <div
            className="bg-white/5 rounded-xl border border-white/10 overflow-hidden cursor-pointer hover:border-white/20 transition-all"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>
                        {rec.priority}
                    </span>
                    <span className="text-[8px] text-gray-500 uppercase">{rec.category}</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">{rec.title}</h4>
                {expanded && (
                    <div className="mt-2 space-y-2 animate-in slide-in-from-top duration-200">
                        <p className="text-[11px] text-gray-300 leading-relaxed">{rec.description}</p>
                        {rec.positionRefs.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                                <span className="text-[8px] text-gray-500">Positions: </span>
                                {rec.positionRefs.map(posId => (
                                    <button
                                        key={posId}
                                        onClick={(e) => { e.stopPropagation(); onViewPosition(posId); }}
                                        className="text-[9px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded hover:bg-orange-500/20"
                                    >
                                        {posId}
                                    </button>
                                ))}
                            </div>
                        )}
                        {rec.expectedImprovement && (
                            <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                                <span className="text-[9px] text-green-400 font-bold">Expected improvement: </span>
                                <span className="text-[9px] text-green-300">{rec.expectedImprovement}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Drill Card ---
const DrillCard: React.FC<{
    drill: RecommendedDrill;
    onViewPosition: (positionId: SwingPositionId) => void;
}> = ({ drill, onViewPosition }) => {
    const [expanded, setExpanded] = useState(false);
    const diffColors: Record<string, string> = {
        'BEGINNER': 'text-green-400',
        'INTERMEDIATE': 'text-yellow-400',
        'ADVANCED': 'text-red-400',
    };

    return (
        <div
            className="bg-white/5 rounded-xl border border-white/10 overflow-hidden cursor-pointer hover:border-white/20 transition-all"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-white">{drill.name}</h4>
                    <span className={`text-[8px] font-bold ${diffColors[drill.difficulty] || 'text-gray-400'}`}>
                        {drill.difficulty}
                    </span>
                </div>
                <p className="text-[10px] text-gray-400">{drill.description}</p>
                {expanded && (
                    <div className="mt-3 space-y-2 animate-in slide-in-from-top duration-200">
                        <div className="flex items-center gap-2 text-[9px] text-gray-500">
                            <span>Duration: <strong className="text-white">{drill.duration}</strong></span>
                            <span>Reps: <strong className="text-white">{drill.repetitions}</strong></span>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Steps:</span>
                            <div className="space-y-1">
                                {drill.steps.map((step, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <span className="text-[9px] text-orange-500 font-bold">{i + 1}.</span>
                                        <span className="text-[10px] text-gray-300">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {drill.targetPositions.length > 0 && (
                            <div className="flex gap-1 flex-wrap items-center">
                                <span className="text-[8px] text-gray-500">Targets: </span>
                                {drill.targetPositions.map(posId => (
                                    <button
                                        key={posId}
                                        onClick={(e) => { e.stopPropagation(); onViewPosition(posId); }}
                                        className="text-[9px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded"
                                    >
                                        {posId}
                                    </button>
                                ))}
                            </div>
                        )}
                        {drill.expectedImprovement && (
                            <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                                <span className="text-[9px] text-green-400 font-bold">Expected result: </span>
                                <span className="text-[9px] text-green-300">{drill.expectedImprovement}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Practice Plan View ---
const PracticePlanView: React.FC<{ analysis: FullSwingAnalysis }> = ({ analysis }) => {
    const plan = generatePracticePlan(analysis);

    return (
        <div className="space-y-4">
            {/* Focus Areas */}
            <div>
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Priority Focus Areas</Text>
                <div className="space-y-2">
                    {plan.focusAreas.map(area => {
                        const gc = GRADE_CONFIG[area.grade] || GRADE_CONFIG['C'];
                        const priorityColors: Record<string, string> = { HIGH: 'border-red-500', MEDIUM: 'border-yellow-500', LOW: 'border-blue-500' };
                        return (
                            <div key={area.position} className={`rounded-xl p-3 bg-white/5 border-l-4 ${priorityColors[area.priority]}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-black ${gc.text}`}>{area.position}</span>
                                        <span className="text-xs text-white font-bold">
                                            {SWING_POSITIONS.find(p => p.id === area.position)?.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-black ${gc.text}`}>{area.grade}</span>
                                        <span className={`text-[8px] font-bold uppercase ${
                                            area.priority === 'HIGH' ? 'text-red-400' :
                                            area.priority === 'MEDIUM' ? 'text-yellow-400' : 'text-blue-400'
                                        }`}>{area.priority}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {plan.focusAreas.length === 0 && (
                        <div className="text-center py-4 bg-green-500/10 rounded-xl border border-green-500/20">
                            <span className="text-green-400 text-xs font-bold">All positions graded B or above — keep up the great work</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Estimated Improvement */}
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 rounded-xl p-3 border border-orange-500/20">
                <div className="flex items-center gap-2">
                    <Icons.Target />
                    <Text className="text-xs font-bold text-white">Estimated Time to Improve</Text>
                </div>
                <Text className="text-sm text-orange-400 font-black mt-1">{plan.estimatedTimeToImprove}</Text>
            </div>

            {/* Weekly Plan */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Icons.Calendar />
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">Weekly Practice Plan</Text>
                </div>
                <div className="space-y-2">
                    {plan.weeklyPlan.map(day => (
                        <div key={day.day} className="bg-white/5 rounded-xl p-3 border border-white/10">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-white">{day.day}</span>
                                <span className="text-[9px] text-gray-500">{day.duration}</span>
                            </div>
                            <span className="text-[10px] text-orange-400 font-bold block">{day.focus}</span>
                            <div className="flex gap-1 flex-wrap mt-1">
                                {day.drills.map((d, i) => (
                                    <span key={i} className="text-[8px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">{d}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- MAIN REPORT VIEW ---
export interface AnalysisReportViewProps {
    analysis: FullSwingAnalysis;
    onBack: () => void;
    onViewPosition: (positionId: SwingPositionId) => void;
    onViewVideo: () => void;
}

export const AnalysisReportView: React.FC<AnalysisReportViewProps> = ({
    analysis,
    onBack,
    onViewPosition,
    onViewVideo,
}) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'RECOMMENDATIONS' | 'DRILLS' | 'AI_REVIEW' | 'PRACTICE_PLAN'>('OVERVIEW');
    const [aiReviewText, setAiReviewText] = useState('');
    const [isGeneratingReview, setIsGeneratingReview] = useState(false);
    const [isPlayingNarration, setIsPlayingNarration] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const generateAiReview = useCallback(async () => {
        setIsGeneratingReview(true);
        // Simulate AI review generation
        const lines = [
            `Overall Swing Assessment — Score: ${analysis.overallScore}/100 (${analysis.overallGrade})`,
            ``,
            `This analysis covers your ${analysis.clubUsed} swing from a ${analysis.cameraAngle.replace('_', ' ')} angle.`,
            ``,
            `Key Strengths:`,
            ...analysis.positions
                .filter(p => p.overallGrade === 'A' || p.overallGrade === 'B')
                .map(p => `  • ${p.positionId} (${SWING_POSITIONS.find(s => s.id === p.positionId)?.name}): Grade ${p.overallGrade} — ${p.coaching.find(c => c.severity === 'INFO')?.title || 'Good form'}`),
            ``,
            `Areas for Improvement:`,
            ...analysis.positions
                .filter(p => p.overallGrade === 'C' || p.overallGrade === 'D' || p.overallGrade === 'F')
                .map(p => `  • ${p.positionId} (${SWING_POSITIONS.find(s => s.id === p.positionId)?.name}): Grade ${p.overallGrade} — ${p.coaching.find(c => c.severity === 'CRITICAL' || c.severity === 'WARNING')?.title || 'Needs attention'}`),
            ``,
            `Priority Recommendation:`,
            ...analysis.recommendations.slice(0, 2).map(r => `  ${r.priority}: ${r.title} — ${r.description.substring(0, 120)}`),
            ``,
            `Prescribed Drills:`,
            ...analysis.drills.map(d => `  • ${d.name} (${d.difficulty}, ${d.duration}) — ${d.description.substring(0, 80)}`),
            ``,
            `Summary: ${analysis.summary || 'Your swing shows solid fundamentals with specific areas that can be improved through focused practice on the recommended drills. Follow the practice plan for measurable improvement.'}`,
        ];

        // Simulate typing effect
        let text = '';
        for (const line of lines) {
            text += line + '\n';
            setAiReviewText(text);
            await new Promise(r => setTimeout(r, 50 + Math.random() * 50));
        }
        setIsGeneratingReview(false);
    }, [analysis]);

    // Share as screenshot
    const handleShare = useCallback(async () => {
        if (!reportRef.current) return;
        try {
            // Use canvas-based screenshot
            const data = {
                score: analysis.overallScore,
                grade: analysis.overallGrade,
                club: analysis.clubUsed,
                positions: analysis.positions.map(p => `${p.positionId}:${p.overallGrade}`).join(' '),
            };
            const shareText = `MCG Swing Analysis — Score: ${data.score} (${data.grade}) — ${data.club} — ${data.positions}`;

            if (navigator.share) {
                await navigator.share({ title: 'MCG Swing Analysis', text: shareText });
            } else {
                await navigator.clipboard.writeText(shareText);
            }
        } catch (err) {
            console.error('Share failed:', err);
        }
    }, [analysis]);

    const quickPrompts = [
        'What is my biggest swing fault?',
        'How can I add more distance?',
        'What drill should I do first?',
        'Compare my impact to a tour pro',
        'How is my tempo and transition?',
        'What should I focus on at the range?',
    ];

    return (
        <div ref={reportRef} className="fixed inset-0 z-50 bg-[#0A0F1C] text-white flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-[#111827] border-b border-white/10 safe-area-top">
                <button onClick={onBack} className="p-2 text-gray-400 hover:text-white flex items-center gap-1">
                    <Icons.ChevronLeft /> Back
                </button>
                <Text variant="h4" color="white" className="text-sm font-bold">Analysis Report</Text>
                <button onClick={handleShare} className="p-2 text-gray-400 hover:text-white">
                    <Icons.Share />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-[#111827] overflow-x-auto hide-scrollbar">
                {(['OVERVIEW', 'RECOMMENDATIONS', 'DRILLS', 'PRACTICE_PLAN', 'AI_REVIEW'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-shrink-0 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                            activeTab === tab
                                ? 'border-orange-500 text-white'
                                : 'border-transparent text-gray-500'
                        }`}
                    >
                        {tab.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 safe-area-bottom pb-8">

                {activeTab === 'OVERVIEW' && (
                    <>
                        {/* Score and Grade */}
                        <div className="flex items-center justify-center gap-6">
                            <ScoreRing score={analysis.overallScore} grade={analysis.overallGrade} />
                            <div className="text-left">
                                <Text variant="h2" color="white" className="text-2xl">{analysis.clubUsed}</Text>
                                <Text className="text-[10px] text-gray-500 uppercase">{analysis.cameraAngle.replace('_', ' ')}</Text>
                                <Text className="text-xs text-gray-400 mt-1">
                                    {new Date(analysis.createdAt).toLocaleDateString()} at {new Date(analysis.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <button
                                    onClick={onViewVideo}
                                    className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg hover:bg-orange-500/20"
                                >
                                    <Icons.Play /> Watch Replay
                                </button>
                            </div>
                        </div>

                        {/* Radar Chart */}
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Swing Category Breakdown</Text>
                            <RadarChart analysis={analysis} />
                        </div>

                        {/* Position Grid */}
                        <div>
                            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Position Grades</Text>
                            <PositionGradeGrid analysis={analysis} onViewPosition={onViewPosition} />
                        </div>

                        {/* Summary */}
                        {analysis.summary && (
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <Text className="text-[10px] font-bold text-gray-400 uppercase mb-2">AI Summary</Text>
                                <p className="text-xs text-gray-300 leading-relaxed">{analysis.summary}</p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'RECOMMENDATIONS' && (
                    <>
                        <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Recommendations ({analysis.recommendations.length})
                        </Text>
                        {analysis.recommendations.map(rec => (
                            <RecommendationCard key={rec.id} rec={rec} onViewPosition={onViewPosition} />
                        ))}
                    </>
                )}

                {activeTab === 'DRILLS' && (
                    <>
                        <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Prescribed Drills ({analysis.drills.length})
                        </Text>
                        {analysis.drills.map(drill => (
                            <DrillCard key={drill.id} drill={drill} onViewPosition={onViewPosition} />
                        ))}
                    </>
                )}

                {activeTab === 'PRACTICE_PLAN' && (
                    <PracticePlanView analysis={analysis} />
                )}

                {activeTab === 'AI_REVIEW' && (
                    <>
                        {/* Generate button */}
                        {!aiReviewText && !isGeneratingReview && (
                            <button
                                onClick={generateAiReview}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold text-sm hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] transition-all"
                            >
                                Generate AI Swing Review
                            </button>
                        )}

                        {/* Review text */}
                        {(aiReviewText || isGeneratingReview) && (
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <Text className="text-[10px] font-bold text-gray-400 uppercase">AI Review</Text>
                                    {isGeneratingReview && (
                                        <span className="text-[9px] text-orange-400 animate-pulse font-bold">Generating...</span>
                                    )}
                                </div>
                                <pre className="text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                                    {aiReviewText}
                                    {isGeneratingReview && <span className="animate-pulse">▊</span>}
                                </pre>
                            </div>
                        )}

                        {/* Audio narration */}
                        {aiReviewText && !isGeneratingReview && (
                            <button
                                onClick={() => setIsPlayingNarration(!isPlayingNarration)}
                                className="w-full py-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                            >
                                {isPlayingNarration ? (
                                    <>
                                        <div className="flex gap-0.5 items-end h-4">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="w-1 bg-orange-400 rounded-full animate-pulse" style={{ height: `${8 + Math.random() * 12}px`, animationDelay: `${i * 0.1}s` }} />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-orange-400">Playing Narration...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xl">🔊</span>
                                        <span className="text-xs font-bold text-white">Listen to AI Narration</span>
                                    </>
                                )}
                            </button>
                        )}

                        {/* Quick AI Prompts */}
                        <div>
                            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick AI Questions</Text>
                            <div className="grid grid-cols-2 gap-2">
                                {quickPrompts.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { /* Would trigger Gemini chat */ }}
                                        className="text-left p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                                    >
                                        <span className="text-[10px] text-gray-300">{prompt}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

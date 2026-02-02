/**
 * AnalysisReportView.tsx
 *
 * Comprehensive swing analysis report showing:
 * - Overall score and grade
 * - Position-by-position grades grid
 * - Strengths & weaknesses
 * - Prioritized recommendations
 * - Recommended drills with steps
 * - AI review (text or audio)
 * - Share/export options
 */

import React, { useState, useEffect } from 'react';
import { COLORS } from '../constants';
import { Text, Button, Card, Badge, ProgressBar } from './UIComponents';
import {
    FullSwingAnalysis,
    SwingPositionId,
    CoachingRecommendation,
    RecommendedDrill,
    DetectedPosition,
} from '../types';
import { SWING_POSITIONS, generateAnalysisNarration, generateTextReview } from '../services/swingAnalysisService';

// Icons
const Icons = {
    ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>,
    Play: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
    Volume: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>,
    Share: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>,
    Download: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
    FileText: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
};

// Grade colors
const GRADE_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
    'A': { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500', label: 'Excellent' },
    'B': { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500', label: 'Good' },
    'C': { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500', label: 'Average' },
    'D': { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500', label: 'Needs Work' },
    'F': { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500', label: 'Poor' },
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
    'HIGH': { bg: 'bg-red-500/20', text: 'text-red-400' },
    'MEDIUM': { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    'LOW': { bg: 'bg-blue-500/20', text: 'text-blue-400' },
};

// --- Score Ring ---
const ScoreRing: React.FC<{ score: number; grade: string; size?: number }> = ({ score, grade, size = 120 }) => {
    const gradeConfig = GRADE_CONFIG[grade] || GRADE_CONFIG['C'];
    const radius = (size / 2) - 8;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1F2937" strokeWidth="8" />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={`${gradeConfig.text} transition-all duration-1000 ease-out`}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white tabular-nums">{score}</span>
                <span className={`text-xs font-bold ${gradeConfig.text}`}>{gradeConfig.label}</span>
            </div>
        </div>
    );
};

// --- Position Grid ---
const PositionGradeGrid: React.FC<{
    positions: DetectedPosition[];
    onSelectPosition: (id: SwingPositionId) => void;
}> = ({ positions, onSelectPosition }) => (
    <div className="grid grid-cols-5 gap-2">
        {positions.map(pos => {
            const gradeConfig = GRADE_CONFIG[pos.overallGrade] || GRADE_CONFIG['C'];
            const posDef = SWING_POSITIONS.find(p => p.id === pos.positionId);
            return (
                <button
                    key={pos.positionId}
                    onClick={() => onSelectPosition(pos.positionId)}
                    className={`p-2 rounded-xl border ${gradeConfig.border}/30 bg-white/5 hover:bg-white/10 transition-all text-center`}
                >
                    <span className={`text-lg font-black block ${gradeConfig.text}`}>{pos.overallGrade}</span>
                    <span className="text-[10px] font-bold text-white block">{pos.positionId}</span>
                    <span className="text-[8px] text-gray-500 block leading-tight">{posDef?.name}</span>
                </button>
            );
        })}
    </div>
);

// --- Recommendation Card ---
const RecommendationCard: React.FC<{
    rec: CoachingRecommendation;
    index: number;
    onViewPositions: (ids: SwingPositionId[]) => void;
}> = ({ rec, index, onViewPositions }) => {
    const [expanded, setExpanded] = useState(false);
    const priorityStyle = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES['MEDIUM'];

    return (
        <div
            className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden cursor-pointer hover:bg-white/8 transition-all"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-black text-orange-400">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${priorityStyle.bg} ${priorityStyle.text}`}>
                                {rec.priority}
                            </span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase">{rec.category}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{rec.title}</h4>
                        {expanded && (
                            <div className="animate-in slide-in-from-top duration-200">
                                <p className="text-xs text-gray-300 leading-relaxed mb-3">{rec.description}</p>
                                {rec.estimatedImpact && (
                                    <div className="bg-green-500/10 rounded-lg p-2 mb-2">
                                        <span className="text-[10px] font-bold text-green-400">Expected Impact: </span>
                                        <span className="text-[10px] text-gray-300">{rec.estimatedImpact}</span>
                                    </div>
                                )}
                                {rec.positionRefs.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-500">Affects:</span>
                                        <div className="flex gap-1">
                                            {rec.positionRefs.map(p => (
                                                <button
                                                    key={p}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onViewPositions([p as SwingPositionId]);
                                                    }}
                                                    className="text-[9px] font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full hover:bg-orange-500/30"
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <svg
                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className={`text-gray-500 transition-transform flex-shrink-0 mt-1 ${expanded ? 'rotate-180' : ''}`}
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </div>
        </div>
    );
};

// --- Drill Card ---
const DrillCard: React.FC<{ drill: RecommendedDrill; index: number }> = ({ drill, index }) => {
    const [expanded, setExpanded] = useState(false);
    const difficultyColors: Record<string, string> = {
        'BEGINNER': 'text-green-400 bg-green-500/20',
        'INTERMEDIATE': 'text-yellow-400 bg-yellow-500/20',
        'ADVANCED': 'text-red-400 bg-red-500/20',
    };

    return (
        <div
            className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden cursor-pointer hover:bg-white/8 transition-all"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">🏌️</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${difficultyColors[drill.difficulty] || ''}`}>
                                {drill.difficulty}
                            </span>
                            <span className="text-[9px] text-gray-500">{drill.duration}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-0.5">{drill.name}</h4>
                        <p className="text-[10px] text-gray-400">{drill.category}</p>
                        {expanded && (
                            <div className="mt-3 animate-in slide-in-from-top duration-200">
                                <p className="text-xs text-gray-300 leading-relaxed mb-3">{drill.description}</p>
                                <div className="bg-white/5 rounded-xl p-3 space-y-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Steps</span>
                                    {drill.steps.map((step, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-[9px] font-bold text-orange-400">{i + 1}</span>
                                            </div>
                                            <span className="text-xs text-gray-300">{step}</span>
                                        </div>
                                    ))}
                                </div>
                                {drill.targetPositions.length > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] text-gray-500">Targets:</span>
                                        <div className="flex gap-1">
                                            {drill.targetPositions.map(p => (
                                                <span key={p} className="text-[9px] font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {drill.expectedImprovement && (
                                    <div className="bg-green-500/10 rounded-lg p-2 mt-2">
                                        <span className="text-[10px] font-bold text-green-400">Expected: </span>
                                        <span className="text-[10px] text-gray-300">{drill.expectedImprovement}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'RECOMMENDATIONS' | 'DRILLS' | 'AI_REVIEW'>('OVERVIEW');
    const [aiReviewText, setAiReviewText] = useState<string | null>(null);
    const [loadingReview, setLoadingReview] = useState(false);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

    const gradeConfig = GRADE_CONFIG[analysis.overallGrade] || GRADE_CONFIG['C'];

    const requestAIReview = async (format: 'text' | 'audio') => {
        if (format === 'text') {
            setLoadingReview(true);
            try {
                const review = await generateTextReview(analysis);
                setAiReviewText(review);
            } catch {
                setAiReviewText('Unable to generate AI review at this time. Please try again.');
            }
            setLoadingReview(false);
        } else {
            setIsGeneratingAudio(true);
            try {
                await generateAnalysisNarration(analysis);
                // Audio plays automatically via the service
            } catch {
                console.error('Audio generation failed');
            }
            setIsGeneratingAudio(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#0A0F1C] text-white flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-[#111827] border-b border-white/10 safe-area-top">
                <button onClick={onBack} className="p-2 text-gray-400 hover:text-white flex items-center gap-1">
                    <Icons.ChevronLeft /> Back
                </button>
                <Text variant="h4" color="white" className="text-sm font-bold">Analysis Report</Text>
                <button className="p-2 text-gray-400 hover:text-white">
                    <Icons.Share />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-[#111827]">
                {(['OVERVIEW', 'RECOMMENDATIONS', 'DRILLS', 'AI_REVIEW'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                            activeTab === tab
                                ? 'border-orange-500 text-white'
                                : 'border-transparent text-gray-500'
                        }`}
                    >
                        {tab === 'AI_REVIEW' ? 'AI Review' : tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 safe-area-bottom pb-24">
                {activeTab === 'OVERVIEW' && (
                    <>
                        {/* Score & Grade Hero */}
                        <div className="flex flex-col items-center py-4">
                            <ScoreRing score={analysis.overallScore} grade={analysis.overallGrade} size={140} />
                            <div className="mt-3 text-center">
                                <Text variant="h3" color="white">{analysis.clubUsed} Swing Analysis</Text>
                                <Text className="text-xs text-gray-500 mt-1">
                                    {analysis.cameraAngle.replace('_', ' ')} • {analysis.date.toLocaleDateString()}
                                </Text>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={onViewVideo}
                                className="flex-1 bg-orange-500/20 rounded-xl p-3 text-center hover:bg-orange-500/30 transition-colors"
                            >
                                <Icons.Play />
                                <span className="text-[10px] font-bold text-orange-400 block mt-1">Watch Video</span>
                            </button>
                            <button
                                onClick={() => requestAIReview('audio')}
                                disabled={isGeneratingAudio}
                                className="flex-1 bg-blue-500/20 rounded-xl p-3 text-center hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                            >
                                <Icons.Volume />
                                <span className="text-[10px] font-bold text-blue-400 block mt-1">
                                    {isGeneratingAudio ? 'Generating...' : 'AI Audio Review'}
                                </span>
                            </button>
                            <button className="flex-1 bg-purple-500/20 rounded-xl p-3 text-center hover:bg-purple-500/30 transition-colors">
                                <Icons.Download />
                                <span className="text-[10px] font-bold text-purple-400 block mt-1">Export PDF</span>
                            </button>
                        </div>

                        {/* Position Grades Grid */}
                        <div>
                            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Position Grades</Text>
                            <PositionGradeGrid positions={analysis.positions} onSelectPosition={onViewPosition} />
                        </div>

                        {/* Strengths */}
                        <div>
                            <Text className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3">Strengths</Text>
                            <div className="space-y-2">
                                {analysis.strengths.map((s, i) => (
                                    <div key={i} className="flex items-start gap-3 bg-green-500/5 rounded-xl p-3 border border-green-500/10">
                                        <span className="text-green-400 text-sm mt-0.5">✓</span>
                                        <span className="text-xs text-gray-300 leading-relaxed">{s}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weaknesses */}
                        <div>
                            <Text className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Areas for Improvement</Text>
                            <div className="space-y-2">
                                {analysis.weaknesses.map((w, i) => (
                                    <div key={i} className="flex items-start gap-3 bg-red-500/5 rounded-xl p-3 border border-red-500/10">
                                        <span className="text-red-400 text-sm mt-0.5">!</span>
                                        <span className="text-xs text-gray-300 leading-relaxed">{w}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                            {analysis.tags.map((tag, i) => (
                                <span key={i} className="text-[10px] font-bold bg-white/10 text-gray-300 px-3 py-1 rounded-full">
                                    {tag}
                                </span>
                            ))}
                            <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full">
                                Execution: {'★'.repeat(analysis.executionLevel)}{'☆'.repeat(5 - analysis.executionLevel)}
                            </span>
                        </div>
                    </>
                )}

                {activeTab === 'RECOMMENDATIONS' && (
                    <div className="space-y-3">
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Prioritized Recommendations ({analysis.recommendations.length})
                        </Text>
                        {analysis.recommendations.map((rec, i) => (
                            <RecommendationCard
                                key={rec.id}
                                rec={rec}
                                index={i}
                                onViewPositions={(ids) => onViewPosition(ids[0])}
                            />
                        ))}
                    </div>
                )}

                {activeTab === 'DRILLS' && (
                    <div className="space-y-3">
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Recommended Drills ({analysis.drills.length})
                        </Text>
                        {analysis.drills.map((drill, i) => (
                            <DrillCard key={drill.id} drill={drill} index={i} />
                        ))}
                    </div>
                )}

                {activeTab === 'AI_REVIEW' && (
                    <div className="space-y-4">
                        {/* Review Options */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => requestAIReview('text')}
                                disabled={loadingReview}
                                className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center hover:bg-white/10 transition-all disabled:opacity-50"
                            >
                                <Icons.FileText />
                                <span className="text-sm font-bold text-white block mt-2">Text Review</span>
                                <span className="text-[10px] text-gray-500">Detailed written analysis</span>
                            </button>
                            <button
                                onClick={() => requestAIReview('audio')}
                                disabled={isGeneratingAudio}
                                className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center hover:bg-white/10 transition-all disabled:opacity-50"
                            >
                                <Icons.Volume />
                                <span className="text-sm font-bold text-white block mt-2">Audio Review</span>
                                <span className="text-[10px] text-gray-500">AI narrated feedback</span>
                            </button>
                        </div>

                        {/* Loading */}
                        {loadingReview && (
                            <div className="text-center py-8">
                                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                <Text className="text-sm text-gray-400">Generating AI review...</Text>
                            </div>
                        )}

                        {/* Text Review Content */}
                        {aiReviewText && (
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xl">🧠</span>
                                    <Text className="text-sm font-bold text-white">AI Coach Review</Text>
                                </div>
                                <div className="prose prose-invert prose-sm max-w-none">
                                    {aiReviewText.split('\n\n').map((paragraph, i) => (
                                        <p key={i} className="text-xs text-gray-300 leading-relaxed mb-3">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick AI Chat */}
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                            <Text className="text-sm font-bold text-white mb-2">Ask the AI Coach</Text>
                            <Text className="text-[10px] text-gray-500 mb-3">Get specific answers about your swing</Text>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    'How can I fix my downswing?',
                                    'What should I practice first?',
                                    'Compare my swing to Rory',
                                    'Why am I slicing?',
                                ].map((q, i) => (
                                    <button
                                        key={i}
                                        className="text-[10px] bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-full hover:bg-orange-500/30 transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

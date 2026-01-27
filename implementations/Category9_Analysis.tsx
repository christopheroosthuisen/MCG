// ============================================================
// CATEGORY 9: ANALYSIS & VIDEO PLAYER IMPROVEMENTS
// ============================================================
// Copy each section into your project as needed.
//
// COMPONENTS INCLUDED:
// 1. KeyframeTimeline - Timeline with swing phase markers
// 2. AnalysisSummaryCard - Quick score summary
// 3. ProComparisonSelector - Select comparison video
// 4. EnhancedFeedbackCard - Improved AI feedback display
// 5. SwingPhaseIndicator - Current phase overlay
// 6. VoiceCoachIndicator - Audio feedback status
// 7. MetricComparisonCard - You vs Pro metrics
// 8. ExportOptions - Share/export menu
// 9. DrawingToolbar (Enhanced) - Better tool UI
// ============================================================

import React, { useState } from 'react';
import { Text, Button, Card, Badge, ProgressBar } from './UIComponents';
import { COLORS } from '../constants';
import { FeedbackMessage, Keyframe, SwingMetrics } from '../types';

// ============================================================
// 1. KEYFRAME TIMELINE
// ============================================================

interface KeyframeTimelineProps {
    duration: number;
    currentTime: number;
    keyframes: Keyframe[];
    onSeek: (time: number) => void;
    onKeyframeClick: (keyframe: Keyframe) => void;
}

const KEYFRAME_COLORS: Record<string, string> = {
    ADDRESS: '#6B7280',
    TAKEAWAY: '#3B82F6',
    TOP: '#8B5CF6',
    TRANSITION: '#F59E0B',
    IMPACT: '#10B981',
    FOLLOW_THROUGH: '#EC4899',
    FINISH: '#6B7280'
};

export const KeyframeTimeline: React.FC<KeyframeTimelineProps> = ({
    duration,
    currentTime,
    keyframes,
    onSeek,
    onKeyframeClick
}) => {
    return (
        <div className="px-4 py-3 bg-gray-900">
            {/* Timeline bar */}
            <div className="relative h-8 flex items-center">
                {/* Background track */}
                <div className="absolute left-0 right-0 h-1 bg-gray-700 rounded-full"/>

                {/* Progress */}
                <div
                    className="absolute left-0 h-1 bg-orange-500 rounded-full"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                />

                {/* Keyframe markers */}
                {keyframes.map((kf, idx) => (
                    <button
                        key={idx}
                        onClick={() => onKeyframeClick(kf)}
                        className="absolute transform -translate-x-1/2 group"
                        style={{ left: `${(kf.timestamp / duration) * 100}%` }}
                    >
                        {/* Marker dot */}
                        <div
                            className="w-4 h-4 rounded-full border-2 border-gray-900 transition-transform hover:scale-125"
                            style={{ backgroundColor: KEYFRAME_COLORS[kf.type] || '#6B7280' }}
                        />

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                                {kf.type.replace('_', ' ')}
                            </div>
                        </div>
                    </button>
                ))}

                {/* Current position handle */}
                <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.01}
                    value={currentTime}
                    onChange={(e) => onSeek(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div
                    className="absolute w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none"
                    style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translateX(-50%)' }}
                />
            </div>

            {/* Keyframe labels */}
            <div className="flex justify-between mt-2">
                {keyframes.slice(0, 5).map((kf, idx) => (
                    <button
                        key={idx}
                        onClick={() => onKeyframeClick(kf)}
                        className="text-[9px] font-bold uppercase tracking-wide text-gray-500 hover:text-white transition-colors"
                        style={{ color: currentTime >= kf.timestamp ? KEYFRAME_COLORS[kf.type] : undefined }}
                    >
                        {kf.type.split('_')[0]}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ============================================================
// 2. ANALYSIS SUMMARY CARD
// ============================================================

interface AnalysisSummaryCardProps {
    score: number;
    feedback: FeedbackMessage[];
    clubUsed: string;
    date: Date;
    onViewDetails: () => void;
}

export const AnalysisSummaryCard: React.FC<AnalysisSummaryCardProps> = ({
    score,
    feedback,
    clubUsed,
    date,
    onViewDetails
}) => {
    const getScoreColor = (score: number) => {
        if (score >= 85) return { bg: 'from-green-500 to-emerald-500', text: 'Excellent!' };
        if (score >= 70) return { bg: 'from-blue-500 to-cyan-500', text: 'Good Form' };
        if (score >= 50) return { bg: 'from-orange-500 to-amber-500', text: 'Room to Improve' };
        return { bg: 'from-red-500 to-pink-500', text: 'Needs Work' };
    };

    const scoreStyle = getScoreColor(score);
    const warnings = feedback.filter(f => f.severity === 'WARNING').length;
    const errors = feedback.filter(f => f.severity === 'ERROR').length;

    return (
        <Card
            variant="elevated"
            className={`bg-gradient-to-br ${scoreStyle.bg} text-white relative overflow-hidden`}
        >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="80" cy="20" r="30" fill="white"/>
                    <circle cx="20" cy="80" r="20" fill="white"/>
                </svg>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <Text variant="caption" color="rgba(255,255,255,0.8)">Swing Analysis</Text>
                        <Text variant="h3" color="white">{clubUsed} • {date.toLocaleDateString()}</Text>
                    </div>

                    {/* Score circle */}
                    <div className="relative w-20 h-20">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                            <circle
                                cx="18" cy="18" r="16"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={`${score} 100`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black">{score}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">{score >= 70 ? '✨' : '💪'}</span>
                    <Text variant="h4" color="white">{scoreStyle.text}</Text>
                </div>

                {/* Feedback summary */}
                <div className="flex gap-4 mb-4">
                    {warnings > 0 && (
                        <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                            <span className="text-yellow-300">⚠️</span>
                            <span className="text-sm font-medium">{warnings} tip{warnings > 1 ? 's' : ''}</span>
                        </div>
                    )}
                    {errors > 0 && (
                        <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                            <span className="text-red-300">❌</span>
                            <span className="text-sm font-medium">{errors} issue{errors > 1 ? 's' : ''}</span>
                        </div>
                    )}
                    {warnings === 0 && errors === 0 && (
                        <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                            <span>✅</span>
                            <span className="text-sm font-medium">No issues detected</span>
                        </div>
                    )}
                </div>

                <Button
                    variant="outline"
                    fullWidth
                    onClick={onViewDetails}
                    className="border-white text-white hover:bg-white/20"
                >
                    View Full Analysis
                </Button>
            </div>
        </Card>
    );
};

// ============================================================
// 3. PRO COMPARISON SELECTOR
// ============================================================

interface ProPlayer {
    id: string;
    name: string;
    avatarUrl: string;
    specialty: string;
}

const PRO_PLAYERS: ProPlayer[] = [
    { id: 'tiger', name: 'Tiger Woods', avatarUrl: '', specialty: 'Iron Play' },
    { id: 'rory', name: 'Rory McIlroy', avatarUrl: '', specialty: 'Driver' },
    { id: 'jon', name: 'Jon Rahm', avatarUrl: '', specialty: 'Ball Striking' },
    { id: 'scottie', name: 'Scottie Scheffler', avatarUrl: '', specialty: 'Consistency' },
    { id: 'best', name: 'Your Best Swing', avatarUrl: '', specialty: 'Personal Best' }
];

export const ProComparisonSelector: React.FC<{
    selectedPro: string;
    onSelectPro: (proId: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ selectedPro, onSelectPro, isOpen, onToggle }) => {
    const selected = PRO_PLAYERS.find(p => p.id === selectedPro);

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                onClick={onToggle}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 text-white transition-colors"
            >
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs">
                    {selected?.name.charAt(0) || '?'}
                </div>
                <span className="text-sm font-medium">{selected?.name || 'Select Pro'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-gray-700">
                        <Text variant="caption" className="text-gray-400 text-[10px] uppercase tracking-wider px-2">
                            Compare with
                        </Text>
                    </div>
                    <div className="p-1 max-h-64 overflow-y-auto">
                        {PRO_PLAYERS.map(pro => (
                            <button
                                key={pro.id}
                                onClick={() => {
                                    onSelectPro(pro.id);
                                    onToggle();
                                }}
                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                    selectedPro === pro.id
                                        ? 'bg-orange-500 text-white'
                                        : 'text-white hover:bg-gray-700'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                    pro.id === 'best' ? 'bg-green-500' : 'bg-gray-600'
                                }`}>
                                    {pro.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-medium">{pro.name}</div>
                                    <div className="text-[10px] text-gray-400">{pro.specialty}</div>
                                </div>
                                {selectedPro === pro.id && (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-auto">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================
// 4. ENHANCED FEEDBACK CARD
// ============================================================

interface EnhancedFeedbackCardProps {
    feedback: FeedbackMessage;
    onSeekToTimestamp?: () => void;
    onViewDrill?: (drillId: string) => void;
}

export const EnhancedFeedbackCard: React.FC<EnhancedFeedbackCardProps> = ({
    feedback,
    onSeekToTimestamp,
    onViewDrill
}) => {
    const severityStyles = {
        INFO: {
            bg: 'bg-blue-50',
            border: 'border-l-blue-500',
            icon: 'ℹ️',
            iconBg: 'bg-blue-100 text-blue-600'
        },
        WARNING: {
            bg: 'bg-orange-50',
            border: 'border-l-orange-500',
            icon: '⚠️',
            iconBg: 'bg-orange-100 text-orange-600'
        },
        ERROR: {
            bg: 'bg-red-50',
            border: 'border-l-red-500',
            icon: '❌',
            iconBg: 'bg-red-100 text-red-600'
        }
    };

    const style = severityStyles[feedback.severity];

    const formatTimestamp = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <Card variant="filled" className={`${style.bg} border-l-4 ${style.border} rounded-l-md`}>
            <div className="flex gap-3">
                {/* Icon */}
                <div className={`w-8 h-8 rounded-full ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
                    {style.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Category & Timestamp */}
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="neutral" className="text-[9px]">
                            {feedback.category}
                        </Badge>
                        {onSeekToTimestamp && (
                            <button
                                onClick={onSeekToTimestamp}
                                className="text-[10px] text-gray-500 hover:text-orange-500 font-mono"
                            >
                                @ {formatTimestamp(feedback.timestamp)}
                            </button>
                        )}
                    </div>

                    {/* Message */}
                    <Text variant="body" className="text-sm mb-2">{feedback.text}</Text>

                    {/* Correction suggestion */}
                    {feedback.correction && (
                        <div className="mt-2 p-2 bg-white/50 rounded-lg">
                            <Text variant="caption" className="text-green-700 font-medium">
                                💡 Try: {feedback.correction}
                            </Text>
                        </div>
                    )}

                    {/* Drill link */}
                    {onViewDrill && (
                        <button
                            onClick={() => onViewDrill('related-drill-id')}
                            className="mt-2 text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
                        >
                            <span>View Related Drill</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
};

// ============================================================
// 5. SWING PHASE INDICATOR
// ============================================================

export const SwingPhaseIndicator: React.FC<{
    currentPhase: string;
    allPhases: string[];
}> = ({ currentPhase, allPhases }) => {
    const currentIndex = allPhases.indexOf(currentPhase);

    return (
        <div className="absolute top-4 left-4 z-30 bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <Text variant="caption" className="text-gray-400 text-[9px] uppercase tracking-wider mb-2">
                Current Phase
            </Text>
            <div className="flex items-center gap-1">
                {allPhases.map((phase, idx) => (
                    <React.Fragment key={phase}>
                        <div
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                                idx === currentIndex
                                    ? 'bg-orange-500 text-white'
                                    : idx < currentIndex
                                        ? 'bg-green-500/30 text-green-400'
                                        : 'bg-gray-700 text-gray-500'
                            }`}
                        >
                            {phase.split('_')[0]}
                        </div>
                        {idx < allPhases.length - 1 && (
                            <div className={`w-2 h-0.5 ${idx < currentIndex ? 'bg-green-500' : 'bg-gray-700'}`}/>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

// ============================================================
// 6. VOICE COACH INDICATOR
// ============================================================

export const VoiceCoachIndicator: React.FC<{
    isEnabled: boolean;
    isSpeaking: boolean;
    onToggle: () => void;
}> = ({ isEnabled, isSpeaking, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
                isEnabled
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
        >
            {/* Sound wave animation when speaking */}
            {isEnabled && isSpeaking ? (
                <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="w-0.5 bg-white rounded-full animate-pulse"
                            style={{
                                height: `${8 + Math.random() * 8}px`,
                                animationDelay: `${i * 0.1}s`
                            }}
                        />
                    ))}
                </div>
            ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    {isEnabled && (
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    )}
                </svg>
            )}
            <span className="text-xs font-medium">
                {isEnabled ? 'Voice Coach On' : 'Voice Coach'}
            </span>
        </button>
    );
};

// ============================================================
// 7. METRIC COMPARISON CARD
// ============================================================

interface MetricComparisonCardProps {
    label: string;
    userValue: number;
    proValue: number;
    unit: string;
    higherIsBetter?: boolean;
}

export const MetricComparisonCard: React.FC<MetricComparisonCardProps> = ({
    label,
    userValue,
    proValue,
    unit,
    higherIsBetter = true
}) => {
    const diff = userValue - proValue;
    const percentDiff = ((diff / proValue) * 100).toFixed(1);
    const isGood = higherIsBetter ? diff >= 0 : diff <= 0;

    return (
        <div className="bg-gray-800 rounded-xl p-3">
            <Text variant="caption" className="text-gray-400 text-[10px] uppercase tracking-wider mb-2">
                {label}
            </Text>

            <div className="flex items-end justify-between mb-2">
                {/* User value */}
                <div>
                    <Text variant="metric" color="white" className="text-xl">{userValue}</Text>
                    <Text variant="caption" className="text-gray-500">{unit}</Text>
                </div>

                {/* Comparison */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                    isGood ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        {isGood
                            ? <path d="M7 14l5-5 5 5H7z"/>
                            : <path d="M7 10l5 5 5-5H7z"/>
                        }
                    </svg>
                    {Math.abs(parseFloat(percentDiff))}%
                </div>
            </div>

            {/* Comparison bar */}
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-orange-500 rounded-full"
                    style={{ width: `${Math.min((userValue / proValue) * 100, 100)}%` }}
                />
                <div
                    className="absolute top-0 h-full w-0.5 bg-white"
                    style={{ left: '100%', transform: 'translateX(-100%)' }}
                />
            </div>

            <div className="flex justify-between mt-1">
                <Text variant="caption" className="text-[9px] text-gray-500">You</Text>
                <Text variant="caption" className="text-[9px] text-gray-500">Pro: {proValue}</Text>
            </div>
        </div>
    );
};

// ============================================================
// 8. EXPORT OPTIONS MENU
// ============================================================

export const ExportOptionsMenu: React.FC<{
    isOpen: boolean;
    onToggle: () => void;
    onExportVideo: () => void;
    onExportGIF: () => void;
    onShare: () => void;
    onSaveToLibrary: () => void;
}> = ({ isOpen, onToggle, onExportVideo, onExportGIF, onShare, onSaveToLibrary }) => {
    const options = [
        { icon: '📹', label: 'Export Video', onClick: onExportVideo },
        { icon: '🎞️', label: 'Export GIF', onClick: onExportGIF },
        { icon: '📤', label: 'Share', onClick: onShare },
        { icon: '💾', label: 'Save to Library', onClick: onSaveToLibrary }
    ];

    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className="text-orange-500 font-bold text-sm hover:text-orange-400"
            >
                Export
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    {options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                option.onClick();
                                onToggle();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                            <span className="text-lg">{option.icon}</span>
                            <span className="text-sm font-medium">{option.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================================
// 9. ENHANCED DRAWING TOOLBAR
// ============================================================

type DrawingTool = 'POINTER' | 'LINE' | 'ANGLE' | 'CIRCLE' | 'FREEHAND' | 'TEXT';

export const EnhancedDrawingToolbar: React.FC<{
    activeTool: DrawingTool | null;
    onSelectTool: (tool: DrawingTool) => void;
    activeColor: string;
    onSelectColor: (color: string) => void;
    onUndo: () => void;
    onClear: () => void;
    canUndo: boolean;
}> = ({ activeTool, onSelectTool, activeColor, onSelectColor, onUndo, onClear, canUndo }) => {
    const tools: { id: DrawingTool; icon: string; label: string }[] = [
        { id: 'POINTER', icon: '👆', label: 'Select' },
        { id: 'LINE', icon: '📏', label: 'Line' },
        { id: 'ANGLE', icon: '📐', label: 'Angle' },
        { id: 'CIRCLE', icon: '⭕', label: 'Circle' },
        { id: 'FREEHAND', icon: '✏️', label: 'Draw' },
        { id: 'TEXT', icon: '💬', label: 'Text' }
    ];

    const colors = ['#FF8200', '#10B981', '#EF4444', '#FFFFFF', '#3B82F6', '#F59E0B'];

    return (
        <div className="bg-gray-900 border-t border-gray-800 p-3">
            <div className="flex items-center justify-between gap-3">
                {/* Tools */}
                <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
                    {tools.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => onSelectTool(tool.id)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                                activeTool === tool.id
                                    ? 'bg-orange-500 shadow-lg shadow-orange-500/30'
                                    : 'hover:bg-gray-700'
                            }`}
                            title={tool.label}
                        >
                            {tool.icon}
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-700"/>

                {/* Colors */}
                <div className="flex gap-2">
                    {colors.map(color => (
                        <button
                            key={color}
                            onClick={() => onSelectColor(color)}
                            className={`w-6 h-6 rounded-full transition-transform ${
                                activeColor === color ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                            }`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-700"/>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            canUndo
                                ? 'bg-gray-800 text-white hover:bg-gray-700'
                                : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                        }`}
                    >
                        Undo
                    </button>
                    <button
                        onClick={onClear}
                        className="px-3 py-2 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// USAGE EXAMPLES
// ============================================================
/*

// Example 1: Keyframe Timeline
<KeyframeTimeline
    duration={3.5}
    currentTime={currentTime}
    keyframes={swing.keyframes}
    onSeek={setCurrentTime}
    onKeyframeClick={(kf) => setCurrentTime(kf.timestamp)}
/>

// Example 2: Analysis Summary (shown after recording)
<AnalysisSummaryCard
    score={82}
    feedback={analysis.feedback}
    clubUsed="Driver"
    date={new Date()}
    onViewDetails={() => openFullAnalysis()}
/>

// Example 3: Pro Comparison in split view
const [selectedPro, setSelectedPro] = useState('tiger');
const [showProSelector, setShowProSelector] = useState(false);

<ProComparisonSelector
    selectedPro={selectedPro}
    onSelectPro={setSelectedPro}
    isOpen={showProSelector}
    onToggle={() => setShowProSelector(!showProSelector)}
/>

// Example 4: Feedback list
{feedback.map(fb => (
    <EnhancedFeedbackCard
        key={fb.id}
        feedback={fb}
        onSeekToTimestamp={() => setCurrentTime(fb.timestamp)}
        onViewDrill={openDrill}
    />
))}

// Example 5: Metrics comparison grid
<div className="grid grid-cols-2 gap-3">
    <MetricComparisonCard label="Club Speed" userValue={105} proValue={122} unit="mph" />
    <MetricComparisonCard label="Ball Speed" userValue={152} proValue={175} unit="mph" />
    <MetricComparisonCard label="Launch Angle" userValue={12.5} proValue={10.8} unit="°" higherIsBetter={false} />
    <MetricComparisonCard label="Spin Rate" userValue={2400} proValue={2200} unit="rpm" higherIsBetter={false} />
</div>

*/

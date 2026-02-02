/**
 * PositionAnalysisView.tsx
 *
 * Enhanced position-by-position analysis carousel with:
 * - Touch swipe navigation between positions
 * - Ideal vs actual skeleton overlay toggle
 * - Enhanced angle visualization with ideal range bars
 * - Position description panel with key checkpoints
 * - Improved coaching feedback with expandable details
 * - Position navigation strip with grade indicators
 * - Confidence and deviation metrics
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { COLORS } from '../constants';
import { Text, Button, Badge, ProgressBar } from './UIComponents';
import {
    DetectedPosition,
    SwingPositionId,
    SkeletonJointData,
    MeasuredAngle,
    PositionCoachingFeedback,
} from '../types';
import { SWING_POSITIONS, drawSkeleton, drawAngleMeasurement, drawIdealSkeletonGhost, calculateSkeletonDeviation, SKELETON_CONNECTIONS } from '../services/swingAnalysisService';

// Icons
const Icons = {
    ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>,
    ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>,
    Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
    EyeOff: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>,
    Layers: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
};

// Grade colors
const GRADE_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
    'A': { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500', label: 'Excellent' },
    'B': { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500', label: 'Good' },
    'C': { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500', label: 'Average' },
    'D': { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500', label: 'Needs Work' },
    'F': { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500', label: 'Poor' },
};

const SEVERITY_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
    'CRITICAL': { bg: 'bg-red-500/20', text: 'text-red-400', icon: '🔴' },
    'WARNING': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: '🟡' },
    'TIP': { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: '🔵' },
    'INFO': { bg: 'bg-green-500/20', text: 'text-green-400', icon: '🟢' },
};

// --- Enhanced Skeleton Overlay with Ideal Comparison ---
const SkeletonOverlay: React.FC<{
    skeleton: SkeletonJointData[];
    positionId: SwingPositionId;
    canvasWidth: number;
    canvasHeight: number;
    showIdeal: boolean;
    showAngles: boolean;
    angles: MeasuredAngle[];
}> = ({ skeleton, positionId, canvasWidth, canvasHeight, showIdeal, showAngles, angles }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        if (showIdeal) {
            drawIdealSkeletonGhost(ctx, positionId, canvasWidth, canvasHeight, {
                opacity: 0.25,
                color: '#00FF88',
            });
        }

        drawSkeleton(ctx, skeleton, canvasWidth, canvasHeight);

        if (showAngles) {
            angles.forEach(angle => {
                drawAngleMeasurement(ctx, angle, skeleton, canvasWidth, canvasHeight);
            });
        }
    }, [skeleton, canvasWidth, canvasHeight, showIdeal, showAngles, angles, positionId]);

    return (
        <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="absolute inset-0 z-10 pointer-events-none"
        />
    );
};

// --- Enhanced Angle Bar Visualization ---
const AngleBar: React.FC<{ angle: MeasuredAngle }> = ({ angle }) => {
    const range = angle.idealRange;
    const min = Math.min(range[0], angle.value) - 15;
    const max = Math.max(range[1], angle.value) + 15;
    const span = max - min;

    const idealLeft = ((range[0] - min) / span) * 100;
    const idealWidth = ((range[1] - range[0]) / span) * 100;
    const actualPos = ((angle.value - min) / span) * 100;
    const inRange = angle.value >= range[0] && angle.value <= range[1];

    return (
        <div className="mt-1.5">
            <div className="h-2.5 bg-gray-800 rounded-full relative overflow-hidden">
                <div
                    className="absolute top-0 bottom-0 bg-green-500/25 rounded-full"
                    style={{ left: `${idealLeft}%`, width: `${idealWidth}%` }}
                />
                <div className="absolute top-0 bottom-0 w-px bg-green-500/50" style={{ left: `${idealLeft}%` }} />
                <div className="absolute top-0 bottom-0 w-px bg-green-500/50" style={{ left: `${idealLeft + idealWidth}%` }} />
                <div
                    className={`absolute top-0 bottom-0 w-2 rounded-full transition-all ${inRange ? 'bg-green-400' : 'bg-red-400'}`}
                    style={{ left: `${Math.max(0, Math.min(98, actualPos - 1))}%` }}
                />
            </div>
            <div className="flex justify-between mt-0.5">
                <span className="text-[8px] text-gray-600">{range[0]}°</span>
                <span className={`text-[8px] font-bold ${inRange ? 'text-green-400' : 'text-red-400'}`}>{angle.value}°</span>
                <span className="text-[8px] text-gray-600">{range[1]}°</span>
            </div>
        </div>
    );
};

// --- Coaching Feedback Item ---
const FeedbackItem: React.FC<{ feedback: PositionCoachingFeedback }> = ({ feedback }) => {
    const [expanded, setExpanded] = useState(false);
    const severity = SEVERITY_CONFIG[feedback.severity] || SEVERITY_CONFIG['INFO'];

    return (
        <div
            className={`rounded-xl border overflow-hidden cursor-pointer transition-all ${severity.bg} border-white/10 hover:border-white/20`}
            onClick={() => setExpanded(!expanded)}
        >
            <div className="p-3">
                <div className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0">{severity.icon}</span>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[9px] font-bold uppercase ${severity.text}`}>{feedback.category}</span>
                            {feedback.proReference && (
                                <span className="text-[8px] text-gray-500">ref: {feedback.proReference}</span>
                            )}
                        </div>
                        <h4 className="text-xs font-bold text-white">{feedback.title}</h4>
                        {expanded && (
                            <div className="mt-2 space-y-2 animate-in slide-in-from-top duration-200">
                                <p className="text-[11px] text-gray-300 leading-relaxed">{feedback.description}</p>
                                {feedback.correction && (
                                    <div className="bg-black/20 rounded-lg p-2.5 border-l-2 border-orange-500">
                                        <span className="text-[9px] font-bold text-orange-400 uppercase block mb-0.5">Correction</span>
                                        <p className="text-[11px] text-gray-200 leading-relaxed">{feedback.correction}</p>
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

// --- MAIN POSITION ANALYSIS VIEW ---
export interface PositionAnalysisViewProps {
    positions: DetectedPosition[];
    initialPositionId?: SwingPositionId;
    onBack: () => void;
    onPositionChange?: (positionId: SwingPositionId) => void;
}

export const PositionAnalysisView: React.FC<PositionAnalysisViewProps> = ({
    positions,
    initialPositionId,
    onBack,
    onPositionChange,
}) => {
    const initialIndex = initialPositionId
        ? positions.findIndex(p => p.positionId === initialPositionId)
        : 0;
    const [currentIndex, setCurrentIndex] = useState(Math.max(0, initialIndex));
    const [activeTab, setActiveTab] = useState<'COACHING' | 'ANGLES' | 'CHECKPOINTS' | 'DESCRIPTION'>('COACHING');
    const [showSkeleton, setShowSkeleton] = useState(true);
    const [showIdeal, setShowIdeal] = useState(false);
    const [showAngles, setShowAngles] = useState(false);

    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const currentPosition = positions[currentIndex];
    if (!currentPosition) return null;

    const posDef = SWING_POSITIONS.find(p => p.id === currentPosition.positionId);
    const gradeConfig = GRADE_CONFIG[currentPosition.overallGrade] || GRADE_CONFIG['C'];
    const deviation = calculateSkeletonDeviation(currentPosition.skeleton, currentPosition.positionId);

    const navigatePosition = useCallback((direction: 1 | -1) => {
        const newIndex = Math.max(0, Math.min(positions.length - 1, currentIndex + direction));
        if (newIndex !== currentIndex) {
            setCurrentIndex(newIndex);
            onPositionChange?.(positions[newIndex].positionId);
        }
    }, [currentIndex, positions, onPositionChange]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback(() => {
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) {
            navigatePosition(diff > 0 ? 1 : -1);
        }
    }, [navigatePosition]);

    return (
        <div className="fixed inset-0 z-50 bg-[#0A0F1C] text-white flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-[#111827] border-b border-white/10 safe-area-top">
                <button onClick={onBack} className="p-2 text-gray-400 hover:text-white flex items-center gap-1">
                    <Icons.ChevronLeft /> Back
                </button>
                <div className="text-center">
                    <span className={`text-xl font-black ${gradeConfig.text}`}>{currentPosition.positionId}</span>
                    <Text className="text-[10px] text-gray-500 block">{posDef?.name || ''}</Text>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowIdeal(!showIdeal)}
                        className={`p-2 rounded-lg transition-all ${showIdeal ? 'bg-green-500/20 text-green-400' : 'text-gray-500 hover:text-white'}`}
                        title="Toggle ideal overlay"
                    >
                        <Icons.Layers />
                    </button>
                    <button
                        onClick={() => setShowSkeleton(!showSkeleton)}
                        className={`p-2 rounded-lg transition-all ${showSkeleton ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500 hover:text-white'}`}
                        title="Toggle skeleton"
                    >
                        {showSkeleton ? <Icons.Eye /> : <Icons.EyeOff />}
                    </button>
                </div>
            </div>

            {/* Position Navigation Strip */}
            <div className="flex items-center px-2 py-2 bg-[#111827] border-b border-white/10 overflow-x-auto hide-scrollbar gap-1">
                {positions.map((pos, idx) => {
                    const gc = GRADE_CONFIG[pos.overallGrade] || GRADE_CONFIG['C'];
                    const isCurrent = idx === currentIndex;
                    return (
                        <button
                            key={pos.positionId}
                            onClick={() => {
                                setCurrentIndex(idx);
                                onPositionChange?.(pos.positionId);
                            }}
                            className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg transition-all border ${
                                isCurrent
                                    ? `${gc.border}/50 bg-white/10 scale-105`
                                    : 'border-transparent hover:bg-white/5'
                            }`}
                        >
                            <span className={`text-[10px] font-black block ${isCurrent ? gc.text : 'text-gray-500'}`}>
                                {pos.positionId}
                            </span>
                            <span className={`text-[8px] font-bold block ${gc.text}`}>{pos.overallGrade}</span>
                        </button>
                    );
                })}
            </div>

            {/* Frame with Skeleton Overlay - Swipeable */}
            <div
                className="relative w-full aspect-video bg-gray-900 flex-shrink-0 overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {currentPosition.frameUrl ? (
                    <img src={currentPosition.frameUrl} className="w-full h-full object-contain" alt={currentPosition.positionId} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
                        <div className="text-center">
                            <span className="text-5xl font-black text-gray-700 block">{currentPosition.positionId}</span>
                            <span className="text-xs text-gray-600">{posDef?.fullName}</span>
                        </div>
                    </div>
                )}

                {showSkeleton && (
                    <SkeletonOverlay
                        skeleton={currentPosition.skeleton}
                        positionId={currentPosition.positionId}
                        canvasWidth={640}
                        canvasHeight={360}
                        showIdeal={showIdeal}
                        showAngles={showAngles}
                        angles={currentPosition.angles}
                    />
                )}

                <div className={`absolute top-3 right-3 ${gradeConfig.bg} px-3 py-1 rounded-lg`}>
                    <span className="text-lg font-black text-white">{currentPosition.overallGrade}</span>
                    <span className="text-[9px] text-white/80 block text-center">{gradeConfig.label}</span>
                </div>

                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <span className="text-[9px] text-gray-300">Confidence: </span>
                    <span className="text-[9px] font-bold text-white">{Math.round(currentPosition.confidence * 100)}%</span>
                </div>

                {showIdeal && (
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                        <span className="text-[9px] text-green-400">Deviation: </span>
                        <span className="text-[9px] font-bold text-white">{(deviation.totalDeviation * 100).toFixed(1)}%</span>
                    </div>
                )}

                {currentIndex > 0 && (
                    <button
                        onClick={() => navigatePosition(-1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                        <Icons.ChevronLeft />
                    </button>
                )}
                {currentIndex < positions.length - 1 && (
                    <button
                        onClick={() => navigatePosition(1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                        <Icons.ChevronRight />
                    </button>
                )}

                <div className="absolute bottom-3 right-3 bg-black/40 px-2 py-0.5 rounded-full">
                    <span className="text-[8px] text-gray-400">Swipe to navigate</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-[#111827]">
                {(['COACHING', 'ANGLES', 'CHECKPOINTS', 'DESCRIPTION'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                            activeTab === tab
                                ? 'border-orange-500 text-white'
                                : 'border-transparent text-gray-500'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 safe-area-bottom pb-8" key={`${currentPosition.positionId}-${activeTab}`}>

                {activeTab === 'COACHING' && (
                    <>
                        <div className="flex gap-2 mb-2">
                            {Object.entries(
                                currentPosition.coaching.reduce((acc, c) => {
                                    acc[c.severity] = (acc[c.severity] || 0) + 1;
                                    return acc;
                                }, {} as Record<string, number>)
                            ).map(([sev, count]) => {
                                const sc = SEVERITY_CONFIG[sev];
                                return (
                                    <span key={sev} className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${sc?.bg} ${sc?.text}`}>
                                        {sc?.icon} {count} {sev.toLowerCase()}
                                    </span>
                                );
                            })}
                        </div>
                        {currentPosition.coaching.map(feedback => (
                            <FeedbackItem key={feedback.id} feedback={feedback} />
                        ))}
                        {currentPosition.coaching.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <span className="text-2xl block mb-2">✓</span>
                                <span className="text-xs">No coaching notes for this position</span>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'ANGLES' && (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <Text className="text-[10px] font-bold text-gray-400 uppercase">
                                Measured Angles ({currentPosition.angles.length})
                            </Text>
                            <button
                                onClick={() => setShowAngles(!showAngles)}
                                className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all ${
                                    showAngles ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-gray-500'
                                }`}
                            >
                                {showAngles ? 'Hide on Frame' : 'Show on Frame'}
                            </button>
                        </div>
                        {currentPosition.angles.map(angle => {
                            const inRange = angle.value >= angle.idealRange[0] && angle.value <= angle.idealRange[1];
                            const diff = Math.abs(angle.value - angle.idealValue);
                            return (
                                <div key={angle.name} className="bg-white/5 rounded-xl p-3 border border-white/10">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${inRange ? 'bg-green-400' : 'bg-red-400'}`} />
                                            <span className="text-xs font-bold text-white">{angle.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-black tabular-nums ${inRange ? 'text-green-400' : 'text-red-400'}`}>
                                                {angle.value}°
                                            </span>
                                            <span className="text-[9px] text-gray-500">
                                                ideal: {angle.idealValue}°
                                            </span>
                                        </div>
                                    </div>
                                    <AngleBar angle={angle} />
                                    {!inRange && (
                                        <div className="mt-1.5 flex items-center gap-1">
                                            <span className="text-[9px] text-red-400 font-bold">{diff > 10 ? 'Significant' : 'Minor'} deviation</span>
                                            <span className="text-[9px] text-gray-600">({diff.toFixed(1)}° from ideal)</span>
                                        </div>
                                    )}
                                    <div className="mt-1 text-[9px] text-gray-500">
                                        Status: <span className={`font-bold ${
                                            angle.status === 'GOOD' ? 'text-green-400' :
                                            angle.status === 'CAUTION' ? 'text-yellow-400' : 'text-red-400'
                                        }`}>{angle.status}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}

                {activeTab === 'CHECKPOINTS' && posDef && (
                    <>
                        <Text className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                            Key Checkpoints ({posDef.checkpoints.length})
                        </Text>
                        <div className="space-y-2">
                            {posDef.checkpoints.map((cp, i) => (
                                <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                                    <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[9px] font-bold text-orange-400">{i + 1}</span>
                                    </div>
                                    <span className="text-xs text-gray-300 leading-relaxed">{cp}</span>
                                </div>
                            ))}
                        </div>

                        <Text className="text-[10px] font-bold text-gray-400 uppercase mt-4 mb-2">
                            Ideal Angle Ranges
                        </Text>
                        <div className="space-y-2">
                            {Object.entries(posDef.idealAngles).map(([name, range]) => (
                                <div key={name} className="flex items-center justify-between bg-white/5 rounded-lg p-2.5 border border-white/10">
                                    <span className="text-xs text-white font-bold">{name}</span>
                                    <span className="text-xs text-green-400 font-mono">{range[0]}° - {range[1]}°</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'DESCRIPTION' && posDef && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl p-4 border border-orange-500/20">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                    <span className="text-lg font-black text-orange-400">{posDef.id}</span>
                                </div>
                                <div>
                                    <Text variant="h3" color="white" className="text-base">{posDef.fullName}</Text>
                                    <Text className="text-[10px] text-gray-400">{posDef.name}</Text>
                                </div>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed">{posDef.description}</p>
                        </div>

                        <div>
                            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">What To Look For</Text>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-2">
                                {posDef.checkpoints.slice(0, 4).map((cp, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <span className="text-green-400 text-xs mt-0.5">✓</span>
                                        <span className="text-xs text-gray-300">{cp}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Text className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Common Faults</Text>
                            <div className="bg-red-500/5 rounded-xl p-3 border border-red-500/10 space-y-2">
                                {currentPosition.coaching
                                    .filter(c => c.severity === 'WARNING' || c.severity === 'CRITICAL')
                                    .map((c, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="text-red-400 text-xs mt-0.5">!</span>
                                            <span className="text-xs text-gray-300">{c.title}: {c.description.substring(0, 100)}...</span>
                                        </div>
                                    ))
                                }
                                {currentPosition.coaching.filter(c => c.severity === 'WARNING' || c.severity === 'CRITICAL').length === 0 && (
                                    <span className="text-xs text-green-400">No major faults detected at this position</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Angles at {posDef.id}</Text>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(posDef.idealAngles).map(([name, range]) => {
                                    const measured = currentPosition.angles.find(a => a.name === name);
                                    const inRange = measured ? measured.value >= range[0] && measured.value <= range[1] : true;
                                    return (
                                        <div key={name} className={`rounded-xl p-2.5 border ${inRange ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                                            <span className="text-[10px] font-bold text-white block">{name}</span>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className={`text-sm font-black ${inRange ? 'text-green-400' : 'text-red-400'}`}>
                                                    {measured ? `${measured.value}°` : '-'}
                                                </span>
                                                <span className="text-[9px] text-gray-500">{range[0]}-{range[1]}°</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

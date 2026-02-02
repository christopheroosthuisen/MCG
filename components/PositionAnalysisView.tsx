/**
 * PositionAnalysisView.tsx
 *
 * Detailed P1-P10 position analysis view with:
 * - Position-by-position carousel/grid
 * - Skeleton overlay on each frame
 * - Angle measurements with visual indicators
 * - AI coaching feedback per position
 * - Grade display and comparison to ideal
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { COLORS } from '../constants';
import { Text, Badge, Card } from './UIComponents';
import {
    DetectedPosition,
    SwingPositionId,
    SkeletonJointData,
    MeasuredAngle,
    PositionCoachingFeedback,
} from '../types';
import { SWING_POSITIONS, drawSkeleton, drawAngleMeasurement, SKELETON_CONNECTIONS } from '../services/swingAnalysisService';

// Icons
const Icons = {
    ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>,
    ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>,
    Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
    EyeOff: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>,
    Info: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
};

// Grade colors
const GRADE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'A': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/40' },
    'B': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/40' },
    'C': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40' },
    'D': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40' },
    'F': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40' },
};

const SEVERITY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
    'INFO': { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: '💡' },
    'TIP': { bg: 'bg-green-500/10', text: 'text-green-400', icon: '✅' },
    'WARNING': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: '⚠️' },
    'CRITICAL': { bg: 'bg-red-500/10', text: 'text-red-400', icon: '🚨' },
};

const STATUS_COLORS: Record<string, string> = {
    'EXCELLENT': '#22C55E',
    'GOOD': '#3B82F6',
    'NEEDS_WORK': '#F59E0B',
    'CRITICAL': '#EF4444',
};

// --- Skeleton Canvas Overlay ---
const SkeletonOverlay: React.FC<{
    joints: SkeletonJointData[];
    angles: MeasuredAngle[];
    width: number;
    height: number;
    showSkeleton: boolean;
    showAngles: boolean;
    showLabels: boolean;
}> = ({ joints, angles, width, height, showSkeleton, showAngles, showLabels }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);

        if (showSkeleton && joints.length > 0) {
            drawSkeleton(ctx, joints, width, height, {
                jointRadius: 4,
                lineWidth: 2.5,
                showJointLabels: showLabels,
                opacity: 0.9,
                highlightClub: true,
            });
        }

        if (showAngles && angles.length > 0) {
            angles.forEach(angle => {
                const jointA = joints.find(j => j.joint === angle.jointA);
                const jointB = joints.find(j => j.joint === angle.jointB);
                const jointC = joints.find(j => j.joint === angle.jointC);
                if (jointA && jointB && jointC) {
                    drawAngleMeasurement(ctx, jointA, jointB, jointC, angle.value, width, height, angle.status, angle.name);
                }
            });
        }
    }, [joints, angles, width, height, showSkeleton, showAngles, showLabels]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ width, height }}
        />
    );
};

// --- Position Card (for carousel/grid) ---
const PositionCard: React.FC<{
    position: DetectedPosition;
    isActive: boolean;
    onClick: () => void;
}> = ({ position, isActive, onClick }) => {
    const gradeStyle = GRADE_COLORS[position.overallGrade] || GRADE_COLORS['C'];
    const posDef = SWING_POSITIONS.find(p => p.id === position.positionId);

    return (
        <button
            onClick={onClick}
            className={`flex-shrink-0 w-16 h-20 rounded-xl border-2 transition-all duration-200 overflow-hidden relative ${
                isActive
                    ? 'border-orange-500 scale-105 shadow-lg shadow-orange-500/20'
                    : 'border-gray-700 hover:border-gray-500'
            }`}
        >
            <img
                src={position.screenshotDataUrl}
                alt={position.positionId}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-1 text-center">
                <span className="text-[10px] font-black text-white block">{position.positionId}</span>
            </div>
            <div className={`absolute top-1 right-1 w-4 h-4 rounded-full ${gradeStyle.bg} ${gradeStyle.border} border flex items-center justify-center`}>
                <span className={`text-[8px] font-black ${gradeStyle.text}`}>{position.overallGrade}</span>
            </div>
        </button>
    );
};

// --- Angle Badge ---
const AngleBadge: React.FC<{ angle: MeasuredAngle }> = ({ angle }) => {
    const color = STATUS_COLORS[angle.status] || '#6B7280';
    const diff = angle.value - angle.idealValue;
    const diffText = diff > 0 ? `+${diff.toFixed(1)}°` : `${diff.toFixed(1)}°`;

    return (
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{angle.name}</span>
                <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${color}20`, color }}
                >
                    {angle.status.replace('_', ' ')}
                </span>
            </div>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-white tabular-nums">{angle.value.toFixed(0)}°</span>
                <div className="flex flex-col mb-1">
                    <span className="text-[10px] text-gray-500">Ideal: {angle.idealValue}°</span>
                    <span className="text-[10px] font-bold" style={{ color }}>{diffText}</span>
                </div>
            </div>
            {/* Mini visual bar */}
            <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden relative">
                {/* Ideal range */}
                <div
                    className="absolute top-0 bottom-0 bg-white/10 rounded-full"
                    style={{
                        left: `${((angle.idealMin - (angle.idealMin - 20)) / 40) * 100}%`,
                        width: `${((angle.idealMax - angle.idealMin) / 40) * 100}%`
                    }}
                />
                {/* Measured value */}
                <div
                    className="absolute top-0 bottom-0 w-1.5 rounded-full"
                    style={{
                        left: `${Math.min(95, Math.max(5, ((angle.value - (angle.idealMin - 20)) / 40) * 100))}%`,
                        backgroundColor: color
                    }}
                />
            </div>
        </div>
    );
};

// --- Coaching Feedback Item ---
const CoachingFeedbackItem: React.FC<{ feedback: PositionCoachingFeedback }> = ({ feedback }) => {
    const [expanded, setExpanded] = useState(false);
    const style = SEVERITY_STYLES[feedback.severity] || SEVERITY_STYLES['INFO'];

    return (
        <div
            className={`${style.bg} rounded-xl border border-white/5 overflow-hidden transition-all duration-200 cursor-pointer`}
            onClick={() => setExpanded(!expanded)}
        >
            <div className="p-3 flex items-start gap-3">
                <span className="text-lg mt-0.5">{style.icon}</span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-bold ${style.text}`}>{feedback.title}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{feedback.category}</span>
                    {expanded && (
                        <div className="mt-2 space-y-2 animate-in slide-in-from-top duration-200">
                            <p className="text-xs text-gray-300 leading-relaxed">{feedback.description}</p>
                            <div className="bg-white/5 rounded-lg p-2.5">
                                <span className="text-[10px] font-bold text-green-400 uppercase block mb-1">Correction</span>
                                <p className="text-xs text-gray-300 leading-relaxed">{feedback.correction}</p>
                            </div>
                            {feedback.proReference && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-500">Reference:</span>
                                    <span className="text-[10px] font-bold text-orange-400">{feedback.proReference}</span>
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
    );
};

// --- MAIN COMPONENT ---
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
    const [activePositionId, setActivePositionId] = useState<SwingPositionId>(
        initialPositionId || positions[0]?.positionId || 'P1'
    );
    const [showSkeleton, setShowSkeleton] = useState(true);
    const [showAngles, setShowAngles] = useState(true);
    const [showLabels, setShowLabels] = useState(false);
    const [activeTab, setActiveTab] = useState<'ANGLES' | 'COACHING' | 'CHECKPOINTS'>('COACHING');
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const [imageDims, setImageDims] = useState({ width: 0, height: 0 });

    const activePosition = positions.find(p => p.positionId === activePositionId);
    const positionDef = SWING_POSITIONS.find(p => p.id === activePositionId);
    const currentIndex = positions.findIndex(p => p.positionId === activePositionId);

    useEffect(() => {
        const updateDims = () => {
            if (imageContainerRef.current) {
                setImageDims({
                    width: imageContainerRef.current.offsetWidth,
                    height: imageContainerRef.current.offsetHeight,
                });
            }
        };
        updateDims();
        window.addEventListener('resize', updateDims);
        return () => window.removeEventListener('resize', updateDims);
    }, []);

    const navigatePosition = (direction: -1 | 1) => {
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < positions.length) {
            const newId = positions[newIndex].positionId;
            setActivePositionId(newId);
            onPositionChange?.(newId);
        }
    };

    const gradeStyle = GRADE_COLORS[activePosition?.overallGrade || 'C'];

    // Count feedback by severity
    const feedbackCounts = {
        critical: activePosition?.coaching.filter(c => c.severity === 'CRITICAL').length || 0,
        warning: activePosition?.coaching.filter(c => c.severity === 'WARNING').length || 0,
        tip: activePosition?.coaching.filter(c => c.severity === 'TIP').length || 0,
        info: activePosition?.coaching.filter(c => c.severity === 'INFO').length || 0,
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#0A0F1C] text-white flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-[#111827] border-b border-white/10 safe-area-top">
                <button onClick={onBack} className="p-2 text-gray-400 hover:text-white flex items-center gap-1">
                    <Icons.ChevronLeft /> Back
                </button>
                <div className="text-center">
                    <Text variant="h4" color="white" className="text-sm font-bold">
                        {activePositionId} - {positionDef?.name || ''}
                    </Text>
                    <Text className="text-[10px] text-gray-500">Position Analysis</Text>
                </div>
                <div className={`px-3 py-1 rounded-lg ${gradeStyle.bg} ${gradeStyle.border} border`}>
                    <span className={`text-lg font-black ${gradeStyle.text}`}>{activePosition?.overallGrade || '-'}</span>
                </div>
            </div>

            {/* Position Carousel */}
            <div className="bg-[#111827] px-3 py-2 border-b border-white/10">
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {positions.map(pos => (
                        <PositionCard
                            key={pos.positionId}
                            position={pos}
                            isActive={pos.positionId === activePositionId}
                            onClick={() => {
                                setActivePositionId(pos.positionId);
                                onPositionChange?.(pos.positionId);
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Frame Image with Skeleton Overlay */}
            <div className="relative bg-black flex-shrink-0" style={{ height: '35vh' }}>
                <div ref={imageContainerRef} className="w-full h-full relative">
                    {activePosition && (
                        <>
                            <img
                                src={activePosition.screenshotDataUrl}
                                alt={activePosition.positionId}
                                className="w-full h-full object-contain"
                            />
                            <SkeletonOverlay
                                joints={activePosition.skeletonData}
                                angles={activePosition.angles}
                                width={imageDims.width}
                                height={imageDims.height}
                                showSkeleton={showSkeleton}
                                showAngles={showAngles}
                                showLabels={showLabels}
                            />
                        </>
                    )}

                    {/* Navigation arrows */}
                    {currentIndex > 0 && (
                        <button
                            onClick={() => navigatePosition(-1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white z-20 hover:bg-black/70 transition-colors"
                        >
                            <Icons.ChevronLeft />
                        </button>
                    )}
                    {currentIndex < positions.length - 1 && (
                        <button
                            onClick={() => navigatePosition(1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white z-20 hover:bg-black/70 transition-colors"
                        >
                            <Icons.ChevronRight />
                        </button>
                    )}

                    {/* Overlay toggles */}
                    <div className="absolute bottom-2 left-2 flex gap-1.5 z-20">
                        <button
                            onClick={() => setShowSkeleton(!showSkeleton)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                showSkeleton ? 'bg-orange-500/80 text-white' : 'bg-black/50 text-gray-400'
                            }`}
                        >
                            🦴 Skeleton
                        </button>
                        <button
                            onClick={() => setShowAngles(!showAngles)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                showAngles ? 'bg-blue-500/80 text-white' : 'bg-black/50 text-gray-400'
                            }`}
                        >
                            📐 Angles
                        </button>
                        <button
                            onClick={() => setShowLabels(!showLabels)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                showLabels ? 'bg-purple-500/80 text-white' : 'bg-black/50 text-gray-400'
                            }`}
                        >
                            🏷 Labels
                        </button>
                    </div>

                    {/* Confidence badge */}
                    {activePosition && (
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg z-20">
                            <span className="text-[10px] text-gray-400">Confidence: </span>
                            <span className="text-[10px] font-bold text-white">{Math.round(activePosition.confidence * 100)}%</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Tabs */}
            <div className="flex border-b border-white/10 bg-[#111827]">
                {(['COACHING', 'ANGLES', 'CHECKPOINTS'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                            activeTab === tab
                                ? 'border-orange-500 text-white'
                                : 'border-transparent text-gray-500'
                        }`}
                    >
                        {tab === 'COACHING' && `Coaching (${activePosition?.coaching.length || 0})`}
                        {tab === 'ANGLES' && `Angles (${activePosition?.angles.length || 0})`}
                        {tab === 'CHECKPOINTS' && 'Checkpoints'}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 safe-area-bottom">
                {activeTab === 'COACHING' && activePosition && (
                    <>
                        {/* Severity summary */}
                        <div className="flex gap-2 mb-2">
                            {feedbackCounts.critical > 0 && (
                                <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                                    🚨 {feedbackCounts.critical} Critical
                                </span>
                            )}
                            {feedbackCounts.warning > 0 && (
                                <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                                    ⚠️ {feedbackCounts.warning} Warning
                                </span>
                            )}
                            {feedbackCounts.tip > 0 && (
                                <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                    ✅ {feedbackCounts.tip} Tips
                                </span>
                            )}
                        </div>
                        {activePosition.coaching.map(feedback => (
                            <CoachingFeedbackItem key={feedback.id} feedback={feedback} />
                        ))}
                        {activePosition.coaching.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <span className="text-3xl block mb-2">👍</span>
                                <span className="text-sm">No issues detected at this position</span>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'ANGLES' && activePosition && (
                    <div className="grid grid-cols-2 gap-3">
                        {activePosition.angles.map((angle, idx) => (
                            <AngleBadge key={idx} angle={angle} />
                        ))}
                        {activePosition.angles.length === 0 && (
                            <div className="col-span-2 text-center py-8 text-gray-500">
                                <span className="text-3xl block mb-2">📐</span>
                                <span className="text-sm">No angle measurements available</span>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'CHECKPOINTS' && positionDef && (
                    <div className="space-y-2">
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-3">
                            <Text className="text-xs text-gray-300 leading-relaxed">{positionDef.description}</Text>
                        </div>
                        {positionDef.checkpoints.map((checkpoint, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/5"
                            >
                                <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-[10px] font-bold text-orange-400">{idx + 1}</span>
                                </div>
                                <Text className="text-xs text-gray-300">{checkpoint}</Text>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

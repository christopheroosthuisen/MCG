/**
 * SwingAnalysisPipeline.tsx
 *
 * Enhanced 8-stage animated processing UI with:
 * - Video thumbnail preview during processing
 * - Elapsed time and estimated remaining time
 * - Stage-by-stage detail descriptions and tips
 * - P1-P10 detection grid with fill animation
 * - Smooth spring-like progress ring animation
 * - Cancel confirmation dialog
 * - Stage completion celebration pulses
 */

import React, { useState, useEffect, useRef } from 'react';
import { COLORS } from '../constants';
import { Text, Button, Badge, ProgressBar } from './UIComponents';
import {
    FullSwingAnalysis,
    SwingPositionId,
    AnalysisPipelineStage,
    AnalysisPipelineState,
} from '../types';
import { generateMockAnalysis, SWING_POSITIONS } from '../services/swingAnalysisService';

// Icons
const Icons = {
    X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    Zap: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
};

const ALL_STAGES: { stage: AnalysisPipelineStage; label: string; icon: string; description: string; tip: string }[] = [
    { stage: 'UPLOADING', label: 'Uploading', icon: '📤', description: 'Preparing video for analysis', tip: 'Ensure the full swing is visible in frame' },
    { stage: 'TRIMMING', label: 'Smart Trim', icon: '✂️', description: 'Detecting swing start and finish boundaries', tip: 'AI isolates the swing from setup to follow-through' },
    { stage: 'DETECTING_POSITIONS', label: 'Position Detection', icon: '📍', description: 'Identifying P1-P10 key positions', tip: 'Each position maps to a specific point in the swing sequence' },
    { stage: 'EXTRACTING_FRAMES', label: 'Frame Extraction', icon: '🖼️', description: 'Extracting high-res frames at each position', tip: 'Frames are extracted at the precise moment of each P-position' },
    { stage: 'ANALYZING_POSE', label: 'Pose Analysis', icon: '🦴', description: 'Mapping skeletal joints and body positions', tip: '21 joint points including club grip, shaft, and head' },
    { stage: 'MEASURING_ANGLES', label: 'Angle Measurement', icon: '📐', description: 'Calculating joint angles at each position', tip: 'Angles compared against tour professional ideal ranges' },
    { stage: 'GENERATING_FEEDBACK', label: 'AI Coaching', icon: '🧠', description: 'Generating personalized coaching feedback', tip: 'AI analyzes patterns across all 10 positions holistically' },
    { stage: 'COMPILING_REPORT', label: 'Final Report', icon: '📊', description: 'Compiling comprehensive analysis report', tip: 'Includes score, grades, drills, and practice plan' },
];

const STAGE_DURATIONS: Record<AnalysisPipelineStage, number> = {
    UPLOADING: 3,
    TRIMMING: 4,
    DETECTING_POSITIONS: 8,
    EXTRACTING_FRAMES: 5,
    ANALYZING_POSE: 6,
    MEASURING_ANGLES: 4,
    GENERATING_FEEDBACK: 7,
    COMPILING_REPORT: 3,
};

const TOTAL_ESTIMATED = Object.values(STAGE_DURATIONS).reduce((a, b) => a + b, 0);

// --- Progress Ring with spring animation ---
const ProgressRing: React.FC<{ progress: number; size?: number }> = ({ progress, size = 160 }) => {
    const [displayProgress, setDisplayProgress] = useState(0);
    const animRef = useRef<number>();

    useEffect(() => {
        const animate = () => {
            setDisplayProgress(prev => {
                const diff = progress - prev;
                if (Math.abs(diff) < 0.3) return progress;
                return prev + diff * 0.08;
            });
            animRef.current = requestAnimationFrame(animate);
        };
        animRef.current = requestAnimationFrame(animate);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [progress]);

    const radius = (size / 2) - 10;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayProgress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1F2937" strokeWidth="6" />
                <circle cx={size / 2} cy={size / 2} r={radius - 8} fill="none" stroke="#111827" strokeWidth="1" opacity="0.3" />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke={`url(#progressGrad-${size})`}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-none"
                />
                <defs>
                    <linearGradient id={`progressGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF8200" />
                        <stop offset="100%" stopColor="#FF6000" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white tabular-nums">{Math.round(displayProgress)}%</span>
            </div>
        </div>
    );
};

// --- Position Detection Grid ---
const PositionGrid: React.FC<{
    detectedPositions: SwingPositionId[];
    currentlyDetecting: boolean;
}> = ({ detectedPositions, currentlyDetecting }) => {
    const positions: SwingPositionId[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'];

    return (
        <div className="grid grid-cols-5 gap-2">
            {positions.map((pos, idx) => {
                const isDetected = detectedPositions.includes(pos);
                const isNext = !isDetected && detectedPositions.length === idx && currentlyDetecting;
                const posDef = SWING_POSITIONS[idx];

                return (
                    <div
                        key={pos}
                        className={`rounded-xl p-2 text-center transition-all duration-500 border ${
                            isDetected
                                ? 'bg-orange-500/20 border-orange-500/50 scale-100'
                                : isNext
                                ? 'bg-yellow-500/10 border-yellow-500/30 animate-pulse'
                                : 'bg-white/5 border-white/10 opacity-40'
                        }`}
                    >
                        <div className="flex items-center justify-center mb-1">
                            {isDetected ? (
                                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center animate-in zoom-in duration-300">
                                    <Icons.Check />
                                </div>
                            ) : isNext ? (
                                <div className="w-5 h-5 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
                            ) : (
                                <div className="w-5 h-5 rounded-full border border-gray-600" />
                            )}
                        </div>
                        <span className={`text-[10px] font-black block ${isDetected ? 'text-orange-400' : 'text-gray-500'}`}>{pos}</span>
                        <span className="text-[7px] text-gray-600 block leading-tight">{posDef?.name || ''}</span>
                    </div>
                );
            })}
        </div>
    );
};

// --- MAIN PIPELINE COMPONENT ---
export interface SwingAnalysisPipelineProps {
    videoUrl: string;
    thumbnailUrl: string;
    clubUsed: string;
    cameraAngle: string;
    onComplete: (analysis: FullSwingAnalysis) => void;
    onCancel: () => void;
    useMockData?: boolean;
}

export const SwingAnalysisPipeline: React.FC<SwingAnalysisPipelineProps> = ({
    videoUrl,
    thumbnailUrl,
    clubUsed,
    cameraAngle,
    onComplete,
    onCancel,
    useMockData = true,
}) => {
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [stageProgress, setStageProgress] = useState(0);
    const [detectedPositions, setDetectedPositions] = useState<SwingPositionId[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [stageCompletedFlash, setStageCompletedFlash] = useState(false);
    const timerRef = useRef<NodeJS.Timeout>();
    const startTimeRef = useRef(Date.now());

    const currentStage = ALL_STAGES[currentStageIndex];
    const overallProgress = ((currentStageIndex / ALL_STAGES.length) * 100) + (stageProgress / ALL_STAGES.length);

    // Elapsed timer
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Estimated remaining
    const elapsedStageSeconds = ALL_STAGES.slice(0, currentStageIndex).reduce((s, _, i) => s + STAGE_DURATIONS[ALL_STAGES[i].stage], 0);
    const estimatedRemaining = Math.max(0, TOTAL_ESTIMATED - elapsedStageSeconds - Math.floor(stageProgress / 100 * STAGE_DURATIONS[currentStage.stage]));

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // Simulate pipeline
    useEffect(() => {
        if (isComplete) return;

        const stageDuration = STAGE_DURATIONS[currentStage.stage] * 1000;
        const interval = stageDuration / 20;
        let progress = 0;

        let posIdx = 0;
        const posTimer = currentStage.stage === 'DETECTING_POSITIONS' ? setInterval(() => {
            const allPos: SwingPositionId[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'];
            if (posIdx < allPos.length) {
                setDetectedPositions(prev => [...prev, allPos[posIdx]]);
                posIdx++;
            }
        }, stageDuration / 11) : null;

        timerRef.current = setInterval(() => {
            progress += 5;
            setStageProgress(Math.min(progress, 100));

            if (progress >= 100) {
                clearInterval(timerRef.current!);
                if (posTimer) clearInterval(posTimer);

                setStageCompletedFlash(true);
                setTimeout(() => setStageCompletedFlash(false), 400);

                if (currentStageIndex < ALL_STAGES.length - 1) {
                    setTimeout(() => {
                        setCurrentStageIndex(prev => prev + 1);
                        setStageProgress(0);
                    }, 600);
                } else {
                    setIsComplete(true);
                    if (useMockData) {
                        const analysis = generateMockAnalysis(videoUrl, thumbnailUrl);
                        analysis.clubUsed = clubUsed;
                        analysis.cameraAngle = cameraAngle as any;
                        setTimeout(() => onComplete(analysis), 1200);
                    }
                }
            }
        }, interval);

        return () => {
            clearInterval(timerRef.current!);
            if (posTimer) clearInterval(posTimer);
        };
    }, [currentStageIndex, isComplete]);

    const handleCancel = () => {
        if (showCancelConfirm) {
            clearInterval(timerRef.current!);
            onCancel();
        } else {
            setShowCancelConfirm(true);
            setTimeout(() => setShowCancelConfirm(false), 3000);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 bg-[#0A0F1C] text-white flex flex-col animate-in fade-in duration-500 ${stageCompletedFlash ? 'bg-orange-500/5' : ''} transition-colors duration-300`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 safe-area-top">
                <button
                    onClick={handleCancel}
                    className={`p-2 rounded-lg transition-all ${showCancelConfirm ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    {showCancelConfirm ? (
                        <span className="text-xs font-bold px-1">Confirm Cancel?</span>
                    ) : (
                        <Icons.X />
                    )}
                </button>
                <div className="text-center">
                    <Text variant="h4" color="white" className="text-sm font-bold">AI Analysis</Text>
                    <div className="flex items-center gap-2 justify-center mt-0.5">
                        <span className="text-[10px] text-gray-500">{clubUsed}</span>
                        <span className="text-[10px] text-gray-600">|</span>
                        <span className="text-[10px] text-gray-500">{cameraAngle.replace('_', ' ')}</span>
                    </div>
                </div>
                <div className="w-20 text-right">
                    <div className="flex items-center gap-1 justify-end text-gray-500">
                        <Icons.Clock />
                        <span className="text-[10px] font-mono tabular-nums">{formatTime(elapsedTime)}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 py-4 space-y-6">
                {/* Video Preview Thumbnail */}
                {thumbnailUrl && (
                    <div className="w-28 h-20 rounded-xl overflow-hidden border border-white/10 shadow-lg relative">
                        <img src={thumbnailUrl} alt="Swing preview" className="w-full h-full object-cover opacity-70" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-1 left-1 right-1 text-center">
                            <span className="text-[8px] text-white/70 font-bold">Source Video</span>
                        </div>
                    </div>
                )}

                {/* Progress Ring */}
                <div className="relative">
                    <ProgressRing progress={isComplete ? 100 : overallProgress} size={160} />
                    {isComplete && (
                        <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-500">
                            <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                        </div>
                    )}
                </div>

                {/* Estimated Remaining */}
                {!isComplete && (
                    <div className="text-center">
                        <span className="text-[10px] text-gray-500">Est. remaining: </span>
                        <span className="text-[10px] text-orange-400 font-bold tabular-nums">{formatTime(estimatedRemaining)}</span>
                    </div>
                )}

                {/* Current Stage Info */}
                {!isComplete && (
                    <div className="text-center w-full max-w-xs animate-in fade-in duration-300" key={currentStageIndex}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-2xl">{currentStage.icon}</span>
                            <Text variant="h3" color="white" className="text-base">{currentStage.label}</Text>
                        </div>
                        <Text className="text-xs text-gray-400 mb-2">{currentStage.description}</Text>
                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                            <div className="flex items-center gap-1.5 justify-center">
                                <Icons.Zap />
                                <span className="text-[10px] text-gray-500 italic">{currentStage.tip}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Complete Message */}
                {isComplete && (
                    <div className="text-center animate-in fade-in slide-in-from-bottom duration-500">
                        <Text variant="h2" color="white" className="mb-2">Analysis Complete</Text>
                        <Text className="text-sm text-gray-400">Your comprehensive swing report is ready</Text>
                    </div>
                )}

                {/* Stage Progress Bar */}
                {!isComplete && (
                    <div className="w-full max-w-xs">
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-200 ease-out"
                                style={{ width: `${stageProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Stage Timeline */}
                <div className="w-full max-w-xs space-y-1.5">
                    {ALL_STAGES.map((stageInfo, idx) => {
                        const isActive = idx === currentStageIndex && !isComplete;
                        const isDone = idx < currentStageIndex || isComplete;

                        return (
                            <div
                                key={stageInfo.stage}
                                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                                    isActive
                                        ? 'bg-orange-500/10 border border-orange-500/30'
                                        : isDone
                                        ? 'bg-green-500/5 border border-green-500/10'
                                        : 'opacity-30'
                                }`}
                            >
                                <div className="flex-shrink-0">
                                    {isDone ? (
                                        <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center">
                                            <Icons.Check />
                                        </div>
                                    ) : isActive ? (
                                        <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full border border-gray-700 flex items-center justify-center">
                                            <span className="text-[8px] text-gray-600">{idx + 1}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className={`text-[11px] font-bold ${isActive ? 'text-white' : isDone ? 'text-green-400' : 'text-gray-500'}`}>
                                        {stageInfo.icon} {stageInfo.label}
                                    </span>
                                </div>
                                {isActive && (
                                    <span className="text-[9px] text-orange-400 font-mono tabular-nums flex-shrink-0">{Math.round(stageProgress)}%</span>
                                )}
                                {isDone && (
                                    <span className="text-[9px] text-green-500 font-bold flex-shrink-0">Done</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* P1-P10 Detection Grid */}
                {(currentStageIndex >= 2 || detectedPositions.length > 0) && (
                    <div className="w-full max-w-xs">
                        <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">
                            Position Detection ({detectedPositions.length}/10)
                        </Text>
                        <PositionGrid
                            detectedPositions={detectedPositions}
                            currentlyDetecting={currentStage.stage === 'DETECTING_POSITIONS'}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

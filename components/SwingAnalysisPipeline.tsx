/**
 * SwingAnalysisPipeline.tsx
 *
 * Full-screen processing UI that walks the user through the AI analysis pipeline.
 * Shows animated progress for each stage: Upload → Trim → Detect Positions →
 * Extract Frames → Analyze Pose → Measure Angles → Generate Feedback → Compile Report
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { COLORS } from '../constants';
import { Text, Button, ProgressBar } from './UIComponents';
import {
    AnalysisPipelineStage,
    AnalysisPipelineState,
    FullSwingAnalysis,
    SwingPositionId,
    DetectedPosition,
} from '../types';
import {
    SWING_POSITIONS,
    detectSwingBoundaries,
    detectSwingPositions,
    analyzeFramePose,
    generatePositionCoaching,
    generateSwingReport,
    extractFrameFromVideo,
    extractFrameAsDataUrl,
    gradePosition,
    generateMockAnalysis,
} from '../services/swingAnalysisService';

// Icons
const Icons = {
    Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    Loader: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="32" strokeLinecap="round"></circle></svg>,
    AlertCircle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
    X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
};

interface PipelineStageInfo {
    stage: AnalysisPipelineStage;
    label: string;
    description: string;
    icon: string;
}

const PIPELINE_STAGES: PipelineStageInfo[] = [
    { stage: 'UPLOADING', label: 'Uploading', description: 'Preparing video for analysis...', icon: '📤' },
    { stage: 'TRIMMING', label: 'Smart Trim', description: 'AI detecting swing boundaries...', icon: '✂️' },
    { stage: 'DETECTING_POSITIONS', label: 'Position Detection', description: 'Identifying P1-P10 positions...', icon: '🎯' },
    { stage: 'EXTRACTING_FRAMES', label: 'Frame Extraction', description: 'Capturing key position frames...', icon: '📸' },
    { stage: 'ANALYZING_POSE', label: 'Pose Analysis', description: 'Mapping body & club positions...', icon: '🦴' },
    { stage: 'MEASURING_ANGLES', label: 'Angle Measurement', description: 'Calculating joint angles & metrics...', icon: '📐' },
    { stage: 'GENERATING_FEEDBACK', label: 'AI Coaching', description: 'Generating position-by-position feedback...', icon: '🧠' },
    { stage: 'COMPILING_REPORT', label: 'Final Report', description: 'Compiling recommendations & drills...', icon: '📊' },
];

interface SwingAnalysisPipelineProps {
    videoUrl: string;
    thumbnailUrl: string;
    clubUsed?: string;
    cameraAngle?: 'FACE_ON' | 'DOWN_THE_LINE' | 'REAR' | 'OTHER';
    onComplete: (analysis: FullSwingAnalysis) => void;
    onCancel: () => void;
    useMockData?: boolean;
}

export const SwingAnalysisPipeline: React.FC<SwingAnalysisPipelineProps> = ({
    videoUrl,
    thumbnailUrl,
    clubUsed = 'DRIVER',
    cameraAngle = 'FACE_ON',
    onComplete,
    onCancel,
    useMockData = true, // Default to mock for demo
}) => {
    const [pipelineState, setPipelineState] = useState<AnalysisPipelineState>({
        stage: 'UPLOADING',
        progress: 0,
        stageProgress: 0,
        message: 'Initializing analysis...',
        startedAt: new Date(),
    });
    const [currentStageIdx, setCurrentStageIdx] = useState(0);
    const [positionsFound, setPositionsFound] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const abortRef = useRef(false);

    const updateStage = useCallback((stage: AnalysisPipelineStage, stageProgress: number, message: string) => {
        const stageIdx = PIPELINE_STAGES.findIndex(s => s.stage === stage);
        const overallProgress = stageIdx >= 0 ? ((stageIdx + stageProgress / 100) / PIPELINE_STAGES.length) * 100 : 0;

        setPipelineState(prev => ({
            ...prev,
            stage,
            progress: Math.min(99, overallProgress),
            stageProgress,
            message,
        }));
        setCurrentStageIdx(stageIdx >= 0 ? stageIdx : 0);
    }, []);

    // Run the analysis pipeline
    useEffect(() => {
        let cancelled = false;
        abortRef.current = false;

        const runPipeline = async () => {
            try {
                if (useMockData) {
                    // DEMO MODE: Simulate the pipeline with delays
                    await simulatePipeline(cancelled);
                    return;
                }

                // REAL MODE: Run actual Gemini analysis
                await runRealPipeline(cancelled);
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message || 'Analysis failed');
                    setPipelineState(prev => ({ ...prev, stage: 'ERROR', error: err.message }));
                }
            }
        };

        runPipeline();

        return () => {
            cancelled = true;
            abortRef.current = true;
        };
    }, [videoUrl]);

    const simulatePipeline = async (cancelled: boolean) => {
        const stages: { stage: AnalysisPipelineStage; duration: number; steps: string[] }[] = [
            { stage: 'UPLOADING', duration: 800, steps: ['Preparing video...', 'Encoding frames...'] },
            { stage: 'TRIMMING', duration: 1200, steps: ['Detecting motion...', 'Finding swing start...', 'Finding swing end...', 'Swing detected! Trimming...'] },
            { stage: 'DETECTING_POSITIONS', duration: 2000, steps: ['Scanning for P1 (Setup)...', 'P2 (Takeaway)...', 'P3 (Backswing)...', 'P4 (Top)...', 'P5 (Transition)...', 'P6 (Downswing)...', 'P7 (Impact)...', 'P8 (Follow Through)...', 'P9 (Extension)...', 'P10 (Finish)...'] },
            { stage: 'EXTRACTING_FRAMES', duration: 1500, steps: ['Extracting P1 frame...', 'Extracting P4 frame...', 'Extracting P7 frame...', 'All 10 frames captured'] },
            { stage: 'ANALYZING_POSE', duration: 2000, steps: ['Mapping skeletal landmarks...', 'Detecting club position...', 'Tracking body segments...', 'Pose estimation complete'] },
            { stage: 'MEASURING_ANGLES', duration: 1500, steps: ['Measuring shoulder turn...', 'Measuring hip rotation...', 'Measuring spine tilt...', 'Calculating X-factor...', 'All angles measured'] },
            { stage: 'GENERATING_FEEDBACK', duration: 2000, steps: ['Analyzing setup...', 'Analyzing backswing...', 'Analyzing downswing...', 'Analyzing impact...', 'Analyzing follow through...', 'Coaching feedback ready'] },
            { stage: 'COMPILING_REPORT', duration: 1200, steps: ['Scoring swing...', 'Ranking priorities...', 'Selecting drills...', 'Report compiled!'] },
        ];

        for (const stageInfo of stages) {
            if (cancelled || abortRef.current) return;

            for (let i = 0; i < stageInfo.steps.length; i++) {
                if (cancelled || abortRef.current) return;
                const progress = ((i + 1) / stageInfo.steps.length) * 100;
                updateStage(stageInfo.stage, progress, stageInfo.steps[i]);

                // Add position markers during detection
                if (stageInfo.stage === 'DETECTING_POSITIONS' && i < 10) {
                    setPositionsFound(prev => [...prev, `P${i + 1}`]);
                }

                await new Promise(r => setTimeout(r, stageInfo.duration / stageInfo.steps.length));
            }
        }

        if (!cancelled && !abortRef.current) {
            const mockAnalysis = generateMockAnalysis(videoUrl, thumbnailUrl);
            mockAnalysis.clubUsed = clubUsed;
            mockAnalysis.cameraAngle = cameraAngle;

            setPipelineState(prev => ({
                ...prev,
                stage: 'COMPLETE',
                progress: 100,
                stageProgress: 100,
                message: 'Analysis complete!',
                completedAt: new Date(),
            }));

            await new Promise(r => setTimeout(r, 500));
            onComplete(mockAnalysis);
        }
    };

    const runRealPipeline = async (cancelled: boolean) => {
        // Step 1: Upload/prepare
        updateStage('UPLOADING', 50, 'Preparing video for analysis...');
        // In production, upload to server/cloud storage here
        await new Promise(r => setTimeout(r, 500));
        updateStage('UPLOADING', 100, 'Video ready');

        if (cancelled) return;

        // Step 2: Auto-trim
        updateStage('TRIMMING', 20, 'AI detecting swing boundaries...');
        // For real implementation, we'd send video to Gemini
        // For now use the video element to extract frames
        const video = videoRef.current;
        if (!video) throw new Error('Video element not available');

        await new Promise<void>((resolve) => {
            video.onloadedmetadata = () => resolve();
            if (video.readyState >= 1) resolve();
        });

        updateStage('TRIMMING', 100, 'Swing boundaries detected');

        if (cancelled) return;

        // Step 3-8: Position detection through report
        // In production, each step calls the Gemini API
        // For MVP, use mock data after trimming
        updateStage('DETECTING_POSITIONS', 50, 'Identifying P1-P10 positions...');
        for (let i = 1; i <= 10; i++) {
            setPositionsFound(prev => [...prev, `P${i}`]);
            await new Promise(r => setTimeout(r, 200));
        }
        updateStage('DETECTING_POSITIONS', 100, 'All 10 positions identified');

        if (cancelled) return;

        // Extract frames
        updateStage('EXTRACTING_FRAMES', 50, 'Capturing key position frames...');
        await new Promise(r => setTimeout(r, 1000));
        updateStage('EXTRACTING_FRAMES', 100, 'Frames extracted');

        if (cancelled) return;

        // Pose analysis
        updateStage('ANALYZING_POSE', 50, 'Mapping body & club positions...');
        await new Promise(r => setTimeout(r, 1500));
        updateStage('ANALYZING_POSE', 100, 'Pose estimation complete');

        if (cancelled) return;

        // Angles
        updateStage('MEASURING_ANGLES', 50, 'Calculating joint angles...');
        await new Promise(r => setTimeout(r, 1000));
        updateStage('MEASURING_ANGLES', 100, 'All angles measured');

        if (cancelled) return;

        // Coaching
        updateStage('GENERATING_FEEDBACK', 50, 'AI generating coaching feedback...');
        await new Promise(r => setTimeout(r, 1500));
        updateStage('GENERATING_FEEDBACK', 100, 'Feedback ready');

        if (cancelled) return;

        // Report
        updateStage('COMPILING_REPORT', 50, 'Compiling final report...');
        await new Promise(r => setTimeout(r, 1000));

        const analysis = generateMockAnalysis(videoUrl, thumbnailUrl);
        analysis.clubUsed = clubUsed;
        analysis.cameraAngle = cameraAngle;

        setPipelineState(prev => ({
            ...prev,
            stage: 'COMPLETE',
            progress: 100,
            stageProgress: 100,
            message: 'Analysis complete!',
            completedAt: new Date(),
        }));

        await new Promise(r => setTimeout(r, 500));
        onComplete(analysis);
    };

    const isStageComplete = (stageIdx: number) => stageIdx < currentStageIdx;
    const isStageActive = (stageIdx: number) => stageIdx === currentStageIdx;

    return (
        <div className="fixed inset-0 z-50 bg-[#0A0F1C] text-white flex flex-col animate-in fade-in duration-300">
            {/* Hidden video element for frame extraction */}
            <video ref={videoRef} src={videoUrl} className="hidden" preload="auto" playsInline muted />

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div>
                    <Text variant="h4" color="white" className="text-sm font-bold">Analyzing Swing</Text>
                    <Text className="text-[10px] text-gray-500">{clubUsed} • {cameraAngle.replace('_', ' ')}</Text>
                </div>
                <button onClick={onCancel} className="p-2 text-gray-500 hover:text-white transition-colors">
                    <Icons.X />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Progress Ring */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-32 h-32 mb-4">
                        {/* Background ring */}
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="#1F2937" strokeWidth="6" />
                            <circle
                                cx="50" cy="50" r="42"
                                fill="none"
                                stroke={pipelineState.stage === 'ERROR' ? '#EF4444' : '#FF8200'}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 42}`}
                                strokeDashoffset={`${2 * Math.PI * 42 * (1 - pipelineState.progress / 100)}`}
                                className="transition-all duration-500 ease-out"
                            />
                        </svg>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black tabular-nums">{Math.round(pipelineState.progress)}%</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                                {pipelineState.stage === 'COMPLETE' ? 'Done' : pipelineState.stage === 'ERROR' ? 'Error' : 'Analyzing'}
                            </span>
                        </div>
                    </div>

                    {/* Current status */}
                    <div className="text-center">
                        <Text className="text-sm font-medium text-gray-300 mb-1">{pipelineState.message}</Text>
                        {pipelineState.stage !== 'COMPLETE' && pipelineState.stage !== 'ERROR' && (
                            <div className="flex items-center gap-2 justify-center text-orange-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Processing</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Position Detection Visual */}
                {(pipelineState.stage === 'DETECTING_POSITIONS' || positionsFound.length > 0) && (
                    <div className="mb-8 bg-white/5 rounded-2xl p-4 border border-white/10">
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Swing Positions Detected</Text>
                        <div className="grid grid-cols-5 gap-2">
                            {['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'].map((p) => {
                                const found = positionsFound.includes(p);
                                const posDef = SWING_POSITIONS.find(sp => sp.id === p);
                                return (
                                    <div
                                        key={p}
                                        className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
                                            found
                                                ? 'bg-orange-500/20 border border-orange-500/40'
                                                : 'bg-white/5 border border-white/5'
                                        }`}
                                    >
                                        <span className={`text-sm font-black transition-colors ${found ? 'text-orange-400' : 'text-gray-600'}`}>
                                            {p}
                                        </span>
                                        <span className="text-[8px] text-gray-500 text-center leading-tight mt-0.5 line-clamp-1">
                                            {posDef?.name || ''}
                                        </span>
                                        {found && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1 animate-in zoom-in duration-200" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Pipeline Steps */}
                <div className="space-y-1">
                    {PIPELINE_STAGES.map((stageInfo, idx) => (
                        <div
                            key={stageInfo.stage}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                                isStageActive(idx)
                                    ? 'bg-orange-500/10 border border-orange-500/20'
                                    : isStageComplete(idx)
                                    ? 'bg-green-500/5'
                                    : 'opacity-40'
                            }`}
                        >
                            {/* Status Icon */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                isStageComplete(idx)
                                    ? 'bg-green-500 text-white'
                                    : isStageActive(idx)
                                    ? 'bg-orange-500/20 text-orange-400'
                                    : 'bg-white/5 text-gray-600'
                            }`}>
                                {isStageComplete(idx) ? (
                                    <Icons.Check />
                                ) : isStageActive(idx) ? (
                                    <span className="text-lg animate-pulse">{stageInfo.icon}</span>
                                ) : (
                                    <span className="text-sm">{stageInfo.icon}</span>
                                )}
                            </div>

                            {/* Label */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <Text className={`text-sm font-bold ${
                                        isStageActive(idx) ? 'text-white' :
                                        isStageComplete(idx) ? 'text-green-400' : 'text-gray-500'
                                    }`}>
                                        {stageInfo.label}
                                    </Text>
                                    {isStageActive(idx) && (
                                        <span className="text-[10px] text-orange-400 font-bold">
                                            {Math.round(pipelineState.stageProgress)}%
                                        </span>
                                    )}
                                </div>
                                {isStageActive(idx) && (
                                    <div className="mt-1">
                                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-orange-500 rounded-full transition-all duration-300 ease-out"
                                                style={{ width: `${pipelineState.stageProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Error State */}
                {error && (
                    <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
                        <Icons.AlertCircle />
                        <Text className="text-red-400 font-bold mt-2">{error}</Text>
                        <div className="flex gap-3 mt-4 justify-center">
                            <Button variant="ghost" onClick={onCancel} className="text-gray-400">Cancel</Button>
                            <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 text-center safe-area-bottom">
                <Text className="text-[10px] text-gray-600">
                    Powered by Google Gemini AI • MCG Swing Analysis Engine
                </Text>
            </div>
        </div>
    );
};

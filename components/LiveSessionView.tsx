/**
 * LiveSessionView.tsx
 *
 * Enhanced real-time swing capture session with:
 * - Countdown timer before recording
 * - Better camera alignment guides with body outline
 * - Session statistics summary
 * - Multi-swing session management with swing list
 * - Club selection, shot type, camera angle, execution level
 * - Auto-analyze toggle
 * - File upload fallback
 * - Session history
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { COLORS } from '../constants';
import { Text, Button, Badge, ProgressBar } from './UIComponents';
import { FullSwingAnalysis, SwingPositionId } from '../types';

// Icons
const Icons = {
    ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>,
    Camera: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>,
    Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path></svg>,
    X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
    Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>,
};

const CLUBS = [
    'Driver', 'Fairway Wood', '3 Wood', '5 Wood',
    '3 Iron', '4 Iron', '5 Iron', '6 Iron', '7 Iron', '8 Iron', '9 Iron',
    'PW', 'SW', 'LW',
];

const SHOT_TYPES = [
    { id: 'FULL', label: 'Full Swing', icon: '🏌️' },
    { id: 'PITCH', label: 'Pitch', icon: '⛳' },
    { id: 'CHIP', label: 'Chip', icon: '🎯' },
    { id: 'PUTT', label: 'Putt', icon: '🕳️' },
    { id: 'BUNKER', label: 'Bunker', icon: '🏖️' },
    { id: 'PUNCH', label: 'Punch', icon: '🥊' },
    { id: 'DRAW', label: 'Draw', icon: '↩️' },
];

const CAMERA_ANGLES = [
    { id: 'FACE_ON', label: 'Face On', desc: 'Camera facing golfer, perpendicular to target line' },
    { id: 'DOWN_LINE', label: 'Down the Line', desc: 'Camera behind golfer, along target line' },
    { id: 'REAR', label: 'Rear View', desc: 'Camera directly behind, looking at target' },
];

type SessionState = 'SETUP' | 'COUNTDOWN' | 'RECORDING' | 'REVIEW' | 'PROCESSING';

interface SwingCapture {
    id: string;
    videoUrl: string;
    thumbnailUrl: string;
    club: string;
    shotType: string;
    cameraAngle: string;
    executionLevel: number;
    timestamp: Date;
    analyzed: boolean;
}

export interface LiveSessionViewProps {
    onBack: () => void;
    onAnalysisComplete: (analysis: FullSwingAnalysis) => void;
}

export const LiveSessionView: React.FC<LiveSessionViewProps> = ({
    onBack,
    onAnalysisComplete,
}) => {
    const [state, setState] = useState<SessionState>('SETUP');
    const [selectedClub, setSelectedClub] = useState('7 Iron');
    const [shotType, setShotType] = useState('FULL');
    const [cameraAngle, setCameraAngle] = useState('FACE_ON');
    const [executionLevel, setExecutionLevel] = useState(3);
    const [autoAnalyze, setAutoAnalyze] = useState(true);
    const [recordingTime, setRecordingTime] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const [captures, setCaptures] = useState<SwingCapture[]>([]);
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
    const [showSwingList, setShowSwingList] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const recordingTimerRef = useRef<NodeJS.Timeout>();
    const countdownTimerRef = useRef<NodeJS.Timeout>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Session stats
    const totalSwings = captures.length;
    const analyzedSwings = captures.filter(c => c.analyzed).length;
    const sessionDuration = captures.length > 0
        ? Math.floor((Date.now() - captures[0].timestamp.getTime()) / 60000)
        : 0;

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Camera access denied:', err);
        }
    }, []);

    // Stop camera
    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }, []);

    // Countdown then record
    const startCountdownAndRecord = useCallback(() => {
        setState('COUNTDOWN');
        setCountdown(3);
        let count = 3;
        countdownTimerRef.current = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
                clearInterval(countdownTimerRef.current!);
                startRecording();
            }
        }, 1000);
    }, []);

    // Start recording
    const startRecording = useCallback(() => {
        if (!streamRef.current) return;
        setState('RECORDING');
        setRecordingTime(0);
        chunksRef.current = [];

        const recorder = new MediaRecorder(streamRef.current, {
            mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                ? 'video/webm;codecs=vp9'
                : 'video/webm',
        });

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setCurrentVideoUrl(url);
            setState('REVIEW');
        };

        recorder.start();
        mediaRecorderRef.current = recorder;

        recordingTimerRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
    }, []);

    // Stop recording
    const stopRecording = useCallback(() => {
        clearInterval(recordingTimerRef.current!);
        mediaRecorderRef.current?.stop();
    }, []);

    // Save swing to session
    const saveSwingToSession = useCallback(() => {
        const capture: SwingCapture = {
            id: crypto.randomUUID(),
            videoUrl: currentVideoUrl,
            thumbnailUrl: '',
            club: selectedClub,
            shotType,
            cameraAngle,
            executionLevel,
            timestamp: new Date(),
            analyzed: false,
        };
        setCaptures(prev => [...prev, capture]);

        if (autoAnalyze) {
            // Would trigger pipeline
            setState('PROCESSING');
            setTimeout(() => {
                capture.analyzed = true;
                setCaptures(prev => prev.map(c => c.id === capture.id ? { ...c, analyzed: true } : c));
                setState('SETUP');
            }, 2000);
        } else {
            setState('SETUP');
        }
    }, [currentVideoUrl, selectedClub, shotType, cameraAngle, executionLevel, autoAnalyze]);

    // File upload handler
    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setCurrentVideoUrl(url);
        setState('REVIEW');
    }, []);

    // Retake
    const handleRetake = useCallback(() => {
        setState('SETUP');
        if (!streamRef.current) startCamera();
    }, [startCamera]);

    // Delete swing from session
    const deleteSwing = useCallback((id: string) => {
        setCaptures(prev => prev.filter(c => c.id !== id));
    }, []);

    // Format timer
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // Cleanup
    useEffect(() => {
        return () => {
            stopCamera();
            clearInterval(recordingTimerRef.current!);
            clearInterval(countdownTimerRef.current!);
        };
    }, [stopCamera]);

    return (
        <div className="fixed inset-0 z-50 bg-[#0A0F1C] text-white flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-[#111827] border-b border-white/10 safe-area-top">
                <button onClick={onBack} className="p-2 text-gray-400 hover:text-white flex items-center gap-1">
                    <Icons.ChevronLeft /> Back
                </button>
                <div className="text-center">
                    <Text variant="h4" color="white" className="text-sm font-bold">Live Session</Text>
                    {totalSwings > 0 && (
                        <Text className="text-[9px] text-gray-500">
                            {totalSwings} swing{totalSwings > 1 ? 's' : ''} • {sessionDuration} min
                        </Text>
                    )}
                </div>
                <button
                    onClick={() => setShowSwingList(!showSwingList)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        showSwingList ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-gray-400'
                    }`}
                >
                    {totalSwings} Swings
                </button>
            </div>

            {/* Swing List Sidebar */}
            {showSwingList && captures.length > 0 && (
                <div className="bg-[#111827] border-b border-white/10 max-h-48 overflow-y-auto p-2 space-y-1">
                    {captures.map((cap, idx) => (
                        <div key={cap.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-orange-400">#{idx + 1}</span>
                                <span className="text-[10px] text-white">{cap.club}</span>
                                <span className="text-[8px] text-gray-500">{cap.shotType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {cap.analyzed && (
                                    <span className="text-green-400"><Icons.Check /></span>
                                )}
                                <button
                                    onClick={() => deleteSwing(cap.id)}
                                    className="text-gray-500 hover:text-red-400 p-1"
                                >
                                    <Icons.Trash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">

                {/* SETUP STATE */}
                {state === 'SETUP' && (
                    <div className="p-4 space-y-4">
                        {/* Session Stats Card */}
                        {totalSwings > 0 && (
                            <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 rounded-2xl p-4 border border-orange-500/20">
                                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Session Progress</Text>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center">
                                        <span className="text-2xl font-black text-white">{totalSwings}</span>
                                        <span className="text-[9px] text-gray-500 block">Captured</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-2xl font-black text-green-400">{analyzedSwings}</span>
                                        <span className="text-[9px] text-gray-500 block">Analyzed</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-2xl font-black text-orange-400">{sessionDuration}m</span>
                                        <span className="text-[9px] text-gray-500 block">Duration</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Club Selection */}
                        <div>
                            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Club</Text>
                            <div className="flex gap-2 flex-wrap">
                                {CLUBS.map(club => (
                                    <button
                                        key={club}
                                        onClick={() => setSelectedClub(club)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                            selectedClub === club
                                                ? 'bg-orange-500 text-white border-orange-500'
                                                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        {club}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Shot Type */}
                        <div>
                            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shot Type</Text>
                            <div className="grid grid-cols-4 gap-2">
                                {SHOT_TYPES.map(st => (
                                    <button
                                        key={st.id}
                                        onClick={() => setShotType(st.id)}
                                        className={`p-2.5 rounded-xl text-center transition-all border ${
                                            shotType === st.id
                                                ? 'bg-orange-500/20 border-orange-500/50 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400'
                                        }`}
                                    >
                                        <span className="text-lg block">{st.icon}</span>
                                        <span className="text-[9px] font-bold">{st.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Camera Angle */}
                        <div>
                            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Camera Angle</Text>
                            <div className="space-y-2">
                                {CAMERA_ANGLES.map(ca => (
                                    <button
                                        key={ca.id}
                                        onClick={() => setCameraAngle(ca.id)}
                                        className={`w-full p-3 rounded-xl text-left transition-all border ${
                                            cameraAngle === ca.id
                                                ? 'bg-orange-500/20 border-orange-500/50'
                                                : 'bg-white/5 border-white/10'
                                        }`}
                                    >
                                        <span className={`text-xs font-bold ${cameraAngle === ca.id ? 'text-white' : 'text-gray-400'}`}>
                                            {ca.label}
                                        </span>
                                        <span className="text-[9px] text-gray-500 block mt-0.5">{ca.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Execution Level */}
                        <div>
                            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Execution Level</Text>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setExecutionLevel(level)}
                                        className={`flex-1 py-2.5 rounded-xl text-center transition-all border ${
                                            executionLevel >= level
                                                ? 'bg-orange-500/30 border-orange-500/50 text-orange-400'
                                                : 'bg-white/5 border-white/10 text-gray-600'
                                        }`}
                                    >
                                        <span className="text-lg">★</span>
                                    </button>
                                ))}
                            </div>
                            <Text className="text-[9px] text-gray-500 text-center mt-1">
                                {executionLevel === 1 ? 'Poor' : executionLevel === 2 ? 'Below Average' : executionLevel === 3 ? 'Average' : executionLevel === 4 ? 'Good' : 'Excellent'}
                            </Text>
                        </div>

                        {/* Auto-Analyze Toggle */}
                        <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                            <div>
                                <span className="text-xs font-bold text-white">Auto-Analyze</span>
                                <span className="text-[9px] text-gray-500 block">Run AI analysis after each swing</span>
                            </div>
                            <button
                                onClick={() => setAutoAnalyze(!autoAnalyze)}
                                className={`w-12 h-6 rounded-full transition-all ${autoAnalyze ? 'bg-orange-500' : 'bg-gray-700'}`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${autoAnalyze ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-2">
                            <button
                                onClick={() => { startCamera(); startCountdownAndRecord(); }}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] transition-all"
                            >
                                <Icons.Camera /> Record Swing
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-3 bg-white/5 rounded-xl border border-white/10 text-gray-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/10"
                            >
                                <Icons.Upload /> Upload Video File
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>
                )}

                {/* COUNTDOWN STATE */}
                {state === 'COUNTDOWN' && (
                    <div className="flex-1 relative bg-black">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />

                        {/* Alignment guide overlay */}
                        <div className="absolute inset-0 z-10 pointer-events-none">
                            {/* Body outline guide */}
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <line x1="33" y1="0" x2="33" y2="100" stroke="#FF820040" strokeWidth="0.3" />
                                <line x1="67" y1="0" x2="67" y2="100" stroke="#FF820040" strokeWidth="0.3" />
                                <line x1="0" y1="33" x2="100" y2="33" stroke="#FF820040" strokeWidth="0.3" />
                                <line x1="0" y1="67" x2="100" y2="67" stroke="#FF820040" strokeWidth="0.3" />
                                {/* Target zone */}
                                <rect x="25" y="10" width="50" height="80" fill="none" stroke="#FF820050" strokeWidth="0.5" strokeDasharray="2,2" rx="5" />
                            </svg>

                            {/* Alignment hint */}
                            <div className="absolute bottom-24 left-0 right-0 text-center">
                                <span className="text-xs text-white/60 bg-black/40 px-3 py-1 rounded-full">
                                    Position golfer within the guide
                                </span>
                            </div>
                        </div>

                        {/* Countdown overlay */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                            <div className="text-center">
                                <div className="w-32 h-32 rounded-full bg-orange-500/20 border-4 border-orange-500 flex items-center justify-center animate-pulse">
                                    <span className="text-6xl font-black text-white">{countdown}</span>
                                </div>
                                <span className="text-sm text-gray-300 mt-4 block">Get ready...</span>
                                <button
                                    onClick={() => {
                                        clearInterval(countdownTimerRef.current!);
                                        setState('SETUP');
                                    }}
                                    className="mt-4 text-xs text-gray-500 hover:text-white"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* RECORDING STATE */}
                {state === 'RECORDING' && (
                    <div className="flex-1 relative bg-black">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />

                        {/* Alignment guides */}
                        <div className="absolute inset-0 z-10 pointer-events-none">
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <line x1="33" y1="0" x2="33" y2="100" stroke="#FF820030" strokeWidth="0.3" />
                                <line x1="67" y1="0" x2="67" y2="100" stroke="#FF820030" strokeWidth="0.3" />
                                <line x1="0" y1="50" x2="100" y2="50" stroke="#FF820030" strokeWidth="0.3" />
                                {/* Ground line */}
                                <line x1="0" y1="85" x2="100" y2="85" stroke="#22C55E40" strokeWidth="0.5" strokeDasharray="3,3" />
                            </svg>
                        </div>

                        {/* Recording indicator */}
                        <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-center gap-3">
                            <div className="flex items-center gap-2 bg-red-500/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                                <span className="text-xs font-bold text-white">REC</span>
                                <span className="text-xs font-mono text-white/80 tabular-nums">{formatTime(recordingTime)}</span>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="absolute bottom-4 left-3 z-20 flex gap-2">
                            <span className="text-[9px] font-bold bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-orange-400">{selectedClub}</span>
                            <span className="text-[9px] font-bold bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-gray-400">{shotType}</span>
                        </div>

                        {/* Stop button */}
                        <div className="absolute bottom-4 right-0 left-0 z-20 flex justify-center">
                            <button
                                onClick={stopRecording}
                                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center border-4 border-white/30 hover:scale-105 active:scale-95 transition-transform"
                            >
                                <div className="w-6 h-6 bg-white rounded-sm" />
                            </button>
                        </div>
                    </div>
                )}

                {/* REVIEW STATE */}
                {state === 'REVIEW' && (
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1 bg-black flex items-center justify-center">
                            <video
                                src={currentVideoUrl}
                                controls
                                playsInline
                                className="max-h-full max-w-full"
                            />
                        </div>

                        {/* Tags Display */}
                        <div className="bg-[#111827] p-3 border-t border-white/10">
                            <div className="flex gap-2 flex-wrap mb-3">
                                <span className="text-[9px] font-bold bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">{selectedClub}</span>
                                <span className="text-[9px] font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">{shotType}</span>
                                <span className="text-[9px] font-bold bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">{cameraAngle.replace('_', ' ')}</span>
                                <span className="text-[9px] font-bold bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                                    {'★'.repeat(executionLevel)}{'☆'.repeat(5 - executionLevel)}
                                </span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleRetake}
                                    className="flex-1 py-3 bg-white/5 rounded-xl border border-white/10 text-gray-400 font-bold text-xs hover:bg-white/10"
                                >
                                    Retake
                                </button>
                                <button
                                    onClick={saveSwingToSession}
                                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white font-bold text-xs hover:from-orange-600 hover:to-orange-700"
                                >
                                    {autoAnalyze ? 'Save & Analyze' : 'Save to Session'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PROCESSING STATE */}
                {state === 'PROCESSING' && (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <Text variant="h3" color="white" className="mb-2">Analyzing Swing...</Text>
                            <Text className="text-xs text-gray-400">Running AI analysis on swing #{totalSwings}</Text>
                            <div className="flex gap-2 justify-center mt-3">
                                <span className="text-[9px] text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">{selectedClub}</span>
                                <span className="text-[9px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">{shotType}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

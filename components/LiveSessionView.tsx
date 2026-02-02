/**
 * LiveSessionView.tsx
 *
 * Real-time swing capture and analysis view with:
 * - Camera feed for live recording
 * - Auto-detect swing and trigger analysis
 * - Club/shot type tagging
 * - Session history with quick review
 * - Coach mode for real-time feedback
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { COLORS } from '../constants';
import { Text, Button, Badge } from './UIComponents';
import { FullSwingAnalysis, LiveSession, SwingPositionId } from '../types';
import { generateMockAnalysis } from '../services/swingAnalysisService';

// Icons
const Icons = {
    Camera: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>,
    Video: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>,
    StopCircle: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><rect x="9" y="9" width="6" height="6"></rect></svg>,
    RefreshCw: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>,
    X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>,
    Zap: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
    Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
};

const CLUBS = ['DRIVER', '3-WOOD', '5-WOOD', 'HYBRID', '4-IRON', '5-IRON', '6-IRON', '7-IRON', '8-IRON', '9-IRON', 'PW', 'GW', 'SW', 'LW'];
const SHOT_TYPES = ['Full Swing', 'Three Quarter', 'Half Swing', 'Punch', 'Chip', 'Pitch', 'Flop'];
const CAMERA_ANGLES = [
    { id: 'FACE_ON', label: 'Face On', icon: '👤' },
    { id: 'DOWN_THE_LINE', label: 'Down the Line', icon: '➡️' },
    { id: 'REAR', label: 'Rear', icon: '🔙' },
] as const;

interface LiveSessionViewProps {
    onBack: () => void;
    onAnalysisComplete: (analysis: FullSwingAnalysis) => void;
}

export const LiveSessionView: React.FC<LiveSessionViewProps> = ({ onBack, onAnalysisComplete }) => {
    const [sessionState, setSessionState] = useState<'SETUP' | 'RECORDING' | 'REVIEW' | 'PROCESSING'>('SETUP');
    const [selectedClub, setSelectedClub] = useState('DRIVER');
    const [selectedShotType, setSelectedShotType] = useState('Full Swing');
    const [selectedAngle, setSelectedAngle] = useState<typeof CAMERA_ANGLES[number]['id']>('FACE_ON');
    const [autoAnalyze, setAutoAnalyze] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [capturedSwings, setCapturedSwings] = useState<FullSwingAnalysis[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [executionLevel, setExecutionLevel] = useState(3);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Camera stream setup
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: false,
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setSessionState('RECORDING');
        } catch (err) {
            console.error('Camera access denied:', err);
            // Fallback to file upload
            fileInputRef.current?.click();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const url = URL.createObjectURL(e.target.files[0]);
            setPreviewUrl(url);
            setSessionState('REVIEW');
        }
    };

    const startRecording = () => {
        const stream = videoRef.current?.srcObject as MediaStream;
        if (!stream) return;

        chunksRef.current = [];
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            setSessionState('REVIEW');
        };
        recorder.start(100);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        setRecordingTime(0);

        timerRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const processSwing = () => {
        setSessionState('PROCESSING');
        // Simulate processing
        setTimeout(() => {
            const mockAnalysis = generateMockAnalysis(
                previewUrl || '',
                previewUrl || ''
            );
            mockAnalysis.clubUsed = selectedClub;
            mockAnalysis.cameraAngle = selectedAngle;
            mockAnalysis.shotType = selectedShotType;
            mockAnalysis.executionLevel = executionLevel as 1 | 2 | 3 | 4 | 5;
            setCapturedSwings(prev => [mockAnalysis, ...prev]);
            onAnalysisComplete(mockAnalysis);
        }, 2000);
    };

    const resetCapture = () => {
        setPreviewUrl(null);
        setSessionState('RECORDING');
        setRecordingTime(0);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            const stream = videoRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(t => t.stop());
        };
    }, []);

    const formatRecordingTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // --- SETUP SCREEN ---
    if (sessionState === 'SETUP') {
        return (
            <div className="fixed inset-0 z-50 bg-[#0A0F1C] text-white flex flex-col animate-in fade-in duration-300">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <button onClick={onBack} className="p-2 text-gray-400 hover:text-white flex items-center gap-1">
                        <Icons.ChevronLeft /> Back
                    </button>
                    <Text variant="h4" color="white" className="text-sm font-bold">Live Session</Text>
                    <div className="w-16" />
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Club Selection */}
                    <div>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Club</Text>
                        <div className="flex flex-wrap gap-2">
                            {CLUBS.map(club => (
                                <button
                                    key={club}
                                    onClick={() => setSelectedClub(club)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                        selectedClub === club
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    {club}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Shot Type */}
                    <div>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Shot Type</Text>
                        <div className="flex flex-wrap gap-2">
                            {SHOT_TYPES.map(shot => (
                                <button
                                    key={shot}
                                    onClick={() => setSelectedShotType(shot)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                        selectedShotType === shot
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    {shot}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Camera Angle */}
                    <div>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Camera Angle</Text>
                        <div className="grid grid-cols-3 gap-3">
                            {CAMERA_ANGLES.map(angle => (
                                <button
                                    key={angle.id}
                                    onClick={() => setSelectedAngle(angle.id)}
                                    className={`p-4 rounded-2xl text-center transition-all border ${
                                        selectedAngle === angle.id
                                            ? 'bg-orange-500/20 border-orange-500 text-white'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    <span className="text-2xl block mb-1">{angle.icon}</span>
                                    <span className="text-[10px] font-bold">{angle.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Execution Level */}
                    <div>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Execution Level</Text>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setExecutionLevel(level)}
                                    className={`flex-1 py-3 rounded-xl text-center transition-all ${
                                        executionLevel === level
                                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                                            : 'bg-white/5 text-gray-500'
                                    }`}
                                >
                                    <span className="text-lg">{'★'.repeat(level)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Auto Analyze Toggle */}
                    <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center gap-3">
                            <Icons.Zap />
                            <div>
                                <Text className="text-sm font-bold text-white">Auto-Analyze</Text>
                                <Text className="text-[10px] text-gray-500">Automatically run AI analysis after capture</Text>
                            </div>
                        </div>
                        <button
                            onClick={() => setAutoAnalyze(!autoAnalyze)}
                            className={`w-12 h-7 rounded-full p-1 transition-colors ${autoAnalyze ? 'bg-orange-500' : 'bg-gray-700'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${autoAnalyze ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>

                    {/* Session History */}
                    {capturedSwings.length > 0 && (
                        <div>
                            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                This Session ({capturedSwings.length} swings)
                            </Text>
                            <div className="space-y-2">
                                {capturedSwings.slice(0, 5).map((swing, i) => (
                                    <button
                                        key={swing.id}
                                        onClick={() => onAnalysisComplete(swing)}
                                        className="w-full flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5 hover:bg-white/10 transition-all text-left"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                                            <img src={swing.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-xs font-bold text-white">{swing.clubUsed} - {swing.shotType}</span>
                                            <span className="text-[10px] text-gray-500 block">
                                                Score: {swing.overallScore} ({swing.overallGrade})
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-gray-500">#{capturedSwings.length - i}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Start Buttons */}
                <div className="p-4 border-t border-white/10 safe-area-bottom">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={startCamera}
                            className="bg-orange-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 active:scale-95 transition-all"
                        >
                            <Icons.Video />
                            Record
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white/10 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 active:scale-95 transition-all"
                        >
                            📁 Upload
                        </button>
                    </div>
                    <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
                </div>
            </div>
        );
    }

    // --- RECORDING SCREEN ---
    if (sessionState === 'RECORDING') {
        return (
            <div className="fixed inset-0 z-50 bg-black text-white flex flex-col">
                {/* Camera Feed */}
                <div className="flex-1 relative">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

                    {/* Overlay info */}
                    <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent safe-area-top">
                        <div className="flex justify-between items-center">
                            <button onClick={onBack} className="p-2 text-white bg-black/40 rounded-full">
                                <Icons.X />
                            </button>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold bg-black/40 px-3 py-1.5 rounded-full">{selectedClub}</span>
                                <span className="text-xs font-bold bg-black/40 px-3 py-1.5 rounded-full">{selectedAngle.replace('_', ' ')}</span>
                            </div>
                            <button className="p-2 text-white bg-black/40 rounded-full">
                                <Icons.RefreshCw />
                            </button>
                        </div>
                    </div>

                    {/* Recording indicator */}
                    {isRecording && (
                        <div className="absolute top-20 left-1/2 -translate-x-1/2">
                            <div className="flex items-center gap-2 bg-red-500/90 backdrop-blur-sm px-4 py-2 rounded-full">
                                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                                <span className="text-sm font-bold font-mono text-white">{formatRecordingTime(recordingTime)}</span>
                            </div>
                        </div>
                    )}

                    {/* Guide overlay */}
                    {!isRecording && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-48 h-72 border-2 border-dashed border-white/30 rounded-3xl flex items-center justify-center">
                                <span className="text-gray-400 text-xs text-center px-4">Position golfer within frame</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Record Controls */}
                <div className="bg-[#111827] p-6 safe-area-bottom">
                    <div className="flex items-center justify-center gap-8">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white"
                        >
                            📁
                        </button>
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                                isRecording
                                    ? 'bg-red-500 border-4 border-white shadow-lg shadow-red-500/50'
                                    : 'bg-red-500 border-4 border-white/80 hover:border-white'
                            }`}
                        >
                            {isRecording ? (
                                <div className="w-6 h-6 bg-white rounded-sm" />
                            ) : (
                                <div className="w-14 h-14 bg-red-500 rounded-full" />
                            )}
                        </button>
                        <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white">
                            <Icons.Settings />
                        </button>
                    </div>
                    <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
                </div>
            </div>
        );
    }

    // --- REVIEW SCREEN ---
    if (sessionState === 'REVIEW' && previewUrl) {
        return (
            <div className="fixed inset-0 z-50 bg-black text-white flex flex-col">
                <div className="flex-1 relative flex items-center justify-center bg-gray-900">
                    <video src={previewUrl} controls className="max-h-full max-w-full" playsInline />
                </div>
                <div className="bg-[#1F2937] p-6 border-t border-gray-700 safe-area-bottom">
                    {/* Quick tag row */}
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto hide-scrollbar">
                        <span className="text-[10px] text-gray-500 flex-shrink-0">Tags:</span>
                        <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">{selectedClub}</span>
                        <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">{selectedShotType}</span>
                        <span className="text-[10px] font-bold bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">{selectedAngle.replace('_', ' ')}</span>
                        <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">{'★'.repeat(executionLevel)}</span>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" fullWidth onClick={resetCapture} className="text-gray-300">Retake</Button>
                        <Button variant="primary" fullWidth onClick={processSwing}>
                            Analyze Swing
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- PROCESSING SCREEN ---
    if (sessionState === 'PROCESSING') {
        return (
            <div className="fixed inset-0 z-50 bg-[#0A0F1C] text-white flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6" />
                <Text variant="h3" color="white" className="mb-2">Analyzing Swing...</Text>
                <Text className="text-sm text-gray-500">AI is detecting P1-P10 positions</Text>
            </div>
        );
    }

    return null;
};

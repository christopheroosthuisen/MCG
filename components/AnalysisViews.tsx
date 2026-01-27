import React, { useRef, useState, useEffect } from 'react';
import { Button, Text, Card, Badge, ProgressBar } from './UIComponents';
import { COLORS } from '../constants';
import { AnalysisStatus, FeedbackMessage, Keyframe, PlaybackSpeed, ToolType, SwingAnalysis, SkeletonConfig } from '../types';
import { analyzeSwingFrame } from '../services/geminiService';
import { MOCK_RECENT_SWINGS } from '../constants';

// --- ICONS ---
const Icons = {
    Play: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
    Pause: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>,
    SkipBack: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>,
    SkipForward: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>,
    Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    Split: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line></svg>,
    Tag: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>,
    Maximize: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>,
    Layers: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
    Volume2: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>,
    VolumeX: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>,
    Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
    EyeOff: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
};

// --- VIDEO RECORDER (Existing) ---
// Kept largely the same, just ensured consistency in style
interface VideoRecorderProps {
    onAnalysisComplete: (result: any) => void;
    onCancel: () => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ onAnalysisComplete, onCancel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [status, setStatus] = useState<AnalysisStatus>('IDLE');
    const [recordingTime, setRecordingTime] = useState(0);
    
    // Setup Camera
    useEffect(() => {
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, 
                    audio: false 
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Camera error", err);
                setStatus('ERROR');
            }
        };

        if (status === 'IDLE') {
            startCamera();
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []); 

    useEffect(() => {
        let interval: any;
        if (status === 'RECORDING') {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    const handleRecord = () => {
        setStatus('RECORDING');
        setRecordingTime(0);
        setTimeout(() => {
            setStatus('PROCESSING');
            setTimeout(() => {
                processAnalysis();
            }, 2000);
        }, 3000);
    };

    const processAnalysis = async () => {
        setStatus('ANALYZING');
        try {
            const results = await analyzeSwingFrame("mock-data");
            setStatus('COMPLETE');
            onAnalysisComplete(results);
        } catch (e) {
            setStatus('ERROR');
        }
    };

    if (status === 'ERROR') {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-900 text-white">
                <div className="w-16 h-16 bg-red-900/50 text-red-500 rounded-full flex items-center justify-center text-2xl mb-4">!</div>
                <Text variant="h3" color="white">Camera Access Error</Text>
                <Text className="text-gray-400 mt-2">We couldn't access your camera. Please check permissions.</Text>
                <Button className="mt-8" onClick={onCancel}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-black relative">
            <div className="flex-1 relative overflow-hidden bg-gray-900">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                />
                
                {status === 'RECORDING' && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-md flex items-center gap-2 animate-pulse border border-red-400/50 backdrop-blur-sm shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span className="text-xs font-mono font-bold">00:0{recordingTime}</span>
                    </div>
                )}
                
                {status === 'IDLE' && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                         <div className="border border-white/20 w-48 h-64 rounded-xl relative opacity-50">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-500"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-500"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-500"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-500"></div>
                         </div>
                        <div className="absolute bottom-24 bg-black/60 px-4 py-2 rounded-lg backdrop-blur-md border border-white/10">
                            <Text color="white" variant="caption" className="font-bold">Align golfer in frame</Text>
                        </div>
                    </div>
                )}

                {(status === 'ANALYZING' || status === 'PROCESSING') && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20">
                         <div className="text-center w-64">
                            <div className="mb-6 relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                            </div>
                            <Text color="white" variant="h3" className="mb-2">
                                {status === 'PROCESSING' ? 'Processing...' : 'AI Analysis'}
                            </Text>
                            <Text className="text-gray-400 text-sm">
                                {status === 'PROCESSING' ? 'Preparing high-res video' : 'Identifying biomechanics'}
                            </Text>
                         </div>
                    </div>
                )}
            </div>

            {status === 'IDLE' && (
                <div className="bg-black/90 p-8 pb-12 absolute bottom-0 left-0 right-0 z-10 border-t border-white/10">
                    <div className="flex justify-between items-center max-w-sm mx-auto">
                        <button onClick={onCancel} className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <button 
                            onClick={handleRecord}
                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-95 transition-transform bg-transparent"
                        >
                            <div className="w-16 h-16 bg-red-600 rounded-full border-2 border-transparent shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                        </button>
                        <button className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- PRO VIDEO PLAYER ---
// This handles the rendering of the video, drawing layer, and configurable skeleton

interface ProVideoPlayerProps {
    src: string;
    overlay?: boolean;
    tool?: ToolType | null;
    activeColor?: string;
    playbackSpeed: PlaybackSpeed;
    isPlaying: boolean;
    onTogglePlay: () => void;
    duration: number;
    currentTime: number;
    onSeek: (t: number) => void;
    showSkeleton: boolean;
    skeletonConfig: SkeletonConfig;
    toggleSkeletonConfig: (part: keyof SkeletonConfig) => void;
    showSkeletonSettings: boolean;
    setShowSkeletonSettings: (show: boolean) => void;
    feedbackMessages: FeedbackMessage[];
}

export const ProVideoPlayer: React.FC<ProVideoPlayerProps> = ({ 
    src, overlay, tool, activeColor, playbackSpeed, isPlaying, onTogglePlay, duration, currentTime, onSeek, showSkeleton,
    skeletonConfig, toggleSkeletonConfig, showSkeletonSettings, setShowSkeletonSettings, feedbackMessages
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentFeedback, setCurrentFeedback] = useState<FeedbackMessage | null>(null);

    // Sync React state with Video Element
    useEffect(() => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.play();
            else videoRef.current.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

    // Live Feedback Engine
    useEffect(() => {
        if (!isPlaying) {
            setCurrentFeedback(null);
            return;
        }

        // Find active feedback for current time window (within 0.5s)
        const feedback = feedbackMessages.find(f => 
            currentTime >= f.timestamp && currentTime < f.timestamp + 1.5
        );

        if (feedback && feedback.id !== currentFeedback?.id) {
            setCurrentFeedback(feedback);
            
            // TTS Simulation
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(feedback.text);
                utterance.rate = 1.2;
                window.speechSynthesis.speak(utterance);
            }
        } else if (!feedback) {
            setCurrentFeedback(null);
        }
    }, [currentTime, isPlaying, feedbackMessages]);

    return (
        <div className="relative w-full h-full bg-black flex items-center justify-center group">
            {/* Video Element */}
            <video 
                ref={videoRef}
                src={src}
                className="max-h-full max-w-full pointer-events-none" 
                playsInline
                onTimeUpdate={(e) => onSeek(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => {
                    // In real app, set duration state here
                }}
            />

            {/* Canvas Overlay for Annotations */}
            <canvas 
                ref={canvasRef}
                className="absolute inset-0 w-full h-full z-10 cursor-crosshair"
                // In real app: handleMouseDown, handleMouseMove, etc. to draw
            />

            {/* Dynamic Feedback Overlay */}
            {currentFeedback && (
                <div className="absolute top-12 left-0 right-0 flex justify-center z-30 pointer-events-none animate-in fade-in zoom-in duration-200">
                    <div className={`px-4 py-2 rounded-full backdrop-blur-md shadow-lg border border-white/20 text-white font-bold text-sm max-w-[80%] text-center
                        ${currentFeedback.severity === 'WARNING' ? 'bg-orange-500/80' : 'bg-blue-600/80'}
                    `}>
                        {currentFeedback.text}
                    </div>
                </div>
            )}

            {/* Configurable Skeleton Overlay */}
            {showSkeleton && (
                 <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Torso */}
                    {skeletonConfig.showTorso && (
                        <>
                            <line x1="50" y1="20" x2="50" y2="50" stroke={COLORS.success} strokeWidth="0.5" strokeDasharray="2,1" />
                            <line x1="40" y1="25" x2="60" y2="25" stroke={COLORS.primary} strokeWidth="0.5" />
                            <line x1="45" y1="50" x2="55" y2="50" stroke={COLORS.primary} strokeWidth="0.5" />
                        </>
                    )}
                    
                    {/* Legs */}
                    {skeletonConfig.showLegs && (
                        <>
                            <line x1="45" y1="50" x2="42" y2="80" stroke="white" strokeWidth="0.5" />
                            <line x1="55" y1="50" x2="58" y2="80" stroke="white" strokeWidth="0.5" />
                        </>
                    )}

                    {/* Arms (Simulated positions) */}
                    {skeletonConfig.showArms && (
                        <>
                            <line x1="40" y1="25" x2="35" y2="45" stroke="cyan" strokeWidth="0.5" />
                            <line x1="60" y1="25" x2="65" y2="45" stroke="cyan" strokeWidth="0.5" />
                        </>
                    )}

                    {/* Head */}
                    {skeletonConfig.showHead && (
                        <circle cx="50" cy="15" r="5" stroke={COLORS.warning} strokeWidth="0.5" fill="none" />
                    )}
                </svg>
            )}

            {/* Skeleton Settings Menu */}
            {showSkeletonSettings && (
                <div className="absolute top-12 right-4 bg-gray-900/95 border border-gray-700 p-3 rounded-xl z-40 backdrop-blur-md w-40 animate-in fade-in slide-in-from-top-2">
                    <Text variant="caption" className="font-bold uppercase mb-2 text-gray-400 text-[10px]">Joint Visibility</Text>
                    <div className="space-y-1">
                        {[
                            { key: 'showHead', label: 'Head' },
                            { key: 'showTorso', label: 'Torso' },
                            { key: 'showArms', label: 'Arms' },
                            { key: 'showLegs', label: 'Legs' }
                        ].map((item) => (
                            <button 
                                key={item.key}
                                onClick={() => toggleSkeletonConfig(item.key as keyof SkeletonConfig)}
                                className="flex items-center justify-between w-full p-2 rounded hover:bg-gray-800 transition-colors text-xs text-white"
                            >
                                <span>{item.label}</span>
                                {skeletonConfig[item.key as keyof SkeletonConfig] ? <Icons.Eye /> : <Icons.EyeOff />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Big Play Button Overlay */}
            {!isPlaying && (
                <div 
                    className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer bg-black/10 hover:bg-black/20"
                    onClick={onTogglePlay}
                >
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/30 shadow-lg scale-100 hover:scale-110 transition-transform">
                        <Icons.Play />
                    </div>
                </div>
            )}
        </div>
    );
};


// --- ANALYSIS RESULT ---
// The main container for the review screen

export const AnalysisToolbar: React.FC<{
    activeTool: ToolType | null;
    onSelectTool: (tool: ToolType) => void;
    activeColor: string;
    onSelectColor: (color: string) => void;
    showSkeleton: boolean;
    onToggleSkeleton: () => void;
    onToggleSkeletonSettings: () => void;
}> = ({ activeTool, onSelectTool, activeColor, onSelectColor, showSkeleton, onToggleSkeleton, onToggleSkeletonSettings }) => {
    const tools: {id: ToolType, icon: string, label: string}[] = [
        { id: 'POINTER', icon: '👆', label: 'Select' },
        { id: 'LINE', icon: '📏', label: 'Line' },
        { id: 'ANGLE', icon: '📐', label: 'Angle' },
        { id: 'CIRCLE', icon: '⭕', label: 'Circle' },
        { id: 'GRID', icon: '#️⃣', label: 'Grid' },
    ];

    const colors = ['#FF8200', '#10B981', '#EF4444', '#FFFFFF', '#3B82F6'];

    return (
        <div className="bg-[#1F2937] border-t border-gray-700 p-2">
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
                {tools.map(tool => (
                    <button 
                        key={tool.id}
                        onClick={() => onSelectTool(tool.id)}
                        className={`flex flex-col items-center justify-center min-w-[48px] h-12 rounded-lg transition-all ${
                            activeTool === tool.id 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        <span className="text-lg leading-none">{tool.icon}</span>
                    </button>
                ))}
                
                <div className="w-px h-8 bg-gray-700 mx-1"></div>

                {/* Skeleton Toggle Group */}
                <div className="flex bg-gray-800 rounded-lg p-0.5">
                    <button 
                        onClick={onToggleSkeleton}
                        className={`flex flex-col items-center justify-center w-10 h-11 rounded-l-lg transition-all ${
                            showSkeleton 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-transparent text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                         <Icons.Layers />
                    </button>
                    <button 
                        onClick={onToggleSkeletonSettings}
                        className="w-6 h-11 border-l border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-r-lg"
                    >
                        <Icons.Settings />
                    </button>
                </div>

                <div className="w-px h-8 bg-gray-700 mx-1"></div>

                {/* Color Picker */}
                <div className="flex gap-2 bg-gray-800 p-2 rounded-lg">
                    {colors.map(c => (
                        <button
                            key={c}
                            onClick={() => onSelectColor(c)}
                            className={`w-6 h-6 rounded-full border-2 ${activeColor === c ? 'border-white scale-110' : 'border-transparent opacity-70'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const TransportControls: React.FC<{
    isPlaying: boolean;
    onTogglePlay: () => void;
    speed: PlaybackSpeed;
    onSpeedChange: (s: PlaybackSpeed) => void;
    currentTime: number;
    duration: number;
    onSeek: (t: number) => void;
    audioEnabled: boolean;
    toggleAudio: () => void;
}> = ({ isPlaying, onTogglePlay, speed, onSpeedChange, currentTime, duration, onSeek, audioEnabled, toggleAudio }) => {
    
    // Format Time 00:00
    const formatTime = (t: number) => {
        const mins = Math.floor(t / 60);
        const secs = Math.floor(t % 60);
        const ms = Math.floor((t % 1) * 100);
        return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-[#111827] p-4 border-t border-gray-800">
            {/* Scrubber */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono text-gray-400 min-w-[48px]">{formatTime(currentTime)}</span>
                <div className="flex-1 relative h-6 flex items-center group">
                    <div className="absolute left-0 right-0 h-1 bg-gray-700 rounded-full"></div>
                    <div 
                        className="absolute left-0 h-1 bg-orange-500 rounded-full"
                        style={{ width: `${(currentTime / Math.max(duration, 1)) * 100}%` }}
                    ></div>
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
                        className="absolute h-4 w-4 bg-white rounded-full shadow-md pointer-events-none transition-transform group-hover:scale-125"
                        style={{ left: `${(currentTime / Math.max(duration, 1)) * 100}%`, transform: 'translateX(-50%)' }}
                    ></div>
                </div>
                <span className="text-xs font-mono text-gray-500 min-w-[48px]">{formatTime(duration)}</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between">
                {/* Speed Controls */}
                <div className="flex gap-4 items-center">
                    <button 
                        onClick={toggleAudio}
                        className={`text-gray-400 hover:text-white ${audioEnabled ? 'text-blue-400' : ''}`}
                    >
                        {audioEnabled ? <Icons.Volume2 /> : <Icons.VolumeX />}
                    </button>

                    <div className="flex bg-gray-800 rounded-lg p-1 gap-1">
                        {[0.25, 0.5, 1.0].map((s) => (
                            <button 
                                key={s}
                                onClick={() => onSpeedChange(s as PlaybackSpeed)}
                                className={`px-2 py-1 text-[10px] font-bold rounded ${speed === s ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                {s}x
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transport */}
                <div className="flex items-center gap-6">
                    <button className="text-gray-400 hover:text-white" onClick={() => onSeek(currentTime - 0.1)}>
                        <Icons.SkipBack />
                    </button>
                    <button 
                        className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                        onClick={onTogglePlay}
                    >
                        {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                    </button>
                    <button className="text-gray-400 hover:text-white" onClick={() => onSeek(currentTime + 0.1)}>
                        <Icons.SkipForward />
                    </button>
                </div>

                {/* Frame Step */}
                <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800" onClick={() => onSeek(currentTime - 0.03)}>
                        -1f
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800" onClick={() => onSeek(currentTime + 0.03)}>
                        +1f
                    </button>
                </div>
            </div>
        </div>
    );
};

// Tagging UI
export const ShotTagging: React.FC<{ activeTags: string[] }> = ({ activeTags }) => {
    const commonTags = ['Bunker', 'Flop', 'Bump & Run', 'Pitch', 'Chunk', 'Thin', 'Good Tempo', 'Early Extension'];
    
    return (
        <div className="p-4 bg-white border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <Icons.Tag />
                Shot Tags
            </div>
            <div className="flex flex-wrap gap-2">
                {commonTags.map(tag => (
                    <button 
                        key={tag}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            activeTags.includes(tag)
                                ? 'bg-orange-100 border-orange-200 text-orange-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
                <button className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-400 hover:text-gray-600">
                    + Add Tag
                </button>
            </div>
        </div>
    );
};

export const AnalysisResult: React.FC<{ analysisId: string; onBack: () => void }> = ({ analysisId, onBack }) => {
    const swing = MOCK_RECENT_SWINGS.find(s => s.id === analysisId);
    
    const [activeTool, setActiveTool] = useState<ToolType | null>(null);
    const [activeColor, setActiveColor] = useState('#FF8200');
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState<PlaybackSpeed>(1.0);
    const [currentTime, setCurrentTime] = useState(0);
    const [splitScreen, setSplitScreen] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(false);
    const [showSkeletonSettings, setShowSkeletonSettings] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);
    
    // Default skeleton showing all parts
    const [skeletonConfig, setSkeletonConfig] = useState<SkeletonConfig>({
        showArms: true,
        showLegs: true,
        showTorso: true,
        showHead: true
    });

    const toggleSkeletonConfig = (part: keyof SkeletonConfig) => {
        setSkeletonConfig(prev => ({ ...prev, [part]: !prev[part] }));
    };
    
    // Mock Duration
    const duration = 3.5;

    if (!swing) return null;

    return (
        <div className="flex flex-col h-full bg-black text-white animate-in slide-in-from-right duration-300 fixed inset-0 z-50">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 bg-[#111827] border-b border-gray-800">
                <button onClick={onBack} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                
                <div className="flex items-center gap-4 bg-gray-900 rounded-lg p-1">
                    <button 
                        onClick={() => setSplitScreen(false)}
                        className={`px-3 py-1 text-xs font-bold rounded ${!splitScreen ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                    >
                        Single
                    </button>
                    <button 
                        onClick={() => setSplitScreen(true)}
                        className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 ${splitScreen ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                    >
                        <Icons.Split /> Split
                    </button>
                </div>

                <button className="text-orange-500 font-bold text-sm">Export</button>
            </div>

            {/* Video Canvas Area */}
            <div className="flex-1 relative flex bg-black overflow-hidden">
                <div className={`relative h-full ${splitScreen ? 'w-1/2 border-r border-gray-800' : 'w-full'}`}>
                    <div className="absolute top-2 left-2 z-20 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/10">YOU</div>
                    <ProVideoPlayer 
                        src={swing.videoUrl || ""}
                        isPlaying={isPlaying}
                        onTogglePlay={() => setIsPlaying(!isPlaying)}
                        playbackSpeed={speed}
                        tool={activeTool}
                        activeColor={activeColor}
                        duration={duration}
                        currentTime={currentTime}
                        onSeek={setCurrentTime}
                        showSkeleton={showSkeleton}
                        skeletonConfig={skeletonConfig}
                        toggleSkeletonConfig={toggleSkeletonConfig}
                        showSkeletonSettings={showSkeletonSettings}
                        setShowSkeletonSettings={setShowSkeletonSettings}
                        feedbackMessages={audioEnabled ? swing.feedback : []}
                    />
                </div>
                
                {splitScreen && (
                    <div className="relative h-full w-1/2 bg-gray-900">
                         <div className="absolute top-2 left-2 z-20 bg-orange-600 px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/10">PRO: TIGER</div>
                         <div className="absolute top-2 right-2 z-20 text-gray-400 cursor-pointer hover:text-white">
                            <Icons.Settings />
                         </div>
                         <ProVideoPlayer 
                            src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" // Mock Pro Video
                            isPlaying={isPlaying} // Sync playback
                            onTogglePlay={() => setIsPlaying(!isPlaying)}
                            playbackSpeed={speed}
                            tool={null}
                            activeColor={activeColor}
                            duration={duration}
                            currentTime={currentTime} // Sync time
                            onSeek={() => {}} 
                            showSkeleton={showSkeleton}
                            skeletonConfig={skeletonConfig}
                            toggleSkeletonConfig={() => {}}
                            showSkeletonSettings={false}
                            setShowSkeletonSettings={() => {}}
                            feedbackMessages={[]}
                        />
                    </div>
                )}
            </div>

            {/* Transport & Controls */}
            <TransportControls 
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                speed={speed}
                onSpeedChange={setSpeed}
                currentTime={currentTime}
                duration={duration}
                onSeek={setCurrentTime}
                audioEnabled={audioEnabled}
                toggleAudio={() => setAudioEnabled(!audioEnabled)}
            />

            {/* Annotation Tools */}
            <AnalysisToolbar 
                activeTool={activeTool}
                onSelectTool={setActiveTool}
                activeColor={activeColor}
                onSelectColor={setActiveColor}
                showSkeleton={showSkeleton}
                onToggleSkeleton={() => {
                    setShowSkeleton(!showSkeleton);
                    if (showSkeleton) setShowSkeletonSettings(false);
                }}
                onToggleSkeletonSettings={() => setShowSkeletonSettings(!showSkeletonSettings)}
            />

            {/* Data Sheet / Tags */}
            <div className="bg-white h-[35%] overflow-y-auto text-gray-900">
                <ShotTagging activeTags={swing.tags || []} />
                
                <div className="p-4">
                    <Text variant="h4" className="mb-3">Swing Metrics</Text>
                     <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
                        <MetricCard label="Club Speed" value={swing.metrics.clubSpeed || '-'} unit="mph" />
                        <MetricCard label="Ball Speed" value={swing.metrics.ballSpeed || '-'} unit="mph" />
                        <MetricCard label="Carry" value={swing.metrics.carryDistance || '-'} unit="yds" />
                        <MetricCard label="Spin" value={swing.metrics.spinRate || '-'} unit="rpm" />
                        <MetricCard label="Launch" value={swing.metrics.launchAngle || '-'} unit="deg" />
                    </div>
                    
                    <div className="mt-4">
                         <Text variant="h4" className="mb-3">AI Coach</Text>
                          {swing.feedback.map((fb, i) => (
                                <Card key={i} variant="filled" className="bg-blue-50 border-l-4 border-blue-500 rounded-l-md mb-2">
                                    <div className="flex gap-3">
                                        <div className="pt-1">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">i</div>
                                        </div>
                                        <div>
                                            <Text className="text-sm text-gray-800">{fb.text}</Text>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MetricCard: React.FC<{
    label: string;
    value: string | number;
    unit?: string;
    trend?: 'up' | 'down' | 'neutral';
}> = ({ label, value, unit, trend }) => (
    <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center min-w-[80px]">
        <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">{label}</span>
        <div className="flex items-baseline">
            <span className="text-xl font-black text-gray-800">{value}</span>
            {unit && <span className="text-xs text-gray-500 ml-0.5">{unit}</span>}
        </div>
    </div>
);

// --- KEYFRAME MARKER (Existing but unused in new layout, keeping for compat if needed) ---
export const KeyframeMarker: React.FC<{
    keyframes: Keyframe[];
    duration: number;
    currentTime: number;
    onSeek: (time: number) => void;
}> = ({ keyframes, duration, currentTime, onSeek }) => {
    return null; 
};

// --- SKELETON OVERLAY (Exporting for compatibility, though used inside Player now) ---
export const SkeletonOverlay: React.FC = () => {
    return null;
};


import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button, Text, Card, Badge, ProgressBar } from './UIComponents';
import { COLORS } from '../constants';
import { AnalysisStatus, FeedbackMessage, Keyframe, PlaybackSpeed, ToolType, SwingAnalysis, SkeletonConfig, DrawnAnnotation, Point } from '../types';
import { analyzeSwingFrame } from '../services/geminiService';
import { db } from '../services/dataService';

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
    EyeOff: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>,
    Camera: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>,
    Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
    Filter: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>,
    Trash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
    Folder: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>,
    Cloud: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>,
    Scissors: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
};

// --- ANNOTATION LAYER ---
const AnnotationOverlay: React.FC<{
    width: number;
    height: number;
    activeTool: ToolType | null;
    annotations: DrawnAnnotation[];
    onAddAnnotation: (a: DrawnAnnotation) => void;
}> = ({ width, height, activeTool, annotations, onAddAnnotation }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPoints, setCurrentPoints] = useState<Point[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw saved annotations
        annotations.forEach(ann => {
            ctx.beginPath();
            ctx.strokeStyle = ann.color;
            ctx.lineWidth = ann.strokeWidth;
            if (ann.type === 'LINE' && ann.points.length === 2) {
                ctx.moveTo(ann.points[0].x, ann.points[0].y);
                ctx.lineTo(ann.points[1].x, ann.points[1].y);
            } else if (ann.type === 'CIRCLE' && ann.points.length === 2) {
                const r = Math.sqrt(Math.pow(ann.points[1].x - ann.points[0].x, 2) + Math.pow(ann.points[1].y - ann.points[0].y, 2));
                ctx.arc(ann.points[0].x, ann.points[0].y, r, 0, 2 * Math.PI);
            } else if (ann.type === 'FREEHAND' && ann.points.length > 1) {
                ctx.moveTo(ann.points[0].x, ann.points[0].y);
                ann.points.forEach(p => ctx.lineTo(p.x, p.y));
            }
            ctx.stroke();
        });

        // Draw current stroke
        if (currentPoints.length > 0 && activeTool) {
            ctx.beginPath();
            ctx.strokeStyle = COLORS.primary;
            ctx.lineWidth = 3;
            if (activeTool === 'LINE') {
                ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
                const last = currentPoints[currentPoints.length - 1];
                ctx.lineTo(last.x, last.y);
            } else if (activeTool === 'CIRCLE') {
                const first = currentPoints[0];
                const last = currentPoints[currentPoints.length - 1];
                const r = Math.sqrt(Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2));
                ctx.arc(first.x, first.y, r, 0, 2 * Math.PI);
            } else if (activeTool === 'FREEHAND') {
                ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
                currentPoints.forEach(p => ctx.lineTo(p.x, p.y));
            }
            ctx.stroke();
        }
    }, [width, height, annotations, currentPoints, activeTool]);

    const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (!activeTool) return;
        setIsDrawing(true);
        const p = getCoords(e);
        setCurrentPoints([p]);
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const p = getCoords(e);
        if (activeTool === 'FREEHAND') {
            setCurrentPoints(prev => [...prev, p]);
        } else {
            setCurrentPoints(prev => [prev[0], p]);
        }
    };

    const handleEnd = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (currentPoints.length > 1 && activeTool) {
            onAddAnnotation({
                id: crypto.randomUUID(),
                type: activeTool,
                points: currentPoints,
                color: COLORS.primary,
                strokeWidth: 3
            });
        }
        setCurrentPoints([]);
    };

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={`absolute inset-0 z-30 ${activeTool ? 'cursor-crosshair touch-none' : 'pointer-events-none'}`}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
        />
    );
};

// --- MEDIA INGEST WIZARD ---
export const MediaCaptureWizard: React.FC<{
    onComplete: (videoUrl: string, thumbUrl: string) => void;
    onCancel: () => void;
}> = ({ onComplete, onCancel }) => {
    const [status, setStatus] = useState<AnalysisStatus>('SELECT_SOURCE');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mock Camera logic
    const handleCameraStart = () => {
        // In real app, trigger native camera or webRTC
        // For web demo, defaulting to file select as camera simulation often fails in sandboxes
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setStatus('PREVIEW');
        }
    };

    const handleConfirm = () => {
        if (previewUrl && videoRef.current) {
            // Create a thumbnail
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 360;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const thumbUrl = canvas.toDataURL('image/jpeg');
            
            onComplete(previewUrl, thumbUrl);
        }
    };

    if (status === 'SELECT_SOURCE') {
        return (
            <div className="flex flex-col h-full bg-[#111827] text-white p-6 justify-center">
                <div className="text-center mb-8">
                    <Text variant="h2" color="white" className="mb-2">New Analysis</Text>
                    <Text className="text-gray-400">Choose how to import your swing</Text>
                </div>
                
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
                    <button onClick={handleCameraStart} className="aspect-square bg-gray-800 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-gray-700 transition-colors border border-gray-700">
                        <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center text-3xl"><Icons.Camera /></div>
                        <span className="font-bold">Record</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="aspect-square bg-gray-800 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-gray-700 transition-colors border border-gray-700">
                        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-3xl"><Icons.Upload /></div>
                        <span className="font-bold">Upload</span>
                    </button>
                    <button className="aspect-square bg-gray-800 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-gray-700 transition-colors border border-gray-700 opacity-50 cursor-not-allowed">
                        <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-3xl"><Icons.Cloud /></div>
                        <span className="font-bold">Import</span>
                    </button>
                </div>

                <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileSelect} />
                
                <button onClick={onCancel} className="mt-12 text-gray-500 font-bold hover:text-white">Cancel</button>
            </div>
        );
    }

    if (status === 'PREVIEW' && previewUrl) {
        return (
            <div className="flex flex-col h-full bg-black text-white">
                <div className="flex-1 relative flex items-center justify-center bg-gray-900">
                    <video ref={videoRef} src={previewUrl} controls className="max-h-full max-w-full" playsInline />
                </div>
                <div className="bg-[#1F2937] p-6 border-t border-gray-700 safe-area-bottom">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <Text variant="h4" color="white" className="text-sm font-bold">Trim Video</Text>
                            <Text className="text-xs text-gray-400">Adjust start and end points</Text>
                        </div>
                        <Badge variant="warning" className="bg-orange-600 text-white border-none"><Icons.Scissors /> Trim</Badge>
                    </div>
                    {/* Mock Trimmer UI */}
                    <div className="h-12 bg-gray-800 rounded-lg relative mb-6 border border-gray-600 overflow-hidden">
                        <div className="absolute inset-y-0 left-0 w-4 bg-orange-500 opacity-50 cursor-ew-resize"></div>
                        <div className="absolute inset-y-0 right-0 w-4 bg-orange-500 opacity-50 cursor-ew-resize"></div>
                        <div className="absolute top-1/2 left-4 right-4 h-8 -translate-y-1/2 flex items-center justify-around opacity-30">
                            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="w-8 h-6 bg-gray-500 rounded-sm"></div>)}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="ghost" fullWidth onClick={() => setStatus('SELECT_SOURCE')}>Retake</Button>
                        <Button variant="primary" fullWidth onClick={handleConfirm}>Analyze Swing</Button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

// --- PRO VIDEO PLAYER ---
export const ProVideoPlayer: React.FC<{
    src: string;
    isPlaying: boolean;
    playbackRate: number;
    activeTool: ToolType | null;
    annotations: DrawnAnnotation[];
    onTogglePlay: () => void;
    onAddAnnotation: (a: DrawnAnnotation) => void;
    videoRef: React.RefObject<HTMLVideoElement>;
}> = ({ src, isPlaying, playbackRate, activeTool, annotations, onTogglePlay, onAddAnnotation, videoRef }) => {
    const [dims, setDims] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (videoRef.current) videoRef.current.playbackRate = playbackRate;
    }, [playbackRate]);

    useEffect(() => {
        if (videoRef.current) isPlaying ? videoRef.current.play() : videoRef.current.pause();
    }, [isPlaying]);

    useEffect(() => {
        const updateDims = () => {
            if (containerRef.current) {
                setDims({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };
        window.addEventListener('resize', updateDims);
        updateDims();
        return () => window.removeEventListener('resize', updateDims);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden group">
            <video 
                ref={videoRef} 
                src={src} 
                className="max-h-full max-w-full" 
                playsInline 
                loop 
                muted // Muted for autoplay policy, though handled by play()
                onLoadedMetadata={() => {
                    // Force update dimensions once video loads
                    if (containerRef.current) {
                        setDims({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
                    }
                }}
            />
            
            <AnnotationOverlay 
                width={dims.width} 
                height={dims.height} 
                activeTool={activeTool} 
                annotations={annotations}
                onAddAnnotation={onAddAnnotation}
            />

            {!isPlaying && !activeTool && (
                <div className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer bg-black/10 transition-opacity" onClick={onTogglePlay}>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/30 shadow-lg hover:scale-110 transition-transform">
                        <Icons.Play />
                    </div>
                </div>
            )}
        </div>
    );
};

export const TransportControls: React.FC<{
    isPlaying: boolean;
    onTogglePlay: () => void;
    currentTime: number;
    duration: number;
    playbackRate: number;
    onSeek: (time: number) => void;
    onRateChange: (rate: number) => void;
    onFrameStep: (frames: number) => void;
}> = ({ isPlaying, onTogglePlay, currentTime, duration, playbackRate, onSeek, onRateChange, onFrameStep }) => {
    
    // Format time 0:00.00
    const formatTime = (t: number) => {
        const s = Math.floor(t);
        const ms = Math.floor((t % 1) * 100);
        return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-[#111827] border-t border-gray-800 p-2 safe-area-bottom">
            {/* Scrubber */}
            <div className="relative h-10 mb-2 group cursor-pointer" 
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    onSeek(pos * (duration || 1));
                }}
            >
                {/* Filmstrip BG Mock */}
                <div className="absolute inset-0 flex opacity-20 overflow-hidden">
                    {Array.from({length: 20}).map((_, i) => (
                        <div key={i} className="flex-1 border-r border-gray-600 bg-gray-800"></div>
                    ))}
                </div>
                {/* Progress */}
                <div className="absolute top-0 bottom-0 left-0 bg-orange-600/30 border-r-2 border-orange-500" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}></div>
                {/* Time Display */}
                <div className="absolute top-1 left-2 text-[10px] font-mono font-bold text-orange-500 bg-black/50 px-1 rounded">
                    {formatTime(currentTime)}
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center px-2">
                <div className="flex gap-2">
                    {[0.25, 0.5, 1.0].map(rate => (
                        <button 
                            key={rate} 
                            onClick={() => onRateChange(rate)}
                            className={`text-[10px] font-bold px-2 py-1 rounded border ${playbackRate === rate ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-700 text-gray-400 hover:text-white'}`}
                        >
                            {rate}x
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => onFrameStep(-1)} className="text-gray-400 hover:text-white p-2 active:scale-95"><Icons.SkipBack /></button>
                    <button 
                        onClick={onTogglePlay} 
                        className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                    >
                        {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                    </button>
                    <button onClick={() => onFrameStep(1)} className="text-gray-400 hover:text-white p-2 active:scale-95"><Icons.SkipForward /></button>
                </div>

                <div className="w-20 text-right">
                    <span className="text-[10px] text-gray-500">{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
};

export const AnalysisToolbar: React.FC<{ 
    activeTool: ToolType | null;
    onSelectTool: (t: ToolType | null) => void;
    onClear: () => void;
}> = ({ activeTool, onSelectTool, onClear }) => (
    <div className="bg-[#1F2937] border-t border-gray-700 p-2 safe-area-bottom">
        <div className="flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {[
                    { id: 'LINE', icon: '📏', label: 'Line' },
                    { id: 'CIRCLE', icon: '⭕', label: 'Circle' },
                    { id: 'FREEHAND', icon: '✏️', label: 'Draw' },
                    // { id: 'ANGLE', icon: '📐', label: 'Angle' }, // Keep simple for now
                ].map(tool => (
                    <button 
                        key={tool.id} 
                        onClick={() => onSelectTool(activeTool === tool.id ? null : tool.id as ToolType)}
                        className={`flex flex-col items-center justify-center min-w-[56px] h-14 rounded-xl transition-all ${
                            activeTool === tool.id 
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/50 scale-105' 
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                        }`}
                    >
                        <span className="text-lg mb-0.5">{tool.icon}</span>
                        <span className="text-[9px] font-bold uppercase">{tool.label}</span>
                    </button>
                ))}
            </div>
            <div className="h-8 w-px bg-gray-700 mx-2"></div>
            <button onClick={onClear} className="flex flex-col items-center justify-center min-w-[50px] h-14 rounded-xl bg-gray-800 text-red-400 hover:bg-gray-700 hover:text-red-300">
                <Icons.Trash />
                <span className="text-[9px] font-bold uppercase mt-1">Clear</span>
            </button>
        </div>
    </div>
);

// --- MAIN WRAPPER COMPONENT ---
export const AnalysisResult: React.FC<{ analysisId: string; onBack: () => void }> = ({ analysisId, onBack }) => {
    const swing = db.getSwings().find(s => s.id === analysisId) || db.getSwings()[0];
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [activeTool, setActiveTool] = useState<ToolType | null>(null);
    const [annotations, setAnnotations] = useState<DrawnAnnotation[]>(swing.annotations || []);

    // Sync Time
    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;

        const updateTime = () => setCurrentTime(vid.currentTime);
        const updateDur = () => setDuration(vid.duration);
        
        vid.addEventListener('timeupdate', updateTime);
        vid.addEventListener('loadedmetadata', updateDur);
        return () => {
            vid.removeEventListener('timeupdate', updateTime);
            vid.removeEventListener('loadedmetadata', updateDur);
        };
    }, []);

    const handleSeek = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleFrameStep = (frames: number) => {
        // Approx 30fps
        const step = 1/30;
        handleSeek(Math.min(Math.max(0, currentTime + (frames * step)), duration));
    };

    const handleAddAnnotation = (ann: DrawnAnnotation) => {
        setAnnotations(prev => [...prev, ann]);
        setActiveTool(null); // Deselect after drawing
    };

    return (
        <div className="flex flex-col h-full bg-black text-white fixed inset-0 z-50 animate-in slide-in-from-right duration-300">
             {/* Header */}
             <div className="flex items-center justify-between p-3 bg-[#111827] border-b border-gray-800 safe-area-top">
                <button onClick={onBack} className="p-2 text-gray-400 hover:text-white flex items-center gap-1">
                    <Icons.SkipBack /> Back
                </button>
                <div className="text-center">
                    <Text variant="h4" color="white" className="text-sm font-bold">{swing.clubUsed} Analysis</Text>
                    <Text className="text-[10px] text-gray-500">{new Date(swing.date).toLocaleDateString()}</Text>
                </div>
                <button className="p-2 text-orange-500 font-bold text-xs bg-orange-500/10 rounded-lg">Export</button>
             </div>

             {/* Player Area */}
             <div className="flex-1 relative bg-black flex items-center justify-center">
                <ProVideoPlayer 
                    src={swing.videoUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} // Fallback for dev
                    isPlaying={isPlaying} 
                    playbackRate={playbackRate}
                    activeTool={activeTool}
                    annotations={annotations}
                    onTogglePlay={() => setIsPlaying(!isPlaying)}
                    onAddAnnotation={handleAddAnnotation}
                    videoRef={videoRef}
                />
             </div>

             {/* Controls */}
             <TransportControls 
                isPlaying={isPlaying} 
                onTogglePlay={() => setIsPlaying(!isPlaying)} 
                currentTime={currentTime}
                duration={duration}
                playbackRate={playbackRate}
                onSeek={handleSeek}
                onRateChange={setPlaybackRate}
                onFrameStep={handleFrameStep}
             />

             {/* Tools */}
             <AnalysisToolbar 
                activeTool={activeTool} 
                onSelectTool={(t) => {
                    setIsPlaying(false); // Pause when drawing
                    setActiveTool(t);
                }} 
                onClear={() => setAnnotations([])}
            />
        </div>
    );
};

export const AnalyzeView: React.FC<{
    onRecord: () => void;
    onSelectSwing: (id: string) => void;
    onUpload: () => void;
}> = ({ onRecord, onSelectSwing, onUpload }) => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const swings = db.getSwings();

    const handleNewCapture = () => setIsCapturing(true);

    const handleCaptureComplete = (videoUrl: string, thumbUrl: string) => {
        // In a real app, this would upload to server.
        // Mock creating a new swing entry
        const newSwing: SwingAnalysis = {
            id: crypto.randomUUID(),
            date: new Date(),
            videoUrl: videoUrl,
            thumbnailUrl: thumbUrl,
            clubUsed: 'DRIVER', // Default, user would select
            tags: ['New Import'],
            metrics: {},
            feedback: [],
            keyframes: [],
            score: 0,
            annotations: []
        };
        db.addSwing(newSwing);
        setIsCapturing(false);
        onSelectSwing(newSwing.id);
    };

    if (isCapturing) {
        return <MediaCaptureWizard onComplete={handleCaptureComplete} onCancel={() => setIsCapturing(false)} />;
    }

    const filteredSwings = swings.filter(s => {
        if (filter === 'ALL') return true;
        const club = s.clubUsed;
        if (filter === 'DRIVER') return club === 'DRIVER';
        if (filter === 'IRONS') return club.includes('IRON');
        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-32">
            {/* Header */}
            <div className="px-1 pt-6 bg-white sticky top-0 z-10 pb-4 shadow-sm">
                <div className="flex justify-between items-end mb-4 px-4">
                    <div>
                        <Text variant="caption" className="uppercase font-bold tracking-widest text-orange-500 mb-1">Analysis</Text>
                        <Text variant="h1" className="mb-0">Swing Library</Text>
                    </div>
                    <Button size="sm" variant="primary" icon={<Icons.Camera />} onClick={handleNewCapture}>+ New</Button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4">
                    {['ALL', 'DRIVER', 'IRONS', 'WEDGES'].map(f => (
                         <button 
                            key={f} 
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${
                                filter === f 
                                    ? 'bg-gray-900 text-white border-gray-900' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="px-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* Record New Card */}
                    <div 
                        className="aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-gray-400 cursor-pointer transition-all active:scale-95 bg-gray-50/50 group"
                        onClick={handleNewCapture}
                    >
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 text-gray-600 group-hover:scale-110 transition-transform">
                            <Icons.Camera />
                        </div>
                        <span className="text-sm font-bold text-gray-600">Analyze New</span>
                    </div>

                    {filteredSwings.map(swing => (
                            <div key={swing.id} className="relative group cursor-pointer transition-transform active:scale-95" onClick={() => onSelectSwing(swing.id)}>
                            <div className="aspect-[3/4] rounded-2xl bg-gray-900 overflow-hidden shadow-md border border-gray-100 relative">
                                <img src={swing.thumbnailUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 shadow-lg">
                                        <Icons.Play />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                    <Text variant="caption" color="white" className="font-bold text-xs mb-0.5 shadow-sm">{swing.clubUsed}</Text>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full ${swing.score > 80 ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]' : 'bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.6)]'}`}></span>
                                        <span className="text-[10px] text-gray-300 font-medium">{swing.date.toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                                    </div>
                                </div>
                                {swing.score > 0 && (
                                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/10">
                                        {swing.score}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const VideoRecorder = MediaCaptureWizard; // Alias for compatibility

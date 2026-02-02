
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button, Text, Card, Badge, ProgressBar } from './UIComponents';
import { COLORS } from '../constants';
import { AnalysisStatus, FeedbackMessage, Keyframe, PlaybackSpeed, ToolType, SwingAnalysis, SkeletonConfig, DrawnAnnotation, Point, FullSwingAnalysis, SwingPositionId } from '../types';
import { analyzeSwingFrame } from '../services/geminiService';
import { db } from '../services/dataService';
import { SwingAnalysisPipeline } from './SwingAnalysisPipeline';
import { PositionAnalysisView } from './PositionAnalysisView';
import { EnhancedVideoPlayer } from './EnhancedVideoPlayer';
import { AnalysisReportView } from './AnalysisReportView';
import { LiveSessionView } from './LiveSessionView';

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
    Scissors: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>,
    Zap: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
    Video: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>,
    ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>,
    BarChart: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
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

// --- CAMERA TIPS DATA ---
const CAMERA_TIPS: Record<string, { title: string; tips: string[]; diagram: string }> = {
    FACE_ON: {
        title: 'Face On Setup',
        tips: [
            'Position camera at belt height, 8-10 feet away',
            'Center the golfer in frame with room above for full backswing',
            'Align camera perpendicular to target line',
            'Ensure full body visible from feet to club top',
        ],
        diagram: 'M60,20 L60,80 M45,45 L75,45 M60,80 L50,120 M60,80 L70,120 M40,30 L60,20 L80,40',
    },
    DOWN_THE_LINE: {
        title: 'Down the Line Setup',
        tips: [
            'Position camera at hand height, 8-10 feet behind',
            'Align camera parallel to target line',
            'Hands should be roughly centered in frame',
            'Keep horizon level in the background',
        ],
        diagram: 'M60,25 L55,80 M45,50 L70,40 M55,80 L45,120 M55,80 L65,120 M70,40 L85,20',
    },
    REAR: {
        title: 'Rear View Setup',
        tips: [
            'Position camera directly behind the golfer',
            'Camera at belt height, 10-12 feet away',
            'Full body should be visible in frame',
            'Good for hip rotation and weight shift analysis',
        ],
        diagram: 'M60,20 L60,80 M50,45 L70,45 M60,80 L50,120 M60,80 L70,120 M50,45 L40,25',
    },
};

// --- VIDEO QUALITY CHECKER ---
const checkVideoQuality = (video: HTMLVideoElement, file: File | null): { score: number; issues: string[]; good: string[] } => {
    const issues: string[] = [];
    const good: string[] = [];
    let score = 100;

    // Resolution check
    const w = video.videoWidth || 0;
    const h = video.videoHeight || 0;
    if (w >= 1920 || h >= 1080) {
        good.push('HD resolution detected');
    } else if (w >= 1280 || h >= 720) {
        good.push('720p resolution - good');
    } else if (w > 0) {
        issues.push(`Low resolution (${w}x${h}) - 720p+ recommended`);
        score -= 20;
    }

    // Duration check
    const dur = video.duration || 0;
    if (dur > 0 && dur < 1) {
        issues.push('Video too short - needs at least 1 second');
        score -= 30;
    } else if (dur > 0 && dur < 3) {
        issues.push('Video may be too short for full swing');
        score -= 10;
    } else if (dur > 30) {
        issues.push('Video is long - AI will auto-trim to swing');
    } else if (dur >= 3) {
        good.push(`Duration ${dur.toFixed(1)}s - good length`);
    }

    // File size check
    if (file) {
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > 200) {
            issues.push(`Large file (${sizeMB.toFixed(0)}MB) - may take longer`);
            score -= 5;
        } else {
            good.push(`File size ${sizeMB.toFixed(1)}MB`);
        }
    }

    // Orientation check
    if (w > 0 && h > 0) {
        if (h > w) {
            good.push('Portrait mode detected');
        } else {
            good.push('Landscape mode detected');
        }
    }

    return { score: Math.max(0, Math.min(100, score)), issues, good };
};

// --- MEDIA INGEST WIZARD (Enhanced with camera tips, quality checks, guided flow) ---
export const MediaCaptureWizard: React.FC<{
    onComplete: (videoUrl: string, thumbUrl: string) => void;
    onStartPipeline?: (videoUrl: string, thumbUrl: string, club: string, angle: string) => void;
    onCancel: () => void;
}> = ({ onComplete, onStartPipeline, onCancel }) => {
    const [status, setStatus] = useState<AnalysisStatus>('SELECT_SOURCE');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedClub, setSelectedClub] = useState('DRIVER');
    const [selectedAngle, setSelectedAngle] = useState('FACE_ON');
    const [showTips, setShowTips] = useState(false);
    const [videoQuality, setVideoQuality] = useState<{ score: number; issues: string[]; good: string[] } | null>(null);
    const [showQuality, setShowQuality] = useState(false);
    const [clubSearch, setClubSearch] = useState('');
    const [recentClubs, setRecentClubs] = useState<string[]>(['DRIVER', '7 IRON', 'PW']);
    const [confirmingAnalyze, setConfirmingAnalyze] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const ALL_CLUBS = ['DRIVER', '3 WOOD', '5 WOOD', '3 HYBRID', '4 HYBRID', '4 IRON', '5 IRON', '6 IRON', '7 IRON', '8 IRON', '9 IRON', 'PW', 'GW', 'SW', 'LW', 'PUTTER'];

    const CLUB_GROUPS = [
        { label: 'Woods', clubs: ['DRIVER', '3 WOOD', '5 WOOD'] },
        { label: 'Hybrids', clubs: ['3 HYBRID', '4 HYBRID'] },
        { label: 'Irons', clubs: ['4 IRON', '5 IRON', '6 IRON', '7 IRON', '8 IRON', '9 IRON'] },
        { label: 'Wedges', clubs: ['PW', 'GW', 'SW', 'LW'] },
        { label: 'Putter', clubs: ['PUTTER'] },
    ];

    const ANGLES = [
        { id: 'FACE_ON', label: 'Face On', desc: 'Best for posture & spine angle' },
        { id: 'DOWN_THE_LINE', label: 'Down the Line', desc: 'Best for swing plane & path' },
        { id: 'REAR', label: 'Rear', desc: 'Best for hip rotation analysis' },
    ];

    const filteredClubs = clubSearch
        ? ALL_CLUBS.filter(c => c.toLowerCase().includes(clubSearch.toLowerCase()))
        : ALL_CLUBS;

    const handleCameraCapture = () => {
        cameraInputRef.current?.click();
    };

    const handleFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setVideoQuality(null);
            setStatus('PREVIEW');
        }
    };

    const handleVideoLoaded = () => {
        if (videoRef.current && file) {
            const quality = checkVideoQuality(videoRef.current, file);
            setVideoQuality(quality);
            if (quality.issues.length > 0) {
                setShowQuality(true);
            }
        }
    };

    const handleConfirm = () => {
        if (previewUrl && videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 360;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const thumbUrl = canvas.toDataURL('image/jpeg');

            // Track recently used clubs
            setRecentClubs(prev => {
                const updated = [selectedClub, ...prev.filter(c => c !== selectedClub)].slice(0, 5);
                return updated;
            });

            if (onStartPipeline) {
                onStartPipeline(previewUrl, thumbUrl, selectedClub, selectedAngle);
            } else {
                onComplete(previewUrl, thumbUrl);
            }
        }
    };

    // --- SELECT SOURCE SCREEN ---
    if (status === 'SELECT_SOURCE') {
        return (
            <div className="flex flex-col h-full bg-[#111827] text-white p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button onClick={onCancel} className="text-gray-400 hover:text-white font-bold text-sm">Cancel</button>
                    <Text variant="h3" color="white" className="text-lg font-bold">New Analysis</Text>
                    <div className="w-12" />
                </div>

                {/* Hero Section */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Icons.Zap />
                    </div>
                    <Text variant="h2" color="white" className="mb-2">Maestro Swing Analysis</Text>
                    <Text className="text-gray-400 text-sm max-w-xs mx-auto">
                        Record or upload a swing video for AI-powered ball flight and position analysis with data-driven coaching
                    </Text>
                </div>

                {/* Source Options */}
                <div className="space-y-3 max-w-md mx-auto w-full flex-1">
                    {/* Record - Primary */}
                    <button
                        onClick={handleCameraCapture}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 flex items-center gap-4 hover:from-orange-600 hover:to-orange-700 transition-all active:scale-[0.98] shadow-lg shadow-orange-500/20"
                    >
                        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <Icons.Camera />
                        </div>
                        <div className="text-left flex-1">
                            <span className="font-bold text-base block">Record Swing</span>
                            <span className="text-orange-100 text-xs">Use your camera to capture a new swing</span>
                        </div>
                        <Icons.ChevronRight />
                    </button>

                    {/* Upload */}
                    <button
                        onClick={handleFileUpload}
                        className="w-full bg-gray-800 rounded-2xl p-4 flex items-center gap-4 hover:bg-gray-700 transition-all active:scale-[0.98] border border-gray-700"
                    >
                        <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                            <Icons.Upload />
                        </div>
                        <div className="text-left flex-1">
                            <span className="font-bold text-base block">Upload Video</span>
                            <span className="text-gray-400 text-xs">Select a video from your device</span>
                        </div>
                        <Icons.ChevronRight />
                    </button>

                    {/* Import from Cloud */}
                    <button
                        className="w-full bg-gray-800/50 rounded-2xl p-4 flex items-center gap-4 border border-gray-700/50 opacity-60 cursor-not-allowed"
                    >
                        <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">
                            <Icons.Cloud />
                        </div>
                        <div className="text-left flex-1">
                            <span className="font-bold text-base block">Cloud Import</span>
                            <span className="text-gray-500 text-xs">Google Drive, iCloud - coming soon</span>
                        </div>
                        <Badge variant="default" className="bg-gray-700 text-gray-400 border-none text-[9px]">Soon</Badge>
                    </button>
                </div>

                {/* Recording Tips Quick Card */}
                <div className="max-w-md mx-auto w-full mt-6">
                    <button
                        onClick={() => setShowTips(true)}
                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 flex items-center gap-3 hover:bg-gray-800 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
                            <Icons.Eye />
                        </div>
                        <div className="text-left flex-1">
                            <span className="text-sm font-bold text-white">Recording Tips</span>
                            <span className="text-[10px] text-gray-400 block">Learn how to capture the best video for analysis</span>
                        </div>
                        <Icons.ChevronRight />
                    </button>
                </div>

                <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileSelect} />
                <input type="file" ref={cameraInputRef} className="hidden" accept="video/*" capture="environment" onChange={handleFileSelect} />

                {/* Tips Modal */}
                {showTips && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center animate-in fade-in duration-200">
                        <div className="bg-[#1F2937] rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 safe-area-bottom">
                            <div className="sticky top-0 bg-[#1F2937] p-4 border-b border-gray-700 flex items-center justify-between z-10">
                                <Text variant="h3" color="white" className="font-bold">Recording Tips</Text>
                                <button onClick={() => setShowTips(false)} className="text-gray-400 hover:text-white text-sm font-bold px-3 py-1 rounded-lg bg-gray-700">Done</button>
                            </div>
                            <div className="p-4 space-y-6">
                                {/* General Tips */}
                                <div>
                                    <Text variant="h4" color="white" className="font-bold mb-3 text-sm uppercase tracking-wider text-orange-400">General Guidelines</Text>
                                    <div className="space-y-2">
                                        {[
                                            { tip: 'Use natural daylight or well-lit indoor range', icon: '1' },
                                            { tip: 'Keep camera steady - use a tripod if possible', icon: '2' },
                                            { tip: 'Record in slow motion (120fps+) for best results', icon: '3' },
                                            { tip: 'Ensure full body is visible throughout the swing', icon: '4' },
                                            { tip: 'Avoid busy backgrounds for better AI detection', icon: '5' },
                                            { tip: 'Record 2-3 seconds before and after the swing', icon: '6' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-gray-800/50 rounded-xl p-3">
                                                <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{item.icon}</div>
                                                <Text className="text-gray-300 text-sm">{item.tip}</Text>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Angle-Specific Tips */}
                                {Object.entries(CAMERA_TIPS).map(([key, data]) => (
                                    <div key={key}>
                                        <Text variant="h4" color="white" className="font-bold mb-3 text-sm uppercase tracking-wider text-blue-400">{data.title}</Text>
                                        <div className="flex gap-4 mb-3">
                                            {/* Simple diagram */}
                                            <div className="w-24 h-24 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-700">
                                                <svg width="80" height="80" viewBox="0 0 120 140">
                                                    <path d={data.diagram} fill="none" stroke="#FF8200" strokeWidth="3" strokeLinecap="round" />
                                                    <circle cx="60" cy="20" r="8" fill="none" stroke="#FF8200" strokeWidth="2" />
                                                </svg>
                                            </div>
                                            <div className="space-y-1.5 flex-1">
                                                {data.tips.map((tip, i) => (
                                                    <div key={i} className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                                        <Text className="text-gray-300 text-xs">{tip}</Text>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- PREVIEW & CONFIGURE SCREEN ---
    if (status === 'PREVIEW' && previewUrl) {
        const tips = CAMERA_TIPS[selectedAngle];

        return (
            <div className="flex flex-col h-full bg-black text-white">
                {/* Video Preview with quality badge */}
                <div className="flex-1 relative flex items-center justify-center bg-gray-900 min-h-0">
                    <video
                        ref={videoRef}
                        src={previewUrl}
                        controls
                        className="max-h-full max-w-full"
                        playsInline
                        onLoadedMetadata={handleVideoLoaded}
                    />

                    {/* Quality indicator */}
                    {videoQuality && (
                        <button
                            onClick={() => setShowQuality(!showQuality)}
                            className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border transition-all ${
                                videoQuality.score >= 80
                                    ? 'bg-green-500/20 border-green-500/30 text-green-400'
                                    : videoQuality.score >= 50
                                    ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                                    : 'bg-red-500/20 border-red-500/30 text-red-400'
                            }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${
                                videoQuality.score >= 80 ? 'bg-green-400' : videoQuality.score >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                            }`} />
                            {videoQuality.score >= 80 ? 'Good' : videoQuality.score >= 50 ? 'Fair' : 'Low'} Quality
                        </button>
                    )}

                    {/* Quality details popup */}
                    {showQuality && videoQuality && (
                        <div className="absolute top-12 right-3 bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700 p-3 w-64 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between mb-2">
                                <Text variant="h4" color="white" className="text-xs font-bold">Video Quality</Text>
                                <button onClick={() => setShowQuality(false)} className="text-gray-500 text-xs">Close</button>
                            </div>
                            {/* Quality bar */}
                            <div className="h-2 bg-gray-700 rounded-full mb-3 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        videoQuality.score >= 80 ? 'bg-green-500' : videoQuality.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${videoQuality.score}%` }}
                                />
                            </div>
                            {videoQuality.good.map((g, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px] text-green-400 mb-1">
                                    <span>+</span> {g}
                                </div>
                            ))}
                            {videoQuality.issues.map((issue, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px] text-yellow-400 mb-1">
                                    <span>!</span> {issue}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Configuration Panel */}
                <div className="bg-[#1F2937] border-t border-gray-700 safe-area-bottom overflow-y-auto max-h-[55vh]">
                    <div className="p-4 space-y-4">

                        {/* Club Selection - Grouped */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Text variant="h4" color="white" className="text-xs font-bold uppercase tracking-wider text-gray-400">Club Used</Text>
                                {/* Search */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={clubSearch}
                                        onChange={(e) => setClubSearch(e.target.value)}
                                        placeholder="Search..."
                                        className="bg-gray-700 text-white text-xs rounded-lg px-2 py-1 w-24 focus:w-32 transition-all focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder-gray-500"
                                    />
                                </div>
                            </div>

                            {/* Recent Clubs */}
                            {!clubSearch && recentClubs.length > 0 && (
                                <div className="mb-2">
                                    <Text className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Recent</Text>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {recentClubs.map(club => (
                                            <button
                                                key={`recent-${club}`}
                                                onClick={() => setSelectedClub(club)}
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                                    selectedClub === club
                                                        ? 'bg-orange-600 text-white ring-2 ring-orange-400/30'
                                                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600'
                                                }`}
                                            >
                                                {club}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All Clubs - Grouped or Filtered */}
                            {clubSearch ? (
                                <div className="flex gap-1.5 flex-wrap">
                                    {filteredClubs.map(club => (
                                        <button
                                            key={club}
                                            onClick={() => { setSelectedClub(club); setClubSearch(''); }}
                                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                                selectedClub === club
                                                    ? 'bg-orange-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            {club}
                                        </button>
                                    ))}
                                    {filteredClubs.length === 0 && (
                                        <Text className="text-xs text-gray-500 py-1">No clubs match "{clubSearch}"</Text>
                                    )}
                                </div>
                            ) : (
                                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                                    {ALL_CLUBS.map(club => (
                                        <button
                                            key={club}
                                            onClick={() => setSelectedClub(club)}
                                            className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                                                selectedClub === club
                                                    ? 'bg-orange-600 text-white ring-2 ring-orange-400/30'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            {club}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Camera Angle Selection - Enhanced */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Text variant="h4" color="white" className="text-xs font-bold uppercase tracking-wider text-gray-400">Camera Angle</Text>
                                <button
                                    onClick={() => setShowTips(true)}
                                    className="text-[10px] text-orange-400 font-bold hover:text-orange-300"
                                >
                                    View Tips
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {ANGLES.map(angle => (
                                    <button
                                        key={angle.id}
                                        onClick={() => setSelectedAngle(angle.id)}
                                        className={`py-2.5 px-2 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
                                            selectedAngle === angle.id
                                                ? 'bg-orange-600 text-white ring-2 ring-orange-400/30 shadow-lg shadow-orange-500/20'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        {/* Mini diagram */}
                                        <svg width="28" height="28" viewBox="0 0 120 140" className="opacity-80">
                                            <path d={CAMERA_TIPS[angle.id]?.diagram || ''} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                            <circle cx="60" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="3" />
                                        </svg>
                                        <span className="font-bold">{angle.label}</span>
                                        <span className={`text-[8px] ${selectedAngle === angle.id ? 'text-orange-100' : 'text-gray-500'}`}>{angle.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Smart Trim */}
                        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <div>
                                    <Text variant="h4" color="white" className="text-sm font-bold">Smart Trim</Text>
                                    <Text className="text-[10px] text-gray-400">AI will auto-detect swing start and finish</Text>
                                </div>
                                <Badge variant="warning" className="bg-orange-600 text-white border-none text-[9px]"><Icons.Scissors /> Auto</Badge>
                            </div>

                            <div className="h-10 bg-gray-800 rounded-lg relative border border-gray-600 overflow-hidden">
                                <div className="absolute inset-y-0 left-0 w-4 bg-orange-500 opacity-50 cursor-ew-resize rounded-l" />
                                <div className="absolute inset-y-0 right-0 w-4 bg-orange-500 opacity-50 cursor-ew-resize rounded-r" />
                                <div className="absolute top-1/2 left-4 right-4 h-6 -translate-y-1/2 flex items-center justify-around opacity-30">
                                    {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="w-8 h-5 bg-gray-500 rounded-sm" />)}
                                </div>
                            </div>
                        </div>

                        {/* Summary before analyze */}
                        <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
                            <Text className="text-[9px] text-gray-500 uppercase tracking-wider mb-2 font-bold">Analysis Config</Text>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                                    <span className="text-gray-300 font-bold">{selectedClub}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                    <span className="text-gray-300">{ANGLES.find(a => a.id === selectedAngle)?.label}</span>
                                </div>
                                {videoQuality && (
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${videoQuality.score >= 80 ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                        <span className="text-gray-300">{videoQuality.score}% quality</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button variant="ghost" fullWidth onClick={() => { setStatus('SELECT_SOURCE'); setVideoQuality(null); setShowQuality(false); }}>
                                Back
                            </Button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] transition-all shadow-lg shadow-orange-500/20"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <Icons.Zap /> Analyze Swing
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tips Modal (reused from select source) */}
                {showTips && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center animate-in fade-in duration-200">
                        <div className="bg-[#1F2937] rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 safe-area-bottom">
                            <div className="sticky top-0 bg-[#1F2937] p-4 border-b border-gray-700 flex items-center justify-between z-10">
                                <Text variant="h3" color="white" className="font-bold">Camera Setup Tips</Text>
                                <button onClick={() => setShowTips(false)} className="text-gray-400 hover:text-white text-sm font-bold px-3 py-1 rounded-lg bg-gray-700">Done</button>
                            </div>
                            <div className="p-4 space-y-4">
                                {/* Highlight selected angle */}
                                {tips && (
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-2 h-2 rounded-full bg-orange-400" />
                                            <Text variant="h4" color="white" className="font-bold text-sm text-orange-400">Selected: {tips.title}</Text>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-20 h-20 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-700">
                                                <svg width="60" height="60" viewBox="0 0 120 140">
                                                    <path d={tips.diagram} fill="none" stroke="#FF8200" strokeWidth="3" strokeLinecap="round" />
                                                    <circle cx="60" cy="20" r="8" fill="none" stroke="#FF8200" strokeWidth="2" />
                                                </svg>
                                            </div>
                                            <div className="space-y-1.5">
                                                {tips.tips.map((tip, i) => (
                                                    <div key={i} className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                                                        <Text className="text-gray-300 text-xs">{tip}</Text>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Other angles */}
                                {Object.entries(CAMERA_TIPS).filter(([key]) => key !== selectedAngle).map(([key, data]) => (
                                    <div key={key} className="bg-gray-800/50 rounded-xl p-3">
                                        <Text variant="h4" color="white" className="font-bold text-xs mb-2 text-gray-400">{data.title}</Text>
                                        <div className="space-y-1">
                                            {data.tips.slice(0, 2).map((tip, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-gray-500 mt-1.5 flex-shrink-0" />
                                                    <Text className="text-gray-500 text-[10px]">{tip}</Text>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

// --- PRO VIDEO PLAYER (Legacy - kept for backward compatibility) ---
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
                muted
                onLoadedMetadata={() => {
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

    const formatTime = (t: number) => {
        const s = Math.floor(t);
        const ms = Math.floor((t % 1) * 100);
        return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-[#111827] border-t border-gray-800 p-2 safe-area-bottom">
            <div className="relative h-10 mb-2 group cursor-pointer"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    onSeek(pos * (duration || 1));
                }}
            >
                <div className="absolute inset-0 flex opacity-20 overflow-hidden">
                    {Array.from({length: 20}).map((_, i) => (
                        <div key={i} className="flex-1 border-r border-gray-600 bg-gray-800"></div>
                    ))}
                </div>
                <div className="absolute top-0 bottom-0 left-0 bg-orange-600/30 border-r-2 border-orange-500" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}></div>
                <div className="absolute top-1 left-2 text-[10px] font-mono font-bold text-orange-500 bg-black/50 px-1 rounded">
                    {formatTime(currentTime)}
                </div>
            </div>

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

// --- FULL SWING ANALYSIS RESULT (Enhanced with P1-P10, Video Player, Report) ---
type AnalysisSubView = 'VIDEO' | 'POSITIONS' | 'REPORT';

export const FullAnalysisResult: React.FC<{
    analysis: FullSwingAnalysis;
    onBack: () => void;
}> = ({ analysis, onBack }) => {
    const [activeView, setActiveView] = useState<AnalysisSubView>('VIDEO');
    const [selectedPosition, setSelectedPosition] = useState<SwingPositionId | null>(null);

    if (selectedPosition && activeView === 'POSITIONS') {
        return (
            <PositionAnalysisView
                positions={analysis.positions}
                initialPositionId={selectedPosition}
                onBack={() => setSelectedPosition(null)}
                onPositionChange={(id) => setSelectedPosition(id)}
            />
        );
    }

    if (activeView === 'VIDEO') {
        return (
            <EnhancedVideoPlayer
                analysis={analysis}
                onBack={onBack}
                onViewPosition={(posId) => {
                    setSelectedPosition(posId);
                    setActiveView('POSITIONS');
                }}
                onViewReport={() => setActiveView('REPORT')}
            />
        );
    }

    if (activeView === 'REPORT') {
        return (
            <AnalysisReportView
                analysis={analysis}
                onBack={() => setActiveView('VIDEO')}
                onViewPosition={(posId) => {
                    setSelectedPosition(posId);
                    setActiveView('POSITIONS');
                }}
                onViewVideo={() => setActiveView('VIDEO')}
            />
        );
    }

    return null;
};

// --- LEGACY ANALYSIS RESULT (for backward compatibility with existing swings) ---
export const AnalysisResult: React.FC<{ analysisId: string; onBack: () => void }> = ({ analysisId, onBack }) => {
    const swing = db.getSwings().find(s => s.id === analysisId) || db.getSwings()[0];
    const videoRef = useRef<HTMLVideoElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [activeTool, setActiveTool] = useState<ToolType | null>(null);
    const [annotations, setAnnotations] = useState<DrawnAnnotation[]>(swing.annotations || []);

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
        const step = 1/30;
        handleSeek(Math.min(Math.max(0, currentTime + (frames * step)), duration));
    };

    const handleAddAnnotation = (ann: DrawnAnnotation) => {
        setAnnotations(prev => [...prev, ann]);
        setActiveTool(null);
    };

    return (
        <div className="flex flex-col h-full bg-black text-white fixed inset-0 z-50 animate-in slide-in-from-right duration-300">
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

             <div className="flex-1 relative bg-black flex items-center justify-center">
                <ProVideoPlayer
                    src={swing.videoUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                    isPlaying={isPlaying}
                    playbackRate={playbackRate}
                    activeTool={activeTool}
                    annotations={annotations}
                    onTogglePlay={() => setIsPlaying(!isPlaying)}
                    onAddAnnotation={handleAddAnnotation}
                    videoRef={videoRef}
                />
             </div>

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

             <AnalysisToolbar
                activeTool={activeTool}
                onSelectTool={(t) => {
                    setIsPlaying(false);
                    setActiveTool(t);
                }}
                onClear={() => setAnnotations([])}
            />
        </div>
    );
};

// --- MAIN ANALYZE VIEW (Enhanced with pipeline & live session integration) ---
export const AnalyzeView: React.FC<{
    onRecord: () => void;
    onSelectSwing: (id: string) => void;
    onUpload: () => void;
    onStartLiveSession?: () => void;
    onStartPipeline?: (videoUrl: string, thumbUrl: string, club: string, angle: string) => void;
}> = ({ onRecord, onSelectSwing, onUpload, onStartLiveSession, onStartPipeline }) => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const swings = db.getSwings();

    const handleNewCapture = () => setIsCapturing(true);

    const handleCaptureComplete = (videoUrl: string, thumbUrl: string) => {
        const newSwing: SwingAnalysis = {
            id: crypto.randomUUID(),
            date: new Date(),
            videoUrl: videoUrl,
            thumbnailUrl: thumbUrl,
            clubUsed: 'DRIVER',
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

    const handlePipelineStart = (videoUrl: string, thumbUrl: string, club: string, angle: string) => {
        setIsCapturing(false);
        if (onStartPipeline) {
            onStartPipeline(videoUrl, thumbUrl, club, angle);
        }
    };

    if (isCapturing) {
        return (
            <MediaCaptureWizard
                onComplete={handleCaptureComplete}
                onStartPipeline={onStartPipeline ? handlePipelineStart : undefined}
                onCancel={() => setIsCapturing(false)}
            />
        );
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

            {/* AI Analysis Quick Actions */}
            <div className="px-4">
                <div className="grid grid-cols-2 gap-3">
                    {/* AI Analyze Card */}
                    <div
                        className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
                        onClick={handleNewCapture}
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
                            <Icons.Zap />
                        </div>
                        <Text variant="h4" color="white" className="text-sm font-bold mb-1">Maestro Analyze</Text>
                        <Text className="text-[10px] text-orange-100">Ball flight data & position breakdown</Text>
                    </div>

                    {/* Live Session Card */}
                    <div
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
                        onClick={() => onStartLiveSession?.()}
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
                            <Icons.Video />
                        </div>
                        <Text variant="h4" color="white" className="text-sm font-bold mb-1">Live Session</Text>
                        <Text className="text-[10px] text-blue-100">Real-time capture & instant analysis</Text>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="px-4">
                <div className="flex justify-between items-center mb-3">
                    <Text variant="h3" className="text-base">Recent Analyses</Text>
                    <Text variant="caption" className="text-xs text-gray-400">{filteredSwings.length} swings</Text>
                </div>
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

export { SwingAnalysisPipeline } from './SwingAnalysisPipeline';
export { PositionAnalysisView } from './PositionAnalysisView';
export { EnhancedVideoPlayer } from './EnhancedVideoPlayer';
export { AnalysisReportView } from './AnalysisReportView';
export { LiveSessionView } from './LiveSessionView';

export const VideoRecorder = MediaCaptureWizard; // Alias for compatibility

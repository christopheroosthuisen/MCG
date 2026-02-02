/**
 * EnhancedVideoPlayer.tsx
 *
 * Professional-grade video player for swing analysis with:
 * - Smooth frame-by-frame scrubbing
 * - P1-P10 position markers on timeline
 * - Multiple playback speeds (0.1x to 1x)
 * - Drawing/annotation tools overlay
 * - Audio recording for coach narration
 * - Split view for comparisons
 * - Filmstrip thumbnail timeline
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { COLORS } from '../constants';
import { Text } from './UIComponents';
import {
    DetectedPosition,
    SwingPositionId,
    ExtendedToolType,
    ExtendedAnnotation,
    Point,
    FullSwingAnalysis,
} from '../types';
import { SWING_POSITIONS, drawSkeleton } from '../services/swingAnalysisService';

// Icons
const Icons = {
    Play: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
    Pause: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>,
    SkipBack: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>,
    SkipForward: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>,
    Mic: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>,
    MicOff: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .5-.05 1-.15 1.45"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>,
    Maximize: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>,
    Split: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line></svg>,
    Share: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>,
    ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>,
    Undo: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>,
    Repeat: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>,
    ZoomIn: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>,
    ZoomOut: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>,
};

// --- DRAWING CANVAS ---
const DrawingCanvas: React.FC<{
    width: number;
    height: number;
    activeTool: ExtendedToolType | null;
    annotations: ExtendedAnnotation[];
    currentTimestamp: number;
    onAddAnnotation: (ann: ExtendedAnnotation) => void;
    annotationColor: string;
}> = ({ width, height, activeTool, annotations, currentTimestamp, onAddAnnotation, annotationColor }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPoints, setCurrentPoints] = useState<Point[]>([]);

    // Redraw all annotations for the current timestamp
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw saved annotations (visible ones, either no timestamp or matching current)
        annotations.filter(a => a.visible && (!a.frameTimestamp || Math.abs(a.frameTimestamp - currentTimestamp) < 0.05)).forEach(ann => {
            drawAnnotation(ctx, ann);
        });

        // Draw current stroke
        if (currentPoints.length > 0 && activeTool) {
            drawCurrentStroke(ctx, activeTool, currentPoints, annotationColor);
        }
    }, [width, height, annotations, currentPoints, activeTool, currentTimestamp, annotationColor]);

    const drawAnnotation = (ctx: CanvasRenderingContext2D, ann: ExtendedAnnotation) => {
        ctx.beginPath();
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.strokeWidth;

        if (ann.type === 'LINE' && ann.points.length >= 2) {
            ctx.moveTo(ann.points[0].x, ann.points[0].y);
            ctx.lineTo(ann.points[1].x, ann.points[1].y);
        } else if (ann.type === 'ARROW' && ann.points.length >= 2) {
            const p1 = ann.points[0];
            const p2 = ann.points[1];
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            // Draw arrowhead
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const headLen = 12;
            ctx.lineTo(p2.x - headLen * Math.cos(angle - Math.PI / 6), p2.y - headLen * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(p2.x, p2.y);
            ctx.lineTo(p2.x - headLen * Math.cos(angle + Math.PI / 6), p2.y - headLen * Math.sin(angle + Math.PI / 6));
        } else if (ann.type === 'CIRCLE' && ann.points.length >= 2) {
            const r = Math.sqrt(Math.pow(ann.points[1].x - ann.points[0].x, 2) + Math.pow(ann.points[1].y - ann.points[0].y, 2));
            ctx.arc(ann.points[0].x, ann.points[0].y, r, 0, 2 * Math.PI);
        } else if (ann.type === 'FREEHAND' && ann.points.length > 1) {
            ctx.moveTo(ann.points[0].x, ann.points[0].y);
            ann.points.forEach(p => ctx.lineTo(p.x, p.y));
        } else if (ann.type === 'ANGLE' && ann.points.length >= 3) {
            // Draw angle measurement
            ctx.moveTo(ann.points[0].x, ann.points[0].y);
            ctx.lineTo(ann.points[1].x, ann.points[1].y);
            ctx.lineTo(ann.points[2].x, ann.points[2].y);
            // Draw arc
            const startAngle = Math.atan2(ann.points[0].y - ann.points[1].y, ann.points[0].x - ann.points[1].x);
            const endAngle = Math.atan2(ann.points[2].y - ann.points[1].y, ann.points[2].x - ann.points[1].x);
            ctx.arc(ann.points[1].x, ann.points[1].y, 20, startAngle, endAngle);
        } else if (ann.type === 'TEXT' && ann.points.length >= 1 && ann.text) {
            ctx.font = `bold ${ann.fontSize || 14}px sans-serif`;
            ctx.fillStyle = ann.color;
            ctx.fillText(ann.text, ann.points[0].x, ann.points[0].y);
            return; // No stroke for text
        }
        ctx.stroke();
    };

    const drawCurrentStroke = (ctx: CanvasRenderingContext2D, tool: ExtendedToolType, points: Point[], color: string) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;

        if (tool === 'FREEHAND' && points.length > 1) {
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(p => ctx.lineTo(p.x, p.y));
        } else if ((tool === 'LINE' || tool === 'ARROW') && points.length >= 2) {
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        } else if (tool === 'CIRCLE' && points.length >= 2) {
            const r = Math.sqrt(Math.pow(points[points.length - 1].x - points[0].x, 2) + Math.pow(points[points.length - 1].y - points[0].y, 2));
            ctx.arc(points[0].x, points[0].y, r, 0, 2 * Math.PI);
        }
        ctx.stroke();
    };

    const getCoords = (e: React.MouseEvent | React.TouchEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0]?.clientX || 0 : e.clientX;
        const clientY = 'touches' in e ? e.touches[0]?.clientY || 0 : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (!activeTool || activeTool === 'POINTER') return;
        setIsDrawing(true);
        setCurrentPoints([getCoords(e)]);
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
        if (!isDrawing || !activeTool) return;
        setIsDrawing(false);
        if (currentPoints.length > 1) {
            onAddAnnotation({
                id: crypto.randomUUID(),
                type: activeTool,
                points: currentPoints,
                color: annotationColor,
                strokeWidth: 3,
                frameTimestamp: currentTimestamp,
                locked: false,
                visible: true,
            });
        }
        setCurrentPoints([]);
    };

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 z-30 ${activeTool && activeTool !== 'POINTER' ? 'cursor-crosshair touch-none' : 'pointer-events-none'}`}
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

// --- POSITION TIMELINE MARKERS ---
const PositionTimelineMarkers: React.FC<{
    positions: DetectedPosition[];
    duration: number;
    currentTime: number;
    onSeekToPosition: (timestamp: number) => void;
}> = ({ positions, duration, currentTime, onSeekToPosition }) => {
    if (!positions.length || !duration) return null;

    return (
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
            {positions.map(pos => {
                const leftPercent = (pos.timestamp / duration) * 100;
                const isNearby = Math.abs(currentTime - pos.timestamp) < 0.1;
                return (
                    <div
                        key={pos.positionId}
                        className="absolute top-0 bottom-0 pointer-events-auto cursor-pointer group"
                        style={{ left: `${leftPercent}%` }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSeekToPosition(pos.timestamp);
                        }}
                    >
                        {/* Marker line */}
                        <div className={`absolute top-0 bottom-0 w-0.5 transition-all ${
                            isNearby ? 'bg-orange-400' : 'bg-yellow-500/60 group-hover:bg-yellow-400'
                        }`} />
                        {/* Label */}
                        <div className={`absolute -top-5 -translate-x-1/2 px-1 py-0.5 rounded text-[8px] font-black transition-all ${
                            isNearby
                                ? 'bg-orange-500 text-white scale-110'
                                : 'bg-yellow-500/80 text-black group-hover:bg-yellow-400'
                        }`}>
                            {pos.positionId}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// --- MAIN ENHANCED VIDEO PLAYER ---
export interface EnhancedVideoPlayerProps {
    analysis: FullSwingAnalysis;
    onBack: () => void;
    onViewPosition: (positionId: SwingPositionId) => void;
    onViewReport: () => void;
}

export const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
    analysis,
    onBack,
    onViewPosition,
    onViewReport,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(0.5);
    const [isMuted, setIsMuted] = useState(true);
    const [containerDims, setContainerDims] = useState({ width: 0, height: 0 });

    // Annotation state
    const [activeTool, setActiveTool] = useState<ExtendedToolType | null>(null);
    const [annotations, setAnnotations] = useState<ExtendedAnnotation[]>([]);
    const [annotationColor, setAnnotationColor] = useState('#FF8200');

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Active position tracking
    const [nearestPosition, setNearestPosition] = useState<DetectedPosition | null>(null);

    // Skeleton overlay
    const [showSkeletonOverlay, setShowSkeletonOverlay] = useState(false);
    const skeletonCanvasRef = useRef<HTMLCanvasElement>(null);

    // Undo history
    const [annotationHistory, setAnnotationHistory] = useState<ExtendedAnnotation[][]>([]);

    // Loop between positions
    const [loopRange, setLoopRange] = useState<{ start: number; end: number } | null>(null);

    // Touch scrubbing
    const [isTouchScrubbing, setIsTouchScrubbing] = useState(false);
    const touchScrubRef = useRef<{ startX: number; startTime: number }>({ startX: 0, startTime: 0 });

    // Zoom
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

    // Sync video time
    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;
        const onTimeUpdate = () => setCurrentTime(vid.currentTime);
        const onLoadedMeta = () => setDuration(vid.duration);
        vid.addEventListener('timeupdate', onTimeUpdate);
        vid.addEventListener('loadedmetadata', onLoadedMeta);
        return () => {
            vid.removeEventListener('timeupdate', onTimeUpdate);
            vid.removeEventListener('loadedmetadata', onLoadedMeta);
        };
    }, []);

    // Playback rate
    useEffect(() => {
        if (videoRef.current) videoRef.current.playbackRate = playbackRate;
    }, [playbackRate]);

    // Play/Pause
    useEffect(() => {
        if (videoRef.current) {
            isPlaying ? videoRef.current.play() : videoRef.current.pause();
        }
    }, [isPlaying]);

    // Container dimensions
    useEffect(() => {
        const update = () => {
            if (containerRef.current) {
                setContainerDims({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    // Track nearest position
    useEffect(() => {
        const nearest = analysis.positions.reduce<DetectedPosition | null>((closest, pos) => {
            if (!closest) return pos;
            return Math.abs(pos.timestamp - currentTime) < Math.abs(closest.timestamp - currentTime) ? pos : closest;
        }, null);
        setNearestPosition(nearest);
    }, [currentTime, analysis.positions]);

    // Draw skeleton when near a position
    useEffect(() => {
        if (!showSkeletonOverlay || !nearestPosition || !skeletonCanvasRef.current) return;
        const canvas = skeletonCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = containerDims.width;
        canvas.height = containerDims.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (Math.abs(nearestPosition.timestamp - currentTime) < 0.3) {
            drawSkeleton(ctx, nearestPosition.skeletonData, canvas.width, canvas.height, {
                jointRadius: 4,
                lineWidth: 2,
                opacity: 0.7,
                highlightClub: true,
            });
        }
    }, [showSkeletonOverlay, nearestPosition, currentTime, containerDims]);

    const handleSeek = useCallback((time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, []);

    const handleFrameStep = useCallback((frames: number) => {
        const step = 1 / 30; // ~30fps
        const newTime = Math.min(Math.max(0, currentTime + frames * step), duration);
        handleSeek(newTime);
    }, [currentTime, duration, handleSeek]);

    const handleScrubberClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        handleSeek(pos * duration);
    }, [duration, handleSeek]);

    // Touch scrubbing on the video area
    const handleVideoTouchStart = useCallback((e: React.TouchEvent) => {
        if (activeTool) return; // don't interfere with drawing
        touchScrubRef.current = { startX: e.touches[0].clientX, startTime: currentTime };
        setIsTouchScrubbing(true);
        setIsPlaying(false);
    }, [activeTool, currentTime]);

    const handleVideoTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isTouchScrubbing || activeTool) return;
        const dx = e.touches[0].clientX - touchScrubRef.current.startX;
        const sensitivity = duration / (containerDims.width * 2); // half screen = full duration
        const newTime = Math.max(0, Math.min(duration, touchScrubRef.current.startTime + dx * sensitivity));
        handleSeek(newTime);
    }, [isTouchScrubbing, activeTool, duration, containerDims.width, handleSeek]);

    const handleVideoTouchEnd = useCallback(() => {
        setIsTouchScrubbing(false);
    }, []);

    // Loop enforcement
    useEffect(() => {
        if (!loopRange || !videoRef.current) return;
        const vid = videoRef.current;
        const checkLoop = () => {
            if (vid.currentTime >= loopRange.end) {
                vid.currentTime = loopRange.start;
            }
        };
        vid.addEventListener('timeupdate', checkLoop);
        return () => vid.removeEventListener('timeupdate', checkLoop);
    }, [loopRange]);

    // Loop between two positions
    const toggleLoopBetweenPositions = useCallback((posA: SwingPositionId, posB: SwingPositionId) => {
        if (loopRange) {
            setLoopRange(null);
            return;
        }
        const pA = analysis.positions.find(p => p.positionId === posA);
        const pB = analysis.positions.find(p => p.positionId === posB);
        if (pA && pB) {
            const start = Math.min(pA.timestamp, pB.timestamp);
            const end = Math.max(pA.timestamp, pB.timestamp);
            setLoopRange({ start, end });
            handleSeek(start);
            setIsPlaying(true);
        }
    }, [loopRange, analysis.positions, handleSeek]);

    // Undo annotation
    const handleUndo = useCallback(() => {
        if (annotations.length === 0) return;
        setAnnotationHistory(prev => [...prev, annotations]);
        setAnnotations(prev => prev.slice(0, -1));
    }, [annotations]);

    // Redo annotation
    const handleRedo = useCallback(() => {
        if (annotationHistory.length === 0) return;
        const lastState = annotationHistory[annotationHistory.length - 1];
        setAnnotations(lastState);
        setAnnotationHistory(prev => prev.slice(0, -1));
    }, [annotationHistory]);

    // Zoom controls
    const handleZoomIn = useCallback(() => {
        setZoomLevel(prev => Math.min(prev + 0.5, 4));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoomLevel(prev => {
            const next = Math.max(prev - 0.5, 1);
            if (next === 1) setPanOffset({ x: 0, y: 0 });
            return next;
        });
    }, []);

    // Recording
    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                audioChunksRef.current = [];
                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) audioChunksRef.current.push(e.data);
                };
                recorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    // In production, upload this blob
                    console.log('Recording saved:', audioBlob.size, 'bytes');
                    stream.getTracks().forEach(t => t.stop());
                };
                recorder.start();
                mediaRecorderRef.current = recorder;
                setIsRecording(true);
            } catch (err) {
                console.error('Microphone access denied:', err);
            }
        }
    };

    const formatTime = (t: number) => {
        const s = Math.floor(t);
        const ms = Math.floor((t % 1) * 100);
        return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    const tools: { id: ExtendedToolType; icon: string; label: string }[] = [
        { id: 'LINE', icon: '📏', label: 'Line' },
        { id: 'ARROW', icon: '➡️', label: 'Arrow' },
        { id: 'CIRCLE', icon: '⭕', label: 'Circle' },
        { id: 'ANGLE', icon: '📐', label: 'Angle' },
        { id: 'FREEHAND', icon: '✏️', label: 'Draw' },
    ];

    const colors = ['#FF8200', '#EF4444', '#22C55E', '#3B82F6', '#A855F7', '#FFFFFF'];

    return (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-[#111827] border-b border-gray-800 safe-area-top z-40">
                <button onClick={onBack} className="p-2 text-gray-400 hover:text-white flex items-center gap-1">
                    <Icons.ChevronLeft /> <span className="text-xs">Back</span>
                </button>
                <div className="text-center">
                    <Text variant="h4" color="white" className="text-sm font-bold">{analysis.clubUsed} Analysis</Text>
                    <Text className="text-[10px] text-gray-500">
                        Score: {analysis.overallScore} ({analysis.overallGrade}) • {analysis.cameraAngle.replace('_', ' ')}
                    </Text>
                </div>
                <div className="flex gap-2">
                    <button onClick={onViewReport} className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-[10px] font-bold hover:bg-orange-500/30">
                        Report
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-white">
                        <Icons.Share />
                    </button>
                </div>
            </div>

            {/* Video Area */}
            <div
                ref={containerRef}
                className="flex-1 relative bg-black flex items-center justify-center overflow-hidden"
                onTouchStart={handleVideoTouchStart}
                onTouchMove={handleVideoTouchMove}
                onTouchEnd={handleVideoTouchEnd}
            >
                <video
                    ref={videoRef}
                    src={analysis.videoUrl}
                    className="max-h-full max-w-full transition-transform duration-100"
                    style={{
                        transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                    }}
                    playsInline
                    loop={!loopRange}
                    muted={isMuted}
                    poster={analysis.thumbnailUrl}
                />

                {/* Zoom level indicator */}
                {zoomLevel > 1 && (
                    <div className="absolute bottom-3 left-3 z-30 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                        <span className="text-[10px] font-bold text-orange-400">{zoomLevel.toFixed(1)}x zoom</span>
                    </div>
                )}

                {/* Touch scrub indicator */}
                {isTouchScrubbing && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl">
                        <span className="text-lg font-mono font-black text-orange-400 tabular-nums">{formatTime(currentTime)}</span>
                    </div>
                )}

                {/* Loop range indicator */}
                {loopRange && (
                    <div className="absolute top-3 right-14 z-20 bg-purple-500/80 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <Icons.Repeat />
                        <span className="text-[9px] font-bold text-white">Loop Active</span>
                        <button onClick={() => setLoopRange(null)} className="ml-1 text-white/70 hover:text-white">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                )}

                {/* Skeleton overlay canvas */}
                {showSkeletonOverlay && (
                    <canvas
                        ref={skeletonCanvasRef}
                        className="absolute inset-0 z-10 pointer-events-none"
                        style={{ width: containerDims.width, height: containerDims.height }}
                    />
                )}

                {/* Drawing canvas */}
                <DrawingCanvas
                    width={containerDims.width}
                    height={containerDims.height}
                    activeTool={activeTool}
                    annotations={annotations}
                    currentTimestamp={currentTime}
                    onAddAnnotation={(ann) => {
                        setAnnotations(prev => [...prev, ann]);
                        setActiveTool(null);
                    }}
                    annotationColor={annotationColor}
                />

                {/* Play button overlay */}
                {!isPlaying && !activeTool && (
                    <div
                        className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer"
                        onClick={() => setIsPlaying(true)}
                    >
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/30 hover:scale-110 transition-transform">
                            <Icons.Play />
                        </div>
                    </div>
                )}

                {/* Position indicator */}
                {nearestPosition && Math.abs(nearestPosition.timestamp - currentTime) < 0.3 && (
                    <div className="absolute top-3 left-3 z-20 animate-in fade-in duration-200">
                        <button
                            onClick={() => onViewPosition(nearestPosition.positionId)}
                            className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 flex items-center gap-2 hover:bg-black/80 transition-colors"
                        >
                            <span className="text-lg font-black text-orange-400">{nearestPosition.positionId}</span>
                            <div>
                                <span className="text-[10px] text-gray-300 block">
                                    {SWING_POSITIONS.find(p => p.id === nearestPosition.positionId)?.name}
                                </span>
                                <span className="text-[10px] font-bold text-white">
                                    Grade: {nearestPosition.overallGrade}
                                </span>
                            </div>
                        </button>
                    </div>
                )}

                {/* Recording indicator */}
                {isRecording && (
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-red-500/80 backdrop-blur-sm px-3 py-1.5 rounded-full animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-white" />
                        <span className="text-[10px] font-bold text-white">REC</span>
                    </div>
                )}
            </div>

            {/* Enhanced Timeline/Scrubber */}
            <div className="bg-[#111827] border-t border-gray-800">
                {/* Scrub bar with position markers */}
                <div
                    className="relative h-12 cursor-pointer group mx-2 mt-1"
                    onClick={handleScrubberClick}
                >
                    {/* Filmstrip background */}
                    <div className="absolute inset-0 flex opacity-10 overflow-hidden rounded">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div key={i} className="flex-1 border-r border-gray-600 bg-gray-800" />
                        ))}
                    </div>

                    {/* Progress fill */}
                    <div
                        className="absolute top-0 bottom-0 left-0 bg-orange-500/20 border-r-2 border-orange-500 transition-[width] duration-75"
                        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    />

                    {/* Position markers */}
                    <PositionTimelineMarkers
                        positions={analysis.positions}
                        duration={duration}
                        currentTime={currentTime}
                        onSeekToPosition={handleSeek}
                    />

                    {/* Time display */}
                    <div className="absolute top-1 left-2 text-[10px] font-mono font-bold text-orange-500 bg-black/60 px-1.5 py-0.5 rounded z-10">
                        {formatTime(currentTime)}
                    </div>
                    <div className="absolute top-1 right-2 text-[10px] font-mono text-gray-500 bg-black/60 px-1.5 py-0.5 rounded z-10">
                        {formatTime(duration)}
                    </div>
                </div>

                {/* Position quick-jump row with loop controls */}
                <div className="flex gap-1 px-2 py-1 overflow-x-auto hide-scrollbar items-center">
                    {analysis.positions.map((pos, idx) => {
                        const isActive = nearestPosition?.positionId === pos.positionId && Math.abs(nearestPosition.timestamp - currentTime) < 0.3;
                        const isInLoop = loopRange && pos.timestamp >= loopRange.start && pos.timestamp <= loopRange.end;
                        return (
                            <button
                                key={pos.positionId}
                                onClick={() => handleSeek(pos.timestamp)}
                                onDoubleClick={() => {
                                    // Double-click: loop from this position to next
                                    const nextPos = analysis.positions[idx + 1];
                                    if (nextPos) {
                                        toggleLoopBetweenPositions(pos.positionId, nextPos.positionId);
                                    }
                                }}
                                className={`flex-shrink-0 px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${
                                    isActive
                                        ? 'bg-orange-500 text-white'
                                        : isInLoop
                                        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                                {pos.positionId}
                            </button>
                        );
                    })}
                    {/* Loop toggle indicator */}
                    <div className="flex-shrink-0 ml-1 text-[7px] text-gray-600">
                        dbl-tap = loop
                    </div>
                </div>

                {/* Transport Controls */}
                <div className="flex justify-between items-center px-3 py-2">
                    {/* Speed controls */}
                    <div className="flex gap-1">
                        {[0.1, 0.25, 0.5, 1.0].map(rate => (
                            <button
                                key={rate}
                                onClick={() => setPlaybackRate(rate)}
                                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                                    playbackRate === rate
                                        ? 'bg-orange-500 border-orange-500 text-white'
                                        : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                                }`}
                            >
                                {rate}x
                            </button>
                        ))}
                    </div>

                    {/* Play controls */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => handleFrameStep(-1)} className="text-gray-400 hover:text-white p-1 active:scale-90">
                            <Icons.SkipBack />
                        </button>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                        >
                            {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                        </button>
                        <button onClick={() => handleFrameStep(1)} className="text-gray-400 hover:text-white p-1 active:scale-90">
                            <Icons.SkipForward />
                        </button>
                    </div>

                    {/* Utility buttons */}
                    <div className="flex gap-1.5 items-center">
                        <button
                            onClick={handleZoomIn}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-white transition-all"
                            title="Zoom in"
                        >
                            <Icons.ZoomIn />
                        </button>
                        <button
                            onClick={handleZoomOut}
                            className={`p-1.5 rounded-lg transition-all ${zoomLevel > 1 ? 'text-orange-400' : 'text-gray-600'}`}
                            title="Zoom out"
                        >
                            <Icons.ZoomOut />
                        </button>
                        <div className="w-px h-5 bg-gray-700" />
                        <button
                            onClick={() => setShowSkeletonOverlay(!showSkeletonOverlay)}
                            className={`p-1.5 rounded-lg text-[10px] transition-all ${
                                showSkeletonOverlay ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500 hover:text-white'
                            }`}
                            title="Toggle skeleton overlay"
                        >
                            🦴
                        </button>
                        <button
                            onClick={toggleRecording}
                            className={`p-1.5 rounded-lg transition-all ${
                                isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:text-white'
                            }`}
                            title="Record narration"
                        >
                            {isRecording ? <Icons.MicOff /> : <Icons.Mic />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Annotation Toolbar */}
            <div className="bg-[#1F2937] border-t border-gray-700 p-2 safe-area-bottom">
                <div className="flex items-center justify-between">
                    {/* Tools */}
                    <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
                        {tools.map(tool => (
                            <button
                                key={tool.id}
                                onClick={() => {
                                    setIsPlaying(false);
                                    setActiveTool(activeTool === tool.id ? null : tool.id);
                                }}
                                className={`flex flex-col items-center justify-center min-w-[48px] h-12 rounded-xl transition-all ${
                                    activeTool === tool.id
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/50'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                                <span className="text-base">{tool.icon}</span>
                                <span className="text-[8px] font-bold uppercase">{tool.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Color picker */}
                    <div className="flex gap-1 mx-2">
                        {colors.map(color => (
                            <button
                                key={color}
                                onClick={() => setAnnotationColor(color)}
                                className={`w-5 h-5 rounded-full border-2 transition-all ${
                                    annotationColor === color ? 'border-white scale-110' : 'border-gray-600'
                                }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>

                    {/* Undo/Redo/Clear */}
                    <div className="flex gap-1 items-center">
                        <button
                            onClick={handleUndo}
                            className={`p-2 rounded-lg transition-all ${annotations.length > 0 ? 'text-white hover:bg-gray-700' : 'text-gray-700'}`}
                            title="Undo"
                        >
                            <Icons.Undo />
                        </button>
                        <button
                            onClick={() => setAnnotations([])}
                            className="px-2.5 py-1.5 rounded-xl bg-gray-800 text-red-400 hover:bg-gray-700 text-[10px] font-bold"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

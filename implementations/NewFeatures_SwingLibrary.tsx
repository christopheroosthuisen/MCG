/**
 * ============================================================
 * MCG - NEW FEATURES: SWING VIDEO LIBRARY
 * ============================================================
 *
 * Inspired by: V1 Golf, Hudl Technique, Zepp Golf
 *
 * This file contains components for swing video management:
 * - Video Collection Manager
 * - Frame-by-Frame Analysis
 * - Pro Comparison Tools
 * - Swing Trends Over Time
 * - Video Sharing & Feedback
 *
 * Copy this entire file into your AI Studio project.
 * ============================================================
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { COLORS } from '../constants';

// ============================================================
// TYPES
// ============================================================

export interface SwingVideo {
    id: string;
    recordedAt: Date;
    club: string;
    angle: 'FACE_ON' | 'DOWN_THE_LINE' | 'OTHER';
    duration: number;
    thumbnailUrl: string;
    videoUrl: string;
    tags: string[];
    rating: 1 | 2 | 3 | 4 | 5;
    keyPositions: KeyPosition[];
    annotations: Annotation[];
    folderId?: string;
    notes?: string;
    aiScore?: number;
}

export interface KeyPosition {
    id: string;
    name: string;
    frameNumber: number;
    timestamp: number;
    angles: SwingAngle[];
    thumbnail?: string;
}

export interface SwingAngle {
    name: string;
    value: number;
    ideal?: number;
    tolerance?: number;
}

export interface Annotation {
    id: string;
    type: 'LINE' | 'CIRCLE' | 'ARROW' | 'ANGLE' | 'TEXT';
    frameNumber: number;
    points: { x: number; y: number }[];
    color: string;
    text?: string;
}

export interface VideoFolder {
    id: string;
    name: string;
    color: string;
    videoCount: number;
    createdAt: Date;
}

export interface ProSwing {
    id: string;
    playerName: string;
    tournament?: string;
    club: string;
    angle: 'FACE_ON' | 'DOWN_THE_LINE';
    videoUrl: string;
    thumbnailUrl: string;
    keyMetrics: { name: string; value: string }[];
}

// ============================================================
// MOCK DATA
// ============================================================

export const MOCK_SWING_VIDEOS: SwingVideo[] = [
    {
        id: 'sv1',
        recordedAt: new Date(Date.now() - 86400000),
        club: 'Driver',
        angle: 'DOWN_THE_LINE',
        duration: 3.2,
        thumbnailUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
        videoUrl: '',
        tags: ['Driver', 'Good', 'Range'],
        rating: 4,
        keyPositions: [
            { id: 'kp1', name: 'Address', frameNumber: 0, timestamp: 0, angles: [{ name: 'Spine Tilt', value: 6, ideal: 5 }] },
            { id: 'kp2', name: 'Top of Backswing', frameNumber: 45, timestamp: 1.5, angles: [{ name: 'Shoulder Turn', value: 92, ideal: 90 }] },
            { id: 'kp3', name: 'Impact', frameNumber: 78, timestamp: 2.6, angles: [{ name: 'Shaft Lean', value: 4, ideal: 5 }] }
        ],
        annotations: [],
        aiScore: 85
    },
    {
        id: 'sv2',
        recordedAt: new Date(Date.now() - 86400000 * 3),
        club: '7 Iron',
        angle: 'FACE_ON',
        duration: 2.8,
        thumbnailUrl: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=400',
        videoUrl: '',
        tags: ['Iron', 'Practice'],
        rating: 3,
        keyPositions: [],
        annotations: [],
        aiScore: 72
    },
    {
        id: 'sv3',
        recordedAt: new Date(Date.now() - 86400000 * 7),
        club: 'Driver',
        angle: 'DOWN_THE_LINE',
        duration: 3.0,
        thumbnailUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
        videoUrl: '',
        tags: ['Driver', 'Slice Issue'],
        rating: 2,
        keyPositions: [],
        annotations: [],
        notes: 'Working on inside takeaway',
        aiScore: 58
    },
    {
        id: 'sv4',
        recordedAt: new Date(Date.now() - 86400000 * 14),
        club: 'Pitching Wedge',
        angle: 'FACE_ON',
        duration: 2.5,
        thumbnailUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12db464?w=400',
        videoUrl: '',
        tags: ['Wedge', 'Short Game'],
        rating: 4,
        keyPositions: [],
        annotations: [],
        aiScore: 88
    }
];

export const MOCK_FOLDERS: VideoFolder[] = [
    { id: 'f1', name: 'Driver Work', color: '#FF8200', videoCount: 12, createdAt: new Date() },
    { id: 'f2', name: 'Iron Practice', color: '#115740', videoCount: 8, createdAt: new Date() },
    { id: 'f3', name: 'Before/After', color: '#3B82F6', videoCount: 6, createdAt: new Date() }
];

export const MOCK_PRO_SWINGS: ProSwing[] = [
    {
        id: 'ps1',
        playerName: 'Rory McIlroy',
        tournament: 'Masters 2024',
        club: 'Driver',
        angle: 'DOWN_THE_LINE',
        videoUrl: '',
        thumbnailUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
        keyMetrics: [{ name: 'Club Speed', value: '128 mph' }, { name: 'X-Factor', value: '52°' }]
    },
    {
        id: 'ps2',
        playerName: 'Scottie Scheffler',
        tournament: 'PGA Championship',
        club: 'Driver',
        angle: 'FACE_ON',
        videoUrl: '',
        thumbnailUrl: 'https://images.unsplash.com/photo-1591123720664-325d62597771?w=400',
        keyMetrics: [{ name: 'Club Speed', value: '124 mph' }, { name: 'Hip Rotation', value: '45°' }]
    },
    {
        id: 'ps3',
        playerName: 'Jon Rahm',
        club: '7 Iron',
        angle: 'DOWN_THE_LINE',
        videoUrl: '',
        thumbnailUrl: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=400',
        keyMetrics: [{ name: 'Attack Angle', value: '-4.2°' }, { name: 'Shaft Lean', value: '6°' }]
    }
];

// ============================================================
// SWING VIDEO CARD
// ============================================================

export const SwingVideoCard: React.FC<{
    video: SwingVideo;
    onSelect: (video: SwingVideo) => void;
    onCompare?: (video: SwingVideo) => void;
    isSelected?: boolean;
    showScore?: boolean;
}> = ({ video, onSelect, onCompare, isSelected = false, showScore = true }) => {
    const angleIcons = {
        'FACE_ON': '👤',
        'DOWN_THE_LINE': '➡️',
        'OTHER': '📹'
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div
            className={`bg-white rounded-2xl overflow-hidden shadow-md cursor-pointer
                       transition-all duration-300 hover:shadow-lg
                       ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
            onClick={() => onSelect(video)}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-200">
                <img
                    src={video.thumbnailUrl}
                    alt={`${video.club} swing`}
                    className="w-full h-full object-cover"
                />

                {/* AI Score Badge */}
                {showScore && video.aiScore && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-white text-xs font-bold
                                   ${getScoreColor(video.aiScore)}`}>
                        {video.aiScore}
                    </div>
                )}

                {/* Duration */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-white text-xs">
                    {video.duration.toFixed(1)}s
                </div>

                {/* Angle Badge */}
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 rounded text-xs">
                    {angleIcons[video.angle]} {video.angle.replace('_', ' ')}
                </div>

                {/* Compare Button */}
                {onCompare && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCompare(video);
                        }}
                        className="absolute top-2 left-2 p-2 bg-white/90 rounded-lg hover:bg-white
                                   transition-all"
                    >
                        ⚖️
                    </button>
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">{video.club}</span>
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`text-sm ${star <= video.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>

                <p className="text-xs text-gray-500 mb-2">
                    {video.recordedAt.toLocaleDateString()}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                    {video.tags.slice(0, 3).map((tag, i) => (
                        <span
                            key={i}
                            className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ============================================================
// VIDEO FILTER BAR
// ============================================================

export const VideoFilterBar: React.FC<{
    clubs: string[];
    selectedClub: string | null;
    selectedAngle: SwingVideo['angle'] | null;
    sortBy: 'DATE' | 'RATING' | 'SCORE';
    onClubChange: (club: string | null) => void;
    onAngleChange: (angle: SwingVideo['angle'] | null) => void;
    onSortChange: (sort: 'DATE' | 'RATING' | 'SCORE') => void;
}> = ({ clubs, selectedClub, selectedAngle, sortBy, onClubChange, onAngleChange, onSortChange }) => {
    return (
        <div className="space-y-3">
            {/* Club Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => onClubChange(null)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                        ${!selectedClub ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                    style={!selectedClub ? { backgroundColor: COLORS.primary } : {}}
                >
                    All Clubs
                </button>
                {clubs.map((club) => (
                    <button
                        key={club}
                        onClick={() => onClubChange(club)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                            ${selectedClub === club ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                        style={selectedClub === club ? { backgroundColor: COLORS.primary } : {}}
                    >
                        {club}
                    </button>
                ))}
            </div>

            {/* Angle & Sort */}
            <div className="flex gap-4">
                <div className="flex gap-2">
                    {(['FACE_ON', 'DOWN_THE_LINE'] as const).map((angle) => (
                        <button
                            key={angle}
                            onClick={() => onAngleChange(selectedAngle === angle ? null : angle)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                ${selectedAngle === angle ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                            {angle === 'FACE_ON' ? '👤 Face On' : '➡️ DTL'}
                        </button>
                    ))}
                </div>

                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border-none"
                >
                    <option value="DATE">Sort: Date</option>
                    <option value="RATING">Sort: Rating</option>
                    <option value="SCORE">Sort: AI Score</option>
                </select>
            </div>
        </div>
    );
};

// ============================================================
// FOLDER SYSTEM
// ============================================================

export const FolderCard: React.FC<{
    folder: VideoFolder;
    onSelect: (folder: VideoFolder) => void;
}> = ({ folder, onSelect }) => {
    return (
        <div
            className="bg-white rounded-xl p-4 shadow-md cursor-pointer hover:shadow-lg transition-all"
            onClick={() => onSelect(folder)}
        >
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: folder.color }}
                >
                    📁
                </div>
                <div className="flex-1">
                    <p className="font-bold text-gray-900">{folder.name}</p>
                    <p className="text-xs text-gray-500">{folder.videoCount} videos</p>
                </div>
                <span className="text-gray-400">→</span>
            </div>
        </div>
    );
};

export const CreateFolderModal: React.FC<{
    onClose: () => void;
    onCreate: (name: string, color: string) => void;
}> = ({ onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#FF8200');

    const colors = ['#FF8200', '#115740', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444'];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
            <div className="bg-white rounded-3xl w-full max-w-md p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Create Folder</h3>

                <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 block mb-2">Folder Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Driver Practice"
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-orange-500"
                    />
                </div>

                <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700 block mb-2">Color</label>
                    <div className="flex gap-2">
                        {colors.map((c) => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-10 h-10 rounded-lg transition-all
                                    ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold bg-gray-200 text-gray-700 active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onCreate(name, color)}
                        disabled={!name}
                        className={`flex-1 py-3 rounded-xl font-bold text-white
                            ${name ? 'active:scale-95' : 'opacity-50'}`}
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// FRAME SCRUBBER
// ============================================================

export const FrameScrubber: React.FC<{
    totalFrames: number;
    currentFrame: number;
    keyPositions: KeyPosition[];
    onFrameChange: (frame: number) => void;
    onKeyPositionClick: (position: KeyPosition) => void;
}> = ({ totalFrames, currentFrame, keyPositions, onFrameChange, onKeyPositionClick }) => {
    const scrubberRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        handleMove(e.clientX);
    }, []);

    const handleMove = useCallback((clientX: number) => {
        if (!scrubberRef.current) return;
        const rect = scrubberRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const frame = Math.round((x / rect.width) * totalFrames);
        onFrameChange(frame);
    }, [totalFrames, onFrameChange]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) handleMove(e.clientX);
        };
        const handleMouseUp = () => setIsDragging(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMove]);

    const progress = (currentFrame / totalFrames) * 100;

    return (
        <div className="space-y-2">
            {/* Main Scrubber */}
            <div
                ref={scrubberRef}
                className="relative h-8 bg-gray-200 rounded-lg cursor-pointer"
                onMouseDown={handleMouseDown}
            >
                {/* Progress */}
                <div
                    className="absolute top-0 bottom-0 left-0 rounded-lg"
                    style={{ width: `${progress}%`, backgroundColor: COLORS.primary }}
                />

                {/* Key Position Markers */}
                {keyPositions.map((pos) => (
                    <button
                        key={pos.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            onKeyPositionClick(pos);
                        }}
                        className="absolute top-0 bottom-0 w-1 bg-yellow-400 hover:w-2 transition-all"
                        style={{ left: `${(pos.frameNumber / totalFrames) * 100}%` }}
                        title={pos.name}
                    />
                ))}

                {/* Playhead */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                    style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
                />
            </div>

            {/* Frame Counter */}
            <div className="flex justify-between text-xs text-gray-500">
                <span>Frame {currentFrame}</span>
                <span>{totalFrames} total</span>
            </div>
        </div>
    );
};

// ============================================================
// KEY POSITION PANEL
// ============================================================

export const KeyPositionPanel: React.FC<{
    positions: KeyPosition[];
    currentPosition: KeyPosition | null;
    onPositionSelect: (position: KeyPosition) => void;
    onAddPosition: () => void;
}> = ({ positions, currentPosition, onPositionSelect, onAddPosition }) => {
    const positionNames = ['Address', 'Takeaway', 'Halfway Back', 'Top', 'Transition', 'Halfway Down', 'Impact', 'Follow Through', 'Finish'];

    return (
        <div className="bg-white rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900">Key Positions</h4>
                <button
                    onClick={onAddPosition}
                    className="text-sm font-medium px-3 py-1 rounded-lg"
                    style={{ color: COLORS.primary, backgroundColor: `${COLORS.primary}15` }}
                >
                    + Add
                </button>
            </div>

            <div className="space-y-2">
                {positions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                        No key positions marked yet
                    </p>
                ) : (
                    positions.map((pos) => (
                        <button
                            key={pos.id}
                            onClick={() => onPositionSelect(pos)}
                            className={`w-full p-3 rounded-xl text-left transition-all
                                ${currentPosition?.id === pos.id
                                    ? 'bg-orange-100 border-2 border-orange-500'
                                    : 'bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">{pos.name}</span>
                                <span className="text-xs text-gray-500">Frame {pos.frameNumber}</span>
                            </div>
                            {pos.angles.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {pos.angles.map((angle, i) => (
                                        <span
                                            key={i}
                                            className={`text-xs px-2 py-0.5 rounded-full
                                                ${angle.ideal && Math.abs(angle.value - angle.ideal) <= (angle.tolerance || 5)
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-200 text-gray-600'}`}
                                        >
                                            {angle.name}: {angle.value}°
                                        </span>
                                    ))}
                                </div>
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

// ============================================================
// ANGLE MEASUREMENT TOOL
// ============================================================

export const AngleMeasurementTool: React.FC<{
    angles: SwingAngle[];
    onAngleUpdate: (angles: SwingAngle[]) => void;
}> = ({ angles, onAngleUpdate }) => {
    const commonAngles = [
        { name: 'Spine Tilt', ideal: 5, tolerance: 3 },
        { name: 'Shoulder Turn', ideal: 90, tolerance: 10 },
        { name: 'Hip Turn', ideal: 45, tolerance: 10 },
        { name: 'Shaft Lean', ideal: 5, tolerance: 3 },
        { name: 'Knee Flex', ideal: 20, tolerance: 5 },
        { name: 'X-Factor', ideal: 45, tolerance: 10 }
    ];

    const [selectedAngle, setSelectedAngle] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');

    const handleAddAngle = (angleName: string, value: number) => {
        const template = commonAngles.find(a => a.name === angleName);
        const newAngle: SwingAngle = {
            name: angleName,
            value,
            ideal: template?.ideal,
            tolerance: template?.tolerance
        };
        onAngleUpdate([...angles, newAngle]);
        setSelectedAngle(null);
        setInputValue('');
    };

    return (
        <div className="bg-white rounded-2xl p-4 shadow-md">
            <h4 className="font-bold text-gray-900 mb-4">Angle Measurements</h4>

            {/* Current Angles */}
            <div className="space-y-2 mb-4">
                {angles.map((angle, i) => {
                    const isGood = angle.ideal && Math.abs(angle.value - angle.ideal) <= (angle.tolerance || 5);
                    return (
                        <div
                            key={i}
                            className={`p-3 rounded-xl flex items-center justify-between
                                ${isGood ? 'bg-green-50' : 'bg-gray-50'}`}
                        >
                            <span className="text-sm text-gray-700">{angle.name}</span>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold ${isGood ? 'text-green-600' : 'text-gray-900'}`}>
                                    {angle.value}°
                                </span>
                                {angle.ideal && (
                                    <span className="text-xs text-gray-400">
                                        (ideal: {angle.ideal}°)
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Angle */}
            {selectedAngle ? (
                <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-700 mb-2">{selectedAngle}</p>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Enter degrees"
                            className="flex-1 px-3 py-2 border rounded-lg text-center focus:outline-none focus:border-orange-500"
                        />
                        <button
                            onClick={() => handleAddAngle(selectedAngle, parseFloat(inputValue))}
                            disabled={!inputValue}
                            className={`px-4 py-2 rounded-lg font-medium text-white
                                ${inputValue ? 'active:scale-95' : 'opacity-50'}`}
                            style={{ backgroundColor: COLORS.primary }}
                        >
                            Add
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {commonAngles
                        .filter(a => !angles.find(existing => existing.name === a.name))
                        .map((angle) => (
                            <button
                                key={angle.name}
                                onClick={() => setSelectedAngle(angle.name)}
                                className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200"
                            >
                                + {angle.name}
                            </button>
                        ))}
                </div>
            )}
        </div>
    );
};

// ============================================================
// PRO COMPARISON VIEW
// ============================================================

export const ProComparisonView: React.FC<{
    userVideo: SwingVideo;
    onSelectPro: (pro: ProSwing) => void;
}> = ({ userVideo, onSelectPro }) => {
    const [selectedPro, setSelectedPro] = useState<ProSwing | null>(null);
    const [syncMode, setSyncMode] = useState<'IMPACT' | 'TOP' | 'MANUAL'>('IMPACT');

    // Filter pros by matching club and angle
    const matchingPros = MOCK_PRO_SWINGS.filter(
        pro => pro.angle === userVideo.angle
    );

    return (
        <div className="space-y-6">
            {/* Pro Selection */}
            <div className="bg-white rounded-2xl p-4 shadow-md">
                <h4 className="font-bold text-gray-900 mb-4">Compare to Pro</h4>

                <div className="grid grid-cols-3 gap-3">
                    {matchingPros.map((pro) => (
                        <button
                            key={pro.id}
                            onClick={() => {
                                setSelectedPro(pro);
                                onSelectPro(pro);
                            }}
                            className={`p-3 rounded-xl text-center transition-all
                                ${selectedPro?.id === pro.id
                                    ? 'bg-orange-100 border-2 border-orange-500'
                                    : 'bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-200 mx-auto mb-2 overflow-hidden">
                                <img src={pro.thumbnailUrl} alt={pro.playerName} className="w-full h-full object-cover" />
                            </div>
                            <p className="text-xs font-medium text-gray-900 truncate">{pro.playerName}</p>
                            <p className="text-xs text-gray-500">{pro.club}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sync Options */}
            {selectedPro && (
                <div className="bg-white rounded-2xl p-4 shadow-md">
                    <h4 className="font-bold text-gray-900 mb-4">Sync Point</h4>
                    <div className="flex gap-2">
                        {(['IMPACT', 'TOP', 'MANUAL'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setSyncMode(mode)}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all
                                    ${syncMode === mode ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                                style={syncMode === mode ? { backgroundColor: COLORS.primary } : {}}
                            >
                                {mode === 'IMPACT' && '💥 Impact'}
                                {mode === 'TOP' && '🔝 Top'}
                                {mode === 'MANUAL' && '✋ Manual'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Pro Metrics */}
            {selectedPro && (
                <div className="bg-white rounded-2xl p-4 shadow-md">
                    <h4 className="font-bold text-gray-900 mb-4">{selectedPro.playerName}'s Metrics</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {selectedPro.keyMetrics.map((metric, i) => (
                            <div key={i} className="p-3 bg-gray-50 rounded-xl text-center">
                                <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                                <p className="text-xs text-gray-500">{metric.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================
// SIDE BY SIDE PLAYER
// ============================================================

export const SideBySidePlayer: React.FC<{
    leftVideo: SwingVideo;
    rightVideo: SwingVideo | ProSwing;
    syncPoint: 'IMPACT' | 'TOP' | 'MANUAL';
}> = ({ leftVideo, rightVideo, syncPoint }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(0.5);

    return (
        <div className="bg-gray-900 rounded-3xl overflow-hidden">
            {/* Videos */}
            <div className="flex">
                <div className="flex-1 aspect-video bg-gray-800 relative">
                    <img
                        src={leftVideo.thumbnailUrl}
                        alt="Your swing"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-white text-xs">
                        You
                    </div>
                </div>
                <div className="w-px bg-gray-700" />
                <div className="flex-1 aspect-video bg-gray-800 relative">
                    <img
                        src={rightVideo.thumbnailUrl}
                        alt="Comparison"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-white text-xs">
                        {'playerName' in rightVideo ? rightVideo.playerName : rightVideo.club}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="p-4">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <button className="w-10 h-10 rounded-full bg-gray-700 text-white">
                        ⏮
                    </button>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-14 h-14 rounded-full text-white text-xl"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-700 text-white">
                        ⏭
                    </button>
                </div>

                {/* Speed Control */}
                <div className="flex items-center justify-center gap-2">
                    {[0.25, 0.5, 1].map((speed) => (
                        <button
                            key={speed}
                            onClick={() => setPlaybackSpeed(speed)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium
                                ${playbackSpeed === speed ? 'bg-white text-gray-900' : 'text-gray-400'}`}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>

                {/* Sync Indicator */}
                <p className="text-center text-xs text-gray-500 mt-2">
                    Synced at: {syncPoint}
                </p>
            </div>
        </div>
    );
};

// ============================================================
// SWING TRENDS CHART
// ============================================================

export const SwingTrendsChart: React.FC<{
    videos: SwingVideo[];
    metric: 'aiScore' | 'rating';
}> = ({ videos, metric }) => {
    const sortedVideos = [...videos].sort((a, b) =>
        a.recordedAt.getTime() - b.recordedAt.getTime()
    );

    const values = sortedVideos.map(v => metric === 'aiScore' ? (v.aiScore || 0) : v.rating * 20);
    const maxValue = Math.max(...values, 100);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;

    // Calculate trend
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const recentAvg = values.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, values.length);
    const trend = recentAvg > avg ? 'IMPROVING' : recentAvg < avg ? 'DECLINING' : 'STABLE';

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">Swing Progress</h3>
                    <p className="text-sm text-gray-500">
                        {metric === 'aiScore' ? 'AI Score' : 'Your Rating'} over time
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold
                    ${trend === 'IMPROVING' ? 'bg-green-100 text-green-700' : ''}
                    ${trend === 'DECLINING' ? 'bg-red-100 text-red-700' : ''}
                    ${trend === 'STABLE' ? 'bg-gray-100 text-gray-700' : ''}`}>
                    {trend === 'IMPROVING' && '↑ Improving'}
                    {trend === 'DECLINING' && '↓ Declining'}
                    {trend === 'STABLE' && '→ Stable'}
                </span>
            </div>

            {/* Chart */}
            <div className="relative h-40">
                <svg className="absolute inset-0" viewBox={`0 0 ${values.length * 60} 160`} preserveAspectRatio="none">
                    {/* Area */}
                    <path
                        d={`M 0 160 ${values.map((v, i) => {
                            const x = i * 60 + 30;
                            const y = 160 - ((v - minValue) / range) * 140;
                            return `L ${x} ${y}`;
                        }).join(' ')} L ${(values.length - 1) * 60 + 30} 160 Z`}
                        fill={COLORS.primary}
                        opacity="0.1"
                    />

                    {/* Line */}
                    <path
                        d={`M ${values.map((v, i) => {
                            const x = i * 60 + 30;
                            const y = 160 - ((v - minValue) / range) * 140;
                            return `${x} ${y}`;
                        }).join(' L ')}`}
                        stroke={COLORS.primary}
                        strokeWidth="3"
                        fill="none"
                    />

                    {/* Points */}
                    {values.map((v, i) => {
                        const x = i * 60 + 30;
                        const y = 160 - ((v - minValue) / range) * 140;
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="6"
                                fill={COLORS.primary}
                                stroke="white"
                                strokeWidth="2"
                            />
                        );
                    })}
                </svg>
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-2">
                {sortedVideos.map((v, i) => (
                    <span key={i} className="text-xs text-gray-400">
                        {v.recordedAt.getMonth() + 1}/{v.recordedAt.getDate()}
                    </span>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                        {Math.round(avg)}
                    </p>
                    <p className="text-xs text-gray-500">Average</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-green-600">{Math.max(...values)}</p>
                    <p className="text-xs text-gray-500">Best</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-600">{videos.length}</p>
                    <p className="text-xs text-gray-500">Videos</p>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// VIDEO SHARE MODAL
// ============================================================

export const VideoShareModal: React.FC<{
    video: SwingVideo;
    onClose: () => void;
    onShare: (target: 'COACH' | 'FRIEND' | 'SOCIAL', message?: string) => void;
}> = ({ video, onClose, onShare }) => {
    const [target, setTarget] = useState<'COACH' | 'FRIEND' | 'SOCIAL'>('COACH');
    const [message, setMessage] = useState('');
    const [includeAnnotations, setIncludeAnnotations] = useState(true);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
                <div
                    className="p-4 text-white"
                    style={{ backgroundColor: COLORS.primary }}
                >
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">Share Video</h3>
                        <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {/* Video Preview */}
                    <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
                        <img src={video.thumbnailUrl} alt="Video" className="w-full h-full object-cover" />
                    </div>

                    {/* Share Target */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Share With</label>
                        <div className="grid grid-cols-3 gap-2">
                            {([
                                { id: 'COACH' as const, icon: '👨‍🏫', label: 'Coach' },
                                { id: 'FRIEND' as const, icon: '👥', label: 'Friend' },
                                { id: 'SOCIAL' as const, icon: '🌐', label: 'Social' }
                            ]).map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setTarget(opt.id)}
                                    className={`p-3 rounded-xl text-center transition-all
                                        ${target === opt.id ? 'bg-orange-100 border-2 border-orange-500' : 'bg-gray-50'}`}
                                >
                                    <span className="text-2xl block mb-1">{opt.icon}</span>
                                    <span className="text-xs text-gray-600">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Add a note or question..."
                            className="w-full p-3 border rounded-xl resize-none focus:outline-none focus:border-orange-500"
                            rows={3}
                        />
                    </div>

                    {/* Options */}
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                        <input
                            type="checkbox"
                            checked={includeAnnotations}
                            onChange={(e) => setIncludeAnnotations(e.target.checked)}
                            className="w-5 h-5 rounded"
                        />
                        <span className="text-sm text-gray-700">Include annotations & drawings</span>
                    </label>

                    {/* Share Button */}
                    <button
                        onClick={() => onShare(target, message)}
                        className="w-full py-4 rounded-2xl font-bold text-white active:scale-95 transition-all"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        Share Video
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// SWING LIBRARY MAIN VIEW
// ============================================================

export const SwingLibrary: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'VIDEOS' | 'FOLDERS' | 'COMPARE' | 'TRENDS'>('VIDEOS');
    const [selectedVideo, setSelectedVideo] = useState<SwingVideo | null>(null);
    const [compareVideos, setCompareVideos] = useState<SwingVideo[]>([]);
    const [showShareModal, setShowShareModal] = useState(false);

    // Filters
    const [selectedClub, setSelectedClub] = useState<string | null>(null);
    const [selectedAngle, setSelectedAngle] = useState<SwingVideo['angle'] | null>(null);
    const [sortBy, setSortBy] = useState<'DATE' | 'RATING' | 'SCORE'>('DATE');

    const clubs = [...new Set(MOCK_SWING_VIDEOS.map(v => v.club))];

    const filteredVideos = MOCK_SWING_VIDEOS
        .filter(v => !selectedClub || v.club === selectedClub)
        .filter(v => !selectedAngle || v.angle === selectedAngle)
        .sort((a, b) => {
            if (sortBy === 'DATE') return b.recordedAt.getTime() - a.recordedAt.getTime();
            if (sortBy === 'RATING') return b.rating - a.rating;
            return (b.aiScore || 0) - (a.aiScore || 0);
        });

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-5 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Swing Library</h1>
                    <p className="text-sm text-gray-500">{MOCK_SWING_VIDEOS.length} videos</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    {(['VIDEOS', 'FOLDERS', 'COMPARE', 'TRENDS'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wide
                                border-b-2 transition-all
                                ${activeTab === tab
                                    ? 'border-orange-500 text-gray-900'
                                    : 'border-transparent text-gray-400'}`}
                            style={activeTab === tab ? { borderColor: COLORS.primary } : {}}
                        >
                            {tab === 'VIDEOS' && '📹 '}
                            {tab === 'FOLDERS' && '📁 '}
                            {tab === 'COMPARE' && '⚖️ '}
                            {tab === 'TRENDS' && '📈 '}
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="px-5 py-6">
                {activeTab === 'VIDEOS' && (
                    <>
                        {/* Filters */}
                        <div className="mb-6">
                            <VideoFilterBar
                                clubs={clubs}
                                selectedClub={selectedClub}
                                selectedAngle={selectedAngle}
                                sortBy={sortBy}
                                onClubChange={setSelectedClub}
                                onAngleChange={setSelectedAngle}
                                onSortChange={setSortBy}
                            />
                        </div>

                        {/* Video Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {filteredVideos.map((video) => (
                                <SwingVideoCard
                                    key={video.id}
                                    video={video}
                                    onSelect={setSelectedVideo}
                                    onCompare={(v) => setCompareVideos([...compareVideos, v])}
                                />
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'FOLDERS' && (
                    <div className="space-y-3">
                        {MOCK_FOLDERS.map((folder) => (
                            <FolderCard
                                key={folder.id}
                                folder={folder}
                                onSelect={(f) => console.log('Selected folder:', f.name)}
                            />
                        ))}
                        <button
                            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl
                                       text-gray-500 font-medium hover:border-orange-500 hover:text-orange-500
                                       transition-all"
                        >
                            + Create New Folder
                        </button>
                    </div>
                )}

                {activeTab === 'COMPARE' && (
                    <div className="space-y-6">
                        {compareVideos.length >= 2 ? (
                            <SideBySidePlayer
                                leftVideo={compareVideos[0]}
                                rightVideo={compareVideos[1]}
                                syncPoint="IMPACT"
                            />
                        ) : (
                            <div className="text-center py-12">
                                <span className="text-5xl mb-4 block">⚖️</span>
                                <h3 className="font-bold text-gray-900 text-lg mb-2">Compare Swings</h3>
                                <p className="text-gray-500 mb-4">
                                    Select 2 videos to compare side-by-side
                                </p>
                                <p className="text-sm text-gray-400">
                                    {compareVideos.length}/2 selected
                                </p>
                            </div>
                        )}

                        {/* Pro Comparison */}
                        {compareVideos.length === 1 && (
                            <ProComparisonView
                                userVideo={compareVideos[0]}
                                onSelectPro={(pro) => console.log('Compare with:', pro.playerName)}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'TRENDS' && (
                    <SwingTrendsChart videos={MOCK_SWING_VIDEOS} metric="aiScore" />
                )}
            </div>

            {/* Share Modal */}
            {showShareModal && selectedVideo && (
                <VideoShareModal
                    video={selectedVideo}
                    onClose={() => setShowShareModal(false)}
                    onShare={(target, msg) => {
                        console.log('Sharing to:', target, msg);
                        setShowShareModal(false);
                    }}
                />
            )}
        </div>
    );
};

// ============================================================
// USAGE EXAMPLE
// ============================================================

/*
import {
    SwingLibrary,
    SwingVideoCard,
    SideBySidePlayer,
    FrameScrubber,
    KeyPositionPanel,
    ProComparisonView,
    SwingTrendsChart,
    MOCK_SWING_VIDEOS,
    MOCK_PRO_SWINGS
} from './NewFeatures_SwingLibrary';

// Full Swing Library
const SwingScreen: React.FC = () => {
    return <SwingLibrary />;
};

// Individual Components
const VideoGallery: React.FC = () => {
    return (
        <div className="grid grid-cols-2 gap-4">
            {MOCK_SWING_VIDEOS.map(video => (
                <SwingVideoCard
                    key={video.id}
                    video={video}
                    onSelect={(v) => console.log('Selected:', v.id)}
                />
            ))}
        </div>
    );
};
*/

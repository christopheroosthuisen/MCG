
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { COLORS, MOCK_SWING_VIDEOS, MOCK_FOLDERS, MOCK_PRO_SWINGS } from '../constants';
import { SwingVideo, VideoFolder, ProSwing, KeyPosition, SwingAngle } from '../types';
import { Text, Button, Card, ScreenHeader } from './UIComponents';

const Icons = {
    Play: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
    Pause: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>,
    ChevronLeft: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
};

// --- SUB-COMPONENTS (Adapted from provided code) ---

const SwingVideoCard: React.FC<{
    video: SwingVideo;
    onSelect: (video: SwingVideo) => void;
    onCompare?: (video: SwingVideo) => void;
    isSelected?: boolean;
    showScore?: boolean;
}> = ({ video, onSelect, onCompare, isSelected = false, showScore = true }) => {
    const angleIcons: Record<string, string> = {
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
            <div className="relative aspect-video bg-gray-200">
                <img
                    src={video.thumbnailUrl}
                    alt={`${video.club} swing`}
                    className="w-full h-full object-cover"
                />
                {showScore && video.aiScore && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-white text-xs font-bold ${getScoreColor(video.aiScore)}`}>
                        {video.aiScore}
                    </div>
                )}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-white text-xs">
                    {video.duration.toFixed(1)}s
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 rounded text-xs">
                    {angleIcons[video.angle]} {video.angle.replace('_', ' ')}
                </div>
                {onCompare && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onCompare(video); }}
                        className="absolute top-2 left-2 p-2 bg-white/90 rounded-lg hover:bg-white transition-all text-xs font-bold"
                    >
                        ⚖️
                    </button>
                )}
            </div>
            <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900 text-sm">{video.club}</span>
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`text-xs ${star <= video.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                    </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">{video.recordedAt.toLocaleDateString()}</p>
                <div className="flex flex-wrap gap-1">
                    {video.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-600">{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const VideoFilterBar: React.FC<{
    clubs: string[];
    selectedClub: string | null;
    selectedAngle: SwingVideo['angle'] | null;
    sortBy: 'DATE' | 'RATING' | 'SCORE';
    onClubChange: (club: string | null) => void;
    onAngleChange: (angle: SwingVideo['angle'] | null) => void;
    onSortChange: (sort: 'DATE' | 'RATING' | 'SCORE') => void;
}> = ({ clubs, selectedClub, selectedAngle, sortBy, onClubChange, onAngleChange, onSortChange }) => {
    return (
        <div className="space-y-3 mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                <button
                    onClick={() => onClubChange(null)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!selectedClub ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                    style={!selectedClub ? { backgroundColor: COLORS.primary } : {}}
                >
                    All Clubs
                </button>
                {clubs.map((club) => (
                    <button
                        key={club}
                        onClick={() => onClubChange(club)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedClub === club ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                        style={selectedClub === club ? { backgroundColor: COLORS.primary } : {}}
                    >
                        {club}
                    </button>
                ))}
            </div>
            <div className="flex gap-4">
                <div className="flex gap-2">
                    {(['FACE_ON', 'DOWN_THE_LINE'] as const).map((angle) => (
                        <button
                            key={angle}
                            onClick={() => onAngleChange(selectedAngle === angle ? null : angle)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedAngle === angle ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                            {angle === 'FACE_ON' ? '👤 Face On' : '➡️ DTL'}
                        </button>
                    ))}
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border-none outline-none"
                >
                    <option value="DATE">Sort: Date</option>
                    <option value="RATING">Sort: Rating</option>
                    <option value="SCORE">Sort: AI Score</option>
                </select>
            </div>
        </div>
    );
};

const FrameScrubber: React.FC<{
    totalFrames: number;
    currentFrame: number;
    keyPositions: KeyPosition[];
    onFrameChange: (frame: number) => void;
}> = ({ totalFrames, currentFrame, keyPositions, onFrameChange }) => {
    const scrubberRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMove = useCallback((clientX: number) => {
        if (!scrubberRef.current) return;
        const rect = scrubberRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const frame = Math.round((x / rect.width) * totalFrames);
        onFrameChange(frame);
    }, [totalFrames, onFrameChange]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => { if (isDragging) handleMove(e.clientX); };
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
        <div className="space-y-2 py-4">
            <div
                ref={scrubberRef}
                className="relative h-8 bg-gray-800 rounded-lg cursor-pointer overflow-hidden border border-gray-700"
                onMouseDown={(e) => { setIsDragging(true); handleMove(e.clientX); }}
                onTouchStart={(e) => { setIsDragging(true); handleMove(e.touches[0].clientX); }}
                onTouchMove={(e) => { if (isDragging) handleMove(e.touches[0].clientX); }}
                onTouchEnd={() => setIsDragging(false)}
            >
                <div className="absolute top-0 bottom-0 left-0 bg-gray-700" style={{ width: `${progress}%` }} />
                {keyPositions.map((pos) => (
                    <div
                        key={pos.id}
                        className="absolute top-0 bottom-0 w-1 bg-yellow-500 z-10"
                        style={{ left: `${(pos.frameNumber / totalFrames) * 100}%` }}
                    />
                ))}
                <div className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] z-20" style={{ left: `${progress}%`, transform: 'translateX(-50%)' }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
                <span>Frame {currentFrame}</span>
                <span>{totalFrames} total</span>
            </div>
        </div>
    );
};

const AngleMeasurementTool: React.FC<{ angles: SwingAngle[] }> = ({ angles }) => {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-3 text-sm">Key Angles</h4>
            <div className="grid grid-cols-2 gap-2">
                {angles.map((angle, i) => {
                    const isGood = angle.ideal && Math.abs(angle.value - angle.ideal) <= (angle.tolerance || 5);
                    return (
                        <div key={i} className={`p-2 rounded-lg flex flex-col justify-center items-center ${isGood ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-800'}`}>
                            <span className="text-[10px] uppercase font-bold opacity-70">{angle.name}</span>
                            <span className="font-bold text-lg">{angle.value}°</span>
                        </div>
                    );
                })}
                {angles.length === 0 && <div className="col-span-2 text-xs text-gray-400 text-center py-2">No angles measured at this frame.</div>}
            </div>
        </div>
    );
};

const ProComparisonView: React.FC<{ userVideo: SwingVideo; onSelectPro: (pro: ProSwing) => void }> = ({ userVideo, onSelectPro }) => {
    const matchingPros = MOCK_PRO_SWINGS.filter(pro => pro.angle === userVideo.angle);
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-4 text-sm">Compare to Pro</h4>
            <div className="grid grid-cols-3 gap-3">
                {matchingPros.map((pro) => (
                    <button
                        key={pro.id}
                        onClick={() => onSelectPro(pro)}
                        className="p-2 rounded-xl text-center transition-all bg-gray-50 hover:bg-orange-50 hover:border-orange-200 border border-transparent"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-200 mx-auto mb-2 overflow-hidden border-2 border-white shadow-sm">
                            <img src={pro.thumbnailUrl} alt={pro.playerName} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-900 truncate">{pro.playerName}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const SideBySidePlayer: React.FC<{ leftVideo: SwingVideo; rightVideo: SwingVideo | ProSwing }> = ({ leftVideo, rightVideo }) => {
    return (
        <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex h-64">
                <div className="flex-1 bg-black relative border-r border-gray-800">
                    <img src={leftVideo.thumbnailUrl} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-[10px] font-bold">You</div>
                </div>
                <div className="flex-1 bg-black relative">
                    <img src={rightVideo.thumbnailUrl} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-[10px] font-bold">
                        {'playerName' in rightVideo ? rightVideo.playerName : rightVideo.club}
                    </div>
                </div>
            </div>
            <div className="p-4 bg-[#111827]">
                <div className="flex justify-center gap-6 text-white items-center">
                    <button className="text-gray-400 hover:text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg></button>
                    <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"><Icons.Play /></button>
                    <button className="text-gray-400 hover:text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg></button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN VIEWS ---

const SwingAnalysisDetail: React.FC<{ video: SwingVideo; onBack: () => void }> = ({ video, onBack }) => {
    const [currentFrame, setCurrentFrame] = useState(0);
    const totalFrames = 100; // Simulated
    const [isPlaying, setIsPlaying] = useState(false);

    // Get active key position for current frame if any
    const activeKeyPos = video.keyPositions.find(kp => Math.abs(kp.frameNumber - currentFrame) < 5);

    return (
        <div className="flex flex-col h-screen bg-black text-white animate-in slide-in-from-right duration-300 fixed inset-0 z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#111827] border-b border-gray-800 safe-area-top">
                <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white flex items-center gap-1">
                    <Icons.ChevronLeft /> Back
                </button>
                <div className="text-center">
                    <h3 className="font-bold text-sm">{video.club} Analysis</h3>
                    <p className="text-xs text-gray-500">{video.recordedAt.toLocaleDateString()}</p>
                </div>
                <div className="w-16"></div>
            </div>

            {/* Video Area */}
            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                <video src={video.videoUrl} className="max-h-full max-w-full" poster={video.thumbnailUrl} />
                
                {/* Overlay Angles if Key Position */}
                {activeKeyPos && (
                    <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                        {activeKeyPos.angles.map((a, i) => (
                            <div key={i} className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                                <div className="text-[10px] text-gray-300 uppercase">{a.name}</div>
                                <div className="text-lg font-bold text-white">{a.value}°</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="bg-[#111827] p-4 border-t border-gray-800 safe-area-bottom">
                <FrameScrubber 
                    totalFrames={totalFrames} 
                    currentFrame={currentFrame} 
                    keyPositions={video.keyPositions} 
                    onFrameChange={setCurrentFrame} 
                />
                
                <div className="flex justify-center items-center gap-8 mb-4">
                    <button className="text-gray-400 hover:text-white" onClick={() => setCurrentFrame(f => Math.max(0, f - 1))}>Prev</button>
                    <button 
                        className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                    </button>
                    <button className="text-gray-400 hover:text-white" onClick={() => setCurrentFrame(f => Math.min(totalFrames, f + 1))}>Next</button>
                </div>

                {/* Analysis Tools */}
                <div className="grid grid-cols-4 gap-2">
                    {['Line', 'Angle', 'Circle', 'Compare'].map(tool => (
                        <button key={tool} className="bg-gray-800 py-3 rounded-xl text-xs font-bold text-gray-300 hover:bg-gray-700 hover:text-white">
                            {tool}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const SwingLibrary: React.FC<{ onRecord: () => void }> = ({ onRecord }) => {
    const [viewMode, setViewMode] = useState<'LIBRARY' | 'DETAIL'>('LIBRARY');
    const [activeTab, setActiveTab] = useState<'VIDEOS' | 'FOLDERS' | 'COMPARE'>('VIDEOS');
    const [selectedVideo, setSelectedVideo] = useState<SwingVideo | null>(null);
    const [compareVideos, setCompareVideos] = useState<SwingVideo[]>([]);
    
    // Filters
    const [selectedClub, setSelectedClub] = useState<string | null>(null);
    const [selectedAngle, setSelectedAngle] = useState<SwingVideo['angle'] | null>(null);
    const [sortBy, setSortBy] = useState<'DATE' | 'RATING' | 'SCORE'>('DATE');

    const clubs: string[] = Array.from(new Set(MOCK_SWING_VIDEOS.map(v => v.club)));

    const filteredVideos = MOCK_SWING_VIDEOS
        .filter(v => !selectedClub || v.club === selectedClub)
        .filter(v => !selectedAngle || v.angle === selectedAngle)
        .sort((a, b) => {
            if (sortBy === 'DATE') return b.recordedAt.getTime() - a.recordedAt.getTime();
            if (sortBy === 'RATING') return b.rating - a.rating;
            return (b.aiScore || 0) - (a.aiScore || 0);
        });

    if (viewMode === 'DETAIL' && selectedVideo) {
        return <SwingAnalysisDetail video={selectedVideo} onBack={() => setViewMode('LIBRARY')} />;
    }

    return (
        <div className="bg-[#F5F5F7] min-h-screen pb-32 animate-in slide-in-from-right duration-300">
            <ScreenHeader 
                title="Swing Library" 
                subtitle="Analysis"
                rightAction={
                    <button onClick={onRecord} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-orange-600 transition-colors">
                        + New Swing
                    </button>
                }
            />

            <div className="px-4">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    {(['VIDEOS', 'FOLDERS', 'COMPARE'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-all ${activeTab === tab ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-400'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'VIDEOS' && (
                    <>
                        <VideoFilterBar
                            clubs={clubs}
                            selectedClub={selectedClub}
                            selectedAngle={selectedAngle}
                            sortBy={sortBy}
                            onClubChange={setSelectedClub}
                            onAngleChange={setSelectedAngle}
                            onSortChange={setSortBy}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredVideos.map((video) => (
                                <SwingVideoCard
                                    key={video.id}
                                    video={video}
                                    onSelect={(v) => { setSelectedVideo(v); setViewMode('DETAIL'); }}
                                    onCompare={(v) => { setCompareVideos(prev => [...prev, v]); setActiveTab('COMPARE'); }}
                                />
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'FOLDERS' && (
                    <div className="space-y-3">
                        {MOCK_FOLDERS.map(folder => (
                            <div key={folder.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl" style={{ backgroundColor: folder.color }}>📁</div>
                                <div className="flex-1">
                                    <div className="font-bold text-gray-900">{folder.name}</div>
                                    <div className="text-xs text-gray-500">{folder.videoCount} videos</div>
                                </div>
                                <div className="text-gray-400">→</div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'COMPARE' && (
                    <div className="space-y-6">
                        {compareVideos.length >= 2 ? (
                            <SideBySidePlayer leftVideo={compareVideos[0]} rightVideo={compareVideos[1]} />
                        ) : (
                            <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                <span className="text-4xl mb-4 block opacity-50">⚖️</span>
                                <h3 className="font-bold text-gray-900 mb-1">Compare Swings</h3>
                                <p className="text-gray-500 text-sm mb-4">Select videos to analyze side-by-side</p>
                                <p className="text-xs font-bold text-orange-500">{compareVideos.length}/2 Selected</p>
                            </div>
                        )}
                        
                        {compareVideos.length === 1 && (
                            <ProComparisonView userVideo={compareVideos[0]} onSelectPro={(pro) => setCompareVideos([compareVideos[0], pro as any])} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

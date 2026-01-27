import React, { useState, useEffect } from 'react';
import { PracticeGoal, TrackManSession, Drill } from '../types';
import { COLORS, MOCK_GOALS, MOCK_SESSIONS, MOCK_RECENT_SWINGS, MOCK_DRILLS } from '../constants';
import { Text, Card, Badge, ProgressBar, Button, Input, Tabs } from './UIComponents';
import { MetricCard } from './AnalysisViews';

const Icons = {
    Plus: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
    TrendUp: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
    Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
    MapPin: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
    Play: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
    ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
    Flag: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>,
    Filter: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>,
    Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    Stop: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="6" width="12" height="12"></rect></svg>,
    Minus: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Activity: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
    Grid: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
};

export const PracticeSystem: React.FC<{ onOpenTempoTool: () => void; onOpenBagOfShots: () => void }> = ({ onOpenTempoTool, onOpenBagOfShots }) => {
    const [activeTab, setActiveTab] = useState('DASHBOARD');
    const [isSessionActive, setIsSessionActive] = useState(false);

    return (
        <div className="space-y-6 pb-32 animate-in fade-in duration-500 relative">
            {/* Header */}
            <div className="px-1 pt-6 bg-white sticky top-0 z-10 pb-4">
                <Text variant="caption" className="uppercase font-bold tracking-widest text-orange-500 mb-1">The Lab</Text>
                <div className="flex justify-between items-end mb-4">
                    <Text variant="h1" className="mb-0">Practice Hub</Text>
                    <Button size="sm" variant="primary" icon={isSessionActive ? <Icons.TrendUp /> : <Icons.Plus />} onClick={() => setIsSessionActive(true)}>
                        {isSessionActive ? 'View Active Session' : 'Start Session'}
                    </Button>
                </div>
                <Tabs 
                    tabs={['DASHBOARD', 'GOALS', 'HISTORY', 'SWINGS']} 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab} 
                />
            </div>

            {activeTab === 'DASHBOARD' && <PracticeDashboard onOpenTempoTool={onOpenTempoTool} onOpenBagOfShots={onOpenBagOfShots} />}
            {activeTab === 'GOALS' && <GoalsView />}
            {activeTab === 'HISTORY' && <HistoryView />}
            {activeTab === 'SWINGS' && <SwingLibraryView />}

            {/* Global Practice Timer Overlay */}
            {isSessionActive && (
                <div className="fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom duration-300">
                    <PracticeTimer onClose={() => setIsSessionActive(false)} />
                </div>
            )}
        </div>
    );
};

const PracticeTimer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [shots, setShots] = useState(0);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        let interval: any = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (isMinimized) {
         return (
            <div className="bg-orange-500 text-white rounded-full px-4 py-2 shadow-lg flex items-center justify-between gap-4 cursor-pointer" onClick={() => setIsMinimized(false)}>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="font-mono font-bold">{formatTime(seconds)}</span>
                </div>
                <span className="text-xs font-bold uppercase">{shots} Shots</span>
            </div>
         );
    }

    return (
        <div className="bg-[#111827] text-white rounded-3xl p-5 shadow-2xl shadow-black/50 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <Text variant="caption" className="text-orange-500 font-bold uppercase tracking-widest text-[10px]">Active Session</Text>
                    <div className="font-mono text-4xl font-black tracking-tight mt-1">{formatTime(seconds)}</div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
                        <Icons.Minus />
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center justify-center border border-white/10">
                    <span className="text-3xl font-bold">{shots}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Shots Hit</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center justify-center border border-white/10 cursor-pointer hover:bg-white/10" onClick={() => setShots(s => s + 1)}>
                    <Icons.Plus />
                    <span className="text-[10px] text-gray-400 uppercase font-bold mt-1">Log Shot</span>
                </div>
            </div>

            <div className="flex gap-3">
                <Button 
                    variant={isActive ? 'secondary' : 'primary'} 
                    fullWidth 
                    onClick={() => setIsActive(!isActive)}
                    icon={isActive ? <Icons.Play /> : <Icons.Play />}
                >
                    {isActive ? 'Pause Timer' : 'Resume'}
                </Button>
                <Button variant="danger" onClick={onClose} icon={<Icons.Stop />}>
                    End
                </Button>
            </div>
        </div>
    );
};

const PracticeDashboard: React.FC<{ onOpenTempoTool: () => void; onOpenBagOfShots: () => void }> = ({ onOpenTempoTool, onOpenBagOfShots }) => {
    // Short Game Filtering State
    const [drillFilter, setDrillFilter] = useState<'ALL' | 'PUTTING' | 'CHIPPING' | 'BUNKER'>('ALL');

    // Logic to filter the Short Game & Putting Drills
    const filteredDrills = MOCK_DRILLS.filter(d => {
        if (drillFilter === 'ALL') {
            return d.category === 'PUTTING' || d.category === 'CHIPPING' || d.category === 'BUNKER' || d.category === 'SHORT_GAME';
        }
        if (drillFilter === 'CHIPPING') {
            return d.category === 'CHIPPING' || d.category === 'SHORT_GAME';
        }
        return d.category === drillFilter;
    });

    return (
        <div className="space-y-8">
            {/* Active Goal Highlight */}
            <section>
                <div className="flex justify-between items-center mb-4 px-1">
                    <Text variant="h3">Primary Focus</Text>
                    <Text variant="caption" className="text-orange-600 font-bold cursor-pointer">Edit Goal</Text>
                </div>
                <Card variant="filled" className="bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-8 opacity-5">
                         <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"></circle></svg>
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <Text variant="caption" className="text-gray-400 uppercase font-bold tracking-wider mb-1">Current Target</Text>
                                <Text variant="h2" color="white">{MOCK_GOALS[0].title}</Text>
                            </div>
                            <Badge variant="success">On Track</Badge>
                        </div>
                        
                        <div className="flex items-end gap-2 mb-2">
                            <Text variant="metric" color="white" className="text-5xl">{MOCK_GOALS[0].currentValue}</Text>
                            <Text variant="h4" className="text-gray-400 mb-2">/ {MOCK_GOALS[0].targetValue} {MOCK_GOALS[0].unit}</Text>
                        </div>
                        
                        <ProgressBar progress={MOCK_GOALS[0].progress} color={COLORS.primary} className="bg-gray-700 h-2 mb-2" />
                        <Text variant="caption" className="text-gray-400 text-xs">
                            +2 {MOCK_GOALS[0].unit} this week • {30} days remaining
                        </Text>
                    </div>
                </Card>
            </section>
            
            {/* Tools Section (Tempo Trainer & Bag of Shots) */}
            <section>
                 <Text variant="h3" className="mb-4 px-1">Tools</Text>
                 <div className="grid grid-cols-1 gap-4">
                    {/* Tempo Trainer Card */}
                    <Card 
                        variant="outlined" 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 group border-orange-100 bg-orange-50/30"
                        onClick={onOpenTempoTool}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Icons.Activity />
                            </div>
                            <div>
                                <Text variant="h4" className="text-base font-bold">Tempo Trainer</Text>
                                <Text variant="caption" className="text-xs">Perfect your swing rhythm</Text>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm group-hover:text-orange-500">
                            <Icons.ChevronRight />
                        </div>
                    </Card>

                    {/* Bag of Shots Card */}
                    <Card 
                        variant="outlined" 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 group border-gray-200"
                        onClick={onOpenBagOfShots}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Icons.Grid />
                            </div>
                            <div>
                                <Text variant="h4" className="text-base font-bold">Bag of Shots</Text>
                                <Text variant="caption" className="text-xs">Your mastery library</Text>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm group-hover:text-gray-900">
                            <Icons.ChevronRight />
                        </div>
                    </Card>
                 </div>
            </section>

             {/* Short Game Lab (Enhanced with Filtering) */}
             <section className="bg-green-50/50 p-4 -mx-4 rounded-3xl border border-green-50">
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                            <Icons.Flag />
                        </div>
                        <div>
                            <Text variant="h3" className="leading-none text-green-900">Short Game Lab</Text>
                            <Text variant="caption" className="text-xs text-green-700">Scoring zone drills</Text>
                        </div>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar px-1">
                    {['ALL', 'PUTTING', 'CHIPPING', 'BUNKER'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setDrillFilter(filter as any)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                                drillFilter === filter 
                                ? 'bg-green-700 text-white border-green-700 shadow-md' 
                                : 'bg-white text-green-800 border-green-200 hover:bg-green-50'
                            }`}
                        >
                            {filter.charAt(0) + filter.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
                
                {/* Drills Carousel */}
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                    {filteredDrills.length > 0 ? (
                        filteredDrills.map(drill => (
                            <div key={drill.id} className="min-w-[220px] max-w-[220px] bg-white rounded-2xl p-3 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow group">
                                <div className="h-28 rounded-xl bg-gray-200 mb-3 overflow-hidden relative">
                                    <img src={drill.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                        <Icons.Clock /> {drill.durationMinutes}m
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mb-1">
                                    <Badge variant={drill.category === 'PUTTING' ? 'info' : (drill.category === 'BUNKER' ? 'warning' : 'success')} className="text-[10px] py-0.5">
                                        {drill.category}
                                    </Badge>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{drill.difficulty}</span>
                                </div>
                                <Text variant="h4" className="text-sm font-bold mb-1 truncate">{drill.title}</Text>
                                <Text variant="caption" className="text-xs line-clamp-2 leading-relaxed">{drill.description}</Text>
                            </div>
                        ))
                    ) : (
                        <div className="w-full text-center py-8 text-gray-400 text-sm italic">
                            No drills found for this category.
                        </div>
                    )}
                </div>
            </section>

            {/* Recent Sessions */}
            <section>
                <Text variant="h3" className="mb-4 px-1">Recent Sessions</Text>
                <div className="space-y-4">
                    {MOCK_SESSIONS.map((session) => (
                        <Card key={session.id} className="p-4 cursor-pointer hover:bg-gray-50 border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="neutral" className="text-[10px]">{session.club}</Badge>
                                        <Text variant="caption" className="text-xs flex items-center gap-1">
                                            <Icons.Calendar /> {session.date.toLocaleDateString()}
                                        </Text>
                                    </div>
                                    <Text variant="caption" className="text-xs flex items-center gap-1 text-gray-400">
                                        <Icons.MapPin /> {session.location} • {session.shotsHit} shots
                                    </Text>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-gray-900">{session.consistencyScore}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase">Consistency</div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-2 mb-3 bg-gray-50 p-2 rounded-xl">
                                <div className="text-center">
                                    <div className="text-[10px] text-gray-400 font-bold">SPD</div>
                                    <div className="font-bold text-gray-800">{session.avgMetrics.clubSpeed}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] text-gray-400 font-bold">CRY</div>
                                    <div className="font-bold text-gray-800">{session.avgMetrics.carryDistance}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] text-gray-400 font-bold">SPN</div>
                                    <div className="font-bold text-gray-800">{session.avgMetrics.spinRate}</div>
                                </div>
                                <div className="text-center border-l border-gray-200">
                                    <div className="text-[10px] text-green-600 font-bold">MAX</div>
                                    <div className="font-bold text-green-700">{session.bestMetrics.clubSpeed}</div>
                                </div>
                            </div>

                            {session.notes && (
                                <Text variant="caption" className="text-xs italic bg-yellow-50 p-2 rounded text-yellow-800 border border-yellow-100">
                                    "{session.notes}"
                                </Text>
                            )}
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
};

const GoalsView: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                <div className="text-2xl">🤖</div>
                <div>
                    <Text variant="h4" className="text-blue-900 text-sm font-bold">AI Coach Recommendation</Text>
                    <Text variant="caption" className="text-blue-800 text-xs mt-1">
                        Based on your last 3 driver sessions, your spin rate is too high (2900rpm). 
                        Set a goal to lower it to 2400rpm to gain ~12 yards.
                    </Text>
                    <Button size="sm" variant="outline" className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-100">Set Spin Goal</Button>
                </div>
            </div>

            {MOCK_GOALS.map((goal) => (
                <Card key={goal.id} className="p-5 border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <Text variant="h3">{goal.title}</Text>
                            <Text variant="caption" className="text-xs">Deadline: {goal.deadline?.toLocaleDateString()}</Text>
                        </div>
                        <div className="text-right">
                             <Text variant="metric" color={COLORS.primary}>{goal.currentValue} <span className="text-lg text-gray-400 font-normal">{goal.unit}</span></Text>
                             <Text variant="caption" className="text-xs">Target: {goal.targetValue} {goal.unit}</Text>
                        </div>
                    </div>
                    <ProgressBar progress={goal.progress} />
                    <div className="flex justify-between mt-2 text-xs font-bold text-gray-400">
                        <span>Start</span>
                        <span>{goal.progress}% Achieved</span>
                        <span>Goal</span>
                    </div>
                </Card>
            ))}
        </div>
    );
};

const HistoryView: React.FC = () => {
    return (
        <div className="space-y-4">
             <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {['All', 'Driver', 'Irons', 'Wedges'].map((cat, i) => (
                    <button key={cat} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${i === 0 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {cat}
                    </button>
                ))}
            </div>
            
            {/* Reusing dashboard cards for now, normally would be a list view */}
             {MOCK_SESSIONS.map((session) => (
                <div key={session.id} className="flex gap-4 items-center p-3 border-b border-gray-100 last:border-0">
                     <div className="w-12 h-12 bg-gray-100 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-gray-500">{session.date.toLocaleDateString(undefined, {month:'short'})}</span>
                        <span className="text-lg font-bold text-gray-900">{session.date.getDate()}</span>
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between">
                            <Text variant="body" className="font-bold">{session.club} Session</Text>
                            <Text variant="caption" className="font-mono">{session.shotsHit} shots</Text>
                        </div>
                        <div className="flex gap-3 mt-1">
                            <span className="text-xs bg-gray-50 px-1.5 py-0.5 rounded text-gray-600">Avg Speed: <b>{session.avgMetrics.clubSpeed}</b></span>
                            <span className="text-xs bg-gray-50 px-1.5 py-0.5 rounded text-gray-600">Best: <b>{session.bestMetrics.clubSpeed}</b></span>
                        </div>
                     </div>
                     <Icons.ChevronRight />
                </div>
             ))}
        </div>
    );
};

const SwingLibraryView: React.FC = () => {
    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Upload New */}
            <div className="aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer">
                <Icons.Plus />
                <span className="text-xs font-bold mt-2">Add Swing</span>
            </div>

            {MOCK_RECENT_SWINGS.map((swing) => (
                <div key={swing.id} className="aspect-[3/4] rounded-2xl bg-gray-900 relative overflow-hidden group cursor-pointer">
                    <img src={swing.thumbnailUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                            <Icons.Play />
                         </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <Text variant="caption" color="white" className="font-bold text-xs mb-0.5">{swing.clubUsed}</Text>
                        <Text variant="caption" className="text-[10px] text-gray-300">{swing.date.toLocaleDateString()}</Text>
                         <div className="mt-1 flex items-center gap-1">
                            <Badge variant={swing.score > 80 ? 'success' : 'warning'} className="text-[10px] px-1.5 h-4">{swing.score}</Badge>
                         </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
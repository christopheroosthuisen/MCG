
import React from 'react';
import { UserProfile, ClubCategory } from '../types';
import { db } from '../services/dataService';
import { Text, Card, Badge, Button, ProgressBar } from './UIComponents';
import { COLORS } from '../constants';
import { SettingsHub } from './SettingsView';

const Icons = {
    Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    TrendingUp: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
    Award: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>,
    User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
};

export const ProfileView: React.FC = () => {
    const [showSettings, setShowSettings] = React.useState(false);
    const user = db.getUser();
    const handicapHistory = db.getHandicapHistory();
    const coach = db.getCoach();

    const bagByCategory: Record<string, typeof user.bag> = {
        'WOOD': user.bag.filter(c => c.category === 'WOOD'),
        'IRON': user.bag.filter(c => c.category === 'IRON'),
        'WEDGE': user.bag.filter(c => c.category === 'WEDGE'),
        'PUTTER': user.bag.filter(c => c.category === 'PUTTER'),
    };

    const DNAStat: React.FC<{ label: string; value: string; sub?: string; bar?: number }> = ({ label, value, sub, bar }) => (
        <div className="mb-4 last:mb-0">
            <div className="flex justify-between items-end mb-1">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</span>
                <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{value}</span>
                    {sub && <span className="text-xs text-gray-400 ml-1">{sub}</span>}
                </div>
            </div>
            {bar && <ProgressBar progress={bar} className="h-1.5" />}
        </div>
    );

    const StatBox: React.FC<{ label: string; value: string; trend?: string }> = ({ label, value, trend }) => (
        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">{label}</span>
            <span className="text-2xl font-black text-gray-900 leading-none">{value}</span>
            {trend && <span className="text-[10px] text-green-600 font-bold mt-1">{trend}</span>}
        </div>
    );

    if (showSettings) {
        return <SettingsHub onBack={() => setShowSettings(false)} />;
    }

    return (
        <div className="space-y-8 pb-32 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Profile Card */}
            <div className="px-1">
                <Card variant="filled" className="bg-white border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-gray-900 to-gray-800"></div>
                    <button 
                        onClick={() => setShowSettings(true)}
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
                    >
                        <Icons.Settings />
                    </button>
                    
                    <div className="relative pt-12 px-2 pb-2 text-center">
                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto mb-3 overflow-hidden bg-gray-200">
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <Text variant="h2" className="mb-1">{user.name}</Text>
                        <Text variant="caption" className="flex justify-center items-center gap-2 mb-4">
                            {user.homeCourse}
                        </Text>
                        
                        <div className="flex justify-center gap-2">
                            <Badge variant="dark">{user.memberStatus} Member</Badge>
                            <Badge variant="info">HCP {user.swingDNA.handicap > 0 ? '+' : ''}{user.swingDNA.handicap}</Badge>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Handicap Tracker */}
            <section className="px-1">
                <div className="flex justify-between items-center mb-3">
                    <Text variant="h3">Handicap Index</Text>
                    <button className="text-orange-500 text-xs font-bold flex items-center gap-1">View History</button>
                </div>
                <Card variant="outlined" className="p-5">
                    <div className="flex items-center justify-between mb-6">
                         <div>
                            <div className="text-4xl font-black text-gray-900 tracking-tighter">{user.swingDNA.handicap}</div>
                            <div className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded inline-block">Trending Lower</div>
                         </div>
                         <div className="text-right">
                             <div className="text-xs text-gray-400 font-bold uppercase mb-1">Low Index</div>
                             <div className="text-lg font-bold">{Math.min(...handicapHistory.map(h => h.index), user.swingDNA.handicap)}</div>
                         </div>
                    </div>
                    
                    <div className="h-24 flex items-end justify-between gap-2">
                        {handicapHistory.map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end items-center group">
                                <div 
                                    className="w-full bg-orange-100 group-hover:bg-orange-200 rounded-t-sm transition-all relative"
                                    style={{ height: `${(h.index / 10) * 100}%` }}
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-1 rounded">{h.index}</div>
                                </div>
                                <div className="text-[9px] text-gray-400 mt-1">{h.date.getMonth()+1}/{h.date.getDate()}</div>
                            </div>
                        ))}
                    </div>
                </Card>
            </section>

            {/* Coach Connection */}
            <section className="px-1">
                <Text variant="h3" className="mb-3">My Coach</Text>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        <img src={coach.avatarUrl} alt={coach.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <Text variant="h4" className="text-base font-bold">{coach.name}</Text>
                        <Text variant="caption" className="text-xs">{coach.title} • {coach.location}</Text>
                        <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" className="text-xs h-7 px-2">Message</Button>
                            <Button size="sm" variant="primary" className="text-xs h-7 px-2">Book Lesson</Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Swing DNA */}
            <section className="px-1">
                <div className="flex justify-between items-center mb-3">
                    <Text variant="h3">Swing DNA</Text>
                    <button className="text-orange-500 text-xs font-bold flex items-center gap-1"><Icons.Edit /> Edit</button>
                </div>
                <Card variant="outlined" className="p-5">
                    <DNAStat label="Driver Club Speed" value={`${user.swingDNA.driverSpeed}`} sub="mph" bar={(user.swingDNA.driverSpeed / 130) * 100} />
                    <DNAStat label="7-Iron Carry" value={`${user.swingDNA.ironCarry7}`} sub="yds" bar={(user.swingDNA.ironCarry7 / 200) * 100} />
                    <DNAStat label="Tempo" value={user.swingDNA.tempo} />
                    <DNAStat label="Typical Shape" value={user.swingDNA.typicalShape} />
                </Card>
            </section>

            {/* Performance Stats */}
            <section className="px-1">
                <Text variant="h3" className="mb-3">Season Stats</Text>
                <div className="grid grid-cols-3 gap-3">
                    <StatBox label="Scoring Avg" value={`${user.stats.avgScore}`} trend="↓ 1.2" />
                    <StatBox label="FIR %" value={`${user.stats.fairwaysHit}%`} />
                    <StatBox label="GIR %" value={`${user.stats.greensInRegulation}%`} />
                    <StatBox label="Putts/Rnd" value={`${user.stats.puttsPerRound}`} trend="↓ 0.5" />
                    <StatBox label="Rounds" value={`${user.stats.roundsPlayed}`} />
                    <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100 flex flex-col items-center justify-center cursor-pointer">
                        <span className="text-orange-500 font-bold text-xs">View All</span>
                        <div className="text-orange-500 mt-1"><Icons.TrendingUp /></div>
                    </div>
                </div>
            </section>

            {/* In The Bag */}
            <section className="px-1">
                <div className="flex justify-between items-center mb-3">
                    <Text variant="h3">In The Bag</Text>
                    <button className="text-gray-400 hover:text-gray-600"><Icons.Settings /></button>
                </div>
                <div className="space-y-4">
                    {['WOOD', 'IRON', 'WEDGE', 'PUTTER'].map((category) => {
                        const clubs = bagByCategory[category];
                        if (!clubs || clubs.length === 0) return null;
                        
                        return (
                            <div key={category} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                    <Text variant="caption" className="font-bold text-[10px] uppercase tracking-widest">{category}S</Text>
                                    <span className="text-[10px] text-gray-400 font-bold">{clubs.length} Clubs</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {clubs.map((club) => (
                                        <div key={club.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors group cursor-pointer">
                                            <div>
                                                <div className="font-bold text-sm text-gray-900">{club.name}</div>
                                                <div className="text-xs text-gray-500">{club.type} {club.loft ? `• ${club.loft}` : ''}</div>
                                            </div>
                                            <div className="text-right">
                                                 <div className="text-xs text-gray-400 font-mono">{club.shaft}</div>
                                                 <div className="text-[10px] text-orange-500 opacity-0 group-hover:opacity-100 font-bold uppercase mt-1">Details &gt;</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

import React, { useState } from 'react';
import { Text, Card, Badge, Button } from './UIComponents';
import { BagShotSlot, ShotLie, ShotShape } from '../types';
import { COLORS } from '../constants';

// Mock Data for the Bag
const MOCK_BAG_SLOTS: BagShotSlot[] = [
    { id: '1', title: 'Power Fade', distanceRange: '260y+', lie: 'TEE', shape: 'FADE', trajectory: 'HIGH', isMastered: true, masteryDate: new Date('2023-10-15') },
    { id: '2', title: 'High Draw', distanceRange: '260y+', lie: 'TEE', shape: 'DRAW', trajectory: 'HIGH', isMastered: false },
    { id: '3', title: 'Stinger', distanceRange: '220-240y', lie: 'FAIRWAY', shape: 'STRAIGHT', trajectory: 'LOW', isMastered: true, masteryDate: new Date('2023-11-02') },
    { id: '4', title: 'Stock 7 Iron', distanceRange: '170-175y', lie: 'FAIRWAY', shape: 'STRAIGHT', trajectory: 'STANDARD', isMastered: true, masteryDate: new Date('2023-09-10') },
    { id: '5', title: 'Bunker Blast', distanceRange: '10-20y', lie: 'BUNKER_GREEN', shape: 'STRAIGHT', trajectory: 'HIGH', isMastered: false },
    { id: '6', title: 'Flop Shot', distanceRange: '< 20y', lie: 'ROUGH', shape: 'STRAIGHT', trajectory: 'HIGH', isMastered: false },
    { id: '7', title: 'Punch Out', distanceRange: '100y', lie: 'ROUGH', shape: 'STRAIGHT', trajectory: 'LOW', isMastered: true, masteryDate: new Date('2023-12-01') },
    { id: '8', title: 'Bump & Run', distanceRange: '< 30y', lie: 'FAIRWAY', shape: 'STRAIGHT', trajectory: 'LOW', isMastered: true, masteryDate: new Date('2023-08-20') },
];

const Icons = {
    Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
    Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Filter: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>,
    ArrowLeft: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
};

export const BagOfShots: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [filter, setFilter] = useState<'ALL' | 'MASTERED' | 'MISSING'>('ALL');

    const filteredSlots = MOCK_BAG_SLOTS.filter(slot => {
        if (filter === 'MASTERED') return slot.isMastered;
        if (filter === 'MISSING') return !slot.isMastered;
        return true;
    });

    const masteryCount = MOCK_BAG_SLOTS.filter(s => s.isMastered).length;
    const progress = (masteryCount / MOCK_BAG_SLOTS.length) * 100;

    return (
        <div className="bg-[#F5F5F7] min-h-screen animate-in slide-in-from-right duration-300 flex flex-col">
            {/* Header */}
            <div className="bg-white p-4 pb-2 border-b border-gray-200 sticky top-0 z-20">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                        <Icons.ArrowLeft />
                    </button>
                    <Text variant="h3" className="text-base font-bold">My Bag of Shots</Text>
                    <div className="w-8"></div>
                </div>
                
                <div className="mb-4 px-2">
                    <div className="flex justify-between items-end mb-2">
                        <Text variant="caption" className="uppercase font-bold tracking-widest text-gray-500">Shot Mastery</Text>
                        <span className="text-xl font-black text-orange-500">{masteryCount}<span className="text-sm font-normal text-gray-400">/{MOCK_BAG_SLOTS.length}</span></span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                    {['ALL', 'MASTERED', 'MISSING'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                filter === f 
                                    ? 'bg-gray-900 text-white border-gray-900' 
                                    : 'bg-white text-gray-500 border-gray-200'
                            }`}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                    {filteredSlots.map(slot => (
                        <Card 
                            key={slot.id} 
                            variant={slot.isMastered ? 'elevated' : 'outlined'} 
                            className={`relative overflow-hidden group min-h-[160px] flex flex-col justify-between ${slot.isMastered ? 'border-orange-100' : 'bg-gray-50 border-dashed border-gray-300'}`}
                        >
                            {slot.isMastered ? (
                                <>
                                    {/* Mastered Visuals */}
                                    <div className="absolute top-0 right-0 p-2">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white shadow-sm">
                                            <Icons.Check />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 right-0 opacity-10 transform translate-x-4 translate-y-4">
                                        <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"></circle></svg>
                                    </div>
                                </>
                            ) : (
                                /* Missing Visuals */
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
                                    <div className="bg-white px-3 py-1 rounded-full shadow-sm text-xs font-bold text-gray-600">
                                        + Add Shot
                                    </div>
                                </div>
                            )}

                            <div>
                                <Badge variant={slot.isMastered ? 'success' : 'neutral'} className="mb-2 text-[10px] py-0.5">
                                    {slot.lie.replace('_', ' ')}
                                </Badge>
                                <Text variant="h4" className={`text-sm font-bold leading-tight ${slot.isMastered ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {slot.title}
                                </Text>
                                <Text variant="caption" className="text-[10px] mt-1 font-mono">
                                    {slot.distanceRange}
                                </Text>
                            </div>

                            <div className="mt-4 flex gap-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${slot.isMastered ? 'bg-white border-gray-200 text-gray-600' : 'bg-transparent border-gray-200 text-gray-400'}`}>
                                    {slot.shape}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${slot.isMastered ? 'bg-white border-gray-200 text-gray-600' : 'bg-transparent border-gray-200 text-gray-400'}`}>
                                    {slot.trajectory}
                                </span>
                            </div>
                        </Card>
                    ))}
                    
                    {/* Add Custom Slot */}
                    <button className="rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[160px] text-gray-400 hover:bg-gray-100 hover:border-gray-400 transition-colors">
                        <Icons.Plus />
                        <span className="text-xs font-bold mt-2">Create Custom Shot</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

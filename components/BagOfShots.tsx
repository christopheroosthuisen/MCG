import React, { useState, useEffect } from 'react';
import { Text, Card, Badge, Button } from './UIComponents';
import { BagShotSlot, ShotLie, ShotShape } from '../types';
import { COLORS } from '../constants';
import { db } from '../services/dataService';

const Icons = {
    Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
    Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Filter: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>,
    ArrowLeft: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
};

export const BagOfShots: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [filter, setFilter] = useState<'ALL' | 'MASTERED' | 'MISSING'>('ALL');
    const [slots, setSlots] = useState<BagShotSlot[]>([]);

    useEffect(() => {
        setSlots(db.getBagSlots());
    }, []);

    const toggleMastery = (id: string) => {
        const slot = slots.find(s => s.id === id);
        if (slot) {
            db.updateBagSlot(id, { isMastered: !slot.isMastered });
            setSlots([...db.getBagSlots()]); // Refresh local state from DB to reflect updates
        }
    };

    const filteredSlots = slots.filter(slot => {
        if (filter === 'MASTERED') return slot.isMastered;
        if (filter === 'MISSING') return !slot.isMastered;
        return true;
    });

    const masteryCount = slots.filter(s => s.isMastered).length;
    const progress = (masteryCount / Math.max(slots.length, 1)) * 100;

    return (
        <div className="bg-[#F5F5F7] min-h-screen animate-in slide-in-from-right duration-300 flex flex-col fixed inset-0 z-50">
            {/* Header */}
            <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-200 shadow-sm safe-area-top">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                        <Icons.ArrowLeft />
                    </button>
                    <Text variant="h3" className="text-base font-bold">My Bag of Shots</Text>
                    <div className="w-8"></div>
                </div>
                
                <div className="mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-end mb-2">
                        <Text variant="caption" className="uppercase font-bold tracking-widest text-gray-500 text-[10px]">Shot Mastery</Text>
                        <span className="text-2xl font-black text-orange-500 leading-none">{masteryCount}<span className="text-sm font-bold text-gray-400">/{slots.length}</span></span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-1000 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                    {['ALL', 'MASTERED', 'MISSING'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                filter === f 
                                    ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 p-4 overflow-y-auto pb-12">
                <div className="grid grid-cols-2 gap-4">
                    {filteredSlots.map(slot => (
                        <Card 
                            key={slot.id} 
                            onClick={() => toggleMastery(slot.id)}
                            variant={slot.isMastered ? 'elevated' : 'outlined'} 
                            className={`relative overflow-hidden group min-h-[160px] flex flex-col justify-between p-4 transition-all duration-300 cursor-pointer ${
                                slot.isMastered 
                                    ? 'border-orange-100 shadow-md hover:shadow-lg' 
                                    : 'bg-gray-50 border-dashed border-gray-300 opacity-90 hover:opacity-100'
                            }`}
                        >
                            {slot.isMastered ? (
                                <>
                                    {/* Mastered Visuals */}
                                    <div className="absolute top-3 right-3">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                                            <Icons.Check />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Missing Visuals */
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 z-10">
                                    <div className="bg-white px-3 py-1.5 rounded-full shadow-md text-xs font-bold text-gray-800">
                                        Master Shot
                                    </div>
                                </div>
                            )}

                            <div>
                                <Badge variant={slot.isMastered ? 'success' : 'neutral'} className="mb-2 text-[9px] py-0.5 border border-current/10">
                                    {slot.lie.replace('_', ' ')}
                                </Badge>
                                <Text variant="h4" className={`text-sm font-bold leading-tight ${slot.isMastered ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {slot.title}
                                </Text>
                                <Text variant="caption" className="text-[10px] mt-1 font-mono tracking-tight">
                                    {slot.distanceRange}
                                </Text>
                            </div>

                            <div className="mt-4 flex gap-1 flex-wrap">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${slot.isMastered ? 'bg-white border-gray-200 text-gray-600' : 'bg-transparent border-gray-200 text-gray-400'}`}>
                                    {slot.shape}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${slot.isMastered ? 'bg-white border-gray-200 text-gray-600' : 'bg-transparent border-gray-200 text-gray-400'}`}>
                                    {slot.trajectory}
                                </span>
                            </div>
                        </Card>
                    ))}
                    
                    {/* Add Custom Slot */}
                    <button className="rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[160px] text-gray-400 hover:bg-gray-100 hover:border-gray-400 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                            <Icons.Plus />
                        </div>
                        <span className="text-xs font-bold">Create Custom Shot</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
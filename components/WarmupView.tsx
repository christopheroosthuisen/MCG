
import React, { useState, useEffect } from 'react';
import { ScreenHeader, Card, Button, ProgressBar } from './UIComponents';
import { COLORS } from '../constants';

// --- TYPES ---
interface WarmupExercise {
    id: string;
    name: string;
    description: string;
    duration: number; 
    icon: string;
}

interface WarmupRoutine {
    id: string;
    name: string;
    duration: number;
    exercises: WarmupExercise[];
    color: string;
}

const EXERCISES: WarmupExercise[] = [
    { id: '1', name: 'Hip Circles', description: 'Rotate hips in wide circles', duration: 30, icon: '🔄' },
    { id: '2', name: 'Arm Swings', description: 'Cross chest dynamic stretch', duration: 30, icon: '💪' },
    { id: '3', name: 'Torso Twists', description: 'Club behind back rotations', duration: 45, icon: '🌪️' },
    { id: '4', name: 'Leg Swings', description: 'Forward and back dynamic', duration: 30, icon: '🦵' },
    { id: '5', name: 'Wrist Mob', description: 'Wrist rolls and flexes', duration: 20, icon: '🤲' },
    { id: '6', name: 'Squats', description: 'Bodyweight squats for activation', duration: 45, icon: '🏋️' },
];

const ROUTINES: WarmupRoutine[] = [
    { id: 'r1', name: 'Quick Tee Off', duration: 5, exercises: [EXERCISES[0], EXERCISES[1], EXERCISES[2]], color: 'bg-orange-500' },
    { id: 'r2', name: 'Full Body Prep', duration: 10, exercises: EXERCISES, color: 'bg-blue-600' },
    { id: 'r3', name: 'Mobility Focus', duration: 8, exercises: [EXERCISES[0], EXERCISES[2], EXERCISES[5]], color: 'bg-green-600' },
];

// --- COMPONENTS ---

const RoutinePlayer: React.FC<{ routine: WarmupRoutine; onComplete: () => void; onCancel: () => void }> = ({ routine, onComplete, onCancel }) => {
    const [index, setIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(routine.exercises[0].duration);
    const [isPaused, setIsPaused] = useState(false);

    const currentEx = routine.exercises[index];

    useEffect(() => {
        if (isPaused) return;
        
        if (timeLeft <= 0) {
            if (index < routine.exercises.length - 1) {
                setIndex(i => i + 1);
                setTimeLeft(routine.exercises[index + 1].duration);
            } else {
                onComplete();
            }
            return;
        }

        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isPaused, index]);

    const progress = ((currentEx.duration - timeLeft) / currentEx.duration) * 100;

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            <div className="p-4 flex justify-between items-center">
                <button onClick={onCancel} className="text-gray-500 font-bold">Exit</button>
                <div className="font-bold text-gray-900">{routine.name}</div>
                <div className="w-8"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="text-8xl mb-8 animate-bounce">{currentEx.icon}</div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">{currentEx.name}</h2>
                <p className="text-gray-500 mb-12 text-lg">{currentEx.description}</p>

                {/* Circular Timer */}
                <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="128" cy="128" r="120" stroke="#F3F4F6" strokeWidth="12" fill="none" />
                        <circle 
                            cx="128" cy="128" r="120" 
                            stroke={COLORS.primary} strokeWidth="12" fill="none"
                            strokeLinecap="round"
                            strokeDasharray={754}
                            strokeDashoffset={754 - (754 * progress) / 100}
                            className="transition-all duration-1000 linear"
                        />
                    </svg>
                    <div className="absolute text-6xl font-black text-gray-900">{timeLeft}</div>
                </div>

                <div className="flex gap-4 w-full max-w-xs">
                    <Button fullWidth variant={isPaused ? 'primary' : 'outline'} onClick={() => setIsPaused(!isPaused)}>
                        {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button fullWidth variant="ghost" onClick={() => setTimeLeft(0)}>Skip</Button>
                </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                    <span>Exercise {index + 1} of {routine.exercises.length}</span>
                    <span>Next: {routine.exercises[index + 1]?.name || 'Finish'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${((index) / routine.exercises.length) * 100}%` }}></div>
                </div>
            </div>
        </div>
    );
};

export const WarmupView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [activeRoutine, setActiveRoutine] = useState<WarmupRoutine | null>(null);
    const [showAssessment, setShowAssessment] = useState(false);

    if (activeRoutine) {
        return <RoutinePlayer routine={activeRoutine} onComplete={() => setActiveRoutine(null)} onCancel={() => setActiveRoutine(null)} />;
    }

    return (
        <div className="bg-[#F5F5F7] min-h-screen pb-32 animate-in slide-in-from-right duration-300">
            <ScreenHeader 
                title="Warmup Hub"
                subtitle="Preparation"
                leftAction={
                    <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                }
            />

            <div className="px-4 space-y-6">
                {/* Mobility Assessment CTA */}
                <div 
                    onClick={() => setShowAssessment(true)}
                    className="bg-gray-900 rounded-3xl p-6 text-white relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-orange-400 font-bold uppercase text-xs tracking-wider">
                            <span>★ Assessment</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">Test Your Mobility</h3>
                        <p className="text-gray-400 text-sm mb-4">5-min screen to find your physical limitations.</p>
                        <button className="bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-bold">Start Test</button>
                    </div>
                    <div className="absolute right-[-20px] top-[-20px] opacity-10 text-9xl">🧘</div>
                </div>

                {/* Routines Grid */}
                <div>
                    <h3 className="font-bold text-gray-900 mb-4 px-1">Warmup Routines</h3>
                    <div className="space-y-3">
                        {ROUTINES.map(routine => (
                            <div 
                                key={routine.id}
                                onClick={() => setActiveRoutine(routine)}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-orange-300 transition-all active:scale-[0.98]"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${routine.color} flex items-center justify-center text-white text-2xl shadow-md`}>
                                    {routine.id === 'r1' ? '⚡' : routine.id === 'r2' ? '🔥' : '🤸'}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-gray-900">{routine.name}</div>
                                    <div className="text-xs text-gray-500">{routine.duration} mins • {routine.exercises.length} Exercises</div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Assessment Modal (Mock) */}
                {showAssessment && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center">
                            <div className="text-4xl mb-4">🚧</div>
                            <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                            <p className="text-gray-500 mb-6">The TPI-style mobility screen is under construction.</p>
                            <Button fullWidth onClick={() => setShowAssessment(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

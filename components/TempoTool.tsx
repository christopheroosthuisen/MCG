import React, { useState, useEffect, useRef } from 'react';
import { Text, Button, Card } from './UIComponents';
import { COLORS } from '../constants';

type GameMode = 'LONG_GAME' | 'SHORT_GAME';
type ToneMode = 'TONES' | 'VOICE';

interface TempoPreset {
    back: number;
    down: number;
    ratio: string;
}

const LONG_GAME_PRESETS: TempoPreset[] = [
    { back: 18, down: 6, ratio: '3:1' },
    { back: 21, down: 7, ratio: '3:1' },
    { back: 24, down: 8, ratio: '3:1' },
    { back: 27, down: 9, ratio: '3:1' },
];

const SHORT_GAME_PRESETS: TempoPreset[] = [
    { back: 14, down: 7, ratio: '2:1' },
    { back: 16, down: 8, ratio: '2:1' },
    { back: 18, down: 9, ratio: '2:1' },
    { back: 20, down: 10, ratio: '2:1' },
];

const FRAME_MS = 1000 / 30; // 33.333ms per frame at 30fps

export const TempoTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameMode, setGameMode] = useState<GameMode>('LONG_GAME');
    const [toneMode, setToneMode] = useState<ToneMode>('TONES');
    const [selectedPreset, setSelectedPreset] = useState<TempoPreset>(LONG_GAME_PRESETS[2]); // Default 24/8
    const [currentPhase, setCurrentPhase] = useState<'IDLE' | 'START' | 'TOP' | 'IMPACT'>('IDLE');

    const audioContextRef = useRef<AudioContext | null>(null);
    const timeoutRefs = useRef<number[]>([]);

    // Switch presets when mode changes
    useEffect(() => {
        stopSequence();
        if (gameMode === 'LONG_GAME') {
            setSelectedPreset(LONG_GAME_PRESETS[2]);
        } else {
            setSelectedPreset(SHORT_GAME_PRESETS[2]);
        }
    }, [gameMode]);

    // Cleanup on unmount
    useEffect(() => {
        return () => stopSequence();
    }, []);

    const playTone = (frequency: number, duration: number = 0.15, type: OscillatorType = 'sine') => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    };

    const runSequence = () => {
        if (!isPlaying) return;

        // 1. Start Tone (Takeaway)
        playTone(600, 0.1); 
        setCurrentPhase('START');

        // Calculate timings based on frames
        const backswingDuration = selectedPreset.back * FRAME_MS;
        const downswingDuration = selectedPreset.down * FRAME_MS;
        const pauseBetweenSwings = 1500; // Time to reset

        // 2. Schedule Top Tone
        const t1 = window.setTimeout(() => {
            if (!isPlaying) return;
            playTone(800, 0.1); // Higher pitch for top
            setCurrentPhase('TOP');
        }, backswingDuration);

        // 3. Schedule Impact Tone
        const t2 = window.setTimeout(() => {
            if (!isPlaying) return;
            playTone(600, 0.2, 'square'); // Sharp distinct tone for impact
            setCurrentPhase('IMPACT');
        }, backswingDuration + downswingDuration);

        // 4. Schedule Reset/Loop
        const t3 = window.setTimeout(() => {
            if (!isPlaying) return;
            setCurrentPhase('IDLE');
        }, backswingDuration + downswingDuration + 500); // Quick visual reset

        const t4 = window.setTimeout(() => {
            if (isPlaying) runSequence();
        }, backswingDuration + downswingDuration + pauseBetweenSwings);

        timeoutRefs.current.push(t1, t2, t3, t4);
    };

    const togglePlay = () => {
        if (isPlaying) {
            stopSequence();
        } else {
            setIsPlaying(true);
            
            // Initialize audio context
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            // Trigger sequence slightly after state update
            setTimeout(() => {}, 0);
        }
    };

    // Use effect to trigger start/stop based on state to avoid closure issues
    useEffect(() => {
        if (isPlaying) {
            runSequence();
        } else {
            stopSequence();
        }
    }, [isPlaying]);

    const stopSequence = () => {
        setIsPlaying(false);
        setCurrentPhase('IDLE');
        timeoutRefs.current.forEach(t => clearTimeout(t));
        timeoutRefs.current = [];
    };

    const activePresets = gameMode === 'LONG_GAME' ? LONG_GAME_PRESETS : SHORT_GAME_PRESETS;

    return (
        <div className="min-h-screen bg-[#F5F5F7] font-sans flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="bg-white p-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-20">
                <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <Text variant="h3" className="text-base font-bold">Tempo Trainer</Text>
                <div className="w-8"></div> {/* Spacer */}
            </div>

            <div className="flex-1 p-6 flex flex-col gap-6">
                
                {/* Mode Selector */}
                <div className="bg-white p-1 rounded-2xl border border-gray-200 flex shadow-sm">
                    <button 
                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all ${gameMode === 'LONG_GAME' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        onClick={() => setGameMode('LONG_GAME')}
                    >
                        Long Game (3:1)
                    </button>
                    <button 
                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all ${gameMode === 'SHORT_GAME' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        onClick={() => setGameMode('SHORT_GAME')}
                    >
                        Short Game (2:1)
                    </button>
                </div>

                {/* Main Visualizer */}
                <Card variant="elevated" className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-white border border-gray-100">
                     <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #FF8200 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    
                    <div className="flex items-baseline gap-2 relative z-10">
                        <span 
                            className={`text-8xl font-black font-mono tracking-tighter transition-all duration-100 ${
                                (currentPhase === 'START' || currentPhase === 'TOP') ? 'text-orange-500 scale-110' : 'text-gray-900'
                            }`}
                        >
                            {selectedPreset.back}
                        </span>
                        <span className="text-5xl font-light text-gray-300">/</span>
                        <span 
                             className={`text-8xl font-black font-mono tracking-tighter transition-all duration-100 ${
                                currentPhase === 'IMPACT' ? 'text-orange-500 scale-110' : 'text-gray-900'
                            }`}
                        >
                            {selectedPreset.down}
                        </span>
                    </div>
                    
                    <div className="mt-4 flex gap-8">
                         <div className={`text-center transition-colors ${currentPhase === 'TOP' ? 'text-orange-600 font-bold' : 'text-gray-400'}`}>
                            <div className="text-xs uppercase tracking-widest mb-1">Backswing</div>
                            <div className="h-1 w-16 bg-current rounded-full mx-auto opacity-50"></div>
                         </div>
                         <div className={`text-center transition-colors ${currentPhase === 'IMPACT' ? 'text-orange-600 font-bold' : 'text-gray-400'}`}>
                            <div className="text-xs uppercase tracking-widest mb-1">Downswing</div>
                             <div className="h-1 w-16 bg-current rounded-full mx-auto opacity-50"></div>
                         </div>
                    </div>
                </Card>

                {/* Presets */}
                <div>
                     <Text variant="caption" className="mb-3 ml-1 font-bold">Rhythm Presets (Frames)</Text>
                     <div className="flex justify-between items-center gap-2">
                        {activePresets.map((preset) => {
                            const isSelected = selectedPreset.back === preset.back;
                            return (
                                <button
                                    key={preset.back}
                                    onClick={() => {
                                        stopSequence();
                                        setSelectedPreset(preset);
                                    }}
                                    className={`flex-1 aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border-2
                                        ${isSelected 
                                            ? 'bg-gray-900 border-gray-900 text-white shadow-lg scale-105' 
                                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <span className="text-lg font-black tracking-tight">{preset.back}</span>
                                    <span className={`text-[10px] font-bold ${isSelected ? 'text-gray-400' : 'text-gray-300'}`}>
                                        {preset.down}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tone Toggle */}
                <div className="flex justify-center">
                     <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setToneMode('TONES')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${toneMode === 'TONES' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                        >
                            Tones
                        </button>
                        <button 
                            onClick={() => setToneMode('VOICE')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${toneMode === 'VOICE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                        >
                            Voice
                        </button>
                     </div>
                </div>

                {/* Big Play Button */}
                <div className="pb-6">
                    <Button 
                        fullWidth 
                        size="lg" 
                        onClick={togglePlay}
                        variant={isPlaying ? 'secondary' : 'primary'}
                        className={`shadow-xl ${isPlaying ? 'bg-gray-900 text-white' : ''}`}
                        icon={isPlaying ? 
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> : 
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        }
                    >
                        {isPlaying ? 'Stop Rhythm' : 'Start Rhythm'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

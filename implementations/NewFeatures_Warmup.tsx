/**
 * ============================================================
 * MCG - NEW FEATURES: PRE-ROUND WARMUP SYSTEM
 * ============================================================
 *
 * Inspired by: GolfForever, CORE Golf
 *
 * This file contains components for pre-round preparation:
 * - Dynamic Warmup Routines
 * - Exercise Cards with animations
 * - Timed Routine Player
 * - Mobility Assessment
 * - Custom Routine Builder
 *
 * Copy this entire file into your AI Studio project.
 * ============================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { COLORS } from '../constants';

// ============================================================
// TYPES
// ============================================================

export interface WarmupRoutine {
    id: string;
    name: string;
    description: string;
    duration: number; // minutes
    difficulty: 'EASY' | 'MODERATE' | 'CHALLENGING';
    focus: ('MOBILITY' | 'ACTIVATION' | 'STRETCHING' | 'MENTAL')[];
    exercises: WarmupExercise[];
    icon: string;
}

export interface WarmupExercise {
    id: string;
    name: string;
    description: string;
    duration: number; // seconds
    reps?: number;
    sets?: number;
    category: 'MOBILITY' | 'ACTIVATION' | 'STRETCHING' | 'BREATHING' | 'SWING';
    targetArea: 'HIPS' | 'SHOULDERS' | 'SPINE' | 'WRISTS' | 'CORE' | 'LEGS' | 'FULL_BODY';
    imageUrl?: string;
    tips: string[];
    modifications?: {
        easier: string;
        harder: string;
    };
}

export interface MobilityTest {
    id: string;
    name: string;
    description: string;
    targetArea: string;
    instructions: string[];
    scoringCriteria: {
        score: 1 | 2 | 3 | 4 | 5;
        description: string;
    }[];
}

export interface MobilityScore {
    testId: string;
    score: number;
    date: Date;
    notes?: string;
}

// ============================================================
// MOCK DATA - EXERCISES
// ============================================================

export const WARMUP_EXERCISES: WarmupExercise[] = [
    {
        id: 'ex1',
        name: 'Hip Circles',
        description: 'Stand on one leg and rotate the other hip in large circles',
        duration: 30,
        reps: 10,
        category: 'MOBILITY',
        targetArea: 'HIPS',
        tips: [
            'Keep core engaged',
            'Make circles as large as comfortable',
            'Both directions'
        ],
        modifications: {
            easier: 'Hold onto something for balance',
            harder: 'Close your eyes'
        }
    },
    {
        id: 'ex2',
        name: 'Arm Circles',
        description: 'Large arm circles forward and backward',
        duration: 30,
        reps: 15,
        category: 'MOBILITY',
        targetArea: 'SHOULDERS',
        tips: [
            'Start small, gradually increase size',
            'Keep shoulders down',
            'Maintain good posture'
        ]
    },
    {
        id: 'ex3',
        name: 'Trunk Rotations',
        description: 'Rotate torso while keeping hips stable',
        duration: 45,
        reps: 20,
        category: 'MOBILITY',
        targetArea: 'SPINE',
        tips: [
            'Arms crossed or hands on shoulders',
            'Rotate from mid-back, not hips',
            'Smooth, controlled movement'
        ]
    },
    {
        id: 'ex4',
        name: 'Wrist Circles',
        description: 'Rotate wrists in both directions',
        duration: 20,
        reps: 10,
        category: 'MOBILITY',
        targetArea: 'WRISTS',
        tips: [
            'Fingers interlocked or separate',
            'Full range of motion',
            'Both directions'
        ]
    },
    {
        id: 'ex5',
        name: 'Glute Bridges',
        description: 'Lie on back, lift hips toward ceiling',
        duration: 45,
        reps: 12,
        category: 'ACTIVATION',
        targetArea: 'HIPS',
        tips: [
            'Squeeze glutes at top',
            'Keep core tight',
            'Don\'t hyperextend back'
        ],
        modifications: {
            easier: 'Feet closer to glutes',
            harder: 'Single leg variation'
        }
    },
    {
        id: 'ex6',
        name: 'Cat-Cow Stretch',
        description: 'On all fours, alternate between arching and rounding spine',
        duration: 45,
        reps: 10,
        category: 'STRETCHING',
        targetArea: 'SPINE',
        tips: [
            'Move with breath',
            'Feel each vertebra move',
            'Don\'t rush'
        ]
    },
    {
        id: 'ex7',
        name: '90/90 Hip Stretch',
        description: 'Sit with legs at 90 degrees, rotate between positions',
        duration: 60,
        category: 'STRETCHING',
        targetArea: 'HIPS',
        tips: [
            'Keep spine tall',
            'Move slowly between positions',
            'Feel the stretch in both hips'
        ]
    },
    {
        id: 'ex8',
        name: 'Deep Breathing',
        description: '4-7-8 breathing pattern for mental preparation',
        duration: 60,
        reps: 4,
        category: 'BREATHING',
        targetArea: 'FULL_BODY',
        tips: [
            'Breathe in for 4 counts',
            'Hold for 7 counts',
            'Exhale for 8 counts',
            'Close your eyes'
        ]
    },
    {
        id: 'ex9',
        name: 'Practice Swings',
        description: 'Slow, focused practice swings without a ball',
        duration: 60,
        reps: 10,
        category: 'SWING',
        targetArea: 'FULL_BODY',
        tips: [
            'Focus on tempo',
            'Feel the sequence',
            'No ball, no target'
        ]
    },
    {
        id: 'ex10',
        name: 'Standing Side Bends',
        description: 'Stretch lateral torso by bending side to side',
        duration: 30,
        reps: 8,
        category: 'STRETCHING',
        targetArea: 'CORE',
        tips: [
            'Keep hips square',
            'Reach overhead',
            'Feel the stretch along side'
        ]
    }
];

// ============================================================
// MOCK DATA - ROUTINES
// ============================================================

export const WARMUP_ROUTINES: WarmupRoutine[] = [
    {
        id: 'wr1',
        name: '5-Minute Quick Warmup',
        description: 'Running late? This essential warmup hits the key areas fast.',
        duration: 5,
        difficulty: 'EASY',
        focus: ['MOBILITY', 'ACTIVATION'],
        icon: '⚡',
        exercises: [
            WARMUP_EXERCISES[0], // Hip Circles
            WARMUP_EXERCISES[1], // Arm Circles
            WARMUP_EXERCISES[2], // Trunk Rotations
            WARMUP_EXERCISES[3], // Wrist Circles
            WARMUP_EXERCISES[8], // Practice Swings
        ]
    },
    {
        id: 'wr2',
        name: '15-Minute Full Warmup',
        description: 'Complete preparation for peak performance.',
        duration: 15,
        difficulty: 'MODERATE',
        focus: ['MOBILITY', 'ACTIVATION', 'STRETCHING'],
        icon: '🔥',
        exercises: [
            WARMUP_EXERCISES[0], // Hip Circles
            WARMUP_EXERCISES[1], // Arm Circles
            WARMUP_EXERCISES[5], // Cat-Cow
            WARMUP_EXERCISES[6], // 90/90 Hip
            WARMUP_EXERCISES[4], // Glute Bridges
            WARMUP_EXERCISES[2], // Trunk Rotations
            WARMUP_EXERCISES[9], // Side Bends
            WARMUP_EXERCISES[3], // Wrist Circles
            WARMUP_EXERCISES[8], // Practice Swings
        ]
    },
    {
        id: 'wr3',
        name: 'First Tee Anxiety Reducer',
        description: 'Calm your nerves and prepare mentally for a great round.',
        duration: 7,
        difficulty: 'EASY',
        focus: ['MENTAL', 'STRETCHING'],
        icon: '🧘',
        exercises: [
            WARMUP_EXERCISES[7], // Deep Breathing
            WARMUP_EXERCISES[5], // Cat-Cow
            WARMUP_EXERCISES[0], // Hip Circles
            WARMUP_EXERCISES[1], // Arm Circles
            WARMUP_EXERCISES[7], // Deep Breathing again
        ]
    },
    {
        id: 'wr4',
        name: 'Range Session Prep',
        description: 'Get your body ready for an effective practice session.',
        duration: 10,
        difficulty: 'MODERATE',
        focus: ['MOBILITY', 'ACTIVATION'],
        icon: '🎯',
        exercises: [
            WARMUP_EXERCISES[0], // Hip Circles
            WARMUP_EXERCISES[1], // Arm Circles
            WARMUP_EXERCISES[2], // Trunk Rotations
            WARMUP_EXERCISES[4], // Glute Bridges
            WARMUP_EXERCISES[6], // 90/90 Hip
            WARMUP_EXERCISES[3], // Wrist Circles
            WARMUP_EXERCISES[8], // Practice Swings
        ]
    }
];

// ============================================================
// EXERCISE CARD
// ============================================================

export const ExerciseCard: React.FC<{
    exercise: WarmupExercise;
    isActive?: boolean;
    isComplete?: boolean;
    onStart?: () => void;
}> = ({ exercise, isActive = false, isComplete = false, onStart }) => {
    const categoryColors = {
        MOBILITY: 'bg-blue-100 text-blue-700',
        ACTIVATION: 'bg-orange-100 text-orange-700',
        STRETCHING: 'bg-green-100 text-green-700',
        BREATHING: 'bg-purple-100 text-purple-700',
        SWING: 'bg-red-100 text-red-700'
    };

    const targetIcons = {
        HIPS: '🦵',
        SHOULDERS: '💪',
        SPINE: '🔄',
        WRISTS: '🤲',
        CORE: '🎯',
        LEGS: '🦿',
        FULL_BODY: '🧍'
    };

    return (
        <div
            className={`bg-white rounded-2xl p-4 shadow-md transition-all duration-300
                ${isActive ? 'ring-2 ring-orange-500 bg-orange-50' : ''}
                ${isComplete ? 'opacity-60' : ''}`}
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                    ${isComplete ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {isComplete ? '✓' : targetIcons[exercise.targetArea]}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900">{exercise.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[exercise.category]}`}>
                            {exercise.category}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">{exercise.description}</p>

                    {/* Duration/Reps */}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>⏱️ {exercise.duration}s</span>
                        {exercise.reps && <span>🔁 {exercise.reps} reps</span>}
                    </div>
                </div>
            </div>

            {/* Tips (expanded when active) */}
            {isActive && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                    <p className="text-xs font-bold text-blue-700 mb-2">Tips</p>
                    <ul className="space-y-1">
                        {exercise.tips.map((tip, i) => (
                            <li key={i} className="text-sm text-blue-600 flex items-start gap-2">
                                <span>•</span>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Start Button */}
            {!isActive && !isComplete && onStart && (
                <button
                    onClick={onStart}
                    className="w-full mt-4 py-2 rounded-xl font-medium text-white active:scale-95 transition-all"
                    style={{ backgroundColor: COLORS.primary }}
                >
                    Start Exercise
                </button>
            )}
        </div>
    );
};

// ============================================================
// WARMUP TIMER
// ============================================================

export const WarmupTimer: React.FC<{
    duration: number; // seconds
    exerciseName: string;
    onComplete: () => void;
    onSkip: () => void;
}> = ({ duration, exerciseName, onComplete, onSkip }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isRunning, setIsRunning] = useState(true);

    useEffect(() => {
        if (!isRunning || timeLeft <= 0) {
            if (timeLeft <= 0) onComplete();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(t => t - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, timeLeft, onComplete]);

    const progress = ((duration - timeLeft) / duration) * 100;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Current Exercise</p>
            <h3 className="text-xl font-bold text-gray-900 mb-6">{exerciseName}</h3>

            {/* Circular Progress */}
            <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                    />
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke={COLORS.primary}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={553}
                        strokeDashoffset={553 - (553 * progress) / 100}
                        className="transition-all duration-1000"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-black text-gray-900">
                        {minutes}:{seconds.toString().padStart(2, '0')}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
                <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="flex-1 py-4 rounded-2xl font-bold text-white active:scale-95 transition-all"
                    style={{ backgroundColor: isRunning ? '#6B7280' : COLORS.success }}
                >
                    {isRunning ? 'Pause' : 'Resume'}
                </button>
                <button
                    onClick={onSkip}
                    className="px-6 py-4 rounded-2xl font-bold bg-gray-200 text-gray-600 active:scale-95 transition-all"
                >
                    Skip →
                </button>
            </div>
        </div>
    );
};

// ============================================================
// ROUTINE PLAYER
// ============================================================

export const RoutinePlayer: React.FC<{
    routine: WarmupRoutine;
    onComplete: () => void;
    onCancel: () => void;
}> = ({ routine, onComplete, onCancel }) => {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [completedExercises, setCompletedExercises] = useState<string[]>([]);

    const currentExercise = routine.exercises[currentExerciseIndex];
    const progress = (currentExerciseIndex / routine.exercises.length) * 100;
    const isLastExercise = currentExerciseIndex === routine.exercises.length - 1;

    const handleExerciseComplete = useCallback(() => {
        setCompletedExercises(prev => [...prev, currentExercise.id]);

        if (isLastExercise) {
            onComplete();
        } else {
            setIsResting(true);
            setTimeout(() => {
                setIsResting(false);
                setCurrentExerciseIndex(prev => prev + 1);
            }, 3000); // 3 second rest between exercises
        }
    }, [currentExercise, isLastExercise, onComplete]);

    const handleSkip = () => {
        if (isLastExercise) {
            onComplete();
        } else {
            setCurrentExerciseIndex(prev => prev + 1);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <button onClick={onCancel} className="text-gray-500">✕ Exit</button>
                        <div className="text-center">
                            <span className="text-2xl mr-2">{routine.icon}</span>
                            <span className="font-bold text-gray-900">{routine.name}</span>
                        </div>
                        <div className="w-12" />
                    </div>

                    {/* Progress */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, backgroundColor: COLORS.primary }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                        Exercise {currentExerciseIndex + 1} of {routine.exercises.length}
                    </p>
                </div>
            </div>

            <div className="px-5 py-6">
                {/* Rest Screen */}
                {isResting ? (
                    <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
                        <span className="text-5xl mb-4 block">😌</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Rest</h3>
                        <p className="text-gray-500 mb-4">Prepare for the next exercise</p>
                        <p className="text-4xl font-black" style={{ color: COLORS.primary }}>
                            Next: {routine.exercises[currentExerciseIndex + 1]?.name}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Timer */}
                        <WarmupTimer
                            duration={currentExercise.duration}
                            exerciseName={currentExercise.name}
                            onComplete={handleExerciseComplete}
                            onSkip={handleSkip}
                        />

                        {/* Exercise Details */}
                        <div className="mt-6">
                            <ExerciseCard
                                exercise={currentExercise}
                                isActive={true}
                            />
                        </div>
                    </>
                )}

                {/* Exercise List */}
                <div className="mt-6">
                    <p className="text-sm font-bold text-gray-700 mb-3">Routine Overview</p>
                    <div className="space-y-2">
                        {routine.exercises.map((ex, i) => (
                            <div
                                key={ex.id}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all
                                    ${i === currentExerciseIndex ? 'bg-orange-100' : ''}
                                    ${completedExercises.includes(ex.id) ? 'bg-green-50' : 'bg-white'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                    ${completedExercises.includes(ex.id) ? 'bg-green-500 text-white' : ''}
                                    ${i === currentExerciseIndex ? 'bg-orange-500 text-white' : ''}
                                    ${!completedExercises.includes(ex.id) && i !== currentExerciseIndex ? 'bg-gray-200 text-gray-500' : ''}`}>
                                    {completedExercises.includes(ex.id) ? '✓' : i + 1}
                                </div>
                                <span className={`text-sm ${i === currentExerciseIndex ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                    {ex.name}
                                </span>
                                <span className="text-xs text-gray-400 ml-auto">{ex.duration}s</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// ROUTINE CARD
// ============================================================

export const RoutineCard: React.FC<{
    routine: WarmupRoutine;
    onStart: (routine: WarmupRoutine) => void;
}> = ({ routine, onStart }) => {
    const difficultyColors = {
        EASY: 'bg-green-100 text-green-700',
        MODERATE: 'bg-yellow-100 text-yellow-700',
        CHALLENGING: 'bg-red-100 text-red-700'
    };

    const focusIcons = {
        MOBILITY: '🔄',
        ACTIVATION: '⚡',
        STRETCHING: '🧘',
        MENTAL: '🧠'
    };

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{routine.icon}</span>
                        <div>
                            <h4 className="font-bold text-gray-900">{routine.name}</h4>
                            <p className="text-sm text-gray-500">{routine.duration} minutes</p>
                        </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${difficultyColors[routine.difficulty]}`}>
                        {routine.difficulty}
                    </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{routine.description}</p>

                {/* Focus Areas */}
                <div className="flex gap-2 mb-4">
                    {routine.focus.map((f) => (
                        <span key={f} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                            {focusIcons[f]} {f}
                        </span>
                    ))}
                </div>

                {/* Exercise Count */}
                <p className="text-xs text-gray-400 mb-4">
                    {routine.exercises.length} exercises
                </p>

                <button
                    onClick={() => onStart(routine)}
                    className="w-full py-3 rounded-xl font-bold text-white active:scale-95 transition-all"
                    style={{ backgroundColor: COLORS.primary }}
                >
                    Start Warmup
                </button>
            </div>
        </div>
    );
};

// ============================================================
// MOBILITY ASSESSMENT
// ============================================================

export const MOBILITY_TESTS: MobilityTest[] = [
    {
        id: 'mt1',
        name: 'Hip Internal Rotation',
        description: 'Test your hip mobility for proper rotation',
        targetArea: 'Hips',
        instructions: [
            'Sit on a chair or bench with feet flat on the floor',
            'Keep your knee at 90 degrees',
            'Rotate your foot outward (moving knee inward)',
            'Note how far you can comfortably rotate'
        ],
        scoringCriteria: [
            { score: 1, description: 'Less than 20° rotation' },
            { score: 2, description: '20-30° rotation' },
            { score: 3, description: '30-40° rotation' },
            { score: 4, description: '40-50° rotation' },
            { score: 5, description: '50°+ rotation (optimal for golf)' }
        ]
    },
    {
        id: 'mt2',
        name: 'Thoracic Rotation',
        description: 'Test your mid-back rotation ability',
        targetArea: 'Spine',
        instructions: [
            'Get on all fours (hands and knees)',
            'Place one hand behind your head',
            'Rotate your torso, bringing elbow toward ceiling',
            'Note how far you can rotate'
        ],
        scoringCriteria: [
            { score: 1, description: 'Elbow points down/forward' },
            { score: 2, description: 'Elbow points slightly up' },
            { score: 3, description: 'Elbow points to side (horizontal)' },
            { score: 4, description: 'Elbow points past horizontal' },
            { score: 5, description: 'Elbow points toward ceiling' }
        ]
    },
    {
        id: 'mt3',
        name: 'Shoulder External Rotation',
        description: 'Test your shoulder mobility for the backswing',
        targetArea: 'Shoulders',
        instructions: [
            'Stand with arm at 90° to side, elbow bent',
            'Keep elbow in place',
            'Rotate forearm backward (toward wall behind you)',
            'Note how far back your forearm goes'
        ],
        scoringCriteria: [
            { score: 1, description: 'Forearm barely moves back' },
            { score: 2, description: 'Forearm at 45° back' },
            { score: 3, description: 'Forearm at 90° (horizontal)' },
            { score: 4, description: 'Forearm past 90°' },
            { score: 5, description: 'Forearm nearly vertical' }
        ]
    }
];

export const MobilityAssessment: React.FC<{
    onComplete: (scores: MobilityScore[]) => void;
}> = ({ onComplete }) => {
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [scores, setScores] = useState<MobilityScore[]>([]);
    const [selectedScore, setSelectedScore] = useState<number | null>(null);

    const currentTest = MOBILITY_TESTS[currentTestIndex];
    const isLastTest = currentTestIndex === MOBILITY_TESTS.length - 1;

    const handleScoreSelect = (score: number) => {
        setSelectedScore(score);
    };

    const handleNext = () => {
        if (selectedScore === null) return;

        const newScore: MobilityScore = {
            testId: currentTest.id,
            score: selectedScore,
            date: new Date()
        };

        const newScores = [...scores, newScore];
        setScores(newScores);
        setSelectedScore(null);

        if (isLastTest) {
            onComplete(newScores);
        } else {
            setCurrentTestIndex(prev => prev + 1);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10 px-5 py-4">
                <h2 className="font-bold text-gray-900 text-lg">Mobility Assessment</h2>
                <p className="text-sm text-gray-500">
                    Test {currentTestIndex + 1} of {MOBILITY_TESTS.length}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{
                            width: `${((currentTestIndex + 1) / MOBILITY_TESTS.length) * 100}%`,
                            backgroundColor: COLORS.primary
                        }}
                    />
                </div>
            </div>

            <div className="px-5 py-6">
                {/* Test Info */}
                <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{currentTest.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{currentTest.description}</p>

                    {/* Instructions */}
                    <div className="p-4 bg-blue-50 rounded-xl mb-4">
                        <p className="text-sm font-bold text-blue-700 mb-2">Instructions</p>
                        <ol className="space-y-2">
                            {currentTest.instructions.map((inst, i) => (
                                <li key={i} className="text-sm text-blue-600 flex gap-2">
                                    <span className="font-bold">{i + 1}.</span>
                                    {inst}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>

                {/* Scoring */}
                <div className="bg-white rounded-2xl p-6 shadow-md">
                    <p className="font-bold text-gray-900 mb-4">How did you score?</p>
                    <div className="space-y-2">
                        {currentTest.scoringCriteria.map((criteria) => (
                            <button
                                key={criteria.score}
                                onClick={() => handleScoreSelect(criteria.score)}
                                className={`w-full p-4 rounded-xl text-left transition-all
                                    ${selectedScore === criteria.score
                                        ? 'bg-orange-100 border-2 border-orange-500'
                                        : 'bg-gray-50 border-2 border-transparent'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                                        ${selectedScore === criteria.score ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                        {criteria.score}
                                    </div>
                                    <span className={`text-sm ${selectedScore === criteria.score ? 'font-medium' : ''}`}>
                                        {criteria.description}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Next Button */}
                <button
                    onClick={handleNext}
                    disabled={selectedScore === null}
                    className={`w-full mt-6 py-4 rounded-2xl font-bold text-white transition-all
                        ${selectedScore ? 'active:scale-95' : 'opacity-50'}`}
                    style={{ backgroundColor: COLORS.primary }}
                >
                    {isLastTest ? 'Complete Assessment' : 'Next Test'}
                </button>
            </div>
        </div>
    );
};

// ============================================================
// MOBILITY RESULTS
// ============================================================

export const MobilityResults: React.FC<{
    scores: MobilityScore[];
    onRetake: () => void;
    onClose: () => void;
}> = ({ scores, onRetake, onClose }) => {
    const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    const rating = avgScore >= 4 ? 'Excellent' : avgScore >= 3 ? 'Good' : avgScore >= 2 ? 'Fair' : 'Needs Work';

    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Header */}
            <div
                className="p-6 text-center text-white"
                style={{
                    background: avgScore >= 3
                        ? `linear-gradient(135deg, ${COLORS.success}, #059669)`
                        : `linear-gradient(135deg, ${COLORS.warning}, #D97706)`
                }}
            >
                <h2 className="text-xl font-bold">Assessment Complete!</h2>
                <p className="text-5xl font-black mt-4">{avgScore.toFixed(1)}</p>
                <p className="text-lg mt-2">{rating}</p>
            </div>

            <div className="p-6">
                {/* Individual Scores */}
                <div className="space-y-3 mb-6">
                    {scores.map((score) => {
                        const test = MOBILITY_TESTS.find(t => t.id === score.testId);
                        return (
                            <div key={score.testId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-medium text-gray-900">{test?.name}</p>
                                    <p className="text-xs text-gray-500">{test?.targetArea}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full font-bold
                                    ${score.score >= 4 ? 'bg-green-100 text-green-700' : ''}
                                    ${score.score === 3 ? 'bg-yellow-100 text-yellow-700' : ''}
                                    ${score.score <= 2 ? 'bg-red-100 text-red-700' : ''}`}>
                                    {score.score}/5
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Recommendations */}
                {avgScore < 4 && (
                    <div className="p-4 bg-blue-50 rounded-xl mb-6">
                        <p className="text-sm font-bold text-blue-700 mb-2">Recommendation</p>
                        <p className="text-sm text-blue-600">
                            Focus on the 15-Minute Full Warmup routine to improve your mobility scores.
                            Consistent practice will help unlock more rotation in your swing.
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onRetake}
                        className="flex-1 py-3 rounded-xl font-bold bg-gray-200 text-gray-700 active:scale-95 transition-all"
                    >
                        Retake
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-white active:scale-95 transition-all"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// WARMUP HUB MAIN VIEW
// ============================================================

export const WarmupHub: React.FC = () => {
    const [activeRoutine, setActiveRoutine] = useState<WarmupRoutine | null>(null);
    const [showAssessment, setShowAssessment] = useState(false);
    const [mobilityScores, setMobilityScores] = useState<MobilityScore[] | null>(null);

    if (activeRoutine) {
        return (
            <RoutinePlayer
                routine={activeRoutine}
                onComplete={() => setActiveRoutine(null)}
                onCancel={() => setActiveRoutine(null)}
            />
        );
    }

    if (showAssessment && !mobilityScores) {
        return (
            <MobilityAssessment
                onComplete={(scores) => setMobilityScores(scores)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10 px-5 py-4">
                <h1 className="text-2xl font-bold text-gray-900">Warmup</h1>
                <p className="text-sm text-gray-500">Prepare your body to play</p>
            </div>

            <div className="px-5 py-6 space-y-6">
                {/* Mobility Results */}
                {mobilityScores && (
                    <MobilityResults
                        scores={mobilityScores}
                        onRetake={() => setMobilityScores(null)}
                        onClose={() => {
                            setShowAssessment(false);
                            setMobilityScores(null);
                        }}
                    />
                )}

                {/* Mobility Assessment CTA */}
                {!mobilityScores && (
                    <div
                        className="p-6 rounded-2xl text-white cursor-pointer active:scale-[0.98] transition-all"
                        style={{ background: `linear-gradient(135deg, ${COLORS.secondary}, #0D4F3C)` }}
                        onClick={() => setShowAssessment(true)}
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">🧘</span>
                            <div>
                                <h3 className="font-bold text-lg">Mobility Assessment</h3>
                                <p className="text-white/70 text-sm">Test your golf-specific flexibility</p>
                            </div>
                            <span className="ml-auto text-white/50">→</span>
                        </div>
                    </div>
                )}

                {/* Routines */}
                <div>
                    <h2 className="font-bold text-gray-900 text-lg mb-4">Warmup Routines</h2>
                    <div className="space-y-4">
                        {WARMUP_ROUTINES.map((routine) => (
                            <RoutineCard
                                key={routine.id}
                                routine={routine}
                                onStart={setActiveRoutine}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// USAGE EXAMPLE
// ============================================================

/*
import {
    WarmupHub,
    RoutineCard,
    RoutinePlayer,
    ExerciseCard,
    MobilityAssessment,
    WARMUP_ROUTINES,
    WARMUP_EXERCISES
} from './NewFeatures_Warmup';

// Full Warmup Hub
const WarmupScreen: React.FC = () => {
    return <WarmupHub />;
};

// Individual Components
const QuickWarmup: React.FC = () => {
    return (
        <RoutineCard
            routine={WARMUP_ROUTINES[0]}
            onStart={(r) => console.log('Starting:', r.name)}
        />
    );
};
*/

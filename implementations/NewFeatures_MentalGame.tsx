/**
 * ============================================================
 * MCG - NEW FEATURES: MENTAL GAME TRACKER
 * ============================================================
 *
 * Inspired by: Golfmetrics, DECADE Golf
 *
 * This file contains components for mental game tracking:
 * - Shot Quality Rating (Decision vs Execution)
 * - Pre-Shot Routine Tracker
 * - Mental Score Card
 * - Tendency Analysis
 * - Focus & Confidence Tracking
 *
 * Copy this entire file into your AI Studio project.
 * ============================================================
 */

import React, { useState, useMemo } from 'react';
import { COLORS } from '../constants';

// ============================================================
// TYPES
// ============================================================

export interface ShotQuality {
    id: string;
    holeNumber: number;
    shotNumber: number;
    club: string;
    decisionRating: 1 | 2 | 3 | 4 | 5; // Was it the right choice?
    executionRating: 1 | 2 | 3 | 4 | 5; // Did you execute well?
    outcome: 'GREAT' | 'GOOD' | 'OK' | 'POOR' | 'TERRIBLE';
    commitmentLevel: 'FULL' | 'PARTIAL' | 'NONE';
    emotionalState: 'CALM' | 'FOCUSED' | 'ANXIOUS' | 'FRUSTRATED' | 'CONFIDENT';
    notes?: string;
}

export interface MentalRound {
    id: string;
    date: Date;
    courseName: string;
    shots: ShotQuality[];
    overallMentalScore: number;
    avgDecision: number;
    avgExecution: number;
    commitmentRate: number;
    focusRating: number;
}

export interface PreShotRoutine {
    id: string;
    steps: RoutineStep[];
    targetDuration: number; // seconds
    actualDurations: number[];
    consistencyScore: number;
}

export interface RoutineStep {
    id: string;
    name: string;
    description: string;
    duration: number; // target seconds
    category: 'PHYSICAL' | 'VISUAL' | 'MENTAL';
}

export interface TendencyPattern {
    situation: string;
    tendency: string;
    frequency: number;
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    suggestion: string;
}

// ============================================================
// MOCK DATA
// ============================================================

export const MOCK_MENTAL_ROUNDS: MentalRound[] = [
    {
        id: 'mr1',
        date: new Date(Date.now() - 86400000),
        courseName: 'Medalist Golf Club',
        shots: [],
        overallMentalScore: 78,
        avgDecision: 3.8,
        avgExecution: 3.5,
        commitmentRate: 82,
        focusRating: 75
    },
    {
        id: 'mr2',
        date: new Date(Date.now() - 86400000 * 5),
        courseName: 'PGA National',
        shots: [],
        overallMentalScore: 85,
        avgDecision: 4.2,
        avgExecution: 3.9,
        commitmentRate: 90,
        focusRating: 88
    },
    {
        id: 'mr3',
        date: new Date(Date.now() - 86400000 * 10),
        courseName: 'Seminole',
        shots: [],
        overallMentalScore: 65,
        avgDecision: 3.2,
        avgExecution: 3.0,
        commitmentRate: 68,
        focusRating: 60
    }
];

export const DEFAULT_ROUTINE: PreShotRoutine = {
    id: 'psr1',
    steps: [
        { id: 's1', name: 'Stand Behind Ball', description: 'Pick target, visualize shot', duration: 5, category: 'VISUAL' },
        { id: 's2', name: 'Practice Swing', description: 'Feel the shot you want to hit', duration: 4, category: 'PHYSICAL' },
        { id: 's3', name: 'Setup', description: 'Align body and clubface', duration: 4, category: 'PHYSICAL' },
        { id: 's4', name: 'Waggle', description: 'Release tension, final look', duration: 3, category: 'MENTAL' },
        { id: 's5', name: 'Go', description: 'Commit and swing', duration: 2, category: 'MENTAL' }
    ],
    targetDuration: 18,
    actualDurations: [17, 19, 18, 22, 16, 18, 20, 17],
    consistencyScore: 85
};

export const MOCK_TENDENCIES: TendencyPattern[] = [
    {
        situation: 'First Tee',
        tendency: 'Rush pre-shot routine',
        frequency: 70,
        impact: 'NEGATIVE',
        suggestion: 'Add 2 extra seconds to routine on first tee'
    },
    {
        situation: 'After Bogey',
        tendency: 'Play overly aggressive on next hole',
        frequency: 65,
        impact: 'NEGATIVE',
        suggestion: 'Commit to playing your stock shot after mistakes'
    },
    {
        situation: 'Par 5 in Two',
        tendency: 'Good decision making',
        frequency: 80,
        impact: 'POSITIVE',
        suggestion: 'Keep using your layup zone strategy'
    },
    {
        situation: 'Short Putts (Inside 4ft)',
        tendency: 'Don\'t complete routine',
        frequency: 55,
        impact: 'NEGATIVE',
        suggestion: 'Treat every putt the same - full routine'
    }
];

// ============================================================
// SHOT QUALITY INPUT
// ============================================================

export const ShotQualityInput: React.FC<{
    holeNumber: number;
    shotNumber: number;
    onSubmit: (quality: Omit<ShotQuality, 'id'>) => void;
    onSkip?: () => void;
}> = ({ holeNumber, shotNumber, onSubmit, onSkip }) => {
    const [decision, setDecision] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
    const [execution, setExecution] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
    const [commitment, setCommitment] = useState<'FULL' | 'PARTIAL' | 'NONE'>('FULL');
    const [club, setClub] = useState('');

    const handleSubmit = () => {
        if (!decision || !execution) return;

        onSubmit({
            holeNumber,
            shotNumber,
            club,
            decisionRating: decision,
            executionRating: execution,
            outcome: execution >= 4 ? 'GREAT' : execution === 3 ? 'OK' : 'POOR',
            commitmentLevel: commitment,
            emotionalState: 'CALM'
        });
    };

    const ratingLabels = ['Poor', 'Below Avg', 'Average', 'Good', 'Excellent'];

    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div
                className="p-4 text-white"
                style={{ backgroundColor: COLORS.secondary }}
            >
                <h3 className="font-bold">Rate Your Shot</h3>
                <p className="text-white/70 text-sm">Hole {holeNumber} • Shot {shotNumber}</p>
            </div>

            <div className="p-6 space-y-6">
                {/* Club Selection */}
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Club Used</label>
                    <input
                        type="text"
                        value={club}
                        onChange={(e) => setClub(e.target.value)}
                        placeholder="e.g., 7 Iron"
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-orange-500"
                    />
                </div>

                {/* Decision Rating */}
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                        Decision Quality
                        <span className="text-gray-400 font-normal ml-2">Was it the right shot choice?</span>
                    </label>
                    <div className="flex gap-2">
                        {([1, 2, 3, 4, 5] as const).map((rating) => (
                            <button
                                key={rating}
                                onClick={() => setDecision(rating)}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all
                                    ${decision === rating
                                        ? 'text-white'
                                        : 'bg-gray-100 text-gray-600'}`}
                                style={decision === rating ? { backgroundColor: COLORS.primary } : {}}
                            >
                                {rating}
                            </button>
                        ))}
                    </div>
                    {decision && (
                        <p className="text-xs text-gray-500 text-center mt-1">
                            {ratingLabels[decision - 1]}
                        </p>
                    )}
                </div>

                {/* Execution Rating */}
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                        Execution Quality
                        <span className="text-gray-400 font-normal ml-2">How well did you hit it?</span>
                    </label>
                    <div className="flex gap-2">
                        {([1, 2, 3, 4, 5] as const).map((rating) => (
                            <button
                                key={rating}
                                onClick={() => setExecution(rating)}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all
                                    ${execution === rating
                                        ? 'text-white'
                                        : 'bg-gray-100 text-gray-600'}`}
                                style={execution === rating ? { backgroundColor: COLORS.primary } : {}}
                            >
                                {rating}
                            </button>
                        ))}
                    </div>
                    {execution && (
                        <p className="text-xs text-gray-500 text-center mt-1">
                            {ratingLabels[execution - 1]}
                        </p>
                    )}
                </div>

                {/* Commitment */}
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                        Commitment Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['FULL', 'PARTIAL', 'NONE'] as const).map((level) => (
                            <button
                                key={level}
                                onClick={() => setCommitment(level)}
                                className={`py-2 rounded-xl text-sm font-medium transition-all
                                    ${commitment === level
                                        ? 'text-white'
                                        : 'bg-gray-100 text-gray-600'}`}
                                style={commitment === level ? {
                                    backgroundColor: level === 'FULL' ? COLORS.success :
                                                    level === 'PARTIAL' ? COLORS.warning : COLORS.error
                                } : {}}
                            >
                                {level === 'FULL' && '✓ Full'}
                                {level === 'PARTIAL' && '~ Partial'}
                                {level === 'NONE' && '✗ None'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    {onSkip && (
                        <button
                            onClick={onSkip}
                            className="flex-1 py-4 rounded-2xl font-bold bg-gray-200 text-gray-600 active:scale-95 transition-all"
                        >
                            Skip
                        </button>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={!decision || !execution}
                        className={`flex-1 py-4 rounded-2xl font-bold text-white transition-all
                            ${decision && execution ? 'active:scale-95' : 'opacity-50'}`}
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        Save Rating
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// DECISION VS EXECUTION MATRIX
// ============================================================

export const DecisionExecutionMatrix: React.FC<{
    shots: ShotQuality[];
}> = ({ shots }) => {
    // Calculate quadrant distribution
    const quadrants = useMemo(() => {
        const q = {
            goodGood: 0,    // Good decision, good execution
            goodBad: 0,     // Good decision, bad execution
            badGood: 0,     // Bad decision, good execution
            badBad: 0       // Bad decision, bad execution
        };

        shots.forEach(shot => {
            const goodDecision = shot.decisionRating >= 3;
            const goodExecution = shot.executionRating >= 3;

            if (goodDecision && goodExecution) q.goodGood++;
            else if (goodDecision && !goodExecution) q.goodBad++;
            else if (!goodDecision && goodExecution) q.badGood++;
            else q.badBad++;
        });

        return q;
    }, [shots]);

    const total = shots.length || 1;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Decision vs Execution</h3>

            {/* Matrix */}
            <div className="grid grid-cols-2 gap-2 mb-6">
                {/* Good Decision, Good Execution */}
                <div className="p-4 rounded-xl bg-green-50 text-center">
                    <p className="text-3xl font-black text-green-600">
                        {Math.round((quadrants.goodGood / total) * 100)}%
                    </p>
                    <p className="text-xs text-green-700 mt-1">Good Decision</p>
                    <p className="text-xs text-green-700">Good Execution</p>
                    <p className="text-xs text-green-600 mt-2">🎯 Ideal Shots</p>
                </div>

                {/* Good Decision, Bad Execution */}
                <div className="p-4 rounded-xl bg-yellow-50 text-center">
                    <p className="text-3xl font-black text-yellow-600">
                        {Math.round((quadrants.goodBad / total) * 100)}%
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">Good Decision</p>
                    <p className="text-xs text-yellow-700">Bad Execution</p>
                    <p className="text-xs text-yellow-600 mt-2">⚡ Mechanical</p>
                </div>

                {/* Bad Decision, Good Execution */}
                <div className="p-4 rounded-xl bg-orange-50 text-center">
                    <p className="text-3xl font-black text-orange-600">
                        {Math.round((quadrants.badGood / total) * 100)}%
                    </p>
                    <p className="text-xs text-orange-700 mt-1">Bad Decision</p>
                    <p className="text-xs text-orange-700">Good Execution</p>
                    <p className="text-xs text-orange-600 mt-2">🧠 Strategy</p>
                </div>

                {/* Bad Decision, Bad Execution */}
                <div className="p-4 rounded-xl bg-red-50 text-center">
                    <p className="text-3xl font-black text-red-600">
                        {Math.round((quadrants.badBad / total) * 100)}%
                    </p>
                    <p className="text-xs text-red-700 mt-1">Bad Decision</p>
                    <p className="text-xs text-red-700">Bad Execution</p>
                    <p className="text-xs text-red-600 mt-2">⚠️ Mental</p>
                </div>
            </div>

            {/* Insight */}
            <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">
                    <strong>Insight:</strong> {' '}
                    {quadrants.goodGood > quadrants.goodBad + quadrants.badGood + quadrants.badBad
                        ? 'Great mental game! You\'re making good decisions and executing well.'
                        : quadrants.goodBad > quadrants.badGood
                            ? 'Your strategy is solid. Focus on mechanics and routine consistency.'
                            : 'Work on your pre-shot routine and shot selection to improve.'}
                </p>
            </div>
        </div>
    );
};

// ============================================================
// MENTAL SCORECARD
// ============================================================

export const MentalScorecard: React.FC<{
    round: MentalRound;
}> = ({ round }) => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return COLORS.success;
        if (score >= 60) return COLORS.warning;
        return COLORS.error;
    };

    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Header */}
            <div
                className="p-6 text-center text-white"
                style={{
                    background: round.overallMentalScore >= 70
                        ? `linear-gradient(135deg, ${COLORS.success}, #059669)`
                        : round.overallMentalScore >= 50
                            ? `linear-gradient(135deg, ${COLORS.warning}, #D97706)`
                            : `linear-gradient(135deg, ${COLORS.error}, #DC2626)`
                }}
            >
                <p className="text-sm opacity-80">Mental Score</p>
                <p className="text-5xl font-black mt-2">{round.overallMentalScore}</p>
                <p className="text-sm opacity-80 mt-2">{round.courseName}</p>
                <p className="text-xs opacity-60">{round.date.toLocaleDateString()}</p>
            </div>

            <div className="p-6">
                {/* Metrics */}
                <div className="space-y-4">
                    {/* Decision Quality */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">Decision Quality</span>
                            <span className={`font-bold ${getScoreColor(round.avgDecision * 20)}`}>
                                {round.avgDecision.toFixed(1)}/5
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${(round.avgDecision / 5) * 100}%`,
                                    backgroundColor: getProgressColor(round.avgDecision * 20)
                                }}
                            />
                        </div>
                    </div>

                    {/* Execution Quality */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">Execution Quality</span>
                            <span className={`font-bold ${getScoreColor(round.avgExecution * 20)}`}>
                                {round.avgExecution.toFixed(1)}/5
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${(round.avgExecution / 5) * 100}%`,
                                    backgroundColor: getProgressColor(round.avgExecution * 20)
                                }}
                            />
                        </div>
                    </div>

                    {/* Commitment Rate */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">Commitment Rate</span>
                            <span className={`font-bold ${getScoreColor(round.commitmentRate)}`}>
                                {round.commitmentRate}%
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${round.commitmentRate}%`,
                                    backgroundColor: getProgressColor(round.commitmentRate)
                                }}
                            />
                        </div>
                    </div>

                    {/* Focus Rating */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">Focus Rating</span>
                            <span className={`font-bold ${getScoreColor(round.focusRating)}`}>
                                {round.focusRating}%
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${round.focusRating}%`,
                                    backgroundColor: getProgressColor(round.focusRating)
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// PRE-SHOT ROUTINE TIMER
// ============================================================

export const RoutineTimer: React.FC<{
    routine: PreShotRoutine;
    onComplete: (duration: number) => void;
}> = ({ routine, onComplete }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    React.useEffect(() => {
        if (!isRunning) return;

        const timer = setInterval(() => {
            setElapsed(e => e + 0.1);
        }, 100);

        return () => clearInterval(timer);
    }, [isRunning]);

    // Auto-advance steps based on time
    React.useEffect(() => {
        let stepTime = 0;
        for (let i = 0; i <= currentStep; i++) {
            stepTime += routine.steps[i]?.duration || 0;
        }
        if (elapsed >= stepTime && currentStep < routine.steps.length - 1) {
            setCurrentStep(c => c + 1);
        }
    }, [elapsed, currentStep, routine.steps]);

    const handleStart = () => {
        setIsRunning(true);
        setElapsed(0);
        setCurrentStep(0);
    };

    const handleStop = () => {
        setIsRunning(false);
        onComplete(elapsed);
    };

    const stepProgress = routine.steps.slice(0, currentStep).reduce((sum, s) => sum + s.duration, 0);
    const currentStepProgress = Math.min(
        (elapsed - stepProgress) / (routine.steps[currentStep]?.duration || 1),
        1
    );

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Pre-Shot Routine</h3>

            {/* Timer Display */}
            <div className="text-center mb-6">
                <p className="text-6xl font-black" style={{ color: COLORS.primary }}>
                    {elapsed.toFixed(1)}s
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    Target: {routine.targetDuration}s
                </p>
            </div>

            {/* Current Step */}
            {isRunning && routine.steps[currentStep] && (
                <div className="p-4 bg-orange-50 rounded-xl mb-4 text-center">
                    <p className="text-sm text-orange-600 uppercase tracking-wider">Current Step</p>
                    <p className="text-xl font-bold text-orange-700 mt-1">
                        {routine.steps[currentStep].name}
                    </p>
                    <p className="text-sm text-orange-600 mt-1">
                        {routine.steps[currentStep].description}
                    </p>
                    <div className="mt-3 h-2 bg-orange-200 rounded-full">
                        <div
                            className="h-full bg-orange-500 rounded-full transition-all"
                            style={{ width: `${currentStepProgress * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Steps List */}
            <div className="space-y-2 mb-6">
                {routine.steps.map((step, i) => {
                    const isComplete = i < currentStep;
                    const isCurrent = i === currentStep && isRunning;
                    const isUpcoming = i > currentStep;

                    return (
                        <div
                            key={step.id}
                            className={`flex items-center gap-3 p-2 rounded-lg transition-all
                                ${isComplete ? 'bg-green-50' : ''}
                                ${isCurrent ? 'bg-orange-50' : ''}
                                ${isUpcoming ? 'opacity-50' : ''}`}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                ${isComplete ? 'bg-green-500 text-white' : ''}
                                ${isCurrent ? 'bg-orange-500 text-white' : ''}
                                ${isUpcoming ? 'bg-gray-200 text-gray-500' : ''}`}>
                                {isComplete ? '✓' : i + 1}
                            </div>
                            <span className={`text-sm ${isCurrent ? 'font-bold' : ''}`}>
                                {step.name}
                            </span>
                            <span className="text-xs text-gray-400 ml-auto">{step.duration}s</span>
                        </div>
                    );
                })}
            </div>

            {/* Control */}
            <button
                onClick={isRunning ? handleStop : handleStart}
                className={`w-full py-4 rounded-2xl font-bold text-white active:scale-95 transition-all`}
                style={{ backgroundColor: isRunning ? COLORS.error : COLORS.success }}
            >
                {isRunning ? 'Stop' : 'Start Routine'}
            </button>

            {/* Consistency Score */}
            {routine.actualDurations.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl text-center">
                    <p className="text-sm text-gray-600">
                        Consistency Score: <span className="font-bold" style={{ color: COLORS.primary }}>
                            {routine.consistencyScore}%
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
};

// ============================================================
// ROUTINE CONSISTENCY CHART
// ============================================================

export const RoutineConsistencyChart: React.FC<{
    routine: PreShotRoutine;
}> = ({ routine }) => {
    const { targetDuration, actualDurations } = routine;
    const maxDuration = Math.max(...actualDurations, targetDuration + 5);
    const minDuration = Math.min(...actualDurations, targetDuration - 5);
    const range = maxDuration - minDuration;

    const avg = actualDurations.reduce((a, b) => a + b, 0) / actualDurations.length;
    const variance = actualDurations.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / actualDurations.length;
    const stdDev = Math.sqrt(variance);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Routine Consistency</h3>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                        {avg.toFixed(1)}s
                    </p>
                    <p className="text-xs text-gray-500">Average</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-700">{targetDuration}s</p>
                    <p className="text-xs text-gray-500">Target</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className={`text-2xl font-bold ${stdDev <= 2 ? 'text-green-600' : 'text-orange-600'}`}>
                        ±{stdDev.toFixed(1)}s
                    </p>
                    <p className="text-xs text-gray-500">Variance</p>
                </div>
            </div>

            {/* Chart */}
            <div className="relative h-32">
                {/* Target Line */}
                <div
                    className="absolute left-0 right-0 h-px bg-green-400 border-dashed"
                    style={{ bottom: `${((targetDuration - minDuration) / range) * 100}%` }}
                >
                    <span className="absolute -right-1 -top-3 text-xs text-green-600">Target</span>
                </div>

                {/* Data Points */}
                <div className="absolute inset-0 flex items-end justify-around">
                    {actualDurations.map((duration, i) => {
                        const height = ((duration - minDuration) / range) * 100;
                        const isGood = Math.abs(duration - targetDuration) <= 2;

                        return (
                            <div
                                key={i}
                                className="w-6 rounded-t transition-all duration-300"
                                style={{
                                    height: `${height}%`,
                                    backgroundColor: isGood ? COLORS.success : COLORS.warning
                                }}
                            />
                        );
                    })}
                </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-2">
                Last {actualDurations.length} routines
            </p>
        </div>
    );
};

// ============================================================
// TENDENCY ANALYSIS
// ============================================================

export const TendencyAnalysis: React.FC<{
    tendencies: TendencyPattern[];
}> = ({ tendencies }) => {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Your Tendencies</h3>

            <div className="space-y-4">
                {tendencies.map((tendency, i) => (
                    <div
                        key={i}
                        className={`p-4 rounded-xl border-l-4
                            ${tendency.impact === 'POSITIVE' ? 'bg-green-50 border-green-500' : ''}
                            ${tendency.impact === 'NEGATIVE' ? 'bg-red-50 border-red-500' : ''}
                            ${tendency.impact === 'NEUTRAL' ? 'bg-gray-50 border-gray-400' : ''}`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="font-bold text-gray-900">{tendency.situation}</p>
                                <p className="text-sm text-gray-600">{tendency.tendency}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold
                                ${tendency.impact === 'POSITIVE' ? 'bg-green-200 text-green-700' : ''}
                                ${tendency.impact === 'NEGATIVE' ? 'bg-red-200 text-red-700' : ''}
                                ${tendency.impact === 'NEUTRAL' ? 'bg-gray-200 text-gray-700' : ''}`}>
                                {tendency.frequency}% frequency
                            </span>
                        </div>
                        <p className={`text-sm mt-2 p-2 rounded-lg
                            ${tendency.impact === 'POSITIVE' ? 'bg-green-100 text-green-700' : ''}
                            ${tendency.impact === 'NEGATIVE' ? 'bg-red-100 text-red-700' : ''}
                            ${tendency.impact === 'NEUTRAL' ? 'bg-gray-100 text-gray-700' : ''}`}>
                            💡 {tendency.suggestion}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================
// MENTAL GAME TRACKER MAIN VIEW
// ============================================================

export const MentalGameTracker: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ROUTINE' | 'TENDENCIES'>('OVERVIEW');

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-5 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Mental Game</h1>
                    <p className="text-sm text-gray-500">Track decision quality & focus</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    {(['OVERVIEW', 'ROUTINE', 'TENDENCIES'] as const).map((tab) => (
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
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="px-5 py-6 space-y-6">
                {activeTab === 'OVERVIEW' && (
                    <>
                        {/* Latest Mental Scorecard */}
                        <MentalScorecard round={MOCK_MENTAL_ROUNDS[0]} />

                        {/* Decision vs Execution */}
                        <DecisionExecutionMatrix shots={[
                            { id: 's1', holeNumber: 1, shotNumber: 1, club: 'DR', decisionRating: 4, executionRating: 4, outcome: 'GREAT', commitmentLevel: 'FULL', emotionalState: 'CALM' },
                            { id: 's2', holeNumber: 1, shotNumber: 2, club: '7i', decisionRating: 4, executionRating: 2, outcome: 'POOR', commitmentLevel: 'PARTIAL', emotionalState: 'ANXIOUS' },
                            { id: 's3', holeNumber: 2, shotNumber: 1, club: '5i', decisionRating: 2, executionRating: 4, outcome: 'GOOD', commitmentLevel: 'FULL', emotionalState: 'CONFIDENT' },
                            { id: 's4', holeNumber: 3, shotNumber: 1, club: 'DR', decisionRating: 5, executionRating: 5, outcome: 'GREAT', commitmentLevel: 'FULL', emotionalState: 'FOCUSED' },
                            { id: 's5', holeNumber: 3, shotNumber: 2, club: 'PW', decisionRating: 3, executionRating: 3, outcome: 'OK', commitmentLevel: 'FULL', emotionalState: 'CALM' },
                        ]} />

                        {/* Quick Shot Rating */}
                        <ShotQualityInput
                            holeNumber={4}
                            shotNumber={1}
                            onSubmit={(q) => console.log('Shot quality:', q)}
                        />
                    </>
                )}

                {activeTab === 'ROUTINE' && (
                    <>
                        <RoutineTimer
                            routine={DEFAULT_ROUTINE}
                            onComplete={(d) => console.log('Routine completed in:', d)}
                        />
                        <RoutineConsistencyChart routine={DEFAULT_ROUTINE} />
                    </>
                )}

                {activeTab === 'TENDENCIES' && (
                    <TendencyAnalysis tendencies={MOCK_TENDENCIES} />
                )}
            </div>
        </div>
    );
};

// ============================================================
// USAGE EXAMPLE
// ============================================================

/*
import {
    MentalGameTracker,
    ShotQualityInput,
    MentalScorecard,
    DecisionExecutionMatrix,
    RoutineTimer,
    TendencyAnalysis,
    MOCK_MENTAL_ROUNDS,
    DEFAULT_ROUTINE,
    MOCK_TENDENCIES
} from './NewFeatures_MentalGame';

// Full Mental Game Tracker
const MentalScreen: React.FC = () => {
    return <MentalGameTracker />;
};

// Individual Components
const QuickRating: React.FC = () => {
    return (
        <ShotQualityInput
            holeNumber={1}
            shotNumber={1}
            onSubmit={(q) => console.log(q)}
        />
    );
};
*/

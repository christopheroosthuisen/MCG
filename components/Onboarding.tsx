
import React, { useState } from 'react';
import { Text, Button } from './UIComponents';
import { COLORS } from '../constants';
import { db } from '../services/dataService';
import { OnboardingData, SkillLevel, PlayFrequency, HandPreference } from '../types';

interface OnboardingProps {
    onComplete: () => void;
}

const STEPS = [
    { id: 'welcome', title: "Welcome to MCG", subtitle: "Master Club Golf", description: "Your AI-powered golf coach for swing analysis, practice, and course strategy.", icon: "⛳" },
    { id: 'profile', title: "Let's Get Started", subtitle: "Profile Setup", description: "Tell us a bit about yourself.", icon: "👤" },
    { id: 'golf_info', title: "Your Game", subtitle: "Golf Profile", description: "Help us personalize your training plan.", icon: "🏌️" },
    { id: 'goals', title: "Set Your Goals", subtitle: "Targets", description: "What do you want to achieve?", icon: "🎯" },
    { id: 'complete', title: "You're Ready!", subtitle: "All Set", description: "Let's hit the course.", icon: "🚀" }
];

const SKILL_LEVELS: { value: SkillLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
  { value: 'intermediate', label: 'Intermediate', description: 'Comfortable on course' },
  { value: 'advanced', label: 'Advanced', description: 'Low handicap player' },
  { value: 'professional', label: 'Professional', description: 'Scratch or better' },
];

const GOAL_OPTIONS = [
  { id: 'lower_handicap', title: 'Lower Handicap', icon: '📉' },
  { id: 'break_score', title: 'Break Score Milestone', icon: '💯' },
  { id: 'distance', title: 'Increase Distance', icon: '🚀' },
  { id: 'consistency', title: 'Better Consistency', icon: '📊' },
  { id: 'putting', title: 'Master Putting', icon: '⛳' },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [data, setData] = useState<OnboardingData>({
        firstName: '', lastName: '', email: '',
        skillLevel: 'intermediate', handPreference: 'right', playFrequency: 'weekly', yearsPlaying: 0,
        goals: [], focusAreas: [], distanceUnit: 'yards', notifications: true, shareProgress: false, handicap: 18
    });

    const currentStep = STEPS[stepIndex];
    const isLastStep = stepIndex === STEPS.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            db.completeOnboarding(data.handicap || 18, data.handPreference === 'right' ? 'Right' : 'Left');
            db.updateUser({ name: `${data.firstName} ${data.lastName}`, email: data.email });
            // Save other preferences if needed
            onComplete();
        } else {
            setStepIndex(prev => prev + 1);
        }
    };

    const handleBack = () => setStepIndex(prev => Math.max(0, prev - 1));

    const renderStepContent = () => {
        switch (currentStep.id) {
            case 'welcome':
                return (
                    <div className="text-center px-6">
                        <div className="text-8xl mb-8 animate-bounce">{currentStep.icon}</div>
                        <Text variant="caption" className="uppercase font-bold tracking-widest text-orange-500 mb-2">{currentStep.subtitle}</Text>
                        <Text variant="h1" className="mb-4 text-4xl">{currentStep.title}</Text>
                        <Text className="text-gray-500 text-lg leading-relaxed">{currentStep.description}</Text>
                    </div>
                );
            case 'profile':
                return (
                    <div className="space-y-4 px-4 w-full">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">First Name</label>
                            <input type="text" value={data.firstName} onChange={e => setData({...data, firstName: e.target.value})} className="w-full p-4 rounded-xl border border-gray-300 focus:border-orange-500 outline-none text-lg" placeholder="Tiger" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
                            <input type="text" value={data.lastName} onChange={e => setData({...data, lastName: e.target.value})} className="w-full p-4 rounded-xl border border-gray-300 focus:border-orange-500 outline-none text-lg" placeholder="Woods" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                            <input type="email" value={data.email} onChange={e => setData({...data, email: e.target.value})} className="w-full p-4 rounded-xl border border-gray-300 focus:border-orange-500 outline-none text-lg" placeholder="tiger@mcg.com" />
                        </div>
                    </div>
                );
            case 'golf_info':
                return (
                    <div className="space-y-6 px-4 w-full">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Skill Level</label>
                            <div className="space-y-2">
                                {SKILL_LEVELS.map(level => (
                                    <button 
                                        key={level.value}
                                        onClick={() => setData({...data, skillLevel: level.value})}
                                        className={`w-full p-4 rounded-xl border text-left flex justify-between items-center transition-all ${data.skillLevel === level.value ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                    >
                                        <div>
                                            <div className={`font-bold ${data.skillLevel === level.value ? 'text-orange-900' : 'text-gray-900'}`}>{level.label}</div>
                                            <div className="text-xs text-gray-500">{level.description}</div>
                                        </div>
                                        {data.skillLevel === level.value && <span className="text-orange-500 font-bold">✓</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Dexterity</label>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    {['right', 'left'].map(d => (
                                        <button 
                                            key={d}
                                            onClick={() => setData({...data, handPreference: d as HandPreference})}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${data.handPreference === d ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Handicap</label>
                                <input type="number" value={data.handicap} onChange={e => setData({...data, handicap: parseFloat(e.target.value)})} className="w-full p-2.5 rounded-xl border border-gray-300 text-center font-bold" />
                            </div>
                        </div>
                    </div>
                );
            case 'goals':
                return (
                    <div className="px-4 w-full">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Select Top 3 Goals</label>
                        <div className="grid grid-cols-2 gap-3">
                            {GOAL_OPTIONS.map(goal => {
                                const selected = data.goals.includes(goal.id);
                                return (
                                    <button 
                                        key={goal.id}
                                        onClick={() => {
                                            if (selected) setData({...data, goals: data.goals.filter(g => g !== goal.id)});
                                            else if (data.goals.length < 3) setData({...data, goals: [...data.goals, goal.id]});
                                        }}
                                        className={`p-4 rounded-xl border text-center transition-all ${selected ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                    >
                                        <div className="text-2xl mb-2">{goal.icon}</div>
                                        <div className={`text-sm font-bold ${selected ? 'text-orange-900' : 'text-gray-700'}`}>{goal.title}</div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                );
            case 'complete':
                return (
                    <div className="text-center px-6">
                        <div className="text-8xl mb-6">🎉</div>
                        <Text variant="h1" className="mb-4">You're All Set!</Text>
                        <Text className="text-gray-500 mb-8">Your personalized golf plan is ready. Let's start improving your game.</Text>
                        <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-2">Your Profile</div>
                            <div className="font-bold text-gray-900">{data.firstName} {data.lastName}</div>
                            <div className="text-sm text-gray-600 capitalize">{data.skillLevel} • {data.handPreference}-Handed</div>
                            <div className="text-sm text-gray-600 mt-1">{data.goals.length} Goals Selected</div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            {/* Progress Bar */}
            <div className="h-1 bg-gray-100 w-full">
                <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}></div>
            </div>

            {/* Header */}
            <div className="p-6 flex justify-between items-center">
                {stepIndex > 0 ? (
                    <button onClick={handleBack} className="text-gray-400 hover:text-gray-600 font-bold text-sm">Back</button>
                ) : <div/>}
                <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">Step {stepIndex + 1}/{STEPS.length}</div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full pb-8">
                {renderStepContent()}
            </div>

            {/* Footer */}
            <div className="p-6 pb-8 border-t border-gray-100 bg-white">
                <Button fullWidth size="lg" onClick={handleNext} disabled={currentStep.id === 'profile' && (!data.firstName || !data.lastName)}>
                    {isLastStep ? "Start Training" : "Continue"}
                </Button>
            </div>
        </div>
    );
};

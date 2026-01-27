// ============================================================
// CATEGORY 1: ONBOARDING & FIRST-TIME EXPERIENCE
// ============================================================
// Copy each section into your project as needed.
//
// FILES TO MODIFY:
// 1. Create: components/Onboarding.tsx (NEW FILE)
// 2. Modify: App.tsx (add onboarding check)
// 3. Modify: constants.ts (add greeting helper)
// ============================================================

// ============================================================
// FILE 1: components/Onboarding.tsx (CREATE NEW FILE)
// ============================================================
// Copy everything below into a new file: components/Onboarding.tsx

import React, { useState } from 'react';
import { Text, Button, Card, Input } from './UIComponents';
import { COLORS } from '../constants';

interface OnboardingProps {
    onComplete: (userData: OnboardingData) => void;
    onSkip: () => void;
}

interface OnboardingData {
    handicap: string;
    homeCourse: string;
    dexterity: 'LEFT' | 'RIGHT';
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [userData, setUserData] = useState<OnboardingData>({
        handicap: '',
        homeCourse: '',
        dexterity: 'RIGHT'
    });

    const steps = [
        // Step 0: Welcome
        {
            title: "Welcome to MCG",
            subtitle: "Mayo Conservatory of Golf",
            content: (
                <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/30">
                        <span className="text-6xl">⛳</span>
                    </div>
                    <Text variant="h2" className="mb-3">Master the Art & Science</Text>
                    <Text variant="body" color="#6B7280" className="max-w-xs mx-auto">
                        AI-powered swing analysis and structured learning paths designed by TrackMan Maestro Joe Mayo.
                    </Text>
                </div>
            )
        },
        // Step 1: AI Analysis
        {
            title: "AI-Powered Analysis",
            subtitle: "See what the pros see",
            content: (
                <div className="text-center">
                    <div className="relative w-48 h-64 mx-auto mb-6 rounded-2xl bg-gray-900 overflow-hidden border-4 border-gray-800 shadow-xl">
                        {/* Simulated phone with skeleton overlay */}
                        <div className="absolute inset-4 bg-gradient-to-b from-green-900/50 to-green-800/50 rounded-lg">
                            {/* Stick figure skeleton */}
                            <svg className="w-full h-full" viewBox="0 0 100 140">
                                <circle cx="50" cy="20" r="8" fill="none" stroke="#FF8200" strokeWidth="2"/>
                                <line x1="50" y1="28" x2="50" y2="70" stroke="#10B981" strokeWidth="2"/>
                                <line x1="50" y1="40" x2="30" y2="60" stroke="#3B82F6" strokeWidth="2"/>
                                <line x1="50" y1="40" x2="75" y2="35" stroke="#3B82F6" strokeWidth="2"/>
                                <line x1="50" y1="70" x2="35" y2="110" stroke="white" strokeWidth="2"/>
                                <line x1="50" y1="70" x2="65" y2="110" stroke="white" strokeWidth="2"/>
                                {/* Club */}
                                <line x1="75" y1="35" x2="85" y2="5" stroke="#F59E0B" strokeWidth="2"/>
                            </svg>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg p-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                                <span className="text-[10px] text-white font-medium">AI Analyzing...</span>
                            </div>
                        </div>
                    </div>
                    <Text variant="h3" className="mb-2">Instant Feedback</Text>
                    <Text variant="caption" className="max-w-xs mx-auto">
                        Record your swing and get real-time AI analysis on posture, plane, tempo, and more.
                    </Text>
                </div>
            )
        },
        // Step 2: Track Progress
        {
            title: "Track Your Journey",
            subtitle: "From here to scratch",
            content: (
                <div className="text-center">
                    <div className="flex justify-center gap-3 mb-6">
                        {/* Progress cards */}
                        <div className="bg-orange-500 text-white rounded-2xl p-4 w-28 shadow-lg shadow-orange-500/30">
                            <Text variant="metric" color="white" className="text-2xl">+12</Text>
                            <Text variant="caption" color="rgba(255,255,255,0.8)" className="text-[10px]">Today</Text>
                        </div>
                        <div className="bg-gray-100 rounded-2xl p-4 w-28 flex flex-col items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                            </svg>
                        </div>
                        <div className="bg-green-600 text-white rounded-2xl p-4 w-28 shadow-lg shadow-green-600/30">
                            <Text variant="metric" color="white" className="text-2xl">+6</Text>
                            <Text variant="caption" color="rgba(255,255,255,0.8)" className="text-[10px]">Goal</Text>
                        </div>
                    </div>
                    <Text variant="h3" className="mb-2">Set Goals, See Results</Text>
                    <Text variant="caption" className="max-w-xs mx-auto">
                        Track handicap, speed gains, and strokes gained across every part of your game.
                    </Text>
                </div>
            )
        },
        // Step 3: Quick Setup
        {
            title: "Quick Setup",
            subtitle: "Let's personalize your experience",
            content: (
                <div className="space-y-4">
                    <Input
                        label="Current Handicap (optional)"
                        placeholder="e.g., 15 or +2"
                        value={userData.handicap}
                        onChange={(e) => setUserData({ ...userData, handicap: e.target.value })}
                    />

                    <Input
                        label="Home Course (optional)"
                        placeholder="e.g., Pebble Beach"
                        value={userData.homeCourse}
                        onChange={(e) => setUserData({ ...userData, homeCourse: e.target.value })}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dominant Hand</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setUserData({ ...userData, dexterity: 'RIGHT' })}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                                    userData.dexterity === 'RIGHT'
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                Right-Handed
                            </button>
                            <button
                                onClick={() => setUserData({ ...userData, dexterity: 'LEFT' })}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                                    userData.dexterity === 'LEFT'
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                Left-Handed
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const isLastStep = currentStep === steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onComplete(userData);
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            {/* Header with Skip */}
            <div className="flex justify-between items-center p-4">
                <div className="w-16">
                    {currentStep > 0 && (
                        <button
                            onClick={handleBack}
                            className="text-gray-500 hover:text-gray-700 p-2"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                        </button>
                    )}
                </div>

                {/* Step Indicator */}
                <div className="flex gap-2">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                index === currentStep
                                    ? 'w-6 bg-orange-500'
                                    : index < currentStep
                                        ? 'w-1.5 bg-orange-300'
                                        : 'w-1.5 bg-gray-200'
                            }`}
                        />
                    ))}
                </div>

                <button
                    onClick={onSkip}
                    className="text-gray-400 hover:text-gray-600 text-sm font-medium w-16 text-right"
                >
                    Skip
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center px-6 pb-8">
                <div className="mb-8">
                    <Text variant="caption" className="text-orange-500 font-bold mb-1">
                        {steps[currentStep].subtitle}
                    </Text>
                    <Text variant="h1">{steps[currentStep].title}</Text>
                </div>

                <div className="flex-1 flex items-center justify-center">
                    {steps[currentStep].content}
                </div>
            </div>

            {/* Footer with CTA */}
            <div className="p-6 pb-10">
                <Button
                    fullWidth
                    size="lg"
                    onClick={handleNext}
                    className="shadow-xl shadow-orange-500/20"
                >
                    {isLastStep ? "Let's Go" : "Continue"}
                </Button>

                {currentStep === 0 && (
                    <p className="text-center text-xs text-gray-400 mt-4">
                        By continuing, you agree to our Terms of Service
                    </p>
                )}
            </div>
        </div>
    );
};

// ============================================================
// FILE 2: Add to constants.ts (GREETING HELPER)
// ============================================================
// Add this function to your constants.ts file

export const getTimeBasedGreeting = (name: string): string => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return `Good morning, ${name}`;
    } else if (hour >= 12 && hour < 17) {
        return `Good afternoon, ${name}`;
    } else if (hour >= 17 && hour < 21) {
        return `Good evening, ${name}`;
    } else {
        return `Night owl mode, ${name}`;
    }
};

// ============================================================
// FILE 3: Modifications to App.tsx
// ============================================================
// Add these changes to your App.tsx file

// STEP 1: Add import at the top of App.tsx
// import { Onboarding } from './components/Onboarding';
// import { getTimeBasedGreeting } from './constants';

// STEP 2: Add state for onboarding (inside your main App component)
// const [hasOnboarded, setHasOnboarded] = useState(() => {
//     return localStorage.getItem('mcg_onboarded') === 'true';
// });

// STEP 3: Add onboarding handlers
// const handleOnboardingComplete = (userData: any) => {
//     localStorage.setItem('mcg_onboarded', 'true');
//     localStorage.setItem('mcg_user_setup', JSON.stringify(userData));
//     setHasOnboarded(true);
// };
//
// const handleOnboardingSkip = () => {
//     localStorage.setItem('mcg_onboarded', 'true');
//     setHasOnboarded(true);
// };

// STEP 4: Add conditional render at the start of your return statement
// {!hasOnboarded && (
//     <Onboarding
//         onComplete={handleOnboardingComplete}
//         onSkip={handleOnboardingSkip}
//     />
// )}

// STEP 5: Update the greeting in HomeView (replace static greeting)
// Replace: "Welcome back, {user.name}"
// With: {getTimeBasedGreeting(user.name)}


// ============================================================
// FIRST-TIME USER TIP CARD (Add to Home Screen)
// ============================================================
// Add this component to show on first visit after onboarding

export const FirstTimeTip: React.FC<{
    onDismiss: () => void;
    onAction: () => void;
}> = ({ onDismiss, onAction }) => {
    return (
        <Card variant="glass" className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 relative overflow-hidden">
            {/* Dismiss button */}
            <button
                onClick={onDismiss}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>

            <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💡</span>
                </div>
                <div className="flex-1 pr-4">
                    <Text variant="h4" className="mb-1">Ready to see AI in action?</Text>
                    <Text variant="caption" className="mb-3">
                        Record your first swing and get instant feedback on your technique.
                    </Text>
                    <Button size="sm" onClick={onAction}>
                        Try It Now
                    </Button>
                </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-200/30 rounded-full blur-xl"/>
        </Card>
    );
};

// Usage in HomeView:
// const [showFirstTimeTip, setShowFirstTimeTip] = useState(() => {
//     return !localStorage.getItem('mcg_first_tip_dismissed');
// });
//
// {showFirstTimeTip && (
//     <FirstTimeTip
//         onDismiss={() => {
//             localStorage.setItem('mcg_first_tip_dismissed', 'true');
//             setShowFirstTimeTip(false);
//         }}
//         onAction={() => {
//             setShowFirstTimeTip(false);
//             // Navigate to video recorder
//             setRecordingActive(true);
//         }}
//     />
// )}

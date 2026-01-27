// ============================================================
// CATEGORY 5: EMPTY STATES & LOADING STATES
// ============================================================
// Copy each section into your project as needed.
//
// COMPONENTS INCLUDED:
// 1. EmptyState - Generic empty state with illustration
// 2. Specific Empty States - Pre-configured for common screens
// 3. ProcessingSteps - AI analysis step indicator
// 4. FullScreenLoader - Loading overlay
// 5. ContentPlaceholder - Placeholder while loading
// ============================================================

import React from 'react';
import { Text, Button, Card, ProgressBar } from './UIComponents';
import { COLORS } from '../constants';

// ============================================================
// 1. GENERIC EMPTY STATE COMPONENT
// ============================================================

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    variant?: 'default' | 'compact' | 'card';
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    secondaryAction,
    variant = 'default',
    className = ''
}) => {
    const content = (
        <>
            {/* Animated Icon Container */}
            <div className={`
                relative mx-auto mb-4
                ${variant === 'compact' ? 'w-16 h-16' : 'w-24 h-24'}
            `}>
                {/* Background circle */}
                <div className="absolute inset-0 bg-gray-100 rounded-full"/>
                {/* Decorative rings */}
                <div className="absolute inset-0 border-2 border-dashed border-gray-200 rounded-full animate-spin-slow" style={{ animationDuration: '20s' }}/>
                {/* Icon */}
                <div className={`
                    absolute inset-0 flex items-center justify-center
                    ${variant === 'compact' ? 'text-3xl' : 'text-5xl'}
                `}>
                    {icon}
                </div>
            </div>

            {/* Text Content */}
            <Text
                variant={variant === 'compact' ? 'h4' : 'h3'}
                className="mb-2"
                align="center"
            >
                {title}
            </Text>

            <Text
                variant="caption"
                align="center"
                className={`max-w-xs mx-auto ${variant === 'compact' ? 'text-xs' : ''}`}
            >
                {description}
            </Text>

            {/* Actions */}
            {(action || secondaryAction) && (
                <div className={`
                    flex flex-col items-center gap-2
                    ${variant === 'compact' ? 'mt-4' : 'mt-6'}
                `}>
                    {action && (
                        <Button
                            onClick={action.onClick}
                            size={variant === 'compact' ? 'sm' : 'md'}
                        >
                            {action.label}
                        </Button>
                    )}
                    {secondaryAction && (
                        <button
                            onClick={secondaryAction.onClick}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            {secondaryAction.label}
                        </button>
                    )}
                </div>
            )}
        </>
    );

    if (variant === 'card') {
        return (
            <Card variant="outlined" className={`text-center py-8 ${className}`}>
                {content}
            </Card>
        );
    }

    return (
        <div className={`
            text-center
            ${variant === 'compact' ? 'py-6' : 'py-12 px-6'}
            ${className}
        `}>
            {content}
        </div>
    );
};

// ============================================================
// 2. PRE-CONFIGURED EMPTY STATES
// ============================================================

// Empty Swings
export const EmptySwings: React.FC<{ onRecord: () => void }> = ({ onRecord }) => (
    <EmptyState
        icon="📹"
        title="No Swings Yet"
        description="Record your first swing to start building your video library and track your progress over time."
        action={{ label: 'Record Swing', onClick: onRecord }}
    />
);

// Empty Goals
export const EmptyGoals: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
    <EmptyState
        icon="🎯"
        title="Set Your First Goal"
        description="Define targets for club speed, handicap, or any metric you want to improve. Track your progress over time."
        action={{ label: 'Create Goal', onClick: onCreate }}
    />
);

// Empty Practice Sessions
export const EmptySessions: React.FC<{ onStart: () => void }> = ({ onStart }) => (
    <EmptyState
        icon="📊"
        title="No Practice Sessions"
        description="Start tracking your range sessions to see patterns in your practice and identify areas for improvement."
        action={{ label: 'Start Session', onClick: onStart }}
    />
);

// Empty Drills (filtered state)
export const EmptyDrillsFiltered: React.FC<{ onClearFilter: () => void }> = ({ onClearFilter }) => (
    <EmptyState
        icon="🔍"
        title="No Drills Found"
        description="No drills match your current filter. Try selecting a different category or clearing filters."
        action={{ label: 'Clear Filters', onClick: onClearFilter }}
        variant="compact"
    />
);

// Empty Course Progress
export const EmptyCourseProgress: React.FC<{ onBrowse: () => void }> = ({ onBrowse }) => (
    <EmptyState
        icon="📚"
        title="Start Learning"
        description="Choose a course to begin your journey. Our structured curriculum will guide you from short game to full swing."
        action={{ label: 'Browse Courses', onClick: onBrowse }}
    />
);

// Empty Bag
export const EmptyBag: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
    <EmptyState
        icon="🏌️"
        title="Your Bag is Empty"
        description="Add your clubs to track performance data and get personalized recommendations for each one."
        action={{ label: 'Add Clubs', onClick: onAdd }}
        variant="card"
    />
);

// No Search Results
export const NoSearchResults: React.FC<{ query: string; onClear: () => void }> = ({ query, onClear }) => (
    <EmptyState
        icon="🔎"
        title={`No results for "${query}"`}
        description="Try searching with different keywords or browse our categories instead."
        action={{ label: 'Clear Search', onClick: onClear }}
        variant="compact"
    />
);

// Network Error
export const NetworkError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
    <EmptyState
        icon="📡"
        title="Connection Issue"
        description="We couldn't load this content. Check your connection and try again."
        action={{ label: 'Retry', onClick: onRetry }}
        secondaryAction={{ label: 'Go Back', onClick: () => window.history.back() }}
    />
);

// ============================================================
// 3. AI PROCESSING STEPS INDICATOR
// ============================================================

type ProcessingStatus = 'pending' | 'active' | 'complete' | 'error';

interface ProcessingStep {
    label: string;
    status: ProcessingStatus;
}

export const ProcessingSteps: React.FC<{
    steps: ProcessingStep[];
    className?: string;
}> = ({ steps, className = '' }) => {
    return (
        <div className={`space-y-3 ${className}`}>
            {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                    {/* Status Icon */}
                    <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                        ${step.status === 'complete' ? 'bg-green-500 text-white' : ''}
                        ${step.status === 'active' ? 'bg-orange-500 text-white' : ''}
                        ${step.status === 'pending' ? 'bg-gray-200 text-gray-400' : ''}
                        ${step.status === 'error' ? 'bg-red-500 text-white' : ''}
                    `}>
                        {step.status === 'complete' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                            </svg>
                        )}
                        {step.status === 'active' && (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                        )}
                        {step.status === 'pending' && (
                            <span className="text-xs font-bold">{index + 1}</span>
                        )}
                        {step.status === 'error' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                            </svg>
                        )}
                    </div>

                    {/* Label */}
                    <span className={`
                        text-sm font-medium
                        ${step.status === 'complete' ? 'text-green-600' : ''}
                        ${step.status === 'active' ? 'text-orange-600' : ''}
                        ${step.status === 'pending' ? 'text-gray-400' : ''}
                        ${step.status === 'error' ? 'text-red-600' : ''}
                    `}>
                        {step.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

// Pre-configured AI Analysis Steps
export const AIAnalysisSteps: React.FC<{
    currentStep: number; // 0-3
    error?: boolean;
}> = ({ currentStep, error = false }) => {
    const getStatus = (index: number): ProcessingStatus => {
        if (error && index === currentStep) return 'error';
        if (index < currentStep) return 'complete';
        if (index === currentStep) return 'active';
        return 'pending';
    };

    const steps: ProcessingStep[] = [
        { label: 'Uploading video', status: getStatus(0) },
        { label: 'Detecting body keypoints', status: getStatus(1) },
        { label: 'Analyzing swing mechanics', status: getStatus(2) },
        { label: 'Generating feedback', status: getStatus(3) }
    ];

    return <ProcessingSteps steps={steps} />;
};

// ============================================================
// 4. FULL SCREEN LOADER
// ============================================================

export const FullScreenLoader: React.FC<{
    message?: string;
    submessage?: string;
    progress?: number;
    onCancel?: () => void;
}> = ({ message = 'Loading...', submessage, progress, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center w-72">
                {/* Spinner */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-gray-700 rounded-full"/>
                    <div className="absolute inset-0 border-4 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"/>

                    {progress !== undefined && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{Math.round(progress)}%</span>
                        </div>
                    )}
                </div>

                {/* Text */}
                <Text variant="h3" color="white" className="mb-2">{message}</Text>
                {submessage && (
                    <Text variant="caption" className="text-gray-400">{submessage}</Text>
                )}

                {/* Progress bar (optional) */}
                {progress !== undefined && (
                    <div className="mt-4">
                        <ProgressBar progress={progress} color={COLORS.primary} />
                    </div>
                )}

                {/* Cancel button */}
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="mt-6 text-gray-400 hover:text-white text-sm underline"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};

// ============================================================
// 5. AI ANALYSIS PROCESSING SCREEN
// ============================================================

export const AIProcessingScreen: React.FC<{
    currentStep: number;
    onCancel?: () => void;
}> = ({ currentStep, onCancel }) => {
    const messages = [
        'Processing your video...',
        'Detecting pose keypoints...',
        'Analyzing swing mechanics...',
        'Generating personalized feedback...'
    ];

    const tips = [
        'For best results, record from the down-the-line or face-on angle.',
        'Make sure the full body is visible in frame.',
        'Natural lighting produces the most accurate analysis.',
        'Our AI analyzes 23 body keypoints in your swing.'
    ];

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black z-50 flex flex-col items-center justify-center p-6">
            {/* Logo/Brand */}
            <div className="absolute top-6 left-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-black text-sm">M</span>
                    </div>
                    <span className="text-white font-bold">MCG</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-sm">
                {/* Animated Golf Ball */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                    {/* Outer ring */}
                    <div className="absolute inset-0 border-4 border-gray-700 rounded-full"/>
                    {/* Spinning accent */}
                    <div
                        className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"
                        style={{ animationDuration: '1.5s' }}
                    />
                    {/* Inner ring */}
                    <div
                        className="absolute inset-4 border-2 border-transparent border-b-green-500 rounded-full animate-spin"
                        style={{ animationDuration: '2s', animationDirection: 'reverse' }}
                    />
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl">⛳</span>
                    </div>
                </div>

                {/* Status Message */}
                <Text variant="h3" color="white" align="center" className="mb-6">
                    {messages[currentStep] || messages[0]}
                </Text>

                {/* Processing Steps */}
                <div className="bg-gray-800/50 rounded-2xl p-4 mb-6">
                    <AIAnalysisSteps currentStep={currentStep} />
                </div>

                {/* Tip */}
                <div className="text-center">
                    <Text variant="caption" className="text-gray-500 text-xs">
                        💡 {tips[currentStep % tips.length]}
                    </Text>
                </div>
            </div>

            {/* Cancel Button */}
            {onCancel && (
                <button
                    onClick={onCancel}
                    className="absolute bottom-8 text-gray-400 hover:text-white text-sm"
                >
                    Cancel Analysis
                </button>
            )}
        </div>
    );
};

// ============================================================
// 6. CONTENT PLACEHOLDER
// ============================================================
// Show while content is loading

export const ContentPlaceholder: React.FC<{
    type: 'swings' | 'drills' | 'courses' | 'goals' | 'sessions';
}> = ({ type }) => {
    const configs = {
        swings: { count: 3, layout: 'horizontal' },
        drills: { count: 4, layout: 'grid' },
        courses: { count: 2, layout: 'vertical' },
        goals: { count: 2, layout: 'vertical' },
        sessions: { count: 3, layout: 'vertical' }
    };

    const config = configs[type];

    if (config.layout === 'horizontal') {
        return (
            <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: config.count }).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-36">
                        <div className="animate-pulse">
                            <div className="h-24 bg-gray-200 rounded-2xl mb-2"/>
                            <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"/>
                            <div className="h-2 bg-gray-100 rounded w-1/2"/>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (config.layout === 'grid') {
        return (
            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: config.count }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-2xl mb-2"/>
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"/>
                        <div className="h-2 bg-gray-100 rounded w-1/2"/>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {Array.from({ length: config.count }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-3xl p-5 shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-200 rounded-xl"/>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"/>
                            <div className="h-3 bg-gray-100 rounded w-1/2"/>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ============================================================
// USAGE EXAMPLES
// ============================================================
/*

// Example 1: Empty state in Swings tab
const SwingsTab = () => {
    const [swings, setSwings] = useState([]);

    if (swings.length === 0) {
        return <EmptySwings onRecord={() => setRecordingActive(true)} />;
    }

    return swings.map(swing => <SwingCard swing={swing} />);
};


// Example 2: AI Processing flow
const AnalyzeScreen = () => {
    const [processingStep, setProcessingStep] = useState(-1);
    const [isProcessing, setIsProcessing] = useState(false);

    const startAnalysis = async () => {
        setIsProcessing(true);

        for (let step = 0; step < 4; step++) {
            setProcessingStep(step);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        setIsProcessing(false);
        // Navigate to results
    };

    if (isProcessing) {
        return (
            <AIProcessingScreen
                currentStep={processingStep}
                onCancel={() => setIsProcessing(false)}
            />
        );
    }

    return <RecordButton onClick={startAnalysis} />;
};


// Example 3: Loading state with placeholder
const DrillsView = () => {
    const [loading, setLoading] = useState(true);
    const [drills, setDrills] = useState([]);

    if (loading) {
        return <ContentPlaceholder type="drills" />;
    }

    if (drills.length === 0) {
        return <EmptyDrillsFiltered onClearFilter={clearFilters} />;
    }

    return <DrillGrid drills={drills} />;
};


// Example 4: Network error handling
const CoursesView = () => {
    const [error, setError] = useState(false);

    if (error) {
        return <NetworkError onRetry={() => fetchCourses()} />;
    }

    return <CourseList />;
};

*/

// ============================================================
// CATEGORY 4: VISUAL POLISH & MICRO-INTERACTIONS
// ============================================================
// Copy each section into your project as needed.
//
// COMPONENTS INCLUDED:
// 1. Skeleton - Loading skeleton states
// 2. AnimatedCard - Card with enhanced interactions
// 3. PullToRefresh - Pull to refresh hook
// 4. PageTransition - Animated page wrapper
// 5. Celebration - Confetti effect
// 6. Haptic - Visual haptic feedback
// 7. AnimatedNumber - Counting number animation
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { COLORS } from '../constants';

// ============================================================
// 1. SKELETON LOADING STATES
// ============================================================
// Use while content is loading

interface SkeletonProps {
    variant: 'text' | 'heading' | 'card' | 'avatar' | 'image' | 'button';
    width?: string | number;
    height?: string | number;
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    variant,
    width,
    height,
    className = ''
}) => {
    const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]";

    const variantStyles = {
        text: 'h-4 rounded-md',
        heading: 'h-6 rounded-md',
        card: 'h-32 rounded-3xl',
        avatar: 'rounded-full',
        image: 'rounded-2xl',
        button: 'h-12 rounded-2xl'
    };

    const defaultSizes = {
        text: { width: '75%', height: '16px' },
        heading: { width: '50%', height: '24px' },
        card: { width: '100%', height: '128px' },
        avatar: { width: '48px', height: '48px' },
        image: { width: '100%', height: '192px' },
        button: { width: '100%', height: '48px' }
    };

    const style = {
        width: width || defaultSizes[variant].width,
        height: height || defaultSizes[variant].height,
        animation: 'shimmer 1.5s infinite'
    };

    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
            <div
                className={`${baseClasses} ${variantStyles[variant]} ${className}`}
                style={style}
            />
        </>
    );
};

// Compound skeleton for common patterns
export const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-3xl p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
            <Skeleton variant="avatar" />
            <div className="flex-1">
                <Skeleton variant="text" width="60%" className="mb-2" />
                <Skeleton variant="text" width="40%" />
            </div>
        </div>
        <Skeleton variant="image" height="120px" />
    </div>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
                <Skeleton variant="avatar" width="56px" height="56px" />
                <div className="flex-1">
                    <Skeleton variant="text" width="70%" className="mb-2" />
                    <Skeleton variant="text" width="40%" />
                </div>
            </div>
        ))}
    </div>
);

// ============================================================
// 2. ANIMATED CARD
// ============================================================
// Enhanced card with press feedback

interface AnimatedCardProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
    children,
    onClick,
    className = '',
    disabled = false
}) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
        <div
            onClick={disabled ? undefined : onClick}
            onMouseDown={() => !disabled && setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={() => !disabled && setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
            className={`
                rounded-3xl p-5 bg-white shadow-lg
                transition-all duration-200 ease-out
                ${onClick && !disabled ? 'cursor-pointer' : ''}
                ${isPressed ? 'scale-[0.98] shadow-md brightness-95' : 'hover:-translate-y-1 hover:shadow-xl'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
};

// ============================================================
// 3. PULL TO REFRESH HOOK
// ============================================================
// Add pull-to-refresh functionality

interface PullToRefreshState {
    isPulling: boolean;
    isRefreshing: boolean;
    pullDistance: number;
}

export const usePullToRefresh = (
    onRefresh: () => Promise<void>,
    threshold: number = 80
) => {
    const [state, setState] = useState<PullToRefreshState>({
        isPulling: false,
        isRefreshing: false,
        pullDistance: 0
    });

    const startY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (containerRef.current?.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setState(prev => ({ ...prev, isPulling: true }));
        }
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!state.isPulling || state.isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const distance = Math.max(0, (currentY - startY.current) * 0.5);

        setState(prev => ({ ...prev, pullDistance: Math.min(distance, threshold * 1.5) }));
    }, [state.isPulling, state.isRefreshing, threshold]);

    const handleTouchEnd = useCallback(async () => {
        if (state.pullDistance >= threshold && !state.isRefreshing) {
            setState(prev => ({ ...prev, isRefreshing: true, pullDistance: threshold }));

            try {
                await onRefresh();
            } finally {
                setState({ isPulling: false, isRefreshing: false, pullDistance: 0 });
            }
        } else {
            setState({ isPulling: false, isRefreshing: false, pullDistance: 0 });
        }
    }, [state.pullDistance, state.isRefreshing, threshold, onRefresh]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: true });
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    return {
        containerRef,
        ...state,
        pullProgress: Math.min(state.pullDistance / threshold, 1)
    };
};

// Pull to refresh indicator component
export const PullToRefreshIndicator: React.FC<{
    pullProgress: number;
    isRefreshing: boolean;
}> = ({ pullProgress, isRefreshing }) => {
    const rotation = pullProgress * 360;

    return (
        <div
            className="flex justify-center items-center transition-all duration-200"
            style={{
                height: pullProgress * 60,
                opacity: pullProgress
            }}
        >
            <div
                className={`w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent ${
                    isRefreshing ? 'animate-spin' : ''
                }`}
                style={{
                    transform: isRefreshing ? undefined : `rotate(${rotation}deg)`
                }}
            />
        </div>
    );
};

// ============================================================
// 4. PAGE TRANSITION WRAPPER
// ============================================================
// Animated transitions between screens

type TransitionType = 'fade' | 'slideRight' | 'slideUp' | 'scale';

export const PageTransition: React.FC<{
    children: React.ReactNode;
    type?: TransitionType;
    show?: boolean;
    className?: string;
}> = ({ children, type = 'fade', show = true, className = '' }) => {
    const [shouldRender, setShouldRender] = useState(show);

    useEffect(() => {
        if (show) setShouldRender(true);
    }, [show]);

    const handleAnimationEnd = () => {
        if (!show) setShouldRender(false);
    };

    if (!shouldRender) return null;

    const animations = {
        fade: {
            enter: 'animate-in fade-in duration-300',
            exit: 'animate-out fade-out duration-200'
        },
        slideRight: {
            enter: 'animate-in slide-in-from-right duration-300',
            exit: 'animate-out slide-out-to-right duration-200'
        },
        slideUp: {
            enter: 'animate-in slide-in-from-bottom duration-300',
            exit: 'animate-out slide-out-to-bottom duration-200'
        },
        scale: {
            enter: 'animate-in zoom-in-95 fade-in duration-300',
            exit: 'animate-out zoom-out-95 fade-out duration-200'
        }
    };

    return (
        <div
            className={`${show ? animations[type].enter : animations[type].exit} ${className}`}
            onAnimationEnd={handleAnimationEnd}
        >
            {children}
        </div>
    );
};

// ============================================================
// 5. CELEBRATION EFFECT
// ============================================================
// Confetti for achievements and completions

interface ConfettiPiece {
    id: number;
    x: number;
    color: string;
    delay: number;
    duration: number;
}

export const Celebration: React.FC<{
    trigger: boolean;
    onComplete?: () => void;
}> = ({ trigger, onComplete }) => {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

    useEffect(() => {
        if (trigger) {
            const colors = ['#FF8200', '#115740', '#10B981', '#F59E0B', '#3B82F6', '#FFFFFF'];
            const newPieces: ConfettiPiece[] = Array.from({ length: 50 }).map((_, i) => ({
                id: i,
                x: Math.random() * 100,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 0.5,
                duration: 2 + Math.random() * 2
            }));
            setPieces(newPieces);

            const timer = setTimeout(() => {
                setPieces([]);
                onComplete?.();
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [trigger, onComplete]);

    if (pieces.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            <style>{`
                @keyframes confetti-fall {
                    0% {
                        transform: translateY(-100%) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `}</style>
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className="absolute w-3 h-3 rounded-sm"
                    style={{
                        left: `${piece.x}%`,
                        backgroundColor: piece.color,
                        animation: `confetti-fall ${piece.duration}s ease-out ${piece.delay}s forwards`
                    }}
                />
            ))}
        </div>
    );
};

// Simpler burst effect for smaller celebrations
export const CelebrationBurst: React.FC<{
    trigger: boolean;
    x?: number;
    y?: number;
}> = ({ trigger, x = 50, y = 50 }) => {
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (trigger) {
            setActive(true);
            const timer = setTimeout(() => setActive(false), 600);
            return () => clearTimeout(timer);
        }
    }, [trigger]);

    if (!active) return null;

    return (
        <div
            className="fixed pointer-events-none z-50"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
        >
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-orange-500"
                    style={{
                        animation: `burst 0.5s ease-out forwards`,
                        transform: `rotate(${i * 45}deg) translateY(0)`,
                        ['--angle' as any]: `${i * 45}deg`
                    }}
                />
            ))}
            <style>{`
                @keyframes burst {
                    0% {
                        transform: rotate(var(--angle)) translateY(0);
                        opacity: 1;
                    }
                    100% {
                        transform: rotate(var(--angle)) translateY(40px);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

// ============================================================
// 6. ANIMATED NUMBER
// ============================================================
// Count-up animation for metrics

export const AnimatedNumber: React.FC<{
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    className?: string;
}> = ({ value, duration = 1000, prefix = '', suffix = '', decimals = 0, className = '' }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const startTime = useRef<number>(0);
    const startValue = useRef<number>(0);

    useEffect(() => {
        startValue.current = displayValue;
        startTime.current = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime.current;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startValue.current + (value - startValue.current) * eased;

            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    return (
        <span className={className}>
            {prefix}{displayValue.toFixed(decimals)}{suffix}
        </span>
    );
};

// ============================================================
// 7. RIPPLE EFFECT
// ============================================================
// Touch ripple for buttons

export const Ripple: React.FC<{
    children: React.ReactNode;
    className?: string;
    color?: string;
}> = ({ children, className = '', color = 'rgba(255, 130, 0, 0.3)' }) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples(prev => [...prev, { x, y, id }]);

        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, 600);
    };

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            onClick={handleClick}
        >
            {children}
            {ripples.map(ripple => (
                <span
                    key={ripple.id}
                    className="absolute rounded-full pointer-events-none animate-ping"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: 10,
                        height: 10,
                        marginLeft: -5,
                        marginTop: -5,
                        backgroundColor: color,
                        animation: 'ripple 0.6s linear'
                    }}
                />
            ))}
            <style>{`
                @keyframes ripple {
                    0% {
                        transform: scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(40);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

// ============================================================
// 8. LOADING SPINNER VARIANTS
// ============================================================

export const LoadingSpinner: React.FC<{
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}> = ({ size = 'md', color = COLORS.primary }) => {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4'
    };

    return (
        <div
            className={`${sizes[size]} rounded-full border-gray-200 animate-spin`}
            style={{ borderTopColor: color }}
        />
    );
};

export const LoadingDots: React.FC<{
    color?: string;
}> = ({ color = COLORS.primary }) => {
    return (
        <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                        backgroundColor: color,
                        animationDelay: `${i * 0.15}s`
                    }}
                />
            ))}
        </div>
    );
};

// ============================================================
// USAGE EXAMPLES
// ============================================================
/*

// Example 1: Skeleton loading state
const DrillList = () => {
    const [loading, setLoading] = useState(true);
    const [drills, setDrills] = useState([]);

    if (loading) {
        return <SkeletonList count={4} />;
    }

    return drills.map(drill => <DrillCard drill={drill} />);
};


// Example 2: Pull to refresh
const HomeScreen = () => {
    const { containerRef, pullProgress, isRefreshing } = usePullToRefresh(
        async () => {
            await fetchLatestData();
        }
    );

    return (
        <div ref={containerRef} className="h-screen overflow-y-auto">
            <PullToRefreshIndicator
                pullProgress={pullProgress}
                isRefreshing={isRefreshing}
            />
            {/* Content *}
        </div>
    );
};


// Example 3: Celebration on achievement
const GoalCard = ({ goal }) => {
    const [showCelebration, setShowCelebration] = useState(false);

    const handleComplete = () => {
        setShowCelebration(true);
        markGoalComplete(goal.id);
    };

    return (
        <>
            <Celebration trigger={showCelebration} />
            <Card>
                {/* Goal content *}
                {goal.progress >= 100 && (
                    <Button onClick={handleComplete}>Claim Achievement!</Button>
                )}
            </Card>
        </>
    );
};


// Example 4: Animated metrics
const StatsDisplay = ({ handicap }) => (
    <div className="text-4xl font-black">
        <AnimatedNumber
            value={handicap}
            decimals={1}
            prefix={handicap > 0 ? '+' : ''}
            duration={1500}
        />
    </div>
);


// Example 5: Page transitions
const App = () => {
    const [screen, setScreen] = useState('home');

    return (
        <PageTransition type="slideRight" show={screen === 'detail'}>
            <DetailScreen />
        </PageTransition>
    );
};

*/

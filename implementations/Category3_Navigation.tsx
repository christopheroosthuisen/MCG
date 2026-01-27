// ============================================================
// CATEGORY 3: NAVIGATION & INFORMATION ARCHITECTURE
// ============================================================
// Copy each section into your project as needed.
//
// COMPONENTS INCLUDED:
// 1. EnhancedTabBar - Improved bottom navigation with indicator
// 2. ScreenHeader - Consistent header component
// 3. Breadcrumbs - Navigation context trail
// 4. BackButton - Standardized back button
// 5. FloatingBackButton - For full-screen overlays
// ============================================================

import React from 'react';
import { Text } from './UIComponents';
import { COLORS } from '../constants';

// ============================================================
// 1. ENHANCED TAB BAR
// ============================================================
// Replace your existing bottom navigation with this improved version

type TabType = 'HOME' | 'PRACTICE' | 'ANALYZE' | 'LEARN' | 'PROFILE';

interface TabConfig {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
}

const TAB_CONFIG: TabConfig[] = [
    {
        id: 'HOME',
        label: 'Home',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
        ),
        activeIcon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
        )
    },
    {
        id: 'PRACTICE',
        label: 'Practice',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
            </svg>
        ),
        activeIcon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6" fill="white"/>
                <circle cx="12" cy="12" r="2"/>
            </svg>
        )
    },
    {
        id: 'ANALYZE',
        label: 'Analyze',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
        ),
        activeIcon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
        )
    },
    {
        id: 'LEARN',
        label: 'Learn',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
        ),
        activeIcon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
        )
    },
    {
        id: 'PROFILE',
        label: 'Profile',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        ),
        activeIcon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        )
    }
];

export const EnhancedTabBar: React.FC<{
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}> = ({ activeTab, onTabChange }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-40">
            <div className="max-w-md mx-auto flex justify-around items-center h-16">
                {TAB_CONFIG.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="relative flex flex-col items-center justify-center w-16 h-full transition-all"
                        >
                            {/* Active indicator dot */}
                            {isActive && (
                                <div className="absolute -top-0.5 w-1 h-1 rounded-full bg-orange-500"/>
                            )}

                            {/* Icon */}
                            <div className={`transition-all duration-200 ${
                                isActive
                                    ? 'text-orange-500 scale-110'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}>
                                {isActive ? tab.activeIcon : tab.icon}
                            </div>

                            {/* Label */}
                            <span className={`text-[10px] mt-1 font-medium transition-colors ${
                                isActive ? 'text-orange-500' : 'text-gray-400'
                            }`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

// ============================================================
// 2. SCREEN HEADER COMPONENT
// ============================================================
// Consistent header for all screens

interface ScreenHeaderProps {
    variant?: 'default' | 'transparent' | 'dark';
    title?: string;
    subtitle?: string;
    leftAction?: React.ReactNode;
    rightAction?: React.ReactNode;
    sticky?: boolean;
    showBorder?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
    variant = 'default',
    title,
    subtitle,
    leftAction,
    rightAction,
    sticky = true,
    showBorder = true
}) => {
    const bgStyles = {
        default: 'bg-white',
        transparent: 'bg-transparent',
        dark: 'bg-gray-900'
    };

    const textColor = variant === 'dark' ? 'white' : undefined;

    return (
        <header className={`
            ${bgStyles[variant]}
            ${sticky ? 'sticky top-0 z-30' : ''}
            ${showBorder && variant === 'default' ? 'border-b border-gray-100' : ''}
            px-4 py-3
        `}>
            <div className="flex items-center justify-between gap-4">
                {/* Left action area */}
                <div className="w-10 flex justify-start">
                    {leftAction}
                </div>

                {/* Center title area */}
                <div className="flex-1 text-center">
                    {title && (
                        <Text
                            variant="h4"
                            color={textColor}
                            className="font-bold truncate"
                        >
                            {title}
                        </Text>
                    )}
                    {subtitle && (
                        <Text
                            variant="caption"
                            className={variant === 'dark' ? 'text-gray-400' : ''}
                        >
                            {subtitle}
                        </Text>
                    )}
                </div>

                {/* Right action area */}
                <div className="w-10 flex justify-end">
                    {rightAction}
                </div>
            </div>
        </header>
    );
};

// ============================================================
// 3. BREADCRUMBS COMPONENT
// ============================================================
// Shows navigation path for nested screens

interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
}

export const Breadcrumbs: React.FC<{
    items: BreadcrumbItem[];
    className?: string;
}> = ({ items, className = '' }) => {
    return (
        <div className={`flex items-center gap-2 text-sm overflow-x-auto hide-scrollbar ${className}`}>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <React.Fragment key={index}>
                        {index > 0 && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        )}
                        {isLast ? (
                            <span className="font-semibold text-gray-900 truncate max-w-[150px]">
                                {item.label}
                            </span>
                        ) : (
                            <button
                                onClick={item.onClick}
                                className="text-gray-400 hover:text-gray-600 transition-colors truncate max-w-[100px]"
                            >
                                {item.label}
                            </button>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// ============================================================
// 4. BACK BUTTON COMPONENT
// ============================================================
// Standardized back button for headers

export const BackButton: React.FC<{
    onClick: () => void;
    variant?: 'default' | 'light' | 'dark';
    label?: string;
}> = ({ onClick, variant = 'default', label }) => {
    const styles = {
        default: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        light: 'text-white/80 hover:text-white hover:bg-white/10',
        dark: 'text-gray-400 hover:text-white hover:bg-gray-800'
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1 p-2 -ml-2 rounded-full transition-colors ${styles[variant]}`}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            {label && <span className="text-sm font-medium">{label}</span>}
        </button>
    );
};

// ============================================================
// 5. FLOATING BACK BUTTON
// ============================================================
// For full-screen overlays (video player, etc.)

export const FloatingBackButton: React.FC<{
    onClick: () => void;
}> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
        </button>
    );
};

// ============================================================
// 6. PAGE CONTAINER WITH SAFE AREAS
// ============================================================
// Wrapper that handles bottom navigation spacing

export const PageContainer: React.FC<{
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
    noBottomPadding?: boolean;
}> = ({ children, className = '', noPadding = false, noBottomPadding = false }) => {
    return (
        <div className={`
            min-h-screen bg-[#F5F5F7]
            ${!noPadding ? 'p-6' : ''}
            ${!noBottomPadding ? 'pb-24' : ''}
            ${className}
        `}>
            {children}
        </div>
    );
};

// ============================================================
// 7. SECTION HEADER
// ============================================================
// Consistent section headers with optional action

export const SectionHeader: React.FC<{
    title: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}> = ({ title, action, className = '' }) => {
    return (
        <div className={`flex items-center justify-between mb-3 ${className}`}>
            <Text variant="h4">{title}</Text>
            {action && (
                <button
                    onClick={action.onClick}
                    className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

// ============================================================
// USAGE EXAMPLES
// ============================================================
/*

// Example 1: Replace bottom nav in App.tsx
// Old:
<nav className="fixed bottom-0 ...">
    {['HOME', 'PRACTICE', ...].map(...)}
</nav>

// New:
<EnhancedTabBar
    activeTab={currentTab}
    onTabChange={setCurrentTab}
/>


// Example 2: Use ScreenHeader in detail views
const DrillDetail = ({ drill, onBack }) => (
    <div>
        <ScreenHeader
            title={drill.title}
            subtitle={drill.category}
            leftAction={<BackButton onClick={onBack} />}
            rightAction={
                <button className="text-orange-500 font-bold text-sm">Save</button>
            }
        />
        {/* ... content ... *}
    </div>
);


// Example 3: Use Breadcrumbs for deep navigation
const LessonPlayer = ({ course, module, lesson, onNavigate }) => (
    <div>
        <ScreenHeader
            leftAction={<BackButton onClick={() => onNavigate('course')} />}
        />
        <div className="px-4 py-2 border-b border-gray-100">
            <Breadcrumbs items={[
                { label: 'Learn', onClick: () => onNavigate('learn') },
                { label: course.title, onClick: () => onNavigate('course') },
                { label: module.title, onClick: () => onNavigate('module') },
                { label: lesson.title }
            ]} />
        </div>
        {/* ... content ... *}
    </div>
);


// Example 4: Use PageContainer for consistent spacing
const PracticeTab = () => (
    <PageContainer>
        <SectionHeader
            title="Short Game Drills"
            action={{ label: 'See All', onClick: () => {} }}
        />
        {/* ... content ... *}
    </PageContainer>
);


// Example 5: Use FloatingBackButton in full-screen views
const AnalysisResult = ({ onBack }) => (
    <div className="fixed inset-0 bg-black z-50">
        <FloatingBackButton onClick={onBack} />
        {/* Video player content *}
    </div>
);

*/

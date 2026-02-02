import React from 'react';
import { COLORS } from '../constants';

// Typography
export const Text: React.FC<{
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'metric' | 'metric-label';
    color?: string;
    children: React.ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right';
    onClick?: () => void;
}> = ({ variant = 'body', color, children, className = '', align = 'left', onClick }) => {
    const baseStyle = "font-sans transition-colors";
    let variantStyle = "";

    switch (variant) {
        case 'h1': variantStyle = "text-3xl font-bold tracking-tight"; break;
        case 'h2': variantStyle = "text-2xl font-bold"; break;
        case 'h3': variantStyle = "text-xl font-semibold"; break;
        case 'h4': variantStyle = "text-lg font-medium"; break;
        case 'body': variantStyle = "text-base leading-relaxed"; break;
        case 'caption': variantStyle = "text-sm text-gray-500"; break;
        case 'metric': variantStyle = "text-3xl font-black font-mono tracking-tighter"; break;
        case 'metric-label': variantStyle = "text-xs font-bold uppercase tracking-wider text-gray-500"; break;
    }

    const colorStyle = color ? "" : (variant === 'caption' || variant === 'metric-label' ? '' : 'text-gray-900');
    const alignStyle = `text-${align}`;
    const cursorStyle = onClick ? "cursor-pointer hover:opacity-80" : "";

    return (
        <div 
            className={`${baseStyle} ${variantStyle} ${colorStyle} ${alignStyle} ${cursorStyle} ${className}`} 
            style={{ color: color }}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

// Button
export const Button: React.FC<{
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    onClick?: (e: React.MouseEvent) => void;
    children?: React.ReactNode;
    fullWidth?: boolean;
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
    loading?: boolean;
}> = ({ variant = 'primary', size = 'md', onClick, children, fullWidth = false, disabled = false, className = '', icon, loading = false }) => {
    let bg = "";
    let text = "";
    let border = "";

    switch (variant) {
        case 'primary':
            bg = `bg-[${COLORS.primary}] hover:brightness-95 shadow-md shadow-orange-500/20`;
            text = "text-white";
            border = "border-transparent";
            break;
        case 'secondary':
            bg = `bg-[${COLORS.secondary}] hover:brightness-110 shadow-md shadow-green-900/20`;
            text = "text-white";
            border = "border-transparent";
            break;
        case 'outline':
            bg = "bg-transparent hover:bg-orange-50";
            text = `text-[${COLORS.primary}]`;
            border = `border-[${COLORS.primary}] border-2`;
            break;
        case 'ghost':
            bg = "bg-transparent hover:bg-gray-100";
            text = "text-gray-600";
            border = "border-transparent";
            break;
        case 'danger':
            bg = "bg-red-500 hover:bg-red-600";
            text = "text-white";
            border = "border-transparent";
            break;
    }

    const sizeStyle = size === 'sm' ? "px-4 py-2 text-sm" : size === 'lg' ? "px-8 py-4 text-lg" : "px-6 py-3";
    const widthStyle = fullWidth ? "w-full" : "";
    const disabledStyle = (disabled || loading) ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer active:scale-95 active:brightness-90 transition-all duration-100 shadow-lg active:shadow-md";

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`rounded-2xl font-bold flex items-center justify-center gap-2 ${bg} ${text} ${border} ${sizeStyle} ${widthStyle} ${disabledStyle} ${className}`}
            style={
                variant === 'primary' ? { backgroundColor: COLORS.primary } : 
                variant === 'secondary' ? { backgroundColor: COLORS.secondary } : 
                variant === 'outline' ? { color: COLORS.primary, borderColor: COLORS.primary } : {}
            }
        >
            {loading ? <span className="animate-spin text-xl">⟳</span> : icon}
            {children}
        </button>
    );
};

// Card
export const Card: React.FC<{
    variant?: 'elevated' | 'outlined' | 'filled' | 'glass';
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}> = ({ variant = 'elevated', children, className = '', onClick }) => {
    let base = "rounded-3xl p-5 transition-all duration-300";
    if (variant === 'elevated') base += " bg-white shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-200/60";
    if (variant === 'outlined') base += " bg-white border border-gray-200";
    if (variant === 'filled') base += " bg-gray-50 border border-transparent";
    if (variant === 'glass') base += " bg-white/80 backdrop-blur-md border border-white/20 shadow-sm";
    
    if (onClick) base += " cursor-pointer hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:shadow-lg";

    return (
        <div className={`${base} ${className}`} onClick={onClick}>
            {children}
        </div>
    );
};

// Badge
export const Badge: React.FC<{
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'dark';
    children: React.ReactNode;
    className?: string;
}> = ({ variant = 'info', children, className = '' }) => {
    let colorClass = "";
    switch (variant) {
        case 'success': colorClass = "bg-green-100 text-green-800"; break;
        case 'warning': colorClass = "bg-yellow-100 text-yellow-800"; break;
        case 'error': colorClass = "bg-red-100 text-red-800"; break;
        case 'info': colorClass = "bg-blue-100 text-blue-800"; break;
        case 'neutral': colorClass = "bg-gray-100 text-gray-600"; break;
        case 'dark': colorClass = "bg-gray-800 text-white"; break;
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${colorClass} ${className}`}>
            {children}
        </span>
    );
};

// ProgressBar
export const ProgressBar: React.FC<{
    progress: number; // 0 to 100
    color?: string;
    className?: string;
}> = ({ progress, color = COLORS.primary, className = '' }) => {
    return (
        <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}>
            <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: color }}
            />
        </div>
    );
};

// Input
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <input 
                className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all ${className}`}
                {...props}
            />
        </div>
    );
};

// Tabs
export const Tabs: React.FC<{
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    className?: string;
}> = ({ tabs, activeTab, onTabChange, className = '' }) => {
    return (
        <div className={`flex border-b border-gray-200 overflow-x-auto hide-scrollbar ${className}`}>
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={`pb-3 px-1 mr-6 text-sm font-bold uppercase tracking-wide transition-all border-b-2 whitespace-nowrap ${
                        activeTab === tab 
                        ? `border-[${COLORS.primary}] text-gray-900` 
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                    style={activeTab === tab ? { borderColor: COLORS.primary } : {}}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

// --- NEW COMPONENTS ---

// Skeleton Loader
export const Skeleton: React.FC<{ variant?: 'text' | 'card' | 'avatar' | 'image', className?: string }> = ({ variant = 'text', className = '' }) => {
    let base = "animate-pulse bg-gray-200";
    if (variant === 'text') base += " h-4 w-3/4 rounded";
    if (variant === 'card') base += " h-32 w-full rounded-2xl";
    if (variant === 'avatar') base += " h-12 w-12 rounded-full";
    if (variant === 'image') base += " h-48 w-full rounded-xl";

    return <div className={`${base} ${className}`} />;
};

// Toggle Switch
export const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => {
    return (
        <button 
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
            onClick={() => onChange(!checked)}
        >
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );
};

// Circular Progress Ring
export const ProgressRing: React.FC<{ progress: number; size?: number; stroke?: number; color?: string; className?: string }> = ({ progress, size = 60, stroke = 4, color = COLORS.primary, className = '' }) => {
    const radius = size / 2 - stroke;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg className={`transform -rotate-90 ${className}`} width={size} height={size}>
            <circle
                stroke="#E5E7EB"
                strokeWidth={stroke}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
            />
            <circle
                stroke={color}
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                className="transition-all duration-1000 ease-out"
            />
        </svg>
    );
};

// Empty State
export const EmptyState: React.FC<{ 
    icon: string; 
    title: string; 
    description: string; 
    actionLabel?: string; 
    onAction?: () => void; 
}> = ({ icon, title, description, actionLabel, onAction }) => {
    return (
        <div className="text-center py-12 px-6 flex flex-col items-center animate-in fade-in duration-500">
            <div className="text-6xl mb-4 grayscale opacity-50">{icon}</div>
            <Text variant="h3" className="mb-2">{title}</Text>
            <Text color="gray" className="mb-6 max-w-xs">{description}</Text>
            {actionLabel && onAction && (
                <Button onClick={onAction}>{actionLabel}</Button>
            )}
        </div>
    );
};

// Quick Action Button
export const QuickAction: React.FC<{ icon: string; label: string; onClick: () => void }> = ({ icon, label, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all duration-200"
        >
            <div className="text-2xl">{icon}</div>
            <span className="text-xs font-bold text-gray-600">{label}</span>
        </button>
    );
};

// Screen Header
export const ScreenHeader: React.FC<{
    title: string;
    subtitle?: string;
    leftAction?: React.ReactNode;
    rightAction?: React.ReactNode;
    sticky?: boolean;
}> = ({ title, subtitle, leftAction, rightAction, sticky = true }) => {
    return (
        <div className={`px-4 pt-6 pb-4 bg-[#F5F5F7] z-20 ${sticky ? 'sticky top-0' : ''}`}>
            {subtitle && (
                <Text variant="caption" className="uppercase font-bold tracking-widest text-orange-500 mb-1">{subtitle}</Text>
            )}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {leftAction}
                    <Text variant="h1" className="mb-0 leading-none">{title}</Text>
                </div>
                <div>{rightAction}</div>
            </div>
        </div>
    );
};

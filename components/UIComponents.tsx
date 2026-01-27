import React from 'react';
import { COLORS, RADIUS } from '../constants';

// Typography
export const Text: React.FC<{
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'metric' | 'metric-label';
    color?: string;
    children: React.ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right';
}> = ({ variant = 'body', color, children, className = '', align = 'left' }) => {
    const baseStyle = "font-sans";
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

    return (
        <div 
            className={`${baseStyle} ${variantStyle} ${colorStyle} ${alignStyle} ${className}`} 
            style={{ color: color }}
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
    children: React.ReactNode;
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
    const disabledStyle = (disabled || loading) ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer active:scale-[0.98] transition-all duration-200";

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
    if (variant === 'outlined') base += " bg-white border border-gray-100";
    if (variant === 'filled') base += " bg-gray-50 border border-transparent";
    if (variant === 'glass') base += " bg-white/80 backdrop-blur-md border border-white/20 shadow-sm";
    
    if (onClick) base += " cursor-pointer hover:-translate-y-1";

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
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colorClass} ${className}`}>
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
        <div className={`flex border-b border-gray-200 ${className}`}>
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={`pb-3 px-1 mr-6 text-sm font-bold uppercase tracking-wide transition-all border-b-2 ${
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

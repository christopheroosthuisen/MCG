// ============================================================
// CATEGORY 10: PROFILE & SETTINGS
// ============================================================
// Copy each section into your project as needed.
//
// COMPONENTS INCLUDED:
// 1. ProfileHeader - Enhanced profile header
// 2. ProfileCompletion - Completion indicator
// 3. SwingDNARadar - Radar chart visualization
// 4. ClubCard (Enhanced) - Club with avg distance
// 5. StatsGrid - Player statistics display
// 6. SettingsSection - Settings group container
// 7. SettingsToggle - Toggle switch
// 8. SubscriptionCard - Membership status
// 9. DarkModeToggle - Theme toggle component
// 10. ProfileEditor - Edit profile modal
// ============================================================

import React, { useState } from 'react';
import { Text, Button, Card, Badge, ProgressBar, Input } from './UIComponents';
import { COLORS } from '../constants';
import { UserProfile, Club } from '../types';

// ============================================================
// 1. ENHANCED PROFILE HEADER
// ============================================================

interface ProfileHeaderProps {
    user: UserProfile;
    onEditProfile: () => void;
    onViewAchievements: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    user,
    onEditProfile,
    onViewAchievements
}) => {
    const memberColors = {
        FREE: 'bg-gray-100 text-gray-600',
        PRO: 'bg-orange-100 text-orange-600',
        TOUR: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
    };

    return (
        <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 h-32 bg-gradient-to-br from-gray-900 to-gray-800 rounded-b-3xl"/>

            <div className="relative pt-6 px-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                    {/* Avatar & Info */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                            />
                            {/* Edit button overlay */}
                            <button
                                onClick={onEditProfile}
                                className="absolute bottom-0 right-0 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-orange-600 transition-colors"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                        </div>

                        <div>
                            <Text variant="h2" color="white">{user.name}</Text>
                            <Text variant="caption" className="text-gray-400">{user.homeCourse}</Text>
                            <Badge className={`mt-2 ${memberColors[user.memberStatus]}`}>
                                {user.memberStatus} Member
                            </Badge>
                        </div>
                    </div>

                    {/* Achievements button */}
                    <button
                        onClick={onViewAchievements}
                        className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                        🏆
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl shadow-lg p-4 mt-8">
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                            <Text variant="metric" className="text-lg">{user.stats.roundsPlayed}</Text>
                            <Text variant="caption" className="text-[10px]">Rounds</Text>
                        </div>
                        <div>
                            <Text variant="metric" className="text-lg">{user.stats.avgScore.toFixed(1)}</Text>
                            <Text variant="caption" className="text-[10px]">Avg Score</Text>
                        </div>
                        <div>
                            <Text variant="metric" className="text-lg text-green-600">
                                {user.swingDNA.handicap > 0 ? '+' : ''}{user.swingDNA.handicap.toFixed(1)}
                            </Text>
                            <Text variant="caption" className="text-[10px]">Handicap</Text>
                        </div>
                        <div>
                            <Text variant="metric" className="text-lg">{user.stats.puttsPerRound.toFixed(1)}</Text>
                            <Text variant="caption" className="text-[10px]">Putts/Rnd</Text>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// 2. PROFILE COMPLETION INDICATOR
// ============================================================

interface ProfileCompletionProps {
    completion: number;
    missingItems: string[];
    onComplete: () => void;
}

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
    completion,
    missingItems,
    onComplete
}) => {
    if (completion >= 100) return null;

    return (
        <Card variant="outlined" className="border-orange-200 bg-orange-50">
            <div className="flex items-center gap-4">
                {/* Progress ring */}
                <div className="relative w-14 h-14 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#FED7AA" strokeWidth="3"/>
                        <circle
                            cx="18" cy="18" r="16"
                            fill="none"
                            stroke="#FF8200"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${completion} 100`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-orange-600">{completion}%</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <Text variant="h4" className="text-orange-800">Complete Your Profile</Text>
                    <Text variant="caption" className="text-orange-600 text-xs">
                        {missingItems.length > 0
                            ? `Add ${missingItems.slice(0, 2).join(', ')}${missingItems.length > 2 ? ` +${missingItems.length - 2} more` : ''}`
                            : 'Almost there!'
                        }
                    </Text>
                </div>

                <Button size="sm" onClick={onComplete}>
                    Complete
                </Button>
            </div>
        </Card>
    );
};

// ============================================================
// 3. SWING DNA RADAR CHART
// ============================================================

interface SwingDNAData {
    speed: number;      // 0-100 percentile
    accuracy: number;
    consistency: number;
    shortGame: number;
    putting: number;
}

export const SwingDNARadar: React.FC<{
    data: SwingDNAData;
    size?: number;
}> = ({ data, size = 200 }) => {
    const center = size / 2;
    const radius = (size / 2) - 20;

    const labels = [
        { key: 'speed', label: 'Speed', angle: -90 },
        { key: 'accuracy', label: 'Accuracy', angle: -18 },
        { key: 'consistency', label: 'Consistency', angle: 54 },
        { key: 'shortGame', label: 'Short Game', angle: 126 },
        { key: 'putting', label: 'Putting', angle: 198 }
    ];

    const getPoint = (value: number, angle: number) => {
        const r = (value / 100) * radius;
        const rad = (angle * Math.PI) / 180;
        return {
            x: center + r * Math.cos(rad),
            y: center + r * Math.sin(rad)
        };
    };

    const dataPoints = labels.map(l => getPoint(data[l.key as keyof SwingDNAData], l.angle));
    const pathData = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                {/* Background circles */}
                {[20, 40, 60, 80, 100].map((level, i) => (
                    <circle
                        key={i}
                        cx={center}
                        cy={center}
                        r={(level / 100) * radius}
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="1"
                        strokeDasharray={level === 100 ? "none" : "4 4"}
                    />
                ))}

                {/* Axis lines */}
                {labels.map((l, i) => {
                    const end = getPoint(100, l.angle);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={end.x}
                            y2={end.y}
                            stroke="#E5E7EB"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data polygon */}
                <path
                    d={pathData}
                    fill="rgba(255, 130, 0, 0.2)"
                    stroke="#FF8200"
                    strokeWidth="2"
                />

                {/* Data points */}
                {dataPoints.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="#FF8200"
                    />
                ))}
            </svg>

            {/* Labels */}
            {labels.map((l, i) => {
                const labelPoint = getPoint(120, l.angle);
                return (
                    <div
                        key={i}
                        className="absolute text-[10px] font-medium text-gray-600 transform -translate-x-1/2 -translate-y-1/2 text-center"
                        style={{ left: labelPoint.x, top: labelPoint.y }}
                    >
                        <div>{l.label}</div>
                        <div className="text-orange-500 font-bold">
                            {data[l.key as keyof SwingDNAData]}
                        </div>
                    </div>
                )}
            )}
        </div>
    );
};

// ============================================================
// 4. ENHANCED CLUB CARD
// ============================================================

interface EnhancedClubCardProps {
    club: Club;
    avgDistance?: number;
    totalShots?: number;
    onClick?: () => void;
}

export const EnhancedClubCard: React.FC<EnhancedClubCardProps> = ({
    club,
    avgDistance,
    totalShots,
    onClick
}) => {
    const categoryIcons: Record<string, string> = {
        WOOD: '🪵',
        IRON: '🔩',
        WEDGE: '⚡',
        PUTTER: '🎯'
    };

    return (
        <Card
            variant="outlined"
            className="hover:border-orange-200 cursor-pointer transition-all"
            onClick={onClick}
        >
            <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl">
                    {categoryIcons[club.category] || '🏌️'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Text variant="h4">{club.type}</Text>
                        {club.loft && (
                            <Badge variant="neutral" className="text-[9px]">{club.loft}</Badge>
                        )}
                    </div>
                    <Text variant="caption" className="truncate">{club.name}</Text>
                    <Text variant="caption" className="text-[10px] text-gray-400 truncate">{club.shaft}</Text>
                </div>

                {/* Stats */}
                {avgDistance && (
                    <div className="text-right">
                        <Text variant="metric" className="text-lg text-orange-500">{avgDistance}</Text>
                        <Text variant="caption" className="text-[10px]">avg carry</Text>
                        {totalShots && (
                            <Text variant="caption" className="text-[9px] text-gray-400">{totalShots} shots</Text>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

// ============================================================
// 5. SETTINGS SECTION
// ============================================================

interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
    return (
        <div className="mb-6">
            <Text variant="caption" className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-3 px-1">
                {title}
            </Text>
            <Card variant="outlined" className="divide-y divide-gray-100">
                {children}
            </Card>
        </div>
    );
};

// ============================================================
// 6. SETTINGS TOGGLE
// ============================================================

interface SettingsToggleProps {
    label: string;
    description?: string;
    icon?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
    label,
    description,
    icon,
    checked,
    onChange
}) => {
    return (
        <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
                {icon && <span className="text-xl">{icon}</span>}
                <div>
                    <Text variant="body" className="font-medium">{label}</Text>
                    {description && (
                        <Text variant="caption" className="text-xs">{description}</Text>
                    )}
                </div>
            </div>

            {/* Toggle switch */}
            <button
                onClick={() => onChange(!checked)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                    checked ? 'bg-orange-500' : 'bg-gray-200'
                }`}
            >
                <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        checked ? 'left-6' : 'left-1'
                    }`}
                />
            </button>
        </div>
    );
};

// ============================================================
// 7. SETTINGS ROW (Link style)
// ============================================================

interface SettingsRowProps {
    label: string;
    icon?: string;
    value?: string;
    onClick: () => void;
    danger?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
    label,
    icon,
    value,
    onClick,
    danger = false
}) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                danger ? 'text-red-500' : ''
            }`}
        >
            <div className="flex items-center gap-3">
                {icon && <span className="text-xl">{icon}</span>}
                <Text variant="body" className={`font-medium ${danger ? 'text-red-500' : ''}`}>
                    {label}
                </Text>
            </div>

            <div className="flex items-center gap-2">
                {value && (
                    <Text variant="caption" className="text-gray-400">{value}</Text>
                )}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </div>
        </button>
    );
};

// ============================================================
// 8. SUBSCRIPTION CARD
// ============================================================

interface SubscriptionCardProps {
    plan: 'FREE' | 'PRO' | 'TOUR';
    expiresAt?: Date;
    onUpgrade: () => void;
    onManage: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
    plan,
    expiresAt,
    onUpgrade,
    onManage
}) => {
    const planDetails = {
        FREE: {
            name: 'Free Plan',
            color: 'bg-gray-100 text-gray-600',
            features: ['5 swing analyses/month', 'Basic drills access', 'Community support']
        },
        PRO: {
            name: 'Pro Plan',
            color: 'bg-orange-100 text-orange-600',
            features: ['Unlimited analyses', 'All courses & drills', 'Voice coaching', 'Priority support']
        },
        TOUR: {
            name: 'Tour Plan',
            color: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white',
            features: ['Everything in Pro', '1-on-1 coaching calls', 'Custom training plans', 'Early access features']
        }
    };

    const details = planDetails[plan];

    return (
        <Card
            variant="elevated"
            className={plan === 'TOUR' ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' : ''}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <Badge className={details.color}>{details.name}</Badge>
                    {expiresAt && plan !== 'FREE' && (
                        <Text variant="caption" className={`mt-2 text-xs ${plan === 'TOUR' ? 'text-gray-400' : ''}`}>
                            Renews {expiresAt.toLocaleDateString()}
                        </Text>
                    )}
                </div>

                {plan === 'TOUR' && (
                    <span className="text-2xl">👑</span>
                )}
            </div>

            <ul className="space-y-2 mb-4">
                {details.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={plan === 'TOUR' ? '#10B981' : '#FF8200'}>
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                        <span className={plan === 'TOUR' ? 'text-gray-300' : ''}>{feature}</span>
                    </li>
                ))}
            </ul>

            <div className="flex gap-3">
                {plan === 'FREE' ? (
                    <Button fullWidth onClick={onUpgrade}>
                        Upgrade to Pro
                    </Button>
                ) : (
                    <>
                        <Button
                            variant={plan === 'TOUR' ? 'outline' : 'secondary'}
                            fullWidth
                            onClick={onManage}
                            className={plan === 'TOUR' ? 'border-white/30 text-white hover:bg-white/10' : ''}
                        >
                            Manage
                        </Button>
                        {plan === 'PRO' && (
                            <Button fullWidth onClick={onUpgrade}>
                                Go Tour
                            </Button>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
};

// ============================================================
// 9. DARK MODE TOGGLE (Standalone)
// ============================================================

export const DarkModeToggle: React.FC<{
    isDark: boolean;
    onToggle: () => void;
}> = ({ isDark, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className={`relative w-16 h-8 rounded-full transition-colors ${
                isDark ? 'bg-gray-800' : 'bg-blue-100'
            }`}
        >
            {/* Sun icon */}
            <div className={`absolute left-1.5 top-1.5 w-5 h-5 transition-opacity ${isDark ? 'opacity-30' : 'opacity-100'}`}>
                ☀️
            </div>

            {/* Moon icon */}
            <div className={`absolute right-1.5 top-1.5 w-5 h-5 transition-opacity ${isDark ? 'opacity-100' : 'opacity-30'}`}>
                🌙
            </div>

            {/* Toggle indicator */}
            <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                    isDark ? 'left-9' : 'left-1'
                }`}
            />
        </button>
    );
};

// ============================================================
// 10. PROFILE EDITOR MODAL
// ============================================================

interface ProfileEditorProps {
    user: UserProfile;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updates: Partial<UserProfile>) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
    user,
    isOpen,
    onClose,
    onSave
}) => {
    const [name, setName] = useState(user.name);
    const [homeCourse, setHomeCourse] = useState(user.homeCourse);
    const [handicap, setHandicap] = useState(user.swingDNA.handicap.toString());

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            name,
            homeCourse,
            swingDNA: {
                ...user.swingDNA,
                handicap: parseFloat(handicap) || 0
            }
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
            <div className="bg-white w-full sm:w-96 rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between mb-6">
                    <Text variant="h3">Edit Profile</Text>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <Input
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <Input
                        label="Home Course"
                        value={homeCourse}
                        onChange={(e) => setHomeCourse(e.target.value)}
                    />

                    <Input
                        label="Handicap Index"
                        type="number"
                        step="0.1"
                        value={handicap}
                        onChange={(e) => setHandicap(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 mt-6">
                    <Button variant="ghost" fullWidth onClick={onClose}>
                        Cancel
                    </Button>
                    <Button fullWidth onClick={handleSave}>
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// USAGE EXAMPLES
// ============================================================
/*

// Example 1: Profile Tab
const ProfileTab = () => {
    const [showEditor, setShowEditor] = useState(false);

    return (
        <div>
            <ProfileHeader
                user={currentUser}
                onEditProfile={() => setShowEditor(true)}
                onViewAchievements={() => navigateTo('achievements')}
            />

            <div className="p-6 space-y-6">
                <ProfileCompletion
                    completion={75}
                    missingItems={['Add your bag', 'Set goals']}
                    onComplete={() => navigateTo('complete-profile')}
                />

                <Card variant="elevated">
                    <Text variant="h4" className="mb-4">Swing DNA</Text>
                    <div className="flex justify-center">
                        <SwingDNARadar
                            data={{
                                speed: 82,
                                accuracy: 68,
                                consistency: 75,
                                shortGame: 85,
                                putting: 72
                            }}
                        />
                    </div>
                </Card>
            </div>

            <ProfileEditor
                user={currentUser}
                isOpen={showEditor}
                onClose={() => setShowEditor(false)}
                onSave={updateProfile}
            />
        </div>
    );
};

// Example 2: Settings Screen
const SettingsScreen = () => {
    const [notifications, setNotifications] = useState(true);
    const [voiceCoach, setVoiceCoach] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    return (
        <div className="p-6">
            <SettingsSection title="Preferences">
                <SettingsToggle
                    icon="🔔"
                    label="Push Notifications"
                    description="Practice reminders & updates"
                    checked={notifications}
                    onChange={setNotifications}
                />
                <SettingsToggle
                    icon="🎤"
                    label="Voice Coach"
                    description="Audio feedback during analysis"
                    checked={voiceCoach}
                    onChange={setVoiceCoach}
                />
            </SettingsSection>

            <SettingsSection title="Appearance">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{darkMode ? '🌙' : '☀️'}</span>
                        <Text variant="body" className="font-medium">Dark Mode</Text>
                    </div>
                    <DarkModeToggle isDark={darkMode} onToggle={() => setDarkMode(!darkMode)} />
                </div>
            </SettingsSection>

            <SettingsSection title="Account">
                <SettingsRow icon="💳" label="Subscription" value="Pro" onClick={() => {}} />
                <SettingsRow icon="📧" label="Email" value={user.email} onClick={() => {}} />
                <SettingsRow icon="🔒" label="Privacy" onClick={() => {}} />
                <SettingsRow icon="🚪" label="Sign Out" onClick={signOut} danger />
            </SettingsSection>
        </div>
    );
};

// Example 3: Subscription management
<SubscriptionCard
    plan={user.memberStatus}
    expiresAt={new Date('2024-12-31')}
    onUpgrade={() => navigateTo('upgrade')}
    onManage={() => navigateTo('billing')}
/>

// Example 4: Club list with stats
{user.bag.map(club => (
    <EnhancedClubCard
        key={club.id}
        club={club}
        avgDistance={getClubDistance(club.id)}
        totalShots={getClubShots(club.id)}
        onClick={() => openClubDetails(club.id)}
    />
))}

*/

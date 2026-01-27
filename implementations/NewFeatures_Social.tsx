/**
 * ============================================================
 * MCG - NEW FEATURES: SOCIAL & COMPETITIONS
 * ============================================================
 *
 * Inspired by: 18Birdies, Hole19, Golfshot
 *
 * This file contains components for social features:
 * - Friends List & Social Hub
 * - Activity Feed
 * - Competition Modes (Stroke, Match, Stableford, Skins)
 * - Virtual Tournaments
 * - Achievement Sharing
 *
 * Copy this entire file into your AI Studio project.
 * ============================================================
 */

import React, { useState } from 'react';
import { COLORS } from '../constants';

// ============================================================
// TYPES
// ============================================================

export interface GolfFriend {
    id: string;
    name: string;
    avatarUrl?: string;
    handicap: number;
    homeCourse: string;
    status: 'ONLINE' | 'PLAYING' | 'OFFLINE';
    lastActive: Date;
    mutualFriends: number;
    roundsTogether: number;
}

export interface ActivityItem {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    type: 'ROUND' | 'ACHIEVEMENT' | 'PR' | 'CHALLENGE' | 'TOURNAMENT';
    timestamp: Date;
    data: any;
    likes: number;
    comments: number;
    hasLiked: boolean;
}

export interface Competition {
    id: string;
    type: 'STROKE' | 'MATCH' | 'STABLEFORD' | 'SKINS' | 'NASSAU' | 'WOLF';
    name: string;
    players: CompetitionPlayer[];
    status: 'SETUP' | 'IN_PROGRESS' | 'COMPLETE';
    currentHole: number;
    stakes?: string;
}

export interface CompetitionPlayer {
    id: string;
    name: string;
    avatarUrl?: string;
    handicap: number;
    score: number;
    thru: number;
    position: number;
}

export interface Tournament {
    id: string;
    name: string;
    description: string;
    format: string;
    startDate: Date;
    endDate: Date;
    entryFee?: number;
    prize?: string;
    participants: number;
    maxParticipants: number;
    status: 'UPCOMING' | 'ACTIVE' | 'COMPLETE';
    leaderboard: TournamentEntry[];
}

export interface TournamentEntry {
    rank: number;
    playerId: string;
    playerName: string;
    playerAvatar?: string;
    score: number;
    roundsPlayed: number;
    movement: 'UP' | 'DOWN' | 'SAME';
}

export interface ShareableScorecard {
    roundId: string;
    playerName: string;
    courseName: string;
    date: Date;
    score: number;
    par: number;
    highlights: string[];
    stats: {
        fairways: string;
        gir: string;
        putts: number;
    };
}

// ============================================================
// MOCK DATA
// ============================================================

export const MOCK_FRIENDS: GolfFriend[] = [
    {
        id: 'f1',
        name: 'Jordan Spieth',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
        handicap: 0.2,
        homeCourse: 'Brook Hollow',
        status: 'PLAYING',
        lastActive: new Date(),
        mutualFriends: 12,
        roundsTogether: 8
    },
    {
        id: 'f2',
        name: 'Rory McIlroy',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
        handicap: 0.5,
        homeCourse: 'Royal County Down',
        status: 'ONLINE',
        lastActive: new Date(Date.now() - 3600000),
        mutualFriends: 8,
        roundsTogether: 3
    },
    {
        id: 'f3',
        name: 'Scottie Scheffler',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        handicap: 0.1,
        homeCourse: 'Royal Oaks',
        status: 'OFFLINE',
        lastActive: new Date(Date.now() - 86400000),
        mutualFriends: 5,
        roundsTogether: 1
    }
];

export const MOCK_ACTIVITY: ActivityItem[] = [
    {
        id: 'a1',
        userId: 'f1',
        userName: 'Jordan Spieth',
        userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
        type: 'ROUND',
        timestamp: new Date(Date.now() - 3600000),
        data: { score: 68, course: 'Colonial CC', par: 70 },
        likes: 24,
        comments: 5,
        hasLiked: false
    },
    {
        id: 'a2',
        userId: 'f2',
        userName: 'Rory McIlroy',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
        type: 'ACHIEVEMENT',
        timestamp: new Date(Date.now() - 86400000),
        data: { achievement: '30-Day Streak', description: 'Practiced for 30 days straight!' },
        likes: 42,
        comments: 12,
        hasLiked: true
    },
    {
        id: 'a3',
        userId: 'f3',
        userName: 'Scottie Scheffler',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        type: 'PR',
        timestamp: new Date(Date.now() - 172800000),
        data: { metric: 'Driver Distance', oldValue: 295, newValue: 302 },
        likes: 18,
        comments: 3,
        hasLiked: false
    }
];

export const MOCK_TOURNAMENTS: Tournament[] = [
    {
        id: 't1',
        name: 'MCG Weekly Challenge',
        description: 'Post your best 18-hole score this week',
        format: 'Stroke Play (Net)',
        startDate: new Date(),
        endDate: new Date(Date.now() + 604800000),
        participants: 128,
        maxParticipants: 256,
        status: 'ACTIVE',
        leaderboard: [
            { rank: 1, playerId: 'p1', playerName: 'Mike Johnson', score: -4, roundsPlayed: 2, movement: 'UP' },
            { rank: 2, playerId: 'p2', playerName: 'Sarah Davis', score: -3, roundsPlayed: 1, movement: 'SAME' },
            { rank: 3, playerId: 'p3', playerName: 'Tom Wilson', score: -2, roundsPlayed: 2, movement: 'DOWN' }
        ]
    },
    {
        id: 't2',
        name: 'Short Game Showdown',
        description: 'Best Up & Down percentage wins',
        format: 'Skills Challenge',
        startDate: new Date(Date.now() + 86400000 * 3),
        endDate: new Date(Date.now() + 86400000 * 10),
        entryFee: 10,
        prize: '$500 Pro Shop Credit',
        participants: 64,
        maxParticipants: 128,
        status: 'UPCOMING',
        leaderboard: []
    }
];

// ============================================================
// FRIEND CARD
// ============================================================

export const FriendCard: React.FC<{
    friend: GolfFriend;
    onChallenge?: (friend: GolfFriend) => void;
    onMessage?: (friend: GolfFriend) => void;
}> = ({ friend, onChallenge, onMessage }) => {
    const statusColors = {
        ONLINE: 'bg-green-500',
        PLAYING: 'bg-orange-500',
        OFFLINE: 'bg-gray-400'
    };

    const statusText = {
        ONLINE: 'Online',
        PLAYING: 'Playing now',
        OFFLINE: `Last seen ${formatTimeAgo(friend.lastActive)}`
    };

    return (
        <div className="bg-white rounded-2xl p-4 shadow-md">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
                        {friend.avatarUrl ? (
                            <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                                {friend.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${statusColors[friend.status]}`} />
                </div>

                {/* Info */}
                <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{friend.name}</h4>
                    <p className="text-sm text-gray-500">
                        {friend.handicap >= 0 ? '+' : ''}{friend.handicap} HCP • {friend.homeCourse}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{statusText[friend.status]}</p>
                </div>

                {/* Handicap Badge */}
                <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                        {friend.handicap >= 0 ? '+' : ''}{friend.handicap}
                    </p>
                    <p className="text-xs text-gray-400">HCP</p>
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center flex-1">
                    <p className="font-bold text-gray-900">{friend.roundsTogether}</p>
                    <p className="text-xs text-gray-500">Rounds Together</p>
                </div>
                <div className="text-center flex-1">
                    <p className="font-bold text-gray-900">{friend.mutualFriends}</p>
                    <p className="text-xs text-gray-500">Mutual Friends</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
                <button
                    onClick={() => onChallenge?.(friend)}
                    className="flex-1 py-2 rounded-xl font-medium text-white active:scale-95 transition-all"
                    style={{ backgroundColor: COLORS.primary }}
                >
                    Challenge
                </button>
                <button
                    onClick={() => onMessage?.(friend)}
                    className="flex-1 py-2 rounded-xl font-medium bg-gray-100 text-gray-600 active:scale-95 transition-all"
                >
                    Message
                </button>
            </div>
        </div>
    );
};

// ============================================================
// ACTIVITY FEED
// ============================================================

export const ActivityFeed: React.FC<{
    activities: ActivityItem[];
    onLike?: (id: string) => void;
    onComment?: (id: string) => void;
}> = ({ activities, onLike, onComment }) => {
    return (
        <div className="space-y-4">
            {activities.map((activity) => (
                <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onLike={() => onLike?.(activity.id)}
                    onComment={() => onComment?.(activity.id)}
                />
            ))}
        </div>
    );
};

const ActivityCard: React.FC<{
    activity: ActivityItem;
    onLike: () => void;
    onComment: () => void;
}> = ({ activity, onLike, onComment }) => {
    const renderContent = () => {
        switch (activity.type) {
            case 'ROUND':
                const diff = activity.data.score - activity.data.par;
                return (
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-900">{activity.data.course}</p>
                                <p className="text-sm text-gray-500">18 holes</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-gray-900">{activity.data.score}</p>
                                <p className={`text-sm font-medium ${diff <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {diff === 0 ? 'E' : diff > 0 ? `+${diff}` : diff}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'ACHIEVEMENT':
                return (
                    <div className="p-4 bg-yellow-50 rounded-xl flex items-center gap-3">
                        <span className="text-3xl">🏆</span>
                        <div>
                            <p className="font-bold text-yellow-800">{activity.data.achievement}</p>
                            <p className="text-sm text-yellow-600">{activity.data.description}</p>
                        </div>
                    </div>
                );
            case 'PR':
                return (
                    <div className="p-4 bg-green-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🚀</span>
                            <div>
                                <p className="font-bold text-green-800">New Personal Record!</p>
                                <p className="text-sm text-green-600">
                                    {activity.data.metric}: {activity.data.oldValue} → {activity.data.newValue}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-2xl p-4 shadow-md">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    {activity.userAvatar ? (
                        <img src={activity.userAvatar} alt={activity.userName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            {activity.userName.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.userName}</p>
                    <p className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</p>
                </div>
            </div>

            {/* Content */}
            {renderContent()}

            {/* Actions */}
            <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100">
                <button
                    onClick={onLike}
                    className={`flex items-center gap-1 text-sm ${activity.hasLiked ? 'text-red-500' : 'text-gray-500'}`}
                >
                    <span>{activity.hasLiked ? '❤️' : '🤍'}</span>
                    <span>{activity.likes}</span>
                </button>
                <button
                    onClick={onComment}
                    className="flex items-center gap-1 text-sm text-gray-500"
                >
                    <span>💬</span>
                    <span>{activity.comments}</span>
                </button>
                <button className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
                    <span>↗️</span>
                    <span>Share</span>
                </button>
            </div>
        </div>
    );
};

// ============================================================
// COMPETITION MODE SELECTOR
// ============================================================

export const CompetitionModeSelector: React.FC<{
    onSelect: (mode: Competition['type']) => void;
}> = ({ onSelect }) => {
    const modes = [
        {
            type: 'STROKE' as const,
            name: 'Stroke Play',
            description: 'Lowest total score wins',
            icon: '🏌️',
            popular: true
        },
        {
            type: 'MATCH' as const,
            name: 'Match Play',
            description: 'Win individual holes',
            icon: '🤝',
            popular: true
        },
        {
            type: 'STABLEFORD' as const,
            name: 'Stableford',
            description: 'Points based scoring',
            icon: '⭐',
            popular: false
        },
        {
            type: 'SKINS' as const,
            name: 'Skins',
            description: 'Win each hole outright',
            icon: '💰',
            popular: true
        },
        {
            type: 'NASSAU' as const,
            name: 'Nassau',
            description: 'Front 9, Back 9, Overall',
            icon: '🎲',
            popular: false
        },
        {
            type: 'WOLF' as const,
            name: 'Wolf',
            description: 'Strategic team format',
            icon: '🐺',
            popular: false
        }
    ];

    return (
        <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-lg">Choose Game Format</h3>
            <div className="grid gap-3">
                {modes.map((mode) => (
                    <button
                        key={mode.type}
                        onClick={() => onSelect(mode.type)}
                        className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-md
                                   hover:shadow-lg active:scale-[0.98] transition-all text-left"
                    >
                        <span className="text-3xl">{mode.icon}</span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{mode.name}</span>
                                {mode.popular && (
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                                        Popular
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">{mode.description}</p>
                        </div>
                        <span className="text-gray-400">→</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// ============================================================
// LIVE LEADERBOARD
// ============================================================

export const LiveLeaderboard: React.FC<{
    competition: Competition;
    currentUserId?: string;
}> = ({ competition, currentUserId }) => {
    return (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Header */}
            <div
                className="p-4 text-white"
                style={{ backgroundColor: COLORS.secondary }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold">{competition.name}</h3>
                        <p className="text-white/70 text-sm">{competition.type} • Hole {competition.currentHole}</p>
                    </div>
                    {competition.status === 'IN_PROGRESS' && (
                        <span className="px-3 py-1 bg-red-500 rounded-full text-xs font-bold animate-pulse">
                            LIVE
                        </span>
                    )}
                </div>
            </div>

            {/* Leaderboard */}
            <div className="divide-y divide-gray-100">
                {competition.players.map((player, index) => {
                    const isCurrentUser = player.id === currentUserId;
                    return (
                        <div
                            key={player.id}
                            className={`px-4 py-3 flex items-center gap-3 ${isCurrentUser ? 'bg-orange-50' : ''}`}
                        >
                            {/* Position */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                ${index === 0 ? 'bg-yellow-400 text-yellow-900' : ''}
                                ${index === 1 ? 'bg-gray-300 text-gray-700' : ''}
                                ${index === 2 ? 'bg-orange-300 text-orange-900' : ''}
                                ${index > 2 ? 'bg-gray-100 text-gray-600' : ''}`}>
                                {player.position}
                            </div>

                            {/* Player */}
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                    {player.avatarUrl ? (
                                        <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            {player.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className={`font-medium ${isCurrentUser ? 'text-orange-700' : 'text-gray-900'}`}>
                                        {player.name} {isCurrentUser && '(You)'}
                                    </p>
                                    <p className="text-xs text-gray-400">HCP {player.handicap}</p>
                                </div>
                            </div>

                            {/* Score */}
                            <div className="text-right">
                                <p className={`text-xl font-bold ${player.score <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {player.score === 0 ? 'E' : player.score > 0 ? `+${player.score}` : player.score}
                                </p>
                                <p className="text-xs text-gray-400">Thru {player.thru}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ============================================================
// TOURNAMENT CARD
// ============================================================

export const TournamentCard: React.FC<{
    tournament: Tournament;
    onJoin?: (tournament: Tournament) => void;
    onView?: (tournament: Tournament) => void;
}> = ({ tournament, onJoin, onView }) => {
    const statusColors = {
        UPCOMING: 'bg-blue-100 text-blue-700',
        ACTIVE: 'bg-green-100 text-green-700',
        COMPLETE: 'bg-gray-100 text-gray-700'
    };

    const daysRemaining = Math.ceil((tournament.endDate.getTime() - Date.now()) / 86400000);

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-gray-900">{tournament.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[tournament.status]}`}>
                        {tournament.status}
                    </span>
                </div>
                <p className="text-sm text-gray-500">{tournament.description}</p>
            </div>

            {/* Details */}
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Format</span>
                    <span className="font-medium text-gray-900">{tournament.format}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Players</span>
                    <span className="font-medium text-gray-900">
                        {tournament.participants}/{tournament.maxParticipants}
                    </span>
                </div>
                {tournament.prize && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Prize</span>
                        <span className="font-medium text-green-600">{tournament.prize}</span>
                    </div>
                )}
                {tournament.status === 'ACTIVE' && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Time Left</span>
                        <span className="font-medium text-orange-600">{daysRemaining} days</span>
                    </div>
                )}
            </div>

            {/* Top 3 Preview */}
            {tournament.leaderboard.length > 0 && (
                <div className="px-4 pb-4">
                    <p className="text-xs text-gray-500 mb-2">Current Leaders</p>
                    <div className="space-y-2">
                        {tournament.leaderboard.slice(0, 3).map((entry) => (
                            <div key={entry.playerId} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                                        ${entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' : ''}
                                        ${entry.rank === 2 ? 'bg-gray-300 text-gray-700' : ''}
                                        ${entry.rank === 3 ? 'bg-orange-300 text-orange-900' : ''}`}>
                                        {entry.rank}
                                    </span>
                                    <span className="text-gray-700">{entry.playerName}</span>
                                </div>
                                <span className={`font-bold ${entry.score <= 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                    {entry.score === 0 ? 'E' : entry.score > 0 ? `+${entry.score}` : entry.score}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="p-4 bg-gray-50 flex gap-2">
                {tournament.status === 'UPCOMING' && (
                    <button
                        onClick={() => onJoin?.(tournament)}
                        className="flex-1 py-3 rounded-xl font-bold text-white active:scale-95 transition-all"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        {tournament.entryFee ? `Join ($${tournament.entryFee})` : 'Join Free'}
                    </button>
                )}
                {(tournament.status === 'ACTIVE' || tournament.status === 'COMPLETE') && (
                    <button
                        onClick={() => onView?.(tournament)}
                        className="flex-1 py-3 rounded-xl font-bold text-white active:scale-95 transition-all"
                        style={{ backgroundColor: COLORS.secondary }}
                    >
                        View Leaderboard
                    </button>
                )}
            </div>
        </div>
    );
};

// ============================================================
// SHAREABLE SCORECARD
// ============================================================

export const ShareableScorecard: React.FC<{
    scorecard: ShareableScorecard;
    onShare?: () => void;
}> = ({ scorecard, onShare }) => {
    const diff = scorecard.score - scorecard.par;

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl">
            {/* Header */}
            <div className="text-center mb-6">
                <p className="text-sm text-gray-400 uppercase tracking-wider">Round Complete</p>
                <h2 className="text-2xl font-bold mt-1">{scorecard.courseName}</h2>
                <p className="text-gray-400 text-sm">{scorecard.date.toLocaleDateString()}</p>
            </div>

            {/* Score */}
            <div className="text-center mb-6">
                <p className="text-7xl font-black">{scorecard.score}</p>
                <p className={`text-2xl font-bold mt-2
                    ${diff < 0 ? 'text-green-400' : diff > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {diff === 0 ? 'EVEN' : diff > 0 ? `+${diff}` : diff}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                    <p className="text-2xl font-bold">{scorecard.stats.fairways}</p>
                    <p className="text-xs text-gray-400">FIR</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold">{scorecard.stats.gir}</p>
                    <p className="text-xs text-gray-400">GIR</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold">{scorecard.stats.putts}</p>
                    <p className="text-xs text-gray-400">Putts</p>
                </div>
            </div>

            {/* Highlights */}
            {scorecard.highlights.length > 0 && (
                <div className="mb-6">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Highlights</p>
                    <div className="flex flex-wrap gap-2">
                        {scorecard.highlights.map((h, i) => (
                            <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                                {h}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Player & Share */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold">
                        {scorecard.playerName.charAt(0)}
                    </div>
                    <span className="font-medium">{scorecard.playerName}</span>
                </div>
                <button
                    onClick={onShare}
                    className="px-4 py-2 bg-white/10 rounded-xl text-sm font-medium hover:bg-white/20 transition-all"
                >
                    Share →
                </button>
            </div>

            {/* MCG Branding */}
            <div className="text-center mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500">Tracked with MCG</p>
            </div>
        </div>
    );
};

// ============================================================
// CHALLENGE INVITE MODAL
// ============================================================

export const ChallengeInviteModal: React.FC<{
    friend: GolfFriend;
    onSend: (type: Competition['type'], message: string) => void;
    onClose: () => void;
}> = ({ friend, onSend, onClose }) => {
    const [gameType, setGameType] = useState<Competition['type']>('STROKE');
    const [message, setMessage] = useState('');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
                <div
                    className="p-4 text-white"
                    style={{ backgroundColor: COLORS.primary }}
                >
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">Challenge {friend.name}</h3>
                        <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {/* Game Type */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Game Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['STROKE', 'MATCH', 'SKINS', 'STABLEFORD'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setGameType(type)}
                                    className={`py-2 rounded-xl text-sm font-medium transition-all
                                        ${gameType === type ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                                    style={gameType === type ? { backgroundColor: COLORS.primary } : {}}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Message (optional)</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ready to lose? 😄"
                            className="w-full p-3 border rounded-xl resize-none focus:outline-none focus:border-orange-500"
                            rows={3}
                        />
                    </div>

                    {/* Send */}
                    <button
                        onClick={() => onSend(gameType, message)}
                        className="w-full py-4 rounded-2xl font-bold text-white active:scale-95 transition-all"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        Send Challenge
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// SOCIAL HUB MAIN VIEW
// ============================================================

export const SocialHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'FEED' | 'FRIENDS' | 'COMPETE' | 'TOURNAMENTS'>('FEED');
    const [showChallenge, setShowChallenge] = useState<GolfFriend | null>(null);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-5 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Social</h1>
                    <p className="text-sm text-gray-500">Connect & compete</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {(['FEED', 'FRIENDS', 'COMPETE', 'TOURNAMENTS'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 min-w-[80px] pb-3 text-sm font-bold uppercase tracking-wide
                                border-b-2 transition-all whitespace-nowrap px-2
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
            <div className="px-5 py-6">
                {activeTab === 'FEED' && (
                    <ActivityFeed
                        activities={MOCK_ACTIVITY}
                        onLike={(id) => console.log('Liked:', id)}
                        onComment={(id) => console.log('Comment:', id)}
                    />
                )}

                {activeTab === 'FRIENDS' && (
                    <div className="space-y-4">
                        {MOCK_FRIENDS.map((friend) => (
                            <FriendCard
                                key={friend.id}
                                friend={friend}
                                onChallenge={(f) => setShowChallenge(f)}
                            />
                        ))}
                    </div>
                )}

                {activeTab === 'COMPETE' && (
                    <CompetitionModeSelector
                        onSelect={(mode) => console.log('Selected:', mode)}
                    />
                )}

                {activeTab === 'TOURNAMENTS' && (
                    <div className="space-y-4">
                        {MOCK_TOURNAMENTS.map((tournament) => (
                            <TournamentCard
                                key={tournament.id}
                                tournament={tournament}
                                onJoin={(t) => console.log('Join:', t.name)}
                                onView={(t) => console.log('View:', t.name)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Challenge Modal */}
            {showChallenge && (
                <ChallengeInviteModal
                    friend={showChallenge}
                    onSend={(type, msg) => {
                        console.log('Challenge sent:', type, msg);
                        setShowChallenge(null);
                    }}
                    onClose={() => setShowChallenge(null)}
                />
            )}
        </div>
    );
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

// ============================================================
// USAGE EXAMPLE
// ============================================================

/*
import {
    SocialHub,
    FriendCard,
    ActivityFeed,
    CompetitionModeSelector,
    LiveLeaderboard,
    TournamentCard,
    ShareableScorecard,
    MOCK_FRIENDS,
    MOCK_ACTIVITY,
    MOCK_TOURNAMENTS
} from './NewFeatures_Social';

// Full Social Hub
const SocialScreen: React.FC = () => {
    return <SocialHub />;
};

// Individual Components
const FriendsView: React.FC = () => {
    return (
        <div className="space-y-4">
            {MOCK_FRIENDS.map(friend => (
                <FriendCard key={friend.id} friend={friend} />
            ))}
        </div>
    );
};
*/

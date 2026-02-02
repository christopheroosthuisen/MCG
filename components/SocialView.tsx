
import React, { useState } from 'react';
import { COLORS, MOCK_FRIENDS, MOCK_ACTIVITY, MOCK_TOURNAMENTS } from '../constants';
import { GolfFriend, ActivityItem, Tournament } from '../types';
import { ScreenHeader } from './UIComponents';

const FriendCard: React.FC<{ friend: GolfFriend }> = ({ friend }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
        <div className="relative">
            <img src={friend.avatarUrl} className="w-12 h-12 rounded-full bg-gray-200 object-cover" />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${friend.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-400'}`} />
        </div>
        <div className="flex-1">
            <h4 className="font-bold text-sm">{friend.name}</h4>
            <p className="text-xs text-gray-500">{friend.handicap > 0 ? '+' : ''}{friend.handicap} HCP • {friend.homeCourse}</p>
        </div>
        <button className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold">Challenge</button>
    </div>
);

const ActivityCard: React.FC<{ activity: ActivityItem }> = ({ activity }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
            <img src={activity.userAvatar} className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
            <div>
                <p className="text-sm font-bold">{activity.userName}</p>
                <p className="text-[10px] text-gray-400">2h ago</p>
            </div>
        </div>
        {activity.type === 'ROUND' && (
            <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center">
                <div>
                    <div className="font-bold text-sm">{activity.data.course}</div>
                    <div className="text-xs text-gray-500">18 Holes</div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black">{activity.data.score}</div>
                    <div className="text-xs font-bold text-green-600">-2</div>
                </div>
            </div>
        )}
    </div>
);

export const SocialHub: React.FC = () => {
    const [tab, setTab] = useState<'FEED' | 'FRIENDS' | 'COMPETE'>('FEED');

    return (
        <div className="bg-[#F5F5F7] min-h-screen pb-24 animate-in fade-in duration-300">
            <ScreenHeader title="Social Club" subtitle="Community" />
            
            <div className="px-4 mb-4">
                <div className="flex bg-white p-1 rounded-xl shadow-sm">
                    {['FEED', 'FRIENDS', 'COMPETE'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setTab(t as any)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold ${tab === t ? 'bg-gray-900 text-white shadow' : 'text-gray-500'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 space-y-4">
                {tab === 'FEED' && MOCK_ACTIVITY.map(a => <ActivityCard key={a.id} activity={a} />)}
                {tab === 'FRIENDS' && MOCK_FRIENDS.map(f => <FriendCard key={f.id} friend={f} />)}
                {tab === 'COMPETE' && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900">Active Tournaments</h3>
                        {MOCK_TOURNAMENTS.map(t => (
                            <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold">{t.name}</h4>
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">ACTIVE</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">{t.description}</p>
                                <div className="flex justify-between text-xs font-medium text-gray-600">
                                    <span>{t.participants} Players</span>
                                    <span>Ends in 3 days</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

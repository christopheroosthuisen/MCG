
import React, { useState } from 'react';
import { ScreenHeader } from './UIComponents';
import { COLORS, MOCK_NOTIFICATIONS } from '../constants';
import { Notification, NotificationType } from '../types';

const NOTIFICATION_CONFIG: Record<NotificationType, {
  name: string;
  icon: string;
  color: string;
  description: string
}> = {
  achievement: { name: 'Achievements', icon: '🏆', color: '#FFD700', description: 'Badges, milestones, and personal records' },
  reminder: { name: 'Reminders', icon: '⏰', color: COLORS.primary, description: 'Practice reminders and scheduled alerts' },
  social: { name: 'Social', icon: '👥', color: COLORS.info, description: 'Friend activity and social updates' },
  tournament: { name: 'Tournaments', icon: '🏌️', color: COLORS.secondary, description: 'Tournament updates and invitations' },
  lesson: { name: 'Lessons', icon: '📚', color: '#8B5CF6', description: 'Lesson reminders and new content' },
  weather: { name: 'Weather', icon: '🌤️', color: '#87CEEB', description: 'Weather alerts for your tee times' },
  practice: { name: 'Practice', icon: '🎯', color: COLORS.success, description: 'Practice session reminders and tips' },
  system: { name: 'System', icon: '⚙️', color: COLORS.gray, description: 'App updates and system messages' },
  coaching: { name: 'Coaching', icon: '🤖', color: '#8B5CF6', description: 'AI coach insights and recommendations' },
  milestone: { name: 'Milestones', icon: '🎉', color: '#EC4899', description: 'Goal progress and celebrations' },
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const NotificationCard: React.FC<{ notification: Notification; onRead: (id: string) => void }> = ({ notification, onRead }) => {
  const config = NOTIFICATION_CONFIG[notification.type];
  const isUnread = notification.status === 'unread';

  return (
    <div
      onClick={() => isUnread && onRead(notification.id)}
      className={`p-4 rounded-xl border-l-4 cursor-pointer transition-colors ${isUnread ? 'bg-white shadow-sm border-l-orange-500' : 'bg-gray-50 border-l-transparent opacity-80'}`}
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gray-100 flex-shrink-0" style={{ color: config.color }}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h4 className={`text-sm ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{notification.title}</h4>
            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{formatTimeAgo(notification.timestamp)}</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">{notification.message}</p>
          {notification.actionUrl && (
            <button className="text-xs font-bold text-white bg-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
              {notification.actionLabel || 'View'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const NotificationsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const handleMarkRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, status: 'read' } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, status: 'read' })));
  };

  const filteredNotifications = notifications.filter(n => filter === 'ALL' || n.status === 'unread');
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="bg-[#F5F5F7] min-h-screen pb-20 animate-in slide-in-from-right duration-300 fixed inset-0 z-50 overflow-y-auto">
      <ScreenHeader 
        title="Notifications" 
        subtitle="Activity Center"
        leftAction={
            <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
        }
        rightAction={unreadCount > 0 && <button onClick={handleMarkAllRead} className="text-xs font-bold text-orange-600">Mark all read</button>}
      />

      <div className="px-4 mb-4">
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            <button onClick={() => setFilter('ALL')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'ALL' ? 'bg-gray-900 text-white shadow' : 'text-gray-500'}`}>All</button>
            <button onClick={() => setFilter('UNREAD')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'UNREAD' ? 'bg-gray-900 text-white shadow' : 'text-gray-500'}`}>Unread {unreadCount > 0 && `(${unreadCount})`}</button>
        </div>
      </div>

      <div className="px-4 space-y-3 pb-8">
        {filteredNotifications.length > 0 ? (
            filteredNotifications.map(n => <NotificationCard key={n.id} notification={n} onRead={handleMarkRead} />)
        ) : (
            <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">📭</div>
                <p>No notifications</p>
            </div>
        )}
      </div>
    </div>
  );
};

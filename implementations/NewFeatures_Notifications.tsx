/**
 * NewFeatures_Notifications.tsx
 * Notifications System for MCG App
 *
 * Features:
 * - Notification Center with categorized alerts
 * - Push Notification Preferences
 * - Smart Reminders & Scheduling
 * - Activity Feed & Social Updates
 */

import React, { useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type NotificationType =
  | 'achievement'
  | 'reminder'
  | 'social'
  | 'tournament'
  | 'lesson'
  | 'weather'
  | 'practice'
  | 'system'
  | 'coaching'
  | 'milestone';

type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
type NotificationStatus = 'unread' | 'read' | 'archived';
type ReminderFrequency = 'once' | 'daily' | 'weekly' | 'custom';
type TimeOfDay = 'morning' | 'afternoon' | 'evening';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  status: NotificationStatus;
  priority: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
  data?: Record<string, any>;
  groupId?: string;
}

interface NotificationGroup {
  id: string;
  type: NotificationType;
  count: number;
  latestTimestamp: string;
  notifications: Notification[];
}

interface NotificationPreference {
  type: NotificationType;
  enabled: boolean;
  push: boolean;
  email: boolean;
  inApp: boolean;
  sound: boolean;
  vibrate: boolean;
}

interface Reminder {
  id: string;
  title: string;
  message: string;
  type: 'practice' | 'tee_time' | 'lesson' | 'tournament' | 'custom';
  scheduledTime: string;
  frequency: ReminderFrequency;
  enabled: boolean;
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
  customInterval?: number; // in days
  lastTriggered?: string;
}

interface QuietHours {
  enabled: boolean;
  startTime: string; // "22:00"
  endTime: string; // "07:00"
  allowUrgent: boolean;
}

interface ActivityFeedItem {
  id: string;
  type: 'round' | 'achievement' | 'lesson' | 'tournament' | 'social';
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  target?: string;
  timestamp: string;
  details?: Record<string, any>;
  likes?: number;
  comments?: number;
  isLiked?: boolean;
}

interface NotificationBadge {
  total: number;
  byType: Record<NotificationType, number>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#FF8200',
  secondary: '#115740',
  white: '#FFFFFF',
  gray: '#4B4B4B',
  lightGray: '#F5F5F5',
  mediumGray: '#E0E0E0',
  darkGray: '#333333',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
};

const NOTIFICATION_CONFIG: Record<NotificationType, {
  name: string;
  icon: string;
  color: string;
  description: string
}> = {
  achievement: {
    name: 'Achievements',
    icon: '🏆',
    color: '#FFD700',
    description: 'Badges, milestones, and personal records'
  },
  reminder: {
    name: 'Reminders',
    icon: '⏰',
    color: COLORS.primary,
    description: 'Practice reminders and scheduled alerts'
  },
  social: {
    name: 'Social',
    icon: '👥',
    color: COLORS.info,
    description: 'Friend activity and social updates'
  },
  tournament: {
    name: 'Tournaments',
    icon: '🏌️',
    color: COLORS.secondary,
    description: 'Tournament updates and invitations'
  },
  lesson: {
    name: 'Lessons',
    icon: '📚',
    color: COLORS.purple,
    description: 'Lesson reminders and new content'
  },
  weather: {
    name: 'Weather',
    icon: '🌤️',
    color: '#87CEEB',
    description: 'Weather alerts for your tee times'
  },
  practice: {
    name: 'Practice',
    icon: '🎯',
    color: COLORS.success,
    description: 'Practice session reminders and tips'
  },
  system: {
    name: 'System',
    icon: '⚙️',
    color: COLORS.gray,
    description: 'App updates and system messages'
  },
  coaching: {
    name: 'Coaching',
    icon: '🤖',
    color: '#8B5CF6',
    description: 'AI coach insights and recommendations'
  },
  milestone: {
    name: 'Milestones',
    icon: '🎉',
    color: '#EC4899',
    description: 'Goal progress and celebrations'
  },
};

const PRIORITY_CONFIG: Record<NotificationPriority, { name: string; color: string }> = {
  low: { name: 'Low', color: COLORS.gray },
  medium: { name: 'Medium', color: COLORS.info },
  high: { name: 'High', color: COLORS.warning },
  urgent: { name: 'Urgent', color: COLORS.error },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'achievement',
    title: 'New Achievement Unlocked!',
    message: 'You\'ve completed 50 practice sessions. Keep up the great work!',
    timestamp: '2025-07-15T10:30:00',
    status: 'unread',
    priority: 'medium',
    actionUrl: '/achievements',
    actionLabel: 'View Achievement',
  },
  {
    id: 'n2',
    type: 'tournament',
    title: 'Tournament Registration Open',
    message: 'The Summer Championship is now accepting registrations. Limited spots available!',
    timestamp: '2025-07-15T09:00:00',
    status: 'unread',
    priority: 'high',
    actionUrl: '/tournaments/summer-championship',
    actionLabel: 'Register Now',
  },
  {
    id: 'n3',
    type: 'weather',
    title: 'Weather Alert',
    message: 'Rain expected at 2 PM for your tee time at Pebble Beach. Consider rescheduling.',
    timestamp: '2025-07-15T08:00:00',
    status: 'unread',
    priority: 'urgent',
    actionUrl: '/tee-times',
    actionLabel: 'View Options',
  },
  {
    id: 'n4',
    type: 'coaching',
    title: 'AI Coach Insight',
    message: 'Based on your recent rounds, focusing on short game could save you 3-4 strokes per round.',
    timestamp: '2025-07-14T18:00:00',
    status: 'read',
    priority: 'medium',
    actionUrl: '/coach',
    actionLabel: 'Start Drill',
  },
  {
    id: 'n5',
    type: 'social',
    title: 'Friend Request',
    message: 'John Smith wants to connect with you.',
    timestamp: '2025-07-14T15:30:00',
    status: 'read',
    priority: 'low',
    actionUrl: '/friends/requests',
    actionLabel: 'View Request',
  },
  {
    id: 'n6',
    type: 'milestone',
    title: 'Goal Progress Update',
    message: 'You\'re 80% towards your goal of breaking 80. Just 2 more strokes to go!',
    timestamp: '2025-07-14T12:00:00',
    status: 'read',
    priority: 'medium',
  },
  {
    id: 'n7',
    type: 'lesson',
    title: 'New Lesson Available',
    message: 'Master the Flop Shot - A new lesson by Tiger Woods is now available.',
    timestamp: '2025-07-13T10:00:00',
    status: 'read',
    priority: 'low',
    actionUrl: '/learn/flop-shot',
    actionLabel: 'Start Lesson',
  },
  {
    id: 'n8',
    type: 'reminder',
    title: 'Practice Reminder',
    message: 'Time for your daily putting practice! 15 minutes of focused practice awaits.',
    timestamp: '2025-07-15T07:00:00',
    status: 'unread',
    priority: 'medium',
    actionUrl: '/practice/putting',
    actionLabel: 'Start Practice',
  },
];

const mockPreferences: NotificationPreference[] = [
  { type: 'achievement', enabled: true, push: true, email: true, inApp: true, sound: true, vibrate: true },
  { type: 'reminder', enabled: true, push: true, email: false, inApp: true, sound: true, vibrate: true },
  { type: 'social', enabled: true, push: true, email: false, inApp: true, sound: false, vibrate: true },
  { type: 'tournament', enabled: true, push: true, email: true, inApp: true, sound: true, vibrate: true },
  { type: 'lesson', enabled: true, push: false, email: true, inApp: true, sound: false, vibrate: false },
  { type: 'weather', enabled: true, push: true, email: false, inApp: true, sound: true, vibrate: true },
  { type: 'practice', enabled: true, push: true, email: false, inApp: true, sound: true, vibrate: true },
  { type: 'system', enabled: true, push: false, email: true, inApp: true, sound: false, vibrate: false },
  { type: 'coaching', enabled: true, push: true, email: false, inApp: true, sound: false, vibrate: true },
  { type: 'milestone', enabled: true, push: true, email: true, inApp: true, sound: true, vibrate: true },
];

const mockReminders: Reminder[] = [
  {
    id: 'r1',
    title: 'Morning Practice',
    message: 'Time for your morning putting drills!',
    type: 'practice',
    scheduledTime: '07:00',
    frequency: 'daily',
    enabled: true,
    daysOfWeek: [1, 2, 3, 4, 5], // Weekdays
  },
  {
    id: 'r2',
    title: 'Tee Time Tomorrow',
    message: 'Don\'t forget your round at Pebble Beach',
    type: 'tee_time',
    scheduledTime: '18:00',
    frequency: 'once',
    enabled: true,
  },
  {
    id: 'r3',
    title: 'Weekly Lesson Review',
    message: 'Review what you learned this week',
    type: 'lesson',
    scheduledTime: '10:00',
    frequency: 'weekly',
    enabled: true,
    daysOfWeek: [0], // Sunday
  },
];

const mockActivityFeed: ActivityFeedItem[] = [
  {
    id: 'a1',
    type: 'round',
    userId: 'u1',
    userName: 'Mike Johnson',
    action: 'shot',
    target: '78 at Torrey Pines',
    timestamp: '2025-07-15T14:00:00',
    details: { score: 78, course: 'Torrey Pines' },
    likes: 12,
    comments: 3,
  },
  {
    id: 'a2',
    type: 'achievement',
    userId: 'u2',
    userName: 'Sarah Williams',
    action: 'earned',
    target: 'Eagle Eye badge',
    timestamp: '2025-07-15T12:30:00',
    likes: 24,
    comments: 5,
  },
  {
    id: 'a3',
    type: 'tournament',
    userId: 'u3',
    userName: 'David Chen',
    action: 'won',
    target: 'Club Championship',
    timestamp: '2025-07-14T18:00:00',
    likes: 156,
    comments: 28,
  },
  {
    id: 'a4',
    type: 'lesson',
    userId: 'u4',
    userName: 'Emma Davis',
    action: 'completed',
    target: 'Master the Driver course',
    timestamp: '2025-07-14T16:00:00',
    likes: 8,
    comments: 2,
  },
];

const mockQuietHours: QuietHours = {
  enabled: true,
  startTime: '22:00',
  endTime: '07:00',
  allowUrgent: true,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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

const groupNotificationsByDate = (notifications: Notification[]): Map<string, Notification[]> => {
  const groups = new Map<string, Notification[]>();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  notifications.forEach(notification => {
    const date = new Date(notification.timestamp).toDateString();
    let key = date;
    if (date === today) key = 'Today';
    else if (date === yesterday) key = 'Yesterday';

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(notification);
  });

  return groups;
};

// ============================================================================
// COMPONENTS - Notification Items
// ============================================================================

interface NotificationCardProps {
  notification: Notification;
  onRead: (id: string) => void;
  onAction: (url: string) => void;
  onArchive: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onRead,
  onAction,
  onArchive
}) => {
  const config = NOTIFICATION_CONFIG[notification.type];
  const isUnread = notification.status === 'unread';

  return (
    <div
      onClick={() => isUnread && onRead(notification.id)}
      style={{
        backgroundColor: isUnread ? `${config.color}10` : COLORS.white,
        borderRadius: 12,
        padding: 16,
        borderLeft: isUnread ? `4px solid ${config.color}` : 'none',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        {/* Icon */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: `${config.color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          flexShrink: 0,
        }}>
          {config.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              fontWeight: isUnread ? 700 : 500,
              fontSize: 15,
              marginBottom: 4,
            }}>
              {notification.title}
            </div>
            <span style={{
              fontSize: 12,
              color: COLORS.gray,
              whiteSpace: 'nowrap',
              marginLeft: 8,
            }}>
              {formatTimeAgo(notification.timestamp)}
            </span>
          </div>

          <div style={{
            fontSize: 14,
            color: COLORS.gray,
            marginBottom: notification.actionUrl ? 12 : 0,
          }}>
            {notification.message}
          </div>

          {/* Action Button */}
          {notification.actionUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction(notification.actionUrl!);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: config.color,
                color: COLORS.white,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {notification.actionLabel || 'View'}
            </button>
          )}
        </div>

        {/* Priority Indicator */}
        {notification.priority === 'urgent' && (
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: COLORS.error,
            flexShrink: 0,
          }} />
        )}
      </div>
    </div>
  );
};

// Compact Notification Item
interface NotificationItemCompactProps {
  notification: Notification;
  onPress: () => void;
}

const NotificationItemCompact: React.FC<NotificationItemCompactProps> = ({ notification, onPress }) => {
  const config = NOTIFICATION_CONFIG[notification.type];
  const isUnread = notification.status === 'unread';

  return (
    <button
      onClick={onPress}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        backgroundColor: isUnread ? `${config.color}10` : 'transparent',
        border: 'none',
        borderBottom: `1px solid ${COLORS.lightGray}`,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 18 }}>{config.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: isUnread ? 600 : 400,
          fontSize: 14,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {notification.title}
        </div>
        <div style={{
          fontSize: 12,
          color: COLORS.gray,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {notification.message}
        </div>
      </div>
      <span style={{ fontSize: 11, color: COLORS.gray }}>
        {formatTimeAgo(notification.timestamp)}
      </span>
    </button>
  );
};

// ============================================================================
// COMPONENTS - Notification Center
// ============================================================================

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onArchive: (id: string) => void;
  onAction: (url: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onArchive,
  onAction,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.status !== 'unread') return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12 }}>
      {/* Header */}
      <div style={{
        padding: 16,
        borderBottom: `1px solid ${COLORS.lightGray}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{
                marginLeft: 8,
                padding: '2px 8px',
                borderRadius: 12,
                backgroundColor: COLORS.error,
                color: COLORS.white,
                fontSize: 12,
              }}>
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: COLORS.lightGray,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 12px',
              borderRadius: 16,
              border: 'none',
              backgroundColor: filter === 'all' ? COLORS.primary : COLORS.lightGray,
              color: filter === 'all' ? COLORS.white : COLORS.gray,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            style={{
              padding: '6px 12px',
              borderRadius: 16,
              border: 'none',
              backgroundColor: filter === 'unread' ? COLORS.primary : COLORS.lightGray,
              color: filter === 'unread' ? COLORS.white : COLORS.gray,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Type Filter */}
      <div style={{
        padding: 12,
        borderBottom: `1px solid ${COLORS.lightGray}`,
        overflowX: 'auto',
        display: 'flex',
        gap: 8,
      }}>
        <button
          onClick={() => setTypeFilter('all')}
          style={{
            padding: '4px 10px',
            borderRadius: 12,
            border: typeFilter === 'all' ? `1px solid ${COLORS.primary}` : `1px solid ${COLORS.mediumGray}`,
            backgroundColor: typeFilter === 'all' ? `${COLORS.primary}15` : COLORS.white,
            fontSize: 12,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          All Types
        </button>
        {(Object.keys(NOTIFICATION_CONFIG) as NotificationType[]).map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            style={{
              padding: '4px 10px',
              borderRadius: 12,
              border: typeFilter === type
                ? `1px solid ${NOTIFICATION_CONFIG[type].color}`
                : `1px solid ${COLORS.mediumGray}`,
              backgroundColor: typeFilter === type
                ? `${NOTIFICATION_CONFIG[type].color}15`
                : COLORS.white,
              fontSize: 12,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {NOTIFICATION_CONFIG[type].icon}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div style={{ maxHeight: 500, overflowY: 'auto' }}>
        {filteredNotifications.length === 0 ? (
          <div style={{
            padding: 48,
            textAlign: 'center',
            color: COLORS.gray,
          }}>
            <span style={{ fontSize: 48 }}>🔔</span>
            <div style={{ marginTop: 12, fontSize: 16 }}>No notifications</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>You're all caught up!</div>
          </div>
        ) : (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from(groupedNotifications.entries()).map(([date, notifs]) => (
              <div key={date}>
                <div style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: COLORS.gray,
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}>
                  {date}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {notifs.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onRead={onMarkRead}
                      onAction={onAction}
                      onArchive={onArchive}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Notification Preferences
// ============================================================================

interface NotificationPreferencesProps {
  preferences: NotificationPreference[];
  quietHours: QuietHours;
  onUpdatePreference: (type: NotificationType, updates: Partial<NotificationPreference>) => void;
  onUpdateQuietHours: (updates: Partial<QuietHours>) => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  preferences,
  quietHours,
  onUpdatePreference,
  onUpdateQuietHours,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Global Controls */}
      <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Global Settings</h3>

        {/* Quiet Hours */}
        <div style={{
          padding: 16,
          backgroundColor: COLORS.lightGray,
          borderRadius: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 600 }}>🌙 Quiet Hours</div>
              <div style={{ fontSize: 13, color: COLORS.gray }}>
                Silence notifications during set times
              </div>
            </div>
            <button
              onClick={() => onUpdateQuietHours({ enabled: !quietHours.enabled })}
              style={{
                width: 50,
                height: 28,
                borderRadius: 14,
                border: 'none',
                backgroundColor: quietHours.enabled ? COLORS.success : COLORS.mediumGray,
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: COLORS.white,
                position: 'absolute',
                top: 2,
                left: quietHours.enabled ? 24 : 2,
                transition: 'left 0.2s',
              }} />
            </button>
          </div>

          {quietHours.enabled && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: COLORS.gray }}>Start</label>
                  <input
                    type="time"
                    value={quietHours.startTime}
                    onChange={(e) => onUpdateQuietHours({ startTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 8,
                      borderRadius: 6,
                      border: `1px solid ${COLORS.mediumGray}`,
                      marginTop: 4,
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: COLORS.gray }}>End</label>
                  <input
                    type="time"
                    value={quietHours.endTime}
                    onChange={(e) => onUpdateQuietHours({ endTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 8,
                      borderRadius: 6,
                      border: `1px solid ${COLORS.mediumGray}`,
                      marginTop: 4,
                    }}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={quietHours.allowUrgent}
                  onChange={(e) => onUpdateQuietHours({ allowUrgent: e.target.checked })}
                />
                <span style={{ fontSize: 13 }}>Allow urgent notifications</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Category Preferences */}
      <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Notification Categories</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {preferences.map((pref) => {
            const config = NOTIFICATION_CONFIG[pref.type];

            return (
              <div
                key={pref.type}
                style={{
                  padding: 16,
                  backgroundColor: COLORS.lightGray,
                  borderRadius: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{config.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{config.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.gray }}>{config.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdatePreference(pref.type, { enabled: !pref.enabled })}
                    style={{
                      width: 50,
                      height: 28,
                      borderRadius: 14,
                      border: 'none',
                      backgroundColor: pref.enabled ? COLORS.success : COLORS.mediumGray,
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: COLORS.white,
                      position: 'absolute',
                      top: 2,
                      left: pref.enabled ? 24 : 2,
                      transition: 'left 0.2s',
                    }} />
                  </button>
                </div>

                {pref.enabled && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    <button
                      onClick={() => onUpdatePreference(pref.type, { push: !pref.push })}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 16,
                        border: 'none',
                        backgroundColor: pref.push ? COLORS.primary : COLORS.mediumGray,
                        color: pref.push ? COLORS.white : COLORS.gray,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      📱 Push
                    </button>
                    <button
                      onClick={() => onUpdatePreference(pref.type, { email: !pref.email })}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 16,
                        border: 'none',
                        backgroundColor: pref.email ? COLORS.primary : COLORS.mediumGray,
                        color: pref.email ? COLORS.white : COLORS.gray,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      ✉️ Email
                    </button>
                    <button
                      onClick={() => onUpdatePreference(pref.type, { sound: !pref.sound })}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 16,
                        border: 'none',
                        backgroundColor: pref.sound ? COLORS.primary : COLORS.mediumGray,
                        color: pref.sound ? COLORS.white : COLORS.gray,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      🔊 Sound
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Reminders
// ============================================================================

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
}

const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onToggle, onEdit, onDelete }) => {
  const typeIcons: Record<string, string> = {
    practice: '🎯',
    tee_time: '⛳',
    lesson: '📚',
    tournament: '🏆',
    custom: '📝',
  };

  const formatDays = (days: number[]): string => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    return days.map(d => dayNames[d]).join(', ');
  };

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      opacity: reminder.enabled ? 1 : 0.6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: COLORS.lightGray,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
          }}>
            {typeIcons[reminder.type]}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{reminder.title}</div>
            <div style={{ fontSize: 13, color: COLORS.gray, marginTop: 2 }}>
              {reminder.message}
            </div>
            <div style={{ fontSize: 12, color: COLORS.primary, marginTop: 8 }}>
              ⏰ {reminder.scheduledTime}
              {reminder.frequency !== 'once' && reminder.daysOfWeek && (
                <span> • {formatDays(reminder.daysOfWeek)}</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => onToggle(reminder.id)}
          style={{
            width: 50,
            height: 28,
            borderRadius: 14,
            border: 'none',
            backgroundColor: reminder.enabled ? COLORS.success : COLORS.mediumGray,
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <div style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: COLORS.white,
            position: 'absolute',
            top: 2,
            left: reminder.enabled ? 24 : 2,
            transition: 'left 0.2s',
          }} />
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: 8,
        marginTop: 12,
        paddingTop: 12,
        borderTop: `1px solid ${COLORS.lightGray}`,
      }}>
        <button
          onClick={() => onEdit(reminder)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: `1px solid ${COLORS.mediumGray}`,
            backgroundColor: COLORS.white,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(reminder.id)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: `1px solid ${COLORS.error}`,
            backgroundColor: COLORS.white,
            color: COLORS.error,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// Reminder Editor Component
interface ReminderEditorProps {
  reminder?: Reminder;
  onSave: (reminder: Partial<Reminder>) => void;
  onCancel: () => void;
}

const ReminderEditor: React.FC<ReminderEditorProps> = ({ reminder, onSave, onCancel }) => {
  const [title, setTitle] = useState(reminder?.title || '');
  const [message, setMessage] = useState(reminder?.message || '');
  const [type, setType] = useState<Reminder['type']>(reminder?.type || 'custom');
  const [scheduledTime, setScheduledTime] = useState(reminder?.scheduledTime || '09:00');
  const [frequency, setFrequency] = useState<ReminderFrequency>(reminder?.frequency || 'daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(reminder?.daysOfWeek || [1, 2, 3, 4, 5]);

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const toggleDay = (day: number) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter(d => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  };

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
        {reminder ? 'Edit Reminder' : 'New Reminder'}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Reminder title"
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${COLORS.mediumGray}`,
              fontSize: 16,
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Reminder message"
            rows={2}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${COLORS.mediumGray}`,
              fontSize: 16,
              resize: 'vertical',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            Time
          </label>
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${COLORS.mediumGray}`,
              fontSize: 16,
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            Frequency
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['once', 'daily', 'weekly'] as ReminderFrequency[]).map((freq) => (
              <button
                key={freq}
                onClick={() => setFrequency(freq)}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: frequency === freq
                    ? `2px solid ${COLORS.primary}`
                    : `1px solid ${COLORS.mediumGray}`,
                  backgroundColor: frequency === freq ? `${COLORS.primary}15` : COLORS.white,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                }}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        {(frequency === 'daily' || frequency === 'weekly') && (
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              Days
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {dayNames.map((name, index) => (
                <button
                  key={index}
                  onClick={() => toggleDay(index)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: daysOfWeek.includes(index) ? COLORS.primary : COLORS.lightGray,
                    color: daysOfWeek.includes(index) ? COLORS.white : COLORS.gray,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 8,
              border: `1px solid ${COLORS.mediumGray}`,
              backgroundColor: COLORS.white,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ title, message, type, scheduledTime, frequency, daysOfWeek })}
            disabled={!title}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 8,
              border: 'none',
              backgroundColor: title ? COLORS.primary : COLORS.mediumGray,
              color: COLORS.white,
              fontSize: 16,
              fontWeight: 600,
              cursor: title ? 'pointer' : 'not-allowed',
            }}
          >
            Save Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Activity Feed
// ============================================================================

interface ActivityFeedItemCardProps {
  item: ActivityFeedItem;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
}

const ActivityFeedItemCard: React.FC<ActivityFeedItemCardProps> = ({ item, onLike, onComment }) => {
  const typeIcons: Record<string, string> = {
    round: '⛳',
    achievement: '🏆',
    lesson: '📚',
    tournament: '🏌️',
    social: '👥',
  };

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
    }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {/* Avatar */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: COLORS.secondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.white,
          fontWeight: 700,
        }}>
          {item.userName.charAt(0)}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14 }}>
            <strong>{item.userName}</strong>
            {' '}{item.action}{' '}
            {item.target && <strong>{item.target}</strong>}
          </div>
          <div style={{ fontSize: 12, color: COLORS.gray, marginTop: 4 }}>
            {typeIcons[item.type]} {formatTimeAgo(item.timestamp)}
          </div>

          {/* Engagement */}
          <div style={{
            display: 'flex',
            gap: 16,
            marginTop: 12,
            paddingTop: 12,
            borderTop: `1px solid ${COLORS.lightGray}`,
          }}>
            <button
              onClick={() => onLike(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: 0,
                border: 'none',
                backgroundColor: 'transparent',
                color: item.isLiked ? COLORS.error : COLORS.gray,
                cursor: 'pointer',
              }}
            >
              {item.isLiked ? '❤️' : '🤍'} {item.likes || 0}
            </button>
            <button
              onClick={() => onComment(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: 0,
                border: 'none',
                backgroundColor: 'transparent',
                color: COLORS.gray,
                cursor: 'pointer',
              }}
            >
              💬 {item.comments || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Badge
// ============================================================================

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
}

const NotificationBadgeDisplay: React.FC<NotificationBadgeProps> = ({ count, size = 'medium' }) => {
  if (count === 0) return null;

  const sizes = {
    small: { width: 16, height: 16, fontSize: 10 },
    medium: { width: 20, height: 20, fontSize: 12 },
    large: { width: 24, height: 24, fontSize: 14 },
  };

  const style = sizes[size];

  return (
    <div style={{
      width: style.width,
      height: style.height,
      borderRadius: '50%',
      backgroundColor: COLORS.error,
      color: COLORS.white,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: style.fontSize,
      fontWeight: 700,
    }}>
      {count > 99 ? '99+' : count}
    </div>
  );
};

// ============================================================================
// MAIN HUB COMPONENT
// ============================================================================

type NotificationTab = 'inbox' | 'activity' | 'reminders' | 'settings';

const NotificationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NotificationTab>('inbox');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [preferences, setPreferences] = useState(mockPreferences);
  const [reminders, setReminders] = useState(mockReminders);
  const [quietHours, setQuietHours] = useState(mockQuietHours);
  const [showReminderEditor, setShowReminderEditor] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | undefined>();

  const tabs: { id: NotificationTab; label: string; icon: string; badge?: number }[] = [
    { id: 'inbox', label: 'Inbox', icon: '📥', badge: notifications.filter(n => n.status === 'unread').length },
    { id: 'activity', label: 'Activity', icon: '📰' },
    { id: 'reminders', label: 'Reminders', icon: '⏰' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleMarkRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, status: 'read' } : n
    ));
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, status: 'read' })));
  };

  const handleUpdatePreference = (type: NotificationType, updates: Partial<NotificationPreference>) => {
    setPreferences(preferences.map(p =>
      p.type === type ? { ...p, ...updates } : p
    ));
  };

  const handleToggleReminder = (id: string) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const handleSaveReminder = (data: Partial<Reminder>) => {
    if (editingReminder) {
      setReminders(reminders.map(r =>
        r.id === editingReminder.id ? { ...r, ...data } : r
      ));
    } else {
      setReminders([...reminders, {
        id: `r${Date.now()}`,
        enabled: true,
        ...data,
      } as Reminder]);
    }
    setShowReminderEditor(false);
    setEditingReminder(undefined);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.lightGray,
      paddingBottom: 80,
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: COLORS.primary,
        padding: 20,
        paddingTop: 48,
        color: COLORS.white,
      }}>
        <div style={{ fontSize: 24, fontWeight: 700 }}>Notifications</div>
        <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
          Stay updated with your golf journey
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        backgroundColor: COLORS.white,
        borderBottom: `1px solid ${COLORS.lightGray}`,
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: 12,
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === tab.id ? `2px solid ${COLORS.primary}` : '2px solid transparent',
              color: activeTab === tab.id ? COLORS.primary : COLORS.gray,
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              position: 'relative',
            }}
          >
            <span>{tab.icon}</span>
            <span style={{ fontSize: 12 }}>{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <div style={{
                position: 'absolute',
                top: 6,
                right: '25%',
              }}>
                <NotificationBadgeDisplay count={tab.badge} size="small" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        {activeTab === 'inbox' && (
          <NotificationCenter
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onArchive={(id) => console.log('Archive:', id)}
            onAction={(url) => console.log('Navigate:', url)}
          />
        )}

        {activeTab === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Friend Activity</div>
            {mockActivityFeed.map((item) => (
              <ActivityFeedItemCard
                key={item.id}
                item={item}
                onLike={(id) => console.log('Like:', id)}
                onComment={(id) => console.log('Comment:', id)}
              />
            ))}
          </div>
        )}

        {activeTab === 'reminders' && !showReminderEditor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button
              onClick={() => {
                setEditingReminder(undefined);
                setShowReminderEditor(true);
              }}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 8,
                border: `2px dashed ${COLORS.primary}`,
                backgroundColor: COLORS.white,
                color: COLORS.primary,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Create New Reminder
            </button>

            {reminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggle={handleToggleReminder}
                onEdit={(r) => {
                  setEditingReminder(r);
                  setShowReminderEditor(true);
                }}
                onDelete={(id) => setReminders(reminders.filter(r => r.id !== id))}
              />
            ))}
          </div>
        )}

        {activeTab === 'reminders' && showReminderEditor && (
          <ReminderEditor
            reminder={editingReminder}
            onSave={handleSaveReminder}
            onCancel={() => {
              setShowReminderEditor(false);
              setEditingReminder(undefined);
            }}
          />
        )}

        {activeTab === 'settings' && (
          <NotificationPreferences
            preferences={preferences}
            quietHours={quietHours}
            onUpdatePreference={handleUpdatePreference}
            onUpdateQuietHours={(updates) => setQuietHours({ ...quietHours, ...updates })}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

const NotificationExample: React.FC = () => {
  return <NotificationHub />;
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Types
  type Notification,
  type NotificationGroup,
  type NotificationPreference,
  type Reminder,
  type QuietHours,
  type ActivityFeedItem,
  type NotificationBadge,
  type NotificationType,
  type NotificationPriority,

  // Notification Components
  NotificationCard,
  NotificationItemCompact,
  NotificationCenter,

  // Preference Components
  NotificationPreferences,

  // Reminder Components
  ReminderCard,
  ReminderEditor,

  // Activity Components
  ActivityFeedItemCard,

  // Badge Components
  NotificationBadgeDisplay,

  // Main Hub
  NotificationHub,

  // Example
  NotificationExample,
};

export default NotificationHub;

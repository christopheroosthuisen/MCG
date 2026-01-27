/**
 * NewFeatures_Settings.tsx
 * Settings & Preferences System for MCG App
 *
 * Features:
 * - Profile Management
 * - App Preferences & Customization
 * - Data & Privacy Settings
 * - Subscription & Account Management
 */

import React, { useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type MeasurementUnit = 'yards' | 'meters';
type TemperatureUnit = 'fahrenheit' | 'celsius';
type ThemeMode = 'light' | 'dark' | 'system';
type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'zh';
type HandPreference = 'right' | 'left';
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional';
type SubscriptionTier = 'free' | 'premium' | 'pro';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  location?: {
    city: string;
    state: string;
    country: string;
  };
  homeClub?: string;
  memberSince: string;
}

interface GolfProfile {
  handicap: number;
  handicapIndex?: number;
  skillLevel: SkillLevel;
  handPreference: HandPreference;
  averageScore: number;
  drivingDistance: number;
  goals: string[];
  favoriteClub?: string;
  playFrequency: 'daily' | 'weekly' | 'monthly' | 'occasionally';
}

interface AppPreferences {
  theme: ThemeMode;
  language: Language;
  distanceUnit: MeasurementUnit;
  temperatureUnit: TemperatureUnit;
  hapticFeedback: boolean;
  soundEffects: boolean;
  autoPlayVideos: boolean;
  defaultCamera: 'front' | 'back';
  videoQuality: 'low' | 'medium' | 'high';
  offlineMode: boolean;
  dataUsage: 'low' | 'standard' | 'unlimited';
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showHandicap: boolean;
  showScores: boolean;
  showLocation: boolean;
  shareAnalytics: boolean;
  personalizationData: boolean;
  marketingEmails: boolean;
  partnerOffers: boolean;
}

interface LinkedAccount {
  provider: 'google' | 'apple' | 'facebook' | 'ghin' | 'trackman';
  email?: string;
  connected: boolean;
  lastSynced?: string;
}

interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  renewalDate?: string;
  price?: number;
  billingCycle?: 'monthly' | 'annual';
  features: string[];
}

interface DataExport {
  id: string;
  type: 'full' | 'rounds' | 'stats' | 'profile';
  status: 'pending' | 'ready' | 'expired';
  requestedAt: string;
  expiresAt?: string;
  downloadUrl?: string;
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
  premium: '#FFD700',
};

const LANGUAGES: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
};

const SKILL_LEVELS: Record<SkillLevel, { name: string; description: string }> = {
  beginner: { name: 'Beginner', description: 'New to golf, still learning basics' },
  intermediate: { name: 'Intermediate', description: 'Comfortable with fundamentals' },
  advanced: { name: 'Advanced', description: 'Low handicap, competitive player' },
  professional: { name: 'Professional', description: 'Teaching pro or tour player' },
};

const SUBSCRIPTION_TIERS: Record<SubscriptionTier, { name: string; color: string; icon: string }> = {
  free: { name: 'Free', color: COLORS.gray, icon: '🎯' },
  premium: { name: 'Premium', color: COLORS.primary, icon: '⭐' },
  pro: { name: 'Pro', color: COLORS.premium, icon: '👑' },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockProfile: UserProfile = {
  id: 'u1',
  email: 'john.doe@email.com',
  firstName: 'John',
  lastName: 'Doe',
  displayName: 'JohnnyGolf',
  phone: '+1 (555) 123-4567',
  dateOfBirth: '1985-06-15',
  gender: 'male',
  location: {
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
  },
  homeClub: 'Pebble Beach Golf Links',
  memberSince: '2023-01-15',
};

const mockGolfProfile: GolfProfile = {
  handicap: 12.4,
  handicapIndex: 12.4,
  skillLevel: 'intermediate',
  handPreference: 'right',
  averageScore: 84,
  drivingDistance: 245,
  goals: ['Break 80', 'Hit more fairways', 'Improve putting'],
  favoriteClub: '7 Iron',
  playFrequency: 'weekly',
};

const mockPreferences: AppPreferences = {
  theme: 'system',
  language: 'en',
  distanceUnit: 'yards',
  temperatureUnit: 'fahrenheit',
  hapticFeedback: true,
  soundEffects: true,
  autoPlayVideos: true,
  defaultCamera: 'back',
  videoQuality: 'high',
  offlineMode: false,
  dataUsage: 'standard',
};

const mockPrivacySettings: PrivacySettings = {
  profileVisibility: 'friends',
  showHandicap: true,
  showScores: true,
  showLocation: false,
  shareAnalytics: true,
  personalizationData: true,
  marketingEmails: false,
  partnerOffers: false,
};

const mockLinkedAccounts: LinkedAccount[] = [
  { provider: 'google', email: 'john.doe@gmail.com', connected: true, lastSynced: '2025-07-15T10:00:00' },
  { provider: 'apple', connected: false },
  { provider: 'ghin', email: 'johndoe', connected: true, lastSynced: '2025-07-14T18:00:00' },
  { provider: 'trackman', connected: false },
];

const mockSubscription: SubscriptionInfo = {
  tier: 'premium',
  status: 'active',
  startDate: '2024-01-15',
  renewalDate: '2025-01-15',
  price: 9.99,
  billingCycle: 'monthly',
  features: [
    'Unlimited swing analysis',
    'AI coaching insights',
    'Advanced statistics',
    'No ads',
    'Priority support',
  ],
};

// ============================================================================
// COMPONENTS - Profile
// ============================================================================

interface ProfileHeaderProps {
  profile: UserProfile;
  golfProfile: GolfProfile;
  onEditPhoto: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, golfProfile, onEditPhoto }) => {
  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: COLORS.secondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.white,
            fontSize: 32,
            fontWeight: 700,
          }}>
            {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
          </div>
          <button
            onClick={onEditPhoto}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: `2px solid ${COLORS.white}`,
              backgroundColor: COLORS.primary,
              color: COLORS.white,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}
          >
            📷
          </button>
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {profile.firstName} {profile.lastName}
          </div>
          <div style={{ fontSize: 14, color: COLORS.gray }}>@{profile.displayName}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>
                {golfProfile.handicap.toFixed(1)}
              </div>
              <div style={{ fontSize: 11, color: COLORS.gray }}>Handicap</div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{golfProfile.averageScore}</div>
              <div style={{ fontSize: 11, color: COLORS.gray }}>Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      {profile.homeClub && (
        <div style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: COLORS.lightGray,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span>⛳</span>
          <span style={{ fontSize: 14 }}>{profile.homeClub}</span>
        </div>
      )}
    </div>
  );
};

// Profile Edit Form Component
interface ProfileEditFormProps {
  profile: UserProfile;
  onSave: (updates: Partial<UserProfile>) => void;
  onCancel: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    displayName: profile.displayName,
    phone: profile.phone || '',
    dateOfBirth: profile.dateOfBirth || '',
    homeClub: profile.homeClub || '',
  });

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Edit Profile</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${COLORS.mediumGray}`,
                fontSize: 16,
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            Display Name
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
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
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
            Home Club
          </label>
          <input
            type="text"
            value={formData.homeClub}
            onChange={(e) => setFormData({ ...formData, homeClub: e.target.value })}
            placeholder="Search for your home club..."
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${COLORS.mediumGray}`,
              fontSize: 16,
            }}
          />
        </div>

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
            onClick={() => onSave(formData)}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 8,
              border: 'none',
              backgroundColor: COLORS.primary,
              color: COLORS.white,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Golf Profile Editor Component
interface GolfProfileEditorProps {
  golfProfile: GolfProfile;
  onSave: (updates: Partial<GolfProfile>) => void;
}

const GolfProfileEditor: React.FC<GolfProfileEditorProps> = ({ golfProfile, onSave }) => {
  const [data, setData] = useState(golfProfile);

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Golf Profile</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Handicap */}
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            Handicap Index
          </label>
          <input
            type="number"
            step="0.1"
            value={data.handicap}
            onChange={(e) => setData({ ...data, handicap: parseFloat(e.target.value) })}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${COLORS.mediumGray}`,
              fontSize: 16,
            }}
          />
        </div>

        {/* Skill Level */}
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            Skill Level
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(Object.keys(SKILL_LEVELS) as SkillLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setData({ ...data, skillLevel: level })}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: data.skillLevel === level
                    ? `2px solid ${COLORS.primary}`
                    : `1px solid ${COLORS.mediumGray}`,
                  backgroundColor: data.skillLevel === level
                    ? `${COLORS.primary}15`
                    : COLORS.white,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14 }}>{SKILL_LEVELS[level].name}</div>
                <div style={{ fontSize: 11, color: COLORS.gray }}>{SKILL_LEVELS[level].description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Hand Preference */}
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            Hand Preference
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setData({ ...data, handPreference: 'right' })}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                border: data.handPreference === 'right'
                  ? `2px solid ${COLORS.primary}`
                  : `1px solid ${COLORS.mediumGray}`,
                backgroundColor: data.handPreference === 'right'
                  ? `${COLORS.primary}15`
                  : COLORS.white,
                cursor: 'pointer',
              }}
            >
              🫱 Right-handed
            </button>
            <button
              onClick={() => setData({ ...data, handPreference: 'left' })}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                border: data.handPreference === 'left'
                  ? `2px solid ${COLORS.primary}`
                  : `1px solid ${COLORS.mediumGray}`,
                backgroundColor: data.handPreference === 'left'
                  ? `${COLORS.primary}15`
                  : COLORS.white,
                cursor: 'pointer',
              }}
            >
              🫲 Left-handed
            </button>
          </div>
        </div>

        {/* Average Driving Distance */}
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            Average Driving Distance (yards)
          </label>
          <input
            type="number"
            value={data.drivingDistance}
            onChange={(e) => setData({ ...data, drivingDistance: parseInt(e.target.value) })}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${COLORS.mediumGray}`,
              fontSize: 16,
            }}
          />
        </div>

        <button
          onClick={() => onSave(data)}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 8,
            border: 'none',
            backgroundColor: COLORS.primary,
            color: COLORS.white,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Save Golf Profile
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - App Preferences
// ============================================================================

interface SettingsToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon?: string;
}

const SettingsToggle: React.FC<SettingsToggleProps> = ({ label, description, value, onChange, icon }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: COLORS.white,
      borderRadius: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
        <div>
          <div style={{ fontWeight: 500 }}>{label}</div>
          {description && (
            <div style={{ fontSize: 12, color: COLORS.gray }}>{description}</div>
          )}
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 50,
          height: 28,
          borderRadius: 14,
          border: 'none',
          backgroundColor: value ? COLORS.success : COLORS.mediumGray,
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
          left: value ? 24 : 2,
          transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );
};

interface SettingsSelectorProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  icon?: string;
}

const SettingsSelector: React.FC<SettingsSelectorProps> = ({ label, value, options, onChange, icon }) => {
  return (
    <div style={{
      padding: 12,
      backgroundColor: COLORS.white,
      borderRadius: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
        <span style={{ fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: value === option.value
                ? `2px solid ${COLORS.primary}`
                : `1px solid ${COLORS.mediumGray}`,
              backgroundColor: value === option.value
                ? `${COLORS.primary}15`
                : COLORS.white,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

interface AppPreferencesEditorProps {
  preferences: AppPreferences;
  onUpdate: (updates: Partial<AppPreferences>) => void;
}

const AppPreferencesEditor: React.FC<AppPreferencesEditorProps> = ({ preferences, onUpdate }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Theme */}
      <SettingsSelector
        label="Theme"
        icon="🎨"
        value={preferences.theme}
        options={[
          { value: 'light', label: '☀️ Light' },
          { value: 'dark', label: '🌙 Dark' },
          { value: 'system', label: '⚙️ System' },
        ]}
        onChange={(v) => onUpdate({ theme: v as ThemeMode })}
      />

      {/* Language */}
      <div style={{ padding: 12, backgroundColor: COLORS.white, borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>🌐</span>
          <span style={{ fontWeight: 500 }}>Language</span>
        </div>
        <select
          value={preferences.language}
          onChange={(e) => onUpdate({ language: e.target.value as Language })}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${COLORS.mediumGray}`,
            fontSize: 16,
          }}
        >
          {(Object.keys(LANGUAGES) as Language[]).map((lang) => (
            <option key={lang} value={lang}>{LANGUAGES[lang]}</option>
          ))}
        </select>
      </div>

      {/* Units */}
      <SettingsSelector
        label="Distance Unit"
        icon="📏"
        value={preferences.distanceUnit}
        options={[
          { value: 'yards', label: 'Yards' },
          { value: 'meters', label: 'Meters' },
        ]}
        onChange={(v) => onUpdate({ distanceUnit: v as MeasurementUnit })}
      />

      <SettingsSelector
        label="Temperature Unit"
        icon="🌡️"
        value={preferences.temperatureUnit}
        options={[
          { value: 'fahrenheit', label: '°F' },
          { value: 'celsius', label: '°C' },
        ]}
        onChange={(v) => onUpdate({ temperatureUnit: v as TemperatureUnit })}
      />

      {/* Toggles */}
      <SettingsToggle
        label="Haptic Feedback"
        description="Vibration feedback for interactions"
        icon="📳"
        value={preferences.hapticFeedback}
        onChange={(v) => onUpdate({ hapticFeedback: v })}
      />

      <SettingsToggle
        label="Sound Effects"
        description="Audio feedback and alerts"
        icon="🔊"
        value={preferences.soundEffects}
        onChange={(v) => onUpdate({ soundEffects: v })}
      />

      <SettingsToggle
        label="Auto-play Videos"
        description="Automatically play lesson videos"
        icon="▶️"
        value={preferences.autoPlayVideos}
        onChange={(v) => onUpdate({ autoPlayVideos: v })}
      />

      {/* Video Quality */}
      <SettingsSelector
        label="Video Quality"
        icon="🎬"
        value={preferences.videoQuality}
        options={[
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
        ]}
        onChange={(v) => onUpdate({ videoQuality: v as 'low' | 'medium' | 'high' })}
      />

      <SettingsToggle
        label="Offline Mode"
        description="Download content for offline use"
        icon="📥"
        value={preferences.offlineMode}
        onChange={(v) => onUpdate({ offlineMode: v })}
      />
    </div>
  );
};

// ============================================================================
// COMPONENTS - Privacy
// ============================================================================

interface PrivacySettingsEditorProps {
  settings: PrivacySettings;
  onUpdate: (updates: Partial<PrivacySettings>) => void;
}

const PrivacySettingsEditor: React.FC<PrivacySettingsEditorProps> = ({ settings, onUpdate }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Profile Visibility */}
      <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Profile Visibility</h4>
        <SettingsSelector
          label="Who can see your profile"
          value={settings.profileVisibility}
          options={[
            { value: 'public', label: '🌍 Public' },
            { value: 'friends', label: '👥 Friends' },
            { value: 'private', label: '🔒 Private' },
          ]}
          onChange={(v) => onUpdate({ profileVisibility: v as 'public' | 'friends' | 'private' })}
        />
      </div>

      {/* What to Share */}
      <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>What to Share</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SettingsToggle
            label="Show Handicap"
            value={settings.showHandicap}
            onChange={(v) => onUpdate({ showHandicap: v })}
          />
          <SettingsToggle
            label="Show Scores"
            value={settings.showScores}
            onChange={(v) => onUpdate({ showScores: v })}
          />
          <SettingsToggle
            label="Show Location"
            value={settings.showLocation}
            onChange={(v) => onUpdate({ showLocation: v })}
          />
        </div>
      </div>

      {/* Data & Analytics */}
      <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Data & Analytics</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SettingsToggle
            label="Share Analytics"
            description="Help improve the app with anonymous usage data"
            value={settings.shareAnalytics}
            onChange={(v) => onUpdate({ shareAnalytics: v })}
          />
          <SettingsToggle
            label="Personalization"
            description="Use your data to personalize recommendations"
            value={settings.personalizationData}
            onChange={(v) => onUpdate({ personalizationData: v })}
          />
        </div>
      </div>

      {/* Marketing */}
      <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Marketing</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SettingsToggle
            label="Marketing Emails"
            description="Receive tips, offers, and news"
            value={settings.marketingEmails}
            onChange={(v) => onUpdate({ marketingEmails: v })}
          />
          <SettingsToggle
            label="Partner Offers"
            description="Receive offers from our partners"
            value={settings.partnerOffers}
            onChange={(v) => onUpdate({ partnerOffers: v })}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Linked Accounts
// ============================================================================

interface LinkedAccountCardProps {
  account: LinkedAccount;
  onConnect: () => void;
  onDisconnect: () => void;
}

const LinkedAccountCard: React.FC<LinkedAccountCardProps> = ({ account, onConnect, onDisconnect }) => {
  const providerInfo: Record<string, { name: string; icon: string; color: string }> = {
    google: { name: 'Google', icon: '🔵', color: '#4285F4' },
    apple: { name: 'Apple', icon: '⚫', color: '#000000' },
    facebook: { name: 'Facebook', icon: '🔵', color: '#1877F2' },
    ghin: { name: 'GHIN', icon: '⛳', color: '#006341' },
    trackman: { name: 'TrackMan', icon: '🎯', color: '#FF6600' },
  };

  const info = providerInfo[account.provider];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: COLORS.white,
      borderRadius: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24 }}>{info.icon}</span>
        <div>
          <div style={{ fontWeight: 600 }}>{info.name}</div>
          {account.connected && account.email && (
            <div style={{ fontSize: 12, color: COLORS.gray }}>{account.email}</div>
          )}
          {account.connected && account.lastSynced && (
            <div style={{ fontSize: 11, color: COLORS.success }}>
              Last synced: {new Date(account.lastSynced).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={account.connected ? onDisconnect : onConnect}
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          border: account.connected ? `1px solid ${COLORS.error}` : `1px solid ${info.color}`,
          backgroundColor: account.connected ? COLORS.white : info.color,
          color: account.connected ? COLORS.error : COLORS.white,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {account.connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Subscription
// ============================================================================

interface SubscriptionCardProps {
  subscription: SubscriptionInfo;
  onManage: () => void;
  onUpgrade: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onManage, onUpgrade }) => {
  const tierConfig = SUBSCRIPTION_TIERS[subscription.tier];

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: 20,
        background: subscription.tier === 'pro'
          ? `linear-gradient(135deg, ${COLORS.premium} 0%, ${COLORS.primary} 100%)`
          : subscription.tier === 'premium'
            ? `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`
            : COLORS.lightGray,
        color: subscription.tier === 'free' ? COLORS.darkGray : COLORS.white,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>{tierConfig.icon}</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{tierConfig.name}</div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>
              {subscription.status === 'active' ? 'Active' : subscription.status}
            </div>
          </div>
        </div>

        {subscription.price && (
          <div style={{ marginTop: 12 }}>
            <span style={{ fontSize: 32, fontWeight: 700 }}>${subscription.price}</span>
            <span style={{ fontSize: 14, opacity: 0.8 }}>/{subscription.billingCycle === 'annual' ? 'year' : 'month'}</span>
          </div>
        )}
      </div>

      {/* Features */}
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Included Features</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {subscription.features.map((feature, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: COLORS.success }}>✓</span>
              <span style={{ fontSize: 14 }}>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{
        padding: 16,
        borderTop: `1px solid ${COLORS.lightGray}`,
        display: 'flex',
        gap: 12,
      }}>
        {subscription.tier !== 'pro' && (
          <button
            onClick={onUpgrade}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: 'none',
              backgroundColor: COLORS.primary,
              color: COLORS.white,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Upgrade
          </button>
        )}
        <button
          onClick={onManage}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${COLORS.mediumGray}`,
            backgroundColor: COLORS.white,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Manage
        </button>
      </div>

      {subscription.renewalDate && (
        <div style={{
          padding: 12,
          backgroundColor: COLORS.lightGray,
          fontSize: 12,
          color: COLORS.gray,
          textAlign: 'center',
        }}>
          Renews on {new Date(subscription.renewalDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTS - Data Management
// ============================================================================

interface DataManagementProps {
  onExport: (type: string) => void;
  onDeleteAccount: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ onExport, onDeleteAccount }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Export Data */}
      <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Export Your Data</h4>
        <div style={{ fontSize: 14, color: COLORS.gray, marginBottom: 16 }}>
          Download a copy of your data in JSON format.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => onExport('full')}
            style={{
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${COLORS.mediumGray}`,
              backgroundColor: COLORS.white,
              fontSize: 14,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            📦 Full Export (All Data)
          </button>
          <button
            onClick={() => onExport('rounds')}
            style={{
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${COLORS.mediumGray}`,
              backgroundColor: COLORS.white,
              fontSize: 14,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            ⛳ Rounds & Scores
          </button>
          <button
            onClick={() => onExport('stats')}
            style={{
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${COLORS.mediumGray}`,
              backgroundColor: COLORS.white,
              fontSize: 14,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            📊 Statistics & Analytics
          </button>
        </div>
      </div>

      {/* Delete Account */}
      <div style={{
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        borderLeft: `4px solid ${COLORS.error}`,
      }}>
        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: COLORS.error }}>
          ⚠️ Danger Zone
        </h4>
        <div style={{ fontSize: 14, color: COLORS.gray, marginBottom: 16 }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </div>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${COLORS.error}`,
              backgroundColor: COLORS.white,
              color: COLORS.error,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Delete Account
          </button>
        ) : (
          <div style={{
            padding: 16,
            backgroundColor: `${COLORS.error}15`,
            borderRadius: 8,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Are you absolutely sure?
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 6,
                  border: `1px solid ${COLORS.mediumGray}`,
                  backgroundColor: COLORS.white,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={onDeleteAccount}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: COLORS.error,
                  color: COLORS.white,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Settings Menu
// ============================================================================

interface SettingsMenuItemProps {
  icon: string;
  label: string;
  description?: string;
  value?: string;
  badge?: string;
  badgeColor?: string;
  onPress: () => void;
}

const SettingsMenuItem: React.FC<SettingsMenuItemProps> = ({
  icon,
  label,
  description,
  value,
  badge,
  badgeColor,
  onPress,
}) => {
  return (
    <button
      onClick={onPress}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        backgroundColor: COLORS.white,
        border: 'none',
        borderBottom: `1px solid ${COLORS.lightGray}`,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500 }}>{label}</div>
        {description && (
          <div style={{ fontSize: 12, color: COLORS.gray }}>{description}</div>
        )}
      </div>
      {value && (
        <span style={{ fontSize: 14, color: COLORS.gray }}>{value}</span>
      )}
      {badge && (
        <span style={{
          padding: '4px 8px',
          borderRadius: 12,
          backgroundColor: badgeColor || COLORS.primary,
          color: COLORS.white,
          fontSize: 11,
          fontWeight: 600,
        }}>
          {badge}
        </span>
      )}
      <span style={{ color: COLORS.gray }}>›</span>
    </button>
  );
};

// ============================================================================
// MAIN HUB COMPONENT
// ============================================================================

type SettingsSection =
  | 'main'
  | 'profile'
  | 'golf'
  | 'preferences'
  | 'privacy'
  | 'accounts'
  | 'subscription'
  | 'data'
  | 'about';

const SettingsHub: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('main');
  const [profile, setProfile] = useState(mockProfile);
  const [golfProfile, setGolfProfile] = useState(mockGolfProfile);
  const [preferences, setPreferences] = useState(mockPreferences);
  const [privacySettings, setPrivacySettings] = useState(mockPrivacySettings);
  const [linkedAccounts, setLinkedAccounts] = useState(mockLinkedAccounts);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const renderHeader = (title: string, showBack: boolean = true) => (
    <div style={{
      backgroundColor: COLORS.secondary,
      padding: 20,
      paddingTop: 48,
      color: COLORS.white,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      {showBack && (
        <button
          onClick={() => setActiveSection('main')}
          style={{
            padding: 8,
            borderRadius: 8,
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: COLORS.white,
            cursor: 'pointer',
          }}
        >
          ←
        </button>
      )}
      <div style={{ fontSize: 20, fontWeight: 700 }}>{title}</div>
    </div>
  );

  if (activeSection === 'profile') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.lightGray, paddingBottom: 80 }}>
        {renderHeader('Profile')}
        <div style={{ padding: 16 }}>
          {isEditingProfile ? (
            <ProfileEditForm
              profile={profile}
              onSave={(updates) => {
                setProfile({ ...profile, ...updates });
                setIsEditingProfile(false);
              }}
              onCancel={() => setIsEditingProfile(false)}
            />
          ) : (
            <>
              <ProfileHeader
                profile={profile}
                golfProfile={golfProfile}
                onEditPhoto={() => console.log('Edit photo')}
              />
              <button
                onClick={() => setIsEditingProfile(true)}
                style={{
                  width: '100%',
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.primary}`,
                  backgroundColor: COLORS.white,
                  color: COLORS.primary,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (activeSection === 'golf') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.lightGray, paddingBottom: 80 }}>
        {renderHeader('Golf Profile')}
        <div style={{ padding: 16 }}>
          <GolfProfileEditor
            golfProfile={golfProfile}
            onSave={(updates) => setGolfProfile({ ...golfProfile, ...updates })}
          />
        </div>
      </div>
    );
  }

  if (activeSection === 'preferences') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.lightGray, paddingBottom: 80 }}>
        {renderHeader('App Preferences')}
        <div style={{ padding: 16 }}>
          <AppPreferencesEditor
            preferences={preferences}
            onUpdate={(updates) => setPreferences({ ...preferences, ...updates })}
          />
        </div>
      </div>
    );
  }

  if (activeSection === 'privacy') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.lightGray, paddingBottom: 80 }}>
        {renderHeader('Privacy')}
        <div style={{ padding: 16 }}>
          <PrivacySettingsEditor
            settings={privacySettings}
            onUpdate={(updates) => setPrivacySettings({ ...privacySettings, ...updates })}
          />
        </div>
      </div>
    );
  }

  if (activeSection === 'accounts') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.lightGray, paddingBottom: 80 }}>
        {renderHeader('Linked Accounts')}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {linkedAccounts.map((account) => (
            <LinkedAccountCard
              key={account.provider}
              account={account}
              onConnect={() => console.log('Connect:', account.provider)}
              onDisconnect={() => {
                setLinkedAccounts(linkedAccounts.map(a =>
                  a.provider === account.provider ? { ...a, connected: false } : a
                ));
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (activeSection === 'subscription') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.lightGray, paddingBottom: 80 }}>
        {renderHeader('Subscription')}
        <div style={{ padding: 16 }}>
          <SubscriptionCard
            subscription={mockSubscription}
            onManage={() => console.log('Manage subscription')}
            onUpgrade={() => console.log('Upgrade')}
          />
        </div>
      </div>
    );
  }

  if (activeSection === 'data') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.lightGray, paddingBottom: 80 }}>
        {renderHeader('Data & Account')}
        <div style={{ padding: 16 }}>
          <DataManagement
            onExport={(type) => console.log('Export:', type)}
            onDeleteAccount={() => console.log('Delete account')}
          />
        </div>
      </div>
    );
  }

  // Main Settings Menu
  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.lightGray, paddingBottom: 80 }}>
      {renderHeader('Settings', false)}

      <div style={{ padding: 16 }}>
        <ProfileHeader
          profile={profile}
          golfProfile={golfProfile}
          onEditPhoto={() => console.log('Edit photo')}
        />
      </div>

      {/* Account Section */}
      <div style={{ marginTop: 16 }}>
        <div style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, color: COLORS.gray, textTransform: 'uppercase' }}>
          Account
        </div>
        <div style={{ backgroundColor: COLORS.white, borderRadius: 0 }}>
          <SettingsMenuItem
            icon="👤"
            label="Profile"
            description="Edit your personal information"
            onPress={() => setActiveSection('profile')}
          />
          <SettingsMenuItem
            icon="⛳"
            label="Golf Profile"
            description="Handicap, skill level, goals"
            value={`HCP ${golfProfile.handicap}`}
            onPress={() => setActiveSection('golf')}
          />
          <SettingsMenuItem
            icon="🔗"
            label="Linked Accounts"
            description="Google, Apple, GHIN, TrackMan"
            onPress={() => setActiveSection('accounts')}
          />
          <SettingsMenuItem
            icon="⭐"
            label="Subscription"
            badge={SUBSCRIPTION_TIERS[mockSubscription.tier].name}
            badgeColor={SUBSCRIPTION_TIERS[mockSubscription.tier].color}
            onPress={() => setActiveSection('subscription')}
          />
        </div>
      </div>

      {/* Preferences Section */}
      <div style={{ marginTop: 16 }}>
        <div style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, color: COLORS.gray, textTransform: 'uppercase' }}>
          Preferences
        </div>
        <div style={{ backgroundColor: COLORS.white }}>
          <SettingsMenuItem
            icon="⚙️"
            label="App Preferences"
            description="Theme, language, units"
            onPress={() => setActiveSection('preferences')}
          />
          <SettingsMenuItem
            icon="🔔"
            label="Notifications"
            description="Push, email, reminders"
            onPress={() => console.log('Go to notifications')}
          />
          <SettingsMenuItem
            icon="🔒"
            label="Privacy"
            description="Profile visibility, data sharing"
            onPress={() => setActiveSection('privacy')}
          />
        </div>
      </div>

      {/* Data Section */}
      <div style={{ marginTop: 16 }}>
        <div style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, color: COLORS.gray, textTransform: 'uppercase' }}>
          Data
        </div>
        <div style={{ backgroundColor: COLORS.white }}>
          <SettingsMenuItem
            icon="📦"
            label="Data & Account"
            description="Export, delete account"
            onPress={() => setActiveSection('data')}
          />
          <SettingsMenuItem
            icon="💾"
            label="Storage"
            description="Manage downloaded content"
            value="1.2 GB"
            onPress={() => console.log('Storage')}
          />
        </div>
      </div>

      {/* Support Section */}
      <div style={{ marginTop: 16 }}>
        <div style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, color: COLORS.gray, textTransform: 'uppercase' }}>
          Support
        </div>
        <div style={{ backgroundColor: COLORS.white }}>
          <SettingsMenuItem
            icon="❓"
            label="Help Center"
            onPress={() => console.log('Help')}
          />
          <SettingsMenuItem
            icon="💬"
            label="Contact Support"
            onPress={() => console.log('Contact')}
          />
          <SettingsMenuItem
            icon="📖"
            label="About"
            value="v1.0.0"
            onPress={() => console.log('About')}
          />
        </div>
      </div>

      {/* Sign Out */}
      <div style={{ padding: 16 }}>
        <button
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 8,
            border: `1px solid ${COLORS.error}`,
            backgroundColor: COLORS.white,
            color: COLORS.error,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

const SettingsExample: React.FC = () => {
  return <SettingsHub />;
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Types
  type UserProfile,
  type GolfProfile,
  type AppPreferences,
  type PrivacySettings,
  type LinkedAccount,
  type SubscriptionInfo,
  type MeasurementUnit,
  type ThemeMode,
  type SkillLevel,
  type SubscriptionTier,

  // Profile Components
  ProfileHeader,
  ProfileEditForm,
  GolfProfileEditor,

  // Preferences Components
  SettingsToggle,
  SettingsSelector,
  AppPreferencesEditor,

  // Privacy Components
  PrivacySettingsEditor,

  // Account Components
  LinkedAccountCard,
  SubscriptionCard,

  // Data Components
  DataManagement,

  // Menu Components
  SettingsMenuItem,

  // Main Hub
  SettingsHub,

  // Example
  SettingsExample,
};

export default SettingsHub;


import React, { useState } from 'react';
import { UserProfile, GolfProfile, AppPreferences, PrivacySettings, LinkedAccount, SubscriptionInfo, ThemeMode, Language, MeasurementUnit, TemperatureUnit, SkillLevel } from '../types';
import { COLORS, MOCK_USER_PROFILE, MOCK_GOLF_PROFILE, MOCK_PREFERENCES, MOCK_PRIVACY_SETTINGS, MOCK_LINKED_ACCOUNTS, MOCK_SUBSCRIPTION } from '../constants';
import { ScreenHeader } from './UIComponents';

// --- CONSTANTS ---
const LANGUAGES: Record<Language, string> = {
  en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch', ja: '日本語', ko: '한국어', zh: '中文',
};

const SKILL_LEVELS: Record<SkillLevel, { name: string; description: string }> = {
  beginner: { name: 'Beginner', description: 'New to golf, still learning basics' },
  intermediate: { name: 'Intermediate', description: 'Comfortable with fundamentals' },
  advanced: { name: 'Advanced', description: 'Low handicap, competitive player' },
  professional: { name: 'Professional', description: 'Teaching pro or tour player' },
};

const SUBSCRIPTION_TIERS: Record<string, { name: string; color: string; icon: string }> = {
  free: { name: 'Free', color: COLORS.gray, icon: '🎯' },
  premium: { name: 'Premium', color: COLORS.primary, icon: '⭐' },
  pro: { name: 'Pro', color: COLORS.premium, icon: '👑' },
};

// --- COMPONENTS ---

const SettingsToggle: React.FC<{ label: string; description?: string; value: boolean; onChange: (value: boolean) => void; icon?: string; }> = ({ label, description, value, onChange, icon }) => (
    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl">{icon}</span>}
        <div>
          <div className="font-medium text-sm">{label}</div>
          {description && <div className="text-xs text-gray-500">{description}</div>}
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full p-1 transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
);

const SettingsSelector: React.FC<{ label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void; icon?: string; }> = ({ label, value, options, onChange, icon }) => (
    <div className="p-3 bg-white rounded-lg">
      <div className="flex items-center gap-3 mb-2">
        {icon && <span className="text-xl">{icon}</span>}
        <span className="font-medium text-sm">{label}</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${value === option.value ? `bg-orange-50 text-orange-600 border-orange-200` : `bg-white text-gray-600 border-gray-200 hover:bg-gray-50`}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
);

const SettingsMenuItem: React.FC<{ icon: string; label: string; description?: string; value?: string; badge?: string; badgeColor?: string; onPress: () => void; }> = ({ icon, label, description, value, badge, badgeColor, onPress }) => (
    <button onClick={onPress} className="w-full flex items-center gap-3 p-4 bg-white border-b border-gray-100 last:border-0 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors">
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <div className="font-medium text-sm text-gray-900">{label}</div>
        {description && <div className="text-xs text-gray-500">{description}</div>}
      </div>
      {value && <span className="text-sm text-gray-500">{value}</span>}
      {badge && <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: badgeColor || COLORS.primary }}>{badge}</span>}
      <span className="text-gray-400">›</span>
    </button>
);

const AppPreferencesEditor: React.FC<{ preferences: AppPreferences; onUpdate: (updates: Partial<AppPreferences>) => void; }> = ({ preferences, onUpdate }) => (
    <div className="space-y-3">
      <SettingsSelector label="Theme" icon="🎨" value={preferences.theme} options={[{ value: 'light', label: '☀️ Light' }, { value: 'dark', label: '🌙 Dark' }, { value: 'system', label: '⚙️ System' }]} onChange={(v) => onUpdate({ theme: v as ThemeMode })} />
      <div className="p-3 bg-white rounded-lg">
        <div className="flex items-center gap-3 mb-2"><span className="text-xl">🌐</span><span className="font-medium text-sm">Language</span></div>
        <select value={preferences.language} onChange={(e) => onUpdate({ language: e.target.value as Language })} className="w-full p-2 rounded-lg border border-gray-200 text-sm bg-white"><option value="en">English</option><option value="es">Español</option></select>
      </div>
      <SettingsSelector label="Distance Unit" icon="📏" value={preferences.distanceUnit} options={[{ value: 'yards', label: 'Yards' }, { value: 'meters', label: 'Meters' }]} onChange={(v) => onUpdate({ distanceUnit: v as MeasurementUnit })} />
      <SettingsToggle label="Haptic Feedback" icon="📳" value={preferences.hapticFeedback} onChange={(v) => onUpdate({ hapticFeedback: v })} />
      <SettingsToggle label="Sound Effects" icon="🔊" value={preferences.soundEffects} onChange={(v) => onUpdate({ soundEffects: v })} />
    </div>
);

const LinkedAccountCard: React.FC<{ account: LinkedAccount; onConnect: () => void; onDisconnect: () => void; }> = ({ account, onConnect, onDisconnect }) => {
  const info: any = { google: { name: 'Google', icon: '🔵', color: '#4285F4' }, apple: { name: 'Apple', icon: '⚫', color: '#000000' }, ghin: { name: 'GHIN', icon: '⛳', color: '#006341' } }[account.provider] || { name: account.provider, icon: '🔗', color: '#555' };
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{info.icon}</span>
        <div>
          <div className="font-bold text-sm text-gray-900">{info.name}</div>
          {account.connected && <div className="text-xs text-green-600">Connected</div>}
        </div>
      </div>
      <button onClick={account.connected ? onDisconnect : onConnect} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${account.connected ? 'border-gray-200 text-gray-500 hover:bg-gray-50' : `border-transparent text-white`}`} style={!account.connected ? { backgroundColor: info.color } : {}}>
        {account.connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
};

export const SettingsHub: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [section, setSection] = useState<'MAIN' | 'PREFS' | 'ACCOUNTS'>('MAIN');
  const [prefs, setPrefs] = useState(MOCK_PREFERENCES);
  const [accounts, setAccounts] = useState(MOCK_LINKED_ACCOUNTS);

  return (
    <div className="bg-[#F5F5F7] min-h-screen pb-20 animate-in slide-in-from-right duration-300">
      <ScreenHeader 
        title={section === 'MAIN' ? 'Settings' : section === 'PREFS' ? 'Preferences' : 'Accounts'} 
        leftAction={<button onClick={section === 'MAIN' ? onBack : () => setSection('MAIN')} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg></button>}
      />

      <div className="px-4 py-4 space-y-6">
        {section === 'MAIN' && (
          <>
            <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Account</div>
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                    <SettingsMenuItem icon="🔗" label="Linked Accounts" description="Google, GHIN, TrackMan" onPress={() => setSection('ACCOUNTS')} />
                    <SettingsMenuItem icon="⭐" label="Subscription" badge="Premium" onPress={() => {}} />
                </div>
            </div>
            <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">App</div>
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                    <SettingsMenuItem icon="⚙️" label="Preferences" description="Theme, units, haptics" onPress={() => setSection('PREFS')} />
                    <SettingsMenuItem icon="🔒" label="Privacy" onPress={() => {}} />
                </div>
            </div>
            <button className="w-full p-4 bg-white text-red-500 font-bold rounded-2xl border border-red-100 hover:bg-red-50 transition-colors">Sign Out</button>
          </>
        )}

        {section === 'PREFS' && (
            <AppPreferencesEditor preferences={prefs} onUpdate={(u) => setPrefs({...prefs, ...u})} />
        )}

        {section === 'ACCOUNTS' && (
            <div className="space-y-3">
                {accounts.map(acc => (
                    <LinkedAccountCard key={acc.provider} account={acc} onConnect={() => {}} onDisconnect={() => {}} />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

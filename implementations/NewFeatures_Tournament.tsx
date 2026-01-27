/**
 * NewFeatures_Tournament.tsx
 * Tournament Manager System for MCG App
 *
 * Features:
 * - Tournament Creation (wizard, formats, flights, prizes)
 * - Live Tournament (leaderboard, scoring, standings)
 * - Tournament History (archive, results, awards)
 * - Social Features (invites, teams, chat, photos)
 */

import React, { useState, useEffect } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type TournamentFormat = 'stroke' | 'match' | 'stableford' | 'scramble' | 'bestball' | 'shamble' | 'chapman';
type TournamentStatus = 'draft' | 'open' | 'closed' | 'in_progress' | 'completed' | 'cancelled';
type FlightType = 'handicap' | 'age' | 'gender' | 'custom';
type ScoringType = 'gross' | 'net' | 'both';
type InviteStatus = 'pending' | 'accepted' | 'declined' | 'waitlist';

interface Tournament {
  id: string;
  name: string;
  course: string;
  courseId: string;
  date: string;
  startTime: string;
  format: TournamentFormat;
  scoringType: ScoringType;
  status: TournamentStatus;
  maxPlayers: number;
  registeredPlayers: number;
  entryFee: number;
  prizePool: number;
  flights: Flight[];
  rules: string[];
  organizer: string;
  imageUrl?: string;
  description?: string;
}

interface Flight {
  id: string;
  name: string;
  type: FlightType;
  minHandicap?: number;
  maxHandicap?: number;
  players: TournamentPlayer[];
  prizeAllocation: number; // percentage of prize pool
}

interface TournamentPlayer {
  id: string;
  name: string;
  handicap: number;
  flightId: string;
  teamId?: string;
  teeTime?: string;
  group?: number;
  currentScore?: number;
  thru?: number;
  position?: number;
  netScore?: number;
  points?: number; // for stableford
}

interface Team {
  id: string;
  name: string;
  players: TournamentPlayer[];
  combinedHandicap: number;
  currentScore?: number;
  position?: number;
}

interface PrizeStructure {
  position: number;
  percentage: number;
  amount: number;
  description: string;
}

interface TournamentResult {
  tournamentId: string;
  tournamentName: string;
  date: string;
  course: string;
  format: TournamentFormat;
  position: number;
  totalPlayers: number;
  grossScore: number;
  netScore?: number;
  points?: number;
  winnings: number;
  flight?: string;
}

interface TournamentInvite {
  id: string;
  tournamentId: string;
  tournamentName: string;
  date: string;
  course: string;
  invitedBy: string;
  status: InviteStatus;
  sentAt: string;
  expiresAt: string;
}

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: string;
  type: 'message' | 'score_update' | 'announcement';
}

interface TournamentPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedBy: string;
  timestamp: string;
  likes: number;
}

interface SeasonStanding {
  playerId: string;
  playerName: string;
  eventsPlayed: number;
  wins: number;
  topFives: number;
  topTens: number;
  points: number;
  earnings: number;
  position: number;
}

interface Award {
  id: string;
  name: string;
  description: string;
  tournamentId?: string;
  tournamentName?: string;
  date: string;
  icon: string;
  tier: 'gold' | 'silver' | 'bronze' | 'special';
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
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

const FORMAT_INFO: Record<TournamentFormat, { name: string; description: string; teamSize: number }> = {
  stroke: { name: 'Stroke Play', description: 'Total strokes determine winner', teamSize: 1 },
  match: { name: 'Match Play', description: 'Hole-by-hole competition', teamSize: 1 },
  stableford: { name: 'Stableford', description: 'Points-based scoring system', teamSize: 1 },
  scramble: { name: 'Scramble', description: 'Best shot selected each time', teamSize: 4 },
  bestball: { name: 'Best Ball', description: 'Best individual score counts', teamSize: 2 },
  shamble: { name: 'Shamble', description: 'Scramble off tee, then own ball', teamSize: 4 },
  chapman: { name: 'Chapman/Pinehurst', description: 'Alternate shot after tee', teamSize: 2 },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockTournament: Tournament = {
  id: 't1',
  name: 'MCG Summer Championship',
  course: 'Pebble Beach Golf Links',
  courseId: 'c1',
  date: '2025-07-15',
  startTime: '07:00',
  format: 'stroke',
  scoringType: 'net',
  status: 'in_progress',
  maxPlayers: 72,
  registeredPlayers: 68,
  entryFee: 150,
  prizePool: 8500,
  flights: [
    {
      id: 'f1',
      name: 'Championship Flight',
      type: 'handicap',
      minHandicap: 0,
      maxHandicap: 9.9,
      players: [],
      prizeAllocation: 40,
    },
    {
      id: 'f2',
      name: 'A Flight',
      type: 'handicap',
      minHandicap: 10,
      maxHandicap: 18.9,
      players: [],
      prizeAllocation: 35,
    },
    {
      id: 'f3',
      name: 'B Flight',
      type: 'handicap',
      minHandicap: 19,
      maxHandicap: 36,
      players: [],
      prizeAllocation: 25,
    },
  ],
  rules: [
    'USGA Rules apply',
    'Preferred lies in fairway',
    'Two-ball maximum on course',
    'No gimmes - all putts must be holed',
  ],
  organizer: 'MCG Tournament Committee',
  description: 'Our premier summer event featuring net scoring across three flights.',
};

const mockLeaderboard: TournamentPlayer[] = [
  { id: 'p1', name: 'Tiger Woods', handicap: 2, flightId: 'f1', currentScore: -5, thru: 14, position: 1, netScore: -7 },
  { id: 'p2', name: 'Phil Mickelson', handicap: 4, flightId: 'f1', currentScore: -4, thru: 15, position: 2, netScore: -6 },
  { id: 'p3', name: 'Jordan Spieth', handicap: 1, flightId: 'f1', currentScore: -3, thru: 16, position: 3, netScore: -4 },
  { id: 'p4', name: 'Rory McIlroy', handicap: 0, flightId: 'f1', currentScore: -2, thru: 13, position: 4, netScore: -2 },
  { id: 'p5', name: 'Justin Thomas', handicap: 3, flightId: 'f1', currentScore: -1, thru: 18, position: 5, netScore: -3 },
  { id: 'p6', name: 'John Smith', handicap: 12, flightId: 'f2', currentScore: 4, thru: 12, position: 1, netScore: -5 },
  { id: 'p7', name: 'Mike Johnson', handicap: 15, flightId: 'f2', currentScore: 6, thru: 14, position: 2, netScore: -4 },
  { id: 'p8', name: 'Dave Wilson', handicap: 22, flightId: 'f3', currentScore: 12, thru: 11, position: 1, netScore: -6 },
];

const mockResults: TournamentResult[] = [
  { tournamentId: 't10', tournamentName: 'Spring Classic', date: '2025-04-20', course: 'Augusta National', format: 'stroke', position: 3, totalPlayers: 64, grossScore: 74, netScore: 68, winnings: 450, flight: 'A Flight' },
  { tournamentId: 't9', tournamentName: 'Member-Guest', date: '2025-03-15', course: 'Pebble Beach', format: 'scramble', position: 1, totalPlayers: 32, grossScore: 62, winnings: 1200, flight: 'Open' },
  { tournamentId: 't8', tournamentName: 'Winter Stableford', date: '2025-02-10', course: 'Torrey Pines', format: 'stableford', position: 5, totalPlayers: 48, grossScore: 78, points: 38, winnings: 200 },
  { tournamentId: 't7', tournamentName: 'Club Championship', date: '2024-09-22', course: 'Pebble Beach', format: 'stroke', position: 2, totalPlayers: 72, grossScore: 71, netScore: 67, winnings: 800, flight: 'Championship' },
];

const mockInvites: TournamentInvite[] = [
  { id: 'inv1', tournamentId: 't11', tournamentName: 'Summer Scramble', date: '2025-08-10', course: 'TPC Sawgrass', invitedBy: 'Mike Johnson', status: 'pending', sentAt: '2025-07-01', expiresAt: '2025-07-25' },
  { id: 'inv2', tournamentId: 't12', tournamentName: 'Labor Day Classic', date: '2025-09-01', course: 'Bethpage Black', invitedBy: 'Tournament Comm.', status: 'pending', sentAt: '2025-07-05', expiresAt: '2025-08-15' },
];

const mockSeasonStandings: SeasonStanding[] = [
  { playerId: 'p1', playerName: 'Tiger Woods', eventsPlayed: 12, wins: 3, topFives: 7, topTens: 10, points: 2450, earnings: 12500, position: 1 },
  { playerId: 'p2', playerName: 'Phil Mickelson', eventsPlayed: 11, wins: 2, topFives: 5, topTens: 8, points: 2180, earnings: 9800, position: 2 },
  { playerId: 'p3', playerName: 'Jordan Spieth', eventsPlayed: 10, wins: 1, topFives: 4, topTens: 7, points: 1890, earnings: 7200, position: 3 },
  { playerId: 'user', playerName: 'You', eventsPlayed: 8, wins: 1, topFives: 3, topTens: 5, points: 1540, earnings: 5650, position: 7 },
];

const mockAwards: Award[] = [
  { id: 'a1', name: 'Tournament Champion', description: 'Member-Guest 2025', tournamentId: 't9', tournamentName: 'Member-Guest', date: '2025-03-15', icon: '🏆', tier: 'gold' },
  { id: 'a2', name: 'Low Net', description: 'Club Championship 2024', tournamentId: 't7', tournamentName: 'Club Championship', date: '2024-09-22', icon: '🥈', tier: 'silver' },
  { id: 'a3', name: 'Most Improved', description: '2024 Season Award', date: '2024-12-15', icon: '📈', tier: 'special' },
  { id: 'a4', name: 'Eagle Club', description: 'Made 5+ eagles in tournaments', date: '2024-08-20', icon: '🦅', tier: 'bronze' },
];

const mockChat: ChatMessage[] = [
  { id: 'm1', playerId: 'p1', playerName: 'Tiger Woods', message: 'Great round so far everyone!', timestamp: '2025-07-15T10:30:00', type: 'message' },
  { id: 'm2', playerId: 'system', playerName: 'Tournament', message: 'Tiger Woods posts -5 thru 14', timestamp: '2025-07-15T10:35:00', type: 'score_update' },
  { id: 'm3', playerId: 'p6', playerName: 'John Smith', message: 'That eagle on 8 was incredible!', timestamp: '2025-07-15T10:40:00', type: 'message' },
  { id: 'm4', playerId: 'admin', playerName: 'Tournament Director', message: 'Reminder: Scoring tent closes at 4pm', timestamp: '2025-07-15T10:45:00', type: 'announcement' },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatScore = (score: number): string => {
  if (score === 0) return 'E';
  return score > 0 ? `+${score}` : `${score}`;
};

const getScoreColor = (score: number): string => {
  if (score < 0) return COLORS.error;
  if (score === 0) return COLORS.gray;
  return COLORS.darkGray;
};

const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const getTierColor = (tier: Award['tier']): string => {
  switch (tier) {
    case 'gold': return COLORS.gold;
    case 'silver': return COLORS.silver;
    case 'bronze': return COLORS.bronze;
    case 'special': return COLORS.primary;
    default: return COLORS.gray;
  }
};

// ============================================================================
// COMPONENTS - Tournament Creation
// ============================================================================

interface TournamentWizardProps {
  onComplete: (tournament: Partial<Tournament>) => void;
  onCancel: () => void;
}

const TournamentWizard: React.FC<TournamentWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    date: '',
    startTime: '07:00',
    format: 'stroke' as TournamentFormat,
    scoringType: 'net' as ScoringType,
    maxPlayers: 72,
    entryFee: 100,
    description: '',
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 20 }}>
      {/* Progress Bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, color: COLORS.gray }}>Step {step} of {totalSteps}</span>
          <span style={{ fontSize: 14, color: COLORS.primary, fontWeight: 600 }}>
            {step === 1 && 'Basic Info'}
            {step === 2 && 'Format'}
            {step === 3 && 'Settings'}
            {step === 4 && 'Review'}
          </span>
        </div>
        <div style={{ height: 4, backgroundColor: COLORS.lightGray, borderRadius: 2 }}>
          <div
            style={{
              height: '100%',
              width: `${(step / totalSteps) * 100}%`,
              backgroundColor: COLORS.primary,
              borderRadius: 2,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Tournament Details</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              Tournament Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Summer Championship"
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${COLORS.mediumGray}`,
                fontSize: 16,
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              Course *
            </label>
            <input
              type="text"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              placeholder="Select course"
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${COLORS.mediumGray}`,
                fontSize: 16,
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
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
        </div>
      )}

      {/* Step 2: Format */}
      {step === 2 && (
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Tournament Format</h3>

          <div style={{ display: 'grid', gap: 12 }}>
            {(Object.keys(FORMAT_INFO) as TournamentFormat[]).map((format) => (
              <button
                key={format}
                onClick={() => setFormData({ ...formData, format })}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: formData.format === format
                    ? `2px solid ${COLORS.primary}`
                    : `1px solid ${COLORS.mediumGray}`,
                  backgroundColor: formData.format === format
                    ? `${COLORS.primary}15`
                    : COLORS.white,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{FORMAT_INFO[format].name}</div>
                    <div style={{ fontSize: 14, color: COLORS.gray, marginTop: 4 }}>
                      {FORMAT_INFO[format].description}
                    </div>
                  </div>
                  {FORMAT_INFO[format].teamSize > 1 && (
                    <span style={{
                      backgroundColor: COLORS.secondary,
                      color: COLORS.white,
                      padding: '4px 8px',
                      borderRadius: 12,
                      fontSize: 12,
                    }}>
                      {FORMAT_INFO[format].teamSize}-person
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Settings */}
      {step === 3 && (
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Tournament Settings</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              Scoring Type
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['gross', 'net', 'both'] as ScoringType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, scoringType: type })}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    border: formData.scoringType === type
                      ? `2px solid ${COLORS.primary}`
                      : `1px solid ${COLORS.mediumGray}`,
                    backgroundColor: formData.scoringType === type
                      ? `${COLORS.primary}15`
                      : COLORS.white,
                    fontWeight: formData.scoringType === type ? 600 : 400,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                Max Players
              </label>
              <input
                type="number"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
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
                Entry Fee ($)
              </label>
              <input
                type="number"
                value={formData.entryFee}
                onChange={(e) => setFormData({ ...formData, entryFee: parseInt(e.target.value) })}
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
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tournament description and special rules..."
              rows={4}
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
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Review Tournament</h3>

          <div style={{
            backgroundColor: COLORS.lightGray,
            borderRadius: 12,
            padding: 16,
          }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: COLORS.gray }}>Tournament Name</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{formData.name || 'Not set'}</div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: COLORS.gray }}>Course</div>
              <div style={{ fontSize: 16 }}>{formData.course || 'Not set'}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: COLORS.gray }}>Date</div>
                <div style={{ fontSize: 16 }}>{formData.date || 'Not set'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: COLORS.gray }}>Start Time</div>
                <div style={{ fontSize: 16 }}>{formData.startTime}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: COLORS.gray }}>Format</div>
                <div style={{ fontSize: 16 }}>{FORMAT_INFO[formData.format].name}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: COLORS.gray }}>Scoring</div>
                <div style={{ fontSize: 16, textTransform: 'capitalize' }}>{formData.scoringType}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: COLORS.gray }}>Max Players</div>
                <div style={{ fontSize: 16 }}>{formData.maxPlayers}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: COLORS.gray }}>Entry Fee</div>
                <div style={{ fontSize: 16 }}>{formatCurrency(formData.entryFee)}</div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: `${COLORS.primary}15`,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ fontSize: 20 }}>💰</span>
            <span style={{ fontSize: 14 }}>
              Estimated Prize Pool: <strong>{formatCurrency(formData.maxPlayers * formData.entryFee * 0.8)}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button
          onClick={handleBack}
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
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        <button
          onClick={handleNext}
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
          {step === totalSteps ? 'Create Tournament' : 'Next'}
        </button>
      </div>
    </div>
  );
};

// Format Selector Component
interface FormatSelectorProps {
  selected: TournamentFormat;
  onSelect: (format: TournamentFormat) => void;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {(Object.keys(FORMAT_INFO) as TournamentFormat[]).map((format) => (
        <button
          key={format}
          onClick={() => onSelect(format)}
          style={{
            padding: 16,
            borderRadius: 12,
            border: selected === format
              ? `2px solid ${COLORS.primary}`
              : `1px solid ${COLORS.mediumGray}`,
            backgroundColor: selected === format
              ? `${COLORS.primary}10`
              : COLORS.white,
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>
            {format === 'stroke' && '📊'}
            {format === 'match' && '⚔️'}
            {format === 'stableford' && '🎯'}
            {format === 'scramble' && '👥'}
            {format === 'bestball' && '🏆'}
            {format === 'shamble' && '🔀'}
            {format === 'chapman' && '🔄'}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{FORMAT_INFO[format].name}</div>
          <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 4 }}>
            {FORMAT_INFO[format].teamSize > 1 ? `${FORMAT_INFO[format].teamSize} players` : 'Individual'}
          </div>
        </button>
      ))}
    </div>
  );
};

// Flight Builder Component
interface FlightBuilderProps {
  flights: Flight[];
  onUpdate: (flights: Flight[]) => void;
}

const FlightBuilder: React.FC<FlightBuilderProps> = ({ flights, onUpdate }) => {
  const addFlight = () => {
    const newFlight: Flight = {
      id: `f${Date.now()}`,
      name: `Flight ${flights.length + 1}`,
      type: 'handicap',
      minHandicap: 0,
      maxHandicap: 36,
      players: [],
      prizeAllocation: Math.floor(100 / (flights.length + 1)),
    };
    onUpdate([...flights, newFlight]);
  };

  const updateFlight = (index: number, updates: Partial<Flight>) => {
    const updated = [...flights];
    updated[index] = { ...updated[index], ...updates };
    onUpdate(updated);
  };

  const removeFlight = (index: number) => {
    onUpdate(flights.filter((_, i) => i !== index));
  };

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Flight Configuration</h3>
        <button
          onClick={addFlight}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: COLORS.primary,
            color: COLORS.white,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Add Flight
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {flights.map((flight, index) => (
          <div
            key={flight.id}
            style={{
              padding: 16,
              borderRadius: 12,
              border: `1px solid ${COLORS.mediumGray}`,
              backgroundColor: COLORS.lightGray,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <input
                type="text"
                value={flight.name}
                onChange={(e) => updateFlight(index, { name: e.target.value })}
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: 'transparent',
                  padding: 0,
                }}
              />
              {flights.length > 1 && (
                <button
                  onClick={() => removeFlight(index)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: 'none',
                    backgroundColor: COLORS.error,
                    color: COLORS.white,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: COLORS.gray }}>Min Handicap</label>
                <input
                  type="number"
                  value={flight.minHandicap}
                  onChange={(e) => updateFlight(index, { minHandicap: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 6,
                    border: `1px solid ${COLORS.mediumGray}`,
                    marginTop: 4,
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: COLORS.gray }}>Max Handicap</label>
                <input
                  type="number"
                  value={flight.maxHandicap}
                  onChange={(e) => updateFlight(index, { maxHandicap: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 6,
                    border: `1px solid ${COLORS.mediumGray}`,
                    marginTop: 4,
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: COLORS.gray }}>Prize %</label>
                <input
                  type="number"
                  value={flight.prizeAllocation}
                  onChange={(e) => updateFlight(index, { prizeAllocation: parseInt(e.target.value) })}
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
          </div>
        ))}
      </div>

      {/* Prize Allocation Summary */}
      <div style={{
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
        backgroundColor: flights.reduce((sum, f) => sum + f.prizeAllocation, 0) === 100
          ? `${COLORS.success}15`
          : `${COLORS.warning}15`,
      }}>
        <div style={{ fontSize: 14, display: 'flex', justifyContent: 'space-between' }}>
          <span>Total Prize Allocation:</span>
          <span style={{ fontWeight: 600 }}>
            {flights.reduce((sum, f) => sum + f.prizeAllocation, 0)}%
            {flights.reduce((sum, f) => sum + f.prizeAllocation, 0) !== 100 && ' (should be 100%)'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Prize Structure Component
interface PrizeStructureProps {
  prizePool: number;
  structure: PrizeStructure[];
  onUpdate: (structure: PrizeStructure[]) => void;
}

const PrizeStructureDisplay: React.FC<PrizeStructureProps> = ({ prizePool, structure, onUpdate }) => {
  const presets = {
    top3: [
      { position: 1, percentage: 50, description: '1st Place' },
      { position: 2, percentage: 30, description: '2nd Place' },
      { position: 3, percentage: 20, description: '3rd Place' },
    ],
    top5: [
      { position: 1, percentage: 40, description: '1st Place' },
      { position: 2, percentage: 25, description: '2nd Place' },
      { position: 3, percentage: 15, description: '3rd Place' },
      { position: 4, percentage: 12, description: '4th Place' },
      { position: 5, percentage: 8, description: '5th Place' },
    ],
    top10: [
      { position: 1, percentage: 30, description: '1st Place' },
      { position: 2, percentage: 18, description: '2nd Place' },
      { position: 3, percentage: 12, description: '3rd Place' },
      { position: 4, percentage: 10, description: '4th Place' },
      { position: 5, percentage: 8, description: '5th Place' },
      { position: 6, percentage: 6, description: '6th Place' },
      { position: 7, percentage: 5, description: '7th Place' },
      { position: 8, percentage: 4, description: '8th Place' },
      { position: 9, percentage: 4, description: '9th Place' },
      { position: 10, percentage: 3, description: '10th Place' },
    ],
  };

  const applyPreset = (preset: keyof typeof presets) => {
    onUpdate(presets[preset].map(p => ({
      ...p,
      amount: Math.round(prizePool * (p.percentage / 100)),
    })));
  };

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Prize Structure</h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => applyPreset('top3')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: `1px solid ${COLORS.primary}`,
            backgroundColor: COLORS.white,
            color: COLORS.primary,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Top 3
        </button>
        <button
          onClick={() => applyPreset('top5')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: `1px solid ${COLORS.primary}`,
            backgroundColor: COLORS.white,
            color: COLORS.primary,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Top 5
        </button>
        <button
          onClick={() => applyPreset('top10')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: `1px solid ${COLORS.primary}`,
            backgroundColor: COLORS.white,
            color: COLORS.primary,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Top 10
        </button>
      </div>

      <div style={{
        padding: 12,
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 14, color: COLORS.gray }}>Total Prize Pool</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.secondary }}>
          {formatCurrency(prizePool)}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {structure.map((prize, index) => (
          <div
            key={prize.position}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 12,
              borderRadius: 8,
              backgroundColor: index === 0 ? `${COLORS.gold}20` : COLORS.lightGray,
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: index === 0 ? COLORS.gold : index === 1 ? COLORS.silver : index === 2 ? COLORS.bronze : COLORS.gray,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.white,
              fontWeight: 700,
              marginRight: 12,
            }}>
              {prize.position}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{prize.description}</div>
              <div style={{ fontSize: 12, color: COLORS.gray }}>{prize.percentage}%</div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.secondary }}>
              {formatCurrency(prize.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Live Tournament
// ============================================================================

interface LiveLeaderboardProps {
  tournament: Tournament;
  players: TournamentPlayer[];
  showFlights?: boolean;
}

const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({ tournament, players, showFlights = false }) => {
  const [selectedFlight, setSelectedFlight] = useState<string | 'all'>('all');
  const [scoringView, setScoringView] = useState<'gross' | 'net'>('net');

  const filteredPlayers = selectedFlight === 'all'
    ? players
    : players.filter(p => p.flightId === selectedFlight);

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const scoreA = scoringView === 'net' ? (a.netScore ?? a.currentScore ?? 0) : (a.currentScore ?? 0);
    const scoreB = scoringView === 'net' ? (b.netScore ?? b.currentScore ?? 0) : (b.currentScore ?? 0);
    return scoreA - scoreB;
  });

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        backgroundColor: COLORS.secondary,
        padding: 16,
        color: COLORS.white,
      }}>
        <div style={{ fontSize: 12, opacity: 0.8 }}>LIVE LEADERBOARD</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{tournament.name}</div>
        <div style={{ fontSize: 14, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: COLORS.success,
            animation: 'pulse 2s infinite',
          }} />
          {tournament.status === 'in_progress' ? 'Round in Progress' : tournament.status}
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: 12, borderBottom: `1px solid ${COLORS.lightGray}` }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button
            onClick={() => setSelectedFlight('all')}
            style={{
              padding: '6px 12px',
              borderRadius: 16,
              border: 'none',
              backgroundColor: selectedFlight === 'all' ? COLORS.primary : COLORS.lightGray,
              color: selectedFlight === 'all' ? COLORS.white : COLORS.gray,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            All
          </button>
          {tournament.flights.map((flight) => (
            <button
              key={flight.id}
              onClick={() => setSelectedFlight(flight.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 16,
                border: 'none',
                backgroundColor: selectedFlight === flight.id ? COLORS.primary : COLORS.lightGray,
                color: selectedFlight === flight.id ? COLORS.white : COLORS.gray,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {flight.name}
            </button>
          ))}
        </div>

        {tournament.scoringType === 'both' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setScoringView('gross')}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: `1px solid ${scoringView === 'gross' ? COLORS.secondary : COLORS.mediumGray}`,
                backgroundColor: scoringView === 'gross' ? `${COLORS.secondary}15` : COLORS.white,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Gross
            </button>
            <button
              onClick={() => setScoringView('net')}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: `1px solid ${scoringView === 'net' ? COLORS.secondary : COLORS.mediumGray}`,
                backgroundColor: scoringView === 'net' ? `${COLORS.secondary}15` : COLORS.white,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Net
            </button>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 60px 60px',
          padding: '8px 16px',
          backgroundColor: COLORS.lightGray,
          fontSize: 11,
          fontWeight: 600,
          color: COLORS.gray,
          textTransform: 'uppercase',
        }}>
          <span>Pos</span>
          <span>Player</span>
          <span style={{ textAlign: 'center' }}>Score</span>
          <span style={{ textAlign: 'center' }}>Thru</span>
        </div>

        {sortedPlayers.map((player, index) => {
          const score = scoringView === 'net' ? (player.netScore ?? player.currentScore ?? 0) : (player.currentScore ?? 0);
          const isLeader = index === 0;

          return (
            <div
              key={player.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 60px 60px',
                padding: '12px 16px',
                borderBottom: `1px solid ${COLORS.lightGray}`,
                backgroundColor: isLeader ? `${COLORS.gold}10` : COLORS.white,
              }}
            >
              <span style={{
                fontWeight: 700,
                color: isLeader ? COLORS.primary : COLORS.gray,
              }}>
                {index + 1}
              </span>
              <div>
                <div style={{ fontWeight: 600 }}>{player.name}</div>
                <div style={{ fontSize: 12, color: COLORS.gray }}>
                  HCP: {player.handicap}
                </div>
              </div>
              <span style={{
                textAlign: 'center',
                fontWeight: 700,
                fontSize: 16,
                color: getScoreColor(score),
              }}>
                {formatScore(score)}
              </span>
              <span style={{
                textAlign: 'center',
                color: player.thru === 18 ? COLORS.success : COLORS.gray,
              }}>
                {player.thru === 18 ? 'F' : player.thru}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Hole-by-Hole Scoring Component
interface HoleByHoleScoringProps {
  holes: { number: number; par: number; score?: number; putts?: number }[];
  onScoreUpdate: (hole: number, score: number, putts?: number) => void;
}

const HoleByHoleScoring: React.FC<HoleByHoleScoringProps> = ({ holes, onScoreUpdate }) => {
  const [activeHole, setActiveHole] = useState<number | null>(null);

  const getScoreLabel = (score: number, par: number): string => {
    const diff = score - par;
    if (diff <= -2) return 'Eagle';
    if (diff === -1) return 'Birdie';
    if (diff === 0) return 'Par';
    if (diff === 1) return 'Bogey';
    if (diff === 2) return 'Double';
    return `+${diff}`;
  };

  const getScoreStyle = (score: number | undefined, par: number) => {
    if (score === undefined) return {};
    const diff = score - par;
    if (diff <= -2) return { backgroundColor: COLORS.gold, color: COLORS.white };
    if (diff === -1) return { backgroundColor: COLORS.error, color: COLORS.white };
    if (diff === 0) return { backgroundColor: COLORS.secondary, color: COLORS.white };
    if (diff === 1) return { backgroundColor: COLORS.lightGray, color: COLORS.darkGray };
    return { backgroundColor: COLORS.darkGray, color: COLORS.white };
  };

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Score Entry</h3>

      {/* Hole Grid - Front 9 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray, marginBottom: 8 }}>FRONT 9</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4 }}>
          {holes.slice(0, 9).map((hole) => (
            <button
              key={hole.number}
              onClick={() => setActiveHole(hole.number)}
              style={{
                aspectRatio: '1',
                borderRadius: 8,
                border: activeHole === hole.number ? `2px solid ${COLORS.primary}` : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                ...getScoreStyle(hole.score, hole.par),
              }}
            >
              <span style={{ fontSize: 10, opacity: 0.7 }}>{hole.number}</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{hole.score ?? '-'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hole Grid - Back 9 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray, marginBottom: 8 }}>BACK 9</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4 }}>
          {holes.slice(9, 18).map((hole) => (
            <button
              key={hole.number}
              onClick={() => setActiveHole(hole.number)}
              style={{
                aspectRatio: '1',
                borderRadius: 8,
                border: activeHole === hole.number ? `2px solid ${COLORS.primary}` : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                ...getScoreStyle(hole.score, hole.par),
              }}
            >
              <span style={{ fontSize: 10, opacity: 0.7 }}>{hole.number}</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{hole.score ?? '-'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Score Entry Modal */}
      {activeHole !== null && (
        <div style={{
          padding: 16,
          backgroundColor: COLORS.lightGray,
          borderRadius: 12,
          marginTop: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, color: COLORS.gray }}>Hole {activeHole}</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                Par {holes.find(h => h.number === activeHole)?.par}
              </div>
            </div>
            <button
              onClick={() => setActiveHole(null)}
              style={{
                padding: '4px 12px',
                borderRadius: 4,
                border: 'none',
                backgroundColor: COLORS.mediumGray,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
              const par = holes.find(h => h.number === activeHole)?.par || 4;
              return (
                <button
                  key={score}
                  onClick={() => {
                    onScoreUpdate(activeHole, score);
                    setActiveHole(activeHole < 18 ? activeHole + 1 : null);
                  }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...getScoreStyle(score, par),
                  }}
                >
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{score}</span>
                  <span style={{ fontSize: 8 }}>{getScoreLabel(score, par)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Score Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginTop: 16,
        padding: 12,
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: COLORS.gray }}>Front</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {holes.slice(0, 9).reduce((sum, h) => sum + (h.score || 0), 0) || '-'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: COLORS.gray }}>Back</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {holes.slice(9, 18).reduce((sum, h) => sum + (h.score || 0), 0) || '-'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: COLORS.gray }}>Total</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>
            {holes.reduce((sum, h) => sum + (h.score || 0), 0) || '-'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Flight Standings Component
interface FlightStandingsProps {
  flights: Flight[];
  players: TournamentPlayer[];
}

const FlightStandings: React.FC<FlightStandingsProps> = ({ flights, players }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {flights.map((flight) => {
        const flightPlayers = players
          .filter(p => p.flightId === flight.id)
          .sort((a, b) => (a.netScore ?? 0) - (b.netScore ?? 0))
          .slice(0, 5);

        return (
          <div
            key={flight.id}
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <div style={{
              backgroundColor: COLORS.secondary,
              padding: 12,
              color: COLORS.white,
            }}>
              <div style={{ fontWeight: 700 }}>{flight.name}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Handicap: {flight.minHandicap} - {flight.maxHandicap}
              </div>
            </div>

            <div style={{ padding: 12 }}>
              {flightPlayers.map((player, index) => (
                <div
                  key={player.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: index < flightPlayers.length - 1 ? `1px solid ${COLORS.lightGray}` : 'none',
                  }}
                >
                  <span style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: index === 0 ? COLORS.gold : index === 1 ? COLORS.silver : index === 2 ? COLORS.bronze : COLORS.lightGray,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: index < 3 ? COLORS.white : COLORS.gray,
                    marginRight: 12,
                  }}>
                    {index + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{player.name}</div>
                  </div>
                  <span style={{
                    fontWeight: 700,
                    color: getScoreColor(player.netScore ?? 0),
                  }}>
                    {formatScore(player.netScore ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Tournament Notification Component
interface TournamentNotificationProps {
  message: string;
  type: 'info' | 'score' | 'alert' | 'leader_change';
  timestamp: string;
}

const TournamentNotification: React.FC<TournamentNotificationProps> = ({ message, type, timestamp }) => {
  const getIcon = () => {
    switch (type) {
      case 'score': return '📊';
      case 'alert': return '⚠️';
      case 'leader_change': return '🏆';
      default: return 'ℹ️';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'score': return COLORS.secondary;
      case 'alert': return COLORS.warning;
      case 'leader_change': return COLORS.gold;
      default: return COLORS.primary;
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      padding: 12,
      backgroundColor: `${getColor()}15`,
      borderRadius: 8,
      borderLeft: `4px solid ${getColor()}`,
    }}>
      <span style={{ fontSize: 20, marginRight: 12 }}>{getIcon()}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14 }}>{message}</div>
        <div style={{ fontSize: 12, color: COLORS.gray, marginTop: 4 }}>{timestamp}</div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Tournament History
// ============================================================================

interface TournamentArchiveProps {
  results: TournamentResult[];
  onSelect: (result: TournamentResult) => void;
}

const TournamentArchive: React.FC<TournamentArchiveProps> = ({ results, onSelect }) => {
  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Tournament History</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {results.map((result) => (
          <button
            key={result.tournamentId}
            onClick={() => onSelect(result)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 12,
              borderRadius: 12,
              border: `1px solid ${COLORS.mediumGray}`,
              backgroundColor: COLORS.white,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {/* Position Badge */}
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: result.position === 1 ? COLORS.gold : result.position <= 3 ? COLORS.secondary : COLORS.lightGray,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <span style={{
                fontSize: 18,
                fontWeight: 700,
                color: result.position <= 3 ? COLORS.white : COLORS.gray,
              }}>
                {result.position}
              </span>
              <span style={{
                fontSize: 8,
                color: result.position <= 3 ? COLORS.white : COLORS.gray,
                opacity: 0.8,
              }}>
                {result.position === 1 ? 'WIN' : 'POS'}
              </span>
            </div>

            {/* Tournament Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{result.tournamentName}</div>
              <div style={{ fontSize: 12, color: COLORS.gray }}>
                {result.course} • {formatDate(result.date)}
              </div>
              {result.flight && (
                <span style={{
                  display: 'inline-block',
                  marginTop: 4,
                  padding: '2px 8px',
                  backgroundColor: COLORS.lightGray,
                  borderRadius: 4,
                  fontSize: 11,
                  color: COLORS.gray,
                }}>
                  {result.flight}
                </span>
              )}
            </div>

            {/* Score & Winnings */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {result.netScore ? `Net ${result.netScore}` : result.grossScore}
              </div>
              {result.winnings > 0 && (
                <div style={{ fontSize: 14, color: COLORS.success, fontWeight: 600 }}>
                  {formatCurrency(result.winnings)}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Personal Results Summary Component
interface PersonalResultsProps {
  results: TournamentResult[];
}

const PersonalResults: React.FC<PersonalResultsProps> = ({ results }) => {
  const wins = results.filter(r => r.position === 1).length;
  const topFives = results.filter(r => r.position <= 5).length;
  const totalWinnings = results.reduce((sum, r) => sum + r.winnings, 0);
  const avgPosition = Math.round(results.reduce((sum, r) => sum + r.position, 0) / results.length);

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your Tournament Stats</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        <div style={{
          padding: 16,
          backgroundColor: `${COLORS.gold}20`,
          borderRadius: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.gold }}>{wins}</div>
          <div style={{ fontSize: 14, color: COLORS.gray }}>Wins</div>
        </div>

        <div style={{
          padding: 16,
          backgroundColor: COLORS.lightGray,
          borderRadius: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{topFives}</div>
          <div style={{ fontSize: 14, color: COLORS.gray }}>Top 5s</div>
        </div>

        <div style={{
          padding: 16,
          backgroundColor: `${COLORS.success}20`,
          borderRadius: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.success }}>
            {formatCurrency(totalWinnings)}
          </div>
          <div style={{ fontSize: 14, color: COLORS.gray }}>Total Winnings</div>
        </div>

        <div style={{
          padding: 16,
          backgroundColor: COLORS.lightGray,
          borderRadius: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{avgPosition}</div>
          <div style={{ fontSize: 14, color: COLORS.gray }}>Avg Position</div>
        </div>
      </div>

      <div style={{
        marginTop: 16,
        padding: 12,
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
      }}>
        <div style={{ fontSize: 14, color: COLORS.gray }}>Events Played</div>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{results.length}</div>
      </div>
    </div>
  );
};

// Season Standings Component
interface SeasonStandingsProps {
  standings: SeasonStanding[];
  currentUserId: string;
}

const SeasonStandingsDisplay: React.FC<SeasonStandingsProps> = ({ standings, currentUserId }) => {
  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        backgroundColor: COLORS.secondary,
        padding: 16,
        color: COLORS.white,
      }}>
        <div style={{ fontSize: 12, opacity: 0.8 }}>2025 SEASON</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Points Standings</div>
      </div>

      <div>
        {standings.map((standing) => {
          const isCurrentUser = standing.playerId === currentUserId;

          return (
            <div
              key={standing.playerId}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr auto',
                alignItems: 'center',
                padding: 12,
                borderBottom: `1px solid ${COLORS.lightGray}`,
                backgroundColor: isCurrentUser ? `${COLORS.primary}10` : COLORS.white,
              }}
            >
              <span style={{
                fontWeight: 700,
                color: standing.position <= 3 ? COLORS.primary : COLORS.gray,
              }}>
                {standing.position}
              </span>

              <div>
                <div style={{
                  fontWeight: isCurrentUser ? 700 : 500,
                  color: isCurrentUser ? COLORS.primary : COLORS.darkGray,
                }}>
                  {standing.playerName}
                </div>
                <div style={{ fontSize: 12, color: COLORS.gray }}>
                  {standing.wins}W • {standing.eventsPlayed} events
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{standing.points.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: COLORS.success }}>
                  {formatCurrency(standing.earnings)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Awards Display Component
interface AwardsDisplayProps {
  awards: Award[];
}

const AwardsDisplay: React.FC<AwardsDisplayProps> = ({ awards }) => {
  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Awards & Achievements</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {awards.map((award) => (
          <div
            key={award.id}
            style={{
              padding: 16,
              borderRadius: 12,
              border: `2px solid ${getTierColor(award.tier)}`,
              backgroundColor: `${getTierColor(award.tier)}10`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>{award.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{award.name}</div>
            <div style={{ fontSize: 12, color: COLORS.gray, marginTop: 4 }}>
              {award.description}
            </div>
            <div style={{
              marginTop: 8,
              fontSize: 11,
              color: COLORS.gray,
            }}>
              {formatDate(award.date)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Social Features
// ============================================================================

interface InviteSystemProps {
  invites: TournamentInvite[];
  onRespond: (inviteId: string, response: 'accepted' | 'declined') => void;
}

const InviteSystem: React.FC<InviteSystemProps> = ({ invites, onRespond }) => {
  const pendingInvites = invites.filter(i => i.status === 'pending');

  if (pendingInvites.length === 0) {
    return (
      <div style={{
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 24,
        textAlign: 'center',
      }}>
        <span style={{ fontSize: 48 }}>📬</span>
        <div style={{ fontSize: 16, fontWeight: 600, marginTop: 12 }}>No Pending Invites</div>
        <div style={{ fontSize: 14, color: COLORS.gray, marginTop: 4 }}>
          Check back later for tournament invitations
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
        Tournament Invites ({pendingInvites.length})
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pendingInvites.map((invite) => (
          <div
            key={invite.id}
            style={{
              padding: 16,
              borderRadius: 12,
              border: `1px solid ${COLORS.primary}`,
              backgroundColor: `${COLORS.primary}10`,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 16 }}>{invite.tournamentName}</div>
            <div style={{ fontSize: 14, color: COLORS.gray, marginTop: 4 }}>
              {invite.course} • {formatDate(invite.date)}
            </div>
            <div style={{ fontSize: 13, marginTop: 8 }}>
              Invited by <strong>{invite.invitedBy}</strong>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                onClick={() => onRespond(invite.id, 'accepted')}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: COLORS.success,
                  color: COLORS.white,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Accept
              </button>
              <button
                onClick={() => onRespond(invite.id, 'declined')}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.mediumGray}`,
                  backgroundColor: COLORS.white,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Decline
              </button>
            </div>

            <div style={{
              marginTop: 8,
              fontSize: 12,
              color: COLORS.warning,
            }}>
              Expires {formatDate(invite.expiresAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Team Builder Component
interface TeamBuilderProps {
  format: TournamentFormat;
  teamSize: number;
  onTeamCreate: (team: { name: string; members: string[] }) => void;
}

const TeamBuilder: React.FC<TeamBuilderProps> = ({ format, teamSize, onTeamCreate }) => {
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<string[]>(['']);

  const addMember = () => {
    if (members.length < teamSize) {
      setMembers([...members, '']);
    }
  };

  const updateMember = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Build Your Team</h3>
      <div style={{ fontSize: 14, color: COLORS.gray, marginBottom: 16 }}>
        {FORMAT_INFO[format].name} • {teamSize} players per team
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
          Team Name
        </label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="e.g., The Eagles"
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${COLORS.mediumGray}`,
            fontSize: 16,
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
          Team Members ({members.length}/{teamSize})
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {members.map((member, index) => (
            <div key={index} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={member}
                onChange={(e) => updateMember(index, e.target.value)}
                placeholder={`Player ${index + 1} name or email`}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.mediumGray}`,
                  fontSize: 16,
                }}
              />
              {members.length > 1 && (
                <button
                  onClick={() => removeMember(index)}
                  style={{
                    padding: '0 12px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: COLORS.error,
                    color: COLORS.white,
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {members.length < teamSize && (
          <button
            onClick={addMember}
            style={{
              marginTop: 8,
              padding: '8px 16px',
              borderRadius: 8,
              border: `1px dashed ${COLORS.primary}`,
              backgroundColor: COLORS.white,
              color: COLORS.primary,
              fontSize: 14,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            + Add Team Member
          </button>
        )}
      </div>

      <button
        onClick={() => onTeamCreate({ name: teamName, members: members.filter(m => m) })}
        disabled={!teamName || members.filter(m => m).length < teamSize}
        style={{
          width: '100%',
          padding: 14,
          borderRadius: 8,
          border: 'none',
          backgroundColor: (!teamName || members.filter(m => m).length < teamSize)
            ? COLORS.mediumGray
            : COLORS.primary,
          color: COLORS.white,
          fontSize: 16,
          fontWeight: 600,
          cursor: (!teamName || members.filter(m => m).length < teamSize) ? 'not-allowed' : 'pointer',
        }}
      >
        Create Team
      </button>
    </div>
  );
};

// Chat Room Component
interface ChatRoomProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const getMessageStyle = (type: ChatMessage['type']) => {
    switch (type) {
      case 'score_update':
        return { backgroundColor: `${COLORS.secondary}15`, borderLeft: `3px solid ${COLORS.secondary}` };
      case 'announcement':
        return { backgroundColor: `${COLORS.primary}15`, borderLeft: `3px solid ${COLORS.primary}` };
      default:
        return {};
    }
  };

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        backgroundColor: COLORS.secondary,
        padding: 12,
        color: COLORS.white,
      }}>
        <div style={{ fontWeight: 700 }}>Tournament Chat</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>{messages.length} messages</div>
      </div>

      {/* Messages */}
      <div style={{
        height: 300,
        overflowY: 'auto',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              padding: 10,
              borderRadius: 8,
              backgroundColor: COLORS.lightGray,
              ...getMessageStyle(msg.type),
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{msg.playerName}</span>
              <span style={{ fontSize: 11, color: COLORS.gray }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div style={{ fontSize: 14 }}>{msg.message}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: 12,
        borderTop: `1px solid ${COLORS.lightGray}`,
        display: 'flex',
        gap: 8,
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: `1px solid ${COLORS.mediumGray}`,
            fontSize: 14,
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: COLORS.primary,
            color: COLORS.white,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

// Photo Gallery Component
interface PhotoGalleryProps {
  photos: TournamentPhoto[];
  onUpload: () => void;
  onLike: (photoId: string) => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, onUpload, onLike }) => {
  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Photo Gallery</h3>
        <button
          onClick={onUpload}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: COLORS.primary,
            color: COLORS.white,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Upload
        </button>
      </div>

      {photos.length === 0 ? (
        <div style={{
          padding: 32,
          textAlign: 'center',
          backgroundColor: COLORS.lightGray,
          borderRadius: 12,
        }}>
          <span style={{ fontSize: 48 }}>📷</span>
          <div style={{ fontSize: 14, color: COLORS.gray, marginTop: 8 }}>
            No photos yet. Be the first to share!
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {photos.map((photo) => (
            <div
              key={photo.id}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: COLORS.lightGray,
              }}
            >
              <div style={{
                height: 120,
                backgroundColor: COLORS.mediumGray,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 32 }}>🏌️</span>
              </div>
              <div style={{ padding: 8 }}>
                <div style={{ fontSize: 13 }}>{photo.caption}</div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 8,
                }}>
                  <span style={{ fontSize: 12, color: COLORS.gray }}>{photo.uploadedBy}</span>
                  <button
                    onClick={() => onLike(photo.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: 'none',
                      backgroundColor: COLORS.lightGray,
                      cursor: 'pointer',
                    }}
                  >
                    ❤️ {photo.likes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN HUB COMPONENT
// ============================================================================

type TournamentTab = 'browse' | 'create' | 'live' | 'history' | 'standings';

const TournamentHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TournamentTab>('browse');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(mockTournament);
  const [showWizard, setShowWizard] = useState(false);

  const tabs: { id: TournamentTab; label: string; icon: string }[] = [
    { id: 'browse', label: 'Browse', icon: '🔍' },
    { id: 'create', label: 'Create', icon: '➕' },
    { id: 'live', label: 'Live', icon: '🔴' },
    { id: 'history', label: 'History', icon: '📜' },
    { id: 'standings', label: 'Standings', icon: '🏆' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.lightGray,
      paddingBottom: 80,
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: COLORS.secondary,
        padding: 20,
        paddingTop: 48,
        color: COLORS.white,
      }}>
        <div style={{ fontSize: 24, fontWeight: 700 }}>Tournaments</div>
        <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
          Compete, track, and celebrate
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        backgroundColor: COLORS.white,
        borderBottom: `1px solid ${COLORS.lightGray}`,
        overflowX: 'auto',
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
              minWidth: 70,
            }}
          >
            <span>{tab.icon}</span>
            <span style={{ fontSize: 12 }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        {activeTab === 'browse' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InviteSystem
              invites={mockInvites}
              onRespond={(id, response) => console.log('Invite response:', id, response)}
            />

            <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Upcoming Tournaments</h3>

              <div
                onClick={() => setSelectedTournament(mockTournament)}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: `1px solid ${COLORS.mediumGray}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: `${COLORS.success}20`,
                    color: COLORS.success,
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    OPEN
                  </span>
                  <span style={{ fontSize: 14, color: COLORS.gray }}>
                    {mockTournament.registeredPlayers}/{mockTournament.maxPlayers}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{mockTournament.name}</div>
                <div style={{ fontSize: 14, color: COLORS.gray, marginTop: 4 }}>
                  {mockTournament.course}
                </div>
                <div style={{ fontSize: 14, marginTop: 8 }}>
                  {formatDate(mockTournament.date)} • {FORMAT_INFO[mockTournament.format].name}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: `1px solid ${COLORS.lightGray}`,
                }}>
                  <span>Entry: {formatCurrency(mockTournament.entryFee)}</span>
                  <span style={{ color: COLORS.success, fontWeight: 600 }}>
                    Prize Pool: {formatCurrency(mockTournament.prizePool)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <TournamentWizard
            onComplete={(data) => {
              console.log('Tournament created:', data);
              setActiveTab('browse');
            }}
            onCancel={() => setActiveTab('browse')}
          />
        )}

        {activeTab === 'live' && selectedTournament && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <LiveLeaderboard
              tournament={selectedTournament}
              players={mockLeaderboard}
            />
            <FlightStandings
              flights={selectedTournament.flights}
              players={mockLeaderboard}
            />
            <ChatRoom
              messages={mockChat}
              onSendMessage={(msg) => console.log('Send message:', msg)}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PersonalResults results={mockResults} />
            <TournamentArchive
              results={mockResults}
              onSelect={(result) => console.log('Selected:', result)}
            />
            <AwardsDisplay awards={mockAwards} />
          </div>
        )}

        {activeTab === 'standings' && (
          <SeasonStandingsDisplay
            standings={mockSeasonStandings}
            currentUserId="user"
          />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

const TournamentExample: React.FC = () => {
  return <TournamentHub />;
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Types
  type Tournament,
  type TournamentPlayer,
  type Team,
  type Flight,
  type PrizeStructure,
  type TournamentResult,
  type TournamentInvite,
  type ChatMessage,
  type TournamentPhoto,
  type SeasonStanding,
  type Award,
  type TournamentFormat,
  type TournamentStatus,

  // Creation Components
  TournamentWizard,
  FormatSelector,
  FlightBuilder,
  PrizeStructureDisplay,

  // Live Components
  LiveLeaderboard,
  HoleByHoleScoring,
  FlightStandings,
  TournamentNotification,

  // History Components
  TournamentArchive,
  PersonalResults,
  SeasonStandingsDisplay,
  AwardsDisplay,

  // Social Components
  InviteSystem,
  TeamBuilder,
  ChatRoom,
  PhotoGallery,

  // Main Hub
  TournamentHub,

  // Example
  TournamentExample,
};

export default TournamentHub;

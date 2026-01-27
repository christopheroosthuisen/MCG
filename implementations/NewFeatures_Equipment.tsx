/**
 * NewFeatures_Equipment.tsx
 * Equipment & Bag Manager for MCG Golf App
 *
 * Inspired by: Arccos, MyGolfSpy, Golf Digest Equipment
 *
 * Features:
 * - Virtual Golf Bag visualization
 * - Club Performance Tracking
 * - Equipment History timeline
 * - AI Gear Recommendations
 */

import React, { useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type ClubType =
  | 'DRIVER'
  | 'FAIRWAY_WOOD'
  | 'HYBRID'
  | 'IRON'
  | 'WEDGE'
  | 'PUTTER';

type ShaftFlex = 'L' | 'A' | 'R' | 'S' | 'X';
type KickPoint = 'LOW' | 'MID' | 'HIGH';

interface ShaftSpec {
  brand: string;
  model: string;
  flex: ShaftFlex;
  weight: number;
  kickPoint: KickPoint;
}

interface ClubStats {
  averageDistance: number;
  averageDispersion: number;
  totalShots: number;
  fairwayHitRate?: number;
  girRate?: number;
  missPattern: 'LEFT' | 'RIGHT' | 'CENTER' | 'VARIED';
  avgCarry: number;
  avgTotal: number;
}

interface ClubInBag {
  id: string;
  type: ClubType;
  name: string;
  brand: string;
  model: string;
  loft: number;
  lie: number;
  shaft: ShaftSpec;
  grip: string;
  purchaseDate: Date;
  notes: string;
  stats: ClubStats;
  imageUrl?: string;
  distancesByCondition: {
    normal: number;
    cold: number;
    hot: number;
    altitude: number;
    headwind: number;
    tailwind: number;
  };
}

interface FittingSession {
  id: string;
  date: Date;
  location: string;
  fitter: string;
  clubType: ClubType;
  notes: string;
  recommendations: string[];
  metricsRecorded: {
    clubSpeed: number;
    ballSpeed: number;
    launchAngle: number;
    spinRate: number;
  };
}

interface EquipmentChange {
  id: string;
  date: Date;
  type: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'FITTING';
  clubId?: string;
  clubName: string;
  description: string;
  performanceImpact?: string;
}

interface GapAnalysisResult {
  club1: ClubInBag;
  club2: ClubInBag;
  gapDistance: number;
  status: 'OPTIMAL' | 'TOO_LARGE' | 'TOO_SMALL';
  recommendation?: string;
}

interface EquipmentRecommendation {
  id: string;
  category: 'UPGRADE' | 'GAP_FILL' | 'FITTING' | 'MAINTENANCE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  reason: string;
  suggestedProducts?: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#FF8200',
  secondary: '#115740',
  background: '#F5F5F5',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#FAFAFA',
    100: '#F7F7F7',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
  },
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

const CLUB_TYPE_CONFIG: Record<ClubType, { label: string; icon: string; color: string }> = {
  DRIVER: { label: 'Driver', icon: '🏌️', color: '#4F46E5' },
  FAIRWAY_WOOD: { label: 'Fairway Wood', icon: '🌲', color: '#059669' },
  HYBRID: { label: 'Hybrid', icon: '🔀', color: '#0891B2' },
  IRON: { label: 'Iron', icon: '🔩', color: '#6366F1' },
  WEDGE: { label: 'Wedge', icon: '⚙️', color: '#D97706' },
  PUTTER: { label: 'Putter', icon: '🎱', color: '#7C3AED' },
};

const SHAFT_FLEX_LABELS: Record<ShaftFlex, string> = {
  L: 'Ladies',
  A: 'Senior',
  R: 'Regular',
  S: 'Stiff',
  X: 'Extra Stiff',
};

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_BAG: ClubInBag[] = [
  {
    id: 'club-1',
    type: 'DRIVER',
    name: 'Driver',
    brand: 'TaylorMade',
    model: 'Qi10 Max',
    loft: 10.5,
    lie: 58,
    shaft: {
      brand: 'Fujikura',
      model: 'Ventus TR',
      flex: 'S',
      weight: 65,
      kickPoint: 'MID',
    },
    grip: 'Golf Pride Tour Velvet',
    purchaseDate: new Date('2024-01-15'),
    notes: 'Fitted at Club Champion',
    stats: {
      averageDistance: 265,
      averageDispersion: 28,
      totalShots: 142,
      fairwayHitRate: 58,
      missPattern: 'RIGHT',
      avgCarry: 248,
      avgTotal: 265,
    },
    distancesByCondition: {
      normal: 265,
      cold: 252,
      hot: 272,
      altitude: 278,
      headwind: 248,
      tailwind: 282,
    },
  },
  {
    id: 'club-2',
    type: 'FAIRWAY_WOOD',
    name: '3 Wood',
    brand: 'Callaway',
    model: 'Paradym Ai Smoke',
    loft: 15,
    lie: 57,
    shaft: {
      brand: 'Project X',
      model: 'HZRDUS Smoke',
      flex: 'S',
      weight: 70,
      kickPoint: 'LOW',
    },
    grip: 'Golf Pride MCC',
    purchaseDate: new Date('2024-02-20'),
    notes: '',
    stats: {
      averageDistance: 235,
      averageDispersion: 22,
      totalShots: 89,
      fairwayHitRate: 52,
      missPattern: 'LEFT',
      avgCarry: 220,
      avgTotal: 235,
    },
    distancesByCondition: {
      normal: 235,
      cold: 224,
      hot: 242,
      altitude: 248,
      headwind: 218,
      tailwind: 252,
    },
  },
  {
    id: 'club-3',
    type: 'HYBRID',
    name: '4 Hybrid',
    brand: 'Ping',
    model: 'G430',
    loft: 22,
    lie: 60,
    shaft: {
      brand: 'Ping',
      model: 'Alta CB Black',
      flex: 'S',
      weight: 75,
      kickPoint: 'MID',
    },
    grip: 'Golf Pride CP2 Wrap',
    purchaseDate: new Date('2023-08-10'),
    notes: 'Great for long par 3s',
    stats: {
      averageDistance: 205,
      averageDispersion: 18,
      totalShots: 67,
      girRate: 45,
      missPattern: 'CENTER',
      avgCarry: 195,
      avgTotal: 205,
    },
    distancesByCondition: {
      normal: 205,
      cold: 196,
      hot: 211,
      altitude: 216,
      headwind: 190,
      tailwind: 220,
    },
  },
  {
    id: 'club-4',
    type: 'IRON',
    name: '5 Iron',
    brand: 'Titleist',
    model: 'T200',
    loft: 25,
    lie: 62,
    shaft: {
      brand: 'True Temper',
      model: 'Dynamic Gold 105',
      flex: 'S',
      weight: 105,
      kickPoint: 'HIGH',
    },
    grip: 'Golf Pride Tour Velvet',
    purchaseDate: new Date('2023-06-01'),
    notes: '',
    stats: {
      averageDistance: 185,
      averageDispersion: 16,
      totalShots: 78,
      girRate: 42,
      missPattern: 'LEFT',
      avgCarry: 178,
      avgTotal: 185,
    },
    distancesByCondition: {
      normal: 185,
      cold: 177,
      hot: 191,
      altitude: 195,
      headwind: 172,
      tailwind: 198,
    },
  },
  {
    id: 'club-5',
    type: 'IRON',
    name: '6 Iron',
    brand: 'Titleist',
    model: 'T200',
    loft: 28,
    lie: 62.5,
    shaft: {
      brand: 'True Temper',
      model: 'Dynamic Gold 105',
      flex: 'S',
      weight: 105,
      kickPoint: 'HIGH',
    },
    grip: 'Golf Pride Tour Velvet',
    purchaseDate: new Date('2023-06-01'),
    notes: '',
    stats: {
      averageDistance: 175,
      averageDispersion: 14,
      totalShots: 92,
      girRate: 48,
      missPattern: 'CENTER',
      avgCarry: 168,
      avgTotal: 175,
    },
    distancesByCondition: {
      normal: 175,
      cold: 168,
      hot: 180,
      altitude: 184,
      headwind: 162,
      tailwind: 188,
    },
  },
  {
    id: 'club-6',
    type: 'IRON',
    name: '7 Iron',
    brand: 'Titleist',
    model: 'T200',
    loft: 31,
    lie: 63,
    shaft: {
      brand: 'True Temper',
      model: 'Dynamic Gold 105',
      flex: 'S',
      weight: 105,
      kickPoint: 'HIGH',
    },
    grip: 'Golf Pride Tour Velvet',
    purchaseDate: new Date('2023-06-01'),
    notes: '',
    stats: {
      averageDistance: 165,
      averageDispersion: 12,
      totalShots: 134,
      girRate: 52,
      missPattern: 'CENTER',
      avgCarry: 158,
      avgTotal: 165,
    },
    distancesByCondition: {
      normal: 165,
      cold: 158,
      hot: 170,
      altitude: 174,
      headwind: 152,
      tailwind: 178,
    },
  },
  {
    id: 'club-7',
    type: 'IRON',
    name: '8 Iron',
    brand: 'Titleist',
    model: 'T200',
    loft: 35,
    lie: 63.5,
    shaft: {
      brand: 'True Temper',
      model: 'Dynamic Gold 105',
      flex: 'S',
      weight: 105,
      kickPoint: 'HIGH',
    },
    grip: 'Golf Pride Tour Velvet',
    purchaseDate: new Date('2023-06-01'),
    notes: '',
    stats: {
      averageDistance: 152,
      averageDispersion: 10,
      totalShots: 156,
      girRate: 58,
      missPattern: 'CENTER',
      avgCarry: 145,
      avgTotal: 152,
    },
    distancesByCondition: {
      normal: 152,
      cold: 145,
      hot: 157,
      altitude: 160,
      headwind: 140,
      tailwind: 164,
    },
  },
  {
    id: 'club-8',
    type: 'IRON',
    name: '9 Iron',
    brand: 'Titleist',
    model: 'T200',
    loft: 39,
    lie: 64,
    shaft: {
      brand: 'True Temper',
      model: 'Dynamic Gold 105',
      flex: 'S',
      weight: 105,
      kickPoint: 'HIGH',
    },
    grip: 'Golf Pride Tour Velvet',
    purchaseDate: new Date('2023-06-01'),
    notes: '',
    stats: {
      averageDistance: 140,
      averageDispersion: 9,
      totalShots: 145,
      girRate: 62,
      missPattern: 'CENTER',
      avgCarry: 134,
      avgTotal: 140,
    },
    distancesByCondition: {
      normal: 140,
      cold: 134,
      hot: 144,
      altitude: 147,
      headwind: 130,
      tailwind: 150,
    },
  },
  {
    id: 'club-9',
    type: 'WEDGE',
    name: 'PW',
    brand: 'Titleist',
    model: 'Vokey SM9',
    loft: 46,
    lie: 64,
    shaft: {
      brand: 'True Temper',
      model: 'Dynamic Gold 115',
      flex: 'S',
      weight: 115,
      kickPoint: 'HIGH',
    },
    grip: 'Golf Pride Tour Velvet',
    purchaseDate: new Date('2023-09-15'),
    notes: 'F Grind',
    stats: {
      averageDistance: 125,
      averageDispersion: 8,
      totalShots: 178,
      girRate: 68,
      missPattern: 'CENTER',
      avgCarry: 120,
      avgTotal: 125,
    },
    distancesByCondition: {
      normal: 125,
      cold: 120,
      hot: 129,
      altitude: 131,
      headwind: 116,
      tailwind: 134,
    },
  },
  {
    id: 'club-10',
    type: 'WEDGE',
    name: 'GW',
    brand: 'Titleist',
    model: 'Vokey SM9',
    loft: 50,
    lie: 64,
    shaft: {
      brand: 'True Temper',
      model: 'Dynamic Gold 115',
      flex: 'S',
      weight: 115,
      kickPoint: 'HIGH',
    },
    grip: 'Golf Pride Tour Velvet',
    purchaseDate: new Date('2023-09-15'),
    notes: 'F Grind',
    stats: {
      averageDistance: 110,
      averageDispersion: 7,
      totalShots: 167,
      missPattern: 'CENTER',
      avgCarry: 105,
      avgTotal: 110,
    },
    distancesByCondition: {
      normal: 110,
      cold: 105,
      hot: 113,
      altitude: 116,
      headwind: 102,
      tailwind: 118,
    },
  },
  {
    id: 'club-11',
    type: 'WEDGE',
    name: 'SW',
    brand: 'Titleist',
    model: 'Vokey SM9',
    loft: 54,
    lie: 64,
    shaft: {
      brand: 'True Temper',
      model: 'Dynamic Gold 115',
      flex: 'S',
      weight: 115,
      kickPoint: 'HIGH',
    },
    grip: 'Golf Pride Tour Velvet',
    purchaseDate: new Date('2023-09-15'),
    notes: 'S Grind - bunker specialist',
    stats: {
      averageDistance: 95,
      averageDispersion: 8,
      totalShots: 145,
      missPattern: 'CENTER',
      avgCarry: 90,
      avgTotal: 95,
    },
    distancesByCondition: {
      normal: 95,
      cold: 91,
      hot: 98,
      altitude: 100,
      headwind: 88,
      tailwind: 102,
    },
  },
  {
    id: 'club-12',
    type: 'WEDGE',
    name: 'LW',
    brand: 'Titleist',
    model: 'Vokey SM9',
    loft: 60,
    lie: 64,
    shaft: {
      brand: 'True Temper',
      model: 'Dynamic Gold 115',
      flex: 'S',
      weight: 115,
      kickPoint: 'HIGH',
    },
    grip: 'Golf Pride Tour Velvet',
    purchaseDate: new Date('2023-09-15'),
    notes: 'M Grind - flop shots',
    stats: {
      averageDistance: 75,
      averageDispersion: 10,
      totalShots: 89,
      missPattern: 'VARIED',
      avgCarry: 72,
      avgTotal: 75,
    },
    distancesByCondition: {
      normal: 75,
      cold: 72,
      hot: 77,
      altitude: 79,
      headwind: 70,
      tailwind: 80,
    },
  },
  {
    id: 'club-13',
    type: 'PUTTER',
    name: 'Putter',
    brand: 'Scotty Cameron',
    model: 'Phantom X 5',
    loft: 3.5,
    lie: 70,
    shaft: {
      brand: 'Scotty Cameron',
      model: 'Steel',
      flex: 'R',
      weight: 350,
      kickPoint: 'HIGH',
    },
    grip: 'SuperStroke Pistol GT 2.0',
    purchaseDate: new Date('2022-12-01'),
    notes: 'Face balanced, 34" length',
    stats: {
      averageDistance: 0,
      averageDispersion: 0,
      totalShots: 512,
      missPattern: 'CENTER',
      avgCarry: 0,
      avgTotal: 0,
    },
    distancesByCondition: {
      normal: 0,
      cold: 0,
      hot: 0,
      altitude: 0,
      headwind: 0,
      tailwind: 0,
    },
  },
];

const MOCK_FITTING_SESSIONS: FittingSession[] = [
  {
    id: 'fit-1',
    date: new Date('2024-01-15'),
    location: 'Club Champion',
    fitter: 'Mike Johnson',
    clubType: 'DRIVER',
    notes: 'Fitted for lower spin with faster ball speed',
    recommendations: [
      'Move to stiffer shaft for better control',
      'Lower loft by 1 degree for optimal launch',
      'Consider heavier head weight',
    ],
    metricsRecorded: {
      clubSpeed: 108,
      ballSpeed: 162,
      launchAngle: 11.5,
      spinRate: 2200,
    },
  },
  {
    id: 'fit-2',
    date: new Date('2023-09-10'),
    location: 'Golf Galaxy',
    fitter: 'Sarah Williams',
    clubType: 'WEDGE',
    notes: 'Full wedge fitting - checked gapping and bounce options',
    recommendations: [
      '4-wedge setup with 4-degree gaps',
      'F grind for PW/GW, S grind for SW',
      'M grind for LW for versatility',
    ],
    metricsRecorded: {
      clubSpeed: 85,
      ballSpeed: 110,
      launchAngle: 32,
      spinRate: 9500,
    },
  },
];

const MOCK_EQUIPMENT_HISTORY: EquipmentChange[] = [
  {
    id: 'hist-1',
    date: new Date('2024-01-15'),
    type: 'ADDED',
    clubId: 'club-1',
    clubName: 'TaylorMade Qi10 Max Driver',
    description: 'Upgraded from Stealth Plus driver',
    performanceImpact: '+12 yards average, tighter dispersion',
  },
  {
    id: 'hist-2',
    date: new Date('2024-01-15'),
    type: 'FITTING',
    clubName: 'Driver Fitting',
    description: 'Full driver fitting at Club Champion',
  },
  {
    id: 'hist-3',
    date: new Date('2023-09-15'),
    type: 'ADDED',
    clubName: 'Titleist Vokey SM9 Wedges (4)',
    description: 'New wedge set: 46°, 50°, 54°, 60°',
    performanceImpact: 'Better spin control, improved greenside performance',
  },
  {
    id: 'hist-4',
    date: new Date('2023-06-01'),
    type: 'ADDED',
    clubName: 'Titleist T200 Irons (5-9)',
    description: 'Upgraded from older blade irons',
    performanceImpact: 'More forgiveness, consistent distances',
  },
];

const MOCK_RECOMMENDATIONS: EquipmentRecommendation[] = [
  {
    id: 'rec-1',
    category: 'GAP_FILL',
    priority: 'HIGH',
    title: 'Add 5 Wood',
    description: 'You have a 30-yard gap between your 3 wood and 4 hybrid',
    reason: 'Based on your distance data, adding a 5 wood (18°) would fill this gap perfectly',
    suggestedProducts: ['Callaway Paradym Ai Smoke 5W', 'TaylorMade Qi10 5W', 'Ping G430 5W'],
  },
  {
    id: 'rec-2',
    category: 'FITTING',
    priority: 'MEDIUM',
    title: 'Iron Shaft Upgrade',
    description: 'Your swing speed suggests you could benefit from slightly lighter shafts',
    reason: 'Current 105g shafts are good, but 95g option may increase ball speed',
  },
  {
    id: 'rec-3',
    category: 'MAINTENANCE',
    priority: 'LOW',
    title: 'Regrip Irons',
    description: 'Your iron grips are over 18 months old',
    reason: 'Worn grips can lead to grip pressure issues and inconsistent shots',
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getClubAgeMonths = (purchaseDate: Date): number => {
  const now = new Date();
  return Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
};

const calculateGaps = (clubs: ClubInBag[]): GapAnalysisResult[] => {
  const sortedClubs = [...clubs]
    .filter(c => c.type !== 'PUTTER')
    .sort((a, b) => b.stats.averageDistance - a.stats.averageDistance);

  const gaps: GapAnalysisResult[] = [];

  for (let i = 0; i < sortedClubs.length - 1; i++) {
    const gap = sortedClubs[i].stats.averageDistance - sortedClubs[i + 1].stats.averageDistance;
    let status: GapAnalysisResult['status'] = 'OPTIMAL';
    let recommendation: string | undefined;

    if (gap > 20) {
      status = 'TOO_LARGE';
      recommendation = `Consider adding a club between ${sortedClubs[i].name} and ${sortedClubs[i + 1].name}`;
    } else if (gap < 8) {
      status = 'TOO_SMALL';
      recommendation = `You may have redundancy between ${sortedClubs[i].name} and ${sortedClubs[i + 1].name}`;
    }

    gaps.push({
      club1: sortedClubs[i],
      club2: sortedClubs[i + 1],
      gapDistance: gap,
      status,
      recommendation,
    });
  }

  return gaps;
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * BagVisualization - Visual 14-club bag layout
 */
interface BagVisualizationProps {
  clubs: ClubInBag[];
  onClubSelect: (club: ClubInBag) => void;
  selectedClubId?: string;
}

const BagVisualization: React.FC<BagVisualizationProps> = ({
  clubs,
  onClubSelect,
  selectedClubId,
}) => {
  const groupedClubs = clubs.reduce((acc, club) => {
    if (!acc[club.type]) acc[club.type] = [];
    acc[club.type].push(club);
    return acc;
  }, {} as Record<ClubType, ClubInBag[]>);

  const clubOrder: ClubType[] = ['DRIVER', 'FAIRWAY_WOOD', 'HYBRID', 'IRON', 'WEDGE', 'PUTTER'];

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>My Bag</h2>
        <div style={{
          padding: '4px 12px',
          backgroundColor: clubs.length <= 14 ? `${COLORS.success}15` : `${COLORS.error}15`,
          borderRadius: 20,
        }}>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: clubs.length <= 14 ? COLORS.success : COLORS.error,
          }}>
            {clubs.length}/14 Clubs
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {clubOrder.map(type => {
          if (!groupedClubs[type]) return null;
          const config = CLUB_TYPE_CONFIG[type];

          return (
            <div key={type}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 8,
              }}>
                <span>{config.icon}</span>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: COLORS.gray[600],
                  textTransform: 'uppercase',
                }}>
                  {config.label}s
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {groupedClubs[type].map(club => (
                  <button
                    key={club.id}
                    onClick={() => onClubSelect(club)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: selectedClubId === club.id
                        ? `2px solid ${config.color}`
                        : `1px solid ${COLORS.gray[200]}`,
                      backgroundColor: selectedClubId === club.id
                        ? `${config.color}10`
                        : COLORS.white,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: 60,
                    }}
                  >
                    <span style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: COLORS.gray[800],
                    }}>
                      {club.name}
                    </span>
                    <span style={{
                      fontSize: 11,
                      color: COLORS.gray[500],
                    }}>
                      {club.loft}°
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * ClubDetailCard - Full specs and info for a club
 */
interface ClubDetailCardProps {
  club: ClubInBag;
  onEdit?: () => void;
  onRemove?: () => void;
}

const ClubDetailCard: React.FC<ClubDetailCardProps> = ({ club, onEdit, onRemove }) => {
  const config = CLUB_TYPE_CONFIG[club.type];
  const ageMonths = getClubAgeMonths(club.purchaseDate);

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      {/* Header */}
      <div style={{
        padding: 16,
        backgroundColor: config.color,
        color: COLORS.white,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: 24, marginRight: 8 }}>{config.icon}</span>
            <span style={{ fontSize: 20, fontWeight: 700 }}>{club.name}</span>
          </div>
          <span style={{
            fontSize: 12,
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '4px 8px',
            borderRadius: 4,
          }}>
            {ageMonths < 12 ? `${ageMonths}mo` : `${Math.floor(ageMonths / 12)}yr`} old
          </span>
        </div>
        <div style={{ marginTop: 8, opacity: 0.9 }}>
          {club.brand} {club.model}
        </div>
      </div>

      {/* Specs Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1,
        backgroundColor: COLORS.gray[200],
      }}>
        <div style={{ padding: 12, backgroundColor: COLORS.white, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{club.loft}°</div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Loft</div>
        </div>
        <div style={{ padding: 12, backgroundColor: COLORS.white, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{club.lie}°</div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Lie</div>
        </div>
        <div style={{ padding: 12, backgroundColor: COLORS.white, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{club.stats.averageDistance}</div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Avg Dist</div>
        </div>
      </div>

      {/* Shaft Info */}
      <div style={{ padding: 16 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Shaft</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Model</div>
            <div style={{ fontSize: 14 }}>{club.shaft.brand} {club.shaft.model}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Flex</div>
            <div style={{ fontSize: 14 }}>{SHAFT_FLEX_LABELS[club.shaft.flex]}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Weight</div>
            <div style={{ fontSize: 14 }}>{club.shaft.weight}g</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Kick Point</div>
            <div style={{ fontSize: 14 }}>{club.shaft.kickPoint}</div>
          </div>
        </div>
      </div>

      {/* Grip & Notes */}
      <div style={{
        padding: 16,
        borderTop: `1px solid ${COLORS.gray[200]}`,
      }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Grip</div>
          <div style={{ fontSize: 14 }}>{club.grip}</div>
        </div>
        {club.notes && (
          <div>
            <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Notes</div>
            <div style={{ fontSize: 14 }}>{club.notes}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        padding: 16,
        borderTop: `1px solid ${COLORS.gray[200]}`,
        display: 'flex',
        gap: 12,
      }}>
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${COLORS.primary}`,
              backgroundColor: COLORS.white,
              color: COLORS.primary,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Edit Specs
          </button>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
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
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * ClubPerformanceCard - Stats for a single club
 */
interface ClubPerformanceCardProps {
  club: ClubInBag;
}

const ClubPerformanceCard: React.FC<ClubPerformanceCardProps> = ({ club }) => {
  const config = CLUB_TYPE_CONFIG[club.type];
  const missPatternColors = {
    LEFT: COLORS.info,
    RIGHT: COLORS.warning,
    CENTER: COLORS.success,
    VARIED: COLORS.gray[400],
  };

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>{config.icon}</span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{club.name}</span>
        </div>
        <span style={{ fontSize: 12, color: COLORS.gray[500] }}>
          {club.stats.totalShots} shots
        </span>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
      }}>
        <div style={{
          padding: 12,
          backgroundColor: COLORS.gray[50],
          borderRadius: 8,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary }}>
            {club.stats.averageDistance}
          </div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Avg Distance</div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: COLORS.gray[50],
          borderRadius: 8,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.secondary }}>
            ±{club.stats.averageDispersion}
          </div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Dispersion</div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: COLORS.gray[50],
          borderRadius: 8,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {club.stats.avgCarry}
          </div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Avg Carry</div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: COLORS.gray[50],
          borderRadius: 8,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: missPatternColors[club.stats.missPattern],
          }}>
            {club.stats.missPattern}
          </div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>Miss Pattern</div>
        </div>
      </div>

      {/* Accuracy stats if available */}
      {(club.stats.fairwayHitRate || club.stats.girRate) && (
        <div style={{ marginTop: 12 }}>
          {club.stats.fairwayHitRate && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
            }}>
              <span style={{ fontSize: 13, color: COLORS.gray[600] }}>Fairway Hit Rate</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{club.stats.fairwayHitRate}%</span>
            </div>
          )}
          {club.stats.girRate && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
            }}>
              <span style={{ fontSize: 13, color: COLORS.gray[600] }}>GIR Rate</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{club.stats.girRate}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * GappingChart - Visual distance gapping
 */
interface GappingChartProps {
  clubs: ClubInBag[];
}

const GappingChart: React.FC<GappingChartProps> = ({ clubs }) => {
  const gaps = calculateGaps(clubs);
  const sortedClubs = [...clubs]
    .filter(c => c.type !== 'PUTTER')
    .sort((a, b) => b.stats.averageDistance - a.stats.averageDistance);

  const maxDistance = Math.max(...sortedClubs.map(c => c.stats.averageDistance));

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Distance Gapping</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sortedClubs.map((club, index) => {
          const barWidth = (club.stats.averageDistance / maxDistance) * 100;
          const config = CLUB_TYPE_CONFIG[club.type];
          const gap = gaps.find(g => g.club1.id === club.id);

          return (
            <div key={club.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 50,
                  fontSize: 12,
                  fontWeight: 500,
                  color: COLORS.gray[700],
                }}>
                  {club.name}
                </span>
                <div style={{
                  flex: 1,
                  height: 24,
                  backgroundColor: COLORS.gray[100],
                  borderRadius: 4,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${barWidth}%`,
                    height: '100%',
                    backgroundColor: config.color,
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: 8,
                  }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: COLORS.white,
                    }}>
                      {club.stats.averageDistance}y
                    </span>
                  </div>
                </div>
              </div>

              {/* Gap indicator */}
              {gap && index < sortedClubs.length - 1 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: 58,
                  padding: '4px 0',
                }}>
                  <div style={{
                    height: 1,
                    width: 20,
                    backgroundColor: gap.status === 'OPTIMAL'
                      ? COLORS.success
                      : gap.status === 'TOO_LARGE'
                        ? COLORS.error
                        : COLORS.warning,
                  }} />
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: gap.status === 'OPTIMAL'
                      ? COLORS.success
                      : gap.status === 'TOO_LARGE'
                        ? COLORS.error
                        : COLORS.warning,
                    marginLeft: 6,
                  }}>
                    {gap.gapDistance}y gap
                    {gap.status === 'TOO_LARGE' && ' ⚠️'}
                    {gap.status === 'TOO_SMALL' && ' ⚠️'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginTop: 16,
        paddingTop: 12,
        borderTop: `1px solid ${COLORS.gray[200]}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success }} />
          <span style={{ fontSize: 11, color: COLORS.gray[500] }}>Optimal (10-18y)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error }} />
          <span style={{ fontSize: 11, color: COLORS.gray[500] }}>Too Large (&gt;20y)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.warning }} />
          <span style={{ fontSize: 11, color: COLORS.gray[500] }}>Too Small (&lt;8y)</span>
        </div>
      </div>
    </div>
  );
};

/**
 * ConditionDistanceTable - Club distances by conditions
 */
interface ConditionDistanceTableProps {
  club: ClubInBag;
}

const ConditionDistanceTable: React.FC<ConditionDistanceTableProps> = ({ club }) => {
  const conditions = [
    { key: 'normal', label: 'Normal', icon: '☀️' },
    { key: 'cold', label: 'Cold (<50°F)', icon: '❄️' },
    { key: 'hot', label: 'Hot (>85°F)', icon: '🔥' },
    { key: 'altitude', label: 'Altitude', icon: '🏔️' },
    { key: 'headwind', label: 'Headwind', icon: '💨' },
    { key: 'tailwind', label: 'Tailwind', icon: '🌬️' },
  ];

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
        {club.name} - Distance by Conditions
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {conditions.map(({ key, label, icon }) => {
          const distance = club.distancesByCondition[key as keyof typeof club.distancesByCondition];
          const diff = distance - club.distancesByCondition.normal;

          return (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 10,
                backgroundColor: key === 'normal' ? `${COLORS.primary}10` : COLORS.gray[50],
                borderRadius: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{icon}</span>
                <span style={{ fontSize: 13, color: COLORS.gray[700] }}>{label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{distance}y</span>
                {diff !== 0 && (
                  <span style={{
                    fontSize: 11,
                    color: diff > 0 ? COLORS.success : COLORS.error,
                    fontWeight: 500,
                  }}>
                    {diff > 0 ? '+' : ''}{diff}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * EquipmentTimeline - History of gear changes
 */
interface EquipmentTimelineProps {
  history: EquipmentChange[];
}

const EquipmentTimeline: React.FC<EquipmentTimelineProps> = ({ history }) => {
  const typeIcons = {
    ADDED: '➕',
    REMOVED: '➖',
    MODIFIED: '🔧',
    FITTING: '📏',
  };

  const typeColors = {
    ADDED: COLORS.success,
    REMOVED: COLORS.error,
    MODIFIED: COLORS.warning,
    FITTING: COLORS.info,
  };

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Equipment History</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {history.map((change, index) => (
          <div key={change.id} style={{ display: 'flex', gap: 12 }}>
            {/* Timeline */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 32,
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: `${typeColors[change.type]}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 14 }}>{typeIcons[change.type]}</span>
              </div>
              {index < history.length - 1 && (
                <div style={{
                  width: 2,
                  flex: 1,
                  backgroundColor: COLORS.gray[200],
                  minHeight: 24,
                }} />
              )}
            </div>

            {/* Content */}
            <div style={{
              flex: 1,
              paddingBottom: 16,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{change.clubName}</span>
                <span style={{ fontSize: 11, color: COLORS.gray[400] }}>
                  {formatDate(change.date)}
                </span>
              </div>
              <p style={{
                fontSize: 13,
                color: COLORS.gray[600],
                marginTop: 4,
              }}>
                {change.description}
              </p>
              {change.performanceImpact && (
                <div style={{
                  marginTop: 8,
                  padding: 8,
                  backgroundColor: `${COLORS.success}10`,
                  borderRadius: 6,
                  fontSize: 12,
                  color: COLORS.success,
                }}>
                  📈 {change.performanceImpact}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * FittingLogCard - Record of fitting session
 */
interface FittingLogCardProps {
  fitting: FittingSession;
}

const FittingLogCard: React.FC<FittingLogCardProps> = ({ fitting }) => {
  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
      }}>
        <div>
          <span style={{ fontSize: 20 }}>📏</span>
          <span style={{ fontSize: 16, fontWeight: 600, marginLeft: 8 }}>
            {CLUB_TYPE_CONFIG[fitting.clubType].label} Fitting
          </span>
        </div>
        <span style={{ fontSize: 12, color: COLORS.gray[500] }}>
          {formatDate(fitting.date)}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 12 }}>
          <span style={{ color: COLORS.gray[500] }}>Location: </span>
          <span>{fitting.location}</span>
        </div>
        <div style={{ fontSize: 12 }}>
          <span style={{ color: COLORS.gray[500] }}>Fitter: </span>
          <span>{fitting.fitter}</span>
        </div>
      </div>

      {/* Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        marginBottom: 12,
        padding: 12,
        backgroundColor: COLORS.gray[50],
        borderRadius: 8,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{fitting.metricsRecorded.clubSpeed}</div>
          <div style={{ fontSize: 10, color: COLORS.gray[500] }}>Club Speed</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{fitting.metricsRecorded.ballSpeed}</div>
          <div style={{ fontSize: 10, color: COLORS.gray[500] }}>Ball Speed</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{fitting.metricsRecorded.launchAngle}°</div>
          <div style={{ fontSize: 10, color: COLORS.gray[500] }}>Launch</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{fitting.metricsRecorded.spinRate}</div>
          <div style={{ fontSize: 10, color: COLORS.gray[500] }}>Spin</div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray[600], marginBottom: 8 }}>
          Recommendations
        </h4>
        {fitting.recommendations.map((rec, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span style={{ color: COLORS.success }}>•</span>
            <span style={{ fontSize: 13, color: COLORS.gray[700] }}>{rec}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * RecommendationCard - AI equipment recommendation
 */
interface RecommendationCardProps {
  recommendation: EquipmentRecommendation;
  onAction?: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onAction }) => {
  const categoryIcons = {
    UPGRADE: '⬆️',
    GAP_FILL: '🎯',
    FITTING: '📏',
    MAINTENANCE: '🔧',
  };

  const priorityColors = {
    HIGH: COLORS.error,
    MEDIUM: COLORS.warning,
    LOW: COLORS.info,
  };

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${priorityColors[recommendation.priority]}`,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>{categoryIcons[recommendation.category]}</span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{recommendation.title}</span>
        </div>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: priorityColors[recommendation.priority],
          textTransform: 'uppercase',
          padding: '2px 8px',
          backgroundColor: `${priorityColors[recommendation.priority]}15`,
          borderRadius: 4,
        }}>
          {recommendation.priority}
        </span>
      </div>

      <p style={{ fontSize: 14, color: COLORS.gray[600], marginBottom: 8 }}>
        {recommendation.description}
      </p>

      <div style={{
        padding: 10,
        backgroundColor: COLORS.gray[50],
        borderRadius: 6,
        fontSize: 13,
        color: COLORS.gray[700],
        marginBottom: 12,
      }}>
        💡 {recommendation.reason}
      </div>

      {recommendation.suggestedProducts && (
        <div style={{ marginBottom: 12 }}>
          <h4 style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray[600], marginBottom: 6 }}>
            Suggested Products
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {recommendation.suggestedProducts.map((product, index) => (
              <span
                key={index}
                style={{
                  fontSize: 12,
                  padding: '4px 10px',
                  backgroundColor: COLORS.gray[100],
                  borderRadius: 16,
                  color: COLORS.gray[700],
                }}
              >
                {product}
              </span>
            ))}
          </div>
        </div>
      )}

      {onAction && (
        <button
          onClick={onAction}
          style={{
            width: '100%',
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
          Take Action
        </button>
      )}
    </div>
  );
};

/**
 * ShaftFlexCalculator - Determine recommended flex
 */
interface ShaftFlexCalculatorProps {
  onResult?: (flex: ShaftFlex) => void;
}

const ShaftFlexCalculator: React.FC<ShaftFlexCalculatorProps> = ({ onResult }) => {
  const [driverSpeed, setDriverSpeed] = useState<number | ''>('');
  const [result, setResult] = useState<ShaftFlex | null>(null);

  const calculateFlex = () => {
    if (!driverSpeed) return;

    let flex: ShaftFlex;
    if (driverSpeed < 75) flex = 'L';
    else if (driverSpeed < 85) flex = 'A';
    else if (driverSpeed < 95) flex = 'R';
    else if (driverSpeed < 105) flex = 'S';
    else flex = 'X';

    setResult(flex);
    onResult?.(flex);
  };

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Shaft Flex Calculator</h3>
      <p style={{ fontSize: 13, color: COLORS.gray[500], marginBottom: 16 }}>
        Enter your driver club head speed to find your recommended shaft flex
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 500,
          color: COLORS.gray[600],
          marginBottom: 6,
        }}>
          Driver Club Head Speed (mph)
        </label>
        <input
          type="number"
          value={driverSpeed}
          onChange={(e) => setDriverSpeed(e.target.value ? Number(e.target.value) : '')}
          placeholder="e.g., 95"
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${COLORS.gray[300]}`,
            fontSize: 16,
          }}
        />
      </div>

      <button
        onClick={calculateFlex}
        disabled={!driverSpeed}
        style={{
          width: '100%',
          padding: 14,
          borderRadius: 10,
          border: 'none',
          backgroundColor: driverSpeed ? COLORS.primary : COLORS.gray[300],
          color: COLORS.white,
          fontSize: 14,
          fontWeight: 600,
          cursor: driverSpeed ? 'pointer' : 'not-allowed',
          marginBottom: result ? 16 : 0,
        }}
      >
        Calculate Flex
      </button>

      {result && (
        <div style={{
          padding: 16,
          backgroundColor: `${COLORS.success}10`,
          borderRadius: 10,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: COLORS.gray[600], marginBottom: 4 }}>
            Recommended Shaft Flex
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.success }}>
            {result}
          </div>
          <div style={{ fontSize: 16, color: COLORS.gray[700] }}>
            {SHAFT_FLEX_LABELS[result]}
          </div>
        </div>
      )}

      {/* Flex Guide */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${COLORS.gray[200]}` }}>
        <h4 style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray[600], marginBottom: 8 }}>
          Flex Guide
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { flex: 'L', range: '<75 mph', label: 'Ladies' },
            { flex: 'A', range: '75-84 mph', label: 'Senior' },
            { flex: 'R', range: '85-94 mph', label: 'Regular' },
            { flex: 'S', range: '95-104 mph', label: 'Stiff' },
            { flex: 'X', range: '105+ mph', label: 'Extra Stiff' },
          ].map(item => (
            <div
              key={item.flex}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 8,
                backgroundColor: result === item.flex ? `${COLORS.primary}10` : 'transparent',
                borderRadius: 6,
              }}
            >
              <span style={{
                fontSize: 13,
                fontWeight: result === item.flex ? 600 : 400,
                color: COLORS.gray[700],
              }}>
                {item.flex} - {item.label}
              </span>
              <span style={{ fontSize: 12, color: COLORS.gray[500] }}>{item.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * ClubComparisonTool - Compare two clubs
 */
interface ClubComparisonToolProps {
  clubs: ClubInBag[];
}

const ClubComparisonTool: React.FC<ClubComparisonToolProps> = ({ clubs }) => {
  const [club1Id, setClub1Id] = useState<string>('');
  const [club2Id, setClub2Id] = useState<string>('');

  const club1 = clubs.find(c => c.id === club1Id);
  const club2 = clubs.find(c => c.id === club2Id);

  const comparisonMetrics = [
    { key: 'averageDistance', label: 'Avg Distance', unit: 'y' },
    { key: 'avgCarry', label: 'Avg Carry', unit: 'y' },
    { key: 'averageDispersion', label: 'Dispersion', unit: 'y', inverse: true },
    { key: 'totalShots', label: 'Total Shots', unit: '' },
  ];

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Compare Clubs</h3>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select
          value={club1Id}
          onChange={(e) => setClub1Id(e.target.value)}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${COLORS.gray[300]}`,
            fontSize: 14,
          }}
        >
          <option value="">Select Club 1</option>
          {clubs.filter(c => c.type !== 'PUTTER').map(club => (
            <option key={club.id} value={club.id}>{club.name}</option>
          ))}
        </select>

        <span style={{
          display: 'flex',
          alignItems: 'center',
          color: COLORS.gray[400],
          fontWeight: 600,
        }}>
          vs
        </span>

        <select
          value={club2Id}
          onChange={(e) => setClub2Id(e.target.value)}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${COLORS.gray[300]}`,
            fontSize: 14,
          }}
        >
          <option value="">Select Club 2</option>
          {clubs.filter(c => c.type !== 'PUTTER' && c.id !== club1Id).map(club => (
            <option key={club.id} value={club.id}>{club.name}</option>
          ))}
        </select>
      </div>

      {club1 && club2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {comparisonMetrics.map(({ key, label, unit, inverse }) => {
            const val1 = club1.stats[key as keyof ClubStats] as number;
            const val2 = club2.stats[key as keyof ClubStats] as number;
            const winner = inverse
              ? (val1 < val2 ? 1 : val1 > val2 ? 2 : 0)
              : (val1 > val2 ? 1 : val1 < val2 ? 2 : 0);

            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: COLORS.gray[50],
                  borderRadius: 8,
                }}
              >
                <div style={{
                  flex: 1,
                  textAlign: 'center',
                  fontWeight: winner === 1 ? 700 : 400,
                  color: winner === 1 ? COLORS.success : COLORS.gray[700],
                }}>
                  {val1}{unit}
                </div>
                <div style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 12,
                  color: COLORS.gray[500],
                }}>
                  {label}
                </div>
                <div style={{
                  flex: 1,
                  textAlign: 'center',
                  fontWeight: winner === 2 ? 700 : 400,
                  color: winner === 2 ? COLORS.success : COLORS.gray[700],
                }}>
                  {val2}{unit}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN HUB VIEW
// ============================================================================

type EquipmentTabView = 'BAG' | 'PERFORMANCE' | 'HISTORY' | 'RECOMMENDATIONS';

const EquipmentManagerHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EquipmentTabView>('BAG');
  const [clubs] = useState<ClubInBag[]>(MOCK_BAG);
  const [selectedClub, setSelectedClub] = useState<ClubInBag | null>(null);
  const [fittingSessions] = useState<FittingSession[]>(MOCK_FITTING_SESSIONS);
  const [equipmentHistory] = useState<EquipmentChange[]>(MOCK_EQUIPMENT_HISTORY);
  const [recommendations] = useState<EquipmentRecommendation[]>(MOCK_RECOMMENDATIONS);

  const tabs = [
    { id: 'BAG' as EquipmentTabView, label: 'My Bag', icon: '🎒' },
    { id: 'PERFORMANCE' as EquipmentTabView, label: 'Stats', icon: '📊' },
    { id: 'HISTORY' as EquipmentTabView, label: 'History', icon: '📅' },
    { id: 'RECOMMENDATIONS' as EquipmentTabView, label: 'Tips', icon: '💡' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.background,
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: COLORS.white,
        padding: 16,
        borderBottom: `1px solid ${COLORS.gray[200]}`,
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
          Equipment Manager
        </h1>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: 4,
          backgroundColor: COLORS.gray[100],
          padding: 4,
          borderRadius: 10,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: activeTab === tab.id ? COLORS.white : 'transparent',
                color: activeTab === tab.id ? COLORS.primary : COLORS.gray[500],
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span style={{ display: 'block', fontSize: 16 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        {activeTab === 'BAG' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <BagVisualization
              clubs={clubs}
              onClubSelect={setSelectedClub}
              selectedClubId={selectedClub?.id}
            />

            {selectedClub && (
              <ClubDetailCard club={selectedClub} />
            )}

            {selectedClub && selectedClub.type !== 'PUTTER' && (
              <ConditionDistanceTable club={selectedClub} />
            )}

            <GappingChart clubs={clubs} />
          </div>
        )}

        {activeTab === 'PERFORMANCE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ClubComparisonTool clubs={clubs} />

            {clubs.filter(c => c.type !== 'PUTTER').slice(0, 5).map(club => (
              <ClubPerformanceCard key={club.id} club={club} />
            ))}
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <EquipmentTimeline history={equipmentHistory} />

            <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 8 }}>Fitting Sessions</h3>
            {fittingSessions.map(fitting => (
              <FittingLogCard key={fitting.id} fitting={fitting} />
            ))}
          </div>
        )}

        {activeTab === 'RECOMMENDATIONS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ShaftFlexCalculator />

            <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 8 }}>AI Recommendations</h3>
            {recommendations.map(rec => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Usage Example:
 *
 * import { EquipmentManagerHub } from './NewFeatures_Equipment';
 *
 * function App() {
 *   return <EquipmentManagerHub />;
 * }
 *
 * Individual components can also be imported:
 * - BagVisualization - Visual 14-club layout
 * - ClubDetailCard - Full club specifications
 * - ClubPerformanceCard - Stats for a club
 * - GappingChart - Distance gapping visualization
 * - ConditionDistanceTable - Distances by conditions
 * - EquipmentTimeline - History of gear changes
 * - FittingLogCard - Fitting session record
 * - RecommendationCard - AI equipment recommendation
 * - ShaftFlexCalculator - Flex recommendation tool
 * - ClubComparisonTool - Compare two clubs
 */

export {
  // Main Hub
  EquipmentManagerHub,

  // Bag Components
  BagVisualization,
  ClubDetailCard,

  // Performance Components
  ClubPerformanceCard,
  GappingChart,
  ConditionDistanceTable,
  ClubComparisonTool,

  // History Components
  EquipmentTimeline,
  FittingLogCard,

  // Recommendation Components
  RecommendationCard,
  ShaftFlexCalculator,

  // Types
  type ClubInBag,
  type ShaftSpec,
  type ClubStats,
  type FittingSession,
  type EquipmentChange,
  type EquipmentRecommendation,
  type GapAnalysisResult,
  type ClubType,
  type ShaftFlex,
};

export default EquipmentManagerHub;

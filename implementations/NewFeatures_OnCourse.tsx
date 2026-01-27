/**
 * NewFeatures_OnCourse.tsx
 * On-Course Assistant System for MCG Golf App
 *
 * Inspired by: Arccos Caddie, Golflogix, 18Birdies GPS
 *
 * Features:
 * - Live Distance Calculator with adjustments
 * - Smart AI Club Suggestions
 * - Quick Shot Tracking
 * - Hazard Mapping & Safe zones
 * - AI Caddie Tips & Strategy
 */

import React, { useState, useEffect } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface GeoLocation {
  lat: number;
  lng: number;
  elevation: number;
}

interface HoleData {
  number: number;
  par: number;
  yardage: number;
  handicapIndex: number;
  teeLocation: GeoLocation;
  greenCenter: GeoLocation;
  pinLocation: GeoLocation;
  hazards: Hazard[];
  layupTargets: LayupTarget[];
}

interface Hazard {
  id: string;
  type: 'WATER' | 'BUNKER' | 'OB' | 'PENALTY_AREA';
  name: string;
  carryDistance: number;
  clearDistance: number;
  side: 'LEFT' | 'RIGHT' | 'CENTER' | 'FRONT';
  shape: GeoLocation[];
}

interface LayupTarget {
  id: string;
  name: string;
  distance: number;
  location: GeoLocation;
  leavesDistance: number;
  isSafe: boolean;
}

interface PlayingConditions {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  altitude: number;
  humidity: number;
}

interface ClubData {
  name: string;
  avgDistance: number;
  minDistance: number;
  maxDistance: number;
  dispersion: number;
}

interface ClubSuggestion {
  club: string;
  confidence: number;
  adjustedDistance: number;
  reason: string;
  alternates: { club: string; reason: string }[];
}

interface LiveShot {
  id: string;
  holeNumber: number;
  shotNumber: number;
  club: string;
  distance?: number;
  result?: 'FAIRWAY' | 'ROUGH' | 'GREEN' | 'BUNKER' | 'WATER' | 'OB';
  timestamp: Date;
}

interface LiveRoundStats {
  fairwaysHit: number;
  fairwayAttempts: number;
  greensHit: number;
  greenAttempts: number;
  totalPutts: number;
  penalties: number;
}

interface CaddieTip {
  id: string;
  type: 'STRATEGY' | 'WIND' | 'PIN' | 'MENTAL';
  title: string;
  message: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  icon: string;
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
  water: '#3B82F6',
  bunker: '#D4A574',
  safe: '#22C55E',
};

const HAZARD_COLORS = {
  WATER: COLORS.water,
  BUNKER: COLORS.bunker,
  OB: COLORS.error,
  PENALTY_AREA: COLORS.warning,
};

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_HOLE: HoleData = {
  number: 7,
  par: 4,
  yardage: 425,
  handicapIndex: 3,
  teeLocation: { lat: 33.45, lng: -111.94, elevation: 1200 },
  greenCenter: { lat: 33.455, lng: -111.935, elevation: 1210 },
  pinLocation: { lat: 33.4552, lng: -111.9348, elevation: 1210 },
  hazards: [
    {
      id: 'haz-1',
      type: 'WATER',
      name: 'Lake - Left',
      carryDistance: 220,
      clearDistance: 250,
      side: 'LEFT',
      shape: [],
    },
    {
      id: 'haz-2',
      type: 'BUNKER',
      name: 'Fairway Bunker - Right',
      carryDistance: 245,
      clearDistance: 265,
      side: 'RIGHT',
      shape: [],
    },
    {
      id: 'haz-3',
      type: 'BUNKER',
      name: 'Greenside Bunker',
      carryDistance: 410,
      clearDistance: 420,
      side: 'FRONT',
      shape: [],
    },
  ],
  layupTargets: [
    {
      id: 'layup-1',
      name: 'Safe Layup',
      distance: 210,
      location: { lat: 33.452, lng: -111.938, elevation: 1205 },
      leavesDistance: 165,
      isSafe: true,
    },
    {
      id: 'layup-2',
      name: 'Aggressive',
      distance: 255,
      location: { lat: 33.453, lng: -111.937, elevation: 1207 },
      leavesDistance: 120,
      isSafe: false,
    },
  ],
};

const MOCK_CONDITIONS: PlayingConditions = {
  temperature: 72,
  windSpeed: 12,
  windDirection: 'NW',
  altitude: 1200,
  humidity: 35,
};

const MOCK_CLUBS: ClubData[] = [
  { name: 'Driver', avgDistance: 255, minDistance: 240, maxDistance: 275, dispersion: 28 },
  { name: '3 Wood', avgDistance: 230, minDistance: 215, maxDistance: 245, dispersion: 22 },
  { name: '5 Wood', avgDistance: 210, minDistance: 195, maxDistance: 225, dispersion: 20 },
  { name: '4 Hybrid', avgDistance: 195, minDistance: 185, maxDistance: 210, dispersion: 18 },
  { name: '5 Iron', avgDistance: 180, minDistance: 170, maxDistance: 190, dispersion: 16 },
  { name: '6 Iron', avgDistance: 168, minDistance: 160, maxDistance: 178, dispersion: 14 },
  { name: '7 Iron', avgDistance: 155, minDistance: 148, maxDistance: 165, dispersion: 12 },
  { name: '8 Iron', avgDistance: 143, minDistance: 136, maxDistance: 152, dispersion: 10 },
  { name: '9 Iron', avgDistance: 130, minDistance: 124, maxDistance: 138, dispersion: 9 },
  { name: 'PW', avgDistance: 118, minDistance: 112, maxDistance: 126, dispersion: 8 },
  { name: 'GW', avgDistance: 105, minDistance: 98, maxDistance: 112, dispersion: 8 },
  { name: 'SW', avgDistance: 90, minDistance: 82, maxDistance: 98, dispersion: 10 },
  { name: 'LW', avgDistance: 75, minDistance: 65, maxDistance: 85, dispersion: 12 },
];

const MOCK_CADDIE_TIPS: CaddieTip[] = [
  {
    id: 'tip-1',
    type: 'STRATEGY',
    title: 'Play for Position',
    message: "With water left, aim right-center of fairway. A 230-yard shot leaves you a comfortable 9-iron in.",
    priority: 'HIGH',
    icon: '🎯',
  },
  {
    id: 'tip-2',
    type: 'WIND',
    title: 'Wind Adjustment',
    message: 'NW wind at 12 mph - add 8 yards and aim slightly left.',
    priority: 'MEDIUM',
    icon: '💨',
  },
  {
    id: 'tip-3',
    type: 'PIN',
    title: 'Pin Position',
    message: 'Pin is back-left, tucked behind bunker. Safer play is center-right of green.',
    priority: 'MEDIUM',
    icon: '📍',
  },
  {
    id: 'tip-4',
    type: 'MENTAL',
    title: 'Trust Your Swing',
    message: "You've hit this club well today. Commit to your target and make a confident swing.",
    priority: 'LOW',
    icon: '💪',
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const calculateAdjustedDistance = (
  baseDistance: number,
  conditions: PlayingConditions,
  elevationChange: number
): { distance: number; factors: string[] } => {
  const factors: string[] = [];
  let adjustedDistance = baseDistance;

  // Temperature adjustment (1% per 10°F from 70°F)
  const tempDiff = (conditions.temperature - 70) / 10;
  const tempAdj = baseDistance * (tempDiff * 0.01);
  if (Math.abs(tempAdj) >= 1) {
    adjustedDistance += tempAdj;
    factors.push(`Temp: ${tempAdj > 0 ? '+' : ''}${Math.round(tempAdj)}y`);
  }

  // Altitude adjustment (2% per 1000ft above sea level)
  const altAdj = baseDistance * (conditions.altitude / 1000 * 0.02);
  if (altAdj >= 1) {
    adjustedDistance += altAdj;
    factors.push(`Alt: +${Math.round(altAdj)}y`);
  }

  // Elevation change (1y per 3ft of elevation)
  const elevAdj = elevationChange / 3;
  if (Math.abs(elevAdj) >= 1) {
    adjustedDistance += elevAdj;
    factors.push(`Elev: ${elevAdj > 0 ? '+' : ''}${Math.round(elevAdj)}y`);
  }

  // Wind (simplified - 1y per mph headwind/tailwind)
  if (conditions.windSpeed > 5) {
    // Assume straight headwind for simplicity
    const windAdj = conditions.windSpeed * 0.5;
    factors.push(`Wind: ${windAdj > 0 ? '+' : ''}${Math.round(windAdj)}y`);
  }

  return { distance: Math.round(adjustedDistance), factors };
};

const getClubSuggestion = (
  targetDistance: number,
  clubs: ClubData[],
  conditions: PlayingConditions
): ClubSuggestion => {
  // Find best matching club
  const sorted = [...clubs].sort((a, b) => {
    return Math.abs(a.avgDistance - targetDistance) - Math.abs(b.avgDistance - targetDistance);
  });

  const bestClub = sorted[0];
  const confidence = 100 - Math.min(50, Math.abs(bestClub.avgDistance - targetDistance) * 2);

  const alternates = sorted.slice(1, 3).map(club => ({
    club: club.name,
    reason: club.avgDistance > targetDistance ? 'If conditions help' : 'If hitting it flush',
  }));

  return {
    club: bestClub.name,
    confidence: Math.round(confidence),
    adjustedDistance: bestClub.avgDistance,
    reason: `Your ${bestClub.name} averages ${bestClub.avgDistance}y`,
    alternates,
  };
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * DistanceToTargetCard - Main distance display
 */
interface DistanceToTargetCardProps {
  distanceToPin: number;
  distanceToFront: number;
  distanceToBack: number;
  elevationChange: number;
  conditions: PlayingConditions;
}

const DistanceToTargetCard: React.FC<DistanceToTargetCardProps> = ({
  distanceToPin,
  distanceToFront,
  distanceToBack,
  elevationChange,
  conditions,
}) => {
  const { distance: adjustedDistance, factors } = calculateAdjustedDistance(
    distanceToPin,
    conditions,
    elevationChange
  );

  return (
    <div style={{
      backgroundColor: COLORS.secondary,
      borderRadius: 16,
      padding: 20,
      color: COLORS.white,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      {/* Main Distance */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 4 }}>
          To Pin
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1 }}>
          {distanceToPin}
        </div>
        <div style={{ fontSize: 16, opacity: 0.8 }}>yards</div>
      </div>

      {/* Adjusted Distance */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, opacity: 0.9 }}>Plays Like</span>
          <span style={{
            fontSize: 24,
            fontWeight: 700,
            color: COLORS.primary,
          }}>
            {adjustedDistance}y
          </span>
        </div>
        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginTop: 8,
        }}>
          {factors.map((factor, index) => (
            <span
              key={index}
              style={{
                fontSize: 11,
                padding: '2px 8px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 4,
              }}
            >
              {factor}
            </span>
          ))}
        </div>
      </div>

      {/* Front/Back Distances */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{distanceToFront}</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Front</div>
        </div>
        <div style={{
          width: 1,
          backgroundColor: 'rgba(255,255,255,0.2)',
        }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{distanceToBack}</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Back</div>
        </div>
        <div style={{
          width: 1,
          backgroundColor: 'rgba(255,255,255,0.2)',
        }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 600 }}>
            {elevationChange > 0 ? '+' : ''}{elevationChange}ft
          </div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Elevation</div>
        </div>
      </div>
    </div>
  );
};

/**
 * ClubSuggestionWidget - AI club recommendation
 */
interface ClubSuggestionWidgetProps {
  suggestion: ClubSuggestion;
  onSelect?: (club: string) => void;
}

const ClubSuggestionWidget: React.FC<ClubSuggestionWidgetProps> = ({
  suggestion,
  onSelect,
}) => {
  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 20 }}>🤖</span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>AI Club Suggestion</span>
      </div>

      {/* Main Suggestion */}
      <div
        onClick={() => onSelect?.(suggestion.club)}
        style={{
          padding: 16,
          backgroundColor: `${COLORS.primary}15`,
          borderRadius: 12,
          cursor: onSelect ? 'pointer' : 'default',
          marginBottom: 12,
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              color: COLORS.primary,
            }}>
              {suggestion.club}
            </div>
            <div style={{ fontSize: 13, color: COLORS.gray[600], marginTop: 4 }}>
              {suggestion.reason}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              backgroundColor: suggestion.confidence > 80
                ? COLORS.success
                : suggestion.confidence > 60
                  ? COLORS.warning
                  : COLORS.gray[400],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.white,
              fontWeight: 700,
              fontSize: 14,
            }}>
              {suggestion.confidence}%
            </div>
            <div style={{ fontSize: 10, color: COLORS.gray[500], marginTop: 4 }}>
              Confidence
            </div>
          </div>
        </div>
      </div>

      {/* Alternates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 12, color: COLORS.gray[500] }}>Alternatives</span>
        {suggestion.alternates.map((alt, index) => (
          <div
            key={index}
            onClick={() => onSelect?.(alt.club)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 10,
              backgroundColor: COLORS.gray[50],
              borderRadius: 8,
              cursor: onSelect ? 'pointer' : 'default',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600 }}>{alt.club}</span>
            <span style={{ fontSize: 12, color: COLORS.gray[500] }}>{alt.reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * HazardOverlay - Show hazards on course
 */
interface HazardOverlayProps {
  hazards: Hazard[];
  currentDistance: number;
}

const HazardOverlay: React.FC<HazardOverlayProps> = ({ hazards, currentDistance }) => {
  const sortedHazards = [...hazards].sort((a, b) => a.carryDistance - b.carryDistance);

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 20 }}>⚠️</span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Hazards</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sortedHazards.map(hazard => {
          const isInRange = hazard.carryDistance <= currentDistance + 30;

          return (
            <div
              key={hazard.id}
              style={{
                padding: 12,
                backgroundColor: isInRange ? `${HAZARD_COLORS[hazard.type]}10` : COLORS.gray[50],
                borderRadius: 10,
                borderLeft: `4px solid ${HAZARD_COLORS[hazard.type]}`,
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.gray[800],
                  }}>
                    {hazard.name}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: COLORS.gray[500],
                    marginTop: 2,
                  }}>
                    {hazard.side} side
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: HAZARD_COLORS[hazard.type],
                  }}>
                    {hazard.carryDistance}y
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.gray[500] }}>
                    Clear: {hazard.clearDistance}y
                  </div>
                </div>
              </div>

              {isInRange && (
                <div style={{
                  marginTop: 8,
                  padding: 6,
                  backgroundColor: `${COLORS.warning}15`,
                  borderRadius: 4,
                  fontSize: 11,
                  color: COLORS.warning,
                  textAlign: 'center',
                }}>
                  ⚠️ In play - be aware!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * LayupDistanceCalculator - Optimal layup options
 */
interface LayupDistanceCalculatorProps {
  layupTargets: LayupTarget[];
  onSelect?: (target: LayupTarget) => void;
}

const LayupDistanceCalculator: React.FC<LayupDistanceCalculatorProps> = ({
  layupTargets,
  onSelect,
}) => {
  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 20 }}>📏</span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Layup Options</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {layupTargets.map(target => (
          <div
            key={target.id}
            onClick={() => onSelect?.(target)}
            style={{
              padding: 14,
              backgroundColor: target.isSafe ? `${COLORS.success}10` : `${COLORS.warning}10`,
              borderRadius: 12,
              cursor: onSelect ? 'pointer' : 'default',
              border: `2px solid ${target.isSafe ? COLORS.success : COLORS.warning}`,
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{target.name}</span>
                  {target.isSafe && (
                    <span style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      backgroundColor: COLORS.success,
                      color: COLORS.white,
                      borderRadius: 4,
                      fontWeight: 600,
                    }}>
                      SAFE
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 12,
                  color: COLORS.gray[500],
                  marginTop: 2,
                }}>
                  Leaves {target.leavesDistance}y to pin
                </div>
              </div>
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: target.isSafe ? COLORS.success : COLORS.warning,
              }}>
                {target.distance}y
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * QuickShotLogger - Fast shot entry
 */
interface QuickShotLoggerProps {
  clubs: ClubData[];
  onLog: (club: string, result?: string) => void;
}

const QuickShotLogger: React.FC<QuickShotLoggerProps> = ({ clubs, onLog }) => {
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const results = [
    { id: 'FAIRWAY', label: 'Fairway', icon: '✓', color: COLORS.success },
    { id: 'ROUGH', label: 'Rough', icon: '🌿', color: COLORS.warning },
    { id: 'GREEN', label: 'Green', icon: '🎯', color: COLORS.success },
    { id: 'BUNKER', label: 'Bunker', icon: '⏺️', color: COLORS.bunker },
    { id: 'WATER', label: 'Water', icon: '💧', color: COLORS.water },
    { id: 'OB', label: 'OB', icon: '🚫', color: COLORS.error },
  ];

  const handleClubSelect = (club: string) => {
    setSelectedClub(club);
    setShowResults(true);
  };

  const handleResultSelect = (result: string) => {
    if (selectedClub) {
      onLog(selectedClub, result);
      setSelectedClub(null);
      setShowResults(false);
    }
  };

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 20 }}>⛳</span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>
          {showResults ? `Log ${selectedClub} Shot` : 'Quick Shot Log'}
        </span>
      </div>

      {!showResults ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
        }}>
          {clubs.slice(0, 12).map(club => (
            <button
              key={club.name}
              onClick={() => handleClubSelect(club.name)}
              style={{
                padding: 10,
                borderRadius: 8,
                border: `1px solid ${COLORS.gray[200]}`,
                backgroundColor: COLORS.white,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              {club.name}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginBottom: 12,
          }}>
            {results.map(result => (
              <button
                key={result.id}
                onClick={() => handleResultSelect(result.id)}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${result.color}`,
                  backgroundColor: `${result.color}15`,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 16 }}>{result.icon}</span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: result.color,
                }}>
                  {result.label}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setShowResults(false);
              setSelectedClub(null);
            }}
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${COLORS.gray[300]}`,
              backgroundColor: COLORS.white,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * LiveScoringCard - Running score display
 */
interface LiveScoringCardProps {
  currentHole: number;
  currentPar: number;
  holesPlayed: { hole: number; par: number; score: number }[];
}

const LiveScoringCard: React.FC<LiveScoringCardProps> = ({
  currentHole,
  currentPar,
  holesPlayed,
}) => {
  const totalPar = holesPlayed.reduce((sum, h) => sum + h.par, 0) + currentPar;
  const totalScore = holesPlayed.reduce((sum, h) => sum + h.score, 0);
  const thru = holesPlayed.length;
  const scoreToPar = totalScore - (totalPar - currentPar);

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: COLORS.gray[800],
        color: COLORS.white,
      }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Hole {currentHole}</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>Par {currentPar}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Thru {thru}</div>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: scoreToPar < 0
              ? COLORS.birdie
              : scoreToPar > 0
                ? COLORS.error
                : COLORS.white,
          }}>
            {scoreToPar === 0 ? 'E' : scoreToPar > 0 ? `+${scoreToPar}` : scoreToPar}
          </div>
        </div>
      </div>

      {/* Recent Holes */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        padding: 12,
        gap: 8,
      }}>
        {holesPlayed.slice(-6).map(h => {
          const diff = h.score - h.par;
          const bgColor = diff <= -1
            ? COLORS.birdie
            : diff === 0
              ? COLORS.par
              : diff === 1
                ? COLORS.bogey
                : COLORS.double;

          return (
            <div
              key={h.hole}
              style={{
                minWidth: 44,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 10, color: COLORS.gray[500] }}>#{h.hole}</div>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: bgColor,
                color: COLORS.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                margin: '4px auto',
              }}>
                {h.score}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * StatTrackerWidget - Live FIR/GIR/Putts
 */
interface StatTrackerWidgetProps {
  stats: LiveRoundStats;
}

const StatTrackerWidget: React.FC<StatTrackerWidgetProps> = ({ stats }) => {
  const firPct = stats.fairwayAttempts > 0
    ? Math.round((stats.fairwaysHit / stats.fairwayAttempts) * 100)
    : 0;
  const girPct = stats.greenAttempts > 0
    ? Math.round((stats.greensHit / stats.greenAttempts) * 100)
    : 0;

  const statItems = [
    { label: 'FIR', value: `${stats.fairwaysHit}/${stats.fairwayAttempts}`, pct: firPct },
    { label: 'GIR', value: `${stats.greensHit}/${stats.greenAttempts}`, pct: girPct },
    { label: 'Putts', value: stats.totalPutts.toString(), pct: null },
    { label: 'Penalty', value: stats.penalties.toString(), pct: null },
  ];

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
      }}>
        {statItems.map(item => (
          <div key={item.label} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 18,
              fontWeight: 700,
              color: COLORS.gray[800],
            }}>
              {item.value}
            </div>
            {item.pct !== null && (
              <div style={{
                fontSize: 11,
                color: item.pct >= 50 ? COLORS.success : COLORS.gray[500],
              }}>
                {item.pct}%
              </div>
            )}
            <div style={{ fontSize: 10, color: COLORS.gray[500] }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * CaddieTipCard - Individual tip display
 */
interface CaddieTipCardProps {
  tip: CaddieTip;
  onDismiss?: () => void;
}

const CaddieTipCard: React.FC<CaddieTipCardProps> = ({ tip, onDismiss }) => {
  const priorityColors = {
    HIGH: COLORS.primary,
    MEDIUM: COLORS.info,
    LOW: COLORS.gray[500],
  };

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 14,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${priorityColors[tip.priority]}`,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 24 }}>{tip.icon}</span>
          <div>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.gray[800],
            }}>
              {tip.title}
            </div>
            <div style={{
              fontSize: 13,
              color: COLORS.gray[600],
              marginTop: 4,
            }}>
              {tip.message}
            </div>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              padding: 4,
              backgroundColor: 'transparent',
              border: 'none',
              color: COLORS.gray[400],
              cursor: 'pointer',
              fontSize: 18,
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * HoleInfoCard - Quick hole overview
 */
interface HoleInfoCardProps {
  hole: HoleData;
}

const HoleInfoCard: React.FC<HoleInfoCardProps> = ({ hole }) => {
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
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            backgroundColor: COLORS.secondary,
            color: COLORS.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 700,
          }}>
            {hole.number}
          </div>
          <div>
            <div style={{
              fontSize: 20,
              fontWeight: 700,
              color: COLORS.gray[800],
            }}>
              Par {hole.par}
            </div>
            <div style={{ fontSize: 14, color: COLORS.gray[500] }}>
              {hole.yardage} yards
            </div>
          </div>
        </div>
        <div style={{
          textAlign: 'right',
        }}>
          <div style={{
            fontSize: 12,
            color: COLORS.gray[500],
          }}>
            Handicap
          </div>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            color: COLORS.gray[700],
          }}>
            #{hole.handicapIndex}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN HUB VIEW
// ============================================================================

const OnCourseAssistantHub: React.FC = () => {
  const [hole] = useState<HoleData>(MOCK_HOLE);
  const [conditions] = useState<PlayingConditions>(MOCK_CONDITIONS);
  const [clubs] = useState<ClubData[]>(MOCK_CLUBS);
  const [tips, setTips] = useState<CaddieTip[]>(MOCK_CADDIE_TIPS);
  const [shots, setShots] = useState<LiveShot[]>([]);

  // Simulated GPS distance - in real app would use actual GPS
  const distanceToPin = 165;
  const distanceToFront = 152;
  const distanceToBack = 178;
  const elevationChange = -8;

  const clubSuggestion = getClubSuggestion(distanceToPin + 5, clubs, conditions);

  const liveStats: LiveRoundStats = {
    fairwaysHit: 4,
    fairwayAttempts: 6,
    greensHit: 3,
    greenAttempts: 6,
    totalPutts: 11,
    penalties: 0,
  };

  const holesPlayed = [
    { hole: 1, par: 4, score: 5 },
    { hole: 2, par: 4, score: 4 },
    { hole: 3, par: 3, score: 3 },
    { hole: 4, par: 5, score: 6 },
    { hole: 5, par: 4, score: 4 },
    { hole: 6, par: 4, score: 5 },
  ];

  const handleLogShot = (club: string, result?: string) => {
    const newShot: LiveShot = {
      id: `shot-${Date.now()}`,
      holeNumber: hole.number,
      shotNumber: shots.filter(s => s.holeNumber === hole.number).length + 1,
      club,
      result: result as LiveShot['result'],
      timestamp: new Date(),
    };
    setShots([...shots, newShot]);
  };

  const dismissTip = (tipId: string) => {
    setTips(tips.filter(t => t.id !== tipId));
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.background,
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: COLORS.secondary,
        padding: 16,
        paddingTop: 20,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: COLORS.white,
          marginBottom: 16,
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>On-Course</h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 20,
          }}>
            <span>💨</span>
            <span style={{ fontSize: 13 }}>
              {conditions.windSpeed}mph {conditions.windDirection}
            </span>
          </div>
        </div>

        {/* Hole Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
          color: COLORS.white,
          marginBottom: 12,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 700 }}>#{hole.number}</div>
          </div>
          <div style={{
            width: 1,
            height: 40,
            backgroundColor: 'rgba(255,255,255,0.3)',
          }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, opacity: 0.8 }}>Par {hole.par}</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{hole.yardage}y</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Live Scoring */}
        <LiveScoringCard
          currentHole={hole.number}
          currentPar={hole.par}
          holesPlayed={holesPlayed}
        />

        {/* Distance Card */}
        <DistanceToTargetCard
          distanceToPin={distanceToPin}
          distanceToFront={distanceToFront}
          distanceToBack={distanceToBack}
          elevationChange={elevationChange}
          conditions={conditions}
        />

        {/* Club Suggestion */}
        <ClubSuggestionWidget
          suggestion={clubSuggestion}
          onSelect={(club) => console.log('Selected:', club)}
        />

        {/* Stats Tracker */}
        <StatTrackerWidget stats={liveStats} />

        {/* Hazards */}
        <HazardOverlay hazards={hole.hazards} currentDistance={255} />

        {/* Layup Options */}
        <LayupDistanceCalculator layupTargets={hole.layupTargets} />

        {/* Quick Shot Logger */}
        <QuickShotLogger clubs={clubs} onLog={handleLogShot} />

        {/* Caddie Tips */}
        <div>
          <h3 style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 12,
            color: COLORS.gray[700],
          }}>
            🧢 Caddie Tips
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tips.map(tip => (
              <CaddieTipCard
                key={tip.id}
                tip={tip}
                onDismiss={() => dismissTip(tip.id)}
              />
            ))}
          </div>
        </div>
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
 * import { OnCourseAssistantHub } from './NewFeatures_OnCourse';
 *
 * function App() {
 *   return <OnCourseAssistantHub />;
 * }
 *
 * Individual components can also be imported:
 * - DistanceToTargetCard - Main distance display
 * - ClubSuggestionWidget - AI club recommendation
 * - HazardOverlay - Hazard warnings
 * - LayupDistanceCalculator - Layup options
 * - QuickShotLogger - Fast shot entry
 * - LiveScoringCard - Running score
 * - StatTrackerWidget - Live stats
 * - CaddieTipCard - Strategy tips
 * - HoleInfoCard - Hole overview
 */

export {
  // Main Hub
  OnCourseAssistantHub,

  // Distance Components
  DistanceToTargetCard,
  ClubSuggestionWidget,

  // Hazard Components
  HazardOverlay,
  LayupDistanceCalculator,

  // Shot Tracking
  QuickShotLogger,
  LiveScoringCard,
  StatTrackerWidget,

  // Caddie Components
  CaddieTipCard,
  HoleInfoCard,

  // Utility Functions
  calculateAdjustedDistance,
  getClubSuggestion,

  // Types
  type HoleData,
  type Hazard,
  type LayupTarget,
  type PlayingConditions,
  type ClubData,
  type ClubSuggestion,
  type CaddieTip,
  type LiveShot,
  type LiveRoundStats,
};

export default OnCourseAssistantHub;

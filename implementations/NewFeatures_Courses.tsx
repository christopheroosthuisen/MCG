/**
 * NewFeatures_Courses.tsx
 * Course Database & Discovery System for MCG App
 *
 * Features:
 * - Course Search (location, filters, ratings)
 * - Course Details (layout, holes, amenities)
 * - Personal Course History (rounds, stats, favorites)
 * - Course Reviews & Ratings
 */

import React, { useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type CourseType = 'public' | 'private' | 'resort' | 'municipal' | 'semi_private';
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'championship';
type TerrainType = 'links' | 'parkland' | 'desert' | 'mountain' | 'coastal';

interface Course {
  id: string;
  name: string;
  location: {
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
    address: string;
  };
  type: CourseType;
  terrain: TerrainType;
  difficulty: DifficultyLevel;
  holes: number;
  par: number;
  yardage: {
    back: number;
    middle: number;
    forward: number;
  };
  slope: {
    back: number;
    middle: number;
    forward: number;
  };
  rating: {
    back: number;
    middle: number;
    forward: number;
  };
  designer: string;
  yearBuilt: number;
  imageUrl?: string;
  logoUrl?: string;
  website?: string;
  phone?: string;
  amenities: Amenity[];
  greenFees: GreenFee[];
  averageRating: number;
  totalReviews: number;
  isFavorite?: boolean;
}

interface HoleInfo {
  number: number;
  par: number;
  yardage: {
    back: number;
    middle: number;
    forward: number;
  };
  handicap: number;
  description?: string;
  features: string[];
  imageUrl?: string;
}

interface Amenity {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

interface GreenFee {
  type: string;
  weekday: number;
  weekend: number;
  twilight?: number;
  includes: string[];
}

interface CourseReview {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userHandicap?: number;
  rating: number;
  conditionRating: number;
  valueRating: number;
  paceRating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  photos?: string[];
  teesPlayed?: string;
}

interface CourseStats {
  courseId: string;
  roundsPlayed: number;
  bestGross: number;
  bestNet: number;
  averageScore: number;
  fairwaysHit: number;
  greensInReg: number;
  avgPutts: number;
  favoriteHole?: number;
  nemesisHole?: number;
  lastPlayed: string;
  firstPlayed: string;
}

interface TeeTime {
  id: string;
  courseId: string;
  date: string;
  time: string;
  players: number;
  price: number;
  available: boolean;
  holes: 9 | 18;
  cartIncluded: boolean;
}

interface SearchFilters {
  location?: string;
  radius?: number;
  type?: CourseType[];
  terrain?: TerrainType[];
  difficulty?: DifficultyLevel[];
  priceRange?: { min: number; max: number };
  minRating?: number;
  amenities?: string[];
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
};

const COURSE_TYPES: Record<CourseType, string> = {
  public: 'Public',
  private: 'Private',
  resort: 'Resort',
  municipal: 'Municipal',
  semi_private: 'Semi-Private',
};

const TERRAIN_TYPES: Record<TerrainType, { name: string; icon: string }> = {
  links: { name: 'Links', icon: '🌊' },
  parkland: { name: 'Parkland', icon: '🌳' },
  desert: { name: 'Desert', icon: '🏜️' },
  mountain: { name: 'Mountain', icon: '⛰️' },
  coastal: { name: 'Coastal', icon: '🏖️' },
};

const DIFFICULTY_LEVELS: Record<DifficultyLevel, { name: string; color: string }> = {
  beginner: { name: 'Beginner Friendly', color: COLORS.success },
  intermediate: { name: 'Intermediate', color: COLORS.warning },
  advanced: { name: 'Advanced', color: COLORS.primary },
  championship: { name: 'Championship', color: COLORS.error },
};

const COMMON_AMENITIES: Amenity[] = [
  { id: 'range', name: 'Driving Range', icon: '🏌️', available: true },
  { id: 'putting', name: 'Putting Green', icon: '⛳', available: true },
  { id: 'pro_shop', name: 'Pro Shop', icon: '🛒', available: true },
  { id: 'restaurant', name: 'Restaurant', icon: '🍽️', available: true },
  { id: 'bar', name: 'Bar/Lounge', icon: '🍺', available: true },
  { id: 'lessons', name: 'Lessons', icon: '📚', available: true },
  { id: 'rental', name: 'Club Rental', icon: '🎒', available: true },
  { id: 'carts', name: 'Golf Carts', icon: '🚗', available: true },
  { id: 'lockers', name: 'Locker Room', icon: '🚿', available: true },
  { id: 'pool', name: 'Swimming Pool', icon: '🏊', available: false },
];

// ============================================================================
// MOCK DATA
// ============================================================================

const mockCourses: Course[] = [
  {
    id: 'c1',
    name: 'Pebble Beach Golf Links',
    location: {
      city: 'Pebble Beach',
      state: 'CA',
      country: 'USA',
      latitude: 36.5725,
      longitude: -121.9486,
      address: '1700 17 Mile Drive, Pebble Beach, CA 93953',
    },
    type: 'resort',
    terrain: 'coastal',
    difficulty: 'championship',
    holes: 18,
    par: 72,
    yardage: { back: 6828, middle: 6346, forward: 5218 },
    slope: { back: 145, middle: 138, forward: 130 },
    rating: { back: 74.5, middle: 71.8, forward: 69.2 },
    designer: 'Jack Neville & Douglas Grant',
    yearBuilt: 1919,
    amenities: COMMON_AMENITIES,
    greenFees: [
      { type: 'Standard', weekday: 595, weekend: 595, includes: ['Cart', 'Range balls'] },
      { type: 'Replay', weekday: 150, weekend: 150, includes: ['Cart'] },
    ],
    averageRating: 4.9,
    totalReviews: 2847,
    isFavorite: true,
  },
  {
    id: 'c2',
    name: 'Augusta National Golf Club',
    location: {
      city: 'Augusta',
      state: 'GA',
      country: 'USA',
      latitude: 33.5031,
      longitude: -82.0223,
      address: '2604 Washington Rd, Augusta, GA 30904',
    },
    type: 'private',
    terrain: 'parkland',
    difficulty: 'championship',
    holes: 18,
    par: 72,
    yardage: { back: 7510, middle: 7095, forward: 6365 },
    slope: { back: 148, middle: 142, forward: 135 },
    rating: { back: 76.2, middle: 73.8, forward: 70.5 },
    designer: 'Alister MacKenzie & Bobby Jones',
    yearBuilt: 1933,
    amenities: COMMON_AMENITIES,
    greenFees: [],
    averageRating: 5.0,
    totalReviews: 156,
    isFavorite: false,
  },
  {
    id: 'c3',
    name: 'Torrey Pines (South)',
    location: {
      city: 'La Jolla',
      state: 'CA',
      country: 'USA',
      latitude: 32.8988,
      longitude: -117.2527,
      address: '11480 N Torrey Pines Rd, La Jolla, CA 92037',
    },
    type: 'municipal',
    terrain: 'coastal',
    difficulty: 'advanced',
    holes: 18,
    par: 72,
    yardage: { back: 7258, middle: 6698, forward: 5547 },
    slope: { back: 138, middle: 132, forward: 124 },
    rating: { back: 74.6, middle: 71.9, forward: 68.8 },
    designer: 'William Bell & Rees Jones',
    yearBuilt: 1957,
    amenities: COMMON_AMENITIES.map(a => ({ ...a, available: a.id !== 'pool' })),
    greenFees: [
      { type: 'San Diego Resident', weekday: 68, weekend: 93, twilight: 45, includes: [] },
      { type: 'Non-Resident', weekday: 202, weekend: 253, twilight: 135, includes: [] },
    ],
    averageRating: 4.7,
    totalReviews: 3421,
    isFavorite: true,
  },
];

const mockHoles: HoleInfo[] = [
  { number: 1, par: 4, yardage: { back: 380, middle: 352, forward: 310 }, handicap: 8, features: ['Dogleg right', 'Bunkers left'], description: 'A welcoming start with a generous fairway' },
  { number: 2, par: 5, yardage: { back: 502, middle: 475, forward: 425 }, handicap: 14, features: ['Reachable par 5', 'Water right'], description: 'Risk-reward hole with water guarding the green' },
  { number: 3, par: 3, yardage: { back: 172, middle: 155, forward: 130 }, handicap: 16, features: ['Elevated green', 'Deep bunkers'], description: 'Iconic par 3 over the cliffs' },
  { number: 4, par: 4, yardage: { back: 448, middle: 415, forward: 365 }, handicap: 2, features: ['Narrow fairway', 'OB left'], description: 'The #1 handicap hole requiring precision' },
  { number: 5, par: 3, yardage: { back: 190, middle: 168, forward: 142 }, handicap: 12, features: ['Peninsula green', 'Wind exposed'], description: 'One of the most photographed holes' },
  { number: 6, par: 5, yardage: { back: 545, middle: 512, forward: 468 }, handicap: 10, features: ['Uphill', 'Tiered green'], description: 'Long par 5 playing uphill to a challenging green' },
  { number: 7, par: 4, yardage: { back: 395, middle: 368, forward: 325 }, handicap: 6, features: ['Blind tee shot', 'Ocean views'], description: 'Dramatic views but demanding accuracy' },
  { number: 8, par: 4, yardage: { back: 428, middle: 398, forward: 350 }, handicap: 4, features: ['Cliff edge', 'Bunkers right'], description: 'Play safe or challenge the cliffs' },
  { number: 9, par: 4, yardage: { back: 410, middle: 382, forward: 338 }, handicap: 18, features: ['Downhill', 'Wide fairway'], description: 'Finish the front nine with style' },
];

const mockReviews: CourseReview[] = [
  {
    id: 'r1',
    courseId: 'c1',
    userId: 'u1',
    userName: 'John D.',
    userHandicap: 12,
    rating: 5,
    conditionRating: 5,
    valueRating: 3,
    paceRating: 4,
    title: 'Bucket list experience!',
    content: 'Finally crossed this off my list. Worth every penny for the views and history alone. Course was immaculate.',
    date: '2025-06-15',
    helpful: 24,
    teesPlayed: 'Middle',
  },
  {
    id: 'r2',
    courseId: 'c1',
    userId: 'u2',
    userName: 'Sarah M.',
    userHandicap: 18,
    rating: 5,
    conditionRating: 5,
    valueRating: 4,
    paceRating: 5,
    title: 'Once in a lifetime',
    content: 'The staff made us feel like we belonged. Pace was perfect and conditions were beyond expectations.',
    date: '2025-05-22',
    helpful: 18,
    teesPlayed: 'Forward',
  },
];

const mockCourseStats: CourseStats = {
  courseId: 'c1',
  roundsPlayed: 8,
  bestGross: 82,
  bestNet: 68,
  averageScore: 88.5,
  fairwaysHit: 54,
  greensInReg: 28,
  avgPutts: 34.2,
  favoriteHole: 7,
  nemesisHole: 4,
  lastPlayed: '2025-06-15',
  firstPlayed: '2022-03-20',
};

const mockTeeTimes: TeeTime[] = [
  { id: 'tt1', courseId: 'c3', date: '2025-07-20', time: '07:00', players: 4, price: 202, available: true, holes: 18, cartIncluded: false },
  { id: 'tt2', courseId: 'c3', date: '2025-07-20', time: '07:12', players: 4, price: 202, available: true, holes: 18, cartIncluded: false },
  { id: 'tt3', courseId: 'c3', date: '2025-07-20', time: '07:24', players: 4, price: 202, available: false, holes: 18, cartIncluded: false },
  { id: 'tt4', courseId: 'c3', date: '2025-07-20', time: '07:36', players: 4, price: 202, available: true, holes: 18, cartIncluded: false },
  { id: 'tt5', courseId: 'c3', date: '2025-07-20', time: '14:00', players: 4, price: 135, available: true, holes: 18, cartIncluded: false },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

const formatDistance = (miles: number): string => {
  return miles < 1 ? `${Math.round(miles * 5280)} ft` : `${miles.toFixed(1)} mi`;
};

const getStarDisplay = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return '★'.repeat(fullStars) + (hasHalf ? '½' : '') + '☆'.repeat(5 - fullStars - (hasHalf ? 1 : 0));
};

// ============================================================================
// COMPONENTS - Course Search
// ============================================================================

interface CourseSearchProps {
  onSearch: (query: string) => void;
  onFilter: () => void;
}

const CourseSearch: React.FC<CourseSearchProps> = ({ onSearch, onFilter }) => {
  const [query, setQuery] = useState('');

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: '0 16px',
        border: `1px solid ${COLORS.mediumGray}`,
      }}>
        <span style={{ marginRight: 8 }}>🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch(query)}
          placeholder="Search courses..."
          style={{
            flex: 1,
            padding: '12px 0',
            border: 'none',
            fontSize: 16,
            outline: 'none',
          }}
        />
      </div>
      <button
        onClick={onFilter}
        style={{
          padding: '12px 16px',
          borderRadius: 12,
          border: 'none',
          backgroundColor: COLORS.secondary,
          color: COLORS.white,
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        ⚙️
      </button>
    </div>
  );
};

// Course Filter Panel Component
interface CourseFilterPanelProps {
  filters: SearchFilters;
  onUpdate: (filters: SearchFilters) => void;
  onClose: () => void;
}

const CourseFilterPanel: React.FC<CourseFilterPanelProps> = ({ filters, onUpdate, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const toggleArrayFilter = <T extends string>(
    key: keyof SearchFilters,
    value: T,
    currentArray: T[] = []
  ) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    setLocalFilters({ ...localFilters, [key]: newArray });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end',
    }}>
      <div style={{
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        padding: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Filter Courses</h3>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: COLORS.lightGray,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Course Type */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Course Type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(Object.keys(COURSE_TYPES) as CourseType[]).map((type) => (
              <button
                key={type}
                onClick={() => toggleArrayFilter('type', type, localFilters.type)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: localFilters.type?.includes(type)
                    ? `2px solid ${COLORS.primary}`
                    : `1px solid ${COLORS.mediumGray}`,
                  backgroundColor: localFilters.type?.includes(type)
                    ? `${COLORS.primary}15`
                    : COLORS.white,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {COURSE_TYPES[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Terrain */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Terrain</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(Object.keys(TERRAIN_TYPES) as TerrainType[]).map((terrain) => (
              <button
                key={terrain}
                onClick={() => toggleArrayFilter('terrain', terrain, localFilters.terrain)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: localFilters.terrain?.includes(terrain)
                    ? `2px solid ${COLORS.primary}`
                    : `1px solid ${COLORS.mediumGray}`,
                  backgroundColor: localFilters.terrain?.includes(terrain)
                    ? `${COLORS.primary}15`
                    : COLORS.white,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {TERRAIN_TYPES[terrain].icon} {TERRAIN_TYPES[terrain].name}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Difficulty</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(Object.keys(DIFFICULTY_LEVELS) as DifficultyLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => toggleArrayFilter('difficulty', level, localFilters.difficulty)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: localFilters.difficulty?.includes(level)
                    ? `2px solid ${DIFFICULTY_LEVELS[level].color}`
                    : `1px solid ${COLORS.mediumGray}`,
                  backgroundColor: localFilters.difficulty?.includes(level)
                    ? `${DIFFICULTY_LEVELS[level].color}15`
                    : COLORS.white,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {DIFFICULTY_LEVELS[level].name}
              </button>
            ))}
          </div>
        </div>

        {/* Minimum Rating */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            Minimum Rating: {localFilters.minRating || 0}★
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={localFilters.minRating || 0}
            onChange={(e) => setLocalFilters({ ...localFilters, minRating: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button
            onClick={() => setLocalFilters({})}
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
            Clear All
          </button>
          <button
            onClick={() => {
              onUpdate(localFilters);
              onClose();
            }}
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
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// Course Card Component
interface CourseCardProps {
  course: Course;
  distance?: number;
  onSelect: (course: Course) => void;
  onFavorite: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, distance, onSelect, onFavorite }) => {
  return (
    <div
      onClick={() => onSelect(course)}
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {/* Image */}
      <div style={{
        height: 140,
        backgroundColor: COLORS.secondary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <span style={{ fontSize: 48 }}>⛳</span>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(course.id);
          }}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.9)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {course.isFavorite ? '❤️' : '🤍'}
        </button>

        {/* Type Badge */}
        <span style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          padding: '4px 12px',
          borderRadius: 12,
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: COLORS.white,
          fontSize: 12,
          fontWeight: 600,
        }}>
          {COURSE_TYPES[course.type]}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{course.name}</div>
            <div style={{ fontSize: 14, color: COLORS.gray, marginTop: 2 }}>
              {course.location.city}, {course.location.state}
            </div>
          </div>
          {distance !== undefined && (
            <span style={{
              padding: '4px 8px',
              backgroundColor: COLORS.lightGray,
              borderRadius: 8,
              fontSize: 12,
              color: COLORS.gray,
            }}>
              {formatDistance(distance)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <span style={{ color: COLORS.gold, fontSize: 16 }}>
            {getStarDisplay(course.averageRating)}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{course.averageRating.toFixed(1)}</span>
          <span style={{ fontSize: 12, color: COLORS.gray }}>({course.totalReviews})</span>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'flex',
          gap: 16,
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px solid ${COLORS.lightGray}`,
        }}>
          <div>
            <div style={{ fontSize: 12, color: COLORS.gray }}>Par</div>
            <div style={{ fontWeight: 600 }}>{course.par}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: COLORS.gray }}>Yards</div>
            <div style={{ fontWeight: 600 }}>{course.yardage.back.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: COLORS.gray }}>Slope</div>
            <div style={{ fontWeight: 600 }}>{course.slope.back}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: 16 }}>{TERRAIN_TYPES[course.terrain].icon}</span>
          </div>
        </div>

        {/* Green Fees */}
        {course.greenFees.length > 0 && (
          <div style={{
            marginTop: 12,
            padding: 8,
            backgroundColor: `${COLORS.success}15`,
            borderRadius: 8,
            fontSize: 14,
          }}>
            From <strong style={{ color: COLORS.success }}>
              {formatCurrency(Math.min(...course.greenFees.map(f => f.weekday)))}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Course Details
// ============================================================================

interface CourseDetailHeaderProps {
  course: Course;
  onBack: () => void;
  onFavorite: () => void;
}

const CourseDetailHeader: React.FC<CourseDetailHeaderProps> = ({ course, onBack, onFavorite }) => {
  return (
    <div>
      {/* Hero Image */}
      <div style={{
        height: 200,
        backgroundColor: COLORS.secondary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <span style={{ fontSize: 64 }}>⛳</span>

        {/* Back Button */}
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: 48,
            left: 16,
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: COLORS.white,
            fontSize: 20,
            cursor: 'pointer',
          }}
        >
          ←
        </button>

        {/* Favorite Button */}
        <button
          onClick={onFavorite}
          style={{
            position: 'absolute',
            top: 48,
            right: 16,
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.9)',
            cursor: 'pointer',
          }}
        >
          {course.isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Course Info */}
      <div style={{ padding: 16, backgroundColor: COLORS.white }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <span style={{
            padding: '4px 8px',
            borderRadius: 4,
            backgroundColor: `${DIFFICULTY_LEVELS[course.difficulty].color}20`,
            color: DIFFICULTY_LEVELS[course.difficulty].color,
            fontSize: 12,
            fontWeight: 600,
          }}>
            {DIFFICULTY_LEVELS[course.difficulty].name}
          </span>
          <span style={{
            padding: '4px 8px',
            borderRadius: 4,
            backgroundColor: COLORS.lightGray,
            fontSize: 12,
          }}>
            {TERRAIN_TYPES[course.terrain].icon} {TERRAIN_TYPES[course.terrain].name}
          </span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{course.name}</h1>
        <div style={{ fontSize: 14, color: COLORS.gray }}>
          {course.location.city}, {course.location.state}
        </div>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <span style={{ color: COLORS.gold, fontSize: 18 }}>
            {getStarDisplay(course.averageRating)}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{course.averageRating.toFixed(1)}</span>
          <span style={{ fontSize: 14, color: COLORS.gray }}>({course.totalReviews} reviews)</span>
        </div>

        {/* Designer */}
        <div style={{ marginTop: 12, fontSize: 14 }}>
          Designed by <strong>{course.designer}</strong> ({course.yearBuilt})
        </div>
      </div>
    </div>
  );
};

// Course Stats Card Component
interface CourseStatsCardProps {
  course: Course;
}

const CourseStatsCard: React.FC<CourseStatsCardProps> = ({ course }) => {
  const [selectedTee, setSelectedTee] = useState<'back' | 'middle' | 'forward'>('middle');

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Course Statistics</h3>

      {/* Tee Selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['back', 'middle', 'forward'] as const).map((tee) => (
          <button
            key={tee}
            onClick={() => setSelectedTee(tee)}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              border: selectedTee === tee
                ? `2px solid ${COLORS.primary}`
                : `1px solid ${COLORS.mediumGray}`,
              backgroundColor: selectedTee === tee ? `${COLORS.primary}15` : COLORS.white,
              fontWeight: selectedTee === tee ? 600 : 400,
              textTransform: 'capitalize',
              cursor: 'pointer',
            }}
          >
            {tee}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <div style={{ textAlign: 'center', padding: 12, backgroundColor: COLORS.lightGray, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: COLORS.gray }}>Yardage</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{course.yardage[selectedTee].toLocaleString()}</div>
        </div>
        <div style={{ textAlign: 'center', padding: 12, backgroundColor: COLORS.lightGray, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: COLORS.gray }}>Rating</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{course.rating[selectedTee]}</div>
        </div>
        <div style={{ textAlign: 'center', padding: 12, backgroundColor: COLORS.lightGray, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: COLORS.gray }}>Slope</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{course.slope[selectedTee]}</div>
        </div>
      </div>

      <div style={{
        marginTop: 12,
        padding: 12,
        backgroundColor: `${COLORS.secondary}15`,
        borderRadius: 8,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 14, color: COLORS.gray }}>Par</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.secondary }}>{course.par}</div>
      </div>
    </div>
  );
};

// Hole Card Component
interface HoleCardProps {
  hole: HoleInfo;
  selectedTee: 'back' | 'middle' | 'forward';
}

const HoleCard: React.FC<HoleCardProps> = ({ hole, selectedTee }) => {
  const getParColor = (par: number) => {
    if (par === 3) return COLORS.error;
    if (par === 4) return COLORS.primary;
    return COLORS.success;
  };

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      display: 'flex',
      gap: 12,
    }}>
      {/* Hole Number */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: getParColor(hole.par),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: COLORS.white,
        fontWeight: 700,
        fontSize: 20,
      }}>
        {hole.number}
      </div>

      {/* Hole Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 700 }}>Par {hole.par}</span>
            <span style={{ color: COLORS.gray, marginLeft: 8 }}>
              HCP {hole.handicap}
            </span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            {hole.yardage[selectedTee]} yds
          </div>
        </div>

        {hole.description && (
          <div style={{ fontSize: 13, color: COLORS.gray, marginTop: 4 }}>
            {hole.description}
          </div>
        )}

        {/* Features */}
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {hole.features.map((feature, index) => (
            <span
              key={index}
              style={{
                padding: '2px 8px',
                backgroundColor: COLORS.lightGray,
                borderRadius: 4,
                fontSize: 11,
                color: COLORS.gray,
              }}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Amenities List Component
interface AmenitiesListProps {
  amenities: Amenity[];
}

const AmenitiesList: React.FC<AmenitiesListProps> = ({ amenities }) => {
  const available = amenities.filter(a => a.available);
  const unavailable = amenities.filter(a => !a.available);

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Amenities</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {available.map((amenity) => (
          <div
            key={amenity.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 10,
              backgroundColor: COLORS.lightGray,
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>{amenity.icon}</span>
            <span style={{ fontSize: 14 }}>{amenity.name}</span>
          </div>
        ))}
      </div>

      {unavailable.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.lightGray}` }}>
          <div style={{ fontSize: 12, color: COLORS.gray, marginBottom: 8 }}>Not Available</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {unavailable.map((amenity) => (
              <span
                key={amenity.id}
                style={{
                  padding: '4px 8px',
                  backgroundColor: COLORS.lightGray,
                  borderRadius: 4,
                  fontSize: 12,
                  color: COLORS.gray,
                  opacity: 0.6,
                }}
              >
                {amenity.icon} {amenity.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Green Fees Card Component
interface GreenFeesCardProps {
  fees: GreenFee[];
  onBookTeeTime: () => void;
}

const GreenFeesCard: React.FC<GreenFeesCardProps> = ({ fees, onBookTeeTime }) => {
  if (fees.length === 0) {
    return (
      <div style={{
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 24,
        textAlign: 'center',
      }}>
        <span style={{ fontSize: 32 }}>🔒</span>
        <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>Private Club</div>
        <div style={{ fontSize: 14, color: COLORS.gray, marginTop: 4 }}>
          Member or guest access only
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Green Fees</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {fees.map((fee, index) => (
          <div
            key={index}
            style={{
              padding: 12,
              backgroundColor: COLORS.lightGray,
              borderRadius: 8,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{fee.type}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, color: COLORS.gray }}>Weekday</div>
                <div style={{ fontWeight: 700 }}>{formatCurrency(fee.weekday)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: COLORS.gray }}>Weekend</div>
                <div style={{ fontWeight: 700 }}>{formatCurrency(fee.weekend)}</div>
              </div>
              {fee.twilight && (
                <div>
                  <div style={{ fontSize: 12, color: COLORS.gray }}>Twilight</div>
                  <div style={{ fontWeight: 700 }}>{formatCurrency(fee.twilight)}</div>
                </div>
              )}
            </div>
            {fee.includes.length > 0 && (
              <div style={{ fontSize: 12, color: COLORS.success, marginTop: 8 }}>
                Includes: {fee.includes.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onBookTeeTime}
        style={{
          width: '100%',
          marginTop: 16,
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
        Book Tee Time
      </button>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Course History & Stats
// ============================================================================

interface PersonalCourseStatsProps {
  stats: CourseStats;
  courseName: string;
}

const PersonalCourseStats: React.FC<PersonalCourseStatsProps> = ({ stats, courseName }) => {
  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Your Stats at {courseName}</h3>
      <div style={{ fontSize: 14, color: COLORS.gray, marginBottom: 16 }}>
        {stats.roundsPlayed} rounds played
      </div>

      {/* Score Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <div style={{ textAlign: 'center', padding: 12, backgroundColor: `${COLORS.success}20`, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: COLORS.gray }}>Best Gross</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.success }}>{stats.bestGross}</div>
        </div>
        <div style={{ textAlign: 'center', padding: 12, backgroundColor: `${COLORS.primary}20`, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: COLORS.gray }}>Best Net</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary }}>{stats.bestNet}</div>
        </div>
        <div style={{ textAlign: 'center', padding: 12, backgroundColor: COLORS.lightGray, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: COLORS.gray }}>Average</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.averageScore.toFixed(1)}</div>
        </div>
      </div>

      {/* Performance Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: COLORS.gray }}>FIR %</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{stats.fairwaysHit}%</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: COLORS.gray }}>GIR %</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{stats.greensInReg}%</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: COLORS.gray }}>Avg Putts</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{stats.avgPutts.toFixed(1)}</div>
        </div>
      </div>

      {/* Favorite & Nemesis Holes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        marginTop: 16,
        paddingTop: 16,
        borderTop: `1px solid ${COLORS.lightGray}`,
      }}>
        {stats.favoriteHole && (
          <div style={{
            padding: 12,
            backgroundColor: `${COLORS.success}15`,
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, color: COLORS.gray }}>Favorite Hole</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.success }}>#{stats.favoriteHole}</div>
          </div>
        )}
        {stats.nemesisHole && (
          <div style={{
            padding: 12,
            backgroundColor: `${COLORS.error}15`,
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, color: COLORS.gray }}>Nemesis Hole</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.error }}>#{stats.nemesisHole}</div>
          </div>
        )}
      </div>

      {/* Last Played */}
      <div style={{
        marginTop: 16,
        fontSize: 13,
        color: COLORS.gray,
        textAlign: 'center',
      }}>
        Last played: {new Date(stats.lastPlayed).toLocaleDateString()}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Reviews
// ============================================================================

interface ReviewCardProps {
  review: CourseReview;
  onHelpful: (reviewId: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onHelpful }) => {
  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 600 }}>{review.userName}</div>
          {review.userHandicap && (
            <div style={{ fontSize: 12, color: COLORS.gray }}>
              Handicap: {review.userHandicap}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: COLORS.gold }}>{getStarDisplay(review.rating)}</div>
          <div style={{ fontSize: 12, color: COLORS.gray }}>
            {new Date(review.date).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Title & Content */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{review.title}</div>
        <div style={{ fontSize: 14, color: COLORS.gray, lineHeight: 1.5 }}>
          {review.content}
        </div>
      </div>

      {/* Rating Breakdown */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginTop: 12,
        paddingTop: 12,
        borderTop: `1px solid ${COLORS.lightGray}`,
      }}>
        <div style={{ fontSize: 12 }}>
          <span style={{ color: COLORS.gray }}>Condition:</span> {review.conditionRating}/5
        </div>
        <div style={{ fontSize: 12 }}>
          <span style={{ color: COLORS.gray }}>Value:</span> {review.valueRating}/5
        </div>
        <div style={{ fontSize: 12 }}>
          <span style={{ color: COLORS.gray }}>Pace:</span> {review.paceRating}/5
        </div>
      </div>

      {/* Helpful Button */}
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {review.teesPlayed && (
          <span style={{ fontSize: 12, color: COLORS.gray }}>
            Played: {review.teesPlayed} tees
          </span>
        )}
        <button
          onClick={() => onHelpful(review.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 12px',
            borderRadius: 16,
            border: `1px solid ${COLORS.mediumGray}`,
            backgroundColor: COLORS.white,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          👍 Helpful ({review.helpful})
        </button>
      </div>
    </div>
  );
};

// Write Review Component
interface WriteReviewProps {
  courseName: string;
  onSubmit: (review: Partial<CourseReview>) => void;
  onCancel: () => void;
}

const WriteReview: React.FC<WriteReviewProps> = ({ courseName, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [conditionRating, setConditionRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [paceRating, setPaceRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const RatingInput = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              border: 'none',
              backgroundColor: value >= star ? COLORS.gold : COLORS.lightGray,
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Write a Review</h3>
      <div style={{ fontSize: 14, color: COLORS.gray, marginBottom: 16 }}>{courseName}</div>

      <RatingInput label="Overall Rating *" value={rating} onChange={setRating} />
      <RatingInput label="Course Condition" value={conditionRating} onChange={setConditionRating} />
      <RatingInput label="Value for Money" value={valueRating} onChange={setValueRating} />
      <RatingInput label="Pace of Play" value={paceRating} onChange={setPaceRating} />

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
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
          Review *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience..."
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

      <div style={{ display: 'flex', gap: 12 }}>
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
          onClick={() => onSubmit({ rating, conditionRating, valueRating, paceRating, title, content })}
          disabled={!rating || !title || !content}
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 8,
            border: 'none',
            backgroundColor: (!rating || !title || !content) ? COLORS.mediumGray : COLORS.primary,
            color: COLORS.white,
            fontSize: 16,
            fontWeight: 600,
            cursor: (!rating || !title || !content) ? 'not-allowed' : 'pointer',
          }}
        >
          Submit Review
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Tee Times
// ============================================================================

interface TeeTimePickerProps {
  teeTimes: TeeTime[];
  onSelect: (teeTime: TeeTime) => void;
}

const TeeTimePicker: React.FC<TeeTimePickerProps> = ({ teeTimes, onSelect }) => {
  const [selectedDate, setSelectedDate] = useState<string>(teeTimes[0]?.date || '');

  const morningTimes = teeTimes.filter(tt => tt.date === selectedDate && parseInt(tt.time) < 12);
  const afternoonTimes = teeTimes.filter(tt => tt.date === selectedDate && parseInt(tt.time) >= 12);

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Available Tee Times</h3>

      {/* Date Selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
        {Array.from(new Set(teeTimes.map(tt => tt.date))).map((date) => {
          const dateObj = new Date(date);
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                border: selectedDate === date
                  ? `2px solid ${COLORS.primary}`
                  : `1px solid ${COLORS.mediumGray}`,
                backgroundColor: selectedDate === date ? `${COLORS.primary}15` : COLORS.white,
                minWidth: 70,
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 12, color: COLORS.gray }}>
                {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {dateObj.getDate()}
              </div>
            </button>
          );
        })}
      </div>

      {/* Morning Times */}
      {morningTimes.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.gray, marginBottom: 8 }}>
            ☀️ Morning
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {morningTimes.map((teeTime) => (
              <button
                key={teeTime.id}
                onClick={() => teeTime.available && onSelect(teeTime)}
                disabled={!teeTime.available}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${teeTime.available ? COLORS.primary : COLORS.mediumGray}`,
                  backgroundColor: teeTime.available ? COLORS.white : COLORS.lightGray,
                  opacity: teeTime.available ? 1 : 0.5,
                  cursor: teeTime.available ? 'pointer' : 'not-allowed',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 600 }}>{teeTime.time}</div>
                <div style={{ fontSize: 12, color: COLORS.success }}>{formatCurrency(teeTime.price)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Afternoon Times */}
      {afternoonTimes.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.gray, marginBottom: 8 }}>
            🌅 Afternoon
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {afternoonTimes.map((teeTime) => (
              <button
                key={teeTime.id}
                onClick={() => teeTime.available && onSelect(teeTime)}
                disabled={!teeTime.available}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${teeTime.available ? COLORS.secondary : COLORS.mediumGray}`,
                  backgroundColor: teeTime.available ? COLORS.white : COLORS.lightGray,
                  opacity: teeTime.available ? 1 : 0.5,
                  cursor: teeTime.available ? 'pointer' : 'not-allowed',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 600 }}>{teeTime.time}</div>
                <div style={{ fontSize: 12, color: COLORS.success }}>{formatCurrency(teeTime.price)}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN HUB COMPONENT
// ============================================================================

type CourseTab = 'search' | 'favorites' | 'played' | 'nearby';

const CourseHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CourseTab>('search');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [detailTab, setDetailTab] = useState<'info' | 'holes' | 'reviews' | 'book'>('info');

  const tabs: { id: CourseTab; label: string; icon: string }[] = [
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'favorites', label: 'Favorites', icon: '❤️' },
    { id: 'played', label: 'Played', icon: '✅' },
    { id: 'nearby', label: 'Nearby', icon: '📍' },
  ];

  if (selectedCourse) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: COLORS.lightGray,
        paddingBottom: 80,
      }}>
        <CourseDetailHeader
          course={selectedCourse}
          onBack={() => setSelectedCourse(null)}
          onFavorite={() => console.log('Toggle favorite')}
        />

        {/* Detail Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: COLORS.white,
          borderBottom: `1px solid ${COLORS.lightGray}`,
        }}>
          {(['info', 'holes', 'reviews', 'book'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDetailTab(tab)}
              style={{
                flex: 1,
                padding: 12,
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: detailTab === tab ? `2px solid ${COLORS.primary}` : '2px solid transparent',
                color: detailTab === tab ? COLORS.primary : COLORS.gray,
                fontWeight: detailTab === tab ? 600 : 400,
                textTransform: 'capitalize',
                cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ padding: 16 }}>
          {detailTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CourseStatsCard course={selectedCourse} />
              <PersonalCourseStats stats={mockCourseStats} courseName={selectedCourse.name} />
              <AmenitiesList amenities={selectedCourse.amenities} />
              <GreenFeesCard
                fees={selectedCourse.greenFees}
                onBookTeeTime={() => setDetailTab('book')}
              />
            </div>
          )}

          {detailTab === 'holes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mockHoles.map((hole) => (
                <HoleCard key={hole.number} hole={hole} selectedTee="middle" />
              ))}
            </div>
          )}

          {detailTab === 'reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button
                style={{
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
                ✍️ Write a Review
              </button>

              {mockReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onHelpful={(id) => console.log('Helpful:', id)}
                />
              ))}
            </div>
          )}

          {detailTab === 'book' && (
            <TeeTimePicker
              teeTimes={mockTeeTimes}
              onSelect={(tt) => console.log('Selected tee time:', tt)}
            />
          )}
        </div>
      </div>
    );
  }

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
        <div style={{ fontSize: 24, fontWeight: 700 }}>Courses</div>
        <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
          Discover and track your rounds
        </div>

        <div style={{ marginTop: 16 }}>
          <CourseSearch
            onSearch={(q) => console.log('Search:', q)}
            onFilter={() => setShowFilters(true)}
          />
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
            }}
          >
            <span>{tab.icon}</span>
            <span style={{ fontSize: 12 }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mockCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              distance={Math.random() * 50}
              onSelect={setSelectedCourse}
              onFavorite={(id) => console.log('Favorite:', id)}
            />
          ))}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <CourseFilterPanel
          filters={filters}
          onUpdate={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

const CourseExample: React.FC = () => {
  return <CourseHub />;
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Types
  type Course,
  type HoleInfo,
  type Amenity,
  type GreenFee,
  type CourseReview,
  type CourseStats,
  type TeeTime,
  type SearchFilters,
  type CourseType,
  type TerrainType,
  type DifficultyLevel,

  // Search Components
  CourseSearch,
  CourseFilterPanel,
  CourseCard,

  // Detail Components
  CourseDetailHeader,
  CourseStatsCard,
  HoleCard,
  AmenitiesList,
  GreenFeesCard,

  // Stats Components
  PersonalCourseStats,

  // Review Components
  ReviewCard,
  WriteReview,

  // Booking Components
  TeeTimePicker,

  // Main Hub
  CourseHub,

  // Example
  CourseExample,
};

export default CourseHub;

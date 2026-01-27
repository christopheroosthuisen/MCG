/**
 * NewFeatures_Coaching.tsx
 * Coach Connection System for MCG Golf App
 *
 * Inspired by: Skillest, CoachNow, V1 Golf Academy
 *
 * Features:
 * - Find & Browse Coaches
 * - Lesson Booking System
 * - Data Sharing with Coach
 * - Lesson Notes & Assigned Drills
 */

import React, { useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type LessonType = 'IN_PERSON' | 'VIDEO_REVIEW' | 'PLAYING_LESSON' | 'PRACTICE_SESSION';
type Specialty = 'FULL_SWING' | 'SHORT_GAME' | 'PUTTING' | 'COURSE_MANAGEMENT' | 'JUNIOR' | 'BEGINNER';
type CertificationLevel = 'PGA' | 'LPGA' | 'TPI' | 'TRACKMAN' | 'OTHER';

interface Coach {
  id: string;
  name: string;
  title: string;
  facility: string;
  location: string;
  distance: number;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  bio: string;
  specialties: Specialty[];
  certifications: CertificationLevel[];
  yearsExperience: number;
  profileImageUrl?: string;
  lessonTypes: LessonType[];
  availability: AvailabilitySlot[];
}

interface AvailabilitySlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  lessonType: LessonType;
  isBooked: boolean;
}

interface Lesson {
  id: string;
  coachId: string;
  coachName: string;
  date: Date;
  startTime: string;
  duration: number;
  type: LessonType;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  location?: string;
  notes?: string;
  price: number;
}

interface CoachReview {
  id: string;
  coachId: string;
  studentName: string;
  rating: number;
  date: Date;
  comment: string;
  lessonType: LessonType;
  wouldRecommend: boolean;
}

interface LessonNote {
  id: string;
  lessonId: string;
  date: Date;
  coachName: string;
  title: string;
  content: string;
  keyTakeaways: string[];
  focusAreas: string[];
}

interface AssignedDrill {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  videoUrl?: string;
  reps: number;
  frequency: string;
  dueDate: Date;
  isCompleted: boolean;
  completedDate?: Date;
  notes?: string;
}

interface SharedVideo {
  id: string;
  title: string;
  uploadDate: Date;
  status: 'PENDING' | 'REVIEWED' | 'FEEDBACK_GIVEN';
  coachFeedback?: string;
  thumbnailUrl?: string;
}

interface DataSharingPreference {
  category: string;
  isEnabled: boolean;
  lastShared?: Date;
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

const LESSON_TYPE_CONFIG: Record<LessonType, { label: string; icon: string; color: string }> = {
  IN_PERSON: { label: 'In-Person', icon: '🏌️', color: COLORS.primary },
  VIDEO_REVIEW: { label: 'Video Review', icon: '📹', color: COLORS.info },
  PLAYING_LESSON: { label: 'Playing Lesson', icon: '⛳', color: COLORS.success },
  PRACTICE_SESSION: { label: 'Practice', icon: '🎯', color: COLORS.warning },
};

const SPECIALTY_LABELS: Record<Specialty, string> = {
  FULL_SWING: 'Full Swing',
  SHORT_GAME: 'Short Game',
  PUTTING: 'Putting',
  COURSE_MANAGEMENT: 'Course Management',
  JUNIOR: 'Junior Golf',
  BEGINNER: 'Beginner Friendly',
};

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_COACHES: Coach[] = [
  {
    id: 'coach-1',
    name: 'Mike Anderson',
    title: 'PGA Professional',
    facility: 'TPC Scottsdale',
    location: 'Scottsdale, AZ',
    distance: 4.2,
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 150,
    bio: 'PGA Professional with 15 years of teaching experience. TrackMan Master certified with a focus on data-driven instruction.',
    specialties: ['FULL_SWING', 'COURSE_MANAGEMENT'],
    certifications: ['PGA', 'TRACKMAN'],
    yearsExperience: 15,
    lessonTypes: ['IN_PERSON', 'VIDEO_REVIEW', 'PLAYING_LESSON'],
    availability: [],
  },
  {
    id: 'coach-2',
    name: 'Sarah Thompson',
    title: 'LPGA Teaching Professional',
    facility: 'Grayhawk Golf Club',
    location: 'Scottsdale, AZ',
    distance: 6.8,
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 125,
    bio: 'Former LPGA Tour player specializing in short game and putting. Helped numerous students lower their handicaps by 5+ strokes.',
    specialties: ['SHORT_GAME', 'PUTTING', 'BEGINNER'],
    certifications: ['LPGA', 'TPI'],
    yearsExperience: 12,
    lessonTypes: ['IN_PERSON', 'VIDEO_REVIEW', 'PRACTICE_SESSION'],
    availability: [],
  },
  {
    id: 'coach-3',
    name: 'James Lee',
    title: 'Golf Performance Coach',
    facility: 'Arizona Golf Academy',
    location: 'Phoenix, AZ',
    distance: 12.5,
    rating: 4.7,
    reviewCount: 64,
    hourlyRate: 100,
    bio: 'TPI certified golf fitness and performance specialist. Combining physical conditioning with swing mechanics.',
    specialties: ['FULL_SWING', 'JUNIOR'],
    certifications: ['TPI', 'OTHER'],
    yearsExperience: 8,
    lessonTypes: ['IN_PERSON', 'PRACTICE_SESSION'],
    availability: [],
  },
];

const MOCK_REVIEWS: CoachReview[] = [
  {
    id: 'review-1',
    coachId: 'coach-1',
    studentName: 'John D.',
    rating: 5,
    date: new Date('2024-03-15'),
    comment: 'Mike transformed my swing in just 3 lessons. His use of TrackMan data helped me understand exactly what I needed to work on.',
    lessonType: 'IN_PERSON',
    wouldRecommend: true,
  },
  {
    id: 'review-2',
    coachId: 'coach-1',
    studentName: 'Emily R.',
    rating: 5,
    date: new Date('2024-03-10'),
    comment: 'Best instructor in the area. Very patient and explains things clearly. Dropped 5 strokes in 2 months!',
    lessonType: 'IN_PERSON',
    wouldRecommend: true,
  },
];

const MOCK_LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    coachId: 'coach-1',
    coachName: 'Mike Anderson',
    date: new Date('2024-03-25'),
    startTime: '10:00 AM',
    duration: 60,
    type: 'IN_PERSON',
    status: 'UPCOMING',
    location: 'TPC Scottsdale Practice Facility',
    price: 150,
  },
  {
    id: 'lesson-2',
    coachId: 'coach-1',
    coachName: 'Mike Anderson',
    date: new Date('2024-03-18'),
    startTime: '2:00 PM',
    duration: 60,
    type: 'IN_PERSON',
    status: 'COMPLETED',
    location: 'TPC Scottsdale Practice Facility',
    notes: 'Worked on takeaway and transition',
    price: 150,
  },
];

const MOCK_LESSON_NOTES: LessonNote[] = [
  {
    id: 'note-1',
    lessonId: 'lesson-2',
    date: new Date('2024-03-18'),
    coachName: 'Mike Anderson',
    title: 'Takeaway & Transition Focus',
    content: 'Today we focused on improving your takeaway path and creating a better transition move. Your tendency to get the club too far inside has been causing inconsistent contact. We worked on the feeling of keeping your hands in front of your chest during the takeaway.',
    keyTakeaways: [
      'Keep hands in front of chest during takeaway',
      'Feel the club going straight back first 12 inches',
      'Pause at the top before starting down',
    ],
    focusAreas: ['Takeaway', 'Transition', 'Tempo'],
  },
];

const MOCK_DRILLS: AssignedDrill[] = [
  {
    id: 'drill-1',
    lessonId: 'lesson-2',
    title: 'Alignment Stick Takeaway',
    description: 'Place alignment stick along toe line. Practice takeaway keeping clubhead outside the stick for first 12 inches.',
    reps: 20,
    frequency: 'Daily',
    dueDate: new Date('2024-03-25'),
    isCompleted: false,
  },
  {
    id: 'drill-2',
    lessonId: 'lesson-2',
    title: 'Pause at Top Drill',
    description: 'Make full swings with a 2-second pause at the top of backswing. Focus on feeling the weight shift before arms move down.',
    reps: 15,
    frequency: 'Every practice session',
    dueDate: new Date('2024-03-25'),
    isCompleted: true,
    completedDate: new Date('2024-03-20'),
  },
];

const MOCK_SHARED_VIDEOS: SharedVideo[] = [
  {
    id: 'video-1',
    title: 'Driver DTL - 3/19',
    uploadDate: new Date('2024-03-19'),
    status: 'FEEDBACK_GIVEN',
    coachFeedback: 'Great improvement on the takeaway! Notice how your hands are staying in front. Keep working on that transition pause.',
  },
  {
    id: 'video-2',
    title: 'Iron Face On - 3/21',
    uploadDate: new Date('2024-03-21'),
    status: 'PENDING',
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * CoachProfileCard - Coach bio and info
 */
interface CoachProfileCardProps {
  coach: Coach;
  onBook?: () => void;
  onViewProfile?: () => void;
}

const CoachProfileCard: React.FC<CoachProfileCardProps> = ({ coach, onBook, onViewProfile }) => {
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
        display: 'flex',
        gap: 12,
      }}>
        {/* Avatar */}
        <div style={{
          width: 70,
          height: 70,
          borderRadius: '50%',
          backgroundColor: COLORS.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          color: COLORS.white,
          fontWeight: 700,
        }}>
          {coach.name.split(' ').map(n => n[0]).join('')}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{coach.name}</h3>
              <div style={{ fontSize: 13, color: COLORS.gray[600] }}>{coach.title}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <span style={{ color: COLORS.warning }}>★</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{coach.rating}</span>
                <span style={{ fontSize: 12, color: COLORS.gray[500] }}>({coach.reviewCount})</span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 8,
            fontSize: 12,
            color: COLORS.gray[500],
          }}>
            <span>📍 {coach.facility}</span>
            <span>•</span>
            <span>{coach.distance} mi</span>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div style={{
        padding: '8px 16px',
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
      }}>
        {coach.certifications.map(cert => (
          <span
            key={cert}
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '4px 10px',
              backgroundColor: COLORS.secondary,
              color: COLORS.white,
              borderRadius: 12,
            }}
          >
            {cert}
          </span>
        ))}
        <span style={{
          fontSize: 10,
          padding: '4px 10px',
          backgroundColor: COLORS.gray[100],
          color: COLORS.gray[600],
          borderRadius: 12,
        }}>
          {coach.yearsExperience} yrs exp
        </span>
      </div>

      {/* Specialties */}
      <div style={{
        padding: '8px 16px',
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
      }}>
        {coach.specialties.map(specialty => (
          <span
            key={specialty}
            style={{
              fontSize: 11,
              padding: '4px 10px',
              backgroundColor: `${COLORS.primary}15`,
              color: COLORS.primary,
              borderRadius: 12,
            }}
          >
            {SPECIALTY_LABELS[specialty]}
          </span>
        ))}
      </div>

      {/* Lesson Types */}
      <div style={{
        padding: '8px 16px',
        borderTop: `1px solid ${COLORS.gray[200]}`,
        display: 'flex',
        gap: 8,
      }}>
        {coach.lessonTypes.map(type => {
          const config = LESSON_TYPE_CONFIG[type];
          return (
            <span
              key={type}
              style={{
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: COLORS.gray[600],
              }}
            >
              <span>{config.icon}</span>
              {config.label}
            </span>
          );
        })}
      </div>

      {/* Price & Actions */}
      <div style={{
        padding: 16,
        borderTop: `1px solid ${COLORS.gray[200]}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <span style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary }}>
            ${coach.hourlyRate}
          </span>
          <span style={{ fontSize: 12, color: COLORS.gray[500] }}>/hour</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {onViewProfile && (
            <button
              onClick={onViewProfile}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: `1px solid ${COLORS.gray[300]}`,
                backgroundColor: COLORS.white,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              View Profile
            </button>
          )}
          {onBook && (
            <button
              onClick={onBook}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: COLORS.primary,
                color: COLORS.white,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Book Lesson
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * CoachSearchFilter - Search and filter coaches
 */
interface CoachSearchFilterProps {
  onFilter: (filters: { specialty?: Specialty; maxPrice?: number; maxDistance?: number }) => void;
}

const CoachSearchFilter: React.FC<CoachSearchFilterProps> = ({ onFilter }) => {
  const [specialty, setSpecialty] = useState<Specialty | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [maxDistance, setMaxDistance] = useState<number | ''>('');

  const handleApply = () => {
    onFilter({
      specialty: specialty || undefined,
      maxPrice: maxPrice || undefined,
      maxDistance: maxDistance || undefined,
    });
  };

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Find Your Coach</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: COLORS.gray[600], display: 'block', marginBottom: 4 }}>
            Specialty
          </label>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value as Specialty)}
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${COLORS.gray[300]}`,
              fontSize: 14,
            }}
          >
            <option value="">All Specialties</option>
            {Object.entries(SPECIALTY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: COLORS.gray[600], display: 'block', marginBottom: 4 }}>
              Max Price/hr
            </label>
            <input
              type="number"
              placeholder="$150"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 8,
                border: `1px solid ${COLORS.gray[300]}`,
                fontSize: 14,
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: COLORS.gray[600], display: 'block', marginBottom: 4 }}>
              Max Distance
            </label>
            <input
              type="number"
              placeholder="25 mi"
              value={maxDistance}
              onChange={(e) => setMaxDistance(e.target.value ? Number(e.target.value) : '')}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 8,
                border: `1px solid ${COLORS.gray[300]}`,
                fontSize: 14,
              }}
            />
          </div>
        </div>

        <button
          onClick={handleApply}
          style={{
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
          Search Coaches
        </button>
      </div>
    </div>
  );
};

/**
 * ReviewCard - Individual coach review
 */
interface ReviewCardProps {
  review: CoachReview;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 10,
      padding: 14,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{review.studentName}</div>
          <div style={{ fontSize: 11, color: COLORS.gray[500] }}>
            {LESSON_TYPE_CONFIG[review.lessonType].icon} {LESSON_TYPE_CONFIG[review.lessonType].label}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              style={{ color: star <= review.rating ? COLORS.warning : COLORS.gray[300] }}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 13, color: COLORS.gray[600], lineHeight: 1.5 }}>
        {review.comment}
      </p>
      <div style={{
        marginTop: 8,
        fontSize: 11,
        color: COLORS.gray[400],
      }}>
        {formatDate(review.date)}
      </div>
    </div>
  );
};

/**
 * LessonCard - Upcoming/past lesson display
 */
interface LessonCardProps {
  lesson: Lesson;
  onCancel?: () => void;
  onReschedule?: () => void;
  onViewNotes?: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onCancel, onReschedule, onViewNotes }) => {
  const config = LESSON_TYPE_CONFIG[lesson.type];
  const isUpcoming = lesson.status === 'UPCOMING';

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${isUpcoming ? COLORS.primary : COLORS.gray[300]}`,
    }}>
      <div style={{ padding: 16 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4,
            }}>
              <span style={{ fontSize: 20 }}>{config.icon}</span>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{config.label}</span>
            </div>
            <div style={{ fontSize: 14, color: COLORS.gray[600] }}>
              with {lesson.coachName}
            </div>
          </div>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 10px',
            backgroundColor: isUpcoming ? `${COLORS.success}15` : COLORS.gray[100],
            color: isUpcoming ? COLORS.success : COLORS.gray[500],
            borderRadius: 12,
          }}>
            {lesson.status}
          </span>
        </div>

        <div style={{
          marginTop: 12,
          padding: 12,
          backgroundColor: COLORS.gray[50],
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Date & Time</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {formatDateShort(lesson.date)} at {lesson.startTime}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: COLORS.gray[500] }}>Duration</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{lesson.duration} min</div>
          </div>
        </div>

        {lesson.location && (
          <div style={{
            marginTop: 8,
            fontSize: 13,
            color: COLORS.gray[600],
          }}>
            📍 {lesson.location}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        padding: 12,
        borderTop: `1px solid ${COLORS.gray[200]}`,
        display: 'flex',
        gap: 8,
      }}>
        {isUpcoming ? (
          <>
            {onReschedule && (
              <button
                onClick={onReschedule}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.gray[300]}`,
                  backgroundColor: COLORS.white,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Reschedule
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.error}`,
                  backgroundColor: COLORS.white,
                  color: COLORS.error,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            )}
          </>
        ) : (
          onViewNotes && (
            <button
              onClick={onViewNotes}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                border: 'none',
                backgroundColor: COLORS.primary,
                color: COLORS.white,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View Notes & Drills
            </button>
          )
        )}
      </div>
    </div>
  );
};

/**
 * LessonNotesViewer - Post-lesson notes display
 */
interface LessonNotesViewerProps {
  note: LessonNote;
}

const LessonNotesViewer: React.FC<LessonNotesViewerProps> = ({ note }) => {
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
        marginBottom: 16,
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{note.title}</h3>
          <div style={{ fontSize: 13, color: COLORS.gray[500], marginTop: 4 }}>
            {note.coachName} • {formatDate(note.date)}
          </div>
        </div>
        <span style={{ fontSize: 24 }}>📝</span>
      </div>

      <p style={{
        fontSize: 14,
        color: COLORS.gray[700],
        lineHeight: 1.6,
        marginBottom: 16,
      }}>
        {note.content}
      </p>

      {/* Key Takeaways */}
      <div style={{
        padding: 12,
        backgroundColor: `${COLORS.success}10`,
        borderRadius: 8,
        marginBottom: 12,
      }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
          ✅ Key Takeaways
        </h4>
        {note.keyTakeaways.map((takeaway, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 6,
              fontSize: 13,
              color: COLORS.gray[700],
            }}
          >
            <span>•</span>
            <span>{takeaway}</span>
          </div>
        ))}
      </div>

      {/* Focus Areas */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {note.focusAreas.map(area => (
          <span
            key={area}
            style={{
              fontSize: 12,
              padding: '4px 12px',
              backgroundColor: `${COLORS.primary}15`,
              color: COLORS.primary,
              borderRadius: 16,
            }}
          >
            {area}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * AssignedDrillCard - Homework drill card
 */
interface AssignedDrillCardProps {
  drill: AssignedDrill;
  onComplete?: () => void;
}

const AssignedDrillCard: React.FC<AssignedDrillCardProps> = ({ drill, onComplete }) => {
  const daysUntilDue = Math.ceil(
    (drill.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysUntilDue < 0 && !drill.isCompleted;

  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      opacity: drill.isCompleted ? 0.7 : 1,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              backgroundColor: drill.isCompleted ? COLORS.success : COLORS.gray[200],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {drill.isCompleted && <span style={{ color: COLORS.white, fontSize: 14 }}>✓</span>}
            </div>
            <span style={{
              fontSize: 16,
              fontWeight: 600,
              textDecoration: drill.isCompleted ? 'line-through' : 'none',
              color: drill.isCompleted ? COLORS.gray[500] : COLORS.gray[800],
            }}>
              {drill.title}
            </span>
          </div>
          <p style={{
            fontSize: 13,
            color: COLORS.gray[600],
            marginTop: 8,
            marginLeft: 32,
          }}>
            {drill.description}
          </p>
        </div>
      </div>

      <div style={{
        marginTop: 12,
        marginLeft: 32,
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontSize: 12,
          padding: '4px 10px',
          backgroundColor: COLORS.gray[100],
          borderRadius: 12,
        }}>
          {drill.reps} reps
        </span>
        <span style={{
          fontSize: 12,
          padding: '4px 10px',
          backgroundColor: COLORS.gray[100],
          borderRadius: 12,
        }}>
          {drill.frequency}
        </span>
        <span style={{
          fontSize: 12,
          padding: '4px 10px',
          backgroundColor: isOverdue
            ? `${COLORS.error}15`
            : drill.isCompleted
              ? `${COLORS.success}15`
              : COLORS.gray[100],
          color: isOverdue
            ? COLORS.error
            : drill.isCompleted
              ? COLORS.success
              : COLORS.gray[600],
          borderRadius: 12,
        }}>
          {drill.isCompleted
            ? `Done ${formatDate(drill.completedDate!)}`
            : isOverdue
              ? 'Overdue'
              : `Due ${formatDate(drill.dueDate)}`}
        </span>
      </div>

      {!drill.isCompleted && onComplete && (
        <button
          onClick={onComplete}
          style={{
            marginTop: 12,
            marginLeft: 32,
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: COLORS.success,
            color: COLORS.white,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Mark Complete
        </button>
      )}
    </div>
  );
};

/**
 * VideoShareQueue - Videos pending coach review
 */
interface VideoShareQueueProps {
  videos: SharedVideo[];
  onUpload?: () => void;
}

const VideoShareQueue: React.FC<VideoShareQueueProps> = ({ videos, onUpload }) => {
  const statusColors = {
    PENDING: COLORS.warning,
    REVIEWED: COLORS.info,
    FEEDBACK_GIVEN: COLORS.success,
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
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Shared Videos</h3>
        {onUpload && (
          <button
            onClick={onUpload}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: `1px solid ${COLORS.primary}`,
              backgroundColor: COLORS.white,
              color: COLORS.primary,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Upload
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {videos.map(video => (
          <div
            key={video.id}
            style={{
              padding: 12,
              backgroundColor: COLORS.gray[50],
              borderRadius: 8,
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>📹</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{video.title}</span>
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '3px 8px',
                backgroundColor: `${statusColors[video.status]}15`,
                color: statusColors[video.status],
                borderRadius: 10,
              }}>
                {video.status.replace('_', ' ')}
              </span>
            </div>

            {video.coachFeedback && (
              <div style={{
                marginTop: 8,
                padding: 10,
                backgroundColor: COLORS.white,
                borderRadius: 6,
                borderLeft: `3px solid ${COLORS.success}`,
              }}>
                <div style={{ fontSize: 11, color: COLORS.gray[500], marginBottom: 4 }}>
                  Coach Feedback:
                </div>
                <div style={{ fontSize: 13, color: COLORS.gray[700] }}>
                  {video.coachFeedback}
                </div>
              </div>
            )}

            <div style={{
              fontSize: 11,
              color: COLORS.gray[400],
              marginTop: 8,
            }}>
              Uploaded {formatDate(video.uploadDate)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * DataSharingDashboard - Control what data coach can see
 */
interface DataSharingDashboardProps {
  preferences: DataSharingPreference[];
  onToggle: (category: string) => void;
}

const DataSharingDashboard: React.FC<DataSharingDashboardProps> = ({ preferences, onToggle }) => {
  return (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Data Sharing</h3>
      <p style={{ fontSize: 13, color: COLORS.gray[500], marginBottom: 16 }}>
        Control what data your coach can see to help with your instruction.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {preferences.map(pref => (
          <div
            key={pref.category}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 12,
              backgroundColor: COLORS.gray[50],
              borderRadius: 8,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{pref.category}</div>
              {pref.lastShared && (
                <div style={{ fontSize: 11, color: COLORS.gray[500] }}>
                  Last shared: {formatDate(pref.lastShared)}
                </div>
              )}
            </div>
            <button
              onClick={() => onToggle(pref.category)}
              style={{
                width: 50,
                height: 28,
                borderRadius: 14,
                border: 'none',
                backgroundColor: pref.isEnabled ? COLORS.success : COLORS.gray[300],
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.2s',
              }}
            >
              <div style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                backgroundColor: COLORS.white,
                position: 'absolute',
                top: 3,
                left: pref.isEnabled ? 25 : 3,
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN HUB VIEW
// ============================================================================

type CoachingTabView = 'FIND' | 'MY_COACH' | 'LESSONS' | 'NOTES';

const CoachConnectionHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CoachingTabView>('FIND');
  const [coaches] = useState<Coach[]>(MOCK_COACHES);
  const [myCoach] = useState<Coach | null>(MOCK_COACHES[0]);
  const [lessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [lessonNotes] = useState<LessonNote[]>(MOCK_LESSON_NOTES);
  const [drills, setDrills] = useState<AssignedDrill[]>(MOCK_DRILLS);
  const [sharedVideos] = useState<SharedVideo[]>(MOCK_SHARED_VIDEOS);
  const [reviews] = useState<CoachReview[]>(MOCK_REVIEWS);

  const tabs = [
    { id: 'FIND' as CoachingTabView, label: 'Find', icon: '🔍' },
    { id: 'MY_COACH' as CoachingTabView, label: 'My Coach', icon: '👨‍🏫' },
    { id: 'LESSONS' as CoachingTabView, label: 'Lessons', icon: '📅' },
    { id: 'NOTES' as CoachingTabView, label: 'Notes', icon: '📝' },
  ];

  const handleCompleteDrill = (drillId: string) => {
    setDrills(drills.map(d =>
      d.id === drillId
        ? { ...d, isCompleted: true, completedDate: new Date() }
        : d
    ));
  };

  const dataPreferences: DataSharingPreference[] = [
    { category: 'Round Scores', isEnabled: true, lastShared: new Date() },
    { category: 'Swing Videos', isEnabled: true, lastShared: new Date() },
    { category: 'Practice Stats', isEnabled: true },
    { category: 'Equipment Info', isEnabled: false },
    { category: 'Fitness Data', isEnabled: false },
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
          Coach Connection
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
        {activeTab === 'FIND' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <CoachSearchFilter onFilter={(filters) => console.log(filters)} />

            <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Coaches Near You</h2>
            {coaches.map(coach => (
              <CoachProfileCard
                key={coach.id}
                coach={coach}
                onBook={() => console.log('Book with', coach.name)}
              />
            ))}
          </div>
        )}

        {activeTab === 'MY_COACH' && myCoach && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <CoachProfileCard coach={myCoach} />

            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Recent Reviews</h3>
            {reviews.slice(0, 3).map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}

            <DataSharingDashboard
              preferences={dataPreferences}
              onToggle={(cat) => console.log('Toggle:', cat)}
            />
          </div>
        )}

        {activeTab === 'LESSONS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Upcoming</h2>
            {lessons.filter(l => l.status === 'UPCOMING').map(lesson => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}

            <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Past Lessons</h2>
            {lessons.filter(l => l.status === 'COMPLETED').map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onViewNotes={() => setActiveTab('NOTES')}
              />
            ))}
          </div>
        )}

        {activeTab === 'NOTES' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {lessonNotes.map(note => (
              <LessonNotesViewer key={note.id} note={note} />
            ))}

            <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>
              Assigned Drills ({drills.filter(d => !d.isCompleted).length} remaining)
            </h2>
            {drills.map(drill => (
              <AssignedDrillCard
                key={drill.id}
                drill={drill}
                onComplete={() => handleCompleteDrill(drill.id)}
              />
            ))}

            <VideoShareQueue
              videos={sharedVideos}
              onUpload={() => console.log('Upload video')}
            />
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
 * import { CoachConnectionHub } from './NewFeatures_Coaching';
 *
 * function App() {
 *   return <CoachConnectionHub />;
 * }
 */

export {
  // Main Hub
  CoachConnectionHub,

  // Coach Components
  CoachProfileCard,
  CoachSearchFilter,
  ReviewCard,

  // Lesson Components
  LessonCard,
  LessonNotesViewer,
  AssignedDrillCard,

  // Data Sharing Components
  VideoShareQueue,
  DataSharingDashboard,

  // Types
  type Coach,
  type Lesson,
  type LessonNote,
  type AssignedDrill,
  type SharedVideo,
  type CoachReview,
  type LessonType,
  type Specialty,
};

export default CoachConnectionHub;

/**
 * NewFeatures_Onboarding.tsx
 * Premium Onboarding System for MCG App
 *
 * Features:
 * - Welcome Carousel with app highlights
 * - Personalized Setup Wizard
 * - Golf Profile Configuration
 * - Feature Tour & Tips
 */

import React, { useState, useRef, useEffect } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type OnboardingStep =
  | 'welcome'
  | 'profile'
  | 'golf_info'
  | 'goals'
  | 'preferences'
  | 'permissions'
  | 'tour'
  | 'complete';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional';
type PlayFrequency = 'rarely' | 'monthly' | 'weekly' | 'daily';
type HandPreference = 'right' | 'left';

interface OnboardingData {
  // Profile
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;

  // Golf Info
  handicap?: number;
  skillLevel: SkillLevel;
  handPreference: HandPreference;
  playFrequency: PlayFrequency;
  yearsPlaying: number;

  // Goals
  goals: string[];
  targetHandicap?: number;
  focusAreas: string[];

  // Preferences
  distanceUnit: 'yards' | 'meters';
  notifications: boolean;
  shareProgress: boolean;
}

interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  backgroundColor: string;
  features?: string[];
}

interface FeatureTourStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  tipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

interface GoalOption {
  id: string;
  title: string;
  icon: string;
  description: string;
}

interface FocusAreaOption {
  id: string;
  name: string;
  icon: string;
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
  gradient1: '#FF8200',
  gradient2: '#115740',
};

const SKILL_LEVELS: { value: SkillLevel; label: string; description: string; handicapRange: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Just starting out', handicapRange: '25+' },
  { value: 'intermediate', label: 'Intermediate', description: 'Comfortable on the course', handicapRange: '15-24' },
  { value: 'advanced', label: 'Advanced', description: 'Low handicap player', handicapRange: '5-14' },
  { value: 'professional', label: 'Professional', description: 'Scratch or better', handicapRange: '<5' },
];

const PLAY_FREQUENCIES: { value: PlayFrequency; label: string; icon: string }[] = [
  { value: 'rarely', label: 'A few times a year', icon: '🌱' },
  { value: 'monthly', label: '1-3 times a month', icon: '📅' },
  { value: 'weekly', label: '1-3 times a week', icon: '⛳' },
  { value: 'daily', label: 'Almost every day', icon: '🔥' },
];

const GOAL_OPTIONS: GoalOption[] = [
  { id: 'lower_handicap', title: 'Lower My Handicap', icon: '📉', description: 'Improve my index' },
  { id: 'break_100', title: 'Break 100', icon: '💯', description: 'Score under 100' },
  { id: 'break_90', title: 'Break 90', icon: '🎯', description: 'Score under 90' },
  { id: 'break_80', title: 'Break 80', icon: '🏆', description: 'Score under 80' },
  { id: 'consistency', title: 'Be More Consistent', icon: '📊', description: 'Reduce score variance' },
  { id: 'distance', title: 'Hit It Farther', icon: '🚀', description: 'Increase driving distance' },
  { id: 'accuracy', title: 'Hit More Fairways', icon: '🎯', description: 'Improve accuracy' },
  { id: 'short_game', title: 'Master Short Game', icon: '⛳', description: 'Chips and pitches' },
  { id: 'putting', title: 'Better Putting', icon: '🕳️', description: 'Reduce putts per round' },
  { id: 'course_management', title: 'Smarter Decisions', icon: '🧠', description: 'Course management' },
  { id: 'fitness', title: 'Golf Fitness', icon: '💪', description: 'Physical conditioning' },
  { id: 'mental_game', title: 'Mental Toughness', icon: '🧘', description: 'Focus and composure' },
];

const FOCUS_AREAS: FocusAreaOption[] = [
  { id: 'driver', name: 'Driver', icon: '🏌️' },
  { id: 'irons', name: 'Irons', icon: '🏌️‍♂️' },
  { id: 'wedges', name: 'Wedges', icon: '⛳' },
  { id: 'putting', name: 'Putting', icon: '🎯' },
  { id: 'chipping', name: 'Chipping', icon: '📍' },
  { id: 'bunker', name: 'Bunker Play', icon: '🏖️' },
  { id: 'course', name: 'Course Strategy', icon: '🗺️' },
  { id: 'mental', name: 'Mental Game', icon: '🧠' },
];

const WELCOME_SLIDES: CarouselSlide[] = [
  {
    id: 'welcome',
    title: 'Welcome to MCG',
    subtitle: 'Master Club Golf',
    description: 'Your personal AI-powered golf coach that helps you improve your game',
    icon: '⛳',
    backgroundColor: COLORS.secondary,
    features: ['AI Swing Analysis', 'Personalized Practice', 'Track Your Progress'],
  },
  {
    id: 'analyze',
    title: 'Analyze Your Swing',
    subtitle: 'AI-Powered Insights',
    description: 'Record your swing and get instant feedback with detailed analysis',
    icon: '📹',
    backgroundColor: '#3B82F6',
    features: ['Automatic fault detection', 'Side-by-side comparisons', 'Pro swing overlays'],
  },
  {
    id: 'practice',
    title: 'Practice with Purpose',
    subtitle: 'Customized Drills',
    description: 'Follow personalized practice plans designed for your specific needs',
    icon: '🎯',
    backgroundColor: COLORS.primary,
    features: ['500+ drills library', 'Guided practice sessions', 'Progress tracking'],
  },
  {
    id: 'improve',
    title: 'See Real Improvement',
    subtitle: 'Track Everything',
    description: 'Monitor your stats, track rounds, and celebrate your victories',
    icon: '📈',
    backgroundColor: '#8B5CF6',
    features: ['Handicap tracking', 'Stats dashboard', 'Achievement system'],
  },
];

const FEATURE_TOUR: FeatureTourStep[] = [
  { id: 'home', title: 'Your Dashboard', description: 'Quick access to your stats, recent activity, and personalized recommendations', icon: '🏠' },
  { id: 'practice', title: 'Practice Mode', description: 'Structured practice sessions with drills tailored to your needs', icon: '🎯' },
  { id: 'analyze', title: 'Swing Analysis', description: 'Record and analyze your swing with AI-powered feedback', icon: '📹' },
  { id: 'learn', title: 'Lessons', description: 'Learn from pro instructors with video lessons and tips', icon: '📚' },
  { id: 'profile', title: 'Your Profile', description: 'Track your progress, achievements, and manage your account', icon: '👤' },
];

// ============================================================================
// COMPONENTS - Welcome Carousel
// ============================================================================

interface WelcomeCarouselProps {
  slides: CarouselSlide[];
  onComplete: () => void;
}

const WelcomeCarousel: React.FC<WelcomeCarouselProps> = ({ slides, onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isLastSlide = currentSlide === slides.length - 1;

  const nextSlide = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: slide.backgroundColor,
      display: 'flex',
      flexDirection: 'column',
      transition: 'background-color 0.5s ease',
    }}>
      {/* Skip Button */}
      <div style={{
        padding: 20,
        paddingTop: 48,
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <button
          onClick={onComplete}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: COLORS.white,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 80,
          marginBottom: 24,
          animation: 'bounce 2s infinite',
        }}>
          {slide.icon}
        </div>

        <div style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.8)',
          textTransform: 'uppercase',
          letterSpacing: 2,
          marginBottom: 8,
        }}>
          {slide.subtitle}
        </div>

        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: COLORS.white,
          marginBottom: 16,
        }}>
          {slide.title}
        </h1>

        <p style={{
          fontSize: 16,
          color: 'rgba(255,255,255,0.9)',
          lineHeight: 1.6,
          maxWidth: 300,
          marginBottom: 32,
        }}>
          {slide.description}
        </p>

        {slide.features && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {slide.features.map((feature, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: 20,
                  color: COLORS.white,
                  fontSize: 14,
                }}
              >
                <span>✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination & Next */}
      <div style={{ padding: 32 }}>
        {/* Dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 24,
        }}>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: currentSlide === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                backgroundColor: currentSlide === index
                  ? COLORS.white
                  : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 12,
            border: 'none',
            backgroundColor: COLORS.white,
            color: slide.backgroundColor,
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {isLastSlide ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Profile Setup
// ============================================================================

interface ProfileSetupProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ data, onUpdate, onNext, onBack }) => {
  const canProceed = data.firstName && data.lastName;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.white,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: 20,
        paddingTop: 48,
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: COLORS.lightGray,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 24 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600, marginBottom: 8 }}>
            STEP 1 OF 5
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Let's get to know you
          </h1>
          <p style={{ fontSize: 16, color: COLORS.gray }}>
            Tell us a bit about yourself
          </p>
        </div>

        {/* Avatar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 32,
        }}>
          <button
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: `3px dashed ${COLORS.mediumGray}`,
              backgroundColor: COLORS.lightGray,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 32 }}>📷</span>
            <span style={{ fontSize: 11, color: COLORS.gray, marginTop: 4 }}>Add Photo</span>
          </button>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              First Name *
            </label>
            <input
              type="text"
              value={data.firstName}
              onChange={(e) => onUpdate({ firstName: e.target.value })}
              placeholder="Enter your first name"
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 12,
                border: `2px solid ${data.firstName ? COLORS.success : COLORS.mediumGray}`,
                fontSize: 16,
                transition: 'border-color 0.3s',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Last Name *
            </label>
            <input
              type="text"
              value={data.lastName}
              onChange={(e) => onUpdate({ lastName: e.target.value })}
              placeholder="Enter your last name"
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 12,
                border: `2px solid ${data.lastName ? COLORS.success : COLORS.mediumGray}`,
                fontSize: 16,
                transition: 'border-color 0.3s',
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: 24 }}>
        <button
          onClick={onNext}
          disabled={!canProceed}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 12,
            border: 'none',
            backgroundColor: canProceed ? COLORS.primary : COLORS.mediumGray,
            color: COLORS.white,
            fontSize: 18,
            fontWeight: 700,
            cursor: canProceed ? 'pointer' : 'not-allowed',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Golf Info
// ============================================================================

interface GolfInfoSetupProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const GolfInfoSetup: React.FC<GolfInfoSetupProps> = ({ data, onUpdate, onNext, onBack }) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.white,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: 20, paddingTop: 48 }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: COLORS.lightGray,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600, marginBottom: 8 }}>
            STEP 2 OF 5
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Your golf background
          </h1>
          <p style={{ fontSize: 16, color: COLORS.gray }}>
            Help us personalize your experience
          </p>
        </div>

        {/* Skill Level */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            What's your skill level?
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SKILL_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => onUpdate({ skillLevel: level.value })}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: data.skillLevel === level.value
                    ? `2px solid ${COLORS.primary}`
                    : `1px solid ${COLORS.mediumGray}`,
                  backgroundColor: data.skillLevel === level.value
                    ? `${COLORS.primary}10`
                    : COLORS.white,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{level.label}</div>
                  <div style={{ fontSize: 13, color: COLORS.gray }}>{level.description}</div>
                </div>
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: COLORS.lightGray,
                  borderRadius: 4,
                  fontSize: 12,
                  color: COLORS.gray,
                }}>
                  HCP {level.handicapRange}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Handicap */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            Current Handicap (optional)
          </label>
          <input
            type="number"
            step="0.1"
            value={data.handicap || ''}
            onChange={(e) => onUpdate({ handicap: parseFloat(e.target.value) || undefined })}
            placeholder="e.g., 15.4"
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 12,
              border: `1px solid ${COLORS.mediumGray}`,
              fontSize: 16,
            }}
          />
        </div>

        {/* Hand Preference */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            Which hand do you play?
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => onUpdate({ handPreference: 'right' })}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                border: data.handPreference === 'right'
                  ? `2px solid ${COLORS.primary}`
                  : `1px solid ${COLORS.mediumGray}`,
                backgroundColor: data.handPreference === 'right'
                  ? `${COLORS.primary}10`
                  : COLORS.white,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 24, display: 'block', marginBottom: 4 }}>🫱</span>
              <span style={{ fontWeight: 600 }}>Right-handed</span>
            </button>
            <button
              onClick={() => onUpdate({ handPreference: 'left' })}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                border: data.handPreference === 'left'
                  ? `2px solid ${COLORS.primary}`
                  : `1px solid ${COLORS.mediumGray}`,
                backgroundColor: data.handPreference === 'left'
                  ? `${COLORS.primary}10`
                  : COLORS.white,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 24, display: 'block', marginBottom: 4 }}>🫲</span>
              <span style={{ fontWeight: 600 }}>Left-handed</span>
            </button>
          </div>
        </div>

        {/* Play Frequency */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            How often do you play?
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {PLAY_FREQUENCIES.map((freq) => (
              <button
                key={freq.value}
                onClick={() => onUpdate({ playFrequency: freq.value })}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: data.playFrequency === freq.value
                    ? `2px solid ${COLORS.primary}`
                    : `1px solid ${COLORS.mediumGray}`,
                  backgroundColor: data.playFrequency === freq.value
                    ? `${COLORS.primary}10`
                    : COLORS.white,
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 24, display: 'block', marginBottom: 4 }}>{freq.icon}</span>
                <span style={{ fontSize: 13 }}>{freq.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: 24 }}>
        <button
          onClick={onNext}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 12,
            border: 'none',
            backgroundColor: COLORS.primary,
            color: COLORS.white,
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Goals Setup
// ============================================================================

interface GoalsSetupProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const GoalsSetup: React.FC<GoalsSetupProps> = ({ data, onUpdate, onNext, onBack }) => {
  const toggleGoal = (goalId: string) => {
    const current = data.goals || [];
    if (current.includes(goalId)) {
      onUpdate({ goals: current.filter(g => g !== goalId) });
    } else if (current.length < 3) {
      onUpdate({ goals: [...current, goalId] });
    }
  };

  const toggleFocusArea = (areaId: string) => {
    const current = data.focusAreas || [];
    if (current.includes(areaId)) {
      onUpdate({ focusAreas: current.filter(a => a !== areaId) });
    } else {
      onUpdate({ focusAreas: [...current, areaId] });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.white,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: 20, paddingTop: 48 }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: COLORS.lightGray,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600, marginBottom: 8 }}>
            STEP 3 OF 5
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            What are your goals?
          </h1>
          <p style={{ fontSize: 16, color: COLORS.gray }}>
            Select up to 3 goals you want to achieve
          </p>
        </div>

        {/* Goals Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
          marginBottom: 32,
        }}>
          {GOAL_OPTIONS.map((goal) => {
            const isSelected = data.goals?.includes(goal.id);
            const isDisabled = !isSelected && (data.goals?.length || 0) >= 3;

            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                disabled={isDisabled}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: isSelected
                    ? `2px solid ${COLORS.primary}`
                    : `1px solid ${COLORS.mediumGray}`,
                  backgroundColor: isSelected
                    ? `${COLORS.primary}10`
                    : COLORS.white,
                  textAlign: 'center',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>{goal.icon}</span>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{goal.title}</div>
                <div style={{ fontSize: 11, color: COLORS.gray }}>{goal.description}</div>
              </button>
            );
          })}
        </div>

        {/* Focus Areas */}
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            Areas to focus on (select all that apply)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {FOCUS_AREAS.map((area) => {
              const isSelected = data.focusAreas?.includes(area.id);

              return (
                <button
                  key={area.id}
                  onClick={() => toggleFocusArea(area.id)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 20,
                    border: isSelected
                      ? `2px solid ${COLORS.secondary}`
                      : `1px solid ${COLORS.mediumGray}`,
                    backgroundColor: isSelected
                      ? `${COLORS.secondary}10`
                      : COLORS.white,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{area.icon}</span>
                  <span style={{ fontSize: 14 }}>{area.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: 24 }}>
        <button
          onClick={onNext}
          disabled={!data.goals?.length}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 12,
            border: 'none',
            backgroundColor: data.goals?.length ? COLORS.primary : COLORS.mediumGray,
            color: COLORS.white,
            fontSize: 18,
            fontWeight: 700,
            cursor: data.goals?.length ? 'pointer' : 'not-allowed',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Preferences Setup
// ============================================================================

interface PreferencesSetupProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PreferencesSetup: React.FC<PreferencesSetupProps> = ({ data, onUpdate, onNext, onBack }) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.white,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: 20, paddingTop: 48 }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: COLORS.lightGray,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 24 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600, marginBottom: 8 }}>
            STEP 4 OF 5
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Your preferences
          </h1>
          <p style={{ fontSize: 16, color: COLORS.gray }}>
            Customize your MCG experience
          </p>
        </div>

        {/* Distance Unit */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            Distance measurement
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => onUpdate({ distanceUnit: 'yards' })}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                border: data.distanceUnit === 'yards'
                  ? `2px solid ${COLORS.primary}`
                  : `1px solid ${COLORS.mediumGray}`,
                backgroundColor: data.distanceUnit === 'yards'
                  ? `${COLORS.primary}10`
                  : COLORS.white,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 24, display: 'block', marginBottom: 4 }}>🇺🇸</span>
              <span style={{ fontWeight: 600 }}>Yards</span>
            </button>
            <button
              onClick={() => onUpdate({ distanceUnit: 'meters' })}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                border: data.distanceUnit === 'meters'
                  ? `2px solid ${COLORS.primary}`
                  : `1px solid ${COLORS.mediumGray}`,
                backgroundColor: data.distanceUnit === 'meters'
                  ? `${COLORS.primary}10`
                  : COLORS.white,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 24, display: 'block', marginBottom: 4 }}>🌍</span>
              <span style={{ fontWeight: 600 }}>Meters</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div style={{
          padding: 16,
          backgroundColor: COLORS.lightGray,
          borderRadius: 12,
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>🔔 Push Notifications</div>
              <div style={{ fontSize: 13, color: COLORS.gray }}>Get reminders and tips</div>
            </div>
            <button
              onClick={() => onUpdate({ notifications: !data.notifications })}
              style={{
                width: 56,
                height: 32,
                borderRadius: 16,
                border: 'none',
                backgroundColor: data.notifications ? COLORS.success : COLORS.mediumGray,
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: COLORS.white,
                position: 'absolute',
                top: 2,
                left: data.notifications ? 26 : 2,
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
        </div>

        {/* Share Progress */}
        <div style={{
          padding: 16,
          backgroundColor: COLORS.lightGray,
          borderRadius: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>👥 Share Progress</div>
              <div style={{ fontSize: 13, color: COLORS.gray }}>Let friends see your stats</div>
            </div>
            <button
              onClick={() => onUpdate({ shareProgress: !data.shareProgress })}
              style={{
                width: 56,
                height: 32,
                borderRadius: 16,
                border: 'none',
                backgroundColor: data.shareProgress ? COLORS.success : COLORS.mediumGray,
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: COLORS.white,
                position: 'absolute',
                top: 2,
                left: data.shareProgress ? 26 : 2,
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: 24 }}>
        <button
          onClick={onNext}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 12,
            border: 'none',
            backgroundColor: COLORS.primary,
            color: COLORS.white,
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Feature Tour
// ============================================================================

interface FeatureTourProps {
  steps: FeatureTourStep[];
  onComplete: () => void;
}

const FeatureTour: React.FC<FeatureTourProps> = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const nextStep = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.secondary,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Skip */}
      <div style={{ padding: 20, paddingTop: 48, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onComplete}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: COLORS.white,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Skip Tour
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        textAlign: 'center',
      }}>
        <div style={{
          width: 100,
          height: 100,
          borderRadius: 24,
          backgroundColor: 'rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48,
          marginBottom: 32,
        }}>
          {step.icon}
        </div>

        <h2 style={{
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.white,
          marginBottom: 16,
        }}>
          {step.title}
        </h2>

        <p style={{
          fontSize: 16,
          color: 'rgba(255,255,255,0.8)',
          lineHeight: 1.6,
          maxWidth: 300,
        }}>
          {step.description}
        </p>
      </div>

      {/* Navigation */}
      <div style={{ padding: 32 }}>
        {/* Progress Dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 24,
        }}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                width: currentStep === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: currentStep === index
                  ? COLORS.white
                  : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextStep}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 12,
            border: 'none',
            backgroundColor: COLORS.primary,
            color: COLORS.white,
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {isLastStep ? 'Start Using MCG' : 'Next'}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTS - Completion Screen
// ============================================================================

interface CompletionScreenProps {
  data: OnboardingData;
  onFinish: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ data, onFinish }) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      textAlign: 'center',
    }}>
      {/* Confetti Effect Placeholder */}
      {showConfetti && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 100, animation: 'bounce 0.5s' }}>🎉</div>
        </div>
      )}

      <div style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        backgroundColor: COLORS.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 64,
        marginBottom: 32,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        ✅
      </div>

      <h1 style={{
        fontSize: 32,
        fontWeight: 700,
        color: COLORS.white,
        marginBottom: 16,
      }}>
        You're All Set!
      </h1>

      <p style={{
        fontSize: 18,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 32,
      }}>
        Welcome to MCG, {data.firstName}!
      </p>

      {/* Summary */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 300,
        marginBottom: 32,
      }}>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>
          Your Profile Summary
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          color: COLORS.white,
        }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Skill Level</div>
            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{data.skillLevel}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Handicap</div>
            <div style={{ fontWeight: 600 }}>{data.handicap || 'Not set'}</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Goals</div>
            <div style={{ fontWeight: 600 }}>
              {data.goals?.length || 0} selected
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onFinish}
        style={{
          width: '100%',
          maxWidth: 300,
          padding: 16,
          borderRadius: 12,
          border: 'none',
          backgroundColor: COLORS.white,
          color: COLORS.secondary,
          fontSize: 18,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Start Improving Your Game
      </button>
    </div>
  );
};

// ============================================================================
// MAIN HUB COMPONENT
// ============================================================================

const OnboardingHub: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    email: '',
    skillLevel: 'intermediate',
    handPreference: 'right',
    playFrequency: 'weekly',
    yearsPlaying: 5,
    goals: [],
    focusAreas: [],
    distanceUnit: 'yards',
    notifications: true,
    shareProgress: true,
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData({ ...data, ...updates });
  };

  const goToStep = (step: OnboardingStep) => {
    setCurrentStep(step);
  };

  switch (currentStep) {
    case 'welcome':
      return (
        <WelcomeCarousel
          slides={WELCOME_SLIDES}
          onComplete={() => goToStep('profile')}
        />
      );

    case 'profile':
      return (
        <ProfileSetup
          data={data}
          onUpdate={updateData}
          onNext={() => goToStep('golf_info')}
          onBack={() => goToStep('welcome')}
        />
      );

    case 'golf_info':
      return (
        <GolfInfoSetup
          data={data}
          onUpdate={updateData}
          onNext={() => goToStep('goals')}
          onBack={() => goToStep('profile')}
        />
      );

    case 'goals':
      return (
        <GoalsSetup
          data={data}
          onUpdate={updateData}
          onNext={() => goToStep('preferences')}
          onBack={() => goToStep('golf_info')}
        />
      );

    case 'preferences':
      return (
        <PreferencesSetup
          data={data}
          onUpdate={updateData}
          onNext={() => goToStep('tour')}
          onBack={() => goToStep('goals')}
        />
      );

    case 'tour':
      return (
        <FeatureTour
          steps={FEATURE_TOUR}
          onComplete={() => goToStep('complete')}
        />
      );

    case 'complete':
      return (
        <CompletionScreen
          data={data}
          onFinish={() => console.log('Onboarding complete!', data)}
        />
      );

    default:
      return null;
  }
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

const OnboardingExample: React.FC = () => {
  return <OnboardingHub />;
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Types
  type OnboardingData,
  type OnboardingStep,
  type CarouselSlide,
  type FeatureTourStep,
  type GoalOption,
  type SkillLevel,
  type PlayFrequency,

  // Carousel Components
  WelcomeCarousel,

  // Setup Components
  ProfileSetup,
  GolfInfoSetup,
  GoalsSetup,
  PreferencesSetup,

  // Tour Components
  FeatureTour,

  // Completion Components
  CompletionScreen,

  // Main Hub
  OnboardingHub,

  // Example
  OnboardingExample,
};

export default OnboardingHub;

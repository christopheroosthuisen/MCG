// MCG Type Definitions
// Core types used throughout the application

// ============================================
// MEMBERSHIP TYPES
// ============================================

export enum MembershipTier {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ELITE = 'ELITE',
  LIFETIME = 'LIFETIME',
}

export interface TierFeatures {
  tier: MembershipTier;
  name: string;
  priceMonthly: number;
  priceYearly?: number;
  monthlyCredits: number;
  features: string[];
  limitations: string[];
  highlighted?: boolean;
}

export const TIER_FEATURES: Record<MembershipTier, TierFeatures> = {
  [MembershipTier.FREE]: {
    tier: MembershipTier.FREE,
    name: 'Free',
    priceMonthly: 0,
    monthlyCredits: 0,
    features: [
      'Basic video library access',
      'Community forum (read-only)',
      'Basic swing tips articles',
      '1 free swing review (one-time)',
    ],
    limitations: [
      'Ads displayed',
      'Limited content access',
      'No direct coach access',
    ],
  },
  [MembershipTier.STARTER]: {
    tier: MembershipTier.STARTER,
    name: 'Starter',
    priceMonthly: 9.99,
    priceYearly: 99.99,
    monthlyCredits: 2,
    features: [
      'Full video library access',
      'Community forum participation',
      'Basic drill library',
      '2 swing review credits/month',
      'Progress tracking dashboard',
      'No ads',
      'Email support',
    ],
    limitations: [
      'No live coaching access',
      'Standard support only',
    ],
  },
  [MembershipTier.PRO]: {
    tier: MembershipTier.PRO,
    name: 'Pro',
    priceMonthly: 29.99,
    priceYearly: 299.99,
    monthlyCredits: 5,
    features: [
      'Everything in Starter',
      'Advanced drill sequences',
      'Practice plans & routines',
      '5 swing review credits/month',
      'MCG Alumni coaching chat',
      'Live Q&A session access',
      'Priority email support',
      'Downloadable resources',
    ],
    limitations: [],
    highlighted: true,
  },
  [MembershipTier.ELITE]: {
    tier: MembershipTier.ELITE,
    name: 'Elite',
    priceMonthly: 99.99,
    priceYearly: 999.99,
    monthlyCredits: 15,
    features: [
      'Everything in Pro',
      '15 swing review credits/month',
      'Priority reviews (48hr turnaround)',
      '1 monthly 1-on-1 video call',
      'Direct Joseph Mayo content access',
      'Early access to new features',
      'Quarterly live session with Joseph Mayo',
      'Dedicated support channel',
    ],
    limitations: [],
  },
  [MembershipTier.LIFETIME]: {
    tier: MembershipTier.LIFETIME,
    name: 'Lifetime',
    priceMonthly: 999, // one-time
    monthlyCredits: 20,
    features: [
      'Everything in Elite (forever)',
      'Founding member badge',
      '20 swing review credits/month',
      'VIP access to in-person events',
      'Beta tester access',
      'Input on future features',
    ],
    limitations: [],
  },
};

// ============================================
// CREDITS TYPES
// ============================================

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  bonusCredits: number;
  priceInCents: number;
  pricePerCredit: number;
  stripePriceId: string;
  popular?: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter-pack',
    name: 'Starter Pack',
    credits: 5,
    bonusCredits: 0,
    priceInCents: 1499,
    pricePerCredit: 3.0,
    stripePriceId: 'price_credits_5',
  },
  {
    id: 'value-pack',
    name: 'Value Pack',
    credits: 15,
    bonusCredits: 0,
    priceInCents: 3499,
    pricePerCredit: 2.33,
    stripePriceId: 'price_credits_15',
    popular: true,
  },
  {
    id: 'pro-pack',
    name: 'Pro Pack',
    credits: 35,
    bonusCredits: 0,
    priceInCents: 6999,
    pricePerCredit: 2.0,
    stripePriceId: 'price_credits_35',
  },
  {
    id: 'ultimate-pack',
    name: 'Ultimate Pack',
    credits: 100,
    bonusCredits: 10,
    priceInCents: 14999,
    pricePerCredit: 1.5,
    stripePriceId: 'price_credits_100',
  },
];

export interface CreditCost {
  service: string;
  credits: number;
  description: string;
}

export const CREDIT_COSTS: CreditCost[] = [
  { service: 'STANDARD_REVIEW', credits: 3, description: 'Standard swing review (5-7 days)' },
  { service: 'PRIORITY_REVIEW', credits: 5, description: 'Priority swing review (48 hours)' },
  { service: 'DETAILED_REVIEW', credits: 7, description: 'Detailed analysis with drills' },
  { service: 'JOSEPH_MAYO_REVIEW', credits: 25, description: 'Review from Joseph Mayo' },
  { service: 'LESSON_30_MIN', credits: 15, description: '30-minute live lesson' },
  { service: 'LESSON_60_MIN', credits: 25, description: '60-minute live lesson' },
];

// ============================================
// COACHING TYPES
// ============================================

export interface CoachProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  profileImage: string | null;
  certifications: string[];
  specialties: string[];
  yearsExperience: number;
  totalReviews: number;
  totalLessons: number;
  averageRating: number;
  responseTimeHours: number;
  isJosephMayo: boolean;
  reviewPriceCredits: number;
  lesson30MinCredits: number;
  lesson60MinCredits: number;
}

export interface CoachAvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface BookingSlot {
  startTime: Date;
  endTime: Date;
  coachId: string;
  isAvailable: boolean;
}

// ============================================
// REVIEW TYPES
// ============================================

export enum ReviewStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ReviewType {
  STANDARD = 'STANDARD',
  PRIORITY = 'PRIORITY',
  DETAILED = 'DETAILED',
  JOSEPH_MAYO = 'JOSEPH_MAYO',
}

export interface SwingReviewSubmission {
  videoUrl: string;
  clubUsed?: string;
  shotType?: string;
  additionalNotes?: string;
  reviewType: ReviewType;
  preferredCoachId?: string;
}

export interface SwingReviewResponse {
  reviewVideoUrl?: string;
  reviewNotes: string;
  drillsRecommended: string[];
}

// ============================================
// LESSON TYPES
// ============================================

export enum LessonStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum LessonType {
  VIDEO_CALL_30 = 'VIDEO_CALL_30',
  VIDEO_CALL_60 = 'VIDEO_CALL_60',
}

export interface LessonBooking {
  coachId: string;
  lessonType: LessonType;
  scheduledAt: Date;
  timezone: string;
  studentGoals?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// USER TYPES
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  membership: {
    tier: MembershipTier;
    status: string;
    currentPeriodEnd: Date | null;
  };
  credits: {
    total: number;
    purchased: number;
    membership: number;
    bonus: number;
  };
}

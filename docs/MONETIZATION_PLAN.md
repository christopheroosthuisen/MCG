# MCG App Monetization Plan

## Executive Summary

This document outlines a comprehensive monetization strategy for the MCG (Mayo Coaching Golf) app, designed to create multiple revenue streams while providing exceptional value to golfers at every skill level.

---

## 1. Membership Tiers

### Tier Structure

| Tier | Price | Target Audience |
|------|-------|-----------------|
| **Free** | $0/month | Casual golfers exploring the platform |
| **Starter** | $9.99/month | Committed beginners wanting structured learning |
| **Pro** | $29.99/month | Serious golfers seeking comprehensive improvement |
| **Elite** | $99.99/month | Dedicated players wanting premium coaching access |
| **Lifetime** | $999 one-time | Long-term committed members |

### Feature Access by Tier

#### Free Tier
- Access to basic video library (limited content)
- Community forum access (read-only)
- Basic swing tips articles
- 1 free swing review credit (one-time)
- Ads displayed

#### Starter Tier
- Full video library access
- Community forum participation
- Basic drill library
- 2 swing review credits/month
- Progress tracking dashboard
- No ads
- Email support

#### Pro Tier
- Everything in Starter
- Advanced drill sequences
- Practice plans & routines
- 5 swing review credits/month
- Access to MCG Alumni coaching chat
- Live Q&A session access
- Priority email support
- Downloadable resources

#### Elite Tier
- Everything in Pro
- 15 swing review credits/month
- Priority swing reviews (48hr turnaround)
- 1 monthly 1-on-1 video call with MCG Alumni
- Direct access to Joseph Mayo content
- Early access to new features
- Quarterly live session with Joseph Mayo
- Dedicated support channel

#### Lifetime Tier
- Everything in Elite (perpetual)
- Founding member badge
- 20 swing review credits/month (forever)
- VIP access to in-person events
- Beta tester access
- Input on future features

---

## 2. Credits System

### Overview
Credits are the in-app currency used for premium services, primarily swing reviews.

### Credit Packages

| Package | Credits | Price | Per-Credit Cost |
|---------|---------|-------|-----------------|
| Starter Pack | 5 | $14.99 | $3.00 |
| Value Pack | 15 | $34.99 | $2.33 |
| Pro Pack | 35 | $69.99 | $2.00 |
| Ultimate Pack | 100 | $149.99 | $1.50 |

### Credit Usage

| Service | Credit Cost | Description |
|---------|-------------|-------------|
| **Standard Swing Review** | 3 credits | MCG Alumni reviews within 5-7 days |
| **Priority Swing Review** | 5 credits | MCG Alumni reviews within 48 hours |
| **Detailed Analysis** | 7 credits | In-depth video breakdown with drills |
| **Joseph Mayo Review** | 25 credits | Personal review from Joseph Mayo |
| **Live Lesson (30 min)** | 15 credits | Video call with MCG Alumni |
| **Live Lesson (60 min)** | 25 credits | Extended video call with MCG Alumni |

### Credit Policies
- Monthly membership credits roll over for 1 month only
- Purchased credits never expire
- Bulk purchases receive bonus credits
- Referral program: 2 credits per successful referral

---

## 3. Coaching Portal

### For Students

#### Features
- **Coach Discovery**: Browse MCG Alumni profiles with specialties, ratings, availability
- **Booking System**: Schedule lessons with preferred coaches
- **Chat System**: Direct messaging with assigned coaches
- **Video Upload**: Easy swing submission for reviews
- **History**: View all past reviews, lessons, and feedback
- **Progress Tracking**: Visual improvement metrics over time

#### Booking Types
1. **Swing Review** (Async)
   - Upload video
   - Receive annotated feedback
   - Follow-up questions included

2. **Live Lesson** (Sync)
   - Video call via integrated platform
   - Screen sharing for analysis
   - Recording provided after session

3. **Package Deals**
   - 4-lesson package (10% discount)
   - 8-lesson package (15% discount)
   - Monthly coaching subscription

### For Coaches (MCG Alumni)

#### Features
- **Profile Management**: Bio, specialties, certifications, pricing
- **Availability Calendar**: Set working hours and blackout dates
- **Review Queue**: Manage pending swing reviews
- **Lesson Dashboard**: Upcoming and past lessons
- **Earnings Tracker**: Revenue, pending payouts, history
- **Student Management**: View assigned students, their progress
- **Content Tools**: Create drills, annotate videos, share resources

#### Revenue Share
- MCG Alumni: 70% of lesson/review revenue
- Platform: 30% platform fee
- Top performers (100+ reviews, 4.8+ rating): 75/25 split

---

## 4. Additional Monetization Streams

### 4.1 In-Person Events
- MCG Clinics & Workshops
- Golf trips with Joseph Mayo
- Annual MCG Summit

### 4.2 Merchandise Store
- Branded apparel
- Training aids
- Partner equipment (affiliate revenue)

### 4.3 Corporate/Group Plans
- Team subscriptions for golf clubs
- Corporate wellness programs
- Golf academy partnerships

### 4.4 Affiliate Program
- Golf equipment partnerships
- Course booking partnerships
- Travel & hospitality partnerships

### 4.5 Premium Content
- Exclusive masterclass series
- Course-specific strategy guides
- Mental game courses

### 4.6 Certification Program
- MCG Teaching Methodology certification
- Instructor training program
- Continuing education credits

---

## 5. Payment & Billing Architecture

### Payment Processor
- Primary: Stripe (subscriptions, one-time purchases)
- Alternative: PayPal integration

### Billing Features
- Automatic subscription renewal
- Proration for tier upgrades
- Grace period for failed payments (3 days)
- Easy cancellation with win-back offers

### Refund Policy
- 7-day money-back guarantee for new subscriptions
- Credits: non-refundable but transferable
- Lessons: 24-hour cancellation policy

---

## 6. Technical Implementation Overview

### Database Entities
```
- Users (with membership tier)
- Memberships (subscription records)
- Credits (balance & transactions)
- Coaches (MCG Alumni profiles)
- Reviews (swing review submissions)
- Lessons (bookings & history)
- Messages (coaching chat)
- Transactions (payment history)
```

### Key Integrations
- Stripe: Payment processing
- SendGrid: Email notifications
- Twilio: SMS reminders
- Daily.co/Zoom: Video calls
- AWS S3: Video storage
- FFmpeg: Video processing

### Security Considerations
- PCI compliance via Stripe
- SOC 2 compliance target
- Data encryption at rest and in transit
- GDPR/CCPA compliance

---

## 7. Success Metrics

### KPIs to Track
- Monthly Recurring Revenue (MRR)
- Average Revenue Per User (ARPU)
- Customer Lifetime Value (CLV)
- Churn Rate by Tier
- Credit Purchase Conversion Rate
- Coach Utilization Rate
- Net Promoter Score (NPS)

### Goals (Year 1)
- 10,000 paid subscribers
- $50,000 MRR
- <5% monthly churn
- 50 active MCG Alumni coaches
- 4.5+ average coach rating

---

## 8. Launch Strategy

### Phase 1: Foundation (Months 1-2)
- Core membership tiers
- Basic credit system
- Payment integration

### Phase 2: Coaching (Months 3-4)
- Swing review system
- Coach onboarding
- Booking system

### Phase 3: Enhancement (Months 5-6)
- Live lessons
- Chat system
- Advanced analytics

### Phase 4: Scale (Months 7+)
- Affiliate program
- Corporate plans
- Merchandise store

---

## Appendix: Pricing Psychology

- **Anchoring**: Elite tier makes Pro look affordable
- **Decoy Effect**: Starter tier drives Pro conversions
- **Loss Aversion**: Monthly credit rollover limit
- **Commitment**: Lifetime tier for super fans
- **Social Proof**: Coach ratings and review counts

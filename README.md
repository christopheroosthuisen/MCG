# MCG - Mayo Coaching Golf

Premium golf instruction platform featuring swing reviews, live lessons, and coaching from Joseph Mayo and MCG Alumni coaches.

## Features

### Membership Tiers
- **Free**: Basic access with limited content
- **Starter** ($9.99/mo): Full video library, 2 credits/month
- **Pro** ($29.99/mo): Coach chat access, 5 credits/month
- **Elite** ($99.99/mo): Priority reviews, 15 credits/month, monthly 1-on-1 calls
- **Lifetime** ($999): All Elite features forever

### Credits System
- Purchase credit packages for swing reviews and lessons
- Monthly membership credits (use it or lose it, 1-month rollover)
- Bonus credits from referrals and promotions

### Coaching Portal
- **Swing Reviews**: Upload videos for personalized analysis
- **Live Lessons**: Book 30 or 60-minute video calls
- **Coach Chat**: Direct messaging with MCG Alumni (Pro+)
- **Joseph Mayo Reviews**: Premium reviews from the founder

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Stripe (subscriptions + one-time)
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Environment Variables

See `.env.example` for all required variables:
- Database connection
- NextAuth configuration
- Stripe API keys
- AWS S3 for video storage
- SendGrid for emails

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── membership/    # Subscription management
│   │   ├── credits/       # Credit purchase & balance
│   │   ├── coaches/       # Coach listings & profiles
│   │   ├── reviews/       # Swing review submissions
│   │   ├── lessons/       # Lesson bookings
│   │   ├── messages/      # Coach-student messaging
│   │   ├── referrals/     # Referral program
│   │   └── webhooks/      # Stripe webhooks
│   └── page.tsx           # Landing page
├── services/              # Business logic
│   ├── membership.service.ts
│   ├── credit.service.ts
│   ├── coaching.service.ts
│   ├── messaging.service.ts
│   └── referral.service.ts
├── lib/                   # Utilities
│   ├── prisma.ts         # Database client
│   └── stripe.ts         # Stripe client
└── types/                 # TypeScript types
    └── index.ts          # Type definitions

prisma/
└── schema.prisma          # Database schema

docs/
└── MONETIZATION_PLAN.md   # Detailed monetization strategy
```

## API Endpoints

### Membership
- `GET /api/membership` - Get current membership
- `POST /api/membership` - Create checkout session
- `POST /api/membership/cancel` - Cancel subscription
- `POST /api/membership/portal` - Stripe billing portal

### Credits
- `GET /api/credits` - Get balance & packages
- `POST /api/credits` - Purchase credits
- `GET /api/credits/history` - Transaction history

### Coaching
- `GET /api/coaches` - List active coaches
- `GET /api/coaches/[id]` - Coach profile
- `GET /api/coaches/[id]/availability` - Booking slots

### Reviews
- `GET /api/reviews` - User's reviews
- `POST /api/reviews` - Submit swing review
- `POST /api/reviews/[id]/complete` - Coach completes review
- `POST /api/reviews/[id]/rate` - Rate review

### Lessons
- `GET /api/lessons` - Upcoming lessons
- `POST /api/lessons` - Book lesson
- `POST /api/lessons/[id]/cancel` - Cancel lesson

### Messages
- `GET /api/messages` - User's conversations
- `POST /api/messages` - Start conversation
- `GET /api/messages/[id]` - Get messages
- `POST /api/messages/[id]` - Send message

### Referrals
- `GET /api/referrals` - Referral stats & link
- `POST /api/referrals` - Apply referral code

## License

Private - All rights reserved

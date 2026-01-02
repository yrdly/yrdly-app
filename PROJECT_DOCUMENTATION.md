# Yrdly App - Complete Project Documentation

## Project Overview

### What the Project Does

**Yrdly** is a neighborhood social network and marketplace platform that connects people within their local communities. It enables users to:

- Share posts, events, and updates with neighbors
- Buy and sell items through a local marketplace
- Discover and interact with local businesses
- Chat with neighbors, sellers, and business owners
- Build friendships and community connections
- View neighborhood activity on an interactive map

### The Main Problem It Solves

Yrdly addresses the challenge of building strong local community connections in an increasingly digital world. It provides a single platform where neighbors can:

1. **Stay informed** about local events, news, and happenings
2. **Buy and sell** items safely within their neighborhood with escrow protection
3. **Support local businesses** by discovering and reviewing nearby establishments
4. **Connect socially** with people in their immediate area
5. **Navigate safely** with location-based filtering and privacy controls

---

## Tech Stack

### Frontend Technologies

- **Next.js 15.5.7** (React 19.2.0) - App Router architecture
- **TypeScript 5** - Type safety throughout the codebase
- **Tailwind CSS 3.4.1** - Utility-first styling
- **Radix UI** - Accessible component primitives (dialogs, dropdowns, tabs, etc.)
- **React Hook Form 7.54.2** + **Zod 3.23.8** - Form validation
- **SWR 2.3.6** - Data fetching and caching
- **Leaflet 1.9.4** + **React Leaflet 5.0.0** - Interactive maps
- **Google Maps API** (`@vis.gl/react-google-maps`) - Places autocomplete and mapping
- **Lucide React** - Icon library
- **Next Themes** - Dark/light mode support
- **Recharts 2.15.1** - Data visualization

### Backend Technologies

- **Supabase** - Backend-as-a-Service providing:
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions via WebSockets
  - Authentication (email/password, Google, Apple)
  - File storage (avatars, post images, chat images)
  - Edge functions (serverless functions)

### Databases, APIs, and Third-Party Services

- **Supabase PostgreSQL** - Primary database with:
  - PostGIS extension for geographic queries
  - Real-time capabilities
  - Row Level Security policies
  - Database triggers and functions

- **Flutterwave** (`flutterwave-node-v3`) - Payment processing for marketplace transactions
- **Brevo** (`@getbrevo/brevo`) - Email service for transactional emails
- **Sentry** (`@sentry/nextjs`) - Error tracking and monitoring
- **Vercel Analytics** - Usage analytics
- **Google Maps API** - Geocoding, places autocomplete, and map rendering

### State Management, Authentication, Payments, and Integrations

#### State Management
- **React Context API** - Global auth state (`AuthProvider`)
- **SWR** - Server state management with caching and revalidation
- **Local React State** - Component-level state management
- **Supabase Realtime** - Real-time data synchronization

#### Authentication
- **Supabase Auth** - Handles all authentication:
  - Email/password signup and login
  - Google OAuth
  - Apple Sign-In
  - Password reset via email
  - Session management with auto-refresh
  - User profile creation and management

#### Payments
- **Flutterwave Integration** - Payment gateway for:
  - Card payments
  - Bank transfers
  - Mobile money (African markets)
- **Escrow System** - Custom-built escrow service:
  - Holds payments until delivery confirmation
  - 2% platform commission
  - Dispute resolution support
  - Seller payout management

#### Integrations
- **Push Notifications** - Web Push API for browser notifications
- **Service Workers** - Offline support and PWA capabilities
- **Email Notifications** - Brevo for transactional emails
- **Location Services** - Google Maps for geocoding and places

---

## Project Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   App Router  │  │   Components │  │    Hooks     │    │
│  │   (Pages)     │  │   (UI/Logic) │  │  (State/API) │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/WebSocket
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  PostgreSQL  │  │   Auth API   │  │   Storage    │    │
│  │   Database   │  │              │  │   (Files)    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Realtime   │  │   Edge       │                        │
│  │  (WebSocket) │  │   Functions  │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ API Calls
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Third-Party Services                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Flutterwave │  │  Google Maps │  │    Brevo     │    │
│  │  (Payments)  │  │   (Places)   │  │   (Email)    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User interacts with Next.js frontend (React components)
2. Components call hooks/services that make API requests to Supabase
3. Supabase handles database queries, auth, and file storage
4. Real-time updates flow back via WebSocket subscriptions
5. External services (Flutterwave, Google Maps) are called via API routes or client-side

### Major Folders and Their Purpose

```
yrdly-app-main/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (app)/              # Protected routes (require auth)
│   │   │   ├── home/           # Newsfeed/home page
│   │   │   ├── marketplace/    # Marketplace listings
│   │   │   ├── businesses/     # Business directory
│   │   │   ├── events/         # Events listing
│   │   │   ├── messages/       # Messaging system
│   │   │   ├── neighbors/      # Community/friends
│   │   │   ├── map/            # Interactive map view
│   │   │   ├── profile/        # User profiles
│   │   │   ├── transactions/  # Payment transactions
│   │   │   └── disputes/       # Dispute resolution
│   │   ├── auth/               # Auth callback handlers
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page
│   │   ├── onboarding/         # User onboarding flow
│   │   └── api/                # API routes (Next.js)
│   │       └── payment/        # Payment verification endpoint
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components (Radix UI)
│   │   ├── layout/             # Layout components (sidebar, nav)
│   │   ├── messages/           # Messaging components
│   │   ├── escrow/             # Payment/escrow components
│   │   ├── disputes/           # Dispute resolution UI
│   │   ├── marketplace/        # Marketplace-specific components
│   │   └── seller-account/     # Seller account management
│   ├── lib/                    # Core services and utilities
│   │   ├── supabase.ts         # Supabase client setup
│   │   ├── auth-service.ts     # Authentication logic
│   │   ├── escrow-service.ts   # Escrow transaction management
│   │   ├── flutterwave-service.ts # Payment processing
│   │   ├── chat-service.ts     # Messaging logic
│   │   ├── notification-service.ts # Notification handling
│   │   └── [other services]    # Various business logic services
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-supabase-auth.tsx # Auth state management
│   │   ├── use-posts.tsx        # Post data fetching
│   │   ├── use-notifications.tsx # Notification management
│   │   └── [other hooks]       # Reusable stateful logic
│   ├── types/                  # TypeScript type definitions
│   └── data/                   # Static data files
│       ├── states.json         # Nigerian states data
│       ├── lgas.json           # Local Government Areas
│       └── interests.json      # User interest categories
├── docs/                       # Documentation
│   └── migrations/             # Database migration SQL files
├── public/                     # Static assets
├── middleware.ts               # Next.js middleware (maintenance mode)
├── next.config.mjs             # Next.js configuration
└── package.json                # Dependencies and scripts
```

---

## Core Features

### 1. Social Feed (Newsfeed)

**What it does:** Displays a chronological feed of posts from neighbors in the user's area.

**How it works:**
- Posts are fetched from Supabase `posts` table filtered by user's location
- Supports multiple post categories: General, Event, For Sale, Business
- Real-time updates via Supabase subscriptions
- Users can like, comment, and share posts
- Location-based filtering shows relevant local content

**Key Files:**
- `src/components/HomeScreen.tsx` - Main feed component
- `src/hooks/use-posts.tsx` - Post data fetching logic
- `src/components/PostCard.tsx` - Individual post display

**Logic Flow:**
1. User opens home page → `HomeScreen` component mounts
2. `usePosts` hook fetches posts from Supabase
3. Posts filtered by location (if user has location set)
4. Real-time subscription listens for new posts
5. Posts displayed in chronological order
6. User interactions (like, comment) update database via Supabase client

### 2. Marketplace

**What it does:** Allows users to buy and sell items within their neighborhood with escrow protection.

**How it works:**
- Items are posts with category "For Sale"
- Sellers create listings with images, price, description, condition
- Buyers can message sellers, make offers, or purchase directly
- Escrow system holds payment until delivery confirmation
- 2% platform commission deducted from seller payout
- Dispute resolution system for transaction issues

**Key Files:**
- `src/components/MarketplaceScreen.tsx` - Marketplace listing view
- `src/components/escrow/BuyButton.tsx` - Purchase initiation
- `src/lib/escrow-service.ts` - Escrow transaction logic
- `src/lib/flutterwave-service.ts` - Payment processing

**Logic Flow:**
1. Seller creates "For Sale" post → Stored in `posts` table
2. Buyer views item → Can message seller or buy directly
3. Buyer clicks "Buy" → Escrow transaction created in `escrow_transactions` table
4. Payment processed via Flutterwave → Status updated to "paid"
5. Seller ships item → Status updated to "shipped"
6. Buyer confirms delivery → Status updated to "delivered"
7. Seller receives payout (amount - 2% commission) → Status "completed"
8. If dispute → Status "disputed", admin reviews

### 3. Business Directory

**What it does:** Local businesses can create profiles, list products/services, and receive reviews.

**How it works:**
- Business owners create profiles with location, category, contact info
- Businesses can list catalog items (products/services)
- Customers can message businesses, view catalog, leave reviews
- Rating system aggregates reviews (1-5 stars)
- Business messages are separate from regular conversations

**Key Files:**
- `src/components/BusinessesScreen.tsx` - Business listing
- `src/components/BusinessDetailScreen.tsx` - Business profile view
- `src/lib/catalog-service.ts` - Catalog item management
- `src/lib/review-service.ts` - Review system

**Logic Flow:**
1. Business owner creates business → Stored in `businesses` table
2. Owner adds catalog items → Stored in `catalog_items` table
3. Customers browse businesses → Filtered by location/category
4. Customer views business → Sees catalog, reviews, contact info
5. Customer messages business → Creates entry in `business_messages` table
6. Customer leaves review → Stored in `business_reviews` table, rating recalculated

### 4. Messaging System

**What it does:** Real-time messaging between users, sellers, and businesses.

**How it works:**
- Three types of conversations:
  - **Neighbor chats:** Direct messages between users
  - **Item chats:** Marketplace-specific conversations
  - **Business chats:** Customer-to-business messages
- Real-time updates via Supabase WebSocket subscriptions
- Typing indicators show when users are typing
- Read receipts track message read status
- Image sharing supported

**Key Files:**
- `src/components/MessagesScreen.tsx` - Conversation list
- `src/components/ConversationScreen.tsx` - Chat interface
- `src/lib/chat-service.ts` - Messaging logic
- `src/lib/supabase-chat-service.ts` - Supabase-specific chat operations

**Logic Flow:**
1. User opens messages → Conversations fetched from `conversations` table
2. User selects conversation → Messages loaded from `messages` or `chat_messages` table
3. Real-time subscription set up → Listens for new messages
4. User sends message → Inserted into database
5. Real-time subscription triggers → Other participant sees message instantly
6. Typing indicator → Updates via real-time channel
7. Read receipts → Updated when user views messages

### 5. Events

**What it does:** Users can create and discover local events.

**How it works:**
- Events are posts with category "Event"
- Include date, time, location (with coordinates), description
- Users can RSVP/attend events
- Events appear in feed and on map view
- Location-based filtering shows nearby events

**Key Files:**
- `src/components/EventsScreen.tsx` - Events listing
- `src/components/CreateEventDialog.tsx` - Event creation
- `src/components/EventCard.tsx` - Event display

**Logic Flow:**
1. User creates event post → Stored in `posts` table with event fields
2. Event appears in feed and events page
3. Other users see event → Can RSVP (added to `attendees` array)
4. Event appears on map → Marker placed at event location
5. Event date passes → Can be filtered out or archived

### 6. Community/Neighbors

**What it does:** Friend system for connecting with neighbors.

**How it works:**
- Users can send friend requests
- Friend requests can be accepted or declined
- Friends can see each other's posts, share location, and message
- Friend list stored in `users.friends` array
- Friend requests tracked in `friend_requests` table

**Key Files:**
- `src/components/ProfileScreen.tsx` - User profiles with friend actions
- `src/hooks/use-friend-requests.tsx` - Friend request management
- `src/components/FriendsList.tsx` - Friends display

**Logic Flow:**
1. User views another user's profile → Can send friend request
2. Friend request created → Entry in `friend_requests` table
3. Recipient receives notification → Can accept or decline
4. If accepted → Both users added to each other's `friends` array
5. Friends can now see each other's posts, share location, message freely

### 7. Interactive Map

**What it does:** Visual map showing events, businesses, and friends' locations.

**How it works:**
- Uses Leaflet/Google Maps for rendering
- Displays markers for:
  - Events (with date/time info)
  - Businesses (with ratings)
  - Friends (if location sharing enabled)
- Clicking markers shows details
- Location-based filtering

**Key Files:**
- `src/components/MapScreen.tsx` - Map view component
- Uses Leaflet for map rendering
- Google Maps API for places autocomplete

**Logic Flow:**
1. User opens map → Fetches events, businesses, friends with locations
2. Coordinates extracted from location data
3. Markers placed on map with appropriate icons
4. User clicks marker → Details shown in popup
5. Real-time updates when new events/businesses added

### 8. Escrow & Payments

**What it does:** Secure payment processing for marketplace transactions.

**How it works:**
- Flutterwave integration for payment processing
- Escrow holds funds until delivery confirmation
- 2% platform commission
- Multiple payment methods: card, bank transfer, mobile money
- Dispute resolution system
- Seller payout management with verification

**Key Files:**
- `src/lib/escrow-service.ts` - Escrow transaction management
- `src/lib/flutterwave-service.ts` - Payment gateway integration
- `src/lib/payout-service.ts` - Seller payout processing
- `src/app/api/payment/verify/route.ts` - Payment verification endpoint

**Logic Flow:**
1. Buyer initiates purchase → Escrow transaction created (status: "pending")
2. Payment processed via Flutterwave → Transaction reference stored
3. Payment verified via webhook/API → Status updated to "paid"
4. Seller ships item → Status updated to "shipped"
5. Buyer confirms delivery → Status updated to "delivered"
6. Funds released to seller (minus 2% commission) → Status "completed"
7. If dispute → Status "disputed", admin reviews and resolves

### 9. Notifications

**What it does:** Real-time notifications for user activity.

**How it works:**
- Notification types: friend requests, messages, comments, likes, event invites
- Stored in `notifications` table
- Real-time updates via Supabase subscriptions
- Push notifications via Web Push API
- User can configure notification preferences

**Key Files:**
- `src/lib/notification-service.ts` - Notification creation/management
- `src/hooks/use-notifications.tsx` - Notification state management
- `src/components/NotificationsDropdown.tsx` - Notification UI
- `src/components/PushNotificationManager.tsx` - Push notification handling

**Logic Flow:**
1. User action triggers notification → Database trigger or service creates notification
2. Notification stored in `notifications` table
3. Real-time subscription notifies user → UI updates
4. Push notification sent (if enabled) → Browser shows notification
5. User clicks notification → Navigates to relevant page
6. Notification marked as read → Status updated in database

### 10. User Profiles & Onboarding

**What it does:** User profile management and guided onboarding flow.

**How it works:**
- Multi-step onboarding: signup → email verification → profile setup → welcome → tour
- Profile includes: name, avatar, bio, location, interests
- Location data: state, LGA (Local Government Area), ward
- Profile completion tracked in `users.onboarding_status`
- Onboarding guard redirects incomplete users

**Key Files:**
- `src/components/ProfileScreen.tsx` - Profile display and editing
- `src/components/OnboardingGuard.tsx` - Onboarding flow enforcement
- `src/app/onboarding/` - Onboarding pages
- `src/hooks/use-onboarding.tsx` - Onboarding state management

**Logic Flow:**
1. User signs up → Account created in Supabase Auth
2. User profile created in `users` table → Status: "signup"
3. Email verification → Status: "email_verification"
4. User completes profile → Status: "profile_setup"
5. Welcome message → Status: "welcome"
6. Tour completed → Status: "tour"
7. Onboarding complete → Status: "completed"
8. Incomplete users redirected to appropriate onboarding step

---

## Important Files & Modules

### Authentication

**`src/lib/auth-service.ts`**
- Handles all authentication operations
- Methods: `signUp`, `signIn`, `signInWithGoogle`, `signInWithApple`, `signOut`
- User profile creation and management
- Session management

**`src/hooks/use-supabase-auth.tsx`**
- React context provider for auth state
- Exposes `useAuth()` hook for components
- Manages user and profile state
- Real-time profile updates

### Database & API

**`src/lib/supabase.ts`**
- Supabase client initialization
- Two clients: public (client-side) and admin (server-side)
- Type definitions for database schema

### Messaging

**`src/lib/chat-service.ts`**
- High-level chat operations
- Create/get conversations
- Send messages
- Real-time subscriptions

**`src/lib/supabase-chat-service.ts`**
- Supabase-specific chat operations
- Handles different chat types (neighbor, item, business)

### Payments

**`src/lib/escrow-service.ts`**
- Escrow transaction management
- Create, update, and query transactions
- Status transitions (pending → paid → shipped → delivered → completed)
- Commission calculation (2%)

**`src/lib/flutterwave-service.ts`**
- Flutterwave payment gateway integration
- Initialize payments
- Verify payment status
- Handle webhooks

**`src/lib/payout-service.ts`**
- Seller payout management
- Payout request creation
- Account verification
- Payout processing

### Notifications

**`src/lib/notification-service.ts`**
- Create notifications
- Mark as read/unread
- Clear notifications
- Notification preferences

**`src/lib/notification-triggers.ts`**
- Database triggers for automatic notifications
- Friend request notifications
- Message notifications
- Comment/like notifications

### Location & Filtering

**`src/lib/location-filter-service.ts`**
- Location-based filtering logic
- Filters posts/items by user's location
- Supports hierarchical location (state → LGA → ward)

**`src/hooks/use-location-data.ts`**
- Nigerian location data management
- States, LGAs, wards data
- Location selection helpers

### Business Logic

**`src/lib/catalog-service.ts`**
- Business catalog item management
- CRUD operations for catalog items

**`src/lib/review-service.ts`**
- Business review system
- Create reviews
- Calculate ratings
- Query reviews

**`src/lib/dispute-service.ts`**
- Dispute resolution system
- Create disputes
- Admin dispute management
- Resolution tracking

### Data Fetching

**`src/hooks/use-posts.tsx`**
- Post data fetching and management
- Create, update, delete posts
- Real-time post updates
- Location filtering

**`src/hooks/use-notifications.tsx`**
- Notification state management
- Fetch notifications
- Mark as read
- Real-time notification updates

### Critical Business Logic

**Escrow Transaction Flow:**
- Located in `src/lib/escrow-service.ts`
- Ensures secure payment processing
- Handles commission calculation
- Manages transaction status lifecycle

**Real-time Updates:**
- All real-time functionality uses Supabase subscriptions
- Components set up channels in `useEffect` hooks
- Cleanup subscriptions on unmount
- Prevents duplicate updates with existence checks

**Location-Based Filtering:**
- Posts and items filtered by user's location hierarchy
- Supports state, LGA, and ward-level filtering
- Implemented in database queries and client-side filtering

---

## Data Flow

### Example: Creating a Post

1. **User Action:** User fills out post form and clicks "Post"
2. **Component:** `CreatePostDialog` calls `createPost` from `usePosts` hook
3. **Hook:** `usePosts` calls Supabase client to insert into `posts` table
4. **Database:** Post inserted, triggers fire (notifications, activity tracking)
5. **Real-time:** Supabase broadcasts INSERT event via WebSocket
6. **Subscriptions:** All subscribed clients receive update
7. **UI Update:** Feed components re-render with new post
8. **Notifications:** Affected users receive notifications (if applicable)

### Example: Marketplace Purchase

1. **User Action:** Buyer clicks "Buy" on marketplace item
2. **Component:** `BuyButton` calls `EscrowService.createTransaction()`
3. **Service:** Escrow transaction created in database (status: "pending")
4. **Payment:** Flutterwave payment initialized, redirects to payment page
5. **Payment Complete:** Flutterwave webhook/API call to `/api/payment/verify`
6. **Verification:** `FlutterwaveService.verifyPayment()` confirms payment
7. **Update:** `EscrowService.updateStatus()` sets status to "paid"
8. **Notification:** Seller receives notification of payment
9. **Shipping:** Seller marks as shipped → Status "shipped"
10. **Delivery:** Buyer confirms delivery → Status "delivered"
11. **Completion:** Funds released to seller → Status "completed"
12. **Payout:** Seller can request payout via `PayoutService`

### Example: Sending a Message

1. **User Action:** User types message and clicks send
2. **Component:** `ConversationScreen` calls `ChatService.sendMessage()`
3. **Service:** Message inserted into `messages` or `chat_messages` table
4. **Database:** Message stored, conversation `last_message` updated
5. **Real-time:** Supabase broadcasts INSERT event
6. **Subscriptions:** Both participants' subscriptions receive update
7. **UI Update:** Both chat interfaces show new message instantly
8. **Read Receipt:** When recipient views, `markMessagesAsRead()` updates read status
9. **Notification:** If recipient offline, notification created

---

## Authentication & Authorization

### How Users Are Authenticated

**Authentication Flow:**
1. User signs up with email/password OR OAuth (Google/Apple)
2. Supabase Auth creates account in `auth.users` table
3. User profile automatically created in `public.users` table
4. Session stored in browser (localStorage/cookies)
5. Session auto-refreshed by Supabase client

**Authentication Methods:**
- **Email/Password:** Traditional signup/login
- **Google OAuth:** Redirects to Google, returns with token
- **Apple Sign-In:** Similar OAuth flow for Apple
- **Password Reset:** Email sent via Brevo, link resets password

**Key Files:**
- `src/lib/auth-service.ts` - Authentication operations
- `src/hooks/use-supabase-auth.tsx` - Auth state management
- `src/app/auth/callback/page.tsx` - OAuth callback handler

### How Permissions/Roles Are Handled

**Row Level Security (RLS):**
- Supabase RLS policies enforce permissions at database level
- Policies defined in migration files (`docs/migrations/`)
- Users can only:
  - Read their own data and public data
  - Update/delete their own posts, messages, etc.
  - Access conversations they're part of

**Authorization Logic:**
- **Ownership Checks:** Users can only edit/delete their own content
- **Conversation Access:** Users can only access conversations they participate in
- **Business Ownership:** Only business owners can edit their business
- **Admin Access:** Admin users (via role check) can access dispute resolution

**RLS Policy Examples:**
- Users can read posts from their location area
- Users can only update their own profile
- Users can only send messages in conversations they're part of
- Sellers can only update their own escrow transactions (as seller)

**Key Files:**
- `docs/migrations/*.sql` - RLS policies defined in migrations
- Components check ownership before allowing actions
- Services verify permissions before database operations

---

## Environment & Configuration

### Environment Variables

Required environment variables (typically in `.env.local`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Flutterwave (Payments)
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your-public-key
FLUTTERWAVE_SECRET_KEY=your-secret-key

# Brevo (Email)
BREVO_API_KEY=your-brevo-api-key

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Maintenance Mode
MAINTENANCE_MODE=false
```

### Build Scripts

**Development:**
- `npm run dev` - Start dev server with Turbopack (port 9002)
- `npm run dev:webpack` - Start dev server with Webpack

**Production:**
- `npm run build` - Build for production (with Turbopack)
- `npm run build:webpack` - Build with Webpack
- `npm start` - Start production server

**Other:**
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking

### Deployment Setup

**Vercel Configuration (`vercel.json`):**
- Framework: Next.js
- Build command: `npm install --legacy-peer-deps && npm run build`
- Install command: `npm install --legacy-peer-deps`

**Deployment Process:**
1. Push code to Git repository
2. Vercel automatically detects Next.js project
3. Builds using configured commands
4. Deploys to Vercel edge network
5. Environment variables configured in Vercel dashboard

**Database Migrations:**
- Run migration files in order from `docs/migrations/`
- Execute via Supabase SQL Editor or CLI
- Migrations create tables, RLS policies, functions, triggers

---

## Potential Issues or Technical Debt

### Code Smells

1. **Duplicate Chat Services:**
   - Both `chat-service.ts` and `supabase-chat-service.ts` exist
   - Some components use one, others use the other
   - **Recommendation:** Consolidate into single service

2. **Mixed State Management:**
   - Some components use SWR, others use direct Supabase calls
   - Inconsistent caching strategies
   - **Recommendation:** Standardize on SWR for data fetching

3. **Location Data Structure Inconsistency:**
   - Some locations use `geopoint.latitude/longitude`
   - Others use `latitude/longitude` directly
   - **Recommendation:** Standardize location structure

4. **Error Handling:**
   - Some services have comprehensive error handling
   - Others rely on Supabase error propagation
   - **Recommendation:** Implement consistent error handling pattern

### Scalability Concerns

1. **Real-time Subscriptions:**
   - Each component sets up its own subscriptions
   - Could lead to too many open connections
   - **Recommendation:** Centralize subscription management

2. **Database Queries:**
   - Some queries fetch full objects when only IDs needed
   - Missing indexes on some frequently queried columns
   - **Recommendation:** Optimize queries, add missing indexes

3. **Image Storage:**
   - Images stored in Supabase Storage
   - No image optimization/compression
   - **Recommendation:** Implement image optimization pipeline

4. **Location Filtering:**
   - Client-side filtering for some queries
   - Could be expensive with large datasets
   - **Recommendation:** Move filtering to database level with PostGIS

### Security Concerns

1. **API Keys:**
   - Some API keys exposed in client-side code
   - **Recommendation:** Move sensitive operations to API routes

2. **RLS Policies:**
   - Some RLS policies may be too permissive
   - **Recommendation:** Audit all RLS policies for security

3. **Input Validation:**
   - Some forms rely only on client-side validation
   - **Recommendation:** Add server-side validation in API routes

4. **Payment Security:**
   - Payment verification happens client-side in some cases
   - **Recommendation:** Move all payment verification to server-side

### Technical Debt

1. **Type Definitions:**
   - Some types defined in multiple places
   - Database types not fully generated from Supabase
   - **Recommendation:** Generate types from Supabase schema

2. **Component Organization:**
   - Some components are very large (1000+ lines)
   - **Recommendation:** Break down into smaller, focused components

3. **Testing:**
   - No visible test files
   - **Recommendation:** Add unit tests for services, integration tests for flows

4. **Documentation:**
   - Limited inline documentation
   - **Recommendation:** Add JSDoc comments to services and complex functions

5. **Migration Files:**
   - Migration files exist but may not be versioned
   - **Recommendation:** Use migration tooling (e.g., Supabase migrations)

---

## Summary

**Yrdly** is a comprehensive neighborhood social network and marketplace platform built with modern web technologies. It combines social networking, e-commerce, and local business discovery into a single, location-aware application.

**Key Strengths:**
- Real-time updates via Supabase WebSockets
- Secure payment processing with escrow protection
- Comprehensive feature set (social, marketplace, businesses, messaging)
- Location-based filtering for local relevance
- Modern tech stack (Next.js 15, React 19, TypeScript)

**Architecture:**
- Frontend: Next.js App Router with React components
- Backend: Supabase (PostgreSQL + Auth + Storage + Realtime)
- Payments: Flutterwave integration
- Real-time: Supabase WebSocket subscriptions

**Core Functionality:**
1. Social feed with location-based posts
2. Marketplace with escrow-protected transactions
3. Business directory with catalog and reviews
4. Real-time messaging system
5. Event creation and discovery
6. Friend/neighbor connections
7. Interactive map view
8. Comprehensive notification system

**Data Flow:**
User actions → React components → Hooks/Services → Supabase API → PostgreSQL database → Real-time subscriptions → UI updates

**Security:**
- Row Level Security (RLS) policies enforce permissions
- Authentication via Supabase Auth
- Escrow system protects marketplace transactions
- Input validation on forms

**Deployment:**
- Hosted on Vercel
- Database on Supabase
- Environment variables for configuration
- Maintenance mode support

This project represents a production-ready application with a solid foundation, though it would benefit from test coverage, improved error handling consistency, and some code organization improvements.


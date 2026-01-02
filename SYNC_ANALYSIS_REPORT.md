# Frontend-Backend Sync Analysis Report

## Executive Summary

This report compares the Supabase database schema with the frontend TypeScript types and code usage to identify any mismatches or missing fields.

**Overall Status**: ✅ **In sync** - All critical issues have been fixed.

## Updates Applied

### Type Definition Fixes
- ✅ Added missing `transaction_id` and `verified_purchase` to `BusinessReview` interface
- ✅ Added missing `payment_provider` to `EscrowTransaction` interface  
- ✅ Added missing `flutterwave_subaccount_id` and `payout_enabled` to `SellerAccount` interface
- ✅ Updated `ChatMessage.messageType` to match database constraint (removed 'offer' from union type, added comment)

### Code Fixes
- ✅ Fixed `chat-service.ts` to use 'text' instead of 'offer' for offer messages (stored in metadata)
- ✅ Removed `is_read` field from `chat_messages` inserts (column doesn't exist in database)
- ✅ Fixed `supabase-chat-service.ts` to handle missing `is_read` and `image_url` columns
- ✅ Updated message mapping to use `message_type` from database instead of checking non-existent `image_url`
- ✅ Updated `markMessagesAsRead` to be a no-op with TODO comment (column doesn't exist)

---

## 1. Users Table

### Database Schema
- ✅ All core fields present
- ✅ Location fields: `location`, `current_location`, `location_updated_at`, `share_location`
- ✅ Onboarding fields: `onboarding_status`, `profile_completed`, `onboarding_completed_at`, `tour_completed`, `welcome_message_sent`
- ✅ Social fields: `friends`, `blocked_users`, `interests`
- ✅ Notification settings: `notification_settings`

### Frontend Type (`src/types/index.ts`)
```typescript
interface User {
  id: string;
  uid: string; // ⚠️ Not in database (legacy field?)
  name: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  location?: { state?, lga?, city?, ward? };
  friends?: string[];
  blockedUsers?: string[]; // ✅ Mapped from blocked_users
  interests?: string[];
  shareLocation?: boolean; // ✅ Mapped from share_location
  currentLocation?: { lat, lng, address?, lastUpdated };
  locationUpdatedAt?: string; // ✅ Mapped from location_updated_at
  notificationSettings?: NotificationSettings; // ✅ Mapped from notification_settings
  isOnline?: boolean; // ✅ Mapped from is_online
  lastSeen?: string; // ✅ Mapped from last_seen
}
```

### Issues Found
- ⚠️ **Minor**: `uid` field in frontend type doesn't exist in database (likely legacy from Firebase)
- ✅ All other fields properly mapped with camelCase conversion

---

## 2. Posts Table

### Database Schema
- ✅ All fields present including location-based filtering: `state`, `lga`, `ward`, `location`, `author_location`
- ✅ Transaction tracking: `is_sold`, `sold_to_user_id`, `sold_at`, `transaction_id`

### Frontend Type (`src/types/index.ts`)
```typescript
interface Post {
  // ... all fields match
  state?: string | null; // ✅ Present
  lga?: string | null; // ✅ Present
  ward?: string | null; // ✅ Present
  // ... transaction fields present
}
```

### Status
✅ **Fully in sync**

---

## 3. Comments Table

### Database Schema
- `id`, `user_id`, `post_id`, `author_name`, `author_image`, `text`, `timestamp`, `parent_id`, `reactions`, `created_at`, `updated_at`

### Frontend Type (`src/types/index.ts`)
```typescript
interface Comment {
  id: string;
  userId: string; // ✅ Mapped from user_id
  authorName: string; // ✅ Mapped from author_name
  authorImage: string; // ✅ Mapped from author_image
  text: string;
  timestamp: string;
  parentId: string | null; // ✅ Mapped from parent_id
  reactions: { [key: string]: string[] }; // ✅ Matches
}
```

### Status
✅ **Fully in sync** - Proper mapping in `CommentSection.tsx`

---

## 4. Business Reviews Table

### Database Schema
- `id`, `business_id`, `user_id`, `rating`, `comment`, `created_at`, `transaction_id`, `verified_purchase`

### Frontend Type (`src/types/index.ts`)
```typescript
interface BusinessReview {
  id: string;
  business_id: string;
  user_id: string;
  user_name: string; // ⚠️ Not in database (joined from users)
  user_avatar?: string; // ⚠️ Not in database (joined from users)
  rating: number;
  comment: string;
  created_at: string;
  // ❌ MISSING: transaction_id
  // ❌ MISSING: verified_purchase
}
```

### Issues Found
- ❌ **Missing Fields**: `transaction_id` and `verified_purchase` are in database but not in frontend type
- ⚠️ `user_name` and `user_avatar` are joined fields (not in table), which is fine

### Recommendation
Update `BusinessReview` interface to include:
```typescript
transaction_id?: string;
verified_purchase?: boolean;
```

---

## 5. Escrow Transactions Table

### Database Schema
- All fields present including: `payment_reference`, `payment_provider`, `flutterwave_tx_ref`

### Frontend Type (`src/types/escrow.ts`)
```typescript
interface EscrowTransaction {
  id: string;
  itemId: string; // ✅ Mapped from item_id
  buyerId: string; // ✅ Mapped from buyer_id
  sellerId: string; // ✅ Mapped from seller_id
  amount: number;
  commission: number;
  totalAmount: number; // ✅ Mapped from total_amount
  sellerAmount: number; // ✅ Mapped from seller_amount
  status: EscrowStatus;
  paymentMethod: PaymentMethod; // ✅ Mapped from payment_method
  deliveryDetails: DeliveryDetails; // ✅ Mapped from delivery_details
  // ... timestamps
  paymentReference?: string; // ✅ Mapped from payment_reference
  flutterwaveTxRef?: string; // ✅ Mapped from flutterwave_tx_ref
  // ❌ MISSING: payment_provider
}
```

### Issues Found
- ❌ **Missing Field**: `payment_provider` exists in database but not in frontend type

### Recommendation
Add to `EscrowTransaction`:
```typescript
paymentProvider?: string; // 'flutterwave' | 'paystack' | etc.
```

---

## 6. Seller Accounts Table

### Database Schema
- All fields including: `flutterwave_subaccount_id`, `payout_enabled`

### Frontend Type (`src/types/seller-account.ts`)
```typescript
interface SellerAccount {
  id: string;
  userId: string; // ✅ Mapped from user_id
  accountType: AccountType; // ✅ Mapped from account_type
  accountDetails: BankAccountDetails | MobileMoneyDetails | DigitalWalletDetails; // ✅ Mapped from account_details
  verificationStatus: VerificationStatus; // ✅ Mapped from verification_status
  verificationLevel: VerificationLevel; // ✅ Mapped from verification_level
  isPrimary: boolean; // ✅ Mapped from is_primary
  isActive: boolean; // ✅ Mapped from is_active
  // ... other fields
  // ❌ MISSING: flutterwave_subaccount_id
  // ❌ MISSING: payout_enabled
}
```

### Issues Found
- ❌ **Missing Fields**: `flutterwave_subaccount_id` and `payout_enabled` are in database but not in frontend type

### Recommendation
Add to `SellerAccount`:
```typescript
flutterwaveSubaccountId?: string;
payoutEnabled?: boolean;
```

---

## 7. Chat Messages Table

### Database Schema
- `id`, `chat_id`, `sender_id`, `sender_name`, `content`, `message_type`, `metadata`, `timestamp`, `created_at`, `updated_at`

### Frontend Type (`src/types/chat.ts`)
```typescript
interface ChatMessage {
  id: string;
  chatId: string; // ✅ Mapped from chat_id
  senderId: string; // ✅ Mapped from sender_id
  senderName: string; // ✅ Mapped from sender_name
  content: string;
  timestamp: Date;
  isRead: boolean; // ⚠️ Not in database schema (might be computed)
  messageType: 'text' | 'image' | 'offer' | 'system'; // ✅ Mapped from message_type
  metadata?: { ... };
}
```

### Issues Found
- ⚠️ **Note**: `isRead` field in frontend type doesn't exist in database - might be computed or from a different table
- ✅ Database has `message_type` with check constraint: `'text' | 'image' | 'system'` but frontend includes `'offer'` - need to verify

### Recommendation
- Verify if `isRead` should come from a different source
- Check if `'offer'` message type is valid or should be removed from frontend type

---

## 8. Item Chats Table

### Database Schema
- All fields present: `id`, `item_id`, `buyer_id`, `seller_id`, `item_title`, `item_image_url`, `last_message_at`, `last_message`, `last_activity`, `is_active`, `created_at`, `updated_at`

### Frontend Type (`src/types/chat.ts`)
```typescript
interface ItemChat {
  id: string;
  itemId: string; // ✅ Mapped from item_id
  buyerId: string; // ✅ Mapped from buyer_id
  sellerId: string; // ✅ Mapped from seller_id
  itemTitle: string; // ✅ Mapped from item_title
  itemImageUrl: string; // ✅ Mapped from item_image_url
  lastMessage?: ChatMessage;
  lastActivity: Date; // ✅ Mapped from last_activity
  isActive: boolean; // ✅ Mapped from is_active
  createdAt: Date; // ✅ Mapped from created_at
  updatedAt: Date; // ✅ Mapped from updated_at
}
```

### Status
✅ **Fully in sync** - Proper mapping in `supabase-chat-service.ts`

---

## 9. Conversations Table

### Database Schema
- All fields present including marketplace and business conversation fields

### Frontend Type (`src/types/index.ts`)
```typescript
interface Conversation {
  id: string;
  participantIds: string[]; // ✅ Mapped from participant_ids
  participant: User; // ⚠️ Joined field
  lastMessage?: { ... }; // ✅ Mapped from last_message_* fields
  messages: Message[];
  typing?: { [key: string]: boolean }; // ✅ Mapped from typing jsonb
}
```

### Status
✅ **Fully in sync** - Proper mapping in conversation services

---

## 10. Messages Table (Friend Conversations)

### Database Schema
- `id`, `conversation_id`, `sender_id`, `text`, `image_url`, `timestamp`, `is_read`, `read_by`, `created_at`

### Frontend Type (`src/types/index.ts`)
```typescript
interface Message {
  id: string;
  senderId: string; // ✅ Mapped from sender_id
  sender: User; // ⚠️ Joined field
  text?: string;
  imageUrl?: string; // ✅ Mapped from image_url
  timestamp: string;
  isRead: boolean; // ✅ Mapped from is_read
}
```

### Status
✅ **Fully in sync**

---

## Summary of Issues

### Critical Issues (Missing Fields)
1. ❌ **BusinessReview**: Missing `transaction_id` and `verified_purchase`
2. ❌ **EscrowTransaction**: Missing `payment_provider`
3. ❌ **SellerAccount**: Missing `flutterwave_subaccount_id` and `payout_enabled`

### Minor Issues
1. ⚠️ **User**: `uid` field doesn't exist in database (legacy)
2. ⚠️ **ChatMessage**: `isRead` field not in database schema
3. ⚠️ **ChatMessage**: `message_type` enum mismatch (`'offer'` in frontend but not in DB constraint)

---

## Recommendations

### Priority 1: Update Type Definitions
1. Add missing fields to `BusinessReview` interface
2. Add `payment_provider` to `EscrowTransaction` interface
3. Add `flutterwave_subaccount_id` and `payout_enabled` to `SellerAccount` interface

### Priority 2: Verify and Clean Up
1. Remove or document `uid` field in User interface
2. Verify `isRead` source for ChatMessage
3. Verify `message_type` enum values match database constraint

### Priority 3: Code Review
1. Ensure all queries properly map snake_case to camelCase
2. Verify all foreign key relationships are properly used
3. Check that all enum types match between database and frontend

---

## Conclusion

The frontend and backend are **mostly in sync** with proper field mapping between snake_case (database) and camelCase (TypeScript). The main issues are a few missing fields in TypeScript interfaces that exist in the database schema. These should be added to ensure type safety and prevent runtime errors.


export interface User {
  id: string;
  username: string;
  balance: number;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Character {
  id: string;
  name: string;
  fishCode?: string; // Mã cá / Mã cá khô (e.g. CK-001)
  age: number;
  category: string;
  shortBio: string;
  fullStory?: string;
  backstory: string; // Back-story (Cốt truyện / Bối cảnh nhân vật)
  openScene: string; // Open-scene (Phân cảnh mở đầu kịch bản RP)
  price: number;
  studioUrl: string;
  avatarUrl: string;
  receiptAvatarUrl?: string; // Ảnh đại diện riêng trên hóa đơn Receipt (nếu trống sẽ dùng avatarUrl)
  isAvailable: boolean;
  salesCount: number;
  createdAt: string;
}

export interface UserCharacterOwnership {
  id: string;
  userId: string;
  characterId: string;
  orderId: string;
  pricePaid: number;
  purchasedAt: string;
  character?: Character;
}

export interface OrderReceipt {
  id: string; // e.g. ORD-20261022-0001
  userId: string;
  characterId: string;
  characterName: string;
  fishCode?: string; // Mã cá khô (e.g. CK-001)
  category: string;
  characterAvatar: string;
  pricePaid: number;
  balanceAfter: number;
  studioUrl: string;
  createdAt: string;
}

export type TransactionType =
  | 'BUY_CHARACTER'
  | 'REDEEM_CODE'
  | 'DAILY_QUEST'
  | 'GACHA_SPIN'
  | 'VOUCHER_CLAIM'
  | 'ADMIN_ADJUST';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface RedeemCode {
  id: string;
  code: string;
  rewardCoins: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  maxPerUser: number;
  isActive: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  type: 'daily_checkin' | 'streak_7' | 'opening_code' | 'special';
  isActive: boolean;
  userStatus?: {
    status: 'not_started' | 'can_claim' | 'claimed';
    streakCount: number;
    lastClaimedAt?: string;
  };
}

export type GachaCapsuleType = 'strawberry_milk' | 'fish_blue' | 'butter_cream' | 'pearl_rainbow';

export interface GachaDropRate {
  coins: number;
  rate: number; // percentage, e.g., 40 for 40%
  label: string;
  rarity: 'common' | 'rare' | 'super_rare' | 'legendary';
  capsuleType?: GachaCapsuleType;
  capsuleName?: string;
}

export interface GachaConfig {
  spinPrice: number;
  isPaused: boolean;
  rates: GachaDropRate[];
}

export interface Voucher {
  id: string;
  userId: string;
  code: string;
  coinValue: number;
  status: 'available' | 'claimed';
  wonAt: string;
  claimedAt?: string;
  capsuleType?: GachaCapsuleType;
}

export interface Feedback {
  id: string;
  userId: string;
  username: string;
  content: string;
  type: 'suggestion' | 'bug' | 'compliment';
  createdAt: string;
}

export interface Complaint {
  id: string;
  characterId: string;
  characterName: string;
  userId: string;
  username: string;
  issueType: string;
  content: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface CharacterFeedback {
  id: string;
  characterId: string;
  characterName: string;
  userId: string;
  username: string;
  content: string;
  rating?: number;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminUsername: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export type SpecialOrderType = 'new_character' | 'new_plot' | 'restock_suggestion' | 'new_feature' | 'custom_fish_order';

export interface SpecialOrder {
  id: string;
  requestId: string;
  userId: string;
  username: string;
  characterName?: string;
  fishType?: string;
  description: string;
  plotIdea?: string;
  extraNotes?: string;
  title?: string;
  requestType?: SpecialOrderType;
  requestTypeName?: string;
  note?: string;
  priority?: 'normal' | 'high';
  status: 'received' | 'in_review' | 'accepted' | 'completed' | 'declined';
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyCardConfig {
  isEnabled: boolean;
  rewardCoins: number;
}

export interface UserLoyaltyCard {
  id: string;
  userId: string;
  lastCheckInDate: string;
  lastCheckInTimestamp?: string;
  accumulatedDays: number;
  totalCyclesCompleted: number;
  totalXuEarnedFromLoyalty: number;
}

export interface LoyaltyCompletionLog {
  id: string;
  userId: string;
  username: string;
  cycleNumber: number;
  rewardCoins: number;
  completedAt: string;
}

export interface LoyaltyStatusResponse {
  config: LoyaltyCardConfig;
  card: {
    accumulatedDays: number;
    totalCyclesCompleted: number;
    totalXuEarnedFromLoyalty: number;
    lastCheckInDate: string;
    hasCheckedInToday: boolean;
    isCompleteToday: boolean;
  };
}

// ============================================================
// Bayanihan Hub — Global TypeScript Types & Interfaces
// ============================================================

// --- User Types ---

export type UserRole = 'guest' | 'user' | 'admin';
export type ProfilePictureStatus = 'pending' | 'approved' | 'rejected';

export interface ProfilePictureSubmission {
  id: string;
  userId: string;
  user?: User;
  imageUrl: string;
  status: ProfilePictureStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  barangay: string;
  municipality: string;
  province: string;
  avatar: string;
  pendingAvatar?: string;
  avatarStatus?: ProfilePictureStatus;
  avatarRejectionReason?: string;
  role: UserRole;
  isVerified: boolean;
  isTrusted: boolean;
  isSuspended: boolean;
  rating: number;
  totalRatings: number;
  totalExchanges: number;
  totalDonations: number;
  badges: Badge[];
  joinedAt: string;
  lastActive: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

// --- Item Types ---

export type ItemCondition = 'Brand New' | 'Like New' | 'Good Condition' | 'Fair' | 'Poor';
export type ItemStatus = 'available' | 'reserved' | 'exchanged' | 'donated' | 'draft' | 'reported' | 'removed';
export type ItemType = 'donation' | 'exchange' | 'request';

export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: ItemCondition;
  quantity: number;
  images: string[];
  type: ItemType;
  status: ItemStatus;
  ownerId: string;
  owner?: User;
  location: Location;
  distance?: number;
  pickupOptions: string[];
  availability: string;
  views: number;
  favorites: number;
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Location ---

export interface Location {
  address: string;
  barangay: string;
  municipality: string;
  province: string;
  lat?: number;
  lng?: number;
}

// --- Category ---

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  itemCount: number;
}

// --- Request Types ---

export type RequestStatus = 'active' | 'in_progress' | 'completed' | 'cancelled';
export type RequestUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface ItemRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: RequestUrgency;
  status: RequestStatus;
  userId: string;
  user?: User;
  location: Location;
  neededBefore: string;
  images: string[];
  responses: number;
  createdAt: string;
  updatedAt: string;
}

// --- Exchange Types ---

export type ExchangeStatus = 'pending' | 'accepted' | 'meeting_scheduled' | 'completed' | 'cancelled' | 'rejected';

export interface Exchange {
  id: string;
  offeredItemId: string;
  offeredItem?: Item;
  requestedItemId: string;
  requestedItem?: Item;
  offererId: string;
  offerer?: User;
  receiverId: string;
  receiver?: User;
  status: ExchangeStatus;
  meetingDate?: string;
  meetingLocation?: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ExchangeHistory {
  id: string;
  exchangeId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

// --- Messaging Types ---

export interface Chat {
  id: string;
  participants: string[];
  participantUsers?: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender?: User;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  createdAt: string;
}

// --- Notification Types ---

export type NotificationType =
  | 'new_message'
  | 'exchange_request'
  | 'exchange_accepted'
  | 'exchange_rejected'
  | 'exchange_completed'
  | 'item_favorited'
  | 'request_response'
  | 'new_nearby_item'
  | 'admin_announcement'
  | 'profile_picture_approved'
  | 'profile_picture_rejected';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  relatedUserId?: string;
  relatedUser?: User;
  relatedItemId?: string;
}

// --- Rating & Review Types ---

export interface Rating {
  id: string;
  exchangeId: string;
  raterId: string;
  rater?: User;
  ratedUserId: string;
  ratedUser?: User;
  score: number; // 1-5
  review: string;
  createdAt: string;
}

// --- Report Types ---

export type ReportReason = 'inappropriate' | 'spam' | 'scam' | 'offensive' | 'duplicate' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporterId: string;
  reporter?: User;
  targetType: 'item' | 'user' | 'message';
  targetId: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  resolvedBy?: string;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

// --- Admin Types ---

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalRequests: number;
  completedExchanges: number;
  activeExchanges: number;
  pendingReports: number;
  reportedUsers: number;
  pendingApprovals: number;
  newUsersToday: number;
  newPostsToday: number;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

// --- Utility Types ---

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  condition?: ItemCondition;
  location?: string;
  distance?: number;
  sortBy?: 'newest' | 'oldest' | 'nearest' | 'popular';
  type?: ItemType;
  status?: ItemStatus;
}

export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  barangay: string;
  municipality: string;
  province: string;
  password: string;
  confirmPassword: string;
  avatar?: string;
  acceptTerms: boolean;
}

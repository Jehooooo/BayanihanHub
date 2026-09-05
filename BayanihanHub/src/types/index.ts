// ============================================================
// Bayanihan Hub — Global TypeScript Types & Interfaces
// ============================================================

// --- User Types ---

export type UserRole = 'guest' | 'user' | 'admin';
export type ProfilePictureStatus = 'pending' | 'approved' | 'rejected';

// --- Identity Verification Types ---

export type PhilippineIdType =
  | "Philippine National ID / PhilSys ID"
  | "Driver's License"
  | "Philippine Passport"
  | "UMID (Unified Multi-Purpose ID)"
  | "Postal ID"
  | "PRC ID (Professional Regulation Commission)"
  | "Senior Citizen ID"
  | "PWD ID"
  | "Voter's Certificate / Voter's ID"
  | "SSS ID"
  | "GSIS eCard"
  | "TIN ID"
  | "PhilHealth ID"
  | "Pag-IBIG Loyalty Card"
  | "School ID"
  | "Other Government-Issued ID";

export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUIRES_REVIEW';
export type FacialVerificationStatus = 'PASSED' | 'FAILED' | 'NOT_STARTED';
export type IdVerificationStatus = 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'VERIFIED' | 'REJECTED' | 'RETRY_REQUIRED';

export interface IdTypeConfig {
  type: PhilippineIdType;
  label: string;
  numberLabel: string;
  formatPlaceholder: string;
  formatHint: string;
  requiresExpiration: boolean;
  extraFieldLabel?: string;
  extraFieldPlaceholder?: string;
  helpText: string;
}

export interface IdentityVerificationRecord {
  id: string;
  userId: string;
  user?: User;
  idType: PhilippineIdType;
  idNumber: string;
  maskedIdNumber: string;
  fullNameOnId: string;
  dob: string;
  expirationDate?: string;
  extraInfo?: string;
  idDocumentUrl: string;
  faceImageUrl: string;
  status: VerificationStatus;
  provider: string;
  confidenceScore: number;
  matchDetails: {
    faceMatch: boolean;
    nameMatch: boolean;
    livenessVerified: boolean;
  };
  rejectionReason?: string;
  retryInstructions?: string;
  submittedAt: string;
  verifiedAt?: string;
  reviewedBy?: string;
}

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
  account_status?: AccountStatus;
  facial_verification_status?: FacialVerificationStatus;
  id_verification_status?: IdVerificationStatus;
  verificationStatus?: VerificationStatus;
  verificationCompletedAt?: string;
  verificationId?: string;
  idType?: PhilippineIdType;
  maskedIdNumber?: string;
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
  | 'profile_picture_rejected'
  | 'identity_verification_approved'
  | 'identity_verification_rejected'
  | 'system';

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
  // Identity & Face Verification
  idType?: PhilippineIdType;
  idNumber?: string;
  fullNameOnId?: string;
  dob?: string;
  expirationDate?: string;
  extraInfo?: string;
  idDocumentUrl?: string;
  faceImageUrl?: string;
  verificationConfidence?: number;
  account_status?: AccountStatus;
  facial_verification_status?: FacialVerificationStatus;
  id_verification_status?: IdVerificationStatus;
}

export const PHILIPPINE_ID_CONFIGS: Record<PhilippineIdType, IdTypeConfig> = {
  "Philippine National ID / PhilSys ID": {
    type: "Philippine National ID / PhilSys ID",
    label: "Philippine National ID (PhilSys)",
    numberLabel: "PhilSys Card Number (PCN)",
    formatPlaceholder: "1234-5678-9012-3456",
    formatHint: "16-digit PhilSys Card Number printed on the card",
    requiresExpiration: false,
    helpText: "Permanent National ID for Filipino citizens with no expiration date.",
  },
  "Driver's License": {
    type: "Driver's License",
    label: "LTO Driver's License",
    numberLabel: "License Number",
    formatPlaceholder: "N01-23-456789",
    formatHint: "Format: A00-00-000000",
    requiresExpiration: true,
    helpText: "Official Land Transportation Office (LTO) driver's license card.",
  },
  "Philippine Passport": {
    type: "Philippine Passport",
    label: "Philippine Passport (DFA)",
    numberLabel: "Passport Number",
    formatPlaceholder: "P1234567A",
    formatHint: "Format: 1 Letter followed by 7-8 digits/characters",
    requiresExpiration: true,
    helpText: "Department of Foreign Affairs issued passport biodata page.",
  },
  "UMID (Unified Multi-Purpose ID)": {
    type: "UMID (Unified Multi-Purpose ID)",
    label: "Unified Multi-Purpose ID (UMID)",
    numberLabel: "Common Reference Number (CRN)",
    formatPlaceholder: "0000-1234567-8",
    formatHint: "12-digit CRN printed on the upper right of the card",
    requiresExpiration: false,
    helpText: "Issued by SSS/GSIS to government and private sector workers.",
  },
  "Postal ID": {
    type: "Postal ID",
    label: "PHLPost Postal ID",
    numberLabel: "Postal Reference Number (PRN)",
    formatPlaceholder: "123 456 789 012",
    formatHint: "12-digit barcode or PRN number on card front",
    requiresExpiration: true,
    helpText: "Digitized Postal ID issued by the Philippine Postal Corporation.",
  },
  "PRC ID (Professional Regulation Commission)": {
    type: "PRC ID (Professional Regulation Commission)",
    label: "Professional Regulation Commission (PRC) ID",
    numberLabel: "Registration Number",
    formatPlaceholder: "0123456",
    formatHint: "7-digit Professional License Number",
    requiresExpiration: true,
    extraFieldLabel: "Profession / Specialization",
    extraFieldPlaceholder: "e.g. Registered Nurse, Civil Engineer",
    helpText: "Valid PRC identification card for licensed professionals.",
  },
  "Senior Citizen ID": {
    type: "Senior Citizen ID",
    label: "Senior Citizen ID (OSCA)",
    numberLabel: "OSCA Control Number",
    formatPlaceholder: "SC-1234-5678",
    formatHint: "Control number issued by your Local Government OSCA",
    requiresExpiration: false,
    extraFieldLabel: "Issuing LGU / Municipality",
    extraFieldPlaceholder: "e.g. San Fernando, La Union",
    helpText: "Office for Senior Citizens Affairs identification card.",
  },
  "PWD ID": {
    type: "PWD ID",
    label: "Persons with Disability (PWD) ID",
    numberLabel: "Persons with Disability ID Number",
    formatPlaceholder: "PWD-01234-567",
    formatHint: "Issued by Municipal / City PDAO or MSWDO",
    requiresExpiration: false,
    extraFieldLabel: "Issuing Municipality / City",
    extraFieldPlaceholder: "e.g. Aringay, La Union",
    helpText: "Official PWD identification card issued by the local PDAO.",
  },
  "Voter's Certificate / Voter's ID": {
    type: "Voter's Certificate / Voter's ID",
    label: "COMELEC Voter's ID / Certificate",
    numberLabel: "Voter Identification Number (VIN)",
    formatPlaceholder: "0123-4567A-B890CDE12345",
    formatHint: "COMELEC Voter Identification Number",
    requiresExpiration: false,
    helpText: "Issued by the Commission on Elections (COMELEC).",
  },
  "SSS ID": {
    type: "SSS ID",
    label: "Social Security System (SSS) ID",
    numberLabel: "SSS Number",
    formatPlaceholder: "01-2345678-9",
    formatHint: "10-digit SSS member number format: XX-XXXXXXX-X",
    requiresExpiration: false,
    helpText: "Social Security System member identity card.",
  },
  "GSIS eCard": {
    type: "GSIS eCard",
    label: "GSIS eCard / UMID",
    numberLabel: "GSIS Business Partner (BP) Number",
    formatPlaceholder: "2000123456",
    formatHint: "10-digit GSIS BP number",
    requiresExpiration: false,
    helpText: "Government Service Insurance System identity card for civil servants.",
  },
  "TIN ID": {
    type: "TIN ID",
    label: "Bureau of Internal Revenue (BIR) TIN Card",
    numberLabel: "Tax Identification Number (TIN)",
    formatPlaceholder: "123-456-789-000",
    formatHint: "9 to 12 digit Tax Identification Number format",
    requiresExpiration: false,
    helpText: "Official BIR Tax Identification Number card.",
  },
  "PhilHealth ID": {
    type: "PhilHealth ID",
    label: "PhilHealth Identification Card (PIC)",
    numberLabel: "PhilHealth Identification Number (PIN)",
    formatPlaceholder: "01-234567890-1",
    formatHint: "12-digit PIN format: XX-XXXXXXXXX-X",
    requiresExpiration: false,
    helpText: "Philippine Health Insurance Corporation identity card.",
  },
  "Pag-IBIG Loyalty Card": {
    type: "Pag-IBIG Loyalty Card",
    label: "Pag-IBIG Loyalty Card Plus",
    numberLabel: "Member ID (MID)",
    formatPlaceholder: "1234-5678-9012",
    formatHint: "12-digit Pag-IBIG Membership ID number",
    requiresExpiration: true,
    helpText: "Pag-IBIG Fund Loyalty Card Plus with banking chip.",
  },
  "School ID": {
    type: "School ID",
    label: "Accredited School / University ID",
    numberLabel: "Student Identification Number",
    formatPlaceholder: "2024-12345-LU",
    formatHint: "Official Student Registration Number",
    requiresExpiration: true,
    extraFieldLabel: "School / University Name",
    extraFieldPlaceholder: "e.g. Don Mariano Marcos Memorial State University",
    helpText: "Currently enrolled student ID with valid academic year registration sticker.",
  },
  "Other Government-Issued ID": {
    type: "Other Government-Issued ID",
    label: "Other Philippine Government-Issued ID",
    numberLabel: "Document / Card ID Number",
    formatPlaceholder: "GOV-12345678",
    formatHint: "Official number printed on the government credential",
    requiresExpiration: true,
    extraFieldLabel: "Issuing Agency or Barangay Office",
    extraFieldPlaceholder: "e.g. Barangay San Antonio / Maritime Authority",
    helpText: "Any recognized official Philippine national or local government photo credential.",
  },
};


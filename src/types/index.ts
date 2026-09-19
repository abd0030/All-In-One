export type UserRole = 'buyer' | 'seller' | 'moderator' | 'admin' | 'super_admin';

export interface NotificationPreferences {
  new_messages: boolean;
  new_offers: boolean;
  listing_status_changes: boolean;
  price_drops: boolean;
  marketing_emails: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  role: UserRole;
  roles: UserRole[];
  is_verified: boolean;
  email_verified: boolean;
  is_temp_password?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  city?: string;
  country?: string;
  bio?: string;
  two_factor_enabled?: boolean;
  notification_preferences?: NotificationPreferences;
}

export type ListingStatus = 'draft' | 'pending' | 'active' | 'rejected' | 'sold' | 'expired' | 'suspended' | 'changes_requested';
export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category_id: string;
  subcategory_id?: string;
  sub_subcategory_id?: string;
  seller_id: string;
  status: ListingStatus;
  condition: ListingCondition;
  images: string[];
  video_url?: string;
  location: string;
  city: string;
  country: string;
  is_featured: boolean;
  featured_until?: string;
  featured_package?: string;
  badge_type?: string;
  is_negotiable: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  category?: Category;
  seller?: User;
  attributes?: Record<string, string>;
  moderated_by?: string;
  moderated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  parent_id?: string;
  description?: string;
  listing_count?: number;
  subcategories?: Category[];
  color?: string;
  sort_order?: number;
  attributes_schema?: any[];
  image_url?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  is_delivered?: boolean;
  is_deleted?: boolean;
  deleted_for_users?: string[];
  reply_to_message_id?: string;
  reply_to_message?: {
    id: string;
    sender_name: string;
    content: string;
  };
  sender?: User;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  listing?: Listing;
  buyer?: User;
  seller?: User;
  unread_count?: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listing?: Listing;
}

export interface Report {
  id: string;
  reporter_id: string;
  listing_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  moderator_id?: string;
  resolution_note?: string;
  created_at: string;
  updated_at?: string;
  listing?: Listing;
  reporter?: User;
}

export interface Offer {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn';
  message?: string;
  created_at: string;
  listing?: Listing;
  buyer?: User;
}

export interface Payment {
  id: string;
  listing_id?: string;
  user_id: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  receipt_url?: string;
  package_name?: string;
  duration_days?: number;
  notes?: string;
  verified_by?: string;
  created_at: string;
  updated_at?: string;
  user?: User;
  listing?: Listing;
}

export interface PaymentAccount {
  id: string;
  user_id?: string;
  account_type: 'bank' | 'easypaisa' | 'jazzcash' | 'sadapay' | 'nayapay' | 'other';
  bank_name: string;
  account_title: string;
  account_number: string;
  iban?: string;
  instructions?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SearchFilters {
  query?: string;
  category_id?: string;
  subcategory_id?: string;
  min_price?: number;
  max_price?: number;
  condition?: ListingCondition;
  location?: string;
  is_featured?: boolean;
  sort_by?: 'created_at' | 'price_asc' | 'price_desc' | 'views';
  furnished?: string;
  sex?: string;
  gender?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface VerificationApplication {
  id: string;
  user_id: string;
  full_name: string;
  cnic_number: string;
  dob: string;
  phone: string;
  city: string;
  cnic_front_url: string;
  cnic_back_url: string;
  selfie_url: string;
  address?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

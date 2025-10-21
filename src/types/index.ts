
export type UserRole = 'admin' | 'moderator' | 'user';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name: string;
  is_activated: boolean;
  avatar?: string;
  avatar_club?: string;
  description?: string;
  roles: string[];
  is_banned?: boolean;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
  phone_number?: string;
  telegram_username?: string;
  vk_username?: string;
}

export interface UserAdminUpdate {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  description?: string;
  phone_number?: string;
  roles?: string[];
  email?: string;
}


export interface HikeParticipant {
  id?: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name: string;
  is_activated: boolean;
  avatar?: string;
  description?: string;
  role: string; // Role in the hike
}


export interface Hike {
  id: number;
  name: string;
  slug: string;
  tourism_type: string;
  complexity: string;
  region: string;
  route: string;
  start_date: string;
  end_date: string;
  description: string;
  participants_count: number;
  duration_days: number;
  distance_km: number;
  difficulty_distribution: { [key: string]: number };
  leader_id: number;
  leader_fullname?: string;
  leader_email?: string;
  photos_archive?: string;
  report_s3_key?: string;
  route_s3_key?: string;
  geojson_data?: object;
  status: string;
  created_by: number;
  updated_by: number;
}

export interface Pass {
  id: number;
  name: string;
  slug: string;
  region: string;
  complexity: string;
  height: number;
  description: string;
  photos?: string[];
  status: ContentStatus;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content_json?: string; // Tiptap JSON
  content_html?: string; // Tiptap HTML
  cover_s3_url: string;
  author: string;
  status: ContentStatus;
}

export interface News {
  id: number;
  title: string;
  summary: string;
  slug: string;
  content_json?: string;
  content_html?: string;
  cover_s3_url: string;
  status: ContentStatus;
}

export const contentStatuses = ['archived', 'published', 'review', 'draft'] as const;
export type ContentStatus = typeof contentStatuses[number];

export interface ArticleUpdate {
  title?: string;
  content_json?: string;
  content_html?: string;
  cover_s3_url?: string;
  status?: ContentStatus;
}

export interface NewsUpdate {
  title?: string;
  summary?: string;
  content_json?: string;
  content_html?: string;
  cover_s3_url?: string;
  status?: ContentStatus;
}

export interface PassUpdate {
  name?: string;
  region?: string;
  complexity?: string;
  height?: number;
  description?: string;
  photos?: string[];
  status?: ContentStatus;
}

export interface HikeUpdate {
  name?: string;
  complexity?: string;
  route?: string;
  start_date?: string;
  end_date?: string;
  region?: string;
  description?: string;
  photos_archive?: string;
  status?: ContentStatus;
}

// --- School Applications ---

export type SchoolApplicationStatus = 'pending' | 'approved' | 'rejected';

export type ExperienceLevel = 'none' | 'weekend_hikes' | 'mountain_hikes' | 'advanced';
export type PreviousSchool = 'yes' | 'no';
export type HowHeard = 'friends' | 'social_media' | 'university' | 'other';


export interface SchoolApplication {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth: string;
  email: string;
  phone_number: string;
  vk_profile?: string;
  experience: ExperienceLevel;
  previous_school: PreviousSchool;
  how_heard: HowHeard;
  question: string;
  wishes?: string;
  consent: boolean;
  status: SchoolApplicationStatus;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolApplicationCreate {
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth: string;
  email: string;
  phone_number: string;
  vk_profile?: string;
  experience: ExperienceLevel;
  previous_school: PreviousSchool;
  how_heard: HowHeard;
  question: string;
  wishes?: string;
  consent: boolean;
}

export interface SchoolApplicationAdminItem {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    email: string;
  };
  status: SchoolApplicationStatus;
  created_at: string;
}

export interface SchoolApplicationUpdateAdmin {
  status: SchoolApplicationStatus;
  comment?: string;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  detail: T;
}

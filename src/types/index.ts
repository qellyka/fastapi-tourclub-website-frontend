
export interface User {
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
  roles: string[];
}

export interface Hike {
  id: number;
  name: string;
  slug: string;
  complexity: string;
  route: string;
  geojson_data: object; // Для отображения на карте
  start_date: string;
  end_date: string;
  region: string;
  description: string;
  photos_archive: string;
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
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content_json?: string; // Tiptap JSON
  content_html?: string; // Tiptap HTML
  cover_s3_url: string;
  author: string;
}

export interface News {
  id: number;
  title: string;
  summary: string;
  slug: string;
  content_json?: string;
  content_html?: string;
  cover_s3_url: string;
}

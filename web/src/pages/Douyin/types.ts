export type DouyinUserStatus = "active" | "testing" | "pending" | "dropped";

export interface DouyinUserCreate {
  sec_uid: string;
  status?: DouyinUserStatus;
  topic?: string | null;
  niche?: string | null;
  sub_niche?: string | null;
  micro_niche?: string | null;
  note?: string | null;
  system_id?: number | null;
}

export interface DouyinUserUpdate {
  status?: DouyinUserStatus | null;
  topic?: string | null;
  niche?: string | null;
  sub_niche?: string | null;
  micro_niche?: string | null;
  note?: string | null;
  system_id?: number | null;
}

export interface DouyinUser {
  id: number;
  sec_uid: string;
  name: string | null;
  translated_name: string | null;
  status: DouyinUserStatus;
  topic: string | null;
  niche: string | null;
  sub_niche: string | null;
  micro_niche: string | null;
  note: string | null;
  last_fetched: number | null;
  system_id: number | null;
}

export interface DouyinVideoUpdate {
  title?: string | null;
  translated_title?: string | null;
  is_downloaded?: boolean | null;
}

export interface DouyinVideo {
  id: number;
  aweme_id: string;
  title: string | null;
  translated_title: string | null;
  create_time: number;
  digg_count: number;
  duration: number | null;
  urls: string | null;
  is_downloaded: boolean;
  user_id: number;
}

export interface DouyinVideoPage {
  items: DouyinVideo[];
  total: number;
  limit: number;
  offset: number;
}

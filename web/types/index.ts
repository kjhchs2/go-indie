export type UserRole = 'listener' | 'artist';

export interface Profile {
  id: string;
  email: string;
  nickname: string;
  profile_image?: string;
  role: UserRole;
  bio?: string;
  links?: string;
}

export interface Track {
  id: string;
  artist_id: string;
  title: string;
  audio_url: string;
  lyrics?: string;
  cover_image?: string;
  highlight_start: number;
  highlight_duration: number;
  tags: string[];
  play_count: number;
  created_at?: string;
  artist?: Profile;
  funding_goal_amount?: number;
  funding_raised_amount?: number;
  funding_purpose?: string;
  links?: string;
}

export interface Donation {
  id: string;
  sender_id: string | null;
  receiver_id: string;
  track_id?: string;
  amount: number;
  message?: string;
  created_at?: string;
}

export type TrackInsert = Pick<
  Track,
  | 'title'
  | 'audio_url'
  | 'lyrics'
  | 'cover_image'
  | 'highlight_start'
  | 'highlight_duration'
  | 'tags'
  | 'funding_goal_amount'
  | 'funding_raised_amount'
  | 'funding_purpose'
> & { artist_id: string };

export type DonationInsert = Pick<Donation, 'receiver_id' | 'amount' | 'message' | 'track_id'> & {
  sender_id: string | null;
};

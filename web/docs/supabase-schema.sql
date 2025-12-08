-- Users / profiles table (extends supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id),
  email text,
  nickname text,
  profile_image text,
  role text default 'listener',
  bio text,
  links text,
  created_at timestamptz default now()
);

-- Tracks table
create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.profiles(id),
  title text not null,
  audio_url text not null,
  lyrics text,
  cover_image text,
  highlight_start int default 0,
  highlight_duration int default 30,
  tags text[] default '{}',
  play_count int default 0,
  funding_goal_amount int default 0,
  funding_raised_amount int default 0,
  funding_purpose text,
  created_at timestamptz default now()
);

create index if not exists tracks_tags_idx on public.tracks using gin (tags);

-- Donations table
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id),
  receiver_id uuid not null references public.profiles(id),
  track_id uuid references public.tracks(id),
  amount int not null check (amount > 0),
  message text,
  created_at timestamptz default now()
);

create index if not exists donations_receiver_created_idx on public.donations (receiver_id, created_at desc);

-- Artist applications (auto-approval on submit)
create table if not exists public.artist_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  stage_name text,
  bio text,
  links text,
  agreed_terms boolean default false,
  status text default 'approved',
  created_at timestamptz default now()
);

create index if not exists artist_applications_user_idx on public.artist_applications (user_id, created_at desc);

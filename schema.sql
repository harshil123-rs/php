-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  role text default 'patient' check (role in ('patient', 'doctor')),

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security!
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a table for health records
create table records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  file_url text,
  file_type text,
  metadata jsonb
);

alter table records enable row level security;

create policy "Users can view their own records."
  on records for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own records."
  on records for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own records."
  on records for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own records."
  on records for delete
  using ( auth.uid() = user_id );

-- Set up Storage!
insert into storage.buckets (id, name)
values ('records', 'records');

create policy "Record images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'records' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'records' );

-- Create a table for achievements
create table achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  points int default 0,
  streak int default 0,
  badges text[] default array[]::text[],
  last_visit timestamp with time zone,
  level int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table achievements enable row level security;

create policy "Users can view their own achievements."
  on achievements for select
  using ( auth.uid() = user_id );

create policy "Users can update their own achievements."
  on achievements for update
  using ( auth.uid() = user_id );

create policy "Users can insert their own achievements."
  on achievements for insert
  with check ( auth.uid() = user_id );

-- SQL schema for diary_entries table
create extension if not exists "uuid-ossp";

-- Drop old table or constraint if it exists to avoid foreign key issues
drop table if exists diary_entries cascade;

create table if not exists diary_entries (
  id uuid primary key default uuid_generate_v4(),
  plant_id uuid references plants(id) on delete cascade not null,
  -- Store Netlify Identity user IDs directly without foreign key to Supabase Auth
  user_id uuid not null,
  timestamp timestamptz not null default now(),
  author text not null,
  notes text,
  stage text,
  height_cm numeric,
  ec numeric,
  ph numeric,
  temperature numeric,
  humidity numeric,
  symptoms text,
  actions_taken text,
  photos jsonb,
  ai_overall_diagnosis text
);

create index if not exists diary_entries_plant_idx on diary_entries(plant_id);
create index if not exists diary_entries_user_idx on diary_entries(user_id);

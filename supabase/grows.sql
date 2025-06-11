create extension if not exists "uuid-ossp";

create table if not exists grows (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location text,
  capacity integer,
  qr_code_value text not null unique,
  user_id uuid not null,
  created_at timestamptz not null default now()
);

alter table cultivos add column if not exists substrate text;
alter table cultivos add column if not exists grow_id uuid references grows(id);
alter table grows add column if not exists capacity integer;
alter table grows add column if not exists qr_code_value text unique;

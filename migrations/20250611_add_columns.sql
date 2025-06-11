-- Migration to add missing columns
alter table plants add column if not exists substrate text;

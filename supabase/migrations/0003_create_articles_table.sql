-- Migration: create articles table for storing AI-generated blog posts
-- This table stores article drafts, published posts, metadata, and SEO information
-- with references to the user's style guide

-- Ensures pgcrypto available for gen_random_uuid
create extension if not exists "pgcrypto";

-- Create enum type for article status
create type article_status as enum ('draft', 'published', 'archived');

-- Create articles table
create table if not exists public.articles (
  -- Primary key
  id uuid primary key default gen_random_uuid(),

  -- User reference
  clerk_user_id text not null,

  -- Basic article information
  title text not null,
  slug text not null,
  keywords text[] not null default array[]::text[],
  description text,
  content text not null,

  -- Style guide reference (nullable for flexibility)
  style_guide_id uuid references public.style_guides(id) on delete set null,

  -- Content style overrides (from style_guides enum types)
  tone content_tone,
  content_length content_length_preference,
  reading_level reading_level,

  -- SEO metadata
  meta_title text,
  meta_description text,

  -- Status and publishing
  status article_status not null default 'draft',
  published_at timestamptz,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add indexes for faster lookups
create index if not exists idx_articles_clerk_user_id
  on public.articles(clerk_user_id);

create index if not exists idx_articles_slug
  on public.articles(slug);

create index if not exists idx_articles_status
  on public.articles(status);

create index if not exists idx_articles_style_guide_id
  on public.articles(style_guide_id);

create index if not exists idx_articles_published_at
  on public.articles(published_at desc);

-- Add composite index for user's published articles
create index if not exists idx_articles_user_published
  on public.articles(clerk_user_id, status, published_at desc)
  where status = 'published';

-- Add helpful comments
comment on table public.articles is
  'Stores AI-generated blog articles including drafts, published posts, and archived content. Each article can reference a style guide and override specific style settings.';

comment on column public.articles.clerk_user_id is
  'Reference to Clerk user ID. Identifies the article owner.';

comment on column public.articles.slug is
  'URL-friendly slug for the article. Should be unique per user.';

comment on column public.articles.keywords is
  'Array of keywords/tags for SEO and categorization.';

comment on column public.articles.style_guide_id is
  'Optional reference to style guide. If null, uses default style guide.';

comment on column public.articles.tone is
  'Content tone override. If null, uses style guide tone.';

comment on column public.articles.content_length is
  'Content length preference override. If null, uses style guide preference.';

comment on column public.articles.reading_level is
  'Reading level override. If null, uses style guide level.';

comment on column public.articles.status is
  'Article lifecycle status: draft (being edited), published (live), archived (removed from public view).';

comment on column public.articles.published_at is
  'Timestamp when the article was first published. Null for drafts.';

-- Create trigger function to auto-update updated_at timestamp
create or replace function update_articles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger
create trigger set_articles_updated_at
  before update on public.articles
  for each row
  execute function update_articles_updated_at();

-- Disable Row Level Security (RLS)
-- Backend API uses service role key which bypasses RLS
alter table public.articles disable row level security;

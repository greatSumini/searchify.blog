-- Migration: create keywords and cache tables for keyword management feature
-- Ensures pgcrypto available for gen_random_uuid
create extension if not exists "pgcrypto";

-- =====================================================
-- 1) keywords 테이블
-- =====================================================
create table if not exists public.keywords (
  id uuid primary key default gen_random_uuid(),
  phrase text not null,
  normalized text not null,
  source text not null default 'manual',
  search_volume int,
  cpc numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique constraints
create unique index if not exists idx_keywords_phrase_unique
  on public.keywords(phrase);

create unique index if not exists idx_keywords_normalized_unique
  on public.keywords(normalized);

-- Indexes
create index if not exists idx_keywords_source
  on public.keywords(source);

create index if not exists idx_keywords_phrase_gin
  on public.keywords using gin(to_tsvector('simple', phrase));

-- Comments
comment on table public.keywords is
  'Master table for keyword management. Supports manual entry and DataForSEO imports.';

comment on column public.keywords.phrase is
  'Original keyword phrase as displayed to users. Case-sensitive.';

comment on column public.keywords.normalized is
  'Normalized version for deduplication and search. Lowercase, trimmed, Unicode NFC.';

comment on column public.keywords.source is
  'Source of keyword: manual (user-created) or dataforseo (API import).';

-- Trigger for updated_at
create or replace function update_keywords_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_keywords_updated_at on public.keywords;
create trigger set_keywords_updated_at
  before update on public.keywords
  for each row execute function update_keywords_updated_at();

-- Disable RLS
alter table public.keywords disable row level security;

-- =====================================================
-- 2) keyword_suggestions_cache 테이블
-- =====================================================
create table if not exists public.keyword_suggestions_cache (
  id uuid primary key default gen_random_uuid(),
  seeds text[] not null,
  language_name text not null default 'Korean',
  location_code int not null default 2410,
  response_data jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_keyword_suggestions_cache_seeds_gin
  on public.keyword_suggestions_cache using gin(seeds);

create index if not exists idx_keyword_suggestions_cache_expires_at
  on public.keyword_suggestions_cache(expires_at);

-- Comments
comment on table public.keyword_suggestions_cache is
  'Caches DataForSEO API responses to reduce costs and improve performance. TTL: 24 hours.';

-- Disable RLS
alter table public.keyword_suggestions_cache disable row level security;

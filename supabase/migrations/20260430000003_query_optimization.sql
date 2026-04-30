-- Query Optimization and Caching Strategy

-- ============================================================================
-- MATERIALIZED VIEW for cached job listings
-- ============================================================================

create materialized view if not exists mv_job_listings as
select
  j.id,
  j.title,
  j.description,
  j.budget,
  j.category,
  j.location,
  j.status,
  j.user_id,
  j.assigned_to,
  j.created_at,
  j.updated_at,
  p.full_name as creator_name,
  p.avg_rating as creator_rating,
  p.review_count as creator_review_count,
  ap.full_name as assignee_name,
  ap.avg_rating as assignee_rating,
  count(distinct r.id) as total_reviews,
  avg(r.rating) as avg_review_rating
from jobs j
left join profiles p on j.user_id = p.id
left join profiles ap on j.assigned_to = ap.id
left join reviews r on j.id = r.job_id
group by
  j.id, j.title, j.description, j.budget, j.category, j.location,
  j.status, j.user_id, j.assigned_to, j.created_at, j.updated_at,
  p.full_name, p.avg_rating, p.review_count,
  ap.full_name, ap.avg_rating;

-- Create indexes on materialized view
create index idx_mv_job_listings_status on mv_job_listings(status);
create index idx_mv_job_listings_category on mv_job_listings(category);
create index idx_mv_job_listings_location on mv_job_listings(location);
create index idx_mv_job_listings_created_at on mv_job_listings(created_at desc);

-- ============================================================================
-- MATERIALIZED VIEW for cached user profiles
-- ============================================================================

create materialized view if not exists mv_user_profiles as
select
  p.id,
  p.full_name,
  p.bio,
  p.location,
  p.avatar_url,
  p.skills,
  p.avg_rating,
  p.review_count,
  p.email_verified,
  p.created_at,
  count(distinct j.id) as completed_jobs,
  max(j.updated_at) as last_job_date
from profiles p
left join jobs j on p.id = j.assigned_to and j.status = 'completed'
group by
  p.id, p.full_name, p.bio, p.location, p.avatar_url, p.skills,
  p.avg_rating, p.review_count, p.email_verified, p.created_at;

create index idx_mv_user_profiles_avg_rating on mv_user_profiles(avg_rating desc);
create index idx_mv_user_profiles_location on mv_user_profiles(location);
create index idx_mv_user_profiles_email_verified on mv_user_profiles(email_verified);

-- ============================================================================
-- REFRESH MATERIALIZED VIEWS - Refresh function and schedule
-- ============================================================================

create or replace function refresh_materialized_views()
returns void as $$
begin
  refresh materialized view concurrently mv_job_listings;
  refresh materialized view concurrently mv_user_profiles;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- CACHING TABLE for Redis-like functionality in Postgres
-- ============================================================================

create table if not exists cache_entries (
  key text primary key,
  value jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  hit_count int default 0
);

-- Index for cleanup of expired entries
create index idx_cache_entries_expires_at on cache_entries(expires_at);

-- Function to get cached value
create or replace function get_cache(p_key text)
returns jsonb as $$
declare
  v_value jsonb;
begin
  select value into v_value
  from cache_entries
  where key = p_key
  and expires_at > now()
  and (hit_count := hit_count + 1 or true);

  if v_value is not null then
    update cache_entries
    set hit_count = hit_count + 1
    where key = p_key;
  end if;

  return v_value;
end;
$$ language plpgsql security definer;

-- Function to set cached value
create or replace function set_cache(
  p_key text,
  p_value jsonb,
  p_ttl_seconds int default 3600
)
returns void as $$
begin
  insert into cache_entries (key, value, expires_at)
  values (p_key, p_value, now() + (p_ttl_seconds || ' seconds')::interval)
  on conflict (key)
  do update set
    value = p_value,
    expires_at = now() + (p_ttl_seconds || ' seconds')::interval,
    hit_count = 0;
end;
$$ language plpgsql security definer;

-- Function to invalidate cache
create or replace function invalidate_cache(p_key text)
returns void as $$
begin
  delete from cache_entries where key = p_key;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- CLEANUP JOB for expired cache entries
-- ============================================================================

create or replace function cleanup_expired_cache()
returns void as $$
begin
  delete from cache_entries where expires_at < now();
end;
$$ language plpgsql security definer;

-- ============================================================================
-- QUERY STATISTICS for monitoring and optimization
-- ============================================================================

create table if not exists query_statistics (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  execution_time_ms numeric,
  rows_affected int,
  user_id uuid references auth.users(id) on delete set null,
  executed_at timestamptz default now()
);

create index idx_query_statistics_user_id on query_statistics(user_id);
create index idx_query_statistics_executed_at on query_statistics(executed_at desc);

-- ============================================================================
-- ADDITIONAL CRITICAL INDEXES
-- ============================================================================

-- Jobs table
create index if not exists idx_jobs_status_created_at on jobs(status, created_at desc);
create index if not exists idx_jobs_category_budget on jobs(category, budget);
create index if not exists idx_jobs_location on jobs(location);

-- Reviews table
create index if not exists idx_reviews_reviewee_rating on reviews(reviewee_id, rating);
create index if not exists idx_reviews_created_at on reviews(created_at desc);

-- Conversations table
create index if not exists idx_conversations_users_created on conversations(
  least(user_id_1, user_id_2),
  greatest(user_id_1, user_id_2),
  created_at desc
);

-- Messages table
create index if not exists idx_messages_created_at on messages(created_at desc);
create index if not exists idx_messages_conversation_created on messages(
  conversation_id,
  created_at desc
);

-- ============================================================================
-- GRANT CACHE FUNCTION PERMISSIONS
-- ============================================================================

grant execute on function get_cache(text) to authenticated, anon;
grant execute on function set_cache(text, jsonb, int) to authenticated;
grant execute on function invalidate_cache(text) to authenticated;
grant execute on function refresh_materialized_views() to authenticated;

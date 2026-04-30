-- Advanced search and ranking RPCs for jobs and profiles

-- ============================================================================
-- FULL-TEXT SEARCH SETUP
-- ============================================================================

-- Create search document index if not exists
create index if not exists idx_jobs_search_doc on jobs using gin(
  to_tsvector('english', title || ' ' || coalesce(description, ''))
);

-- ============================================================================
-- SEARCH JOBS RPC - Full-text search with ranking and filters
-- ============================================================================

create or replace function search_jobs(
  p_query text default '',
  p_category text default null,
  p_min_budget numeric default 0,
  p_max_budget numeric default null,
  p_location text default null,
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid,
  title text,
  description text,
  budget numeric,
  category text,
  location text,
  status text,
  user_id uuid,
  assigned_to uuid,
  created_at timestamptz,
  relevance_score float,
  avg_rating numeric,
  review_count int
) as $$
begin
  return query
  select
    jobs.id,
    jobs.title,
    jobs.description,
    jobs.budget,
    jobs.category::text,
    jobs.location,
    jobs.status::text,
    jobs.user_id,
    jobs.assigned_to,
    jobs.created_at,
    -- Calculate relevance score based on full-text search
    case
      when p_query = '' then 0.0
      else ts_rank(
        to_tsvector('english', jobs.title || ' ' || coalesce(jobs.description, '')),
        plainto_tsquery('english', p_query)
      ) * 100
    end as relevance_score,
    coalesce(profiles.avg_rating, 0)::numeric,
    coalesce(profiles.review_count, 0)
  from jobs
  left join profiles on jobs.user_id = profiles.id
  where
    -- Status filter (only active jobs)
    jobs.status = 'open'
    -- Full-text search
    and (
      p_query = ''
      or to_tsvector('english', jobs.title || ' ' || coalesce(jobs.description, ''))
        @@ plainto_tsquery('english', p_query)
    )
    -- Category filter
    and (p_category is null or jobs.category::text = p_category)
    -- Budget range filter
    and jobs.budget >= p_min_budget
    and (p_max_budget is null or jobs.budget <= p_max_budget)
    -- Location filter
    and (p_location is null or jobs.location ilike '%' || p_location || '%')
  order by
    -- Sort by relevance score first, then by rating, then by recency
    relevance_score desc,
    coalesce(profiles.avg_rating, 0) desc,
    jobs.created_at desc
  limit p_limit
  offset p_offset;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- SEARCH PROFILES RPC - Find talented freelancers with ranking
-- ============================================================================

create or replace function search_profiles(
  p_query text default '',
  p_min_rating numeric default 0,
  p_skills text[] default null,
  p_location text default null,
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid,
  full_name text,
  bio text,
  location text,
  avg_rating numeric,
  review_count int,
  skills text[],
  completed_jobs int,
  relevance_score float
) as $$
begin
  return query
  select
    profiles.id,
    profiles.full_name,
    profiles.bio,
    profiles.location,
    profiles.avg_rating,
    profiles.review_count,
    coalesce(profiles.skills, array[]::text[]),
    (select count(*) from jobs where jobs.assigned_to = profiles.id and jobs.status = 'completed')::int,
    -- Calculate relevance score based on name/bio search and rating
    case
      when p_query = '' then 0.0
      else ts_rank(
        to_tsvector('english', profiles.full_name || ' ' || coalesce(profiles.bio, '')),
        plainto_tsquery('english', p_query)
      ) * 100
    end as relevance_score
  from profiles
  where
    -- Rating filter
    coalesce(profiles.avg_rating, 0) >= p_min_rating
    -- Full-text search on name and bio
    and (
      p_query = ''
      or to_tsvector('english', profiles.full_name || ' ' || coalesce(profiles.bio, ''))
        @@ plainto_tsquery('english', p_query)
    )
    -- Skills filter
    and (
      p_skills is null
      or profiles.skills && p_skills
    )
    -- Location filter
    and (
      p_location is null
      or profiles.location ilike '%' || p_location || '%'
    )
    -- Only active profiles with verified email
    and profiles.email_verified = true
  order by
    -- Sort by relevance, rating, and review count
    relevance_score desc,
    profiles.avg_rating desc,
    profiles.review_count desc
  limit p_limit
  offset p_offset;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- GET JOB RECOMMENDATIONS RPC - Personalized job matches for a user
-- ============================================================================

create or replace function get_job_recommendations(
  p_user_id uuid,
  p_limit int default 10
)
returns table (
  id uuid,
  title text,
  description text,
  budget numeric,
  category text,
  location text,
  match_score float,
  created_at timestamptz
) as $$
declare
  v_user_skills text[];
  v_user_location text;
  v_user_category text;
begin
  -- Get user's profile info
  select skills, location, category_preference
  into v_user_skills, v_user_location, v_user_category
  from profiles
  where id = p_user_id;

  return query
  select
    jobs.id,
    jobs.title,
    jobs.description,
    jobs.budget,
    jobs.category::text,
    jobs.location,
    -- Calculate match score based on skills, location, and category
    (
      case when jobs.category::text = v_user_category then 30 else 0 end
      + case when jobs.location = v_user_location then 20 else 0 end
      + (
        select count(*) * 10
        from unnest(v_user_skills) as skill
        where jobs.description ilike '%' || skill || '%'
      )
      + (select count(*) * 2 from reviews where reviews.reviewee_id = p_user_id)
    )::float as match_score,
    jobs.created_at
  from jobs
  where
    jobs.status = 'open'
    and jobs.user_id != p_user_id
    and not exists (
      select 1 from job_applications
      where job_applications.job_id = jobs.id
      and job_applications.user_id = p_user_id
    )
  order by match_score desc
  limit p_limit;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- CREATE SEARCH DOCUMENT TABLE for faster searches
-- ============================================================================

create table if not exists job_search_documents (
  id uuid primary key,
  job_id uuid not null unique references jobs(id) on delete cascade,
  title text not null,
  description text,
  category text,
  location text,
  search_vector tsvector generated always as (
    to_tsvector('english', title || ' ' || coalesce(description, ''))
  ) stored,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for full-text search
create index idx_job_search_documents_vector on job_search_documents using gin(search_vector);

-- Create trigger to maintain search documents
create or replace function update_job_search_document()
returns trigger as $$
begin
  insert into job_search_documents (id, job_id, title, description, category, location)
  values (gen_random_uuid(), new.id, new.title, new.description, new.category::text, new.location)
  on conflict (job_id)
  do update set
    title = new.title,
    description = new.description,
    category = new.category::text,
    location = new.location,
    updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger jobs_search_document_trigger
  after insert or update on jobs
  for each row
  execute function update_job_search_document();

-- Grant execute permissions
grant execute on function search_jobs(text, text, numeric, numeric, text, int, int) to authenticated, anon;
grant execute on function search_profiles(text, numeric, text[], text, int, int) to authenticated, anon;
grant execute on function get_job_recommendations(uuid, int) to authenticated;

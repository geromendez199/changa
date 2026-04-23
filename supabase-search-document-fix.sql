-- Idempotent production repair for older Supabase databases.
-- The frontend tolerates older schemas, but production should still be aligned
-- so search and dual listing types remain first-class database features.

alter table public.jobs
add column if not exists listing_type text
not null default 'request'
check (listing_type in ('request', 'service'));

alter table public.jobs
add column if not exists search_document tsvector
generated always as (
  to_tsvector(
    'simple',
    coalesce(title, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(category, '') || ' ' ||
    coalesce(location, '')
  )
) stored;

create index if not exists idx_jobs_search_document
on public.jobs
using gin (search_document);

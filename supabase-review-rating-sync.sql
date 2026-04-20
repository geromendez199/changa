-- ============================================================
-- WHY: Stop gifting 5-star ratings and sync profile score from real reviews.
-- CHANGED: YYYY-MM-DD
-- ============================================================

alter table profiles
alter column rating set default 0;

create or replace function sync_profile_review_stats(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  review_count int;
  average_rating numeric(2,1);
begin
  select
    count(*)::int,
    coalesce(round(avg(rating)::numeric, 1), 0)
  into review_count, average_rating
  from reviews
  where reviewed_user_id = target_user_id;

  update profiles
  set
    rating = case when review_count > 0 then average_rating else 0 end,
    total_reviews = review_count
  where id = target_user_id;
end;
$$;

create or replace function handle_review_stats_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform sync_profile_review_stats(old.reviewed_user_id);
    return old;
  end if;

  perform sync_profile_review_stats(new.reviewed_user_id);

  if tg_op = 'UPDATE' and old.reviewed_user_id is distinct from new.reviewed_user_id then
    perform sync_profile_review_stats(old.reviewed_user_id);
  end if;

  return new;
end;
$$;

drop trigger if exists reviews_sync_profile_stats on reviews;
create trigger reviews_sync_profile_stats
after insert or update or delete on reviews
for each row
execute function handle_review_stats_sync();

update profiles p
set
  rating = coalesce(review_stats.average_rating, 0),
  total_reviews = coalesce(review_stats.review_count, 0)
from (
  select
    reviewed_user_id,
    count(*)::int as review_count,
    round(avg(rating)::numeric, 1) as average_rating
  from reviews
  group by reviewed_user_id
) as review_stats
where p.id = review_stats.reviewed_user_id;

update profiles
set
  rating = 0,
  total_reviews = 0
where id not in (
  select distinct reviewed_user_id
  from reviews
);

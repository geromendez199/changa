-- Activity Logs table for structured logging and tracing

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  correlation_id uuid not null,
  event_type text not null,
  severity text not null check (severity in ('debug', 'info', 'warning', 'error')),
  message text not null,
  user_id uuid references auth.users(id) on delete set null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes for efficient querying
create index idx_activity_logs_correlation_id on activity_logs(correlation_id);
create index idx_activity_logs_user_id on activity_logs(user_id);
create index idx_activity_logs_event_type on activity_logs(event_type);
create index idx_activity_logs_severity on activity_logs(severity);
create index idx_activity_logs_created_at on activity_logs(created_at desc);

-- Composite index for common queries
create index idx_activity_logs_user_event_date on activity_logs(user_id, event_type, created_at desc);

-- Enable RLS
alter table activity_logs enable row level security;

-- Users can only read their own logs (except admins can read all)
create policy "activity_logs_select_own_or_admin"
  on activity_logs for select
  using (
    auth.uid() = user_id
    or
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- No direct inserts from clients (only through log-event function)
create policy "activity_logs_insert_disabled"
  on activity_logs for insert
  with check (false);

-- Create a function to clean up old logs (older than 90 days)
create or replace function cleanup_old_logs()
returns void as $$
begin
  delete from activity_logs
  where created_at < now() - interval '90 days'
  and severity != 'error';
end;
$$ language plpgsql security definer;

-- Create trigger for updated_at
create or replace function update_activity_logs_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger activity_logs_updated_at_trigger
  before update on activity_logs
  for each row
  execute function update_activity_logs_updated_at();

-- Create payments table for transaction tracking

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  amount numeric(10, 2) not null,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id text,
  correlation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes for efficient querying
create index idx_payments_job_id on payments(job_id);
create index idx_payments_status on payments(status);
create index idx_payments_created_at on payments(created_at desc);
create index idx_payments_correlation_id on payments(correlation_id);

-- Create trigger for updated_at
create or replace function update_payments_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger payments_updated_at_trigger
  before update on payments
  for each row
  execute function update_payments_updated_at();

-- ============================================================
-- CHANGA APP · Supabase Schema
-- Pegar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- 1. PROFILES
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  phone       text,
  avatar_url  text,
  bio         text,
  zone        text,
  created_at  timestamptz default now()
);

-- Auto-crear perfil al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. SERVICES
create table public.services (
  id          uuid default gen_random_uuid() primary key,
  worker_id   uuid references public.profiles(id) on delete cascade not null,
  title       text not null check (char_length(title) between 3 and 120),
  description text check (description is null or char_length(description) <= 1000),
  category    text not null check (category in ('limpieza','plomeria','electricidad','pintura','jardineria','mudanza','computacion','otros')),
  price       integer not null check (price > 0 and price <= 999999),
  zone        text check (zone is null or char_length(zone) <= 120),
  active      boolean default true,
  created_at  timestamptz default now()
);

-- 3. BOOKINGS
create table public.bookings (
  id             uuid default gen_random_uuid() primary key,
  client_id      uuid references public.profiles(id) on delete cascade not null,
  service_id     uuid references public.services(id) on delete cascade not null,
  worker_id      uuid references public.profiles(id) not null,
  status         text default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  address        text not null check (char_length(address) between 5 and 200),
  scheduled_for  text check (scheduled_for is null or char_length(scheduled_for) <= 120),
  note           text check (note is null or char_length(note) <= 1000),
  created_at     timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.services  enable row level security;
alter table public.bookings  enable row level security;

-- Profiles
create policy "Anyone can view profiles"   on public.profiles for select using (true);
create policy "Own profile update"         on public.profiles for update using (auth.uid() = id);

-- Services
create policy "Anyone can view services"   on public.services for select using (true);
create policy "Worker insert own"          on public.services for insert with check (auth.uid() = worker_id);
create policy "Worker update own"          on public.services for update using (auth.uid() = worker_id);
create policy "Worker delete own"          on public.services for delete using (auth.uid() = worker_id);

-- Bookings
create policy "Client or worker can view"  on public.bookings for select  using (auth.uid() = client_id or auth.uid() = worker_id);
create policy "Client can create"          on public.bookings for insert  with check (auth.uid() = client_id);
create policy "Client can cancel pending" on public.bookings for update
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id and status in ('pending', 'cancelled'));

create policy "Worker manages statuses" on public.bookings for update
  using (auth.uid() = worker_id)
  with check (auth.uid() = worker_id and status in ('pending','confirmed','completed','cancelled'));

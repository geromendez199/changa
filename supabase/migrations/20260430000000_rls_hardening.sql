-- Row Level Security (RLS) Hardening
-- Restrict reviews and conversations with defensive policies

-- Enable RLS on all sensitive tables
alter table reviews enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table payments enable row level security;

-- ============================================================================
-- REVIEWS POLICIES
-- ============================================================================

-- Create reviews - only users who participated in a completed job
create policy "reviews_insert_only_participants"
  on reviews for insert
  with check (
    -- Reviewer is authenticated
    auth.uid() = reviewer_id
    and
    -- Ensure the job is completed
    exists (
      select 1 from jobs
      where jobs.id = reviews.job_id
      and jobs.status = 'completed'
    )
    and
    -- Reviewer must be job creator or person hired
    (
      exists (
        select 1 from jobs
        where jobs.id = reviews.job_id
        and (jobs.user_id = auth.uid() or jobs.assigned_to = auth.uid())
      )
    )
    and
    -- Prevent self-reviews
    reviewer_id != reviewee_id
  );

-- Read reviews - anyone can read, but only reviewers/reviewees can see details
create policy "reviews_select_public"
  on reviews for select
  using (true);

-- Update reviews - only the reviewer can update their own review
create policy "reviews_update_own"
  on reviews for update
  with check (auth.uid() = reviewer_id);

-- Delete reviews - only the reviewer can delete (within 24 hours)
create policy "reviews_delete_own_recent"
  on reviews for delete
  using (
    auth.uid() = reviewer_id
    and (now() - created_at) < interval '24 hours'
  );

-- ============================================================================
-- CONVERSATIONS POLICIES
-- ============================================================================

-- Create conversations - both users must exist and have a real connection
create policy "conversations_insert_with_validation"
  on conversations for insert
  with check (
    -- User is one of the participants
    (auth.uid() = user_id_1 or auth.uid() = user_id_2)
    and
    -- Prevent self-conversations
    user_id_1 != user_id_2
    and
    -- Both users exist
    exists (select 1 from profiles where id = user_id_1)
    and
    exists (select 1 from profiles where id = user_id_2)
    and
    -- Connection through jobs (one hired the other or vice versa)
    exists (
      select 1 from jobs
      where (
        (jobs.user_id = user_id_1 and jobs.assigned_to = user_id_2)
        or
        (jobs.user_id = user_id_2 and jobs.assigned_to = user_id_1)
      )
    )
  );

-- Read conversations - only participants
create policy "conversations_select_own"
  on conversations for select
  using (auth.uid() = user_id_1 or auth.uid() = user_id_2);

-- Update conversations - only participants can update metadata
create policy "conversations_update_own"
  on conversations for update
  using (auth.uid() = user_id_1 or auth.uid() = user_id_2);

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Create messages - only conversation participants
create policy "messages_insert_in_conversation"
  on messages for insert
  with check (
    -- Message sender is authenticated
    auth.uid() = sender_id
    and
    -- Sender is part of the conversation
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and (conversations.user_id_1 = auth.uid() or conversations.user_id_2 = auth.uid())
    )
  );

-- Read messages - only conversation participants
create policy "messages_select_in_conversation"
  on messages for select
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and (conversations.user_id_1 = auth.uid() or conversations.user_id_2 = auth.uid())
    )
  );

-- Delete messages - only sender can delete (within 1 hour)
create policy "messages_delete_own_recent"
  on messages for delete
  using (
    auth.uid() = sender_id
    and (now() - created_at) < interval '1 hour'
  );

-- ============================================================================
-- PAYMENTS POLICIES
-- ============================================================================

-- Create payments - only through Edge Function (no direct insert)
create policy "payments_insert_disabled"
  on payments for insert
  with check (false);

-- Read payments - only user who initiated or job creator
create policy "payments_select_own"
  on payments for select
  using (
    auth.uid() = (
      select user_id from jobs where jobs.id = payments.job_id
    )
    or
    auth.uid() = (
      select assigned_to from jobs where jobs.id = payments.job_id
    )
  );

-- Update payments - none (only backend can update via function)
create policy "payments_update_disabled"
  on payments for update
  with check (false);

-- ============================================================================
-- JOBS POLICIES - Enhanced
-- ============================================================================

-- Restrict job updates to creator or assigned user
create policy "jobs_update_own_or_assigned"
  on jobs for update
  using (auth.uid() = user_id or auth.uid() = assigned_to)
  with check (auth.uid() = user_id or auth.uid() = assigned_to);

-- Restrict job deletion to creator only (within 1 hour of creation)
create policy "jobs_delete_own_fresh"
  on jobs for delete
  using (
    auth.uid() = user_id
    and (now() - created_at) < interval '1 hour'
  );

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can read all profiles
create policy "profiles_select_public"
  on profiles for select
  using (true);

-- Users can only update their own profile
create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================================
-- INDEXES for RLS queries performance
-- ============================================================================

create index if not exists idx_reviews_job_id on reviews(job_id);
create index if not exists idx_reviews_reviewer_id on reviews(reviewer_id);
create index if not exists idx_reviews_reviewee_id on reviews(reviewee_id);

create index if not exists idx_conversations_user_id_1 on conversations(user_id_1);
create index if not exists idx_conversations_user_id_2 on conversations(user_id_2);

create index if not exists idx_messages_conversation_id on messages(conversation_id);
create index if not exists idx_messages_sender_id on messages(sender_id);

create index if not exists idx_payments_job_id on payments(job_id);
create index if not exists idx_payments_status on payments(status);

create index if not exists idx_jobs_user_id on jobs(user_id);
create index if not exists idx_jobs_assigned_to on jobs(assigned_to);
create index if not exists idx_jobs_status on jobs(status);

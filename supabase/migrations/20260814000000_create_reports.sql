create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid not null references profiles(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  wanted_listing_id uuid references wanted_listings(id) on delete cascade,
  reason text not null check (reason in ('unrelated_to_real_estate', 'spam', 'scam', 'inappropriate', 'duplicate', 'other')),
  description text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed', 'actioned')),
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz default now() not null,
  check (property_id is not null or wanted_listing_id is not null)
);

alter table reports enable row level security;

create policy "Authenticated users can report posts"
on reports for insert
to authenticated
with check (auth.uid() = reporter_id);

create policy "Users can view own reports"
on reports for select
to authenticated
using (auth.uid() = reporter_id);

create index if not exists idx_reports_status on reports(status, created_at desc);
create index if not exists idx_reports_reporter on reports(reporter_id, created_at desc);
create index if not exists idx_reports_property on reports(property_id) where property_id is not null;
create index if not exists idx_reports_wanted on reports(wanted_listing_id) where wanted_listing_id is not null;

-- WOW SIGNAL transmissions (demo ledger). Production writes the same envelope
-- via command.dog inscribe-jobs; dogex indexes confirmed Ð:WOW inscriptions.
create table if not exists transmissions (
  id            text primary key,
  user_id       text not null,
  handle        text not null,
  display_name  text not null,
  avatar_url    text,
  destination   text not null,
  message       text not null,
  vow           text,
  envelope      jsonb not null,
  status        text not null default 'queued',
  wows          integer not null default 0,
  briefing      text,
  is_seed       boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists transmissions_created_idx
  on transmissions (created_at desc);

create index if not exists transmissions_user_idx
  on transmissions (user_id);

create table if not exists transmission_wows (
  transmission_id text not null references transmissions(id) on delete cascade,
  user_id         text not null,
  created_at      timestamptz not null default now(),
  primary key (transmission_id, user_id)
);

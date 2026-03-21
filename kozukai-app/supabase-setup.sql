-- expenses テーブル
create table if not exists expenses (
  id           text primary key,
  date         text not null,
  amount       integer not null,
  merchant     text not null default '',
  category     text not null default 'その他',
  memo         text not null default '',
  payment_method text not null default 'other',
  source_type  text not null default 'manual',
  image_ref    text,
  created_at   text not null,
  updated_at   text not null
);

-- categories テーブル
create table if not exists categories (
  id         text primary key,
  name       text not null,
  color      text not null,
  is_default boolean not null default false
);

-- settings テーブル (予算など)
create table if not exists settings (
  key   text primary key,
  value text not null
);

-- デフォルトカテゴリ挿入
insert into categories (id, name, color, is_default) values
  (gen_random_uuid()::text, 'コンビニ',       '#f59e0b', true),
  (gen_random_uuid()::text, 'スーパー',       '#10b981', true),
  (gen_random_uuid()::text, '外食',           '#ef4444', true),
  (gen_random_uuid()::text, 'カフェ',         '#8b5cf6', true),
  (gen_random_uuid()::text, 'ドラッグストア', '#06b6d4', true),
  (gen_random_uuid()::text, '趣味',           '#ec4899', true),
  (gen_random_uuid()::text, 'ゴルフ',         '#84cc16', true),
  (gen_random_uuid()::text, '交通',           '#6366f1', true),
  (gen_random_uuid()::text, '仕事関係',       '#64748b', true),
  (gen_random_uuid()::text, '日用品',         '#f97316', true),
  (gen_random_uuid()::text, '本・学び',       '#0ea5e9', true),
  (gen_random_uuid()::text, 'その他',         '#9ca3af', true)
on conflict do nothing;

-- デフォルト予算
insert into settings (key, value) values ('budget', '30000')
on conflict do nothing;

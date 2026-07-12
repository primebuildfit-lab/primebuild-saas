-- Eventra platform reference data (Phase 5). Idempotent upserts. This is REAL
-- reference data (not dev-only) and must stay in sync with app/data/*:
-- mockCountries.ts, mockPlans.ts, mockGlobalEvents.ts.

-- ---------- Countries (D22: US required + Canada) ----------
insert into countries (code, name, flag) values
  ('US', 'United States', '🇺🇸'),
  ('CA', 'Canada', '🇨🇦')
on conflict (code) do update
  set name = excluded.name, flag = excluded.flag;

-- ---------- Plans (D9 — single source of truth) ----------
insert into plans (id, name, price_monthly, country_limit, planning_horizon_months, saved_campaign_limit, features) values
  ('free',    'Free',    0,  1,    2,  5,
     '["Core calendar","Main events","Manual campaigns","Basic reminders","1 country"]'),
  ('starter', 'Starter', 10, 2,    4,  20,
     '["Everything in Free","More categories & capacity","Basic campaign history","Campaign duplication","2 countries"]'),
  ('growth',  'Growth',  20, 3,    8,  100,
     '["Everything in Starter","Longer history","Plan up to 8 months ahead","Better filters & organization","3 countries"]'),
  ('vip',     'VIP',     50, null, 12, null,
     '["Everything in Growth","All countries","Plan 12+ months ahead","Recurring yearly workflows","Advanced templates"]')
on conflict (id) do update set
  name = excluded.name, price_monthly = excluded.price_monthly,
  country_limit = excluded.country_limit,
  planning_horizon_months = excluded.planning_horizon_months,
  saved_campaign_limit = excluded.saved_campaign_limit,
  features = excluded.features;

-- ---------- Official global events ----------
insert into global_events
  (id, name, country_codes, start_rule, end_rule, category, importance, description, recommended_lead_days, recurring)
values
  ('ge_us_newyear', 'New Year''s Day', array['US','CA'],
    '{"kind":"fixed","month":1,"day":1}', null,
    'national_holiday', 'medium', 'Fresh-start and clearance shopping moment.', 14, true),
  ('ge_us_valentines', 'Valentine''s Day', array['US','CA'],
    '{"kind":"fixed","month":2,"day":14}', null,
    'cultural', 'medium', 'Gifting peak for many niches.', 21, true),
  ('ge_us_independence', 'Independence Day', array['US'],
    '{"kind":"fixed","month":7,"day":4}', null,
    'national_holiday', 'high', 'Major US summer sale anchor.', 21, true),
  ('ge_us_backtoschool', 'Back to School', array['US','CA'],
    '{"kind":"fixed","month":8,"day":1}', '{"kind":"fixed","month":9,"day":15}',
    'seasonal', 'high', 'Extended seasonal buying window.', 30, true),
  ('ge_us_halloween', 'Halloween', array['US','CA'],
    '{"kind":"fixed","month":10,"day":31}', null,
    'seasonal', 'medium', 'Costume, décor, and themed-product spike.', 30, true),
  ('ge_us_blackfriday', 'Black Friday', array['US','CA'],
    '{"kind":"nth_weekday","month":11,"weekday":4,"nth":4,"offsetDays":1}', null,
    'major_sales', 'high', 'The single biggest sales day of the year.', 45, true),
  ('ge_us_cybermonday', 'Cyber Monday', array['US','CA'],
    '{"kind":"nth_weekday","month":11,"weekday":4,"nth":4,"offsetDays":4}', null,
    'major_sales', 'high', 'Online-focused follow-up to Black Friday.', 45, true),
  ('ge_us_christmas', 'Christmas', array['US','CA'],
    '{"kind":"fixed","month":12,"day":25}', null,
    'major_sales', 'high', 'Peak holiday gifting period.', 45, true),
  ('ge_ca_canadaday', 'Canada Day', array['CA'],
    '{"kind":"fixed","month":7,"day":1}', null,
    'national_holiday', 'high', 'Major Canadian summer sale anchor.', 21, true),
  ('ge_ca_thanksgiving', 'Canadian Thanksgiving', array['CA'],
    '{"kind":"nth_weekday","month":10,"weekday":1,"nth":2}', null,
    'national_holiday', 'medium', 'Autumn family and home spending moment.', 21, true),
  ('ge_ca_boxingday', 'Boxing Day', array['CA'],
    '{"kind":"fixed","month":12,"day":26}', null,
    'major_sales', 'high', 'Post-Christmas clearance peak in Canada.', 30, true)
on conflict (id) do update set
  name = excluded.name, country_codes = excluded.country_codes,
  start_rule = excluded.start_rule, end_rule = excluded.end_rule,
  category = excluded.category, importance = excluded.importance,
  description = excluded.description, recommended_lead_days = excluded.recommended_lead_days,
  recurring = excluded.recurring;

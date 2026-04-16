CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  purpose TEXT,
  message TEXT NOT NULL,
  source TEXT DEFAULT 'website',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id TEXT NOT NULL,
  plan_title TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  coupon_code TEXT,
  base_amount_paise INTEGER DEFAULT 0,
  final_amount_paise INTEGER DEFAULT 0,
  order_id TEXT,
  payment_id TEXT,
  status TEXT DEFAULT 'created',
  created_at TEXT NOT NULL
);

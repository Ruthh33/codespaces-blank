CREATE TABLE IF NOT EXISTS tokens (
  phone text PRIMARY KEY,
  token jsonb,
  created_at timestamptz DEFAULT now()
);

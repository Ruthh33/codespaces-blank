CREATE TABLE IF NOT EXISTS webhook_events (
  id serial PRIMARY KEY,
  received_at timestamptz DEFAULT now(),
  payload jsonb
);

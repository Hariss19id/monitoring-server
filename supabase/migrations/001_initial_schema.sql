-- ================================================
-- ServerWatch - Supabase Database Migration
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ================================================

-- 1. Server registry
CREATE TABLE IF NOT EXISTS servers (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  api_key     TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  last_seen   TIMESTAMPTZ,
  hostname    TEXT,
  kernel      TEXT,
  distro      TEXT,
  arch        TEXT,
  uptime_sec  BIGINT DEFAULT 0
);

-- 2. Real-time metrics snapshots (keep 1 hour rolling)
CREATE TABLE IF NOT EXISTS metrics_snapshots (
  id              BIGSERIAL PRIMARY KEY,
  server_id       TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  cpu_usage       FLOAT DEFAULT 0,
  cpu_temp        FLOAT DEFAULT 0,
  cpu_cores       INT DEFAULT 1,
  ram_total       BIGINT DEFAULT 0,
  ram_used        BIGINT DEFAULT 0,
  ram_free        BIGINT DEFAULT 0,
  swap_total      BIGINT DEFAULT 0,
  swap_used       BIGINT DEFAULT 0,
  disk            JSONB DEFAULT '[]',
  net_up          BIGINT DEFAULT 0,
  net_down        BIGINT DEFAULT 0,
  net_total_up    BIGINT DEFAULT 0,
  net_total_down  BIGINT DEFAULT 0,
  uptime_sec      BIGINT DEFAULT 0
);

-- 3. History per minute (keep 30 days)
CREATE TABLE IF NOT EXISTS metrics_history (
  id          BIGSERIAL PRIMARY KEY,
  server_id   TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  cpu_usage   FLOAT DEFAULT 0,
  ram_used    BIGINT DEFAULT 0,
  ram_total   BIGINT DEFAULT 0,
  net_up      BIGINT DEFAULT 0,
  net_down    BIGINT DEFAULT 0
);

-- 4. Daily bandwidth totals
CREATE TABLE IF NOT EXISTS bandwidth_daily (
  id          BIGSERIAL PRIMARY KEY,
  server_id   TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  date        DATE DEFAULT CURRENT_DATE,
  total_up    BIGINT DEFAULT 0,
  total_down  BIGINT DEFAULT 0,
  UNIQUE(server_id, date)
);

-- 5. System logs (keep 7 days)
CREATE TABLE IF NOT EXISTS system_logs (
  id          BIGSERIAL PRIMARY KEY,
  server_id   TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  level       TEXT DEFAULT 'INFO',
  source      TEXT DEFAULT 'syslog',
  message     TEXT
);

-- 6. Services status (upsert per server)
CREATE TABLE IF NOT EXISTS services_status (
  server_id   TEXT PRIMARY KEY REFERENCES servers(id) ON DELETE CASCADE,
  services    JSONB DEFAULT '[]',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Uptime events
CREATE TABLE IF NOT EXISTS uptime_events (
  id              BIGSERIAL PRIMARY KEY,
  server_id       TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  event_at        TIMESTAMPTZ DEFAULT NOW(),
  event_type      TEXT CHECK (event_type IN ('up', 'down')),
  uptime_seconds  BIGINT DEFAULT 0
);

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX IF NOT EXISTS idx_snapshots_server_time
  ON metrics_snapshots(server_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_history_server_time
  ON metrics_history(server_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_logs_server_time
  ON system_logs(server_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bandwidth_server_date
  ON bandwidth_daily(server_id, date DESC);

-- ================================================
-- ENABLE REALTIME
-- ================================================
-- Jalankan di SQL Editor setelah create tables:
ALTER PUBLICATION supabase_realtime ADD TABLE metrics_snapshots;
ALTER PUBLICATION supabase_realtime ADD TABLE system_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE services_status;
ALTER PUBLICATION supabase_realtime ADD TABLE servers;

-- ================================================
-- AUTO CLEANUP via pg_cron (Supabase built-in)
-- Enable pg_cron: Dashboard > Database > Extensions > pg_cron
-- ================================================

-- Hapus snapshots > 1 jam (jalankan setiap jam)
SELECT cron.schedule(
  'cleanup-snapshots',
  '0 * * * *',
  $$DELETE FROM metrics_snapshots WHERE created_at < NOW() - INTERVAL '1 hour'$$
);

-- Hapus logs > 7 hari (jalankan setiap hari jam 2 pagi)
SELECT cron.schedule(
  'cleanup-logs',
  '0 2 * * *',
  $$DELETE FROM system_logs WHERE created_at < NOW() - INTERVAL '7 days'$$
);

-- Hapus history > 30 hari
SELECT cron.schedule(
  'cleanup-history',
  '30 2 * * *',
  $$DELETE FROM metrics_history WHERE recorded_at < NOW() - INTERVAL '30 days'$$
);

-- ================================================
-- ROW LEVEL SECURITY (Opsional - untuk keamanan extra)
-- ================================================
-- Disable RLS untuk sekarang (pakai API key di level app)
-- Kalau mau enable, uncomment di bawah:

-- ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE metrics_snapshots ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "public_read" ON metrics_snapshots FOR SELECT USING (true);
-- CREATE POLICY "service_insert" ON metrics_snapshots FOR INSERT WITH CHECK (true);

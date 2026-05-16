-- ================================================
-- ServerWatch - Cron Cleanup Jobs
-- JALANKAN HANYA SETELAH pg_cron aktif!
-- Cara aktifkan: Supabase Dashboard > Database > Extensions > pg_cron
-- ================================================

-- Hapus snapshots > 1 jam (jalan setiap jam)
SELECT cron.schedule(
  'cleanup-snapshots',
  '0 * * * *',
  $$DELETE FROM metrics_snapshots WHERE created_at < NOW() - INTERVAL '1 hour'$$
);

-- Hapus logs > 7 hari (jalan setiap hari jam 02:00)
SELECT cron.schedule(
  'cleanup-logs',
  '0 2 * * *',
  $$DELETE FROM system_logs WHERE created_at < NOW() - INTERVAL '7 days'$$
);

-- Hapus history > 30 hari (jalan setiap hari jam 02:30)
SELECT cron.schedule(
  'cleanup-history',
  '30 2 * * *',
  $$DELETE FROM metrics_history WHERE recorded_at < NOW() - INTERVAL '30 days'$$
);

-- Cek jobs yang terdaftar:
-- SELECT * FROM cron.job;

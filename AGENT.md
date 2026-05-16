# 🖥️ SERVER MONITORING APP — AGENT PLANNING DOCUMENT (REVISED)

> Berdasarkan: `app.md`
> Repository: https://github.com/Hariss19id/monitoring-server.git
> Deploy Target: **Vercel (Frontend + API Routes) + Supabase (Database + Realtime)**
> Agent: Script ringan di server yang dipantau → push data ke Supabase

---

## 📌 OVERVIEW PROYEK

Aplikasi monitoring VPS/Server real-time yang bisa diakses via **browser** dan **mobile**.
- **Tidak ada backend tersendiri** — semua pakai Vercel + Supabase
- **Agent** = script Node.js kecil yang jalan di server target, kirim metrics ke Supabase
- **Realtime** = Supabase Realtime Subscriptions (menggantikan Socket.IO)

---

## 🏗️ ARSITEKTUR SISTEM

```
┌─────────────────────────────────────────────────────────────┐
│                SERVER YANG DIPANTAU                          │
│  agent.js (Node.js script) — baca CPU/RAM/Disk/Net          │
│  → Push metrics ke Supabase setiap 3 detik                  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS INSERT (Supabase REST API)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE                                  │
│  PostgreSQL (history) + Realtime (live broadcast)            │
│  Tables: metrics_snapshots, bandwidth_daily, logs,           │
│          services, uptime_events                             │
└────────────────────────┬────────────────────────────────────┘
                         │ Supabase JS Client (Realtime + REST)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND — Next.js 14 di Vercel                 │
│  Dashboard, Charts, Log Viewer, Services Monitor             │
│  Supabase Realtime → live update tanpa Socket.IO             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧰 TECH STACK

### Frontend + API (Vercel)
| Layer | Tool | Keterangan |
|-------|------|------------|
| Framework | **Next.js 14** (App Router) | SSR + API Routes di Vercel |
| Styling | **Tailwind CSS** | Responsive dark mode |
| Charts | **Chart.js** + `react-chartjs-2` | Grafik real-time |
| Realtime | **Supabase Realtime** | Subscribe perubahan DB |
| Database Client | **@supabase/supabase-js** | Query + realtime |
| Icons | **Lucide React** | Modern icon set |
| UI Components | **shadcn/ui** | Headless + styled |
| State | **Zustand** | Global state management |
| Font | **Inter** (Google Fonts) | Modern typography |

### Database (Supabase)
| Fitur | Keterangan |
|-------|------------|
| **PostgreSQL** | Simpan history metrics, logs, events |
| **Realtime** | Broadcast perubahan tabel ke frontend live |
| **Row Level Security** | Keamanan data per API key |
| **Edge Functions** | Untuk cleanup data lama (cron) |

### Agent (Script di Server Target)
| Tool | Keterangan |
|------|------------|
| **Node.js** | Runtime agent |
| **systeminformation** | Baca CPU, RAM, Disk, Network, OS |
| **@supabase/supabase-js** | Push data ke Supabase |
| **PM2** | Keep agent running di background |
| **node-cron** | Cleanup & daily bandwidth snapshot |

---

## 🗄️ SUPABASE DATABASE SCHEMA

```sql
-- Snapshot metrics real-time (TTL: 1 jam, hanya simpan terbaru)
CREATE TABLE metrics_snapshots (
  id          BIGSERIAL PRIMARY KEY,
  server_id   TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  cpu_usage   FLOAT,
  cpu_cores   JSONB,        -- [{ core: 0, load: 45.2 }, ...]
  cpu_temp    FLOAT,
  ram_total   BIGINT,
  ram_used    BIGINT,
  ram_free    BIGINT,
  swap_total  BIGINT,
  swap_used   BIGINT,
  disk        JSONB,        -- [{ path, total, used, use_pct }]
  net_up      BIGINT,       -- bytes/s upload
  net_down    BIGINT,       -- bytes/s download
  net_total_up   BIGINT,
  net_total_down BIGINT
);

-- History per menit (untuk grafik 1 jam / 24 jam)
CREATE TABLE metrics_history (
  id         BIGSERIAL PRIMARY KEY,
  server_id  TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  cpu_usage  FLOAT,
  ram_used   BIGINT,
  ram_total  BIGINT,
  net_up     BIGINT,
  net_down   BIGINT
);

-- Total bandwidth harian
CREATE TABLE bandwidth_daily (
  id        BIGSERIAL PRIMARY KEY,
  server_id TEXT NOT NULL,
  date      DATE DEFAULT CURRENT_DATE,
  total_up  BIGINT DEFAULT 0,
  total_down BIGINT DEFAULT 0,
  UNIQUE(server_id, date)
);

-- System logs stream
CREATE TABLE system_logs (
  id         BIGSERIAL PRIMARY KEY,
  server_id  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  level      TEXT,          -- ERROR, WARN, INFO, DEBUG
  source     TEXT,          -- syslog, auth.log, custom
  message    TEXT
);

-- Services status
CREATE TABLE services_status (
  id         BIGSERIAL PRIMARY KEY,
  server_id  TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name       TEXT,
  status     TEXT,          -- active, inactive, failed
  pid        INT
);

-- Uptime / downtime events
CREATE TABLE uptime_events (
  id         BIGSERIAL PRIMARY KEY,
  server_id  TEXT NOT NULL,
  event_at   TIMESTAMPTZ DEFAULT NOW(),
  event_type TEXT,          -- up, down
  uptime_seconds BIGINT
);

-- Server registry
CREATE TABLE servers (
  id         TEXT PRIMARY KEY,             -- slug unik
  name       TEXT NOT NULL,
  api_key    TEXT UNIQUE NOT NULL,         -- untuk auth agent
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen  TIMESTAMPTZ
);

-- Index untuk performa
CREATE INDEX idx_snapshots_server ON metrics_snapshots(server_id, created_at DESC);
CREATE INDEX idx_history_server ON metrics_history(server_id, recorded_at DESC);
CREATE INDEX idx_logs_server ON system_logs(server_id, created_at DESC);
```

### Supabase Realtime Setup
```sql
-- Enable realtime untuk tabel yang dibutuhkan
ALTER PUBLICATION supabase_realtime ADD TABLE metrics_snapshots;
ALTER PUBLICATION supabase_realtime ADD TABLE system_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE services_status;
```

---

## 📁 STRUKTUR FOLDER

```
monitoring-server/
│
├── agent/                              # Script di server target
│   ├── src/
│   │   ├── collectors/
│   │   │   ├── cpu.js                  # CPU usage, cores, temp
│   │   │   ├── ram.js                  # RAM + swap
│   │   │   ├── disk.js                 # Semua partisi
│   │   │   ├── network.js              # Interface + speed delta
│   │   │   ├── services.js             # systemd service status
│   │   │   ├── logs.js                 # Tail log files
│   │   │   └── osinfo.js               # OS, kernel, hostname
│   │   ├── push/
│   │   │   ├── snapshot.js             # Push real-time snapshot ke Supabase
│   │   │   ├── history.js              # Push 1 data per menit
│   │   │   ├── bandwidth.js            # Update daily bandwidth
│   │   │   ├── logs.js                 # Stream logs ke Supabase
│   │   │   └── services.js             # Push service status
│   │   ├── supabase.js                 # Supabase client init
│   │   └── index.js                    # Entry point, run semua loop
│   ├── ecosystem.config.js             # PM2 config
│   ├── .env.example
│   └── package.json
│
├── frontend/                           # Next.js → Deploy ke Vercel
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard utama
│   │   ├── logs/page.tsx               # Log viewer
│   │   ├── services/page.tsx           # Services monitor
│   │   ├── network/page.tsx            # Detail network
│   │   ├── history/page.tsx            # Grafik history
│   │   └── api/
│   │       └── servers/route.ts        # Vercel API Route (daftar server)
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── CPUCard.tsx
│   │   │   ├── RAMCard.tsx
│   │   │   ├── DiskCard.tsx
│   │   │   ├── NetworkCard.tsx
│   │   │   ├── UptimeCard.tsx
│   │   │   ├── BandwidthCard.tsx
│   │   │   ├── OSInfoCard.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── charts/
│   │   │   ├── CPULineChart.tsx        # Real-time CPU chart
│   │   │   ├── RAMGauge.tsx            # Gauge RAM usage
│   │   │   ├── DiskBarChart.tsx        # Bar per partisi
│   │   │   ├── BandwidthAreaChart.tsx  # Upload vs Download
│   │   │   └── HistoryLineChart.tsx    # History 1h/6h/24h
│   │   ├── logs/
│   │   │   ├── LogViewer.tsx           # Live log stream
│   │   │   └── LogFilter.tsx           # Filter level/source
│   │   ├── services/
│   │   │   └── ServicesList.tsx
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       ├── MobileNav.tsx
│   │       └── ServerSelector.tsx      # Pilih server yang dipantau
│   ├── hooks/
│   │   ├── useRealtimeMetrics.ts       # Subscribe Supabase Realtime
│   │   ├── useMetricsHistory.ts        # Query history data
│   │   ├── useLogs.ts                  # Realtime log stream
│   │   └── useServices.ts
│   ├── lib/
│   │   ├── supabase.ts                 # Supabase client (browser)
│   │   ├── supabase-server.ts          # Supabase client (server-side)
│   │   └── utils.ts
│   ├── store/
│   │   └── metricsStore.ts             # Zustand store
│   ├── types/
│   │   └── metrics.ts                  # TypeScript types
│   ├── public/
│   │   └── manifest.json               # PWA manifest
│   ├── .env.local.example
│   ├── next.config.js
│   └── package.json
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql      # Schema SQL lengkap
│   └── functions/
│       └── cleanup/index.ts            # Edge Function: hapus data lama
│
├── README.md
├── AGENT.md
└── .gitignore
```

---

## 📊 FITUR DETAIL & IMPLEMENTASI

### 1. 🧠 CPU Monitoring
- **Data**: Usage %, per-core load, temperature, model, frequency
- **Collector**: `systeminformation.currentLoad()` + `cpuTemperature()`
- **Push**: Setiap 3 detik → `metrics_snapshots`
- **Frontend**: Supabase Realtime subscribe → update gauge + line chart

### 2. 💾 RAM Monitoring
- **Data**: Total, used, free, available, swap used/free
- **Collector**: `systeminformation.mem()`
- **Visual**: Gauge chart + progress bar + line chart history

### 3. 💿 Disk Monitoring
- **Data**: Semua partisi (path, total, used, free, use%)
- **Collector**: `systeminformation.fsSize()`
- **Visual**: Bar chart per partisi + pie chart total

### 4. 🌐 Network Monitoring
- **Data**: Interface aktif, IP, MAC, speed
- **Collector**: `systeminformation.networkInterfaces()` + `networkStats()`
- **Visual**: Tabel interface + badge status

### 5. 📡 Bandwidth Monitoring
- **Data**: Upload speed (Kb/s), Download speed (Kb/s), total transferred
- **Collector**: Delta `networkStats()` setiap 3 detik
- **History**: Update `bandwidth_daily` di Supabase per menit
- **Visual**: Area chart realtime upload vs download

### 6. ⏱️ Uptime & Downtime
- **Data**: System uptime, last boot time, event history
- **Collector**: `systeminformation.time()` + deteksi heartbeat gap
- **Logic**: Jika tidak ada snapshot > 30 detik = downtime event
- **Visual**: Badge uptime + timeline event

### 7. 📋 Log Monitoring
- **Data**: `/var/log/syslog`, `/var/log/auth.log`, app logs
- **Collector**: `tail` npm → baca baris baru → push ke `system_logs`
- **Frontend**: Supabase Realtime subscribe → live log viewer
- **Visual**: Color-coded by level (ERROR=merah, WARN=kuning, INFO=hijau)

### 8. 🔧 Services Monitoring
- **Data**: Status systemd services (active, failed, inactive)
- **Collector**: `exec('systemctl list-units --type=service --no-pager')`
- **Push**: Setiap 10 detik → `services_status`
- **Visual**: List dengan badge status

### 9. 🖥️ OS & System Info
- **Data**: Distro, kernel, hostname, arch, timezone, CPU model
- **Collector**: `systeminformation.osInfo()` + `system()`
- **Push**: Saat agent start + setiap 5 menit
- **Visual**: Info card di header

### 10. 📊 Total Bandwidth
- **Data**: Kumulatif upload + download per hari
- **Logic**: Agent update `bandwidth_daily` dengan `ON CONFLICT DO UPDATE`
- **Visual**: Counter + bar chart 7 hari terakhir

---

## 🔌 SUPABASE REALTIME HOOKS

```typescript
// hooks/useRealtimeMetrics.ts
export function useRealtimeMetrics(serverId: string) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`metrics-${serverId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'metrics_snapshots',
          filter: `server_id=eq.${serverId}`,
        },
        (payload) => {
          setMetrics(payload.new as Metrics);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [serverId]);

  return metrics;
}
```

---

## 🌍 DEPLOYMENT PLAN

### 1. Setup Supabase
```bash
# 1. Buat project di supabase.com
# 2. Jalankan migration SQL di SQL Editor Supabase
# 3. Enable Realtime untuk tabel: metrics_snapshots, system_logs, services_status
# 4. Buat API key untuk setiap server di tabel 'servers'
```

### 2. Frontend → Vercel
```bash
cd frontend/
vercel deploy

# Environment Variables di Vercel:
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...     # Hanya untuk server-side
```

### 3. Agent → Server Target
```bash
# Di server yang ingin dipantau
git clone https://github.com/Hariss19id/monitoring-server.git
cd monitoring-server/agent
npm install
cp .env.example .env

# Isi .env:
# SUPABASE_URL=https://xxxx.supabase.co
# SUPABASE_KEY=eyJ...        (service role key)
# SERVER_ID=vps-1
# LOG_PATHS=/var/log/syslog,/var/log/auth.log
# PUSH_INTERVAL=3000         (ms)

# Jalankan dengan PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save && pm2 startup
```

### 4. Supabase Edge Function (Cleanup Otomatis)
```typescript
// supabase/functions/cleanup/index.ts
// Hapus data snapshots > 1 jam, logs > 7 hari
// Deploy: supabase functions deploy cleanup
// Cron: setiap jam via Supabase Cron Jobs
```

---

## 📱 MOBILE SUPPORT

- Next.js + Tailwind → responsif otomatis
- Sidebar collapse → bottom navigation di mobile
- Chart.js responsive mode → chart menyesuaikan layar
- **PWA**: `manifest.json` + service worker → bisa install di HP
- **Dark Mode**: Default, class-based Tailwind

---

## 🎨 DESIGN SYSTEM

```
Color Palette (Dark Mode):
  Background:   #0A0E1A
  Surface:      #111827
  Card:         #1F2937
  Border:       #374151
  Primary:      #6366F1  (Indigo)
  Success:      #10B981  (Emerald)
  Warning:      #F59E0B  (Amber)
  Danger:       #EF4444  (Red)
  Text:         #F9FAFB
  Muted:        #9CA3AF

Typography:
  Font: Inter (Google Fonts)
  Mono: JetBrains Mono (untuk metrics & logs)
  Heading: 600-700 weight
  Body: 400 weight

Spacing: 4px base unit
Border Radius: 12px cards, 6px badges
Animation: Framer Motion (smooth transitions)
```

---

## 🔒 KEAMANAN

| Layer | Mekanisme |
|-------|-----------|
| Agent auth | `SERVER_API_KEY` di env, divalidasi via Supabase RLS |
| Frontend | Supabase `anon` key (read-only untuk data publik) |
| RLS Policy | Agent hanya bisa insert ke server_id miliknya |
| Env secrets | Tidak pernah expose service role key ke frontend |
| Rate limit | Supabase built-in rate limiting |

```sql
-- Row Level Security: Agent hanya bisa insert data miliknya
CREATE POLICY "agent_insert" ON metrics_snapshots
  FOR INSERT WITH CHECK (
    server_id = current_setting('request.jwt.claims', true)::json->>'server_id'
  );
```

---

## 📅 TAHAPAN PENGERJAAN

### Phase 1 — Supabase Setup (Hari 1)
- [ ] Buat project Supabase
- [ ] Jalankan migration SQL (semua tabel)
- [ ] Enable Realtime
- [ ] Setup RLS policies
- [ ] Daftarkan server pertama di tabel `servers`

### Phase 2 — Agent Script (Hari 2)
- [ ] Init `agent/package.json`
- [ ] Buat semua collectors (cpu, ram, disk, network, services, logs, osinfo)
- [ ] Buat push functions → kirim ke Supabase
- [ ] Test: cek data masuk ke Supabase Dashboard
- [ ] Setup PM2

### Phase 3 — Frontend Dashboard (Hari 3-4)
- [ ] Init Next.js + Tailwind + shadcn/ui
- [ ] Setup Supabase client
- [ ] Buat layout: Sidebar, Header, MobileNav
- [ ] Dashboard page: CPU, RAM, Disk, Network cards
- [ ] Realtime hook → data live update

### Phase 4 — Charts & Visualisasi (Hari 5)
- [ ] CPULineChart (realtime 60 detik)
- [ ] RAMGauge
- [ ] BandwidthAreaChart (upload vs download)
- [ ] DiskBarChart per partisi
- [ ] HistoryLineChart (1h/6h/24h)

### Phase 5 — Features Tambahan (Hari 6)
- [ ] Log viewer (realtime via Supabase Realtime)
- [ ] Services monitor
- [ ] Uptime/downtime tracker + timeline
- [ ] Total bandwidth harian
- [ ] Server selector (multi-server)

### Phase 6 — Polish & Deploy (Hari 7)
- [ ] PWA manifest + dark mode
- [ ] Mobile responsive polish
- [ ] Supabase Edge Function cleanup
- [ ] Deploy frontend → Vercel
- [ ] Push ke GitHub
- [ ] README.md lengkap

---

## 📦 NPM PACKAGES

### Agent
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "systeminformation": "^5.21.13",
    "tail": "^2.2.4",
    "node-cron": "^3.0.3",
    "dotenv": "^16.3.1"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "next": "14.0.4",
    "react": "^18",
    "react-dom": "^18",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "chart.js": "^4.4.1",
    "react-chartjs-2": "^5.2.0",
    "framer-motion": "^10.18.0",
    "zustand": "^4.4.7",
    "lucide-react": "^0.303.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  }
}
```

---

## 🚀 QUICK START UNTUK IMPLEMENTASI

Urutan file yang harus dibuat:

**Agent (server):**
1. `agent/.env.example`
2. `agent/src/supabase.js`
3. `agent/src/collectors/cpu.js`
4. `agent/src/collectors/ram.js`
5. `agent/src/collectors/disk.js`
6. `agent/src/collectors/network.js`
7. `agent/src/collectors/services.js`
8. `agent/src/collectors/logs.js`
9. `agent/src/push/snapshot.js`
10. `agent/src/index.js`
11. `agent/ecosystem.config.js`

**Frontend (Vercel):**
12. `frontend/` — Next.js init
13. `frontend/lib/supabase.ts`
14. `frontend/hooks/useRealtimeMetrics.ts`
15. `frontend/components/dashboard/` — semua cards
16. `frontend/components/charts/` — semua charts
17. `frontend/app/page.tsx` — Dashboard

**Supabase:**
18. `supabase/migrations/001_initial_schema.sql`
19. `supabase/functions/cleanup/index.ts`

---

*Generated: 2026-05-16 | Revised: Supabase + Vercel Only (No VPS Backend)*

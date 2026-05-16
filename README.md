# ServerWatch — VPS Monitoring Dashboard

Real-time VPS/Server monitoring berbasis **Next.js + Supabase**, deploy ke **Vercel**.

## ✨ Fitur

- 📊 CPU, RAM, Disk, Network realtime
- 📡 Bandwidth upload/download monitoring
- ⏱ Uptime & system info
- 📋 Live log streaming
- 🔧 Systemd services monitor
- 📈 History charts (1h / 6h / 24h)
- 📱 Mobile-friendly + PWA
- 🌙 Dark mode
- 🖥 Multi-server support

## 🚀 Deploy (5 menit)

### 1. Setup Supabase

1. Buat project di [supabase.com](https://supabase.com) (gratis)
2. Buka **SQL Editor** → paste isi `supabase/migrations/001_initial_schema.sql`
3. Klik **Run**
4. Buka **Database > Extensions** → aktifkan `pg_cron`

### 2. Deploy ke Vercel

```bash
# Clone & deploy
git clone https://github.com/Hariss19id/monitoring-server.git
cd monitoring-server/app
npx vercel deploy
```

Environment variables di Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 3. Install Agent di VPS

1. Buka dashboard → halaman **Servers**
2. Klik **"Tambah Server Baru"**
3. Isi nama server → klik **"Generate"**
4. Copy perintah install yang muncul
5. Paste di terminal VPS Anda → Enter

Contoh command yang di-generate:
```bash
script_name="monitor-agent.sh"; curl -fsSL "https://your-app.vercel.app/api/agent/SERVER_ID/API_KEY" -o "$PWD/$script_name" || wget -O "$PWD/$script_name" "..."; chmod +x "$PWD/$script_name"; (crontab -l 2>/dev/null | grep -v "$script_name"; echo "* * * * * /bin/bash $PWD/$script_name") | crontab -; echo "✅ Monitor berhasil diinstal!"
```

Server akan muncul di dashboard dalam ~30 detik! ✅

## 🗂 Struktur

```
monitoring/
├── app/                        ← Next.js (deploy ke Vercel)
│   ├── app/                    ← Pages & API Routes
│   │   ├── page.tsx            ← Dashboard utama
│   │   ├── network/page.tsx    ← Network monitoring
│   │   ├── disk/page.tsx       ← Storage monitoring
│   │   ├── services/page.tsx   ← Services monitor
│   │   ├── logs/page.tsx       ← Log viewer
│   │   ├── history/page.tsx    ← History charts
│   │   ├── servers/page.tsx    ← Server management
│   │   └── api/                ← API Routes
│   ├── components/             ← UI Components
│   ├── hooks/                  ← Custom React hooks
│   ├── store/                  ← Zustand state
│   ├── lib/                    ← Utilities & Supabase client
│   └── public/
│       └── agent-template.sh   ← Agent bash script template
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, Chart.js |
| Database | Supabase (PostgreSQL + Realtime) |
| State | Zustand |
| Deploy | Vercel |
| Agent | Bash script + cron |

## 📋 Requirements Agent (VPS)

- Linux (Ubuntu/Debian/CentOS)
- `bash`, `curl` (sudah ada di semua distro)
- `python3` (untuk disk & services JSON parsing)
- Koneksi internet ke Supabase

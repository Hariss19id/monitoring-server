<div align="center">

# 🖥️ ServerWatch

**Real-time VPS & Server Monitoring Dashboard**

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-green?logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

Monitor CPU, RAM, Disk, Network, Services, dan Logs server VPS kamu secara realtime —
hanya dengan **1 baris perintah** install di terminal.

[🚀 Live Demo](https://server.hariss.my.id) · [📋 Quick Install](#-install-agent-1-menit) · [🐛 Report Bug](https://github.com/Hariss19id/monitoring-server/issues)

</div>

---

## ✨ Fitur

| Fitur | Keterangan |
|-------|-----------|
| 📊 **CPU Monitor** | Usage %, temperature, jumlah core |
| 🧠 **RAM Monitor** | Used/Free/Total + Swap |
| 💾 **Disk Monitor** | Penggunaan per partisi |
| 🌐 **Network Monitor** | Upload/Download speed realtime |
| 🔧 **Services Monitor** | Status systemd services |
| 📋 **Log Viewer** | Live log streaming dengan filter level |
| 📈 **History Charts** | Grafik historis 1h / 6h / 24h |
| 🖥️ **Multi-Server** | Pantau banyak VPS sekaligus |
| 📱 **Mobile Ready** | Responsive + PWA installable |
| ⚡ **Realtime** | Update otomatis via Supabase Realtime |
| 🔑 **One-liner Install** | Install agent hanya 1 baris perintah |
| 🗑️ **One-liner Uninstall** | Uninstall bersih tanpa sisa |

## 🖼️ Preview

> Dashboard dengan dark mode, glassmorphism cards, dan realtime charts.

```
┌────────────────────────────────────────────────────────────┐
│  ⬡ ServerWatch          [VPS Test ▾]            20:30:15  │
├──────────┬─────────────────────────────────────────────────┤
│ Dashboard│  CPU          RAM          Network    Uptime     │
│ Network  │  [████░] 42%  [██░░] 61%  ↑2KB/s    14d 3h     │
│ Storage  │                                                   │
│ Services │  ──── CPU Usage (Realtime) ────────────────────  │
│ Logs     │  100│                                            │
│ History  │   50│    ╭──╮   ╭─╮                             │
│ Servers  │    0│────╯  ╰───╯ ╰──────────────────           │
└──────────┴─────────────────────────────────────────────────┘
```

## 🚀 Deploy (5 Menit)

### 1️⃣ Setup Database — Supabase

1. Buat project gratis di **[supabase.com](https://supabase.com)**
2. Buka **SQL Editor** → paste isi file [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) → klik **Run**
3. *(Opsional)* Aktifkan `pg_cron` di **Database > Extensions** → jalankan [`002_cron_cleanup.sql`](supabase/migrations/002_cron_cleanup.sql) untuk auto-cleanup data lama

### 2️⃣ Deploy Frontend — Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Hariss19id/monitoring-server)

**Atau manual:**
```bash
git clone https://github.com/Hariss19id/monitoring-server.git
cd monitoring-server
# Import ke vercel.com → set Root Directory: app
```

**Environment Variables di Vercel:**
```env
NEXT_PUBLIC_SUPABASE_URL      = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY     = eyJ...
NEXT_PUBLIC_APP_URL           = https://your-domain.vercel.app
```

> ⚠️ **Penting:** Set **Root Directory = `app`** di Vercel Project Settings → General

### 3️⃣ Install Agent — VPS

Buka dashboard → **Servers** → isi nama VPS → klik **Generate**

Copy command yang muncul dan paste di terminal VPS:

```bash
# Contoh install command (auto-generated dari dashboard):
script_name="monitor-agent.sh"; curl -fsSL "https://your-app.vercel.app/api/agent/SERVER_ID/API_KEY" \
  -o "$PWD/$script_name" || wget -O "$PWD/$script_name" "..."; \
  chmod +x "$PWD/$script_name"; \
  (crontab -l 2>/dev/null | grep -v "$script_name"; \
  echo "* * * * * /bin/bash $PWD/$script_name") | crontab -; \
  echo "✅ Monitor berhasil diinstal!"
```

✅ **Server muncul di dashboard dalam ~30 detik!**

## 🗑️ Uninstall Agent

Command uninstall juga tersedia di dashboard (otomatis di-generate bersama install command):

```bash
# Contoh uninstall command:
u="uninstall-monitor.sh"; curl -fsSL "https://your-app.vercel.app/api/uninstall/SERVER_ID/API_KEY" \
  -o "$PWD/$u"; chmod +x "$PWD/$u"; bash "$PWD/$u"
```

Script uninstall akan:
- ✅ Hapus cron job
- ✅ Hapus file `monitor-agent.sh`
- ✅ Auto-cleanup file uninstall sendiri
- ✅ Update status server ke Offline

## 🗂️ Struktur Proyek

```
monitoring-server/
├── app/                          # Next.js 16 Application
│   ├── app/
│   │   ├── page.tsx              # Dashboard utama
│   │   ├── network/page.tsx      # Network monitoring
│   │   ├── disk/page.tsx         # Storage monitoring
│   │   ├── services/page.tsx     # Services monitor
│   │   ├── logs/page.tsx         # Log viewer
│   │   ├── history/page.tsx      # History charts
│   │   ├── servers/page.tsx      # Server management
│   │   └── api/
│   │       ├── servers/          # CRUD server registry
│   │       ├── agent/            # Serve & inject agent script
│   │       ├── uninstall/        # Serve uninstall script
│   │       └── history/          # Fetch metrics history
│   ├── components/
│   │   ├── dashboard/            # Metric cards (CPU, RAM, etc.)
│   │   ├── charts/               # Realtime & bandwidth charts
│   │   ├── layout/               # Sidebar, Header, MobileNav
│   │   ├── logs/                 # Log viewer component
│   │   └── services/             # Services list
│   ├── hooks/                    # useRealtimeMetrics, useLogs
│   ├── store/                    # Zustand global state
│   ├── lib/                      # Supabase client & utilities
│   ├── types/                    # TypeScript interfaces
│   └── public/
│       ├── agent-template.sh     # Bash agent template
│       └── uninstall-template.sh # Bash uninstall template
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql  # Tables, indexes, realtime
        └── 002_cron_cleanup.sql    # Auto-cleanup (pg_cron)
```

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, Tailwind CSS |
| **Charts** | Chart.js + react-chartjs-2 |
| **State** | Zustand |
| **Database** | Supabase (PostgreSQL) |
| **Realtime** | Supabase Realtime Subscriptions |
| **Animations** | CSS transitions + keyframes |
| **Icons** | Lucide React |
| **Deploy** | Vercel |
| **Agent** | Pure Bash + cron |

## 📋 Requirements VPS/Server

- **OS:** Linux (Ubuntu 18+, Debian 9+, CentOS 7+, dll.)
- **Tools:** `bash`, `curl` atau `wget` *(pre-installed di semua distro)*
- **Opsional:** `python3` *(untuk disk info yang lebih detail)*
- **Koneksi:** Internet ke Supabase (HTTPS port 443)
- **Akses:** User dengan `crontab` permission

## 🔒 Keamanan

- Setiap server mendapat `API_KEY` unik yang di-generate secara random
- Agent hanya bisa mengakses endpoint dengan ID & API Key yang valid
- `SUPABASE_SERVICE_ROLE_KEY` hanya digunakan di server-side (API Routes)
- Tidak ada credential sensitif yang terekspos ke client/browser

## 🤝 Kontribusi

Pull request sangat diterima! Untuk perubahan besar, buka issue terlebih dahulu.

1. Fork repository
2. Buat branch fitur: `git checkout -b feat/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambah fitur X'`
4. Push ke branch: `git push origin feat/nama-fitur`
5. Buat Pull Request

## 📄 Lisensi

Didistribusikan di bawah **MIT License**. Lihat [`LICENSE`](LICENSE) untuk detail.

---

<div align="center">

Made with ❤️ by [Hariss19id](https://github.com/Hariss19id)

⭐ **Star repo ini jika bermanfaat!** ⭐

</div>

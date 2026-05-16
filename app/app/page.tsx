'use client'

import { useMetricsStore } from '@/store/metricsStore'
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import CPUCard from '@/components/dashboard/CPUCard'
import RAMCard from '@/components/dashboard/RAMCard'
import NetworkCard from '@/components/dashboard/NetworkCard'
import DiskCard from '@/components/dashboard/DiskCard'
import UptimeCard from '@/components/dashboard/UptimeCard'
import RealtimeLineChart from '@/components/charts/RealtimeLineChart'
import BandwidthChart from '@/components/charts/BandwidthChart'
import { Activity } from 'lucide-react'

export default function DashboardPage() {
  const { selectedServer, latestMetrics, cpuHistory, ramHistory, netUpHistory, netDownHistory, isOnline } = useMetricsStore()

  useRealtimeMetrics(selectedServer?.id ?? null)

  const m = latestMetrics
  const bandwidthData = netUpHistory.map((u, i) => ({
    time: u.time,
    up: u.value,
    down: netDownHistory[i]?.value ?? 0,
  }))

  return (
    <div className="flex min-h-screen bg-[#0A0E1A] bg-grid">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          {/* No server selected */}
          {!selectedServer && (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Activity className="w-8 h-8 text-indigo-400" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-200 mb-1">Belum ada server</h2>
                <p className="text-gray-500 text-sm">Tambahkan server di halaman <a href="/servers" className="text-indigo-400 hover:underline">Servers</a></p>
              </div>
            </div>
          )}

          {/* No data yet */}
          {selectedServer && !m && (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <div className="w-12 h-12 rounded-xl border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400">Menunggu data dari agent...</p>
              <p className="text-gray-600 text-xs">Pastikan agent sudah terinstall di server</p>
            </div>
          )}

          {selectedServer && m && (
            <div className="space-y-6">
              {/* Page title */}
              <div>
                <h1 className="text-xl font-bold text-gray-100">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-0.5">{selectedServer.name} — Real-time monitoring</p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <CPUCard usage={m.cpu_usage} temp={m.cpu_temp} cores={m.cpu_cores} />
                <RAMCard
                  total={m.ram_total} used={m.ram_used} free={m.ram_free}
                  swapTotal={m.swap_total} swapUsed={m.swap_used}
                />
                <NetworkCard
                  netUp={m.net_up} netDown={m.net_down}
                  totalUp={m.net_total_up} totalDown={m.net_total_down}
                />
                <UptimeCard server={selectedServer} uptimeSec={m.uptime_sec} isOnline={isOnline} />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* CPU Chart */}
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-4">CPU Usage (Realtime)</h3>
                  <RealtimeLineChart
                    data={cpuHistory}
                    label="CPU %"
                    color="#6366F1"
                    unit="%"
                    height={160}
                  />
                </div>

                {/* RAM Chart */}
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-4">RAM Usage (Realtime)</h3>
                  <RealtimeLineChart
                    data={ramHistory}
                    label="RAM %"
                    color="#8B5CF6"
                    unit="%"
                    height={160}
                  />
                </div>
              </div>

              {/* Bandwidth Chart */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Bandwidth (Upload vs Download)</h3>
                <BandwidthChart data={bandwidthData} height={180} />
              </div>

              {/* Disk */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Storage</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {m.disk?.filter(d => d.total > 100 * 1024 * 1024).slice(0, 6).map(disk => (
                    <div key={disk.path}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-400 font-mono">{disk.path}</span>
                        <span className={`font-semibold metric-value ${
                          disk.use_pct > 90 ? 'text-red-400' : disk.use_pct > 75 ? 'text-amber-400' : 'text-gray-300'
                        }`}>{disk.use_pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className={`progress-fill ${
                          disk.use_pct > 90 ? 'bg-red-500' : disk.use_pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} style={{ width: `${disk.use_pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-600 mt-1 metric-value">
                        <span>{(disk.used / 1073741824).toFixed(1)} GB used</span>
                        <span>{(disk.total / 1073741824).toFixed(1)} GB total</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}

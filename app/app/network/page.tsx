'use client'

import { useMetricsStore } from '@/store/metricsStore'
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import BandwidthChart from '@/components/charts/BandwidthChart'
import { formatSpeed, formatBytes } from '@/lib/utils'
import { ArrowUp, ArrowDown, Wifi } from 'lucide-react'

export default function NetworkPage() {
  const { selectedServer, latestMetrics, netUpHistory, netDownHistory } = useMetricsStore()
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
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-100">Network</h1>
            <p className="text-gray-500 text-sm mt-0.5">Bandwidth & traffic monitoring</p>
          </div>

          {m && (
            <div className="space-y-4">
              {/* Speed cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Upload Speed', value: formatSpeed(m.net_up), icon: ArrowUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Download Speed', value: formatSpeed(m.net_down), icon: ArrowDown, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'Total Upload', value: formatBytes(m.net_total_up), icon: ArrowUp, color: 'text-emerald-300', bg: 'bg-emerald-500/5' },
                  { label: 'Total Download', value: formatBytes(m.net_total_down), icon: ArrowDown, color: 'text-blue-300', bg: 'bg-blue-500/5' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className={`glass-card p-4 ${bg}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-xs text-gray-500">{label}</span>
                    </div>
                    <p className={`text-xl font-bold metric-value ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Bandwidth chart */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Wifi className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Bandwidth History</h3>
                </div>
                <BandwidthChart data={bandwidthData} height={220} />
              </div>
            </div>
          )}

          {!m && (
            <div className="glass-card p-12 text-center text-gray-500">
              Menunggu data network...
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}

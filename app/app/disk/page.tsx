'use client'

import { useMetricsStore } from '@/store/metricsStore'
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { formatBytes, getStatusBg, cn } from '@/lib/utils'
import { HardDrive } from 'lucide-react'

export default function DiskPage() {
  const { selectedServer, latestMetrics } = useMetricsStore()
  useRealtimeMetrics(selectedServer?.id ?? null)
  const m = latestMetrics

  const disks = m?.disk?.filter(d => d.total > 1024 * 1024) || []

  return (
    <div className="flex min-h-screen bg-[#0A0E1A] bg-grid">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-100">Storage</h1>
            <p className="text-gray-500 text-sm mt-0.5">Disk usage per partition</p>
          </div>

          <div className="space-y-4">
            {disks.length === 0 && (
              <div className="glass-card p-12 text-center text-gray-500">Menunggu data disk...</div>
            )}
            {disks.map(disk => (
              <div key={disk.path} className="glass-card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <HardDrive className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-mono font-semibold text-gray-100">{disk.path}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatBytes(disk.total)} total</p>
                    </div>
                  </div>
                  <span className={cn(
                    'text-3xl font-bold metric-value',
                    disk.use_pct > 90 ? 'text-red-400' : disk.use_pct > 75 ? 'text-amber-400' : 'text-emerald-400'
                  )}>{disk.use_pct}%</span>
                </div>

                <div className="progress-bar h-3 mb-3">
                  <div
                    className={cn('progress-fill', getStatusBg(disk.use_pct))}
                    style={{ width: `${disk.use_pct}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  {[
                    { label: 'Used', value: formatBytes(disk.used), color: 'text-amber-400' },
                    { label: 'Free', value: formatBytes(disk.free), color: 'text-emerald-400' },
                    { label: 'Total', value: formatBytes(disk.total), color: 'text-gray-300' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-[#111827] rounded-lg p-3 text-center">
                      <p className={`font-bold metric-value ${color}`}>{value}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}

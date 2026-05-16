'use client'

import { useMetricsStore } from '@/store/metricsStore'
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics'
import { useLogs } from '@/hooks/useLogs'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import LogViewer from '@/components/logs/LogViewer'
import { Terminal } from 'lucide-react'

export default function LogsPage() {
  const { selectedServer } = useMetricsStore()
  useRealtimeMetrics(selectedServer?.id ?? null)
  const logs = useLogs(selectedServer?.id ?? null)

  return (
    <div className="flex min-h-screen bg-[#0A0E1A] bg-grid">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-100">System Logs</h1>
            <p className="text-gray-500 text-sm mt-0.5">Live log stream from server</p>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-gray-300">Log Stream</h3>
              <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                Live
              </span>
            </div>
            <LogViewer logs={logs} />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}

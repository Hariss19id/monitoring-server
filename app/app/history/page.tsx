'use client'

import { useState, useEffect } from 'react'
import { useMetricsStore } from '@/store/metricsStore'
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import RealtimeLineChart from '@/components/charts/RealtimeLineChart'
import type { MetricsHistory } from '@/types/metrics'

export default function HistoryPage() {
  const { selectedServer } = useMetricsStore()
  useRealtimeMetrics(selectedServer?.id ?? null)
  const [history, setHistory] = useState<MetricsHistory[]>([])
  const [range, setRange] = useState<'1h' | '6h' | '24h'>('6h')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedServer) return
    const fetchHistory = async () => {
      setLoading(true)
      const res = await fetch(`/api/history/${selectedServer.id}`)
      const data = await res.json()
      setHistory(data || [])
      setLoading(false)
    }
    fetchHistory()
    const interval = setInterval(fetchHistory, 60000)
    return () => clearInterval(interval)
  }, [selectedServer])

  const limitMap = { '1h': 12, '6h': 72, '24h': 288 }
  const sliced = history.slice(-limitMap[range])

  const cpuData = sliced.map(h => ({
    time: new Date(h.recorded_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    value: h.cpu_usage,
  }))
  const ramData = sliced.map(h => ({
    time: new Date(h.recorded_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    value: h.ram_total > 0 ? Math.round((h.ram_used / h.ram_total) * 100) : 0,
  }))
  const netUpData = sliced.map(h => ({
    time: new Date(h.recorded_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    value: Math.round(h.net_up / 1024),
  }))
  const netDownData = sliced.map(h => ({
    time: new Date(h.recorded_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    value: Math.round(h.net_down / 1024),
  }))

  return (
    <div className="flex min-h-screen bg-[#0A0E1A] bg-grid">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-100">History</h1>
              <p className="text-gray-500 text-sm mt-0.5">Historical metrics data</p>
            </div>
            {/* Range selector */}
            <div className="flex gap-1 bg-[#1F2937] border border-[#374151] rounded-lg p-1">
              {(['1h', '6h', '24h'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                    range === r
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">CPU Usage — {range}</h3>
                <RealtimeLineChart data={cpuData} label="CPU %" color="#6366F1" unit="%" height={180} />
              </div>
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">RAM Usage — {range}</h3>
                <RealtimeLineChart data={ramData} label="RAM %" color="#8B5CF6" unit="%" height={180} />
              </div>
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Upload Speed — {range}</h3>
                <RealtimeLineChart data={netUpData} label="KB/s" color="#10B981" unit=" KB/s" height={180} />
              </div>
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Download Speed — {range}</h3>
                <RealtimeLineChart data={netDownData} label="KB/s" color="#60A5FA" unit=" KB/s" height={180} />
              </div>
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}

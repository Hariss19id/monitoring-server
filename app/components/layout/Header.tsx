'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useMetricsStore } from '@/store/metricsStore'
import { Server, ChevronDown, RefreshCw } from 'lucide-react'
import type { Server as ServerType } from '@/types/metrics'
import { timeAgo } from '@/lib/utils'

export default function Header() {
  const { selectedServer, servers, setSelectedServer, setServers, lastSeen, isOnline } = useMetricsStore()
  const [open, setOpen] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const fetchServers = async () => {
      const { data } = await supabase.from('servers').select('*').order('created_at')
      if (data) {
        setServers(data as ServerType[])
        if (!selectedServer && data.length > 0) setSelectedServer(data[0] as ServerType)
      }
    }
    fetchServers()

    const tick = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(tick)
  }, [])

  return (
    <header className="h-14 bg-[#111827] border-b border-[#374151] flex items-center justify-between px-4 lg:px-6 gap-4 sticky top-0 z-30">
      {/* Left: ServerWatch brand (mobile) */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Server className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold gradient-text">ServerWatch</span>
      </div>

      {/* Center: Server selector */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-[#1F2937] hover:bg-[#374151] border border-[#374151] rounded-lg px-3 py-1.5 text-sm transition-colors"
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <span className="font-medium">{selectedServer?.name || 'Pilih Server'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {open && servers.length > 0 && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-[#1F2937] border border-[#374151] rounded-lg shadow-xl z-50 overflow-hidden">
            {servers.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedServer(s); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[#374151] transition-colors text-left"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <div>
                  <p className="font-medium text-gray-100">{s.name}</p>
                  <p className="text-[10px] text-gray-500">{s.hostname || s.id}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Clock + last seen */}
      <div className="flex items-center gap-4">
        {lastSeen && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
            <RefreshCw className="w-3 h-3" />
            <span>{timeAgo(lastSeen)}</span>
          </div>
        )}
        <div className="text-xs font-mono text-gray-400 hidden md:block" suppressHydrationWarning>
          {time.toLocaleTimeString('id-ID')}
        </div>
      </div>
    </header>
  )
}

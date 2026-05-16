'use client'

import { formatUptime } from '@/lib/utils'
import { Clock, Server } from 'lucide-react'
import type { Server as ServerType } from '@/types/metrics'

interface Props {
  server: ServerType | null
  uptimeSec: number
  isOnline: boolean
}

export default function UptimeCard({ server, uptimeSec, isOnline }: Props) {
  return (
    <div className="glass-card p-5 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Clock className="w-4 h-4 text-emerald-400" />
        </div>
        <span className="text-sm font-semibold text-gray-300">System Info</span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
          isOnline
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            : 'bg-red-500/15 text-red-400 border border-red-500/30'
        }`}>
          {isOnline ? '● Online' : '○ Offline'}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Uptime</span>
          <span className="metric-value font-semibold text-emerald-400">{formatUptime(uptimeSec)}</span>
        </div>

        {server?.hostname && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Hostname</span>
            <span className="metric-value text-gray-200 text-right truncate max-w-[150px]">{server.hostname}</span>
          </div>
        )}
        {server?.distro && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">OS</span>
            <span className="text-gray-200 text-right text-xs truncate max-w-[150px]">{server.distro}</span>
          </div>
        )}
        {server?.kernel && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Kernel</span>
            <span className="metric-value text-gray-400 text-xs">{server.kernel}</span>
          </div>
        )}
        {server?.arch && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Arch</span>
            <span className="metric-value text-gray-400 text-xs">{server.arch}</span>
          </div>
        )}
      </div>
    </div>
  )
}

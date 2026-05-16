'use client'

import { cn, getStatusColor, getStatusBg, formatBytes } from '@/lib/utils'
import { MemoryStick } from 'lucide-react'

interface Props {
  total: number
  used: number
  free: number
  swapTotal: number
  swapUsed: number
}

export default function RAMCard({ total, used, free, swapTotal, swapUsed }: Props) {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0
  const swapPct = swapTotal > 0 ? Math.round((swapUsed / swapTotal) * 100) : 0

  return (
    <div className="glass-card p-5 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <MemoryStick className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-sm font-semibold text-gray-300">RAM</span>
        </div>
        <span className={cn('text-2xl font-bold metric-value', getStatusColor(pct))}>
          {pct}%
        </span>
      </div>

      <div className="progress-bar mb-3">
        <div className={cn('progress-fill', getStatusBg(pct))} style={{ width: `${pct}%` }} />
      </div>

      <div className="flex justify-between text-xs text-gray-500 metric-value mb-3">
        <span>{formatBytes(used)} used</span>
        <span>{formatBytes(total)} total</span>
      </div>

      {swapTotal > 0 && (
        <>
          <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
            <span>Swap</span>
            <span className="metric-value">{swapPct}%</span>
          </div>
          <div className="progress-bar h-1">
            <div
              className="progress-fill bg-violet-500"
              style={{ width: `${swapPct}%` }}
            />
          </div>
        </>
      )}
    </div>
  )
}

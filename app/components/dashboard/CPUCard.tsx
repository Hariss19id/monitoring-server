'use client'

import { cn, getStatusColor, getStatusBg } from '@/lib/utils'
import { Cpu } from 'lucide-react'

interface Props {
  usage: number
  temp: number
  cores: number
}

export default function CPUCard({ usage, temp, cores }: Props) {
  const pct = Math.min(Math.round(usage), 100)

  return (
    <div className="glass-card p-5 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-sm font-semibold text-gray-300">CPU</span>
        </div>
        <span className={cn('text-2xl font-bold metric-value', getStatusColor(pct))}>
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-3">
        <div
          className={cn('progress-fill', getStatusBg(pct))}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="flex justify-between text-xs text-gray-500 metric-value">
        <span>{cores} cores</span>
        {temp > 0 && (
          <span className={cn(temp > 80 ? 'text-red-400' : temp > 65 ? 'text-amber-400' : 'text-gray-500')}>
            🌡 {temp}°C
          </span>
        )}
      </div>
    </div>
  )
}

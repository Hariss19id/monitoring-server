'use client'

import { formatSpeed } from '@/lib/utils'
import { ArrowUp, ArrowDown, Wifi } from 'lucide-react'

interface Props {
  netUp: number
  netDown: number
  totalUp: number
  totalDown: number
}

export default function NetworkCard({ netUp, netDown, totalUp, totalDown }: Props) {
  return (
    <div className="glass-card p-5 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
          <Wifi className="w-4 h-4 text-cyan-400" />
        </div>
        <span className="text-sm font-semibold text-gray-300">Network</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#111827] rounded-lg p-3">
          <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1">
            <ArrowUp className="w-3 h-3 text-emerald-400" />
            Upload
          </div>
          <p className="metric-value text-lg font-bold text-emerald-400">{formatSpeed(netUp)}</p>
        </div>
        <div className="bg-[#111827] rounded-lg p-3">
          <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1">
            <ArrowDown className="w-3 h-3 text-blue-400" />
            Download
          </div>
          <p className="metric-value text-lg font-bold text-blue-400">{formatSpeed(netDown)}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#374151] flex justify-between text-[11px] text-gray-500 metric-value">
        <span>↑ Total: {formatSpeed(totalUp)}</span>
        <span>↓ Total: {formatSpeed(totalDown)}</span>
      </div>
    </div>
  )
}

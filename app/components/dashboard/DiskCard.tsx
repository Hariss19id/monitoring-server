'use client'

import { formatBytes, getStatusBg, cn } from '@/lib/utils'
import { HardDrive } from 'lucide-react'
import type { DiskInfo } from '@/types/metrics'

interface Props { disks: DiskInfo[] }

export default function DiskCard({ disks }: Props) {
  const mainDisks = disks.filter(d => d.total > 100 * 1024 * 1024).slice(0, 4)

  return (
    <div className="glass-card p-5 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <HardDrive className="w-4 h-4 text-amber-400" />
        </div>
        <span className="text-sm font-semibold text-gray-300">Storage</span>
      </div>

      <div className="flex flex-col gap-3">
        {mainDisks.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-2">No disk data</p>
        )}
        {mainDisks.map((disk) => (
          <div key={disk.path}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-400 font-mono truncate max-w-[120px]">{disk.path}</span>
              <span className={cn('font-semibold metric-value',
                disk.use_pct > 90 ? 'text-red-400' :
                disk.use_pct > 75 ? 'text-amber-400' : 'text-gray-300'
              )}>{disk.use_pct}%</span>
            </div>
            <div className="progress-bar">
              <div
                className={cn('progress-fill', getStatusBg(disk.use_pct))}
                style={{ width: `${disk.use_pct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-600 mt-1 metric-value">
              <span>{formatBytes(disk.used)}</span>
              <span>{formatBytes(disk.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import type { ServiceInfo } from '@/types/metrics'
import { cn } from '@/lib/utils'
import { Server } from 'lucide-react'

interface Props { services: ServiceInfo[] }

const statusStyle: Record<string, string> = {
  active:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  inactive: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  failed:   'bg-red-500/15 text-red-400 border-red-500/30',
}

export default function ServicesList({ services }: Props) {
  const sorted = [...services].sort((a, b) => {
    const order: Record<string, number> = { failed: 0, active: 1, inactive: 2 }
    return (order[a.status] ?? 3) - (order[b.status] ?? 3)
  })

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto">
      {sorted.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-8">No services data</div>
      )}
      {sorted.map((svc) => (
        <div
          key={svc.name}
          className="flex items-center justify-between px-3 py-2.5 bg-[#111827] rounded-lg border border-[#374151] hover:border-[#4B5563] transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Server className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span className="text-sm text-gray-200 font-mono truncate">{svc.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {svc.sub && (
              <span className="text-[10px] text-gray-600 hidden sm:block">{svc.sub}</span>
            )}
            <span className={cn(
              'text-[10px] px-2 py-0.5 rounded-full border font-medium',
              statusStyle[svc.status] || 'bg-gray-500/15 text-gray-400 border-gray-500/30'
            )}>
              {svc.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

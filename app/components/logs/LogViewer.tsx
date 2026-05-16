'use client'

import { useState } from 'react'
import type { SystemLog } from '@/types/metrics'
import { cn } from '@/lib/utils'

interface Props { logs: SystemLog[] }

const levelColor: Record<string, string> = {
  ERROR: 'log-error',
  WARN:  'log-warn',
  INFO:  'log-info',
  DEBUG: 'log-debug',
}

const levelBg: Record<string, string> = {
  ERROR: 'bg-red-500/10 border-red-500/20',
  WARN:  'bg-amber-500/10 border-amber-500/20',
  INFO:  'bg-emerald-500/10 border-emerald-500/20',
  DEBUG: 'bg-blue-500/10 border-blue-500/20',
}

export default function LogViewer({ logs }: Props) {
  const [filter, setFilter] = useState<string>('ALL')

  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.level === filter)

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'text-xs px-3 py-1 rounded-full border transition-all font-medium',
              filter === f
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'border-[#374151] text-gray-400 hover:text-gray-200 hover:border-gray-500'
            )}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-600 self-center">{filtered.length} entries</span>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0 max-h-[500px]">
        {filtered.length === 0 && (
          <p className="text-center text-gray-600 text-sm py-8">No logs found</p>
        )}
        {[...filtered].reverse().map((log) => (
          <div
            key={log.id}
            className={cn(
              'flex items-start gap-2 px-3 py-2 rounded-lg border text-xs',
              levelBg[log.level] || 'bg-[#1F2937] border-[#374151]'
            )}
          >
            <span className={cn('font-bold shrink-0 w-12', levelColor[log.level] || 'log-default')}>
              {log.level || 'LOG'}
            </span>
            <span className="text-gray-500 font-mono shrink-0 hidden sm:block">
              {new Date(log.created_at).toLocaleTimeString('id-ID')}
            </span>
            <span className="text-gray-300 break-all font-mono">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

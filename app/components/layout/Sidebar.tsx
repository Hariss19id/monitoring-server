'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Activity, HardDrive, Network,
  Terminal, Server, Settings, Wifi, BarChart2
} from 'lucide-react'
import { useMetricsStore } from '@/store/metricsStore'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/',          label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/network',   label: 'Network',    icon: Network },
  { href: '/disk',      label: 'Storage',    icon: HardDrive },
  { href: '/services',  label: 'Services',   icon: Server },
  { href: '/logs',      label: 'Logs',       icon: Terminal },
  { href: '/history',   label: 'History',    icon: BarChart2 },
  { href: '/servers',   label: 'Servers',    icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { selectedServer, isOnline } = useMetricsStore()

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-[#111827] border-r border-[#374151] p-4 gap-2">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-4 mb-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg gradient-text">ServerWatch</span>
      </div>

      {/* Server Status Badge */}
      {selectedServer && (
        <div className="glass-card px-3 py-2 mb-4 flex items-center gap-2">
          <span className={cn(
            'w-2 h-2 rounded-full',
            isOnline ? 'bg-emerald-400 pulse-dot' : 'bg-red-400'
          )} />
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-100 truncate">{selectedServer.name}</p>
            <p className="text-[10px] text-gray-500">{isOnline ? 'Online' : 'Offline'}</p>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn('sidebar-link', pathname === href && 'active')}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="text-[10px] text-gray-600 px-2 pt-4 border-t border-[#374151]">
        <p>ServerWatch v1.0</p>
        <p className="flex items-center gap-1 mt-1">
          <Wifi className="w-3 h-3" /> Realtime via Supabase
        </p>
      </div>
    </aside>
  )
}

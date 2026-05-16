'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Network, HardDrive, Server, Terminal, BarChart2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/',         label: 'Dash',     icon: LayoutDashboard },
  { href: '/network',  label: 'Net',      icon: Network },
  { href: '/disk',     label: 'Disk',     icon: HardDrive },
  { href: '/services', label: 'Svc',      icon: Server },
  { href: '/logs',     label: 'Logs',     icon: Terminal },
  { href: '/history',  label: 'History',  icon: BarChart2 },
  { href: '/servers',  label: 'Config',   icon: Settings },
]

export default function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#111827] border-t border-[#374151] z-40 flex justify-around px-2 py-1 safe-area-inset-bottom">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all',
            pathname === href
              ? 'text-indigo-400 bg-indigo-500/10'
              : 'text-gray-500 hover:text-gray-300'
          )}
        >
          <Icon className="w-5 h-5" />
          {label}
        </Link>
      ))}
    </nav>
  )
}

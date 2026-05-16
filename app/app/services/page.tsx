'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useMetricsStore } from '@/store/metricsStore'
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics'
import { useLogs } from '@/hooks/useLogs'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import ServicesList from '@/components/services/ServicesList'
import type { ServicesStatus } from '@/types/metrics'

export default function ServicesPage() {
  const { selectedServer } = useMetricsStore()
  const [servicesData, setServicesData] = useState<ServicesStatus | null>(null)

  useRealtimeMetrics(selectedServer?.id ?? null)

  useEffect(() => {
    if (!selectedServer) return
    const fetch = async () => {
      const { data } = await supabase
        .from('services_status')
        .select('*')
        .eq('server_id', selectedServer.id)
        .single()
      if (data) setServicesData(data as ServicesStatus)
    }
    fetch()

    const channel = supabase.channel(`services-${selectedServer.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'services_status',
        filter: `server_id=eq.${selectedServer.id}`,
      }, (payload) => setServicesData(payload.new as ServicesStatus))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedServer])

  const services = servicesData?.services || []
  const active = services.filter(s => s.status === 'active').length
  const failed = services.filter(s => s.status === 'failed').length
  const inactive = services.filter(s => s.status === 'inactive').length

  return (
    <div className="flex min-h-screen bg-[#0A0E1A] bg-grid">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-100">Services</h1>
            <p className="text-gray-500 text-sm mt-0.5">Systemd service status monitor</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Active', count: active, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Failed', count: failed, color: 'text-red-400', bg: 'bg-red-500/10' },
              { label: 'Inactive', count: inactive, color: 'text-gray-400', bg: 'bg-gray-500/10' },
            ].map(({ label, count, color, bg }) => (
              <div key={label} className={`glass-card p-4 text-center ${bg}`}>
                <p className={`text-2xl font-bold metric-value ${color}`}>{count}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">All Services ({services.length})</h3>
            <ServicesList services={services} />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useMetricsStore } from '@/store/metricsStore'
import type { MetricsSnapshot } from '@/types/metrics'

export function useRealtimeMetrics(serverId: string | null) {
  const { addMetricsSnapshot, setIsOnline } = useMetricsStore()

  useEffect(() => {
    if (!serverId) return

    // Fetch latest snapshot on mount
    const fetchLatest = async () => {
      const { data } = await supabase
        .from('metrics_snapshots')
        .select('*')
        .eq('server_id', serverId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) addMetricsSnapshot(data as MetricsSnapshot)
    }

    fetchLatest()

    // Check online status — if last_seen > 30 detik = offline
    const checkOnline = setInterval(async () => {
      const { data } = await supabase
        .from('servers')
        .select('last_seen')
        .eq('id', serverId)
        .single()

      if (data?.last_seen) {
        const diff = (Date.now() - new Date(data.last_seen).getTime()) / 1000
        setIsOnline(diff < 90)
      }
    }, 15000)

    // Supabase Realtime subscription
    const channel = supabase
      .channel(`metrics-${serverId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'metrics_snapshots',
          filter: `server_id=eq.${serverId}`,
        },
        (payload) => {
          addMetricsSnapshot(payload.new as MetricsSnapshot)
        }
      )
      .subscribe()

    return () => {
      clearInterval(checkOnline)
      supabase.removeChannel(channel)
    }
  }, [serverId, addMetricsSnapshot, setIsOnline])
}

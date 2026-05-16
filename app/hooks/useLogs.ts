'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { SystemLog } from '@/types/metrics'

export function useLogs(serverId: string | null) {
  const [logs, setLogs] = useState<SystemLog[]>([])

  useEffect(() => {
    if (!serverId) return

    // Fetch last 100 logs
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('system_logs')
        .select('*')
        .eq('server_id', serverId)
        .order('created_at', { ascending: false })
        .limit(100)
      if (data) setLogs(data.reverse())
    }
    fetchLogs()

    const channel = supabase
      .channel(`logs-${serverId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'system_logs',
        filter: `server_id=eq.${serverId}`,
      }, (payload) => {
        setLogs((prev) => [...prev.slice(-199), payload.new as SystemLog])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [serverId])

  return logs
}

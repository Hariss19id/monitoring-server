'use client'

import { create } from 'zustand'
import type { MetricsSnapshot, Server } from '@/types/metrics'

interface MetricsStore {
  selectedServer: Server | null
  servers: Server[]
  latestMetrics: MetricsSnapshot | null
  cpuHistory: { time: string; value: number }[]
  ramHistory: { time: string; value: number }[]
  netUpHistory: { time: string; value: number }[]
  netDownHistory: { time: string; value: number }[]
  isOnline: boolean
  lastSeen: string | null

  setSelectedServer: (server: Server) => void
  setServers: (servers: Server[]) => void
  addMetricsSnapshot: (snapshot: MetricsSnapshot) => void
  setIsOnline: (online: boolean) => void
}

const MAX_HISTORY = 60 // 60 data points = 5 menit

export const useMetricsStore = create<MetricsStore>((set) => ({
  selectedServer: null,
  servers: [],
  latestMetrics: null,
  cpuHistory: [],
  ramHistory: [],
  netUpHistory: [],
  netDownHistory: [],
  isOnline: false,
  lastSeen: null,

  setSelectedServer: (server) => set({ selectedServer: server }),
  setServers: (servers) => set({ servers }),
  setIsOnline: (online) => set({ isOnline: online }),

  addMetricsSnapshot: (snapshot) =>
    set((state) => {
      const time = new Date(snapshot.created_at).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      const ramPct = snapshot.ram_total > 0
        ? Math.round((snapshot.ram_used / snapshot.ram_total) * 100)
        : 0

      const addToHistory = (
        arr: { time: string; value: number }[],
        value: number
      ) => [...arr.slice(-MAX_HISTORY + 1), { time, value }]

      return {
        latestMetrics: snapshot,
        lastSeen: snapshot.created_at,
        isOnline: true,
        cpuHistory: addToHistory(state.cpuHistory, snapshot.cpu_usage),
        ramHistory: addToHistory(state.ramHistory, ramPct),
        netUpHistory: addToHistory(state.netUpHistory, snapshot.net_up),
        netDownHistory: addToHistory(state.netDownHistory, snapshot.net_down),
      }
    }),
}))

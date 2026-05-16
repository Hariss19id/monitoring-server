export interface DiskInfo {
  path: string
  total: number
  used: number
  free: number
  use_pct: number
}

export interface MetricsSnapshot {
  id: number
  server_id: string
  created_at: string
  cpu_usage: number
  cpu_temp: number
  cpu_cores: number
  ram_total: number
  ram_used: number
  ram_free: number
  swap_total: number
  swap_used: number
  disk: DiskInfo[]
  net_up: number
  net_down: number
  net_total_up: number
  net_total_down: number
  uptime_sec: number
}

export interface MetricsHistory {
  id: number
  server_id: string
  recorded_at: string
  cpu_usage: number
  ram_used: number
  ram_total: number
  net_up: number
  net_down: number
}

export interface ServiceInfo {
  name: string
  status: string
  sub: string
}

export interface ServicesStatus {
  server_id: string
  services: ServiceInfo[]
  updated_at: string
}

export interface SystemLog {
  id: number
  server_id: string
  created_at: string
  level: string
  source: string
  message: string
}

export interface BandwidthDaily {
  server_id: string
  date: string
  total_up: number
  total_down: number
}

export interface Server {
  id: string
  name: string
  api_key: string
  created_at: string
  last_seen: string | null
  hostname: string | null
  kernel: string | null
  distro: string | null
  arch: string | null
  uptime_sec: number | null
}

export interface UptimeEvent {
  id: number
  server_id: string
  event_at: string
  event_type: 'up' | 'down'
  uptime_seconds: number
}

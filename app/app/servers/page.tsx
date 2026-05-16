'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { useMetricsStore } from '@/store/metricsStore'
import type { Server } from '@/types/metrics'
import { Plus, Trash2, Copy, Check, Server as ServerIcon, AlertCircle } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

export default function ServersPage() {
  const { servers, setServers, setSelectedServer, selectedServer } = useMetricsStore()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [installCmd, setInstallCmd] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchServers = async () => {
    const res = await fetch('/api/servers')
    const data = await res.json()
    if (Array.isArray(data)) {
      setServers(data as Server[])
    }
  }

  useEffect(() => { fetchServers() }, [])

  const handleAdd = async () => {
    if (!name.trim()) { setError('Nama server wajib diisi'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setInstallCmd(data.install_command)
      setName('')
      await fetchServers()
    } catch {
      setError('Gagal menambahkan server')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/servers/${id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    await fetchServers()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex min-h-screen bg-[#0A0E1A] bg-grid">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 max-w-3xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-100">Server Management</h1>
            <p className="text-gray-500 text-sm mt-0.5">Tambah dan kelola server yang dipantau</p>
          </div>

          {/* Add Server Form */}
          <div className="glass-card p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Tambah Server Baru
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Nama server (contoh: VPS Singapore)"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                className="flex-1 bg-[#111827] border border-[#374151] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                onClick={handleAdd}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                {loading ? '...' : 'Generate'}
              </button>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Install command */}
            {installCmd && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">📋 Jalankan perintah ini di terminal VPS Anda:</p>
                <div className="relative bg-[#0A0E1A] border border-indigo-500/30 rounded-lg p-4">
                  <code className="text-xs text-emerald-400 font-mono break-all leading-relaxed">
                    {installCmd}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 p-1.5 bg-[#1F2937] rounded-md hover:bg-[#374151] transition-colors"
                  >
                    {copied
                      ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                      : <Copy className="w-3.5 h-3.5 text-gray-400" />
                    }
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  ⏱ Server akan muncul otomatis dalam ~30 detik setelah agent berjalan
                </p>
              </div>
            )}
          </div>

          {/* Server List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400">Server Terdaftar ({servers.length})</h3>

            {servers.length === 0 && (
              <div className="glass-card p-8 text-center text-gray-500">
                <ServerIcon className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Belum ada server. Tambahkan server di atas.</p>
              </div>
            )}

            {servers.map((server) => {
              const isSelected = selectedServer?.id === server.id
              const isOnline = server.last_seen
                ? (Date.now() - new Date(server.last_seen).getTime()) < 90000
                : false

              return (
                <div
                  key={server.id}
                  className={`glass-card p-4 border transition-all ${
                    isSelected ? 'border-indigo-500/50 glow-primary' : 'border-[#374151]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedServer(server)}
                      className="flex items-center gap-3 text-left flex-1 min-w-0"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isOnline ? 'bg-emerald-500/10' : 'bg-gray-500/10'
                      }`}>
                        <ServerIcon className={`w-4 h-4 ${isOnline ? 'text-emerald-400' : 'text-gray-500'}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-100 truncate">{server.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0 ${
                            isOnline
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-gray-500/10 text-gray-500 border-gray-500/30'
                          }`}>
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <div className="flex gap-3 text-[11px] text-gray-500 mt-0.5 flex-wrap">
                          {server.hostname && <span>🖥 {server.hostname}</span>}
                          {server.distro && <span>🐧 {server.distro}</span>}
                          {server.last_seen && <span>🕐 {timeAgo(server.last_seen)}</span>}
                        </div>
                      </div>
                    </button>

                    {deleteConfirm === server.id ? (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleDelete(server.id)}
                          className="text-xs bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded-lg transition-colors"
                        >Hapus</button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs bg-[#374151] text-gray-300 px-2.5 py-1 rounded-lg transition-colors"
                        >Batal</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(server.id)}
                        className="p-2 text-gray-600 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {server.kernel && (
                    <div className="mt-3 pt-3 border-t border-[#374151] flex gap-4 text-[11px] text-gray-600 font-mono">
                      <span>kernel: {server.kernel}</span>
                      <span>arch: {server.arch}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}

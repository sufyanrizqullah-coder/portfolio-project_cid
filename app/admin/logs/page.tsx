'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { formatDate } from '@/lib/utils'
import { Activity, ChevronLeft, ChevronRight, LogIn, LogOut, Plus, Edit2, Trash2, Upload, Settings } from 'lucide-react'

interface Log { id: string; action: string; description: string; createdAt: string; user: { name: string; email: string } }

const ACTION_ICONS: Record<string, React.ReactNode> = {
  LOGIN: <LogIn className="w-3.5 h-3.5"/>,
  LOGOUT: <LogOut className="w-3.5 h-3.5"/>,
  CREATE_PROJECT: <Plus className="w-3.5 h-3.5"/>,
  UPDATE_PROJECT: <Edit2 className="w-3.5 h-3.5"/>,
  DELETE_PROJECT: <Trash2 className="w-3.5 h-3.5"/>,
  CHANGE_STATUS: <Edit2 className="w-3.5 h-3.5"/>,
  CREATE_CATEGORY: <Plus className="w-3.5 h-3.5"/>,
  UPLOAD_FILE: <Upload className="w-3.5 h-3.5"/>,
  DELETE_FILE: <Trash2 className="w-3.5 h-3.5"/>,
  UPDATE_SETTINGS: <Settings className="w-3.5 h-3.5"/>,
  CHANGE_PASSWORD: <Settings className="w-3.5 h-3.5"/>,
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-green-600/15 border-green-500/20 text-green-400',
  LOGOUT: 'bg-gray-600/15 border-gray-500/20 text-gray-400',
  CREATE_PROJECT: 'bg-blue-600/15 border-blue-500/20 text-blue-400',
  UPDATE_PROJECT: 'bg-yellow-600/15 border-yellow-500/20 text-yellow-400',
  DELETE_PROJECT: 'bg-red-600/15 border-red-500/20 text-red-400',
  CHANGE_STATUS: 'bg-purple-600/15 border-purple-500/20 text-purple-400',
  UPLOAD_FILE: 'bg-cyan-600/15 border-cyan-500/20 text-cyan-400',
  DELETE_FILE: 'bg-red-600/15 border-red-500/20 text-red-400',
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchLogs = useCallback(() => {
    setLoading(true)
    fetch(`/api/activity-logs?page=${page}&limit=20`).then(r => r.json())
      .then(d => { setLogs(d.logs || []); setTotal(d.total || 0); setTotalPages(d.totalPages || 1) })
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
        <p className="text-gray-500 text-sm mt-0.5">{total} aktivitas tercatat</p>
      </div>

      {loading ? (
        <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"/></div>
      ) : logs.length === 0 ? (
        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-12 text-center">
          <Activity className="w-12 h-12 text-gray-700 mx-auto mb-3"/>
          <p className="text-gray-500">Belum ada aktivitas</p>
        </div>
      ) : (
        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl divide-y divide-[#2a2a3a]">
          {logs.map((log, i) => {
            const colorClass = ACTION_COLORS[log.action] || 'bg-gray-600/15 border-gray-500/20 text-gray-400'
            const icon = ACTION_ICONS[log.action] || <Activity className="w-3.5 h-3.5"/>
            return (
              <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i*0.03 }} className="flex gap-4 px-5 py-4">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200">{log.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{log.user.name}</span>
                    <span className="text-xs text-gray-700">·</span>
                    <span className="text-xs text-gray-600">{log.action}</span>
                    <span className="text-xs text-gray-700">·</span>
                    <span className="text-xs text-gray-600">{formatDate(log.createdAt)}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-500">Halaman {page} dari {totalPages}</span>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              className="p-2 rounded-xl border border-[#2a2a3a] text-gray-400 hover:text-white disabled:opacity-30 transition-all">
              <ChevronLeft className="w-4 h-4"/>
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              className="p-2 rounded-xl border border-[#2a2a3a] text-gray-400 hover:text-white disabled:opacity-30 transition-all">
              <ChevronRight className="w-4 h-4"/>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

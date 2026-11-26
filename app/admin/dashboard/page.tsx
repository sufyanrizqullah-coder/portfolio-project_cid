'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatDate } from '@/lib/utils'
import { FolderOpen, CheckCircle, FileText, Archive, Tag } from 'lucide-react'
import Link from 'next/link'

interface Stats { total: number; published: number; draft: number; archived: number; categories: number }
interface RecentProject { id: string; title: string; status: string; createdAt: string; category: { name: string } }

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  published: { background: 'rgba(52,211,153,.1)', color: '#34d399', border: '1px solid rgba(52,211,153,.2)' },
  draft:     { background: 'rgba(251,191,36,.1)',  color: '#fbbf24', border: '1px solid rgba(251,191,36,.2)' },
  archived:  { background: 'rgba(107,114,128,.1)', color: '#6b7280', border: '1px solid rgba(107,114,128,.2)' },
}

function StatBox({ label, value, icon: Icon, loading }: { label: string; value: number; icon: React.ElementType; loading: boolean }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, letterSpacing: '.03em', textTransform: 'uppercase' }}>{label}</span>
        <Icon size={16} style={{ color: 'var(--text3)' }} />
      </div>
      {loading ? (
        <div style={{ height: 28, background: 'var(--surface2)', borderRadius: 6, width: 48, animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
      ) : (
        <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-.03em' }}>{value}</span>
      )}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<RecentProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => {
      setStats(d.stats); setRecent(d.recentProjects || [])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 900 }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.03em', color: 'var(--text)', marginBottom: 4 }}>Overview</h1>
        <p style={{ fontSize: 13, color: 'var(--text3)' }}>Ringkasan data proyek</p>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 32 }}>
        <StatBox label="Total"      value={stats?.total || 0}      icon={FolderOpen}    loading={loading} />
        <StatBox label="Published"  value={stats?.published || 0}  icon={CheckCircle}   loading={loading} />
        <StatBox label="Draft"      value={stats?.draft || 0}      icon={FileText}      loading={loading} />
        <StatBox label="Archived"   value={stats?.archived || 0}   icon={Archive}       loading={loading} />
        <StatBox label="Kategori"   value={stats?.categories || 0} icon={Tag}           loading={loading} />
      </div>

      {/* Recent projects */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Proyek Terbaru</span>
          <Link href="/admin/projects"
            style={{ fontSize: 12.5, color: 'var(--text3)', textDecoration: 'none', transition: 'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
            Lihat semua →
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="skeleton" style={{ height: 13, flex: 1 }} />
                <div className="skeleton" style={{ height: 13, width: 60 }} />
                <div className="skeleton" style={{ height: 20, width: 72, borderRadius: 6 }} />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Belum ada proyek</div>
        ) : (
          <div>
            {recent.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px', borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text3)' }}>{p.category.name}</p>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text3)', flexShrink: 0 }}>{formatDate(p.createdAt)}</span>
                <span style={{ fontSize: 11.5, fontWeight: 500, padding: '3px 10px', borderRadius: 6, flexShrink: 0, ...STATUS_STYLE[p.status] }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

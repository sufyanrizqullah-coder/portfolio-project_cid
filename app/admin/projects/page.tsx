'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { ConfirmModal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { formatDate, parseTechnologies } from '@/lib/utils'
import { Plus, Search, Edit2, Trash2, FolderOpen, ChevronLeft, ChevronRight, ExternalLink, Copy, CheckSquare, Square, ChevronDown } from 'lucide-react'
import Image from 'next/image'

interface Project {
  id: string; title: string; slug: string; shortDescription: string; fullDescription: string
  thumbnail: string | null; technologies: string; completionDate: string | null; startDate: string | null
  status: string; demoUrl: string | null; githubUrl: string | null; allowDownload: boolean
  extraCategories: string
  category: { id: string; name: string; slug: string }; createdAt: string
}

const STATUS_FILTERS = [
  { value: '', label: 'Semua' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
]

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  published: { background: 'rgba(52,211,153,.1)', color: '#34d399', border: '1px solid rgba(52,211,153,.2)' },
  draft:     { background: 'rgba(251,191,36,.1)',  color: '#fbbf24', border: '1px solid rgba(251,191,36,.2)' },
  archived:  { background: 'rgba(107,114,128,.1)', color: '#6b7280', border: '1px solid rgba(107,114,128,.2)' },
}

function Modal({ open, onClose, title, children, dirty }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; dirty?: boolean }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose, dirty])

  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 760, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</span>
          <button onClick={onClose} style={{ padding: '4px 8px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', fontSize: 13 }}>✕</button>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  )
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [formDirty, setFormDirty] = useState(false)
  const [duplicating, setDuplicating] = useState<string | null>(null)

  // Batch
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [batchLoading, setBatchLoading] = useState(false)
  const [showBatchMenu, setShowBatchMenu] = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '10', sort: 'newest' })
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/portfolios?${params}`)
    const data = await res.json()
    setProjects(data.items || []); setTotal(data.total || 0); setTotalPages(data.totalPages || 1)
    setLoading(false)
  }, [page, search, statusFilter])

  useEffect(() => { fetchProjects() }, [fetchProjects])
  useEffect(() => { setPage(1); setSelected(new Set()) }, [search, statusFilter])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const res = await fetch(`/api/portfolios/${deleteId}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Proyek dihapus'); fetchProjects() }
    else toast.error('Gagal menghapus')
    setDeleting(false); setDeleteId(null)
  }

  const handleDuplicate = async (id: string) => {
    setDuplicating(id)
    const res = await fetch(`/api/portfolios/${id}/duplicate`, { method: 'POST' })
    if (res.ok) { toast.success('Proyek berhasil diduplikat'); fetchProjects() }
    else toast.error('Gagal menduplikat')
    setDuplicating(null)
  }

  const handleBatch = async (action: string) => {
    if (!selected.size) return
    if (action === 'delete' && !window.confirm(`Hapus ${selected.size} proyek? Tidak bisa dibatalkan.`)) return
    setBatchLoading(true)
    setShowBatchMenu(false)
    const res = await fetch('/api/portfolios/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selected), action }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success(`${data.affected} proyek berhasil diperbarui`)
      setSelected(new Set())
      fetchProjects()
    } else toast.error('Gagal memproses')
    setBatchLoading(false)
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === projects.length) setSelected(new Set())
    else setSelected(new Set(projects.map(p => p.id)))
  }

  const closeForm = () => { setShowForm(false); setEditProject(null); setFormDirty(false) }

  const btn = (active: boolean): React.CSSProperties => ({
    padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', transition: 'all .15s',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'rgba(79,142,247,.12)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text2)',
    fontWeight: active ? 600 : 400,
  })

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--text)', marginBottom: 4 }}>Manage Projects</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>{total} proyek total</p>
        </div>
        <button onClick={() => { setEditProject(null); setShowForm(true) }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 9, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
          <Plus size={15} /> Tambah Proyek
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari proyek…"
            style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9, padding: '8px 12px 8px 34px', fontSize: 13, color: 'var(--text)', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {STATUS_FILTERS.map(f => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)} style={btn(statusFilter === f.value)}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Batch action bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(79,142,247,.08)', border: '1px solid rgba(79,142,247,.2)', borderRadius: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>{selected.size} proyek dipilih</span>
            <div style={{ flex: 1 }} />
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowBatchMenu(v => !v)} disabled={batchLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}>
                Aksi <ChevronDown size={13} />
              </button>
              {showBatchMenu && (
                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, minWidth: 160, zIndex: 50, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,.3)' }}>
                  {[
                    { action: 'publish', label: 'Set Published', color: '#34d399' },
                    { action: 'draft',   label: 'Set Draft',     color: '#fbbf24' },
                    { action: 'archive', label: 'Set Archived',  color: '#6b7280' },
                    { action: 'delete',  label: 'Hapus Semua',   color: '#f87171' },
                  ].map(item => (
                    <button key={item.action} onClick={() => handleBatch(item.action)}
                      style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', textAlign: 'left', fontSize: 13, color: item.color, cursor: 'pointer', display: 'block', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setSelected(new Set())}
              style={{ padding: '7px 12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text3)', fontSize: 13, cursor: 'pointer' }}>
              Batal
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ width: 24, height: 24, border: '2px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <FolderOpen size={36} style={{ color: 'var(--text3)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>Tidak ada proyek ditemukan</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', width: 40 }}>
                    <button onClick={toggleSelectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 0 }}>
                      {selected.size === projects.length && projects.length > 0
                        ? <CheckSquare size={16} style={{ color: 'var(--accent)' }} />
                        : <Square size={16} />}
                    </button>
                  </th>
                  {['PROYEK', 'KATEGORI', 'TEKNOLOGI', 'STATUS', 'TANGGAL', 'AKSI'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 5 ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: 'var(--text3)', padding: '10px 12px', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {projects.map((p, i) => {
                    const techs = parseTechnologies(p.technologies)
                    const isSelected = selected.has(p.id)
                    return (
                      <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * .03 }}
                        style={{ borderBottom: i < projects.length - 1 ? '1px solid var(--border)' : 'none', background: isSelected ? 'rgba(79,142,247,.06)' : 'transparent', transition: 'background .15s' }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface2)' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}>
                        <td style={{ padding: '12px 12px' }}>
                          <button onClick={() => toggleSelect(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSelected ? 'var(--accent)' : 'var(--text3)', display: 'flex', padding: 0 }}>
                            {isSelected ? <CheckSquare size={16} style={{ color: 'var(--accent)' }} /> : <Square size={16} />}
                          </button>
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface3)', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                              {p.thumbnail
                                ? <Image src={p.thumbnail} alt={p.title} fill style={{ objectFit: 'cover' }} sizes="36px" />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FolderOpen size={14} style={{ color: 'var(--text3)' }} /></div>}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{p.title}</p>
                              <p style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{p.shortDescription}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 12px', fontSize: 13, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{p.category.name}</td>
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            {techs.slice(0, 2).map(t => (
                              <span key={t} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: 'var(--surface3)', color: 'var(--text2)', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{t}</span>
                            ))}
                            {techs.length > 2 && <span style={{ fontSize: 11, color: 'var(--text3)' }}>+{techs.length - 2}</span>}
                          </div>
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 6, whiteSpace: 'nowrap', ...STATUS_STYLE[p.status] }}>{p.status}</span>
                        </td>
                        <td style={{ padding: '12px 12px', fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{formatDate(p.createdAt)}</td>
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                            {p.demoUrl && (
                              <a href={p.demoUrl} target="_blank" rel="noopener noreferrer"
                                style={{ padding: '5px 7px', borderRadius: 7, color: 'var(--text3)', display: 'flex', transition: 'color .15s, background .15s' }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface3)' }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent' }}>
                                <ExternalLink size={13} />
                              </a>
                            )}
                            {/* Duplikat */}
                            <button onClick={() => handleDuplicate(p.id)} disabled={duplicating === p.id}
                              title="Duplikat proyek"
                              style={{ padding: '5px 7px', borderRadius: 7, background: 'transparent', border: 'none', color: 'var(--text3)', cursor: duplicating === p.id ? 'not-allowed' : 'pointer', display: 'flex', transition: 'color .15s, background .15s', opacity: duplicating === p.id ? .5 : 1 }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.background = 'rgba(167,139,250,.1)' }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent' }}>
                              <Copy size={13} />
                            </button>
                            <button onClick={() => { setEditProject(p); setShowForm(true) }}
                              style={{ padding: '5px 7px', borderRadius: 7, background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', transition: 'color .15s, background .15s' }}
                              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(79,142,247,.1)' }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent' }}>
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => setDeleteId(p.id)}
                              style={{ padding: '5px 7px', borderRadius: 7, background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', transition: 'color .15s, background .15s' }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,.1)' }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Halaman {page} dari {totalPages}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? .3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? .3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={closeForm} title={editProject ? 'Edit Proyek' : 'Tambah Proyek Baru'} dirty={formDirty}>
        <ProjectForm
          initial={editProject ? {
            id: editProject.id, title: editProject.title, categoryId: editProject.category.id,
            shortDescription: editProject.shortDescription, fullDescription: editProject.fullDescription,
            thumbnail: editProject.thumbnail, technologies: parseTechnologies(editProject.technologies),
            extraCategories: JSON.parse(editProject.extraCategories || '[]'),
            demoUrl: editProject.demoUrl || '', githubUrl: editProject.githubUrl || '',
            startDate: editProject.startDate || '', completionDate: editProject.completionDate || '',
            status: editProject.status, allowDownload: editProject.allowDownload,
          } : undefined}
          onSuccess={() => { closeForm(); fetchProjects() }}
          onCancel={closeForm}
          onDirtyChange={setFormDirty}
        />
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Hapus Proyek" message="Proyek akan dihapus permanen. Lanjutkan?" loading={deleting} />
    </div>
  )
}

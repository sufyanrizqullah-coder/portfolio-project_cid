'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/components/ui/Toast'
import { Plus, Edit2, Trash2, Tag, FolderOpen } from 'lucide-react'

interface Category { id: string; name: string; slug: string; description: string | null; _count: { portfolios: number } }

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</span>
          <button onClick={onClose} style={{ padding: '4px 8px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer', fontSize: 13 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ConfirmModal({ open, onClose, onConfirm, loading }: { open: boolean; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 360, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Hapus Kategori</p>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>Kategori yang masih digunakan proyek tidak dapat dihapus.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 13, cursor: 'pointer' }}>Batal</button>
          <button onClick={onConfirm} disabled={loading} style={{ padding: '8px 16px', borderRadius: 8, background: '#ef4444', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1 }}>
            {loading ? 'Menghapus…' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchCats = useCallback(() => {
    setLoading(true)
    fetch('/api/categories').then(r => r.json())
      .then(d => setCategories(d.categories || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchCats() }, [fetchCats])

  const openEdit = (c: Category) => { setEditCat(c); setForm({ name: c.name, description: c.description || '' }); setShowForm(true); setError('') }
  const openAdd  = () => { setEditCat(null); setForm({ name: '', description: '' }); setShowForm(true); setError('') }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nama kategori wajib diisi'); return }
    setSaving(true)
    try {
      const url = editCat ? `/api/categories/${editCat.id}` : '/api/categories'
      const method = editCat ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(editCat ? 'Kategori diupdate' : 'Kategori dibuat')
      setShowForm(false); fetchCats()
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Gagal') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const res = await fetch(`/api/categories/${deleteId}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) toast.error(data.error || 'Gagal menghapus')
    else { toast.success('Kategori dihapus'); fetchCats() }
    setDeleting(false); setDeleteId(null)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 9, padding: '9px 14px', fontSize: 13.5, color: 'var(--text)', outline: 'none',
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--text)', marginBottom: 4 }}>Categories</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>{categories.length} kategori</p>
        </div>
        <button onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 9, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
          <Plus size={15} /> Tambah Kategori
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ width: 24, height: 24, border: '2px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : categories.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
          <Tag size={36} style={{ color: 'var(--text3)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Belum ada kategori</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
          <AnimatePresence>
            {categories.map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .05 }}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', transition: 'border-color .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(79,142,247,.1)', border: '1px solid rgba(79,142,247,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Tag size={14} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{cat.name}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--text3)' }}>/{cat.slug}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => openEdit(cat)}
                      style={{ padding: '5px 7px', borderRadius: 7, background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', transition: 'color .15s, background .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(79,142,247,.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent' }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => setDeleteId(cat.id)}
                      style={{ padding: '5px 7px', borderRadius: 7, background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', transition: 'color .15s, background .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {cat.description && <p style={{ fontSize: 12.5, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 10 }}>{cat.description}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <FolderOpen size={12} style={{ color: 'var(--text3)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{cat._count.portfolios} proyek</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editCat ? 'Edit Kategori' : 'Tambah Kategori'}>
        <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--text2)', marginBottom: 7 }}>Nama Kategori *</label>
            <input value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError('') }}
              placeholder="Web Development"
              style={{ ...inputStyle, borderColor: error ? '#f87171' : 'var(--border)' }}
              onFocus={e => e.currentTarget.style.borderColor = error ? '#f87171' : 'var(--accent)'}
              onBlur={e => e.currentTarget.style.borderColor = error ? '#f87171' : 'var(--border)'} />
            {error && <p style={{ fontSize: 11.5, color: '#f87171', marginTop: 5 }}>{error}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--text2)', marginBottom: 7 }}>Deskripsi (opsional)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Deskripsi singkat…" rows={3}
              style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={saving}
              style={{ padding: '9px 18px', borderRadius: 9, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .7 : 1 }}>
              {saving ? 'Menyimpan…' : editCat ? 'Simpan' : 'Buat Kategori'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 13, cursor: 'pointer' }}>
              Batal
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  )
}

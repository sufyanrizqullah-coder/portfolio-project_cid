'use client'
import { useState, useEffect, useRef } from 'react'
import { toast } from '@/components/ui/Toast'
import { X, Plus, Upload, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface Category { id: string; name: string }
interface ProjectData {
  id?: string; title: string; categoryId: string; shortDescription: string
  fullDescription: string; thumbnail: string | null; technologies: string[]
  extraCategories: string[]
  demoUrl: string; githubUrl: string; startDate: string; completionDate: string
  status: string; allowDownload: boolean
}

const DRAFT_KEY = 'project_form_draft'

const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }
const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text3)', letterSpacing: '.03em' }
const inp: React.CSSProperties = {
  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '9px 12px', fontSize: 13.5, color: 'var(--text)',
  outline: 'none', fontFamily: 'inherit', transition: 'border-color .15s',
}

export function ProjectForm({ initial, onSuccess, onCancel, onDirtyChange }: {
  initial?: Partial<ProjectData>
  onSuccess: () => void
  onCancel: () => void
  onDirtyChange?: (dirty: boolean) => void
}) {
  const isEdit = !!initial?.id

  const [form, setForm] = useState<ProjectData>(() => {
    if (initial?.id) return {
      title: initial.title || '', categoryId: initial.categoryId || '',
      shortDescription: initial.shortDescription || '', fullDescription: initial.fullDescription || '',
      thumbnail: initial.thumbnail || null, technologies: initial.technologies || [],
      extraCategories: initial.extraCategories || [],
      demoUrl: initial.demoUrl || '', githubUrl: initial.githubUrl || '',
      startDate: initial.startDate ? initial.startDate.slice(0, 10) : '',
      completionDate: initial.completionDate ? initial.completionDate.slice(0, 10) : '',
      status: initial.status || 'draft', allowDownload: initial.allowDownload || false,
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Pastikan extraCategories selalu array
          if (!Array.isArray(parsed.extraCategories)) parsed.extraCategories = []
          return parsed
        } catch { /* */ }
      }
    }
    return { title: '', categoryId: '', shortDescription: '', fullDescription: '',
      thumbnail: null, technologies: [], extraCategories: [], demoUrl: '', githubUrl: '',
      startDate: '', completionDate: '', status: 'draft', allowDownload: false }
  })

  const [techInput, setTechInput] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectData, string>>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
  }, [])

  useEffect(() => {
    if (!isEdit) localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
  }, [form, isEdit])

  const set = (key: keyof ProjectData, value: unknown) => {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
    onDirtyChange?.(true)
  }

  const addTech = () => {
    const t = techInput.trim()
    if (t && !form.technologies.includes(t)) set('technologies', [...form.technologies, t])
    setTechInput('')
  }

  const handleThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      set('thumbnail', data.url)
      toast.success('Thumbnail diupload')
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Upload gagal') }
    finally { setUploading(false) }
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!form.title) e.title = 'Wajib diisi'
    if (!form.categoryId) e.categoryId = 'Pilih kategori'
    if (!form.shortDescription) e.shortDescription = 'Wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const url = isEdit ? `/api/portfolios/${initial!.id}` : '/api/portfolios'
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(isEdit ? 'Proyek diupdate' : 'Proyek dibuat')
      if (!isEdit) localStorage.removeItem(DRAFT_KEY)
      onDirtyChange?.(false)
      onSuccess()
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Gagal menyimpan') }
    finally { setLoading(false) }
  }

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    e.currentTarget.style.borderColor = 'var(--accent)'
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, hasErr?: string) =>
    e.currentTarget.style.borderColor = hasErr ? '#f87171' : 'var(--border)'

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Row 1: Judul + Kategori Utama */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={field}>
          <label style={lbl}>JUDUL PROYEK *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Nama proyek"
            style={{ ...inp, borderColor: errors.title ? '#f87171' : 'var(--border)' }}
            onFocus={focusBorder} onBlur={e => blurBorder(e, errors.title)} />
          {errors.title && <span style={{ fontSize: 11.5, color: '#f87171' }}>{errors.title}</span>}
        </div>
        <div style={field}>
          <label style={lbl}>KATEGORI *</label>
          <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
            style={{ ...inp, cursor: 'pointer', borderColor: errors.categoryId ? '#f87171' : 'var(--border)' }}
            onFocus={focusBorder} onBlur={e => blurBorder(e, errors.categoryId)}>
            <option value="">— Pilih Kategori —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.categoryId && <span style={{ fontSize: 11.5, color: '#f87171' }}>{errors.categoryId}</span>}
        </div>
      </div>

      {/* Deskripsi singkat */}
      <div style={field}>
        <label style={lbl}>DESKRIPSI SINGKAT *</label>
        <input value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)}
          placeholder="Ringkasan singkat proyek"
          style={{ ...inp, borderColor: errors.shortDescription ? '#f87171' : 'var(--border)' }}
          onFocus={focusBorder} onBlur={e => blurBorder(e, errors.shortDescription)} />
        {errors.shortDescription && <span style={{ fontSize: 11.5, color: '#f87171' }}>{errors.shortDescription}</span>}
      </div>

      {/* Deskripsi lengkap */}
      <div style={field}>
        <label style={lbl}>DESKRIPSI LENGKAP</label>
        <textarea value={form.fullDescription} onChange={e => set('fullDescription', e.target.value)}
          placeholder="Deskripsi detail proyek…" rows={3}
          style={{ ...inp, resize: 'vertical' }}
          onFocus={focusBorder} onBlur={e => blurBorder(e)} />
      </div>

      {/* Thumbnail */}
      <div style={field}>
        <label style={lbl}>THUMBNAIL</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 72, height: 52, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', overflow: 'hidden', flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {form.thumbnail
              ? <Image src={form.thumbnail} alt="thumb" fill style={{ objectFit: 'cover' }} sizes="72px" />
              : <ImageIcon size={18} style={{ color: 'var(--text3)' }} />
            }
            {form.thumbnail && (
              <button type="button" onClick={() => set('thumbnail', null)}
                style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,.8)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={10} />
              </button>
            )}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleThumbnail} style={{ display: 'none' }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? .7 : 1, transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}>
              <Upload size={13} /> {uploading ? 'Mengupload…' : 'Upload Gambar'}
            </button>
            <p style={{ fontSize: 11.5, color: 'var(--text3)', marginTop: 5 }}>JPG, PNG, WebP — maks. 10MB</p>
          </div>
        </div>
      </div>

      {/* Teknologi */}
      <div style={field}>
        <label style={lbl}>TEKNOLOGI / TOOLS</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={techInput} onChange={e => setTechInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech() } }}
            placeholder="Next.js, Python, dll."
            style={{ ...inp, flex: 1 }} onFocus={focusBorder} onBlur={e => blurBorder(e)} />
          <button type="button" onClick={addTech}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 13, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <Plus size={13} /> Tambah
          </button>
        </div>
        {form.technologies.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
            {form.technologies.map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '3px 10px', borderRadius: 6, background: 'var(--surface3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                {t}
                <button type="button" onClick={() => set('technologies', form.technologies.filter(x => x !== t))}
                  style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Link */}
      <div style={field}>
        <label style={lbl}>LINK</label>
        <input value={form.demoUrl} onChange={e => set('demoUrl', e.target.value)} placeholder="https://…"
          style={inp} onFocus={focusBorder} onBlur={e => blurBorder(e)} />
      </div>

      {/* Tanggal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={field}>
          <label style={lbl}>TANGGAL MULAI</label>
          <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
            style={inp} onFocus={focusBorder} onBlur={e => blurBorder(e)} />
        </div>
        <div style={field}>
          <label style={lbl}>TANGGAL SELESAI</label>
          <input type="date" value={form.completionDate} onChange={e => set('completionDate', e.target.value)}
            style={inp} onFocus={focusBorder} onBlur={e => blurBorder(e)} />
        </div>
      </div>

      {/* Status + Download */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={field}>
          <label style={lbl}>STATUS</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            style={{ ...inp, width: 150, cursor: 'pointer' }} onFocus={focusBorder} onBlur={e => blurBorder(e)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 18 }}>
          <input type="checkbox" checked={form.allowDownload} onChange={e => set('allowDownload', e.target.checked)}
            style={{ width: 15, height: 15, accentColor: 'var(--accent)' }} />
          <span style={{ fontSize: 13.5, color: 'var(--text2)' }}>Izinkan download file</span>
        </label>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, paddingTop: 6, borderTop: '1px solid var(--border)', marginTop: 4 }}>
        <button type="submit" disabled={loading}
          style={{ padding: '10px 22px', borderRadius: 9, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1 }}>
          {loading ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Proyek'}
        </button>
        <button type="button" onClick={() => { onDirtyChange?.(false); onCancel() }}
          style={{ padding: '10px 22px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 13.5, cursor: 'pointer' }}>
          Batal
        </button>
      </div>
    </form>
  )
}

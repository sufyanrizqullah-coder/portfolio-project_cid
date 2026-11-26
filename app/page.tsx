'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectDetailModal } from '@/components/public/ProjectDetailModal'
import { ToastContainer } from '@/components/ui/Toast'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate, parseTechnologies } from '@/lib/utils'
import {
  Search, LogIn, X, ChevronLeft, ChevronRight,
  ExternalLink, GitBranch, Calendar, FolderOpen, ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface Project {
  id: string; title: string; slug: string; shortDescription: string; fullDescription: string
  thumbnail: string | null; technologies: string; completionDate: string | null; startDate: string | null
  status: string; demoUrl: string | null; githubUrl: string | null; allowDownload: boolean
  extraCategories: string
  category: { id: string; name: string; slug: string }
  files?: Array<{ id: string; fileName: string; fileUrl: string; fileType: string; fileSize: number; allowDownload: boolean }>
}
interface Category { id: string; name: string; slug: string; _count?: { portfolios: number } }

/* ─── Fallback thumbnail ────────────────────────────────── */
function ProjectFallback({ title, category }: { title: string; category: string }) {
  const hash = (title + category).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const hue = (hash * 47) % 360
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `hsl(${hue},18%,14%)`,
      display: 'flex', alignItems: 'flex-end',
      padding: '14px 16px',
    }}>
      <div style={{ width: 32, height: 2, background: `hsl(${hue},55%,55%)`, borderRadius: 2, opacity: 0.7 }} />
    </div>
  )
}

/* ─── Project Card ──────────────────────────────────────── */
function ProjectCard({ p, onView, index }: { p: Project; onView: (p: Project) => void; index: number }) {
  const techs = parseTechnologies(p.technologies)
  const [hovered, setHovered] = useState(false)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .38, delay: index * .055, ease: [.25, .46, .45, .94] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onView(p)}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer',
        transition: 'transform .22s ease, box-shadow .22s ease, border-color .22s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 16px 48px rgba(0,0,0,.5)' : '0 2px 8px rgba(0,0,0,.2)',
        borderColor: hovered ? 'var(--border2)' : 'var(--border)',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--surface2)', overflow: 'hidden' }}>
        {p.thumbnail ? (
          <Image src={p.thumbnail} alt={p.title} fill
            style={{ objectFit: 'cover', transition: 'transform .4s ease', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
            sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw" />
        ) : (
          <ProjectFallback title={p.title} category={p.category.name} />
        )}
        {/* Category chip */}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 500, letterSpacing: '.03em',
            padding: '4px 10px', borderRadius: 6,
            background: 'var(--surface)', backdropFilter: 'blur(8px)',
            color: 'var(--text2)', border: '1px solid var(--border)',
          }}>{p.category.name}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
          <h3 style={{
            fontSize: 14, fontWeight: 600, color: 'var(--text)',
            transition: 'color .18s ease',
            ...(hovered ? { color: 'var(--accent)' } : {}),
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
          }}>{p.title}</h3>
          <ArrowUpRight size={14} style={{ color: 'var(--text3)', flexShrink: 0, marginTop: 2, transition: 'color .18s, transform .18s', ...(hovered ? { color: 'var(--accent)', transform: 'translate(1px,-1px)' } : {}) }} />
        </div>

        <p style={{ fontSize: 12.5, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 14,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {p.shortDescription}
        </p>

        {/* Tech */}
        {techs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
            {techs.slice(0, 4).map(t => (
              <span key={t} style={{
                fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 5,
                background: 'var(--surface3)', color: 'var(--text2)',
                border: '1px solid var(--border)',
              }}>{t}</span>
            ))}
            {techs.length > 4 && (
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, color: 'var(--text3)', border: '1px solid var(--border)' }}>
                +{techs.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {p.completionDate ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--text3)' }}>
              <Calendar size={11} />{formatDate(p.completionDate)}
            </span>
          ) : <span />}
          <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
            {p.githubUrl && (
              <a href={p.githubUrl} target="_blank" rel="noopener noreferrer"
                style={{ padding: '5px 7px', borderRadius: 7, color: 'var(--text3)', display: 'flex', transition: 'color .15s, background .15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface3)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent' }}>
                <GitBranch size={13} />
              </a>
            )}
            {p.demoUrl && (
              <a href={p.demoUrl} target="_blank" rel="noopener noreferrer"
                style={{ padding: '5px 7px', borderRadius: 7, color: 'var(--text3)', display: 'flex', transition: 'color .15s, background .15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface3)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent' }}>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

/* ─── Skeleton ──────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div className="skeleton" style={{ aspectRatio: '16/9' }} />
      <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="skeleton" style={{ height: 14, width: '65%' }} />
        <div className="skeleton" style={{ height: 12, width: '100%' }} />
        <div className="skeleton" style={{ height: 12, width: '75%' }} />
        <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
          {[52, 64, 48].map(w => <div key={w} className="skeleton" style={{ height: 20, width: w }} />)}
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('newest')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const debouncedSearch = useDebounce(search, 380)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12', sort,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(category && { category }),
      })
      const res = await fetch(`/api/portfolios?${params}`)
      const data = await res.json()
      setProjects(data.items || []); setTotal(data.total || 0); setTotalPages(data.totalPages || 1)
    } catch { /**/ } finally { setLoading(false) }
  }, [page, debouncedSearch, category, sort])

  useEffect(() => { fetchProjects() }, [fetchProjects])
  useEffect(() => { fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || [])) }, [])
  useEffect(() => { setPage(1) }, [debouncedSearch, category, sort])

  const activeCategories = categories.filter(c => (c._count?.portfolios ?? 0) > 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Navbar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--bg)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', height: 56, gap: 20 }}>

          {/* Logo */}
          <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--text)', letterSpacing: '-.03em', flexShrink: 0 }}>
            Portfolio<span style={{ color: 'var(--accent)' }}>.</span>
          </span>

          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{ position: 'relative', width: 220 }}>
            <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Cari proyek…"
              style={{
                width: '100%', background: 'var(--surface)', borderRadius: 8,
                border: `1px solid ${searchFocused ? 'var(--accent)' : 'var(--border)'}`,
                padding: '7px 32px 7px 32px', fontSize: 13, color: 'var(--text)',
                outline: 'none', transition: 'border-color .18s',
                boxShadow: searchFocused ? '0 0 0 3px rgba(79,142,247,.12)' : 'none',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', padding: 2 }}>
                <X size={12} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px', fontSize: 12.5, color: 'var(--text2)', outline: 'none', cursor: 'pointer' }}>
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="name">A–Z</option>
          </select>

          {/* Presentation + Admin + Theme */}
          <Link href="/presentation"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 12.5, fontWeight: 500, transition: 'border-color .18s, color .18s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}>
            Presentasi
          </Link>
          <Link href="/admin/login"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 12.5, fontWeight: 500, transition: 'border-color .18s, color .18s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}>
            <LogIn size={12} /> Admin
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 32px 80px' }}>

        {/* ── Page title ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }} style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.03em', color: 'var(--text)', marginBottom: 4 }}>
                Selected Projects
              </h1>
              <p style={{ fontSize: 13.5, color: 'var(--text3)' }}>
                {loading ? 'Memuat…' : total === 0 ? 'Belum ada proyek' : `${total} proyek`}
              </p>
            </div>
          </div>

          {/* Category filter */}
          {activeCategories.length > 0 && (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }} className="scrollbar-hide">
              {[{ id: '_all', name: 'Semua', slug: '', _count: { portfolios: total } }, ...activeCategories].map(cat => {
                const active = cat.slug === category
                return (
                  <button key={cat.id} onClick={() => setCategory(cat.slug)}
                    style={{
                      flexShrink: 0, padding: '5px 14px', borderRadius: 7,
                      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                      background: active ? 'rgba(79,142,247,.12)' : 'transparent',
                      color: active ? 'var(--accent)' : 'var(--text2)',
                      fontSize: 12.5, fontWeight: active ? 600 : 400,
                      cursor: 'pointer', transition: 'all .16s ease', whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)' } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' } }}>
                    {cat.name}
                  </button>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* ── Grid ── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, paddingBottom: 80, gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderOpen size={22} style={{ color: 'var(--text3)' }} />
            </div>
            <p style={{ color: 'var(--text2)', fontSize: 14, fontWeight: 500 }}>Tidak ada proyek ditemukan</p>
            <p style={{ color: 'var(--text3)', fontSize: 13, maxWidth: 300, textAlign: 'center' }}>
              {search || category ? 'Coba ubah filter atau kata kunci.' : 'Belum ada proyek yang dipublikasikan.'}
            </p>
            {(search || category) && (
              <button onClick={() => { setSearch(''); setCategory('') }}
                style={{ marginTop: 4, padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 13, cursor: 'pointer', transition: 'border-color .15s, color .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}>
                Reset filter
              </button>
            )}
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {projects.map((p, i) => <ProjectCard key={p.id} p={p} onView={setSelectedProject} index={i} />)}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && !loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 52 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? .3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .15s' }}>
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
              return (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${page === p ? 'var(--accent)' : 'var(--border)'}`, background: page === p ? 'rgba(79,142,247,.12)' : 'transparent', color: page === p ? 'var(--accent)' : 'var(--text2)', fontSize: 13, fontWeight: page === p ? 600 : 400, cursor: 'pointer', transition: 'all .15s' }}>
                  {p}
                </button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? .3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .15s' }}>
              <ChevronRight size={15} />
            </button>
          </div>
        )}
        {/* ── Dashboard section dihapus ── */}

      </main>

      <ProjectDetailModal project={selectedProject} open={!!selectedProject} onClose={() => setSelectedProject(null)} />
      <ToastContainer />
    </div>
  )
}

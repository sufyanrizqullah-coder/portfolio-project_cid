'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink, Calendar } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate, parseTechnologies } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

interface Project {
  id: string; title: string; shortDescription: string; fullDescription: string
  thumbnail: string | null; technologies: string; completionDate: string | null
  startDate: string | null; demoUrl: string | null; category: { name: string }
}

function getEmbedUrl(url: string | null): string | null {
  if (!url) return null
  // Bersihkan karakter aneh
  const cleaned = url.replace('datastudio.google.com:', 'datastudio.google.com').replace('lookerstudio.google.com:', 'lookerstudio.google.com')
  if (cleaned.includes('datastudio.google.com') || cleaned.includes('lookerstudio.google.com')) {
    return cleaned
      .replace('datastudio.google.com/reporting', 'lookerstudio.google.com/embed/reporting')
      .replace('datastudio.google.com/s/', 'lookerstudio.google.com/embed/reporting/')
      .replace('lookerstudio.google.com/reporting', 'lookerstudio.google.com/embed/reporting')
      // Kalau sudah ada /embed/ biarkan
  }
  return null
}

export default function PresentationPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [direction, setDirection] = useState(1)
  const { theme } = useTheme()

  useEffect(() => {
    fetch('/api/portfolios?limit=50&sort=newest')
      .then(r => r.json())
      .then(d => setProjects(d.items || []))
      .finally(() => setLoading(false))
  }, [])

  const prev = useCallback(() => {
    if (current > 0) { setDirection(-1); setCurrent(c => c - 1) }
  }, [current])

  const next = useCallback(() => {
    if (current < projects.length - 1) { setDirection(1); setCurrent(c => c + 1) }
  }, [current, projects.length])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prev()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [next, prev])

  const p = projects[current]
  const techs = p ? parseTechnologies(p.technologies) : []
  const embedUrl = p ? getEmbedUrl(p.demoUrl) : null
  const hasEmbed = !!embedUrl

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 24, height: 24, border: '2px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!projects.length) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ color: 'var(--text3)', fontSize: 14 }}>Tidak ada proyek</p>
      <Link href="/" style={{ color: 'var(--accent)', fontSize: 13 }}>← Kembali</Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Top bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 48, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>
          Mode Presentasi — {current + 1} / {projects.length}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 12.5, textDecoration: 'none', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}>
            ✕ Keluar
          </Link>
        </div>
      </div>

      {/* Slide area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 60px 90px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          {p && (
            <motion.div
              key={p.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: .28, ease: [.25, .46, .45, .94] }}
              style={{
                width: '100%', maxWidth: hasEmbed ? 1200 : 960,
                display: 'grid',
                gridTemplateColumns: (hasEmbed || p.thumbnail) ? '2fr 1fr' : '1fr',
                gap: 80,
                alignItems: 'center',
                margin: '0 auto',
              }}
            >
              {/* Kiri: Embed atau Thumbnail */}
              {hasEmbed ? (
                <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #1a1a1a', background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,.7)', position: 'relative', aspectRatio: '16/9', maxHeight: 'calc(100vh - 210px)' }}>
                  <iframe
                    src={embedUrl!}
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    allowFullScreen
                    sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                    title={p.title}
                  />
                </div>
              ) : p.thumbnail ? (
                <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', background: 'var(--surface2)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
                  <Image src={p.thumbnail} alt={p.title} fill style={{ objectFit: 'cover' }} sizes="520px" />
                </div>
              ) : null}

              {/* Kanan: Info */}
              <div style={{ marginLeft: -30 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'var(--accent)', textTransform: 'uppercase' }}>
                    {p.category.name}
                  </span>
                  {p.completionDate && (
                    <>
                      <span style={{ color: 'var(--border2)' }}>·</span>
                      <span style={{ fontSize: 11.5, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={11} />{formatDate(p.completionDate)}
                      </span>
                    </>
                  )}
                </div>

                <h1 style={{ fontSize: hasEmbed ? 28 : 36, fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1.2, color: 'var(--text)', marginBottom: 14 }}>
                  {p.title}
                </h1>

                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 24 }}>
                  {p.shortDescription}
                </p>

                {techs.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.1em', color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase' }}>TEKNOLOGI</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {techs.map(t => (
                        <span key={t} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {p.demoUrl && (
                  <a href={p.demoUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', transition: 'opacity .15s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    <ExternalLink size={14} /> {hasEmbed ? 'Buka Penuh' : 'Lihat Demo'}
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', borderRadius: 99, padding: '8px 14px' }}>
        <button onClick={prev} disabled={current === 0}
          style={{ width: 32, height: 32, borderRadius: '50%', background: 'transparent', border: 'none', color: current === 0 ? 'var(--border2)' : 'var(--text2)', cursor: current === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color .15s' }}
          onMouseEnter={e => { if (current > 0) e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { if (current > 0) e.currentTarget.style.color = 'var(--text2)' }}>
          <ChevronLeft size={16} />
        </button>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {projects.map((_, i) => (
            <button key={i} onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
              style={{ width: i === current ? 22 : 6, height: 6, borderRadius: 3, background: i === current ? 'var(--accent)' : 'var(--border2)', border: 'none', cursor: 'pointer', transition: 'all .2s ease', padding: 0 }} />
          ))}
        </div>
        <button onClick={next} disabled={current === projects.length - 1}
          style={{ width: 32, height: 32, borderRadius: '50%', background: 'transparent', border: 'none', color: current === projects.length - 1 ? 'var(--border2)' : 'var(--text2)', cursor: current === projects.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color .15s' }}
          onMouseEnter={e => { if (current < projects.length - 1) e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { if (current < projects.length - 1) e.currentTarget.style.color = 'var(--text2)' }}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

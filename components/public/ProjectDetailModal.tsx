'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDate, parseTechnologies } from '@/lib/utils'
import { ExternalLink, GitBranch, Calendar, X } from 'lucide-react'
import Image from 'next/image'

interface ProjectFile {
  id: string; fileName: string; fileUrl: string; fileType: string; fileSize: number; allowDownload: boolean
}
interface Project {
  id: string; title: string; slug: string; shortDescription: string; fullDescription: string
  thumbnail: string | null; technologies: string; completionDate: string | null; startDate: string | null
  status: string; demoUrl: string | null; githubUrl: string | null; allowDownload: boolean
  category: { name: string }; files?: ProjectFile[]
}

export function ProjectDetailModal({ project, open, onClose }: { project: Project | null; open: boolean; onClose: () => void }) {
  const [imgIndex, setImgIndex] = useState(0)

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  useEffect(() => { setImgIndex(0) }, [project])

  if (!project) return null

  const techs = parseTechnologies(project.technologies)
  const images = [
    ...(project.thumbnail ? [{ url: project.thumbnail, name: 'thumbnail' }] : []),
    ...(project.files?.filter(f => f.fileType.startsWith('image/')).map(f => ({ url: f.fileUrl, name: f.fileName })) || []),
  ]

  return (
    <AnimatePresence>
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)' }} />

          <motion.div
            initial={{ opacity: 0, scale: .96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: .96, y: 12 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            style={{
              position: 'relative', width: '100%', maxWidth: 940,
              background: 'var(--surface)', borderRadius: 16,
              overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,.4)',
              maxHeight: 'calc(100vh - 48px)',
              display: 'flex', flexDirection: 'column',
              border: '1px solid var(--border)',
            }}
          >
            {/* Close */}
            <button onClick={onClose}
              style={{ position: 'absolute', top: 14, right: 14, zIndex: 10, width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text2)' }}>
              <X size={13} />
            </button>

            {/* ── Top: header + thumbnail side by side ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', flex: 1, minHeight: 0 }}>

              {/* Kiri: info */}
              <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid var(--border)' }}>
                <div>
                  {/* Category */}
                  <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, letterSpacing: '.06em', color: '#2563eb', textTransform: 'uppercase', marginBottom: 8 }}>
                    {project.category.name}
                  </span>

                  {/* Title */}
                  <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.025em', color: 'var(--text)', margin: '0 0 10px', lineHeight: 1.2 }}>
                    {project.title}
                  </h2>

                  {/* Short desc */}
                  <p style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.65, margin: '0 0 16px' }}>
                    {project.shortDescription}
                  </p>

                  {/* Full desc */}
                  {project.fullDescription && (
                    <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.65, margin: 0, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.fullDescription}
                    </p>
                  )}
                </div>

                {/* Tech tags */}
                {techs.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Teknologi</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {techs.map(t => (
                        <span key={t} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 5, background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)', fontWeight: 500 }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Kanan: thumbnail */}
              <div style={{ position: 'relative', background: 'var(--surface2)', overflow: 'hidden' }}>
                {images.length > 0 ? (
                  <Image src={images[imgIndex].url} alt={images[imgIndex].name} fill
                    style={{ objectFit: 'contain', objectPosition: 'center top', padding: 8 }}
                    sizes="480px" />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, background: 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 56, fontWeight: 800, color: 'var(--text3)' }}>{project.title[0]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Footer ── */}
            <div style={{ background: 'var(--surface2)', borderTop: '1px solid var(--border)', padding: '11px 28px', display: 'flex', alignItems: 'center', gap: 20 }}>

              {project.startDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Calendar size={15} style={{ color: '#3b82f6', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 10.5, color: 'var(--text3)', margin: 0 }}>Mulai</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{formatDate(project.startDate)}</p>
                  </div>
                </div>
              )}

              {project.startDate && project.completionDate && (
                <div style={{ width: 1, height: 26, background: 'var(--border)', flexShrink: 0 }} />
              )}

              {project.completionDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Calendar size={15} style={{ color: '#3b82f6', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 10.5, color: 'var(--text3)', margin: 0 }}>Selesai</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{formatDate(project.completionDate)}</p>
                  </div>
                </div>
              )}

              {(project.startDate || project.completionDate) && (
                <div style={{ width: 1, height: 26, background: 'var(--border)', flexShrink: 0 }} />
              )}

              <div style={{ flex: 1 }} />

              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'border-color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <GitBranch size={13} /> GitHub
                </a>
              )}

              {project.demoUrl && (
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 9, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 2px 8px rgba(37,99,235,.3)', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}>
                  <ExternalLink size={13} /> Live Demo
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

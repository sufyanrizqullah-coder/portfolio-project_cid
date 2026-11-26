'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ExternalLink, GitBranch, ArrowUpRight } from 'lucide-react'
import { formatDate, parseTechnologies } from '@/lib/utils'
import Image from 'next/image'

interface Project {
  id: string; title: string; slug: string; shortDescription: string
  thumbnail: string | null; technologies: string; extraCategories: string
  completionDate: string | null; status: string
  demoUrl: string | null; githubUrl: string | null
  category: { name: string; slug: string }
}

interface ProjectCardProps {
  project: Project
  onView: (project: Project) => void
  showStatus?: boolean
  index?: number
}

const GRADIENTS = [
  'linear-gradient(135deg,#1e3a5f,#2d1b69)',
  'linear-gradient(135deg,#2d1b69,#4a0e3d)',
  'linear-gradient(135deg,#0c2a4a,#1a3d2b)',
  'linear-gradient(135deg,#1a3d2b,#0c2a4a)',
  'linear-gradient(135deg,#3d1a0c,#4a2d0e)',
]

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  published: { background: 'rgba(52,211,153,.1)', color: '#34d399', border: '1px solid rgba(52,211,153,.2)' },
  draft:     { background: 'rgba(251,191,36,.1)',  color: '#fbbf24', border: '1px solid rgba(251,191,36,.2)' },
  archived:  { background: 'rgba(107,114,128,.1)', color: '#6b7280', border: '1px solid rgba(107,114,128,.2)' },
}

export function ProjectCard({ project, onView, showStatus = false, index = 0 }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false)
  const techs = parseTechnologies(project.technologies)
  const extraCatIds: string[] = (() => { try { return JSON.parse(project.extraCategories || '[]') } catch { return [] } })()
  const gradIdx = project.title.charCodeAt(0) % GRADIENTS.length

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .38, delay: index * .055, ease: [.25, .46, .45, .94] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onView(project)}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer',
        transition: 'transform .22s ease, box-shadow .22s ease, border-color .22s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 16px 48px rgba(0,0,0,.5)' : '0 2px 8px rgba(0,0,0,.2)',
        borderColor: hovered ? 'var(--border2)' : 'var(--border)',
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--surface2)', overflow: 'hidden' }}>
        {project.thumbnail ? (
          <Image src={project.thumbnail} alt={project.title} fill
            style={{ objectFit: 'cover', transition: 'transform .4s ease', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
            sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw" />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: GRADIENTS[gradIdx] }} />
        )}

        {/* Hover overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.7),transparent)', opacity: hovered ? 1 : 0, transition: 'opacity .3s', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#fff', fontSize: 12.5, fontWeight: 500, background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)', padding: '5px 14px', borderRadius: 99, border: '1px solid rgba(255,255,255,.15)' }}>
            Lihat Detail <ArrowUpRight size={12} />
          </span>
        </div>

        {/* Category chips */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10.5, fontWeight: 500, padding: '3px 9px', borderRadius: 5, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)', color: 'var(--text2)', border: '1px solid rgba(255,255,255,.08)' }}>
            {project.category.name}
          </span>
          {extraCatIds.length > 0 && (
            <span style={{ fontSize: 10.5, fontWeight: 500, padding: '3px 9px', borderRadius: 5, background: 'rgba(79,142,247,.2)', backdropFilter: 'blur(8px)', color: '#93bbff', border: '1px solid rgba(79,142,247,.25)' }}>
              +{extraCatIds.length}
            </span>
          )}
        </div>

        {showStatus && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span style={{ fontSize: 10.5, fontWeight: 500, padding: '3px 9px', borderRadius: 5, ...STATUS_STYLE[project.status] }}>
              {project.status}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 7 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: hovered ? 'var(--accent)' : 'var(--text)', transition: 'color .18s', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {project.title}
          </h3>
          <ArrowUpRight size={14} style={{ color: hovered ? 'var(--accent)' : 'var(--text3)', flexShrink: 0, marginTop: 2, transition: 'color .18s, transform .18s', transform: hovered ? 'translate(1px,-1px)' : 'none' }} />
        </div>

        <p style={{ fontSize: 12.5, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 13, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.shortDescription}
        </p>

        {/* Tech tags */}
        {techs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 13 }}>
            {techs.slice(0, 4).map(t => (
              <span key={t} style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 5, background: 'var(--surface3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>{t}</span>
            ))}
            {techs.length > 4 && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, color: 'var(--text3)', border: '1px solid var(--border)' }}>+{techs.length - 4}</span>}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 11, borderTop: '1px solid var(--border)' }}>
          {project.completionDate ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--text3)' }}>
              <Calendar size={11} />{formatDate(project.completionDate)}
            </span>
          ) : <span />}
          <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                style={{ padding: '5px 7px', borderRadius: 7, color: 'var(--text3)', display: 'flex', transition: 'color .15s, background .15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface3)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent' }}>
                <GitBranch size={13} />
              </a>
            )}
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"
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

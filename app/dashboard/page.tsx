'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Maximize2, Minimize2 } from 'lucide-react'

const EMBED_URL = 'https://lookerstudio.google.com/embed/reporting/7c500683-9374-4b2b-82df-e41a4d5eeeb8/page/wWp8F'
const REPORT_URL  = 'https://datastudio.google.com/s/rO5R_DCdy1M'

export default function DashboardPage() {
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        background: 'rgba(12,12,14,.95)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border)', padding: '0 24px',
        display: 'flex', alignItems: 'center', height: 52, gap: 16, flexShrink: 0,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <Link href="/"
          style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text2)', textDecoration: 'none', transition: 'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}>
          <ArrowLeft size={14} /> Kembali
        </Link>

        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', flex: 1 }}>
          Bogie Traceability Dashboard
        </span>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setFullscreen(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12.5, cursor: 'pointer', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}>
            {fullscreen ? <><Minimize2 size={13} /> Keluar</> : <><Maximize2 size={13} /> Fullscreen</>}
          </button>
          <a href={REPORT_URL} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12.5, textDecoration: 'none', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}>
            <ExternalLink size={13} /> Buka Langsung
          </a>
        </div>
      </header>

      {/* Iframe wrapper */}
      <div style={{
        flex: 1, overflow: 'hidden', position: 'relative',
        ...(fullscreen ? { position: 'fixed', inset: 0, zIndex: 100, background: 'var(--bg)', top: 52 } : {}),
      }}>
        <div style={{
          width: '142.8%',
          height: '142.8%',
          transform: 'scale(0.7)',
          transformOrigin: 'top left',
        }}>
          <iframe
            src={EMBED_URL}
            style={{ width: '100%', height: fullscreen ? 'calc(143vh - 74px)' : 'calc(143vh - 74px)', border: 'none', display: 'block' }}
            frameBorder="0"
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            title="Bogie Traceability Dashboard"
          />
        </div>
      </div>

    </div>
  )
}

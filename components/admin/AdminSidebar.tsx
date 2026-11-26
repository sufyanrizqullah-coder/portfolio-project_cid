'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, FolderOpen, Tag, Settings, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/projects',  icon: FolderOpen,       label: 'Projects' },
  { href: '/admin/categories',icon: Tag,              label: 'Categories' },
  { href: '/admin/settings',  icon: Settings,         label: 'Settings' },
]

export function AdminSidebar({ userName, userEmail }: { userName: string; userEmail: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [mobile, setMobile] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const logout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logout berhasil')
    setTimeout(() => router.push('/admin/login'), 400)
  }

  const NavLinks = () => (
    <>
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
        return (
          <Link key={href} href={href} onClick={() => setMobile(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 8,
              fontSize: 13.5, fontWeight: active ? 500 : 400,
              color: active ? 'var(--text)' : 'var(--text2)',
              background: active ? 'var(--surface2)' : 'transparent',
              border: `1px solid ${active ? 'var(--border)' : 'transparent'}`,
              transition: 'all .16s ease', textDecoration: 'none',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text2)' }}>
            <Icon size={15} style={{ opacity: active ? 1 : .6 }} />
            {label}
            {active && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: .4 }} />}
          </Link>
        )
      })}
    </>
  )

  const SidebarInner = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-.03em' }}>
          Portfolio<span style={{ color: 'var(--accent)' }}>.</span>
          <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text3)', marginLeft: 6 }}>admin</span>
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavLinks />
      </nav>

      {/* User */}
      <div style={{ padding: '12px 10px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ padding: '8px 12px', marginBottom: 2 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{userName}</p>
          <p style={{ fontSize: 11.5, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</p>
        </div>
        <button onClick={logout} disabled={loggingOut}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid transparent', background: 'transparent', color: 'var(--text2)', fontSize: 13.5, cursor: 'pointer', transition: 'all .16s', textAlign: 'left', width: '100%' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,.08)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,.15)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}>
          <LogOut size={15} style={{ opacity: .6 }} />{loggingOut ? 'Keluar…' : 'Logout'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside style={{ width: 220, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', height: '100vh', position: 'sticky', top: 0, display: 'none' }}
        className="lg-sidebar">
        <SidebarInner />
      </aside>

      <style>{`
        @media(min-width:1024px){ .lg-sidebar{display:block!important} .mobile-btn{display:none!important} }
      `}</style>

      {/* Mobile trigger */}
      <button className="mobile-btn" onClick={() => setMobile(true)}
        style={{ position: 'fixed', top: 14, left: 14, zIndex: 60, padding: 8, borderRadius: 9, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer', display: 'flex' }}>
        <Menu size={16} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobile(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 50, backdropFilter: 'blur(4px)' }} />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              style={{ position: 'fixed', left: 0, top: 0, height: '100%', width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)', zIndex: 60 }}>
              <button onClick={() => setMobile(false)}
                style={{ position: 'absolute', top: 14, right: 14, padding: 5, borderRadius: 7, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text3)', cursor: 'pointer', display: 'flex' }}>
                <X size={14} />
              </button>
              <SidebarInner />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

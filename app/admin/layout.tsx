'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ToastContainer } from '@/components/ui/Toast'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string; email: string; mustChangePassword: boolean } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (pathname === '/admin/login') { setLoading(false); return }
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.user) { router.push('/admin/login'); return }
        setUser(data.user)
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false))
  }, [pathname, router])

  if (pathname === '/admin/login') return <>{children}</>

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 20, height: 20, border: '2px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <AdminSidebar userName={user.name} userEmail={user.email} />
      <main style={{ flex: 1, overflow: 'auto' }}>
        {user.mustChangePassword && pathname !== '/admin/settings' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 24px', borderBottom: '1px solid var(--border)' }}>
            <ThemeToggle />
          </div>
        )}
        {!user.mustChangePassword && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 24px', borderBottom: '1px solid var(--border)' }}>
            <ThemeToggle />
          </div>
        )}
        <div style={{ padding: '32px 28px' }}>{children}</div>
      </main>
      <ToastContainer />
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User { id: string; name: string; email: string; role: string; mustChangePassword: boolean }

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { setUser(data?.user || null) })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/admin/login')
  }

  return { user, loading, logout }
}

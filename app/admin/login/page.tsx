'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { toast, ToastContainer } from '@/components/ui/Toast'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  useEffect(() => {
    fetch('/api/auth/me').then(r => { if (r.ok) router.push('/admin/dashboard') })
  }, [router])

  const validate = () => {
    const e: typeof errors = {}
    if (!email) e.email = 'Email wajib diisi'
    if (!password) e.password = 'Password wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Login gagal'); return }
      toast.success('Login berhasil')
      setTimeout(() => router.push('/admin/dashboard'), 400)
    } catch { toast.error('Terjadi kesalahan. Coba lagi.') }
    finally { setLoading(false) }
  }

  const inputStyle = (hasError?: string) => ({
    width: '100%', background: 'var(--surface2)',
    border: `1px solid ${hasError ? '#f87171' : 'var(--border)'}`,
    borderRadius: 9, padding: '10px 14px', fontSize: 13.5,
    color: 'var(--text)', outline: 'none', transition: 'border-color .18s',
  } as React.CSSProperties)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}
        style={{ width: '100%', maxWidth: 380 }}>

        {/* Brand */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text3)', textDecoration: 'none', marginBottom: 20, transition: 'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text2)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
            <ArrowLeft size={13} /> Kembali ke halaman utama
          </Link>
          <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.03em', color: 'var(--text)', marginBottom: 6 }}>
            Portfolio<span style={{ color: 'var(--accent)' }}>.</span>
          </p>
          <p style={{ fontSize: 13.5, color: 'var(--text3)' }}>Masuk ke panel administrasi</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--text2)', marginBottom: 7, letterSpacing: '.01em' }}>Email</label>
            <input type="email" value={email}
              onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: undefined })) }}
              placeholder="admin@example.com"
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={e => e.currentTarget.style.borderColor = errors.email ? '#f87171' : 'var(--border)'}
              style={inputStyle(errors.email)} />
            {errors.email && <p style={{ fontSize: 11.5, color: '#f87171', marginTop: 5 }}>{errors.email}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--text2)', marginBottom: 7, letterSpacing: '.01em' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, password: undefined })) }}
                placeholder="••••••••"
                onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={e => e.currentTarget.style.borderColor = errors.password ? '#f87171' : 'var(--border)'}
                style={{ ...inputStyle(errors.password), paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', padding: 2, transition: 'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text2)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p style={{ fontSize: 11.5, color: '#f87171', marginTop: 5 }}>{errors.password}</p>}
          </div>

          <motion.button type="submit" disabled={loading} whileTap={{ scale: .98 }}
            style={{ marginTop: 4, padding: '11px 20px', borderRadius: 9, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, transition: 'opacity .15s, background .15s', letterSpacing: '.01em' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#3b7ee0' }}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
            {loading ? 'Memverifikasi…' : 'Masuk'}
          </motion.button>
        </form>

        <p style={{ marginTop: 28, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
          Hanya admin yang berwenang dapat mengakses panel ini.
        </p>
      </motion.div>
      <ToastContainer />
    </div>
  )
}

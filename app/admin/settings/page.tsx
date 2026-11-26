'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from '@/components/ui/Toast'
import { User, Layout, Check } from 'lucide-react'

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState({ name: '', email: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileErrors, setProfileErrors] = useState<{ name?: string; email?: string }>({})

  const [perPage, setPerPage] = useState('12')
  const [savingDisplay, setSavingDisplay] = useState(false)
  const [displaySaved, setDisplaySaved] = useState(false)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Ambil data profil admin
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) setProfile({ name: d.user.name, email: d.user.email })
    })
    // Ambil setting tampilan
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.settings?.projects_per_page) setPerPage(d.settings.projects_per_page)
    }).finally(() => setLoading(false))
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: typeof profileErrors = {}
    if (!profile.name.trim()) errs.name = 'Nama wajib diisi'
    if (!profile.email.trim()) errs.email = 'Email wajib diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errs.email = 'Format email tidak valid'
    if (Object.keys(errs).length) { setProfileErrors(errs); return }

    setSavingProfile(true)
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Profil berhasil diperbarui')
      setProfileErrors({})
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally { setSavingProfile(false) }
  }

  const handleSaveDisplay = async (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseInt(perPage)
    if (isNaN(val) || val < 4 || val > 48) {
      toast.error('Jumlah proyek harus antara 4 dan 48')
      return
    }
    setSavingDisplay(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects_per_page: String(val) }),
      })
      if (!res.ok) throw new Error('Gagal menyimpan')
      setDisplaySaved(true)
      setTimeout(() => setDisplaySaved(false), 2000)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally { setSavingDisplay(false) }
  }

  const inp: React.CSSProperties = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 9, padding: '10px 14px', fontSize: 13.5, color: 'var(--text)',
    outline: 'none', fontFamily: 'inherit', transition: 'border-color .15s',
  }

  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--text2)', marginBottom: 7,
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <div style={{ width: 24, height: 24, border: '2px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth: 560 }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--text)', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text3)' }}>Kelola akun dan tampilan website</p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Profil Admin */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
            <User size={15} style={{ color: 'var(--text3)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Profil Admin</span>
          </div>
          <form onSubmit={handleSaveProfile} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={lbl}>Nama Tampilan</label>
              <input value={profile.name}
                onChange={e => { setProfile(p => ({ ...p, name: e.target.value })); setProfileErrors(v => ({ ...v, name: undefined })) }}
                placeholder="Nama Anda" style={{ ...inp, borderColor: profileErrors.name ? '#f87171' : 'var(--border)' }}
                onFocus={e => e.currentTarget.style.borderColor = profileErrors.name ? '#f87171' : 'var(--accent)'}
                onBlur={e => e.currentTarget.style.borderColor = profileErrors.name ? '#f87171' : 'var(--border)'} />
              {profileErrors.name && <p style={{ fontSize: 11.5, color: '#f87171', marginTop: 5 }}>{profileErrors.name}</p>}
            </div>
            <div>
              <label style={lbl}>Email Login</label>
              <input type="email" value={profile.email}
                onChange={e => { setProfile(p => ({ ...p, email: e.target.value })); setProfileErrors(v => ({ ...v, email: undefined })) }}
                placeholder="email@example.com" style={{ ...inp, borderColor: profileErrors.email ? '#f87171' : 'var(--border)' }}
                onFocus={e => e.currentTarget.style.borderColor = profileErrors.email ? '#f87171' : 'var(--accent)'}
                onBlur={e => e.currentTarget.style.borderColor = profileErrors.email ? '#f87171' : 'var(--border)'} />
              {profileErrors.email && <p style={{ fontSize: 11.5, color: '#f87171', marginTop: 5 }}>{profileErrors.email}</p>}
              <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Email ini digunakan untuk login ke panel admin.</p>
            </div>
            <div>
              <button type="submit" disabled={savingProfile}
                style={{ padding: '9px 18px', borderRadius: 9, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: savingProfile ? 'not-allowed' : 'pointer', opacity: savingProfile ? .7 : 1 }}>
                {savingProfile ? 'Menyimpan…' : 'Simpan Profil'}
              </button>
            </div>
          </form>
        </div>

        {/* Tampilan Galeri */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
            <Layout size={15} style={{ color: 'var(--text3)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Tampilan Galeri</span>
          </div>
          <form onSubmit={handleSaveDisplay} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={lbl}>Proyek per Halaman</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="number" value={perPage} min="4" max="48"
                  onChange={e => setPerPage(e.target.value)}
                  style={{ ...inp, width: 100 }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>proyek</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
                Jumlah proyek yang ditampilkan per halaman di galeri publik (4–48).
              </p>
            </div>
            <div>
              <button type="submit" disabled={savingDisplay}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, background: displaySaved ? '#10b981' : 'var(--accent)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: savingDisplay ? 'not-allowed' : 'pointer', opacity: savingDisplay ? .7 : 1, transition: 'background .3s' }}>
                {displaySaved ? <><Check size={14} /> Tersimpan</> : savingDisplay ? 'Menyimpan…' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}

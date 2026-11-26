'use client'
import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 34, height: 34, borderRadius: 9,
        border: '1px solid var(--border)', background: 'transparent',
        color: 'var(--text2)', cursor: 'pointer',
        transition: 'all .18s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border2)'
        e.currentTarget.style.color = 'var(--text)'
        e.currentTarget.style.background = 'var(--surface2)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.color = 'var(--text2)'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {theme === 'dark'
        ? <Sun size={15} />
        : <Moon size={15} />
      }
    </button>
  )
}

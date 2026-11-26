'use client'
import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    const initial = saved || 'dark'
    setTheme(initial)
    applyTheme(initial)
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    applyTheme(next)
  }

  return { theme, toggle }
}

function applyTheme(theme: 'dark' | 'light') {
  const root = document.documentElement
  if (theme === 'light') {
    root.style.setProperty('--bg',       '#f4f4f6')
    root.style.setProperty('--surface',  '#ffffff')
    root.style.setProperty('--surface2', '#f0f0f3')
    root.style.setProperty('--surface3', '#e8e8ed')
    root.style.setProperty('--border',   '#e2e2e8')
    root.style.setProperty('--border2',  '#d0d0d8')
    root.style.setProperty('--text',     '#1a1a24')
    root.style.setProperty('--text2',    '#52526a')
    root.style.setProperty('--text3',    '#9898b0')
    root.style.setProperty('--accent',   '#2563eb')
    // body background
    document.body.style.background = '#f4f4f6'
    document.body.style.color = '#1a1a24'
  } else {
    root.style.setProperty('--bg',       '#0c0c0e')
    root.style.setProperty('--surface',  '#131316')
    root.style.setProperty('--surface2', '#1a1a1f')
    root.style.setProperty('--surface3', '#222228')
    root.style.setProperty('--border',   '#26262e')
    root.style.setProperty('--border2',  '#2e2e38')
    root.style.setProperty('--text',     '#e8e8ed')
    root.style.setProperty('--text2',    '#8e8e9e')
    root.style.setProperty('--text3',    '#56566a')
    root.style.setProperty('--accent',   '#4f8ef7')
    document.body.style.background = '#0c0c0e'
    document.body.style.color = '#e8e8ed'
  }
}

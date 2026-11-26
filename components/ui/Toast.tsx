'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle } from 'lucide-react'

export type ToastType = 'success' | 'error'
interface ToastItem { id: string; message: string; type: ToastType }

let listeners: ((t: ToastItem | null) => void)[] = []
let current: ToastItem | null = null
let timer: ReturnType<typeof setTimeout> | null = null

function show(message: string, type: ToastType) {
  if (timer) clearTimeout(timer)
  const id = Math.random().toString(36).slice(2)
  current = { id, message, type }
  listeners.forEach(fn => fn(current))
  timer = setTimeout(() => {
    current = null
    listeners.forEach(fn => fn(null))
  }, 2500)
}

export const toast = {
  success: (message: string) => show(message, 'success'),
  error:   (message: string) => show(message, 'error'),
}

export function ToastContainer() {
  const [item, setItem] = useState<ToastItem | null>(null)

  useEffect(() => {
    listeners.push(setItem)
    return () => { listeners = listeners.filter(fn => fn !== setItem) }
  }, [])

  const dismiss = useCallback(() => {
    if (timer) clearTimeout(timer)
    current = null
    listeners.forEach(fn => fn(null))
  }, [])

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      <AnimatePresence mode="wait">
        {item && (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12, scale: .94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: .94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            onClick={dismiss}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 16px',
              background: '#131316',
              border: `1px solid ${item.type === 'success' ? 'rgba(52,211,153,.2)' : 'rgba(248,113,113,.2)'}`,
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,.45)',
              cursor: 'pointer', userSelect: 'none',
              minWidth: 220, maxWidth: 300,
            }}
          >
            {item.type === 'success'
              ? <CheckCircle size={16} style={{ color: '#34d399', flexShrink: 0 }} />
              : <XCircle    size={16} style={{ color: '#f87171', flexShrink: 0 }} />
            }
            <span style={{ fontSize: 13.5, fontWeight: 500, color: '#e8e8ed', flex: 1 }}>
              {item.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

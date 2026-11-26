'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'gray' | 'purple'
  index?: number
}

const colorMap = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400', num: 'text-blue-400' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/20', icon: 'text-green-400', num: 'text-green-400' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: 'text-yellow-400', num: 'text-yellow-400' },
  gray: { bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: 'text-gray-400', num: 'text-gray-400' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400', num: 'text-purple-400' },
}

function AnimatedNumber({ target }: { target: number }) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const step = Math.ceil(target / 30)
    const interval = setInterval(() => {
      setCurrent(c => {
        if (c + step >= target) { clearInterval(interval); return target }
        return c + step
      })
    }, 30)
    return () => clearInterval(interval)
  }, [target])
  return <>{current}</>
}

export function StatCard({ label, value, icon, color, index = 0 }: StatCardProps) {
  const c = colorMap[color]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`${c.bg} border ${c.border} rounded-2xl p-5 relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">{label}</p>
          <p className={`text-3xl font-bold ${c.num}`}>
            <AnimatedNumber target={value} />
          </p>
        </div>
        <div className={`${c.icon} opacity-80`}>{icon}</div>
      </div>
    </motion.div>
  )
}

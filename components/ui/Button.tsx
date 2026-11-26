'use client'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/50 shadow-lg shadow-blue-500/20',
  secondary: 'bg-purple-600 hover:bg-purple-500 text-white border border-purple-500/50 shadow-lg shadow-purple-500/20',
  danger: 'bg-red-600 hover:bg-red-500 text-white border border-red-500/50',
  ghost: 'bg-transparent hover:bg-white/10 text-gray-300 hover:text-white border border-transparent',
  outline: 'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white border border-[#2a2a3a] hover:border-[#3a3a50]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
}

export function Button({ variant = 'primary', size = 'md', loading, icon, children, disabled, className = '', ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      style={{ transition: 'all 0.2s' }}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  )
}

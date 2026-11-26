interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'blue' | 'purple' | 'cyan' | 'green' | 'red' | 'yellow' | 'gray'
  size?: 'sm' | 'md'
}

const variants = {
  default: 'bg-white/10 text-gray-300 border-white/10',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  green: 'bg-green-500/15 text-green-400 border-green-500/20',
  red: 'bg-red-500/15 text-red-400 border-red-500/20',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  gray: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    published: { label: 'Published', variant: 'green' },
    draft: { label: 'Draft', variant: 'yellow' },
    archived: { label: 'Archived', variant: 'gray' },
  }
  const config = map[status] || { label: status, variant: 'default' }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

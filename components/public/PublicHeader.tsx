'use client'
import { useState } from 'react'
import { Search, LogIn, X, Briefcase, Layers } from 'lucide-react'
import Link from 'next/link'

interface PublicHeaderProps {
  search: string
  onSearch: (v: string) => void
  totalProjects: number
  totalCategories: number
}

export function PublicHeader({ search, onSearch, totalProjects, totalCategories }: PublicHeaderProps) {
  const [focused, setFocused] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <span className="font-bold text-white text-base hidden sm:block tracking-tight">Portfolio</span>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-lg">
            <div className={`relative transition-all duration-200`}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Cari proyek..."
                className={`w-full bg-gray-900 border ${focused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-700'} rounded-xl pl-10 pr-9 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none transition-all`}
              />
              {search && (
                <button onClick={() => onSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-blue-400 font-semibold">{totalProjects}</span>
                <span className="text-gray-500">Proyek</span>
              </div>
              <div className="w-px h-4 bg-gray-700" />
              <div className="flex items-center gap-1.5 text-sm">
                <Layers className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-violet-400 font-semibold">{totalCategories}</span>
                <span className="text-gray-500">Kategori</span>
              </div>
            </div>
            <Link href="/admin/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all shadow-lg shadow-blue-500/20">
              <LogIn className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>

        </div>
      </div>
    </header>
  )
}

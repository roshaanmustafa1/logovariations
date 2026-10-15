'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layers, Sparkles, RotateCcw, Wand2 } from 'lucide-react'
import { useBrandStore } from '@/stores/use-brand-store'

export function Header() {
  const pathname = usePathname()
  const loadDemo = useBrandStore((state) => state.loadDemo)
  const resetProject = useBrandStore((state) => state.resetProject)
  const assets = useBrandStore((state) => state.assets)

  return (
    <header className="w-full border-b border-[#E8E6E2] bg-[#FFFFFF]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* App Title & Navigation Tabs */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="size-9 rounded-xl bg-[#FF650B] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Layers className="size-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#252525] tracking-tight group-hover:text-[#FF650B] transition-colors">
                LogoPack Studio
              </span>
              <span className="hidden md:inline-block text-[11px] font-semibold text-[#737373] bg-[#F8F7F4] border border-[#E8E6E2] px-2 py-0.5 rounded-full">
                Personal Edition
              </span>
            </div>
          </Link>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5" aria-label="Main Navigation">
            <Link
              href="/"
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                pathname === '/'
                  ? 'bg-[#252525] text-white shadow-xs'
                  : 'text-[#737373] hover:text-[#252525] hover:bg-[#F8F7F4]'
              }`}
            >
              Logo Studio
            </Link>

            <Link
              href="/remove-bg"
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                pathname === '/remove-bg'
                  ? 'bg-[#FF650B] text-white shadow-xs'
                  : 'text-[#737373] hover:text-[#FF650B] hover:bg-[#FFF0E7]'
              }`}
            >
              <Wand2 className="size-3.5" />
              <span>Remove BG</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  pathname === '/remove-bg'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#FF650B]/10 text-[#FF650B]'
                }`}
              >
                New
              </span>
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {pathname === '/' && (
            assets.length === 0 ? (
              <button
                type="button"
                onClick={loadDemo}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#FF650B] bg-[#FFF0E7] hover:bg-[#FFE4D4] border border-[#FF650B]/20 rounded-xl transition-all cursor-pointer"
              >
                <Sparkles className="size-3.5" />
                <span>Load Demo Pack</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Start a new project? Your current work will be reset.')) {
                    resetProject()
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#737373] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">New Project</span>
              </button>
            )
          )}
        </div>
      </div>
    </header>
  )
}

'use client'

import React from 'react'
import { Layers, Sparkles, RotateCcw } from 'lucide-react'
import { useBrandStore } from '@/stores/use-brand-store'

export function Header() {
  const loadDemo = useBrandStore((state) => state.loadDemo)
  const resetProject = useBrandStore((state) => state.resetProject)
  const assets = useBrandStore((state) => state.assets)

  return (
    <header className="w-full border-b border-[#E8E6E2] bg-[#FFFFFF]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* App Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-[#FF650B] flex items-center justify-center text-white shadow-xs">
            <Layers className="size-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[#252525] tracking-tight">
              LogoPack Studio
            </span>
            <span className="hidden sm:inline-block text-[11px] font-semibold text-[#737373] bg-[#F8F7F4] border border-[#E8E6E2] px-2 py-0.5 rounded-full">
              Personal Edition
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          {assets.length === 0 ? (
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
          )}
        </div>
      </div>
    </header>
  )
}

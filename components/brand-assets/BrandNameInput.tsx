'use client'

import React from 'react'
import { useBrandStore } from '@/stores/use-brand-store'

export function BrandNameInput() {
  const brandName = useBrandStore((state) => state.brandName)
  const slug = useBrandStore((state) => state.slug)
  const setBrandName = useBrandStore((state) => state.setBrandName)

  return (
    <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col gap-1.5 mb-4">
        <label htmlFor="brand-name" className="text-sm font-semibold text-[#252525]">
          Brand Name <span className="text-[#FF650B]">*</span>
        </label>
        <p className="text-xs text-[#737373]">
          Enter your official brand or company name. We automatically generate clean filenames from this.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            id="brand-name"
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. Gehnay By Sam"
            maxLength={60}
            className="w-full px-4 py-2.5 text-sm bg-[#F8F7F4] border border-[#E8E6E2] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF650B]/30 focus:border-[#FF650B] text-[#252525] placeholder:text-[#A09D96] transition-all"
          />
        </div>

        {slug && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#F8F7F4] border border-[#E8E6E2] rounded-xl text-xs text-[#737373] whitespace-nowrap">
            <span className="font-medium text-[#A09D96]">Slug:</span>
            <span className="font-mono text-[#252525] font-semibold">{slug}</span>
          </div>
        )}
      </div>

      {!brandName.trim() && (
        <p className="text-[11px] text-[#A09D96] mt-2">
          Brand name is required to build folder structures and file names.
        </p>
      )}
    </div>
  )
}

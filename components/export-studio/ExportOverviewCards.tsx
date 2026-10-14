'use client'

import React from 'react'
import { FolderArchive, Palette, Files, Sparkles } from 'lucide-react'
import { ExportPlan } from '@/features/export/planner'

interface ExportOverviewCardsProps {
  plan: ExportPlan
}

export function ExportOverviewCards({ plan }: ExportOverviewCardsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="size-11 rounded-xl bg-[#FFF0E7] flex items-center justify-center text-[#FF650B] shrink-0">
            <FolderArchive className="size-5.5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#252525] leading-none">
              {plan.logoCount}
            </div>
            <span className="text-xs font-medium text-[#737373] mt-1 block">
              Logo Assets
            </span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="size-11 rounded-xl bg-[#FFF0E7] flex items-center justify-center text-[#FF650B] shrink-0">
            <Palette className="size-5.5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#252525] leading-none">
              {plan.colorCount}
            </div>
            <span className="text-xs font-medium text-[#737373] mt-1 block">
              Brand Colors
            </span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="size-11 rounded-xl bg-[#FFF0E7] flex items-center justify-center text-[#FF650B] shrink-0">
            <Files className="size-5.5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#FF650B] leading-none">
              {plan.totalFiles}
            </div>
            <span className="text-xs font-medium text-[#737373] mt-1 block">
              Planned Output Files
            </span>
          </div>
        </div>
      </div>

      {/* Color Versions Overview Chips */}
      <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#737373] uppercase tracking-wider">
          <Sparkles className="size-3.5 text-[#FF650B]" />
          <span>Active Color Variations:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {plan.colorVariants.map((variant) => (
            <div
              key={variant.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F7F4] border border-[#E8E6E2] text-xs font-medium text-[#252525]"
            >
              {variant.hex ? (
                <span
                  className="size-3 rounded-full border border-black/15 shadow-2xs"
                  style={{ backgroundColor: variant.hex }}
                />
              ) : (
                <span className="size-3 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500" />
              )}
              <span>{variant.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

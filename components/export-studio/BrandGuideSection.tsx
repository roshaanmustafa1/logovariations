'use client'

import React, { useState } from 'react'
import {
  BookOpen,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react'
import { useBrandStore } from '@/stores/use-brand-store'

export function BrandGuideSection() {
  const brandName = useBrandStore((state) => state.brandName)
  const assets = useBrandStore((state) => state.assets)
  const colors = useBrandStore((state) => state.colors)
  const guide = useBrandStore((state) => state.guide)
  const updateGuideConfig = useBrandStore((state) => state.updateGuideConfig)

  const [isOpen, setIsOpen] = useState(true)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const handlePreviewPdf = async () => {
    setIsPreviewing(true)
    try {
      const res = await fetch('/api/pdf-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          description: guide.brandDescription,
          assets,
          colors,
          clearSpacePercent: guide.clearSpacePercent,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to render PDF preview')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      alert(`PDF Preview error: ${msg}`)
    } finally {
      setIsPreviewing(false)
    }
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-6 shadow-xs flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[#FFF0E7] flex items-center justify-center text-[#FF650B]">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#252525]">
              Brand Identity Guide (PDF)
            </h2>
            <p className="text-xs text-[#737373]">
              Generate a multi-page identity document with colors, clear space, and logo usage rules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={guide.enabled}
              onChange={(e) => updateGuideConfig({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#E8E6E2] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF650B]"></div>
          </label>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-[#737373] hover:text-[#252525] rounded-lg transition-colors cursor-pointer"
          >
            {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {guide.enabled && isOpen && (
        <div className="flex flex-col gap-4 pt-3 border-t border-[#E8E6E2]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Brand Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#252525]">
                Custom Brand Description (Cover Subtitle)
              </label>
              <textarea
                value={guide.brandDescription}
                onChange={(e) => updateGuideConfig({ brandDescription: e.target.value })}
                rows={2}
                placeholder="Official brand identity and design standards..."
                className="w-full text-xs p-2.5 rounded-xl border border-[#E8E6E2] bg-[#F8F7F4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF650B] text-[#252525] resize-none"
              />
            </div>

            {/* Clear-Space & Language Settings */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl border border-[#E8E6E2]">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#252525]">
                    Clear-Space Margin: {guide.clearSpacePercent}%
                  </span>
                  <span className="text-[11px] text-[#737373]">
                    Recommended exclusion zone around logos
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="10"
                  value={guide.clearSpacePercent}
                  onChange={(e) =>
                    updateGuideConfig({ clearSpacePercent: Number(e.target.value) })
                  }
                  className="w-24 accent-[#FF650B]"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#737373]">Guide Language:</span>
                <span className="text-xs font-medium text-[#252525] px-2.5 py-1 bg-[#F8F7F4] border border-[#E8E6E2] rounded-lg">
                  {guide.language}
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handlePreviewPdf}
              disabled={isPreviewing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#F8F7F4] hover:bg-[#EFECE6] border border-[#E8E6E2] text-[#252525] transition-all cursor-pointer"
            >
              {isPreviewing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin text-[#FF650B]" />
                  <span>Generating PDF Preview...</span>
                </>
              ) : (
                <>
                  <FileText className="size-3.5 text-[#FF650B]" />
                  <span>Preview Guide PDF</span>
                  <ExternalLink className="size-3 text-[#737373]" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

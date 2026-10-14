'use client'

import React from 'react'
import { FileCode, ImageIcon, FileText, CheckSquare, Square, Info } from 'lucide-react'
import { useBrandStore } from '@/stores/use-brand-store'
import { ExportFormat, ExportResolution } from '@/types/brand'

export function FormatResolutionSelector() {
  const selectedFormats = useBrandStore((state) => state.selectedFormats)
  const toggleFormat = useBrandStore((state) => state.toggleFormat)
  const selectedResolutions = useBrandStore((state) => state.selectedResolutions)
  const toggleResolution = useBrandStore((state) => state.toggleResolution)

  const DIGITAL_FORMATS: { format: ExportFormat; label: string; desc: string }[] = [
    { format: 'svg', label: 'SVG', desc: 'Vector format for infinite scaling, web, and typography' },
    { format: 'png', label: 'PNG', desc: 'Transparent & solid background master exports' },
    { format: 'jpg', label: 'JPG', desc: 'High-quality compressed opaque image exports' },
    { format: 'webp', label: 'WebP', desc: 'Modern web image format with lossless compression' },
  ]

  const PRINT_FORMATS: { format: ExportFormat; label: string; desc: string; disabled?: boolean; note?: string }[] = [
    { format: 'pdf', label: 'PDF', desc: 'Vector-preserving single logo prints & brand specifications' },
    {
      format: 'eps',
      label: 'EPS (Legacy Print)',
      desc: 'Encapsulated PostScript',
      disabled: true,
      note: 'Requires local Inkscape/Ghostscript binary. Disabled to prevent fake raster EPS output.',
    },
  ]

  const RESOLUTIONS: { res: ExportResolution; label: string }[] = [
    { res: 512, label: '512 px' },
    { res: 1024, label: '1024 px' },
    { res: 2048, label: '2048 px (HiDPI / 4K)' },
  ]

  return (
    <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-6 shadow-xs flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-[#252525]">Export Formats & Sizing</h2>
        <p className="text-xs text-[#737373] mt-0.5">
          Select digital and print output formats. All selected formats generate verified output files.
        </p>
      </div>

      {/* Digital Formats */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ImageIcon className="size-4 text-[#FF650B]" />
          <h3 className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
            Digital / RGB Formats
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DIGITAL_FORMATS.map(({ format, label, desc }) => {
            const isChecked = selectedFormats[format]
            return (
              <div
                key={format}
                onClick={() => toggleFormat(format)}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  isChecked
                    ? 'border-[#FF650B]/30 bg-[#FFF0E7]/25 hover:bg-[#FFF0E7]/40'
                    : 'border-[#E8E6E2] bg-[#F8F7F4] hover:bg-[#F2EFE9] text-[#737373]'
                }`}
              >
                <div className="pt-0.5">
                  {isChecked ? (
                    <CheckSquare className="size-4 text-[#FF650B]" />
                  ) : (
                    <Square className="size-4 text-[#A09D96]" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold ${isChecked ? 'text-[#252525]' : 'text-[#737373]'}`}>
                    {label}
                  </span>
                  <span className="text-[11px] text-[#737373] leading-tight mt-0.5">
                    {desc}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Print Formats */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="size-4 text-[#FF650B]" />
          <h3 className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
            Print & Prepress Formats
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRINT_FORMATS.map(({ format, label, desc, disabled, note }) => {
            const isChecked = selectedFormats[format]
            return (
              <div
                key={format}
                onClick={() => !disabled && toggleFormat(format)}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  disabled
                    ? 'border-[#E8E6E2] bg-[#F8F7F4]/60 opacity-60 cursor-not-allowed'
                    : isChecked
                    ? 'border-[#FF650B]/30 bg-[#FFF0E7]/25 hover:bg-[#FFF0E7]/40 cursor-pointer'
                    : 'border-[#E8E6E2] bg-[#F8F7F4] hover:bg-[#F2EFE9] cursor-pointer text-[#737373]'
                }`}
              >
                <div className="pt-0.5">
                  {isChecked ? (
                    <CheckSquare className="size-4 text-[#FF650B]" />
                  ) : (
                    <Square className="size-4 text-[#A09D96]" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold ${isChecked ? 'text-[#252525]' : 'text-[#737373]'}`}>
                    {label}
                  </span>
                  <span className="text-[11px] text-[#737373] leading-tight mt-0.5">
                    {desc}
                  </span>
                  {note && (
                    <span className="text-[10px] text-amber-700 mt-1 flex items-center gap-1">
                      <Info className="size-3 shrink-0" />
                      <span>{note}</span>
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Raster Resolutions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileCode className="size-4 text-[#FF650B]" />
          <h3 className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
            Raster Export Resolutions (PNG, JPG, WebP)
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {RESOLUTIONS.map(({ res, label }) => {
            const isChecked = selectedResolutions.includes(res)
            return (
              <button
                key={res}
                type="button"
                onClick={() => toggleResolution(res)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-[#252525] text-white border-[#252525] shadow-xs'
                    : 'bg-[#F8F7F4] text-[#737373] border-[#E8E6E2] hover:border-[#D0CDC7]'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="size-3.5 text-[#FF650B]" />
                ) : (
                  <Square className="size-3.5 text-[#A09D96]" />
                )}
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

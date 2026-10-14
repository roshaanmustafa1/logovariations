'use client'

import React, { useState, useRef } from 'react'
import { UploadCloud, Sparkles, FileWarning } from 'lucide-react'
import { useBrandStore } from '@/stores/use-brand-store'
import { validateAndSanitizeSvg } from '@/features/svg/validator'
import { LogoAsset, LogoRole } from '@/types/brand'

export function LogoUploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addAssets = useBrandStore((state) => state.addAssets)
  const loadDemo = useBrandStore((state) => state.loadDemo)
  const existingAssets = useBrandStore((state) => state.assets)

  const inferRoleFromFilename = (filename: string): LogoRole => {
    const lower = filename.toLowerCase()
    if (lower.includes('mono') || lower.includes('mark') || lower.includes('badge')) return 'monogram'
    if (lower.includes('word') || lower.includes('type')) return 'wordmark'
    if (lower.includes('icon') || lower.includes('symbol') || lower.includes('fav')) return 'icon'
    if (lower.includes('sec') || lower.includes('sub')) return 'secondary'
    if (existingAssets.some((a) => a.role === 'primary')) return 'secondary'
    return 'primary'
  }

  const processFiles = async (files: FileList | File[]) => {
    setUploadError(null)
    const newAssets: LogoAsset[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
        setUploadError(`Skipped "${file.name}": Only vector SVG files are supported.`)
        continue
      }

      try {
        const text = await file.text()
        const { sanitizedSvg, validation } = validateAndSanitizeSvg(text)

        if (!validation.isValid) {
          setUploadError(`Failed to load "${file.name}": ${validation.errors.join(', ')}`)
          continue
        }

        const role = inferRoleFromFilename(file.name)

        newAssets.push({
          id: 'asset_' + Math.random().toString(36).substring(2, 9),
          filename: file.name,
          fileSize: file.size,
          role,
          originalSvg: text,
          sanitizedSvg,
          validation,
          order: existingAssets.length + newAssets.length,
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setUploadError(`Error reading "${file.name}": ${msg}`)
      }
    }

    if (newAssets.length > 0) {
      addAssets(newAssets)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#FF650B] bg-[#FFF0E7]/40 scale-[0.99]'
            : 'border-[#E8E6E2] bg-[#FFFFFF] hover:border-[#D0CDC7] hover:bg-[#FAF9F6]'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".svg,image/svg+xml"
          multiple
          className="hidden"
        />

        <div className="size-14 rounded-2xl bg-[#FFF0E7] flex items-center justify-center mb-3.5 text-[#FF650B] shadow-2xs">
          <UploadCloud className="size-7 stroke-[2.2]" />
        </div>

        <h3 className="text-base font-semibold text-[#252525] mb-1">
          Drop your vector SVG logos here
        </h3>
        <p className="text-xs text-[#737373] max-w-sm mb-4 leading-relaxed">
          Upload primary logos, monograms, secondary marks, and symbols. We sanitize code and inspect vector paths locally.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#252525] hover:bg-[#383838] text-white transition-all shadow-xs cursor-pointer"
          >
            Browse files
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              loadDemo()
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#FFF0E7] text-[#FF650B] hover:bg-[#FFE4D4] transition-all cursor-pointer border border-[#FF650B]/20"
          >
            <Sparkles className="size-3.5" />
            <span>Try with demo logo</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
          <FileWarning className="size-4 shrink-0 text-red-500" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  )
}

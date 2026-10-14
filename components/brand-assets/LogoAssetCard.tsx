'use client'

import React, { useState } from 'react'
import {
  GripVertical,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Layers,
  Type,
  ImageIcon,
} from 'lucide-react'
import { LogoAsset, LogoRole } from '@/types/brand'
import { useBrandStore } from '@/stores/use-brand-store'

interface LogoAssetCardProps {
  asset: LogoAsset
}

const ROLE_OPTIONS: { value: LogoRole; label: string }[] = [
  { value: 'primary', label: 'Primary Logo' },
  { value: 'monogram', label: 'Monogram' },
  { value: 'secondary', label: 'Secondary Logo' },
  { value: 'wordmark', label: 'Wordmark' },
  { value: 'icon', label: 'Icon / Symbol' },
]

export function LogoAssetCard({ asset }: LogoAssetCardProps) {
  const updateAssetRole = useBrandStore((state) => state.updateAssetRole)
  const updateAssetDescription = useBrandStore((state) => state.updateAssetDescription)
  const removeAsset = useBrandStore((state) => state.removeAsset)

  const [showDescription, setShowDescription] = useState(Boolean(asset.description))

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4 transition-all hover:border-[#D8D5CF]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Drag Handle + Thumbnail + Info */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="cursor-grab text-[#B0ACA5] hover:text-[#737373] p-1 -ml-1">
            <GripVertical className="size-4" />
          </div>

          {/* Checkerboard thumbnail */}
          <div className="size-16 sm:size-20 rounded-xl checkerboard border border-[#E8E6E2] p-2 flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xs">
            <div
              className="w-full h-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: asset.sanitizedSvg }}
            />
          </div>

          {/* Details */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#252525] truncate">
                {asset.filename}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#F8F7F4] border border-[#E8E6E2] text-[#737373]">
                SVG
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#737373] mt-0.5">
              <span>{formatFileSize(asset.fileSize)}</span>
              {asset.validation.viewBox && (
                <span>• viewBox: {asset.validation.viewBox}</span>
              )}
            </div>

            {/* Quality Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {/* Vector Paths */}
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                  asset.validation.hasVectorPaths
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <Layers className="size-2.5" />
                <span>{asset.validation.hasVectorPaths ? 'Vectors' : 'No Paths'}</span>
              </span>

              {/* Transparency */}
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                  asset.validation.hasTransparency
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <CheckCircle2 className="size-2.5" />
                <span>{asset.validation.hasTransparency ? 'Transparent' : 'Opaque BG'}</span>
              </span>

              {/* Fonts / Outlines */}
              {asset.validation.hasFonts ? (
                <span
                  title="Contains live <text> elements. Ensure fonts are outlined for uniform rendering."
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                >
                  <Type className="size-2.5" />
                  <span>Live Text</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F8F7F4] text-[#737373] border border-[#E8E6E2]">
                  <Type className="size-2.5" />
                  <span>Outlined</span>
                </span>
              )}

              {/* Embedded images */}
              {asset.validation.hasEmbeddedImages && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <ImageIcon className="size-2.5" />
                  <span>Embedded Raster</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Role Selector & Delete */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8E6E2]">
          <div className="flex flex-col">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-[#737373] mb-1">
              Logo Role
            </label>
            <select
              value={asset.role}
              onChange={(e) => updateAssetRole(asset.id, e.target.value as LogoRole)}
              className="text-xs font-medium bg-[#F8F7F4] border border-[#E8E6E2] rounded-xl px-3 py-2 text-[#252525] focus:outline-none focus:ring-2 focus:ring-[#FF650B]/30 focus:border-[#FF650B] cursor-pointer"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => removeAsset(asset.id)}
            title="Remove asset"
            className="p-2 text-[#737373] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer mt-5"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Warnings & Description */}
      {asset.validation.warnings.length > 0 && (
        <div className="bg-[#FFF0E7] border border-[#FF650B]/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#823204]">
          <AlertCircle className="size-4 text-[#FF650B] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            {asset.validation.warnings.map((warn, i) => (
              <span key={i}>{warn}</span>
            ))}
          </div>
        </div>
      )}

      {/* Optional Description */}
      <div>
        {!showDescription ? (
          <button
            type="button"
            onClick={() => setShowDescription(true)}
            className="text-[11px] text-[#737373] hover:text-[#252525] font-medium transition-colors cursor-pointer"
          >
            + Add optional notes or usage description
          </button>
        ) : (
          <input
            type="text"
            value={asset.description || ''}
            onChange={(e) => updateAssetDescription(asset.id, e.target.value)}
            placeholder="e.g. Primary horizontal lockup for website headers and letterheads"
            className="w-full text-xs px-3 py-2 bg-[#F8F7F4] border border-[#E8E6E2] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF650B] text-[#252525]"
          />
        )}
      </div>
    </div>
  )
}

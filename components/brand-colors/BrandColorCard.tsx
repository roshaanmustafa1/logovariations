'use client'

import React, { useState } from 'react'
import { Copy, Trash2, ChevronDown, ChevronUp, Pipette } from 'lucide-react'
import { BrandColor } from '@/types/brand'
import { isValidHex, normalizeHex } from '@/features/colors/converters'
import { useBrandStore } from '@/stores/use-brand-store'

interface BrandColorCardProps {
  color: BrandColor
}

export function BrandColorCard({ color }: BrandColorCardProps) {
  const updateColor = useBrandStore((state) => state.updateColor)
  const removeColor = useBrandStore((state) => state.removeColor)
  const duplicateColor = useBrandStore((state) => state.duplicateColor)

  const [isExpanded, setIsExpanded] = useState(false)
  const [localHex, setLocalHex] = useState(color.hex)

  const handleHexChange = (val: string) => {
    setLocalHex(val)
    if (isValidHex(val)) {
      updateColor(color.id, { hex: normalizeHex(val) })
    }
  }

  const handleBlurHex = () => {
    if (isValidHex(localHex)) {
      const normalized = normalizeHex(localHex)
      setLocalHex(normalized)
      updateColor(color.id, { hex: normalized })
    } else {
      setLocalHex(color.hex)
    }
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3 transition-all hover:border-[#D8D5CF]">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Swatch + Color Picker + Name */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="relative group size-12 rounded-xl border border-black/10 shrink-0 shadow-2xs overflow-hidden flex items-center justify-center cursor-pointer">
            <div
              className="w-full h-full"
              style={{ backgroundColor: color.hex }}
            />
            {/* Native HTML5 color input overlay */}
            <input
              type="color"
              value={color.hex}
              onChange={(e) => handleHexChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Click to pick color"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white pointer-events-none">
              <Pipette className="size-3.5" />
            </div>
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <input
              type="text"
              value={color.name}
              onChange={(e) => updateColor(color.id, { name: e.target.value })}
              placeholder="Color name"
              className="text-sm font-semibold text-[#252525] bg-transparent border-b border-transparent hover:border-[#E8E6E2] focus:border-[#FF650B] focus:outline-none px-0.5 py-0.5 transition-colors"
            />
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-mono text-[#737373]">HEX:</span>
                <input
                  type="text"
                  value={localHex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  onBlur={handleBlurHex}
                  maxLength={7}
                  className="text-xs font-mono font-medium text-[#252525] w-20 px-1.5 py-0.5 rounded bg-[#F8F7F4] border border-[#E8E6E2] focus:bg-white focus:outline-none focus:border-[#FF650B]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 text-[#737373]">
          <button
            type="button"
            onClick={() => duplicateColor(color.id)}
            title="Duplicate color"
            className="p-2 hover:text-[#252525] hover:bg-[#F8F7F4] rounded-xl transition-colors cursor-pointer"
          >
            <Copy className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => removeColor(color.id)}
            title="Delete color"
            className="p-2 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand specifications'}
            className="p-2 hover:text-[#252525] hover:bg-[#F8F7F4] rounded-xl transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {/* Expanded specifications: RGB and CMYK estimation */}
      {isExpanded && (
        <div className="pt-3 mt-1 border-t border-[#E8E6E2] grid grid-cols-2 gap-3 text-xs">
          <div className="bg-[#F8F7F4] p-2.5 rounded-xl border border-[#E8E6E2]">
            <span className="text-[10px] font-semibold uppercase text-[#737373] tracking-wider block mb-1">
              RGB (Screen)
            </span>
            <div className="font-mono text-[#252525] font-medium">
              R: {color.rgb.r}  G: {color.rgb.g}  B: {color.rgb.b}
            </div>
          </div>

          <div className="bg-[#F8F7F4] p-2.5 rounded-xl border border-[#E8E6E2]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold uppercase text-[#737373] tracking-wider">
                CMYK (Print Estimate)
              </span>
              <span className="text-[9px] text-[#A09D96]">est.</span>
            </div>
            <div className="font-mono text-[#252525] font-medium">
              C:{color.cmyk.c}% M:{color.cmyk.m}% Y:{color.cmyk.y}% K:{color.cmyk.k}%
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

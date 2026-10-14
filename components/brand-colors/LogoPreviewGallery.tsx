'use client'

import React, { useState, useMemo } from 'react'
import { Eye } from 'lucide-react'
import { useBrandStore } from '@/stores/use-brand-store'
import { recolorSvg } from '@/features/svg/recolor'

type BgTheme = 'checkerboard' | 'white' | 'dark'

export function LogoPreviewGallery() {
  const assets = useBrandStore((state) => state.assets)
  const colors = useBrandStore((state) => state.colors)
  const enableBlackAndWhite = useBrandStore((state) => state.enableBlackAndWhite)
  const enableOriginalMulticolor = useBrandStore((state) => state.enableOriginalMulticolor)

  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '')
  const [bgTheme, setBgTheme] = useState<BgTheme>('checkerboard')

  // Keep selected asset valid
  const currentAsset = assets.find((a) => a.id === selectedAssetId) || assets[0]

  // Compute all available color variations
  const variants = useMemo(() => {
    if (!currentAsset) return []
    const list: Array<{ id: string; label: string; svg: string; hex?: string }> = []

    if (enableOriginalMulticolor) {
      list.push({
        id: 'original',
        label: 'Original Artwork',
        svg: currentAsset.sanitizedSvg,
      })
    }

    if (enableBlackAndWhite) {
      list.push({
        id: 'black',
        label: 'Solid Black',
        hex: '#000000',
        svg: recolorSvg(currentAsset.sanitizedSvg, { mode: 'black' }),
      })
      list.push({
        id: 'white',
        label: 'Solid White',
        hex: '#FFFFFF',
        svg: recolorSvg(currentAsset.sanitizedSvg, { mode: 'white' }),
      })
    }

    colors.forEach((col) => {
      list.push({
        id: col.id,
        label: col.name,
        hex: col.hex,
        svg: recolorSvg(currentAsset.sanitizedSvg, {
          mode: 'custom',
          customColorHex: col.hex,
        }),
      })
    })

    return list
  }, [currentAsset, colors, enableBlackAndWhite, enableOriginalMulticolor])

  if (!currentAsset) return null

  return (
    <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-6 shadow-xs flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="size-4 text-[#FF650B]" />
          <h3 className="text-sm font-semibold text-[#252525]">Live Variation Previews</h3>
        </div>

        {/* Controls: Asset selector & Background toggle */}
        <div className="flex items-center gap-3">
          {assets.length > 1 && (
            <select
              value={currentAsset.id}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="text-xs font-medium bg-[#F8F7F4] border border-[#E8E6E2] rounded-xl px-2.5 py-1.5 text-[#252525] focus:outline-none focus:border-[#FF650B]"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.filename} ({a.role})
                </option>
              ))}
            </select>
          )}

          {/* Background pills */}
          <div className="inline-flex items-center p-1 bg-[#F8F7F4] border border-[#E8E6E2] rounded-xl gap-1 text-xs">
            <button
              type="button"
              onClick={() => setBgTheme('checkerboard')}
              className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                bgTheme === 'checkerboard' ? 'bg-white shadow-2xs text-[#252525]' : 'text-[#737373]'
              }`}
            >
              Transparent
            </button>
            <button
              type="button"
              onClick={() => setBgTheme('white')}
              className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                bgTheme === 'white' ? 'bg-white shadow-2xs text-[#252525]' : 'text-[#737373]'
              }`}
            >
              White
            </button>
            <button
              type="button"
              onClick={() => setBgTheme('dark')}
              className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                bgTheme === 'dark' ? 'bg-[#1C1C1A] text-white shadow-2xs' : 'text-[#737373]'
              }`}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* Grid of variations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {variants.map((v) => (
          <div
            key={v.id}
            className="border border-[#E8E6E2] rounded-xl overflow-hidden flex flex-col bg-[#FFFFFF]"
          >
            {/* Variation stage */}
            <div
              className={`h-40 p-4 flex items-center justify-center relative transition-colors ${
                bgTheme === 'checkerboard'
                  ? 'checkerboard'
                  : bgTheme === 'white'
                  ? 'bg-[#FFFFFF]'
                  : 'bg-[#141413]'
              }`}
            >
              <div
                className="w-full h-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:h-auto drop-shadow-2xs"
                dangerouslySetInnerHTML={{ __html: v.svg }}
              />
            </div>

            {/* Variation footer */}
            <div className="p-3 bg-[#F8F7F4] border-t border-[#E8E6E2] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#252525]">{v.label}</span>
              {v.hex && (
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#737373]">
                  <span
                    className="size-2.5 rounded-full border border-black/10"
                    style={{ backgroundColor: v.hex }}
                  />
                  <span>{v.hex}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import { ArrowLeft, ArrowRight, Plus, Palette, Sparkles } from 'lucide-react'
import { useBrandStore } from '@/stores/use-brand-store'
import { BrandColorCard } from './BrandColorCard'
import { LogoPreviewGallery } from './LogoPreviewGallery'
import { DEMO_PALETTE } from '@/lib/demo-asset'

export function BrandColorsStep() {
  const colors = useBrandStore((state) => state.colors)
  const addColor = useBrandStore((state) => state.addColor)
  const enableBlackAndWhite = useBrandStore((state) => state.enableBlackAndWhite)
  const setEnableBlackAndWhite = useBrandStore((state) => state.setEnableBlackAndWhite)
  const enableOriginalMulticolor = useBrandStore((state) => state.enableOriginalMulticolor)
  const setEnableOriginalMulticolor = useBrandStore((state) => state.setEnableOriginalMulticolor)
  const setCurrentStep = useBrandStore((state) => state.setCurrentStep)

  const handleAddDefaultColor = () => {
    addColor()
  }

  const handleLoadDemoPalette = () => {
    DEMO_PALETTE.forEach((c) => {
      if (!colors.some((existing) => existing.hex.toLowerCase() === c.hex.toLowerCase())) {
        addColor(c.name, c.hex)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#252525] tracking-tight">
          Brand Colors
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-1 leading-relaxed">
          Define brand colors that will be used to generate different logo versions and background combinations.
        </p>
      </div>

      {/* Global Logo Version Switches */}
      <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-[#252525]">Core Variation Controls</h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F8F7F4] border border-[#E8E6E2]">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-[#252525]">
              Black & White logo versions
            </span>
            <span className="text-xs text-[#737373]">
              Generate solid monochrome black and reverse white vector & raster versions
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={enableBlackAndWhite}
              onChange={(e) => setEnableBlackAndWhite(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#E8E6E2] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF650B]"></div>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F8F7F4] border border-[#E8E6E2]">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-[#252525]">
              Original (multicolor) logo
            </span>
            <span className="text-xs text-[#737373]">
              Preserve original artwork and its authentic original colors
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={enableOriginalMulticolor}
              onChange={(e) => setEnableOriginalMulticolor(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#E8E6E2] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF650B]"></div>
          </label>
        </div>
      </div>

      {/* Brand Colors List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-[#FF650B]" />
            <h2 className="text-sm font-semibold text-[#252525]">
              Custom Brand Colors ({colors.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {colors.length === 0 && (
              <button
                type="button"
                onClick={handleLoadDemoPalette}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FF650B] bg-[#FFF0E7] hover:bg-[#FFE4D4] border border-[#FF650B]/20 rounded-xl transition-all cursor-pointer"
              >
                <Sparkles className="size-3.5" />
                <span>Load Demo Palette</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAddDefaultColor}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#252525] hover:bg-[#383838] rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span>Add Color</span>
            </button>
          </div>
        </div>

        {colors.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-8 text-center flex flex-col items-center justify-center">
            <p className="text-xs text-[#737373] max-w-sm mb-4">
              No custom brand colors defined yet. Add colors to generate monochrome brand variants and contrasting background files.
            </p>
            <button
              type="button"
              onClick={handleAddDefaultColor}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#FF650B] hover:bg-[#E85A08] rounded-xl transition-all cursor-pointer"
            >
              Add First Brand Color
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {colors.map((color) => (
              <BrandColorCard key={color.id} color={color} />
            ))}
          </div>
        )}
      </div>

      {/* Live Preview Gallery */}
      <LogoPreviewGallery />

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E8E6E2]">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#252525] bg-[#FFFFFF] hover:bg-[#F8F7F4] border border-[#E8E6E2] transition-all cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Assets</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#FF650B] hover:bg-[#E85A08] text-white transition-all shadow-xs cursor-pointer active:scale-[0.99]"
        >
          <span>Continue to Export Studio</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

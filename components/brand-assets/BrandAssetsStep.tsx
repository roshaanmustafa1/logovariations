'use client'

import React from 'react'
import { ArrowRight, AlertCircle } from 'lucide-react'
import { useBrandStore } from '@/stores/use-brand-store'
import { BrandNameInput } from './BrandNameInput'
import { LogoUploadZone } from './LogoUploadZone'
import { LogoAssetCard } from './LogoAssetCard'

export function BrandAssetsStep() {
  const brandName = useBrandStore((state) => state.brandName)
  const assets = useBrandStore((state) => state.assets)
  const setCurrentStep = useBrandStore((state) => state.setCurrentStep)

  const canContinue = Boolean(brandName.trim() && assets.length > 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Step Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#252525] tracking-tight">
          Brand & Assets
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-1 leading-relaxed">
          Set your brand name and upload the original SVG vector files. We analyze your vectors and prepare them for color variations.
        </p>
      </div>

      {/* Brand Name Input */}
      <BrandNameInput />

      {/* SVG Upload Area */}
      <LogoUploadZone />

      {/* Uploaded Assets List */}
      {assets.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#252525]">
              Uploaded Logos ({assets.length})
            </h2>
            <span className="text-xs text-[#737373]">
              Assign roles to organize folders in the export pack
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {assets.map((asset) => (
              <LogoAssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Step 1 Bottom Navigation Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E8E6E2]">
        <div className="text-xs text-[#737373]">
          {!canContinue && (
            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              <AlertCircle className="size-3.5" />
              <span>
                {!brandName.trim()
                  ? 'Please enter a brand name'
                  : 'Upload at least one SVG logo to continue'}
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => canContinue && setCurrentStep(2)}
          disabled={!canContinue}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs ${
            canContinue
              ? 'bg-[#FF650B] hover:bg-[#E85A08] text-white cursor-pointer active:scale-[0.99]'
              : 'bg-[#E8E6E2] text-[#A09D96] cursor-not-allowed'
          }`}
        >
          <span>Continue to Colors</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

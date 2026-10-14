'use client'

import React, { useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { StepNavigation } from '@/components/layout/StepNavigation'
import { BrandSummary } from '@/components/layout/BrandSummary'
import { BrandAssetsStep } from '@/components/brand-assets/BrandAssetsStep'
import { BrandColorsStep } from '@/components/brand-colors/BrandColorsStep'
import { ExportStudioStep } from '@/components/export-studio/ExportStudioStep'
import { useBrandStore } from '@/stores/use-brand-store'

export default function Page() {
  const currentStep = useBrandStore((state) => state.currentStep)
  const isInitialized = useBrandStore((state) => state.isInitialized)
  const initStore = useBrandStore((state) => state.initStore)

  useEffect(() => {
    initStore()
  }, [initStore])

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-[#FF650B] border-t-transparent animate-spin" />
          <span className="text-xs font-medium text-[#737373]">
            Loading LogoPack Studio...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4]">
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pb-16 flex-1 flex flex-col">
        {/* Step Progress Pill Bar */}
        <StepNavigation />

        {/* Two-Column Responsive Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-8 mt-2">
          {/* Main Content Area (~68%) */}
          <section className="w-full lg:w-[68%] min-w-0 flex flex-col">
            {currentStep === 1 && <BrandAssetsStep />}
            {currentStep === 2 && <BrandColorsStep />}
            {currentStep === 3 && <ExportStudioStep />}
          </section>

          {/* Shared Sidebar (~32%) */}
          <aside className="w-full lg:w-[32%] shrink-0 lg:sticky lg:top-24">
            <BrandSummary />
          </aside>
        </div>
      </main>
    </div>
  )
}

'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { useBrandStore } from '@/stores/use-brand-store'

interface Step {
  id: number
  title: string
  label: string
}

const STEPS: Step[] = [
  { id: 1, title: 'Step 1', label: 'Brand & Assets' },
  { id: 2, title: 'Step 2', label: 'Colors' },
  { id: 3, title: 'Step 3', label: 'Export' },
]

export function StepNavigation() {
  const currentStep = useBrandStore((state) => state.currentStep)
  const setCurrentStep = useBrandStore((state) => state.setCurrentStep)
  const brandName = useBrandStore((state) => state.brandName)
  const assets = useBrandStore((state) => state.assets)
  const colors = useBrandStore((state) => state.colors)

  // Validation rules for step completion
  const isStep1Complete = Boolean(brandName.trim() && assets.length > 0)
  const isStep2Complete = isStep1Complete && (colors.length > 0 || true)

  const canNavigateToStep = (stepId: number) => {
    if (stepId === 1) return true
    if (stepId === 2) return isStep1Complete
    if (stepId === 3) return isStep1Complete
    return false
  }

  return (
    <div className="w-full flex items-center justify-center my-6">
      <div className="inline-flex items-center gap-1.5 p-1.5 bg-[#FFFFFF] border border-[#E8E6E2] rounded-full shadow-xs">
        {STEPS.map((step, idx) => {
          const isActive = currentStep === step.id
          const isCompleted =
            (step.id === 1 && isStep1Complete && currentStep > 1) ||
            (step.id === 2 && isStep2Complete && currentStep > 2)
          const isClickable = canNavigateToStep(step.id)

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => isClickable && setCurrentStep(step.id)}
                disabled={!isClickable}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#FF650B] text-white shadow-xs'
                    : isCompleted
                    ? 'text-[#252525] hover:bg-[#F8F7F4] cursor-pointer'
                    : isClickable
                    ? 'text-[#737373] hover:text-[#252525] hover:bg-[#F8F7F4] cursor-pointer'
                    : 'text-[#B0ACA5] cursor-not-allowed opacity-60'
                }`}
              >
                <span
                  className={`size-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isCompleted
                      ? 'bg-[#EFECE6] text-[#252525]'
                      : 'bg-[#F4F2EE] text-[#737373]'
                  }`}
                >
                  {isCompleted ? <Check className="size-3 stroke-[3]" /> : step.id}
                </span>
                <span>{step.label}</span>
              </button>

              {idx < STEPS.length - 1 && (
                <div className="w-4 h-[1px] bg-[#E8E6E2] hidden sm:block" />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

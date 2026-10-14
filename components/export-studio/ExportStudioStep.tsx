'use client'

import React, { useState, useMemo } from 'react'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import { useBrandStore } from '@/stores/use-brand-store'
import { buildExportPlan } from '@/features/export/planner'
import { generateAssetPackZip } from '@/features/export/zip-builder'
import { ExportOverviewCards } from './ExportOverviewCards'
import { FormatResolutionSelector } from './FormatResolutionSelector'
import { IconsAvatarsSection } from './IconsAvatarsSection'
import { BrandGuideSection } from './BrandGuideSection'
import { ZipFolderTree } from './ZipFolderTree'
import { ExportProgressModal } from './ExportProgressModal'

export function ExportStudioStep() {
  const brandName = useBrandStore((state) => state.brandName)
  const slug = useBrandStore((state) => state.slug)
  const assets = useBrandStore((state) => state.assets)
  const colors = useBrandStore((state) => state.colors)
  const enableBlackAndWhite = useBrandStore((state) => state.enableBlackAndWhite)
  const enableOriginalMulticolor = useBrandStore((state) => state.enableOriginalMulticolor)
  const selectedFormats = useBrandStore((state) => state.selectedFormats)
  const selectedResolutions = useBrandStore((state) => state.selectedResolutions)
  const icons = useBrandStore((state) => state.icons)
  const guide = useBrandStore((state) => state.guide)
  const setCurrentStep = useBrandStore((state) => state.setCurrentStep)
  const getProjectData = useBrandStore((state) => state.getProjectData)

  // Progress modal state
  const [isGenerating, setIsGenerating] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [progressStage, setProgressStage] = useState('')
  const [progressPercent, setProgressPercent] = useState(0)
  const [currentFile, setCurrentFile] = useState<string | undefined>()
  const [isComplete, setIsComplete] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [lastBlob, setLastBlob] = useState<Blob | null>(null)

  // Build the deterministic plan
  const plan = useMemo(() => {
    return buildExportPlan({
      brandName,
      assets,
      colors,
      enableBlackAndWhite,
      enableOriginalMulticolor,
      selectedFormats,
      selectedResolutions,
      icons,
      guide,
    })
  }, [
    brandName,
    assets,
    colors,
    enableBlackAndWhite,
    enableOriginalMulticolor,
    selectedFormats,
    selectedResolutions,
    icons,
    guide,
  ])

  const triggerDownload = (blob: Blob) => {
    const filename = `${slug || 'brand'}_Logo_Asset_Pack.zip`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleGenerateZip = async () => {
    setModalOpen(true)
    setIsGenerating(true)
    setIsComplete(false)
    setExportError(null)
    setProgressPercent(0)
    setProgressStage('Initializing export pipeline...')
    setCurrentFile(undefined)

    try {
      const projectData = getProjectData()
      const zipBlob = await generateAssetPackZip(projectData, plan, (update) => {
        setProgressPercent(update.percent)
        setProgressStage(update.stage)
        setCurrentFile(update.currentFile)
      })

      setLastBlob(zipBlob)
      setIsComplete(true)
      setIsGenerating(false)
      triggerDownload(zipBlob)
    } catch (err: unknown) {
      console.error('Export failed:', err)
      setIsGenerating(false)
      const msg = err instanceof Error ? err.message : 'An error occurred during ZIP creation.'
      setExportError(msg)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#252525] tracking-tight">
          Ready to generate
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-1 leading-relaxed">
          Configure digital and print formats, inspect the planned folder hierarchy, and download your complete brand package.
        </p>
      </div>

      {/* Dynamic Overview Cards */}
      <ExportOverviewCards plan={plan} />

      {/* Format & Resolution Configuration */}
      <FormatResolutionSelector />

      {/* Icons & Avatars Configuration */}
      <IconsAvatarsSection />

      {/* Brand Identity Guide PDF */}
      <BrandGuideSection />

      {/* Interactive Collapsible ZIP File Tree */}
      <ZipFolderTree rootNode={plan.tree} totalFiles={plan.totalFiles} />

      {/* Bottom Navigation & Prominent Generate Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E8E6E2]">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#252525] bg-[#FFFFFF] hover:bg-[#F8F7F4] border border-[#E8E6E2] transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Colors</span>
        </button>

        <button
          type="button"
          onClick={handleGenerateZip}
          disabled={isGenerating || assets.length === 0}
          className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold bg-[#FF650B] hover:bg-[#E85A08] text-white transition-all shadow-md shadow-[#FF650B]/20 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-4.5 animate-spin" />
              <span>Building Package ({progressPercent}%)...</span>
            </>
          ) : (
            <>
              <Download className="size-4.5" />
              <span>Generate & Download ZIP</span>
            </>
          )}
        </button>
      </div>

      {/* Progress & Feedback Modal */}
      <ExportProgressModal
        isOpen={modalOpen}
        stage={progressStage}
        percent={progressPercent}
        currentFile={currentFile}
        isComplete={isComplete}
        error={exportError}
        onDownloadAgain={() => lastBlob && triggerDownload(lastBlob)}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import {
  Upload,
  Download,
  Trash2,
  Sparkles,
  RefreshCw,
  CheckCircle,
} from 'lucide-react'

export default function RemoveBgPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [processingStatus, setProcessingStatus] = useState('Preparing AI foreground detection...')
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [previewBg, setPreviewBg] = useState<'checker' | 'dark' | 'light' | 'brand'>('checker')
  const [viewMode, setViewMode] = useState<'processed' | 'original'>('processed')
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const processingJobRef = useRef(0)

  const processImage = useCallback(
    (file: File) => {
      const jobId = processingJobRef.current + 1
      processingJobRef.current = jobId
      setIsProcessing(true)
      setProcessingError(null)
      setProcessingStatus('Loading AI model...')

      import('@imgly/background-removal').then(({ removeBackground }) =>
          removeBackground(file, {
            publicPath: new URL('/background-removal-assets/', window.location.origin).href,
            device: 'cpu',
            model: 'isnet',
            output: { format: 'image/png', quality: 1 },
            progress: (step, current, total) => {
              if (jobId !== processingJobRef.current) return
              const progress = total ? Math.round((current / total) * 100) : 0
              setProcessingStatus(step.startsWith('fetch') ? `Downloading AI model... ${progress}%` : 'Detecting foreground...')
            },
          })
        )
        .then((blob) => {
          if (jobId !== processingJobRef.current) return

          setProcessedUrl((previousUrl) => {
            if (previousUrl) URL.revokeObjectURL(previousUrl)
            return URL.createObjectURL(blob)
          })
          setProcessingStatus('Foreground detected.')
          setIsProcessing(false)
        })
        .catch((error: unknown) => {
          if (jobId !== processingJobRef.current) return

          const reason = error instanceof Error ? error.message : ''
          const message = /fetch|network|resource metadata|resource .*not found/i.test(reason)
            ? 'Could not download the AI model or runtime. Check your connection and restart the app server after updating its configuration, then retry.'
            : reason || 'AI background removal could not process this image.'
          setProcessingError(message)
          setIsProcessing(false)
        })
    },
    []
  )

  // Upload handler
  const handleFile = (file: File) => {
    const supportedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!supportedTypes.includes(file.type)) {
      setProcessingError('Please upload a PNG, JPG, JPEG, or WEBP image.')
      return
    }
    setProcessingError(null)
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setOriginalUrl(url)

    const img = new Image()
    img.src = url
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight })
      processImage(file)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      setImageFile(null)
      setOriginalUrl(null)
      setDimensions(null)
      setProcessingError('This image could not be read. Please choose another PNG, JPG, or WEBP file.')
    }
  }

  // Download Exact Resolution PNG
  const handleDownload = () => {
    if (!processedUrl) return
    const link = document.createElement('a')
    link.href = processedUrl
    const originalName = imageFile?.name.replace(/\.[^/.]+$/, '') || 'image'
    const dims = dimensions ? `-${dimensions.width}x${dimensions.height}` : ''
    link.download = `${originalName}-transparent${dims}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleReset = () => {
    processingJobRef.current += 1
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    if (processedUrl) URL.revokeObjectURL(processedUrl)
    setImageFile(null)
    setOriginalUrl(null)
    setProcessedUrl(null)
    setDimensions(null)
    setProcessingError(null)
    setIsProcessing(false)
    setProcessingStatus('Preparing AI foreground detection...')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#252525]">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col space-y-6">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E6E2] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="size-2 rounded-full bg-[#FF650B]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF650B]">
                LogoPack Studio &bull; Utility
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252525]">
              Background Remover
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] mt-0.5">
              AI-powered foreground detection for people, products, logos, and artwork at original export resolution.
            </p>
          </div>

          {processedUrl && dimensions && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>Upload New</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#FF650B] hover:bg-[#E55705] disabled:cursor-not-allowed disabled:opacity-60 text-white shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="size-4" />
                <span>Download High-Res PNG ({dimensions.width} &times; {dimensions.height})</span>
              </button>
            </div>
          )}
        </div>

        {processingError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
            {processingError}
          </div>
        )}

        {/* Upload State */}
        {!originalUrl && (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              if (e.dataTransfer.files?.[0]) {
                handleFile(e.dataTransfer.files[0])
              }
            }}
            className={`bg-white rounded-3xl border-2 border-dashed p-12 sm:p-16 text-center transition-all shadow-xs my-auto ${
              isDragging
                ? 'border-[#FF650B] bg-[#FFF0E7]/30 scale-[1.01]'
                : 'border-[#E8E6E2] hover:border-[#FF650B]/60'
            }`}
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              id="file-upload"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0])
              }}
            />
            <label htmlFor="file-upload" className="cursor-pointer block space-y-4">
              <div className="size-16 rounded-2xl bg-[#FFF0E7] text-[#FF650B] flex items-center justify-center mx-auto shadow-xs">
                <Upload className="size-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base sm:text-lg font-bold text-[#252525]">
                  Drag and drop your logo or image here, or <span className="text-[#FF650B] underline">browse</span>
                </p>
                <p className="text-xs text-[#737373]">
                  Supports PNG, JPG, JPEG, WEBP. No downscaling &bull; 100% lossless output.
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Workspace when Image is loaded */}
        {originalUrl && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
            {/* Preview Box (8 Cols) */}
            <div className="lg:col-span-8 space-y-3">
              <div className="bg-white rounded-2xl border border-[#E8E6E2] p-4 sm:p-5 shadow-xs">
                {/* Preview Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-[#E8E6E2]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('processed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        viewMode === 'processed'
                          ? 'bg-[#FF650B] text-white shadow-xs'
                          : 'bg-[#F8F7F4] text-[#737373] hover:text-[#252525] hover:bg-[#E8E6E2]'
                      }`}
                    >
                      Transparent Output
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('original')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        viewMode === 'original'
                          ? 'bg-[#FF650B] text-white shadow-xs'
                          : 'bg-[#F8F7F4] text-[#737373] hover:text-[#252525] hover:bg-[#E8E6E2]'
                      }`}
                    >
                      Original
                    </button>
                  </div>

                  {/* Backdrop Preview Switcher */}
                  <div className="flex items-center gap-1.5 bg-[#F8F7F4] p-1 rounded-lg border border-[#E8E6E2]">
                    <span className="text-[11px] text-[#737373] font-medium px-2">Backdrop:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewBg('checker')}
                      className={`size-6 rounded border cursor-pointer ${
                        previewBg === 'checker' ? 'ring-2 ring-[#FF650B]' : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundImage:
                          'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                        backgroundSize: '8px 8px',
                        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                      }}
                      title="Checkerboard"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewBg('dark')}
                      className={`size-6 rounded bg-[#171717] border border-[#333] cursor-pointer ${
                        previewBg === 'dark' ? 'ring-2 ring-[#FF650B]' : 'opacity-60 hover:opacity-100'
                      }`}
                      title="Dark Preview"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewBg('light')}
                      className={`size-6 rounded bg-white border border-[#ccc] cursor-pointer ${
                        previewBg === 'light' ? 'ring-2 ring-[#FF650B]' : 'opacity-60 hover:opacity-100'
                      }`}
                      title="Light Preview"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewBg('brand')}
                      className={`size-6 rounded bg-[#FF650B] border border-[#FF650B] cursor-pointer ${
                        previewBg === 'brand' ? 'ring-2 ring-[#252525]' : 'opacity-60 hover:opacity-100'
                      }`}
                      title="Brand Orange Preview"
                    />
                  </div>
                </div>

                {/* Canvas / Image Display Frame */}
                <div
                  className={`relative min-h-[380px] sm:min-h-[460px] max-h-[620px] rounded-xl flex items-center justify-center p-4 overflow-hidden border border-[#E8E6E2] transition-colors ${
                    previewBg === 'dark'
                      ? 'bg-[#171717]'
                      : previewBg === 'light'
                      ? 'bg-white'
                      : previewBg === 'brand'
                      ? 'bg-[#FF650B]'
                      : 'bg-[#fafafa]'
                  }`}
                  style={
                    previewBg === 'checker'
                      ? {
                          backgroundImage:
                            'linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)',
                          backgroundSize: '16px 16px',
                          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                        }
                      : {}
                  }
                >
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
                      <div className="flex items-center gap-2 bg-[#252525] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg">
                        <RefreshCw className="size-3.5 animate-spin text-[#FF650B]" />
                        <span>{processingStatus}</span>
                      </div>
                    </div>
                  )}

                  {/* Image Display */}
                  <img
                    src={viewMode === 'processed' ? processedUrl || originalUrl : originalUrl}
                    alt="Preview"
                    className="max-h-[540px] max-w-full object-contain select-none"
                  />
                </div>

                {/* Image Details Bar */}
                {dimensions && (
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-[#737373] mt-3 pt-3 border-t border-[#E8E6E2]">
                    <span className="font-mono">
                      Dimensions: <strong className="text-[#252525]">{dimensions.width} &times; {dimensions.height} px</strong>
                    </span>
                    <span>
                      File: <strong className="text-[#252525]">{imageFile?.name}</strong> ({(imageFile!.size / 1024).toFixed(1)} KB)
                    </span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="size-3" />
                      <span>100% Lossless Full-Res PNG</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Controls Sidebar (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl border border-[#E8E6E2] p-5 shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#E8E6E2]">
                  <Sparkles className="size-4 text-[#FF650B]" />
                  <h3 className="text-sm font-bold text-[#252525]">AI Foreground Detection</h3>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#252525]">Subject-aware transparent background</p>
                  <p className="text-[11px] leading-relaxed text-[#737373]">
                    The AI identifies the foreground person or object instead of matching a background color. The first image may take longer while the model downloads and caches.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => imageFile && processImage(imageFile)}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FFF0E7] hover:bg-[#FFE4D4] disabled:cursor-not-allowed disabled:opacity-60 text-[#FF650B] text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-[#FF650B]/20 cursor-pointer"
                >
                  <RefreshCw className="size-3.5" />
                  <span>Reprocess with AI</span>
                </button>

                {/* Download CTA */}
                <div className="pt-3 border-t border-[#E8E6E2]">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!processedUrl || isProcessing}
                    className="w-full py-3 rounded-xl bg-[#FF650B] hover:bg-[#E55705] disabled:cursor-not-allowed disabled:opacity-60 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="size-4" />
                    <span>Download High-Res PNG</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

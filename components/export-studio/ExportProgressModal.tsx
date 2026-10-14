'use client'

import React from 'react'
import { Loader2, CheckCircle2, AlertTriangle, Download, X } from 'lucide-react'

interface ExportProgressModalProps {
  isOpen: boolean
  stage: string
  percent: number
  currentFile?: string
  isComplete: boolean
  error?: string | null
  onDownloadAgain?: () => void
  onClose: () => void
}

export function ExportProgressModal({
  isOpen,
  stage,
  percent,
  currentFile,
  isComplete,
  error,
  onDownloadAgain,
  onClose,
}: ExportProgressModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isComplete ? (
              <div className="size-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="size-5" />
              </div>
            ) : error ? (
              <div className="size-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="size-5" />
              </div>
            ) : (
              <div className="size-9 rounded-full bg-[#FFF0E7] text-[#FF650B] flex items-center justify-center">
                <Loader2 className="size-5 animate-spin" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-[#252525]">
                {isComplete
                  ? 'Brand Pack Generated!'
                  : error
                  ? 'Generation Encountered An Issue'
                  : 'Generating Brand Asset Pack'}
              </h3>
              <p className="text-xs text-[#737373]">
                {isComplete
                  ? 'Your ZIP archive is ready and downloaded.'
                  : error
                  ? error
                  : stage}
              </p>
            </div>
          </div>

          {(isComplete || error) && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#737373] hover:text-[#252525] rounded-lg transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="w-full h-3 bg-[#F8F7F4] border border-[#E8E6E2] rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isComplete
                  ? 'bg-emerald-500'
                  : error
                  ? 'bg-red-500'
                  : 'bg-[#FF650B]'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#737373] font-mono">
            <span>{percent}%</span>
            {currentFile && (
              <span className="truncate max-w-[200px] text-[#A09D96]">
                {currentFile}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E8E6E2]">
          {isComplete && onDownloadAgain && (
            <button
              type="button"
              onClick={onDownloadAgain}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#252525] text-white hover:bg-[#383838] transition-all cursor-pointer"
            >
              <Download className="size-3.5" />
              <span>Download Again</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isComplete
                ? 'bg-[#FF650B] text-white hover:bg-[#E85A08]'
                : 'bg-[#F8F7F4] text-[#252525] border border-[#E8E6E2] hover:bg-[#EFECE6]'
            }`}
          >
            {isComplete ? 'Done' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  )
}

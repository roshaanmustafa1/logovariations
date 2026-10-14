'use client'

import React, { useRef } from 'react'
import {
  FolderArchive,
  Palette,
  FileCheck2,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  StickyNote,
} from 'lucide-react'
import { useBrandStore } from '@/stores/use-brand-store'
import { exportProjectToJson } from '@/lib/storage/project-db'
import { ProjectData } from '@/types/brand'

export function BrandSummary() {
  const brandName = useBrandStore((state) => state.brandName)
  const slug = useBrandStore((state) => state.slug)
  const assets = useBrandStore((state) => state.assets)
  const colors = useBrandStore((state) => state.colors)
  const isSaving = useBrandStore((state) => state.isSaving)
  const projectNotes = useBrandStore((state) => state.projectNotes)
  const setProjectNotes = useBrandStore((state) => state.setProjectNotes)
  const getProjectData = useBrandStore((state) => state.getProjectData)
  const importProject = useBrandStore((state) => state.importProject)
  const resetProject = useBrandStore((state) => state.resetProject)
  const loadDemo = useBrandStore((state) => state.loadDemo)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportJson = () => {
    const data = getProjectData()
    exportProjectToJson(data)
  }

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string) as ProjectData
        if (json && (json.brandName || json.assets)) {
          await importProject(json)
        }
      } catch {
        alert('Invalid JSON project backup file.')
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset this project? All unsaved changes will be cleared.')) {
      await resetProject()
    }
  }

  return (
    <aside className="w-full flex flex-col gap-5">
      {/* Brand Summary Card */}
      <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E6E2]">
          <h2 className="text-base font-semibold text-[#252525]">Brand Summary</h2>
          <div className="flex items-center gap-1.5 text-xs text-[#737373]">
            <span
              className={`size-2 rounded-full ${
                isSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span>{isSaving ? 'Saving...' : 'Saved locally'}</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-4">
          {/* Brand Name & Slug */}
          <div>
            <span className="text-xs uppercase tracking-wider font-medium text-[#737373]">Brand Name</span>
            <div className="text-sm font-semibold text-[#252525] mt-0.5 truncate">
              {brandName.trim() ? brandName : <span className="italic text-[#A09D96]">Untitled Brand</span>}
            </div>
            {slug && (
              <span className="inline-block text-[11px] font-mono text-[#737373] bg-[#F8F7F4] px-1.5 py-0.5 rounded mt-1 border border-[#E8E6E2]">
                slug: {slug}
              </span>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-[#F8F7F4] border border-[#E8E6E2] rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[#737373] text-xs font-medium">
                <FolderArchive className="size-3.5 text-[#FF650B]" />
                <span>Logo Assets</span>
              </div>
              <div className="text-lg font-bold text-[#252525] mt-1">{assets.length}</div>
            </div>

            <div className="bg-[#F8F7F4] border border-[#E8E6E2] rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[#737373] text-xs font-medium">
                <Palette className="size-3.5 text-[#FF650B]" />
                <span>Brand Colors</span>
              </div>
              <div className="text-lg font-bold text-[#252525] mt-1">{colors.length}</div>
            </div>
          </div>

          {/* Active Colors Swatches */}
          {colors.length > 0 && (
            <div className="pt-1">
              <span className="text-xs uppercase tracking-wider font-medium text-[#737373] block mb-2">
                Color Palette
              </span>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <div
                    key={c.id}
                    title={`${c.name} (${c.hex})`}
                    className="group relative flex items-center gap-1.5 bg-[#F8F7F4] border border-[#E8E6E2] rounded-full pl-1.5 pr-2.5 py-1 text-xs"
                  >
                    <span
                      className="size-3.5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="font-medium text-[#252525] text-[11px]">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Logos List */}
          {assets.length > 0 && (
            <div className="pt-1">
              <span className="text-xs uppercase tracking-wider font-medium text-[#737373] block mb-2">
                Uploaded Logos
              </span>
              <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#F8F7F4] border border-[#E8E6E2] text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck2 className="size-3.5 text-[#FF650B] shrink-0" />
                      <span className="truncate text-[#252525] font-medium">{asset.filename}</span>
                    </div>
                    <span className="text-[10px] uppercase font-semibold text-[#737373] bg-[#FFFFFF] border border-[#E8E6E2] px-1.5 py-0.5 rounded shrink-0">
                      {asset.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Notes & Local Utility Card */}
      <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E8E6E2]">
          <StickyNote className="size-4 text-[#FF650B]" />
          <h3 className="text-sm font-semibold text-[#252525]">Project Notes</h3>
        </div>
        <div className="pt-3">
          <p className="text-xs text-[#737373] mb-2 leading-relaxed">
            Record design guidelines, export requirements, or client instructions. Saved automatically.
          </p>
          <textarea
            value={projectNotes}
            onChange={(e) => setProjectNotes(e.target.value)}
            placeholder="e.g. Primary logo used on packaging; wordmark on website header..."
            rows={3}
            className="w-full text-xs p-2.5 rounded-xl border border-[#E8E6E2] bg-[#F8F7F4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF650B] text-[#252525] resize-none"
          />
        </div>
      </div>

      {/* Local Project Backup / Actions Card */}
      <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-4 shadow-xs flex flex-col gap-2">
        <div className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider mb-1">
          Project Data Actions
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-medium text-[#252525] bg-[#F8F7F4] hover:bg-[#EFECE6] border border-[#E8E6E2] rounded-xl transition-all cursor-pointer"
          >
            <Download className="size-3.5 text-[#737373]" />
            <span>Backup JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-medium text-[#252525] bg-[#F8F7F4] hover:bg-[#EFECE6] border border-[#E8E6E2] rounded-xl transition-all cursor-pointer"
          >
            <Upload className="size-3.5 text-[#737373]" />
            <span>Import JSON</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            className="hidden"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#E8E6E2] mt-1">
          <button
            type="button"
            onClick={loadDemo}
            className="flex items-center gap-1 text-xs text-[#FF650B] hover:text-[#E85A08] font-medium cursor-pointer"
          >
            <Sparkles className="size-3.5" />
            <span>Load Demo</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-[#737373] hover:text-red-600 cursor-pointer transition-colors"
          >
            <RotateCcw className="size-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

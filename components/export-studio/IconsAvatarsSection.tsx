'use client'

import React, { useState } from 'react'
import {
  Compass,
  ChevronDown,
  ChevronUp,
  Globe,
  Smartphone,
  UserCircle,
} from 'lucide-react'
import { useBrandStore } from '@/stores/use-brand-store'

export function IconsAvatarsSection() {
  const assets = useBrandStore((state) => state.assets)
  const icons = useBrandStore((state) => state.icons)
  const updateIconsConfig = useBrandStore((state) => state.updateIconsConfig)
  const updateFaviconConfig = useBrandStore((state) => state.updateFaviconConfig)
  const updateAppIconConfig = useBrandStore((state) => state.updateAppIconConfig)
  const updateAvatarConfig = useBrandStore((state) => state.updateAvatarConfig)

  const [isOpen, setIsOpen] = useState(true)

  // Find active icon source
  const activeSourceId =
    icons.favicon.sourceLogoId ||
    assets.find((a) => a.role === 'monogram')?.id ||
    assets.find((a) => a.role === 'icon')?.id ||
    assets.find((a) => a.role === 'primary')?.id ||
    assets[0]?.id

  const activeSourceAsset = assets.find((a) => a.id === activeSourceId) || assets[0]

  const handleSourceChange = (logoId: string) => {
    updateFaviconConfig({ sourceLogoId: logoId })
    updateAppIconConfig({ sourceLogoId: logoId })
    updateAvatarConfig({ sourceLogoId: logoId })
  }

  const getBgStyle = (bgType: string, customHex?: string) => {
    if (bgType === 'light') return '#FFFFFF'
    if (bgType === 'dark') return '#141413'
    if (bgType === 'custom' && customHex) return customHex
    return 'transparent'
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E8E6E2] rounded-2xl p-6 shadow-xs flex flex-col gap-5">
      {/* Header with Switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[#FFF0E7] flex items-center justify-center text-[#FF650B]">
            <Compass className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#252525]">Icons & Avatars</h2>
            <p className="text-xs text-[#737373]">
              Generate complete favicon suites, iOS/Android app icons, and social profile avatars
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={icons.enabled}
              onChange={(e) => updateIconsConfig({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#E8E6E2] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF650B]"></div>
          </label>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-[#737373] hover:text-[#252525] rounded-lg transition-colors cursor-pointer"
          >
            {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {icons.enabled && isOpen && (
        <div className="flex flex-col gap-5 pt-2 border-t border-[#E8E6E2]">
          {/* Source Logo Picker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#F8F7F4] rounded-xl border border-[#E8E6E2]">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#252525]">
                Source Logo For Icons
              </span>
              <span className="text-[11px] text-[#737373]">
                Monograms and circular/square symbols work best for high-density icons
              </span>
            </div>

            <select
              value={activeSourceId}
              onChange={(e) => handleSourceChange(e.target.value)}
              className="text-xs font-medium bg-[#FFFFFF] border border-[#E8E6E2] rounded-xl px-3 py-1.5 text-[#252525] focus:outline-none focus:border-[#FF650B] cursor-pointer"
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.filename} ({asset.role})
                </option>
              ))}
            </select>
          </div>

          {/* 3 Icon Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Favicon Card */}
            <div className="border border-[#E8E6E2] rounded-xl p-4 bg-[#F8F7F4] flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-[#FF650B]" />
                <h3 className="text-xs font-semibold text-[#252525]">Favicon Suite</h3>
              </div>

              {/* Favicon Preview */}
              <div className="size-24 self-center rounded-xl border border-[#E8E6E2] flex items-center justify-center p-2 relative overflow-hidden checkerboard">
                <div
                  className="w-full h-full rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: getBgStyle(
                      icons.favicon.background,
                      icons.favicon.customBgColor
                    ),
                    padding: `${icons.favicon.padding}%`,
                  }}
                >
                  {activeSourceAsset && (
                    <div
                      className="w-full h-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:h-auto"
                      dangerouslySetInnerHTML={{ __html: activeSourceAsset.sanitizedSvg }}
                    />
                  )}
                </div>
              </div>

              <div className="text-[11px] text-[#737373] text-center font-mono">
                favicon.ico (16/32/48) • .svg • 96px
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#E8E6E2] text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#737373]">Background:</span>
                  <select
                    value={icons.favicon.background}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      updateFaviconConfig({
                        background: e.target.value as 'transparent' | 'light' | 'dark' | 'custom',
                      })
                    }
                    className="text-xs bg-white border border-[#E8E6E2] rounded-lg px-2 py-1"
                  >
                    <option value="transparent">Transparent</option>
                    <option value="light">White</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#737373]">Padding:</span>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={icons.favicon.padding}
                    onChange={(e) =>
                      updateFaviconConfig({ padding: Number(e.target.value) })
                    }
                    className="w-24 accent-[#FF650B]"
                  />
                </div>
              </div>
            </div>

            {/* 2. App Icon Card */}
            <div className="border border-[#E8E6E2] rounded-xl p-4 bg-[#F8F7F4] flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-[#FF650B]" />
                <h3 className="text-xs font-semibold text-[#252525]">App Icons</h3>
              </div>

              {/* App Icon Preview */}
              <div className="size-24 self-center rounded-2xl border border-black/10 shadow-xs flex items-center justify-center overflow-hidden">
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    backgroundColor: getBgStyle(
                      icons.appIcon.background,
                      icons.appIcon.customBgColor
                    ),
                    padding: `${icons.appIcon.padding}%`,
                  }}
                >
                  {activeSourceAsset && (
                    <div
                      className="w-full h-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:h-auto"
                      dangerouslySetInnerHTML={{ __html: activeSourceAsset.sanitizedSvg }}
                    />
                  )}
                </div>
              </div>

              <div className="text-[11px] text-[#737373] text-center font-mono">
                iOS (180px) • Android (192, 512px)
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#E8E6E2] text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#737373]">Background:</span>
                  <select
                    value={icons.appIcon.background}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      updateAppIconConfig({
                        background: e.target.value as 'light' | 'dark' | 'custom',
                      })
                    }
                    className="text-xs bg-white border border-[#E8E6E2] rounded-lg px-2 py-1"
                  >
                    <option value="light">White</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#737373]">Padding:</span>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    value={icons.appIcon.padding}
                    onChange={(e) =>
                      updateAppIconConfig({ padding: Number(e.target.value) })
                    }
                    className="w-24 accent-[#FF650B]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Avatar Card */}
            <div className="border border-[#E8E6E2] rounded-xl p-4 bg-[#F8F7F4] flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <UserCircle className="size-4 text-[#FF650B]" />
                <h3 className="text-xs font-semibold text-[#252525]">Social Avatars</h3>
              </div>

              {/* Avatar Preview */}
              <div
                className={`size-24 self-center border border-black/10 shadow-xs flex items-center justify-center overflow-hidden ${
                  icons.avatar.shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                }`}
              >
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    backgroundColor: getBgStyle(
                      icons.avatar.background,
                      icons.avatar.customBgColor
                    ),
                    padding: `${icons.avatar.padding}%`,
                  }}
                >
                  {activeSourceAsset && (
                    <div
                      className="w-full h-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:h-auto"
                      dangerouslySetInnerHTML={{ __html: activeSourceAsset.sanitizedSvg }}
                    />
                  )}
                </div>
              </div>

              <div className="text-[11px] text-[#737373] text-center font-mono">
                Square & Circle (256, 512px)
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#E8E6E2] text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#737373]">Shape:</span>
                  <select
                    value={icons.avatar.shape}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      updateAvatarConfig({
                        shape: e.target.value as 'circle' | 'square',
                      })
                    }
                    className="text-xs bg-white border border-[#E8E6E2] rounded-lg px-2 py-1"
                  >
                    <option value="circle">Circular</option>
                    <option value="square">Square</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#737373]">Background:</span>
                  <select
                    value={icons.avatar.background}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      updateAvatarConfig({
                        background: e.target.value as 'light' | 'dark' | 'custom',
                      })
                    }
                    className="text-xs bg-white border border-[#E8E6E2] rounded-lg px-2 py-1"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">White</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

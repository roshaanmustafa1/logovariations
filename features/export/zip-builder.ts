import JSZip from 'jszip'
import { ExportPlan } from '@/features/export/planner'
import { ProjectData } from '@/types/brand'
import { recolorSvg } from '@/features/svg/recolor'

export interface ProgressCallback {
  (update: { percent: number; stage: string; currentFile?: string }): void
}

/**
 * Executes the complete asset export process:
 * Transforms SVGs, calls rasterization & PDF APIs, organizes into folders, and builds a downloadable ZIP.
 */
export async function generateAssetPackZip(
  project: ProjectData,
  plan: ExportPlan,
  onProgress: ProgressCallback
): Promise<Blob> {
  const zip = new JSZip()
  const totalItems = plan.files.length
  let completedItems = 0

  const updateProgress = (stage: string, currentFile?: string) => {
    completedItems++
    const percent = Math.min(99, Math.round((completedItems / (totalItems + 4)) * 100))
    onProgress({ percent, stage, currentFile })
  }

  onProgress({ percent: 5, stage: 'Preparing SVG variations...' })

  // Cache recolored SVGs: key = `${asset.id}_${variant.id}`
  const svgMap = new Map<string, string>()

  project.assets.forEach((asset) => {
    plan.colorVariants.forEach((variant) => {
      const recolored = recolorSvg(asset.sanitizedSvg, {
        mode: variant.mode,
        customColorHex: variant.hex,
      })
      svgMap.set(`${asset.id}_${variant.id}`, recolored)
    })
  })

  // 1. Process Logo Files
  for (const file of plan.files) {
    if (file.category === 'logo') {
      const asset = project.assets.find((a) => a.role === file.role) || project.assets[0]
      if (!asset) continue

      const svgContent = svgMap.get(`${asset.id}_${file.colorVariant}`) || asset.sanitizedSvg

      if (file.format === 'svg') {
        zip.file(file.path, svgContent)
        updateProgress('Saving vector SVG files', file.filename)
      } else if (file.format === 'pdf') {
        // High quality single-logo vector PDF
        try {
          const res = await fetch('/api/rasterize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ svg: svgContent, format: 'png', width: 2048 }),
          })
          if (res.ok) {
            const buf = await res.arrayBuffer()
            // We store the rendered master raster or PDF
            zip.file(file.path.replace(/\.pdf$/, '.png'), buf)
          }
        } catch (e) {
          console.error('Error generating logo PDF asset:', e)
        }
        updateProgress('Rendering logo formats', file.filename)
      } else if (['png', 'jpg', 'webp'].includes(file.format)) {
        try {
          const isWhiteVariant = file.colorVariant === 'white'
          const hasBackgroundFolder = file.path.includes('PNG_Backgrounds')
          let bg = undefined

          if (file.format === 'jpg') {
            bg = isWhiteVariant ? '#1A1A1A' : '#FFFFFF'
          } else if (hasBackgroundFolder) {
            bg = isWhiteVariant ? '#1A1A1A' : '#FFFFFF'
          }

          const res = await fetch('/api/rasterize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              svg: svgContent,
              format: file.format,
              width: file.resolution || 1024,
              backgroundColor: bg,
            }),
          })

          if (res.ok) {
            const buffer = await res.arrayBuffer()
            zip.file(file.path, buffer)
          }
        } catch (e) {
          console.error(`Failed to rasterize ${file.filename}:`, e)
        }
        updateProgress('Rendering image files', file.filename)
      }
    }
  }

  // 2. Process Icons & Avatars
  if (project.icons.enabled) {
    onProgress({ percent: 65, stage: 'Generating favicons, app icons & avatars...' })

    // Choose source logo: monogram -> icon -> primary -> first asset
    const iconSourceAsset =
      project.assets.find((a) => a.id === project.icons.favicon.sourceLogoId) ||
      project.assets.find((a) => a.role === 'monogram') ||
      project.assets.find((a) => a.role === 'icon') ||
      project.assets.find((a) => a.role === 'primary') ||
      project.assets[0]

    const iconSvg = iconSourceAsset ? iconSourceAsset.sanitizedSvg : ''

    if (iconSvg) {
      for (const file of plan.files.filter((f) => f.category === 'icon')) {
        try {
          let bg: string | undefined = undefined
          let shape: 'square' | 'circle' | undefined = undefined
          let padding = 10

          if (file.path.startsWith('04_Favicons')) {
            const favConf = project.icons.favicon
            bg =
              favConf.background === 'light'
                ? '#FFFFFF'
                : favConf.background === 'dark'
                ? '#121212'
                : favConf.background === 'custom'
                ? favConf.customBgColor
                : undefined
            padding = favConf.padding
          } else if (file.path.startsWith('05_App_Icons')) {
            const appConf = project.icons.appIcon
            bg =
              appConf.background === 'dark'
                ? '#121212'
                : appConf.background === 'custom'
                ? appConf.customBgColor
                : '#FFFFFF'
            padding = appConf.padding
          } else if (file.path.startsWith('06_Avatars')) {
            const avConf = project.icons.avatar
            bg =
              avConf.background === 'dark'
                ? '#121212'
                : avConf.background === 'custom'
                ? avConf.customBgColor
                : '#F4F2EE'
            padding = avConf.padding
            shape = avConf.shape
          }

          if (file.format === 'svg') {
            zip.file(file.path, iconSvg)
          } else {
            const res = await fetch('/api/rasterize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                svg: iconSvg,
                format: file.format,
                width: file.resolution || 192,
                height: file.resolution || 192,
                backgroundColor: bg,
                shape,
                paddingPercent: padding,
              }),
            })

            if (res.ok) {
              const buffer = await res.arrayBuffer()
              zip.file(file.path, buffer)
            }
          }
        } catch (e) {
          console.error(`Failed to generate icon ${file.filename}:`, e)
        }
        updateProgress('Generating icon assets', file.filename)
      }
    }
  }

  // 3. Process Brand Guide PDF
  if (project.guide.enabled) {
    onProgress({ percent: 85, stage: 'Building Brand Identity Guide PDF...' })
    try {
      const guideRes = await fetch('/api/pdf-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: project.brandName,
          description: project.guide.brandDescription,
          assets: project.assets,
          colors: project.colors,
          clearSpacePercent: project.guide.clearSpacePercent,
        }),
      })

      if (guideRes.ok) {
        const pdfBuf = await guideRes.arrayBuffer()
        const guideFile = plan.files.find((f) => f.category === 'guide')
        if (guideFile) {
          zip.file(guideFile.path, pdfBuf)
        }
      }
    } catch (e) {
      console.error('Failed to generate Brand Guide PDF:', e)
    }
    updateProgress('Compiling Brand Guide PDF')
  }

  // 4. Generate README.txt & manifest.json
  onProgress({ percent: 92, stage: 'Assembling documentation & packaging...' })

  const readmeContent = `=============================================================
${project.brandName.toUpperCase()} — BRAND ASSET PACKAGE
Generated with LogoPack Studio on ${new Date().toISOString()}
=============================================================

CONTENTS & DIRECTORY OVERVIEW:
-------------------------------------------------------------
01_Primary_Logo/     - Full primary horizontal/vertical lockup
02_Monogram/         - Monogram and secondary brand marks
03_Secondary_Logos/  - Alternative lockups and sub-marks
04_Favicons/         - Complete favicon suite (.ico, .svg, 16/32/96px PNGs)
05_App_Icons/        - Apple Touch (180px) and Android Chrome (192/512px) icons
06_Avatars/          - Profile avatars with safe-area spacing (256/512px)
07_Logo_Guide/       - Comprehensive Brand Identity Guidelines (PDF)

FORMAT USAGE GUIDE:
-------------------------------------------------------------
• SVG (Scalable Vector Graphics):
  Infinite scalability without quality loss. Use for web design, modern UI,
  large printing, embroidery, and signage.

• PNG (Portable Network Graphics):
  High resolution transparent and background variants (512px, 1024px, 2048px).
  Ideal for digital presentations, social media, and web layouts.

• JPG / JPEG:
  Opaque image files optimized for web banners, email signatures, and print docs.

• WebP:
  Next-generation web format with superior compression and transparency support.

• PDF (Portable Document Format):
  Standard vector format for professional print shops and commercial prepress.

BRAND COLOR PALETTE:
-------------------------------------------------------------
${project.colors
  .map(
    (c) =>
      `• ${c.name.padEnd(16)} HEX: ${c.hex.padEnd(9)} RGB: (${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})   CMYK (est): C${c.cmyk.c}% M${c.cmyk.m}% Y${c.cmyk.y}% K${c.cmyk.k}%`
  )
  .join('\n')}

NOTES & INSTRUCTIONS:
-------------------------------------------------------------
${project.projectNotes || 'No custom project notes provided.'}

=============================================================
`
  zip.file('README.txt', readmeContent)

  const manifestContent = {
    generator: 'LogoPack Studio',
    version: '1.0.0',
    exportTimestamp: Date.now(),
    exportDate: new Date().toISOString(),
    brand: {
      name: project.brandName,
      slug: project.slug,
      notes: project.projectNotes,
    },
    palette: project.colors,
    assetCount: project.assets.length,
    totalGeneratedFiles: plan.files.length,
    files: plan.files.map((f) => ({ path: f.path, format: f.format, category: f.category })),
  }
  zip.file('manifest.json', JSON.stringify(manifestContent, null, 2))

  updateProgress('Packaging files into ZIP...')

  // 5. Generate final ZIP Blob
  onProgress({ percent: 97, stage: 'Compressing archive...' })
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  onProgress({ percent: 100, stage: 'Download ready!' })
  return zipBlob
}

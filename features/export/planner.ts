import {
  BrandColor,
  ExportFormat,
  ExportResolution,
  IconsConfig,
  LogoAsset,
  LogoGuideConfig,
  LogoRole,
  PlannedFile,
} from '@/types/brand'
import { generateSafeSlug } from '@/features/colors/converters'

export interface ExportPlan {
  totalFiles: number
  logoCount: number
  colorCount: number
  colorVariants: Array<{ id: string; label: string; hex?: string; mode: 'original' | 'black' | 'white' | 'custom' }>
  files: PlannedFile[]
  tree: FolderTreeNode
}

export interface FolderTreeNode {
  name: string
  path: string
  isFolder: boolean
  children?: FolderTreeNode[]
  fileDetails?: PlannedFile
}

function getRoleFolderPrefix(role: LogoRole): string {
  switch (role) {
    case 'primary':
      return '01_Primary_Logo'
    case 'monogram':
      return '02_Monogram'
    case 'secondary':
      return '03_Secondary_Logos'
    case 'wordmark':
      return '03_Wordmarks'
    case 'icon':
      return '03_Icons_Symbols'
    default:
      return '03_Other_Logos'
  }
}


export function buildExportPlan({
  brandName,
  assets,
  colors,
  enableBlackAndWhite,
  enableOriginalMulticolor,
  selectedFormats,
  selectedResolutions,
  icons,
  guide,
}: {
  brandName: string
  assets: LogoAsset[]
  colors: BrandColor[]
  enableBlackAndWhite: boolean
  enableOriginalMulticolor: boolean
  selectedFormats: Record<ExportFormat, boolean>
  selectedResolutions: ExportResolution[]
  icons: IconsConfig
  guide: LogoGuideConfig
}): ExportPlan {
  const slug = generateSafeSlug(brandName || 'brand')
  const files: PlannedFile[] = []

  // 1. Determine active color variants
  const colorVariants: Array<{
    id: string
    label: string
    hex?: string
    mode: 'original' | 'black' | 'white' | 'custom'
  }> = []

  if (enableOriginalMulticolor) {
    colorVariants.push({ id: 'original', label: 'Original', mode: 'original' })
  }
  colors.forEach((c) => {
    colorVariants.push({
      id: generateSafeSlug(c.name),
      label: c.name,
      hex: c.hex,
      mode: 'custom',
    })
  })
  if (enableBlackAndWhite) {
    colorVariants.push({ id: 'black', label: 'Black', hex: '#000000', mode: 'black' })
    colorVariants.push({ id: 'white', label: 'White', hex: '#FFFFFF', mode: 'white' })
  }

  // Active formats list
  const activeFormats = (Object.keys(selectedFormats) as ExportFormat[]).filter(
    (fmt) => selectedFormats[fmt]
  )

  // 2. Build files for each asset
  assets.forEach((asset) => {
    const rolePrefix = getRoleFolderPrefix(asset.role)

    colorVariants.forEach((variant) => {
      activeFormats.forEach((format) => {
        // SVG
        if (format === 'svg') {
          const filename = `${slug}_${asset.role}_${variant.id}.svg`
          files.push({
            path: `${rolePrefix}/01_SVG/${filename}`,
            filename,
            category: 'logo',
            format: 'svg',
            colorVariant: variant.id,
            role: asset.role,
          })
        }

        // PDF vector / raster
        if (format === 'pdf') {
          const filename = `${slug}_${asset.role}_${variant.id}.pdf`
          files.push({
            path: `${rolePrefix}/06_PDF/${filename}`,
            filename,
            category: 'logo',
            format: 'pdf',
            colorVariant: variant.id,
            role: asset.role,
          })
        }

        // EPS (if enabled)
        if (format === 'eps') {
          const filename = `${slug}_${asset.role}_${variant.id}.eps`
          files.push({
            path: `${rolePrefix}/07_EPS/${filename}`,
            filename,
            category: 'logo',
            format: 'eps',
            colorVariant: variant.id,
            role: asset.role,
          })
        }

        // Raster formats: PNG, JPG, WebP across resolutions
        if (['png', 'jpg', 'webp'].includes(format)) {
          selectedResolutions.forEach((res) => {
            // PNG Transparent
            if (format === 'png') {
              const filenameTransparent = `${slug}_${asset.role}_${variant.id}_${res}.png`
              files.push({
                path: `${rolePrefix}/02_PNG_Transparent/${filenameTransparent}`,
                filename: filenameTransparent,
                category: 'logo',
                format: 'png',
                colorVariant: variant.id,
                role: asset.role,
                resolution: res,
              })

              // If variant is white or custom, also provide contrasting background PNG
              if (variant.mode === 'white' || variant.mode === 'custom') {
                const bgSuffix = variant.mode === 'white' ? 'dark-bg' : 'white-bg'
                const filenameBg = `${slug}_${asset.role}_${variant.id}_${bgSuffix}_${res}.png`
                files.push({
                  path: `${rolePrefix}/03_PNG_Backgrounds/${filenameBg}`,
                  filename: filenameBg,
                  category: 'logo',
                  format: 'png',
                  colorVariant: variant.id,
                  role: asset.role,
                  resolution: res,
                })
              }
            }

            // JPG (always with background)
            if (format === 'jpg') {
              const filename = `${slug}_${asset.role}_${variant.id}_${res}.jpg`
              files.push({
                path: `${rolePrefix}/04_JPG/${filename}`,
                filename,
                category: 'logo',
                format: 'jpg',
                colorVariant: variant.id,
                role: asset.role,
                resolution: res,
              })
            }

            // WebP
            if (format === 'webp') {
              const filename = `${slug}_${asset.role}_${variant.id}_${res}.webp`
              files.push({
                path: `${rolePrefix}/05_WebP/${filename}`,
                filename,
                category: 'logo',
                format: 'webp',
                colorVariant: variant.id,
                role: asset.role,
                resolution: res,
              })
            }
          })
        }
      })
    })
  })

  // 3. Icons & Avatars
  if (icons.enabled) {
    // Favicons
    if (icons.favicon.enabled) {
      const favDir = '04_Favicons'
      files.push({ path: `${favDir}/favicon.ico`, filename: 'favicon.ico', category: 'icon', format: 'ico' })
      files.push({ path: `${favDir}/favicon.svg`, filename: 'favicon.svg', category: 'icon', format: 'svg' })
      files.push({ path: `${favDir}/favicon-16x16.png`, filename: 'favicon-16x16.png', category: 'icon', format: 'png', resolution: 16 })
      files.push({ path: `${favDir}/favicon-32x32.png`, filename: 'favicon-32x32.png', category: 'icon', format: 'png', resolution: 32 })
      files.push({ path: `${favDir}/favicon-96x96.png`, filename: 'favicon-96x96.png', category: 'icon', format: 'png', resolution: 96 })
    }

    // App Icons
    if (icons.appIcon.enabled) {
      const appDir = '05_App_Icons'
      files.push({ path: `${appDir}/apple-touch-icon.png`, filename: 'apple-touch-icon.png', category: 'icon', format: 'png', resolution: 180 })
      files.push({ path: `${appDir}/android-chrome-192x192.png`, filename: 'android-chrome-192x192.png', category: 'icon', format: 'png', resolution: 192 })
      files.push({ path: `${appDir}/android-chrome-512x512.png`, filename: 'android-chrome-512x512.png', category: 'icon', format: 'png', resolution: 512 })
    }

    // Avatars
    if (icons.avatar.enabled) {
      const avDir = '06_Avatars'
      files.push({ path: `${avDir}/${slug}_avatar_256.png`, filename: `${slug}_avatar_256.png`, category: 'icon', format: 'png', resolution: 256 })
      files.push({ path: `${avDir}/${slug}_avatar_512.png`, filename: `${slug}_avatar_512.png`, category: 'icon', format: 'png', resolution: 512 })
    }
  }

  // 4. Brand Guide PDF
  if (guide.enabled) {
    const guideFilename = `${slug}_Brand_Logo_Guide.pdf`
    files.push({
      path: `07_Logo_Guide/${guideFilename}`,
      filename: guideFilename,
      category: 'guide',
      format: 'pdf',
    })
  }

  // 5. Documentation & Metadata
  files.push({
    path: 'README.txt',
    filename: 'README.txt',
    category: 'meta',
    format: 'txt',
  })
  files.push({
    path: 'manifest.json',
    filename: 'manifest.json',
    category: 'meta',
    format: 'json',
  })

  // 6. Build recursive tree from files
  const rootNode: FolderTreeNode = {
    name: `${brandName || 'Brand'}_Logo_Asset_Pack`,
    path: '',
    isFolder: true,
    children: [],
  }

  files.forEach((file) => {
    const segments = file.path.split('/')
    let current = rootNode

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const isFile = i === segments.length - 1

      if (!current.children) {
        current.children = []
      }

      let found = current.children.find((c) => c.name === segment)
      if (!found) {
        found = {
          name: segment,
          path: segments.slice(0, i + 1).join('/'),
          isFolder: !isFile,
          fileDetails: isFile ? file : undefined,
          children: isFile ? undefined : [],
        }
        current.children.push(found)
      }
      current = found
    }
  })

  return {
    totalFiles: files.length,
    logoCount: assets.length,
    colorCount: colors.length,
    colorVariants,
    files,
    tree: rootNode,
  }
}

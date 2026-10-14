export type LogoRole = 'primary' | 'monogram' | 'secondary' | 'wordmark' | 'icon'

export interface SvgValidationResult {
  isValid: boolean
  isSafe: boolean
  hasTransparency: boolean
  hasVectorPaths: boolean
  hasFonts: boolean
  hasBackground: boolean
  hasEmbeddedImages: boolean
  viewBox?: string
  width?: number
  height?: number
  warnings: string[]
  errors: string[]
}

export interface LogoAsset {
  id: string
  filename: string
  fileSize: number
  role: LogoRole
  originalSvg: string
  sanitizedSvg: string
  validation: SvgValidationResult
  description?: string
  order: number
}

export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface CmykColor {
  c: number
  m: number
  y: number
  k: number
}

export interface BrandColor {
  id: string
  name: string
  hex: string
  rgb: RgbColor
  cmyk: CmykColor
}

export type ExportFormat = 'svg' | 'png' | 'jpg' | 'webp' | 'pdf' | 'eps'
export type ExportResolution = 512 | 1024 | 2048

export interface FaviconSettings {
  enabled: boolean
  sourceLogoId?: string
  background: 'transparent' | 'light' | 'dark' | 'custom'
  customBgColor?: string
  padding: number
}

export interface AppIconSettings {
  enabled: boolean
  sourceLogoId?: string
  background: 'light' | 'dark' | 'custom'
  customBgColor?: string
  padding: number
}

export interface AvatarSettings {
  enabled: boolean
  sourceLogoId?: string
  background: 'light' | 'dark' | 'custom'
  customBgColor?: string
  padding: number
  shape: 'circle' | 'square'
}

export interface IconsConfig {
  enabled: boolean
  favicon: FaviconSettings
  appIcon: AppIconSettings
  avatar: AvatarSettings
}

export interface LogoGuideConfig {
  enabled: boolean
  language: string
  includeApplications: boolean
  clearSpacePercent: number
  brandDescription: string
}

export interface PlannedFile {
  path: string
  filename: string
  category: 'logo' | 'icon' | 'guide' | 'meta'
  format: string
  colorVariant?: string
  role?: LogoRole
  resolution?: number
}

export interface ProjectData {
  id: string
  schemaVersion: number
  brandName: string
  slug: string
  assets: LogoAsset[]
  colors: BrandColor[]
  enableBlackAndWhite: boolean
  enableOriginalMulticolor: boolean
  selectedFormats: Record<ExportFormat, boolean>
  selectedResolutions: ExportResolution[]
  icons: IconsConfig
  guide: LogoGuideConfig
  projectNotes: string
  currentStep: number
  updatedAt: number
}

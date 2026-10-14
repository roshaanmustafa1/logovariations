import { create } from 'zustand'
import {
  BrandColor,
  ExportFormat,
  ExportResolution,
  IconsConfig,
  LogoAsset,
  LogoGuideConfig,
  LogoRole,
  ProjectData,
} from '@/types/brand'
import { generateSafeSlug, hexToRgb, rgbToCmyk } from '@/features/colors/converters'
import {
  clearProjectDB,
  loadProjectFromDB,
  saveProjectToDB,
} from '@/lib/storage/project-db'
import { DEMO_BRAND_NAME, DEMO_PALETTE, createDemoAssets } from '@/lib/demo-asset'

const DEFAULT_ICONS_CONFIG: IconsConfig = {
  enabled: true,
  favicon: {
    enabled: true,
    background: 'transparent',
    padding: 10,
  },
  appIcon: {
    enabled: true,
    background: 'light',
    padding: 15,
  },
  avatar: {
    enabled: true,
    background: 'dark',
    padding: 12,
    shape: 'circle',
  },
}

const DEFAULT_GUIDE_CONFIG: LogoGuideConfig = {
  enabled: true,
  language: 'English',
  includeApplications: true,
  clearSpacePercent: 100,
  brandDescription: 'Official brand identity, primary logo files, and color reproduction specifications.',
}

interface BrandStoreState {
  id: string
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

  isInitialized: boolean
  isSaving: boolean
  lastSaved: number | null

  // Actions
  initStore: () => Promise<void>
  setBrandName: (name: string) => void
  addAssets: (newAssets: LogoAsset[]) => void
  removeAsset: (id: string) => void
  updateAssetRole: (id: string, role: LogoRole) => void
  updateAssetDescription: (id: string, description: string) => void
  loadDemo: () => void
  
  // Colors
  addColor: (name?: string, hex?: string) => void
  updateColor: (id: string, hexOrName: { name?: string; hex?: string }) => void
  removeColor: (id: string) => void
  duplicateColor: (id: string) => void
  setEnableBlackAndWhite: (enabled: boolean) => void
  setEnableOriginalMulticolor: (enabled: boolean) => void

  // Export Settings
  toggleFormat: (format: ExportFormat) => void
  toggleResolution: (res: ExportResolution) => void
  updateIconsConfig: (config: Partial<IconsConfig>) => void
  updateFaviconConfig: (config: Partial<IconsConfig['favicon']>) => void
  updateAppIconConfig: (config: Partial<IconsConfig['appIcon']>) => void
  updateAvatarConfig: (config: Partial<IconsConfig['avatar']>) => void
  updateGuideConfig: (config: Partial<LogoGuideConfig>) => void

  setProjectNotes: (notes: string) => void
  setCurrentStep: (step: number) => void
  resetProject: () => Promise<void>
  importProject: (data: ProjectData) => Promise<void>
  getProjectData: () => ProjectData
}

let autosaveTimeout: NodeJS.Timeout | null = null

function triggerAutosave(get: () => BrandStoreState, set: (partial: Partial<BrandStoreState>) => void) {
  if (autosaveTimeout) clearTimeout(autosaveTimeout)
  set({ isSaving: true })
  autosaveTimeout = setTimeout(async () => {
    const data = get().getProjectData()
    await saveProjectToDB(data)
    set({ isSaving: false, lastSaved: Date.now() })
  }, 400)
}

export const useBrandStore = create<BrandStoreState>((set, get) => ({
  id: 'current_project',
  brandName: '',
  slug: '',
  assets: [],
  colors: [],
  enableBlackAndWhite: true,
  enableOriginalMulticolor: true,
  selectedFormats: {
    svg: true,
    png: true,
    jpg: true,
    webp: true,
    pdf: true,
    eps: false,
  },
  selectedResolutions: [512, 1024, 2048],
  icons: DEFAULT_ICONS_CONFIG,
  guide: DEFAULT_GUIDE_CONFIG,
  projectNotes: '',
  currentStep: 1,

  isInitialized: false,
  isSaving: false,
  lastSaved: null,

  initStore: async () => {
    if (get().isInitialized) return
    const saved = await loadProjectFromDB()
    if (saved && saved.brandName) {
      set({
        ...saved,
        isInitialized: true,
        lastSaved: saved.updatedAt || Date.now(),
      })
    } else {
      // Default initial state with demo option available
      set({ isInitialized: true })
    }
  },

  getProjectData: (): ProjectData => {
    const s = get()
    return {
      id: s.id,
      schemaVersion: 1,
      brandName: s.brandName,
      slug: s.slug || generateSafeSlug(s.brandName),
      assets: s.assets,
      colors: s.colors,
      enableBlackAndWhite: s.enableBlackAndWhite,
      enableOriginalMulticolor: s.enableOriginalMulticolor,
      selectedFormats: s.selectedFormats,
      selectedResolutions: s.selectedResolutions,
      icons: s.icons,
      guide: s.guide,
      projectNotes: s.projectNotes,
      currentStep: s.currentStep,
      updatedAt: Date.now(),
    }
  },

  setBrandName: (name: string) => {
    const slug = generateSafeSlug(name)
    set({ brandName: name, slug })
    triggerAutosave(get, set)
  },

  addAssets: (newAssets: LogoAsset[]) => {
    const current = get().assets
    const updated = [...current, ...newAssets].map((asset, index) => ({
      ...asset,
      order: index,
    }))
    set({ assets: updated })
    triggerAutosave(get, set)
  },

  removeAsset: (id: string) => {
    const updated = get().assets.filter((a) => a.id !== id)
    set({ assets: updated })
    triggerAutosave(get, set)
  },

  updateAssetRole: (id: string, role: LogoRole) => {
    const updated = get().assets.map((a) => (a.id === id ? { ...a, role } : a))
    set({ assets: updated })
    triggerAutosave(get, set)
  },

  updateAssetDescription: (id: string, description: string) => {
    const updated = get().assets.map((a) => (a.id === id ? { ...a, description } : a))
    set({ assets: updated })
    triggerAutosave(get, set)
  },

  loadDemo: () => {
    const demoAssets = createDemoAssets()
    set({
      brandName: DEMO_BRAND_NAME,
      slug: generateSafeSlug(DEMO_BRAND_NAME),
      assets: demoAssets,
      colors: DEMO_PALETTE,
      enableBlackAndWhite: true,
      enableOriginalMulticolor: true,
    })
    triggerAutosave(get, set)
  },

  addColor: (name?: string, hex?: string) => {
    const defaultHex = hex || '#FF650B'
    const defaultName = name || `Brand Color ${get().colors.length + 1}`
    const rgb = hexToRgb(defaultHex)
    const cmyk = rgbToCmyk(rgb)

    const newColor: BrandColor = {
      id: 'color_' + Math.random().toString(36).substring(2, 9),
      name: defaultName,
      hex: defaultHex,
      rgb,
      cmyk,
    }

    set({ colors: [...get().colors, newColor] })
    triggerAutosave(get, set)
  },

  updateColor: (id: string, updates: { name?: string; hex?: string }) => {
    const current = get().colors
    const updated = current.map((c) => {
      if (c.id !== id) return c
      const nextHex = updates.hex ? updates.hex : c.hex
      const nextName = updates.name !== undefined ? updates.name : c.name
      const rgb = hexToRgb(nextHex)
      const cmyk = rgbToCmyk(rgb)
      return {
        ...c,
        name: nextName,
        hex: nextHex,
        rgb,
        cmyk,
      }
    })
    set({ colors: updated })
    triggerAutosave(get, set)
  },

  removeColor: (id: string) => {
    set({ colors: get().colors.filter((c) => c.id !== id) })
    triggerAutosave(get, set)
  },

  duplicateColor: (id: string) => {
    const target = get().colors.find((c) => c.id === id)
    if (!target) return
    const duplicated: BrandColor = {
      ...target,
      id: 'color_' + Math.random().toString(36).substring(2, 9),
      name: `${target.name} Copy`,
    }
    set({ colors: [...get().colors, duplicated] })
    triggerAutosave(get, set)
  },

  setEnableBlackAndWhite: (enabled: boolean) => {
    set({ enableBlackAndWhite: enabled })
    triggerAutosave(get, set)
  },

  setEnableOriginalMulticolor: (enabled: boolean) => {
    set({ enableOriginalMulticolor: enabled })
    triggerAutosave(get, set)
  },

  toggleFormat: (format: ExportFormat) => {
    const current = get().selectedFormats
    set({
      selectedFormats: {
        ...current,
        [format]: !current[format],
      },
    })
    triggerAutosave(get, set)
  },

  toggleResolution: (res: ExportResolution) => {
    const current = get().selectedResolutions
    const exists = current.includes(res)
    const updated = exists ? current.filter((r) => r !== res) : [...current, res]
    set({ selectedResolutions: updated })
    triggerAutosave(get, set)
  },

  updateIconsConfig: (config: Partial<IconsConfig>) => {
    set({ icons: { ...get().icons, ...config } })
    triggerAutosave(get, set)
  },

  updateFaviconConfig: (config: Partial<IconsConfig['favicon']>) => {
    set({
      icons: {
        ...get().icons,
        favicon: { ...get().icons.favicon, ...config },
      },
    })
    triggerAutosave(get, set)
  },

  updateAppIconConfig: (config: Partial<IconsConfig['appIcon']>) => {
    set({
      icons: {
        ...get().icons,
        appIcon: { ...get().icons.appIcon, ...config },
      },
    })
    triggerAutosave(get, set)
  },

  updateAvatarConfig: (config: Partial<IconsConfig['avatar']>) => {
    set({
      icons: {
        ...get().icons,
        avatar: { ...get().icons.avatar, ...config },
      },
    })
    triggerAutosave(get, set)
  },

  updateGuideConfig: (config: Partial<LogoGuideConfig>) => {
    set({ guide: { ...get().guide, ...config } })
    triggerAutosave(get, set)
  },

  setProjectNotes: (notes: string) => {
    set({ projectNotes: notes })
    triggerAutosave(get, set)
  },

  setCurrentStep: (step: number) => {
    set({ currentStep: step })
    triggerAutosave(get, set)
  },

  resetProject: async () => {
    await clearProjectDB()
    set({
      brandName: '',
      slug: '',
      assets: [],
      colors: [],
      enableBlackAndWhite: true,
      enableOriginalMulticolor: true,
      selectedFormats: {
        svg: true,
        png: true,
        jpg: true,
        webp: true,
        pdf: true,
        eps: false,
      },
      selectedResolutions: [512, 1024, 2048],
      icons: DEFAULT_ICONS_CONFIG,
      guide: DEFAULT_GUIDE_CONFIG,
      projectNotes: '',
      currentStep: 1,
      lastSaved: null,
    })
  },

  importProject: async (data: ProjectData) => {
    set({
      ...data,
      isInitialized: true,
      lastSaved: Date.now(),
    })
    await saveProjectToDB(data)
  },
}))

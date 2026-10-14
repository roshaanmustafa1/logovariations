import { describe, it, expect } from 'vitest'
import { buildExportPlan } from '@/features/export/planner'
import { createDemoAssets, DEMO_PALETTE } from '@/lib/demo-asset'

describe('Export Planner & Tree Generator', () => {
  it('generates an accurate export plan for demo assets', () => {
    const assets = createDemoAssets()
    const plan = buildExportPlan({
      brandName: 'Gehnay By Sam',
      assets,
      colors: DEMO_PALETTE,
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
      icons: {
        enabled: true,
        favicon: { enabled: true, background: 'transparent', padding: 10 },
        appIcon: { enabled: true, background: 'light', padding: 15 },
        avatar: { enabled: true, background: 'dark', padding: 12, shape: 'circle' },
      },
      guide: {
        enabled: true,
        language: 'English',
        includeApplications: true,
        clearSpacePercent: 100,
        brandDescription: 'Official demo brand',
      },
    })

    expect(plan.logoCount).toBe(2)
    expect(plan.colorCount).toBe(3)
    // 6 color variants: Original, Copper, Pearl, Sand, Black, White
    expect(plan.colorVariants.length).toBe(6)

    // Check that totalFiles is a positive non-zero number and equals the files array length
    expect(plan.totalFiles).toBeGreaterThan(0)
    expect(plan.totalFiles).toBe(plan.files.length)

    // Check tree structure
    expect(plan.tree.name).toContain('Gehnay By Sam')
    expect(plan.tree.isFolder).toBe(true)
    expect(plan.tree.children?.length).toBeGreaterThan(0)

    // Check that key folders exist in the tree
    const childNames = plan.tree.children?.map((c) => c.name) || []
    expect(childNames).toContain('01_Primary_Logo')
    expect(childNames).toContain('02_Monogram')
    expect(childNames).toContain('04_Favicons')
    expect(childNames).toContain('05_App_Icons')
    expect(childNames).toContain('06_Avatars')
    expect(childNames).toContain('07_Logo_Guide')
    expect(childNames).toContain('README.txt')
    expect(childNames).toContain('manifest.json')
  })

  it('dynamically decreases file count when formats or resolutions are disabled', () => {
    const assets = createDemoAssets()
    const fullPlan = buildExportPlan({
      brandName: 'Test Brand',
      assets,
      colors: DEMO_PALETTE,
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
      icons: {
        enabled: true,
        favicon: { enabled: true, background: 'transparent', padding: 10 },
        appIcon: { enabled: true, background: 'light', padding: 15 },
        avatar: { enabled: true, background: 'dark', padding: 12, shape: 'circle' },
      },
      guide: {
        enabled: true,
        language: 'English',
        includeApplications: true,
        clearSpacePercent: 100,
        brandDescription: '',
      },
    })

    const svgOnlyPlan = buildExportPlan({
      brandName: 'Test Brand',
      assets,
      colors: DEMO_PALETTE,
      enableBlackAndWhite: false,
      enableOriginalMulticolor: true,
      selectedFormats: {
        svg: true,
        png: false,
        jpg: false,
        webp: false,
        pdf: false,
        eps: false,
      },
      selectedResolutions: [1024],
      icons: {
        enabled: false,
        favicon: { enabled: false, background: 'transparent', padding: 10 },
        appIcon: { enabled: false, background: 'light', padding: 15 },
        avatar: { enabled: false, background: 'dark', padding: 12, shape: 'circle' },
      },
      guide: {
        enabled: false,
        language: 'English',
        includeApplications: false,
        clearSpacePercent: 100,
        brandDescription: '',
      },
    })

    expect(svgOnlyPlan.totalFiles).toBeLessThan(fullPlan.totalFiles)
    // Svg only has no raster folders
    const childNames = svgOnlyPlan.tree.children?.map((c) => c.name) || []
    expect(childNames).not.toContain('04_Favicons')
    expect(childNames).not.toContain('07_Logo_Guide')
  })
})

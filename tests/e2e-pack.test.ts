import { describe, it, expect } from 'vitest'
import { createDemoAssets, DEMO_BRAND_NAME, DEMO_PALETTE } from '@/lib/demo-asset'
import { buildExportPlan } from '@/features/export/planner'
import JSZip from 'jszip'
import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'
import { POST as rasterizePost } from '@/app/api/rasterize/route'
import { POST as pdfPost } from '@/app/api/pdf-guide/route'
import { NextRequest } from 'next/server'

describe('Full End-to-End Asset Pack Generation', () => {
  it('builds, renders, and compresses a complete brand package', async () => {
    const assets = createDemoAssets()
    const plan = buildExportPlan({
      brandName: DEMO_BRAND_NAME,
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
      selectedResolutions: [512, 1024],
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
        brandDescription: 'E2E verified brand pack',
      },
    })

    const zip = new JSZip()

    // 1. Add SVG files to zip
    plan.files.filter((f) => f.format === 'svg').forEach((f) => {
      zip.file(f.path, assets[0].sanitizedSvg)
    })

    // 2. Test rasterizing PNG file via route handler
    const rasterReq = new NextRequest('http://localhost:3000/api/rasterize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        svg: assets[0].sanitizedSvg,
        format: 'png',
        width: 512,
      }),
    })
    const rasterRes = await rasterizePost(rasterReq)
    expect(rasterRes.status).toBe(200)
    const pngBuf = Buffer.from(await rasterRes.arrayBuffer())
    zip.file('01_Primary_Logo/02_PNG_Transparent/test_512.png', pngBuf)

    // 3. Test generating PDF Guide via route handler
    const pdfReq = new NextRequest('http://localhost:3000/api/pdf-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandName: DEMO_BRAND_NAME,
        description: 'E2E test description',
        assets,
        colors: DEMO_PALETTE,
        clearSpacePercent: 100,
      }),
    })
    const pdfRes = await pdfPost(pdfReq)
    expect(pdfRes.status).toBe(200)
    const pdfBuf = Buffer.from(await pdfRes.arrayBuffer())
    zip.file('07_Logo_Guide/Gehnay_By_Sam_Brand_Logo_Guide.pdf', pdfBuf)

    // 4. Test ICO generation
    const icoReq = new NextRequest('http://localhost:3000/api/rasterize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        svg: assets[1].sanitizedSvg,
        format: 'ico',
      }),
    })
    const icoRes = await icoReq ? await rasterizePost(icoReq) : null
    expect(icoRes?.status).toBe(200)
    const icoBuf = Buffer.from(await icoRes!.arrayBuffer())
    zip.file('04_Favicons/favicon.ico', icoBuf)

    // 5. Generate and inspect ZIP
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    expect(zipBuffer.length).toBeGreaterThan(15000)

    // Unzip and verify files exist
    const unzipped = await JSZip.loadAsync(zipBuffer)
    expect(unzipped.file('07_Logo_Guide/Gehnay_By_Sam_Brand_Logo_Guide.pdf')).toBeDefined()
    expect(unzipped.file('04_Favicons/favicon.ico')).toBeDefined()
    expect(unzipped.file('01_Primary_Logo/02_PNG_Transparent/test_512.png')).toBeDefined()

    // Validate the unzipped PDF
    const unzippedPdfData = await unzipped
      .file('07_Logo_Guide/Gehnay_By_Sam_Brand_Logo_Guide.pdf')!
      .async('uint8array')
    const loadedPdf = await PDFDocument.load(unzippedPdfData)
    expect(loadedPdf.getPageCount()).toBe(4)

    // Validate the unzipped PNG
    const unzippedPngData = await unzipped
      .file('01_Primary_Logo/02_PNG_Transparent/test_512.png')!
      .async('nodebuffer')
    const pngMeta = await sharp(unzippedPngData).metadata()
    expect(pngMeta.width).toBe(512)
    expect(pngMeta.format).toBe('png')
  })
})

import { describe, it, expect } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { POST } from '@/app/api/pdf-guide/route'
import { createDemoAssets, DEMO_BRAND_NAME, DEMO_PALETTE } from '@/lib/demo-asset'
import { NextRequest } from 'next/server'

describe('PDF Brand Identity Guide Generation', () => {
  it('generates a multi-page valid PDF from brand data', async () => {
    const assets = createDemoAssets()
    const req = new NextRequest('http://localhost:3000/api/pdf-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandName: DEMO_BRAND_NAME,
        description: 'Demo identity guidelines and specifications',
        assets,
        colors: DEMO_PALETTE,
        clearSpacePercent: 100,
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/pdf')

    const arrayBuffer = await response.arrayBuffer()
    expect(arrayBuffer.byteLength).toBeGreaterThan(10000)

    // Load PDF and verify page count and validity
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    expect(pdfDoc.getPageCount()).toBe(4) // Cover, Colors, Variations, Usage
  })
})

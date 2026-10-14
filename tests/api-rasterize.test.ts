import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/rasterize/route'
import { DEMO_MONOGRAM_SVG } from '@/lib/demo-asset'
import { NextRequest } from 'next/server'
import sharp from 'sharp'

describe('API Rasterize Route Handler', () => {
  it('generates a multi-frame ICO file', async () => {
    const req = new NextRequest('http://localhost:3000/api/rasterize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        svg: DEMO_MONOGRAM_SVG,
        format: 'ico',
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/x-icon')

    const buf = await response.arrayBuffer()
    const buffer = Buffer.from(buf)

    // ICO header checks: reserved=0 (bytes 0-1), type=1 (bytes 2-3), count=3 (bytes 4-5)
    expect(buffer.readUInt16LE(0)).toBe(0)
    expect(buffer.readUInt16LE(2)).toBe(1)
    expect(buffer.readUInt16LE(4)).toBe(3) // 16, 32, 48px frames
  })

  it('generates circular avatars with safe padding', async () => {
    const req = new NextRequest('http://localhost:3000/api/rasterize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        svg: DEMO_MONOGRAM_SVG,
        format: 'png',
        width: 256,
        shape: 'circle',
        paddingPercent: 12,
        backgroundColor: '#141413',
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(200)

    const buf = await response.arrayBuffer()
    const metadata = await sharp(Buffer.from(buf)).metadata()
    expect(metadata.format).toBe('png')
    expect(metadata.width).toBe(256)
    expect(metadata.height).toBe(256)
  })
})

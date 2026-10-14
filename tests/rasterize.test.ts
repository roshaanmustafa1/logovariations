import { describe, it, expect } from 'vitest'
import sharp from 'sharp'
import { DEMO_PRIMARY_SVG } from '@/lib/demo-asset'

describe('Sharp Vector & Raster Conversions', () => {
  it('renders SVG into high-resolution PNG with transparency', async () => {
    const pngBuffer = await sharp(Buffer.from(DEMO_PRIMARY_SVG), { density: 300 })
      .resize(1024, undefined, { fit: 'contain' })
      .png()
      .toBuffer()

    expect(pngBuffer).toBeDefined()
    expect(pngBuffer.length).toBeGreaterThan(1000)

    const metadata = await sharp(pngBuffer).metadata()
    expect(metadata.format).toBe('png')
    expect(metadata.width).toBe(1024)
    expect(metadata.channels).toBe(4) // RGBA (transparency preserved)
  })

  it('renders JPEG with flattened background', async () => {
    const jpegBuffer = await sharp(Buffer.from(DEMO_PRIMARY_SVG), { density: 300 })
      .resize(512, undefined, { fit: 'contain' })
      .flatten({ background: '#FFFFFF' })
      .jpeg({ quality: 90 })
      .toBuffer()

    const metadata = await sharp(jpegBuffer).metadata()
    expect(metadata.format).toBe('jpeg')
    expect(metadata.width).toBe(512)
    expect(metadata.channels).toBe(3) // RGB (opaque)
  })

  it('renders WebP format cleanly', async () => {
    const webpBuffer = await sharp(Buffer.from(DEMO_PRIMARY_SVG), { density: 300 })
      .resize(512, undefined, { fit: 'contain' })
      .webp({ quality: 90 })
      .toBuffer()

    const metadata = await sharp(webpBuffer).metadata()
    expect(metadata.format).toBe('webp')
    expect(metadata.width).toBe(512)
  })
})

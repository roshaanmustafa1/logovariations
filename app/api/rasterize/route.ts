import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'

/**
 * Creates a valid multi-image ICO file from PNG buffers.
 */
function createIcoFile(images: Array<{ buffer: Buffer; width: number; height: number }>): Buffer {
  const count = images.length
  const headerLength = 6
  const dirEntryLength = 16
  let offset = headerLength + dirEntryLength * count

  const header = Buffer.alloc(headerLength)
  header.writeUInt16LE(0, 0) // Reserved
  header.writeUInt16LE(1, 2) // Type 1 = ICO
  header.writeUInt16LE(count, 4) // Count of images

  const entries: Buffer[] = []
  const payloads: Buffer[] = []

  for (const img of images) {
    const entry = Buffer.alloc(dirEntryLength)
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0)
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1)
    entry.writeUInt8(0, 2) // Color palette count
    entry.writeUInt8(0, 3) // Reserved
    entry.writeUInt16LE(1, 4) // Color planes
    entry.writeUInt16LE(32, 6) // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8) // Size in bytes
    entry.writeUInt32LE(offset, 12) // Offset from file start

    entries.push(entry)
    payloads.push(img.buffer)
    offset += img.buffer.length
  }

  return Buffer.concat([header, ...entries, ...payloads])
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      svg,
      format = 'png',
      width = 1024,
      height,
      backgroundColor,
      shape,
      paddingPercent = 0,
    } = body

    if (!svg || typeof svg !== 'string') {
      return NextResponse.json({ error: 'SVG string is required' }, { status: 400 })
    }

    const targetWidth = Math.max(16, Math.min(4096, Number(width) || 1024))
    const targetHeight = height ? Math.max(16, Math.min(4096, Number(height))) : targetWidth

    // If padding is requested, scale SVG inside canvas
    const innerWidth = Math.round(targetWidth * (1 - (paddingPercent * 2) / 100))
    const innerHeight = Math.round(targetHeight * (1 - (paddingPercent * 2) / 100))

    const renderedSvg = svg

    // Build Sharp instance
    const svgBuffer = Buffer.from(renderedSvg)

    if (format === 'ico') {
      // Build 16x16, 32x32, 48x48 PNGs and pack into ICO
      const sizes = [16, 32, 48]
      const icoBuffers: Array<{ buffer: Buffer; width: number; height: number }> = []

      for (const size of sizes) {
        let pipeline = sharp(svgBuffer, { density: 300 }).resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })

        if (backgroundColor && backgroundColor !== 'transparent') {
          pipeline = pipeline.flatten({ background: backgroundColor })
        }

        const pngBuf = await pipeline.png().toBuffer()
        icoBuffers.push({ buffer: pngBuf, width: size, height: size })
      }

      const ico = createIcoFile(icoBuffers)
      return new NextResponse(new Uint8Array(ico), {
        headers: {
          'Content-Type': 'image/x-icon',
          'Content-Disposition': 'inline; filename="favicon.ico"',
        },
      })
    }

    // Standard rasterization
    let pipeline = sharp(svgBuffer, { density: 300 })

    if (paddingPercent > 0) {
      pipeline = pipeline
        .resize(innerWidth, innerHeight, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .extend({
          top: Math.round((targetHeight - innerHeight) / 2),
          bottom: targetHeight - innerHeight - Math.round((targetHeight - innerHeight) / 2),
          left: Math.round((targetWidth - innerWidth) / 2),
          right: targetWidth - innerWidth - Math.round((targetWidth - innerWidth) / 2),
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
    } else {
      pipeline = pipeline.resize(targetWidth, targetHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
    }

    // Apply circular avatar mask if requested
    if (shape === 'circle') {
      const radius = Math.floor(Math.min(targetWidth, targetHeight) / 2)
      const circleSvg = Buffer.from(
        `<svg width="${targetWidth}" height="${targetHeight}"><circle cx="${targetWidth / 2}" cy="${targetHeight / 2}" r="${radius}" fill="black"/></svg>`
      )
      const current = await pipeline.png().toBuffer()

      pipeline = sharp(current).composite([
        {
          input: circleSvg,
          blend: 'dest-in',
        },
      ])
    }

    // Handle background
    if (backgroundColor && backgroundColor !== 'transparent') {
      pipeline = pipeline.flatten({ background: backgroundColor })
    }

    let outputBuffer: Buffer
    let contentType = 'image/png'

    if (format === 'jpg' || format === 'jpeg') {
      // JPEG requires a background color to avoid black voids
      const bg = backgroundColor && backgroundColor !== 'transparent' ? backgroundColor : '#FFFFFF'
      pipeline = pipeline.flatten({ background: bg })
      outputBuffer = await pipeline.jpeg({ quality: 95 }).toBuffer()
      contentType = 'image/jpeg'
    } else if (format === 'webp') {
      outputBuffer = await pipeline.webp({ quality: 90 }).toBuffer()
      contentType = 'image/webp'
    } else {
      // Default PNG
      outputBuffer = await pipeline.png({ compressionLevel: 8 }).toBuffer()
      contentType = 'image/png'
    }

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Rasterization error:', error)
    return NextResponse.json(
      { error: 'Image processing failed', details: message },
      { status: 500 }
    )
  }
}

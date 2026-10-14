import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib'
import sharp from 'sharp'
import { BrandColor, LogoAsset } from '@/types/brand'
import { recolorSvg } from '@/features/svg/recolor'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      brandName = 'Brand Identity',
      description = '',
      assets = [] as LogoAsset[],
      colors = [] as BrandColor[],
      clearSpacePercent = 100,
    } = body

    const pdfDoc = await PDFDocument.create()
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const primaryAsset = assets.find((a: LogoAsset) => a.role === 'primary') || assets[0]

    // Helper to render an SVG to PNG Buffer via sharp
    const renderSvgPng = async (svgStr: string, width = 1000): Promise<Buffer | null> => {
      try {
        if (!svgStr) return null
        return await sharp(Buffer.from(svgStr), { density: 300 })
          .resize(width, undefined, { fit: 'contain' })
          .png()
          .toBuffer()
      } catch (e) {
        console.error('Failed to render SVG for PDF:', e)
        return null
      }
    }

    // ----------------------------------------------------
    // PAGE 1: COVER
    // ----------------------------------------------------
    const page1 = pdfDoc.addPage(PageSizes.A4) // 595.28 x 841.89
    const { width, height } = page1.getSize()

    // Decorative warm accent bar
    page1.drawRectangle({
      x: 0,
      y: height - 12,
      width: width,
      height: 12,
      color: rgb(1, 0.396, 0.043), // #FF650B
    })

    // Subtitle
    page1.drawText('BRAND IDENTITY GUIDELINES & ASSET SPECIFICATIONS', {
      x: 50,
      y: height - 80,
      size: 9,
      font: fontBold,
      color: rgb(0.45, 0.45, 0.45),
    })

    // Brand Name Title
    page1.drawText(brandName.toUpperCase(), {
      x: 50,
      y: height - 120,
      size: 32,
      font: fontBold,
      color: rgb(0.12, 0.12, 0.12),
    })

    if (description) {
      page1.drawText(description.slice(0, 120), {
        x: 50,
        y: height - 145,
        size: 11,
        font: fontRegular,
        color: rgb(0.35, 0.35, 0.35),
      })
    }

    // Primary Logo Showcase Box
    page1.drawRectangle({
      x: 50,
      y: 200,
      width: width - 100,
      height: 420,
      color: rgb(0.97, 0.97, 0.96),
      borderColor: rgb(0.91, 0.90, 0.88),
      borderWidth: 1,
    })

    if (primaryAsset) {
      const primaryPng = await renderSvgPng(primaryAsset.sanitizedSvg, 1200)
      if (primaryPng) {
        const embeddedImg = await pdfDoc.embedPng(primaryPng)
        const imgDims = embeddedImg.scaleToFit(width - 160, 320)
        page1.drawImage(embeddedImg, {
          x: 50 + (width - 100 - imgDims.width) / 2,
          y: 200 + (420 - imgDims.height) / 2,
          width: imgDims.width,
          height: imgDims.height,
        })
      }
    }

    // Cover Footer
    page1.drawText(`Generated with LogoPack Studio  •  ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, {
      x: 50,
      y: 60,
      size: 9,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    })

    // ----------------------------------------------------
    // PAGE 2: BRAND COLOR PALETTE
    // ----------------------------------------------------
    const page2 = pdfDoc.addPage(PageSizes.A4)

    page2.drawText('01. COLOR SYSTEM', {
      x: 50,
      y: height - 60,
      size: 9,
      font: fontBold,
      color: rgb(1, 0.396, 0.043),
    })

    page2.drawText('Brand Color Palette', {
      x: 50,
      y: height - 90,
      size: 24,
      font: fontBold,
      color: rgb(0.12, 0.12, 0.12),
    })

    page2.drawText('Consistent reproduction across digital displays (RGB) and print materials (CMYK estimate).', {
      x: 50,
      y: height - 110,
      size: 10,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    })

    let colorY = height - 160
    for (let i = 0; i < Math.min(colors.length, 6); i++) {
      const col = colors[i]
      const r = col.rgb.r / 255
      const g = col.rgb.g / 255
      const b = col.rgb.b / 255

      // Swatch Card Background
      page2.drawRectangle({
        x: 50,
        y: colorY - 70,
        width: width - 100,
        height: 70,
        color: rgb(0.98, 0.98, 0.98),
        borderColor: rgb(0.9, 0.9, 0.9),
        borderWidth: 1,
      })

      // Swatch color square
      page2.drawRectangle({
        x: 60,
        y: colorY - 60,
        width: 50,
        height: 50,
        color: rgb(r, g, b),
      })

      // Labels
      page2.drawText(col.name, {
        x: 130,
        y: colorY - 30,
        size: 14,
        font: fontBold,
        color: rgb(0.12, 0.12, 0.12),
      })

      page2.drawText(`HEX: ${col.hex}   |   RGB: ${col.rgb.r}, ${col.rgb.g}, ${col.rgb.b}   |   CMYK (est): C${col.cmyk.c}% M${col.cmyk.m}% Y${col.cmyk.y}% K${col.cmyk.k}%`, {
        x: 130,
        y: colorY - 50,
        size: 10,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      })

      colorY -= 85
    }

    // ----------------------------------------------------
    // PAGE 3: LOGO VARIATIONS (B&W & MONOCHROMES)
    // ----------------------------------------------------
    const page3 = pdfDoc.addPage(PageSizes.A4)

    page3.drawText('02. LOGO VERSIONS', {
      x: 50,
      y: height - 60,
      size: 9,
      font: fontBold,
      color: rgb(1, 0.396, 0.043),
    })

    page3.drawText('Monochrome Reproductions', {
      x: 50,
      y: height - 90,
      size: 24,
      font: fontBold,
      color: rgb(0.12, 0.12, 0.12),
    })

    if (primaryAsset) {
      // Solid Black on White Box
      page3.drawRectangle({
        x: 50,
        y: height - 280,
        width: width - 100,
        height: 160,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.88, 0.88, 0.88),
        borderWidth: 1,
      })

      page3.drawText('Solid Black Version (Light Backgrounds)', {
        x: 65,
        y: height - 140,
        size: 10,
        font: fontBold,
        color: rgb(0.3, 0.3, 0.3),
      })

      const blackSvg = recolorSvg(primaryAsset.sanitizedSvg, { mode: 'black' })
      const blackPng = await renderSvgPng(blackSvg, 800)
      if (blackPng) {
        const blackImg = await pdfDoc.embedPng(blackPng)
        const dims = blackImg.scaleToFit(width - 150, 100)
        page3.drawImage(blackImg, {
          x: 50 + (width - 100 - dims.width) / 2,
          y: height - 265 + (110 - dims.height) / 2,
          width: dims.width,
          height: dims.height,
        })
      }

      // Solid White on Dark Box
      page3.drawRectangle({
        x: 50,
        y: height - 480,
        width: width - 100,
        height: 160,
        color: rgb(0.12, 0.12, 0.12),
      })

      page3.drawText('Solid White Reverse Version (Dark Backgrounds)', {
        x: 65,
        y: height - 340,
        size: 10,
        font: fontBold,
        color: rgb(0.8, 0.8, 0.8),
      })

      const whiteSvg = recolorSvg(primaryAsset.sanitizedSvg, { mode: 'white' })
      const whitePng = await renderSvgPng(whiteSvg, 800)
      if (whitePng) {
        const whiteImg = await pdfDoc.embedPng(whitePng)
        const dims = whiteImg.scaleToFit(width - 150, 100)
        page3.drawImage(whiteImg, {
          x: 50 + (width - 100 - dims.width) / 2,
          y: height - 465 + (110 - dims.height) / 2,
          width: dims.width,
          height: dims.height,
        })
      }
    }

    // ----------------------------------------------------
    // PAGE 4: CLEAR SPACE & USAGE
    // ----------------------------------------------------
    const page4 = pdfDoc.addPage(PageSizes.A4)

    page4.drawText('03. APPLICATION RULES', {
      x: 50,
      y: height - 60,
      size: 9,
      font: fontBold,
      color: rgb(1, 0.396, 0.043),
    })

    page4.drawText('Clear Space & Minimum Sizing', {
      x: 50,
      y: height - 90,
      size: 24,
      font: fontBold,
      color: rgb(0.12, 0.12, 0.12),
    })

    page4.drawText(`Ensure a minimum exclusion zone of ${clearSpacePercent}% around the mark to preserve legibility and brand impact.`, {
      x: 50,
      y: height - 110,
      size: 10,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    })

    // Guidelines checklist
    const rules = [
      '• Do not stretch, condense, or distort the proportions of any logo mark.',
      '• Do not change the approved color values or create unauthorized gradients.',
      '• Ensure adequate contrast against photography or textured surfaces.',
      '• Use the vector SVG/PDF formats for large-format signage and commercial printing.',
      '• Use PNG with transparent backgrounds for digital UI and web integrations.',
    ]

    let ruleY = height - 160
    rules.forEach((rule) => {
      page4.drawText(rule, {
        x: 60,
        y: ruleY,
        size: 11,
        font: fontRegular,
        color: rgb(0.25, 0.25, 0.25),
      })
      ruleY -= 30
    })

    // Save and return PDF
    const pdfBytes = await pdfDoc.save()

    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${brandName}_Brand_Logo_Guide.pdf"`,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'PDF generation failed', details: message },
      { status: 500 }
    )
  }
}

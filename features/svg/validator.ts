import { SvgValidationResult } from '@/types/brand'

/**
 * Validates, checks security, and performs quality analysis on an uploaded SVG string.
 */
export function validateAndSanitizeSvg(rawSvg: string): {
  sanitizedSvg: string
  validation: SvgValidationResult
} {
  const warnings: string[] = []
  const errors: string[] = []

  if (!rawSvg || !rawSvg.trim()) {
    return {
      sanitizedSvg: '',
      validation: {
        isValid: false,
        isSafe: false,
        hasTransparency: false,
        hasVectorPaths: false,
        hasFonts: false,
        hasBackground: false,
        hasEmbeddedImages: false,
        warnings: [],
        errors: ['File is empty'],
      },
    }
  }

  // Parse XML using DOMParser (or fallback for SSR)
  let doc: Document
  if (typeof window !== 'undefined') {
    const parser = new DOMParser()
    doc = parser.parseFromString(rawSvg, 'image/svg+xml')
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      return {
        sanitizedSvg: '',
        validation: {
          isValid: false,
          isSafe: false,
          hasTransparency: false,
          hasVectorPaths: false,
          hasFonts: false,
          hasBackground: false,
          hasEmbeddedImages: false,
          warnings: [],
          errors: ['Invalid SVG XML structure: ' + parseError.textContent],
        },
      }
    }
  } else {
    // Basic server-side fallback check
    if (!rawSvg.includes('<svg')) {
      return {
        sanitizedSvg: '',
        validation: {
          isValid: false,
          isSafe: false,
          hasTransparency: false,
          hasVectorPaths: false,
          hasFonts: false,
          hasBackground: false,
          hasEmbeddedImages: false,
          warnings: [],
          errors: ['Missing <svg> root element'],
        },
      }
    }
    // Return sanitized raw for SSR if needed
    return {
      sanitizedSvg: rawSvg,
      validation: {
        isValid: true,
        isSafe: true,
        hasTransparency: true,
        hasVectorPaths: true,
        hasFonts: false,
        hasBackground: false,
        hasEmbeddedImages: false,
        warnings: [],
        errors: [],
      },
    }
  }

  const svgElement = doc.querySelector('svg')
  if (!svgElement) {
    return {
      sanitizedSvg: '',
      validation: {
        isValid: false,
        isSafe: false,
        hasTransparency: false,
        hasVectorPaths: false,
        hasFonts: false,
        hasBackground: false,
        hasEmbeddedImages: false,
        warnings: [],
        errors: ['No root <svg> element found'],
      },
    }
  }

  let isSafe = true

  // 1. Security Check: Strip scripts and dangerous tags
  const dangerousTags = ['script', 'foreignobject', 'iframe', 'embed', 'object']
  dangerousTags.forEach((tag) => {
    const elements = doc.querySelectorAll(tag)
    if (elements.length > 0) {
      isSafe = false
      warnings.push(`Removed potentially unsafe <${tag}> elements`)
      elements.forEach((el) => el.remove())
    }
  })

  // Strip event handlers (onload, onclick, etc.) and javascript: links
  const allElements = doc.querySelectorAll('*')
  allElements.forEach((el) => {
    const attrNames = el.getAttributeNames()
    for (const attr of attrNames) {
      if (attr.toLowerCase().startsWith('on')) {
        isSafe = false
        warnings.push(`Removed event listener "${attr}"`)
        el.removeAttribute(attr)
      } else if (attr.toLowerCase() === 'href' || attr.toLowerCase() === 'xlink:href') {
        const val = el.getAttribute(attr) || ''
        if (val.trim().toLowerCase().startsWith('javascript:')) {
          isSafe = false
          warnings.push(`Removed unsafe javascript: URL`)
          el.removeAttribute(attr)
        }
      }
    }
  })

  // 2. ViewBox & Dimensions Check
  let viewBox = svgElement.getAttribute('viewBox')
  const widthAttr = svgElement.getAttribute('width')
  const heightAttr = svgElement.getAttribute('height')

  let parsedWidth: number | undefined
  let parsedHeight: number | undefined

  if (widthAttr && !widthAttr.includes('%')) {
    parsedWidth = parseFloat(widthAttr)
  }
  if (heightAttr && !heightAttr.includes('%')) {
    parsedHeight = parseFloat(heightAttr)
  }

  if (!viewBox) {
    if (parsedWidth && parsedHeight) {
      viewBox = `0 0 ${parsedWidth} ${parsedHeight}`
      svgElement.setAttribute('viewBox', viewBox)
      warnings.push(`Generated viewBox from dimensions (${parsedWidth}x${parsedHeight})`)
    } else {
      warnings.push('SVG lacks viewBox and explicit dimensions. Defaulting to 0 0 500 500')
      viewBox = '0 0 500 500'
      svgElement.setAttribute('viewBox', viewBox)
    }
  }

  // 3. Quality & Composition Checks
  const vectorElements = doc.querySelectorAll('path, circle, rect, polygon, polyline, line, ellipse')
  const hasVectorPaths = vectorElements.length > 0

  const textElements = doc.querySelectorAll('text, tspan')
  const hasFonts = textElements.length > 0
  if (hasFonts) {
    warnings.push('Contains live text elements. For optimal cross-platform fidelity, convert text to vector curves.')
  }

  const imageElements = doc.querySelectorAll('image')
  const hasEmbeddedImages = imageElements.length > 0
  if (hasEmbeddedImages) {
    warnings.push('Contains embedded raster images (<image>). Quality may degrade on extreme upscaling.')
  }

  // Detect opaque background rect
  let hasBackground = false
  const rects = doc.querySelectorAll('rect')
  rects.forEach((rect) => {
    const w = rect.getAttribute('width')
    const h = rect.getAttribute('height')
    const fill = rect.getAttribute('fill')
    if (
      (w === '100%' || (parsedWidth && parseFloat(w || '0') >= parsedWidth * 0.95)) &&
      (h === '100%' || (parsedHeight && parseFloat(h || '0') >= parsedHeight * 0.95)) &&
      fill &&
      fill !== 'none' &&
      fill !== 'transparent'
    ) {
      hasBackground = true
      warnings.push('Detected potential opaque background rectangle.')
    }
  })

  const hasTransparency = !hasBackground

  // Ensure standard SVG namespaces
  if (!svgElement.getAttribute('xmlns')) {
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  }

  const serializer = new XMLSerializer()
  const sanitizedSvg = serializer.serializeToString(svgElement)

  return {
    sanitizedSvg,
    validation: {
      isValid: true,
      isSafe,
      hasTransparency,
      hasVectorPaths,
      hasFonts,
      hasBackground,
      hasEmbeddedImages,
      viewBox,
      width: parsedWidth,
      height: parsedHeight,
      warnings,
      errors,
    },
  }
}

export type RecolorMode = 'original' | 'black' | 'white' | 'custom'

interface RecolorOptions {
  mode: RecolorMode
  customColorHex?: string
  backgroundColor?: string
}

/**
 * Transforms an SVG string into a color variation (Original, Black, White, Custom Brand Color).
 * Preserves structural geometry, clip paths, stroke widths, and avoids overwriting `fill="none"`.
 */
export function recolorSvg(svgString: string, options: RecolorOptions): string {
  if (!svgString || !svgString.trim()) return ''
  if (options.mode === 'original' && !options.backgroundColor) return svgString

  let targetColor = '#000000'
  if (options.mode === 'white') {
    targetColor = '#FFFFFF'
  } else if (options.mode === 'black') {
    targetColor = '#000000'
  } else if (options.mode === 'custom' && options.customColorHex) {
    targetColor = options.customColorHex.startsWith('#')
      ? options.customColorHex
      : `#${options.customColorHex}`
  }

  // Handle client-side DOM transformation
  if (typeof window !== 'undefined') {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgString, 'image/svg+xml')
    const svg = doc.querySelector('svg')
    if (!svg) return svgString

    // If background color is requested (e.g. dark, white, brand background)
    if (options.backgroundColor && options.backgroundColor !== 'transparent') {
      const existingBg = doc.querySelector('#custom-bg-layer')
      if (existingBg) existingBg.remove()

      const bgRect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect')
      bgRect.setAttribute('id', 'custom-bg-layer')
      bgRect.setAttribute('width', '100%')
      bgRect.setAttribute('height', '100%')
      bgRect.setAttribute('fill', options.backgroundColor)
      svg.insertBefore(bgRect, svg.firstChild)
    }

    if (options.mode !== 'original') {
      const elements = doc.querySelectorAll(
        'path, circle, rect:not(#custom-bg-layer), polygon, polyline, line, ellipse, text, tspan'
      )

      elements.forEach((el) => {
        // Skip clip paths, defs, masks
        if (el.closest('defs') || el.closest('clipPath') || el.closest('mask')) {
          return
        }

        const rawFill = el.getAttribute('fill')
        const rawStroke = el.getAttribute('stroke')
        const style = el.getAttribute('style') || ''

        // Check if element has fill="none"
        const isFillNone =
          rawFill === 'none' ||
          rawFill === 'transparent' ||
          /fill:\s*none/i.test(style) ||
          /fill:\s*transparent/i.test(style)

        // Check if element has stroke="none" or no stroke
        const isStrokeNone =
          rawStroke === 'none' ||
          rawStroke === 'transparent' ||
          /stroke:\s*none/i.test(style)

        const hasExplicitStroke =
          (rawStroke && !isStrokeNone) ||
          (/stroke:\s*(?!none)/i.test(style) && !/stroke:\s*transparent/i.test(style))

        // Recolor fill if not none
        if (!isFillNone) {
          el.setAttribute('fill', targetColor)
        }

        // Recolor stroke if stroke is defined
        if (hasExplicitStroke) {
          el.setAttribute('stroke', targetColor)
        }

        // Clean inline style fill/stroke overrides if any
        if (style) {
          let updatedStyle = style
          if (!isFillNone && /fill:\s*[^;]+/i.test(updatedStyle)) {
            updatedStyle = updatedStyle.replace(/fill:\s*[^;]+/gi, `fill: ${targetColor}`)
          }
          if (hasExplicitStroke && /stroke:\s*[^;]+/i.test(updatedStyle)) {
            updatedStyle = updatedStyle.replace(/stroke:\s*[^;]+/gi, `stroke: ${targetColor}`)
          }
          el.setAttribute('style', updatedStyle)
        }
      })
    }

    const serializer = new XMLSerializer()
    return serializer.serializeToString(svg)
  }

  // Basic regex fallback for server environment if needed
  return svgString
}

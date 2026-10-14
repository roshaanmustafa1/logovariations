import { CmykColor, RgbColor } from '@/types/brand'

export function normalizeHex(input: string): string {
  let clean = input.trim()
  if (!clean.startsWith('#')) {
    clean = '#' + clean
  }
  // If 3-character hex (#RGB), convert to #RRGGBB
  if (clean.length === 4) {
    clean = '#' + clean[1] + clean[1] + clean[2] + clean[2] + clean[3] + clean[3]
  }
  return clean.toUpperCase()
}

export function isValidHex(hex: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim())
}

export function hexToRgb(hex: string): RgbColor {
  const normalized = normalizeHex(hex)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
  if (!result) {
    return { r: 0, g: 0, b: 0 }
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

export function rgbToHex(rgb: RgbColor): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)))
    return clamped.toString(16).padStart(2, '0').toUpperCase()
  }
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

/**
 * Calculates estimated CMYK values (0-100%).
 * Note: CMYK estimation without ICC color profiles is an approximation.
 */
export function rgbToCmyk(rgb: RgbColor): CmykColor {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const k = 1 - Math.max(r, g, b)
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 }
  }

  const c = Math.round(((1 - r - k) / (1 - k)) * 100)
  const m = Math.round(((1 - g - k) / (1 - k)) * 100)
  const y = Math.round(((1 - b - k) / (1 - k)) * 100)
  const kVal = Math.round(k * 100)

  return {
    c: Math.max(0, Math.min(100, c)),
    m: Math.max(0, Math.min(100, m)),
    y: Math.max(0, Math.min(100, y)),
    k: Math.max(0, Math.min(100, kVal)),
  }
}

export function generateSafeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'brand-assets'
}

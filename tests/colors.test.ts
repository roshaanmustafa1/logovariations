import { describe, it, expect } from 'vitest'
import {
  normalizeHex,
  isValidHex,
  hexToRgb,
  rgbToHex,
  rgbToCmyk,
  generateSafeSlug,
} from '@/features/colors/converters'

describe('Color Converters & Slug Utility', () => {
  it('normalizes 3-char and 6-char hex codes', () => {
    expect(normalizeHex('#fff')).toBe('#FFFFFF')
    expect(normalizeHex('ff650b')).toBe('#FF650B')
    expect(normalizeHex('#a68248')).toBe('#A68248')
  })

  it('validates hex codes correctly', () => {
    expect(isValidHex('#FF650B')).toBe(true)
    expect(isValidHex('A68248')).toBe(true)
    expect(isValidHex('#fff')).toBe(true)
    expect(isValidHex('invalid-hex')).toBe(false)
    expect(isValidHex('#12345')).toBe(false)
  })

  it('converts HEX to RGB correctly', () => {
    const rgb = hexToRgb('#FF650B')
    expect(rgb).toEqual({ r: 255, g: 101, b: 11 })

    const black = hexToRgb('#000000')
    expect(black).toEqual({ r: 0, g: 0, b: 0 })

    const white = hexToRgb('#FFFFFF')
    expect(white).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('converts RGB to HEX correctly', () => {
    expect(rgbToHex({ r: 255, g: 101, b: 11 })).toBe('#FF650B')
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#FFFFFF')
  })

  it('estimates CMYK accurately within expected bounds', () => {
    // Pure black
    const cmykBlack = rgbToCmyk({ r: 0, g: 0, b: 0 })
    expect(cmykBlack.k).toBe(100)

    // Pure white
    const cmykWhite = rgbToCmyk({ r: 255, g: 255, b: 255 })
    expect(cmykWhite).toEqual({ c: 0, m: 0, y: 0, k: 0 })

    // Orange (#FF650B) -> roughly C:0% M:60% Y:96% K:0%
    const cmykOrange = rgbToCmyk({ r: 255, g: 101, b: 11 })
    expect(cmykOrange.c).toBe(0)
    expect(cmykOrange.m).toBeGreaterThan(50)
    expect(cmykOrange.y).toBeGreaterThan(90)
    expect(cmykOrange.k).toBe(0)
  })

  it('generates clean, safe slugs', () => {
    expect(generateSafeSlug('Gehnay By Sam')).toBe('gehnay-by-sam')
    expect(generateSafeSlug('Acme & Co. (Studio) #1!')).toBe('acme-co-studio-1')
    expect(generateSafeSlug('   spaced  brand   ')).toBe('spaced-brand')
    expect(generateSafeSlug('')).toBe('brand-assets')
  })
})

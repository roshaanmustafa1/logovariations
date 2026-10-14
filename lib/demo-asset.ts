import { BrandColor, LogoAsset } from '@/types/brand'
import { hexToRgb, rgbToCmyk } from '@/features/colors/converters'

export const DEMO_BRAND_NAME = 'Gehnay By Sam'

export const DEMO_PALETTE: BrandColor[] = [
  {
    id: 'demo-color-1',
    name: 'Copper',
    hex: '#A68248',
    rgb: hexToRgb('#A68248'),
    cmyk: rgbToCmyk(hexToRgb('#A68248')),
  },
  {
    id: 'demo-color-2',
    name: 'Pearl',
    hex: '#EFE3D5',
    rgb: hexToRgb('#EFE3D5'),
    cmyk: rgbToCmyk(hexToRgb('#EFE3D5')),
  },
  {
    id: 'demo-color-3',
    name: 'Sand',
    hex: '#D8C5A1',
    rgb: hexToRgb('#D8C5A1'),
    cmyk: rgbToCmyk(hexToRgb('#D8C5A1')),
  },
]

export const DEMO_PRIMARY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="100%" height="100%">
  <g id="mark" transform="translate(10, 10)">
    <circle cx="50" cy="50" r="46" fill="none" stroke="#A68248" stroke-width="4" stroke-dasharray="2 3" opacity="0.6"/>
    <path d="M 50 15 C 69.33 15 85 30.67 85 50 C 85 69.33 69.33 85 50 85 C 30.67 85 15 69.33 15 50 C 15 30.67 30.67 15 50 15 Z" fill="none" stroke="#A68248" stroke-width="3"/>
    <path d="M 50 25 C 63.8 25 75 36.2 75 50 C 75 63.8 63.8 75 50 75 C 36.2 75 25 63.8 25 50" fill="none" stroke="#A68248" stroke-width="5" stroke-linecap="round"/>
    <path d="M 50 50 L 72 50" fill="none" stroke="#A68248" stroke-width="5" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="5" fill="#A68248"/>
  </g>
  <g id="text" transform="translate(130, 25)">
    <text x="0" y="42" font-family="'Cinzel', 'Playfair Display', 'Times New Roman', serif" font-size="34" font-weight="700" letter-spacing="6" fill="#A68248">GEHNAY</text>
    <text x="3" y="68" font-family="'Inter', 'Montserrat', sans-serif" font-size="12" font-weight="500" letter-spacing="8" fill="#D8C5A1">BY SAM</text>
    <line x1="0" y1="52" x2="220" y2="52" stroke="#EFE3D5" stroke-width="1" opacity="0.8"/>
  </g>
</svg>`

export const DEMO_MONOGRAM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <circle cx="100" cy="100" r="90" fill="none" stroke="#A68248" stroke-width="6"/>
  <circle cx="100" cy="100" r="80" fill="none" stroke="#D8C5A1" stroke-width="2" stroke-dasharray="4 4"/>
  <path d="M 100 45 C 130.38 45 155 69.62 155 100 C 155 130.38 130.38 155 100 155 C 69.62 155 45 130.38 45 100 C 45 69.62 69.62 45 100 45 Z" fill="none" stroke="#A68248" stroke-width="4"/>
  <path d="M 100 62 C 120.98 62 138 79.02 138 100 C 138 120.98 120.98 138 100 138 C 79.02 138 62 120.98 62 100" fill="none" stroke="#A68248" stroke-width="8" stroke-linecap="round"/>
  <path d="M 100 100 L 132 100" fill="none" stroke="#A68248" stroke-width="8" stroke-linecap="round"/>
  <circle cx="100" cy="100" r="8" fill="#A68248"/>
</svg>`

export function createDemoAssets(): LogoAsset[] {
  return [
    {
      id: 'demo-primary',
      filename: 'gehnay-primary-logo.svg',
      fileSize: 1840,
      role: 'primary',
      originalSvg: DEMO_PRIMARY_SVG,
      sanitizedSvg: DEMO_PRIMARY_SVG,
      order: 0,
      description: 'Primary horizontal lockup with monogram and brand typography',
      validation: {
        isValid: true,
        isSafe: true,
        hasTransparency: true,
        hasVectorPaths: true,
        hasFonts: true,
        hasBackground: false,
        hasEmbeddedImages: false,
        viewBox: '0 0 400 120',
        width: 400,
        height: 120,
        warnings: [],
        errors: [],
      },
    },
    {
      id: 'demo-monogram',
      filename: 'gehnay-monogram-symbol.svg',
      fileSize: 1120,
      role: 'monogram',
      originalSvg: DEMO_MONOGRAM_SVG,
      sanitizedSvg: DEMO_MONOGRAM_SVG,
      order: 1,
      description: 'Circular monogram mark for icons, favicons, and avatars',
      validation: {
        isValid: true,
        isSafe: true,
        hasTransparency: true,
        hasVectorPaths: true,
        hasFonts: false,
        hasBackground: false,
        hasEmbeddedImages: false,
        viewBox: '0 0 200 200',
        width: 200,
        height: 200,
        warnings: [],
        errors: [],
      },
    },
  ]
}

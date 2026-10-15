import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  rewrites() {
    return Promise.resolve([
      {
        source: '/background-removal-assets/:path*',
        destination: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/:path*',
      },
    ])
  },
}

export default nextConfig

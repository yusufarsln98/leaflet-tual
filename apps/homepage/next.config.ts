import type { NextConfig } from 'next'
import path from 'node:path'
import { readFileSync, existsSync } from 'node:fs'

let appVersion = ''
const leafletTualPkgPath = path.resolve(__dirname, '../../packages/leaflet-tual/package.json')
if (existsSync(leafletTualPkgPath)) {
  try {
    const pkg = JSON.parse(readFileSync(leafletTualPkgPath, 'utf-8'))
    appVersion = pkg.version
  } catch {
    // ignore
  }
}

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://*.basemaps.cartocdn.com https://unpkg.com;
  font-src 'self' data:;
  connect-src 'self' https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://*.basemaps.cartocdn.com https://va.vercel-scripts.com https://vitals.vercel-insights.com;
  frame-ancestors 'self';
  form-action 'self';
  base-uri 'self';
`
  .replace(/\s{2,}/g, ' ')
  .trim()

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: cspHeader,
  },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ['leaflet-tual'],
  turbopack: {
    root: path.resolve(__dirname, '../../'),
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  webpack(config) {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...config.resolve.alias,
      'leaflet-tual$': path.resolve(__dirname, '../../packages/leaflet-tual/src/index.ts'),
      'leaflet-tual/core': path.resolve(__dirname, '../../packages/leaflet-tual/src/index.ts'),
      'leaflet-tual/react': path.resolve(__dirname, '../../packages/leaflet-tual/src/react.ts'),
    }
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.jsx': ['.tsx', '.jsx'],
    }
    return config
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig

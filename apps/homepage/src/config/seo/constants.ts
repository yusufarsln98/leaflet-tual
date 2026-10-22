import { VERSION } from 'leaflet-tual'

export const SEO_CONSTANTS = {
  siteUrl: 'https://leaflet-tual.dev',
  siteName: 'leaflet-tual',
  titleDefault: 'leaflet-tual — Geo-Synchronized Canvas & Annotation Toolkit for Leaflet',
  titleTemplate: '%s | leaflet-tual',
  descriptionDefault:
    'High-performance, framework-agnostic vector canvas toolkit for Leaflet with optional React bindings. Draw vector arrows, geometric shapes, pinned sticky notes, and freehand sketches with zero coordinate drift.',
  authorName: 'Yusuf Arslan',
  authorUrl: 'https://github.com/yusufarsln98',
  publisher: 'Yusuf Arslan',
  googleVerification: '',
  githubRepoUrl: 'https://github.com/yusufarsln98/leaflet-tual',
  npmPkgUrl: 'https://www.npmjs.com/package/leaflet-tual',
  licenseUrl: 'https://github.com/yusufarsln98/leaflet-tual/blob/main/LICENSE',
  ogImage: '/logo.svg',
  logoImage: '/logo.svg',
  locale: 'en_US',
  currentVersion: VERSION,
} as const

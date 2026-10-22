import { Metadata } from 'next'
import { SEO_CONSTANTS } from './constants'
import { SEO_KEYWORDS } from './keywords'

export const globalMetadata: Metadata = {
  metadataBase: new URL(SEO_CONSTANTS.siteUrl),
  title: {
    default: SEO_CONSTANTS.titleDefault,
    template: SEO_CONSTANTS.titleTemplate,
  },
  description: SEO_CONSTANTS.descriptionDefault,
  keywords: SEO_KEYWORDS,
  authors: [{ name: SEO_CONSTANTS.authorName, url: SEO_CONSTANTS.authorUrl }],
  creator: SEO_CONSTANTS.authorName,
  publisher: SEO_CONSTANTS.publisher,
  category: 'technology',
  classification: 'Geospatial Web Libraries, Map Annotations & Vector Canvas',

  verification: {
    google: SEO_CONSTANTS.googleVerification,
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: SEO_CONSTANTS.logoImage,
    apple: SEO_CONSTANTS.logoImage,
  },

  openGraph: {
    type: 'website',
    locale: SEO_CONSTANTS.locale,
    url: SEO_CONSTANTS.siteUrl,
    siteName: SEO_CONSTANTS.siteName,
    title: 'leaflet-canvas — Geo-Synchronized Vector Canvas for Leaflet',
    description:
      'High-performance, framework-agnostic vector canvas toolkit for Leaflet with optional React bindings. Draw vector arrows, geometric shapes, and pinned sticky notes with zero coordinate drift.',
    images: [
      {
        url: SEO_CONSTANTS.ogImage,
        width: 512,
        height: 512,
        alt: 'leaflet-canvas logo',
        type: 'image/svg+xml',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'leaflet-canvas — Precision Canvas for Leaflet',
    description:
      'High-performance vector arrows, geometric annotations, and draggable notes locked to geographic coordinates.',
    images: [SEO_CONSTANTS.ogImage],
  },
}

export const homeMetadata: Metadata = {
  title: 'leaflet-canvas — Interactive Vector Canvas for Leaflet',
  description:
    'High-performance, framework-agnostic vector canvas toolkit for Leaflet with optional React bindings. Draw vector arrows, geometric shapes, and pinned sticky notes with zero coordinate drift.',
  keywords: SEO_KEYWORDS,
  alternates: {
    canonical: SEO_CONSTANTS.siteUrl,
  },
  openGraph: {
    ...globalMetadata.openGraph,
    title: 'leaflet-canvas — Interactive Vector Canvas for Leaflet',
    description:
      'High-performance, framework-agnostic vector canvas toolkit for Leaflet with optional React bindings. Draw vector arrows, geometric shapes, and pinned sticky notes with zero coordinate drift.',
    url: SEO_CONSTANTS.siteUrl,
  },
  twitter: {
    ...globalMetadata.twitter,
    title: 'leaflet-canvas — Interactive Vector Canvas for Leaflet',
    description:
      'High-performance vector arrows, geometric annotations, and draggable notes locked to geographic coordinates with zero pixel-drift.',
  },
}

export const docsMetadata: Metadata = {
  title: 'Documentation — leaflet-canvas',
  description:
    'Comprehensive guides, API references, geographic projection math, and code recipes for integrating leaflet-canvas with Leaflet in Vanilla JS and React.',
  alternates: {
    canonical: `${SEO_CONSTANTS.siteUrl}/docs`,
  },
}

export const demoMetadata: Metadata = {
  title: 'Interactive Live Demo — leaflet-canvas',
  description:
    'Interactive live Leaflet canvas workbench. Test vector arrows, Bézier curves, geometric shapes, sticky notes, and preset scenarios with zero pixel-drift.',
  alternates: {
    canonical: `${SEO_CONSTANTS.siteUrl}/demo`,
  },
}

export const changelogMetadata: Metadata = {
  title: 'Changelog & Releases — leaflet-canvas',
  description:
    'Full historical timeline of all releases, architectural upgrades, and bug fixes across leaflet-canvas.',
  alternates: {
    canonical: `${SEO_CONSTANTS.siteUrl}/releases`,
  },
}

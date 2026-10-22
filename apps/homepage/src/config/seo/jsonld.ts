import { SEO_CONSTANTS } from './constants'
import { SEO_KEYWORDS } from './keywords'

export const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${SEO_CONSTANTS.siteUrl}/#software`,
      name: SEO_CONSTANTS.siteName,
      alternateName: [
        'react leaflet canvas',
        'leaflet annotations react',
        'react map vector drawing',
        'leaflet arrow canvas',
        'leaflet shapes react',
      ],
      description:
        'High-performance, framework-agnostic vector canvas toolkit for Leaflet with optional React bindings. Draw vector arrows, geometric shapes, pinned sticky notes, and freehand annotations with zero coordinate drift.',
      applicationCategory: 'DeveloperApplication',
      applicationSubCategory: 'Geospatial Web Mapping & Vector Annotation Toolkit',
      operatingSystem: 'All',
      softwareVersion: SEO_CONSTANTS.currentVersion,
      license: SEO_CONSTANTS.licenseUrl,
      url: SEO_CONSTANTS.siteUrl,
      codeRepository: SEO_CONSTANTS.githubRepoUrl,
      downloadUrl: SEO_CONSTANTS.npmPkgUrl,
      author: {
        '@type': 'Person',
        name: SEO_CONSTANTS.authorName,
        url: SEO_CONSTANTS.authorUrl,
      },
      publisher: {
        '@type': 'Person',
        name: SEO_CONSTANTS.publisher,
        url: SEO_CONSTANTS.authorUrl,
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      keywords: SEO_KEYWORDS.join(', '),
      programmingLanguage: ['TypeScript', 'JavaScript'],
      runtimePlatform: ['Browser', 'Vanilla JS', 'React', 'Next.js', 'Vite'],
      featureList: [
        'Zero-drift geographic Lat/Lng coordinate projection',
        '5 vector arrow styles including curved Bézier and elbow arrows',
        '8 geometric shapes with Shift-key 1:1 proportion locking',
        'Draggable geographically pinned HTML sticky notes',
        'Decoupled state management via createLeafletCanvasController & useLeafletCanvas',
        'Presentation readOnly mode for dashboards and reports',
        'Framework-agnostic core with optional React subpath (leaflet-tual/react)',
        'Decoupled CanvasToolbar for external header/sidebar placement',
      ],
      sameAs: [SEO_CONSTANTS.githubRepoUrl, SEO_CONSTANTS.npmPkgUrl],
    },
    {
      '@type': 'WebSite',
      '@id': `${SEO_CONSTANTS.siteUrl}/#website`,
      name: SEO_CONSTANTS.siteName,
      url: SEO_CONSTANTS.siteUrl,
      description:
        'Official website and documentation for leaflet-tual, the precision vector canvas for Leaflet.',
      inLanguage: 'en-US',
      publisher: {
        '@type': 'Person',
        name: SEO_CONSTANTS.authorName,
        url: SEO_CONSTANTS.authorUrl,
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${SEO_CONSTANTS.siteUrl}/#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SEO_CONSTANTS.siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Documentation',
          item: `${SEO_CONSTANTS.siteUrl}/docs`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Interactive Demo',
          item: `${SEO_CONSTANTS.siteUrl}/demo`,
        },
      ],
    },
  ],
}

export const docsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'leaflet-tual Documentation',
  description:
    'Complete guide to installing, configuring, and using leaflet-tual for geo-synchronized map annotations in React.',
  url: `${SEO_CONSTANTS.siteUrl}/docs`,
  author: {
    '@type': 'Person',
    name: SEO_CONSTANTS.authorName,
  },
  publisher: {
    '@type': 'Person',
    name: SEO_CONSTANTS.authorName,
  },
}

export const changelogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'leaflet-tual Changelog & Release Notes',
  description:
    'Historical semver changelog and releases timeline for leaflet-tual.',
  url: `${SEO_CONSTANTS.siteUrl}/releases`,
}

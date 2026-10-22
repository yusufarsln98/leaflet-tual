export interface NavItem {
  label: string
  to: '/' | '/demo' | '/docs' | '/releases' | '/changelog'
  badge?: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', to: '/' },
  { label: 'Live Demo', to: '/demo', badge: 'Interactive' },
  { label: 'Documentation', to: '/docs' },
  { label: 'Releases', to: '/releases' },
]


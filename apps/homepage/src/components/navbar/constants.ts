export interface NavItem {
  label: string
  to: '/' | '/demo' | '/releases' | '/changelog'
  badge?: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', to: '/' },
  { label: 'Live Demo', to: '/demo', badge: 'Interactive' },
  { label: 'Releases', to: '/releases' },
]


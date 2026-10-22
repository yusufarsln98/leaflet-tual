import { HelpCircle, FileText, Heart, Terminal, BookOpen, Layers } from 'lucide-react'
import Link from 'next/link'
import { VERSION } from 'leaflet-tual'
import { BrandIcon } from './brand-icon'

const PRODUCT_LINKS = [
  { href: '/', label: 'Overview', icon: Layers, tone: 'accent' },
  { href: '/demo', label: 'Interactive Demo', icon: Terminal, tone: 'accent' },
  { href: '/docs', label: 'Documentation', icon: BookOpen, tone: 'accent' },
  { href: '/releases', label: 'Release Notes', icon: FileText, tone: 'muted' },
] as const

export function Footer() {
  const appVersion = VERSION

  return (
    <footer
      aria-label="Site footer"
      className="border-t border-border-secondary bg-bg-app py-14 px-6 sm:px-8 mt-auto transition-colors select-none"
    >
      <div className="max-w-6xl mx-auto">
        {/* Masthead strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-border-primary">
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <BrandIcon name="map" size={24} />
              <span className="font-display text-xl text-text-primary">leaflet-tual</span>
            </Link>
            <p className="text-text-secondary text-xs leading-relaxed max-w-md text-pretty">
              Framework-agnostic interactive canvas overlay for Leaflet with optional React
              bindings. Draw vector arrows, geometric shapes, freehand sketches, and pinned sticky
              notes with zero coordinate drift.
            </p>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] text-text-muted font-mono shrink-0">
            <span className="w-1.5 h-1.5 rotate-45 bg-success" aria-hidden="true" />
            <span>Framework Agnostic · EPSG:3857 Synced</span>
            <span className="px-1.5 border border-border-primary bg-bg-pane rounded-[2px] text-[10px]">
              v{appVersion}
            </span>
          </div>
        </div>

        {/* Index columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 pt-10">
          <nav aria-label="Product" className="space-y-3">
            <h4 className="eyebrow">Product</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              {PRODUCT_LINKS.map(({ href, label, icon: Icon, tone }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        tone === 'accent' ? 'text-accent' : 'text-text-muted'
                      }`}
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="References" className="space-y-3">
            <h4 className="eyebrow">References</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a
                  href="https://github.com/yusufarsln98/leaflet-tual"
                  target="_blank"
                  rel="noreferrer"
                  className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2 group"
                >
                  <BrandIcon
                    name="github"
                    size={14}
                    className="text-text-muted group-hover:text-text-primary"
                  />
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/package/leaflet-tual"
                  target="_blank"
                  rel="noreferrer"
                  className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2 group"
                >
                  <BrandIcon
                    name="npm"
                    size={14}
                    className="text-text-muted group-hover:text-text-primary"
                  />
                  NPM Package
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/yusufarsln98/leaflet-tual/blob/main/LICENSE"
                  target="_blank"
                  rel="noreferrer"
                  className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-text-muted" /> MIT License
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Community" className="space-y-3">
            <h4 className="eyebrow">Community</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a
                  href="https://github.com/yusufarsln98/leaflet-tual/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noreferrer"
                  className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
                >
                  <Heart className="w-3.5 h-3.5 text-accent" /> Contributing
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/yusufarsln98/leaflet-tual/issues"
                  target="_blank"
                  rel="noreferrer"
                  className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-text-muted" /> Issues &amp; Discussions
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Colophon bar */}
      <div className="max-w-6xl mx-auto border-t border-border-primary mt-10 pt-5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-text-muted gap-3">
        <div>
          &copy; {new Date().getFullYear()} leaflet-tual · Open source software under MIT.
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider">
          Open-source interactive canvas for Leaflet
        </div>
      </div>
    </footer>
  )
}

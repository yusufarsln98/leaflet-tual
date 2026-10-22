'use client'

import { GitCommit, ArrowUpRight, ExternalLink } from 'lucide-react'
import { MdxRenderer } from '../../components/mdx-renderer'
import type { RootContent } from '../../lib/parse-mdx'
import type { ReleaseGroup } from './types'

interface ChangelogHeroProps {
  latestRelease?: ReleaseGroup
  defaultVersionTag: string
  introNodes: RootContent[]
  onSelectLatest: () => void
  onScrollToRelease: (slug: string) => void
}

export function ChangelogHero({
  latestRelease,
  introNodes,
  onSelectLatest,
  onScrollToRelease,
}: ChangelogHeroProps) {
  return (
    <section className="relative border-b border-border-primary bg-bg-app overflow-hidden">
      {/* Contour atmosphere (resolved via tokens.css) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-45 pointer-events-none"
        style={{
          backgroundImage: 'var(--bg-contour)',
          backgroundSize: '420px',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 90% at 50% 0%, #000 30%, transparent 78%)',
          maskImage: 'radial-gradient(ellipse 70% 90% at 50% 0%, #000 30%, transparent 78%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Cartouche strip */}
        <p className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-text-secondary border-b border-border-secondary pb-3">
          <GitCommit className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
          <span className="uppercase tracking-[0.14em] text-[10px] text-text-muted">
            Release History
          </span>
          <span className="text-border-secondary">·</span>
          <span>Framework Agnostic</span>
        </p>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-7">
          <div className="space-y-3">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-text-primary">
              Changelog <span className="italic text-accent">&amp; Releases</span>
            </h1>
            <p className="text-text-secondary text-sm sm:text-base max-w-2xl leading-relaxed text-pretty">
              Release notes, version updates, and changelog for leaflet-tual.
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {latestRelease && (
              <button
                onClick={onSelectLatest}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-accent/35 bg-accent/10 hover:bg-accent/15 text-xs font-mono font-semibold text-text-primary rounded-[2px] transition-colors cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rotate-45 bg-success oh-live" aria-hidden="true" />
                <span>v{latestRelease.version}</span>
                <span className="text-[10px] text-text-muted font-sans font-normal uppercase tracking-wider">
                  Latest
                </span>
              </button>
            )}
            <a
              href="https://github.com/yusufarsln98/leaflet-tual/releases"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border-secondary bg-bg-pane hover:bg-bg-pane-inner hover:text-text-primary text-xs text-text-secondary rounded-[2px] transition-colors"
            >
              <span>GitHub Releases</span>
              <ArrowUpRight className="w-3 h-3 text-text-muted" />
            </a>
            <a
              href="https://www.npmjs.com/package/leaflet-tual"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border-secondary bg-bg-pane hover:bg-bg-pane-inner hover:text-text-primary text-xs text-text-secondary rounded-[2px] transition-colors"
            >
              <span>npm Registry</span>
              <ExternalLink className="w-3 h-3 text-text-muted" />
            </a>
          </div>
        </div>

        {/* Optional Intro Markdown Content */}
        {introNodes.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border-primary/60 text-sm text-text-secondary leading-relaxed">
            <MdxRenderer
              sectionId="changelog-intro"
              scrollToSection={onScrollToRelease}
              children={introNodes}
            />
          </div>
        )}
      </div>
    </section>
  )
}

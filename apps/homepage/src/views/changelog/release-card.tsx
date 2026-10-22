'use client'

import { Copy, Check } from 'lucide-react'
import { MdxRenderer } from '../../components/mdx-renderer'
import type { ReleaseGroup } from './types'

interface ReleaseCardProps {
  release: ReleaseGroup
  isFirst: boolean
  copiedSlug: string | null
  onScrollToRelease: (slug: string) => void
  onCopyLink: (slug: string) => void
}

export function ReleaseCard({
  release,
  isFirst,
  copiedSlug,
  onScrollToRelease,
  onCopyLink,
}: ReleaseCardProps) {
  const isMajor = release.type === 'major'
  const isMinor = release.type === 'minor'

  return (
    <article
      id={release.slug}
      className="flex gap-3 sm:gap-6 items-stretch group scroll-mt-28"
    >
      {/* Timeline Node Point Column — diamond node on hairline rail */}
      <div className="relative flex flex-col items-center shrink-0 w-6 sm:w-8">
        <div
          className={`relative z-10 w-3 h-3 rotate-45 mt-7 shrink-0 transition-transform group-hover:scale-125 ${
            isMajor
              ? 'bg-accent border border-accent shadow-[0_0_8px_rgba(182,240,60,0.35)]'
              : isMinor
                ? 'bg-cyan border border-cyan'
                : 'bg-bg-pane border border-border-secondary'
          }`}
        />
      </div>

      {/* Folio Release Card */}
      <div className="flex-1 min-w-0 border border-border-secondary bg-bg-pane rounded-[3px] p-6 sm:p-7 shadow-xs hover:border-text-muted/60 transition-colors">
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-primary pb-4 mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={`#${release.slug}`}
              onClick={(e) => {
                e.preventDefault()
                onScrollToRelease(release.slug)
              }}
              className="font-mono text-xl sm:text-2xl font-bold text-text-primary hover:text-accent transition-colors flex items-center gap-1.5"
            >
              <span>v{release.version}</span>
            </a>

            {/* Badges */}
            <div className="flex items-center gap-1.5">
              {isFirst && (
                <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono font-semibold bg-accent/10 text-accent border border-accent/25">
                  <span className="w-1.5 h-1.5 rotate-45 bg-success" aria-hidden="true" />
                  <span>LATEST</span>
                </span>
              )}
              {isMajor ? (
                <span className="px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono font-semibold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider">
                  Major Release
                </span>
              ) : isMinor ? (
                <span className="px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono font-semibold bg-cyan/15 text-cyan border border-cyan/30 uppercase tracking-wider">
                  Minor Release
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono text-text-muted border border-border-primary bg-bg-pane-inner uppercase tracking-wider">
                  Patch
                </span>
              )}
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onCopyLink(release.slug)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[11px] font-mono text-text-secondary hover:text-text-primary bg-bg-pane-inner hover:bg-bg-sidebar border border-border-secondary transition-colors cursor-pointer"
              title="Copy direct permalink"
              aria-label={`Copy permalink for v${release.version}`}
            >
              {copiedSlug === release.slug ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500 font-sans font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-text-muted" />
                  <span className="font-sans">Copy link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Markdown Body of Release */}
        <div className="prose prose-zinc max-w-none text-sm text-text-secondary leading-relaxed space-y-4">
          <MdxRenderer
            sectionId={release.slug}
            scrollToSection={onScrollToRelease}
            children={release.nodes}
          />
        </div>
      </div>
    </article>
  )
}


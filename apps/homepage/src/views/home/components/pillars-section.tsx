'use client'

import { PILLARS } from '../../../data/pillars'
import { Compass, Navigation, Sparkles, Layers, Zap, Shield } from 'lucide-react'

const ICON_MAP = {
  Compass,
  Navigation,
  Sparkles,
  Layers,
  Zap,
  Shield,
}

export function PillarsSection() {
  return (
    <section id="features" aria-labelledby="features-title" className="oh-section px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Split editorial header */}
        <div className="oh-head">
          <div className="max-w-xl">
            <span className="oh-num block mb-2.5">§ 01 · Core Capabilities</span>
            <h2 id="features-title" className="oh-serif text-3xl sm:text-4xl text-[var(--oh-ink)]">
              Everything You Need to Turn a Map into an Interactive Canvas
            </h2>
          </div>
          <span className="oh-num">6 core features</span>
        </div>

        {/* Numbered index of core features */}
        <ol aria-label="Core capabilities">
          {PILLARS.map((pillar, index) => {
            const Icon = ICON_MAP[pillar.iconName] || Compass
            return (
              <li key={pillar.id} className="oh-index-row">
                <span className="oh-index-num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="oh-stamp" aria-hidden="true">
                  <Icon className="w-4 h-4" />
                </span>
                <div className="pl-4 sm:pl-8 lg:pl-0">
                  <h3 className="oh-index-title">{pillar.title}</h3>
                  <p className="text-[13px] text-[var(--oh-ink-2)] leading-relaxed mt-1.5 max-w-[54ch] text-pretty">
                    {pillar.description}
                  </p>
                  {/* Compact meta for narrow widths */}
                  <div className="oh-index-meta mt-2 lg:hidden">
                    <span>{pillar.tag}</span>
                    <span className="text-[var(--oh-lime)]">{pillar.stat}</span>
                  </div>
                </div>
                {/* Right column meta for wide widths */}
                <dl className="hidden lg:flex flex-col justify-start items-end gap-1 pt-1 text-right">
                  <dt className="sr-only">Category</dt>
                  <dd className="oh-tick-label">{pillar.tag}</dd>
                  <dt className="sr-only">Badge</dt>
                  <dd className="oh-tick-label">{pillar.badge}</dd>
                  <dt className="sr-only">Statistic</dt>
                  <dd className="font-mono text-[11px] font-semibold text-[var(--oh-lime)] mt-1">
                    {pillar.stat}
                  </dd>
                </dl>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

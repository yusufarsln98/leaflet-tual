'use client'

import Link from 'next/link'
import { ArrowRight, Bot } from 'lucide-react'
import { InstallSnippet } from './install-snippet'
import { HeroMetrics } from './hero-metrics'
import { LegendPlate } from './legend-plate'
import { HeroScribble } from './hero-scribble'

export interface HeroSectionProps {
  appVersion: string
}

export function HeroSection({ appVersion }: HeroSectionProps) {
  return (
    <section className="oh-hero relative pt-10 md:pt-14 pb-20 md:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* ── Product cartouche (version · descriptors · release link) ── */}
        <div className="flex justify-center">
          <p className="oh-cartouche border-b border-[var(--oh-line)] pb-3 pr-4 pl-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="oh-diamond oh-live" aria-hidden="true" />
              <span>v{appVersion}</span>
            </span>
            <span className="oh-cartouche-sep">·</span>
            <span>Interactive Canvas Overlay for Leaflet</span>
            <span className="oh-cartouche-sep">·</span>
            <span>Framework Agnostic</span>
            <span className="oh-cartouche-sep">·</span>
            <span>Zero-Drift Lat/Lng Sync</span>
            <span className="oh-cartouche-sep">·</span>
            <Link
              href="/releases"
              className="underline decoration-[var(--oh-line-2)] underline-offset-4 hover:decoration-[var(--oh-lime)] hover:text-[var(--oh-ink)] transition-colors"
            >
              Release Notes
              <ArrowRight className="inline w-3 h-3 align-[-1px] ml-0.5" />
            </Link>
          </p>
        </div>

        {/* ── Title block ── */}
        <div className="text-center mt-10 md:mt-14 space-y-5">
          <h1 className="oh-serif text-[clamp(2.7rem,6.2vw,4.7rem)] leading-[1.04] text-[var(--oh-ink)]">
            Turn any Leaflet map into an
            <br />
            <span className="relative italic inline-block">
              interactive canvas.
              <HeroScribble className="hidden sm:block" />
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--oh-ink-2)] max-w-2xl mx-auto leading-relaxed text-pretty">
            Draw vector arrows, geometric shapes, freehand sketches, and pinned notes directly on
            your map with{' '}
            <strong className="text-[var(--oh-ink)] font-semibold">zero coordinate drift</strong>{' '}
            across continuous zoom and pan gestures.
          </p>
        </div>

        {/* ── Actions & install ── */}
        <div className="flex flex-col items-center gap-4 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/demo" className="oh-btn oh-btn-solid group">
              <span className="oh-diamond" aria-hidden="true" />
              Launch Interactive Demo
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="/SKILL.md" target="_blank" rel="noreferrer" className="oh-btn oh-btn-ghost">
              <Bot className="w-4 h-4" />
              SKILL.md Spec
            </a>
          </div>
          <InstallSnippet />
        </div>

        {/* ── Interactive layer legend & canvas preview ── */}
        <div className="mt-14 md:mt-20 relative">
          <div className="mb-3 flex items-baseline justify-between px-1">
            <span className="oh-num">Fig. 1 — Interactive vector annotations over a map</span>
            <span className="oh-num hidden sm:inline">Framework Agnostic</span>
          </div>

          <LegendPlate />
        </div>

        {/* ── Scale-bar metrics ── */}
        <HeroMetrics />
      </div>
    </section>
  )
}

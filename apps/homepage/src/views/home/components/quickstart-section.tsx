'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CODE_SAMPLES } from '../../../data/code-samples'
import { DocCodeBlock } from '../../../components/mdx-renderer/doc-code-block'
import { PlateMarks } from './plate-marks'

export function QuickstartSection() {
  const [activeSampleId, setActiveSampleId] = useState(CODE_SAMPLES[0].id)
  const activeSample = CODE_SAMPLES.find((s) => s.id === activeSampleId) || CODE_SAMPLES[0]
  const activeIndex = CODE_SAMPLES.findIndex((s) => s.id === activeSampleId)

  return (
    <section id="quickstart" aria-labelledby="quickstart-title" className="oh-section px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Editorial header */}
        <div className="oh-head">
          <div className="max-w-xl">
            <span className="oh-num block mb-2.5">§ 02 · Quickstart</span>
            <h2 id="quickstart-title" className="oh-serif text-3xl sm:text-4xl text-[var(--oh-ink)]">
              Up and Running in 3 Minutes
            </h2>
          </div>
          <span className="oh-num">4 examples · TypeScript ready</span>
        </div>

        <p className="text-sm text-[var(--oh-ink-2)] max-w-xl leading-relaxed text-pretty -mt-4 mb-10">
          Mount the canvas directly on any Leaflet map via{' '}
          <code className="font-mono text-[13px] px-1.5 py-0.5 border border-[var(--oh-line-2)] bg-[var(--oh-plate)] rounded-sm text-[var(--oh-ink)]">
            createLeafletTual(map)
          </code>{' '}
          or drop{' '}
          <code className="font-mono text-[13px] px-1.5 py-0.5 border border-[var(--oh-line-2)] bg-[var(--oh-plate)] rounded-sm text-[var(--oh-ink)]">
            &lt;LeafletTual /&gt;
          </code>{' '}
          into React-Leaflet. Works out-of-the-box with Vanilla TypeScript, Vue, Svelte, or React —
          fully typed with zero CSS bundle overhead.
        </p>

        {/* Examples: list → code preview */}
        <div className="grid grid-cols-1 lg:grid-cols-[19.5rem_1fr] gap-9 items-start">
          {/* Example selector */}
          <nav aria-label="Code examples" className="lg:sticky lg:top-20">
            <p className="oh-tick-label pb-2.5 pl-1">Examples</p>
            <ol className="oh-plate border-[var(--oh-line-2)]">
              {CODE_SAMPLES.map((sample, index) => {
                const isActive = sample.id === activeSampleId
                return (
                  <li key={sample.id}>
                    <button
                      type="button"
                      onClick={() => setActiveSampleId(sample.id)}
                      aria-current={isActive}
                      className="oh-plate-item"
                    >
                      <span className="oh-plate-num" aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="oh-plate-name">{sample.title}</span>
                    </button>
                  </li>
                )
              })}
            </ol>

            {/* Current sample description */}
            <div className="mt-5 pl-5 border-l-2 border-[var(--oh-line-2)]">
              <p className="oh-tick-label mb-1.5">Example {String(activeIndex + 1).padStart(2, '0')}</p>
              <p className="text-[13px] text-[var(--oh-ink-2)] leading-relaxed text-pretty">
                <span className="font-mono text-[var(--oh-ink)]">{activeSample.filename}</span> —{' '}
                {activeSample.description}
              </p>
              <Link
                href="/docs"
                className="link-grow inline-flex mt-3 text-[13px] font-semibold text-[var(--oh-ink)] underline decoration-[var(--oh-line-2)] underline-offset-4 hover:decoration-[var(--oh-lime)]"
              >
                Full API reference
              </Link>
            </div>
          </nav>

          {/* Code block */}
          <div className="oh-marks min-w-0">
            <PlateMarks />
            <div className="oh-well p-3 sm:p-4">
              <DocCodeBlock
                code={activeSample.code}
                language="tsx"
                className="my-0 rounded-[2px] border-border-secondary"
              />
            </div>
            <p className="mt-3 text-right oh-tick-label">
              Example {String(activeIndex + 1).padStart(2, '0')} &nbsp;·&nbsp;{' '}
              {activeSample.filename}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

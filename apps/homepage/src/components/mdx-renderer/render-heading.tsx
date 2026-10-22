import React from 'react'
import type { Heading, RootContent } from './types'
import { nodeText } from './ast-utils'
import { renderInline } from './render-inline'

export function renderHeading(
  heading: Heading,
  key: string,
  scrollToSection: (id: string) => void,
  sectionId: string,
): React.ReactNode {
  const text = nodeText(heading as unknown as RootContent)
  const isZeugmaSection = sectionId === 'zeugma-mosaics'

  const slug = text
    .toLowerCase()
    .replace(/[<>`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  const headingId = slug || sectionId

  if (heading.depth === 1) {
    return (
      <h1
        key={key}
        id={headingId}
        className="group flex items-center gap-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-3"
      >
        <span>{renderInline(heading.children as RootContent[], `${key}-`)}</span>
        <a
          href={`#${headingId}`}
          onClick={(e) => {
            e.preventDefault()
            scrollToSection(headingId)
          }}
          className="text-text-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none"
        >
          #
        </a>
      </h1>
    )
  }
  if (heading.depth === 2) {
    return (
      <h2
        key={key}
        id={headingId}
        className={`group flex items-center gap-2 text-2xl font-bold text-text-primary pb-2.5 transition-colors ${
          isZeugmaSection
            ? 'border-b border-accent font-display italic text-accent text-3xl'
            : 'border-b border-border-primary'
        }`}
      >
        <span>{renderInline(heading.children as RootContent[], `${key}-`)}</span>
        <a
          href={`#${headingId}`}
          onClick={(e) => {
            e.preventDefault()
            scrollToSection(headingId)
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none text-text-muted hover:text-accent"
        >
          #
        </a>
      </h2>
    )
  }
  if (heading.depth === 3) {
    return (
      <h3
        key={key}
        id={headingId}
        className="text-lg font-bold text-text-primary mt-6 mb-2 tracking-tight"
      >
        {renderInline(heading.children as RootContent[], `${key}-`)}
      </h3>
    )
  }
  if (heading.depth === 4) {
    const textContent = text.trim()
    if (textContent.includes('(') || textContent.includes(':')) {
      return (
        <h4 key={key} id={headingId} className="font-mono text-sm text-accent font-bold">
          {text}
        </h4>
      )
    }
    return (
      <h4 key={key} id={headingId} className="eyebrow pt-3 text-text-secondary">
        {renderInline(heading.children as RootContent[], `${key}-`)}
      </h4>
    )
  }
  return (
    <h5 key={key} id={headingId} className="text-sm font-semibold text-text-primary">
      {renderInline(heading.children as RootContent[], `${key}-`)}
    </h5>
  )
}


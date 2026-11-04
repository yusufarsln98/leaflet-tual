import React from 'react'
import type { Blockquote, RootContent } from './types'
import { parseCallout } from './ast-utils'
import { Callout } from './callout'

export function renderBlockquote(
  bq: Blockquote,
  key: string,
  scrollToSection: (id: string) => void,
  sectionId: string,
  renderBlockFn: (
    node: RootContent,
    index: number,
    scrollToSection: (id: string) => void,
    sectionId: string,
  ) => React.ReactNode,
): React.ReactNode {
  const callout = parseCallout(bq)
  if (callout) {
    return (
      <Callout key={key} type={callout.type} title={callout.title}>
        {callout.bodyNodes.map((child, ci) => renderBlockFn(child, ci, scrollToSection, sectionId))}
      </Callout>
    )
  }

  return (
    <blockquote
      key={key}
      className="border-l-2 border-accent pl-4 my-4 text-text-secondary italic text-sm leading-relaxed"
    >
      {bq.children.map((child, ci) =>
        renderBlockFn(child as RootContent, ci, scrollToSection, sectionId),
      )}
    </blockquote>
  )
}

import React from 'react'
import type { Blockquote, Paragraph, RootContent } from './types'
import { parseCallout } from './ast-utils'
import { renderInline } from './render-inline'
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
        {callout.bodyNodes.map((child, ci) =>
          renderBlockFn(child, ci, scrollToSection, sectionId),
        )}
      </Callout>
    )
  }
  if (sectionId === 'zeugma-mosaics') {
    return (
      <div
        key={key}
        className="bg-accent/8 border border-accent/25 rounded-2xl p-6 my-6 select-none font-display italic text-accent text-base leading-relaxed"
      >
        {bq.children.map((child, ci) => {
          if (child.type === 'paragraph') {
            return (
              <React.Fragment key={`${key}-bq-${ci}`}>
                {renderInline(
                  (child as Paragraph).children as RootContent[],
                  `${key}-bq-${ci}-`,
                )}
              </React.Fragment>
            )
          }
          return renderBlockFn(child as unknown as RootContent, ci, scrollToSection, sectionId)
        })}
      </div>
    )
  }
  return (
    <blockquote
      key={key}
      className="border-l-2 border-accent pl-4 my-4 text-text-secondary italic text-sm leading-relaxed"
    >
      {bq.children.map((child, ci) =>
        renderBlockFn(child as unknown as RootContent, ci, scrollToSection, sectionId),
      )}
    </blockquote>
  )
}


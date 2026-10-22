import React from 'react'
import type {
  RootContent,
  Heading,
  Code,
  Paragraph,
  List,
  Table,
  Blockquote,
} from './types'
import { renderInline } from './render-inline'
import { DocCodeBlock } from './doc-code-block'
import { renderHeading } from './render-heading'
import { renderTable } from './render-table'
import { renderBlockquote } from './render-blockquote'
import { renderList } from './render-list'

export function renderBlock(
  node: RootContent,
  index: number,
  scrollToSection: (id: string) => void,
  sectionId: string,
): React.ReactNode {
  const key = `${sectionId}-${index}`

  switch (node.type) {
    case 'heading':
      return renderHeading(node as Heading, key, scrollToSection, sectionId)

    case 'paragraph': {
      const para = node as Paragraph
      return (
        <p key={key} className="text-text-secondary text-sm leading-relaxed">
          {renderInline(para.children as RootContent[], `${key}-`)}
        </p>
      )
    }

    case 'code': {
      const code = node as Code
      return <DocCodeBlock key={key} code={code.value} language={code.lang ?? 'tsx'} />
    }

    case 'list':
      return renderList(node as List, key, scrollToSection, sectionId, renderBlock)

    case 'table':
      return renderTable(node as Table, key)

    case 'blockquote':
      return renderBlockquote(node as Blockquote, key, scrollToSection, sectionId, renderBlock)

    case 'thematicBreak':
      return <hr key={key} className="border-border-primary/80 my-8" />

    case 'html':
      return null

    default:
      return null
  }
}

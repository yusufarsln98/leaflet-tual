import React from 'react'
import type { List, ListItem, Paragraph, RootContent } from './types'
import { renderInline } from './render-inline'

export function renderList(
  list: List,
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
  const Tag = list.ordered ? 'ol' : 'ul'
  return (
    <Tag
      key={key}
      className={`${list.ordered ? 'list-decimal' : 'list-disc'} list-outside pl-5 text-text-secondary space-y-2 text-sm leading-relaxed marker:text-text-muted`}
    >
      {list.children.map((item: ListItem, li: number) => (
        <li key={`${key}-li-${li}`} className="pl-1">
          {item.children.map((child, ci) => {
            if (child.type === 'paragraph') {
              return (
                <React.Fragment key={`${key}-li-${li}-${ci}`}>
                  {renderInline(
                    (child as Paragraph).children as RootContent[],
                    `${key}-li-${li}-${ci}-`,
                  )}
                </React.Fragment>
              )
            }
            return renderBlockFn(child as unknown as RootContent, ci, scrollToSection, sectionId)
          })}
        </li>
      ))}
    </Tag>
  )
}


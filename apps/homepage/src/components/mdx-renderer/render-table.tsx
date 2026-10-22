import React from 'react'
import type { Table, TableRow, TableCell, RootContent } from './types'
import { nodeText } from './ast-utils'
import { renderInline } from './render-inline'

export function renderTable(table: Table, key: string): React.ReactNode {
  const [headerRow, ...bodyRows] = table.children
  return (
    <div
      key={key}
      className="w-full max-w-full overflow-x-auto border border-border-primary rounded-xl overflow-hidden my-4 shadow-2xs"
    >
      <table className="min-w-full text-left text-xs border-collapse">
        {headerRow && (
          <thead>
            <tr className="border-b border-border-primary bg-bg-sidebar/80 eyebrow">
              {(headerRow as TableRow).children.map((cell: TableCell, ci: number) => (
                <th key={`${key}-th-${ci}`} className="px-4 py-2.5 font-semibold">
                  {renderInline(cell.children as RootContent[], `${key}-th-${ci}-`)}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-border-primary/60 text-text-primary bg-bg-pane/40">
          {bodyRows.map((row: TableRow, ri: number) => (
            <tr key={`${key}-tr-${ri}`} className="hover:bg-bg-sidebar/30 transition-colors">
              {row.children.map((cell: TableCell, ci: number) => {
                const cellText = nodeText(cell as unknown as RootContent)
                const isFirstCol = ci === 0
                const isRequired = cellText.trim() === 'Yes'
                const isOptional = cellText.trim() === 'No'
                let className = 'px-4 py-3'
                if (isFirstCol) className += ' font-mono text-accent'
                else if (ci === 1) className += ' font-mono'
                if (isRequired) className += ' font-semibold text-emerald-500'
                else if (isOptional) className += ' text-text-secondary'
                return (
                  <td key={`${key}-td-${ri}-${ci}`} className={className}>
                    {renderInline(cell.children as RootContent[], `${key}-td-${ri}-${ci}-`)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


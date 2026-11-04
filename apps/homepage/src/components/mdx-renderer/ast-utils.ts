import type { RootContent, Text, Paragraph, Blockquote, ParsedCallout } from './types'

/** Extract plain text from an AST node */
export function nodeText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  if ('value' in node && typeof (node as { value: unknown }).value === 'string') {
    return (node as { value: string }).value
  }
  if ('children' in node && Array.isArray((node as { children: unknown }).children)) {
    return (node as { children: unknown[] }).children.map(nodeText).join('')
  }
  return ''
}

/** Check if a blockquote is a GitHub-style callout (> [!TIP], > [!NOTE], > [!WARNING]) */
export function parseCallout(node: Blockquote): ParsedCallout | null {
  const firstChild = node.children[0]
  if (!firstChild || firstChild.type !== 'paragraph') return null
  const text = nodeText(firstChild)
  const match = text.match(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*\n?(.*)/)
  if (!match) return null

  const rawType = match[1].toLowerCase()
  const calloutType =
    rawType === 'important' || rawType === 'caution'
      ? 'warning'
      : (rawType as 'note' | 'tip' | 'warning')

  const firstPara = firstChild as Paragraph
  let titleText = match[2].replace(/^[\s—–-]+/, '').trim()

  const boldChild = firstPara.children.find((c) => c.type === 'strong')
  if (boldChild) {
    titleText = nodeText(boldChild)
  }

  const bodyNodes: RootContent[] = []
  const firstParaChildren = [...firstPara.children]

  const markerIdx = firstParaChildren.findIndex(
    (c) =>
      c.type === 'text' && (c as Text).value.match(/\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/),
  )
  if (markerIdx !== -1) {
    const markerNode = firstParaChildren[markerIdx] as Text
    const afterMarker = markerNode.value
      .replace(/\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*\n?/, '')
      .replace(/^[\s—–-]+/, '')
    if (afterMarker.trim()) {
      firstParaChildren[markerIdx] = { ...markerNode, value: afterMarker }
    } else {
      firstParaChildren.splice(markerIdx, 1)
    }
  }

  const boldIdx = firstParaChildren.findIndex((c) => c.type === 'strong')
  if (boldIdx !== -1) {
    firstParaChildren.splice(boldIdx, 1)
    if (firstParaChildren[boldIdx] && firstParaChildren[boldIdx].type === 'text') {
      const t = firstParaChildren[boldIdx] as Text
      const trimmed = t.value.replace(/^[\s—–-]+/, '')
      if (trimmed) {
        firstParaChildren[boldIdx] = { ...t, value: trimmed }
      } else {
        firstParaChildren.splice(boldIdx, 1)
      }
    }
  }

  if (firstParaChildren.length > 0) {
    bodyNodes.push({ type: 'paragraph', children: firstParaChildren } as Paragraph)
  }

  for (let i = 1; i < node.children.length; i++) {
    bodyNodes.push(node.children[i])
  }

  return {
    type: calloutType,
    title: titleText || calloutType.charAt(0).toUpperCase() + calloutType.slice(1),
    bodyNodes,
  }
}

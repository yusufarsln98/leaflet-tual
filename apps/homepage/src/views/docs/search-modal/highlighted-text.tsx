import React from 'react'

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <span>{text}</span>
  const parts = text.split(new RegExp(`(${escapeRegExp(highlight)})`, 'gi'))
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark
            key={i}
            className="bg-accent/25 text-accent rounded-xs px-1 py-0.5 font-bold underline decoration-accent/60 underline-offset-2"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  )
}


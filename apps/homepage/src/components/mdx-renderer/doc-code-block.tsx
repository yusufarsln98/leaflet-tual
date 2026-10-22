'use client'

import { useState, useMemo } from 'react'
import { Copy, Check } from 'lucide-react'
import Prism from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-markdown'

export function DocCodeBlock({
  code,
  language = 'tsx',
  filename,
  className,
}: {
  code: string
  language?: string
  filename?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const html = useMemo(() => {
    const cleanLang = language.toLowerCase()
    const grammar = Prism.languages[cleanLang] || Prism.languages.tsx || Prism.languages.javascript
    return Prism.highlight(code, grammar, cleanLang)
  }, [code, language])

  return (
    <div
      className={`w-full max-w-full relative group rounded-[3px] border border-border-secondary bg-bg-pane overflow-hidden font-mono text-xs shadow-2xs transition-colors ${
        className ?? 'my-6'
      }`}
    >
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-border-primary bg-bg-pane-inner/80 text-text-muted text-xs select-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rotate-45 bg-accent/70 shrink-0" aria-hidden="true" />
          {filename ? (
            <>
              <span className="text-text-primary font-mono text-xs font-medium">{filename}</span>
              <span className="text-border-secondary">·</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                {language}
              </span>
            </>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {language}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] border border-border-secondary hover:border-text-muted bg-bg-pane text-text-secondary hover:text-text-primary transition-colors cursor-pointer text-xs font-mono"
          aria-label={copied ? 'Copied code to clipboard' : 'Copy code to clipboard'}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-text-primary select-all whitespace-pre leading-relaxed font-mono text-xs">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}

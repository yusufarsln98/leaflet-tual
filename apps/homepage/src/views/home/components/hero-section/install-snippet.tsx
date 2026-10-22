'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { INSTALL_COMMANDS, type PackageManager } from './constants'

export function InstallSnippet() {
  const [copied, setCopied] = useState(false)
  const [activePkg, setActivePkg] = useState<PackageManager>('pnpm')

  const command = INSTALL_COMMANDS[activePkg]

  const handleCopy = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="oh-cmd">
      <div className="flex shrink-0">
        {(['pnpm', 'npm', 'bun'] as const).map((pkg) => (
          <label key={pkg} className="oh-cmd-tab" title={pkg}>
            <input
              type="radio"
              name="pkg-manager"
              className="sr-only"
              checked={activePkg === pkg}
              onChange={() => setActivePkg(pkg)}
            />
            {pkg}
          </label>
        ))}
      </div>
      <code className="oh-cmd-cmd">
        <span aria-hidden="true" className="text-[var(--oh-ink-3)] select-none">
          $
        </span>
        <span>{command}</span>
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="oh-cmd-copy"
        title="Copy install command"
        aria-label={copied ? 'Copied to clipboard' : 'Copy install command'}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

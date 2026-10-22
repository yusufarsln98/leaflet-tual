import React from 'react'
import { Download, FileText } from 'lucide-react'
import { docsData, type DocSection } from '../../../config/docs-data'
import { DocCodeBlock } from '../../../components/mdx-renderer'

interface EnrichSectionsOptions {
  skillContent: string
  onDownloadSkill: () => void
}

export function buildEnrichedSections({
  skillContent,
  onDownloadSkill,
}: EnrichSectionsOptions): DocSection[] {
  return docsData.map((section) => {
    if (section.id === 'skill-md') {
      return {
        ...section,
        content: (
          <div className="space-y-6">
            {section.content}
            <div className="space-y-4 pt-4 border-t border-border-primary/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-primary pb-2.5">
                <span className="text-xs text-text-secondary font-medium">
                  Raw SKILL.md Configuration
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href="/llms.txt"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-sidebar border border-border-primary text-xs text-text-secondary hover:text-text-primary hover:border-accent/40 font-medium transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-accent" />
                    <span>View llms.txt</span>
                  </a>
                  <button
                    onClick={onDownloadSkill}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30 text-xs text-accent hover:bg-accent/20 font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SKILL.md</span>
                  </button>
                </div>
              </div>
              <DocCodeBlock code={skillContent} language="markdown" />
            </div>
          </div>
        ),
      }
    }
    return section
  })
}


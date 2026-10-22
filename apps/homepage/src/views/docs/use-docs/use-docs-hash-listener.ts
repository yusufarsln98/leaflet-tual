'use client'

import { useEffect, type RefObject } from 'react'
import type { DocSection } from '../../../config/docs-data'

interface UseDocsHashListenerOptions {
  allSectionsRef: RefObject<DocSection[]>
  scrollToSectionRef: RefObject<(id: string) => void>
  goToChapterRef: RefObject<(chapterId: string, subsectionId?: string) => void>
  setActiveChapterId: (id: string) => void
  setHighlightedId: (id: string | null) => void
}

export function useDocsHashListener({
  allSectionsRef,
  scrollToSectionRef,
  goToChapterRef,
  setActiveChapterId,
  setHighlightedId,
}: UseDocsHashListenerOptions) {
  useEffect(() => {
    let clearTimer: NodeJS.Timeout
    let setTimer: NodeJS.Timeout

    const handleHighlight = (id: string) => {
      clearTimeout(clearTimer)
      clearTimeout(setTimer)
      setHighlightedId(null)
      setTimer = setTimeout(() => {
        setHighlightedId(id)
        clearTimer = setTimeout(() => {
          setHighlightedId(null)
        }, 3500)
      }, 50)
    }

    // Run on initial mount only
    const parseInitialHash = () => {
      let raw = window.location.hash.replace('#', '')
      if (!raw) return
      if (raw === 'arrows-shapes') raw = 'drawing-engine'

      const sections = allSectionsRef.current ?? []
      const direct = sections.find((s) => s.id === raw)
      if (direct) {
        setActiveChapterId(direct.id)
        handleHighlight(direct.id)
        window.scrollTo({ top: 0, behavior: 'instant' })
        return
      }

      const parent = sections.find((s) => s.subsections?.some((sub) => sub.id === raw))
      if (parent) {
        setActiveChapterId(parent.id)
        handleHighlight(raw)
        setTimeout(() => {
          scrollToSectionRef.current?.(raw)
        }, 120)
      }
    }

    parseInitialHash()

    // Handle browser Back / Forward history navigation
    const handleHashChange = () => {
      let raw = window.location.hash.replace('#', '')
      if (!raw) return
      if (raw === 'arrows-shapes') raw = 'drawing-engine'

      const sections = allSectionsRef.current ?? []
      const direct = sections.find((s) => s.id === raw)
      if (direct) {
        goToChapterRef.current?.(direct.id)
        return
      }

      const parent = sections.find((s) => s.subsections?.some((sub) => sub.id === raw))
      if (parent) {
        goToChapterRef.current?.(parent.id, raw)
      }
    }

    const handleScrollToEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        scrollToSectionRef.current?.(customEvent.detail)
        handleHighlight(customEvent.detail)
      }
    }

    window.addEventListener('scroll-to-section', handleScrollToEvent)
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('scroll-to-section', handleScrollToEvent)
      window.removeEventListener('hashchange', handleHashChange)
      clearTimeout(clearTimer)
      clearTimeout(setTimer)
    }
  }, [allSectionsRef, scrollToSectionRef, goToChapterRef, setActiveChapterId, setHighlightedId])
}


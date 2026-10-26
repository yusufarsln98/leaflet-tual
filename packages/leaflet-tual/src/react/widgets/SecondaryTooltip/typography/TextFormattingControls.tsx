'use client'

import type { Style } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { ICONS } from '../../Toolbar/icons/index.js'
import {
  isItemBold,
  isItemItalic,
  isItemUnderline,
  isTextBulleted,
  toggleBulletList,
} from './text-formatting-utils.js'

export interface TextFormattingControlsProps {
  style: Style
  currentText: string
  onUpdateStyle: (patch: Partial<Style>) => void
  onUpdateText: (newText: string, newStyle: Partial<Style>) => void
}

export function TextFormattingControls({
  style,
  currentText,
  onUpdateStyle,
  onUpdateText,
}: TextFormattingControlsProps) {
  const { t } = useTranslation()
  const isBold = isItemBold(style)
  const isItalic = isItemItalic(style)
  const isUnderline = isItemUnderline(style)
  const isBulleted = isTextBulleted(currentText, style)

  const toggleBold = () => {
    onUpdateStyle({ weight: isBold ? 'regular' : 'bold' })
  }

  const toggleItalic = () => {
    onUpdateStyle({ fontStyle: isItalic ? 'normal' : 'italic' })
  }

  const toggleUnderline = () => {
    onUpdateStyle({
      underline: !isUnderline,
      textDecoration: !isUnderline ? 'underline' : 'none',
    })
  }

  const toggleBullets = () => {
    const nextText = toggleBulletList(currentText, isBulleted)
    onUpdateText(nextText, {
      list: !isBulleted ? 'bullet' : 'none',
      bullets: !isBulleted,
    })
  }

  const toggleAlign = () => {
    const nextAlign =
      style.align === 'center'
        ? 'right'
        : style.align === 'right'
          ? 'left'
          : 'center'
    onUpdateStyle({ align: nextAlign })
  }

  return (
    <>
      <button
        type="button"
        className="tual-secondary-icon-btn"
        title={t('bold')}
        aria-label={t('bold')}
        data-active={isBold}
        onClick={toggleBold}
      >
        {ICONS.bold()}
      </button>
      <button
        type="button"
        className="tual-secondary-icon-btn"
        title={t('italic')}
        aria-label={t('italic')}
        data-active={isItalic}
        onClick={toggleItalic}
      >
        {ICONS.italic()}
      </button>
      <button
        type="button"
        className="tual-secondary-icon-btn"
        title={t('underline')}
        aria-label={t('underline')}
        data-active={isUnderline}
        onClick={toggleUnderline}
      >
        {ICONS.underline()}
      </button>
      <div className="tual-secondary-separator" />
      <button
        type="button"
        className="tual-secondary-icon-btn"
        title={t('bulletedList')}
        aria-label={t('bulletedList')}
        data-active={isBulleted}
        onClick={toggleBullets}
      >
        {ICONS.bullets()}
      </button>
      <button
        type="button"
        className="tual-secondary-icon-btn"
        title={t('textAlignment')}
        aria-label={t('textAlignment')}
        onClick={toggleAlign}
      >
        {style.align === 'center'
          ? ICONS.alignCenter()
          : style.align === 'right'
            ? ICONS.alignRight()
            : ICONS.alignLeft()}
      </button>
    </>
  )
}

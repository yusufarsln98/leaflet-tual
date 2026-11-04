'use client'

import type { Style } from '../../../../core/index.js'
import {
  getNextAlign,
  isItemBold,
  isItemItalic,
  isItemUnderline,
  isTextBulleted,
  toggleBoldStyle,
  toggleBulletList,
  toggleItalicStyle,
  toggleUnderlineStyle,
} from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { Divider, IconButton, ICONS } from '../../../ui/index.js'

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
    onUpdateStyle(toggleBoldStyle(style))
  }

  const toggleItalic = () => {
    onUpdateStyle(toggleItalicStyle(style))
  }

  const toggleUnderline = () => {
    onUpdateStyle(toggleUnderlineStyle(style))
  }

  const toggleBullets = () => {
    const nextText = toggleBulletList(currentText, isBulleted)
    onUpdateText(nextText, {
      list: !isBulleted ? 'bullet' : 'none',
      bullets: !isBulleted,
    })
  }

  const toggleAlign = () => {
    onUpdateStyle({ align: getNextAlign(style.align) })
  }

  return (
    <>
      <IconButton
        variant="secondary-icon"
        label={t('bold')}
        active={isBold}
        icon={
          <span style={{ fontWeight: 700, fontSize: 14, fontFamily: 'inherit', lineHeight: 1 }}>
            B
          </span>
        }
        onClick={toggleBold}
      />
      <IconButton
        variant="secondary-icon"
        label={t('italic')}
        active={isItalic}
        icon={
          <span
            style={{
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: 14,
              fontFamily: 'Georgia, serif',
              lineHeight: 1,
            }}
          >
            I
          </span>
        }
        onClick={toggleItalic}
      />
      <IconButton
        variant="secondary-icon"
        label={t('underline')}
        active={isUnderline}
        icon={ICONS.underline()}
        onClick={toggleUnderline}
      />
      <Divider variant="secondary" />
      <IconButton
        variant="secondary-icon"
        label={t('bulletedList')}
        active={isBulleted}
        icon={ICONS.bullets()}
        onClick={toggleBullets}
      />
      <IconButton
        variant="secondary-icon"
        label={t('textAlignment')}
        icon={
          style.align === 'center'
            ? ICONS.alignCenter()
            : style.align === 'right'
              ? ICONS.alignRight()
              : ICONS.alignLeft()
        }
        onClick={toggleAlign}
      />
    </>
  )
}

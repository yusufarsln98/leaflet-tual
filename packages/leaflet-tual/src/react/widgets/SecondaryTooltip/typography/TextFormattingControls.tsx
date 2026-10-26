'use client'

import type { Style } from '../../../../core/index.js'
import {
  isItemBold,
  isItemItalic,
  isItemUnderline,
  isTextBulleted,
  toggleBulletList,
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
      <IconButton
        variant="secondary-icon"
        label={t('bold')}
        active={isBold}
        icon={ICONS.bold()}
        onClick={toggleBold}
      />
      <IconButton
        variant="secondary-icon"
        label={t('italic')}
        active={isItalic}
        icon={ICONS.italic()}
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

import type { ReactNode } from 'react'
import type { Tone } from '../domain/labels'
import './Badge.css'

const icons: Record<Tone, string> = {
  ok: '✓',
  warn: '!',
  danger: '!',
  info: 'i',
  neutral: '–',
}

// Állapotjelölő: szín + ikon + szöveg együtt (színtévesztők számára is olvasható).
function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`badge badge--${tone}`}>
      <span className="badge__icon" aria-hidden="true">
        {icons[tone]}
      </span>
      {children}
    </span>
  )
}

export default Badge

import type { Allapotsor } from '../domain/statusLine'
import './StatusLine.css'

const icons = {
  ok: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  warn: (
    <>
      <path d="M12 7v6" />
      <path d="M12 16.5v.5" />
    </>
  ),
  danger: (
    <>
      <path d="M12 7v6" />
      <path d="M12 16.5v.5" />
    </>
  ),
  info: (
    <>
      <path d="M12 7.5v.5" />
      <path d="M12 11v6" />
    </>
  ),
  neutral: <path d="M7 12h10" />,
}

// Ügyfél nézet: egyetlen, azonnal értelmezhető állapot az oldal tetején.
function StatusLine({ allapot }: { allapot: Allapotsor }) {
  return (
    <section className={`status-line status-line--${allapot.tone}`} aria-live="polite">
      <span className="status-line__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">{icons[allapot.tone]}</svg>
      </span>
      <div>
        <p className="status-line__title">{allapot.cim}</p>
        {allapot.reszlet && <p className="status-line__detail">{allapot.reszlet}</p>}
      </div>
    </section>
  )
}

export default StatusLine

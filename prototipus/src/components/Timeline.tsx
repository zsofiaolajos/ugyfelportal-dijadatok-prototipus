import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Idovonal, IdovonalFajta, IdovonalTetel } from '../domain/timeline'
import type { Role } from '../domain/types'
import Badge from './Badge'
import './Timeline.css'

const ikonok: Record<IdovonalFajta, ReactNode> = {
  dij: (
    <>
      <rect x="4" y="5.5" width="16" height="14" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  befizetes: <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />,
  kifizetes: <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 19.5h14" />,
  atkonyveles: <path d="M5 8.5h13M14.5 5 18 8.5 14.5 12M19 15.5H6M9.5 12 6 15.5 9.5 19" />,
  sikertelen: <path d="M7 7l10 10M17 7 7 17" />,
  dijvaltozas: <path d="M4.5 16.5 10 11l3.5 3.5L19.5 8.5M15 8.5h4.5V13" />,
  emlekezteto: <path d="M7 16.5V11a5 5 0 0 1 10 0v5.5l1.5 1.5h-13zM10.5 20.5h3" />,
  megszunes: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M6.7 17.3 17.3 6.7" />
    </>
  ),
}

const napFormatter = new Intl.DateTimeFormat('hu-HU', { month: 'long', day: 'numeric' })
const teljesFormatter = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })

function datum(iso: string, evvel: boolean) {
  return (evvel ? teljesFormatter : napFormatter).format(new Date(`${iso}T00:00:00`))
}

interface TetelProps {
  t: IdovonalTetel
  evvel: boolean
  nyitva: boolean
  valt: () => void
  role: Role
}

function Tetel({ t, evvel, nyitva, valt, role }: TetelProps) {
  const reszletId = `tl-reszlet-${t.key}`
  const { magyarazat, adatok, link } = t.reszletek
  const kibonthato = magyarazat.length > 0 || adatok.length > 0

  const fej = (
    <>
      <span className="tl-item__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">{ikonok[t.fajta]}</svg>
      </span>
      <span className="tl-item__body">
        <span className="tl-item__title">{t.cim}</span>
        {t.alcim && <span className="tl-item__sub">{t.alcim}</span>}
        <span className="tl-item__meta">
          <time dateTime={t.datum}>{datum(t.datum, evvel)}</time>
          {t.statusz && <Badge tone={t.statusz.tone}>{t.statusz.label}</Badge>}
        </span>
      </span>
      <span className="tl-item__end">
        {t.osszeg && <span className={`tl-item__amount tl-item__amount--${t.irany}`}>{t.osszeg}</span>}
        {kibonthato && (
          <svg className="tl-item__chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9.5 12 15.5 18 9.5" />
          </svg>
        )}
      </span>
    </>
  )

  return (
    <li className={`tl-item tl-item--${t.fajta}${nyitva ? ' is-open' : ''}`}>
      {kibonthato ? (
        <button type="button" className="tl-item__head" aria-expanded={nyitva} aria-controls={reszletId} onClick={valt}>
          {fej}
        </button>
      ) : (
        <div className="tl-item__head">{fej}</div>
      )}

      {kibonthato && nyitva && (
        <div id={reszletId} className="tl-item__details">
          {magyarazat.map((m) => (
            <p key={m}>{m}</p>
          ))}
          {adatok.length > 0 && (
            <dl>
              {adatok.map((a) => (
                <div key={a.cimke}>
                  <dt>{a.cimke}</dt>
                  <dd>{a.ertek}</dd>
                </div>
              ))}
            </dl>
          )}
          {link && (
            <Link className="tl-item__link" to={`/szerzodes/${link.szerzodesszam}/dijadatok?szerep=${role}`}>
              {link.szoveg} →
            </Link>
          )}
        </div>
      )}
    </li>
  )
}

// Ügyfél nézet: egyetlen idővonal, felül a közelgő díjak, alatta havonta visszafelé.
// Bármely tételre kattintva köznyelvi magyarázat nyílik le.
function Timeline({ idovonal, role }: { idovonal: Idovonal; role: Role }) {
  const [nyitott, setNyitott] = useState<Set<string>>(new Set())
  const valt = (key: string) =>
    setNyitott((s) => {
      const uj = new Set(s)
      if (uj.has(key)) uj.delete(key)
      else uj.add(key)
      return uj
    })

  const lista = (tetelek: IdovonalTetel[], evvel: boolean) => (
    <ol className="tl-list">
      {tetelek.map((t) => (
        <Tetel key={t.key} t={t} evvel={evvel} nyitva={nyitott.has(t.key)} valt={() => valt(t.key)} role={role} />
      ))}
    </ol>
  )

  return (
    <section className="card timeline" aria-labelledby="tl-cim">
      <h2 id="tl-cim">Díjak és befizetések</h2>
      <p className="timeline__hint">A részletekért kattintson a tételre.</p>

      {idovonal.kozelgo.length > 0 && (
        <div className="tl-group tl-group--upcoming">
          <h3 className="tl-group__title">Közelgő</h3>
          {lista(idovonal.kozelgo, true)}
        </div>
      )}

      {idovonal.honapok.map((h) => (
        <div key={h.kulcs} className="tl-group">
          <h3 className="tl-group__title">{h.cim}</h3>
          {lista(h.tetelek, false)}
        </div>
      ))}
    </section>
  )
}

export default Timeline

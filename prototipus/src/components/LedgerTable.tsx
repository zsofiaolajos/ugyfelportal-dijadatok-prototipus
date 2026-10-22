import { useMemo, useState } from 'react'
import { elvarasCsv, tranzakcioCsv } from '../domain/csv'
import {
  aktivSzuro,
  alapTranzakcioSzuro,
  szurElvarasok,
  szurTranzakciok,
  type ElvarasSzuro,
  type KategoriaSzuro,
  type RendezesMezo,
  type StatuszSzuro,
  type TranzakcioSzuro,
} from '../domain/ledgerFilter'
import type { Fokonyv } from '../domain/ledgerTable'
import Badge from './Badge'
import './LedgerTable.css'

function Reszletek({ sorok }: { sorok: string[] }) {
  if (sorok.length === 0) return null
  return <span className="ledger__details">{sorok.join(' · ')}</span>
}

/** CSV letöltése a böngészőben (Blob + ideiglenes link). */
function letolt(fajlnev: string, tartalom: string) {
  const url = URL.createObjectURL(new Blob([tartalom], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = fajlnev
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const kategoriak: { v: KategoriaSzuro; l: string }[] = [
  { v: 'MIND', l: 'Minden típus' },
  { v: 'Befizetés', l: 'Befizetés' },
  { v: 'Kifizetés', l: 'Kifizetés' },
  { v: 'Átkönyvelés', l: 'Átkönyvelés' },
  { v: 'Technikai', l: 'Technikai' },
]

const statuszok: { v: StatuszSzuro; l: string }[] = [
  { v: 'MIND', l: 'Minden státusz' },
  { v: 'TELJESULT', l: 'Teljesült' },
  { v: 'FUGGO', l: 'Függő (elszámolás, engedélyezés, utalás)' },
  { v: 'SIKERTELEN', l: 'Sikertelen' },
  { v: 'STORNOZVA', l: 'Stornózva' },
]

const elvarasSzurok: { v: ElvarasSzuro; l: string }[] = [
  { v: 'MIND', l: 'Mind' },
  { v: 'NYITOTT', l: 'Nyitott' },
  { v: 'RENDEZETT', l: 'Rendezett' },
  { v: 'JOVOBENI', l: 'Jövőbeni' },
  { v: 'TOROLT', l: 'Törölt' },
]

function RendezoFejlec({
  mezo,
  cimke,
  szuro,
  valt,
  className,
}: {
  mezo: RendezesMezo
  cimke: string
  szuro: TranzakcioSzuro
  valt: (m: RendezesMezo) => void
  className?: string
}) {
  const aktiv = szuro.rendezes.mezo === mezo
  const irany = szuro.rendezes.irany
  return (
    <th className={className} aria-sort={aktiv ? (irany === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        className={`ledger__sort${aktiv ? ' is-active' : ''}`}
        title={mezo === 'osszeg' ? 'Rendezés előjeles összeg szerint (jóváírás és terhelés együtt)' : `Rendezés: ${cimke.toLowerCase()}`}
        onClick={() => valt(mezo)}
      >
        {cimke}
        <span aria-hidden="true">{aktiv ? (irany === 'asc' ? ' ▲' : ' ▼') : ' ↕'}</span>
      </button>
    </th>
  )
}

// Ügyintézői nézet: a megszokott kétblokkos főkönyvi nézet – könyvelt tranzakciók és díjelvárások.
function LedgerTable({ adat, szerzodesszam }: { adat: Fokonyv; szerzodesszam: string }) {
  const [szuro, setSzuro] = useState<TranzakcioSzuro>(alapTranzakcioSzuro)
  const [elvSzuro, setElvSzuro] = useState<ElvarasSzuro>('MIND')

  const tranzakciok = useMemo(() => szurTranzakciok(adat.tranzakciok, szuro), [adat.tranzakciok, szuro])
  const elvarasok = useMemo(() => szurElvarasok(adat.elvarasok, elvSzuro), [adat.elvarasok, elvSzuro])

  const allit = (r: Partial<TranzakcioSzuro>) => setSzuro((s) => ({ ...s, ...r }))
  const rendez = (mezo: RendezesMezo) =>
    setSzuro((s) => ({
      ...s,
      rendezes: { mezo, irany: s.rendezes.mezo === mezo && s.rendezes.irany === 'desc' ? 'asc' : 'desc' },
    }))
  const szurt = aktivSzuro(szuro)

  return (
    <section className="ledger" aria-label="Főkönyvi tételek">
      <div className="card ledger__block">
        <div className="ledger__head">
          <h2>Könyvelt tranzakciók</h2>
          <p className="ledger__hint">Az egyenleg a tétel könyvelése utáni állapot (könyvelt tételek − addig esedékes díjak)</p>
        </div>

        <div className="ledger__toolbar" role="search">
          <label className="ledger__field ledger__field--search">
            <span className="visually-hidden">Keresés a tételek között</span>
            <input
              id="tr-kereses"
              type="search"
              placeholder="Keresés: azonosító, összeg, közlemény, kárszám…"
              value={szuro.kereses}
              onChange={(e) => allit({ kereses: e.target.value })}
            />
          </label>
          <label className="ledger__field">
            <span className="visually-hidden">Tételtípus</span>
            <select id="tr-kategoria" value={szuro.kategoria} onChange={(e) => allit({ kategoria: e.target.value as KategoriaSzuro })}>
              {kategoriak.map((k) => (
                <option key={k.v} value={k.v}>
                  {k.l}
                </option>
              ))}
            </select>
          </label>
          <label className="ledger__field">
            <span className="visually-hidden">Státusz</span>
            <select id="tr-statusz" value={szuro.statusz} onChange={(e) => allit({ statusz: e.target.value as StatuszSzuro })}>
              {statuszok.map((k) => (
                <option key={k.v} value={k.v}>
                  {k.l}
                </option>
              ))}
            </select>
          </label>
          <div className="ledger__field ledger__field--dates">
            <span className="ledger__label">Könyvelés</span>
            <input id="tr-tol" type="date" aria-label="Könyvelés dátuma ettől" value={szuro.tol} onChange={(e) => allit({ tol: e.target.value })} />
            <span aria-hidden="true">–</span>
            <input id="tr-ig" type="date" aria-label="Könyvelés dátuma eddig" value={szuro.ig} onChange={(e) => allit({ ig: e.target.value })} />
          </div>
          <div className="ledger__actions">
            <span className="ledger__count" aria-live="polite">
              {tranzakciok.length} / {adat.tranzakciok.length} tétel
            </span>
            {szurt && (
              <button type="button" className="ledger__btn ledger__btn--ghost" onClick={() => setSzuro({ ...alapTranzakcioSzuro, rendezes: szuro.rendezes })}>
                Szűrők törlése
              </button>
            )}
            <button
              type="button"
              className="ledger__btn"
              disabled={tranzakciok.length === 0}
              onClick={() => letolt(`folyoszamla_${szerzodesszam}_tranzakciok.csv`, tranzakcioCsv(tranzakciok))}
            >
              CSV letöltése
            </button>
          </div>
        </div>

        <div className="ledger__scroll">
          <table className="ledger__table">
            <thead>
              <tr>
                <RendezoFejlec mezo="konyveles" cimke="Könyvelés" szuro={szuro} valt={rendez} />
                <RendezoFejlec mezo="teljesites" cimke="Teljesítés" szuro={szuro} valt={rendez} />
                <th>Tétel</th>
                <RendezoFejlec mezo="osszeg" cimke="Jóváírás" szuro={szuro} valt={rendez} className="num" />
                <th className="num">Terhelés</th>
                <th className="num">Egyenleg</th>
                <th>Státusz</th>
                <th>Azonosító</th>
              </tr>
            </thead>
            <tbody>
              {tranzakciok.length === 0 && (
                <tr>
                  <td colSpan={8} className="ledger__empty">
                    Nincs a szűrésnek megfelelő tétel.
                  </td>
                </tr>
              )}
              {tranzakciok.map((s) => (
                <tr key={s.key} className={s.halvany ? 'is-muted' : undefined}>
                  <td className="date">{s.konyveles}</td>
                  <td className="date">{s.teljesites}</td>
                  <td className="item">
                    <span className="ledger__name">
                      {s.nev} <code>{s.kod}</code>
                    </span>
                    <Reszletek sorok={s.reszletek} />
                  </td>
                  <td className="num credit">{s.jovairas ?? ''}</td>
                  <td className="num">{s.terheles ?? ''}</td>
                  <td className={`num balance${s.egyenleg !== undefined && s.egyenleg < 0 ? ' is-negative' : ''}`}>{s.egyenlegSzoveg}</td>
                  <td>
                    <Badge tone={s.statusz.tone}>{s.statusz.label}</Badge>
                  </td>
                  <td>
                    <code>{s.key}</code>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5}>
                  <strong>Egyenleg ma ({adat.zaro.datum})</strong>
                  <span className="ledger__details">
                    {adat.zaro.magyarazat}
                    {szurt ? ' · a teljes folyószámlára, a szűréstől függetlenül' : ''}
                  </span>
                </td>
                <td className={`num balance${adat.zaro.egyenleg < 0 ? ' is-negative' : ''}`}>{adat.zaro.egyenlegSzoveg}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="card ledger__block">
        <div className="ledger__head">
          <h2>Díjelvárások (jövőbeni díjadatok)</h2>
          <p className="ledger__hint">Határidő szerint, legkésőbbi elöl · a törölt elvárások áthúzva, a helyettesítő hivatkozással</p>
        </div>

        <div className="ledger__toolbar">
          <div className="ledger__chips" role="group" aria-label="Díjelvárások szűrése">
            {elvarasSzurok.map((f) => {
              const db = szurElvarasok(adat.elvarasok, f.v).length
              return (
                <button
                  key={f.v}
                  type="button"
                  aria-pressed={elvSzuro === f.v}
                  disabled={db === 0 && f.v !== 'MIND'}
                  onClick={() => setElvSzuro(f.v)}
                >
                  {f.l} <span className="ledger__chip-count">{db}</span>
                </button>
              )
            })}
          </div>
          <div className="ledger__actions">
            <button
              type="button"
              className="ledger__btn"
              disabled={elvarasok.length === 0}
              onClick={() => letolt(`folyoszamla_${szerzodesszam}_dijelvarasok.csv`, elvarasCsv(elvarasok))}
            >
              CSV letöltése
            </button>
          </div>
        </div>

        <div className="ledger__scroll">
          <table className="ledger__table">
            <thead>
              <tr>
                <th>Időszak</th>
                <th>Díjelvárás</th>
                <th className="num">Elvárás</th>
                <th className="num">Befizetés</th>
                <th className="num">Nyitott</th>
                <th className="num">Kerekítés</th>
                <th>Határidő</th>
                <th>Státusz</th>
                <th>Azonosító</th>
              </tr>
            </thead>
            <tbody>
              {elvarasok.map((e) => (
                <tr key={e.key} className={e.torolt ? 'is-deleted' : undefined}>
                  <td className="date">
                    {e.idoszakKezdete} –<br />
                    {e.idoszakVege}
                  </td>
                  <td className="item">
                    <span className="ledger__name">
                      {e.nev} <code>{e.kod}</code>
                    </span>
                    <Reszletek sorok={e.reszletek} />
                  </td>
                  <td className="num amount">{e.elvaras}</td>
                  <td className="num">{e.befizetes}</td>
                  <td className={`num${e.nyitottKiemelt ? ' is-open' : ''}`}>{e.nyitott}</td>
                  <td className="num">{e.kerekites ?? ''}</td>
                  <td className="date">{e.hatarido}</td>
                  <td>
                    <Badge tone={e.statusz.tone}>{e.statusz.label}</Badge>
                  </td>
                  <td>
                    <code>{e.key}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default LedgerTable

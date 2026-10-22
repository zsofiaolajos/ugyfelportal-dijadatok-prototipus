import type { Fokonyv } from '../domain/ledgerTable'
import Badge from './Badge'
import './LedgerTable.css'

function Reszletek({ sorok }: { sorok: string[] }) {
  if (sorok.length === 0) return null
  return <span className="ledger__details">{sorok.join(' · ')}</span>
}

// Ügyintézői nézet: a megszokott kétblokkos főkönyvi nézet – könyvelt tranzakciók és díjelvárások.
function LedgerTable({ adat }: { adat: Fokonyv }) {
  return (
    <section className="ledger" aria-label="Főkönyvi tételek">
      <div className="card ledger__block">
        <div className="ledger__head">
          <h2>Könyvelt tranzakciók</h2>
          <p className="ledger__hint">Legújabb elöl · az egyenleg a tétel könyvelése utáni állapot (könyvelt tételek − addig esedékes díjak)</p>
        </div>
        <div className="ledger__scroll">
          <table className="ledger__table">
            <thead>
              <tr>
                <th>Könyvelés</th>
                <th>Teljesítés</th>
                <th>Tétel</th>
                <th className="num">Jóváírás</th>
                <th className="num">Terhelés</th>
                <th className="num">Egyenleg</th>
                <th>Státusz</th>
                <th>Azonosító</th>
              </tr>
            </thead>
            <tbody>
              {adat.tranzakciok.map((s) => (
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
                  <span className="ledger__details">{adat.zaro.magyarazat}</span>
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
              {adat.elvarasok.map((e) => (
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

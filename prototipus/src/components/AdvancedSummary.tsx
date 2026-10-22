import type { UgyintezoOsszesito } from '../domain/advancedSummary'
import Badge from './Badge'
import './AdvancedSummary.css'

// Ügyintézői nézet: a hívás elején egy pillantással látszik a szerződés díjhelyzete.
function AdvancedSummary({ adat }: { adat: UgyintezoOsszesito }) {
  return (
    <section className="adv-summary" aria-labelledby="adv-summary-cim">
      <h2 id="adv-summary-cim" className="adv-summary__title">
        Összesítő
      </h2>

      <div className="adv-summary__tiles">
        {adat.csempek.map((c) => (
          <div key={c.kulcs} className={`adv-tile adv-tile--${c.tone}`}>
            <p className="adv-tile__label">{c.cimke}</p>
            <p className="adv-tile__value">{c.ertek}</p>
            {c.sorok.map((s) => (
              <p key={s} className="adv-tile__line">
                {s}
              </p>
            ))}
          </div>
        ))}
      </div>

      <div className="adv-pending">
        <h3 className="adv-pending__title">Függő kifizetések</h3>
        {adat.fuggo.length === 0 ? (
          <p className="adv-pending__empty">Nincs folyamatban lévő kifizetés.</p>
        ) : (
          <ul className="adv-pending__list">
            {adat.fuggo.map((f) => (
              <li key={f.key} className="adv-pending__row">
                <div className="adv-pending__main">
                  <span className="adv-pending__type">{f.tipus}</span>
                  <Badge tone={f.statusz.tone}>{f.statusz.label}</Badge>
                </div>
                <dl className="adv-pending__facts">
                  <div>
                    <dt>Összeg</dt>
                    <dd className="adv-pending__amount">{f.osszeg}</dd>
                  </div>
                  {f.varhato && (
                    <div>
                      <dt>Várható teljesítés</dt>
                      <dd>{f.varhato}</dd>
                    </div>
                  )}
                  {f.irany && (
                    <div>
                      <dt>Kifizetés iránya</dt>
                      <dd>{f.irany}</dd>
                    </div>
                  )}
                  {f.engedelyezes && (
                    <div>
                      <dt>Engedélyezés</dt>
                      <dd>{f.engedelyezes}</dd>
                    </div>
                  )}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default AdvancedSummary

import type { ParositasNezet } from '../domain/pairing'
import Badge from './Badge'
import './PairingView.css'

// Ügyintézői nézet: melyik jóváírás melyik díjat rendezte, és hová került a túlfizetés.
function PairingView({ adat }: { adat: ParositasNezet }) {
  return (
    <section className="card pairing" aria-labelledby="pairing-cim">
      <div className="pairing__head">
        <h2 id="pairing-cim">Párosítás</h2>
        <p className="pairing__hint">
          Melyik jóváírás melyik díjelvárást rendezte
          {adat.toroltDb > 0 ? ` · ${adat.toroltDb} törölt díjelvárás nem szerepel` : ''}
        </p>
      </div>

      <ol className="pairing__list">
        {adat.elvarasok.map((e) => (
          <li key={e.key} className={`pairing__row${e.nyitottVan ? ' is-open' : ''}`}>
            <div className="pairing__due">
              <p className="pairing__name">
                {e.nev} <code>{e.key}</code>
              </p>
              <p className="pairing__meta">
                {e.idoszak} · határidő: {e.hatarido}
              </p>
              <Badge tone={e.statusz.tone}>{e.statusz.label}</Badge>
            </div>

            <div className="pairing__progress">
              <div
                className="pairing__bar"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={e.szazalek}
                aria-label={`${e.nev}: ${e.szazalek}% rendezve`}
              >
                <span style={{ width: `${e.szazalek}%` }} />
              </div>
              <p className="pairing__amounts">
                <strong>{e.befizetes}</strong> / {e.elvaras}
                {e.nyitottVan && <span className="pairing__open"> · nyitott: {e.nyitott}</span>}
              </p>
              {e.megjegyzes && <p className="pairing__note">{e.megjegyzes}</p>}
            </div>

            <ul className="pairing__items" aria-label="Párosított tételek">
              {e.tetelek.length === 0 && <li className="pairing__none">nincs párosított jóváírás</li>}
              {e.tetelek.map((t) => (
                <li key={t.trId}>
                  <code>{t.trId}</code>
                  <span className="pairing__item-name">{t.nev}</span>
                  <span className="pairing__item-date">{t.datum}</span>
                  <strong className="pairing__item-amount">{t.osszeg}</strong>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {adat.tulfizetes && (
        <div className="pairing__over">
          <h3>Túlfizetés elszámolása</h3>
          <p className="pairing__hint">Díjra nem párosított jóváírások – és hová kerültek</p>
          <div className="pairing__flow">
            <div>
              <p className="pairing__flow-title">Forrás (párosítatlan rész)</p>
              <ul>
                {adat.tulfizetes.forrasok.map((f) => (
                  <li key={f.trId}>
                    <code>{f.trId}</code> {f.nev} · {f.datum}
                    <span className="pairing__flow-sub">díjra párosítva: {f.parositott}</span>
                    {f.statusz && <Badge tone={f.statusz.tone}>{f.statusz.label}</Badge>}
                    <strong>+{f.osszeg}</strong>
                  </li>
                ))}
              </ul>
              <p className="pairing__flow-sum">Összesen: +{adat.tulfizetes.forrasOsszeg}</p>
            </div>
            <span className="pairing__flow-arrow" aria-hidden="true">
              →
            </span>
            <div>
              <p className="pairing__flow-title">Felhasználás</p>
              <ul>
                {adat.tulfizetes.felhasznalas.map((f) => (
                  <li key={f.trId}>
                    <code>{f.trId}</code> {f.nev} · {f.datum}
                    {f.statusz && <Badge tone={f.statusz.tone}>{f.statusz.label}</Badge>}
                    <strong>{f.osszeg}</strong>
                  </li>
                ))}
              </ul>
              <p className="pairing__flow-sum">Összesen: {adat.tulfizetes.felhasznalasOsszeg}</p>
            </div>
          </div>
          <p className={`pairing__rest${adat.tulfizetes.maradek !== 0 ? ' is-open' : ''}`}>
            Fel nem használt túlfizetés: <strong>{adat.tulfizetes.maradekSzoveg}</strong>
            {adat.tulfizetes.maradek === 0 ? ' – a teljes összeg el van számolva (függő tételekkel együtt)' : ''}
          </p>
        </div>
      )}
    </section>
  )
}

export default PairingView

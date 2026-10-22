import { useState } from 'react'
import { formatDate, formatFt } from '../domain/format'
import { contractStateLabel, frequencyUnit } from '../domain/labels'
import type { Contract, Role } from '../domain/types'
import Badge from './Badge'
import './ContractHeader.css'

function ProductIcon({ termek }: { termek: Contract['termek'] }) {
  if (termek === 'LAKAS') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10v9.5h13V10" />
        <path d="M10 19.5v-5h4v5" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 16.5V12l2-5h12l2 5v4.5" />
      <path d="M3 16.5h18" />
      <path d="M4 12h16" />
      <circle cx="7.5" cy="16.5" r="1.8" />
      <circle cx="16.5" cy="16.5" r="1.8" />
    </svg>
  )
}

function ContractHeader({ contract, role }: { contract: Contract; role: Role }) {
  const state = contractStateLabel(contract.allapot, role)
  const targyLabel = contract.termek === 'LAKAS' ? 'Kockázatviselés helye' : 'Gépjármű'

  const [bovebb, setBovebb] = useState(false)

  // fo: mobilon alapból csak ezek látszanak, a többi a „További adatok” mögött
  const fields: { label: string; value: string; fo?: boolean }[] = [
    { label: 'Szerződő', value: contract.szerzodo },
    { label: targyLabel, value: contract.biztositottTargy, fo: true },
    { label: 'Kockázatviselés kezdete', value: formatDate(contract.kockazatviselesKezdete) },
    { label: 'Évforduló', value: contract.evfordulo },
    { label: 'Díjfizetés gyakorisága', value: contract.dijfizetesiGyakorisag },
    { label: 'Díjfizetés módja', value: contract.dijfizetesiMod, fo: true },
    {
      label: 'Aktuális díj',
      value: `${formatFt(contract.aktualisDij)} / ${frequencyUnit[contract.dijfizetesiGyakorisag]}`,
      fo: true,
    },
    { label: 'Éves díj', value: formatFt(contract.evesDij) },
  ]
  if (contract.lehivasiBankszamla) {
    fields.push({ label: 'Lehívási bankszámla', value: contract.lehivasiBankszamla })
  }
  if (contract.megszunesDatuma) {
    fields.push({
      label: 'Megszűnés',
      value: `${formatDate(contract.megszunesDatuma)} – ${contract.megszunesOka ?? ''}`,
      fo: true,
    })
  }

  return (
    <section className="card contract-header" aria-label="Szerződés alapadatai">
      <div className="contract-header__top">
        <span className="contract-header__icon">
          <ProductIcon termek={contract.termek} />
        </span>
        <div className="contract-header__title">
          <h2>{contract.termekNev}</h2>
          <p className="contract-header__number">Szerződésszám: {contract.szerzodesszam}</p>
        </div>
        {/* Ügyfél nézetben az állapotot az állapotsor mutatja – itt nem ismételjük (C1 döntés). */}
        {role === 'advanced' && <Badge tone={state.tone}>{state.label}</Badge>}
      </div>

      <dl id="szerzodes-adatok" className={`contract-header__fields${bovebb ? ' is-expanded' : ''}`}>
        {fields.map((f) => (
          <div key={f.label} className={`contract-header__field${f.fo ? '' : ' contract-header__field--extra'}`}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>

      {/* csak mobilon jelenik meg (CSS) */}
      <button
        type="button"
        className="contract-header__more"
        aria-expanded={bovebb}
        aria-controls="szerzodes-adatok"
        onClick={() => setBovebb((b) => !b)}
      >
        {bovebb ? 'Kevesebb adat' : 'További szerződésadatok'}
      </button>
    </section>
  )
}

export default ContractHeader
